"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, SelectField } from "@/components/reususables";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
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
	const [selectedProduct, setSelectedProduct] = useState<string[]>([]);

	const pageTitle = useMemo(() => formatTitle(pathname), [pathname]);
	const isDashboard = pathname === "/access/admin" || pathname === "/access/admin/sub" || pathname === "/access/dev" || pathname === "/access/finance" || pathname === "/access/verify" || pathname === "/access/support" || pathname === "/access/hr" || pathname === "/access/inventory" || pathname === "/access/sales";

	const { userResponse, getAllProducts } = useAuth();
	const userName = userResponse?.data?.firstName || "";

	// Update headers and trigger revalidation when product is selected
	const handleProductSelect = useCallback(
		async (value: string, label?: string) => {
			if (value) {
				if (typeof window !== "undefined") {
					localStorage.setItem("Sapphire-Credit-Product", value);
					if (label) {
						localStorage.setItem("Sapphire-Credit-Product-Name", label);
						setSelectedProduct([value]);
					} else {
						const product = products.find((p) => p.value === value);
						if (product) {
							localStorage.setItem("Sapphire-Credit-Product-Name", product.label);
							setSelectedProduct([value]);
						}
					}
				}

				// Optional: broadcast event
				window.dispatchEvent(new Event("productChanged"));

				// Revalidate ALL SWR cache
				await mutate(() => true, undefined, { revalidate: true });

				// Revalidate current pathname specifically
				await mutate(pathname);
			}
		},
		[products, pathname]
	);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const productsList = await getAllProducts();
				setProducts(productsList || []);

				const lastSelectedId = localStorage.getItem("Sapphire-Credit-Product");
				const lastSelectedName = localStorage.getItem("Sapphire-Credit-Product-Name");

				if (lastSelectedId && lastSelectedName && productsList?.some((p) => p.value === lastSelectedId)) {
					setSelectedProduct([lastSelectedId]);
					await handleProductSelect(lastSelectedId, lastSelectedName);
				} else if (productsList && productsList.length > 0) {
					setSelectedProduct([productsList[0].value]);
					await handleProductSelect(productsList[0].value, productsList[0].label);
				}
			} catch (error) {
				console.error("Error fetching products:", error);
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [getAllProducts, handleProductSelect]);

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="flex flex-col p-2">
				<header className="sticky z-50 top-0 flex h-16 shrink-0 items-center justify-between px-4 gap-2 border-b bg-white">
					{/* Left side */}
					<div className="flex items-center gap-4">
						<SidebarTrigger className="-ml-1 text-primary" />
						<Separator
							orientation="vertical"
							className="h-4"
						/>
						<div className="pb-3 w-full">
							<SelectField
								key={products.length}
								htmlFor="product-search"
								id="product-search"
								placeholder={loading ? "Loading products..." : products.length > 0 ? "Choose Products" : "No products available"}
								defaultSelectedKeys={selectedProduct}
								onChange={(value) => {
									const product = products.find((p) => p.value === value);
									handleProductSelect(value as string, product?.label);
								}}
								options={products}
								size="md"
							/>
						</div>
					</div>

					{/* Right side */}
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
						<div className="hidden lg:flex flex-col text-start">
							<span className="text-black font-bold text-base">{userName}</span>
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
