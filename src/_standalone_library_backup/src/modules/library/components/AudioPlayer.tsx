'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Bookmark,
  BookmarkPlus,
  Search,
  List,
  Headphones,
  Repeat,
  Shuffle,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface AudioChapter {
  id: string
  title: string
  startTime: number // in seconds
  endTime: number // in seconds
}

export interface AudioTranscriptSegment {
  id: string
  text: string
  startTime: number
  endTime: number
  speaker?: string
}

export interface AudioBookmark {
  id: string
  time: number
  note?: string
  createdAt: Date
}

interface AudioPlayerProps {
  src: string
  title: string
  poster?: string
  chapters?: AudioChapter[]
  transcript?: AudioTranscriptSegment[]
  bookmarks?: AudioBookmark[]
  autoPlay?: boolean
  className?: string
  onProgress?: (progress: number, currentTime: number) => void
  onChapterChange?: (chapter: AudioChapter | null) => void
  onComplete?: () => void
  onBookmarkAdd?: (time: number) => void
}

// Format time
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Playback speeds
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function AudioPlayer({
  src,
  title,
  poster,
  chapters = [],
  transcript = [],
  bookmarks = [],
  autoPlay = false,
  className,
  onProgress,
  onChapterChange,
  onComplete,
  onBookmarkAdd,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcriptSearch, setTranscriptSearch] = useState('')
  
  // Get current chapter
  const currentChapter = chapters.find(
    ch => currentTime >= ch.startTime && currentTime < ch.endTime
  ) || null
  
  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      const progress = (time / duration) * 100
      onProgress?.(progress, time)
    }
  }, [duration, onProgress])
  
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }, [])
  
  const handleEnded = useCallback(() => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else {
      setIsPlaying(false)
      onComplete?.()
    }
  }, [isLooping, onComplete])
  
  // Controls
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])
  
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration))
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [duration])
  
  const skip = useCallback((seconds: number) => {
    seekTo(currentTime + seconds)
  }, [currentTime, seekTo])
  
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }, [])
  
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])
  
  const changeSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
    setShowSettings(false)
  }, [])
  
  const toggleLoop = useCallback(() => {
    setIsLooping(!isLooping)
  }, [isLooping])
  
  // Progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(percent * duration)
  }, [duration, seekTo])
  
  // Chapter click
  const handleChapterClick = useCallback((chapter: AudioChapter) => {
    seekTo(chapter.startTime)
    setShowChapters(false)
  }, [seekTo])
  
  // Transcript click
  const handleTranscriptClick = useCallback((segment: AudioTranscriptSegment) => {
    seekTo(segment.startTime)
  }, [seekTo])
  
  // Add bookmark
  const handleAddBookmark = useCallback(() => {
    onBookmarkAdd?.(currentTime)
  }, [currentTime, onBookmarkAdd])
  
  // Filter transcript
  const filteredTranscript = transcript.filter(segment =>
    segment.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  )
  
  // Notify chapter change
  useEffect(() => {
    onChapterChange?.(currentChapter)
  }, [currentChapter, onChapterChange])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-gradient-to-br from-gray-900 to-gray-800',
        isExpanded && 'fixed inset-4 z-50',
        className
      )}
    >
      {/* Poster / Waveform Background */}
      <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        {poster && (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover opacity-30"
          />
        )}
        
        {/* Audio waveform visualization placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
            className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
          >
            <Headphones className="h-12 w-12 text-white/60" />
          </motion.div>
        </div>
        
        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
          {currentChapter && (
            <Badge className="mt-2 bg-white/20 text-white border-0">
              {currentChapter.title}
            </Badge>
          )}
        </div>
        
        {/* Expand Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            ref={progressRef}
            className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            {/* Progress */}
            <motion.div
              className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Scrubber */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
              whileHover={{ scale: 1.2 }}
            />
            
            {/* Chapter Markers */}
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                style={{ left: `${(chapter.startTime / duration) * 100}%` }}
              />
            ))}
            
            {/* Bookmarks */}
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="absolute top-0 bottom-0 w-1 bg-yellow-400"
                style={{ left: `${(bookmark.time / duration) * 100}%` }}
                title={bookmark.note || 'Bookmark'}
              />
            ))}
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between text-xs text-white/60 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Skip Back */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-15)}
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
            </motion.div>
            
            {/* Play/Pause */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="default"
                size="icon"
                onClick={togglePlay}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/30"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" fill="white" />
                ) : (
                  <Play className="h-6 w-6 text-white ml-1" fill="white" />
                )}
              </Button>
            </motion.div>
            
            {/* Skip Forward */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(15)}
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Volume */}
            <div className="flex items-center gap-1 group/volume">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-9 w-9 text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </motion.div>
              <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-200">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>
            
            {/* Speed */}
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  {playbackSpeed}x
                </Button>
              </motion.div>
              
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg p-2 min-w-32 shadow-xl"
                  >
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={cn(
                          'w-full text-left px-2 py-1.5 rounded text-sm transition-colors',
                          playbackSpeed === speed
                            ? 'bg-blue-500 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Loop */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLoop}
                className={cn(
                  'h-9 w-9 text-white hover:bg-white/20',
                  isLooping && 'bg-blue-500/20 text-blue-400'
                )}
              >
                <Repeat className="h-5 w-5" />
              </Button>
            </motion.div>
            
            {/* Bookmark */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddBookmark}
                className="h-9 w-9 text-white hover:bg-white/20"
              >
                <BookmarkPlus className="h-5 w-5" />
              </Button>
            </motion.div>
            
            {/* Chapters */}
            {chapters.length > 0 && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowChapters(!showChapters)
                    setShowTranscript(false)
                  }}
                  className={cn(
                    'h-9 w-9 text-white hover:bg-white/20',
                    showChapters && 'bg-white/20'
                  )}
                >
                  <List className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
            
            {/* Transcript */}
            {transcript.length > 0 && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowTranscript(!showTranscript)
                    setShowChapters(false)
                  }}
                  className={cn(
                    'h-9 w-9 text-white hover:bg-white/20',
                    showTranscript && 'bg-white/20'
                  )}
                >
                  <Clock className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Chapters Panel */}
      <AnimatePresence>
        {showChapters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10"
          >
            <ScrollArea className="h-48">
              <div className="p-2">
                {chapters.map((chapter) => {
                  const isActive = currentChapter?.id === chapter.id
                  const isCompleted = currentTime >= chapter.endTime
                  
                  return (
                    <motion.button
                      key={chapter.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleChapterClick(chapter)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg mb-1 transition-colors',
                        isActive
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'text-sm font-medium',
                          isActive ? 'text-blue-400' : 'text-white'
                        )}>
                          {chapter.title}
                        </span>
                        <span className="text-xs text-white/60">
                          {formatTime(chapter.startTime)}
                        </span>
                      </div>
                      {isCompleted && (
                        <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                          Completed
                        </Badge>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Transcript Panel */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10"
          >
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="Search transcript..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            
            <ScrollArea className="h-48">
              <div className="p-2">
                {filteredTranscript.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    No matching transcript found
                  </div>
                ) : (
                  filteredTranscript.map((segment) => {
                    const isActive = currentTime >= segment.startTime && currentTime < segment.endTime
                    
                    return (
                      <motion.button
                        key={segment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleTranscriptClick(segment)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg mb-1 transition-colors',
                          isActive
                            ? 'bg-blue-500/20 border-l-2 border-blue-500'
                            : 'hover:bg-white/5'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-white/60 font-mono whitespace-nowrap mt-0.5">
                            {formatTime(segment.startTime)}
                          </span>
                          <div className="flex-1">
                            {segment.speaker && (
                              <div className="text-xs text-blue-400 mb-1">{segment.speaker}</div>
                            )}
                            <p className={cn(
                              'text-sm',
                              isActive ? 'text-white' : 'text-white/70'
                            )}>
                              {segment.text}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AudioPlayer
