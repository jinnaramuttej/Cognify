'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  SkipBack,
  SkipForward,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface VideoChapter {
  id: string
  title: string
  startTime: number // in seconds
  endTime: number // in seconds
  thumbnail?: string
}

export interface TranscriptSegment {
  id: string
  text: string
  startTime: number // in seconds
  endTime: number // in seconds
  speaker?: string
}

export interface VideoPlayerProps {
  src: string
  poster?: string
  chapters?: VideoChapter[]
  transcript?: TranscriptSegment[]
  autoPlay?: boolean
  className?: string
  onProgress?: (progress: number, currentTime: number) => void
  onChapterChange?: (chapter: VideoChapter | null) => void
  onComplete?: () => void
}

// Format time to mm:ss or hh:mm:ss
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

// Playback speed options
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function VideoPlayer({
  src,
  poster,
  chapters = [],
  transcript = [],
  autoPlay = false,
  className,
  onProgress,
  onChapterChange,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  
  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcriptSearch, setTranscriptSearch] = useState('')
  
  // Compute current chapter based on time using memoization
  const currentChapter = useMemo(() => {
    return chapters.find(
      ch => currentTime >= ch.startTime && currentTime < ch.endTime
    ) || null
  }, [currentTime, chapters])
  
  // Track previous chapter for callback
  const prevChapterRef = useRef<VideoChapter | null>(null)
  
  // Call onChapterChange when chapter changes
  useEffect(() => {
    if (currentChapter?.id !== prevChapterRef.current?.id) {
      onChapterChange?.(currentChapter)
      prevChapterRef.current = currentChapter
    }
  }, [currentChapter, onChapterChange])

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isPlaying && !isHovering) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [isPlaying, isHovering, showControls])

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      const progress = (time / duration) * 100
      onProgress?.(progress, time)
    }
  }, [duration, onProgress])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  const handleProgress = useCallback(() => {
    if (videoRef.current?.buffered.length) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      setBuffered((bufferedEnd / duration) * 100)
    }
  }, [duration])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    onComplete?.()
  }, [onComplete])

  // Controls
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, duration))
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [duration])

  const skip = useCallback((seconds: number) => {
    seekTo(currentTime + seconds)
  }, [currentTime, seekTo])

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const changeSpeed = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
    setShowSettings(false)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPiP(false)
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture()
        setIsPiP(true)
      }
    } catch (error) {
      console.error('PiP error:', error)
    }
  }, [])

  // Progress bar interaction
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(percent * duration)
  }, [duration, seekTo])

  // Chapter click handler
  const handleChapterClick = useCallback((chapter: VideoChapter) => {
    seekTo(chapter.startTime)
    setShowChapters(false)
  }, [seekTo])

  // Transcript click handler
  const handleTranscriptClick = useCallback((segment: TranscriptSegment) => {
    seekTo(segment.startTime)
  }, [seekTo])

  // Filter transcript by search
  const filteredTranscript = transcript.filter(segment =>
    segment.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-xl overflow-hidden group',
        isFullscreen && 'rounded-none',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play/Pause Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 text-white" fill="white" />
          ) : (
            <Play className="h-7 w-7 text-white ml-1" fill="white" />
          )}
        </motion.button>
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
      />

      {/* Chapter Markers on Timeline */}
      {chapters.length > 0 && (
        <div className="absolute bottom-14 left-0 right-0 px-4 pointer-events-none">
          <div className="relative h-1">
            {chapters.map((chapter) => {
              const leftPercent = (chapter.startTime / duration) * 100
              const widthPercent = ((chapter.endTime - chapter.startTime) / duration) * 100
              const isActive = currentChapter?.id === chapter.id
              
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'absolute h-full cursor-pointer pointer-events-auto',
                    isActive ? 'bg-blue-400' : 'bg-white/30'
                  )}
                  style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  onClick={() => handleChapterClick(chapter)}
                  title={chapter.title}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 10 }}
        className="absolute inset-x-0 bottom-0 p-4 space-y-3"
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
          onClick={handleProgressClick}
        >
          {/* Buffered */}
          <div
            className="absolute h-full bg-white/40 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          
          {/* Progress */}
          <motion.div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Scrubber */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-9 w-9 text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </Button>
            </motion.div>

            {/* Skip Back */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                className="h-9 w-9 text-white hover:bg-white/20"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Skip Forward */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                className="h-9 w-9 text-white hover:bg-white/20"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </motion.div>

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

            {/* Time */}
            <span className="text-sm text-white/80 ml-2 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Current Chapter */}
            {currentChapter && (
              <Badge className="bg-blue-500/80 text-white border-0 text-xs">
                {currentChapter.title}
              </Badge>
            )}

            {/* Chapters Toggle */}
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
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Transcript Toggle */}
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

            {/* Playback Speed */}
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    'h-9 w-9 text-white hover:bg-white/20',
                    showSettings && 'bg-white/20'
                  )}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Speed Menu */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 min-w-32"
                  >
                    <div className="text-xs text-white/60 mb-2 px-2">Playback Speed</div>
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

            {/* Picture in Picture */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePiP}
                className="h-9 w-9 text-white hover:bg-white/20"
              >
                <PictureInPicture className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Fullscreen */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-9 w-9 text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Chapters Sidebar */}
      <AnimatePresence>
        {showChapters && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Chapters</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChapters(false)}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-2">
                {chapters.map((chapter, index) => {
                  const isActive = currentChapter?.id === chapter.id
                  const isCompleted = currentTime >= chapter.endTime
                  
                  return (
                    <motion.button
                      key={chapter.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleChapterClick(chapter)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg mb-1 transition-colors',
                        isActive
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {chapter.thumbnail ? (
                          <img
                            src={chapter.thumbnail}
                            alt={chapter.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-12 bg-white/10 rounded flex items-center justify-center">
                            <Play className="h-4 w-4 text-white/60" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            'text-sm font-medium truncate',
                            isActive ? 'text-blue-400' : 'text-white'
                          )}>
                            {chapter.title}
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                          </div>
                          {isCompleted && (
                            <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
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
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Transcript</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTranscript(false)}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
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

            <ScrollArea className="h-[calc(100%-120px)]">
              <div className="p-2">
                {filteredTranscript.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    No matching transcript found
                  </div>
                ) : (
                  filteredTranscript.map((segment, index) => {
                    const isActive = currentTime >= segment.startTime && currentTime < segment.endTime
                    
                    return (
                      <motion.button
                        key={segment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
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
    </div>
  )
}

export default VideoPlayer
