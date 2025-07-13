See @AGENTS.md for guidelines.
# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build (with NODE_OPTIONS to suppress warnings)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run sample-data` - Insert sample data into database

## Project Architecture

This is a **Next.js 15 App Router** application implementing a **Mandalart planning methodology** with **Supabase** backend.

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4.0
- **Backend**: Supabase (auth, database, RPC)
- **UI Components**: Radix UI, shadcn/ui, Framer Motion, DaisyUI
- **State Management**: React hooks with custom service layer
- **Styling**: Tailwind CSS with custom design system using OKLCH colors

### Core Architecture Patterns

#### Hierarchical Data Structure
The application centers around **hierarchical Mandalart cells** with a maximum depth of 3 levels:
- Root cell (depth 0) � Sub-goals (depth 1) � Action items (depth 2)
- Each cell can have up to 9 children positioned in a 3x3 grid
- Virtual IDs are used for temporary cells during creation

#### Service Layer Pattern
- `MandalartService` class handles all Supabase operations
- API functions are exposed via `mandalartAPI` object
- Database models are converted to frontend models via transform functions
- RPC functions handle complex database operations

#### Custom Hook Architecture
- `useMandalart` - Main data management hook
- `useMandalartNavigation` - Navigation between cells
- `useCellOperations` - Cell CRUD operations
- Hooks are modular and composed together

### Key Directories

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Organized by domain (auth, dashboard, layout, ui)
- `src/services/` - API service layer for Supabase
- `src/hooks/` - Custom React hooks for state management
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions and Supabase clients
- `docs/` - Comprehensive documentation

### Data Model

**MandalartCell** is the core entity:
```typescript
interface MandalartCell {
  id: string;
  topic: string;
  memo?: string;
  color?: string;
  imageUrl?: string;
  isCompleted: boolean;
  parentId?: string | null;
  depth: number;        // 0-2, determines hierarchy level
  position: number;     // 1-9, position in 3x3 grid
  mandalartId?: string;
  children?: MandalartCell[];
  progressInfo?: { totalCells, completedCells, progressPercentage };
}
```

### Mobile-First Design
- Responsive design with mobile-specific components
- Touch-optimized interactions with long-press context menus
- Safe area handling for iOS devices
- Slide-up panels for mobile UX

### Animation System
- Framer Motion for page transitions and component animations
- Custom Tailwind animation utilities
- Motion-reduced preferences support

### Important Implementation Details

1. **Virtual IDs**: Temporary cells use `virtual-${timestamp}` IDs until persisted
2. **Progress Calculation**: Real-time progress tracking across cell hierarchies
3. **Context Menus**: Long-press interactions for cell operations on touch devices
4. **Navigation**: Breadcrumb-based navigation between cell levels
5. **Color System**: Predefined color palette for cell customization
6. **Supabase RPC**: Complex operations like progress calculation use database functions

### Testing & Development

- TypeScript strict mode enabled
- Path aliases configured (`@/*` � `src/*`)
- Development uses Turbopack for faster builds
- Sample data script available for development setup

### Authentication Flow
- Supabase Auth with email/password
- Middleware handles route protection
- Session management across client/server components