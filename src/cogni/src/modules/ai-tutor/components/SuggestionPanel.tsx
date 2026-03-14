"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { COGNI_THEME, type SuggestionChip } from "../types";

interface SuggestionPanelProps {
  suggestions: SuggestionChip[];
  onSelect: (suggestion: SuggestionChip) => void;
  disabled?: boolean;
  className?: string;
}

const chipTypeStyles: Record<SuggestionChip["type"], { bg: string; border: string; color: string; icon: string }> = {
  concept: {
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200 hover:border-blue-300",
    color: "#2563EB",
    icon: "📚",
  },
  pyq: {
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-200 hover:border-purple-300",
    color: "#7C3AED",
    icon: "📝",
  },
  practice: {
    bg: "bg-green-50 hover:bg-green-100",
    border: "border-green-200 hover:border-green-300",
    color: "#10B981",
    icon: "✏️",
  },
  summary: {
    bg: "bg-amber-50 hover:bg-amber-100",
    border: "border-amber-200 hover:border-amber-300",
    color: "#F59E0B",
    icon: "📋",
  },
  weakness: {
    bg: "bg-red-50 hover:bg-red-100",
    border: "border-red-200 hover:border-red-300",
    color: "#DC2626",
    icon: "🎯",
  },
  mistake: {
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-200 hover:border-orange-300",
    color: "#EA580C",
    icon: "⚠️",
  },
};

export function SuggestionPanel({
  suggestions,
  onSelect,
  disabled = false,
  className,
}: SuggestionPanelProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn("px-3 py-2 shrink-0 border-b bg-gray-50/50", className)}
      style={{ borderColor: COGNI_THEME.border }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.03,
            },
          },
        }}
        className="flex flex-wrap gap-2"
      >
        {suggestions.map((suggestion) => {
          const style = chipTypeStyles[suggestion.type];

          return (
            <motion.button
              key={suggestion.id}
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                },
              }}
              whileHover={{
                scale: disabled ? 1 : 1.03,
                y: disabled ? 0 : -2,
              }}
              whileTap={{ scale: disabled ? 1 : 0.97 }}
              onClick={() => !disabled && onSelect(suggestion)}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full",
                "border transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                style.bg,
                style.border
              )}
              style={{
                color: style.color,
              }}
            >
              <motion.span
                className="text-base"
                animate={disabled ? {} : { rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {style.icon}
              </motion.span>
              <span className="font-medium">{suggestion.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
