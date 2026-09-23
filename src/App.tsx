import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { WelcomeSplash } from './components/WelcomeSplash';
import { WebsiteView } from './components/WebsiteView';
import { SocialHub } from './components/SocialHub';
import { NewsFeed } from './components/NewsFeed';
import { ArticleModal } from './components/ArticleModal';
import { AdminPanel } from './components/AdminPanel';
import { NewsArticle, AppTab, UserRole } from './types';
import { MelloLogo } from './components/MelloLogo';
import { Shield, Sparkles, Tv, Globe, Share2, Newspaper, Heart, Radio, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [userRole, setUserRole] = useState<UserRole>('public');
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  // Articles & Ticker Data
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [tickerItems, setTickerItems] = useState<string[]>([
    'SELAMAT DATANG SAHABAT MELLO TV NEWS - PORTAL MEDIA TERPERCAYA',
    'Ikuti Akun Resmi Kami di Facebook @mellotvnews, Instagram @mellotvnews, TikTok @mellotvnews & YouTube @mellotv-news',
  ]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mello_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin PIN Login Modal toggle
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  // Fetch initial articles & tickers
  const fetchAllData = async () => {
    try {
      // 1. Fetch custom/admin news from backend API
      const newsRes = await fetch('/api/news');
      let customNews: NewsArticle[] = [];
      if (newsRes.ok) {
        customNews = await newsRes.json();
      }

      // 2. Fetch live website news from mellotvnews.com API endpoint
      const webRes = await fetch('/api/website-news');
      let webNews: NewsArticle[] = [];
      if (webRes.ok) {
        webNews = await webRes.json();
      }

      // Combine articles with Admin articles first
      const combined = [...customNews, ...webNews];
      setArticles(combined);

      // 3. Fetch running tickers
      const tickerRes = await fetch('/api/ticker');
      if (tickerRes.ok) {
        const tickers = await tickerRes.json();
        setTickerItems(tickers);
      }
    } catch (err) {
      console.log('Error fetching portal data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync bookmarks to LocalStorage
  useEffect(() => {
    localStorage.setItem('mello_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleToggleBookmark = (article: NewsArticle) => {
    setBookmarks((prev) =>
      prev.includes(article.id) ? prev.filter((id) => id !== article.id) : [...prev, article.id]
    );
  };

  // Admin Actions
  const handleCreateArticle = async (articleData: Partial<NewsArticle>) => {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleUpdateArticle = async (id: string, updatedData: Partial<NewsArticle>) => {
    const res = await fetch(`/api/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const res = await fetch(`/api/news/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await fetchAllData();
    }
  };

  const handleSaveTicker = async (newTickers: string[]) => {
    const res = await fetch('/api/ticker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickerList: newTickers }),
    });
    if (res.ok) {
      setTickerItems(newTickers);
    }
  };

  const handleToggleRoleClick = () => {
    if (userRole === 'admin') {
      setUserRole('public');
    } else {
      setShowPinModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Welcome Splash Overlay */}
      {showWelcome && (
        <WelcomeSplash
          onEnter={(targetTab) => {
            setShowWelcome(false);
            if (targetTab) setActiveTab(targetTab);
          }}
          onOpenSocials={() => {
            setShowWelcome(false);
            setActiveTab('social');
          }}
        />
      )}

      {/* Header Contract & Clock */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        onToggleRoleClick={handleToggleRoleClick}
        onOpenWelcome={() => setShowWelcome(true)}
      />

      {/* Breaking News Marquee */}
      <BreakingNewsTicker tickerItems={tickerItems} />

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Tab 1: Portal Utama (Home View) */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Quick Greeting Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <MelloLogo size="lg" />
                <div className="space-y-1">
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    PORTAL MEDIA TERPERCAYA
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                    SELAMAT DATANG SAHABAT MELLO TV NEWS
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Akses sajian berita terbaru, siaran langsung Mello TV, dan hubungkan pengalaman Anda langsung dengan website resmi{' '}
                    <strong className="text-blue-400 font-semibold">mellotvnews.com</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('website')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>Lihat mellotvnews.com</span>
                </button>
              </div>
            </div>

            {/* News Feed Grid */}
            <NewsFeed
              articles={articles}
              onSelectArticle={(article) => setSelectedArticle(article)}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              onOpenWebsiteTab={() => setActiveTab('website')}
            />
          </div>
        )}

        {/* Tab 2: Embedded Website View */}
        {activeTab === 'website' && <WebsiteView />}

        {/* Tab 3: Berita Terkini & Video Feed */}
        {activeTab === 'news' && (
          <NewsFeed
            articles={articles}
            onSelectArticle={(article) => setSelectedArticle(article)}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onOpenWebsiteTab={() => setActiveTab('website')}
          />
        )}

        {/* Tab 4: Social Media Hub */}
        {activeTab === 'social' && <SocialHub />}

        {/* Tab 5: Admin Panel */}
        {activeTab === 'admin' && (
          <AdminPanel
            userRole={userRole}
            onLoginSuccess={() => setUserRole('admin')}
            articles={articles}
            onCreateArticle={handleCreateArticle}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
            tickerItems={tickerItems}
            onSaveTicker={handleSaveTicker}
          />
        )}
      </main>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          isBookmarked={bookmarks.includes(selectedArticle.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Admin Login Modal Triggered from Header */}
      {showPinModal && userRole !== 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Akses Mode Admin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Masukkan password admin untuk membuka hak akses menerbitkan berita.
            </p>

            <input
              type="password"
              placeholder="Password: admin123"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val === 'admin123' || val === '123456') {
                    setUserRole('admin');
                    setShowPinModal(false);
                  } else {
                    alert('Password Admin Salah. Gunakan admin123');
                  }
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white text-center font-mono focus:outline-none focus:border-amber-500"
              autoFocus
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement);
                  if (input && (input.value === 'admin123' || input.value === '123456')) {
                    setUserRole('admin');
                    setShowPinModal(false);
                  } else {
                    alert('Password Admin Salah. Gunakan admin123');
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Masuk Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-900">
            <div className="flex items-center gap-3">
              <MelloLogo size="sm" />
              <div>
                <span className="font-display font-extrabold text-white text-base">MELLO TV NEWS</span>
                <p className="text-[11px] text-slate-500">Portal Media Terpercaya · mellotvnews.com</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <a href="https://facebook.com/mellotvnews" target="_blank" rel="noreferrer" className="hover:text-amber-400">Facebook @mellotvnews</a>
              <span>·</span>
              <a href="https://instagram.com/mellotvnews" target="_blank" rel="noreferrer" className="hover:text-amber-400">Instagram @mellotvnews</a>
              <span>·</span>
              <a href="https://tiktok.com/@mellotvnews" target="_blank" rel="noreferrer" className="hover:text-amber-400">TikTok @mellotvnews</a>
              <span>·</span>
              <a href="https://youtube.com/@mellotv-news" target="_blank" rel="noreferrer" className="hover:text-amber-400">YouTube @mellotv-news</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Mello TV News. Hak Cipta Dilindungi Undang-Undang.</p>
            <p>Portal Media Terpercaya · Dipersembahkan untuk Sahabat Mello TV News</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
