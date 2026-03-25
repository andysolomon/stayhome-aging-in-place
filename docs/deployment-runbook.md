# Deployment Runbook

## Architecture

- **Frontend**: Next.js 16 on Vercel
- **Backend**: Convex (cloud-hosted, separate deployment)
- **Auth**: Clerk
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o

## Environment Setup

### Vercel Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL (e.g., `https://xxx.convex.cloud`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (`pk_test_...` or `pk_live_...`) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (`sk_test_...` or `sk_live_...`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` |

### Convex Environment Variables

Set in Convex Dashboard → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_JWT_ISSUER_DOMAIN` | Yes | Clerk issuer URL (e.g., `https://xxx.clerk.accounts.dev`) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for photo analysis |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret (for production) |
| `STRIPE_MONITORING_PRICE_ID` | No | Stripe price ID for monitoring plan |
| `STRIPE_PREMIUM_PRICE_ID` | No | Stripe price ID for premium plan |

## Deployment Steps

### 1. Deploy Convex Backend

```bash
npx convex deploy
```

This pushes schema and functions to the production Convex deployment.

### 2. Deploy Next.js to Vercel

Automatic on git push to `main`. Or manually:

```bash
vercel --prod
```

### 3. Configure Clerk

1. Create Clerk application at clerk.com
2. Enable email/password + Google OAuth
3. Create JWT Template → select "Convex"
4. Copy issuer URL → add to Convex env vars as `CLERK_JWT_ISSUER_DOMAIN`

### 4. Configure Stripe

1. Create products in Stripe Dashboard:
   - **Monitoring**: $9/month recurring
   - **Premium**: $29/month recurring
2. Copy price IDs → add to Convex env vars as `STRIPE_MONITORING_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID`
3. Create webhook endpoint:
   - URL: `https://your-convex-site-url.convex.site/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook signing secret → add to Convex env vars as `STRIPE_WEBHOOK_SECRET`

## Rollback Procedure

### Vercel Rollback
```bash
vercel rollback
```
Or in Vercel Dashboard: Deployments → select previous deployment → Promote to Production.

### Convex Rollback
Convex doesn't have built-in rollback. To revert:
1. `git revert <commit>` the problematic changes
2. `npx convex deploy` to push the reverted code

## Monitoring

- **Vercel**: Runtime logs at Vercel Dashboard → Logs
- **Convex**: Function logs at Convex Dashboard → Logs
- **Clerk**: Auth events at Clerk Dashboard → Logs
- **Stripe**: Payment events at Stripe Dashboard → Events

## Production Checklist

- [ ] All Vercel env vars set (CONVEX_URL, CLERK keys, sign-in URLs)
- [ ] All Convex env vars set (CLERK_JWT_ISSUER_DOMAIN, OPENAI_API_KEY, STRIPE_SECRET_KEY)
- [ ] Clerk JWT template created for Convex
- [ ] Clerk Google OAuth configured
- [ ] Stripe products and prices created
- [ ] Stripe webhook endpoint registered
- [ ] `npx convex deploy` completed successfully
- [ ] `vercel --prod` deployed successfully
- [ ] Landing page loads at production URL
- [ ] Sign up → dashboard flow works
- [ ] Assessment flow works (photo upload + AI)
- [ ] DNS/domain configured (if custom domain)
