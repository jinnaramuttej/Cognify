/**
 * Cognify Library - Playlist Manager Component
 * 
 * Features:
 * - Drag and drop reordering with smooth animations
 * - Create/delete/share playlists
 * - Share to groups/classmates with share codes
 * - Progress tracking
 * - Public/private visibility
 * - Playlist statistics
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Share2,
  Copy,
  MoreVertical,
  GripVertical,
  Play,
  Clock,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Users,
  Link,
  Link2,
  X,
  Edit3,
  Eye,
  Copy as CopyIcon,
  Check,
  Share,
  UserPlus,
  Globe,
  QrCode,
  Mail,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { Playlist, PlaylistItem, PlaylistManagerProps, ResourceType } from '@/lib/library/types';

// ============================================================
// Helpers
// ============================================================

const RESOURCE_ICONS: Record<ResourceType, React.ElementType> = {
  video: Video,
  note: FileText,
  question: HelpCircle,
  book: BookOpen,
  question_set: HelpCircle,
};

// ============================================================
// Share Modal Component
// ============================================================

interface ShareModalProps {
  playlist: Playlist;
  isOpen: boolean;
  onClose: () => void;
  onShare: (type: 'user' | 'group' | 'public_link', target?: string) => void;
  onTogglePublic: (isPublic: boolean) => void;
}

function ShareModal({ playlist, isOpen, onClose, onShare, onTogglePublic }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'link' | 'users' | 'groups'>('link');
  
  const shareUrl = playlist.shareCode 
    ? `https://cognify.app/playlist/${playlist.shareCode}` 
    : '';
  
  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Share Playlist</h2>
                <p className="text-sm text-gray-500">{playlist.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {playlist.isPublic ? (
                <Globe className="w-5 h-5 text-blue-500" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {playlist.isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-sm text-gray-500">
                  {playlist.isPublic 
                    ? 'Anyone with the link can view' 
                    : 'Only you can access'}
                </p>
              </div>
            </div>
            <Switch
              checked={playlist.isPublic}
              onCheckedChange={onTogglePublic}
            />
          </div>
          
          {/* Share Link */}
          {playlist.isPublic && playlist.shareCode && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Share Link</label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
                <Button onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Share Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Share via</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onShare('user', shareEmail)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Email</span>
              </button>
              
              <button
                onClick={() => onShare('group')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">Group</span>
              </button>
              
              <button
                onClick={() => onShare('public_link')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Chat</span>
              </button>
            </div>
          </div>
          
          {/* Share Stats */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {playlist.viewCount} views
              </span>
              <span className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
                {playlist.copyCount} copies
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Playlist Item Card Component
// ============================================================

interface PlaylistItemCardProps {
  item: PlaylistItem;
  isDragging?: boolean;
  onRemove: () => void;
  onEdit: () => void;
}

function PlaylistItemCard({ item, isDragging, onRemove, onEdit }: PlaylistItemCardProps) {
  const Icon = RESOURCE_ICONS[item.resourceType as ResourceType];
  const isCompleted = item.progress >= 100;
  
  return (
    <Reorder.Item
      value={item}
      className={cn(
        "bg-white rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all",
        isDragging && "shadow-xl border-blue-300 scale-[1.02]",
        isCompleted && "border-green-200 bg-gradient-to-r from-green-50/50 to-white"
      )}
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 hover:text-gray-500 transition-colors" />
        
        {/* Resource Icon */}
        <motion.div 
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            isCompleted ? "bg-green-100" : "bg-gray-100"
          )}
          whileHover={{ scale: 1.05 }}
        >
          <Icon className={cn("w-5 h-5", isCompleted ? "text-green-500" : "text-gray-400")} />
        </motion.div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate text-sm">
              {item.resourceName}
            </h4>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              </motion.div>
            )}
          </div>
          
          {/* Progress Bar */}
          {item.progress > 0 && !isCompleted && (
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          
          {/* Progress Text */}
          {item.progress > 0 && (
            <p className="text-xs text-gray-400 mt-1">{Math.round(item.progress)}% complete</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 hover:bg-blue-50"
            onClick={onEdit}
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}

// ============================================================
// Playlist Card Component
// ============================================================

interface PlaylistCardProps {
  playlist: Playlist;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onShare: () => void;
  onCopy: () => void;
}

function PlaylistCard({ 
  playlist, 
  isSelected, 
  onSelect, 
  onDelete, 
  onShare, 
  onCopy 
}: PlaylistCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const completedItems = playlist.items.filter(i => i.progress >= 100).length;
  const progressPercent = playlist.items.length > 0 
    ? Math.round((completedItems / playlist.items.length) * 100) 
    : 0;
  
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all group",
        isSelected 
          ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm" 
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          playlist.playlistType === 'teacher' 
            ? "bg-gradient-to-br from-purple-100 to-purple-200" 
            : playlist.playlistType === 'recommended'
              ? "bg-gradient-to-br from-amber-100 to-amber-200"
              : "bg-gradient-to-br from-blue-100 to-blue-200"
        )}>
          {playlist.playlistType === 'teacher' ? (
            <Users className="w-6 h-6 text-purple-600" />
          ) : playlist.playlistType === 'recommended' ? (
            <Sparkles className="w-6 h-6 text-amber-600" />
          ) : (
            <BookOpen className="w-6 h-6 text-blue-600" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{playlist.name}</h3>
            {playlist.isPublic ? (
              <Badge variant="outline" className="text-xs flex-shrink-0 border-green-300 text-green-600">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
          
          {playlist.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{playlist.description}</p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {playlist.itemCount} items
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {playlist.viewCount} views
            </span>
            {completedItems > 0 && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 className="w-3 h-3" />
                {completedItems}/{playlist.items.length} done
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          {progressPercent > 0 && (
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          )}
        </div>
        
        {/* Menu */}
        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </Button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border p-1.5 z-20 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onShare();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-lg flex items-center gap-2 text-blue-600"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => {
                    onCopy();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Create Playlist Modal
// ============================================================

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

function CreatePlaylistModal({ isOpen, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Create New Playlist</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Playlist Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., JEE Physics Revision"
              autoFocus
              className="text-lg"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this playlist about?"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Playlist
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Main Playlist Manager Component
// ============================================================

export function PlaylistManager({
  playlists,
  currentPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onAddItem,
  onRemoveItem,
  onReorderItems,
  onSharePlaylist,
  onCopyPlaylist,
}: PlaylistManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentPlaylist?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingPlaylist, setSharingPlaylist] = useState<Playlist | null>(null);
  const [items, setItems] = useState<PlaylistItem[]>(currentPlaylist?.items || []);
  
  // Update items when playlist changes
  useEffect(() => {
    if (selectedId) {
      const selected = playlists.find(p => p.id === selectedId);
      if (selected) {
        setItems(selected.items);
      }
    }
  }, [selectedId, playlists]);
  
  const selectedPlaylist = useMemo(() => 
    playlists.find(p => p.id === selectedId) || currentPlaylist,
    [playlists, selectedId, currentPlaylist]
  );
  
  const handleReorder = useCallback((newOrder: PlaylistItem[]) => {
    setItems(newOrder);
    if (selectedPlaylist) {
      onReorderItems(selectedPlaylist.id, newOrder.map(item => item.id));
    }
  }, [selectedPlaylist, onReorderItems]);
  
  const handleShare = useCallback((playlist: Playlist) => {
    setSharingPlaylist(playlist);
    setShowShareModal(true);
  }, []);
  
  const handleTogglePublic = useCallback((isPublic: boolean) => {
    if (sharingPlaylist) {
      console.log('Toggle public:', sharingPlaylist.id, isPublic);
    }
  }, [sharingPlaylist]);
  
  return (
    <div className="h-full flex">
      {/* Sidebar - Playlist List */}
      <div className="w-80 border-r bg-gray-50/50 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">My Playlists</h3>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence mode="popLayout">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                isSelected={selectedId === playlist.id}
                onSelect={() => setSelectedId(playlist.id)}
                onDelete={() => onDeletePlaylist(playlist.id)}
                onShare={() => handleShare(playlist)}
                onCopy={() => onCopyPlaylist(playlist.id)}
              />
            ))}
          </AnimatePresence>
          
          {playlists.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No playlists yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Create one to organize your resources
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Main Content - Playlist Items */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedPlaylist ? (
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedPlaylist.name}</h2>
                    {selectedPlaylist.isPublic ? (
                      <Badge variant="outline" className="border-green-300 text-green-600">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  {selectedPlaylist.description && (
                    <p className="text-gray-500 mt-1">{selectedPlaylist.description}</p>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(selectedPlaylist)}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-medium">
                    {selectedPlaylist.itemCount} items
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                      style={{ 
                        width: `${items.filter(i => i.progress >= 100).length / Math.max(items.length, 1) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {items.filter(i => i.progress >= 100).length}/{items.length} completed
                  </span>
                </div>
              </div>
            </div>
            
            {/* Drag & Drop List */}
            {items.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={handleReorder}
                className="space-y-2"
              >
                <AnimatePresence>
                  {items.map((item) => (
                    <PlaylistItemCard
                      key={item.id}
                      item={item}
                      onRemove={() => onRemoveItem(selectedPlaylist.id, item.id)}
                      onEdit={() => {}}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No items in this playlist</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">
                  Add resources from the library to get started
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resources
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Select a playlist to view</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                Or create a new one to organize your learning
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Playlist
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreatePlaylist}
      />
      
      {sharingPlaylist && (
        <ShareModal
          playlist={sharingPlaylist}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSharingPlaylist(null);
          }}
          onShare={(type, target) => {
            onSharePlaylist(sharingPlaylist.id, type);
            setShowShareModal(false);
          }}
          onTogglePublic={handleTogglePublic}
        />
      )}
    </div>
  );
}

export default PlaylistManager;
