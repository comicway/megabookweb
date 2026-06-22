# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

## [Unreleased]

### Añadido
- **Arquitectura de Rachas (Streaks)**: Implementación de la lógica `calculateStreak` (`src/logic/streak.js`) estricta por fechas (`YYYY-MM-DD` a las `T00:00:00`).
- **Persistencia Firestore Avanzada**: Ahora se almacena `last_session_date` explícitamente en la colección del usuario para calcular el progreso sin depender de validadores visuales frágiles (como `wasSaturdaySuccessful`).
- **Notificaciones Web**: Refactorización a modularidad ESM del Firebase Admin SDK (`/api/workers/notifications.js`).

### Cambiado
- **Refactorización de `TimerProvider.jsx`**: Eliminada la antigua verificación de racha "infinita" en arreglos. Ahora usa matemática directa entre el timestamp actual y el anterior. Se añadió protección anti-desfasajes horarios.
- **Reseteo Visual de Semanas**: Se desvinculó de la variable `totalStreak`. El tablero de L-D se limpia por cambio de número de semana, pero la racha global no se pierde si la fecha actual cumple con la matemática.
- **Documentación Técnica**: Añadido `/docs/logica_fechas_rachas.md` para resguardar la lógica de negocio y proteger contra deuda técnica.

### Arreglado
- **Bug 500 en Vercel Serverless**: Solucionado el fallo al importar el SDK Admin de Firebase gracias al uso de sus submódulos (`firebase-admin/app` y `firebase-admin/firestore`).
- **Problema de Husos Horarios (Worker)**: Las horas y minutos de los Crons ahora se resuelven utilizando métodos estandarizados `getUTCHours()` y `getUTCMinutes()`, evitando desfases al hospedar en servidores extranjeros.
