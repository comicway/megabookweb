# Persistencia en la Nube con Firestore ☁️

A partir de la rama `cloudbackend`, MegaBook sincroniza los datos de racha de cada usuario con **Firebase Firestore**, una base de datos en la nube en tiempo real. Esto reemplaza la dependencia exclusiva de `localStorage` y permite medir el progreso de todos los usuarios desde un panel centralizado.

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
  ├── created_at: timestamp   ← fecha de primer registro, nunca se sobreescribe
  ├── last_session: timestamp ← última sesión de lectura completada
  ├── total_streak: 34        ← racha actual activa
  └── max_streak: 34          ← racha máxima histórica (nunca disminuye)
```

---

## Archivos Modificados

### `src/logic/firebase.js`
Se inicializó Firestore y se exportó la instancia `db` para que los providers puedan usarla:

```js
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
```

---

### `src/Components/Context/AuthProvider.jsx`
Al hacer Login con Google, se verifica si el usuario ya existe en Firestore:
- Si **no existe** → se crea su documento con valores iniciales (`total_streak: 0`, `max_streak: 0`).
- Si **ya existe** → no se toca nada, para preservar `created_at` y sus rachas.

---

### `src/Components/Context/TimerProvider.jsx`
Se agregaron dos comportamientos nuevos:

1. **Sincronización al iniciar sesión:** Cuando el usuario abre la app, se lee su documento en Firestore y se cargan `total_streak` y `max_streak` en los estados locales. Esto garantiza que si usa la app en otro dispositivo, vea su progreso actualizado.

2. **Guardado al completar timer:** Cuando el cronómetro termina y se registra una sesión exitosa, se escribe en Firestore:
   - `last_session` → timestamp del momento actual.
   - `total_streak` → racha recalculada.
   - `max_streak` → el mayor valor entre la racha actual y el histórico.

---

## Panel de Administración (Firebase Console)

Para ver las métricas de todos los usuarios:

1. Entra a [console.firebase.google.com](https://console.firebase.google.com).
2. Selecciona tu proyecto MegaBook.
3. Ve a **Firestore Database → Colección `users`**.
4. Desde ahí puedes ver el `total_streak`, `max_streak` y `last_session` de cada usuario en tiempo real.

### Filtros útiles para medir la OMTM (60 días de racha)

| Métrica | Cómo consultarla en Firestore |
|---|---|
| Usuarios con 60+ días de racha | Filtrar `max_streak >= 60` |
| Usuarios activos esta semana | Filtrar `last_session` reciente |
| Usuarios que abandonaron | Filtrar `last_session` antigua |

---

## Reglas de Seguridad

Cada usuario solo puede leer y modificar **su propio documento**. Nadie puede acceder a los datos de otro usuario:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
