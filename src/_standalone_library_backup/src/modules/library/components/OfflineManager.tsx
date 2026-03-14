'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Download,
  DownloadCloud,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  Wifi,
  WifiOff,
  HardDrive,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  FileText,
  Video,
  Headphones,
  Layers,
  Smartphone,
  ArrowRight,
  Bookmark,
  Highlighter,
  StickyNote,
  RotateCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface OfflineResource {
  id: string
  title: string
  type: 'Notes' | 'Video' | 'Audio' | 'PDF' | 'Interactive' | 'Quiz'
  subject: string
  chapter: string
  size: number // in MB
  downloadedAt?: string
  expiresAt?: string
  progress: number // 0-100
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'error' | 'expired'
  downloadSpeed?: string
  error?: string
}

export interface SyncItem {
  id: string
  type: 'bookmark' | 'note' | 'highlight'
  resourceId: string
  resourceTitle: string
  action: 'create' | 'update' | 'delete'
  timestamp: string
  synced: boolean
}

export interface OfflineManagerProps {
  offlineResources?: OfflineResource[]
  syncQueue?: SyncItem[]
  onDownload?: (resourceId: string) => void
  onPause?: (resourceId: string) => void
  onResume?: (resourceId: string) => void
  onDelete?: (resourceId: string) => void
  onSyncNow?: () => void
  onClearSyncedItems?: () => void
  className?: string
}

// Type icons
const typeIcons: Record<string, React.ElementType> = {
  Notes: FileText,
  Video: Video,
  Audio: Headphones,
  PDF: FileText,
  Interactive: Layers,
  Quiz: Layers,
}

// Sync type icons
const syncTypeIcons: Record<string, React.ElementType> = {
  bookmark: Bookmark,
  note: StickyNote,
  highlight: Highlighter,
}

// Status colors
const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
  downloading: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Download },
  paused: { bg: 'bg-amber-100', text: 'text-amber-600', icon: Pause },
  completed: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle2 },
  error: { bg: 'bg-red-100', text: 'text-red-600', icon: AlertCircle },
  expired: { bg: 'bg-orange-100', text: 'text-orange-600', icon: Clock },
}

// Format file size
function formatSize(mb: number): string {
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(1)} MB`
}

// Download Item Component
function DownloadItem({
  resource,
  onPause,
  onResume,
  onDelete,
}: {
  resource: OfflineResource
  onPause?: () => void
  onResume?: () => void
  onDelete?: () => void
}) {
  const TypeIcon = typeIcons[resource.type] || FileText
  const status = statusColors[resource.status]
  const StatusIcon = status.icon
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-white rounded-xl border border-gray-100 hover:border-violet-200 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          resource.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
        )}>
          <TypeIcon className={cn(
            'h-5 w-5',
            resource.status === 'completed' ? 'text-green-600' : 'text-gray-500'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title & Meta */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-gray-900 truncate">{resource.title}</h4>
              <p className="text-sm text-gray-500">{resource.subject} • {resource.chapter}</p>
            </div>
            
            <Badge
              variant="secondary"
              className={cn('flex-shrink-0', status.bg, status.text, 'border-0')}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {resource.status}
            </Badge>
          </div>
          
          {/* Progress Bar (for downloading) */}
          {resource.status === 'downloading' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>{resource.progress}% complete</span>
                <span>{resource.downloadSpeed || 'Calculating...'}</span>
              </div>
              <Progress value={resource.progress} className="h-2" />
            </div>
          )}
          
          {/* Size & Status Info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5" />
              {formatSize(resource.size)}
            </span>
            
            {resource.downloadedAt && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Downloaded {resource.downloadedAt}
              </span>
            )}
            
            {resource.expiresAt && (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Expires {resource.expiresAt}
              </span>
            )}
            
            {resource.error && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {resource.error}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {resource.status === 'downloading' && (
              <DropdownMenuItem onClick={onPause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </DropdownMenuItem>
            )}
            {resource.status === 'paused' && (
              <DropdownMenuItem onClick={onResume}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </DropdownMenuItem>
            )}
            {resource.status === 'error' && (
              <DropdownMenuItem onClick={onResume}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

// Sync Item Component
function SyncQueueItem({ item }: { item: SyncItem }) {
  const SyncIcon = syncTypeIcons[item.type] || Bookmark
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        item.synced ? 'bg-green-50' : 'bg-amber-50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        item.synced ? 'bg-green-100' : 'bg-amber-100'
      )}>
        <SyncIcon className={cn('h-4 w-4', item.synced ? 'text-green-600' : 'text-amber-600')} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{item.resourceTitle}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className="capitalize">{item.type}</span>
          <span>•</span>
          <span>{item.action}</span>
          <span>•</span>
          <span>{item.timestamp}</span>
        </div>
      </div>
      
      {item.synced ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Clock className="h-4 w-4 text-amber-500" />
      )}
    </motion.div>
  )
}

// Demo data generators
function generateDemoResources(): OfflineResource[] {
  return [
    {
      id: '1',
      title: 'Electrostatics Complete Notes',
      type: 'Notes',
      subject: 'Physics',
      chapter: 'Electrostatics',
      size: 2.5,
      progress: 100,
      status: 'completed',
      downloadedAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Organic Chemistry Video Lecture',
      type: 'Video',
      subject: 'Chemistry',
      chapter: 'Organic Chemistry',
      size: 156,
      progress: 67,
      status: 'downloading',
      downloadSpeed: '2.4 MB/s',
    },
    {
      id: '3',
      title: 'Calculus Practice Problems',
      type: 'PDF',
      subject: 'Mathematics',
      chapter: 'Calculus',
      size: 8.2,
      progress: 45,
      status: 'paused',
    },
    {
      id: '4',
      title: 'NEET Biology PYQs',
      type: 'Quiz',
      subject: 'Biology',
      chapter: 'All Chapters',
      size: 1.2,
      progress: 0,
      status: 'pending',
    },
    {
      id: '5',
      title: 'Mechanics Video Series',
      type: 'Video',
      subject: 'Physics',
      chapter: 'Mechanics',
      size: 320,
      progress: 0,
      status: 'error',
      error: 'Insufficient storage',
    },
  ]
}

function generateSyncQueue(): SyncItem[] {
  return [
    { id: 's1', type: 'bookmark', resourceId: 'r1', resourceTitle: 'Thermodynamics Notes', action: 'create', timestamp: '2 min ago', synced: false },
    { id: 's2', type: 'highlight', resourceId: 'r2', resourceTitle: 'Organic Chemistry', action: 'update', timestamp: '5 min ago', synced: true },
    { id: 's3', type: 'note', resourceId: 'r3', resourceTitle: 'Calculus Problems', action: 'create', timestamp: '10 min ago', synced: true },
  ]
}

// Storage Stats Component
function StorageStats({ resources }: { resources: OfflineResource[] }) {
  const totalSize = resources.reduce((sum, r) => sum + r.size, 0)
  const downloadedSize = resources
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.size, 0)
  const usedPercentage = Math.min((downloadedSize / 500) * 100, 100) // Assuming 500MB limit
  
  return (
    <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Offline Storage</h3>
          <p className="text-sm text-gray-500">{formatSize(downloadedSize)} of 500 MB used</p>
        </div>
      </div>
      
      <Progress value={usedPercentage} className="h-2 mb-3" />
      
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg p-2">
          <div className="text-lg font-bold text-green-600">
            {resources.filter(r => r.status === 'completed').length}
          </div>
          <div className="text-xs text-gray-500">Downloaded</div>
        </div>
        <div className="bg-white rounded-lg p-2">
          <div className="text-lg font-bold text-blue-600">
            {resources.filter(r => r.status === 'downloading').length}
          </div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-lg p-2">
          <div className="text-lg font-bold text-gray-600">
            {resources.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-xs text-gray-500">Queued</div>
        </div>
      </div>
    </Card>
  )
}

export function OfflineManager({
  offlineResources: providedResources,
  syncQueue: providedSyncQueue,
  onDownload,
  onPause,
  onResume,
  onDelete,
  onSyncNow,
  className,
}: OfflineManagerProps) {
  const [resources, setResources] = useState(providedResources || generateDemoResources())
  const [syncQueue, setSyncQueue] = useState(providedSyncQueue || generateSyncQueue())
  const [isOnline, setIsOnline] = useState(true)
  const [activeTab, setActiveTab] = useState<'downloads' | 'sync'>('downloads')
  
  // Simulate download progress
  useEffect(() => {
    if (!providedResources) {
      const interval = setInterval(() => {
        setResources(prev => prev.map(r => {
          if (r.status === 'downloading' && r.progress < 100) {
            const newProgress = Math.min(r.progress + 5, 100)
            return {
              ...r,
              progress: newProgress,
              status: newProgress >= 100 ? 'completed' as const : 'downloading' as const,
              downloadedAt: newProgress >= 100 ? 'Just now' : r.downloadedAt,
            }
          }
          return r
        }))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [providedResources])
  
  const handleSync = useCallback(() => {
    onSyncNow?.()
    // Simulate sync
    setSyncQueue(prev => prev.map(item => ({ ...item, synced: true })))
  }, [onSyncNow])
  
  const pendingSyncCount = syncQueue.filter(s => !s.synced).length
  const activeDownloads = resources.filter(r => r.status === 'downloading')
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <DownloadCloud className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Offline Library</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-green-500" />
                  Online • Synced
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                  Offline Mode
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sync Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 hover:border-violet-300 relative"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Sync
                {pendingSyncCount > 0 && (
                  <Badge className="ml-1.5 h-5 px-1.5 bg-amber-500 text-white border-0">
                    {pendingSyncCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-96">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-violet-500" />
                  Sync Status
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {/* Sync Status */}
                <div className={cn(
                  'p-4 rounded-xl',
                  pendingSyncCount > 0 ? 'bg-amber-50' : 'bg-green-50'
                )}>
                  <div className="flex items-center gap-3">
                    {pendingSyncCount > 0 ? (
                      <>
                        <CloudOff className="h-6 w-6 text-amber-500" />
                        <div>
                          <div className="font-medium text-gray-900">{pendingSyncCount} items pending</div>
                          <div className="text-sm text-gray-500">Changes need to be synced</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-900">All synced</div>
                          <div className="text-sm text-gray-500">Last synced just now</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={handleSync}
                  disabled={pendingSyncCount === 0}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
                
                {/* Sync Queue */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Recent Changes</h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {syncQueue.map(item => (
                        <SyncQueueItem key={item.id} item={item} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Download All */}
          <Button
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Storage Stats */}
        <div className="lg:col-span-1 space-y-4">
          <StorageStats resources={resources} />
          
          {/* Quick Actions */}
          <Card className="p-4 border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-gray-200 hover:border-violet-300"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause All Downloads
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-gray-200 hover:border-violet-300 text-red-600 hover:text-red-700 hover:border-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Downloads
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Download List */}
        <div className="lg:col-span-3">
          <Card className="border-gray-100 rounded-2xl overflow-hidden">
            {/* Tab Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Button
                variant={activeTab === 'downloads' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('downloads')}
                className={cn(
                  'rounded-lg',
                  activeTab === 'downloads' && 'bg-violet-100 text-violet-700 hover:bg-violet-100'
                )}
              >
                Downloads
                {activeDownloads.length > 0 && (
                  <Badge className="ml-1.5 h-5 px-1.5 bg-violet-500 text-white border-0">
                    {activeDownloads.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'sync' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('sync')}
                className={cn(
                  'rounded-lg',
                  activeTab === 'sync' && 'bg-violet-100 text-violet-700 hover:bg-violet-100'
                )}
              >
                Sync Queue
                {pendingSyncCount > 0 && (
                  <Badge className="ml-1.5 h-5 px-1.5 bg-amber-500 text-white border-0">
                    {pendingSyncCount}
                  </Badge>
                )}
              </Button>
            </div>
            
            <ScrollArea className="h-[500px]">
              <AnimatePresence mode="wait">
                {activeTab === 'downloads' ? (
                  <motion.div
                    key="downloads"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    {resources.map(resource => (
                      <DownloadItem
                        key={resource.id}
                        resource={resource}
                        onPause={() => onPause?.(resource.id)}
                        onResume={() => onResume?.(resource.id)}
                        onDelete={() => onDelete?.(resource.id)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="sync"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    {syncQueue.map(item => (
                      <SyncQueueItem key={item.id} item={item} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OfflineManager
