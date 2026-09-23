import React, { useState } from 'react';
import { NewsArticle, UserRole } from '../types';
import { Shield, Lock, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, Sparkles, RefreshCcw, Volume2, KeyRound } from 'lucide-react';

interface AdminPanelProps {
  userRole: UserRole;
  onLoginSuccess: () => void;
  articles: NewsArticle[];
  onCreateArticle: (article: Partial<NewsArticle>) => Promise<void>;
  onUpdateArticle: (id: string, updated: Partial<NewsArticle>) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  tickerItems: string[];
  onSaveTicker: (tickers: string[]) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  userRole,
  onLoginSuccess,
  articles,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
  tickerItems,
  onSaveTicker,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Article Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nasional');
  const [snippet, setSnippet] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Redaksi Mello TV');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticker Management State
  const [tickerList, setTickerList] = useState<string[]>(tickerItems);
  const [newTickerText, setNewTickerText] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin123' || pinInput === '123456') {
      onLoginSuccess();
      setPinError('');
    } else {
      setPinError('Password/PIN Admin salah. Password default: admin123');
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Nasional');
    setSnippet('');
    setContent('');
    setAuthor('Redaksi Mello TV');
    setImageUrl('');
    setVideoUrl('');
    setIsBreaking(false);
    setIsFeatured(false);
  };

  const handleEditArticle = (item: NewsArticle) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setSnippet(item.snippet);
    setContent(item.content);
    setAuthor(item.author);
    setImageUrl(item.imageUrl || '');
    setVideoUrl(item.videoUrl || '');
    setIsBreaking(!!item.isBreaking);
    setIsFeatured(!!item.isFeatured);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setStatusMsg('Judul dan Isi Berita tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('');

    try {
      const payload = {
        title,
        category,
        snippet: snippet || content.substring(0, 150) + '...',
        content,
        author: author || 'Redaksi Mello TV',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        videoUrl,
        isBreaking,
        isFeatured,
        source: 'Admin' as const,
      };

      if (editingId) {
        await onUpdateArticle(editingId, payload);
        setStatusMsg('Berita berhasil diperbarui!');
      } else {
        await onCreateArticle(payload);
        setStatusMsg('Berita baru berhasil diterbitkan oleh Admin!');
      }

      handleResetForm();
    } catch (err: any) {
      setStatusMsg('Gagal menyimpan berita: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      await onDeleteArticle(id);
    }
  };

  const handleAddTicker = () => {
    if (!newTickerText.trim()) return;
    const updated = [newTickerText.trim(), ...tickerList];
    setTickerList(updated);
    setNewTickerText('');
  };

  const handleRemoveTicker = (index: number) => {
    const updated = tickerList.filter((_, i) => i !== index);
    setTickerList(updated);
  };

  const handleSaveTickerList = async () => {
    await onSaveTicker(tickerList);
    setStatusMsg('Running Text Running Ticker Berhasil Disimpan!');
  };

  // Restricted Access UI for Public Mode
  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white font-display">Mode Admin Terkunci</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Hanya Admin yang diizinkan untuk membuat, mengedit, dan menghapus berita portal Mello TV News. Masukkan kata sandi Admin untuk masuk.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Masukkan Password Admin (Default: admin123)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            {pinError && <p className="text-xs text-red-400 mt-2">{pinError}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Masuk Mode Admin</span>
          </button>

          <p className="text-[11px] text-slate-500">
            Gunakan password <strong className="text-amber-400 font-mono">admin123</strong> untuk akses demo admin.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>AKSES ADMIN REDAKSI MELLO TV NEWS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Panel Kelola Berita & Penyiaran Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Anda dapat menerbitkan berita baru, memperbarui berita yang ada, serta mengatur Running Text Breaking News.
          </p>
        </div>

        <button
          onClick={handleResetForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Buat Berita Baru</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Form Publish / Edit Berita */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{editingId ? 'Edit Berita Redaksi' : 'Form Dapur Redaksi - Tambah Berita Baru'}</span>
          </h3>

          {editingId && (
            <button
              onClick={handleResetForm}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Batalkan Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitArticle} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Judul Berita *</label>
              <input
                type="text"
                placeholder="Masukkan judul berita utama..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Kategori Berita</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="Nasional">Nasional</option>
                <option value="Politik">Politik</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Hukum">Hukum</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Hiburan">Hiburan</option>
                <option value="Daerah">Daerah</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Mello TV Live">Mello TV Live</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Penulis / Reporter</label>
              <input
                type="text"
                placeholder="Nama jurnalis / tim redaksi..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">URL Gambar Thumbnail</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Video Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Link Embed Video YouTube (Opsional)</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/embed/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Snippet */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Ringkasan Singkat (Snippet)</label>
            <input
              type="text"
              placeholder="Ringkasan 1-2 kalimat untuk kartu berita..."
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Isi Lengkap Berita *</label>
            <textarea
              rows={6}
              placeholder="Tuliskan berita lengkap di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-red-500 resize-y"
              required
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-800"
              />
              <span>Tampilkan sebagai Breaking News</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-800"
              />
              <span>Jadikan Berita Utama (Featured Hero)</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/40 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Simpan Perubahan' : 'Terbitkan Berita'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Running Text Ticker Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-amber-400" />
          <span>Pengaturan Running Text (Breaking News Ticker)</span>
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah teks baru ke running ticker..."
            value={newTickerText}
            onChange={(e) => setNewTickerText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleAddTicker}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Tambah Ticker
          </button>
        </div>

        <div className="space-y-2 pt-2">
          {tickerList.map((t, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="truncate">{t}</span>
              <button
                onClick={() => handleRemoveTicker(idx)}
                className="text-red-400 hover:text-red-300 font-bold text-xs p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveTickerList}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Susunan Ticker</span>
          </button>
        </div>
      </div>

      {/* Article List Table for Admin */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-display">
          Daftar Semua Berita Portal ({articles.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Judul Berita</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Penulis</th>
                <th className="p-3">Sumber</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {articles.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/50">
                  <td className="p-3 font-semibold text-white max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] uppercase font-bold">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3">{item.author}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{item.source || 'Admin'}</td>
                  <td className="p-3 font-mono text-[11px]">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleEditArticle(item)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                      title="Edit Berita"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-red-900/60 text-red-400"
                      title="Hapus Berita"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
