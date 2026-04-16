# MegaBook - Documentación del Proyecto 📚

MegaBook es una aplicación avanzada de seguimiento de hábitos de lectura y productividad. Está diseñada con un enfoque científico en la formación de hábitos, utilizando técnicas de persistencia y gamificación a través de rachas (streaks) para asegurar que el usuario mantenga su constancia a largo plazo.

## Características Principales

### ⏱️ Gestión de Sesiones de Lectura

- **Temporizador Inteligente**: Un timer configurable que permite registrar sesiones de lectura enfocado (Deep Work).
- **Control de Metas**: El usuario puede definir objetivos de tiempo específicos para cada sesión.

### 📈 Sistema de Rachas Dinámico

- **Visualización Semanal**: Seguimiento intuitivo de los días completados mediante indicadores visuales.
- **Persistencia Infinita (Success Bridge)**: Algoritmo avanzado que permite que las rachas se mantengan a través de los cambios de semana, superando los límites del reset semanal.
- **Validación de Racha en Vivo**: Diferenciación entre el récord histórico y la racha actual activa para mantener la motivación.

### 📖 Integración con Google Books

- **Buscador de Libros**: Acceso directo a la API de Google Books para encontrar y registrar libros por título.
- **Biblioteca Personal**: Mapeo y visualización de una colección personalizada de libros con sus respectivas portadas.

### 🧘 Configuración de Hábitos (Habit Stacking)

- **Anclaje de Hábitos**: Sistema basado en la técnica de "Habit Stacking", permitiendo al usuario asociar la lectura con hábitos preexistentes (ej: "después de cepillarse").
- **Alarmas y Frecuencia**: Personalización de recordatorios y días de repetición del hábito.

### 🛡️ Arquitectura y Tecnología

- **Persistencia Atómica**: Uso de Lazy Initialization y sincronización robusta con `localStorage`.
- **Diseño Modular**: Lógica de negocio separada en utilidades y hooks personalizados para una alta mantenibilidad.
- **Reseteo Automático**: Sistema inteligente de detección de nueva semana que limpia el tablero de forma segura.

## Estructura de la Documentación

- [Sistema de Timer y Estado](./timer-system.md): Detalles sobre el Context Provider y la gestión de estados globales.
- [Lógica de Negocio y Utilidades](./logic-utils.md): Explicación de los algoritmos de rachas y manejo de fechas.
- [Persistencia y Hooks](./persistence.md): Cómo funciona el almacenamiento local y el custom hook `useLocalStorage`.
- [Componentes UI](./components-ui.md): Guía detallada de todos los componentes visuales de la aplicación.
- [Setup de Desarrollo](./setup-desarrollo.md): Guía para configurar el entorno de trabajo local.
- [Manual de Estilos y Diseño](./estilos-y-dise%C3%B1o.md): Definición de la identidad visual y componentes CSS.
- [Roadmap de Futuro](./roadmap-futuro.md): Próximas funcionalidades y visión del proyecto.

---
*Desarrollado con ❤️ para transformar la lectura en un hábito de por vida.*
