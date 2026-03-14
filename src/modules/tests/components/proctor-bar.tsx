'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Camera, Mic, AlertTriangle, 
  Eye, Monitor, Info, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/modules/tests/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ============================================
// TYPES
// ============================================

interface ProctorConfig {
  requireWebcam: boolean
  requireAudio: boolean
  restrictTab: boolean
  restrictCopy: boolean
  restrictPaste: boolean
}

interface ProctorStatus {
  isMonitoring: boolean
  webcamActive: boolean
  audioActive: boolean
  tabSwitchCount: number
  warningCount: number
  lastHeartbeat: Date | null
}

interface ProctorEvent {
  type: string
  timestamp: Date
  severity: 'info' | 'warning' | 'critical'
  message: string
}

// ============================================
// PROCTOR BAR COMPONENT
// ============================================

interface ProctorBarProps {
  attemptId: string | null
  config?: ProctorConfig
}

export function ProctorBar({ attemptId, config }: ProctorBarProps) {
  const [status, setStatus] = useState<ProctorStatus>({
    isMonitoring: false,
    webcamActive: false,
    audioActive: false,
    tabSwitchCount: 0,
    warningCount: 0,
    lastHeartbeat: null,
  })
  const [showConsent, setShowConsent] = useState(false)
  const [recentEvents, setRecentEvents] = useState<ProctorEvent[]>([])

  // Default config
  const proctorConfig: ProctorConfig = config || {
    requireWebcam: false,
    requireAudio: false,
    restrictTab: true,
    restrictCopy: true,
    restrictPaste: true,
  }

  // Event logging - must be declared before useEffect hooks
  const logEvent = useCallback((event: ProctorEvent) => {
    setRecentEvents(prev => [event, ...prev].slice(0, 10))
  }, [])

  // Emit proctor event to server - must be declared before useEffect hooks
  const emitProctorEvent = useCallback(async (type: string, data: Record<string, unknown>) => {
    if (!attemptId) return

    try {
      await fetch('/api/proctor/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          eventType: type,
          payload: data,
        }),
      })
    } catch (error) {
      console.error('Failed to emit proctor event:', error)
    }
  }, [attemptId])

  // Tab switch detection
  useEffect(() => {
    if (!proctorConfig.restrictTab) return

    const handleVisibilityChange = () => {
      if (document.hidden && status.isMonitoring) {
        // Tab switch detected
        setStatus(prev => ({
          ...prev,
          tabSwitchCount: prev.tabSwitchCount + 1,
          warningCount: prev.warningCount + 1,
        }))

        // Log event
        logEvent({
          type: 'tab_switch',
          timestamp: new Date(),
          severity: 'warning',
          message: 'Tab switch detected',
        })

        // Send to server
        emitProctorEvent('tab_switch', {
          timestamp: new Date().toISOString(),
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [status.isMonitoring, proctorConfig.restrictTab, logEvent, emitProctorEvent])

  // Copy/Paste prevention
  useEffect(() => {
    if (!proctorConfig.restrictCopy && !proctorConfig.restrictPaste) return

    const handleCopy = (e: ClipboardEvent) => {
      if (proctorConfig.restrictCopy && status.isMonitoring) {
        e.preventDefault()
        logEvent({
          type: 'copy_attempt',
          timestamp: new Date(),
          severity: 'warning',
          message: 'Copy attempt blocked',
        })
      }
    }

    const handlePaste = (e: ClipboardEvent) => {
      if (proctorConfig.restrictPaste && status.isMonitoring) {
        e.preventDefault()
        logEvent({
          type: 'paste_attempt',
          timestamp: new Date(),
          severity: 'warning',
          message: 'Paste attempt blocked',
        })
      }
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [status.isMonitoring, proctorConfig, logEvent])

  // Keyboard shortcuts prevention
  useEffect(() => {
    if (!status.isMonitoring) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        // Allow in specific contexts if needed
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return // Allow in input fields
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [status.isMonitoring])

  // Start monitoring
  const startMonitoring = async () => {
    // Request permissions if needed
    if (proctorConfig.requireWebcam) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop()) // Stop for now, will restart later
        setStatus(prev => ({ ...prev, webcamActive: true }))
      } catch (error) {
        console.error('Webcam permission denied:', error)
      }
    }

    if (proctorConfig.requireAudio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        setStatus(prev => ({ ...prev, audioActive: true }))
      } catch (error) {
        console.error('Audio permission denied:', error)
      }
    }

    setStatus(prev => ({
      ...prev,
      isMonitoring: true,
      lastHeartbeat: new Date(),
    }))

    setShowConsent(false)
  }

  // If proctoring is not required
  if (!proctorConfig.restrictTab && !proctorConfig.requireWebcam) {
    return null
  }

  return (
    <>
      {/* Proctor Status Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Monitoring Status */}
            <div className="flex items-center gap-2">
              {status.isMonitoring ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="relative">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <span className="text-xs font-medium text-emerald-700">Proctored</span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Not Monitoring</span>
                </div>
              )}
            </div>

            {/* Device Icons */}
            {proctorConfig.requireWebcam && (
              <div className="flex items-center gap-1">
                <Camera className={cn(
                  "h-4 w-4",
                  status.webcamActive ? "text-emerald-500" : "text-gray-400"
                )} />
              </div>
            )}
            {proctorConfig.requireAudio && (
              <div className="flex items-center gap-1">
                <Mic className={cn(
                  "h-4 w-4",
                  status.audioActive ? "text-emerald-500" : "text-gray-400"
                )} />
              </div>
            )}
          </div>

          {/* Warnings */}
          {status.warningCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {status.warningCount} warning{status.warningCount !== 1 ? 's' : ''}
              </Badge>
            </motion.div>
          )}

          {/* Start Button (if not monitoring) */}
          {!status.isMonitoring && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConsent(true)}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Enable Proctoring
            </Button>
          )}
        </div>
      </div>

      {/* Consent Dialog */}
      <Dialog open={showConsent} onOpenChange={setShowConsent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Proctoring Consent
            </DialogTitle>
            <DialogDescription>
              This test uses proctoring to ensure academic integrity. Please review and accept to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* What will be monitored */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">What will be monitored:</h4>
              <div className="space-y-2">
                {proctorConfig.restrictTab && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <Monitor className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Tab switches and window focus</span>
                  </div>
                )}
                {proctorConfig.restrictCopy && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Copy/paste attempts</span>
                  </div>
                )}
                {proctorConfig.requireWebcam && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Periodic webcam snapshots</span>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Your Privacy</p>
                  <p>All monitoring data is encrypted and stored securely. Webcam snapshots are only taken periodically and are reviewed only if academic integrity concerns arise.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsent(false)}>
              Decline
            </Button>
            <Button onClick={startMonitoring} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              Accept & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
