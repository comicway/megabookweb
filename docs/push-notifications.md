# Web Push Notifications 🔔

MegaBook implementa un sistema completo de notificaciones push para recordarle al usuario su hábito de lectura en el momento exacto que él eligió, sin depender de ningún servicio externo de terceros. Todo el sistema corre sobre **Vercel Serverless Functions** y **Firebase Firestore**.

---

## ¿Cómo funciona en términos simples?

1. El usuario abre la app y el navegador le pide permiso para enviar notificaciones.
2. Si acepta, se genera una "suscripción" única para ese navegador y se guarda en Firestore.
3. Un reloj automático (Cron Job) revisa cada 15 minutos qué usuarios tienen una alarma programada para ese bloque de tiempo.
4. Si encuentra usuarios con alarma pendiente, les envía la notificación directamente a su navegador, incluso si la app está cerrada.

---

## Parte 1: Frontend

### 1.1 Service Worker (`public/sw.js`)

El Service Worker es un script especial que el navegador ejecuta **en segundo plano**, completamente separado de la aplicación React. Es el único mecanismo que permite recibir y mostrar notificaciones cuando la pestaña de la app está cerrada.

**¿Qué hace exactamente?**

- Escucha el evento `push` que llega desde el servidor de Vercel.
- Extrae el `title` y `body` del mensaje y los muestra como una notificación nativa del sistema operativo.
- Escucha el evento `notificationclick`: si el usuario toca la notificación, el Service Worker enfoca o abre la app en el navegador.

```javascript
// Recibir el push y mostrarlo
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, { body: data.body });
});

// Al tocar la notificación, abrir la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  clients.openWindow(self.location.origin);
});
```

---

### 1.2 Hook de Suscripción (`src/hooks/usePushSubscription.js`)

Este Custom Hook se encarga de todo el proceso de registro automático al iniciar sesión. El desarrollador no tiene que preocuparse por nada: basta con llamar al hook una vez y él maneja el flujo completo.

**Flujo paso a paso:**

1. **Detecta al usuario autenticado** y verifica que el navegador soporte push (`ServiceWorker` y `PushManager`).
2. **Registra el Service Worker** (`/sw.js`) en el navegador para que quede activo en segundo plano.
3. **Verifica si ya existe una suscripción activa** para ese navegador (evita pedir permiso dos veces).
4. **Solicita permiso** al usuario con el diálogo nativo del sistema operativo.
5. Si el usuario acepta, **crea la suscripción** usando la clave pública VAPID (`VITE_VAPID_PUBLIC_KEY`).
6. **Guarda la suscripción en Firestore** bajo el campo `push_subscription` del documento del usuario.

```javascript
// La suscripción que se guarda en Firestore tiene esta forma:
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Estados del hook:**

| Estado | Significado |
|---|---|
| `idle` | Esperando a que haya usuario autenticado |
| `loading` | Registrando el Service Worker y pidiendo permiso |
| `subscribed` | Suscripción activa guardada en Firestore |
| `denied` | El usuario rechazó el permiso de notificaciones |
| `error` | Error técnico al registrar |

---

### 1.3 Inyección Global (`src/App.jsx`)

El hook se llama dentro de `AppContent`, junto a `useTracking()`. Esto garantiza que el proceso de suscripción ocurra automáticamente en el momento en que el usuario inicia sesión, sin necesidad de que navegue a ninguna pantalla específica.

```javascript
function AppContent() {
  useTracking();
  usePushSubscription(); // ← Una línea activa todo el sistema de push
  ...
}
```

---

### 1.4 Conversión a UTC en `ConfigHabit.jsx`

**El problema:** Los servidores de Vercel corren en UTC. Si un usuario en Santiago de Chile configura su alarma a las `07:00`, ese valor se guardaría en Firestore como `"07:00"`. Pero cuando el cron busca alarmas a las `11:00 UTC` (equivalente a las 07:00 en Chile invierno), no encontraría nada.

**La solución:** Antes de guardar la hora en Firestore, el frontend la convierte automáticamente a UTC usando el objeto `Date` nativo del navegador. La ventaja de este enfoque es que **el navegador conoce la zona horaria del usuario y maneja el horario de verano (DST) de forma automática**. No se necesita hardcodear el offset `-3` o `-4`.

```javascript
// El usuario escribe "07:00" en el formulario
const [hours, minutes] = values.time.split(':');
const localDate = new Date();
localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

// El navegador calcula el equivalente en UTC según la zona horaria del sistema
const timeUTC = `${localDate.getUTCHours().toString().padStart(2, '0')}:${localDate.getUTCMinutes().toString().padStart(2, '0')}`;
// Chile invierno (UTC-4): timeUTC = "11:00"
// Chile verano  (UTC-3): timeUTC = "10:00"

// Se guarda "11:00" en Firestore, no "07:00"
await updateDoc(userRef, { habit_config: { ...values, time: timeUTC } });
```

---

## Parte 2: Backend (Worker)

### 2.1 Endpoint Worker (`api/workers/notifications.js`)

Esta Serverless Function es el corazón del sistema. Vercel la invoca automáticamente según el Cron configurado.

**Flujo paso a paso:**

1. **Verifica seguridad**: Solo acepta peticiones que incluyan el token `CRON_SECRET` en la cabecera de autorización. Cualquier otra petición recibe un `401 No autorizado`. Esto evita que cualquiera dispare notificaciones masivas llamando al endpoint directamente.

2. **Calcula la ventana de tiempo**: Toma la hora UTC actual y calcula la hora de hace 15 minutos. Esto define el rango de búsqueda.

3. **Consulta Firestore** (solo los documentos relevantes): En lugar de traer todos los usuarios y filtrar en memoria, usa `where()` para pedirle directamente a Firestore solo los usuarios cuya `habit_config.time` caiga dentro de la ventana de 15 minutos. Esto hace que el worker sea extremadamente eficiente.

4. **Envía las notificaciones en paralelo** usando `Promise.all()` para no enviar una por una, sino todas al mismo tiempo.

5. **Limpia suscripciones expiradas**: Si el servidor de push devuelve un error `410 Gone`, significa que ese navegador ya no tiene la suscripción activa (el usuario desinstalóla app o revocó el permiso). En ese caso, el worker borra automáticamente el campo `push_subscription` de Firestore.

---

### 2.2 Bug de la Medianoche y su solución

**El problema:** La comparación de horas como strings (`"23:55" > "00:10"`) funciona perfectamente dentro del mismo día. Pero cuando el rango cruza la medianoche (por ejemplo, buscando entre `23:50` y `00:05`), la comparación falla porque `"23:50"` es alfabéticamente *mayor* que `"00:05"`, lo que invierte el rango y devuelve resultados incorrectos.

**La solución — Consulta dividida:** Se detecta si `pastTimeString > currentTimeString`. Si es así, significa que el rango cruzó la medianoche. En ese caso, se hacen **dos consultas independientes** y se combinan los resultados:

```
Rango Normal (ej. 14:45 → 15:00):
  ✅ Una sola consulta: habit_config.time > "14:45" AND <= "15:00"

Rango Medianoche (ej. 23:50 → 00:05):
  ✅ Consulta 1: habit_config.time > "23:50" AND <= "23:59"
  ✅ Consulta 2: habit_config.time >= "00:00" AND <= "00:05"
  ✅ Resultados = [...snap1.docs, ...snap2.docs]
```

---

### 2.3 Cron Job (`vercel.json`)

Vercel ejecuta automáticamente el worker usando la expresión cron `*/15 * * * *`, que se lee como: *"cada vez que los minutos sean múltiplo de 15"* (00, 15, 30, 45 de cada hora).

```json
{
  "crons": [
    {
      "path": "/api/workers/notifications",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

> **Nota:** La funcionalidad de Cron Jobs requiere el plan **Hobby** de Vercel como mínimo (gratuito con limitaciones). En el plan gratuito se permiten hasta 2 cron jobs por proyecto.

---

## Parte 3: Configuración de Variables de Entorno

Todas las claves sensibles se configuran en **Vercel Console → Project → Settings → Environment Variables**. Ninguna de estas claves debe aparecer en el código fuente ni en el repositorio de Git.

| Variable | Usado en | Descripción |
|---|---|---|
| `VITE_VAPID_PUBLIC_KEY` | Frontend (React) | Clave pública VAPID. Prefijo `VITE_` la expone al cliente de forma segura. |
| `VAPID_PUBLIC_KEY` | Worker (Node.js) | La misma clave pública, pero accedida desde el servidor. |
| `VAPID_PRIVATE_KEY` | Worker (Node.js) | Clave privada VAPID. **Nunca debe exponerse al cliente.** |
| `CRON_SECRET` | Worker (Node.js) | Token aleatorio para proteger el endpoint del cron de llamadas externas. |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Worker (Node.js) | JSON del Service Account de Firebase Admin. Permite al servidor leer/escribir en Firestore. |
| `GOOGLE_BOOKS_API_KEY` | Proxy de libros | Clave de Google Cloud para la API de búsqueda de libros. |

### Cómo generar las claves VAPID

```bash
npx web-push generate-vapid-keys
```

### Cómo generar el CRON_SECRET

```bash
openssl rand -hex 32
```

### Cómo obtener el Firebase Service Account

1. Ve a [console.firebase.google.com](https://console.firebase.google.com).
2. Selecciona tu proyecto.
3. Ve a **Project Settings → Service Accounts**.
4. Haz clic en **Generate new private key**.
5. Descarga el archivo `.json` y pega su contenido completo (en una sola línea) como valor de `FIREBASE_SERVICE_ACCOUNT_KEY`.

---

## Diagrama de Flujo General

```
[Usuario abre la app]
        ↓
[usePushSubscription registra SW + guarda suscripción en Firestore]
        ↓
[Usuario configura alarma en ConfigHabit.jsx]
        ↓
[Hora local → convertida a UTC → guardada en Firestore]
        ↓
[Cron de Vercel se ejecuta cada 15 min]
        ↓
[Worker consulta Firestore por rango de hora UTC]
        ↓
[web-push envía notificación al navegador del usuario]
        ↓
[Service Worker (sw.js) muestra la notificación nativa]
```
