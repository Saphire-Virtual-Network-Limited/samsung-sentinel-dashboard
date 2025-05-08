"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, SelectField } from "@/components/reususables";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/lib";
import { mutate } from "swr";

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) return "Good Morning";
	if (hour < 18) return "Good Afternoon";
	return "Good Evening";
}

function formatTitle(pathname: string): string {
	const pathSegments = pathname.split("/").filter(Boolean);
	if (pathname === "/dashboard" || pathSegments.length === 1) {
		return "";
	}
	const lastSegment = pathSegments[pathSegments.length - 1];
	return lastSegment.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AccessLayoutView({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [products, setProducts] = useState<{ label: string; value: string }[]>([]);
	const [loading, setLoading] = useState(true);

	const pageTitle = useMemo(() => formatTitle(pathname), [pathname]);
	const isDashboard = pathname === "/access/admin" || pathname === "/access/admin/sub" || pathname === "/access/dev" || pathname === "/access/finance" || pathname === "/access/verify" || pathname === "/access/support" || pathname === "/access/hr" || pathname === "/access/inventory" || pathname === "/access/sales";

	const { userResponse, getAllProducts } = useAuth();
	const userName = userResponse?.data?.firstName || "";

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const productsList = await getAllProducts();
				setProducts(productsList || []); // Handle undefined case
			} catch (error) {
				console.error("Error fetching products:", error);
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [getAllProducts]);

	// Update headers when product is selected
	const handleProductSelect = (value: string) => {
		if (value) {
			// Set the header for all subsequent requests
			if (typeof window !== "undefined") {
				localStorage.setItem("Sapphire-Credit-Product", value);
			}
		}

		// Mutate all cached data to trigger revalidation
		mutate((key) => typeof key === "string", undefined, { revalidate: true });
	};

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="flex flex-col p-2">
				<header className="sticky z-50 top-0 flex h-16 shrink-0 items-center justify-between px-4 gap-2 border-b bg-white">
					{/* Left side: sidebar + search */}
					<div className="flex items-center gap-4">
						<SidebarTrigger className="-ml-1 text-primary" />
						<Separator
							orientation="vertical"
							className="h-4"
						/>
						<div className="pb-3 w-full">
							<SelectField
								htmlFor="product-search"
								id="product-search"
								placeholder={loading ? "Loading products..." : products.length > 0 ? "Choose Products" : "No products available"}
								onChange={(value) => handleProductSelect(value as string)}
								options={products}
								size="md"
							/>
						</div>
					</div>

					{/* Right side: notification + user */}
					<div className="flex items-center gap-2">
						<Button
							variant="secondary"
							size="icon"
							className="rounded-full bg-primary/10">
							<Bell className="lg:h-5 lg:w-5 h-3 w-3" />
						</Button>
						<Separator
							orientation="vertical"
							className="hidden lg:mx-2 h-4"
						/>
						{/* <Button
							variant="secondary"
							size="icon"
							className="rounded-full bg-primary/10">
							<UserPlus2Icon className="lg:h-5 lg:w-5 h-3 w-3" />
						</Button> */}
						<div className="hidden lg:flex flex-col text-start">
							<span className="text-black font-bold text-base">{userResponse?.data?.firstName}</span>
							<span className="text-xs text-zinc-400 text-right">{userResponse?.data?.role?.replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase())}</span>
						</div>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-4 p-1 lg:px-8 py-4 lg:py-6">
					<div className="w-full p-3 lg:p-0 py-2 pb-3">
						<h1 className="text-2xl font-semibold text-gray-800 mb-1.5">
							{isDashboard ? (
								<>
									{getGreeting()}, <span className="text-primary">{userName}</span>
								</>
							) : (
								pageTitle
							)}
						</h1>
						<p className="text-gray-500 text-xs lg:text-sm">{isDashboard ? "here's what's happening today." : `Manage your ${pageTitle.toLowerCase()}`}</p>
					</div>
					<div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
