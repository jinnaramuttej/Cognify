/**
 * Role-Based Access Control Utilities
 * 
 * Centralized role checking and route protection logic
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export interface RoleConfig {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Route access configuration
 */
export const ROUTE_ACCESS: Record<string, RoleConfig> = {
  // Student-only routes
  '/dashboard': { allowedRoles: ['student', 'admin'] },
  '/tests': { allowedRoles: ['student', 'teacher', 'admin'] },
  '/library': { allowedRoles: ['student', 'teacher', 'admin'] },
  '/cogni': { allowedRoles: ['student', 'admin'] },
  '/notes-converter': { allowedRoles: ['student', 'admin'] },
  '/arena': { allowedRoles: ['student', 'admin'] },
  '/leaderboard': { allowedRoles: ['student', 'admin'] },
  '/progress-analytics': { allowedRoles: ['student', 'admin'] },
  '/recommendations': { allowedRoles: ['student', 'admin'] },
  
  // Teacher-only routes
  '/teacher': { allowedRoles: ['teacher', 'admin'] },
  
  // Admin-only routes (future)
  '/admin': { allowedRoles: ['admin'] },
};

/**
 * Check if user has access to a route
 */
export function hasRouteAccess(pathname: string, userRole?: UserRole): boolean {
  if (!userRole) return false;
  
  // Find matching route config (exact match or prefix)
  const routeConfig = Object.entries(ROUTE_ACCESS).find(([route]) => 
    pathname === route || pathname.startsWith(route + '/')
  )?.[1];
  
  if (!routeConfig) return true; // No restriction = allowed
  
  return routeConfig.allowedRoles.includes(userRole);
}

/**
 * Get redirect URL for unauthorized access
 */
export function getRedirectForRole(userRole?: UserRole): string {
  if (!userRole) return '/auth/login';
  
  switch (userRole) {
    case 'teacher':
      return '/teacher';
    case 'admin':
      return '/admin';
    case 'student':
    default:
      return '/dashboard';
  }
}

/**
 * Get navigation items for a specific role
 */
export function getNavItemsForRole(role: UserRole) {
  const studentItems = [
    { href: '/dashboard', label: 'Dashboard', show: true },
    { href: '/tests', label: 'Tests', show: true },
    { href: '/library', label: 'Library', show: true },
    { href: '/cogni', label: 'Cogni AI', show: true },
    { href: '/notes-converter', label: 'Notes Converter', show: true },
    { href: '/arena', label: 'Arena', show: true },
    { href: '/leaderboard', label: 'Leaderboard', show: true },
  ];

  const teacherItems = [
    { href: '/teacher', label: 'Teacher Panel', show: true },
    { href: '/tests', label: 'Tests', show: true },
    { href: '/library', label: 'Library', show: true },
  ];

  const adminItems = [
    ...studentItems,
    { href: '/teacher', label: 'Teacher Panel', show: true },
    { href: '/admin', label: 'Admin', show: true },
  ];

  switch (role) {
    case 'admin':
      return adminItems;
    case 'teacher':
      return teacherItems;
    case 'student':
    default:
      return studentItems;
  }
}

/**
 * Check if user is teacher or admin
 */
export function isTeacherOrAdmin(role?: UserRole): boolean {
  return role === 'teacher' || role === 'admin';
}

/**
 * Check if user is admin
 */
export function isAdmin(role?: UserRole): boolean {
  return role === 'admin';
}

/**
 * Check if user is student
 */
export function isStudent(role?: UserRole): boolean {
  return role === 'student';
}
