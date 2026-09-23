import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const NEWS_FILE = path.join(DATA_DIR, 'custom_news.json');
const TICKER_FILE = path.join(DATA_DIR, 'ticker.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial mock custom news if file doesn't exist
const initialCustomNews = [
  {
    id: 'mello-init-1',
    title: 'Peluncuran Resmi Portal Media Mello TV News Terpercaya Berbasis Multimedia',
    category: 'Mello TV Live',
    snippet: 'Mello TV News secara resmi meluncurkan portal media terpadu menghadirkan berita terkini, siaran live stream, serta integrasi media sosial.',
    content: 'Mello TV News kini hadir dengan tampilan portal media terbaru yang menghubungkan pembaca secara langsung dengan website resmi mellotvnews.com dan jaringan media sosial Facebook, Instagram, TikTok, serta YouTube.\n\nDengan komitmen menyajikan informasi akurat, berimbang, dan terpercaya, Mello TV News siap menjadi rujukan berita terdepan bagi seluruh masyarakat Indonesia.\n\nSaksikan terus siaran langsung dan ikuti berita terbaru kami di portal Mello TV News - Portal Media Terpercaya.',
    author: 'Redaksi Mello TV News',
    date: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=mellotv-news',
    isBreaking: true,
    isFeatured: true,
    source: 'Redaksi',
    url: 'https://mellotvnews.com'
  },
  {
    id: 'mello-init-2',
    title: 'Update Berita Terkini: Pertumbuhan Ekonomi Digital Indonesia Capai Rekor Baru',
    category: 'Ekonomi',
    snippet: 'Sektor teknologi dan transformasi digital terus mendorong akselerasi ekonomi nasional di berbagai daerah.',
    content: 'Pertumbuhan ekonomi digital Indonesia mencatatkan perkembangan signifikan tahun ini. Berbagai inovasi di bidang portal informasi, e-commerce, dan penyiaran digital meningkatkan partisipasi publik dalam ekosistem digital.\n\nTim analis Mello TV News mencatat adanya lonjakan minat masyarakat terhadap konsumsi berita digital berkualitas tinggi yang terverifikasi.',
    author: 'Tim Ekonomi Mello TV',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    isBreaking: false,
    isFeatured: true,
    source: 'Redaksi',
    url: 'https://mellotvnews.com'
  },
  {
    id: 'mello-init-3',
    title: 'Pemerintah Dorong Pemerataan Infrastruktur Penyiaran Berita Digital di Seluruh Daerah',
    category: 'Nasional',
    snippet: 'Program digitalisasi media publik memastikan akses informasi merata hingga pelosok negeri.',
    content: 'Pemerintah terus memperkuat infrastruktur jaringan dan akses internet guna mendukung penyiaran berita digital di seluruh pelosok Nusantara. Hal ini dinilai penting untuk memberantas disinformasi dan memperkuat literasi digital masyarakat.',
    author: 'Tim Nasional Mello TV',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    isBreaking: false,
    isFeatured: false,
    source: 'Redaksi',
    url: 'https://mellotvnews.com'
  }
];

const initialTicker = [
  'SELAMAT DATANG SAHABAT MELLO TV NEWS - PORTAL MEDIA TERPERCAYA',
  'Ikuti Akun Resmi Kami di Facebook @mellotvnews, Instagram @mellotvnews, TikTok @mellotvnews & YouTube @mellotv-news',
  'Mello TV News Menghadirkan Berita Terkini, Akurat & Terpercaya Langsung dari mellotvnews.com'
];

function getStoredNews() {
  if (!fs.existsSync(NEWS_FILE)) {
    fs.writeFileSync(NEWS_FILE, JSON.stringify(initialCustomNews, null, 2));
    return initialCustomNews;
  }
  try {
    const data = fs.readFileSync(NEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return initialCustomNews;
  }
}

function saveStoredNews(news: any[]) {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2));
}

function getStoredTicker() {
  if (!fs.existsSync(TICKER_FILE)) {
    fs.writeFileSync(TICKER_FILE, JSON.stringify(initialTicker, null, 2));
    return initialTicker;
  }
  try {
    const data = fs.readFileSync(TICKER_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return initialTicker;
  }
}

function saveStoredTicker(ticker: string[]) {
  fs.writeFileSync(TICKER_FILE, JSON.stringify(ticker, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/news', (req, res) => {
    const news = getStoredNews();
    res.json(news);
  });

  app.post('/api/news', (req, res) => {
    const { title, category, snippet, content, author, imageUrl, videoUrl, isBreaking, isFeatured, source, url } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi berita wajib diisi.' });
    }

    const newsList = getStoredNews();
    const newArticle = {
      id: 'news-' + Date.now(),
      title,
      category: category || 'Umum',
      snippet: snippet || content.substring(0, 150) + '...',
      content,
      author: author || 'Admin Mello TV',
      date: new Date().toISOString(),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
      videoUrl: videoUrl || '',
      isBreaking: !!isBreaking,
      isFeatured: !!isFeatured,
      source: source || 'Admin',
      url: url || 'https://mellotvnews.com'
    };

    newsList.unshift(newArticle);
    saveStoredNews(newsList);

    // If it's breaking news, automatically add to ticker
    if (isBreaking) {
      const tickers = getStoredTicker();
      tickers.unshift(`BREAKING NEWS: ${title}`);
      saveStoredTicker(tickers.slice(0, 10));
    }

    res.status(201).json(newArticle);
  });

  app.put('/api/news/:id', (req, res) => {
    const { id } = req.params;
    const newsList = getStoredNews();
    const index = newsList.findIndex((n: any) => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }

    newsList[index] = {
      ...newsList[index],
      ...req.body,
      date: req.body.date || newsList[index].date
    };

    saveStoredNews(newsList);
    res.json(newsList[index]);
  });

  app.delete('/api/news/:id', (req, res) => {
    const { id } = req.params;
    let newsList = getStoredNews();
    newsList = newsList.filter((n: any) => n.id !== id);
    saveStoredNews(newsList);
    res.json({ success: true, message: 'Berita berhasil dihapus' });
  });

  // Ticker endpoints
  app.get('/api/ticker', (req, res) => {
    res.json(getStoredTicker());
  });

  app.post('/api/ticker', (req, res) => {
    const { tickerList } = req.body;
    if (Array.isArray(tickerList)) {
      saveStoredTicker(tickerList);
      return res.json({ success: true, tickerList });
    }
    res.status(400).json({ error: 'Format tickerList tidak valid' });
  });

  // Fetch live website posts from mellotvnews.com or fallback
  app.get('/api/website-news', async (req, res) => {
    try {
      // Try fetching from WordPress REST API of mellotvnews.com
      const wpResponse = await fetch('https://mellotvnews.com/wp-json/wp/v2/posts?_embed&per_page=12', {
        headers: { 'User-Agent': 'MelloTVNewsPortal/1.0' },
        signal: AbortSignal.timeout(4000)
      }).catch(() => null);

      if (wpResponse && wpResponse.ok) {
        const posts = await wpResponse.json();
        const formatted = posts.map((post: any) => {
          const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
          return {
            id: 'wp-' + post.id,
            title: post.title?.rendered || 'Berita Mello TV News',
            category: 'Website mellotvnews.com',
            snippet: post.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '',
            content: post.content?.rendered || post.excerpt?.rendered || '',
            author: 'Redaksi mellotvnews.com',
            date: post.date || new Date().toISOString(),
            imageUrl: featuredMedia || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
            source: 'mellotvnews.com',
            url: post.link || 'https://mellotvnews.com'
          };
        });
        return res.json(formatted);
      }
    } catch (e) {
      console.log('WP REST API fetch info:', e);
    }

    // Fallback live feed representation from mellotvnews.com
    res.json([
      {
        id: 'web-1',
        title: 'Berita Utama mellotvnews.com: Update Terkini Seputar Politik dan Olahraga Nasional',
        category: 'mellotvnews.com',
        snippet: 'Sajian berita terbaru yang dihimpun langsung dari portal resmi mellotvnews.com untuk seluruh pembaca setia Mello TV.',
        content: 'Portal berita mellotvnews.com menyajikan berbagai liputan eksklusif mengenai isu nasional, hukum, olahraga, dan hiburan terkini.',
        author: 'Redaksi mellotvnews.com',
        date: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        source: 'mellotvnews.com',
        url: 'https://mellotvnews.com'
      },
      {
        id: 'web-2',
        title: 'Program Unggulan Mello TV Live Video: Bincang Tokoh dan Kabar Daerah',
        category: 'Mello TV Live',
        snippet: 'Simak tayangan siaran langsung Mello TV News setiap hari hanya di YouTube @mellotv-news dan mellotvnews.com.',
        content: 'Program bincang-bincang interaktif Mello TV News membahas isu-isu krusial secara mendalam bersama narasumber terpercaya.',
        author: 'Tim Live Mello TV',
        date: new Date(Date.now() - 3600000 * 3).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
        videoUrl: 'https://www.youtube.com/embed/live_stream?channel=mellotv-news',
        source: 'mellotvnews.com',
        url: 'https://mellotvnews.com'
      }
    ]);
  });

  // Vite development server setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mello TV News server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
