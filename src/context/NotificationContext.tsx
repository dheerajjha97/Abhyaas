import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, collection, onSnapshot, doc } from '../lib/firebase';
import { useStudentProfile } from './StudentProfileContext';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermissionAndRegisterToken,
  setupForegroundMessageListener,
  PushNotificationPayload,
} from '../lib/fcmNotifications';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  classId?: string;
  type: 'paper_update' | 'notes_update' | 'reminder' | 'exam_alert' | 'study_reminder' | 'revision_alert' | 'announcement';
  url?: string;
  createdAt: number;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isPermissionGranted: boolean;
  isSupported: boolean;
  permissionStatus: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  activeToast: PushNotificationPayload | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const LOCAL_READ_KEY = 'abhyaas_read_notification_ids';

const getReadNotificationIds = (): string[] => {
  try {
    const raw = localStorage.getItem(LOCAL_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveReadNotificationId = (id: string) => {
  try {
    const ids = getReadNotificationIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(LOCAL_READ_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.warn('Failed to save read notification id:', err);
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, profile } = useStudentProfile();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(getNotificationPermission());
  const [activeToast, setActiveToast] = useState<PushNotificationPayload | null>(null);

  const supported = isNotificationSupported();
  const isPermissionGranted = permissionStatus === 'granted';

  // Listen to Firestore announcements / study reminders collection in real-time
  useEffect(() => {
    try {
      const announcementsRef = collection(db, 'announcements');
      const unsubscribe = onSnapshot(
        announcementsRef,
        (snapshot) => {
          const readIds = getReadNotificationIds();
          const items: AppNotification[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Filter by student class (if announcement has a specific classId, match with profile.classId)
            if (!data.classId || data.classId === 'all' || data.classId === profile.classId) {
              items.push({
                id: docSnap.id,
                title: data.title || 'अध्ययन अपडेट 📢',
                body: data.body || 'नया अभ्यास सामग्री उपलब्ध है!',
                classId: data.classId,
                type: data.type || 'paper_update',
                url: data.url || '/',
                createdAt: data.createdAt || Date.now(),
                read: readIds.includes(docSnap.id),
              });
            }
          });

          // Sort descending by creation timestamp
          items.sort((a, b) => b.createdAt - a.createdAt);

          // If no announcements in Firestore yet, provide helpful initial study updates
          if (items.length === 0) {
            const defaultAnnouncements: AppNotification[] = [
              {
                id: 'welcome-reminder',
                title: `कक्षा ${profile.classId}वीं बोर्ड परीक्षा अलर्ट 🎯`,
                body: `कक्षा ${profile.classId} के नवीनतम मॉडल पेपर्स और फॉर्मूला रिवीजन शीट्स तैयार हैं।`,
                classId: profile.classId,
                type: 'reminder',
                url: '/papers',
                createdAt: Date.now() - 3600000,
                read: readIds.includes('welcome-reminder'),
              },
              {
                id: 'notes-reminder',
                title: '📌 नए नोट्स व मॉडल पेपर्स अपडेट',
                body: 'अभ्यास पोर्टल पर नए क्वेश्चन बैंक व मॉडल पेपर समय-समय पर जोड़े जा रहे हैं।',
                classId: 'all',
                type: 'notes_update',
                url: '/notes',
                createdAt: Date.now() - 7200000,
                read: readIds.includes('notes-reminder'),
              },
            ];
            setNotifications(defaultAnnouncements);
          } else {
            setNotifications(items);
          }
        },
        (error) => {
          // Silent handler to avoid exposing backend in console
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up announcements listener:', err);
    }
  }, [profile.classId]);

  // Foreground FCM Push Notification listener
  useEffect(() => {
    let unsubscribeForeground: (() => void) | null = null;

    setupForegroundMessageListener((payload) => {
      setActiveToast(payload);
      // Auto-add to notification list
      const newNotif: AppNotification = {
        id: `fcm-${Date.now()}`,
        title: payload.title,
        body: payload.body,
        classId: payload.classId,
        type: payload.type || 'paper_update',
        url: payload.url,
        createdAt: payload.timestamp || Date.now(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }).then((unsub) => {
      unsubscribeForeground = unsub;
    });

    return () => {
      if (unsubscribeForeground) {
        unsubscribeForeground();
      }
    };
  }, []);

  // Request Notification permission and sync FCM Token with current user & class
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;

    const token = await requestNotificationPermissionAndRegisterToken(
      currentUser?.uid,
      profile.classId
    );

    const updatedStatus = getNotificationPermission();
    setPermissionStatus(updatedStatus);

    return updatedStatus === 'granted';
  }, [currentUser, profile.classId, supported]);

  const markAsRead = (id: string) => {
    saveReadNotificationId(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAsRead = () => {
    notifications.forEach((item) => saveReadNotificationId(item.id));
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isPermissionGranted,
        isSupported: supported,
        permissionStatus,
        requestPermission,
        markAsRead,
        markAllAsRead,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
