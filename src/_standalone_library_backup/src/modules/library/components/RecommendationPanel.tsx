'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sparkles,
  Target,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Clock,
  Brain,
} from 'lucide-react'
import type { RecommendationItem } from '../types'

interface RecommendationPanelProps {
  recommendations: RecommendationItem[]
  dueForRevision?: number
  isLoading?: boolean
  onResourceClick: (id: string) => void
  onRefresh?: () => void
}

interface RecommendationSectionProps {
  title: string
  icon: React.ReactNode
  items: RecommendationItem[]
  onItemClick: (id: string) => void
}

function RecommendationSection({
  title,
  icon,
  items,
  onItemClick,
}: RecommendationSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (items.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {isOpen && (
          <CollapsibleContent forceMount>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-2 space-y-2 overflow-hidden"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <Card
                    className="p-3 bg-white border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
                    onClick={() => onItemClick(item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {item.subject} • {item.chapter}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200"
                          >
                            {item.matchScore}% match
                          </Badge>
                          <span className="text-[10px] text-gray-400">{item.reason}</span>
                        </div>
                      </div>
                      <FileText className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  )
}

export function RecommendationPanel({
  recommendations,
  dueForRevision = 0,
  isLoading = false,
  onResourceClick,
  onRefresh,
}: RecommendationPanelProps) {
  // Group recommendations by type
  const groupedRecommendations = {
    revision: recommendations.filter(r => r.type === 'revision' || r.reason.includes('revision')),
    weakTopics: recommendations.filter(r => r.type === 'weak_topic'),
    trending: recommendations.filter(r => r.type === 'trending'),
    nextChapter: recommendations.filter(r => r.type === 'next_chapter'),
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="hidden xl:block w-72 flex-shrink-0 border-l border-gray-100 bg-white/80 backdrop-blur-sm"
    >
      <div className="sticky top-[120px] h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
              >
                <Brain className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  AI Insights
                </h3>
                <p className="text-xs text-gray-500">
                  Personalized for you
                </p>
              </div>
            </div>
            {onRefresh && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Revision Alert */}
        <AnimatePresence>
          {dueForRevision > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mx-4 mt-3"
            >
              <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {dueForRevision} due for revision
                    </p>
                    <p className="text-xs text-orange-600">
                      Review before they expire
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <ScrollArea className="flex-1 px-4 py-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-6 w-6 text-blue-500" />
              </motion.div>
            </div>
          ) : recommendations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-3"
              >
                <BookOpen className="h-6 w-6 text-gray-400" />
              </motion.div>
              <p className="text-sm text-gray-500">
                Start exploring to get personalized recommendations
              </p>
            </motion.div>
          ) : (
            <div className="space-y-1">
              {/* Due for Revision */}
              {groupedRecommendations.revision.length > 0 && (
                <RecommendationSection
                  title="Due for Revision"
                  icon={<Clock className="h-4 w-4 text-orange-500" />}
                  items={groupedRecommendations.revision}
                  onItemClick={onResourceClick}
                />
              )}

              {/* Weak Topics */}
              <RecommendationSection
                title="Weak Topics"
                icon={<Target className="h-4 w-4 text-red-500" />}
                items={groupedRecommendations.weakTopics}
                onItemClick={onResourceClick}
              />

              {/* Trending */}
              <RecommendationSection
                title="Trending"
                icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
                items={groupedRecommendations.trending}
                onItemClick={onResourceClick}
              />

              {/* Next Chapter */}
              <RecommendationSection
                title="Next Steps"
                icon={<Users className="h-4 w-4 text-blue-500" />}
                items={groupedRecommendations.nextChapter}
                onItemClick={onResourceClick}
              />
            </div>
          )}
        </ScrollArea>

        {/* Footer - Ask Cogni */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Ask Cogni for Help
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  )
}
