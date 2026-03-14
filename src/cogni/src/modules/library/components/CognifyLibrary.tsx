/**
 * Cognify Library - Main Integration Component
 * 
 * Curriculum-aligned educational ecosystem with:
 * - Curriculum tree view with animated expansion
 * - Offline content management with sync
 * - Multi-language support (tri-lingual)
 * - Custom playlists with sharing
 * - Resource discovery
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  TreeDeciduous,
  Download,
  Globe,
  ListMusic,
  Search,
  Filter,
  Grid,
  List,
  Bell,
  Settings,
  ChevronRight,
  Sparkles,
  FolderSync,
  Wifi,
  WifiOff,
  Bookmark,
  Play,
  Video,
  FileText,
  HelpCircle,
  Layers,
  Target,
  Clock,
  Eye,
  Heart,
  MoreVertical,
  Plus,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CurriculumTreeView } from './CurriculumTreeView';
import { OfflineDownloadManager } from './OfflineDownloadManager';
import { LanguageToggle } from './LanguageToggle';
import { PlaylistManager } from './PlaylistManager';
import type { CurriculumNode, OfflineContent, Playlist, PlaylistItem, LibraryResource, ResourceType, ResourceAlignment } from '@/lib/library/types';

// ============================================================
// Mock Data
// ============================================================

const MOCK_CURRICULUM: CurriculumNode[] = [
  {
    id: 'ncert-12',
    parentId: null,
    level: 1,
    code: 'NCERT-12',
    name: 'Class 12',
    nameEn: 'Class 12',
    nameHi: 'कक्षा 12',
    board: 'NCERT',
    coveragePercent: 78,
    totalResources: 245,
    order: 0,
    isActive: true,
    children: [
      {
        id: 'ncert-12-phys',
        parentId: 'ncert-12',
        level: 2,
        code: 'NCERT-12-PHYS',
        name: 'Physics',
        nameEn: 'Physics',
        nameHi: 'भौतिकी',
        board: 'NCERT',
        grade: '12',
        subject: 'Physics',
        coveragePercent: 82,
        totalResources: 85,
        order: 0,
        isActive: true,
        children: [
          {
            id: 'ncert-12-phys-01',
            parentId: 'ncert-12-phys',
            level: 3,
            code: 'NCERT-12-PHYS-01',
            name: 'Electric Charges and Fields',
            nameEn: 'Electric Charges and Fields',
            nameHi: 'वैद्युत आवेश एवं क्षेत्र',
            board: 'NCERT',
            grade: '12',
            subject: 'Physics',
            coveragePercent: 95,
            totalResources: 24,
            order: 1,
            isActive: true,
            alignments: [
              { id: 'a1', resourceType: 'video', resourceId: 'v1', curriculumNodeId: 'ncert-12-phys-01', alignmentType: 'primary', relevanceScore: 0.95 },
              { id: 'a2', resourceType: 'note', resourceId: 'n1', curriculumNodeId: 'ncert-12-phys-01', alignmentType: 'primary', relevanceScore: 0.9 },
              { id: 'a3', resourceType: 'question', resourceId: 'q1', curriculumNodeId: 'ncert-12-phys-01', alignmentType: 'secondary', relevanceScore: 0.85 },
            ],
          },
          {
            id: 'ncert-12-phys-02',
            parentId: 'ncert-12-phys',
            level: 3,
            code: 'NCERT-12-PHYS-02',
            name: 'Electrostatic Potential and Capacitance',
            nameEn: 'Electrostatic Potential and Capacitance',
            nameHi: 'स्थिरवैद्युत विभव तथा धारिता',
            board: 'NCERT',
            grade: '12',
            subject: 'Physics',
            coveragePercent: 75,
            totalResources: 18,
            order: 2,
            isActive: true,
            alignments: [
              { id: 'a4', resourceType: 'video', resourceId: 'v2', curriculumNodeId: 'ncert-12-phys-02', alignmentType: 'primary', relevanceScore: 0.92 },
            ],
          },
          {
            id: 'ncert-12-phys-03',
            parentId: 'ncert-12-phys',
            level: 3,
            code: 'NCERT-12-PHYS-03',
            name: 'Current Electricity',
            nameEn: 'Current Electricity',
            nameHi: 'विद्युत धारा',
            board: 'NCERT',
            grade: '12',
            subject: 'Physics',
            coveragePercent: 88,
            totalResources: 22,
            order: 3,
            isActive: true,
          },
          {
            id: 'ncert-12-phys-04',
            parentId: 'ncert-12-phys',
            level: 3,
            code: 'NCERT-12-PHYS-04',
            name: 'Moving Charges and Magnetism',
            nameEn: 'Moving Charges and Magnetism',
            nameHi: 'गतिमान आवेश और चुंबकत्व',
            board: 'NCERT',
            grade: '12',
            subject: 'Physics',
            coveragePercent: 60,
            totalResources: 15,
            order: 4,
            isActive: true,
          },
        ],
      },
      {
        id: 'ncert-12-chem',
        parentId: 'ncert-12',
        level: 2,
        code: 'NCERT-12-CHEM',
        name: 'Chemistry',
        nameEn: 'Chemistry',
        nameHi: 'रसायन विज्ञान',
        board: 'NCERT',
        grade: '12',
        subject: 'Chemistry',
        coveragePercent: 70,
        totalResources: 90,
        order: 1,
        isActive: true,
        children: [
          {
            id: 'ncert-12-chem-01',
            parentId: 'ncert-12-chem',
            level: 3,
            code: 'NCERT-12-CHEM-01',
            name: 'Solutions',
            nameEn: 'Solutions',
            nameHi: 'विलयन',
            board: 'NCERT',
            grade: '12',
            subject: 'Chemistry',
            coveragePercent: 65,
            totalResources: 15,
            order: 1,
            isActive: true,
          },
          {
            id: 'ncert-12-chem-02',
            parentId: 'ncert-12-chem',
            level: 3,
            code: 'NCERT-12-CHEM-02',
            name: 'Electrochemistry',
            nameEn: 'Electrochemistry',
            nameHi: 'वैद्युत रसायन',
            board: 'NCERT',
            grade: '12',
            subject: 'Chemistry',
            coveragePercent: 80,
            totalResources: 20,
            order: 2,
            isActive: true,
          },
        ],
      },
      {
        id: 'ncert-12-math',
        parentId: 'ncert-12',
        level: 2,
        code: 'NCERT-12-MATH',
        name: 'Mathematics',
        nameEn: 'Mathematics',
        nameHi: 'गणित',
        board: 'NCERT',
        grade: '12',
        subject: 'Math',
        coveragePercent: 85,
        totalResources: 70,
        order: 2,
        isActive: true,
        children: [
          {
            id: 'ncert-12-math-01',
            parentId: 'ncert-12-math',
            level: 3,
            code: 'NCERT-12-MATH-01',
            name: 'Relations and Functions',
            nameEn: 'Relations and Functions',
            nameHi: 'संबंध एवं फलन',
            board: 'NCERT',
            grade: '12',
            subject: 'Math',
            coveragePercent: 90,
            totalResources: 18,
            order: 1,
            isActive: true,
          },
          {
            id: 'ncert-12-math-02',
            parentId: 'ncert-12-math',
            level: 3,
            code: 'NCERT-12-MATH-02',
            name: 'Inverse Trigonometric Functions',
            nameEn: 'Inverse Trigonometric Functions',
            nameHi: 'प्रतिलोम त्रिकोणमितीय फलन',
            board: 'NCERT',
            grade: '12',
            subject: 'Math',
            coveragePercent: 75,
            totalResources: 12,
            order: 2,
            isActive: true,
          },
        ],
      },
    ],
  },
];

const MOCK_DOWNLOADS: OfflineContent[] = [
  {
    id: 'd1',
    userId: 'user1',
    resourceType: 'video',
    resourceId: 'v1',
    resourceName: 'Electric Charges - Complete Lecture',
    status: 'completed',
    downloadProgress: 100,
    downloadedBytes: 125000000,
    totalBytes: 125000000,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 30),
    syncVersion: 1,
  },
  {
    id: 'd2',
    userId: 'user1',
    resourceType: 'note',
    resourceId: 'n1',
    resourceName: 'Electrostatics Formula Sheet',
    status: 'downloading',
    downloadProgress: 65,
    downloadedBytes: 3250000,
    totalBytes: 5000000,
    syncVersion: 1,
  },
  {
    id: 'd3',
    userId: 'user1',
    resourceType: 'question_set',
    resourceId: 'qs1',
    resourceName: 'JEE Main Physics Set - Electrostatics',
    status: 'pending',
    downloadProgress: 0,
    downloadedBytes: 0,
    totalBytes: 15000000,
    syncVersion: 1,
  },
];

const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    userId: 'user1',
    name: 'JEE Physics Mastery',
    description: 'Complete physics preparation for JEE Main & Advanced',
    subject: 'Physics',
    grade: '12',
    playlistType: 'custom',
    isPublic: true,
    shareCode: 'JEE-PHYS-2024',
    itemCount: 5,
    viewCount: 234,
    copyCount: 12,
    order: 0,
    tags: ['JEE', 'Physics', 'Class 12'],
    items: [
      { id: 'pi1', playlistId: 'p1', resourceType: 'video', resourceId: 'v1', resourceName: 'Electric Charges - Complete Lecture', sortOrder: 0, progress: 100, completedAt: new Date() },
      { id: 'pi2', playlistId: 'p1', resourceType: 'note', resourceId: 'n1', resourceName: 'Electrostatics Formula Sheet', sortOrder: 1, progress: 80 },
      { id: 'pi3', playlistId: 'p1', resourceType: 'question', resourceId: 'q1', resourceName: 'PYQ: Electric Field Problems', sortOrder: 2, progress: 45 },
      { id: 'pi4', playlistId: 'p1', resourceType: 'video', resourceId: 'v2', resourceName: 'Gauss Law Applications', sortOrder: 3, progress: 0 },
      { id: 'pi5', playlistId: 'p1', resourceType: 'question_set', resourceId: 'qs1', resourceName: 'JEE Main Electrostatics', sortOrder: 4, progress: 0 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    userId: 'user1',
    name: 'Board Exam Quick Revision',
    description: 'Essential topics for CBSE board exams',
    subject: 'Physics',
    grade: '12',
    playlistType: 'teacher',
    isPublic: false,
    itemCount: 3,
    viewCount: 89,
    copyCount: 5,
    order: 1,
    items: [
      { id: 'pi6', playlistId: 'p2', resourceType: 'note', resourceId: 'n2', resourceName: 'Important Derivations', sortOrder: 0, progress: 60 },
      { id: 'pi7', playlistId: 'p2', resourceType: 'video', resourceId: 'v3', resourceName: 'Board Pattern Questions', sortOrder: 1, progress: 30 },
      { id: 'pi8', playlistId: 'p2', resourceType: 'note', resourceId: 'n3', resourceName: 'Key Formulas - All Chapters', sortOrder: 2, progress: 100, completedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_RESOURCES: LibraryResource[] = [
  {
    id: 'v1',
    type: 'video',
    name: 'Electric Charges - Complete Lecture',
    nameHi: 'वैद्युत आवेश - संपूर्ण व्याख्यान',
    description: 'Comprehensive coverage of electric charges, Coulomb\'s law, and electric fields',
    duration: 3600,
    difficulty: 'medium',
    subject: 'Physics',
    topic: 'Electric Charges and Fields',
    curriculumAlignments: [],
    languages: ['en', 'hi'],
    isDownloaded: true,
    progress: 100,
    tags: ['JEE', 'NCERT', 'Electrostatics'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'n1',
    type: 'note',
    name: 'Electrostatics Formula Sheet',
    nameHi: 'स्थिरवैद्युत सूत्र पत्रक',
    description: 'All important formulas for electrostatics chapter',
    pageCount: 12,
    difficulty: 'easy',
    subject: 'Physics',
    topic: 'Electrostatics',
    curriculumAlignments: [],
    languages: ['en'],
    progress: 80,
    tags: ['Formula', 'Quick Revision'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================
// Resource Card Component
// ============================================================

interface ResourceCardProps {
  resource: LibraryResource;
  language: 'en' | 'hi' | 'both';
  viewMode: 'grid' | 'list';
  onDownload?: () => void;
  onBookmark?: () => void;
  onView?: () => void;
  onAddToPlaylist?: () => void;
}

function ResourceCard({ 
  resource, 
  language, 
  viewMode,
  onDownload, 
  onBookmark, 
  onView,
  onAddToPlaylist 
}: ResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(resource.bookmarked);
  
  const getName = () => {
    if (language === 'hi' && resource.nameHi) return resource.nameHi;
    return resource.name;
  };
  
  const RESOURCE_ICONS: Record<ResourceType, React.ElementType> = {
    video: Video,
    note: FileText,
    question: HelpCircle,
    book: BookOpen,
    question_set: HelpCircle,
  };
  
  const Icon = RESOURCE_ICONS[resource.type];
  
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
        onClick={onView}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-7 h-7 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{getName()}</h3>
          <p className="text-sm text-gray-500 truncate">{resource.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {resource.duration && <span>{Math.round(resource.duration / 60)} min</span>}
          {resource.difficulty && (
            <Badge variant="outline" className="text-xs">{resource.difficulty}</Badge>
          )}
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1"
            >
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}>
                <Heart className={cn("w-4 h-4", isBookmarked && "fill-red-500 text-red-500")} />
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAddToPlaylist?.(); }}>
                Add
              </Button>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onDownload?.(); }}>
                <Download className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      layout
      className="bg-white rounded-xl border hover:border-blue-200 hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
      onClick={onView}
    >
      {/* Thumbnail */}
      <div className="h-32 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-12 h-12 text-blue-400/50" />
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            {resource.type}
          </Badge>
        </div>
        
        {/* Offline indicator */}
        {resource.isDownloaded && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-600 text-xs">
              <Download className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          </div>
        )}
        
        {/* Duration */}
        {resource.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.round(resource.duration / 60)} min
          </div>
        )}
        
        {/* Progress Overlay */}
        {resource.progress && resource.progress > 0 && resource.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${resource.progress}%` }}
            />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{getName()}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {resource.subject && (
            <Badge variant="outline" className="text-xs">{resource.subject}</Badge>
          )}
          {resource.difficulty && (
            <Badge variant="outline" className="text-xs">{resource.difficulty}</Badge>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Eye className="w-3 h-3" />
            <span>1.2k views</span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}>
              <Heart className={cn("w-4 h-4", isBookmarked && "fill-red-500 text-red-500")} />
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={(e) => { e.stopPropagation(); onAddToPlaylist?.(); }}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); onDownload?.(); }}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Cognify Library Component
// ============================================================

interface CognifyLibraryProps {
  userId: string;
  className?: string;
}

export function CognifyLibrary({ userId, className }: CognifyLibraryProps) {
  const [activeTab, setActiveTab] = useState('curriculum');
  const [language, setLanguage] = useState<'en' | 'hi' | 'both'>('en');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  
  // State
  const [curriculum, setCurriculum] = useState<CurriculumNode[]>(MOCK_CURRICULUM);
  const [downloads, setDownloads] = useState<OfflineContent[]>(MOCK_DOWNLOADS);
  const [playlists, setPlaylists] = useState<Playlist[]>(MOCK_PLAYLISTS);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | undefined>(playlists[0]);
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  
  // Handlers
  const handleCreatePlaylist = useCallback((name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: `p-${Date.now()}`,
      userId,
      name,
      description,
      playlistType: 'custom',
      isPublic: false,
      itemCount: 0,
      viewCount: 0,
      copyCount: 0,
      order: playlists.length,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    setCurrentPlaylist(newPlaylist);
  }, [userId, playlists.length]);
  
  const handleDeletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylist(undefined);
    }
  }, [currentPlaylist]);
  
  const handleSharePlaylist = useCallback((playlistId: string, shareType: 'user' | 'group' | 'public_link') => {
    console.log('Share playlist:', playlistId, shareType);
    // In production, this would call the API
  }, []);
  
  const handleCopyPlaylist = useCallback((playlistId: string) => {
    const original = playlists.find(p => p.id === playlistId);
    if (original) {
      const copy: Playlist = {
        ...original,
        id: `p-${Date.now()}`,
        name: `${original.name} (Copy)`,
        isPublic: false,
        shareCode: undefined,
        viewCount: 0,
        copyCount: 0,
        items: original.items.map(item => ({ ...item, id: `pi-${Date.now()}-${item.id}` })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPlaylists(prev => [...prev, copy]);
    }
  }, [playlists]);
  
  const handleAddItem = useCallback((playlistId: string, item: Omit<PlaylistItem, 'id' | 'playlistId' | 'sortOrder'>) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          items: [...p.items, { ...item, id: `pi-${Date.now()}`, playlistId, sortOrder: p.items.length }],
          itemCount: p.itemCount + 1,
        };
      }
      return p;
    }));
  }, []);
  
  const handleRemoveItem = useCallback((playlistId: string, itemId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          items: p.items.filter(i => i.id !== itemId),
          itemCount: Math.max(0, p.itemCount - 1),
        };
      }
      return p;
    }));
  }, []);
  
  const handleReorderItems = useCallback((playlistId: string, itemIds: string[]) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const items = itemIds.map((id, index) => {
          const existingItem = p.items.find(i => i.id === id);
          return existingItem ? { ...existingItem, sortOrder: index } : null;
        }).filter(Boolean) as PlaylistItem[];
        return { ...p, items };
      }
      return p;
    }));
  }, []);
  
  const handleDownload = useCallback((resource: { type: ResourceType; id: string; name: string }) => {
    const newDownload: OfflineContent = {
      id: `d-${Date.now()}`,
      userId,
      resourceType: resource.type,
      resourceId: resource.id,
      resourceName: resource.name,
      status: 'pending',
      downloadProgress: 0,
      downloadedBytes: 0,
      totalBytes: 10000000,
      syncVersion: 1,
    };
    setDownloads(prev => [...prev, newDownload]);
  }, [userId]);
  
  const handlePauseDownload = useCallback((downloadId: string) => {
    setDownloads(prev => prev.map(d => 
      d.id === downloadId ? { ...d, status: 'pending' } : d
    ));
  }, []);
  
  const handleResumeDownload = useCallback((downloadId: string) => {
    setDownloads(prev => prev.map(d => 
      d.id === downloadId ? { ...d, status: 'downloading' } : d
    ));
  }, []);
  
  const handleDeleteDownload = useCallback((downloadId: string) => {
    setDownloads(prev => prev.filter(d => d.id !== downloadId));
  }, []);
  
  const handleSync = useCallback(async () => {
    console.log('Syncing offline content...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);
  
  const handleNodeSelect = useCallback((node: CurriculumNode) => {
    setSelectedNode(node);
  }, []);
  
  // Simulate download progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => prev.map(d => {
        if (d.status === 'downloading' && d.downloadProgress < 100) {
          const newProgress = Math.min(d.downloadProgress + 5, 100);
          return {
            ...d,
            downloadProgress: newProgress,
            downloadedBytes: Math.round((newProgress / 100) * (d.totalBytes || 0)),
            status: newProgress >= 100 ? 'completed' : 'downloading',
            lastSyncedAt: newProgress >= 100 ? new Date() : d.lastSyncedAt,
          };
        }
        return d;
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate stats
  const totalCoverage = useMemo(() => {
    // Simple average calculation for demo
    return 78;
  }, [curriculum]);
  
  const downloadingCount = downloads.filter(d => d.status === 'downloading').length;
  
  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30", className)}>
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cognify Library</h1>
                <p className="text-xs text-gray-500">Curriculum-aligned resources for NCERT, CBSE & more</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Online Status */}
              <motion.button
                onClick={() => setIsOnline(!isOnline)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                  isOnline ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'Online' : 'Offline'}
              </motion.button>
              
              {/* Language Toggle */}
              <LanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
                mode="compact"
              />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? "संसाधन खोजें..." : "Search resources, chapters, topics..."}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="w-8 h-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="w-8 h-8"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-6 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
              <TabsTrigger
                value="curriculum"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-transparent pb-3 pt-2 px-4 gap-2"
              >
                <TreeDeciduous className="w-4 h-4" />
                Curriculum
              </TabsTrigger>
              <TabsTrigger
                value="downloads"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-transparent pb-3 pt-2 px-4 gap-2"
              >
                <Download className="w-4 h-4" />
                Downloads
                {downloadingCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-blue-500"
                  />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-transparent pb-3 pt-2 px-4 gap-2"
              >
                <ListMusic className="w-4 h-4" />
                Playlists
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'curriculum' && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto p-6"
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Curriculum Tree */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <TreeDeciduous className="w-5 h-5 text-blue-500" />
                        NCERT Class 12 Syllabus
                      </h3>
                      <Badge variant="outline" className="gap-1">
                        <Layers className="w-3 h-3" />
                        {curriculum[0]?.totalResources || 0} resources
                      </Badge>
                    </div>
                    <CurriculumTreeView
                      nodes={curriculum}
                      language={language}
                      onNodeSelect={handleNodeSelect}
                      showPathView={true}
                    />
                  </div>
                </div>
                
                {/* Side Panel */}
                <div className="space-y-4">
                  {/* Language Settings */}
                  <LanguageToggle
                    currentLanguage={language}
                    onLanguageChange={setLanguage}
                    mode="expanded"
                  />
                  
                  {/* Quick Stats */}
                  <motion.div 
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Your Progress
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-blue-100">Syllabus Coverage</span>
                          <span className="font-bold">{totalCoverage}%</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalCoverage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">124</div>
                          <div className="text-xs text-blue-100">Resources Viewed</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">32</div>
                          <div className="text-xs text-blue-100">Topics Mastered</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-white/20">
                        <span className="text-blue-100">Study Streak</span>
                        <span className="font-bold flex items-center gap-1">
                          🔥 7 days
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Selected Node Info */}
                  {selectedNode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border p-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Selected Topic
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'hi' && selectedNode.nameHi ? selectedNode.nameHi : selectedNode.name}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{selectedNode.totalResources} resources</span>
                        <span>{selectedNode.coveragePercent}% complete</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'downloads' && (
            <motion.div
              key="downloads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto p-6"
            >
              <div className="max-w-3xl mx-auto">
                <OfflineDownloadManager
                  downloads={downloads}
                  onDownload={handleDownload}
                  onPause={handlePauseDownload}
                  onResume={handleResumeDownload}
                  onDelete={handleDeleteDownload}
                  onSync={handleSync}
                />
              </div>
            </motion.div>
          )}
          
          {activeTab === 'playlists' && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <PlaylistManager
                playlists={playlists}
                currentPlaylist={currentPlaylist}
                onCreatePlaylist={handleCreatePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onReorderItems={handleReorderItems}
                onSharePlaylist={handleSharePlaylist}
                onCopyPlaylist={handleCopyPlaylist}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CognifyLibrary;
