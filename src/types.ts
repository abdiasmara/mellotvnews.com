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
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'whatsapp';
  handle: string;
  url: string;
  color: string;
  description: string;
  followers?: string;
  category?: 'video' | 'social' | 'messaging' | 'hotline';
}

export interface SocialMediaConfig {
  youtube: {
    handle: string;
    url: string;
    subscribers: string;
    liveStreamEmbedUrl: string;
  };
  instagram: {
    handle: string;
    url: string;
    followers: string;
  };
  facebook: {
    handle: string;
    url: string;
    followers: string;
  };
  tiktok: {
    handle: string;
    url: string;
    followers: string;
  };
  whatsapp: {
    number: string; // e.g. "6281234567890"
    displayNumber: string; // e.g. "+62 812-3456-7890"
    channelUrl: string;
    members: string;
    defaultMessage: string;
  };
}

export type AppTab = 'home' | 'website' | 'news' | 'social' | 'admin';

export type UserRole = 'public' | 'admin';

export interface AdminUser {
  id?: string;
  username: string;
  email?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  securityLevel?: 'standard' | 'high' | 'maximum';
  role: 'admin';
  name?: string;
  lastLogin?: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  user?: AdminUser;
  error?: string;
  require2FA?: boolean;
  message?: string;
}
