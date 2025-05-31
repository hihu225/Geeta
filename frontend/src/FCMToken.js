// frontend/src/FCMToken.js
import { getToken } from 'firebase/messaging';
import { messaging } from './firebase';
import { backend_url } from './utils/backend';
import Cookies from 'js-cookie';
const FCMToken = async () => {
  try {
    // Request notification permission first
    const permission = await Notification.requestPermission();
    console.log("hefjkdshfbdjkffdiujgkfgfgfgf")
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: "BB4_1ASpKcUEyiBS5B8hWK-BZVvN2TOB2eWBGx-XPC5tJXp5VrD22EmyF7u_DmLoI3jHaAi6NTtX8WXYCYF-_sw",
    });

    if (currentToken) {
      console.log('FCM Token:', currentToken);

      // Save token to your backend
      try {
        const authToken = Cookies.get('token');
        if (authToken) {
          await fetch(`${backend_url}/api/notifications/save-token`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ token: currentToken }),
          });
          console.log('FCM token saved to backend');
        }
      } catch (backendError) {
        console.error('Failed to save token to backend:', backendError);
      }

      return currentToken;
    } else {
      console.warn('No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token: ', err);
    return null;
  }
}

export default FCMToken;