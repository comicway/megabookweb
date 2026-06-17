import { useEffect } from 'react';

/**
 * useTimerNotification.js
 * Custom Hook que encapsula toda la lógica de permisos y envío de notificaciones
 * nativas del navegador (Notification API).
 *
 * Responsabilidades:
 * 1. Solicitar permisos de forma anticipada al montar el componente que lo consuma.
 * 2. Exponer la función `showTimerNotification` para disparar la notificación al completar el timer.
 */
const useTimerNotification = () => {

    // Solicitar permiso de notificación al montar el componente consumidor (de forma no intrusiva)
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    /**
     * Muestra una notificación nativa del SO cuando el timer llega a cero.
     * Gestiona los 3 estados de permiso: granted, default y denied.
     */
    const showTimerNotification = async () => {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification('🔔 ¡Tiempo completado!', {
                body: '¡Excelente! Completaste tu sesión de lectura. Sigue así.',
                icon: '/favicon.ico',
            });
            return;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('🔔 ¡Tiempo completado!', {
                    body: '¡Excelente! Completaste tu sesión de lectura. Sigue así.',
                    icon: '/favicon.ico',
                });
            }
        }
        // Si el permiso es 'denied', no se hace nada. Se respeta la decisión del usuario.
    };

    return { showTimerNotification };
};

export default useTimerNotification;
