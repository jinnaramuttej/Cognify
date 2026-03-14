'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Bookmark,
  Clock,
  BookOpen,
  FileText,
  ListMusic,
  StickyNote,
  Play,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import type { LibraryResource } from '../types'

interface MyResourcesPageProps {
  resources: LibraryResource[]
  recentlyViewed: LibraryResource[]
  isLoading: boolean
  onResourceClick: (resource: LibraryResource) => void
  onBookmark: (resourceId: string) => void
}

export function MyResourcesPage({
  resources,
  recentlyViewed,
  isLoading,
  onResourceClick,
  onBookmark,
}: MyResourcesPageProps) {
  const [activeTab, setActiveTab] = useState('saved')

  // Get bookmarked resources
  const savedResources = resources.filter(r => r.isBookmarked)
  
  // Get unfinished resources (recently viewed but not bookmarked)
  const unfinishedResources = recentlyViewed.filter(r => !r.isBookmarked)

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Resources</h1>
        <p className="text-gray-500">Your saved, unfinished, and organized content</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
          <TabsTrigger value="unfinished" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">In Progress</span>
          </TabsTrigger>
          <TabsTrigger value="playlists" className="gap-2">
            <ListMusic className="h-4 w-4" />
            <span className="hidden sm:inline">Playlists</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <StickyNote className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
        </TabsList>

        {/* Saved Resources */}
        <TabsContent value="saved">
          {savedResources.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved resources yet"
              description="Bookmark resources to find them here quickly"
            />
          ) : (
            <div className="space-y-2">
              {savedResources.map((resource, index) => (
                <ResourceListItem
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onClick={() => onResourceClick(resource)}
                  onBookmark={() => onBookmark(resource.id)}
                  isBookmarked
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Unfinished */}
        <TabsContent value="unfinished">
          {unfinishedResources.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="All caught up!"
              description="Resources you start will appear here"
            />
          ) : (
            <div className="space-y-2">
              {unfinishedResources.map((resource, index) => (
                <ResourceListItem
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onClick={() => onResourceClick(resource)}
                  onBookmark={() => onBookmark(resource.id)}
                  isBookmarked={resource.isBookmarked}
                  showProgress
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Playlists */}
        <TabsContent value="playlists">
          <EmptyState
            icon={ListMusic}
            title="No playlists yet"
            description="Create playlists to organize your study materials"
            action={
              <Button className="gap-2">
                <ListMusic className="h-4 w-4" />
                Create Playlist
              </Button>
            }
          />
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <EmptyState
            icon={StickyNote}
            title="No notes yet"
            description="Your personal notes will appear here"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Resource List Item
function ResourceListItem({
  resource,
  index,
  onClick,
  onBookmark,
  isBookmarked,
  showProgress = false,
}: {
  resource: LibraryResource
  index: number
  onClick: () => void
  onBookmark: () => void
  isBookmarked: boolean
  showProgress?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        onClick={onClick}
        className="p-4 bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <BookOpen className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {resource.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {resource.subject} • {resource.chapter}
            </p>
            {showProgress && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {resource.resourceType}
                </Badge>
                <span className="text-xs text-gray-400">In progress</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onBookmark() }}
              className="h-8 w-8 p-0"
            >
              <Bookmark className={cn(
                'h-4 w-4',
                isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-400'
              )} />
            </Button>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Empty State
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: any
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  )
}

// Loading State
function LoadingState() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-6" />
      <Skeleton className="h-10 w-full mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default MyResourcesPage
