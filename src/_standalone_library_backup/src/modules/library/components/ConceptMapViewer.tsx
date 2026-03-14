'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Search,
  Move,
  MapPin,
  X,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface ConceptNode {
  id: string
  label: string
  type: 'main' | 'primary' | 'secondary'
  x: number
  y: number
  color?: string
  description?: string
  relatedChapterId?: string
  mastery?: number // 0-100
}

export interface ConceptEdge {
  id: string
  sourceId: string
  targetId: string
  label?: string
  type?: 'relates' | 'prerequisite' | 'extends' | 'example'
}

export interface ConceptMapViewerProps {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  onNodeClick?: (node: ConceptNode) => void
  onExport?: () => void
  className?: string
  title?: string
  showMinimap?: boolean
  showSearch?: boolean
  showExport?: boolean
}

// Default colors for node types
const nodeColors = {
  main: '#2563EB',
  primary: '#3B82F6',
  secondary: '#60A5FA',
}

const edgeColors = {
  relates: '#94A3B8',
  prerequisite: '#F59E0B',
  extends: '#10B981',
  example: '#8B5CF6',
}

// Helper function to calculate edge path
function getEdgePath(
  source: ConceptNode,
  target: ConceptNode,
  curvature: number = 0.2
): string {
  const midX = (source.x + target.x) / 2
  const midY = (source.y + target.y) / 2
  
  // Calculate control point for curved line
  const dx = target.x - source.x
  const dy = target.y - source.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  // Perpendicular offset for curve
  const offset = dist * curvature
  const controlX = midX - (dy / dist) * offset
  const controlY = midY + (dx / dist) * offset

  return `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`
}

// Get label position along the edge
function getLabelPosition(source: ConceptNode, target: ConceptNode) {
  const midX = (source.x + target.x) / 2
  const midY = (source.y + target.y) / 2
  return { x: midX, y: midY - 10 }
}

export function ConceptMapViewer({
  nodes,
  edges,
  onNodeClick,
  onExport,
  className,
  title = 'Concept Map',
  showMinimap = true,
  showSearch = true,
  showExport = true,
}: ConceptMapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  
  // State
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<ConceptNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Calculate bounds
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 }
    
    const padding = 100
    const xs = nodes.map(n => n.x)
    const ys = nodes.map(n => n.y)
    
    return {
      minX: Math.min(...xs) - padding,
      minY: Math.min(...ys) - padding,
      maxX: Math.max(...xs) + padding,
      maxY: Math.max(...ys) + padding,
    }
  }, [nodes])

  const viewBoxWidth = bounds.maxX - bounds.minX
  const viewBoxHeight = bounds.maxY - bounds.minY

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes
    return nodes.filter(n => 
      n.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [nodes, searchQuery])

  // Highlighted node IDs
  const highlightedNodeIds = useMemo(() => {
    if (!selectedNode && !hoveredNode) return new Set<string>()
    
    const connectedIds = new Set<string>()
    const startNode = selectedNode || hoveredNode
    
    if (startNode) {
      connectedIds.add(startNode.id)
      edges.forEach(edge => {
        if (edge.sourceId === startNode.id) connectedIds.add(edge.targetId)
        if (edge.targetId === startNode.id) connectedIds.add(edge.sourceId)
      })
    }
    
    return connectedIds
  }, [selectedNode, hoveredNode, edges])

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === 'svg') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.3))
  }, [])

  const handleResetView = useCallback(() => {
    setScale(1)
    setPan({ x: 0, y: 0 })
    setSelectedNode(null)
  }, [])

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.3, Math.min(3, prev * delta)))
  }, [])

  // Node click handler
  const handleNodeClick = useCallback((node: ConceptNode) => {
    setSelectedNode(node)
    onNodeClick?.(node)
  }, [onNodeClick])

  // Export as PNG
  const handleExport = useCallback(async () => {
    if (!svgRef.current) return
    
    try {
      // Create a canvas from the SVG
      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      canvas.width = viewBoxWidth * 2
      canvas.height = viewBoxHeight * 2
      
      img.onload = () => {
        ctx?.scale(2, 2)
        ctx?.drawImage(img, 0, 0)
        
        const link = document.createElement('a')
        link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        
        onExport?.()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [viewBoxWidth, viewBoxHeight, title, onExport])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Render edge
  const renderEdge = (edge: ConceptEdge) => {
    const source = nodes.find(n => n.id === edge.sourceId)
    const target = nodes.find(n => n.id === edge.targetId)
    
    if (!source || !target) return null
    
    const isHighlighted = highlightedNodeIds.has(source.id) && highlightedNodeIds.has(target.id)
    const edgeColor = edgeColors[edge.type || 'relates']
    const labelPos = getLabelPosition(source, target)
    
    return (
      <g key={edge.id}>
        {/* Edge line */}
        <motion.path
          d={getEdgePath(source, target)}
          fill="none"
          stroke={isHighlighted ? edgeColor : '#E5E7EB'}
          strokeWidth={isHighlighted ? 2.5 : 1.5}
          strokeDasharray={edge.type === 'prerequisite' ? '5,5' : undefined}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Arrow head */}
        <motion.polygon
          points="0,0 -8,4 -8,-4"
          fill={isHighlighted ? edgeColor : '#9CA3AF'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          transform={`translate(${target.x}, ${target.y}) rotate(${Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI})`}
        />
        
        {/* Edge label */}
        {edge.label && (
          <motion.text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            className="text-[10px] fill-gray-400 pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHighlighted ? 1 : 0.5 }}
          >
            {edge.label}
          </motion.text>
        )}
      </g>
    )
  }

  // Render node
  const renderNode = (node: ConceptNode) => {
    const isSelected = selectedNode?.id === node.id
    const isHovered = hoveredNode?.id === node.id
    const isHighlighted = highlightedNodeIds.has(node.id) || highlightedNodeIds.size === 0
    const isFiltered = !filteredNodes.includes(node)
    const nodeColor = node.color || nodeColors[node.type]
    
    const nodeRadius = node.type === 'main' ? 40 : node.type === 'primary' ? 30 : 24
    
    return (
      <motion.g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isFiltered ? 0.5 : 1, 
          opacity: isFiltered ? 0.2 : 1 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="cursor-pointer"
        onClick={() => handleNodeClick(node)}
        onMouseEnter={() => setHoveredNode(node)}
        onMouseLeave={() => setHoveredNode(null)}
        style={{ pointerEvents: isFiltered ? 'none' : 'auto' }}
      >
        {/* Glow effect */}
        <AnimatePresence>
          {(isSelected || isHovered) && (
            <motion.circle
              r={nodeRadius + 10}
              fill="none"
              stroke={nodeColor}
              strokeWidth={2}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            />
          )}
        </AnimatePresence>
        
        {/* Node circle */}
        <motion.circle
          r={nodeRadius}
          fill={isSelected || isHovered ? nodeColor : 'white'}
          stroke={nodeColor}
          strokeWidth={2}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            filter: isSelected ? `drop-shadow(0 0 10px ${nodeColor}40)` : undefined
          }}
        />
        
        {/* Node label */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className={cn(
            'text-xs font-medium pointer-events-none select-none',
            (isSelected || isHovered) ? 'fill-white' : 'fill-gray-700'
          )}
        >
          {node.label.length > 12 ? `${node.label.slice(0, 12)}...` : node.label}
        </text>
        
        {/* Mastery indicator */}
        {node.mastery !== undefined && (
          <circle
            r={nodeRadius + 4}
            fill="none"
            stroke="#10B981"
            strokeWidth={3}
            strokeDasharray={`${2 * Math.PI * (nodeRadius + 4)}`}
            strokeDashoffset={2 * Math.PI * (nodeRadius + 4) * (1 - node.mastery / 100)}
            transform={`rotate(-90)`}
            className="opacity-60"
          />
        )}
      </motion.g>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-white rounded-xl border border-gray-200 overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {filteredNodes.length} concepts
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Search */}
          {showSearch && (
            <div className="relative mr-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts..."
                className="h-8 w-40 pl-8 text-sm bg-white"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          
          {/* Zoom controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Badge variant="secondary" className="h-6 min-w-[50px] justify-center text-xs">
            {Math.round(scale * 100)}%
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            className="h-8 w-8 p-0"
            title="Reset View"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          {/* Export */}
          {showExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0"
              title="Export as PNG"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Main SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className={cn(
          'select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        viewBox={`${bounds.minX} ${bounds.minY} ${viewBoxWidth} ${viewBoxHeight}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        
        <rect
          x={bounds.minX}
          y={bounds.minY}
          width={viewBoxWidth}
          height={viewBoxHeight}
          fill="url(#grid)"
        />
        
        {/* Edges layer */}
        <g className="edges">
          {edges.map(renderEdge)}
        </g>
        
        {/* Nodes layer */}
        <g className="nodes">
          {nodes.map(renderNode)}
        </g>
      </svg>
      
      {/* Minimap */}
      {showMinimap && !isFullscreen && (
        <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          <svg
            width={150}
            height={100}
            viewBox={`${bounds.minX} ${bounds.minY} ${viewBoxWidth} ${viewBoxHeight}`}
            className="opacity-60"
          >
            {/* Simplified nodes */}
            {nodes.map(node => (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={3}
                fill={node.color || nodeColors[node.type]}
              />
            ))}
            
            {/* Viewport indicator */}
            <rect
              x={bounds.minX - pan.x / scale}
              y={bounds.minY - pan.y / scale}
              width={viewBoxWidth / scale}
              height={viewBoxHeight / scale}
              fill="none"
              stroke="#2563EB"
              strokeWidth={5}
              strokeOpacity={0.5}
            />
          </svg>
        </div>
      )}
      
      {/* Selected Node Info */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 z-10 bg-white rounded-xl border border-gray-200 shadow-lg p-4 max-w-xs"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">
                {selectedNode.label}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="h-6 w-6 p-0 -mr-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            {selectedNode.description && (
              <p className="text-xs text-gray-500 mb-2">
                {selectedNode.description}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              {selectedNode.mastery !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {selectedNode.mastery}% mastery
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: nodeColors[selectedNode.type], color: nodeColors[selectedNode.type] }}
              >
                {selectedNode.type}
              </Badge>
            </div>
            
            {selectedNode.relatedChapterId && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 mt-2 text-xs text-blue-600"
                onClick={() => {
                  // Navigate to chapter
                  console.log('Navigate to chapter:', selectedNode.relatedChapterId)
                }}
              >
                View related chapter →
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pan indicator */}
      {isDragging && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-gray-800 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
          <Move className="h-3 w-3" />
          Drag to pan
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-3 text-xs border border-gray-200">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: nodeColors.main }} />
          <span className="text-gray-600">Main</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: nodeColors.primary }} />
          <span className="text-gray-600">Primary</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: nodeColors.secondary }} />
          <span className="text-gray-600">Secondary</span>
        </div>
      </div>
    </div>
  )
}

export default ConceptMapViewer
