import { logSystemEvent } from './supabase';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações Push.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      logSystemEvent('PUSH', 'Permissão de notificação concedida pelo cliente.', 'success');
      return true;
    }
  }

  return false;
}

export async function sendLocalPushNotification(title: string, body: string, url: string = '/') {
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url }
    });
    logSystemEvent('PUSH', `Notificação enviada: "${title}"`, 'info');
  } else {
    // Fallback using Notification API directly
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192.png' });
    }
  }
}
