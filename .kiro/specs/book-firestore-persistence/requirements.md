# Requirements: book-firestore-persistence

## Introduction

Este documento define los requisitos funcionales y no funcionales para persistir la biblioteca de libros del usuario en Firebase Firestore, complementando el `localStorage` existente. El objetivo es que los usuarios no pierdan su biblioteca al cambiar de dispositivo o limpiar el navegador, impactando directamente la retención (OMTM: 100 usuarios activos por 66 días).

---

## Requirements

### Requirement 1: Guardar biblioteca en Firestore al confirmar selección

**User Story:** Como usuario autenticado, quiero que mis libros seleccionados se guarden en la nube cuando hago click en "Agregar", para no perder mi biblioteca si cambio de dispositivo.

#### Acceptance Criteria

1. WHEN el usuario hace click en "Agregar" con al menos un libro seleccionado AND el usuario está autenticado THEN el sistema SHALL ejecutar `updateDoc` en `/users/{uid}` con el campo `book_ids` igual al array de IDs seleccionados.

2. WHEN el usuario hace click en "Agregar" con al menos un libro seleccionado THEN el sistema SHALL guardar los IDs en `localStorage` bajo la key `miConfiguracionRadio` (comportamiento existente, sin cambios).

3. WHEN Firestore devuelve un error al guardar THEN el sistema SHALL loguear el error en consola Y mostrar igualmente el mensaje "Agregado correctamente" (ya que `localStorage` fue guardado exitosamente).

4. WHEN el usuario hace click en "Agregar" sin ningún libro seleccionado THEN el sistema SHALL mostrar el mensaje "Por favor, selecciona un libro" sin llamar a Firestore.

5. WHEN el usuario no está autenticado (`user === null`) THEN el sistema SHALL guardar únicamente en `localStorage` sin intentar ninguna operación con Firestore.

---

### Requirement 2: Cargar biblioteca desde Firestore en nuevo dispositivo

**User Story:** Como usuario autenticado, quiero que mi biblioteca se recupere automáticamente desde la nube cuando abro la app en un dispositivo nuevo o después de limpiar el navegador.

#### Acceptance Criteria

1. WHEN el componente `RegisterBook` monta AND `localStorage` está vacío o no tiene IDs AND el usuario está autenticado THEN el sistema SHALL consultar `getDoc` en `/users/{uid}` y cargar el campo `book_ids` en el estado local.

2. WHEN se recuperan IDs desde Firestore THEN el sistema SHALL hidratar `localStorage` con esos IDs para que las siguientes lecturas sean locales.

3. WHEN el componente `BookLog` monta AND `localStorage` está vacío AND el usuario está autenticado THEN el sistema SHALL consultar Firestore y cargar los IDs para mostrar la biblioteca.

4. WHEN `localStorage` ya tiene IDs al montar el componente THEN el sistema SHALL usar esos IDs directamente sin consultar Firestore.

5. WHEN Firestore no está disponible o devuelve error al cargar THEN el sistema SHALL inicializar la biblioteca como array vacío sin lanzar excepción al componente.

6. WHEN el documento del usuario en Firestore no tiene el campo `book_ids` (usuario creado antes de este feature) THEN el sistema SHALL tratar el valor como array vacío `[]`.

---

### Requirement 3: Estructura de datos en Firestore

**User Story:** Como desarrollador, quiero que los IDs de libros se almacenen en el documento existente del usuario en Firestore, para mantener una estructura de datos coherente y simple.

#### Acceptance Criteria

1. WHEN se guarda la biblioteca THEN el sistema SHALL almacenar los IDs como el campo `book_ids: string[]` dentro del documento existente `/users/{uid}`.

2. WHEN se crea un nuevo usuario en Firestore (en `AuthProvider`) THEN el sistema SHALL incluir el campo `book_ids: []` en el documento inicial.

3. WHEN se actualiza `book_ids` THEN el sistema SHALL usar `updateDoc` (no `setDoc`) para no sobreescribir los campos existentes del usuario (`total_streak`, `max_streak`, etc.).

---

### Requirement 4: Compatibilidad con usuarios no autenticados

**User Story:** Como usuario no autenticado, quiero que la app siga funcionando con `localStorage` como antes, para que no haya regresiones en el comportamiento actual.

#### Acceptance Criteria

1. WHEN el usuario no está autenticado THEN el sistema SHALL leer y escribir la biblioteca únicamente desde/hacia `localStorage`, sin ningún cambio en el comportamiento actual.

2. WHEN el usuario no está autenticado THEN el sistema SHALL NO llamar a ninguna función de Firestore (`getDoc`, `updateDoc`).

---

### Requirement 5: Feedback visual al usuario

**User Story:** Como usuario, quiero recibir confirmación visual cuando mi biblioteca se guarda, para saber que mis cambios fueron persistidos.

#### Acceptance Criteria

1. WHEN la operación de guardado completa exitosamente (localStorage + Firestore) THEN el sistema SHALL mostrar el mensaje "Agregado correctamente" durante 3 segundos.

2. WHEN Firestore falla pero `localStorage` se guardó THEN el sistema SHALL mostrar igualmente "Agregado correctamente" (la experiencia del usuario no se degrada por errores de red).

3. WHEN el usuario intenta guardar sin seleccionar libros THEN el sistema SHALL mostrar "Por favor, selecciona un libro" durante 3 segundos.
