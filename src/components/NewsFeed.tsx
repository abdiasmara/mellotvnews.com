import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { Search, Bookmark, BookmarkCheck, Play, Sparkles, Filter, ExternalLink, Clock, User, ArrowRight } from 'lucide-react';

interface NewsFeedProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  bookmarks: string[];
  onToggleBookmark: (article: NewsArticle) => void;
  onOpenWebsiteTab: () => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  articles,
  onSelectArticle,
  bookmarks,
  onToggleBookmark,
  onOpenWebsiteTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  const categories = [
    'Semua',
    'Mello TV Live',
    'Website mellotvnews.com',
    'Nasional',
    'Politik',
    'Ekonomi',
    'Hukum',
    'Olahraga',
    'Hiburan',
    'Daerah',
    'Teknologi',
  ];

  // Filtering articles
  const filteredArticles = articles.filter((item) => {
    // Bookmark filter
    if (showBookmarksOnly && !bookmarks.includes(item.id)) return false;

    // Category filter
    if (selectedCategory !== 'Semua') {
      if (selectedCategory === 'Website mellotvnews.com' && item.source !== 'mellotvnews.com') {
        return false;
      } else if (selectedCategory === 'Mello TV Live' && item.category !== 'Mello TV Live' && !item.videoUrl) {
        return false;
      } else if (
        selectedCategory !== 'Website mellotvnews.com' &&
        selectedCategory !== 'Mello TV Live' &&
        item.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const snippetMatch = item.snippet.toLowerCase().includes(q);
      const categoryMatch = item.category.toLowerCase().includes(q);
      return titleMatch || snippetMatch || categoryMatch;
    }

    return true;
  });

  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];

  return (
    <div className="space-y-8">
      {/* Featured News Hero Spotlight */}
      {featuredArticle && !searchQuery && !showBookmarksOnly && selectedCategory === 'Semua' && (
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl group">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Image / Video Container */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full bg-slate-950 overflow-hidden">
              <img
                src={featuredArticle.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-900" />

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs uppercase shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  BERITA UTAMA
                </span>
                {featuredArticle.videoUrl && (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs uppercase shadow-md flex items-center gap-1">
                    <Play className="w-3 h-3 fill-slate-950" />
                    LIVE VIDEO
                  </span>
                )}
              </div>
            </div>

            {/* Content Container */}
            <div className="lg:col-span-5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-red-400 uppercase">{featuredArticle.category}</span>
                <span>{new Date(featuredArticle.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>

              <h2
                onClick={() => onSelectArticle(featuredArticle)}
                className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight cursor-pointer hover:text-amber-300 transition-colors"
              >
                {featuredArticle.title}
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                {featuredArticle.snippet}
              </p>

              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  onClick={() => onSelectArticle(featuredArticle)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onToggleBookmark(featuredArticle)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Simpan Berita"
                >
                  {bookmarks.includes(featuredArticle.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="space-y-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berita Mello TV News..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Direct Website View Button & Bookmark Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                showBookmarksOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Tersimpan ({bookmarks.length})</span>
            </button>

            <button
              onClick={onOpenWebsiteTab}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Website mellotvnews.com</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Functional Filter Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          <Filter className="w-4 h-4 text-amber-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowBookmarksOnly(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat && !showBookmarksOnly
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Articles Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <span>
              {showBookmarksOnly
                ? 'Berita Tersimpan'
                : selectedCategory === 'Semua'
                ? 'Daftar Berita Terbaru'
                : `Berita ${selectedCategory}`}
            </span>
            <span className="text-xs font-sans text-slate-400 font-normal">
              ({filteredArticles.length} artikel)
            </span>
          </h3>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <p className="text-base font-semibold text-slate-300">Tidak ada berita yang sesuai pencarian atau kategori ini.</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci atau pilih kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((item) => (
              <article
                key={item.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div
                    onClick={() => onSelectArticle(item)}
                    className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {item.isBreaking && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-red-600 text-white font-extrabold text-[10px] uppercase shadow-md">
                        BREAKING
                      </span>
                    )}

                    {item.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-amber-400 uppercase text-[11px]">{item.category}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectArticle(item)}
                      className="font-bold text-white text-base font-display leading-snug line-clamp-2 cursor-pointer group-hover:text-amber-300 transition-colors"
                    >
                      {item.title}
                    </h4>

                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {item.snippet}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-400 truncate max-w-[140px]">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{item.author}</span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleBookmark(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Simpan Berita"
                    >
                      {bookmarks.includes(item.id) ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onSelectArticle(item)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs transition-colors"
                    >
                      Baca
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
