import React, { useState } from 'react';
import { SocialLink } from '../types';
import { Youtube, Instagram, Facebook, Share2, Copy, Check, ExternalLink, Play, Sparkles, MessageCircle, Heart, Radio } from 'lucide-react';

export const SocialHub: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const socialLinks: SocialLink[] = [
    {
      id: 'fb',
      platform: 'facebook',
      handle: '@mellotvnews',
      url: 'https://facebook.com/mellotvnews',
      color: 'from-blue-600 to-blue-800',
      description: 'Halaman Facebook Resmi Mello TV News. Dapatkan berita harian, diskusi publik, dan siaran langsung interaktif.',
      followers: '125K Pengikut',
    },
    {
      id: 'ig',
      platform: 'instagram',
      handle: '@mellotvnews',
      url: 'https://instagram.com/mellotvnews',
      color: 'from-pink-600 via-purple-600 to-amber-500',
      description: 'Akun Instagram Resmi Mello TV News. Infografis berita terkini, kuis interaktif, serta momen di balik layar penyiaran.',
      followers: '98K Pengikut',
    },
    {
      id: 'tt',
      platform: 'tiktok',
      handle: '@mellotvnews',
      url: 'https://tiktok.com/@mellotvnews',
      color: 'from-slate-900 to-slate-950 border border-slate-700',
      description: 'Akun TikTok Resmi Mello TV News. Video berita durasi pendek, rangkuman fakta cepat, dan sorotan berita viral.',
      followers: '210K Pengikut',
    },
    {
      id: 'yt',
      platform: 'youtube',
      handle: '@mellotv-news',
      url: 'https://youtube.com/@mellotv-news',
      color: 'from-red-600 to-red-800',
      description: 'Kanal YouTube Resmi Mello TV News. Streaming siaran langsung 24/7, program berita unggulan, dan dokumenter liputan.',
      followers: '340K Subscriber',
    },
  ];

  // Featured YouTube Embedded Videos for @mellotv-news
  const featuredVideos = [
    {
      id: 'v1',
      title: 'Mello TV Live Stream - Siaran Berita Utama & Dialog Interaktif',
      embedUrl: 'https://www.youtube.com/embed/live_stream?channel=mellotv-news',
      views: 'LIVE NOW',
      duration: 'Siaran Langsung',
      isLive: true,
    },
    {
      id: 'v2',
      title: 'Kabar Terkini: Liputan Khusus Mello TV News Hari Ini',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Clean player fallback preview
      views: '45K penayangan',
      duration: '14:20',
      isLive: false,
    },
  ];

  const handleCopyHandle = (handle: string, id: string) => {
    navigator.clipboard.writeText(handle);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="w-6 h-6 text-white" />;
      case 'instagram':
        return <Instagram className="w-6 h-6 text-white" />;
      case 'tiktok':
        return (
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.33 6.33 0 0 0 6.33-6.32V9.05a8.16 8.16 0 0 0 4.69 1.48V7.08a4.84 4.84 0 0 1-.76-.39z" />
          </svg>
        );
      case 'youtube':
        return <Youtube className="w-6 h-6 text-white" />;
      default:
        return <Share2 className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kanal Resmi Mello TV News</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
            Terhubung Langsung Dengan Media Sosial Resmi Kami
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Ikuti pembaharuan berita tercepat, video eksklusif, dan siaran langsung Mello TV News di seluruh jaringan platform media sosial terpercaya.
          </p>
        </div>
      </div>

      {/* Social Media Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialLinks.map((item) => (
          <div
            key={item.id}
            className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all transform hover:-translate-y-1 overflow-hidden"
          >
            {/* Background Accent Gradient */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color}`} />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                  {getPlatformIcon(item.platform)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors capitalize font-display">
                    {item.platform}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                    <span>{item.handle}</span>
                    <button
                      onClick={() => handleCopyHandle(item.handle, item.id)}
                      className="p-1 hover:text-white transition-colors"
                      title="Salin Handle"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {item.followers && (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                  {item.followers}
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              {item.description}
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${item.color} text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity`}
              >
                <span>Kunjungi {item.handle}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Featured YouTube Channel Player Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">Siaran Live & Video YouTube @mellotv-news</h3>
              <p className="text-xs text-slate-400">Streaming Siaran Berita Resmi Mello TV</p>
            </div>
          </div>

          <a
            href="https://youtube.com/@mellotv-news"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span>Subscribe @mellotv-news</span>
          </a>
        </div>

        {/* Video Embed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 aspect-video relative shadow-inner">
            <iframe
              src="https://www.youtube.com/embed/live_stream?channel=mellotv-news"
              title="YouTube Mello TV Live Stream"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Side Info Box */}
          <div className="flex flex-col justify-between bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950 border border-red-800 text-red-400 text-xs font-bold uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                SIARAN UTAMA
              </div>
              <h4 className="font-bold text-white text-base leading-snug mb-2 font-display">
                Mello TV News Live Streaming 24 Jam
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saksikan liputan langsung, berita breaking news, bincang politik, serta kabar daerah terpercaya secara realtime melalui kanal YouTube resmi kami.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-500" /> Komunitas Aktif
                </span>
                <span className="text-white font-mono">340.000+</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" /> Interaksi Langsung
                </span>
                <span className="text-emerald-400 font-bold">24 Jam</span>
              </div>
            </div>

            <a
              href="https://youtube.com/@mellotv-news"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Buka Kanal YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
