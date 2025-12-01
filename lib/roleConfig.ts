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
	// Admin
	ADMIN: "admin",

	// Samsung Sentinel roles
	REPAIR_STORE_ADMIN: "repair_store_admin",
	SERVICE_CENTER_ADMIN: "service_center_admin",
	ENGINEER: "engineer",
	SAMSUNG_PARTNER: "samsung_partner",

	// Finance & Audit
	FINANCE: "finance",
	AUDITOR: "auditor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ============================================================================
// ROLE BASE PATHS
// ============================================================================

export const ROLE_BASE_PATHS: Record<Role, string> = {
	// Admin
	[ROLES.ADMIN]: "/access/admin",

	// Samsung Sentinel roles
	[ROLES.REPAIR_STORE_ADMIN]: "/access/repair-store",
	[ROLES.SERVICE_CENTER_ADMIN]: "/access/service-center",
	[ROLES.ENGINEER]: "/access/service-center", // Engineers use service center path
	[ROLES.SAMSUNG_PARTNER]: "/access/samsung-partners",

	// Finance & Audit
	[ROLES.FINANCE]: "/access/finance",
	[ROLES.AUDITOR]: "/access/audit",
};

// ============================================================================
// ROLE SIDEBAR MAPPING
// ============================================================================

export type SidebarItemsKey =
	| "admin"
	| "serviceCenter"
	| "repairStore"
	| "samsungPartners"
	| "finance"
	| "audit";

export const ROLE_SIDEBAR_MAPPING: Record<Role, SidebarItemsKey> = {
	// Admin
	[ROLES.ADMIN]: "admin",

	// Samsung Sentinel roles
	[ROLES.REPAIR_STORE_ADMIN]: "repairStore",
	[ROLES.SERVICE_CENTER_ADMIN]: "serviceCenter",
	[ROLES.ENGINEER]: "serviceCenter", // Engineers use same sidebar as service center admin
	[ROLES.SAMSUNG_PARTNER]: "samsungPartners",

	// Finance & Audit
	[ROLES.FINANCE]: "finance",
	[ROLES.AUDITOR]: "audit",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the base path for a given role
 */
export function getRoleBasePath(role: string | undefined): string {
	if (!role) return "/access/admin"; // Default fallback
	// API returns lowercase roles, so don't convert to uppercase
	return ROLE_BASE_PATHS[role as Role] || "/access/admin";
}

/**
 * Get the sidebar items key for a given role
 */
export function getRoleSidebarKey(role: string): SidebarItemsKey {
	console.log("role sidebarkey was called with: ", role);
	// API returns lowercase roles, so don't convert to uppercase
	console.log("role sidebar mapping: ", ROLE_SIDEBAR_MAPPING[role as Role]);
	return ROLE_SIDEBAR_MAPPING[role as Role] || "admin";
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

	// Get the base path for the user's role
	const userBasePath = getRoleBasePath(role);

	// Check if the current path matches the user's base path
	const isUserPath =
		path === userBasePath || path.startsWith(userBasePath + "/");

	if (!isUserPath) {
		// Path doesn't belong to user's role, reject it
		return false;
	}

	// Additional check: ensure the path doesn't belong to a different role
	// This prevents users from accessing /access/admin/samsung-sentinel if they're repair_store_admin
	const allBasePaths = Object.values(ROLE_BASE_PATHS).filter(
		(p) => p !== userBasePath
	);
	for (const otherBasePath of allBasePaths) {
		// If the path starts with another role's base path, reject it
		if (path === otherBasePath || path.startsWith(otherBasePath + "/")) {
			return false;
		}
	}

	return true;
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
