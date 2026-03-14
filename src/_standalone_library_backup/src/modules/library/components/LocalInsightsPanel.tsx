'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  TrendingUp,
  BookOpen,
  Star,
  MessageSquare,
  Bookmark,
  Eye,
  Clock,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Award,
  Flame,
  ThumbsUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface TrendingResource {
  id: string
  title: string
  subject: string
  chapter: string
  viewCount: number
  bookmarkCount: number
  growthPercentage: number
  averageRating: number
  studentType: 'topper' | 'average' | 'struggling' // Who's viewing most
  tags: string[]
}

export interface TeacherRecommendation {
  id: string
  teacherName: string
  teacherSubject: string
  resourceTitle: string
  resourceId: string
  reason: string
  classTarget: string
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
}

export interface CollaborativeTag {
  id: string
  tag: string
  usageCount: number
  relatedSubjects: string[]
  trending: boolean
  recentlyUsed: boolean
}

export interface PeerActivity {
  id: string
  studentName: string
  studentInitials: string
  action: 'viewed' | 'bookmarked' | 'completed' | 'rated'
  resourceTitle: string
  resourceId: string
  timestamp: Date
}

interface LocalInsightsPanelProps {
  trendingResources?: TrendingResource[]
  teacherRecommendations?: TeacherRecommendation[]
  collaborativeTags?: CollaborativeTag[]
  peerActivity?: PeerActivity[]
  onResourceClick?: (resourceId: string) => void
  onTagClick?: (tag: string) => void
  className?: string
}

const studentTypeConfig = {
  topper: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Top Students', icon: Award },
  average: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'All Students', icon: Users },
  struggling: { color: 'text-red-600', bg: 'bg-red-50', label: 'Need Support', icon: Flame },
}

export function LocalInsightsPanel({
  trendingResources = [],
  teacherRecommendations = [],
  collaborativeTags = [],
  peerActivity = [],
  onResourceClick,
  onTagClick,
  className,
}: LocalInsightsPanelProps) {
  const [activeSection, setActiveSection] = useState<'trending' | 'teacher' | 'tags' | 'peers'>('trending')
  
  // Mock data for demo
  const mockTrending: TrendingResource[] = trendingResources.length > 0 ? trendingResources : [
    {
      id: '1',
      title: 'Electrostatics - Complete Notes',
      subject: 'Physics',
      chapter: 'Electrostatics',
      viewCount: 1247,
      bookmarkCount: 89,
      growthPercentage: 34,
      averageRating: 4.8,
      studentType: 'topper',
      tags: ['JEE Main', 'Important', 'Quick Revision'],
    },
    {
      id: '2',
      title: 'Organic Chemistry Reaction Mechanisms',
      subject: 'Chemistry',
      chapter: 'Organic Chemistry',
      viewCount: 982,
      bookmarkCount: 67,
      growthPercentage: 28,
      averageRating: 4.6,
      studentType: 'average',
      tags: ['NEET', 'Mechanism', 'Must Know'],
    },
    {
      id: '3',
      title: 'Calculus Integration Formulas',
      subject: 'Mathematics',
      chapter: 'Calculus',
      viewCount: 856,
      bookmarkCount: 54,
      growthPercentage: 45,
      averageRating: 4.9,
      studentType: 'topper',
      tags: ['Formula Sheet', 'JEE Advanced'],
    },
  ]
  
  const mockTeacher: TeacherRecommendation[] = teacherRecommendations.length > 0 ? teacherRecommendations : [
    {
      id: '1',
      teacherName: 'Dr. Sharma',
      teacherSubject: 'Physics',
      resourceTitle: 'JEE Main 2024 Predicted Questions',
      resourceId: 't1',
      reason: 'High probability topics for upcoming exam',
      classTarget: 'Class 12 - JEE',
      priority: 'high',
      createdAt: new Date(),
    },
    {
      id: '2',
      teacherName: 'Ms. Gupta',
      teacherSubject: 'Chemistry',
      resourceTitle: 'NEET Biology Quick Notes',
      resourceId: 't2',
      reason: 'Most asked topics in last 5 years',
      classTarget: 'Class 12 - NEET',
      priority: 'medium',
      createdAt: new Date(),
    },
  ]
  
  const mockTags: CollaborativeTag[] = collaborativeTags.length > 0 ? collaborativeTags : [
    { id: '1', tag: 'JEE Main 2024', usageCount: 4521, relatedSubjects: ['Physics', 'Maths'], trending: true, recentlyUsed: false },
    { id: '2', tag: 'Quick Revision', usageCount: 3892, relatedSubjects: ['All'], trending: true, recentlyUsed: true },
    { id: '3', tag: 'NCERT Based', usageCount: 2847, relatedSubjects: ['Biology', 'Chemistry'], trending: false, recentlyUsed: true },
    { id: '4', tag: 'Formula Sheet', usageCount: 2156, relatedSubjects: ['Physics', 'Maths'], trending: false, recentlyUsed: false },
    { id: '5', tag: 'PYQ Analysis', usageCount: 1893, relatedSubjects: ['All'], trending: true, recentlyUsed: false },
  ]
  
  const mockPeers: PeerActivity[] = peerActivity.length > 0 ? peerActivity : [
    { id: '1', studentName: 'Rahul K.', studentInitials: 'RK', action: 'completed', resourceTitle: 'Thermodynamics MCQs', resourceId: 'p1', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '2', studentName: 'Priya S.', studentInitials: 'PS', action: 'rated', resourceTitle: 'Organic Chemistry Notes', resourceId: 'p2', timestamp: new Date(Date.now() - 1000 * 60 * 12) },
    { id: '3', studentName: 'Amit R.', studentInitials: 'AR', action: 'bookmarked', resourceTitle: 'Integration Formulas', resourceId: 'p3', timestamp: new Date(Date.now() - 1000 * 60 * 25) },
    { id: '4', studentName: 'Sneha M.', studentInitials: 'SM', action: 'viewed', resourceTitle: 'Physics Lab Manual', resourceId: 'p4', timestamp: new Date(Date.now() - 1000 * 60 * 40) },
  ]
  
  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }
  
  // Action icon
  const getActionIcon = (action: PeerActivity['action']) => {
    switch (action) {
      case 'viewed': return <Eye className="h-3 w-3" />
      case 'bookmarked': return <Bookmark className="h-3 w-3" />
      case 'completed': return <Star className="h-3 w-3" />
      case 'rated': return <ThumbsUp className="h-3 w-3" />
    }
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="font-semibold">Community Insights</h3>
        </div>
        <p className="text-sm text-white/80 mt-1">See what similar students are studying</p>
      </div>
      
      {/* Section Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {[
          { key: 'trending', label: 'Trending', icon: TrendingUp },
          { key: 'teacher', label: 'Teacher Picks', icon: GraduationCap },
          { key: 'tags', label: 'Tags', icon: Bookmark },
          { key: 'peers', label: 'Activity', icon: Users },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as typeof activeSection)}
            className={cn(
              'flex-1 min-w-fit py-3 px-4 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors',
              activeSection === tab.key
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <ScrollArea className="h-[350px]">
        <AnimatePresence mode="wait">
          {/* Trending Section */}
          {activeSection === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 space-y-2"
            >
              {mockTrending.map((resource, index) => {
                const typeConfig = studentTypeConfig[resource.studentType]
                const TypeIcon = typeConfig.icon
                
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onResourceClick?.(resource.id)}
                    className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn('text-xs', typeConfig.bg, typeConfig.color)}>
                            <TypeIcon className="h-3 w-3 mr-0.5" />
                            {typeConfig.label}
                          </Badge>
                          <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                            <TrendingUp className="h-3 w-3" />
                            +{resource.growthPercentage}%
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {resource.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{resource.subject} • {resource.chapter}</p>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {resource.viewCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            {resource.bookmarkCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {resource.averageRating}
                          </span>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
          
          {/* Teacher Recommendations */}
          {activeSection === 'teacher' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 space-y-2"
            >
              {mockTeacher.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onResourceClick?.(rec.resourceId)}
                  className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500">
                      <AvatarFallback className="text-white font-medium text-sm">
                        {rec.teacherName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{rec.teacherName}</span>
                        <Badge className={cn(
                          'text-xs',
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate group-hover:text-blue-600">
                        {rec.resourceTitle}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {rec.classTarget}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Collaborative Tags */}
          {activeSection === 'tags' && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3"
            >
              <div className="flex flex-wrap gap-2">
                {mockTags.map((tag, index) => (
                  <motion.button
                    key={tag.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onTagClick?.(tag.tag)}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm font-medium transition-all hover:scale-105',
                      tag.trending 
                        ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 hover:border-orange-300'
                        : tag.recentlyUsed
                        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {tag.trending && <Flame className="h-3 w-3" />}
                      {tag.tag}
                      <span className="text-xs opacity-60">({tag.usageCount.toLocaleString()})</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Recently Used Section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Recent Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {mockTags.filter(t => t.recentlyUsed).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => onTagClick?.(tag.tag)}
                    >
                      {tag.tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Peer Activity */}
          {activeSection === 'peers' && (
            <motion.div
              key="peers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 space-y-2"
            >
              {mockPeers.map((activity, index) => {
                const actionColors = {
                  viewed: 'text-blue-600 bg-blue-100',
                  bookmarked: 'text-purple-600 bg-purple-100',
                  completed: 'text-emerald-600 bg-emerald-100',
                  rated: 'text-amber-600 bg-amber-100',
                }
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {activity.studentInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">
                        <span className="font-medium">{activity.studentName}</span>
                        {' '}{activity.action}{' '}
                        <span 
                          onClick={() => onResourceClick?.(activity.resourceId)}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          {activity.resourceTitle}
                        </span>
                      </p>
                      <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center',
                      actionColors[activity.action]
                    )}>
                      {getActionIcon(activity.action)}
                    </div>
                  </motion.div>
                )
              })}
              
              <div className="pt-2 text-center">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View More Activity
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </Card>
  )
}

export default LocalInsightsPanel
