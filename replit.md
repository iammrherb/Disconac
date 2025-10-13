# Portnox Scoping & Deployment Tool

## Overview

This is a professional scoping and deployment planning tool for Portnox Network Access Control (NAC), TACACS+, and Zero Trust Network Access (ZTNA) implementations. The application helps consultants and engineers assess customer requirements, generate deployment checklists, and access relevant documentation to streamline the implementation process.

The tool features a questionnaire-based scoping workflow that collects information about customer infrastructure, identity systems, and deployment preferences. Based on responses, it automatically generates customized deployment checklists with prioritized tasks and links to relevant Portnox documentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Tailwind CSS with custom design system based on shadcn/ui components

**Design System:**
- Material Design-inspired approach customized for enterprise utility applications
- Custom color palette with Portnox brand colors (primary: hsl(200 100% 45%))
- Inter font family for UI, JetBrains Mono for code/technical content
- Dark mode support with dedicated color schemes
- Responsive layout system with mobile-first breakpoints

**Component Architecture:**
- Radix UI primitives for accessible, unstyled component foundation
- Custom styled components using class-variance-authority for variant management
- Reusable UI components in `/client/src/components/ui/` directory
- Feature-based page components in `/client/src/pages/` directory

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for RESTful API server
- TypeScript for type safety across the stack
- Drizzle ORM for database operations with type-safe queries
- Neon serverless PostgreSQL for cloud database hosting

**API Design:**
- RESTful endpoints organized by resource type (customers, sessions, documentation)
- Authentication middleware protecting all routes except login/public endpoints
- Centralized error handling with custom error messages
- Request/response logging for debugging and monitoring

**Business Logic:**
- Service layer (`server/services.ts`) handles recommendation generation
- Questionnaire responses trigger automatic checklist generation
- Documentation matching algorithm finds relevant docs based on tags and content
- Storage abstraction layer (`server/storage.ts`) provides interface for data operations

### Authentication & Authorization

**Replit Auth Integration:**
- OpenID Connect (OIDC) authentication flow
- Passport.js strategy for Replit identity provider
- Session-based authentication using express-session
- PostgreSQL session store for persistent sessions
- User profile syncing from Replit to local database

**Session Management:**
- 7-day session timeout with automatic renewal
- Secure, HTTP-only cookies with HTTPS enforcement
- Session data stored in `sessions` table with automatic cleanup

### Data Storage

**PostgreSQL Database Schema:**

**Authentication Tables:**
- `sessions` - Express session storage (required for Replit Auth)
- `users` - User profiles synced from Replit (email, name, profile image)

**Application Tables:**
- `customer_profiles` - Customer company information (industry, size, contact details)
- `scoping_sessions` - Individual scoping projects linked to customers and users
- `questionnaire_responses` - Answers to scoping questions with JSON response data
- `documentation_links` - Portnox documentation articles with tags and categories
- `deployment_checklists` - Generated tasks with priorities and related documentation

**Relationships:**
- One user has many customers and scoping sessions
- One customer has many scoping sessions
- One scoping session has many questionnaire responses and checklist items
- Many-to-many relationship between checklist items and documentation via JSON arrays

**Data Model Design Decisions:**
- UUID primary keys for distributed system compatibility
- JSONB columns for flexible questionnaire response storage
- Timestamp tracking for created/updated dates on all entities
- Soft delete pattern could be implemented via status fields
- Indexed foreign keys for efficient relationship queries

### External Dependencies

**Replit Platform Services:**
- Replit Auth (OIDC provider) for user authentication at `replit.com/oidc`
- Replit deployment environment variables (REPL_ID, REPLIT_DOMAINS)
- Replit-specific Vite plugins for development tooling (cartographer, dev-banner, runtime-error-modal)

**Neon Database:**
- Serverless PostgreSQL hosting via `@neondatabase/serverless`
- WebSocket connection support for serverless environments
- Connection pooling for efficient resource usage

**Third-Party UI Libraries:**
- Radix UI component primitives (@radix-ui/* packages)
- shadcn/ui design system configuration
- Lucide React for consistent iconography
- cmdk for command palette functionality

**Development Tools:**
- Drizzle Kit for database migrations and schema management
- ESBuild for server-side bundling in production
- TypeScript compiler for type checking
- PostCSS with Tailwind for CSS processing

**Fonts & Assets:**
- Google Fonts API (Inter, JetBrains Mono)
- Portnox branding assets in `/attached_assets/` directory
- Portnox documentation dataset (JSON format) for import functionality