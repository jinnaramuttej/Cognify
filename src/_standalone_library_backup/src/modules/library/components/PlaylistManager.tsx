'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ListMusic,
  GripVertical,
  Plus,
  Trash2,
  Share2,
  MoreVertical,
  Edit3,
  Copy,
  Users,
  Lock,
  Globe,
  FileText,
  Video,
  Headphones,
  Layers,
  Clock,
  Eye,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Mail,
  Link2,
  X,
  GripVerticalIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Types
export interface PlaylistResource {
  id: string
  order: number
  title: string
  type: 'Notes' | 'Video' | 'Audio' | 'PDF' | 'Interactive' | 'Quiz'
  subject: string
  chapter: string
  duration?: number // in minutes
  addedAt: string
}

export interface LearningPlaylist {
  id: string
  name: string
  description?: string
  ownerId: string
  ownerName: string
  isPublic: boolean
  isShared: boolean
  sharedWith: string[] // user IDs or emails
  resourceCount: number
  totalDuration: number // in minutes
  createdAt: string
  updatedAt: string
  resources: PlaylistResource[]
  tags?: string[]
  color?: string
}

export interface PlaylistManagerProps {
  playlists?: LearningPlaylist[]
  onCreatePlaylist?: (name: string, description?: string) => void
  onUpdatePlaylist?: (playlistId: string, updates: Partial<LearningPlaylist>) => void
  onDeletePlaylist?: (playlistId: string) => void
  onSharePlaylist?: (playlistId: string, emails: string[], isPublic: boolean) => void
  onResourceClick?: (resource: PlaylistResource) => void
  onReorderResources?: (playlistId: string, resources: PlaylistResource[]) => void
  onRemoveResource?: (playlistId: string, resourceId: string) => void
  className?: string
}

// Type icons
const typeIcons: Record<string, React.ElementType> = {
  Notes: FileText,
  Video: Video,
  Audio: Headphones,
  PDF: FileText,
  Interactive: Layers,
  Quiz: Sparkles,
}

// Color options for playlists
const PLAYLIST_COLORS = [
  { name: 'Violet', value: 'violet', bg: 'bg-violet-500', light: 'bg-violet-100', text: 'text-violet-700' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
  { name: 'Green', value: 'green', bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
  { name: 'Amber', value: 'amber', bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700' },
  { name: 'Rose', value: 'rose', bg: 'bg-rose-500', light: 'bg-rose-100', text: 'text-rose-700' },
  { name: 'Teal', value: 'teal', bg: 'bg-teal-500', light: 'bg-teal-100', text: 'text-teal-700' },
]

// Format duration
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Draggable Resource Item
function DraggableResourceItem({
  resource,
  onRemove,
  onClick,
}: {
  resource: PlaylistResource
  onRemove?: () => void
  onClick?: () => void
}) {
  const TypeIcon = typeIcons[resource.type] || FileText
  
  return (
    <Reorder.Item
      value={resource}
      id={resource.id}
      className="list-none"
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer group"
        onClick={onClick}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        
        {/* Order Number */}
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
          {resource.order}
        </div>
        
        {/* Type Icon */}
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <TypeIcon className="h-4 w-4 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{resource.title}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{resource.type}</span>
            <span>•</span>
            <span>{resource.subject}</span>
            {resource.duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {resource.duration} min
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    </Reorder.Item>
  )
}

// Share Dialog Component
function ShareDialog({
  playlist,
  isOpen,
  onClose,
  onShare,
}: {
  playlist: LearningPlaylist
  isOpen: boolean
  onClose: () => void
  onShare: (emails: string[], isPublic: boolean) => void
}) {
  const [emails, setEmails] = useState<string[]>(playlist.sharedWith)
  const [emailInput, setEmailInput] = useState('')
  const [isPublic, setIsPublic] = useState(playlist.isPublic)
  const [copied, setCopied] = useState(false)
  
  const shareLink = `https://cognify.app/playlist/${playlist.id}`
  
  const addEmail = () => {
    if (emailInput.trim() && !emails.includes(emailInput.trim())) {
      setEmails([...emails, emailInput.trim()])
      setEmailInput('')
    }
  }
  
  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email))
  }
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied to clipboard')
  }
  
  const handleShare = () => {
    onShare(emails, isPublic)
    onClose()
    toast.success('Playlist shared successfully')
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-violet-500" />
            Share Playlist
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Playlist Info */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="font-medium text-gray-900">{playlist.name}</div>
            <div className="text-sm text-gray-500">{playlist.resourceCount} resources • {formatDuration(playlist.totalDuration)}</div>
          </div>
          
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-green-500" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {isPublic ? 'Public' : 'Private'}
                </div>
                <div className="text-xs text-gray-500">
                  {isPublic ? 'Anyone with link can view' : 'Only invited people can view'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
              className="border-gray-200"
            >
              {isPublic ? 'Make Private' : 'Make Public'}
            </Button>
          </div>
          
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Share Link</label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Invite by Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Invite People</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              />
              <Button onClick={addEmail} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Invited Emails */}
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="bg-violet-50 text-violet-700 border-violet-200"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      className="ml-1 hover:text-violet-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Playlist Card Component
function PlaylistCard({
  playlist,
  onClick,
  onEdit,
  onShare,
  onDelete,
}: {
  playlist: LearningPlaylist
  onClick: () => void
  onEdit?: () => void
  onShare?: () => void
  onDelete?: () => void
}) {
  const colorConfig = PLAYLIST_COLORS.find(c => c.value === playlist.color) || PLAYLIST_COLORS[0]
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all">
        {/* Color Header */}
        <div className={cn('h-2', colorConfig.bg)} />
        
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorConfig.light)}>
                <ListMusic className={cn('h-5 w-5', colorConfig.text)} />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{playlist.name}</h3>
                  {playlist.isShared && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-green-50 text-green-700 border-0">
                      <Users className="h-3 w-3 mr-0.5" />
                      Shared
                    </Badge>
                  )}
                  {playlist.isPublic && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-blue-50 text-blue-700 border-0">
                      <Globe className="h-3 w-3 mr-0.5" />
                      Public
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {playlist.resourceCount} resources • {formatDuration(playlist.totalDuration)}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.() }}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare?.() }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`https://cognify.app/playlist/${playlist.id}`); toast.success('Link copied') }}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {playlist.description && (
            <p className="text-sm text-gray-500 mt-3 line-clamp-2">{playlist.description}</p>
          )}
          
          {/* Resource Preview */}
          <div className="mt-3 flex items-center gap-2">
            {playlist.resources.slice(0, 4).map((resource, index) => {
              const TypeIcon = typeIcons[resource.type] || FileText
              return (
                <div
                  key={resource.id}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                  title={resource.title}
                >
                  <TypeIcon className="h-4 w-4 text-gray-500" />
                </div>
              )
            })}
            {playlist.resourceCount > 4 && (
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                +{playlist.resourceCount - 4}
              </div>
            )}
          </div>
          
          {/* Tags */}
          {playlist.tags && playlist.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {playlist.tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-600 border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>By {playlist.ownerName}</span>
            <span>Updated {playlist.updatedAt}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Demo data generator
function generateDemoPlaylists(): LearningPlaylist[] {
  return [
    {
      id: 'p1',
      name: 'JEE Physics Crash Course',
      description: 'Essential physics topics for JEE Mains in 30 days',
      ownerId: 'user1',
      ownerName: 'Rahul Kumar',
      isPublic: false,
      isShared: true,
      sharedWith: ['friend1@email.com', 'friend2@email.com'],
      resourceCount: 12,
      totalDuration: 180,
      createdAt: '2024-01-15',
      updatedAt: '2 hours ago',
      color: 'violet',
      tags: ['JEE', 'Physics', 'Crash Course'],
      resources: [
        { id: 'r1', order: 1, title: 'Electrostatics Fundamentals', type: 'Video', subject: 'Physics', chapter: 'Electrostatics', duration: 15, addedAt: '1 day ago' },
        { id: 'r2', order: 2, title: 'Coulomb\'s Law Problems', type: 'Notes', subject: 'Physics', chapter: 'Electrostatics', duration: 10, addedAt: '1 day ago' },
        { id: 'r3', order: 3, title: 'Current Electricity', type: 'Video', subject: 'Physics', chapter: 'Current', duration: 20, addedAt: '2 days ago' },
        { id: 'r4', order: 4, title: 'Magnetism Quick Revision', type: 'Notes', subject: 'Physics', chapter: 'Magnetism', duration: 8, addedAt: '2 days ago' },
      ],
    },
    {
      id: 'p2',
      name: 'Organic Chemistry Reaction Mechanisms',
      description: 'Complete guide to understanding organic reactions',
      ownerId: 'user1',
      ownerName: 'Rahul Kumar',
      isPublic: true,
      isShared: false,
      sharedWith: [],
      resourceCount: 8,
      totalDuration: 120,
      createdAt: '2024-01-10',
      updatedAt: '1 day ago',
      color: 'green',
      tags: ['Chemistry', 'Organic'],
      resources: [
        { id: 'r5', order: 1, title: 'SN1 vs SN2 Mechanisms', type: 'Video', subject: 'Chemistry', chapter: 'Organic', duration: 18, addedAt: '3 days ago' },
        { id: 'r6', order: 2, title: 'Electrophilic Addition', type: 'Notes', subject: 'Chemistry', chapter: 'Organic', duration: 12, addedAt: '3 days ago' },
      ],
    },
    {
      id: 'p3',
      name: 'NEET Biology NCERT Highlights',
      description: 'Important NCERT points for NEET preparation',
      ownerId: 'user1',
      ownerName: 'Rahul Kumar',
      isPublic: false,
      isShared: false,
      sharedWith: [],
      resourceCount: 15,
      totalDuration: 90,
      createdAt: '2024-01-05',
      updatedAt: '3 days ago',
      color: 'teal',
      tags: ['NEET', 'Biology', 'NCERT'],
      resources: [],
    },
  ]
}

export function PlaylistManager({
  playlists: providedPlaylists,
  onCreatePlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
  onSharePlaylist,
  onResourceClick,
  onReorderResources,
  onRemoveResource,
  className,
}: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState(providedPlaylists || generateDemoPlaylists())
  const [selectedPlaylist, setSelectedPlaylist] = useState<LearningPlaylist | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [sharingPlaylist, setSharingPlaylist] = useState<LearningPlaylist | null>(null)
  const [resources, setResources] = useState<PlaylistResource[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  
  // Handle reorder
  const handleReorder = useCallback((newOrder: PlaylistResource[]) => {
    const updatedResources = newOrder.map((r, index) => ({ ...r, order: index + 1 }))
    setResources(updatedResources)
    if (selectedPlaylist) {
      onReorderResources?.(selectedPlaylist.id, updatedResources)
    }
  }, [selectedPlaylist, onReorderResources])
  
  // Handle create playlist
  const handleCreatePlaylist = useCallback(() => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist?.(newPlaylistName.trim())
      setNewPlaylistName('')
      setIsCreating(false)
      toast.success('Playlist created')
    }
  }, [newPlaylistName, onCreatePlaylist])
  
  // Open share dialog
  const openShareDialog = useCallback((playlist: LearningPlaylist) => {
    setSharingPlaylist(playlist)
    setShareDialogOpen(true)
  }, [])
  
  // Select playlist and load resources
  const handleSelectPlaylist = useCallback((playlist: LearningPlaylist) => {
    setSelectedPlaylist(playlist)
    setResources(playlist.resources)
  }, [])
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <ListMusic className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Playlists</h2>
            <p className="text-sm text-gray-500">{playlists.length} collections created</p>
          </div>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Playlist List */}
        <div className="lg:col-span-1 space-y-3">
          <ScrollArea className="h-[500px] pr-2">
            <AnimatePresence>
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => handleSelectPlaylist(playlist)}
                  onShare={() => openShareDialog(playlist)}
                  onDelete={() => {
                    onDeletePlaylist?.(playlist.id)
                    setPlaylists(prev => prev.filter(p => p.id !== playlist.id))
                    if (selectedPlaylist?.id === playlist.id) {
                      setSelectedPlaylist(null)
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </ScrollArea>
        </div>
        
        {/* Selected Playlist View */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <Card className="border-gray-100 rounded-2xl overflow-hidden">
              {/* Playlist Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{selectedPlaylist.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedPlaylist.resourceCount} resources • {formatDuration(selectedPlaylist.totalDuration)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openShareDialog(selectedPlaylist)}
                      className="border-gray-200 hover:border-violet-300"
                    >
                      <Share2 className="h-4 w-4 mr-1.5" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-violet-500 to-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Resources
                    </Button>
                  </div>
                </div>
                
                {/* Drag hint */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <GripVertical className="h-3 w-3" />
                  Drag to reorder resources
                </div>
              </div>
              
              {/* Resources List with Drag & Drop */}
              <ScrollArea className="h-[400px]">
                {resources.length > 0 ? (
                  <Reorder.Group
                    axis="y"
                    values={resources}
                    onReorder={handleReorder}
                    className="p-4 space-y-2"
                  >
                    <AnimatePresence>
                      {resources.map((resource) => (
                        <DraggableResourceItem
                          key={resource.id}
                          resource={resource}
                          onClick={() => onResourceClick?.(resource)}
                          onRemove={() => {
                            setResources(prev => prev.filter(r => r.id !== resource.id))
                            onRemoveResource?.(selectedPlaylist.id, resource.id)
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <ListMusic className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">No resources yet</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Add resources to your playlist to get started
                    </p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-violet-500 to-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Resources
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </Card>
          ) : (
            <Card className="border-gray-100 rounded-2xl p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <ListMusic className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Select a playlist</h4>
                <p className="text-sm text-gray-500">
                  Choose a playlist from the list to view and manage resources
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Share Dialog */}
      {sharingPlaylist && (
        <ShareDialog
          playlist={sharingPlaylist}
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false)
            setSharingPlaylist(null)
          }}
          onShare={(emails, isPublic) => {
            onSharePlaylist?.(sharingPlaylist.id, emails, isPublic)
            setPlaylists(prev => prev.map(p => 
              p.id === sharingPlaylist.id 
                ? { ...p, sharedWith: emails, isPublic, isShared: emails.length > 0 }
                : p
            ))
          }}
        />
      )}
    </div>
  )
}

export default PlaylistManager
