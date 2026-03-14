"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SuggestionChip } from "../types";

interface SuggestionChipsProps {
  suggestions: SuggestionChip[];
  onSelect: (suggestion: SuggestionChip) => void;
  disabled?: boolean;
  className?: string;
}

const chipTypeStyles: Record<SuggestionChip["type"], string> = {
  concept: "border-[#C7511F]/30 hover:border-[#C7511F]/60 hover:bg-[#C7511F]/5",
  pyq: "border-[#C7511F]/30 hover:border-[#C7511F]/60 hover:bg-[#C7511F]/5",
  practice: "border-[#C7511F]/30 hover:border-[#C7511F]/60 hover:bg-[#C7511F]/5",
  summary: "border-[#C7511F]/30 hover:border-[#C7511F]/60 hover:bg-[#C7511F]/5",
  weakness: "border-[#C7511F]/50 hover:border-[#C7511F] hover:bg-[#C7511F]/10",
};

const chipTypeIcons: Record<SuggestionChip["type"], string> = {
  concept: "📚",
  pyq: "📝",
  practice: "✏️",
  summary: "📋",
  weakness: "🎯",
};

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
  className,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onSelect(suggestion)}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full",
            "border bg-white transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            chipTypeStyles[suggestion.type]
          )}
        >
          <span className="text-xs">{chipTypeIcons[suggestion.type]}</span>
          <span className="text-foreground">{suggestion.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
