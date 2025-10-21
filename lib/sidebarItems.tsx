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
	FileText,
	Shield,
} from "lucide-react";
import { IoLogoAndroid, IoLogoApple, IoBusiness } from "react-icons/io5";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

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
	sales: (options: MenuOptions) => MenuItem[];
	finance: (options: MenuOptions) => MenuItem[];
	inventory: (options: MenuOptions) => MenuItem[];
	collectionAdmin: (options: MenuOptions) => MenuItem[];
	collectionOfficer: (options: MenuOptions) => MenuItem[];
	hr: (options: MenuOptions) => MenuItem[];
	audit: (options: MenuOptions) => MenuItem[];
	support: (options: MenuOptions) => MenuItem[];
	serviceCenter: (options: MenuOptions) => MenuItem[];
	samsungPartners: (options: MenuOptions) => MenuItem[];
	scanPartner: (options: MenuOptions) => MenuItem[];
	dev: (options: MenuOptions) => MenuItem[];
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

	// Different menu structure based on selected product
	if (selectedProduct === "Creditflex") {
		return getAdminCreditflexItems(options);
	}

	return [
		...getAdminRootItems(options),
		...getAdminRelayItems(options),
		...getAdminAndroidItems(options),
	];
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
					title: "Service Centers",
					url: "/access/admin/samsung-sentinel/service-centers",
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

function getAdminAndroidItems(options: MenuOptions): MenuItem[] {
	const { canVerifyMobiflex } = options;

	const verifyMenuItem = canVerifyMobiflex
		? [
				{
					title: "Verify",
					url: "/access/verify/",
				},
		  ]
		: [];

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
					title: "Mobiflex",
					url: "/access/admin/loans/mobiflex",
				},
				{
					title: "Powerflex",
					url: "/access/admin/loans/powerflex",
				},
				{
					title: "Creditflex",
					url: "/access/admin/loans/creditflex",
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
				...verifyMenuItem,
			],
		},
		{
			icon: Store,
			title: "Stores",
			url: "/access/admin/stores",
			id: "admin-stores",
		},
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
			icon: Package2Icon,
			title: "Inventory",
			id: "admin-inventory",
			subItems: [
				{ title: "Devices", url: "/access/admin/inventory/devices" },
				{ title: "TVs", url: "/access/admin/inventory/tvs" },
				{ title: "Solar", url: "/access/admin/inventory/solar" },
			],
		},
	];
}

function getAdminRelayItems(options: MenuOptions): MenuItem[] {
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
			icon: Store,
			title: "Stores",
			url: "/access/admin/stores",
			id: "admin-stores",
		},
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
			icon: Package2Icon,
			title: "Inventory",
			id: "admin-inventory",
			subItems: [
				{ title: "Devices", url: "/access/admin/inventory/devices" },
				{ title: "TVs", url: "/access/admin/inventory/tvs" },
				{ title: "Solar", url: "/access/admin/inventory/solar" },
			],
		},
	];
}

function getAdminCreditflexItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/admin/",
			id: "admin-dashboard",
		},
		{
			icon: CreditCard,
			title: "Customers",
			id: "admin-creditflex-customers",
			subItems: [
				{
					title: "Leads",
					url: "/access/admin/creditflex/leads",
				},
				{
					title: "Qualified",
					url: "/access/admin/creditflex/qualified",
				},
				{
					title: "Active Loan",
					url: "/access/admin/creditflex/active-loan",
				},
			],
		},
		{
			icon: ChartBar,
			title: "Reports",
			id: "admin-creditflex-reports",
			subItems: [
				{
					title: "Overview",
					url: "/access/admin/creditflex/reports/overview",
				},
			],
		},
		{
			icon: IoBusiness,
			title: "Staff",
			url: "/access/admin/staff",
			id: "admin-staff",
			subItems: [
				{
					title: "Credit Officers",
					url: "/access/admin/staff/credit-officers",
				},
			],
		},
	];
}

// ============================================================================
// SUB-ADMIN MENU ITEMS
// ============================================================================

export function getSubAdminItems(options: MenuOptions): MenuItem[] {
	const { selectedProduct } = options;

	if (selectedProduct === "Creditflex") {
		return getSubAdminCreditflexItems(options);
	}

	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/sub-admin/",
			id: "sub-admin-dashboard",
		},
		{
			icon: CreditCard,
			title: "Loans",
			id: "sub-admin-loans",
			subItems: [
				{
					title: "All Loans",
					url: "/access/sub-admin/loans/loans",
				},
				{
					title: "Repayment",
					url: "/access/sub-admin/loans/repayment",
				},
			],
		},
		{
			icon: Users,
			title: "Customers",
			url: "/access/sub-admin/customers",
			id: "sub-admin-customers",
		},
		{
			icon: UserCheck,
			title: "Verification",
			id: "sub-admin-referees",
			subItems: [
				{
					title: "Pending",
					url: "/access/sub-admin/referees/unapproved-referees",
				},
				{
					title: "Approved",
					url: "/access/sub-admin/referees/approved-referees",
				},
				{
					title: "Rejected",
					url: "/access/sub-admin/referees/rejected-referees",
				},
			],
		},
		{
			icon: Store,
			title: "Stores",
			url: "/access/sub-admin/stores",
			id: "sub-admin-stores",
		},
		{
			icon: IoBusiness,
			title: "Staff",
			url: "/access/sub-admin/staff",
			id: "sub-admin-staff",
			subItems: [
				{
					title: "Mobiflex Sales Agent",
					url: "/access/sub-admin/staff/agents",
				},
				{
					title: "MBE",
					url: "/access/sub-admin/staff/mbe",
				},
				{
					title: "SCAN Partners",
					url: "/access/sub-admin/staff/scan-partners",
				},
			],
		},
		{
			icon: ChartBar,
			title: "Reports",
			id: "sub-admin-reports",
			subItems: [
				{
					title: "Sales",
					subItems: [
						{
							title: "Overview",
							url: "/access/sub-admin/reports/sales/overview",
						},
						{
							title: "MBE Report",
							url: "/access/sub-admin/reports/sales/mbe",
						},
						{
							title: "Samsung Report",
							url: "/access/sub-admin/reports/sales/samsung",
						},
						{
							title: "Xiaomi Report",
							url: "/access/sub-admin/reports/sales/xiaomi",
						},
						{
							title: "Oppo Report",
							url: "/access/sub-admin/reports/sales/oppo",
						},
						{
							title: "Sentinel Report",
							url: "/access/sub-admin/reports/sales/sentinel",
						},
						{
							title: "Mobiflex Report",
							url: "/access/sub-admin/reports/mobiflex",
						},
					],
				},
				{
					title: "Commissions",
					url: "/access/sub-admin/reports/commissions",
				},
				{ title: "Drop-offs", url: "/access/sub-admin/reports/drop-offs" },
				{ title: "Tracker", url: "/access/sub-admin/reports/tracker" },
			],
		},
		{
			icon: Package2Icon,
			title: "Inventory",
			id: "sub-admin-inventory",
			subItems: [
				{ title: "Devices", url: "/access/sub-admin/inventory/devices" },
				{ title: "TVs", url: "/access/sub-admin/inventory/tvs" },
				{ title: "Solar", url: "/access/sub-admin/inventory/solar" },
			],
		},
		{
			icon: Shield,
			title: "Samsung Sentinel",
			id: "sub-admin-samsung-sentinel",
			subItems: [
				{
					title: "IMEI Management",
					url: "/access/sub-admin/samsung-sentinel/imei",
				},
				{
					title: "Products",
					url: "/access/sub-admin/samsung-sentinel/products",
				},
				{
					title: "Service Centers",
					url: "/access/sub-admin/samsung-sentinel/service-centers",
				},
				{
					title: "Repairs & Claims",
					subItems: [
						{
							title: "All Claims",
							url: "/access/sub-admin/samsung-sentinel/claims?status=all",
						},
						{
							title: "Pending",
							url: "/access/sub-admin/samsung-sentinel/claims?status=pending",
						},
						{
							title: "Approved",
							url: "/access/sub-admin/samsung-sentinel/claims?status=approved",
						},
						{
							title: "In Progress",
							url: "/access/sub-admin/samsung-sentinel/claims?status=in-progress",
						},
						{
							title: "Completed",
							url: "/access/sub-admin/samsung-sentinel/claims?status=completed",
						},
						{
							title: "Rejected",
							url: "/access/sub-admin/samsung-sentinel/claims?status=rejected",
						},
					],
				},
				{
					title: "Payments",
					subItems: [
						{
							title: "Unpaid Repairs",
							url: "/access/sub-admin/samsung-sentinel/claims?status=completed&payment=unpaid",
						},
						{
							title: "Paid Repairs",
							url: "/access/sub-admin/samsung-sentinel/claims?status=completed&payment=paid",
						},
					],
				},
				{
					title: "Statistics",
					url: "/access/sub-admin/samsung-sentinel/statistics",
				},
			],
		},
	];
}

function getSubAdminCreditflexItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/sub-admin/",
			id: "sub-admin-dashboard",
		},
		{
			icon: CreditCard,
			title: "Customers",
			id: "sub-admin-creditflex-customers",
			subItems: [
				{
					title: "Leads",
					url: "/access/sub-admin/creditflex/leads",
				},
				{
					title: "Qualified",
					url: "/access/sub-admin/creditflex/qualified",
				},
				{
					title: "Active Loan",
					url: "/access/sub-admin/creditflex/active-loan",
				},
			],
		},
		{
			icon: ChartBar,
			title: "Reports",
			id: "sub-admin-creditflex-reports",
			subItems: [
				{
					title: "Overview",
					url: "/access/sub-admin/creditflex/reports/overview",
				},
			],
		},
	];
}

// ============================================================================
// SALES MENU ITEMS
// ============================================================================

export function getSalesItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/sales/",
			id: "sales-dashboard",
		},
		{
			title: "Report Sales",
			icon: ClipboardCheckIcon,
			url: "/access/sales/report-sales",
			id: "report-sales",
			subItems: [
				{
					title: "Accessories Sales",
					url: "/access/sales/report-sales/accessories-sales",
				},
				{
					title: "Accessories Trade-In",
					url: "/access/sales/report-sales/accessories-trade-in",
				},
				{ title: "Devices", url: "/access/sales/report-sales/devices" },
			],
		},
		{
			icon: BriefcaseBusiness,
			title: "Activities",
			id: "finance-stores",
			subItems: [
				{
					title: "Activation OTP",
					url: "/access/sales/activities/activation-otp",
				},
				{
					title: "Approved",
					url: "/access/sales/referees/approved-referees",
				},
				{
					title: "Rejected",
					url: "/access/sales/referees/rejected-referees",
				},
			],
		},
		{
			icon: IoLogoAndroid,
			title: "Android Tools",
			id: "android-tools",
			subItems: [
				{
					title: "Android Activation",
					url: "/access/sales/android-tools/android-activation",
				},
				{
					title: "Approved",
					url: "/access/sales/referees/approved-referees",
				},
				{
					title: "Rejected",
					url: "/access/sales/referees/rejected-referees",
				},
			],
		},
		{
			icon: IoLogoApple,
			title: "IOS Tools",
			id: "ios-tools",
			subItems: [
				{
					title: "IOS Activation",
					url: "/access/sales/ios-tools/ios-activation",
				},
				{
					title: "Approved",
					url: "/access/sales/referees/approved-referees",
				},
				{
					title: "Rejected",
					url: "/access/sales/referees/rejected-referees",
				},
			],
		},
		{
			icon: ChartBar,
			title: "Reports",
			id: "sales-reports",
			subItems: [
				{
					title: "Sales",
					subItems: [
						{ title: "Overview", url: "/access/sales/reports/sales/overview" },
						{ title: "MBE Report", url: "/access/sales/reports/sales/mbe" },
						{
							title: "Samsung Report",
							url: "/access/sales/reports/sales/samsung",
						},
						{
							title: "Xiaomi Report",
							url: "/access/sales/reports/sales/xiaomi",
						},
						{ title: "Oppo Report", url: "/access/sales/reports/sales/oppo" },
						{
							title: "Sentinel Report",
							url: "/access/sales/reports/sales/sentinel",
						},
						{ title: "Mobiflex Report", url: "/access/sales/reports/mobiflex" },
					],
				},
				{ title: "Drop-offs", url: "/access/sales/reports/drop-offs" },
				{ title: "Tracker", url: "/access/sales/reports/tracker" },
			],
		},
		{
			icon: Package2Icon,
			title: "Inventory",
			id: "sales-inventory",
			subItems: [
				{ title: "Devices", url: "/access/sales/inventory/devices" },
				{ title: "TVs", url: "/access/sales/inventory/tvs" },
			],
		},
	];
}

// ============================================================================
// DEVELOPER MENU ITEMS
// ============================================================================

export function getDeveloperItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/dev/",
			id: "dev-dashboard",
		},
		{
			icon: CreditCard,
			title: "Loans",
			id: "dev-loans",
			subItems: [
				{
					title: "All Loans",
					url: "/access/dev/loans/loans",
				},
				{
					title: "Repayment",
					url: "/access/dev/loans/repayment",
				},
			],
		},
		{
			icon: Users,
			title: "Customers",
			url: "/access/dev/customers",
			id: "dev-customers",
		},
		{
			icon: UserCheck,
			title: "Verification",
			id: "dev-referees",
			subItems: [
				{
					title: "Pending",
					url: "/access/dev/referees/unapproved-referees",
				},
				{
					title: "Approved",
					url: "/access/dev/referees/approved-referees",
				},
				{
					title: "Rejected",
					url: "/access/dev/referees/rejected-referees",
				},
			],
		},
		{
			icon: Store,
			title: "Stores",
			url: "/access/dev/stores",
			id: "dev-stores",
		},
		{
			icon: IoBusiness,
			title: "Staff",
			url: "/access/dev/staff",
			id: "dev-staff",
			subItems: [
				{
					title: "Mobiflex Sales Agent",
					url: "/access/dev/staff/agents",
				},
				{
					title: "MBE",
					url: "/access/dev/staff/mbe",
				},
				{
					title: "SCAN Partners",
					url: "/access/dev/staff/scan-partners",
				},
			],
		},
		{
			icon: ChartBar,
			title: "Reports",
			id: "dev-reports",
			subItems: [
				{
					title: "Sales",
					subItems: [
						{
							title: "Overview",
							url: "/access/dev/reports/sales/overview",
						},
						{
							title: "MBE Report",
							url: "/access/dev/reports/sales/mbe",
						},
						{
							title: "Samsung Report",
							url: "/access/dev/reports/sales/samsung",
						},
						{
							title: "Xiaomi Report",
							url: "/access/dev/reports/sales/xiaomi",
						},
						{
							title: "Oppo Report",
							url: "/access/dev/reports/sales/oppo",
						},
						{
							title: "Sentinel Report",
							url: "/access/dev/reports/sales/sentinel",
						},
						{
							title: "Mobiflex Report",
							url: "/access/dev/reports/mobiflex",
						},
					],
				},
				{
					title: "Commissions",
					url: "/access/dev/reports/commissions",
				},
				{ title: "Drop-offs", url: "/access/dev/reports/drop-offs" },
				{ title: "Tracker", url: "/access/dev/reports/tracker" },
			],
		},
		{
			icon: Users2,
			title: "Users",
			id: "dev-users",
			url: "/access/dev/users/",
		},
		{
			icon: Package2Icon,
			title: "Inventory",
			id: "dev-inventory",
			subItems: [
				{ title: "Devices", url: "/access/dev/inventory/devices" },
				{ title: "TVs", url: "/access/dev/inventory/tvs" },
				{ title: "Solar", url: "/access/dev/inventory/solar" },
			],
		},
	];
}

// ============================================================================
// OTHER ROLE MENU ITEMS (Simplified versions - you can expand these)
// ============================================================================

export function getFinanceItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/finance/",
			id: "finance-dashboard",
		},
		{
			icon: CreditCard,
			title: "Loans",
			id: "finance-loans",
			subItems: [
				{
					title: "All Loans",
					url: "/access/finance/loans/loans",
				},
				{
					title: "Repayment",
					url: "/access/finance/loans/repayment",
				},
			],
		},
		{
			icon: Users,
			title: "Customers",
			url: "/access/finance/customers",
			id: "finance-customers",
		},
		{
			icon: Store,
			title: "Stores",
			url: "/access/finance/stores",
			id: "finance-stores",
		},
		{
			icon: ChartBar,
			title: "Reports",
			id: "finance-reports",
			subItems: [
				{
					title: "Overview",
					url: "/access/finance/reports/overview",
				},
				{
					title: "Collections",
					url: "/access/finance/reports/collections",
				},
			],
		},
	];
}

export function getInventoryItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/inventory/",
			id: "inventory-dashboard",
		},
		{
			icon: Package2Icon,
			title: "Inventory",
			id: "inventory-management",
			subItems: [
				{ title: "Devices", url: "/access/inventory/devices" },
				{ title: "TVs", url: "/access/inventory/tvs" },
				{ title: "Solar", url: "/access/inventory/solar" },
			],
		},
	];
}

export function getCollectionAdminItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/collection-admin/",
			id: "collection-admin-dashboard",
		},
		{
			icon: CreditCard,
			title: "Collections",
			id: "collection-admin-collections",
			subItems: [
				{
					title: "All Collections",
					url: "/access/collection-admin/collections",
				},
				{
					title: "Overdue",
					url: "/access/collection-admin/collections/overdue",
				},
			],
		},
		{
			icon: Users,
			title: "Customers",
			url: "/access/collection-admin/customers",
			id: "collection-admin-customers",
		},
	];
}

export function getCollectionOfficerItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/collection-officer/",
			id: "collection-officer-dashboard",
		},
		{
			icon: CreditCard,
			title: "Collections",
			id: "collection-officer-collections",
			subItems: [
				{
					title: "My Collections",
					url: "/access/collection-officer/collections",
				},
				{
					title: "Overdue",
					url: "/access/collection-officer/collections/overdue",
				},
			],
		},
	];
}

export function getHRItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/hr/",
			id: "hr-dashboard",
		},
		{
			icon: Users2,
			title: "Staff",
			url: "/access/hr/staff",
			id: "hr-staff",
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
			icon: FileText,
			title: "Audit Logs",
			url: "/access/audit/logs",
			id: "audit-logs",
		},
	];
}

export function getSupportItems(options: MenuOptions): MenuItem[] {
	return [
		{
			title: "Dashboard",
			icon: Home,
			url: "/access/support/",
			id: "support-dashboard",
		},
		{
			icon: MessageSquare,
			title: "Tickets",
			url: "/access/support/tickets",
			id: "support-tickets",
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
			title: "Repairs",
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

export function getScanPartnerItems(options: MenuOptions): MenuItem[] {
	return [
		{
			icon: IoBusiness,
			title: "Profile",
			url: "/access/scan-partner/profile",
			id: "scan-partner-profile",
		},
	];
}

// ============================================================================
// MAIN SIDEBAR ITEMS CONFIGURATION
// ============================================================================

export const sidebarItemsConfig: SidebarItemsConfig = {
	admin: getAdminItems,
	subAdmin: getSubAdminItems,
	sales: getSalesItems,
	finance: getFinanceItems,
	inventory: getInventoryItems,
	collectionAdmin: getCollectionAdminItems,
	collectionOfficer: getCollectionOfficerItems,
	hr: getHRItems,
	audit: getAuditItems,
	support: getSupportItems,
	serviceCenter: getServiceCenterItems,
	samsungPartners: getSamsungPartnersItems,
	scanPartner: getScanPartnerItems,
	dev: getDeveloperItems,
};

/**
 * Get sidebar items for a specific role
 */
export function getSidebarItemsForRole(
	role: string,
	options: MenuOptions
): MenuItem[] {
	// Map role to sidebar key
	const roleMapping: Record<string, keyof SidebarItemsConfig> = {
		SUPER_ADMIN: "admin",
		ADMIN: "subAdmin",
		SUB_ADMIN: "subAdmin",
		VERIFICATION: "admin",
		VERIFICATION_OFFICER: "admin",
		DEVELOPER: "dev",
		DEV: "dev",
		SALES: "sales",
		FINANCE: "finance",
		INVENTORY: "inventory",
		AUDIT: "audit",
		SUPPORT: "support",
		COLLECTION_ADMIN: "collectionAdmin",
		COLLECTION_OFFICER: "collectionOfficer",
		SCAN_PARTNER: "scanPartner",
		SERVICE_CENTER: "serviceCenter",
		SAMSUNG_PARTNERS: "samsungPartners",
		SAMSUNG_PARTNER: "samsungPartners",
		HR: "hr",
	};

	const sidebarKey = roleMapping[role] || "admin";
	const getItems = sidebarItemsConfig[sidebarKey];

	return getItems ? getItems(options) : [];
}
