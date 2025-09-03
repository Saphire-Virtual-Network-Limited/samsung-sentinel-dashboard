"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	Suspense,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
	getAdminProfile,
	loginAdmin,
	logoutAdmin,
	showToast,
	getAllProducts as getProducts,
	checkDefaultPassword,
	setPasswordSecurityStatus,
	PasswordStatus,
	redirectToPasswordChange,
	getPasswordSecurityStatus,
	isExemptRoute,
	clearPasswordSecurityStatus,
} from "@/lib";
import { Loader2 } from "lucide-react";

// Types
interface UserData {
	[key: string]: any;
}

interface UserResponse {
	statusCode: number;
	data: UserData | null;
}

interface AuthContextType {
	userResponse: UserResponse | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	getAllProducts: () => Promise<{ label: string; value: string }[] | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthInitializer({
	onReady,
}: {
	onReady: (callbackUrl: string) => void;
}) {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	useEffect(() => {
		onReady(callbackUrl);
	}, [callbackUrl, onReady]);

	return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [userResponse, setUserResponse] = useState<UserResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [callbackUrl, setCallbackUrl] = useState("/");
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [products, setProducts] = useState<
		{ label: string; value: string }[] | null
	>(null);

	const router = useRouter();
	const pathName = usePathname();

	const logout = useCallback(async () => {
		setIsLoggingOut(true);
		try {
			await logoutAdmin();
			setUserResponse(null);
			clearPasswordSecurityStatus(); // Clear password security cookie on logout
			await router.replace("/auth/login");
		} catch (error: any) {
			console.error("Logout error:", error);
			showToast({
				type: "error",
				message: error.message || "Logout failed",
				duration: 3000,
			});
		} finally {
			setIsLoggingOut(false);
		}
	}, [router]);

	const fetchUserProfile = useCallback(async () => {
		try {
			const response = await getAdminProfile();
			const userRole = response.data.role;
			const userEmail = response.data.email;
			const currentPath = pathName;

			setUserResponse(response);

			// Check password security status for users without cookie
			const passwordStatus = getPasswordSecurityStatus();
			if (
				passwordStatus === PasswordStatus.UNKNOWN &&
				userEmail &&
				!isExemptRoute(currentPath)
			) {
				try {
					const isUsingDefault = await checkDefaultPassword(userEmail);
					if (isUsingDefault) {
						setPasswordSecurityStatus(PasswordStatus.INSECURE);
						redirectToPasswordChange();
						return;
					} else {
						setPasswordSecurityStatus(PasswordStatus.SECURE);
					}
				} catch (error) {
					// If check fails, assume secure to avoid blocking
					setPasswordSecurityStatus(PasswordStatus.SECURE);
				}
			}

			// Enforce password change for insecure users
			if (
				passwordStatus === PasswordStatus.INSECURE &&
				!isExemptRoute(currentPath)
			) {
				redirectToPasswordChange();
				return;
			}

			const isAllowedRoute = (() => {
				// Allow settings route for all authenticated users
				if (currentPath.startsWith("/access/settings")) {
					return true;
				}

				switch (userRole) {
					case "SUPER_ADMIN":
						return currentPath.startsWith("/access/admin");
					case "ADMIN":
						return currentPath.startsWith("/access/sub-admin");
					case "DEVELOPER":
						return currentPath.startsWith("/access/dev");
					case "FINANCE":
						return currentPath.startsWith("/access/finance");
					case "AUDIT":
						return currentPath.startsWith("/access/audit");
					case "VERIFICATION":
					case "VERIFICATION_OFFICER":
						return currentPath.startsWith("/access/verify");
					case "SUPPORT":
						return currentPath.startsWith("/access/support");
					case "HUMAN_RESOURCE":
						return currentPath.startsWith("/access/hr");
					case "INVENTORY_MANAGER":
						return currentPath.startsWith("/access/inventory");
					case "SALES":
						return currentPath.startsWith("/access/sales");
					case "COLLECTION_ADMIN":
						return currentPath.startsWith("/access/collection-admin");
					case "COLLECTION_OFFICER":
						return currentPath.startsWith("/access/collection-officer");
					case "SCAN_PARTNER":
						return currentPath.startsWith("/access/scan-partner");
					case "USER":
					case "MERCHANT":
					case "AGENT":
					case "STORE_BRANCH_MANAGER":
					case "STORE_MANAGER":
						return false;
					default:
						return false;
				}
			})();

			if (!isAllowedRoute) {
				switch (userRole) {
					case "SUPER_ADMIN":
						router.replace("/access/admin");
						break;
					case "ADMIN":
						router.replace("/access/sub-admin");
						break;
					case "DEVELOPER":
						router.replace("/access/dev");
						break;
					case "FINANCE":
						router.replace("/access/finance");
						break;
					case "AUDIT":
						router.replace("/access/audit");
						break;
					case "VERIFICATION":
					case "VERIFICATION_OFFICER":
						router.replace("/access/verify");
						break;
					case "SUPPORT":
						router.replace("/access/support");
						break;
					case "HUMAN_RESOURCE":
						router.replace("/access/hr");
						break;

					case "SCAN_PARTNER":
						router.replace("/access/scan-partner");
						break;
					case "INVENTORY_MANAGER":
						router.replace("/access/inventory");
						break;
					case "SALES":
						router.replace("/access/sales");
						break;
					case "COLLECTION_ADMIN":
						router.replace("/access/collection-admin");
						break;
					case "COLLECTION_OFFICER":
						router.replace("/access/collection-officer");
						break;
					default:
						showToast({
							type: "error",
							message: "You are not authorized to access this page",
							duration: 3000,
						});
						logout();
				}
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
			showToast({
				type: "error",
				message: "Failed to fetch user profile",
				duration: 3000,
			});
			// Handle invite routes specially - don't redirect to login
			if (
				pathName.startsWith("/invite") ||
				pathName.startsWith("/auth/invite")
			) {
				router.replace(pathName);
				return;
			}
			router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathName)}`);
		} finally {
			setIsLoading(false);
		}
	}, [logout, pathName, router]);

	useEffect(() => {
		const isAuthRoute = pathName.startsWith("/auth");
		const isPublicRoute = pathName.startsWith("/verify-code");
		const isInviteRoute = pathName.startsWith("/invite"); // Added invite route check

		if (isAuthRoute || isPublicRoute || isInviteRoute) {
			setUserResponse(null);
			setIsLoading(false);
			return;
		}

		// Check password security for navigation
		const passwordStatus = getPasswordSecurityStatus();
		if (
			passwordStatus === PasswordStatus.INSECURE &&
			!isExemptRoute(pathName)
		) {
			redirectToPasswordChange();
			return;
		}

		fetchUserProfile();
	}, [fetchUserProfile, pathName]);
	const login = async (email: string, password: string) => {
		setUserResponse(null);
		try {
			await loginAdmin({ email, password });

			// Check if user is using default password
			const isUsingDefaultPassword = password === "Password123!";

			if (isUsingDefaultPassword) {
				setPasswordSecurityStatus(PasswordStatus.INSECURE);
				showToast({
					type: "warning",
					message: "You must change your password for security reasons.",
					duration: 5000,
				});
				router.push("/access/settings");
				return;
			} else {
				setPasswordSecurityStatus(PasswordStatus.SECURE);
			}

			const redirectTo = callbackUrl === "/" ? "/" : callbackUrl;
			router.push(redirectTo);
			showToast({
				type: "success",
				message: "Login successful",
				duration: 1000,
			});
		} catch (error: any) {
			console.error("Login error:", error);
			showToast({
				type: "error",
				message: error.message || "Login failed",
				duration: 1000,
			});
		}
	};

	const getAllProducts = useCallback(async () => {
		if (products) return products;

		try {
			const response = await getProducts();
			const mapped = response.data.map((product: any) => ({
				label: product.name,
				value: product.productId,
			}));
			setProducts(mapped);
			return mapped;
		} catch (error: any) {
			console.error("Error fetching products:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to fetch products",
				duration: 3000,
			});
		}
	}, [products]);

	return (
		<AuthContext.Provider
			value={{ userResponse, isLoading, login, logout, getAllProducts }}
		>
			<Suspense fallback={null}>
				<AuthInitializer onReady={setCallbackUrl} />
			</Suspense>

			{children}

			{isLoggingOut && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4 text-white">
						<Loader2 className="animate-spin h-8 w-8" />
						<span className="text-lg font-semibold">Logging out...</span>
					</div>
				</div>
			)}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
