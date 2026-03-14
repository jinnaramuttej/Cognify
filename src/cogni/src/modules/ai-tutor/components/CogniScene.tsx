"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { COGNI_THEME, type CogniState } from "../types";

interface CogniSceneProps {
  state?: CogniState;
  className?: string;
}

export function CogniScene({ state, className }: CogniSceneProps) {
  const [isLoading, setIsLoading] = useState(true);

  const {
    isIdle = true,
    isListening = false,
    isExplaining = false,
    isEncouraging = false,
  } = state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Determine active state
  const isActive = isListening || isExplaining || isEncouraging;
  const stateColor = isExplaining
    ? COGNI_THEME.primary
    : isEncouraging
      ? COGNI_THEME.success
      : isListening
        ? COGNI_THEME.primary
        : COGNI_THEME.border;

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Outer glow ring when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 0 0 ${stateColor}00`,
              `0 0 40px 8px ${stateColor}20`,
              `0 0 0 0 ${stateColor}00`,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white rounded-2xl"
          >
            {/* Loading animation */}
            <motion.div
              className="relative w-20 h-20 mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500"
              />
            </motion.div>

            <div className="space-y-3 w-3/4 max-w-xs">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-sm text-gray-400"
            >
              Initializing Cogni...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "relative w-full h-full rounded-2xl overflow-hidden",
          "border transition-all duration-300",
          isActive ? "shadow-xl" : "shadow-lg"
        )}
        style={{
          borderColor: isActive ? stateColor : "rgba(229, 231, 235, 0.5)",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%)",
        }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-40"
          animate={{
            background: [
              "radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 70% 30%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 70% 70%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 30% 70%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* State indicator badge */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-3 left-3 z-10"
          >
            <motion.div
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold",
                "flex items-center gap-2 backdrop-blur-sm"
              )}
              style={{
                backgroundColor: `${stateColor}15`,
                color: stateColor,
                border: `1px solid ${stateColor}30`,
              }}
              animate={{
                boxShadow: [
                  `0 0 0 0 ${stateColor}00`,
                  `0 0 12px 2px ${stateColor}30`,
                  `0 0 0 0 ${stateColor}00`,
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stateColor }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {isExplaining
                ? "Explaining"
                : isEncouraging
                  ? "Encouraging"
                  : isListening
                    ? "Listening"
                    : "Active"}
            </motion.div>
          </motion.div>
        )}

        {/* Idle state pulse indicator */}
        {isIdle && !isActive && (
          <motion.div
            className="absolute top-3 right-3 z-10"
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COGNI_THEME.success }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: COGNI_THEME.success }}
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        {/* Spline 3D iframe - Cropped to show torso only (hide watermark) */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(0 0 15% 0)" }}>
          <iframe
            src="https://my.spline.design/nexbotrobotcharacterconcept-l4QXavLeCVfK9Z5fQaTToS9H/"
            frameBorder="0"
            className="w-full absolute"
            style={{
              height: "120%",
              top: "-5%",
            }}
            title="Cogni - AI Academic Intelligence System"
            allow="autoplay; fullscreen"
          />
        </div>

        {/* Gradient fade at bottom for smooth transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 40%, transparent 100%)",
          }}
        />

        {/* Speaking/Explaining animation bars */}
        {isExplaining && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-end gap-1 h-6 px-3 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ backgroundColor: COGNI_THEME.primary }}
                  animate={{
                    height: [6, 18, 6],
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom glow bar when thinking */}
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 z-10"
            style={{
              background: `linear-gradient(90deg, transparent, ${stateColor}60, transparent)`,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
