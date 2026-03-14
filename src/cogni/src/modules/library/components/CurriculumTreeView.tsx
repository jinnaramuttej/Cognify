/**
 * Cognify Library - Curriculum Tree View Component
 * 
 * Features:
 * - Animated tree expansion with path visualization
 * - Syllabus coverage percentage visualization with circular progress
 * - Multi-language support (tri-lingual labels)
 * - Resource count display with type indicators
 * - Path breadcrumb navigation
 * - Animated expand/collapse with spring physics
 */

"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Layers,
  CheckCircle2,
  Circle,
  Target,
  Loader2,
  Play,
  Download,
  Bookmark,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CurriculumNode, CurriculumTreeProps, ResourceType, ResourceAlignment } from '@/lib/library/types';

// ============================================================
// Helpers
// ============================================================

const LEVEL_CONFIG: Record<number, { icon: React.ElementType; color: string; bgClass: string; borderClass: string }> = {
  0: { icon: Layers, color: 'text-purple-600', bgClass: 'bg-purple-50', borderClass: 'border-purple-200' },
  1: { icon: BookOpen, color: 'text-blue-600', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' },
  2: { icon: BookOpen, color: 'text-indigo-600', bgClass: 'bg-indigo-50', borderClass: 'border-indigo-200' },
  3: { icon: FileText, color: 'text-emerald-600', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' },
  4: { icon: Target, color: 'text-amber-600', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' },
};

const RESOURCE_ICONS: Record<ResourceType, React.ElementType> = {
  video: Video,
  note: FileText,
  question: HelpCircle,
  book: BookOpen,
  question_set: HelpCircle,
};

function getNodeName(node: CurriculumNode, language: 'en' | 'hi' | 'both'): string {
  if (language === 'hi' && node.nameHi) return node.nameHi;
  if (language === 'en' && node.nameEn) return node.nameEn;
  return node.name;
}

function getSecondaryName(node: CurriculumNode, language: 'en' | 'hi' | 'both'): string | null {
  if (language === 'both') {
    if (node.nameHi && node.nameEn) {
      return node.nameHi;
    }
  }
  return null;
}

// ============================================================
// Coverage Badge Component - Circular Progress
// ============================================================

interface CoverageBadgeProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

function CoverageBadge({ percent, size = 'sm', showLabel = false, animated = true }: CoverageBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  const sizeConfig = {
    sm: { size: 28, radius: 10, strokeWidth: 2.5, fontSize: 'text-[9px]' },
    md: { size: 40, radius: 15, strokeWidth: 3, fontSize: 'text-xs' },
    lg: { size: 56, radius: 22, strokeWidth: 4, fontSize: 'text-sm' },
  };
  
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  const colorClass = percent >= 80 ? { stroke: 'stroke-green-500', text: 'text-green-600', bg: 'bg-green-50' } : 
                     percent >= 50 ? { stroke: 'stroke-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' } : 
                     percent >= 25 ? { stroke: 'stroke-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' } : 
                     { stroke: 'stroke-gray-400', text: 'text-gray-600', bg: 'bg-gray-50' };

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center">
      <svg width={config.size} height={config.size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className={colorClass.stroke}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={isInView ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <span className={cn(
        "absolute font-bold",
        config.fontSize,
        colorClass.text
      )}>
        {Math.round(percent)}%
      </span>
    </div>
  );
}

// ============================================================
// Resource Type Badge Component
// ============================================================

interface ResourceTypeBadgesProps {
  alignments: ResourceAlignment[];
  maxShow?: number;
}

function ResourceTypeBadges({ alignments, maxShow = 3 }: ResourceTypeBadgesProps) {
  const types = Array.from(new Set(alignments.map(a => a.resourceType))).slice(0, maxShow);
  
  return (
    <div className="flex items-center gap-1">
      {types.map((type) => {
        const Icon = RESOURCE_ICONS[type];
        const colors: Record<ResourceType, string> = {
          video: 'text-red-500 bg-red-50',
          note: 'text-blue-500 bg-blue-50',
          question: 'text-purple-500 bg-purple-50',
          book: 'text-emerald-500 bg-emerald-50',
          question_set: 'text-orange-500 bg-orange-50',
        };
        
        return (
          <motion.div
            key={type}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              colors[type]
            )}
          >
            <Icon className="w-3 h-3" />
          </motion.div>
        );
      })}
      {alignments.length > maxShow && (
        <span className="text-xs text-gray-400 ml-1">+{alignments.length - maxShow}</span>
      )}
    </div>
  );
}

// ============================================================
// Tree Node Component
// ============================================================

interface TreeNodeProps {
  node: CurriculumNode;
  level: number;
  language: 'en' | 'hi' | 'both';
  isExpanded: boolean;
  isSelected: boolean;
  path: string[];
  onToggle: () => void;
  onSelect: (node: CurriculumNode, path: string[]) => void;
  onResourceClick?: (alignment: ResourceAlignment) => void;
  indentStyle?: 'lines' | 'dots' | 'none';
}

function TreeNode({ 
  node, 
  level, 
  language, 
  isExpanded, 
  isSelected,
  path,
  onToggle, 
  onSelect,
  onResourceClick,
  indentStyle = 'lines'
}: TreeNodeProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[4];
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;
  const nodePath = [...path, node.name];
  
  return (
    <div className="select-none">
      {/* Node Row */}
      <motion.div
        layout
        className={cn(
          "group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all relative",
          "hover:bg-gray-50",
          isSelected && "bg-blue-50 ring-2 ring-blue-200",
          !isSelected && isExpanded && "bg-gray-50/50"
        )}
        onClick={() => {
          onSelect(node, nodePath);
          if (hasChildren) onToggle();
        }}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Connecting lines */}
        {indentStyle === 'lines' && level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-6 border-l-2 border-dashed border-gray-200 ml-6" />
        )}
        
        {/* Expand/Collapse Toggle */}
        <motion.div
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded-lg transition-colors",
            hasChildren ? "hover:bg-gray-100 group-hover:bg-gray-100" : "opacity-0"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle();
          }}
        >
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ChevronRight className={cn(
                "w-4 h-4",
                isExpanded ? "text-blue-500" : "text-gray-400"
              )} />
            </motion.div>
          )}
        </motion.div>
        
        {/* Icon */}
        <motion.div 
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border",
            config.bgClass,
            config.borderClass
          )}
          whileHover={{ scale: 1.05 }}
        >
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className={cn("w-4 h-4", config.color)} />
            ) : (
              <Folder className={cn("w-4 h-4", config.color)} />
            )
          ) : (
            <Icon className={cn("w-4 h-4", config.color)} />
          )}
        </motion.div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {getNodeName(node, language)}
            </span>
            {language === 'both' && getSecondaryName(node, language) && (
              <span className="text-xs text-gray-400 truncate">
                ({getSecondaryName(node, language)})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {node.totalResources} resources
            </span>
          </div>
        </div>
        
        {/* Coverage Badge */}
        {node.coveragePercent > 0 && (
          <CoverageBadge percent={node.coveragePercent} size="sm" />
        )}
        
        {/* Resource Type Icons */}
        {node.alignments && node.alignments.length > 0 && (
          <ResourceTypeBadges alignments={node.alignments} />
        )}
        
        {/* Expand indicator */}
        {hasChildren && (
          <motion.div
            animate={{ opacity: isExpanded ? 0 : 1 }}
            className="text-gray-300"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        )}
      </motion.div>
      
      {/* Children */}
      <AnimatePresence mode="sync">
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden ml-4"
          >
            <div className="pl-4 border-l-2 border-gray-100 mt-1 space-y-1">
              {node.children!.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  language={language}
                  isExpanded={false}
                  isSelected={false}
                  path={nodePath}
                  onToggle={() => {}}
                  onSelect={onSelect}
                  onResourceClick={onResourceClick}
                  indentStyle={indentStyle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Path Breadcrumb Component
// ============================================================

interface PathBreadcrumbProps {
  path: string[];
  onNavigate: (index: number) => void;
  language: 'en' | 'hi' | 'both';
}

function PathBreadcrumb({ path, onNavigate, language }: PathBreadcrumbProps) {
  if (path.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-lg mb-2 flex-wrap"
    >
      <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
      {path.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
          <button
            onClick={() => onNavigate(index)}
            className={cn(
              "text-sm px-2 py-0.5 rounded transition-colors",
              index === path.length - 1
                ? "font-medium text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            {segment}
          </button>
        </React.Fragment>
      ))}
    </motion.div>
  );
}

// ============================================================
// Curriculum Path View Component
// ============================================================

interface CurriculumPathViewProps {
  node: CurriculumNode;
  language: 'en' | 'hi' | 'both';
  onClose: () => void;
}

function CurriculumPathView({ node, language, onClose }: CurriculumPathViewProps) {
  const [activeStep, setActiveStep] = useState(0);
  
  // Flatten tree into learning path
  const flattenPath = useCallback((n: CurriculumNode, path: CurriculumNode[] = []): CurriculumNode[] => {
    path.push(n);
    if (n.children && n.children.length > 0) {
      n.children.forEach(child => flattenPath(child, path));
    }
    return path;
  }, []);
  
  const learningPath = useMemo(() => flattenPath({ ...node }), [node, flattenPath]);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-xl border p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          Learning Path
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      {/* Path visualization */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400" />
        
        <div className="space-y-3">
          {learningPath.slice(0, 10).map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = step.coveragePercent >= 100;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
                  isActive && "bg-blue-50 border border-blue-200",
                  isCompleted && "bg-green-50 border border-green-200"
                )}
                onClick={() => setActiveStep(index)}
              >
                {/* Step indicator */}
                <div className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  isCompleted ? "bg-green-500 text-white" :
                  isActive ? "bg-blue-500 text-white" :
                  "bg-white border-2 border-gray-200 text-gray-400"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isActive ? "text-blue-700" : "text-gray-700"
                  )}>
                    {getNodeName(step, language)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {step.totalResources} resources • {Math.round(step.coveragePercent)}% complete
                  </p>
                </div>
                
                <CoverageBadge percent={step.coveragePercent} size="sm" animated={false} />
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {learningPath.length > 10 && (
        <p className="text-center text-xs text-gray-400 mt-3">
          +{learningPath.length - 10} more items
        </p>
      )}
    </motion.div>
  );
}

// ============================================================
// Main Curriculum Tree Component
// ============================================================

export function CurriculumTreeView({
  nodes,
  selectedNode,
  onNodeSelect,
  expandedNodes = new Set(),
  onExpand,
  language = 'en',
  showPathView = true,
}: CurriculumTreeProps & { showPathView?: boolean }) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    new Set(['ncert-12', 'ncert-12-phys']) // Pre-expand first nodes
  );
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [viewingPathNode, setViewingPathNode] = useState<CurriculumNode | null>(null);
  
  const handleToggle = useCallback((nodeId: string) => {
    setInternalExpanded(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
    onExpand?.(nodeId);
  }, [onExpand]);
  
  const handleSelect = useCallback((node: CurriculumNode, path: string[]) => {
    setSelectedPath(path);
    onNodeSelect?.(node);
  }, [onNodeSelect]);
  
  const handlePathNavigate = useCallback((index: number) => {
    // In a full implementation, this would expand the tree to the selected path
    console.log('Navigate to path index:', index);
  }, []);
  
  return (
    <div className="space-y-3">
      {/* Path Breadcrumb */}
      {showPathView && selectedPath.length > 0 && (
        <PathBreadcrumb
          path={selectedPath}
          onNavigate={handlePathNavigate}
          language={language}
        />
      )}
      
      {/* Tree or Path View */}
      {viewingPathNode ? (
        <CurriculumPathView
          node={viewingPathNode}
          language={language}
          onClose={() => setViewingPathNode(null)}
        />
      ) : (
        <div className="space-y-1">
          {nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              level={node.level}
              language={language}
              isExpanded={internalExpanded.has(node.id)}
              isSelected={selectedNode === node.id}
              path={[]}
              onToggle={() => handleToggle(node.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CurriculumTreeView;
