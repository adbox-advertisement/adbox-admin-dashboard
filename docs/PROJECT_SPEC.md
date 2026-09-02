# AdBox — Online Ads Management Dashboard: Build Spec

A modern, enterprise-grade **Online Ads Management Dashboard** built with **React 19**,
**Vite**, and **TypeScript**. Scalable, performant, maintainable, and modeled on platforms like
Google Ads, Meta Ads Manager, LinkedIn Campaign Manager, and TikTok Ads.

The architecture prioritizes modularity, accessibility, developer experience, and performance.

---

## Tech Stack

| Category           | Technology                                 |
| ------------------ | ------------------------------------------ |
| Framework          | React 19 + Vite                            |
| Language           | TypeScript                                 |
| Routing            | React Router v7                            |
| Styling            | Tailwind CSS v4                            |
| UI Components      | shadcn/ui + Radix UI                       |
| Icons              | Lucide React                               |
| Charts             | Recharts + Visx                            |
| Tables             | TanStack Table                             |
| Forms              | React Hook Form                            |
| Validation         | Zod                                        |
| API Client         | Axios                                      |
| Server State       | TanStack Query                             |
| Global State       | Zustand                                    |
| Authentication     | JWT + Refresh Token                        |
| Date Utilities     | date-fns                                   |
| Drag & Drop        | dnd-kit                                    |
| Virtualization     | TanStack Virtual                           |
| Notifications      | Sonner                                     |
| Command Palette    | shadcn/ui Command (cmdk)                    |
| Keyboard Shortcuts | react-hotkeys-hook                         |
| Theme              | next-themes                                |

---

## Core Principles

- Feature-first architecture
- Strong TypeScript typing
- Separation of server state and client state
- Lazy loading and code splitting
- Reusable UI components
- Accessibility (WCAG)
- Responsive layouts
- Dark and light themes
- High performance
- Scalability for enterprise applications
- Clean, maintainable code
- Minimal unnecessary re-renders
- Excellent developer experience

---

## Folder Structure

```text
src/
├── app/            # App shell, providers, router
├── api/            # Axios client + resource services
├── assets/
├── components/
│   ├── ui/         # shadcn/ui primitives
│   ├── layout/     # Sidebar, topbar, shell
│   ├── dashboard/  # KPI cards, activity, etc.
│   ├── charts/     # Recharts + Visx wrappers
│   └── tables/     # Reusable DataTable
├── features/       # Feature-first modules
│   ├── auth/
│   ├── dashboard/
│   ├── campaigns/
│   ├── adsets/
│   ├── ads/
│   ├── audiences/
│   ├── billing/
│   └── analytics/
├── hooks/
├── lib/
├── services/
├── store/          # Zustand UI/client state
├── types/
├── utils/
├── constants/
├── layouts/
├── routes/
├── styles/
└── main.tsx
```

### Feature Module Structure

Every feature follows a consistent structure:

```text
features/campaigns/
├── api.ts
├── hooks.ts          # TanStack Query hooks
├── types.ts
├── validation.ts     # Zod schemas
├── CampaignPage.tsx
├── CampaignTable.tsx
├── CampaignFilters.tsx
├── CampaignToolbar.tsx
├── CampaignDetails.tsx
├── CampaignDialog.tsx
└── index.ts          # Barrel export
```

---

## State Management

### TanStack Query (server state only)
Fetching, caching, background refetch, optimistic updates, pagination, infinite scroll,
cache invalidation, mutations, retry logic, prefetching. **Do not duplicate server state in Zustand.**

### Zustand (UI/client state only)
Sidebar state, theme, selected workspace/organization, current filters, modal visibility,
global search, notifications, user preferences, command palette state. **No API responses in Zustand.**

---

## API Layer

```text
Axios Client → Service Layer → TanStack Query Hooks → React Components
```

Axios includes: request/response interceptors, automatic token refresh, error handling,
request cancellation, timeout configuration.

---

## Routing

React Router v7 with nested routes, lazy-loaded pages, protected routes, error boundaries,
layout routes, and route-based code splitting.

---

## Tables (TanStack Table)

Sorting, filtering, global search, column visibility, column pinning, row selection,
pagination, server-side pagination, virtualized rows, sticky headers, bulk actions, export.

---

## Charts (Recharts + Visx)

Revenue, spend, ROAS, CTR, CPC, CPM, CPA, clicks, conversions, impressions, budget usage,
daily trends, geographic performance.

---

## Dashboard Layout

Responsive sidebar, top navigation, workspace switcher, global search, notification center,
user profile, KPI cards, analytics charts, recent activity, campaign overview,
performance tables, quick actions, filters, date picker.

---

## Performance

Route-level code splitting, `React.lazy()` + `Suspense`, virtual scrolling, memoization,
tree shaking, dynamic imports, image lazy loading, debounced searches, request deduplication,
cached responses, stable keys, optimistic UI updates.

---

## UI/UX

Dark/light mode, responsive layouts, keyboard navigation, command palette, loading skeletons,
empty states, error boundaries, toast notifications, confirmation dialogs, accessible components,
smooth animations, consistent spacing, professional typography, reusable design system.

---

## Code Standards

Strict TypeScript, functional components only, custom hooks for reusable logic,
feature-based organization, barrel exports where appropriate, no duplicated business logic,
reusable utilities, consistent naming, clear separation of concerns.

---

## Expected Outcome

A complete, production-ready frontend architecture that is a scalable foundation for an online
advertising management platform — enterprise engineering practices, clean organization,
strong performance, polished UX, and easy to extend with new advertising features, analytics,
integrations, and business modules.
