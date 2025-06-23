import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { setupPushNotifications } from "./setupPushNotifications";
import { Preferences } from '@capacitor/preferences';
const RootRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    setupPushNotifications(); // optional
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { value: token } = await Preferences.get({ key: 'token' });
const { value: visitedOnce } = await Preferences.get({ key: 'visitedOnce' });

if (!visitedOnce) {
  await Preferences.set({ key: 'visitedOnce', value: 'true' });
  setFirstVisit(true);
}

        setHasToken(!!token);
      } catch (error) {
        console.error('Error during initial check:', error);
        setHasToken(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ccc',
          borderTop: '4px solid #444',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px',
        }} />
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  console.log('First visit:', firstVisit);
  if (firstVisit) return <Navigate to="/landing" replace />;
  if (hasToken) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default RootRedirect;
