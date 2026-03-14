"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileQuestion,
  BookOpen,
  Target,
  Trophy,
  Brain,
  FolderOpen,
  Search,
  Inbox,
} from "lucide-react";

// ============================================
// ICON OPTIONS
// ============================================
const iconMap = {
  tests: FileQuestion,
  library: BookOpen,
  goals: Target,
  achievements: Trophy,
  ai: Brain,
  folder: FolderOpen,
  search: Search,
  default: Inbox,
};

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
  icon?: keyof typeof iconMap;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "default",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      {/* Animated Icon Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        {/* Glow background */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: "rgba(37, 99, 235, 0.15)" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
          <IconComponent className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-900"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-sm text-gray-500 max-w-sm"
      >
        {description}
      </motion.p>

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20 transition-all duration-200"
          >
            {action.label}
          </Button>
        </motion.div>
      )}

      {/* Decorative dots */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-200"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

// ============================================
// CARD SKELETON
// ============================================
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "bg-white rounded-xl border p-6 space-y-4",
        className
      )}
      style={{ borderColor: "#E5E7EB" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-4/5 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-3/5 animate-pulse" />
      </div>

      {/* Footer */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-gray-100 rounded w-20 animate-pulse" />
        <div className="h-8 bg-gray-100 rounded w-24 animate-pulse" />
      </div>
    </motion.div>
  );
}

// ============================================
// SHIMMER LOADER
// ============================================
export function ShimmerLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-100 rounded",
        className
      )}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// ============================================
// TOOLTIP
// ============================================
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function AnimatedTooltip({ children, content, side = "top" }: AnimatedTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg"
        >
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
