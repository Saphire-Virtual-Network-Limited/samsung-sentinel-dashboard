"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
  return lastSegment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AccessLayoutView({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [products, setProducts] = useState<{ label: string; value: string }[]>(
    []
  );
  const [legacyServices, setLegacyServices] = useState<
    { label: string; value: string }[]
  >([
    { label: "Relay", value: "Relay" },
    { label: "Android", value: "Android" },
    { label: "Root", value: "Root" },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);

  const pageTitle = useMemo(() => formatTitle(pathname), [pathname]);
  const isDashboard =
    pathname === "/access/admin" ||
    pathname === "/access/admin/sub" ||
    pathname === "/access/dev" ||
    pathname === "/access/finance" ||
    pathname === "/access/verify" ||
    pathname === "/access/support" ||
    pathname === "/access/hr" ||
    pathname === "/access/inventory" ||
    pathname === "/access/sales";

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
              localStorage.setItem(
                "Sapphire-Credit-Product-Name",
                product.label
              );
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

  const isDisabled = false; // userResponse?.data?.role === "SALES";
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsList = await getAllProducts();
        setProducts(productsList || []);

        const lastSelectedId = localStorage.getItem("Sapphire-Credit-Product");
        const lastSelectedName = localStorage.getItem(
          "Sapphire-Credit-Product-Name"
        );

        if (
          lastSelectedId &&
          lastSelectedName &&
          productsList?.some((p) => p.value === lastSelectedId)
        ) {
          setSelectedProduct([lastSelectedId]);
          await handleProductSelect(lastSelectedId, lastSelectedName);
        } else if (productsList && productsList.length > 0) {
          setSelectedProduct([productsList[0].value]);
          await handleProductSelect(
            productsList[0].value,
            productsList[0].label
          );
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
      <SidebarInset className="flex flex-col p-2 transition-all duration-300 ease-in-out">
        <header className="sticky z-50 top-0 flex h-16 shrink-0 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 border-b bg-white transition-all duration-300 ease-in-out">
          {/* Left side */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <SidebarTrigger className="-ml-1 text-primary hover:bg-gray-100 rounded-md p-1 transition-all duration-200 ease-in-out" />
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            {!isDisabled && (
              <div className="pb-3 w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <SelectField
                  key={products.length}
                  htmlFor="product-search"
                  id="product-search"
                  placeholder={
                    loading
                      ? "Loading products..."
                      : products.length > 0
                      ? "Choose Products"
                      : "No products available"
                  }
                  defaultSelectedKeys={selectedProduct}
                  onChange={(value) => {
                    const product = products.find((p) => p.value === value);
                    handleProductSelect(value as string, product?.label);
                  }}
                  options={[...products, ...legacyServices]}
                  size="md"
                />
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200 ease-in-out"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Separator orientation="vertical" className="hidden lg:mx-2 h-4" />
            <div className="hidden lg:flex flex-col text-start">
              <span className="text-black font-bold text-base">{userName}</span>
              <span className="text-xs text-zinc-400 text-right">
                {userResponse?.data?.role
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (char: string) => char.toUpperCase())}
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 lg:px-8 lg:py-6 transition-all duration-300 ease-in-out">
          <div className="w-full p-2 sm:p-3 lg:p-0 py-2 pb-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1 sm:mb-1.5 transition-all duration-200 ease-in-out">
              {isDashboard ? (
                <>
                  {getGreeting()},{" "}
                  <span className="text-primary">{userName}</span>
                </>
              ) : (
                pageTitle
              )}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm transition-all duration-200 ease-in-out">
              {isDashboard
                ? "here's what's happening today."
                : `Manage your ${pageTitle.toLowerCase()}`}
            </p>
          </div>
          <div className="min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-14rem)] flex-1 rounded-xl md:min-h-min transition-all duration-300 ease-in-out">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
