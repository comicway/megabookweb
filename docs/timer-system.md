# Sistema de Timer y Estado ⏱️

El corazón de MegaBook es su sistema de gestión de estado centralizado, que coordina el tiempo, el progreso semanal y las rachas.

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

- `timerComplete`: Número acumulado de timers terminados.
- `days`: Objeto con el estado (true/false) de cada día de la semana actual.
- `totalStreak`: Contador de racha infinita acumulada.
- `liveStreak`: Racha calculada en tiempo real para la visualización del usuario.
