# Documentación de Implementación: Autenticación con Firebase y Google SSO

**Fecha de Implementación:** 16 de abril de 2026

**Objetivo:** Cumplir el hito "Auth" del PMV (Producto Mínimo Viable) para permitir la identificación única de usuarios mediante Google y asegurar todas las rutas de la aplicación MegaBook.

---

## 1. Arquitectura y Dependencias

Para lograr un sistema de "Login with Google" sin fricción (cero contraseñas), se optó por **Firebase Authentication**.

**Librerías Instaladas:**
- `firebase` (v11.x o superior) instalada vía `npm install firebase`.

**Variables de Entorno (Vite):**
Se crearon credenciales de entorno en el archivo `.env` usando el prefijo requerido por Vite (`VITE_`), tales como `VITE_FIREBASE_API_KEY`, etc. Esto garantiza que Vite inyecte las claves de forma segura en la compilación.

---

## 2. Archivos Creados (Flujo de Seguridad)

### `src/logic/firebase.js`
**Propósito:** Es el puente de inicialización. Toma las variables de entorno de Vite, inicializa la aplicación y expone la variable `auth` (el cliente de Firebase Authentication) al resto del proyecto.

### `src/Components/Auth/Login.jsx`
**Propósito:** La pantalla de bienvenida ("El Lobby").
**Detalles:** 
- Oculta el `ToolBar` y el título general.
- Posee un diseño premium en modo oscuro con estética de MegaBook.
- Renderiza el botón "Entrar con Google" que ejecuta el método asíncrono para abrir el Pop-Up de Firebase.

### `src/Components/Auth/ProtectedRoute.jsx`
**Propósito:** El "Guardia de Seguridad" (Bouncer).
**Detalles:** 
- Es un componente de enrutamiento (wrapper).
- Consulta al contexto global (`AuthProvider`).
- Si el contexto dice `loading = true`, muestra un "spinner" de carga.
- Si determina que no hay ningún usuario (`user = null`), redirige obligatoriamente de vuelta a `/login` usando `<Navigate />`.
- Si el usuario existe, le permite pasar renderizando sus subrutas (`<Outlet />`).

---

## 3. Archivos Modificados

### `src/Components/Context/AuthProvider.jsx`
**Propósito:** El cerebro reactivo de la sesión del usuario.
**Detalles:** 
- En lugar de basarse en variables locales sueltas, este archivo fue *reescrito* para crear un **React Context** global.
- Importa `onAuthStateChanged` de Firebase. Esto escucha pasivamente; si el usuario recarga la página, Firebase recupera su Identidad y la rehidrata instantáneamente.
- **`signInWithGoogle`**: Dispara el popup (`signInWithPopup`).
- **`signOut`**: Envía la señal a Firebase para destruir el caché de la sesión y emite la actualización a toda la app para bloquear las rutas.
- Todo esto se exporta mediante un hook custom llamado `useAuth()`.

### `src/App.jsx`
**Propósito:** El esqueleto principal.
**Detalles:** 
- Se dividió internamente en `App` y `AppContent` para que el `useAuth` pudiese funcionar bajo el paraguas del `<AuthProvider>`.
- Las rutas `HomePage`, `ReadBook`, `ConfigHabit`, `RegisterBook`, y `Timer` se movieron al interior de la etiqueta `<Route element={<ProtectedRoute />}>`, blindando así toda la aplicación.
- Se agregó el componente `<Login />` como la única ruta de acceso libre.
- **Botón de Cierre de Sesión:** Se agregó un sutil botón "Salir" (en la esquina superior derecha junto al título) que ejecuta el método `signOut` alojado en el `AuthProvider`. 
- Se condicionó que el `ToolBar` y el título superior NO se muestren si `location.pathname === '/login'`.

---

## 4. Flujo de Vida del Usuario (Resumen de Casos de Uso)

1. **Usuario Nuevo / Desconectado:** Intenta entrar a `megabookweb.vercel.app/`. El `ProtectedRoute` lo detecta sin credencial y lo empuja a `/login`. Ve la pantalla premium.
2. **Login Exitoso:** Al dar clic en "Entrar con Google", Firebase confirma la identidad. Se devuelve un objeto User. El `useAuth` actualiza el estado, el `ProtectedRoute` se abre, y el router lo redirige de vuelta a `/` (El DaikyStreak / Home).
3. **Caché (Recarga la Página):** El usuario pulsa "F5". Por un milisegundo la app carga, pero el `onAuthStateChanged` interviene inmediatamente e inyecta la sesión guardada. El usuario no tiene que volver a presionar el botón de Login.
4. **Cierre de Sesión:** El usuario presiona "Salir". El método `signOut` borra la clave. El estado `user` cambia a `null` reactivamente. El `ProtectedRoute` lo saca automáticamente y lo empuja al Lobby (`/login`), ocultando la barrra de navegación.
