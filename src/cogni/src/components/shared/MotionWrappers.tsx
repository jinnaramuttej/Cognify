"use client";

import { motion, type MotionProps, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  fadeVariants,
  slideUpVariants,
  scaleVariants,
  staggerContainerVariants,
  staggerItemVariants,
  pageTransitionVariants,
  viewportOptions,
} from "@/lib/motion/config";

// ============================================
// PAGE WRAPPER
// ============================================
interface PageWrapperProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransitionVariants}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER CONTAINER
// ============================================
interface StaggerContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({
  children,
  className,
  delay = 0.1,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER ITEM
// ============================================
interface StaggerItemProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// ============================================
// FADE IN
// ============================================
interface FadeInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.2, delay },
        },
        exit: { opacity: 0 },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SLIDE UP
// ============================================
interface SlideUpProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}

export function SlideUp({
  children,
  className,
  delay = 0,
  distance = 20,
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, delay, ease: "easeOut" },
        },
        exit: { opacity: 0, y: -10 },
      }}
      viewport={viewportOptions}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SCALE IN
// ============================================
interface ScaleInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleIn({ children, className, delay = 0, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { type: "spring", stiffness: 300, damping: 30, delay },
        },
        exit: { opacity: 0, scale: 0.95 },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED CARD
// ============================================
interface AnimatedCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function AnimatedCard({
  children,
  className,
  onClick,
  hoverable = true,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover={hoverable ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
      variants={{
        rest: {
          y: 0,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          transition: { duration: 0.2 },
        },
        hover: {
          y: -4,
          boxShadow: "0 12px 24px rgba(37, 99, 235, 0.12)",
          transition: { duration: 0.2 },
        },
        tap: { scale: 0.98, transition: { duration: 0.1 } },
      }}
      className={cn(
        "bg-white rounded-lg border transition-colors duration-200",
        hoverable && "cursor-pointer",
        className
      )}
      style={{ borderColor: "#E5E7EB" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED BUTTON
// ============================================
interface AnimatedButtonProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export function AnimatedButton({
  children,
  className,
  onClick,
  disabled = false,
  variant = "primary",
  ...props
}: AnimatedButtonProps) {
  const variantStyles = {
    primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
    secondary: "bg-white text-[#2563EB] border border-[#2563EB] hover:bg-blue-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// TYPING INDICATOR
// ============================================
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[#2563EB]"
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 0.8,
  className,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// ============================================
// PULSE GLOW
// ============================================
interface PulseGlowProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function PulseGlow({ children, className, color = "#2563EB" }: PulseGlowProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}00`,
          `0 0 20px 4px ${color}30`,
          `0 0 0 0 ${color}00`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
