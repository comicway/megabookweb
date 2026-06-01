# Tasks: book-firestore-persistence

## Overview

Implementar la persistencia de la biblioteca de libros en Firebase Firestore, complementando el `localStorage` existente. Los cambios se concentran en `RegisterBook.jsx`, `BookLog.jsx` y `AuthProvider.jsx`.

---

## Tasks

- [x] 1. Extender el documento inicial del usuario en Firestore con `book_ids`
  - [x] 1.1 En `AuthProvider.jsx`, agregar `book_ids: []` al objeto que se pasa a `setDoc` cuando se crea un usuario nuevo
  - **Archivo**: `src/Components/Context/AuthProvider.jsx`
  - **Criterio**: Requirement 3.2

- [x] 2. Modificar `RegisterBook.jsx` para persistir en Firestore
  - [x] 2.1 Importar `useAuth` desde `AuthProvider`, `doc`, `getDoc`, `updateDoc` desde `firebase/firestore`, y `db` desde `firebase.js`
  - [x] 2.2 Reemplazar la inicialización de `inputValue` con una función `loadBookIds`: si `localStorage` tiene IDs usarlos; si no, consultar Firestore y hidratar `localStorage`
  - [x] 2.3 Convertir `handleSave` en función `async` que guarda en `localStorage` Y llama a `updateDoc` en Firestore con `{ book_ids: inputValue }`; capturar errores de Firestore sin bloquear la UX
  - [x] 2.4 Eliminar el `useEffect` que sincroniza `localStorage` en cada cambio de `inputValue` (ahora el guardado es explícito al hacer click en "Agregar")
  - **Archivo**: `src/Components/ResgiterBook/RegisterBook.jsx`
  - **Criterios**: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.4

- [x] 3. Modificar `BookLog.jsx` para leer desde Firestore como fallback
  - [x] 3.1 Importar `useAuth`, `doc`, `getDoc`, `db`
  - [x] 3.2 Reemplazar la inicialización de `localBook` (que actualmente lee `localStorage` en el `useState` lazy) con un `useEffect` que: primero lee `localStorage`; si está vacío y hay usuario autenticado, consulta Firestore e hidrata `localStorage`; luego dispara la consulta a Google Books API con los IDs obtenidos
  - **Archivo**: `src/Components/BookLog/BookLog.jsx`
  - **Criterios**: Requirements 2.3, 2.4, 2.5, 2.6, 4.1, 4.2

- [x] 4. Verificar reglas de seguridad de Firestore
  - [x] 4.1 Confirmar que las reglas existentes en Firebase Console permiten `read` y `write` en `/users/{uid}` solo para el usuario autenticado con ese `uid` (las reglas ya existen según `docs/cloud-firestore.md`, solo verificar que estén activas)
  - **Criterio**: Requirement 3.1 (seguridad implícita)

- [x] 5. Pruebas manuales de integración
  - [x] 5.1 Probar flujo completo: login → buscar libro → seleccionar → "Agregar" → verificar en Firebase Console que `book_ids` se actualizó en `/users/{uid}`
  - [x] 5.2 Probar recuperación en nuevo dispositivo: limpiar `localStorage` → recargar → verificar que `BookLog` muestra los libros recuperados desde Firestore
  - [x] 5.3 Probar compatibilidad hacia atrás: usuario con documento sin campo `book_ids` → verificar que la app no lanza error y muestra biblioteca vacía
