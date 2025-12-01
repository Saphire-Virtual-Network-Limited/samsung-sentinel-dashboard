# Quick Start: Fix CORS Errors

If you're getting CORS errors when running the app, follow these simple steps:

## 1. Create `.env.local` file

In the root of your project, create a file called `.env.local` with this content:

```env
NEXT_PUBLIC_API_URL=https://dev-samsung-portal.connectwithsapphire.com
NEXT_PUBLIC_API_BASE_URL=https://dev-samsung-portal.connectwithsapphire.com
NEXT_PUBLIC_APP_KEY=your-app-key-here
NEXT_PUBLIC_USE_CORS_BYPASS=true
```

## 2. Restart the development server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 3. Test

Open your browser and test the IMEI validation or any API call. CORS errors should be gone!

## What This Does

When `NEXT_PUBLIC_USE_CORS_BYPASS=true`, all API calls go through a Next.js proxy route at `/api/proxy/*`, which bypasses browser CORS restrictions.

## For Production

Set `NEXT_PUBLIC_USE_CORS_BYPASS=false` or remove the variable entirely to make direct API calls to the backend.

---

For more details, see [CORS_BYPASS.md](./CORS_BYPASS.md)
