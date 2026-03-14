# Cognify UI Patterns

> **⚠️ AI RULE**: All UI must follow these patterns. Use theme tokens. Never hardcode colors.

---

## Global Rules

| Rule | Implementation |
|------|---------------|
| Framework | TailwindCSS v4 with `@theme` directive |
| Colors | Theme tokens only (`bg-background`, `text-foreground`, `text-primary`) |
| Dark mode | Automatic via `.dark` class and CSS custom properties |
| Fonts | Geist Sans (primary), Geist Mono (code) |
| Icons | Lucide React only |
| Animations | Framer Motion via `PageAnimate` wrapper |
| Merging classes | `cn()` from `@/lib/utils` |
| Components | shadcn/ui primitives from `@/components/ui/` |

---

## 1 — Dashboard Layout

```
┌──────────────────────────────────────────┐
│ Navbar (NavbarWrapper)                   │
├──────────────────────────────────────────┤
│ ┌──────────┐ ┌─────────────────────────┐ │
│ │ Sidebar  │ │ Main Content Area       │ │
│ │          │ │                         │ │
│ │ - Home   │ │ ┌───────┐ ┌───────┐    │ │
│ │ - Tests  │ │ │ Stat  │ │ Stat  │    │ │
│ │ - Lib    │ │ │ Card  │ │ Card  │    │ │
│ │ - Cogni  │ │ └───────┘ └───────┘    │ │
│ │          │ │                         │ │
│ │          │ │ ┌─────────────────────┐ │ │
│ │          │ │ │ Recent Activity     │ │ │
│ │          │ │ └─────────────────────┘ │ │
│ └──────────┘ └─────────────────────────┘ │
├──────────────────────────────────────────┤
│ BottomNav (mobile only)                  │
└──────────────────────────────────────────┘
```

**Styling patterns:**
- Stat cards: `bg-background border rounded-xl p-6 hover-lift`
- Glassmorphism: `bg-background/95 backdrop-blur-sm`
- Gradients: `bg-gradient-to-r from-primary/10 to-primary/5`
- Spacing: `p-6` containers, `gap-4` grids

---

## 2 — Test Interface Layout

```
┌──────────────────────────────────────────┐
│ Test Header (timer, progress, submit)    │
├──────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌──────────────┐│
│ │ Question Display     │ │ Question Nav ││
│ │                      │ │ ┌──┐┌──┐┌──┐││
│ │ Q1. What is...       │ │ │1 ││2 ││3 │││
│ │                      │ │ └──┘└──┘└──┘││
│ │ ○ A) Option 1        │ │             ││
│ │ ○ B) Option 2        │ │ Legend:     ││
│ │ ○ C) Option 3        │ │ ■ Answered  ││
│ │ ○ D) Option 4        │ │ □ Unanswered││
│ │                      │ │ ⚑ Marked    ││
│ │ [Prev] [Mark] [Next] │ │             ││
│ └─────────────────────┘ └──────────────┘│
└──────────────────────────────────────────┘
```

> ⚠️ Tests layout suppresses global Navbar via `tests/layout.tsx`

**Styling patterns:**
- Timer: `text-destructive` when < 5 minutes
- Selected option: `border-primary bg-primary/10`
- Marked for review: `border-yellow-500 bg-yellow-500/10`
- Question nav buttons: `w-8 h-8 rounded-md text-sm`

---

## 3 — Analytics Layout

```
┌──────────────────────────────────────────┐
│ Analytics Header (date range, filters)   │
├──────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌──────────┐│
│ │ Accuracy  │ │ Tests     │ │ Streak   ││
│ │ 73%       │ │ 24        │ │ 7 days   ││
│ └───────────┘ └───────────┘ └──────────┘│
│ ┌──────────────────────────────────────┐ │
│ │ Performance Chart (weekly trend)     │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────┐ ┌────────────────┐  │
│ │ Subject Breakdown│ │ Weak Topics    │  │
│ └──────────────────┘ └────────────────┘  │
└──────────────────────────────────────────┘
```

**Styling patterns:**
- Metric cards: `bg-background rounded-xl p-4 border`
- Charts: Use shadcn/ui chart components
- Improvement indicator: `text-green-500` (up), `text-destructive` (down)

---

## 4 — Settings Layout

```
┌──────────────────────────────────────────┐
│ Settings Header                          │
├──────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────────────┐│
│ │ Section Nav  │ │ Settings Panel       ││
│ │              │ │                      ││
│ │ • Profile    │ │ [Active Section      ││
│ │ • Account    │ │  Form/Controls]      ││
│ │ • Theme      │ │                      ││
│ │ • Notifs     │ │                      ││
│ └──────────────┘ └──────────────────────┘│
└──────────────────────────────────────────┘
```

**Styling patterns:**
- Section nav: `border-r` sidebar with `text-muted-foreground` items
- Active item: `text-foreground font-medium bg-muted/50`
- Form inputs: shadcn/ui `Input`, `Select`, `Switch` components

---

## 5 — Library Layout

```
┌──────────────────────────────────────────┐
│ Library Header (exam selector)           │
├──────────────────────────────────────────┤
│ Breadcrumb: Exam > Subject > Unit > Ch   │
│ ┌──────────────────────────────────────┐ │
│ │ Grid/List of items                   │ │
│ │ ┌───────────┐ ┌───────────┐         │ │
│ │ │ Card      │ │ Card      │         │ │
│ │ │ Physics   │ │ Chemistry │         │ │
│ │ │ 12 units  │ │ 10 units  │         │ │
│ │ └───────────┘ └───────────┘         │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Styling patterns:**
- Breadcrumb: `text-sm text-muted-foreground` with `>` separators
- Cards: `bg-background border rounded-lg p-4 hover-lift cursor-pointer`
- Progress: shadcn/ui `Progress` component with `bg-primary`

---

## Animation Rules

| Animation | Class / Method | When to Use |
|-----------|---------------|-------------|
| Page transitions | `<PageAnimate>` wrapper | All page-level components |
| Fade in up | `animate-fadeInUp` | Cards, list items on load |
| Hover lift | `hover-lift` | Interactive cards |
| Hover shadow | `hover-shadow` | Buttons, cards |
| Smooth hover | `smooth-hover` | All interactive elements |
| Float | `animate-float` | Decorative elements only |

---

## Spacing System

| Element | Spacing |
|---------|---------|
| Page padding | `p-4 md:p-6 lg:p-8` |
| Card padding | `p-4 md:p-6` |
| Grid gap | `gap-4 md:gap-6` |
| Section spacing | `space-y-6 md:space-y-8` |
| Between related items | `space-y-2` |

---

*Last updated: 2026-03-08*
