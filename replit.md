# Portnox Scoping & Deployment Tool

## Overview

This is a professional scoping and deployment planning tool for Portnox Network Access Control (NAC), TACACS+, and Zero Trust Network Access (ZTNA) implementations. The application helps consultants and engineers assess customer requirements, generate deployment checklists, and access relevant documentation to streamline the implementation process.

The tool features a questionnaire-based scoping workflow that collects information about customer infrastructure, identity systems, and deployment preferences. Based on responses, it automatically generates customized deployment checklists with prioritized tasks and links to relevant Portnox documentation.

## Recent Changes (October 2025)

**Critical Bug Fixes and Archive Functionality (October 14, 2025):**
- **Fixed Dashboard Navigation Bug:** Corrected redirect path from `/sessions` to `/scoping` when clicking scoping session links on dashboard
- **Fixed DocumentationReviewDialog Crash:** Added proper JSON parsing (`await result.json()`) instead of returning Response object, preventing ".map is not a function" error
- **Implemented Archive Functionality:** Added soft-delete pattern for customers and sessions using `isArchived` boolean field
  - Added `isArchived` field to `customerProfiles` and `scopingSessions` tables (default: false)
  - Storage methods automatically filter out archived items by default (optional `includeArchived` parameter)
  - API endpoints: POST `/api/customers/:id/archive`, POST `/api/customers/:id/unarchive`, POST `/api/sessions/:id/archive`, POST `/api/sessions/:id/unarchive`
  - All endpoints return `{success: true}` and include authentication/authorization verification
- **Enhanced Documentation Recommendations:** Expanded field mappings from questionnaire to documentation tags
  - Added 30+ questionnaire field mappings covering Identity, Endpoints, Network Infrastructure, Deployment, and ZTNA categories
  - Vendor-specific tags: microsoft, cisco, vmware, aws, azure, hyper-v, aruba, fortinet, paloalto, etc.
  - Compliance tags: hipaa, pci, sox, gdpr, fedramp
  - Scoring system: 2 points for category match, 1 point per matching tag
- **Comprehensive E2E Testing:** All bug fixes validated with end-to-end playwright tests confirming navigation, JSON parsing, and archive operations work correctly

**Documentation Management System (October 13, 2025):**
- Implemented complete CRUD operations for documentation (Create, Read, Update, Delete)
- Added Firecrawl API integration for automated web scraping and content import
- Created settings page for API key management (Firecrawl API configuration)
- Built duplicate detection system with endpoint GET /api/documentation/duplicates
- Enhanced documentation page UI with:
  - Create dialog with form validation (URL, title, content, category, tags)
  - Edit dialog with pre-populated data
  - Delete confirmation with AlertDialog
  - Crawl URL dialog for Firecrawl integration
  - View duplicates dialog showing URLs with multiple entries
  - Search functionality across all fields
  - Tag management with comma-separated input
- Created app_settings table for storing API keys and configuration
- Added upsert logic to handle duplicate URL conflicts gracefully
- All mutations properly invalidate React Query cache
- Comprehensive error handling with toast notifications

**Database Schema Extensions (October 13, 2025):**
- Added 8 new tables for advanced features:
  - `checklist_templates` - Reusable checklist templates with phases
  - `checklist_items_template` - Template items with best practices and prerequisites
  - `option_catalogs` - User-defined option sets (vendors, types, categories)
  - `option_values` - Values within option catalogs with metadata
  - `nac_assessments` - NAC vendor migration assessments with recommendations
  - `migration_recommendations` - Actionable migration steps and timelines
  - `project_milestones` - Deployment phase planning with dates and ownership
  - `milestone_tasks` - Tasks within milestones with status tracking
  - `app_settings` - Application configuration (API keys, settings)
- Added composite indexes on (FK, sortOrder) for optimal ordered retrieval
- Implemented full Drizzle relations for all tables enabling FK navigation
- All tables include proper insert/select schemas for validation

**API Endpoints Added:**
- POST /api/documentation - Create new documentation entry
- PUT /api/documentation/:id - Update existing documentation
- DELETE /api/documentation/:id - Delete documentation entry
- POST /api/documentation/crawl - Scrape URL using Firecrawl API
- GET /api/documentation/duplicates - Find duplicate URLs
- GET /api/settings/:key - Retrieve setting value
- PUT /api/settings/:key - Update setting value

**Advanced Features API (October 13, 2025):**
- Checklist Templates: GET/POST/PUT/DELETE /api/templates, GET/POST/PUT/DELETE /api/templates/:templateId/items
- Option Catalogs: GET/POST/PUT/DELETE /api/catalogs, GET/POST/PUT/DELETE /api/catalogs/:catalogId/values
- NAC Assessments: GET/POST/PUT /api/sessions/:sessionId/assessment
- Project Milestones: GET/POST/PUT/DELETE /api/sessions/:sessionId/milestones
- Milestone Tasks: GET/POST/PUT/DELETE /api/milestones/:milestoneId/tasks
- All endpoints include Zod validation with `.partial()` for updates, proper error handling, and consistent status codes

**Customer Profile Enforcement (Completed):**
- Implemented mandatory customer profile creation/selection before scoping sessions
- Created CustomerSelectionDialog component with tabs for "Select Existing" and "Create New" customer
- Modified scoping-sessions page to show dialog instead of direct navigation
- Protected /scoping/new route to prevent bypass of customer selection flow
- Fixed API response handling with proper JSON parsing in mutations

**Questionnaire Enhancements (Completed):**
- Added "Other" option with custom text input to all vendor selection fields for dynamic vendor addition
- Expanded SAML/OpenID applications list to 80+ enterprise apps (Microsoft EAM, Google Workspace, AWS, GitHub, etc.)
- Added four new sections: Guest Access/BYOD, Captive Portal Configuration, BYOD Policy Details, Contractor Access Management
- Configuration-driven architecture using questionnaireConfig.ts with SectionRenderer component

**Bug Fixes (Completed):**
- Fixed 500 error on customer creation by ensuring test user exists in database
- Fixed infinite 400 validation error loop by making userId optional in insertCustomerProfileSchema
- Added loop prevention guard in scoping session creation
- Fixed Select component value type issues (null to undefined conversion)

**Remaining Tasks:**
- PDF/Word export functionality for deployment checklists
- Periodic documentation refresh scheduling

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