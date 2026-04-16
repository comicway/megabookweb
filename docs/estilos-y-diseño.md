# Manual de Estilos y Diseño 🎨

Este documento define la identidad visual de MegaBook para asegurar que la interfaz sea consistente y estética.

## Paleta de Colores
Utilizamos un esquema de colores oscuros con acentos vibrantes para mejorar la concentración:

| Color | Código Hex | Uso |
| :--- | :--- | :--- |
| **Fondo Principal** | `#242424` | Fondo de la aplicación. |
| **Fondo Tarjetas** | `#1a1a1a` | Fondo de componentes (Timer, Racha, Libros). |
| **Texto Principal** | `rgba(255, 255, 255, 0.87)` | Texto de lectura y encabezados. |
| **Borde / Hover** | `#646cff` | Color de énfasis y estados interactivos. |
| **Alerta / Error** | `#BF3A0A` | Mensajes de validación y errores de Formik. |

## Tipografía
- **Fuente Principal**: System UI, Avenir, Helvetica, Arial.
- **Line-height**: `1.5` para asegurar legibilidad en textos largos.

## Componentes Visuales

### Botones
Existen dos estilos principales definidos en `index.css`:
- **Estándar**: Fondo oscuro con borde azul en hover.
- **Outline** (`.button-outline`): Sin fondo, borde blanco, ideal para acciones secundarias (Regresar, Agregar).

### Grid de Libros (`.book-card`)
- Las portadas mantienen una relación de aspecto de **1.46** (estándar de libros).
- Utilizan `position: absolute` dentro de un contenedor con padding inferior porcentual para ser totalmente responsivas.

## Tecnologías de Estilo
- **TailwindCSS**: Para maquetación rápida y layout.
- **Vanilla CSS**: Para componentes personalizados y animaciones en `index.css`.
