# Sistema de Timer y Estado ⏱️

El corazón de MegaBook es su sistema de gestión de estado centralizado, que coordina el tiempo, el progreso semanal y las rachas.

## TimerProvider

El `TimerProvider` es el componente de contexto que envuelve la aplicación. Utiliza el patrón de **Context API** para proveer datos a cualquier nivel de la interfaz.

### Responsabilidades

1.  **Orquestación**: Coordina la lógica entre el tiempo completado y el marcado de días.
2.  **Detección de Reset**: Identifica si ha cambiado la semana para limpiar el tablero de checks.
3.  **Gestión de Rachas**: Calcula si la racha debe incrementarse o romperse cada vez que se completa una sesión.

## Flujo de Datos

1.  `Timer.jsx` actualiza `timerComplete` al finalizar.
2.  `TimerProvider` detecta el cambio, marca el día en `days` y actualiza `totalStreak`.
3.  `useLocalStorage` sincroniza automáticamente todos los cambios con el disco.

## Estados Principales

- `timerComplete`: Número acumulado de timers terminados.
- `days`: Objeto con el estado (true/false) de cada día de la semana actual.
- `totalStreak`: Contador de racha infinita acumulada.
- `liveStreak`: Racha calculada en tiempo real para la visualización del usuario.
