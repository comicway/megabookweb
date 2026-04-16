# Persistencia y Hooks 💾

MegaBook garantiza que el usuario nunca pierda su progreso mediante un sistema de persistencia robusto.

## Hook `useLocalStorage`

Es un Custom Hook diseñado para actuar como un reemplazo directo de `useState` pero con guardado automático.

### Ventajas

- **Transparencia**: El componente que lo usa no tiene que preocuparse por `localStorage.setItem`.
- **Atomicidad**: Maneja correctamente el parsing de JSON y errores de carga.
- **Sincronización**: Se actualiza automáticamente cada vez que el estado cambia.

## Almacenamiento Local (Keys)
| Key | Descripción |
| :--- | :--- |
| `timerKey` | Total de timers completados. |
| `lastTimerKey` | Punto de control para evitar dobles checks. |
| `daysFalses` | Estado de los 7 círculos de la semana. |
| `totalStreak` | Número de racha acumulada. |
| `LastWeek` | Número de la última semana procesada. |
| `wasSaturdaySuccessful` | Memoria para el puente de racha entre semanas. |