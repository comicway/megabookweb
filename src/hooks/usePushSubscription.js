import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../logic/firebase';
import { useAuth } from '../Components/Context/AuthProvider';

// Convierte la clave VAPID pública (base64) al formato requerido por el navegador (Uint8Array)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const usePushSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState('idle'); // idle | loading | subscribed | denied | error

  useEffect(() => {
    // Solo intentar si hay usuario autenticado y el navegador soporta push
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const subscribe = async () => {
      setSubscriptionStatus('loading');
      try {
        // 1. Registrar el Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // 2. Verificar si ya existe una suscripción activa
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscriptionStatus('subscribed');
          return;
        }

        // 3. Pedir permiso al usuario
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setSubscriptionStatus('denied');
          return;
        }

        // 4. Crear la suscripción usando la clave VAPID pública
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        });

        // 5. Guardar la suscripción en Firestore bajo el documento del usuario
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          push_subscription: JSON.stringify(subscription),
        });

        setSubscriptionStatus('subscribed');
        console.log('[Push] Suscripción guardada en Firestore ✅');
      } catch (error) {
        console.error('[Push] Error al suscribir:', error);
        setSubscriptionStatus('error');
      }
    };

    subscribe();
  }, [user]);

  return { subscriptionStatus };
};
