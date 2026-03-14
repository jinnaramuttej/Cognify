'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProctorEventType, ProctorSeverity, ProctorMode, ProctorLog } from '@/modules/tests/types'

// ============================================
// PROCOTRING HOOK
// ============================================

interface UseProctoringOptions {
  attemptId: string
  mode: ProctorMode
  requireWebcam?: boolean
  requireAudio?: boolean
  restrictTab?: boolean
  restrictCopy?: boolean
  snapshotInterval?: number // seconds
  onEvent?: (event: ProctorLog) => void
  onWarning?: (count: number) => void
  onCritical?: (event: ProctorLog) => void
}

interface ProctoringState {
  isActive: boolean
  consentGiven: boolean
  webcamActive: boolean
  audioActive: boolean
  tabSwitchCount: number
  warningCount: number
  criticalCount: number
  events: ProctorLog[]
  deviceFingerprint: string | null
  sessionStarted: boolean
}

export function useProctoring({
  attemptId,
  mode,
  requireWebcam = false,
  requireAudio = false,
  restrictTab = true,
  restrictCopy = true,
  snapshotInterval = 30,
  onEvent,
  onWarning,
  onCritical
}: UseProctoringOptions) {
  const [state, setState] = useState<ProctoringState>({
    isActive: false,
    consentGiven: false,
    webcamActive: false,
    audioActive: false,
    tabSwitchCount: 0,
    warningCount: 0,
    criticalCount: 0,
    events: [],
    deviceFingerprint: null,
    sessionStarted: false
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const snapshotTimerRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Generate device fingerprint
  const generateFingerprint = useCallback(() => {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown'
    ].join('|')
    
    // Simple hash
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }, [])

  // Log event
  const logEvent = useCallback((eventType: ProctorEventType, severity: ProctorSeverity = 'info', eventData?: Record<string, unknown>) => {
    const event: ProctorLog = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      attemptId,
      eventType,
      eventTimestamp: new Date(),
      eventData,
      deviceFingerprint: state.deviceFingerprint || undefined,
      severity,
      isReviewed: false
    }

    setState(prev => ({
      ...prev,
      events: [...prev.events, event],
      warningCount: severity === 'warning' ? prev.warningCount + 1 : prev.warningCount,
      criticalCount: severity === 'critical' ? prev.criticalCount + 1 : prev.criticalCount
    }))

    onEvent?.(event)
    
    if (severity === 'warning') {
      onWarning?.(state.warningCount + 1)
    }
    if (severity === 'critical') {
      onCritical?.(event)
    }

    return event
  }, [attemptId, state.deviceFingerprint, state.warningCount, onEvent, onWarning, onCritical])

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: requireAudio 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setState(prev => ({ 
        ...prev, 
        webcamActive: true,
        audioActive: requireAudio
      }))

      logEvent('webcam_snapshot', 'info', { action: 'webcam_started' })
      
      return true
    } catch (error) {
      console.error('Failed to start webcam:', error)
      logEvent('webcam_snapshot', 'critical', { 
        action: 'webcam_failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }, [requireAudio, logEvent])

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (snapshotTimerRef.current) {
      clearInterval(snapshotTimerRef.current)
      snapshotTimerRef.current = null
    }

    setState(prev => ({ 
      ...prev, 
      webcamActive: false,
      audioActive: false 
    }))
  }, [])

  // Capture snapshot
  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !state.webcamActive) return null

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }

    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    
    logEvent('webcam_snapshot', 'info', { 
      action: 'snapshot_captured',
      timestamp: new Date().toISOString()
    })

    return dataUrl
  }, [state.webcamActive, logEvent])

  // Start periodic snapshots
  const startSnapshotCapture = useCallback(() => {
    if (snapshotTimerRef.current) {
      clearInterval(snapshotTimerRef.current)
    }

    snapshotTimerRef.current = setInterval(() => {
      captureSnapshot()
    }, snapshotInterval * 1000)
  }, [snapshotInterval, captureSnapshot])

  // Give consent
  const giveConsent = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      consentGiven: true
    }))

    if (requireWebcam) {
      await startWebcam()
      startSnapshotCapture()
    }

    logEvent('tab_switch', 'info', { action: 'consent_given' })
  }, [requireWebcam, startWebcam, startSnapshotCapture, logEvent])

  // Start proctoring session
  const startSession = useCallback(async () => {
    if (mode === 'none') return

    const fingerprint = generateFingerprint()

    setState(prev => ({
      ...prev,
      isActive: true,
      sessionStarted: true,
      deviceFingerprint: fingerprint
    }))

    logEvent('tab_switch', 'info', { 
      action: 'session_started',
      mode,
      deviceFingerprint: fingerprint
    })
  }, [mode, generateFingerprint, logEvent])

  // End proctoring session
  const endSession = useCallback(() => {
    stopWebcam()
    
    setState(prev => ({
      ...prev,
      isActive: false,
      sessionStarted: false
    }))

    logEvent('tab_switch', 'info', { action: 'session_ended' })
  }, [stopWebcam, logEvent])

  // Set up event listeners
  useEffect(() => {
    if (!state.isActive || mode === 'none') return

    // Tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && restrictTab) {
        const newCount = state.tabSwitchCount + 1
        setState(prev => ({ ...prev, tabSwitchCount: newCount }))
        
        logEvent('tab_switch', newCount > 2 ? 'critical' : 'warning', {
          switchCount: newCount,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Window blur (tab/window switch)
    const handleBlur = () => {
      if (restrictTab) {
        logEvent('window_blur', 'warning', {
          timestamp: new Date().toISOString()
        })
      }
    }

    // Copy attempt
    const handleCopy = (e: ClipboardEvent) => {
      if (restrictCopy) {
        e.preventDefault()
        logEvent('copy_attempt', 'warning', {
          timestamp: new Date().toISOString()
        })
      }
    }

    // Paste attempt
    const handlePaste = (e: ClipboardEvent) => {
      if (restrictCopy) {
        e.preventDefault()
        logEvent('paste_attempt', 'warning', {
          timestamp: new Date().toISOString()
        })
      }
    }

    // Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && mode === 'full') {
        logEvent('fullscreen_exit', 'critical', {
          timestamp: new Date().toISOString()
        })
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [state.isActive, state.tabSwitchCount, mode, restrictTab, restrictCopy, logEvent])

  // Request fullscreen for full mode
  useEffect(() => {
    if (state.isActive && mode === 'full' && state.consentGiven) {
      document.documentElement.requestFullscreen?.().catch(() => {
        logEvent('fullscreen_exit', 'warning', { 
          action: 'fullscreen_request_failed' 
        })
      })
    }
  }, [state.isActive, state.consentGiven, mode, logEvent])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam()
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
  }, [stopWebcam])

  return {
    ...state,
    videoRef,
    startSession,
    endSession,
    giveConsent,
    captureSnapshot,
    logEvent
  }
}
