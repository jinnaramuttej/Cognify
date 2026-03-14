'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  BellOff,
  Bookmark,
  Clock,
  Search,
  MoreVertical,
  Trash2,
  Edit3,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Filter,
  ChevronRight,
  X,
  Save,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilter[]
  alertsEnabled: boolean
  alertFrequency: 'instant' | 'daily' | 'weekly'
  lastChecked: string
  newResultsCount: number
  createdAt: string
  totalResults: number
}

export interface SearchFilter {
  type: 'subject' | 'chapter' | 'difficulty' | 'type' | 'exam'
  value: string
  label: string
}

export interface NewResourceNotification {
  id: string
  searchId: string
  resourceName: string
  resourceType: string
  addedAt: string
  isRead: boolean
}

interface SavedSearchesProps {
  savedSearches: SavedSearch[]
  notifications?: NewResourceNotification[]
  onRunSearch: (search: SavedSearch) => void
  onDeleteSearch: (searchId: string) => void
  onToggleAlert: (searchId: string, enabled: boolean) => void
  onUpdateFrequency: (searchId: string, frequency: 'instant' | 'daily' | 'weekly') => void
  onRenameSearch: (searchId: string, newName: string) => void
  onCreateSearch: (name: string, query: string, filters: SearchFilter[]) => void
  onMarkNotificationRead?: (notificationId: string) => void
  className?: string
}

// Frequency labels
const frequencyLabels: Record<string, string> = {
  instant: 'Instant',
  daily: 'Daily Digest',
  weekly: 'Weekly Summary',
}

// Filter type colors
const filterColors: Record<string, { bg: string; text: string }> = {
  subject: { bg: 'bg-violet-50', text: 'text-violet-700' },
  chapter: { bg: 'bg-blue-50', text: 'text-blue-700' },
  difficulty: { bg: 'bg-amber-50', text: 'text-amber-700' },
  type: { bg: 'bg-green-50', text: 'text-green-700' },
  exam: { bg: 'bg-rose-50', text: 'text-rose-700' },
}

// Saved Search Card
function SavedSearchCard({
  search,
  onRun,
  onDelete,
  onToggleAlert,
  onUpdateFrequency,
  onRename,
}: {
  search: SavedSearch
  onRun: () => void
  onDelete: () => void
  onToggleAlert: (enabled: boolean) => void
  onUpdateFrequency: (frequency: 'instant' | 'daily' | 'weekly') => void
  onRename: (name: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(search.name)
  
  const handleRename = () => {
    if (editName.trim() && editName !== search.name) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="group"
    >
      <Card className={cn(
        'relative overflow-hidden transition-all duration-200',
        'border-gray-100 rounded-xl hover:border-violet-200 hover:shadow-md',
        search.newResultsCount > 0 && 'border-violet-200 bg-violet-50/30'
      )}>
        {/* New Results Indicator */}
        {search.newResultsCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 right-3"
          >
            <Badge className="bg-violet-500 text-white border-0 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              {search.newResultsCount} new
            </Badge>
          </motion.div>
        )}
        
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              search.alertsEnabled
                ? 'bg-gradient-to-br from-violet-500 to-purple-500'
                : 'bg-gray-100'
            )}>
              {search.alertsEnabled ? (
                <Bell className="h-5 w-5 text-white" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename()
                      if (e.key === 'Escape') setIsEditing(false)
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleRename} className="h-8">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h4 className="font-semibold text-gray-900 truncate pr-20">
                  {search.name}
                </h4>
              )}
              
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                Last checked {search.lastChecked}
              </div>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleAlert(!search.alertsEnabled)}>
                  {search.alertsEnabled ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Disable Alerts
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Alerts
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Query */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 truncate">"{search.query}"</span>
            </div>
          </div>
          
          {/* Filters */}
          {search.filters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {search.filters.map((filter) => {
                const colors = filterColors[filter.type] || filterColors.subject
                return (
                  <Badge
                    key={`${filter.type}-${filter.value}`}
                    variant="secondary"
                    className={cn('text-xs', colors.bg, colors.text)}
                  >
                    {filter.label}
                  </Badge>
                )
              })}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{search.totalResults} results</span>
              {search.alertsEnabled && (
                <span className="flex items-center gap-1 text-violet-600">
                  <Bell className="h-3 w-3" />
                  {frequencyLabels[search.alertFrequency]}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Frequency Selector */}
              {search.alertsEnabled && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-gray-500 hover:text-violet-600"
                    >
                      {frequencyLabels[search.alertFrequency]}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem 
                      onClick={() => onUpdateFrequency('instant')}
                      className={search.alertFrequency === 'instant' ? 'bg-violet-50 text-violet-700' : ''}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Instant
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onUpdateFrequency('daily')}
                      className={search.alertFrequency === 'daily' ? 'bg-violet-50 text-violet-700' : ''}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Daily Digest
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onUpdateFrequency('weekly')}
                      className={search.alertFrequency === 'weekly' ? 'bg-violet-50 text-violet-700' : ''}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Weekly Summary
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button
                size="sm"
                onClick={onRun}
                className="h-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Notification Item
function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: NewResourceNotification
  onMarkRead: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        notification.isRead ? 'bg-gray-50' : 'bg-violet-50 hover:bg-violet-100/50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        notification.isRead ? 'bg-gray-100' : 'bg-violet-100'
      )}>
        <Sparkles className={cn(
          'h-4 w-4',
          notification.isRead ? 'text-gray-400' : 'text-violet-600'
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm truncate',
          notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'
        )}>
          {notification.resourceName}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{notification.resourceType}</span>
          <span>•</span>
          <span>{notification.addedAt}</span>
        </div>
      </div>
      
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkRead}
          className="h-6 w-6 p-0"
        >
          <CheckCircle2 className="h-4 w-4 text-gray-400 hover:text-violet-500" />
        </Button>
      )}
    </motion.div>
  )
}

// Create Search Dialog
function CreateSearchDialog({
  onCreate,
  currentQuery,
  currentFilters,
}: {
  onCreate: (name: string, query: string, filters: SearchFilter[]) => void
  currentQuery?: string
  currentFilters?: SearchFilter[]
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState(currentQuery || '')
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily')
  
  const handleCreate = () => {
    if (name.trim() && query.trim()) {
      onCreate(name.trim(), query.trim(), currentFilters || [])
      setName('')
      setQuery('')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-violet-200 text-violet-700 hover:bg-violet-50"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Save Current Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-violet-500" />
            Save Search with Alerts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Search Name</Label>
            <Input
              id="name"
              placeholder="e.g., Thermodynamics Videos for JEE"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              placeholder="Enter search query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          {/* Current Filters Preview */}
          {currentFilters && currentFilters.length > 0 && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-1.5">
                {currentFilters.map((filter) => {
                  const colors = filterColors[filter.type] || filterColors.subject
                  return (
                    <Badge
                      key={`${filter.type}-${filter.value}`}
                      variant="secondary"
                      className={cn('text-xs', colors.bg, colors.text)}
                    >
                      {filter.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Alert Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-500" />
                <Label htmlFor="alerts">Enable Alerts</Label>
              </div>
              <Switch
                id="alerts"
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
            </div>
            
            {alertsEnabled && (
              <div className="space-y-2">
                <Label>Alert Frequency</Label>
                <div className="flex gap-2">
                  {(['instant', 'daily', 'weekly'] as const).map((f) => (
                    <Button
                      key={f}
                      variant={frequency === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFrequency(f)}
                      className={cn(
                        'flex-1',
                        frequency === f && 'bg-violet-500 hover:bg-violet-600'
                      )}
                    >
                      {frequencyLabels[f]}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !query.trim()}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SavedSearches({
  savedSearches,
  notifications = [],
  onRunSearch,
  onDeleteSearch,
  onToggleAlert,
  onUpdateFrequency,
  onRenameSearch,
  onCreateSearch,
  onMarkNotificationRead,
  className,
}: SavedSearchesProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'notifications'>('saved')
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  return (
    <Card className={cn('overflow-hidden border-gray-100 rounded-2xl', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Saved Searches</h3>
            <p className="text-sm text-gray-500">{savedSearches.length} searches saved</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('saved')}
            className={cn(
              'h-8 px-3 rounded-md relative',
              activeTab === 'saved' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Bookmark className="h-4 w-4 mr-1.5" />
            Saved
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('notifications')}
            className={cn(
              'h-8 px-3 rounded-md relative',
              activeTab === 'notifications' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Bell className="h-4 w-4 mr-1.5" />
            Alerts
            {unreadCount > 0 && (
              <Badge className="ml-1.5 h-5 px-1.5 bg-violet-500 text-white border-0">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'saved' ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {savedSearches.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-3">
                  {savedSearches.map((search) => (
                    <SavedSearchCard
                      key={search.id}
                      search={search}
                      onRun={() => onRunSearch(search)}
                      onDelete={() => onDeleteSearch(search.id)}
                      onToggleAlert={(enabled) => onToggleAlert(search.id, enabled)}
                      onUpdateFrequency={(frequency) => onUpdateFrequency(search.id, frequency)}
                      onRename={(name) => onRenameSearch(search.id, name)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <Bookmark className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">No Saved Searches</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Save your searches to get alerts when new matching resources are added
                </p>
                <CreateSearchDialog onCreate={onCreateSearch} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {notifications.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={() => onMarkNotificationRead?.(notification.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">No New Alerts</h4>
                <p className="text-sm text-gray-500">
                  We'll notify you when new resources match your saved searches
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// Missing import
import { Calendar } from 'lucide-react'

export default SavedSearches
