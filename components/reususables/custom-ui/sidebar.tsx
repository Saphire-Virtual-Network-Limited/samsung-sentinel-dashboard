"use client";
import {
	Home,
	Users,
	Settings,
	LogOut,
	ChartBar,
	ChevronDown,
	Store,
	Package2Icon,
	Users2,
	Phone,
	Code,
	CreditCard,
	Check,
	X,
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
	Bug,
	Shield,
} from "lucide-react";
import { IoLogoAndroid, IoLogoApple } from "react-icons/io5";
import { getUserRole } from "@/lib";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useAuthWithDebug } from "@/hooks/useAuthWithDebug";
import { useState, useEffect } from "react";
import { IoBusiness } from "react-icons/io5";
import { getSelectedProduct } from "@/utils";
import { hasPermission } from "@/lib/permissions";
import { useDebug } from "@/lib/debugContext";
import DebugModal from "@/components/modals/DebugModal";
import { getSidebarItemsForRole, type MenuItem } from "@/lib/sidebarItems";

export function AppSidebar() {
	const { userResponse, debugInfo, logout } = useAuthWithDebug();
	const { setOpenMobile, isMobile } = useSidebar();
	const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
	const [openNestedMenus, setOpenNestedMenus] = useState<{
		[key: string]: boolean;
	}>({});
	const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
	const [forceUpdate, setForceUpdate] = useState(0); // Force re-render on debug role change
	const { label: selectedProduct } = getSelectedProduct();
	const { isDebugMode, debugOverrides } = useDebug();

	// Force sidebar to re-render when debug role changes
	useEffect(() => {
		const handleDebugRoleChange = () => {
			console.log("Sidebar: Debug role changed, forcing re-render");
			setForceUpdate((prev) => prev + 1);
		};

		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === "debug-role-update") {
				console.log("Sidebar: Storage event detected, forcing re-render");
				setForceUpdate((prev) => prev + 1);
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener(
				"debug-role-changed",
				handleDebugRoleChange as EventListener
			);
			window.addEventListener("storage", handleStorageChange);

			return () => {
				window.removeEventListener(
					"debug-role-changed",
					handleDebugRoleChange as EventListener
				);
				window.removeEventListener("storage", handleStorageChange);
			};
		}
	}, []);

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
	const accessRole = getUserRole(userResponse?.data?.role);
	const userEmail = userResponse?.data?.email;
	const canVerifyMobiflex = hasPermission(
		accessRole,
		"verifyMobiflex",
		userEmail
	);

	// Get sidebar items dynamically based on current role (including debug overrides)
	const currentRole = userResponse?.data?.role || "";
	const items: MenuItem[] = getSidebarItemsForRole(currentRole, {
		accessRole,
		userEmail,
		selectedProduct: selectedProduct || undefined,
		hasPermission: hasPermission as any, // Type cast to match expected signature
		canVerifyMobiflex,
	});

	const toggleMenu = (id: string) => {
		setOpenMenus((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const toggleNestedMenu = (id: string) => {
		setOpenNestedMenus((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	return (
		<>
			<Sidebar
				variant="sidebar"
				className="border-none outline-none shadow-none sidebar-transition"
			>
				<SidebarHeader className="bg-black border-b border-gray-800 sidebar-transition">
					<SidebarMenu>
						<SidebarMenuItem className="py-2">
							<SidebarMenuButton
								size="lg"
								asChild
								className="hover:bg-black sidebar-transition sidebar-focus"
							>
								<Link href="/" onClick={handleLinkClick}>
									<div className="flex items-center justify-center gap-3 px-1 p-4 sidebar-transition">
										<div className="flex-shrink-0">
											<Image
												src="/images/SapphireCredit Approved Logo icon.png"
												alt="Sapphire Credit Logo"
												width={50}
												height={50}
												aria-label="Sapphire Credit Logo"
												className="object-contain sidebar-transition"
												style={{ height: "auto" }}
											/>
										</div>
										<div className="flex flex-col min-w-0">
											<span className="text-white font-bold text-lg sm:text-xl sidebar-text">
												Sapphire Credit
											</span>
											{isDebugMode && (
												<div className="flex items-center gap-1 mt-1">
													<Bug className="text-orange-400" size={12} />
													<span className="text-orange-400 text-xs font-medium">
														Debug Mode
														{debugOverrides.role && ` (${debugOverrides.role})`}
													</span>
												</div>
											)}
										</div>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent className="bg-black text-white pb-8 px-3 sm:px-5 sidebar-transition sidebar-scroll">
					<SidebarMenu className="mt-4 flex flex-1 flex-col gap-2 sm:gap-4">
						{items.map((item) => (
							<SidebarMenuItem
								key={item.id || item.title}
								className="flex flex-col gap-1 sm:gap-2"
							>
								{item.subItems ? (
									<>
										<SidebarMenuButton
											className="sidebar-item-hover w-full rounded-lg px-3 py-2.5 sm:py-3 sidebar-focus"
											onClick={() => item.id && toggleMenu(item.id)}
										>
											<div className="flex items-center justify-between w-full">
												<div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
													<item.icon
														className="sidebar-icon"
														style={{ width: "18px", height: "18px" }}
													/>
													<span className="text-sm sm:text-base font-medium sidebar-text">
														{item.title}
													</span>
												</div>
												<ChevronDown
													className={`w-4 h-4 flex-shrink-0 sidebar-transition ${
														item.id && openMenus[item.id] ? "rotate-180" : ""
													}`}
												/>
											</div>
										</SidebarMenuButton>
										{item.id && openMenus[item.id] && (
											<div className="ml-4 sm:ml-6 flex flex-col gap-1 sm:gap-2 sidebar-submenu">
												{item.subItems.map((subItem) => (
													<div key={subItem.title}>
														{subItem.subItems ? (
															<>
																<button
																	onClick={() =>
																		toggleNestedMenu(
																			`${item.id}-${subItem.title}`
																		)
																	}
																	className="text-sm hover:text-gray-300 hover:bg-gray-800 py-2 px-3 sm:px-4 rounded-md sidebar-transition font-medium sidebar-focus w-full text-left flex items-center justify-between"
																>
																	<span>{subItem.title}</span>
																	<ChevronDown
																		className={`w-3 h-3 flex-shrink-0 sidebar-transition ${
																			openNestedMenus[
																				`${item.id}-${subItem.title}`
																			]
																				? "rotate-180"
																				: ""
																		}`}
																	/>
																</button>
																{openNestedMenus[
																	`${item.id}-${subItem.title}`
																] && (
																	<div className="ml-4 flex flex-col gap-1 sm:gap-2">
																		{subItem.subItems.map((nestedItem) => (
																			<Link
																				key={nestedItem.title}
																				href={nestedItem.url || "#"}
																				onClick={handleLinkClick}
																				className="text-sm hover:text-gray-300 hover:bg-gray-800 py-2 px-3 sm:px-4 rounded-md sidebar-transition font-medium sidebar-focus"
																			>
																				{nestedItem.title}
																			</Link>
																		))}
																	</div>
																)}
															</>
														) : (
															<Link
																href={subItem.url || "#"}
																onClick={handleLinkClick}
																className="text-sm hover:text-gray-300 hover:bg-gray-800 py-2 px-3 sm:px-4 rounded-md sidebar-transition font-medium sidebar-focus"
															>
																{subItem.title}
															</Link>
														)}
													</div>
												))}
											</div>
										)}
									</>
								) : (
									<SidebarMenuButton
										asChild
										className="hover:bg-primary hover:text-white w-full sidebar-transition rounded-lg px-3 py-2.5 sm:py-3 sidebar-focus"
									>
										<Link
											href={item.url || "#"}
											onClick={handleLinkClick}
											className="flex items-center gap-2.5 sm:gap-3 w-full"
										>
											<item.icon
												className="sidebar-icon"
												style={{ width: "18px", height: "18px" }}
											/>
											<span className="text-sm sm:text-base font-medium sidebar-text">
												{item.title}
											</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarContent>

				<SidebarFooter className="bg-black text-white border-t border-gray-800 sidebar-transition">
					<SidebarMenu className="py-2 px-2 sm:px-3 flex flex-1 flex-col gap-1 sm:gap-2">
						{/* Debug Button - Only show in development */}
						{process.env.NODE_ENV === "development" && (
							<SidebarMenuItem className="flex flex-col gap-1 sm:gap-2">
								<SidebarMenuButton
									className={`hover:bg-orange-600 hover:text-white w-full sidebar-transition rounded-lg px-3 py-2.5 sm:py-3 sidebar-focus ${
										isDebugMode ? "bg-orange-500 text-white" : ""
									}`}
									onClick={() => setIsDebugModalOpen(true)}
								>
									<div className="flex items-center gap-2.5 sm:gap-3 w-full">
										<Bug
											className="sidebar-icon"
											style={{ width: "16px", height: "16px" }}
										/>
										<span className="text-sm sm:text-base font-medium sidebar-transition">
											Debug
										</span>
										{isDebugMode && (
											<div className="ml-auto">
												<div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" />
											</div>
										)}
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)}

						<SidebarMenuItem className="flex flex-col gap-1 sm:gap-2">
							<SidebarMenuButton
								asChild
								className="hover:bg-primary hover:text-white w-full sidebar-transition rounded-lg px-3 py-2.5 sm:py-3 sidebar-focus"
							>
								<Link
									href="/access/settings"
									onClick={handleLinkClick}
									className="flex items-center gap-2.5 sm:gap-3 w-full"
								>
									<Settings
										className="sidebar-icon"
										style={{ width: "16px", height: "16px" }}
									/>
									<span className="text-sm sm:text-base font-medium sidebar-transition">
										Settings
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem className="flex flex-col gap-1 sm:gap-2">
							<SidebarMenuButton
								asChild
								className="hover:bg-red-600 hover:text-white w-full sidebar-transition rounded-lg px-3 py-2.5 sm:py-3 sidebar-focus"
							>
								<button
									onClick={() => {
										handleLogout();
										if (isMobile) setOpenMobile(false);
									}}
									className="flex items-center gap-2.5 sm:gap-3 w-full text-sm sm:text-base font-medium sidebar-transition"
								>
									<LogOut
										className="sidebar-icon"
										style={{ width: "16px", height: "16px" }}
									/>
									<span>Log Out</span>
								</button>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>

			{/* Debug Modal */}
			<DebugModal
				isOpen={isDebugModalOpen}
				onClose={() => setIsDebugModalOpen(false)}
			/>
		</>
	);
}
