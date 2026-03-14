'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Bookmark,
  RefreshCw,
  Layers,
  HelpCircle,
  MessageCircle,
  Share2,
  Download,
  MoreHorizontal,
  BookOpen,
  FileText,
  Video,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive'
  group?: 'primary' | 'secondary' | 'tertiary'
}

export interface QuickActionsMenuProps {
  trigger?: 'button' | 'context-menu' | 'both'
  resourceId?: string
  resourceType?: 'notes' | 'video' | 'pyq' | 'concept'
  onOpen?: () => void
  onBookmark?: () => void
  onRevision?: () => void
  onFlashcards?: () => void
  onQuiz?: () => void
  onAskCogni?: () => void
  onShare?: () => void
  onDownload?: () => void
  isBookmarked?: boolean
  className?: string
  children?: React.ReactNode
}

// Animation variants for menu items
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.15,
      ease: 'easeOut'
    }
  })
}

export function QuickActionsMenu({
  trigger = 'both',
  resourceId,
  resourceType = 'notes',
  onOpen,
  onBookmark,
  onRevision,
  onFlashcards,
  onQuiz,
  onAskCogni,
  onShare,
  onDownload,
  isBookmarked = false,
  className,
  children,
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [showContextMenu, setShowContextMenu] = useState(false)

  // Define actions based on resource type
  const getActions = useCallback((): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'open',
        label: 'Open',
        icon: <ExternalLink className="h-4 w-4" />,
        shortcut: 'Enter',
        action: () => onOpen?.(),
        group: 'primary',
      },
      {
        id: 'bookmark',
        label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
        icon: <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current text-yellow-500')} />,
        shortcut: 'B',
        action: () => onBookmark?.(),
        group: 'primary',
      },
    ]

    const learningActions: QuickAction[] = [
      {
        id: 'revision',
        label: 'Add to Revision',
        icon: <RefreshCw className="h-4 w-4" />,
        shortcut: 'R',
        action: () => onRevision?.(),
        group: 'secondary',
      },
      {
        id: 'flashcards',
        label: 'Create Flashcards',
        icon: <Layers className="h-4 w-4" />,
        shortcut: 'F',
        action: () => onFlashcards?.(),
        group: 'secondary',
      },
      {
        id: 'quiz',
        label: 'Generate Quiz',
        icon: <HelpCircle className="h-4 w-4" />,
        shortcut: 'Q',
        action: () => onQuiz?.(),
        group: 'secondary',
      },
    ]

    const aiActions: QuickAction[] = [
      {
        id: 'ask-cogni',
        label: 'Ask Cogni',
        icon: <Sparkles className="h-4 w-4 text-blue-500" />,
        shortcut: 'A',
        action: () => onAskCogni?.(),
        group: 'secondary',
      },
    ]

    const exportActions: QuickAction[] = [
      {
        id: 'share',
        label: 'Share',
        icon: <Share2 className="h-4 w-4" />,
        shortcut: 'S',
        action: () => onShare?.(),
        group: 'tertiary',
      },
      {
        id: 'download',
        label: 'Download',
        icon: <Download className="h-4 w-4" />,
        shortcut: 'D',
        action: () => onDownload?.(),
        group: 'tertiary',
      },
    ]

    // Customize based on resource type
    if (resourceType === 'video') {
      return [...baseActions, ...aiActions, ...exportActions]
    }

    if (resourceType === 'pyq') {
      return [
        ...baseActions,
        {
          id: 'revision',
          label: 'Add to Revision',
          icon: <RefreshCw className="h-4 w-4" />,
          shortcut: 'R',
          action: () => onRevision?.(),
          group: 'secondary',
        },
        {
          id: 'ask-cogni',
          label: 'Get Solution',
          icon: <MessageCircle className="h-4 w-4 text-blue-500" />,
          shortcut: 'A',
          action: () => onAskCogni?.(),
          group: 'secondary',
        },
        ...exportActions,
      ]
    }

    return [...baseActions, ...learningActions, ...aiActions, ...exportActions]
  }, [
    resourceType,
    isBookmarked,
    onOpen,
    onBookmark,
    onRevision,
    onFlashcards,
    onQuiz,
    onAskCogni,
    onShare,
    onDownload,
  ])

  // Handle context menu (right-click)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (trigger === 'button') return
    
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }, [trigger])

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowContextMenu(false)
    }

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showContextMenu])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen && !showContextMenu) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const actions = getActions()
      const key = e.key.toUpperCase()
      
      const action = actions.find(a => a.shortcut === key)
      if (action && !action.disabled) {
        e.preventDefault()
        action.action()
        setIsOpen(false)
        setShowContextMenu(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showContextMenu, getActions])

  const actions = getActions()
  const groupedActions = {
    primary: actions.filter(a => a.group === 'primary'),
    secondary: actions.filter(a => a.group === 'secondary'),
    tertiary: actions.filter(a => a.group === 'tertiary'),
  }

  // Render menu content
  const renderMenuContent = () => (
    <>
      {/* Primary Actions */}
      <DropdownMenuGroup>
        {groupedActions.primary.map((action, index) => (
          <DropdownMenuItem
            key={action.id}
            onClick={action.action}
            disabled={action.disabled}
            variant={action.variant}
            className="cursor-pointer"
          >
            <motion.span
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 w-full"
            >
              {action.icon}
              <span>{action.label}</span>
            </motion.span>
            {action.shortcut && (
              <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Secondary Actions */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs text-gray-400 font-normal px-2">
          Learning Tools
        </DropdownMenuLabel>
        {groupedActions.secondary.map((action, index) => (
          <DropdownMenuItem
            key={action.id}
            onClick={action.action}
            disabled={action.disabled}
            variant={action.variant}
            className="cursor-pointer"
          >
            <motion.span
              custom={index + groupedActions.primary.length}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 w-full"
            >
              {action.icon}
              <span>{action.label}</span>
            </motion.span>
            {action.shortcut && (
              <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>

      {groupedActions.tertiary.length > 0 && (
        <>
          <DropdownMenuSeparator />
          
          {/* Tertiary Actions */}
          <DropdownMenuGroup>
            {groupedActions.tertiary.map((action, index) => (
              <DropdownMenuItem
                key={action.id}
                onClick={action.action}
                disabled={action.disabled}
                variant={action.variant}
                className="cursor-pointer"
              >
                <motion.span
                  custom={index + groupedActions.primary.length + groupedActions.secondary.length}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 w-full"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </motion.span>
                {action.shortcut && (
                  <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Button Trigger Dropdown */}
      {(trigger === 'button' || trigger === 'both') && (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            {children || (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 rounded-lg hover:bg-gray-100 transition-colors',
                  className
                )}
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 p-1.5 rounded-xl border-gray-200 shadow-lg"
          >
            {renderMenuContent()}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Context Menu (Right-click) */}
      {trigger === 'context-menu' && children && (
        <div onContextMenu={handleContextMenu}>
          {children}
        </div>
      )}

      {/* Context Menu Popup */}
      <AnimatePresence>
        {showContextMenu && (trigger === 'context-menu' || trigger === 'both') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed',
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              zIndex: 50,
            }}
            className="bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 min-w-[200px]"
          >
            {renderMenuContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Resource-specific action icons
export function getResourceTypeIcon(type: QuickActionsMenuProps['resourceType']) {
  switch (type) {
    case 'notes':
      return <FileText className="h-4 w-4" />
    case 'video':
      return <Video className="h-4 w-4" />
    case 'pyq':
      return <HelpCircle className="h-4 w-4" />
    case 'concept':
      return <BookOpen className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default QuickActionsMenu
