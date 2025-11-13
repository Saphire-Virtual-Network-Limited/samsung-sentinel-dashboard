/**
 * Sidebar Menu Items Configuration
 *
 * This file contains all sidebar menu definitions for each role.
 * Menu items are organized by role and can include dynamic permissions checks.
 *
 * When adding new menu items:
 * 1. Add them to the appropriate role's function
 * 2. Use the MenuItem type for type safety
 * 3. Include permission checks where needed
 * 4. Ensure URLs match the route structure
 */

import {
	Home,
	Users,
	Store,
	Package,
	Users2,
	Wrench,
	BarChart3,
	Shield,
	Receipt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { getRoleSidebarKey } from "@/lib/roleConfig";

// ============================================================================
// TYPES
// ============================================================================

export type SubItem = {
	title: string;
	url?: string;
	subItems?: SubItem[];
};

export type MenuItem = {
	title: string;
	icon: LucideIcon | IconType | React.FC<any>;
	url?: string;
	subItems?: SubItem[];
	id?: string;
};

export type SidebarItemsConfig = {
	admin: (options: MenuOptions) => MenuItem[];
	serviceCenter: (options: MenuOptions) => MenuItem[];
	samsungPartners: (options: MenuOptions) => MenuItem[];
	repairStore: (options: MenuOptions) => MenuItem[];
	finance: (options: MenuOptions) => MenuItem[];
	audit: (options: MenuOptions) => MenuItem[];
};

export type MenuOptions = {
	accessRole: string;
	userEmail?: string;
	selectedProduct?: string;
	hasPermission: (role: string, permission: string, email?: string) => boolean;
	canVerifyMobiflex?: boolean;
};

// ============================================================================
// ADMIN MENU ITEMS
// ============================================================================

export function getAdminItems(options: MenuOptions): MenuItem[] {
	const { hasPermission, accessRole, userEmail, selectedProduct } = options;

	return [...getAdminRootItems(options)];
}

function getAdminRootItems(options: MenuOptions): MenuItem[] {
	const { hasPermission, accessRole, userEmail } = options;

	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/admin/",
			id: "admin-dashboard",
		},
		{
			icon: Shield,
			title: "IMEI Management",
			url: "/access/admin/samsung-sentinel/imei",
			id: "admin-imei",
		},
		{
			icon: Package,
			title: "Products",
			url: "/access/admin/samsung-sentinel/products",
			id: "admin-products",
		},
		{
			icon: Store,
			title: "Repair Stores",
			url: "/access/admin/samsung-sentinel/repair-stores",
			id: "admin-repair-stores",
		},
		{
			icon: Users,
			title: "Service Centers",
			url: "/access/admin/samsung-sentinel/service-centers",
			id: "admin-service-centers",
		},
		{
			icon: Wrench,
			title: "Repairs & Claims",
			id: "admin-repairs-claims",
			subItems: [
				{
					title: "All Claims",
					url: "/access/admin/samsung-sentinel/claims?status=all",
				},
				{
					title: "Pending",
					url: "/access/admin/samsung-sentinel/claims?status=pending",
				},
				{
					title: "Approved",
					url: "/access/admin/samsung-sentinel/claims?status=approved",
				},
				{
					title: "Authorized",
					url: "/access/admin/samsung-sentinel/claims?status=authorized",
				},
				{
					title: "Completed",
					url: "/access/admin/samsung-sentinel/claims?status=completed",
				},
				{
					title: "Rejected",
					url: "/access/admin/samsung-sentinel/claims?status=rejected",
				},
			],
		},
		{
			icon: Receipt,
			title: "Payments",
			id: "admin-payments",
			subItems: [
				{
					title: "Unpaid",
					url: "/access/admin/samsung-sentinel/claims?payment=unpaid",
				},
				{
					title: "Paid",
					url: "/access/admin/samsung-sentinel/claims?payment=paid",
				},
			],
		},

		{
			icon: Users2,
			title: "User Management",
			url: "/access/admin/samsung-sentinel/users",
			id: "admin-users",
		},
	];
}

export function getServiceCenterItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/service-center/",
			id: "service-center-dashboard",
		},
		{
			icon: Wrench,
			title: "Repairs & Claims",
			id: "service-center-repairs",
			subItems: [
				{
					title: "All Claims",
					url: "/access/service-center/claims?status=all",
				},
				{
					title: "Pending",
					url: "/access/service-center/claims?status=pending",
				},
				{
					title: "In Progress",
					url: "/access/service-center/claims?status=in-progress",
				},
				{
					title: "Completed",
					url: "/access/service-center/claims?status=completed",
				},
			],
		},
	];
}

export function getSamsungPartnersItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/samsung-partners/",
			id: "samsung-partners-dashboard",
		},
		{
			icon: Wrench,
			title: "Repairs & Claims",
			id: "samsung-partners-claims",
			subItems: [
				{
					title: "All Claims",
					url: "/access/samsung-partners/claims?status=all",
				},
				{
					title: "Pending",
					url: "/access/samsung-partners/claims?status=pending",
				},
				{
					title: "Approved",
					url: "/access/samsung-partners/claims?status=approved",
				},
				{
					title: "Authorized",
					url: "/access/samsung-partners/claims?status=authorized",
				},
				{
					title: "Completed",
					url: "/access/samsung-partners/claims?status=completed",
				},
				{
					title: "Rejected",
					url: "/access/samsung-partners/claims?status=rejected",
				},
			],
		},
		{
			icon: Wrench,
			title: "Payment Management",
			id: "samsung-partners-payments",
			subItems: [
				{
					title: "Unpaid Repairs",
					url: "/access/samsung-partners/claims?status=authorized",
				},
				{
					title: "Paid Repairs",
					url: "/access/samsung-partners/claims?status=completed&payment=paid",
				},
			],
		},
	];
}

export function getRepairStoreItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/repair-store/",
			id: "repair-store-dashboard",
		},
		{
			icon: Shield,
			title: "Repair Store Management",
			id: "repair-store-management",
			subItems: [
				{
					title: "Service Centers",
					url: "/access/repair-store/service-centers",
				},
				{
					title: "Engineers",
					url: "/access/repair-store/engineers",
				},
				{
					title: "Repairs & Claims",
					subItems: [
						{
							title: "All Claims",
							url: "/access/repair-store/claims?status=all",
						},
						{
							title: "Pending",
							url: "/access/repair-store/claims?status=pending",
						},
						{
							title: "Approved",
							url: "/access/repair-store/claims?status=approved",
						},
						{
							title: "Completed",
							url: "/access/repair-store/claims?status=completed",
						},
						{
							title: "Rejected",
							url: "/access/repair-store/claims?status=rejected",
						},
					],
				},
				{
					title: "Payments",
					subItems: [
						{
							title: "Unpaid Repairs",
							url: "/access/repair-store/claims?status=completed&payment=unpaid",
						},
						{
							title: "Paid Repairs",
							url: "/access/repair-store/claims?status=completed&payment=paid",
						},
					],
				},
				{
					title: "Statistics",
					url: "/access/repair-store/statistics",
				},
			],
		},
	];
}

export function getScanPartnerItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/scan-partner/",
			id: "scan-partner-dashboard",
		},
	];
}

export function getFinanceItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/finance/",
			id: "finance-dashboard",
		},
		{
			icon: Receipt,
			title: "Payments",
			id: "finance-payments",
			subItems: [
				{
					title: "All Payments",
					url: "/access/finance/payments?status=all",
				},
				{
					title: "Pending",
					url: "/access/finance/payments?status=pending",
				},
				{
					title: "Completed",
					url: "/access/finance/payments?status=completed",
				},
			],
		},
		{
			icon: BarChart3,
			title: "Reports",
			url: "/access/finance/reports",
			id: "finance-reports",
		},
	];
}

export function getAuditItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/audit/",
			id: "audit-dashboard",
		},
		{
			icon: Shield,
			title: "Audit Logs",
			url: "/access/audit/logs",
			id: "audit-logs",
		},
		{
			icon: BarChart3,
			title: "Reports",
			url: "/access/audit/reports",
			id: "audit-reports",
		},
	];
}

// ============================================================================
// MAIN SIDEBAR ITEMS CONFIGURATION
// ============================================================================

export const sidebarItemsConfig: SidebarItemsConfig = {
	admin: getAdminItems,
	serviceCenter: getServiceCenterItems,
	samsungPartners: getSamsungPartnersItems,
	repairStore: getRepairStoreItems,
	finance: getFinanceItems,
	audit: getAuditItems,
};

/**
 * Get sidebar items for a specific role
 */
export function getSidebarItemsForRole(
	role: string,
	options: MenuOptions
): MenuItem[] {
	// Return empty array if no role is provided (e.g., during login/logout)
	if (!role || role.trim() === "") {
		return [];
	}

	// Use centralized role mapping from roleConfig.ts
	const sidebarKey = getRoleSidebarKey(role);

	if (!sidebarKey || !(sidebarKey in sidebarItemsConfig)) {
		console.warn(`Unknown role "${role}", no sidebar items available`);
		return [];
	}

	const getItems = sidebarItemsConfig[sidebarKey as keyof SidebarItemsConfig];

	return getItems ? getItems(options) : [];
}
