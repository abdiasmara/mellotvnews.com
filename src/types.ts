export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  snippet: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  videoUrl?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  source?: 'mellotvnews.com' | 'Redaksi' | 'Admin';
  url?: string;
  readTimeMinutes?: number;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  handle: string;
  url: string;
  color: string;
  description: string;
  followers?: string;
}

export type AppTab = 'home' | 'website' | 'news' | 'social' | 'admin';

export type UserRole = 'public' | 'admin';
