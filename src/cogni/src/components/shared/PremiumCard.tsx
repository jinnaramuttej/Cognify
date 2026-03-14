"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// PREMIUM CARD
// ============================================
interface PremiumCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glowOnHover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined";
}

export function PremiumCard({
  children,
  className,
  hoverable = true,
  glowOnHover = true,
  padding = "md",
  variant = "default",
  ...props
}: PremiumCardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const variantStyles = {
    default: "bg-white border",
    elevated: "bg-white shadow-md",
    outlined: "bg-transparent border-2",
  };

  return (
    <motion.div
      initial="rest"
      whileHover={hoverable ? "hover" : undefined}
      whileTap={hoverable ? "tap" : undefined}
      variants={{
        rest: {
          y: 0,
          scale: 1,
          boxShadow: variant === "elevated" ? "0 4px 12px rgba(0, 0, 0, 0.08)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
          borderColor: "#E5E7EB",
          transition: { duration: 0.2, ease: "easeOut" },
        },
        hover: {
          y: -4,
          scale: 1.005,
          boxShadow: glowOnHover
            ? "0 12px 28px rgba(37, 99, 235, 0.12)"
            : "0 8px 20px rgba(0, 0, 0, 0.1)",
          borderColor: glowOnHover ? "#2563EB" : "#D1D5DB",
          transition: { duration: 0.2, ease: "easeOut" },
        },
        tap: {
          scale: 0.99,
          transition: { duration: 0.1 },
        },
      }}
      className={cn(
        "rounded-xl transition-colors",
        variantStyles[variant],
        paddingStyles[padding],
        hoverable && "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAT CARD
// ============================================
interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, positive, icon, className }: StatCardProps) {
  return (
    <PremiumCard className={cn("relative overflow-hidden", className)}>
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #2563EB 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {label}
            </p>
            <motion.p
              className="mt-2 text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.p>
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              {icon}
            </div>
          )}
        </div>

        {change && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 flex items-center gap-1"
          >
            <span
              className={cn(
                "text-xs font-medium",
                positive ? "text-green-600" : "text-red-500"
              )}
            >
              {positive ? "↑" : "↓"} {change}
            </span>
            <span className="text-xs text-gray-400">vs last week</span>
          </motion.div>
        )}
      </div>
    </PremiumCard>
  );
}

// ============================================
// PROGRESS RING
// ============================================
interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  label,
  showValue = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      className={cn("relative inline-flex items-center justify-center", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2563EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            className="text-lg font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {value}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-gray-500">{label}</span>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// INTERACTIVE BADGE
// ============================================
interface InteractiveBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
  className?: string;
}

export function InteractiveBadge({
  children,
  variant = "default",
  onClick,
  className,
}: InteractiveBadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.span>
  );
}
