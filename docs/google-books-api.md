# Optimización de la API de Google Books 📖

Para escalar la funcionalidad de búsqueda de libros y evitar el bloqueo por **Rate Limiting** (límite de peticiones gratuitas) de Google, la aplicación implementa una arquitectura basada en **Vercel Serverless Functions** acoplada con una estrategia agresiva de **Edge Caching**.

Además, incorpora **Graceful Degradation** en el Frontend para manejar picos de tráfico con elegancia sin mostrar errores crudos al usuario.

---

## 1. El Backend Proxy (`api/books.js`)

Se eliminaron las llamadas directas desde React a la API de Google. Ahora, los componentes (`RegisterBook.jsx`, `BookLog.jsx`) apuntan al endpoint local `/api/books`.

### ¿Por qué usar un Proxy?
1. **Seguridad**: Oculta la clave secreta `GOOGLE_BOOKS_API_KEY`, moviéndola a las Variables de Entorno de Vercel (`process.env`).
2. **Control**: Permite inyectar cabeceras personalizadas de caché antes de devolver los datos al cliente.

---

## 2. Estrategia de Caché "Costo-Cero" (Vercel Edge)

Para evitar agotar la cuota de Google, la función serverless intercepta las peticiones y almacena las respuestas en los nodos perimetrales de Vercel.

**Cabecera configurada en el servidor:**
```javascript
res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
```

### ¿Cómo funciona en un escenario de tráfico masivo?
- **Cache Hit (10,000 usuarios buscan "Harry Potter" a la vez)**:
  - La *primera* petición llega a Google Books y tarda ~200ms.
  - Vercel guarda la respuesta en caché durante 24 horas (`s-maxage=86400`).
  - Las siguientes 9,999 peticiones se sirven **instantáneamente** desde el Edge de Vercel sin tocar los servidores de Google.
- **Ventaja**: Permite tráfico infinito para libros populares sin costar cuota.

---

## 3. Manejo de Errores Frontend (Graceful Degradation)

A pesar de la caché, un volumen masivo de búsquedas **diferentes** (Cache Miss masivo) eventualmente agotará la cuota de Google, resultando en un error HTTP `429 Too Many Requests`.

Para prevenir que la aplicación colapse o muestre pantallas blancas, los componentes interceptan activamente estos errores:

```javascript
const response = await fetch(apiUrl);
if (!response.ok) {
    if (response.status === 429 || response.status >= 500) {
        throw new Error('SERVER_BUSY');
    }
    throw new Error('HTTP Error');
}
```

### Respuesta en la Interfaz de Usuario (UI)
Cuando se dispara `SERVER_BUSY`, React detiene el indicador de carga (`setLoading(false)`) y reemplaza de forma amigable la lista de libros por un mensaje diseñado a medida:
> *"Servidor ocupado. Por favor, intenta de nuevo en unos momentos."*

Incluye además un botón de **Reintento** que reinicia el estado y permite una nueva búsqueda sin necesidad de recargar toda la página.

---

## 4. Configuración para Desarrollo Local

Dado que la URL `/api/books` es un entorno exclusivo de Vercel, ejecutar `npm run dev` (Vite puro) devolverá errores 404 al intentar buscar libros.

Para simular el backend en local:
1. Instala el CLI de Vercel: `npm i -g vercel`.
2. Asocia tu proyecto local: `vercel link`.
3. Inicia el servidor de desarrollo completo: `vercel dev`.
4. Asegúrate de tener un archivo `.env` local con `GOOGLE_BOOKS_API_KEY=tu_clave_aqui`.
