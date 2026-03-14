'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  X,
  Layers,
  TrendingUp,
  Star,
  ChevronRight,
  BookOpen,
  Video,
  Headphones,
  FileText,
  Sparkles,
  ArrowRight,
  Network,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface TopicNode {
  id: string
  name: string
  subject: string
  count: number // resource count
  growth?: number // trending percentage
  relatedTopics: string[] // IDs of related topics
  position?: { x: number; y: number }
  color?: string
}

export interface TopicResource {
  id: string
  title: string
  type: 'Notes' | 'Video' | 'Audio' | 'PDF' | 'Interactive'
  subject: string
  chapter: string
  viewCount: number
  rating?: number
}

interface TagCloudExplorerProps {
  topics: TopicNode[]
  onTopicClick?: (topic: TopicNode) => void
  onTopicHover?: (topic: TopicNode | null) => void
  selectedTopic?: TopicNode | null
  previewResources?: TopicResource[]
  onResourceClick?: (resource: TopicResource) => void
  className?: string
}

// Subject color mapping
const subjectColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Physics: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-cyan-500'
  },
  Chemistry: { 
    bg: 'bg-purple-50', 
    text: 'text-purple-700', 
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-violet-500'
  },
  Mathematics: { 
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    border: 'border-rose-200',
    gradient: 'from-rose-500 to-pink-500'
  },
  Biology: { 
    bg: 'bg-green-50', 
    text: 'text-green-700', 
    border: 'border-green-200',
    gradient: 'from-green-500 to-emerald-500'
  },
}

// Type icons
const typeIcons: Record<string, React.ElementType> = {
  Notes: FileText,
  Video: Video,
  Audio: Headphones,
  PDF: FileText,
  Interactive: Layers,
}

// Topic Tag Component
function TopicTag({ 
  topic, 
  isSelected, 
  isHovered, 
  onClick, 
  onHover,
  size,
}: { 
  topic: TopicNode
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onHover: (hovered: boolean) => void
  size: 'sm' | 'md' | 'lg'
}) {
  const colors = subjectColors[topic.subject] || subjectColors.Physics
  
  // Size classes based on resource count
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }
  
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isSelected ? 1.1 : isHovered ? 1.05 : 1 
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        'relative rounded-full font-medium transition-all duration-200',
        'border shadow-sm',
        sizeClasses[size],
        isSelected
          ? `${colors.bg} ${colors.text} ${colors.border} shadow-md`
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300',
        isHovered && !isSelected && 'shadow-md'
      )}
    >
      <span className="flex items-center gap-1.5">
        {topic.name}
        {topic.growth && topic.growth > 10 && (
          <TrendingUp className="h-3 w-3 text-orange-500" />
        )}
        <span className={cn(
          'text-xs opacity-60',
          isSelected && colors.text
        )}>
          {topic.count}
        </span>
      </span>
      
      {/* Glow effect for selected */}
      {isSelected && (
        <motion.div
          layoutId="topic-glow"
          className={cn(
            'absolute inset-0 rounded-full opacity-20 blur-md -z-10',
            'bg-gradient-to-r',
            colors.gradient
          )}
        />
      )}
    </motion.button>
  )
}

// Cluster Graph Node
function ClusterNode({ 
  topic, 
  position, 
  isSelected, 
  onClick,
  onHover,
}: { 
  topic: TopicNode
  position: { x: number; y: number }
  isSelected: boolean
  onClick: () => void
  onHover: (hovered: boolean) => void
}) {
  const colors = subjectColors[topic.subject] || subjectColors.Physics
  const nodeSize = Math.max(40, Math.min(80, 30 + topic.count))
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: isSelected ? 1.2 : 1,
        x: position.x,
        y: position.y
      }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: isSelected ? 1.2 : 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        'absolute rounded-full flex items-center justify-center',
        'transition-all duration-200 cursor-pointer',
        'shadow-lg',
        isSelected ? 'shadow-xl' : 'shadow-md'
      )}
      style={{
        width: nodeSize,
        height: nodeSize,
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
      }}
    >
      <div className={cn(
        'absolute inset-0 rounded-full bg-gradient-to-br',
        colors.gradient,
        isSelected && 'ring-4 ring-white ring-opacity-50'
      )} />
      <span className="relative text-white text-xs font-medium text-center px-1 truncate max-w-full">
        {topic.name}
      </span>
      
      {/* Pulse animation for trending */}
      {topic.growth && topic.growth > 15 && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br opacity-30',
            colors.gradient
          )}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  )
}

// Connection Line between nodes
function ConnectionLine({ 
  from, 
  to, 
  highlight 
}: { 
  from: { x: number; y: number }
  to: { x: number; y: number }
  highlight: boolean
}) {
  return (
    <motion.line
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1, 
        opacity: highlight ? 0.6 : 0.15 
      }}
      transition={{ duration: 0.5 }}
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={highlight ? '#8B5CF6' : '#E5E7EB'}
      strokeWidth={highlight ? 2 : 1}
      strokeDasharray={highlight ? 'none' : '4 4'}
    />
  )
}

// Resource Preview Card
function ResourcePreviewCard({ 
  resource, 
  onClick 
}: { 
  resource: TopicResource
  onClick: () => void
}) {
  const TypeIcon = typeIcons[resource.type] || FileText
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-3 bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          'bg-gradient-to-br from-violet-500 to-purple-500'
        )}>
          <TypeIcon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
            {resource.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{resource.subject}</span>
            <span>•</span>
            <span>{resource.chapter}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {resource.viewCount}
            </div>
            {resource.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {resource.rating}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function TagCloudExplorer({
  topics,
  onTopicClick,
  onTopicHover,
  selectedTopic,
  previewResources = [],
  onResourceClick,
  className,
}: TagCloudExplorerProps) {
  const [viewMode, setViewMode] = useState<'cloud' | 'graph'>('cloud')
  const [hoveredTopic, setHoveredTopic] = useState<TopicNode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Calculate positions for cluster graph using memo
  const positions = useMemo(() => {
    if (viewMode !== 'graph') return new Map<string, { x: number; y: number }>()
    
    const width = 500 // Default width
    const height = 350 // Default height
    const center = { x: width / 2, y: height / 2 }
    
    const newPositions = new Map<string, { x: number; y: number }>()
    
    // Group topics by subject
    const subjectGroups = new Map<string, TopicNode[]>()
    topics.forEach(topic => {
      const group = subjectGroups.get(topic.subject) || []
      group.push(topic)
      subjectGroups.set(topic.subject, group)
    })
    
    // Arrange subjects in a circle around center
    const subjects = Array.from(subjectGroups.keys())
    subjects.forEach((subject, subjectIndex) => {
      const group = subjectGroups.get(subject) || []
      const subjectAngle = (subjectIndex / subjects.length) * Math.PI * 2 - Math.PI / 2
      const subjectRadius = Math.min(width, height) * 0.3
      
      group.forEach((topic, index) => {
        const angle = subjectAngle + (index - group.length / 2) * 0.3
        const radius = subjectRadius + (index % 3) * 25 // Deterministic pseudo-random
        const x = center.x + Math.cos(angle) * radius
        const y = center.y + Math.sin(angle) * radius
        newPositions.set(topic.id, { x, y })
      })
    })
    
    return newPositions
  }, [viewMode, topics])
  
  // Get tag size based on count
  const getTagSize = useCallback((count: number): 'sm' | 'md' | 'lg' => {
    if (count < 20) return 'sm'
    if (count < 50) return 'md'
    return 'lg'
  }, [])
  
  // Sort topics by count for display
  const sortedTopics = useMemo(() => {
    return [...topics].sort((a, b) => b.count - a.count)
  }, [topics])
  
  // Get connections for selected/hovered topic
  const connections = useMemo(() => {
    const target = selectedTopic || hoveredTopic
    if (!target || viewMode !== 'graph') return []
    
    return target.relatedTopics
      .map(id => {
        const related = topics.find(t => t.id === id)
        if (!related) return null
        
        const from = positions.get(target.id)
        const to = positions.get(id)
        if (!from || !to) return null
        
        return { from, to, highlight: true }
      })
      .filter(Boolean) as { from: { x: number; y: number }; to: { x: number; y: number }; highlight: boolean }[]
  }, [selectedTopic, hoveredTopic, viewMode, topics, positions])

  return (
    <Card className={cn('overflow-hidden border-gray-100 rounded-2xl', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Network className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Topic Explorer</h3>
            <p className="text-sm text-gray-500">{topics.length} topics • Click to explore</p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('cloud')}
            className={cn(
              'h-8 px-3 rounded-md',
              viewMode === 'cloud' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Layers className="h-4 w-4 mr-1.5" />
            Cloud
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('graph')}
            className={cn(
              'h-8 px-3 rounded-md',
              viewMode === 'graph' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Network className="h-4 w-4 mr-1.5" />
            Graph
          </Button>
        </div>
      </div>
      
      <div className="flex">
        {/* Main Content Area */}
        <div 
          ref={containerRef}
          className="flex-1 relative min-h-[350px] p-6"
        >
          <AnimatePresence mode="wait">
            {viewMode === 'cloud' ? (
              /* Tag Cloud View */
              <motion.div
                key="cloud"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-3 justify-center items-center"
              >
                {sortedTopics.map((topic) => (
                  <TopicTag
                    key={topic.id}
                    topic={topic}
                    isSelected={selectedTopic?.id === topic.id}
                    isHovered={hoveredTopic?.id === topic.id}
                    onClick={() => onTopicClick?.(topic)}
                    onHover={(hovered) => {
                      setHoveredTopic(hovered ? topic : null)
                      onTopicHover?.(hovered ? topic : null)
                    }}
                    size={getTagSize(topic.count)}
                  />
                ))}
              </motion.div>
            ) : (
              /* Cluster Graph View */
              <motion.div
                key="graph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-[350px]"
              >
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* All connections (faded) */}
                  {topics.map(topic => {
                    const from = positions.get(topic.id)
                    if (!from) return null
                    
                    return topic.relatedTopics.map(relatedId => {
                      const to = positions.get(relatedId)
                      if (!to) return null
                      
                      // Only draw connections where from.id < to.id to avoid duplicates
                      if (topic.id >= relatedId) return null
                      
                      return (
                        <ConnectionLine
                          key={`${topic.id}-${relatedId}`}
                          from={from}
                          to={to}
                          highlight={connections.some(
                            c => (c.from === from && c.to === to) || (c.from === to && c.to === from)
                          )}
                        />
                      )
                    })
                  })}
                </svg>
                
                {/* Nodes */}
                {topics.map((topic) => {
                  const position = positions.get(topic.id)
                  if (!position) return null
                  
                  return (
                    <ClusterNode
                      key={topic.id}
                      topic={topic}
                      position={position}
                      isSelected={selectedTopic?.id === topic.id}
                      onClick={() => onTopicClick?.(topic)}
                      onHover={(hovered) => {
                        setHoveredTopic(hovered ? topic : null)
                        onTopicHover?.(hovered ? topic : null)
                      }}
                    />
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Preview Panel */}
        <AnimatePresence>
          {selectedTopic && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-gray-100 bg-gray-50/50 overflow-hidden"
            >
              <div className="w-[280px] h-full flex flex-col">
                {/* Selected Topic Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      className={cn(
                        'font-medium',
                        subjectColors[selectedTopic.subject]?.bg,
                        subjectColors[selectedTopic.subject]?.text,
                        subjectColors[selectedTopic.subject]?.border
                      )}
                    >
                      {selectedTopic.subject}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTopicClick?.(selectedTopic)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="font-semibold text-gray-900">{selectedTopic.name}</h4>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span>{selectedTopic.count} resources</span>
                    {selectedTopic.growth && (
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        +{selectedTopic.growth}%
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Related Topics */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-2">Related Topics</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTopic.relatedTopics.slice(0, 5).map(id => {
                      const related = topics.find(t => t.id === id)
                      if (!related) return null
                      
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="text-xs bg-white border-gray-200 cursor-pointer hover:border-violet-300"
                          onClick={() => onTopicClick?.(related)}
                        >
                          {related.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
                
                {/* Resources Preview */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-xs text-gray-500 font-medium flex items-center justify-between">
                    <span>Top Resources</span>
                    <Sparkles className="h-3 w-3 text-violet-500" />
                  </div>
                  
                  {previewResources.length > 0 ? (
                    previewResources.map(resource => (
                      <ResourcePreviewCard
                        key={resource.id}
                        resource={resource}
                        onClick={() => onResourceClick?.(resource)}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 text-center py-4">
                      Click a topic to see resources
                    </div>
                  )}
                </div>
                
                {/* View All Button */}
                <div className="p-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    View All Resources
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

export default TagCloudExplorer
