# Debug System

This debug system allows developers to override user roles and permissions during development without modifying code.

## Features

- **Role Override**: Switch between any available role (ADMIN, SUB_ADMIN, SALES, etc.)
- **Email Override**: Override the email used for permission checks
- **Permission Override**: Selectively grant any permission regardless of role
- **Development Only**: Only appears in development environment
- **Persistent State**: Debug settings are saved in localStorage

## How to Use

### 1. Enable Debug Mode

- In development, you'll see a "Debug" button in the sidebar (above Settings)
- Click it to open the Debug Console
- Toggle "Debug Mode" on

### 2. Role Override

- Select any role from the dropdown to override your current role
- The sidebar menu will update to reflect the new role's permissions
- Select "No Override" to use your original role

### 3. Email Override

- Enter any email address to override permission checks
- Useful for testing email-specific permissions
- Leave blank to use original email

### 4. Permission Override

- Toggle individual permissions to force-grant them
- These permissions bypass role-based restrictions
- Use sparingly for testing specific features

### 5. Active Overrides

- The debug button shows an orange indicator when overrides are active
- The modal shows a summary of all active overrides
- Use "Reset All" to clear all overrides

## Technical Details

### Files Added/Modified

- `lib/debugContext.tsx` - React context for debug state
- `components/modals/DebugModal.tsx` - Debug console UI
- `hooks/useAuthWithDebug.ts` - Debug-aware auth hook
- `lib/permissions.ts` - Modified to check debug overrides
- `components/reususables/custom-ui/sidebar.tsx` - Added debug button
- `app/layout.tsx` - Added DebugProvider

### How It Works

1. Debug state is stored in localStorage (development only)
2. `hasPermission()` function checks for debug overrides first
3. `useAuthWithDebug()` hook provides debug-aware user data
4. UI components can check `isDebugMode` to show debug indicators

### Usage in Code

```typescript
// Use debug-aware auth hook
import { useAuthWithDebug } from "@/hooks/useAuthWithDebug";

const MyComponent = () => {
	const { userResponse, debugInfo } = useAuthWithDebug();

	// debugInfo contains:
	// - isDebugMode: boolean
	// - originalRole: string
	// - debugOverrides: DebugOverrides

	return <div>Current role: {userResponse?.data?.role}</div>;
};
```

### Permission Checking

```typescript
// Permissions automatically respect debug overrides
const canDelete = hasPermission(role, "canDeleteCustomers", email);
// This will check debug overrides first, then fall back to normal logic
```

## Safety Notes

- Debug system only works in `NODE_ENV === "development"`
- No debug code will run in production
- Debug state is stored locally and not persisted across machines
- Always test with debug mode OFF before deploying

## Troubleshooting

- **Debug button not showing**: Ensure `NODE_ENV=development`
- **Overrides not working**: Check browser console for localStorage errors
- **Permissions not updating**: Hard refresh the page after changing overrides
- **Modal styling issues**: Check that HeroUI components are properly imported
