# Samsung Portal API - Complete Documentation

## 📋 Overview

The API layer is **auto-generated from the Swagger/OpenAPI specification** and organized by domain for better maintainability and scalability. All endpoints, types, and interfaces match the backend API exactly.

## 📁 Folder Structure

```
lib/
├── api.ts                    # Main entry point (re-exports from api/)
└── api/
    ├── index.ts              # Central export point
    ├── _template.ts          # Template for new domains
    ├── README.md             # Complete documentation
    ├── shared/               # Shared utilities and types
    │   ├── index.ts
    │   ├── apiCall.ts        # Core API call function with auth interceptors
    │   └── types.ts          # Shared TypeScript types & enums
    ├── auth/                 # Authentication & authorization
    │   └── index.ts          # login, register, refresh, logout, password management
    ├── users/                # User management
    │   └── index.ts          # CRUD operations, profile, password changes
    ├── products/             # Device product management
    │   └── index.ts          # Product CRUD, activate/deactivate
    ├── repair-stores/        # Repair store operations
    │   └── index.ts          # Store management, invitations
    ├── service-centers/      # Service center management
    │   └── index.ts          # Service center CRUD
    ├── engineers/            # Engineer management
    │   └── index.ts          # Engineer CRUD, invitations
    ├── imeis/                # IMEI validation & management
    │   └── index.ts          # Upload, validate, search IMEIs
    ├── claims/               # Insurance claim processing
    │   └── index.ts          # Claim lifecycle, approval, payment
    ├── partners/             # Samsung partner management
    │   └── index.ts          # Partner CRUD, invitations
    └── audit/                # Audit logs & history
        └── index.ts          # Activity tracking, statistics
```

## 🚀 Quick Start

### Authentication

```typescript
import { login, logout, refreshToken, setPassword } from "@/lib/api";

// Login
const response = await login({
	email: "user@example.com",
	password: "password123",
});

// Access token and user info
const { access_token, refresh_token, user } = response.data;

// Set password after invitation
await setPassword({
	token: "invitation-token",
	password: "newPassword123",
});
```

### Users

```typescript
import {
	getAllUsers,
	getMyProfile,
	updateMyProfile,
	changePassword,
} from "@/lib/api";

// Get current user profile
const profile = await getMyProfile();

// Update my profile
await updateMyProfile({
	name: "John Doe",
	phone: "+2348012345678",
});

// Change password
await changePassword({
	current_password: "oldPass",
	new_password: "newPass123",
});

// Get all users (Admin only)
const users = await getAllUsers({
	role: UserRole.ENGINEER,
	status: UserStatus.ACTIVE,
	page: 1,
	limit: 25,
});
```

### Products

```typescript
import { getAllProducts, createProduct, updateProduct } from "@/lib/api";

// Get all products
const products = await getAllProducts({ status: ProductStatus.ACTIVE });

// Create product (Admin only)
await createProduct({
	name: "Samsung Galaxy A05",
	sapphire_cost: 5000,
	repair_cost: 12000,
});
```

### Repair Stores

```typescript
import {
	createRepairStore,
	getAllRepairStores,
	getMyRepairStore,
} from "@/lib/api";

// Create repair store (Admin only)
await createRepairStore({
	name: "TechFix Solutions",
	email: "admin@techfix.com",
	phone: "+2348012345678",
	location: "Lagos, Nigeria",
});

// Get my repair store (Repair Store Admin)
const myStore = await getMyRepairStore();
```

### Service Centers

```typescript
import { createServiceCenter, getAllServiceCenters } from "@/lib/api";

// Create service center
await createServiceCenter({
	name: "TechFix Ikeja Branch",
	email: "ikeja@techfix.com",
	phone: "+2348012345678",
	state: "Lagos",
	city: "Ikeja",
	address: "123 Main Street",
	repair_store_id: "store-uuid", // Optional for admin, auto-filled for repair store admin
});

// Get service centers
const centers = await getAllServiceCenters({
	repair_store_id: "store-uuid",
	status: UserStatus.ACTIVE,
});
```

### Engineers

```typescript
import {
	createEngineer,
	getAllEngineers,
	getMyEngineerProfile,
} from "@/lib/api";

// Create engineer
await createEngineer({
	name: "John Doe",
	email: "engineer@techfix.com",
	phone: "+2348012345678",
	service_center_id: "center-uuid",
});

// Get my engineer profile
const profile = await getMyEngineerProfile();
```

### IMEIs

```typescript
import { uploadImeiCsv, validateImei, searchImei } from "@/lib/api";

// Upload IMEI CSV
const file = new File([csvContent], "imeis.csv");
await uploadImeiCsv(file, "product-uuid");

// Validate IMEI before creating claim
const validation = await validateImei({ imei: "350234450950713" });
if (validation.data.valid) {
	// IMEI is valid and eligible
}

// Search for specific IMEI
const imeiDetails = await searchImei("350234450950713");
```

### Claims

```typescript
import {
	createClaim,
	getAllClaims,
	approveClaim,
	rejectClaim,
	completeClaim,
	authorizePayment,
} from "@/lib/api";

// Create claim (Engineer only)
await createClaim({
	imei: "350234450950713",
	customer_first_name: "John",
	customer_last_name: "Doe",
	customer_phone: "+2348012345678",
	repair_price: 25000,
	description: "Screen replacement",
});

// Get all claims with filters
const claims = await getAllClaims({
	status: ClaimStatus.PENDING,
	payment_status: PaymentStatus.UNPAID,
	service_center_id: "center-uuid",
});

// Approve claim (Partner only)
await approveClaim("claim-uuid", {
	notes: "Approved for processing",
});

// Reject claim (Partner only)
await rejectClaim("claim-uuid", {
	reason: "IMEI validation failed",
	notes: "Additional details",
});

// Complete claim (Engineer only)
await completeClaim("claim-uuid", {
	notes: "Repair completed successfully",
});

// Authorize payment (Partner only)
await authorizePayment("claim-uuid", {
	notes: "Authorized for payment",
});

// Get statistics
const stats = await getServiceCenterStatistics("center-uuid");
const storeStats = await getRepairStoreStatistics("store-uuid");
```

### Partners

```typescript
import { createPartner, getAllPartners, getMyPartnerProfile } from "@/lib/api";

// Create partner (Admin only)
await createPartner({
	name: "Jane Smith",
	email: "partner@samsung.com",
	phone: "+2348012345678",
	organization: "Samsung Nigeria",
});

// Get my partner profile
const profile = await getMyPartnerProfile();
```

### Audit

```typescript
import {
	getAllAuditLogs,
	getAuditStatistics,
	getAuditLogsByResource,
} from "@/lib/api";

// Get audit logs with filters
const logs = await getAllAuditLogs({
	resource_type: "claim",
	action: AuditAction.CLAIM_APPROVED,
	date_from: "2025-01-01",
	date_to: "2025-12-31",
});

// Get statistics
const stats = await getAuditStatistics("2025-01-01", "2025-12-31");

// Get logs for specific resource
const claimLogs = await getAuditLogsByResource("claim", "claim-uuid");
```

## 🎯 Available Types & Enums

```typescript
import type {
	// Response types
	BaseApiResponse,
	PaginatedResponse,
	PaginationParams,

	// Enums
	UserRole,
	UserStatus,
	ProductStatus,
	ClaimStatus,
	PaymentStatus,
	AuditAction,

	// Entity types
	User,
	Product,
	RepairStore,
	ServiceCenter,
	Engineer,
	Imei,
	Claim,
	Partner,
	AuditLog,
} from "@/lib/api";
```

### Common Enums

```typescript
// User Roles
UserRole.ADMIN;
UserRole.REPAIR_STORE_ADMIN;
UserRole.SERVICE_CENTER_ADMIN;
UserRole.ENGINEER;
UserRole.SAMSUNG_PARTNER;
UserRole.FINANCE;
UserRole.AUDITOR;

// User/Entity Status
UserStatus.ACTIVE;
UserStatus.SUSPENDED;
UserStatus.DISABLED;

// Product Status
ProductStatus.ACTIVE;
ProductStatus.INACTIVE;

// Claim Status
ClaimStatus.PENDING;
ClaimStatus.APPROVED;
ClaimStatus.REJECTED;
ClaimStatus.COMPLETED;
ClaimStatus.AUTHORIZED;

// Payment Status
PaymentStatus.UNPAID;
PaymentStatus.PAID;
```

## 🔐 Authentication Flow

The API automatically handles:

- ✅ JWT token management
- ✅ 401 unauthorized redirects
- ✅ Automatic cookie clearing on logout
- ✅ Password security checks
- ✅ Product key headers (Sapphire-Credit-Product)

## 📊 Response Format

All API responses follow this structure:

```typescript
interface BaseApiResponse<T> {
	statusCode: number; // HTTP status code
	statusType: string; // "success" | "error"
	message: string; // Human-readable message
	data: T; // Response data
	responseTime: string; // Server response time
	channel: string; // API channel identifier
}
```

## 🎨 Benefits

✅ **Type-Safe** - Full TypeScript support with auto-generated types  
✅ **Organized** - Domain-driven structure, easy to navigate  
✅ **Maintainable** - Changes isolated to specific domains  
✅ **Scalable** - Easy to add new endpoints  
✅ **Documented** - JSDoc comments on all functions  
✅ **Consistent** - All endpoints follow the same patterns  
✅ **Auto-Generated** - Matches Swagger spec exactly

## 🛠️ Adding New Endpoints

When the backend API changes:

1. **Get updated Swagger JSON**
2. **Regenerate the API layer** (or manually update the affected domain)
3. **Update types** in `shared/types.ts` if new enums/types added
4. **Test** the new endpoints

Example for a new domain:

```typescript
// lib/api/new-domain/index.ts
import { apiCall, BaseApiResponse } from "../shared";

export interface NewEntity {
	id: string;
	name: string;
}

export async function getNewEntities(): Promise<BaseApiResponse<NewEntity[]>> {
	return apiCall("/api/v1/new-domain", "GET");
}

// Then add to lib/api/index.ts:
export * from "./new-domain";
```

## 📝 Notes

- All API calls use `/api/v1/` prefix
- Authentication required for all endpoints except login/register
- Admin-only endpoints will return 403 if accessed by non-admin users
- Pagination defaults: page=1, limit=25
- All dates are in ISO 8601 format

## 🔗 Related Files

- **Backend API Spec**: `docs-json.json` (Swagger/OpenAPI)
- **Main API File**: `lib/api.ts`
- **Core Logic**: `lib/api/shared/apiCall.ts`
- **Type Definitions**: `lib/api/shared/types.ts`
