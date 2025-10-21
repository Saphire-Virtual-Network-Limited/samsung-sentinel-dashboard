/**
 * Role Mapping Configuration
 * Centralizes role to URL path mapping for better maintainability
 */

export const ROLE_MAPPINGS = {
	// Admin roles
	SUPER_ADMIN: "/access/admin",
	ADMIN: "/access/sub-admin",

	// Core roles
	SALES: "/access/sales",
	FINANCE: "/access/finance",
	DEVELOPER: "/access/dev",
	DEV: "/access/dev",
	AUDIT: "/access/audit",
	SUPPORT: "/access/support",

	// Verification roles
	VERIFICATION: "/access/verify",
	VERIFICATION_OFFICER: "/access/verify",
	VERIFY: "/access/verify",

	// Collection roles
	COLLECTION_ADMIN: "/access/collection-admin",
	COLLECTION_OFFICER: "/access/collection-officer",

	// Service roles
	SCAN_PARTNER: "/access/scan-partner",
	SERVICE_CENTER: "/access/service-center",
	SAMSUNG_PARTNERS: "/access/samsung-partners",
	SAMSUNG_PARTNER: "/access/samsung-partners",

	// HR role
	HUMAN_RESOURCE: "/access/hr",
	HR: "/access/hr",

	// Inventory
	INVENTORY_MANAGER: "/access/inventory",
	INVENTORY: "/access/inventory",
} as const;

export type RoleKey = keyof typeof ROLE_MAPPINGS;
export type RolePath = (typeof ROLE_MAPPINGS)[RoleKey];

/**
 * Get the URL path for a given role
 * @param role - The user role
 * @returns The corresponding URL path or default dashboard
 */
export const getRoleBasePath = (role: string | undefined): string => {
	if (!role) return "/access/admin"; // Default fallback

	const normalizedRole = role.toUpperCase() as RoleKey;
	return ROLE_MAPPINGS[normalizedRole] || "/access/admin";
};

/**
 * Get the role from a URL path
 * @param path - The URL path
 * @returns The corresponding role or null
 */
export const getRoleFromPath = (path: string): string | null => {
	const pathMappings = Object.entries(ROLE_MAPPINGS);
	const found = pathMappings.find(([_, rolePath]) => path.startsWith(rolePath));
	return found ? found[0] : null;
};

/**
 * Check if a path is valid for a role
 * @param role - The user role
 * @param path - The URL path to check
 * @returns True if the path is valid for the role
 */
export const isValidPathForRole = (
	role: string | undefined,
	path: string
): boolean => {
	if (!role) return false;

	const normalizedRole = role.toUpperCase() as RoleKey;
	const basePath = ROLE_MAPPINGS[normalizedRole];

	if (!basePath) return false;

	// Allow exact match or subpaths
	return path === basePath || path.startsWith(basePath + "/");
};

/**
 * Available roles for debug dropdown
 */
export const DEBUG_AVAILABLE_ROLES = Object.keys(ROLE_MAPPINGS).sort();

/**
 * Get dashboard URL for role (default page for that role)
 * @param role - The user role
 * @returns The dashboard URL for the role
 */
export const getRoleDashboard = (role: string | undefined): string => {
	return getRoleBasePath(role);
};
