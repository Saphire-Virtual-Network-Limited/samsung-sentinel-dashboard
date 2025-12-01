# CORS Bypass Configuration

This project includes a built-in CORS bypass solution using Next.js API routes to proxy backend API calls during development.

## Why Use CORS Bypass?

CORS (Cross-Origin Resource Sharing) errors occur when your frontend (running on `localhost:3000`) tries to make requests to a backend API on a different domain. Browsers block these requests for security reasons unless the backend explicitly allows them.

## How It Works

When CORS bypass is enabled:

1. All API calls are routed through a Next.js API route (`/api/proxy/[...path]`)
2. The API route acts as a proxy, forwarding requests to the actual backend
3. Since the request is made server-side (Next.js server), CORS restrictions don't apply
4. The proxy adds proper CORS headers to the response for the browser

## Configuration

### 1. Enable CORS Bypass

Create a `.env.local` file in the root directory (or update your existing one):

```env
NEXT_PUBLIC_USE_CORS_BYPASS=true
```

### 2. Configure Backend URL

Make sure your backend URL is set correctly:

```env
NEXT_PUBLIC_API_URL=https://dev-samsung-portal.connectwithsapphire.com
NEXT_PUBLIC_API_BASE_URL=https://dev-samsung-portal.connectwithsapphire.com
NEXT_PUBLIC_APP_KEY=your-app-key-here
```

### 3. Restart Development Server

After changing environment variables, restart your Next.js development server:

```bash
npm run dev
```

## How to Use

### Enable CORS Bypass (Development)

```env
# .env.local
NEXT_PUBLIC_USE_CORS_BYPASS=true
```

This will route all API calls through `/api/proxy/*` automatically.

### Disable CORS Bypass (Production/Direct API)

```env
# .env.local
NEXT_PUBLIC_USE_CORS_BYPASS=false
```

Or simply remove the variable. This will make API calls directly to the backend.

## Technical Details

### Proxy Route Location

```
app/api/proxy/[...path]/route.ts
```

This is a Next.js catch-all API route that handles:

- ✅ GET, POST, PUT, PATCH, DELETE requests
- ✅ Query parameters forwarding
- ✅ Request body forwarding
- ✅ Headers forwarding (Authorization, etc.)
- ✅ Proper CORS headers in response
- ✅ OPTIONS (preflight) requests

### Modified Files

1. **`lib/api/shared/apiCall.ts`**

   - Checks `NEXT_PUBLIC_USE_CORS_BYPASS` environment variable
   - Routes API calls to `/api/proxy/*` when enabled
   - Routes directly to backend when disabled

2. **`app/api/proxy/[...path]/route.ts`**
   - Proxy implementation
   - Forwards all HTTP methods
   - Adds CORS headers
   - Handles errors gracefully

## Example

### Without CORS Bypass (Direct)

```
Frontend (localhost:3000) → Backend API (dev-samsung-portal.connectwithsapphire.com)
❌ CORS Error
```

### With CORS Bypass (Proxy)

```
Frontend (localhost:3000) → Next.js API Route (localhost:3000/api/proxy/*) → Backend API
✅ No CORS Error
```

## Important Notes

### Development vs Production

- **Development**: Use CORS bypass if you encounter CORS errors
- **Production**: Disable CORS bypass and ensure your backend has proper CORS configuration

### Performance

The proxy adds a small overhead since requests go through an extra layer. For production:

1. Disable CORS bypass
2. Configure proper CORS headers on your backend
3. Use direct API calls for better performance

### Security

The proxy is safe for development but should not be relied upon in production. Always configure proper CORS on your backend for production environments.

## Troubleshooting

### CORS errors still appearing

1. Make sure `.env.local` has `NEXT_PUBLIC_USE_CORS_BYPASS=true`
2. Restart your Next.js development server
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Proxy timeout errors

The proxy has a 30-second timeout. If your API calls take longer:

1. Optimize your backend endpoints
2. Or increase timeout in `app/api/proxy/[...path]/route.ts`:
   ```typescript
   signal: AbortSignal.timeout(60000), // 60 seconds
   ```

### Authorization issues

Make sure your Authorization token is being set correctly. The proxy forwards all headers including `Authorization: Bearer <token>`.

## Alternative Solutions

If the proxy doesn't work for your use case, consider:

1. **Browser Extension**: Use a CORS browser extension (development only)
2. **Backend Configuration**: Add CORS headers to your backend
3. **nginx/Apache**: Configure reverse proxy at the server level
4. **Disable Browser Security**: Run Chrome with `--disable-web-security` (development only, not recommended)

## Questions?

If you encounter issues with the CORS bypass configuration, check:

- Environment variables are set correctly
- Next.js server was restarted after env changes
- Browser console for specific error messages
- Network tab to see if requests go through `/api/proxy/*`
