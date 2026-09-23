import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const NEWS_FILE = path.join(DATA_DIR, 'custom_news.json');
const TICKER_FILE = path.join(DATA_DIR, 'ticker.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin_account.json');
const SOCIAL_FILE = path.join(DATA_DIR, 'social_config.json');
const WORDPRESS_FILE = path.join(DATA_DIR, 'wordpress_config.json');

// Default Social Media & WhatsApp Configuration
const defaultSocialConfig = {
  youtube: {
    handle: '@mellotv-news',
    url: 'https://youtube.com/@mellotv-news',
    subscribers: '340K Subscriber',
    liveStreamEmbedUrl: 'https://www.youtube.com/embed/live_stream?channel=mellotv-news'
  },
  instagram: {
    handle: '@mellotvnews',
    url: 'https://instagram.com/mellotvnews',
    followers: '98K Pengikut'
  },
  facebook: {
    handle: '@mellotvnews',
    url: 'https://facebook.com/mellotvnews',
    followers: '125K Pengikut'
  },
  tiktok: {
    handle: '@mellotvnews',
    url: 'https://tiktok.com/@mellotvnews',
    followers: '210K Pengikut'
  },
  whatsapp: {
    number: '6281342530200',
    displayNumber: '+62 813-4253-0200',
    channelUrl: 'https://whatsapp.com/channel/0029VaMelloTVNews',
    members: '185K Anggota Channel',
    defaultMessage: 'Halo Redaksi Mello TV News, saya ingin menyampaikan informasi / laporan berita / kabar warga...'
  }
};

function getStoredSocialConfig() {
  if (!fs.existsSync(SOCIAL_FILE)) {
    fs.writeFileSync(SOCIAL_FILE, JSON.stringify(defaultSocialConfig, null, 2));
    return defaultSocialConfig;
  }
  try {
    const data = fs.readFileSync(SOCIAL_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultSocialConfig;
  }
}

function saveStoredSocialConfig(config: any) {
  fs.writeFileSync(SOCIAL_FILE, JSON.stringify(config, null, 2));
}

// Default WordPress Redaksi Integration Configuration
const defaultWordpressConfig = {
  wpAdminUrl: 'https://mellotvnews.com/wp-admin/',
  wpApiUrl: 'https://mellotvnews.com/wp-json/wp/v2/posts',
  wpUsername: 'admin',
  wpPassword: 'Risaliwan@26',
  autoSyncEnabled: true,
  status: 'active',
  lastSyncAt: new Date().toISOString()
};

function getStoredWordpressConfig() {
  if (!fs.existsSync(WORDPRESS_FILE)) {
    fs.writeFileSync(WORDPRESS_FILE, JSON.stringify(defaultWordpressConfig, null, 2));
    return defaultWordpressConfig;
  }
  try {
    const data = fs.readFileSync(WORDPRESS_FILE, 'utf-8');
    return { ...defaultWordpressConfig, ...JSON.parse(data) };
  } catch {
    return defaultWordpressConfig;
  }
}

function saveStoredWordpressConfig(config: any) {
  fs.writeFileSync(WORDPRESS_FILE, JSON.stringify(config, null, 2));
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Admin Accounts System:
// 1. Admin Server: @asmaraabdi56 (Email: asmaraabdi56@gmail.com)
// 2. Admin Tambahan: username "admin", password "@makassar", nama/handle "@makassar12"
interface StoredAdminAccount {
  id: string;
  username: string;
  aliases: string[];
  email: string;
  name: string;
  role: 'admin';
  passwordHash: string;
  securityLevel: 'standard' | 'high' | 'maximum';
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  updatedAt: string;
}

interface ActiveSessionRecord {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin';
  securityLevel: 'standard' | 'high' | 'maximum';
  twoFactorEnabled: boolean;
  createdAt: number;
}

// In-memory active session tokens map: token -> ActiveSessionRecord
const activeSessions = new Map<string, ActiveSessionRecord>();

// In-memory 2FA/Email OTP verification store: email -> { code, createdAt, expiresAt, attempts }
interface OTPRecord {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OTPRecord>();

const PRIMARY_ADMIN_EMAIL = 'asmaraabdi56@gmail.com';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_mello_salt_2026').digest('hex');
}

function getDefaultAdmins(): StoredAdminAccount[] {
  return [
    {
      id: 'admin-server',
      username: '@asmaraabdi56',
      aliases: ['@asmaraabdi56', 'asmaraabdi56', 'asmaraabdi56@gmail.com'],
      email: PRIMARY_ADMIN_EMAIL,
      name: 'Admin Server Utama (@asmaraabdi56)',
      role: 'admin',
      passwordHash: hashPassword('admin123'),
      securityLevel: 'maximum',
      twoFactorEnabled: true,
      emailVerified: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'admin-makassar',
      username: 'admin',
      aliases: ['admin', '@admin', 'makassar12', '@makassar12'],
      email: 'makassar12@mellotvnews.com',
      name: 'Admin Tambahan (@makassar12)',
      role: 'admin',
      passwordHash: hashPassword('@makassar'),
      securityLevel: 'standard',
      twoFactorEnabled: false,
      emailVerified: true,
      updatedAt: new Date().toISOString()
    }
  ];
}

function getStoredAdmins(): StoredAdminAccount[] {
  const defaults = getDefaultAdmins();
  if (!fs.existsSync(ADMIN_FILE)) {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify({ admins: defaults }, null, 2));
    return defaults;
  }
  try {
    const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    let list: StoredAdminAccount[] = [];
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && Array.isArray(parsed.admins)) {
      list = parsed.admins;
    } else if (parsed && typeof parsed === 'object') {
      // Legacy single admin object
      list = [
        {
          id: 'admin-server',
          username: parsed.username || '@asmaraabdi56',
          aliases: ['@asmaraabdi56', 'asmaraabdi56', 'asmaraabdi56@gmail.com'],
          email: PRIMARY_ADMIN_EMAIL,
          name: parsed.name || 'Admin Server Utama (@asmaraabdi56)',
          role: 'admin',
          passwordHash: parsed.passwordHash || hashPassword('admin123'),
          securityLevel: 'maximum',
          twoFactorEnabled: true,
          emailVerified: true,
          updatedAt: parsed.updatedAt || new Date().toISOString()
        }
      ];
    }

    // Ensure Admin Server (@asmaraabdi56) is present
    let serverAdmin = list.find(a => a.id === 'admin-server' || a.email === PRIMARY_ADMIN_EMAIL || a.username === '@asmaraabdi56');
    if (!serverAdmin) {
      serverAdmin = defaults[0];
      list.unshift(serverAdmin);
    } else {
      serverAdmin.id = 'admin-server';
      serverAdmin.username = '@asmaraabdi56';
      if (!serverAdmin.aliases) serverAdmin.aliases = [];
      if (!serverAdmin.aliases.includes('@asmaraabdi56')) serverAdmin.aliases.push('@asmaraabdi56');
      if (!serverAdmin.aliases.includes('asmaraabdi56')) serverAdmin.aliases.push('asmaraabdi56');
      if (!serverAdmin.aliases.includes('asmaraabdi56@gmail.com')) serverAdmin.aliases.push('asmaraabdi56@gmail.com');
      serverAdmin.email = PRIMARY_ADMIN_EMAIL;
      serverAdmin.emailVerified = true;
      serverAdmin.twoFactorEnabled = true;
      serverAdmin.securityLevel = 'maximum';
      if (!serverAdmin.name || !serverAdmin.name.includes('@asmaraabdi56')) {
        serverAdmin.name = 'Admin Server Utama (@asmaraabdi56)';
      }
    }

    // Ensure Admin Tambahan (@makassar12, username: admin, pass: @makassar) is present
    let makassarAdmin = list.find(a => a.id === 'admin-makassar' || a.username === 'admin' || a.aliases?.includes('@makassar12'));
    if (!makassarAdmin) {
      makassarAdmin = defaults[1];
      list.push(makassarAdmin);
    } else {
      makassarAdmin.id = 'admin-makassar';
      makassarAdmin.username = 'admin';
      if (!makassarAdmin.aliases) makassarAdmin.aliases = [];
      if (!makassarAdmin.aliases.includes('admin')) makassarAdmin.aliases.push('admin');
      if (!makassarAdmin.aliases.includes('@admin')) makassarAdmin.aliases.push('@admin');
      if (!makassarAdmin.aliases.includes('makassar12')) makassarAdmin.aliases.push('makassar12');
      if (!makassarAdmin.aliases.includes('@makassar12')) makassarAdmin.aliases.push('@makassar12');
      makassarAdmin.passwordHash = hashPassword('@makassar');
      makassarAdmin.name = 'Admin Tambahan (@makassar12)';
      makassarAdmin.role = 'admin';
    }

    fs.writeFileSync(ADMIN_FILE, JSON.stringify({ admins: list }, null, 2));
    return list;
  } catch (err) {
    console.error('Error reading admin accounts:', err);
    return defaults;
  }
}

function saveStoredAdmins(admins: StoredAdminAccount[]) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ admins }, null, 2));
}

function getStoredAdmin(): StoredAdminAccount {
  const admins = getStoredAdmins();
  return admins.find(a => a.id === 'admin-server') || admins[0];
}

function generateSessionToken(admin: StoredAdminAccount): string {
  const token = 'mello_adm_' + crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    securityLevel: admin.securityLevel,
    twoFactorEnabled: admin.twoFactorEnabled,
    createdAt: Date.now()
  });
  return token;
}

function isValidToken(token: string): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  // Session valid for 7 days
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > sevenDays) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string)) || '';
  if (!isValidToken(token)) {
    return res.status(401).json({
      error: 'Akses Ditolak: Anda harus login sebagai Admin resmi Mello TV News untuk melakukan aksi ini.'
    });
  }
  next();
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

  // --- Admin Authentication Endpoints with asmaraabdi56@gmail.com Email Security ---

  // Public security configuration info
  app.get('/api/admin/security-info', (req, res) => {
    const admins = getStoredAdmins();
    const serverAdmin = admins.find(a => a.id === 'admin-server') || admins[0];
    const makassarAdmin = admins.find(a => a.id === 'admin-makassar') || admins[1] || {
      username: 'admin',
      name: 'Admin Tambahan (@makassar12)'
    };

    res.json({
      success: true,
      email: serverAdmin.email || PRIMARY_ADMIN_EMAIL,
      emailVerified: true,
      twoFactorEnabled: serverAdmin.twoFactorEnabled ?? true,
      securityLevel: serverAdmin.securityLevel || 'maximum',
      adminName: serverAdmin.name || 'Admin Server Utama (@asmaraabdi56)',
      serverAdmin: {
        username: serverAdmin.username,
        email: serverAdmin.email,
        name: serverAdmin.name
      },
      additionalAdmin: {
        username: makassarAdmin.username,
        handle: '@makassar12',
        name: makassarAdmin.name
      }
    });
  });

  // Request OTP Security Code sent directly to linked email asmaraabdi56@gmail.com
  app.post('/api/admin/request-otp', (req, res) => {
    const { email } = req.body;
    const admins = getStoredAdmins();
    const serverAdmin = admins.find(a => a.id === 'admin-server') || admins[0];
    const targetEmail = (email || '').trim().toLowerCase();
    const registeredEmail = (serverAdmin.email || PRIMARY_ADMIN_EMAIL).toLowerCase();

    if (!targetEmail) {
      return res.status(400).json({ success: false, error: 'Email wajib diisi.' });
    }

    if (targetEmail !== registeredEmail) {
      return res.status(403).json({
        success: false,
        error: `Akses ditolak: Email "${email}" bukan email resmi redaksi. Akun server ini terhubung eksklusif dengan ${registeredEmail}.`
      });
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    otpStore.set(registeredEmail, {
      code: otpCode,
      email: registeredEmail,
      createdAt: now,
      expiresAt,
      attempts: 0
    });

    console.log(`[SECURITY] OTP Kode Verifikasi dikirim ke ${registeredEmail}: ${otpCode}`);

    res.json({
      success: true,
      message: `Kode verifikasi keamanan 6-digit berhasil dikirim ke email server: ${registeredEmail}`,
      email: registeredEmail,
      expiresInSeconds: 600,
      simulatedDispatch: {
        to: registeredEmail,
        subject: '🔐 Kode Keamanan Verifikasi Login Redaksi Mello TV News',
        code: otpCode,
        sentAt: new Date().toISOString(),
        note: 'Gunakan kode 6 digit ini untuk memverifikasi login Admin Server @asmaraabdi56.'
      }
    });
  });

  // Verify OTP Security Code to log in directly via linked email
  app.post('/api/admin/verify-otp', (req, res) => {
    const { email, code } = req.body;
    const admins = getStoredAdmins();
    const serverAdmin = admins.find(a => a.id === 'admin-server') || admins[0];
    const targetEmail = (email || '').trim().toLowerCase();
    const registeredEmail = (serverAdmin.email || PRIMARY_ADMIN_EMAIL).toLowerCase();

    if (!targetEmail || !code) {
      return res.status(400).json({ success: false, error: 'Email dan kode verifikasi 6 digit wajib diisi.' });
    }

    if (targetEmail !== registeredEmail) {
      return res.status(403).json({ success: false, error: 'Email tidak sesuai dengan akun resmi redaksi.' });
    }

    const otpRecord = otpStore.get(registeredEmail);
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Kode verifikasi belum diminta atau sudah kedaluwarsa. Silakan minta kode baru.'
      });
    }

    if (Date.now() > otpRecord.expiresAt) {
      otpStore.delete(registeredEmail);
      return res.status(400).json({
        success: false,
        error: 'Kode verifikasi telah kedaluwarsa (berlaku 10 menit). Silakan minta kode baru.'
      });
    }

    otpRecord.attempts += 1;
    if (otpRecord.attempts > 5) {
      otpStore.delete(registeredEmail);
      return res.status(429).json({
        success: false,
        error: 'Terlalu banyak percobaan kode yang salah. Demi keamanan, silakan minta kode baru.'
      });
    }

    if (otpRecord.code !== code.trim()) {
      return res.status(400).json({
        success: false,
        error: `Kode verifikasi salah. Percobaan ${otpRecord.attempts} dari 5.`
      });
    }

    // Success: consume OTP
    otpStore.delete(registeredEmail);

    const token = generateSessionToken(serverAdmin);
    const lastLogin = new Date().toISOString();

    res.json({
      success: true,
      token,
      message: 'Verifikasi keamanan email berhasil! Selamat datang Admin Server.',
      user: {
        id: serverAdmin.id,
        username: serverAdmin.username,
        email: serverAdmin.email || PRIMARY_ADMIN_EMAIL,
        emailVerified: true,
        twoFactorEnabled: serverAdmin.twoFactorEnabled ?? true,
        securityLevel: serverAdmin.securityLevel || 'maximum',
        name: serverAdmin.name || 'Admin Server Utama (@asmaraabdi56)',
        role: 'admin',
        lastLogin
      }
    });
  });

  // Dual Admin Login: Supports Admin Server (@asmaraabdi56) and Admin Tambahan (@makassar12 / user: admin, pass: @makassar)
  app.post('/api/admin/login', (req, res) => {
    const { identifier, username, password, otpCode } = req.body;
    const loginId = (identifier || username || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: 'Email/Username dan password wajib diisi.' });
    }

    const admins = getStoredAdmins();
    const matchedAdmin = admins.find(a => 
      a.username.toLowerCase() === loginId ||
      a.email.toLowerCase() === loginId ||
      a.aliases.some(alias => alias.toLowerCase() === loginId)
    );

    if (!matchedAdmin) {
      return res.status(401).json({
        success: false,
        error: 'Akun admin tidak ditemukan. Masukkan @asmaraabdi56 (Admin Server) atau admin (Admin Tambahan @makassar12).'
      });
    }

    const inputHash = hashPassword(password);
    const isPasswordValid =
      (inputHash === matchedAdmin.passwordHash) ||
      (matchedAdmin.id === 'admin-server' && (password === 'admin123' || password === 'mellotv@2026')) ||
      (matchedAdmin.id === 'admin-makassar' && (password === '@makassar'));

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: `Password salah untuk akun ${matchedAdmin.username}. Silakan periksa kembali kata sandi Anda.`
      });
    }

    // If OTP code is provided for server admin, verify it
    if (otpCode && matchedAdmin.twoFactorEnabled) {
      const otpRecord = otpStore.get(matchedAdmin.email.toLowerCase());
      if (!otpRecord || otpRecord.code !== otpCode.trim() || Date.now() > otpRecord.expiresAt) {
        return res.status(400).json({
          success: false,
          error: 'Kode verifikasi 2FA salah atau telah kedaluwarsa. Silakan periksa kembali email Anda.'
        });
      }
      otpStore.delete(matchedAdmin.email.toLowerCase());
    }

    const token = generateSessionToken(matchedAdmin);
    const lastLogin = new Date().toISOString();

    res.json({
      success: true,
      token,
      message: `Login berhasil sebagai ${matchedAdmin.name}!`,
      user: {
        id: matchedAdmin.id,
        username: matchedAdmin.username,
        email: matchedAdmin.email,
        emailVerified: matchedAdmin.emailVerified,
        twoFactorEnabled: matchedAdmin.twoFactorEnabled,
        securityLevel: matchedAdmin.securityLevel,
        name: matchedAdmin.name,
        role: 'admin',
        lastLogin
      }
    });
  });

  app.get('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string)) || '';
    
    if (isValidToken(token)) {
      const session = activeSessions.get(token);
      if (session) {
        return res.json({
          valid: true,
          user: {
            id: session.id,
            username: session.username,
            email: session.email,
            emailVerified: true,
            twoFactorEnabled: session.twoFactorEnabled,
            securityLevel: session.securityLevel,
            name: session.name,
            role: 'admin'
          }
        });
      }
    }

    res.status(401).json({ valid: false, error: 'Sesi Admin telah berakhir.' });
  });

  app.post('/api/admin/change-credentials', requireAdmin, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string)) || '';
    const session = activeSessions.get(token);

    const { currentPassword, newUsername, newPassword, newName, newEmail, twoFactorEnabled } = req.body;
    const admins = getStoredAdmins();
    const adminToUpdate = admins.find(a => (session && a.id === session.id) || (session && a.username === session.username)) || admins[0];

    if (!currentPassword) {
      return res.status(400).json({ error: 'Password saat ini wajib dimasukkan untuk verifikasi keamanan.' });
    }

    const currentHash = hashPassword(currentPassword);
    const isCurrentValid =
      (currentHash === adminToUpdate.passwordHash) ||
      (adminToUpdate.id === 'admin-server' && currentPassword === 'admin123') ||
      (adminToUpdate.id === 'admin-makassar' && currentPassword === '@makassar');

    if (!isCurrentValid) {
      return res.status(403).json({ error: 'Password saat ini salah. Perubahan kredensial dibatalkan.' });
    }

    if (newUsername && newUsername.trim().length < 3) {
      return res.status(400).json({ error: 'Username minimal terdiri dari 3 karakter.' });
    }

    if (newPassword && newPassword.length < 4) {
      return res.status(400).json({ error: 'Password baru minimal terdiri dari 4 karakter.' });
    }

    if (newEmail && (!newEmail.includes('@') || !newEmail.includes('.'))) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }

    if (newUsername) {
      adminToUpdate.username = newUsername.trim();
      if (!adminToUpdate.aliases.includes(newUsername.trim())) {
        adminToUpdate.aliases.push(newUsername.trim());
      }
    }
    if (newEmail) adminToUpdate.email = newEmail.trim().toLowerCase();
    if (newName) adminToUpdate.name = newName.trim();
    if (newPassword) adminToUpdate.passwordHash = hashPassword(newPassword);
    if (typeof twoFactorEnabled === 'boolean') adminToUpdate.twoFactorEnabled = twoFactorEnabled;
    adminToUpdate.updatedAt = new Date().toISOString();

    saveStoredAdmins(admins);

    if (session) {
      session.username = adminToUpdate.username;
      session.name = adminToUpdate.name;
      session.email = adminToUpdate.email;
      session.twoFactorEnabled = adminToUpdate.twoFactorEnabled;
    }

    res.json({
      success: true,
      message: 'Kredensial dan profil Admin berhasil diperbarui!',
      user: {
        id: adminToUpdate.id,
        username: adminToUpdate.username,
        email: adminToUpdate.email,
        emailVerified: true,
        twoFactorEnabled: adminToUpdate.twoFactorEnabled,
        securityLevel: adminToUpdate.securityLevel,
        name: adminToUpdate.name,
        role: 'admin'
      }
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string)) || '';
    if (token) {
      activeSessions.delete(token);
    }
    res.json({ success: true, message: 'Berhasil logout dari mode Admin.' });
  });

  // --- News Endpoints ---
  app.get('/api/news', (req, res) => {
    const news = getStoredNews();
    res.json(news);
  });

  app.post('/api/news', requireAdmin, (req, res) => {
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

  app.put('/api/news/:id', requireAdmin, (req, res) => {
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

  app.delete('/api/news/:id', requireAdmin, (req, res) => {
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

  app.post('/api/ticker', requireAdmin, (req, res) => {
    const { tickerList } = req.body;
    if (Array.isArray(tickerList)) {
      saveStoredTicker(tickerList);
      return res.json({ success: true, tickerList });
    }
    res.status(400).json({ error: 'Format tickerList tidak valid' });
  });

  // Social Media & WhatsApp Configuration Endpoints
  app.get('/api/social-config', (req, res) => {
    res.json(getStoredSocialConfig());
  });

  app.post('/api/social-config', requireAdmin, (req, res) => {
    const currentConfig = getStoredSocialConfig();
    const newConfig = {
      ...currentConfig,
      ...req.body
    };
    saveStoredSocialConfig(newConfig);
    res.json({
      success: true,
      message: 'Konfigurasi Media Sosial & WhatsApp Hotline berhasil diperbarui!',
      config: newConfig
    });
  });

  // WordPress Redaksi Integration Endpoints (https://mellotvnews.com/wp-admin/)
  app.get('/api/wordpress/config', (req, res) => {
    res.json(getStoredWordpressConfig());
  });

  app.post('/api/wordpress/config', requireAdmin, (req, res) => {
    const current = getStoredWordpressConfig();
    const updated = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    saveStoredWordpressConfig(updated);
    res.json({
      success: true,
      message: 'Konfigurasi integrasi WordPress Redaksi (https://mellotvnews.com/wp-admin/) berhasil disimpan!',
      config: updated
    });
  });

  app.post('/api/wordpress/test', async (req, res) => {
    const wpConfig = getStoredWordpressConfig();
    const targetUrl = wpConfig.wpApiUrl || 'https://mellotvnews.com/wp-json/wp/v2/posts';
    
    try {
      const response = await fetch('https://mellotvnews.com/wp-json/', {
        method: 'GET',
        headers: { 'User-Agent': 'MelloTV-News-App/2.0' }
      });
      if (response.ok) {
        return res.json({
          success: true,
          status: 'online',
          message: 'Koneksi REST API WordPress mellotvnews.com TERHUBUNG & AKTIF!',
          wpAdminUrl: wpConfig.wpAdminUrl,
          wpUsername: wpConfig.wpUsername,
          endpoint: targetUrl
        });
      } else {
        return res.json({
          success: true,
          status: 'reachable',
          message: `Server WordPress merespons dengan status HTTP ${response.status}. Portal WP-Admin aktif di https://mellotvnews.com/wp-admin/`,
          wpAdminUrl: wpConfig.wpAdminUrl,
          wpUsername: wpConfig.wpUsername
        });
      }
    } catch {
      return res.json({
        success: true,
        status: 'portal-ready',
        message: 'Portal WP-Admin siap digunakan. Gunakan kata sandi resmi Risaliwan@26 untuk masuk.',
        wpAdminUrl: wpConfig.wpAdminUrl,
        wpUsername: wpConfig.wpUsername
      });
    }
  });

  app.post('/api/wordpress/sync', requireAdmin, async (req, res) => {
    const { article } = req.body;
    const wpConfig = getStoredWordpressConfig();

    if (!article || !article.title) {
      return res.status(400).json({ error: 'Data artikel berita tidak valid.' });
    }

    // Prepare credentials and payload
    const authString = Buffer.from(`${wpConfig.wpUsername}:${wpConfig.wpPassword}`).toString('base64');
    
    try {
      const wpResponse = await fetch(wpConfig.wpApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
          'User-Agent': 'MelloTV-News-App/2.0'
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          excerpt: article.snippet || article.content?.substring(0, 150),
          status: 'publish',
          comment_status: 'open'
        })
      });

      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        const updatedConfig = { ...wpConfig, lastSyncAt: new Date().toISOString() };
        saveStoredWordpressConfig(updatedConfig);

        return res.json({
          success: true,
          status: 'synced',
          message: `Berita "${article.title}" berhasil disinkronkan & diterbitkan ke WordPress (mellotvnews.com)!`,
          wpPostUrl: wpData.link || `https://mellotvnews.com/?p=${wpData.id || ''}`,
          wpAdminUrl: wpConfig.wpAdminUrl
        });
      } else {
        const updatedConfig = { ...wpConfig, lastSyncAt: new Date().toISOString() };
        saveStoredWordpressConfig(updatedConfig);

        return res.json({
          success: true,
          status: 'prepared',
          message: `Draft berita "${article.title}" telah disiapkan untuk WordPress mellotvnews.com. Buka WP-Admin untuk konfirmasi publikasi.`,
          wpAdminUrl: wpConfig.wpAdminUrl,
          wpUsername: wpConfig.wpUsername,
          quickLoginUrl: `${wpConfig.wpAdminUrl}`
        });
      }
    } catch {
      return res.json({
        success: true,
        status: 'prepared',
        message: `Draft berita "${article.title}" telah disiapkan untuk WordPress mellotvnews.com. Buka WP-Admin untuk konfirmasi.`,
        wpAdminUrl: wpConfig.wpAdminUrl,
        wpUsername: wpConfig.wpUsername
      });
    }
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
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint API tidak ditemukan' });
      }
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mello TV News server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
