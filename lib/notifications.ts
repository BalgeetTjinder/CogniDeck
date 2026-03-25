import { Platform } from 'react-native';
import { getSetting, setSetting, getTotalDueToday } from './database';

async function getNotificationsModule() {
  const Notifications = await import('expo-notifications');
  return Notifications;
}

let handlerSet = false;

async function ensureHandler() {
  if (handlerSet) return;
  try {
    const Notifications = await getNotificationsModule();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerSet = true;
  } catch {
    // Expo Go may not support all notification features
  }
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const Notifications = await getNotificationsModule();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDaily(hour: number, minute: number): Promise<void> {
  try {
    await ensureHandler();
    const Notifications = await getNotificationsModule();
    await Notifications.cancelAllScheduledNotificationsAsync();

    const due = await getTotalDueToday();
    const body = due > 0
      ? `У тебя ${due} карточек на сегодня. Не теряй серию!`
      : 'Зайди проверить свои знания!';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'CogniDeck',
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (e) {
    console.warn('Notifications not available:', e);
  }

  await setSetting('notif_hour', String(hour));
  await setSetting('notif_minute', String(minute));
  await setSetting('notif_enabled', 'true');
}

export async function cancelAll(): Promise<void> {
  try {
    const Notifications = await getNotificationsModule();
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
  await setSetting('notif_enabled', 'false');
}

export async function getNotificationSettings(): Promise<{
  enabled: boolean;
  hour: number;
  minute: number;
}> {
  const enabled = await getSetting('notif_enabled');
  const hour = await getSetting('notif_hour');
  const minute = await getSetting('notif_minute');
  return {
    enabled: enabled === 'true',
    hour: hour ? parseInt(hour, 10) : 20,
    minute: minute ? parseInt(minute, 10) : 0,
  };
}
