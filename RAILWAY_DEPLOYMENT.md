# Railway Deployment Guide

## Prerequisites
- Railway account (sign up at https://railway.app)
- Neon Postgres database (or create one in Railway)

## Deployment Steps

### 1. Create New Railway Project
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `Disconac` repository
4. Railway will automatically detect it as a Node.js app

### 2. Configure Environment Variables
In your Railway project dashboard, add these environment variables:

**Required:**
- `DATABASE_URL` - Your Neon Postgres connection string (from Vercel or Neon dashboard)
- `SESSION_SECRET` - A random secret string for session encryption
- `NODE_ENV` - Set to `production`

**Optional (for Replit Auth):**
- `REPL_ID` - Your Replit app ID
- `REPLIT_DOMAINS` - Comma-separated domains (e.g., `yourapp.railway.app`)
- `ISSUER_URL` - OAuth issuer URL (default: `https://replit.com/oidc`)

**Optional (for integrations):**
- `OPENAI_API_KEY` - For AI recommendations
- `FIRECRAWL_API_KEY` - For documentation crawling
- `SALESFORCE_CLIENT_ID` - For Salesforce integration
- `SALESFORCE_CLIENT_SECRET` - For Salesforce integration
- `SALESFORCE_REDIRECT_URI` - OAuth callback URL

### 3. Deploy
1. Railway will automatically build and deploy your app
2. You'll get a public URL like `https://yourapp.railway.app`
3. Update `REPLIT_DOMAINS` with your Railway URL if using Replit Auth

### 4. Database Migration
Run the database migration to create tables:
```bash
npm run db:push
```

Or in Railway dashboard:
- Go to "Deployments" → "Deploy Logs"
- Verify tables were created in your Neon database

### 5. Test Your Deployment
1. Visit your Railway URL
2. Test authentication flow
3. Try creating a customer and session

## Troubleshooting

### Build Failures
- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check Neon database allows connections from Railway IPs

### Authentication Issues
- Verify `REPLIT_DOMAINS` includes your Railway URL
- Check OAuth callback URLs in Replit settings

## Notes
- Railway automatically rebuilds on git push to main branch
- Logs are available in the Railway dashboard
- Railway provides 500 hours/month on free tier
- Upgrade to Pro ($5/month) for unlimited hours and better resources
