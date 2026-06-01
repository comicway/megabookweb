# Cloud/Backend: Firestore (Firebase) como base de datos centralizada

Migrar la persistencia de rachas y datos de usuario de `localStorage` (solo en el dispositivo del usuario) a **Firestore**, la base de datos en tiempo real de Firebase. Esto permitirá medir las métricas de retención de hábito (OMTM) desde Firebase Console, sin necesidad de un servidor externo.

---

## Contexto de la decisión

Se eligió **Firestore** por sobre FastAPI + Cloud Run porque:
- ✅ Está dentro del ecosistema Firebase que ya está instalado y configurado
- ✅ Tier gratuito suficiente para el MVP (50K lecturas / 20K escrituras por día)
- ✅ No requiere servidor, Docker ni infraestructura adicional
- ✅ Los datos son accesibles directamente desde Firebase Console

---

## Estructura de datos en Firestore

```
/users/{uid}/
  ├── email: "usuario@gmail.com"   ← tomado de Firebase Auth al login
  ├── name: "Juan"                 ← tomado de Firebase Auth al login
  ├── created_at: timestamp        ← cuándo se registró por primera vez
  ├── last_session: timestamp      ← última vez que completó una sesión de lectura
  ├── total_streak: 34             ← racha actual activa
  ├── max_streak: 34               ← racha máxima histórica (nunca baja)
  └── book_ids: ["abc123", "xyz789"] ← IDs de Google Books de la biblioteca personal
```

---

## Métricas que esto permite medir

Desde **Firebase Console → Firestore**, se puede filtrar y ver:

| Pregunta | Filtro en Firestore |
|---|---|
| ¿Cuántos usuarios llegaron a 60 días? | `max_streak >= 60` |
| ¿Quiénes están activos esta semana? | `last_session` < hace 2 días |
| ¿Quiénes abandonaron? | `last_session` > hace 7 días |
| Racha promedio de todos | Promedio de `total_streak` |

---

## Proposed Changes

### Paso 1 — Firebase Console (manual, sin código)

Habilitar Firestore en el proyecto Firebase existente:
1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Seleccionar el proyecto MegaBook
3. En el menú lateral: **Build → Firestore Database**
4. Click en **Create database**
5. Seleccionar modo **Production** y la región más cercana (ej. `us-east1`)
6. Configurar las **Security Rules** para que solo el dueño pueda leer/escribir sus datos

```
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

### Paso 2 — Frontend: `src/firebase.js`

#### [MODIFY] `src/firebase.js`
Agregar la inicialización de Firestore al archivo de configuración de Firebase existente:
```js
import { getFirestore } from 'firebase/firestore'
export const db = getFirestore(app)
```

---

### Paso 3 — `AuthProvider.jsx`

#### [MODIFY] `src/Components/Context/AuthProvider.jsx`
Al hacer login con Google (`signInWithGoogle`):
1. Verificar si el documento del usuario en la colección `users` existe usando `getDoc`.
2. Si **no existe**, crearlo usando `setDoc` inicializando:
   - `email`, `name`
   - `created_at` utilizando `serverTimestamp()`
   - `total_streak: 0`
   - `max_streak: 0`
   - `last_session: null`
3. Si **ya existe**, no hacemos nada con el documento en este paso para evitar sobreescribir `created_at` ni alterar sus rachas actuales.

---

### Paso 4 — `TimerProvider.jsx`

#### [MODIFY] `src/Components/Context/TimerProvider.jsx`
1. **Sincronización inicial:** Al montar el proveedor, si hay un usuario autenticado, consultar su documento en Firestore (`getDoc`) y usar esos valores para inicializar los estados `totalStreak` y `maxStreak`, sincronizándolos con `localStorage`.
2. **Registro de sesión:** Al completar una sesión del timer (cuando `timerComplete` aumenta), hacer un `updateDoc` en Firestore con:
   - `last_session`: timestamp del momento actual (`serverTimestamp()`)
   - `total_streak`: el valor calculado localmente
   - `max_streak`: el mayor entre el valor local y el guardado

---

## Verification Plan

### Manual
1. Hacer login con Google → verificar que aparece el documento en Firebase Console con `created_at` correcto.
2. Hacer login de nuevo → verificar que `created_at` no cambia.
3. Completar una sesión del timer → verificar que `last_session`, `total_streak` y `max_streak` se actualizan en Firestore.
4. Abrir la app en otro dispositivo → los datos de racha deben cargar desde Firestore.

### Admin (Firebase Console)
- Ir a **Firestore → Colección `users`** → ver todos los usuarios registrados y sus métricas de racha.

---

## 📖 Cómo es el código: Explicación con analogías

Esta sección explica, de forma sencilla, el código nuevo que se introdujo para conectar MegaBook con Firestore.

---

### `src/logic/firebase.js` — El cuarto de control

> **Analogía:** Piensa en este archivo como el cuarto de control de un edificio. Antes solo tenía conectado el sistema de seguridad (Firebase Auth). Ahora también activamos la cámara de archivo (Firestore).

```js
import { getFirestore } from 'firebase/firestore';
// ↑ "Trae el plano del sistema de archivo (Firestore) desde la caja de herramientas de Firebase"

export const db = getFirestore(app);
// ↑ "Usa ese plano para encender y conectar el sistema de archivo.
//    Guárdalo en una caja llamada 'db' para que cualquier otra parte
//    del edificio pueda usarlo cuando lo necesite."
```

---

### `src/Components/Context/AuthProvider.jsx` — El portero del edificio

> **Analogía:** El `AuthProvider` es como el portero de un edificio. Cuando llega un visitante (usuario), el portero verifica si ya tiene un expediente en el archivo. Si no lo tiene, crea uno nuevo. Si ya existe, no lo toca para no borrar información importante.

```js
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
// ↑ Importamos 4 herramientas:
//   - doc     → "Dame la dirección de un expediente específico"
//   - getDoc  → "Busca y trae ese expediente"
//   - setDoc  → "Crea un expediente nuevo con estos datos"
//   - serverTimestamp → "Usa el reloj del servidor para marcar la hora exacta"

const userRef = doc(db, 'users', loggedUser.uid)
// ↑ "Dame la dirección del expediente de ESTE usuario.
//    Está en el archivador 'users', en el cajón con su ID único."

const userSnap = await getDoc(userRef)
// ↑ "Ve al archivador y busca ese expediente. Espera hasta tenerlo en mano."

if (!userSnap.exists()) {
// ↑ "Si el expediente no existe (usuario nuevo)..."

  await setDoc(userRef, {
    email: loggedUser.email,       // ← su correo
    name: loggedUser.displayName,  // ← su nombre
    created_at: serverTimestamp(), // ← la hora oficial del servidor (no del navegador)
    total_streak: 0,               // ← racha inicial en cero
    max_streak: 0,                 // ← récord histórico también en cero
    last_session: null             // ← no ha completado ninguna sesión aún
  })
  // ↑ "...entonces crea un expediente nuevo con estos datos de partida."
}
// Si ya existe, no hacemos nada → el expediente antiguo queda intacto.
```

---

### `src/Components/Context/TimerProvider.jsx` — El guardián de los récords

> **Analogía:** El `TimerProvider` es como un atleta que tiene un entrenador personal (Firestore). Cuando llega al gimnasio (abre la app), el entrenador le dice sus récords anteriores. Cuando termina una sesión, el entrenador actualiza el registro oficial.

#### Sincronización inicial (al abrir la app)

```js
import { useAuth } from './AuthProvider';
// ↑ "Necesito saber quién es el usuario que está activo ahora mismo."

const { user } = useAuth();
// ↑ "Toma el objeto del usuario (con su ID) del contexto de autenticación."

useEffect(() => {
  if (user) {
// ↑ "Solo haz esto si hay alguien con sesión iniciada"

    const loadFirestoreData = async () => {
      const userRef = doc(db, 'users', user.uid)
      // ↑ "Busca el expediente de este usuario en Firestore"

      const userSnap = await getDoc(userRef)
      // ↑ "Trae el expediente y espera"

      if (userSnap.exists()) {
        const data = userSnap.data()
        // ↑ "Si existe, saca todos los datos del expediente"

        if (data.total_streak !== undefined) setTotalStreak(data.total_streak)
        // ↑ "Si el expediente tiene una racha guardada, úsala como punto de partida"

        if (data.max_streak !== undefined) setMaxStreak(data.max_streak)
        // ↑ "Igual para el récord histórico"
      }
    };
    loadFirestoreData();
  }
}, [user]);
// ↑ "Ejecuta esto cada vez que el usuario cambie (ej: cierra sesión y entra otro)"
```

#### Guardado al completar el timer

```js
setTotalStreak(prevTotal => {
  const newTotal = yesterdayWasSuccessful ? prevTotal + 1 : 1;
  // ↑ "Calcula la nueva racha. Si ayer también leyó, suma 1.
  //    Si no, reinicia a 1 (hoy empezó de nuevo)."

  setMaxStreak(prevMax => {
    const newMax = Math.max(newTotal, prevMax);
    // ↑ "El nuevo récord es el mayor entre la racha actual y el récord anterior.
    //    El récord NUNCA baja."

    if (user) {
      const userRef = doc(db, 'users', user.uid)
      updateDoc(userRef, {
        last_session: serverTimestamp(), // ← "Sella la hora exacta de esta sesión"
        total_streak: newTotal,          // ← "Actualiza la racha actual"
        max_streak: newMax               // ← "Actualiza el récord si es mayor"
      })
      // ↑ "updateDoc: a diferencia de setDoc, solo modifica los campos indicados.
      //    No borra el resto del expediente (email, created_at, etc.)"
    }
    return newMax;
  });

  return newTotal;
});
// ↑ "Usamos funciones de callback (prevTotal, prevMax) en lugar de variables directas
//    para garantizar que React use el valor MÁS ACTUALIZADO del estado.
//    Evita bugs cuando hay múltiples renders seguidos."
```

