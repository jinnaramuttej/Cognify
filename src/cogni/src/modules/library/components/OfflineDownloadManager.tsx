/**
 * Cognify Library - Offline Download Manager Component
 * 
 * Features:
 * - Download progress visualization with animations
 * - Pause/Resume/Cancel controls
 * - Sync status indicators with real-time sync
 * - Storage management
 * - Bookmarks, Notes, and Highlights sync
 * - Offline mode indicator
 */

"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  HardDrive,
  Clock,
  MoreVertical,
  FolderSync,
  Cloud,
  CloudOff,
  Bookmark,
  FileText,
  Highlighter,
  StickyNote,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  CloudDownload,
  Zap,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { OfflineContent, DownloadManagerProps, ResourceType, UserSyncData } from '@/lib/library/types';

// ============================================================
// Helpers
// ============================================================

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  video: 'Video',
  note: 'Notes',
  question: 'Question',
  book: 'Book',
  question_set: 'Question Set',
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string; bgClass: string }> = {
  pending: { icon: Clock, color: 'text-gray-400', label: 'Pending', bgClass: 'bg-gray-100' },
  downloading: { icon: Download, color: 'text-blue-500', label: 'Downloading', bgClass: 'bg-blue-100' },
  completed: { icon: CheckCircle, color: 'text-green-500', label: 'Completed', bgClass: 'bg-green-100' },
  failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed', bgClass: 'bg-red-100' },
};

const SYNC_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  bookmark: { icon: Bookmark, color: 'text-blue-500', label: 'Bookmark' },
  note: { icon: StickyNote, color: 'text-purple-500', label: 'Note' },
  highlight: { icon: Highlighter, color: 'text-yellow-500', label: 'Highlight' },
  progress: { icon: RefreshCw, color: 'text-green-500', label: 'Progress' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================================
// Sync Data Item Component
// ============================================================

interface SyncDataItemProps {
  data: UserSyncData;
  onResolve?: () => void;
}

function SyncDataItem({ data, onResolve }: SyncDataItemProps) {
  const config = SYNC_TYPE_CONFIG[data.dataType] || SYNC_TYPE_CONFIG.bookmark;
  const Icon = config.icon;
  const hasConflict = data.syncStatus === 'conflict';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        hasConflict ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        hasConflict ? "bg-amber-100" : "bg-gray-50"
      )}>
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {config.label}
          </span>
          {hasConflict && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-600">
              Conflict
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {formatTimeAgo(data.lastModified)} • v{data.serverVersion}
        </p>
      </div>
      
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
        data.syncStatus === 'synced' ? "bg-green-50 text-green-600" :
        data.syncStatus === 'pending' ? "bg-blue-50 text-blue-600" :
        "bg-amber-50 text-amber-600"
      )}>
        {data.syncStatus === 'synced' ? (
          <Cloud className="w-3 h-3" />
        ) : data.syncStatus === 'pending' ? (
          <CloudUpload className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
        {data.syncStatus}
      </div>
      
      {hasConflict && onResolve && (
        <Button size="sm" variant="outline" onClick={onResolve}>
          Resolve
        </Button>
      )}
    </motion.div>
  );
}

// ============================================================
// Download Item Component
// ============================================================

interface DownloadItemProps {
  download: OfflineContent;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
}

function DownloadItem({ download, onPause, onResume, onDelete }: DownloadItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const status = STATUS_CONFIG[download.status];
  const StatusIcon = status.icon;
  
  const isDownloading = download.status === 'downloading';
  const isPaused = download.status === 'pending' && download.downloadProgress > 0;
  const isCompleted = download.status === 'completed';
  const isFailed = download.status === 'failed';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "p-4 rounded-xl border bg-white transition-all group",
        isCompleted && "border-green-200 bg-gradient-to-r from-green-50/50 to-white",
        isFailed && "border-red-200 bg-red-50/50",
        !isCompleted && !isFailed && "border-gray-200 hover:border-blue-200 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
          isCompleted && "bg-green-100",
          isFailed && "bg-red-100",
          isDownloading && "bg-blue-100",
          isPaused && "bg-amber-100",
          !isCompleted && !isFailed && !isDownloading && !isPaused && "bg-gray-100"
        )}>
          {isDownloading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <StatusIcon className={cn("w-5 h-5", status.color)} />
            </motion.div>
          ) : (
            <StatusIcon className={cn("w-5 h-5", status.color)} />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-gray-900 truncate">{download.resourceName}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {RESOURCE_TYPE_LABELS[download.resourceType as ResourceType]}
              </p>
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {status.label}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          {!isCompleted && !isFailed && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-medium">{Math.round(download.downloadProgress)}%</span>
                <span>
                  {formatBytes(download.downloadedBytes)}
                  {download.totalBytes && ` / ${formatBytes(download.totalBytes)}`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${download.downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {isDownloading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          )}
          
          {/* Completed Info */}
          {isCompleted && (
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                {formatBytes(download.downloadedBytes)}
              </span>
              {download.lastSyncedAt && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Synced {formatTimeAgo(download.lastSyncedAt)}
                </span>
              )}
            </div>
          )}
          
          {/* Failed Message */}
          {isFailed && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Download failed. Check your connection and try again.
            </p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isDownloading && (
            <Button size="icon" variant="ghost" onClick={onPause} className="h-8 w-8">
              <Pause className="w-4 h-4" />
            </Button>
          )}
          {isPaused && (
            <Button size="icon" variant="ghost" onClick={onResume} className="h-8 w-8">
              <Play className="w-4 h-4" />
            </Button>
          )}
          {isFailed && (
            <Button size="icon" variant="ghost" onClick={onResume} className="h-8 w-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {!isCompleted && !isDownloading && (
            <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8">
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          )}
          {isCompleted && (
            <div className="relative">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setShowMenu(!showMenu)}
                className="h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border p-1 z-10 min-w-[120px]"
                  >
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Download Manager Component
// ============================================================

export function OfflineDownloadManager({
  downloads,
  onDownload,
  onPause,
  onResume,
  onDelete,
  onSync,
}: DownloadManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('downloads');
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  
  // Mock sync data
  const [syncData] = useState<UserSyncData[]>([
    {
      id: 'sync1',
      userId: 'user1',
      resourceType: 'video',
      resourceId: 'v1',
      dataType: 'bookmark',
      data: JSON.stringify({ timestamp: 120, note: 'Important concept' }),
      syncStatus: 'synced',
      lastModified: new Date(Date.now() - 1000 * 60 * 5),
      serverVersion: 3,
    },
    {
      id: 'sync2',
      userId: 'user1',
      resourceType: 'note',
      resourceId: 'n1',
      dataType: 'highlight',
      data: JSON.stringify({ text: 'Key formula', color: 'yellow' }),
      syncStatus: 'pending',
      lastModified: new Date(Date.now() - 1000 * 60 * 2),
      serverVersion: 1,
    },
    {
      id: 'sync3',
      userId: 'user1',
      resourceType: 'video',
      resourceId: 'v2',
      dataType: 'note',
      data: JSON.stringify({ content: 'Remember this for exam' }),
      syncStatus: 'synced',
      lastModified: new Date(Date.now() - 1000 * 60 * 30),
      serverVersion: 2,
    },
  ]);
  
  // Calculate storage stats
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const totalBytes = completedDownloads.reduce((sum, d) => sum + d.downloadedBytes, 0);
  const downloadingCount = downloads.filter(d => d.status === 'downloading').length;
  const pendingSync = syncData.filter(s => s.syncStatus === 'pending').length;
  const conflicts = syncData.filter(s => s.syncStatus === 'conflict').length;
  
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Offline Content</h3>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
            isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Offline Mode
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Storage Summary */}
      <motion.div 
        className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Downloaded Content
          </span>
          <span className="font-bold text-blue-600 text-lg">{formatBytes(totalBytes)}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-2 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{completedDownloads.length}</div>
            <div className="text-xs text-gray-500">Available Offline</div>
          </div>
          <div className="text-center p-2 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{downloadingCount}</div>
            <div className="text-xs text-gray-500">Downloading</div>
          </div>
          <div className="text-center p-2 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{syncData.length}</div>
            <div className="text-xs text-gray-500">Synced Items</div>
          </div>
        </div>
        
        {/* Sync status indicators */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-100/50">
          {pendingSync > 0 && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <CloudUpload className="w-3 h-3" />
              {pendingSync} pending sync
            </span>
          )}
          {conflicts > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="w-3 h-3" />
              {conflicts} conflicts
            </span>
          )}
          {pendingSync === 0 && conflicts === 0 && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              All synced
            </span>
          )}
        </div>
      </motion.div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="downloads" className="gap-2">
            <Download className="w-4 h-4" />
            Downloads
            {downloadingCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 text-[10px]">
                {downloadingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-2">
            <FolderSync className="w-4 h-4" />
            Sync Data
            {pendingSync > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 text-[10px]">
                {pendingSync}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Downloads Tab */}
        <TabsContent value="downloads" className="mt-4">
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {downloads.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Cloud className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No offline content yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Mark resources for offline access to study anywhere
                  </p>
                </motion.div>
              ) : (
                downloads.map((download) => (
                  <DownloadItem
                    key={download.id}
                    download={download}
                    onPause={() => onPause(download.id)}
                    onResume={() => onResume(download.id)}
                    onDelete={() => onDelete(download.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
        
        {/* Sync Tab */}
        <TabsContent value="sync" className="mt-4">
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {/* Sync type summary */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Object.entries(SYNC_TYPE_CONFIG).map(([type, config]) => {
                const count = syncData.filter(s => s.dataType === type).length;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-3 bg-white rounded-lg border"
                  >
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", config.color)} />
                    <div className="text-lg font-bold text-gray-900">{count}</div>
                    <div className="text-[10px] text-gray-400">{config.label}s</div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Sync items list */}
            <AnimatePresence mode="popLayout">
              {syncData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FolderSync className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No sync data</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your bookmarks, notes, and highlights will sync here
                  </p>
                </motion.div>
              ) : (
                syncData.map((data) => (
                  <SyncDataItem
                    key={data.id}
                    data={data}
                    onResolve={() => {}}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Offline Mode Notice */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Offline Mode Active</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your changes will sync automatically when you're back online.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default OfflineDownloadManager;
