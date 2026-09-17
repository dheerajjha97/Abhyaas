/**
 * Firebase Cloud Messaging (FCM) Service
 * 
 * Initializes FCM using project configuration, requests notification permissions,
 * retrieves/caches device registration tokens, syncs tokens with Firestore user profiles,
 * and handles incoming push notifications for study reminders and content updates.
 */

import {
  getMessaging,
  getToken,
  onMessage,
  isSupported as isFcmSupported,
  Messaging,
  MessagePayload,
  Unsubscribe,
} from 'firebase/messaging';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '../lib/firebaseConfig';

export type NotificationType =
  | 'study_reminder'
  | 'paper_update'
  | 'notes_update'
  | 'revision_alert'
  | 'exam_alert'
  | 'announcement';

export interface StudyNotificationPayload {
  id: string;
  title: string;
  body: string;
  url: string;
  classId?: string;
  subject?: string;
  type: NotificationType;
  timestamp: number;
  icon?: string;
}

export interface FcmInitResult {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  messaging: Messaging | null;
}

class FcmService {
  private static instance: FcmService;
  private app: FirebaseApp;
  private db: Firestore;
  private messaging: Messaging | null = null;
  private token: string | null = null;
  private isCheckingSupport: boolean = false;
  private supported: boolean | null = null;
  private messageListeners: Set<(notification: StudyNotificationPayload) => void> = new Set();
  private unsubscribeForeground: Unsubscribe | null = null;

  private constructor() {
    this.app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    this.db = getFirestore(
      this.app,
      firebaseConfig.firestoreDatabaseId || 'ai-studio-abhyaas-a8a9c3bd-a79a-48c8-a199-9b32f0de1029'
    );
  }

  public static getInstance(): FcmService {
    if (!FcmService.instance) {
      FcmService.instance = new FcmService();
    }
    return FcmService.instance;
  }

  /**
   * Check whether FCM and Service Workers are supported in current browser/environment
   */
  public async isSupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      this.supported = false;
      return false;
    }

    if (this.supported !== null) {
      return this.supported;
    }

    if (this.isCheckingSupport) {
      return isFcmSupported().catch(() => false);
    }

    this.isCheckingSupport = true;
    try {
      this.supported = await isFcmSupported();
    } catch (err) {
      console.warn('[FcmService] Error checking FCM support:', err);
      this.supported = false;
    } finally {
      this.isCheckingSupport = false;
    }

    return Boolean(this.supported);
  }

  /**
   * Returns current browser Notification permission
   */
  public getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Lazy-initializes Firebase Messaging instance
   */
  public async getMessagingInstance(): Promise<Messaging | null> {
    if (this.messaging) {
      return this.messaging;
    }

    const supported = await this.isSupported();
    if (!supported) {
      return null;
    }

    try {
      this.messaging = getMessaging(this.app);
      this.setupForegroundListener();
      return this.messaging;
    } catch (error) {
      console.warn('[FcmService] Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }

  /**
   * Registers the background service worker
   */
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      return registration;
    } catch (error) {
      console.warn('[FcmService] Failed to register service worker:', error);
      return null;
    }
  }

  /**
   * Initialize FCM and request permission from the user.
   * If granted, generates device token and optionally syncs with Firestore user profile.
   */
  public async initialize(params?: {
    userId?: string;
    classId?: string;
    vapidKey?: string;
  }): Promise<FcmInitResult> {
    const supported = await this.isSupported();
    if (!supported) {
      return {
        isSupported: false,
        permission: 'denied',
        token: null,
        messaging: null,
      };
    }

    const currentPermission = this.getPermission();
    let finalPermission: NotificationPermission = currentPermission;

    if (currentPermission !== 'granted') {
      try {
        finalPermission = await Notification.requestPermission();
      } catch (err) {
        console.error('[FcmService] Notification permission request error:', err);
        return {
          isSupported: true,
          permission: 'denied',
          token: null,
          messaging: null,
        };
      }
    }

    if (finalPermission !== 'granted') {
      return {
        isSupported: true,
        permission: finalPermission,
        token: null,
        messaging: null,
      };
    }

    const messaging = await this.getMessagingInstance();
    if (!messaging) {
      return {
        isSupported: true,
        permission: finalPermission,
        token: null,
        messaging: null,
      };
    }

    let swRegistration: ServiceWorkerRegistration | undefined;
    try {
      const reg = await this.registerServiceWorker();
      if (reg) swRegistration = reg;
    } catch (e) {
      console.warn('[FcmService] Service worker registration ignored:', e);
    }

    // Retrieve FCM device token
    try {
      const token = await getToken(messaging, {
        serviceWorkerRegistration: swRegistration,
        vapidKey: params?.vapidKey,
      });

      if (token) {
        this.token = token;
        localStorage.setItem('abhyaas_fcm_token', token);
        if (params?.classId) {
          localStorage.setItem('abhyaas_fcm_class', params.classId);
        }

        // Sync token to Firestore database
        if (params?.userId) {
          await this.syncTokenToFirestore(params.userId, token, params.classId || '10');
        }

        return {
          isSupported: true,
          permission: 'granted',
          token,
          messaging,
        };
      }
    } catch (tokenErr) {
      console.warn('[FcmService] getToken error (e.g. VAPID key requirement or offline):', tokenErr);
    }

    return {
      isSupported: true,
      permission: 'granted',
      token: this.token,
      messaging,
    };
  }

  /**
   * Saves the device FCM token to the user document in Firestore for targeted pushes
   */
  public async syncTokenToFirestore(userId: string, token: string, classId: string): Promise<void> {
    try {
      const userDocRef = doc(this.db, 'users', userId);
      await setDoc(
        userDocRef,
        {
          fcmToken: token,
          notificationEnabled: true,
          notificationClass: classId,
          lastTokenSync: Date.now(),
          platform: 'web',
        },
        { merge: true }
      );
      console.log(`[FcmService] Token successfully synced to Firestore for user: ${userId}`);
    } catch (err) {
      console.warn('[FcmService] Error saving FCM token to Firestore:', err);
    }
  }

  /**
   * Sets up real-time onMessage listener for foreground messages when app is in focus
   */
  private setupForegroundListener(): void {
    if (!this.messaging || this.unsubscribeForeground) return;

    try {
      this.unsubscribeForeground = onMessage(this.messaging, (payload: MessagePayload) => {
        console.log('[FcmService] Foreground message received:', payload);

        const studyNotification: StudyNotificationPayload = {
          id: payload.messageId || `msg_${Date.now()}`,
          title:
            payload.notification?.title ||
            payload.data?.title ||
            'अभ्यास (Abhyaas) स्टडी अपडेट 📢',
          body:
            payload.notification?.body ||
            payload.data?.body ||
            'नया अभ्यास प्रश्न-पत्र व रिवीज़न नोट्स उपलब्ध हैं। अभी देखें!',
          url: payload.data?.url || payload.fcmOptions?.link || '/',
          classId: payload.data?.classId,
          subject: payload.data?.subject,
          type: (payload.data?.type as NotificationType) || 'study_reminder',
          timestamp: Date.now(),
          icon: payload.notification?.icon || payload.data?.icon || '/pwa-192x192.png',
        };

        // Notify all subscribers
        this.messageListeners.forEach((callback) => {
          try {
            callback(studyNotification);
          } catch (callbackErr) {
            console.error('[FcmService] Notification subscriber error:', callbackErr);
          }
        });
      });
    } catch (err) {
      console.warn('[FcmService] Error attaching foreground onMessage handler:', err);
    }
  }

  /**
   * Subscribe to incoming foreground notifications (study reminders, updates)
   */
  public onNotificationReceived(
    callback: (notification: StudyNotificationPayload) => void
  ): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  /**
   * Get the current cached device token
   */
  public getCurrentToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('abhyaas_fcm_token');
    }
    return null;
  }
}

// Export singleton instance as default & named export
export const fcmService = FcmService.getInstance();
export default fcmService;
