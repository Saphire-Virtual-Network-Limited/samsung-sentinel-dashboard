/**
 * Centralized Role Configuration
 *
 * This file serves as the single source of truth for all role-related configuration:
 * - Role definitions and their base paths
 * - Role-to-sidebar-items mapping
 * - Role validation and routing logic
 *
 * When adding a new role:
 * 1. Add the role to the ROLES constant
 * 2. Add its base path to ROLE_BASE_PATHS
 * 3. Add its sidebar items key to ROLE_SIDEBAR_MAPPING
 * 4. Define its sidebar items in sidebarItems.ts
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLES = {
	ADMIN: "ADMIN",
	SUB_ADMIN: "SUB_ADMIN",
	SALES: "SALES",
	FINANCE: "FINANCE",
	INVENTORY: "INVENTORY",
	COLLECTION_ADMIN: "COLLECTION_ADMIN",
	COLLECTION_OFFICER: "COLLECTION_OFFICER",
	HR: "HR",
	AUDIT: "AUDIT",
	SUPPORT: "SUPPORT",
	SERVICE_CENTER: "SERVICE_CENTER",
	SAMSUNG_PARTNERS: "SAMSUNG_PARTNERS",
	SCAN_PARTNER: "SCAN_PARTNER",
	DEV: "DEV",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ============================================================================
// ROLE BASE PATHS
// ============================================================================

export const ROLE_BASE_PATHS: Record<Role, string> = {
	[ROLES.ADMIN]: "/access/admin",
	[ROLES.SUB_ADMIN]: "/access/sub-admin",
	[ROLES.SALES]: "/access/sales",
	[ROLES.FINANCE]: "/access/finance",
	[ROLES.INVENTORY]: "/access/inventory",
	[ROLES.COLLECTION_ADMIN]: "/access/collection-admin",
	[ROLES.COLLECTION_OFFICER]: "/access/collection-officer",
	[ROLES.HR]: "/access/hr",
	[ROLES.AUDIT]: "/access/audit",
	[ROLES.SUPPORT]: "/access/support",
	[ROLES.SERVICE_CENTER]: "/access/service-center",
	[ROLES.SAMSUNG_PARTNERS]: "/access/samsung-partners",
	[ROLES.SCAN_PARTNER]: "/access/scan-partner",
	[ROLES.DEV]: "/access/dev",
};

// ============================================================================
// ROLE SIDEBAR MAPPING
// ============================================================================

export type SidebarItemsKey =
	| "admin"
	| "subAdmin"
	| "sales"
	| "finance"
	| "inventory"
	| "collectionAdmin"
	| "collectionOfficer"
	| "hr"
	| "audit"
	| "support"
	| "serviceCenter"
	| "samsungPartners"
	| "scanPartner"
	| "dev";

export const ROLE_SIDEBAR_MAPPING: Record<Role, SidebarItemsKey> = {
	[ROLES.ADMIN]: "admin",
	[ROLES.SUB_ADMIN]: "subAdmin",
	[ROLES.SALES]: "sales",
	[ROLES.FINANCE]: "finance",
	[ROLES.INVENTORY]: "inventory",
	[ROLES.COLLECTION_ADMIN]: "collectionAdmin",
	[ROLES.COLLECTION_OFFICER]: "collectionOfficer",
	[ROLES.HR]: "hr",
	[ROLES.AUDIT]: "audit",
	[ROLES.SUPPORT]: "support",
	[ROLES.SERVICE_CENTER]: "serviceCenter",
	[ROLES.SAMSUNG_PARTNERS]: "samsungPartners",
	[ROLES.SCAN_PARTNER]: "scanPartner",
	[ROLES.DEV]: "dev",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the base path for a given role
 */
export function getRoleBasePath(role: string): string {
	return ROLE_BASE_PATHS[role as Role] || "/access/admin";
}

/**
 * Get the sidebar items key for a given role
 */
export function getRoleSidebarKey(role: string): SidebarItemsKey {
	return ROLE_SIDEBAR_MAPPING[role as Role] || "admin";
}

/**
 * Check if a path is valid for a given role
 */
export function isValidPathForRole(role: string, path: string): boolean {
	// Settings is accessible to all roles
	if (path.startsWith("/access/settings")) {
		return true;
	}

	// Verify routes are accessible to all roles
	if (path.startsWith("/access/verify")) {
		return true;
	}

	const basePath = getRoleBasePath(role);
	return path.startsWith(basePath);
}

/**
 * Get all available roles for debug mode
 */
export function getAvailableRoles(): Role[] {
	return Object.values(ROLES);
}

/**
 * Get role display name (formatted for UI)
 */
export function getRoleDisplayName(role: string): string {
	return role
		.split("_")
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Validate if a string is a valid role
 */
export function isValidRole(role: string): role is Role {
	return Object.values(ROLES).includes(role as Role);
}
