# Persistencia en la Nube con Firestore ☁️

MegaBook sincroniza los datos de cada usuario con **Firebase Firestore**, una base de datos en la nube en tiempo real. Esto reemplaza la dependencia exclusiva de `localStorage` y permite que el usuario no pierda su progreso ni su biblioteca al cambiar de dispositivo o limpiar el navegador.

---

## ¿Por qué Firestore?

| Criterio | localStorage | Firestore |
|---|---|---|
| Accesible desde otro dispositivo | ❌ No | ✅ Sí |
| Visible para el administrador | ❌ No | ✅ Sí |
| Gratuito para el MVP | ✅ Sí | ✅ Sí |
| Requiere servidor | ✅ No aplica | ✅ No (serverless) |

---

## Estructura de Datos en Firestore

Cada usuario autenticado tiene un documento en la colección `users`, usando su `uid` de Firebase Auth como identificador único:

```
/users/{uid}/
  ├── email: "usuario@gmail.com"
  ├── name: "Juan"
  ├── created_at: timestamp    ← fecha de primer registro, nunca se sobreescribe
  ├── last_session: timestamp  ← timestamp bruto (con fines de telemetría o auditoría)
  ├── last_session_date: "YYYY-MM-DD"  ← String estricto. Es la "llave maestra" para el cálculo matemático de la racha actual.
  ├── total_streak: 34         ← racha actual activa
  ├── max_streak: 34           ← racha máxima histórica (nunca disminuye)
  ├── book_ids: ["abc123", "xyz789"]  ← IDs de Google Books de la biblioteca personal
  └── habit_config: {                 ← (Objecto) Configuración de notificaciones
        habitpre: "antesdesayuno",
        time: "08:00",
        repeatdate: "diariamente"
      }
```

El campo `book_ids` es un array de strings con los IDs de la API de Google Books. Se inicializa como `[]` al crear el usuario y se actualiza cada vez que el usuario guarda su selección en `RegisterBook`.

---

## Archivos Modificados

### `src/logic/firebase.js`
Se inicializó Firestore activando el **Modo Offline (Caché Persistente)**. Esto significa que si el usuario completa un timer o guarda un libro sin internet, los cambios se encolarán localmente y se sincronizarán automáticamente en segundo plano cuando regrese la conexión:

```js
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
```

---

### `src/Components/Context/AuthProvider.jsx`
Al hacer Login con Google, se verifica si el usuario ya existe en Firestore:
- Si **no existe** → se crea su documento con valores iniciales, incluyendo `book_ids: []`.
- Si **ya existe** → no se toca nada, para preservar `created_at`, sus rachas y su biblioteca.

```js
await setDoc(userRef, {
  email: loggedUser.email,
  name: loggedUser.displayName,
  created_at: serverTimestamp(),
  total_streak: 0,
  max_streak: 0,
  last_session: null,
  book_ids: [],
  habit_config: null // ← sin configuración inicial
})
```

---

### `src/Components/Context/TimerProvider.jsx`
Se agregaron dos comportamientos clave para proteger el progreso:

1. **Sincronización al iniciar sesión:** Cuando el usuario abre la app, se lee su documento en Firestore y se cargan `total_streak` y `max_streak` en los estados locales.

2. **Guardado Seguro al completar timer:** Cuando el cronómetro termina y se registra una sesión exitosa, antes de actualizar, **se consulta a Firestore en tiempo real** para obtener el verdadero `max_streak` histórico. Luego se escribe en Firestore:
   - `last_session` → timestamp del momento actual.
   - `total_streak` → racha recalculada.
   - `max_streak` → cálculo matemático infalible: `Math.max(racha_actual, max_streak_nube, max_streak_local)`. Esto garantiza que la racha máxima **jamás disminuya** por culpa de una limpieza del caché o del `localStorage`.

---

### `src/Components/ResgiterBook/RegisterBook.jsx`
Ahora persiste la biblioteca del usuario exclusivamente en Firestore:

- **Al montar:** consulta Firestore para obtener los `book_ids` y mostrar la selección actual.
- **Al hacer click en "Agregar":** ejecuta `updateDoc` en `/users/{uid}` con `{ book_ids: inputValue }`.
- Se ha eliminado el uso de `localStorage` (`miConfiguracionRadio`), garantizando que la biblioteca sea la misma en cualquier dispositivo.
- Si el usuario no está autenticado, muestra un error indicando que debe iniciar sesión.

---

### `src/Components/BookLog/BookLog.jsx`
Ahora recupera la biblioteca exclusivamente desde Firestore:

- **Al montar:** si hay usuario autenticado, consulta su documento en Firestore para obtener los `book_ids`.
- Luego usa los IDs obtenidos para consultar la API de Google Books.
- Se ha eliminado la dependencia de `localStorage`, previniendo conflictos si varios usuarios inician sesión en el mismo navegador o si el usuario cambia de dispositivo.
- Si la consulta falla o no hay libros, simplemente muestra un arreglo vacío sin errores que rompan la UI.

---

### `src/Components/ConfigHabit/ConfigHabit.jsx`
Ahora guarda la configuración del hábito exclusivamente en Firestore (preparando el terreno para Push Notifications):

- **Al montar:** obtiene el documento del usuario para poblar los `initialValues` del formulario, si ya existe configuración en la nube.
- **Al enviar:** actualiza el campo `habit_config` en Firestore usando `updateDoc`.
- Se removió por completo el uso de `localStorage` (`habitData`).

---

## Panel de Administración (Firebase Console)

Para ver las métricas de todos los usuarios:

1. Entra a [console.firebase.google.com](https://console.firebase.google.com).
2. Selecciona tu proyecto MegaBook.
3. Ve a **Firestore Database → Colección `users`**.
4. Desde ahí puedes ver el `total_streak`, `max_streak`, `last_session` y `book_ids` de cada usuario en tiempo real.

### Filtros útiles para medir la OMTM (100 usuarios activos por 66 días)

| Métrica | Cómo consultarla en Firestore |
|---|---|
| Usuarios con 60+ días de racha | Filtrar `max_streak >= 60` |
| Usuarios activos esta semana | Filtrar `last_session` reciente |
| Usuarios que abandonaron | Filtrar `last_session` antigua |
| Usuarios con biblioteca configurada | Filtrar `book_ids` no vacío |

---

## Reglas de Seguridad

Cada usuario solo puede leer y modificar **su propio documento y sus subcolecciones**. Las reglas de Firestore no se heredan automáticamente, por lo que cada subcolección requiere su propia regla:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      // Subcolección de telemetría de clics
      match /telemetry/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

> ⚠️ Sin la regla de `telemetry`, los eventos de tracking son rechazados silenciosamente aunque el código React sea correcto.
