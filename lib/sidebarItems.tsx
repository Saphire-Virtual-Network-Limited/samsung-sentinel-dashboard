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
	Settings,
	ChartBar,
	Store,
	Package2Icon,
	Users2,
	CreditCard,
	UserCheck,
	BriefcaseBusiness,
	ClipboardCheckIcon,
	Wrench,
	BarChart3,
	LayoutDashboard,
	IdCard,
	Receipt,
	Package,
	MessageSquare,
	CheckCircle,
	XCircle,
	FileText,
	Shield,
} from "lucide-react";
import { IoLogoAndroid, IoLogoApple, IoBusiness } from "react-icons/io5";
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
	subAdmin: (options: MenuOptions) => MenuItem[];

	serviceCenter: (options: MenuOptions) => MenuItem[];
	samsungPartners: (options: MenuOptions) => MenuItem[];

	repairStore: (options: MenuOptions) => MenuItem[];
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
			icon: CreditCard,
			title: "Loans",
			id: "admin-loans",
			subItems: [
				{
					title: "All Loans",
					url: "/access/admin/loans/loans",
				},
				{
					title: "Repayment",
					url: "/access/admin/loans/repayment",
				},
			],
		},
		{
			icon: Users,
			title: "Customers",
			url: "/access/admin/customers",
			id: "admin-customers",
		},
		{
			icon: UserCheck,
			title: "Verification",
			id: "admin-referees",
			subItems: [
				{
					title: "Pending",
					url: "/access/admin/referees/unapproved-referees",
				},
				{
					title: "Approved",
					url: "/access/admin/referees/approved-referees",
				},
				{
					title: "Rejected",
					url: "/access/admin/referees/rejected-referees",
				},
			],
		},
		{
			icon: Store,
			title: "Stores",
			url: "/access/admin/stores",
			id: "admin-stores",
		},
		...(hasPermission(accessRole, "canSendSms", userEmail)
			? [
					{
						icon: MessageSquare,
						title: "SMS",
						url: "/access/admin/sms",
						id: "admin-sms",
					},
			  ]
			: []),
		{
			icon: IoBusiness,
			title: "Staff",
			url: "/access/admin/staff",
			id: "admin-staff",
			subItems: [
				{
					title: "Mobiflex Sales Agent",
					url: "/access/admin/staff/agents",
				},
				{
					title: "MBE",
					url: "/access/admin/staff/mbe",
				},
				{
					title: "SCAN Partners",
					url: "/access/admin/staff/scan-partners",
				},
			],
		},
		{
			icon: ChartBar,
			title: "Reports",
			id: "admin-reports",
			subItems: [
				{
					title: "Sales",
					subItems: [
						{
							title: "Overview",
							url: "/access/admin/reports/sales/overview",
						},
						{
							title: "MBE Report",
							url: "/access/admin/reports/sales/mbe",
						},
						{
							title: "Samsung Report",
							url: "/access/admin/reports/sales/samsung",
						},
						{
							title: "Xiaomi Report",
							url: "/access/admin/reports/sales/xiaomi",
						},
						{
							title: "Oppo Report",
							url: "/access/admin/reports/sales/oppo",
						},
						{
							title: "Sentinel Report",
							url: "/access/admin/reports/sales/sentinel",
						},
						{
							title: "Low Downpayment",
							url: "/access/admin/reports/sales/low-downpayment",
						},
						{
							title: "Mobiflex Report",
							url: "/access/admin/reports/mobiflex",
						},
					],
				},
				{
					title: "Commissions",
					url: "/access/admin/reports/commissions",
				},
				{ title: "Drop-offs", url: "/access/admin/reports/drop-offs" },
				{ title: "Tracker", url: "/access/admin/reports/tracker" },
			],
		},
		{
			icon: Users2,
			title: "Users",
			id: "admin-users",
			url: "/access/admin/users/",
		},
		{
			icon: CreditCard,
			title: "Payout Scheduler",
			url: "/access/admin/payout-scheduler",
			id: "admin-payout-scheduler",
		},
		{
			icon: Package2Icon,
			title: "Inventory",
			id: "admin-inventory",
			subItems: [
				{ title: "Devices", url: "/access/admin/inventory/devices" },
				{ title: "TVs", url: "/access/admin/inventory/tvs" },
				{ title: "Solar", url: "/access/admin/inventory/solar" },
			],
		},
		{
			icon: Shield,
			title: "Samsung Sentinel",
			id: "admin-samsung-sentinel",
			subItems: [
				{
					title: "IMEI Management",
					url: "/access/admin/samsung-sentinel/imei",
				},
				{
					title: "Products",
					url: "/access/admin/samsung-sentinel/products",
				},
				{
					title: "Repair Store",
					url: "/access/admin/repair-centers",
				},
				{
					title: "Repairs & Claims",
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
							title: "In Progress",
							url: "/access/admin/samsung-sentinel/claims?status=in-progress",
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
					title: "Payments",
					subItems: [
						{
							title: "Unpaid Repairs",
							url: "/access/admin/samsung-sentinel/claims?status=completed&payment=unpaid",
						},
						{
							title: "Paid Repairs",
							url: "/access/admin/samsung-sentinel/claims?status=completed&payment=paid",
						},
					],
				},
				{
					title: "Statistics",
					url: "/access/admin/samsung-sentinel/statistics",
				},
			],
		},
		{
			icon: Package2Icon,
			title: "PowerFlex",
			id: "admin-powerflex",
			url: "/access/admin/powerflex",
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
					title: "In Progress",
					url: "/access/samsung-partners/claims?status=in-progress",
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
					url: "/access/samsung-partners/claims?status=completed&payment=unpaid",
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
							title: "In Progress",
							url: "/access/repair-store/claims?status=in-progress",
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

// ============================================================================
// MAIN SIDEBAR ITEMS CONFIGURATION
// ============================================================================

export const sidebarItemsConfig: SidebarItemsConfig = {
	admin: getAdminItems,
	subAdmin: getAdminItems,

	serviceCenter: getServiceCenterItems,
	samsungPartners: getSamsungPartnersItems,
	repairStore: getRepairStoreItems,
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
