# Portnox Scoping & Deployment Tool

## Overview

This tool is a professional scoping and deployment planning application designed for Portnox Network Access Control (NAC), TACACS+, and Zero Trust Network Access (ZTNA) implementations. It assists consultants and engineers in assessing customer requirements, generating tailored deployment checklists, and providing access to relevant Portnox documentation. The application aims to streamline the implementation process through a questionnaire-based workflow, automated checklist generation, AI-powered recommendations, and professional document export capabilities.

The project's ambition is to become the definitive platform for Portnox solution deployments, significantly reducing planning time and improving implementation accuracy, thereby increasing customer satisfaction and expanding market potential for Portnox services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite
- Wouter for routing
- TanStack Query for server state management
- Tailwind CSS with shadcn/ui components

**Design System:**
- Material Design-inspired, customized for enterprise applications.
- Custom color palette using Portnox brand colors.
- Inter font family for UI, JetBrains Mono for technical content.
- Dark mode support and responsive layout.

**Component Architecture:**
- Radix UI primitives for accessibility.
- Custom styled components using `class-variance-authority`.
- Reusable UI components and feature-based page components.

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js
- TypeScript
- Drizzle ORM
- Neon serverless PostgreSQL

**API Design:**
- RESTful endpoints, authenticated, with centralized error handling and logging.

**Business Logic:**
- Service layer (`server/services.ts`) for recommendation generation.
- Automatic checklist generation from questionnaire responses.
- Documentation matching algorithm based on tags and content.
- Storage abstraction layer (`server/storage.ts`).

### Authentication & Authorization

**Replit Auth Integration:**
- OpenID Connect (OIDC) via Replit.
- Passport.js strategy, session-based authentication using `express-session` with PostgreSQL store.
- User profile syncing from Replit.

**Session Management:**
- 7-day session timeout with automatic renewal.
- Secure, HTTP-only cookies with HTTPS enforcement.

### Data Storage

**PostgreSQL Database Schema:**
- **Authentication Tables:** `sessions`, `users`.
- **Application Tables:** `customer_profiles`, `scoping_sessions`, `questionnaire_responses`, `documentation_links`, `deployment_checklists`, `checklist_templates`, `checklist_items_template`, `option_catalogs`, `option_values`, `nac_assessments`, `migration_recommendations`, `project_milestones`, `milestone_tasks`, `app_settings`.

**Data Model Design Decisions:**
- UUID primary keys.
- JSONB columns for flexible data.
- Timestamp tracking.
- Indexed foreign keys.
- Soft delete pattern using `isArchived` fields.

### Core Features and Implementations

- **AI-Powered Recommendations:** Utilizes OpenAI GPT-4o/4o-mini via Replit AI Integrations for NLP-driven deployment, migration, best practices, implementation guides, and risk assessment recommendations.
- **Professional Export System:** Generates branded PDF/Word deployment guides using `pdf-lib` and `docx` libraries, including customer profiles, questionnaire responses, checklists, and AI recommendations.
- **Documentation Management:** CRUD operations for documentation, Firecrawl API integration for web scraping, duplicate detection, and tag management.
- **Archive Functionality:** Soft-delete for customers and sessions using an `isArchived` boolean field.
- **Enhanced Documentation Recommendations:** Expanded questionnaire field mappings to documentation tags for improved relevancy.
- **Mandatory Customer Profile:** Enforces customer profile creation/selection before initiating scoping sessions.
- **Questionnaire Enhancements:** Added "Other" option for custom text input, expanded SAML/OpenID application list, and new sections for Guest Access/BYOD and Contractor Access.

## External Dependencies

- **Replit Platform Services:** Replit Auth, Replit deployment environment variables, Replit-specific Vite plugins.
- **Neon Database:** Serverless PostgreSQL hosting.
- **Third-Party UI Libraries:** Radix UI, shadcn/ui, Lucide React, cmdk.
- **Development Tools:** Drizzle Kit, ESBuild, TypeScript.
- **Fonts & Assets:** Google Fonts API, Portnox branding assets.
- **AI Integration:** OpenAI GPT-4o/4o-mini via Replit AI.
- **Document Generation:** `pdf-lib`, `docx`.
- **Web Scraping:** Firecrawl API.