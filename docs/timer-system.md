# Sistema de Timer y Estado ⏱️

El corazón de MegaBook es su sistema de gestión de estado centralizado, que coordina el tiempo, el progreso semanal y las rachas.

## Arquitectura Modular

El sistema del timer ha sido refactorizado en tres módulos independientes para mejorar la mantenibilidad:

| Archivo | Ubicación | Responsabilidad |
| :--- | :--- | :--- |
| `Timer.jsx` | `src/Components/Timer/` | UI, countdown loop, orquestación de estados. |
| `useTimerSound.js` | `src/hooks/` | Generación de sonido sintético (Web Audio API). |
| `useTimerNotification.js` | `src/hooks/` | Permisos y envío de notificaciones nativas (Notification API). |

`Timer.jsx` importa y consume ambos módulos:
```javascript
import { playBellSound } from '../../hooks/useTimerSound';
import useTimerNotification from '../../hooks/useTimerNotification';

// Dentro del componente:
const { showTimerNotification } = useTimerNotification();
```

---

## TimerProvider

El `TimerProvider` es el componente de contexto que envuelve la aplicación. Utiliza el patrón de **Context API** para proveer datos a cualquier nivel de la interfaz.

### Responsabilidades

1.  **Orquestación**: Coordina la lógica entre el tiempo completado y el marcado de días.
2.  **Detección de Reset**: Identifica si ha cambiado la semana para limpiar el tablero de checks.
3.  **Gestión de Rachas**: Calcula si la racha debe incrementarse o romperse cada vez que se completa una sesión.

## Flujo de Datos y Sincronización Multi-Dispositivo

1.  `Timer.jsx` actualiza `timerComplete` al finalizar.
    *   **Nota de Arquitectura:** El Timer utiliza un cálculo absoluto basado en la marca de tiempo (`Date.now() + duracion`) en lugar de restar un segundo a la vez con `setInterval`. Esto previene que el temporizador se congele o se desincronice cuando el navegador entra en modo ahorro de energía (background tab) en dispositivos móviles. Además, fuerza un formato de 2 dígitos visuales (`00:00`) mediante `.padStart(2, '0')`.
2.  `TimerProvider` detecta el cambio, marca el día en `days` y actualiza `totalStreak`.
3.  `useLocalStorage` actualiza los datos en caché local.
4.  **Sync en la Nube:** Simultáneamente, `TimerProvider` empaqueta el progreso (`days`, `timerComplete`, etc.) dentro del objeto `timer_state` y lo sube a Firestore. Al iniciar sesión en otro dispositivo, se descarga este estado para igualar el progreso.

## Estados Principales

| Estado | Tipo | Descripción |
| :--- | :--- | :--- |
| `countdownStarted` | `boolean` | Indica si el contador está corriendo actualmente. |
| `targetTime` | `number \| null` | Marca de tiempo absoluta (en ms) que representa el momento exacto en que termina el countdown. |
| `minutosTotales` | `number` | Minutos restantes visualizados en pantalla. |
| `segundosTotales` | `number` | Segundos restantes visualizados en pantalla. |

---

## Funcionalidades Implementadas

### 1. Countdown Anti-Congelamiento (`Date.now()`)

El timer no decrementa un valor de estado con `setInterval`. En su lugar, al presionar PLAY, se calcula y guarda un **timestamp absoluto** futuro:

```javascript
setTargetTime(Date.now() + totalSecondsLeft * 1000);
```

En cada tick del intervalo, se calcula el tiempo restante como la diferencia entre ese timestamp y el momento actual. Esto garantiza que, si el navegador suspende la ejecución (ahorro de batería, cambio de pestaña), el timer se resincronizará automáticamente al volver, sin desfases.

### 2. Formato Visual de Dos Dígitos (`padStart`)

Para cumplir el estándar visual `MM:SS`, se fuerza el formato de 2 dígitos usando el método nativo de JavaScript:

```javascript
{minutosTotales.toString().padStart(2, '0')}:{segundosTotales.toString().padStart(2, '0')}
```

Así, `5:3` se renderiza correctamente como `05:03`.

### 3. Opacidad Condicional del Botón Play

Para mejorar el feedback visual en móviles, el botón de PLAY aplica la clase `opacity-50` de Tailwind condicionalmente usando un template literal, basándose en el estado `countdownStarted`:

```jsx
className={`... ${countdownStarted ? 'opacity-50' : ''}`}
```

Cuando el temporizador está activo, el botón se atenúa visualmente indicando que ya fue activado. Al detenerse, recupera su opacidad completa.

### 4. Sonido de Campana (Web Audio API)

Al llegar a cero, la función `playBellSound()` (definida fuera del componente) genera un sonido sintético directamente en el navegador sin necesidad de archivos de audio externos.

```javascript
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const osc = ctx.createOscillator();
// Tono: La5 (880Hz) que desciende a La4 (440Hz) en 0.8s
osc.frequency.setValueAtTime(880, ctx.currentTime);
osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
// Fade-out del volumen en 1.2 segundos
gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
```

Incluye manejo de errores con `try/catch` para garantizar que el timer siga funcionando si la API no está disponible en algún navegador antiguo.

### 5. Notificación Nativa del Navegador (Notification API)

Simultáneamente al sonido, se dispara `showTimerNotification()`, que gestiona los permisos de forma asíncrona:

| Estado del permiso | Comportamiento |
|---|---|
| `'granted'` | Muestra la notificación del SO inmediatamente. |
| `'default'` | Abre el diálogo del navegador y notifica si el usuario acepta. |
| `'denied'` | No hace nada. Respeta la decisión del usuario. |

Además, existe un `useEffect` con array vacío `[]` que solicita el permiso de forma anticipada al montar el componente, evitando que el diálogo aparezca en el peor momento posible (justo cuando suena la alarma):

```javascript
useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}, []);
```

Las notificaciones aparecen a nivel de sistema operativo, funcionando incluso cuando el usuario está en otra pestaña o tiene el teléfono en reposo.

---
