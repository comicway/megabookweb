# Componentes UI 🎨

Los componentes de MegaBook están diseñados para ser modulares y consumir datos directamente del Contexto.

## `DailyStreak.jsx`

Visualiza el progreso semanal y la racha actual.

- Muestra el número total de **Timers** y los **Días** de racha acumulados.
- Renderiza 7 indicadores visuales (D, L, M, M, J, V, S) que se marcan al completar el objetivo diario.
- Utiliza `liveStreak` para asegurar que el usuario vea la información real de su constancia en tiempo real.

## `Timer.jsx`

El motor de actividad principal de la aplicación.

- Permite iniciar y detener sesiones de lectura enfocada.
- Al finalizar el tiempo, dispara automáticamente la actualización del estado global a través de `TimerContext`.

## `BookLog.jsx`

Biblioteca personal y visualización de progreso.

- Se conecta a la **API de Google Books** para recuperar información detallada de los libros (portadas, títulos).
- Mapea y muestra los libros guardados en el almacenamiento local (`miConfiguracionRadio`).
- Presenta una cuadrícula intuitiva con las carátulas encontradas.

## `ConfigBook.jsx`

Panel de control y navegación.

- Contiene los botones principales de interacción: "Leer" y "Configurar".
- Actúa como punto de entrada para iniciar la sesión de lectura o ajustar la biblioteca.

## `RegisterBook.jsx`

Gestor de registros y búsqueda de libros.

- Implementa un formulario de búsqueda (usando **Formik**) conectado directamente a Google Books.
- Muestra los resultados de búsqueda con sus respectivas portadas.
- Incluye un sistema de selección mediante checkboxes que permite al usuario agregar múltiples libros a su colección de forma rápida.

## `ReadBook.jsx`

Planificador de objetivos de sesión.

- Permite al usuario definir cuántos minutos desea dedicar a la lectura.
- Gestiona la entrada de datos a través de un formulario validado, guardando la preferencia en `localStorage` (`timeFormData`).

## `ConfigHabit.jsx`

Constructor de hábitos basado en "Habit Stacking".

- Configura el hábito de lectura mediante preguntas simples sobre la rutina diaria.
- Permite seleccionar un "hábito ancla" (ej: "después de cepillarse") para fortalecer la formación del nuevo hábito.
- Gestiona la configuración de alarmas y frecuencias (diaria, semanal, etc.) guardándolas en `habitData`.

## `App.jsx`

Componente raíz de la aplicación.

- Orquestra la estructura visual global.
- Envuelve todos los componentes en el `TimerProvider`, garantizando el acceso al estado compartido.
