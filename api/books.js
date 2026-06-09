export default async function handler(req, res) {
  const { q, id } = req.query;
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured in Vercel' });
  }

  let apiUrl = '';
  if (id) {
    apiUrl = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}?key=${apiKey}`;
  } else if (q) {
    apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${apiKey}`;
  } else {
    return res.status(400).json({ error: 'Missing parameter "q" or "id"' });
  }

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Google API responded with ${response.status}`);
    }
    
    const data = await response.json();

    // Estrategia Costo-Cero: Caché en el Edge de Vercel por 24h (86400s)
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from Google Books API' });
  }
}
