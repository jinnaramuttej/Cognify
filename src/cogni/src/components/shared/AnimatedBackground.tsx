"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// SUBTLE GRADIENT BACKGROUND
// ============================================
interface SubtleBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function SubtleBackground({ className, children }: SubtleBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Base gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, #F8FAFF 0%, #EEF2FF 50%, #F8FAFF 100%)",
        }}
      />

      {/* Animated mesh gradient - very subtle */}
      <motion.div
        className="fixed inset-0 pointer-events-none opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Second layer - even more subtle */}
      <motion.div
        className="fixed inset-0 pointer-events-none opacity-20"
        animate={{
          background: [
            "radial-gradient(ellipse at 30% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 60%)",
            "radial-gradient(ellipse at 70% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 60%)",
            "radial-gradient(ellipse at 30% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 60%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// GRID PATTERN OVERLAY
// ============================================
export function GridPattern({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none opacity-[0.015]",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(rgba(37, 99, 235, 0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37, 99, 235, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

// ============================================
// NOISE TEXTURE OVERLAY
// ============================================
export function NoiseTexture({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ============================================
// FLOATING ORBS
// ============================================
export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Large orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%)",
          top: "10%",
          left: "-10%",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Medium orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.04) 0%, transparent 70%)",
          bottom: "20%",
          right: "-5%",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small orb */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)",
          top: "50%",
          right: "30%",
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ============================================
// COMPLETE BACKGROUND SYSTEM
// ============================================
interface BackgroundSystemProps {
  children?: React.ReactNode;
  className?: string;
  showGrid?: boolean;
  showNoise?: boolean;
  showOrbs?: boolean;
}

export function BackgroundSystem({
  children,
  className,
  showGrid = false,
  showNoise = true,
  showOrbs = true,
}: BackgroundSystemProps) {
  return (
    <SubtleBackground className={className}>
      {showGrid && <GridPattern />}
      {showNoise && <NoiseTexture />}
      {showOrbs && <FloatingOrbs />}
      {children}
    </SubtleBackground>
  );
}
