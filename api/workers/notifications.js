import admin from 'firebase-admin';
import webpush from 'web-push';

// Inicializar Firebase Admin usando variables de entorno para evitar exponer credenciales
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

// Inicializar Web Push con claves VAPID generadas previamente
webpush.setVapidDetails(
  'mailto:contacto@megabook.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // Seguridad: Asegurar que la petición proviene exclusivamente del Cron de Vercel
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('No autorizado');
  }

  const db = admin.firestore();
  let notificacionesEnviadas = 0;

  try {
    // 1. Manejo del Tiempo (UTC)
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;

    const past = new Date(now.getTime() - 15 * 60000);
    const pastHour = past.getHours().toString().padStart(2, '0');
    const pastMinute = past.getMinutes().toString().padStart(2, '0');
    const pastTimeString = `${pastHour}:${pastMinute}`;

    let usersSnapshotDocs = [];

    // 2. Solución al Bug de la Medianoche
    if (pastTimeString > currentTimeString) {
      // Rango cruzado (ej. 23:55 a 00:10)
      const snap1 = await db.collection('users')
        .where('habit_config.time', '>', pastTimeString)
        .where('habit_config.time', '<=', '23:59')
        .get();
      
      const snap2 = await db.collection('users')
        .where('habit_config.time', '>=', '00:00')
        .where('habit_config.time', '<=', currentTimeString)
        .get();

      usersSnapshotDocs = [...snap1.docs, ...snap2.docs];
    } else {
      // Flujo normal de tiempo lineal
      const snap = await db.collection('users')
        .where('habit_config.time', '>', pastTimeString)
        .where('habit_config.time', '<=', currentTimeString)
        .get();
      
      usersSnapshotDocs = snap.docs;
    }

    const notificacionesPromises = [];

    // 3. Procesar envíos (Costo-Cero: solo iteramos sobre los documentos que SÍ tienen alarma ahora)
    for (const doc of usersSnapshotDocs) {
      const userData = doc.data();
      const habitConfig = userData.habit_config;
      const pushSubscription = userData.push_subscription;

      if (pushSubscription && habitConfig) {
        const payload = JSON.stringify({
          title: '¡Es tu momento de leer! 📖',
          body: `Recuerda tu anclaje: ${habitConfig.habitpre}. Tómate tu tiempo.`,
        });

        notificacionesPromises.push(
          webpush.sendNotification(JSON.parse(pushSubscription), payload)
            .then(() => { notificacionesEnviadas++; })
            .catch((err) => {
              console.error(`Fallo al enviar a UID ${doc.id}:`, err.statusCode);
              if (err.statusCode === 410) {
                db.collection('users').doc(doc.id).update({ push_subscription: admin.firestore.FieldValue.delete() });
              }
            })
        );
      }
    }

    await Promise.all(notificacionesPromises);

    res.status(200).json({ success: true, procesados: usersSnapshotDocs.length, enviados: notificacionesEnviadas });

  } catch (error) {
    console.error('Error en el worker de notificaciones:', error);
    res.status(500).json({ error: 'Fallo interno del servidor' });
  }
}
