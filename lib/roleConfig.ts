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
	// Admin hierarchy
	SUPER_ADMIN: "SUPER_ADMIN",
	ADMIN: "SUB_ADMIN",

	// Core roles
	SALES: "SALES",
	FINANCE: "FINANCE",
	INVENTORY: "INVENTORY",
	COLLECTION_ADMIN: "COLLECTION_ADMIN",
	COLLECTION_OFFICER: "COLLECTION_OFFICER",
	HR: "HR",
	AUDIT: "AUDIT",
	SUPPORT: "SUPPORT",
	SERVICE_CENTER: "SERVICE_CENTER",
	REPAIR_STORE: "REPAIR_STORE",
	SAMSUNG_PARTNERS: "SAMSUNG_PARTNERS",
	SCAN_PARTNER: "SCAN_PARTNER",

	// Aliases and variations
	DEVELOPER: "DEVELOPER",
	VERIFICATION: "VERIFICATION",
	VERIFICATION_OFFICER: "VERIFICATION_OFFICER",
	INVENTORY_MANAGER: "INVENTORY_MANAGER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ============================================================================
// ROLE BASE PATHS
// ============================================================================

export const ROLE_BASE_PATHS: Record<Role, string> = {
	// Admin hierarchy - IMPORTANT: ADMIN maps to sub-admin, SUPER_ADMIN maps to admin
	[ROLES.SUPER_ADMIN]: "/access/admin",
	[ROLES.ADMIN]: "/access/sub-admin",

	// Core roles
	[ROLES.SALES]: "/access/sales",
	[ROLES.FINANCE]: "/access/finance",
	[ROLES.INVENTORY]: "/access/inventory",
	[ROLES.COLLECTION_ADMIN]: "/access/collection-admin",
	[ROLES.COLLECTION_OFFICER]: "/access/collection-officer",
	[ROLES.HR]: "/access/hr",
	[ROLES.AUDIT]: "/access/audit",
	[ROLES.SUPPORT]: "/access/support",
	[ROLES.SERVICE_CENTER]: "/access/service-center",
	[ROLES.REPAIR_STORE]: "/access/repair-store",
	[ROLES.SAMSUNG_PARTNERS]: "/access/samsung-partners",
	[ROLES.SCAN_PARTNER]: "/access/scan-partner",

	// Aliases and variations
	[ROLES.DEVELOPER]: "/access/dev",
	[ROLES.VERIFICATION]: "/access/verify",
	[ROLES.VERIFICATION_OFFICER]: "/access/verify",
	[ROLES.INVENTORY_MANAGER]: "/access/inventory",
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
	| "repairStore"
	| "samsungPartners"
	| "scanPartner"
	| "verification"
	| "dev";

export const ROLE_SIDEBAR_MAPPING: Record<Role, SidebarItemsKey> = {
	// Admin hierarchy
	[ROLES.SUPER_ADMIN]: "admin",
	[ROLES.ADMIN]: "subAdmin",

	// Core roles
	[ROLES.SALES]: "sales",
	[ROLES.FINANCE]: "finance",
	[ROLES.INVENTORY]: "inventory",
	[ROLES.COLLECTION_ADMIN]: "collectionAdmin",
	[ROLES.COLLECTION_OFFICER]: "collectionOfficer",
	[ROLES.HR]: "hr",
	[ROLES.AUDIT]: "audit",
	[ROLES.SUPPORT]: "support",
	[ROLES.SERVICE_CENTER]: "serviceCenter",
	[ROLES.REPAIR_STORE]: "repairStore",
	[ROLES.SAMSUNG_PARTNERS]: "samsungPartners",
	[ROLES.SCAN_PARTNER]: "scanPartner",

	// Aliases and variations
	[ROLES.DEVELOPER]: "dev",
	[ROLES.VERIFICATION]: "verification", // Verification uses admin sidebar
	[ROLES.VERIFICATION_OFFICER]: "verification",
	[ROLES.INVENTORY_MANAGER]: "inventory",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the base path for a given role
 */
export function getRoleBasePath(role: string | undefined): string {
	if (!role) return "/access/admin"; // Default fallback
	const normalizedRole = role.toUpperCase() as Role;
	return ROLE_BASE_PATHS[normalizedRole] || "/access/admin";
}

/**
 * Get the sidebar items key for a given role
 */
export function getRoleSidebarKey(role: string): SidebarItemsKey {
	const normalizedRole = role.toUpperCase() as Role;
	return ROLE_SIDEBAR_MAPPING[normalizedRole] || "admin";
}

/**
 * Check if a path is valid for a given role
 */
export function isValidPathForRole(
	role: string | undefined,
	path: string
): boolean {
	if (!role) return false;

	// Settings is accessible to all roles
	if (path.startsWith("/access/settings")) {
		return true;
	}

	// Verify routes are accessible to all roles
	if (path.startsWith("/access/verify")) {
		return true;
	}

	const basePath = getRoleBasePath(role);
	// Allow exact match or subpaths
	return path === basePath || path.startsWith(basePath + "/");
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

/**
 * Available roles for debug dropdown
 */
export const DEBUG_AVAILABLE_ROLES = Object.keys(ROLE_BASE_PATHS).sort();

/**
 * Get dashboard URL for role (default page for that role)
 */
export function getRoleDashboard(role: string | undefined): string {
	return getRoleBasePath(role);
}

/**
 * Get the role from a URL path
 */
export function getRoleFromPath(path: string): string | null {
	const pathMappings = Object.entries(ROLE_BASE_PATHS);
	const found = pathMappings.find(([_, rolePath]) => path.startsWith(rolePath));
	return found ? found[0] : null;
}
