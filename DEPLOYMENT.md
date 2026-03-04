# Deployment Guide - SalonBook

Complete guide for deploying SalonBook to production.

## Prerequisites

- GitHub account with repository
- Vercel account (free or paid)
- PostgreSQL database (Neon, AWS RDS, or other provider)

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/salon-booking.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Continue with GitHub"
3. Select your repository
4. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://user:password@host:port/salon_booking
JWT_SECRET=your-secure-random-string-here
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## Step 5: Run Database Migrations

After deployment, run migrations on your production database:

```bash
# Using Vercel CLI
vercel env pull .env.production.local
pnpm db:push --skip-generate
```

Or through the Vercel dashboard:
1. Go to your project
2. Settings → Functions
3. Run migrations via custom deployment script

## Database Setup

### Using Neon (PostgreSQL)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use as `DATABASE_URL` in Vercel

### Using AWS RDS

1. Create RDS PostgreSQL instance
2. Configure security groups for Vercel IP access
3. Copy connection string
4. Use as `DATABASE_URL` in Vercel

### Using Supabase

1. Create Supabase project
2. Go to Project Settings → Database
3. Copy the Connection String
4. Use as `DATABASE_URL` in Vercel

## Production Checklist

- [ ] Set strong `JWT_SECRET` (use: `openssl rand -hex 32`)
- [ ] Update `NEXT_PUBLIC_API_URL` to production domain
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up database backups
- [ ] Configure email service (for future notifications)
- [ ] Set up monitoring/logging
- [ ] Test all flows in production
- [ ] Set up domain with Vercel

## Post-Deployment

### Seed Production Database

```bash
# SSH into your database or use admin tool
# Then run seed script adapted for production
```

### Monitor Performance

1. Vercel Analytics
2. Database query logs
3. Error tracking (Sentry recommended)

### Update Admin Credentials

Change default demo credentials:

```bash
# Connect to production database
psql $PRODUCTION_DATABASE_URL

-- Update admin password
UPDATE "User" SET password = 'HASHED_PASSWORD' 
WHERE email = 'admin@salon.com';
```

## Scaling Considerations

### Database
- Enable connection pooling for Neon/Supabase
- Add database indexes for frequent queries
- Monitor query performance

### Application
- Vercel auto-scales serverless functions
- Monitor function execution times
- Implement caching where appropriate

### Security
- Keep dependencies updated: `pnpm update`
- Monitor for vulnerabilities: `pnpm audit`
- Rotate JWT_SECRET periodically
- Enable Vercel security features

## Troubleshooting

### Build Failures

```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Missing dependencies

# Fix locally first:
pnpm install
pnpm build
```

### Database Connection Issues

```bash
# Test connection string:
psql $DATABASE_URL -c "SELECT 1;"

# Check connection limits
# Increase timeout if needed
```

### Performance Issues

- Check Vercel Analytics
- Monitor database query performance
- Optimize N+1 queries in API
- Add caching headers

## Continuous Deployment

Vercel automatically deploys on push to main:

```bash
git push origin main
# Vercel builds and deploys automatically
```

To preview changes before merging:
1. Push to feature branch
2. Create pull request
3. Vercel creates preview deployment
4. Review and test
5. Merge when ready

## Rollback

If deployment fails:

1. Go to Vercel dashboard
2. Select "Deployments"
3. Find previous stable version
4. Click "Promote to Production"

## Custom Domain

1. In Vercel: Settings → Domains
2. Add your custom domain
3. Update DNS records (instructions provided)
4. Wait for DNS propagation (up to 48 hours)

## SSL/TLS Certificate

Vercel automatically provisions Let's Encrypt certificates for all domains.

## Performance Optimization for Production

### Next.js Build

```bash
# Analyze bundle
ANALYZE=true pnpm build

# Optimize images in Vercel dashboard
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_salon_city ON Salon(city);
CREATE INDEX idx_booking_status ON Booking(status);
CREATE INDEX idx_review_salon ON Review(salonId);
CREATE INDEX idx_user_role ON User(role);
```

## Monitoring & Logging

### Vercel Built-in
- Real-time logs
- Function execution times
- Error tracking

### Recommended Third-Party Tools
- **Monitoring:** Sentry.io (error tracking)
- **Logs:** Logflare (log aggregation)
- **Analytics:** Vercel Analytics (built-in)
- **Uptime:** UptimeRobot (free)

## Backup Strategy

### Database Backups
- Enable automatic backups (most providers offer this)
- Retention period: at least 7 days
- Test restore process monthly

### Code Backup
- GitHub is your code backup
- Keep sensitive config in environment variables

## Security Hardening

### For Production

```env
# Ensure these are strong and random
JWT_SECRET=generate-with-openssl-rand-hex-32
NEXT_PUBLIC_API_URL=https://your-domain.com (not localhost)
```

### CORS Configuration
Add to API routes as needed:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_API_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
};
```

### Rate Limiting
Implement in production API routes:

```typescript
// Consider using middleware for rate limiting
// Options: Vercel KV, Redis, or third-party service
```

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs/
- **Neon Docs:** https://neon.tech/docs/
- **PostgreSQL:** https://www.postgresql.org/docs/

## Post-Deployment Monitoring

1. Check Vercel analytics daily first week
2. Monitor database performance
3. Review error logs weekly
4. Update dependencies monthly
5. Test critical flows weekly

## Incident Response

If production experiences issues:

1. Check Vercel dashboard for deployment status
2. Review recent error logs
3. Check database connectivity
4. Rollback to previous version if needed
5. Investigate root cause
6. Deploy fix
7. Document incident

## Version Control

Tag releases in Git:

```bash
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

## Success Metrics

After deployment, monitor:
- Page load time (< 3 seconds)
- API response time (< 200ms)
- Error rate (< 0.1%)
- Database query time (< 100ms)
- Uptime (> 99.9%)
