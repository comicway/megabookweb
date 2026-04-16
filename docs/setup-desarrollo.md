# Guía de Setup de Desarrollo 🚀

Sigue estos pasos para configurar el entorno de desarrollo de MegaBook en tu máquina local.

## Requisitos Previos
- **Node.js**: Versión 18 o superior.
- **npm**: Gestor de paquetes oficial de Node.js.

## Pasos para la Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/megabook.git
    cd megabook
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la raíz (opcional por ahora, ya que la API Key está en el código, pero se recomienda moverla):
    ```env
    VITE_GOOGLE_BOOKS_API_KEY=tu_api_key_aqui
    ```

4.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## Scripts Disponibles
- `npm run dev`: Inicia el servidor de desarrollo con Vite.
- `npm run build`: Genera la versión optimizada para producción.
- `npm run preview`: Sirve localmente la versión de producción.

## Pruebas (Vitest)
MegaBook utiliza Vitest para asegurar que la lógica de rachas y timers funcione correctamente.
```bash
npm test
```
