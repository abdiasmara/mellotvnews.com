import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { X, Volume2, VolumeX, Share2, Bookmark, BookmarkCheck, Facebook, Twitter, MessageSquare, Send, Check, Copy, ExternalLink, Play } from 'lucide-react';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [comments, setComments] = useState<Array<{ id: string; name: string; text: string; date: string }>>([
    {
      id: 'c1',
      name: 'Sahabat Mello',
      text: 'Informasi yang sangat bermanfaat dan cepat diperbarui. Sukses terus Mello TV News!',
      date: 'Baru saja',
    },
  ]);
  const [commentInput, setCommentInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  // Text to Speech Handler
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Fitur Suara Berita tidak didukung di browser ini.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${article.title}. Berita oleh ${article.author}. ${article.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newC = {
      id: 'comm-' + Date.now(),
      name: nameInput.trim() || 'Pembaca Mello TV',
      text: commentInput.trim(),
      date: 'Baru saja',
    };

    setComments([newC, ...comments]);
    setCommentInput('');
  };

  const handleCopyLink = () => {
    const url = article.url || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(`${article.title} - Mello TV News Portal Media Terpercaya`);
  const articleUrl = encodeURIComponent(article.url || 'https://mellotvnews.com');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Control Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-red-950 border border-red-800 text-red-400 font-bold text-xs uppercase">
              {article.category}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">· {article.source || 'Mello TV News'}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Adjusters */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded ${fontSize === 'sm' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded ${fontSize === 'base' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded ${fontSize === 'lg' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                A+
              </button>
            </div>

            {/* Audio Reader */}
            <button
              onClick={handleToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Dengarkan Suara Berita"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Berhenti Suara' : 'Dengarkan Berita'}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(article)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Simpan Berita"
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Article Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display leading-snug">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-4 pb-4 border-b border-slate-800">
              <span className="font-semibold text-slate-200">Penulis: {article.author}</span>
              <span>·</span>
              <span>{new Date(article.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">{article.source || 'mellotvnews.com'}</span>
            </div>
          </div>

          {/* Media Player or Banner Image */}
          {article.videoUrl ? (
            <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-black shadow-xl">
              <iframe
                src={article.videoUrl}
                title={article.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : article.imageUrl ? (
            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950 shadow-xl">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          {/* Article Text Content */}
          <div className={`text-slate-200 leading-relaxed space-y-4 ${
            fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
          }`}>
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* External Source Link */}
          {article.url && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-300">
                <span>Sumber Berita Resmi: </span>
                <strong className="text-blue-400 font-mono">{article.url}</strong>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shrink-0"
              >
                <span>Buka Sumber</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Social Share Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Bagikan Berita Ini ke Media Sosial</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}%20${articleUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${articleUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>Twitter / X</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
              </button>
            </div>
          </div>

          {/* Comment Section */}
          <div className="pt-6 border-t border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              <span>Komentar Pembaca ({comments.length})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama Anda (Opsional)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Tuliskan komentar atau tanggapan Anda..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Komentar</span>
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{c.name}</span>
                    <span className="text-slate-500 text-[10px]">{c.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
