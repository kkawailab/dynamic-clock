# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture Overview

This is a Next.js 15 application featuring a dynamic clock with multiple functionalities built with TypeScript and React.

### Core Component Structure

- **`dynamic-clock.tsx`**: The main component containing all clock functionality including:
  - Real-time clock display with automatic updates every second
  - Dynamic theme system that changes based on time of day (morning/afternoon/evening/night)
  - World clock feature showing times in multiple time zones
  - Alarm management system with add/toggle/delete capabilities
  - Japanese language interface throughout

- **Component Communication**: The application uses React hooks (useState, useEffect) for state management. No external state management library is used.

### UI Component System

The project uses **shadcn/ui** components (located in `components/ui/`), which are:
- Built on top of Radix UI primitives
- Styled with Tailwind CSS
- Fully customizable and copy-pasted into the codebase

### Styling Architecture

- **Tailwind CSS** with custom configuration for:
  - CSS variable-based theming
  - Dark mode support (class-based)
  - Custom animations
- **Glassmorphism design** using backdrop filters and semi-transparent backgrounds
- **Dynamic gradients** that change based on time of day

### Key Technical Decisions

1. **Time Handling**: Uses native JavaScript Date API with Intl.DateTimeFormat for localization
2. **Build Configuration**: ESLint and TypeScript errors are ignored during builds (see `next.config.mjs`)
3. **Package Manager**: Uses pnpm (not npm or yarn)
4. **No External Time Libraries**: The app doesn't use libraries like moment.js or date-fns for time manipulation despite date-fns being installed