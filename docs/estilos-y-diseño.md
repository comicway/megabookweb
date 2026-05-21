# Manual de Estilos y Diseño 🎨

Este documento define la identidad visual de MegaBook para asegurar que la interfaz sea consistente y estética.

## Paleta de Colores (Nueva)
Hemos evolucionado a una paleta más profunda y profesional, optimizada para la lectura nocturna y el enfoque prolongado:

| Color | Código Hex | Variable CSS | Uso |
| :--- | :--- | :--- | :--- |
| **Fondo Principal** | `#1c1d1d` | `--color-background-a` | Fondo base de toda la aplicación. |
| **Fondo Paneles** | `#292d31` | `--color-background-b` | Fondo de tarjetas, modales y secciones. |
| **Acento Primario** | `#3e5c75` | `--color-primary` | Color de énfasis para acciones principales. |
| **Acento Secundario** | `#d39e44` | `--color-secundary` | Destacados, botones de acción y estados de éxito. |
| **Texto Principal** | `#E9E9E9` | `--color-white-a` | Títulos y párrafos de alta prioridad. |
| **Texto Secundario** | `#F5F5F5` | `--color-white-b` | Etiquetas y textos de menor jerarquía. |
| **Acento Oscuro** | `#2F2F30` | `--color-black-a` | Detalles de contraste y sombras. |

## Tipografía
- **Fuente Principal**: System UI, Avenir, Helvetica, Arial.
- **Fuentes Personalizadas**: Noto Sans Display (Black, Bold, Italic) cargadas vía Google Fonts.
- **Line-height**: `1.5` para asegurar legibilidad en textos largos.

## Fondos Interactivos 🌌

### Cuadrícula de Puntos Magnética (`Login.jsx`)
La pantalla de inicio cuenta con un sistema de partículas dinámicas implementado mediante **Canvas API** para maximizar el rendimiento.

- **Diseño**: Una cuadrícula ordenada de puntos de `1px` con una separación de `10px`.
- **Color de puntos**: `#808790` (Gris acero).
- **Interacción (Efecto Magneto)**: 
  - Los puntos detectan la posición del ratón en tiempo real.
  - Al entrar en un radio de `80px`, los puntos se desplazan sutilmente hacia el puntero.
  - Este efecto se logra calculando la distancia euclidiana y aplicando un factor de atracción asíncrono vía `requestAnimationFrame`.

## Componentes Visuales

### Botones
Existen dos estilos principales definidos en `index.css`:
- **Estándar**: Fondo oscuro con borde azul en hover.
- **Outline** (`.button-outline`): Sin fondo, borde blanco, ideal para acciones secundarias (Regresar, Agregar).
- **Google Auth**: Botón blanco con tipografía pesada para máxima visibilidad en el Login.

### Grid de Libros (`.book-card`)
- Las portadas mantienen una relación de aspecto de **1.46** (estándar de libros).
- Utilizan `position: absolute` dentro de un contenedor con padding inferior porcentual para ser totalmente responsivas.

## Tecnologías de Estilo
- **TailwindCSS**: Para maquetación rápida y layout.
- **Vanilla CSS**: Para componentes personalizados, variables globales (`:root`) y animaciones en `index.css`.
- **Canvas API**: Para efectos de fondo complejos y reactivos al mouse.
