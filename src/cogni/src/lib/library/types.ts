/**
 * Cognify Library - Types and Interfaces
 * 
 * Comprehensive types for the curriculum-aligned educational ecosystem
 */

// ============================================================
// Curriculum Types
// ============================================================

export interface CurriculumNode {
  id: string;
  parentId: string | null;
  level: number; // 0: Board, 1: Class, 2: Subject, 3: Chapter, 4: Topic
  code: string;
  name: string;
  nameHi?: string;
  nameEn?: string;
  description?: string;
  board: string;
  grade?: string;
  subject?: string;
  coveragePercent: number;
  totalResources: number;
  order: number;
  isActive: boolean;
  children?: CurriculumNode[];
  alignments?: ResourceAlignment[];
}

export interface ResourceAlignment {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  curriculumNodeId: string;
  alignmentType: 'primary' | 'secondary' | 'supplementary';
  relevanceScore: number;
  boards?: string[];
}

export type ResourceType = 'video' | 'note' | 'question' | 'book' | 'question_set';

export interface CurriculumTreeProps {
  nodes: CurriculumNode[];
  selectedNode?: string;
  onNodeSelect?: (node: CurriculumNode) => void;
  expandedNodes?: Set<string>;
  onExpand?: (nodeId: string) => void;
  language?: 'en' | 'hi' | 'both';
  showPathView?: boolean;
}

// ============================================================
// Offline Types
// ============================================================

export interface OfflineContent {
  id: string;
  userId: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  downloadProgress: number;
  downloadedBytes: number;
  totalBytes?: number;
  localPath?: string;
  expiresAt?: Date;
  lastSyncedAt?: Date;
  syncVersion: number;
}

export interface UserSyncData {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  dataType: 'bookmark' | 'note' | 'highlight' | 'progress';
  data: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
  lastModified: Date;
  serverVersion: number;
}

export interface DownloadManagerProps {
  downloads: OfflineContent[];
  onDownload: (resource: { type: ResourceType; id: string; name: string }) => void;
  onPause: (downloadId: string) => void;
  onResume: (downloadId: string) => void;
  onDelete: (downloadId: string) => void;
  onSync: () => void;
}

// ============================================================
// Language Types
// ============================================================

export interface LanguagePreference {
  primaryLanguage: 'en' | 'hi' | 'regional';
  secondaryLanguage?: 'en' | 'hi' | 'regional';
  contentLanguage: 'en' | 'hi' | 'regional';
  enabledLanguages: string[];
}

export const LANGUAGE_LABELS: Record<string, { en: string; hi: string; native: string }> = {
  en: { en: 'English', hi: 'अंग्रेज़ी', native: 'English' },
  hi: { en: 'Hindi', hi: 'हिंदी', native: 'हिंदी' },
  ta: { en: 'Tamil', hi: 'तमिल', native: 'தமிழ்' },
  te: { en: 'Telugu', hi: 'तेलुगु', native: 'తెలుగు' },
  mr: { en: 'Marathi', hi: 'मराठी', native: 'मराठी' },
  bn: { en: 'Bengali', hi: 'बंगाली', native: 'বাংলা' },
  gu: { en: 'Gujarati', hi: 'गुजराती', native: 'ગુજરાતી' },
  kn: { en: 'Kannada', hi: 'कन्नड़', native: 'ಕನ್ನಡ' },
};

// ============================================================
// Playlist Types
// ============================================================

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  subject?: string;
  grade?: string;
  playlistType: 'custom' | 'teacher' | 'recommended';
  isPublic: boolean;
  shareCode?: string;
  shareSettings?: { allowCopy: boolean; allowEdit: boolean };
  itemCount: number;
  viewCount: number;
  copyCount: number;
  order: number;
  tags?: string[];
  items: PlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  resourceThumbnail?: string;
  sortOrder: number;
  notes?: string;
  progress: number;
  completedAt?: Date;
}

export interface PlaylistManagerProps {
  playlists: Playlist[];
  currentPlaylist?: Playlist;
  onCreatePlaylist: (name: string, description?: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onAddItem: (playlistId: string, item: Omit<PlaylistItem, 'id' | 'playlistId' | 'sortOrder'>) => void;
  onRemoveItem: (playlistId: string, itemId: string) => void;
  onReorderItems: (playlistId: string, itemIds: string[]) => void;
  onSharePlaylist: (playlistId: string, shareType: 'user' | 'group' | 'public_link') => void;
  onCopyPlaylist: (playlistId: string) => void;
}

// ============================================================
// Resource Types
// ============================================================

export interface LibraryResource {
  id: string;
  type: ResourceType;
  name: string;
  nameHi?: string;
  description?: string;
  thumbnail?: string;
  duration?: number; // For videos, in seconds
  pageCount?: number; // For books/notes
  questionCount?: number; // For question sets
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
  topic?: string;
  curriculumAlignments: ResourceAlignment[];
  languages: string[];
  isDownloaded?: boolean;
  downloadProgress?: number;
  progress?: number;
  bookmarked?: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceCardProps {
  resource: LibraryResource;
  language: 'en' | 'hi' | 'both';
  onDownload?: () => void;
  onBookmark?: () => void;
  onView?: () => void;
  onAddToPlaylist?: () => void;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CurriculumTreeResponse {
  success: boolean;
  tree?: CurriculumNode[];
  error?: string;
}

export interface PlaylistResponse {
  success: boolean;
  playlist?: Playlist;
  playlists?: Playlist[];
  error?: string;
}

export interface SyncStatusResponse {
  success: boolean;
  status?: {
    lastSync: string | null;
    pendingItems: number;
    conflictItems: number;
    downloadedItems: number;
    totalBytes: number;
  };
  error?: string;
}
