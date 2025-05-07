"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getAdminProfile, loginAdmin, logoutAdmin, showToast } from "@/lib";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthInitializer({ onReady }: { onReady: (callbackUrl: string) => void }) {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	useEffect(() => {
		onReady(callbackUrl);
	}, [callbackUrl, onReady]);

	return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [userResponse, setUserResponse] = useState<UserResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [callbackUrl, setCallbackUrl] = useState("/");
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const router = useRouter();
	const pathName = usePathname();

	const logout = useCallback(async () => {
		setIsLoggingOut(true);
		try {
			await logoutAdmin();
			setUserResponse(null);
			await router.replace("/auth/login"); // wait for navigation
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

			//redirect to pages beased on roles using switch case
			switch (response.data.role) {
				case "USER":
					showToast({
						type: "error",
						message: "You are not authorized to access this page",
						duration: 8000,
					});
					logout();
					break;
				case "SUPER_ADMIN":
					setUserResponse(response);
					router.replace("/access/admin");
					break;
				case "ADMIN":
					setUserResponse(response);
					router.replace("/access/admin/sub");
					break;
				case "DEVELOPER":
					setUserResponse(response);
					router.replace("/access/dev");
					break;
				case "MERCHANT":
					showToast({
						type: "error",
						message: "You are not authorized to access this page",
						duration: 8000,
					});
					logout();
					break;
				case "FINANCE":
					setUserResponse(response);
					router.replace("/access/finance");
					break;
				case "VERIFICATION":
					setUserResponse(response);
					router.replace("/access/verify");
					break;
				case "SUPPORT":
					setUserResponse(response);
					router.replace("/access/support");
					break;
				case "HUMAN_RESOURCE":
					setUserResponse(response);
					router.replace("/access/hr");
					break;
				case "VERIFICATION_OFFICER":
					setUserResponse(response);
					router.replace("/access/verify");
					break;
				case "INVENTORY_MANAGER":
					setUserResponse(response);
					router.replace("/access/inventory");
					break;
				case "SALES":
					setUserResponse(response);
					router.replace("/access/sales");
					break;
				case "AGENT":
					showToast({
						type: "error",
						message: "You are not authorized to access this page",
						duration: 3000,
					});
					logout();
					break;
				case "STORE_BRANCH_MANAGER":
					showToast({
						type: "error",
						message: "You are not authorized to access this page",
						duration: 3000,
					});
					logout();
					break;
				case "STORE_MANAGER":
					showToast({
						type: "error",
						message: "You are not authorized to access this page",
						duration: 3000,
					});
					logout();
					break;
				default:
					logout();
			}

			console.log("Fetched user");
		} catch (error) {
			console.error("Error fetching user profile:", error);
			showToast({
				type: "error",
				message: "Failed to fetch user profile",
				duration: 3000,
			});
			router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathName)}`);
		} finally {
			setIsLoading(false);
		}
	}, [logout, pathName, router]);

	useEffect(() => {
		const isAuthRoute = pathName.startsWith("/auth");

		if (isAuthRoute) {
			setUserResponse(null);
			setIsLoading(false);
			return;
		}

		fetchUserProfile();
	}, [fetchUserProfile, pathName]);

	const login = async (email: string, password: string) => {
		setUserResponse(null);
		try {
			await loginAdmin({ email, password });
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

	return (
		<AuthContext.Provider value={{ userResponse, isLoading, login, logout }}>
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
