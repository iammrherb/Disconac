# Vercel Deployment Guide

## Overview

This guide walks through deploying the Disconac application to Vercel. The application is a full-stack TypeScript app with a React frontend and Express backend.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **Database**: Neon PostgreSQL instance (or any PostgreSQL database)
4. **API Keys**: OpenAI API key, Firecrawl API key (optional)

## Project Structure for Vercel

```
disconac/
├── api/
│   └── index.ts           # Vercel serverless function entry point
├── client/                # React frontend
├── server/                # Express backend
├── dist/                  # Built frontend assets
├── vercel.json           # Vercel configuration
└── package.json          # Updated with build:vercel script
```

## Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Session
SESSION_SECRET=your-random-secret-key-min-32-chars

# Node Environment
NODE_ENV=production
```

### Optional Variables (for enhanced features)

```bash
# OpenAI API (for AI recommendations)
OPENAI_API_KEY=sk-...

# Firecrawl (for documentation crawling)
FIRECRAWL_API_KEY=fc-...

# Salesforce Integration (if using CRM sync)
SALESFORCE_CLIENT_ID=your-client-id
SALESFORCE_CLIENT_SECRET=your-client-secret
SALESFORCE_REDIRECT_URI=https://your-domain.vercel.app/api/oauth/salesforce/callback
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `Disconac` project

2. **Configure Project**
   - Framework Preset: **Other**
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Add all required environment variables from above
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be available at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   cd ~/repos/Disconac
   vercel link
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add SESSION_SECRET production
   vercel env add NODE_ENV production
   # Add other variables as needed
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Database Setup

### Using Neon (Recommended)

1. **Create Database**
   - Go to https://neon.tech
   - Create a new project
   - Copy the connection string

2. **Push Schema**
   ```bash
   DATABASE_URL="your-connection-string" npm run db:push
   ```

3. **Verify Schema**
   - Connect to your database
   - Verify all 16 tables exist:
     - users
     - customer_profiles
     - scoping_sessions
     - questionnaire_responses
     - deployment_checklists
     - documentation_links
     - approved_documentation
     - nac_assessments
     - project_milestones
     - milestone_tasks
     - checklist_templates
     - checklist_items_template
     - option_catalogs
     - option_values
     - app_settings

### Using Other PostgreSQL Providers

- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Heroku Postgres**: https://www.heroku.com/postgres
- **Amazon RDS**: https://aws.amazon.com/rds/postgresql/

All providers work the same way - just use the connection string in `DATABASE_URL`.

## Post-Deployment Configuration

### 1. Configure App Settings

After deployment, seed the `app_settings` table with default values:

```sql
INSERT INTO app_settings (key, value, description) VALUES
  ('openai_api_key', 'sk-...', 'OpenAI API key for AI recommendations'),
  ('firecrawl_api_key', 'fc-...', 'Firecrawl API key for documentation crawling'),
  ('default_deployment_type', 'cloud', 'Default deployment type for new sessions'),
  ('max_checklist_items', '100', 'Maximum checklist items to generate');
```

Or use the API:

```bash
curl -X PUT https://your-domain.vercel.app/api/settings/openai_api_key \
  -H "Content-Type: application/json" \
  -d '{"value":"sk-...","description":"OpenAI API key"}'
```

### 2. Import Documentation

Import Portnox documentation for intelligent recommendations:

```bash
# Option A: Bulk import from JSON
curl -X POST https://your-domain.vercel.app/api/documentation/import \
  -H "Content-Type: application/json" \
  -d @portnox-docs.json

# Option B: Crawl Portnox website (requires Firecrawl API key)
curl -X POST https://your-domain.vercel.app/api/documentation/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.portnox.com/documentation/","crawlSubpages":true}'
```

### 3. Test Deployment

1. **Health Check**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

2. **Create Test Customer**
   - Navigate to your Vercel URL
   - Create a customer profile
   - Start a scoping session
   - Fill out questionnaire
   - Generate deployment checklist

3. **Test Export Features**
   - Export to PDF
   - Export to Word
   - Verify branded documents

## Authentication Configuration

### Default Setup (No Auth)

By default, the app runs without authentication for quick testing. This is NOT recommended for production.

### Custom Authentication Options

#### Option 1: Implement JWT Auth

1. Install dependencies:
   ```bash
   npm install jsonwebtoken bcryptjs
   npm install -D @types/jsonwebtoken @types/bcryptjs
   ```

2. Add JWT secret to environment:
   ```bash
   JWT_SECRET=your-jwt-secret-key
   ```

3. Implement auth routes in `server/routes.ts`

#### Option 2: Use Auth0

1. Sign up at https://auth0.com
2. Create application
3. Install Auth0 SDK:
   ```bash
   npm install express-openid-connect
   ```

4. Configure Auth0 in environment variables:
   ```bash
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_BASE_URL=https://your-domain.vercel.app
   ```

#### Option 3: Use Clerk

1. Sign up at https://clerk.com
2. Create application
3. Install Clerk SDK:
   ```bash
   npm install @clerk/clerk-sdk-node
   ```

4. Add Clerk publishable key:
   ```bash
   CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

## Troubleshooting

### Build Failures

**Error: Module not found**
```bash
# Solution: Ensure all dependencies are in dependencies, not devDependencies
npm install --save missing-package
```

**Error: TypeScript errors**
```bash
# Solution: Fix type errors before deploying
npm run check
```

### Runtime Errors

**Error: Database connection failed**
```bash
# Solution: Verify DATABASE_URL is correct and database is accessible
# Test connection locally first
```

**Error: 500 on API routes**
```bash
# Solution: Check Vercel Function Logs
# Dashboard → Project → Deployments → Logs
```

### Performance Issues

**Slow API responses**
```bash
# Solution: Increase function memory in vercel.json
"functions": {
  "api/index.ts": {
    "memory": 3008,
    "maxDuration": 30
  }
}
```

**Function timeout**
```bash
# Solution: Optimize long-running queries or split into multiple functions
# Pro plan allows maxDuration: 300 (5 minutes)
```

## Custom Domain

1. **Add Domain in Vercel**
   - Dashboard → Project → Settings → Domains
   - Add your custom domain

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record to Vercel's IP

3. **Update Environment Variables**
   - Update any callback URLs in Salesforce/OAuth configs
   - Update CORS origins if needed

## Monitoring & Analytics

### Vercel Analytics

Enable built-in analytics:
```bash
npm install @vercel/analytics
```

Add to `client/src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Error Tracking

Consider adding Sentry:
```bash
npm install @sentry/react @sentry/node
```

## Scaling Considerations

### Database Connection Pooling

Vercel serverless functions can create many connections. Use connection pooling:

```bash
# Neon provides built-in pooling via connection string parameter
DATABASE_URL=postgres://...?pgbouncer=true
```

### Caching

Implement caching for documentation and checklist generation:

1. **Redis** (Upstash): https://upstash.com
2. **Vercel KV**: https://vercel.com/docs/storage/vercel-kv

### Rate Limiting

Implement rate limiting for API routes:

```bash
npm install express-rate-limit
```

## Cost Optimization

- **Hobby Plan**: Free for small projects
- **Pro Plan**: $20/month - recommended for production
  - Better performance
  - Custom domains
  - Analytics
  - Password protection

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **HTTPS Only**: Vercel automatically provides SSL
3. **CORS**: Configure allowed origins in production
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: All user inputs validated via Zod schemas
6. **SQL Injection**: Protected by Drizzle ORM parameterized queries

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Push database schema
4. ✅ Import documentation
5. ✅ Test all features
6. ✅ Add custom domain
7. ✅ Enable analytics
8. ✅ Set up monitoring
9. ✅ Configure authentication
10. ✅ Review security settings

## Support

For issues or questions:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Issues: https://github.com/iammrherb/Disconac/issues
