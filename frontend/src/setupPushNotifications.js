import { PushNotifications } from '@capacitor/push-notifications';

export const setupPushNotifications = async () => {
  const permissionStatus = await PushNotifications.requestPermissions();
  if (permissionStatus.receive !== 'granted') {
    console.log('Push permission not granted');
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener('registration', (token) => {
    console.log('FCM Token:', token.value);
    // You can send this token to your backend
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Registration error:', err);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Notification tapped:', notification);
  });
};
