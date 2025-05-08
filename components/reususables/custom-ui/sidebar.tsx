"use client";

import { Home, Users, Settings, LogOut, ChartBar, ChevronDown, Store, Package2Icon, Phone, Code, CreditCard, DollarSign } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib";
import { useState } from "react";
import { IoBusiness } from "react-icons/io5";

// Define types for menu items
type SubItem = {
	title: string;
	url: string;
};

type MenuItem = {
	title: string;
	icon: React.FC<any>;
	url?: string;
	subItems?: SubItem[];
	id?: string;
};

export function AppSidebar() {
	const { logout, userResponse } = useAuth();
	const { setOpenMobile, isMobile } = useSidebar();
	const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

	const handleLogout = async () => {
		try {
			logout();
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	// Function to close mobile sidebar
	const handleLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const apiDocsUrl = process.env.NEXT_PUBLIC_API_DOCS_URL;

	const adminItems: MenuItem[] = [
		{ title: "Dashboard", icon: Home, url: "/access/admin/", id: "admin-dashboard" },
		{ icon: CreditCard, title: "Loans", url: "/access/admin/loans", id: "admin-loans" },
		{ icon: Users, title: "Customers", url: "/access/admin/customers", id: "admin-customers" },
		{ icon: Store, title: "Stores", url: "/access/admin/stores", id: "admin-stores" },
		{ icon: IoBusiness, title: "Staff", url: "/access/admin/staff", id: "admin-staff" },
		{
			icon: ChartBar,
			title: "Reports",
			id: "admin-reports",
			subItems: [
				{ title: "Sales", url: "/access/admin/resources/agents" },
				{ title: "Drop-offs", url: "/access/admin/resources/stores" },
				{ title: "Tracker", url: "/access/admin/resources/devices" },
			],
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

	const developerItems: MenuItem[] = [
		{ title: "Dashboard", icon: Home, url: "/access/dev/", id: "developer-dashboard" },
		{ icon: Users, title: "Customers", url: "/access/dev/customers", id: "developer-customers" },
		{ icon: Phone, title: "Devices", url: "/access/dev/devices", id: "developer-devices" },
		{ icon: Package2Icon, title: "Products", url: "/access/dev/products", id: "developer-products" },
		{ icon: Code, title: "API Docs", url: apiDocsUrl, id: "developer-api-docs" },
		{ icon: ChartBar, title: "Drop-offs", url: "/access/dev/drop-offs", id: "developer-drop-offs" },
	];

	const verificationItems: MenuItem[] = [
		{ title: "Dashboard", icon: Home, url: "/access/verify/", id: "verification-dashboard" },
		{ icon: Users, title: "References", url: "/access/verify/references", id: "verification-references" },
		{ icon: CreditCard, title: "Loans", url: "/access/verify/loans", id: "verification-loans" },
	];

	const financeItems: MenuItem[] = [
		{ title: "Dashboard", icon: Home, url: "/access/finance/", id: "finance-dashboard" },
		{ icon: CreditCard, title: "Loans", url: "/access/finance/loans", id: "finance-loans" },
		{ icon: Store, title: "Stores", url: "/access/finance/stores", id: "finance-stores" },
		{ icon: DollarSign, title: "Payroll", url: "/access/finance/staff", id: "finance-staff" },
		{ icon: Users, title: "Agents", url: "/access/finance/agents", id: "finance-agents" },
	];

	// Get items based on user role
	const items: MenuItem[] = (() => {
		const role = userResponse?.data?.role;
		switch (role) {
			case "SUPER_ADMIN":
			case "ADMIN":
				return adminItems;
			case "VERIFICATION":
			case "VERIFICATION_OFFICER":
				return verificationItems;
			case "DEVELOPER":
				return developerItems;
			case "FINANCE":
				return financeItems;
			default:
				return [];
		}
	})();

	const toggleMenu = (id: string) => {
		setOpenMenus((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	return (
		<>
			<Sidebar
				variant="sidebar"
				className="border-none outline-none shadow-none">
				<SidebarHeader className="bg-black border-b border-gray-800 ">
					<SidebarMenu>
						<SidebarMenuItem className="py-4">
							<SidebarMenuButton
								size="lg"
								asChild
								className="hover:bg-black">
								<Link
									href="/dashboard"
									onClick={handleLinkClick}>
									<div className="flex items-center justify-center gap-3 px-1 p-4">
										<div>
											<Image
												src="/images/SapphireCredit Approved Logo icon.png"
												alt="Debiz Food Logo"
												width={50}
												height={50}
												className="object-contain"
											/>
										</div>
										<div className="flex flex-col">
											<span className="text-white font-bold  text-xl">Sapphire Credit</span>
											{/* <span className="text-white font-bold text-lg">Credit</span> */}
										</div>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent className="bg-black text-white pb-8 px-5">
					<SidebarMenu className="mt-8 flex flex-1 flex-col gap-8">
						{items.map((item) => (
							<SidebarMenuItem
								key={item.id || item.title}
								className="flex flex-col gap-2">
								{item.subItems ? (
									<>
										<SidebarMenuButton
											className="hover:bg-gray-900 hover:text-white w-full"
											onClick={() => item.id && toggleMenu(item.id)}>
											<div className="flex items-center justify-between w-full">
												<div className="flex items-center gap-2">
													<item.icon style={{ width: "20px", height: "20px" }} />
													<span className="text-sm lg:text-base">{item.title}</span>
												</div>
												<ChevronDown className={`w-4 h-4 transition-transform ${item.id && openMenus[item.id] ? "rotate-180" : ""}`} />
											</div>
										</SidebarMenuButton>
										{item.id && openMenus[item.id] && (
											<div className="ml-6 flex flex-col gap-2">
												{item.subItems.map((subItem) => (
													<Link
														key={subItem.title}
														href={subItem.url}
														onClick={handleLinkClick}
														className="text-sm hover:text-gray-400 py-2">
														{subItem.title}
													</Link>
												))}
											</div>
										)}
									</>
								) : (
									<SidebarMenuButton
										asChild
										className="hover:bg-primary hover:text-white w-full">
										<Link
											href={item.url || "#"}
											onClick={handleLinkClick}>
											<item.icon style={{ width: "20px", height: "20px" }} />
											<span className="text-sm lg:text-base">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarContent>

				<SidebarFooter className="bg-black text-white border-t border-gray-800">
					<SidebarMenu className="py-4 px-3 flex flex-1 flex-col gap-6">
						<SidebarMenuItem className="flex flex-col gap-2">
							<SidebarMenuButton
								asChild
								className="hover:bg-primary hover:text-white w-full">
								<Link
									href="/access/settings"
									onClick={handleLinkClick}>
									<Settings style={{ width: "16px", height: "16px" }} />
									<span className="text-sm lg:text-base">Settings</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem className="flex flex-col gap-2">
							<SidebarMenuButton
								asChild
								className="hover:bg-primary hover:text-white w-full">
								<button
									onClick={() => {
										handleLogout();
										if (isMobile) setOpenMobile(false);
									}}
									className="flex items-center gap-2 w-full text-sm lg:text-base">
									<LogOut style={{ width: "16px", height: "16px" }} />
									<span>Log Out</span>
								</button>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		</>
	);
}
