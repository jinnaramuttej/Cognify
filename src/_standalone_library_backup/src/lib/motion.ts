/**
 * Cognify Global Motion Configuration
 * Centralized Framer Motion variants and configurations
 * for consistent animations across the application
 */

import type { Variants, Transition } from 'framer-motion'

// Spring configurations
export const springConfig = {
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 15 } as Transition,
  smooth: { type: 'spring', stiffness: 150, damping: 30 } as Transition,
  snappy: { type: 'spring', stiffness: 500, damping: 30 } as Transition,
}

// Duration transitions
export const durationConfig = {
  fast: { duration: 0.15 } as Transition,
  normal: { duration: 0.2 } as Transition,
  slow: { duration: 0.3 } as Transition,
  page: { duration: 0.4 } as Transition,
}

// Page entrance animations
export const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
}

// Stagger container for children animations
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// Stagger children - fade up
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// Card hover animations
export const cardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    borderColor: 'rgba(229, 231, 235, 1)', // gray-200
  },
  hover: {
    scale: 1.01,
    y: -4,
    boxShadow: '0 12px 24px -8px rgba(37, 99, 235, 0.15)',
    borderColor: 'rgba(37, 99, 235, 0.5)', // blue-500
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  tap: {
    scale: 0.995,
    transition: {
      duration: 0.1,
    },
  },
}

// Button animations
export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

// Fade in animation
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// Scale in animation (for modals, dialogs)
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: {
      duration: 0.15,
    },
  },
}

// Slide in from right
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: 0.2 },
  },
}

// Slide in from bottom (for mobile sheets)
export const slideInBottomVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '100%',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.2 },
  },
}

// Accordion content animation
export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.25, delay: 0.05 },
    },
  },
}

// Number counter animation helper
export const counterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}

// Shimmer effect for loading states
export const shimmerVariants: Variants = {
  initial: { backgroundPosition: '200% 0' },
  animate: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Pulse animation for attention
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Typing dots animation
export const typingDotsVariants: Variants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 0.2,
    },
  },
}

// Tooltip fade animation
export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
}

// Progress bar animation
export const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (value: number) => ({
    width: `${value}%`,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

// Ring/circle progress animation
export const ringProgressVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1, ease: 'easeOut' },
      opacity: { duration: 0.3 },
    },
  },
}

// Dropdown menu animations
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: {
      duration: 0.15,
    },
  },
}

// Sidebar item animations
export const sidebarItemVariants: Variants = {
  rest: {
    x: 0,
    backgroundColor: 'transparent',
  },
  hover: {
    x: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    transition: {
      duration: 0.15,
    },
  },
  active: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    transition: {
      duration: 0.15,
    },
  },
}

// Underline animation for headers
export const underlineVariants: Variants = {
  hidden: {
    scaleX: 0,
    originX: 0,
  },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.2,
    },
  },
}

// Confetti burst animation
export const confettiVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 1,
  },
  visible: {
    scale: 1,
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
}

// Default viewport settings for lazy animations
export const defaultViewport = { once: true, margin: '-50px' }

// Animation presets for common use cases
export const animationPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
}
