# Lógica de Negocio y Utilidades 🧠

MegaBook separa la lógica compleja de los componentes visuales para facilitar las pruebas y el mantenimiento.

## Cálculo de Rachas (`streak.js`)

Implementa el algoritmo de **Búsqueda Inversa**.
- Permite "tolerancia" para el día de hoy: la racha no se rompe si hoy aún es `false`.
- Recorre desde hoy hacia atrás hasta encontrar el primer fallo.

## Utilidades de Fecha (`dateUtils.js`)

Centraliza las operaciones temporales para evitar inconsistencias:
- `getWeekNumber`: Calcula la semana del año para el reset automático.
- `getYesterdayInfo`: Maneja el "puente" entre semanas (ej: saber que ayer fue sábado si hoy es domingo).

## El Puente de Éxito (`wasSaturdaySuccessful`)

Para mantener rachas mayores a 7 días, el sistema guarda el estado del último sábado antes de resetear la semana. Esto permite que la racha sea "infinita".
