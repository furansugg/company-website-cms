export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Media {
  id: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  url: string;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  uploadedBy?: number | null;
  createdAt: string;
}

export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ArticleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type MessageStatus = 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED';

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: PublishStatus;
  featuredImage?: Media | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag { id: number; name: string; slug: string }

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  categoryId?: number | null;
  authorId?: number | null;
  status: ArticleStatus;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  featuredImage?: Media | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Category { id: number; name: string; slug: string; description?: string | null }

export interface Service {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  image?: Media | null;
  price?: number | null;
  currency?: string | null;
  active: boolean;
  sortOrder: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  image?: Media | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  active: boolean;
  sortOrder: number;
}

export interface Menu {
  id: number;
  name: string;
  url: string;
  parentId?: number | null;
  sortOrder: number;
  active: boolean;
  target: string;
}

export interface CompanyProfile {
  id: number;
  name: string;
  tagline?: string | null;
  description?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo?: Media | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
}

export interface WebsiteSettings {
  id: number;
  siteName: string;
  logo?: Media | null;
  favicon?: Media | null;
  primaryColor?: string | null;
  footerText?: string | null;
  contactEmail?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  defaultMetaTitle?: string | null;
  defaultMetaDescription?: string | null;
  ogImage?: Media | null;
  robotsTxt?: string | null;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number | null;
  userEmail?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  metadata?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface UserAccount {
  id: number;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  status: 'ACTIVE' | 'DISABLED';
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalMessages: number;
  unreadMessages: number;
  totalMedia: number;
  recentArticles: Article[];
  recentMessages: ContactMessage[];
}

export interface SiteSummary {
  settings: WebsiteSettings;
  profile: CompanyProfile;
  menus: Menu[];
}
