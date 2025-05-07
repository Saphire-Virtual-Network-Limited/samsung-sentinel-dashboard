"use client";

import { Home, Users, Package, Settings, LogOut, DollarSign, ChartBar, ChevronDown } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib";
import { useState } from "react";

export function AppSidebar() {
	const { logout } = useAuth();
	const { setOpenMobile, isMobile } = useSidebar();
	const [isReportsOpen, setIsReportsOpen] = useState(false);
	const [isResourceOpen, setIsResourceOpen] = useState(false);
	const [isAdminOpen, setIsAdminOpen] = useState(false);

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

	const items = [
		{ title: "Dashboard", icon: Home, url: "/dashboard" },
		{ icon: Package, title: "Loan Management", url: "/dashboard/loans" },
		{ icon: Users, title: "Customers", url: "/dashboard/customers" },
		{ icon: DollarSign, title: "Finance Management", url: "/dashboard/finance" },
		{
			icon: Users,
			title: "Resource",
			subItems: [
				{ title: "Agents/MBE", url: "/dashboard/resources/agents" },
				{ title: "Stores", url: "/dashboard/resources/stores" },
				{ title: "Devices", url: "/dashboard/resources/devices" },
			],
		},
		{
			icon: ChartBar,
			title: "Reports",
			subItems: [{ title: "Drop offs", url: "/dashboard/reports/drop-offs" }],
		},
	];

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
								key={item.title}
								className="flex flex-col gap-2">
								{item.subItems ? (
									<>
										<SidebarMenuButton
											className="hover:bg-gray-900 hover:text-white w-full"
											onClick={() => {
												if (item.title === "Reports") setIsReportsOpen(!isReportsOpen);
												if (item.title === "Resource") setIsResourceOpen(!isResourceOpen);
												if (item.title === "Admin") setIsAdminOpen(!isAdminOpen);
											}}>
											<div className="flex items-center justify-between w-full">
												<div className="flex items-center gap-2">
													<item.icon style={{ width: "20px", height: "20px" }} />
													<span className="text-sm lg:text-base">{item.title}</span>
												</div>
												<ChevronDown className={`w-4 h-4 transition-transform ${(item.title === "Reports" && isReportsOpen) || (item.title === "Resource" && isResourceOpen) || (item.title === "Admin" && isAdminOpen) ? "rotate-180" : ""}`} />
											</div>
										</SidebarMenuButton>
										{((item.title === "Reports" && isReportsOpen) || (item.title === "Resource" && isResourceOpen) || (item.title === "Admin" && isAdminOpen)) && (
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
									href="/dashboard/settings"
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
