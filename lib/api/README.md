# API Structure Documentation

## Overview

The API layer has been restructured to organize endpoints by domain instead of having everything in a single file. This makes the codebase more maintainable and scalable. **All endpoints are auto-generated from the Swagger/OpenAPI specification.**

## Folder Structure

```
lib/
├── api.ts                    # Main entry point (re-exports from api/)
└── api/
    ├── index.ts              # Central export point
    ├── _template.ts          # Template for new domains
    ├── README.md             # This file
    ├── shared/               # Shared utilities and types
    │   ├── index.ts
    │   ├── apiCall.ts        # Core API call function
    │   └── types.ts          # Shared TypeScript types & enums
    ├── auth/                 # Authentication & authorization
    │   └── index.ts
    ├── users/                # User management
    │   └── index.ts
    ├── products/             # Device product management
    │   └── index.ts
    ├── repair-stores/        # Repair store operations
    │   └── index.ts
    ├── service-centers/      # Service center management
    │   └── index.ts
    ├── engineers/            # Engineer management
    │   └── index.ts
    ├── imeis/                # IMEI validation & management
    │   └── index.ts
    ├── claims/               # Insurance claim processing
    │   └── index.ts
    ├── partners/             # Samsung partner management
    │   └── index.ts
    └── audit/                # Audit logs & history
        └── index.ts
```

## How to Use

### Importing APIs

All imports remain the same - you can still import from `lib/api`:

```typescript
import { loginAdmin, getAdminProfile, getAllProducts } from "@/lib/api";
import {
	getAmbassadorLeadsWithDetails,
	type Lead,
	type Ambassador,
} from "@/lib/api";
```

### Adding New API Endpoints

#### Step 1: Create a new domain folder

For example, if you want to add admin-related endpoints:

```bash
mkdir lib/api/admin
```

#### Step 2: Create the domain's index.ts

Create `lib/api/admin/index.ts`:

```typescript
import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// ADMIN APIs
// ============================================================================

export interface User {
	id: string;
	email: string;
	role: string;
}

export async function getAllUsers(): Promise<BaseApiResponse<User[]>> {
	return apiCall("/admin/users", "GET");
}

export async function createUser(userData: Partial<User>) {
	return apiCall("/admin/users", "POST", userData);
}
```

#### Step 3: Export from the main api index

Add to `lib/api/index.ts`:

```typescript
// Export admin APIs
export * from "./admin";
```

That's it! The new endpoints are now available throughout your application.

## Current Domains

### 1. **shared/** - Core utilities

- `apiCall()` - Main API call function
- `cachedApiCallWrapper()` - Cached API wrapper
- `ApiCallOptions` - API call configuration interface
- `BaseApiResponse<T>` - Standard API response type

### 2. **auth/** - Authentication

- `loginAdmin()`
- `getAdminProfile()`
- `logoutAdmin()`
- `getAllProducts()`

### 3. **ambassador/** - Ambassador Management

- `getAmbassadorLeadsWithDetails()`
- Types: `Lead`, `Ambassador`, `ConversionRate`

## Benefits of This Structure

1. **Better Organization**: Related endpoints are grouped together
2. **Easier Maintenance**: Changes to one domain don't affect others
3. **Better Type Safety**: Domain-specific types are co-located with their endpoints
4. **Scalability**: Easy to add new domains without cluttering a single file
5. **Code Splitting**: Potential for better tree-shaking and bundle optimization
6. **Team Collaboration**: Multiple developers can work on different domains simultaneously

## Migration Notes

- All existing imports continue to work (backwards compatible)
- No changes needed in components that use these APIs
- The old `lib/api.ts` now just re-exports from `lib/api/`
