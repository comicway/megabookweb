import { useEffect, useRef } from 'react';
import { useAuth } from '../Components/Context/AuthProvider';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../logic/firebase';

export const useTracking = () => {
  const { user } = useAuth();
  const lastClickRef = useRef({ time: Date.now(), id: null });

  useEffect(() => {
    if (!user) return;

    const handleGlobalClick = async (event) => {
      const target = event.target.closest('[data-tracking-id]');
      if (!target) return;

      const elementId = target.getAttribute('data-tracking-id');
      const now = Date.now();
      const timeElapsedMs = lastClickRef.current.id ? now - lastClickRef.current.time : 0;
      const timestamp = new Date(now).toISOString();

      const payload = {
        userId: user.uid,
        elementId,
        previousElementId: lastClickRef.current.id,
        timeElapsedMs,
        timestamp,
      };

      console.log('[Tracking] Payload:', JSON.stringify(payload, null, 2));

      try {
        const telemetryRef = collection(db, 'users', user.uid, 'telemetry');
        await addDoc(telemetryRef, payload);
        console.log('[Tracking] ✅ Guardado en Firestore:', elementId);
      } catch (err) {
        console.error('[Tracking] ❌ Error al guardar en Firestore:', err.code, err.message);
      }

      lastClickRef.current = { time: now, id: elementId };
    };

    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [user]);
};
