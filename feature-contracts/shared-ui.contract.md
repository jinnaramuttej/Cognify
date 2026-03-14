# SHARED UI Contract

## PURPOSE
Defines UI components and styling systems intentionally shared across all feature modules. These are the approved component libraries and design standards that prevent duplication and maintain consistency.

## SHARED UI COMPONENTS

### shadcn/ui Library
- **Location:** `@/components/ui`
- **Count:** 54+ pre-built components
- **Access:** All modules
- **Examples:** Button, Card, Dialog, Input, Select, etc.
- **Sizing:** sm, md, lg
- **Variants:** default, outline, ghost, destructive, etc.

### Cognify-Specific Components
- **Location:** `@/components/cognify`
- **Purpose:** Brand-specific reusable components
- **Examples:**
  - `Navbar` — Top navigation bar (singleton)
  - `Footer` — Page footer (singleton)
  - `BottomNav` — Mobile navigation (singleton)
  - `Sidebar` — Side navigation (singleton)
  - `Loader` — Loading spinner

### Icons
- **Library:** `lucide-react`
- **Count:** 1000+ icons available
- **Access:** All modules
- **Usage:** `import { IconName } from 'lucide-react'`

## SHARED LAYOUT SYSTEM

### Global Layout
- **Location:** `src/app/layout.tsx`
- **Purpose:** Root layout (NEVER duplicate)
- **Provides:** ThemeProvider, Navbar, Footer, global styles
- **Access:** Inherited by all routes

### Theme Provider
- **Location:** `@/components/providers/ThemeProvider`
- **Purpose:** Dark/light mode (NEVER duplicate)
- **Access:** Wrapped in global layout

### CSS Variables & Tailwind
- **Location:** `src/app/globals.css`
- **Purpose:** Theme tokens and global styles
- **Color Variables:**
  - `--background` / `--foreground`
  - `--primary` / `--primary-foreground`
  - `--secondary` / `--secondary-foreground`
  - `--destructive` / `--destructive-foreground`
  - `--blue-500`, `--blue-600`, etc.

## CLASS NAME UTILITIES

### Merging Classes
- **Function:** `cn()` from `@/lib/utils`
- **Purpose:** Merge Tailwind classes safely
- **Usage:** `cn("p-4", "dark:bg-gray-900", condition && "rounded")`

### Common Patterns
- Responsive: `md:`, `lg:`, `sm:` prefixes
- Dark mode: `dark:` prefix
- Hover/focus: `hover:`, `focus:`, `group-hover:` prefixes
- States: `disabled:`, `aria-*` attributes

## STYLING RULES

### Do ✅
- Use Tailwind utility classes
- Use theme tokens: `bg-background`, `text-foreground`, `text-primary`
- Use `cn()` for conditional classes
- Support dark mode with `dark:` prefix
- Use responsive prefixes: `md:`, `lg:`

### Don't ❌
- Hardcode colors: `#FF0000`, `rgb(255, 0, 0)`
- Create new CSS files (use Tailwind only)
- Duplicate singleton components
- Override global styles (use CSS variables instead)
- Use inline styles (except for dynamic values)

## COMPONENT NAMING

### Structure
- Feature-specific components: `src/app/[feature]/components/ComponentName.tsx`
- Reusable components: `src/components/[feature]/ComponentName.tsx`
- Generic UI: `src/components/ui/component-name.tsx` (shadcn pattern)

### Examples
- ✅ `src/app/tests/components/QuestionViewer.tsx` (feature-specific, PascalCase)
- ✅ `src/components/tests/TestCard.tsx` (shared, PascalCase)
- ✅ `src/components/ui/button.tsx` (shadcn utility, kebab-case)

## VALIDATION RULES

- ✅ All modules use shared UI library
- ✅ Styling via Tailwind only (no CSS-in-JS)
- ✅ Dark mode support required
- ✅ Responsive design required
- ✅ Accessibility attributes included
- ❌ No hardcoded colors
- ❌ No duplicate singleton components (Navbar, Footer, etc.)
- ❌ No custom CSS without theme variables

## UPDATING SHARED UI

1. Modify component in `src/components/ui` or `src/components/cognify`
2. All modules automatically inherit updates
3. No module-specific CSS files needed
4. Theme changes in `globals.css` affect all modules
