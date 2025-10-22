"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useRef,
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
import { getRoleBasePath, isValidPathForRole } from "@/lib/roleConfig";

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
	_debugOverrides?: any; // Internal use for debug system
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
	const isNavigatingRef = useRef(false);
	const [products, setProducts] = useState<
		{ label: string; value: string }[] | null
	>(null);

	const router = useRouter();
	const pathName = usePathname();

	// Debug overrides state
	const [debugOverrides, setDebugOverrides] = useState<any>({});

	// Helper function to get debug overrides from cookies
	const getDebugOverrides = useCallback(() => {
		if (
			typeof document === "undefined" ||
			process.env.NEXT_PUBLIC_API_ENVIRONMENT !== "development"
		)
			return {};
		try {
			const cookieData = document.cookie
				.split("; ")
				.find((row) => row.startsWith("debug_overrides="));
			if (cookieData) {
				const parsed = JSON.parse(decodeURIComponent(cookieData.split("=")[1]));
				if (
					parsed.enabled &&
					parsed.overrides &&
					parsed.overrides.expiresAt &&
					Date.now() < parsed.overrides.expiresAt
				) {
					return parsed.overrides;
				}
			}
		} catch (error) {
			console.warn("Failed to parse debug overrides:", error);
		}
		return {};
	}, []);

	// Update debug overrides periodically
	useEffect(() => {
		const updateDebugOverrides = () => {
			const overrides = getDebugOverrides();
			setDebugOverrides(overrides);
		};
		updateDebugOverrides();
		const interval = setInterval(updateDebugOverrides, 1000); // Check every second
		return () => clearInterval(interval);
	}, [getDebugOverrides]);

	// Helper function to clear all authentication cookies
	const clearAuthCookies = useCallback(() => {
		if (typeof document === "undefined") return;

		// Get all cookies
		const cookies = document.cookie.split(";");

		// Clear each cookie by setting it to expire in the past
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i];
			const eqPos = cookie.indexOf("=");
			const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

			// Clear the cookie for all possible paths and domains
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
		}
	}, []);

	const logout = useCallback(async () => {
		setIsLoggingOut(true);
		try {
			await logoutAdmin();
			setUserResponse(null);
			clearPasswordSecurityStatus(); // Clear password security cookie on logout

			// Clear all authentication cookies
			clearAuthCookies();

			// Clear any localStorage items that might cache user data
			if (typeof window !== "undefined") {
				localStorage.removeItem("user");
				localStorage.removeItem("selectedProduct");
				localStorage.removeItem("Sapphire-Credit-Product");
				localStorage.removeItem("Sapphire-Credit-Product-Name");
				// Clear any other cached data
				sessionStorage.clear();
			}

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
	}, [router, clearAuthCookies]);

	const fetchUserProfile = useCallback(async () => {
		try {
			const response = await getAdminProfile();
			const originalRole = response.data.role;
			const originalEmail = response.data.email;
			const currentPath = pathName;

			// Get current debug overrides
			const currentDebugOverrides = getDebugOverrides();

			// Use debug role if available and valid, otherwise use original role
			const userRole =
				process.env.NEXT_PUBLIC_API_ENVIRONMENT === "development" &&
				currentDebugOverrides.role
					? currentDebugOverrides.role
					: originalRole;
			const userEmail =
				process.env.NEXT_PUBLIC_API_ENVIRONMENT === "development" &&
				currentDebugOverrides.email
					? currentDebugOverrides.email
					: originalEmail;

			// Update user response with debug overrides if applicable
			const modifiedResponse = {
				...response,
				data: {
					...response.data,
					role: userRole,
					email: userEmail,
				},
			};

			setUserResponse(modifiedResponse);

			// Dispatch event to notify components that user data has changed
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("user-changed", {
						detail: { role: userRole, email: userEmail },
					})
				);
			}

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

			// Check if current path is allowed for the user's role
			const isAllowedRoute = (() => {
				// Allow settings route for all authenticated users
				if (currentPath.startsWith("/access/settings")) {
					return true;
				}

				// Use role mapping function for consistent validation
				const isValid = isValidPathForRole(userRole, currentPath);

				// Debug logging
				if (process.env.NEXT_PUBLIC_API_ENVIRONMENT === "development") {
					console.log(
						`[DEBUG AUTH] Role: '${userRole}', Path: '${currentPath}', IsValid: ${isValid}`
					);
					if (currentDebugOverrides.role) {
						console.log(
							`[DEBUG AUTH] Using debug role '${currentDebugOverrides.role}' instead of original '${originalRole}'`
						);
					}
					const basePath = getRoleBasePath(userRole);
					console.log(
						`[DEBUG AUTH] Base path for role '${userRole}': '${basePath}'`
					);
				}

				return isValid;
			})();
			if (!isAllowedRoute && !isNavigatingRef.current) {
				const targetPath = getRoleBasePath(userRole);

				if (process.env.NEXT_PUBLIC_API_ENVIRONMENT === "development") {
					console.log(
						`[DEBUG] Unauthorized path '${currentPath}' for role '${userRole}', redirecting to '${targetPath}'`
					);
					if (currentDebugOverrides.role) {
						console.log(
							`[DEBUG] This is a debug role redirect from actual role '${originalRole}' to debug role '${userRole}'`
						);
					}
				}

				isNavigatingRef.current = true;
				setTimeout(() => {
					isNavigatingRef.current = false;
				}, 2000); // Reset flag after 2 seconds
				router.replace(targetPath);
				return;
			} // Legacy fallback (should not be reached with role mapping)
			if (false) {
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
	}, [logout, pathName, router, getDebugOverrides]);

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

		// Only fetch profile if we don't have user data yet
		// This prevents unnecessary API calls and redirects on navigation
		if (!userResponse) {
			fetchUserProfile();
		}
	}, [fetchUserProfile, pathName, userResponse]);
	const login = async (email: string, password: string) => {
		setUserResponse(null);

		// Clear any existing authentication cookies before login
		// This prevents issues when switching between servers
		clearAuthCookies();

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

			// Fetch the new user's profile immediately after login
			await fetchUserProfile();

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
			value={{
				userResponse,
				isLoading,
				login,
				logout,
				getAllProducts,
				_debugOverrides: debugOverrides,
			}}
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
