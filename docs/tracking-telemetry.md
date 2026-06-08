# Sistema de Telemetría de Clics 📊

MegaBook implementa un motor de telemetría frontend que registra el comportamiento del usuario (qué elementos clickea y cuánto tiempo tarda entre interacciones) directamente en Firebase Firestore, sin depender de servicios externos.

---

## ¿Para qué sirve?

Permite medir la **eficacia del flujo de la aplicación**: si un usuario tarda 30 segundos entre presionar "Comenzar a leer" y presionar "PLAY" en el timer, eso indica fricción. Si tarda 2 segundos, el flujo es fluido.

Esta data alimenta directamente la OMTM (métrica de retención de 66 días).

---

## Arquitectura

### `src/hooks/useTracking.js`

Custom Hook que:
1. Se inicializa globalmente en `App.jsx` y escucha **todos los clics del documento** usando la fase de captura (`addEventListener(..., true)`).
2. **Filtra** clics: solo procesa elementos que tengan el atributo `data-tracking-id`. El resto son ignorados.
3. Calcula el **delta de tiempo** (ms) entre el clic actual y el anterior.
4. Construye un payload y lo persiste en Firestore bajo la subcolección `users/{uid}/telemetry`.

```javascript
// Inicialización global (App.jsx)
function AppContent() {
  useTracking(); // ← Una sola línea activa todo el sistema
  ...
}
```

---

## Esquema del Payload

Cada documento guardado en `/users/{uid}/telemetry/{docId}` tiene esta estructura:

```json
{
  "userId": "abc123uid",
  "elementId": "Timer-BtnPlay-Click",
  "previousElementId": "ReadBook-BtnStartTimer-Click",
  "timeElapsedMs": 4350,
  "timestamp": "2026-06-01T22:03:45.123Z"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `userId` | `string` | UID del usuario autenticado en Firebase Auth |
| `elementId` | `string` | ID del elemento clickeado (`[Comp]-[Elem]-[Accion]`) |
| `previousElementId` | `string \| null` | ID del último elemento clickeado antes |
| `timeElapsedMs` | `number` | Tiempo en ms entre este clic y el anterior |
| `timestamp` | `string` | ISO 8601 del momento exacto del clic |

---

## Elementos Etiquetados (data-tracking-id)

Solo los elementos del flujo crítico de la app están instrumentados:

| Componente | Elemento | ID de Tracking |
|---|---|---|
| `Login.jsx` | Botón "Entrar con Google" | `Login-BtnGoogle-Click` |
| `ToolBar.jsx` | Botón Home | `ToolBar-BtnHome-Click` |
| `ToolBar.jsx` | Botón Agregar Libro | `ToolBar-BtnAddBook-Click` |
| `ToolBar.jsx` | Botón Hábito | `ToolBar-BtnHabit-Click` |
| `ConfigBook.jsx` | Botón "Comenzar a leer" | `Home-BtnStartReading-Click` |
| `ReadBook.jsx` | Input de tiempo de sesión | `ReadBook-InputTime-Click` |
| `ReadBook.jsx` | Botón "Registrar tiempo" | `ReadBook-BtnSaveTime-Click` |
| `ReadBook.jsx` | Botón "Empezar a leer" | `ReadBook-BtnStartTimer-Click` |
| `Timer.jsx` | Botón PLAY | `Timer-BtnPlay-Click` |
| `Timer.jsx` | Botón STOP | `Timer-BtnStop-Click` |
| `RegisterBook.jsx` | Icono de búsqueda | `RegisterBook-BtnSearchIcon-Click` |
| `RegisterBook.jsx` | Botón "Buscar libro" | `RegisterBook-BtnSearchFull-Click` |
| `RegisterBook.jsx` | Checkbox de selección de libro | `RegisterBook-CheckBook-Click` |
| `RegisterBook.jsx` | Botón "Agregar" | `RegisterBook-BtnSave-Click` |
| `ConfigHabit.jsx` | Select de hábito previo | `ConfigHabit-SelectHabitPre-Click` |
| `ConfigHabit.jsx` | Input de hora de alarma | `ConfigHabit-InputTime-Click` |
| `ConfigHabit.jsx` | Select de frecuencia | `ConfigHabit-SelectRepeat-Click` |
| `ConfigHabit.jsx` | Botón "Guardar" | `ConfigHabit-BtnSave-Click` |
| `ConfigHabit.jsx` | Botón "Regresar" | `ConfigHabit-BtnReturn-Click` |

### Convención de Nombres
```
[NombreComponente]-[TipoElemento]-[Accion]
     ↑                  ↑             ↑
  PascalCase         PascalCase    Click / Submit / Change
```

---

## Reglas de Seguridad (Firestore)

La subcolección `telemetry` requiere su propia regla ya que Firestore **no hereda permisos automáticamente** a subcolecciones:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      // Subcolección de telemetría (solo el dueño puede escribir)
      match /telemetry/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

> ⚠️ Sin esta regla, los eventos de telemetría son **rechazados silenciosamente** por Firestore aunque el código sea correcto.

---

## Cómo ver la data en Firebase Console

1. Entra a [console.firebase.google.com](https://console.firebase.google.com).
2. Selecciona tu proyecto MegaBook.
3. Ve a **Firestore Database → Colección `users`**.
4. Abre el documento de un usuario → verás la subcolección **`telemetry`**.
5. Cada documento ahí es un clic registrado con su delta de tiempo.

### Flujos de interés para el OMTM

| Flujo | Elementos a comparar | Métrica |
|---|---|---|
| Onboarding | `Login-BtnGoogle-Click` → `Home-BtnStartReading-Click` | Tiempo hasta primera sesión |
| Inicio de sesión | `Home-BtnStartReading-Click` → `Timer-BtnPlay-Click` | Fricción en el setup |
| Completar sesión | `Timer-BtnPlay-Click` → `Timer-BtnStop-Click` | Duración real de sesión |
| Configurar biblioteca | `ToolBar-BtnAddBook-Click` → `RegisterBook-BtnSave-Click` | Tiempo de selección de libro |

---

## Consideraciones de Privacidad

- Se registran solo **acciones** (qué botón), nunca contenido escrito por el usuario.
- Cada documento está aislado bajo el UID del usuario — nadie puede leer datos ajenos.
- Los datos se pueden eliminar borrando la subcolección `telemetry` del usuario desde Firebase Console.
