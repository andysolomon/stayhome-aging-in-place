# End-to-End Tests

E2E tests are planned but deferred to post-launch. When ready, install Playwright:

```bash
bun add -d @playwright/test
npx playwright install
```

## Planned Test Scenarios

### Critical Path: Signup → Assessment → Report
1. Sign up with email/password
2. Create a property via onboarding wizard
3. Start an assessment
4. Upload a photo (mock AI response)
5. Complete manual checklist
6. Finalize assessment → verify score
7. View report page
8. Download PDF
9. Share report link → verify public page

### Auth Flows
1. Sign in → redirected to /dashboard
2. Sign out → redirected to /sign-in
3. Visit /dashboard while signed out → redirected to /sign-in
4. Family user visits /admin → redirected to /dashboard

### Admin Flows
1. Create contractor → appears in directory
2. Review assessment → flag for follow-up
3. Create partner → API key generated
4. View analytics dashboard

### Stripe Checkout (test mode)
1. Click upgrade on pricing page → Stripe Checkout opens
2. Complete with test card 4242424242424242 → subscription created
3. Manage subscription → Customer Portal opens
