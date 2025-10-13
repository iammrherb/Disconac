# Portnox Scoping & Deployment Tool - Design Guidelines

## Design Approach
**System-Based Approach**: This is a utility-focused enterprise application requiring efficiency, clarity, and professional presentation. We'll use a modern Material Design-inspired system customized for Portnox branding, prioritizing information hierarchy and workflow efficiency.

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 200 100% 45% (Portnox Blue - #00a4e4)
- Primary Dark: 200 100% 32% (Deep Blue - #0073a3)
- Success: 158 64% 52% (Emerald for confirmations/exports)
- Warning: 38 92% 50% (Amber for alerts)
- Danger: 0 84% 60% (Red for errors/destructive actions)
- Neutral Gray: 215 16% 47% (Body text and borders)
- Background: 210 20% 98% (Subtle blue-gray)
- Surface: 0 0% 100% (Card/panel backgrounds)

**Dark Mode:**
- Primary: 200 100% 50% (Brighter Portnox Blue)
- Primary Dark: 200 90% 40%
- Background: 220 13% 13% (Deep charcoal)
- Surface: 220 13% 18% (Elevated surfaces)
- Text Primary: 210 17% 98%
- Text Secondary: 215 14% 71%

**Accent Colors:**
- Teal Accent: 174 72% 56% (For documentation badges)
- Purple Accent: 262 52% 60% (For premium features)

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - Clean, professional, excellent readability
- Monospace: 'JetBrains Mono' - For code snippets, IPs, configuration values
- Display: 'Inter' at larger weights for headings

**Type Scale:**
- Hero: 2.5rem/2.75rem (40px/44px) - weight 300
- H1: 2rem/2.25rem (32px/36px) - weight 600
- H2: 1.5rem/2rem (24px/32px) - weight 600
- H3: 1.25rem/1.75rem (20px/28px) - weight 600
- Body Large: 1rem/1.5rem (16px/24px) - weight 400
- Body: 0.875rem/1.25rem (14px/20px) - weight 400
- Small: 0.75rem/1rem (12px/16px) - weight 500
- Labels: 0.813rem/1.25rem (13px/20px) - weight 500, uppercase, tracking-wide

### C. Layout System

**Spacing Scale:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6 for cards
- Section spacing: py-12 to py-20 for major sections
- Form field gaps: gap-4 to gap-6
- Page margins: px-4 (mobile), px-6 (tablet), px-8 (desktop)

**Grid System:**
- Form layouts: 1-column (mobile), 2-column (tablet), 3-column (desktop wide)
- Documentation cards: 1-column (mobile), 2-column (tablet), 3-column (desktop)
- Dashboard widgets: Flexible grid with auto-fit minmax(320px, 1fr)

**Containers:**
- Max width: max-w-7xl for main content
- Forms: max-w-4xl for optimal readability
- Modals: max-w-2xl for dialogs

### D. Component Library

**Navigation:**
- Top app bar: Sticky, elevated shadow, Portnox logo left, user profile/settings right
- Side drawer: Collapsible navigation for sections (Scoping, Deployment, Documentation, Reports)
- Breadcrumbs: Show current location in workflow
- Tab navigation: For switching between related views (Prerequisites, Checklist, Documentation)

**Forms:**
- Input fields: Rounded-lg borders, focus ring with primary color, clear labels above
- Select dropdowns: Custom styled with chevron icon, searchable for long lists
- Checkboxes/Radio: Accent color, clear touch targets (min 44px)
- Multi-select: Chip-based selection with clear visual feedback
- Text areas: Auto-expanding for notes/comments
- Validation: Inline error messages, red border on invalid state

**Cards & Panels:**
- Scoping sections: White/dark surface, subtle shadow, rounded-xl corners
- Documentation cards: Elevated on hover, clear CTA (link icon), excerpt preview
- Stat cards: Large number display, icon, trend indicator

**Buttons:**
- Primary: Gradient bg (primary to primary-dark), white text, shadow-md
- Secondary: Outline style, transparent bg, primary border
- Tertiary: Ghost style, no border, hover bg
- Icon buttons: Circular, 40x40px minimum
- Export actions: Color-coded (Excel=green, PDF=red, JSON=blue)

**Data Display:**
- Tables: Sticky headers, zebra striping subtle, row hover state
- Category headers: Gradient background, uppercase labels
- Progress indicators: Multi-step wizard with status icons
- Badges: Rounded-full, color-coded by type (Required, Optional, Configured)

**Overlays:**
- Modals: Centered, backdrop blur, slide-up animation
- Toasts: Top-right position, auto-dismiss, color-coded by type
- Documentation panel: Slide-in from right, full height, scrollable content

### E. Interactions & Animations

**Use Sparingly:**
- Page transitions: Simple fade (200ms)
- Hover states: Scale 1.02 or subtle shadow increase (150ms ease)
- Form focus: Ring appearance (100ms)
- Drawer/modal: Slide/fade combo (250ms cubic-bezier)
- Success states: Brief scale bounce (300ms) on save/export

**NO animations for:**
- Table sorting/filtering
- Form validation feedback
- Tab switching
- Dropdown menus

## Images

**Logo & Branding:**
- Portnox logo: Header (40px height), maintain white background badge
- Partner logos: Footer or integration section, grayscale with color on hover

**No Hero Image Required:** This is a utility application focused on workflow efficiency. The interface leads directly into the scoping questionnaire and tools.

**Icon Usage:**
- Use Heroicons library via CDN (outline for default, solid for active states)
- Category icons: Network, Security, TACACS+, ZTNA represented with relevant icons
- Documentation icons: Link-external, document-text, book-open
- Status icons: Check-circle (success), exclamation-circle (warning), x-circle (error)

## Special Considerations

**Documentation Integration:**
- Floating action button (bottom-right) to access documentation search
- Inline doc links: Icon badge next to relevant fields with tooltip preview
- Documentation panel: Sidebar with search, categorized links, recent items
- Link styling: Teal accent color, underline on hover, external icon suffix

**Form State Management:**
- Auto-save indicators: "Saved" with timestamp, subtle fade-in
- Progress tracking: Visual completion percentage, section-by-section
- Required field highlighting: Asterisk, bottom border accent when empty

**Professional Polish:**
- Export headers: Include Portnox branding, date, consultant info
- Print styles: Clean, professional output for PDF generation
- Empty states: Helpful illustrations/icons with clear CTAs
- Loading states: Skeleton screens for data fetch, spinners for actions