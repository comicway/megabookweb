import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import webpush from 'web-push';

// ─── Inicialización Firebase Admin ───────────────────────────────────────────
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({ credential: cert(serviceAccount) });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

// ─── Inicialización Web Push ──────────────────────────────────────────────────
webpush.setVapidDetails(
  'mailto:contacto@megabook.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ─── Helper: Día local del usuario en Chile ───────────────────────────────────
// Chile: UTC-4 invierno (CLT) / UTC-3 verano (CLST).
// Hardcodeamos CLT. Para DST automático se requeriría la librería `luxon`.
const CHILE_OFFSET_HOURS = 4;

function getChileDayOfWeek(nowUTC) {
  const chileMs = nowUTC.getTime() - CHILE_OFFSET_HOURS * 60 * 60 * 1000;
  return new Date(chileMs).getUTCDay(); // 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
}

// ─── Helper: ¿Corresponde notificar hoy? ─────────────────────────────────────
function shouldNotifyToday(repeatdate, nowUTC) {
  if (!repeatdate || repeatdate === 'diariamente' || repeatdate === 'unavez') return true;

  const day = getChileDayOfWeek(nowUTC);
  const MAP = {
    lunes:         [1],
    martes:        [2],
    miercoles:     [3],
    jueves:        [4],
    viernes:       [5],
    sabado:        [6],
    domingo:       [0],
    lunesaviernes: [1, 2, 3, 4, 5],
  };

  const allowedDays = MAP[repeatdate];
  if (!allowedDays) return false; // valor desconocido → no enviar
  return allowedDays.includes(day);
}

// ─── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Flexibilidad de Auth: Permite token vía Header (Bearer) o Query String (útil para cron-job.org)
  const authHeader = req.headers.authorization;
  const querySecret = req.query.secret;
  
  const isValidHeader = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isValidQuery = querySecret === process.env.CRON_SECRET;

  if (!isValidHeader && !isValidQuery) {
    return res.status(401).end('No autorizado');
  }

  const db = getFirestore();
  let notificacionesEnviadas = 0;

  try {
    // 1. Calcular ventana de tiempo en estricto UTC
    const now = new Date();
    const currentHour   = now.getUTCHours().toString().padStart(2, '0');
    const currentMinute = now.getUTCMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;

    const past = new Date(now.getTime() - 15 * 60000);
    const pastHour   = past.getUTCHours().toString().padStart(2, '0');
    const pastMinute = past.getUTCMinutes().toString().padStart(2, '0');
    const pastTimeString = `${pastHour}:${pastMinute}`;

    let usersSnapshotDocs = [];

    // 2. Bug de la Medianoche: si el rango cruza las 00:00 → dos queries
    if (pastTimeString > currentTimeString) {
      const [snap1, snap2] = await Promise.all([
        db.collection('users')
          .where('habit_config.time', '>', pastTimeString)
          .where('habit_config.time', '<=', '23:59')
          .get(),
        db.collection('users')
          .where('habit_config.time', '>=', '00:00')
          .where('habit_config.time', '<=', currentTimeString)
          .get(),
      ]);
      usersSnapshotDocs = [...snap1.docs, ...snap2.docs];
    } else {
      const snap = await db.collection('users')
        .where('habit_config.time', '>', pastTimeString)
        .where('habit_config.time', '<=', currentTimeString)
        .get();
      usersSnapshotDocs = snap.docs;
    }

    const notificacionesPromises = [];

    // 3. Filtrar por día (en Node.js) y enviar push
    for (const doc of usersSnapshotDocs) {
      const userData       = doc.data();
      const habitConfig    = userData.habit_config;
      const pushSubscription = userData.push_subscription;

      if (!pushSubscription || !habitConfig) continue;

      // ← Validar día de la semana según repeatdate configurado por el usuario
      if (!shouldNotifyToday(habitConfig.repeatdate, now)) {
        console.log(`[Skip] UID ${doc.id} — "${habitConfig.repeatdate}" no aplica hoy`);
        continue;
      }

      const payload = JSON.stringify({
        title: '¡Es tu momento de leer! 📖',
        body: `Recuerda tu anclaje: ${habitConfig.habitpre}. Tómate tu tiempo.`,
      });

      notificacionesPromises.push(
        webpush.sendNotification(JSON.parse(pushSubscription), payload)
          .then(() => { notificacionesEnviadas++; })
          .catch((err) => {
            console.error(`Fallo UID ${doc.id}:`, err.statusCode);
            // 410 Gone → suscripción expirada, limpiar Firestore
            if (err.statusCode === 410) {
              db.collection('users').doc(doc.id).update({
                push_subscription: FieldValue.delete(),
              });
            }
          })
      );
    }

    await Promise.all(notificacionesPromises);

    res.status(200).json({
      success: true,
      procesados: usersSnapshotDocs.length,
      enviados: notificacionesEnviadas,
    });

  } catch (error) {
    console.error('Error en el worker de notificaciones:', error);
    res.status(500).json({ error: 'Fallo interno del servidor' });
  }
}
