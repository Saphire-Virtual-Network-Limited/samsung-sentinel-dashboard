# Enhanced Debug System Implementation

## Overview
I have implemented a comprehensive debug system that addresses all your requirements:

1. **Cookie-based state persistence** with 3-hour expiration
2. **Automatic URL navigation** when switching roles
3. **Current permissions shown as "on"** by default
4. **Centralized role mapping** for better maintainability
5. **Session management** with extension capability

## Key Components

### 1. Role Mapping System (`lib/roleMapping.ts`)
- Centralized mapping of roles to URL paths
- Functions to get role paths, validate paths, and convert between roles and URLs
- Used throughout the application for consistent routing

```typescript
export const ROLE_MAPPINGS = {
  SUPER_ADMIN: "/access/admin",
  ADMIN: "/access/sub-admin", 
  SERVICE_CENTER: "/access/service-center",
  // ... all other roles
}
```

### 2. Enhanced Debug Context (`lib/debugContext.tsx`)
**New Features:**
- Cookie-based persistence (primary) with localStorage fallback
- 3-hour expiration timer with auto-cleanup
- URL navigation when roles change
- Session extension capability

**Cookie Management:**
- Uses `debug_overrides` cookie with 3-hour expiration
- Automatically cleans up expired sessions
- Survives page reloads and browser restarts

### 3. Enhanced Permissions System (`lib/permissions.ts`)
**Updates:**
- `getCurrentPermissions()` function to show current role permissions
- Cookie-based debug override checking
- Improved debug override integration

### 4. Debug Modal Improvements (`components/modals/DebugModal.tsx`)
**New Features:**
- Shows current permissions as "on" by default
- Session expiration timer with remaining time
- "Extend Session" button (+3 hours)
- Uses centralized role mapping

### 5. Enhanced useAuthWithDebug Hook (`hooks/useAuthWithDebug.ts`)
**New Features:**
- Automatic URL navigation when debug role changes
- Listens for role change events
- Proper integration with Next.js router

## How It Works

### Role Switching with URL Navigation
1. User selects a role in debug modal
2. `setDebugRole()` is called with navigation enabled
3. System checks if current URL is valid for new role
4. If not, automatically navigates to appropriate URL
5. Sidebar and permissions update immediately

### Permission System
1. Debug modal shows current role permissions as "on"
2. Additional permissions can be toggled on
3. hasPermission() checks debug overrides first
4. Falls back to normal role-based permissions

### Session Management
1. Debug sessions expire after 3 hours
2. Timer shown in debug modal
3. "Extend Session" button adds 3 more hours
4. Auto-cleanup removes expired sessions

### State Persistence
1. Primary storage: HTTP cookies (survives browser restart)
2. Fallback storage: localStorage (for compatibility)
3. Automatic migration from old localStorage format
4. Immediate state initialization (no race conditions)

## Usage

### For Developers
1. Open debug modal from sidebar (development only)
2. Toggle debug mode on
3. Select role - URL automatically changes
4. Override email for permission testing
5. Toggle additional permissions as needed
6. Session auto-expires in 3 hours

### Key Functions
```typescript
// Get role's base URL
getRoleBasePath("SERVICE_CENTER") // returns "/access/service-center"

// Check if path is valid for role
isValidPathForRole("ADMIN", "/access/admin/users") // returns true

// Get current permissions for role
getCurrentPermissions("SERVICE_CENTER") // returns array of granted permissions

// Debug context
const { setDebugRole, extendDebugSession } = useDebug();
setDebugRole("ADMIN", true); // Set role and navigate
extendDebugSession(); // Add 3 more hours
```

## File Changes Made

### New Files
- `lib/roleMapping.ts` - Centralized role-to-URL mapping
- `app/access/service-center/layout.tsx` - Missing layout file

### Enhanced Files
- `lib/debugContext.tsx` - Cookie support, URL navigation, session management
- `lib/permissions.ts` - Current permissions, cookie-based debug overrides  
- `components/modals/DebugModal.tsx` - Session info, role mapping, current permissions
- `hooks/useAuthWithDebug.ts` - URL navigation, event listening
- `lib/index.ts` - Export new utilities

### Integration Points
- Sidebar uses `useAuthWithDebug` for reactive updates
- Permission system checks cookies for debug overrides
- Debug modal shows session expiration and extension
- URL navigation happens automatically on role changes

## Benefits

1. **Better Developer Experience**: Automatic navigation, persistent state
2. **Maintainable Code**: Centralized role mapping, clear separation of concerns
3. **Security**: Session expiration, development-only restrictions
4. **User-Friendly**: Shows current permissions, session management
5. **Robust**: Cookie + localStorage, error handling, migration support

The debug system now works exactly as requested - role switching updates the sidebar and URL immediately, permissions show current state as "on", and debug state persists through browser reloads with automatic 3-hour expiration.