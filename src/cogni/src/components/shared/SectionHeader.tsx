"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================
// SECTION HEADER
// ============================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  action,
  className,
  centered = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "mb-6",
        centered && "text-center",
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-3"
        >
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-medium border-blue-200 text-blue-700 bg-blue-50"
          >
            {badge}
          </Badge>
        </motion.div>
      )}

      {/* Title Row */}
      <div className={cn("flex items-center gap-4", centered && "justify-center")}>
        <div>
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            {title}
          </motion.h1>

          {/* Animated underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="h-1 w-16 mt-2 rounded-full origin-left"
            style={{
              background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)",
            }}
          />
        </div>

        {/* Action */}
        {action && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="ml-auto"
          >
            {action}
          </motion.div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-3 text-sm text-gray-500 max-w-2xl"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

// ============================================
// PAGE HEADER (Hero Style)
// ============================================
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
  stats?: Array<{
    label: string;
    value: string | number;
    change?: string;
    positive?: boolean;
  }>;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
  stats,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, rgba(37, 99, 235, 0.03) 0%, transparent 100%)",
        }}
      />

      <div className="py-8 px-6">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 px-4 py-1.5 text-sm font-medium shadow-md shadow-blue-500/20">
              {badge}
            </Badge>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-3xl font-bold text-gray-900 tracking-tight"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="mt-3 text-base text-gray-500 max-w-2xl"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Actions */}
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex gap-3"
          >
            {actions}
          </motion.div>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="bg-white rounded-xl p-4 border shadow-sm"
                style={{ borderColor: "#E5E7EB" }}
              >
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  {stat.change && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        stat.positive ? "text-green-600" : "text-red-500"
                      )}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// CARD HEADER
// ============================================
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between", className)}>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}
