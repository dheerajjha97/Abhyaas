import {
  fcmService,
  StudyNotificationPayload,
  NotificationType,
  FcmInitResult,
} from '../services/fcmService';

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  classId?: string;
  type?: 'paper_update' | 'notes_update' | 'reminder' | 'exam_alert' | 'study_reminder' | 'revision_alert' | 'announcement';
  timestamp?: number;
}

/**
 * Check if the current browser environment supports Push Notifications & Service Workers
 */
export const isNotificationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Get current notification permission state: 'default' | 'granted' | 'denied'
 */
export const getNotificationPermission = (): NotificationPermission => {
  return fcmService.getPermission();
};

/**
 * Request permission and generate FCM Token, then store token in Firestore user profile
 */
export const requestNotificationPermissionAndRegisterToken = async (
  userId?: string,
  classId: string = '10'
): Promise<string | null> => {
  const result: FcmInitResult = await fcmService.initialize({
    userId,
    classId,
  });
  return result.token;
};

/**
 * Listen for foreground push messages while app is actively open
 */
export const setupForegroundMessageListener = async (
  onMessageReceived: (payload: PushNotificationPayload) => void
): Promise<(() => void) | null> => {
  await fcmService.getMessagingInstance();

  const unsubscribe = fcmService.onNotificationReceived((studyNotif: StudyNotificationPayload) => {
    onMessageReceived({
      title: studyNotif.title,
      body: studyNotif.body,
      url: studyNotif.url,
      classId: studyNotif.classId,
      type: studyNotif.type as PushNotificationPayload['type'],
      timestamp: studyNotif.timestamp,
    });
  });

  return unsubscribe;
};

export { fcmService };
export type { StudyNotificationPayload, NotificationType };
