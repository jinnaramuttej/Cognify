// Cognify Motion System - Academic Intelligence Meets AI Futurism
// Framer Motion configuration and variants

import { Variants, Transition } from 'framer-motion'

// ============================================
// TIMING CONSTANTS
// ============================================

export const TIMING = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  page: 0.6,
} as const

// ============================================
// EASING CURVES
// ============================================

export const EASE = {
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  snappy: [0.6, 0.01, 0.05, 0.9],
  gentle: [0.4, 0, 0.2, 1],
  enter: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
} as const

// ============================================
// TRANSITION PRESETS
// ============================================

export const transitions = {
  fast: {
    duration: TIMING.fast,
    ease: EASE.smooth,
  } as Transition,
  
  normal: {
    duration: TIMING.normal,
    ease: EASE.smooth,
  } as Transition,
  
  slow: {
    duration: TIMING.slow,
    ease: EASE.gentle,
  } as Transition,
  
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,
  
  springSoft: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  } as Transition,
  
  bounce: {
    type: 'spring',
    stiffness: 500,
    damping: 20,
  } as Transition,
}

// ============================================
// ANIMATION VARIANTS
// ============================================

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.normal,
  },
}

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      ...transitions.normal,
      ease: EASE.enter,
    },
  },
}

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
}

export const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
}

export const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
}

// Scale animations
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
}

export const scaleInCenter: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      ...transitions.spring,
      ease: EASE.bounce,
    },
  },
}

// Card animations
export const cardHover: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: transitions.normal,
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
}

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: EASE.enter,
    },
  },
}

// Page transition
export const pageTransition: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE.enter,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: EASE.exit,
    },
  },
}

// Modal animations
export const modalOverlay: Variants = {
  hidden: { 
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: { 
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: 0.15 },
  },
}

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}

// Button animations
export const buttonHover: Variants = {
  hover: {
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

// Tab underline animation
export const tabUnderline: Variants = {
  hidden: { 
    scaleX: 0,
  },
  visible: { 
    scaleX: 1,
    transition: {
      duration: 0.3,
      ease: EASE.smooth,
    },
  },
}

// Counter animation (for score counting)
export const counterAnimation = {
  transition: {
    duration: 1.5,
    ease: EASE.smooth,
  },
}

// Progress bar animation
export const progressBar: Variants = {
  hidden: { 
    scaleX: 0,
    originX: 0,
  },
  visible: { 
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: EASE.smooth,
    },
  },
}

// Chart bar animation
export const chartBar: Variants = {
  hidden: { 
    scaleY: 0,
    originY: 1,
  },
  visible: (i: number) => ({
    scaleY: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: EASE.enter,
    },
  }),
}

// Floating animation
export const floating: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Pulse animation
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Shimmer effect for loading
export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Typing dots animation
export const typingDot: Variants = {
  animate: (i: number) => ({
    opacity: [0.4, 1, 0.4],
    y: [0, -4, 0],
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
}

// Ring progress animation
export const ringProgress: Variants = {
  hidden: { 
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 1,
        ease: EASE.smooth,
      },
      opacity: {
        duration: 0.3,
      },
    },
  },
}

// Confetti particle - generates random confetti animation
export function getConfettiParticle(delay: number): Variants {
  return {
    hidden: { 
      opacity: 0, 
      scale: 0,
      y: 0,
    },
    visible: {
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0.5],
      y: [0, -100, -50, 200],
      x: [0, 50, 75],
      rotate: [0, 180],
      transition: {
        delay,
        duration: 2,
        ease: 'easeOut',
      },
    },
  }
}

// Entrance timing for different contexts
export const getEntranceDelay = (index: number, itemsPerPage: number = 10) => {
  return Math.min(index * 0.05, 0.5)
}

// Re-export commonly used
export const animations = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInCenter,
  cardHover,
  staggerContainer,
  staggerContainerFast,
  staggerItem,
  pageTransition,
  modalOverlay,
  modalContent,
  buttonHover,
  tabUnderline,
  progressBar,
  chartBar,
  floating,
  pulse,
  shimmer,
  typingDot,
  ringProgress,
}
