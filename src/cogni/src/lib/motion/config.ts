// Cognify Motion System Configuration
// Inspired by Linear.app, Vercel, and Stripe dashboards

import type { Transition, Variants } from "framer-motion";

// ============================================
// COLOR THEME
// ============================================
export const COLORS = {
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  primaryDeep: "#1E40AF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#DC2626",
  white: "#FFFFFF",
  background: "#F8FAFF",
  backgroundEnd: "#EEF2FF",
  border: "#E5E7EB",
  borderHover: "#2563EB",
  text: "#111827",
  textMuted: "#6B7280",
  cardHover: "#FAFBFF",
} as const;

// ============================================
// TIMING CONSTANTS
// ============================================
export const TIMING = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
  page: 0.6,
} as const;

// ============================================
// EASING CURVES
// ============================================
export const EASING = {
  smooth: [0.25, 0.1, 0.25, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
  springBounce: { type: "spring", stiffness: 400, damping: 15 },
  springGentle: { type: "spring", stiffness: 200, damping: 40 },
  easeOut: "easeOut",
  easeInOut: "easeInOut",
} as const;

// ============================================
// TRANSITION PRESETS
// ============================================
export const TRANSITIONS = {
  fast: { duration: TIMING.fast, ease: EASING.easeOut } as Transition,
  normal: { duration: TIMING.normal, ease: EASING.easeOut } as Transition,
  slow: { duration: TIMING.slow, ease: EASING.easeOut } as Transition,
  spring: EASING.spring as Transition,
  springBounce: EASING.springBounce as Transition,
} as const;

// ============================================
// ANIMATION VARIANTS
// ============================================

// Fade animations
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITIONS.normal },
  exit: { opacity: 0, transition: TRANSITIONS.fast },
};

// Slide up animations
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: EASING.easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: TIMING.fast, ease: EASING.easeOut },
  },
};

// Scale animations
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: TRANSITIONS.fast,
  },
};

// Card hover animations
export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    borderColor: COLORS.border,
    transition: TRANSITIONS.normal,
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.12)",
    borderColor: COLORS.primary,
    transition: TRANSITIONS.normal,
  },
  tap: {
    scale: 0.98,
    transition: TRANSITIONS.fast,
  },
};

// Stagger container
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: EASING.easeOut },
  },
};

// Button animations
export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Modal animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: TRANSITIONS.fast,
  },
};

// Drawer animations
export const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    x: "100%",
    transition: TRANSITIONS.fast,
  },
};

// Typing indicator
export const typingDotVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Pulse animation
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Glow animation
export const glowVariants: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(37, 99, 235, 0)",
      "0 0 20px 5px rgba(37, 99, 235, 0.2)",
      "0 0 0 0 rgba(37, 99, 235, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Progress bar animation
export const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (value: number) => ({
    width: `${value}%`,
    transition: { duration: TIMING.slow, ease: EASING.easeOut },
  }),
};

// Counter animation helper
export const counterVariants = {
  initial: { value: 0 },
  animate: (target: number) => ({
    value: target,
    transition: { duration: TIMING.slower, ease: "easeOut" },
  }),
};

// ============================================
// PAGE TRANSITIONS
// ============================================
export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.page,
      ease: EASING.easeOut,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: TIMING.normal, ease: EASING.easeOut },
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Delay helper
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Create stagger delay
export const staggerDelay = (index: number, baseDelay = 0.05): number =>
  index * baseDelay;

// Intersection observer threshold options
export const viewportOptions = {
  once: true,
  amount: 0.1,
  margin: "-50px",
};
