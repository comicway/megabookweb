# Persistencia y Hooks 💾

MegaBook garantiza que el usuario nunca pierda su progreso ni su biblioteca mediante un sistema de persistencia híbrido: `localStorage` como caché local para respuesta inmediata, y **Firebase Firestore** como fuente de verdad en la nube.

## Estrategia de Persistencia Híbrida (Rachas)

Para la lógica de rachas y timers (`TimerProvider`), se usa un patrón que prioriza el funcionamiento offline:

1. **Lectura:** primero se intenta `localStorage`; si está vacío y hay usuario autenticado, se consulta Firestore y se hidrata `localStorage`.
2. **Escritura:** siempre se guarda en `localStorage` primero (síncrono); luego, si hay usuario autenticado, se sincroniza con Firestore de forma asíncrona.
3. **Sin usuario autenticado:** solo se usa `localStorage`.

## Estrategia Cloud-First (Biblioteca)

Para la biblioteca del usuario (`RegisterBook` y `BookLog`), **Firestore es la única fuente de verdad**:

- Se lee y escribe directamente en la nube, ignorando el `localStorage`.
- Esto garantiza que si el usuario limpia el navegador o cambia de dispositivo, no pierda su lista de libros, protegiendo así la retención (OMTM).

---

## Hook `useLocalStorage`

Es un Custom Hook diseñado para actuar como un reemplazo directo de `useState` pero con guardado automático.

### Ventajas

- **Transparencia**: El componente que lo usa no tiene que preocuparse por `localStorage.setItem`.
- **Atomicidad**: Maneja correctamente el parsing de JSON y errores de carga.
- **Sincronización**: Se actualiza automáticamente cada vez que el estado cambia.

---

## Almacenamiento Local (Keys)

| Key | Descripción | Sincronizado con Firestore |
| :--- | :--- | :--- |
| `timerKey` | Total de timers completados. | No |
| `lastTimerKey` | Punto de control para evitar dobles checks. | No |
| `daysFalses` | Estado de los 7 círculos de la semana. | No |
| `totalStreak` | Número de racha acumulada. | Sí (`total_streak`) |
| `LastWeek` | Número de la última semana procesada. | No |
| `wasSaturdaySuccessful` | Memoria para el puente de racha entre semanas. | No |