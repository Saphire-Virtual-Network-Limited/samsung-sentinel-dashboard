"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
	getAvailableRoles,
	getRoleBasePath,
	isValidPathForRole,
} from "./roleConfig";

// Available roles from the centralized role configuration
const AVAILABLE_ROLES = getAvailableRoles();

type Role = string;

interface DebugOverrides {
	role?: Role;
	email?: string;
	permissions?: string[];
	expiresAt?: number;
}

interface DebugContextType {
	isDebugMode: boolean;
	debugOverrides: DebugOverrides;
	setDebugRole: (role: Role | undefined, navigate?: boolean) => void;
	setDebugEmail: (email: string | undefined) => void;
	setDebugPermissions: (permissions: string[] | undefined) => void;
	resetDebugOverrides: () => void;
	enableDebugMode: () => void;
	disableDebugMode: () => void;
	isDebugExpired: () => boolean;
	extendDebugSession: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const useDebug = () => {
	const context = useContext(DebugContext);
	if (!context) {
		throw new Error("useDebug must be used within a DebugProvider");
	}
	return context;
};

interface DebugProviderProps {
	children: React.ReactNode;
}

// Cookie utilities
const COOKIE_NAME = "debug_overrides";
const DEBUG_DURATION_HOURS = 3;

const setCookie = (name: string, value: string, hours: number) => {
	if (typeof document === "undefined") return;
	const expires = new Date();
	expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
	if (typeof document === "undefined") return null;
	const nameEQ = name + "=";
	const ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

const deleteCookie = (name: string) => {
	if (typeof document === "undefined") return;
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
};

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
	const router = useRouter();
	const pathname = usePathname();

	// Initialize debug state from cookies and localStorage
	const initializeDebugState = (): {
		enabled: boolean;
		overrides: DebugOverrides;
	} => {
		if (
			typeof window === "undefined" ||
			process.env.NEXT_PUBLIC_API_ENVIRONMENT !== "development"
		) {
			return { enabled: false, overrides: {} };
		}

		try {
			// First try cookies (for persistence across tabs/reloads)
			const cookieData = getCookie(COOKIE_NAME);
			if (cookieData) {
				const parsed = JSON.parse(decodeURIComponent(cookieData));
				if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
					return {
						enabled: parsed.enabled || false,
						overrides: parsed.overrides || {},
					};
				}
			}

			// Fallback to localStorage for backward compatibility
			const savedDebugState = localStorage.getItem("debug-overrides");
			if (savedDebugState) {
				const parsed = JSON.parse(savedDebugState);
				return {
					enabled: parsed.enabled || false,
					overrides: parsed.overrides || {},
				};
			}
		} catch (error) {
			console.warn("Failed to parse debug state:", error);
		}

		return { enabled: false, overrides: {} };
	};

	const [isDebugMode, setIsDebugMode] = useState(
		() => initializeDebugState().enabled
	);
	const [debugOverrides, setDebugOverrides] = useState<DebugOverrides>(
		() => initializeDebugState().overrides
	);

	// Save debug state to both cookies and localStorage
	const saveDebugState = (enabled: boolean, overrides: DebugOverrides) => {
		if (process.env.NEXT_PUBLIC_API_ENVIRONMENT !== "development") return;

		const expiresAt = Date.now() + DEBUG_DURATION_HOURS * 60 * 60 * 1000;
		const stateData = {
			enabled,
			overrides: { ...overrides, expiresAt },
		};

		// Save to cookies (primary storage)
		setCookie(
			COOKIE_NAME,
			encodeURIComponent(JSON.stringify(stateData)),
			DEBUG_DURATION_HOURS
		);

		// Save to localStorage (backup)
		localStorage.setItem("debug-overrides", JSON.stringify(stateData));
	};

	// Auto-save when state changes
	useEffect(() => {
		saveDebugState(isDebugMode, debugOverrides);
	}, [isDebugMode, debugOverrides]);

	// Check for expired debug sessions
	const isDebugExpired = useCallback((): boolean => {
		if (!debugOverrides.expiresAt) return false;
		return Date.now() > debugOverrides.expiresAt;
	}, [debugOverrides.expiresAt]);

	// Extend debug session
	const extendDebugSession = () => {
		if (process.env.NEXT_PUBLIC_API_ENVIRONMENT === "development") {
			const newExpiresAt = Date.now() + DEBUG_DURATION_HOURS * 60 * 60 * 1000;
			setDebugOverrides((prev) => ({ ...prev, expiresAt: newExpiresAt }));
		}
	};

	const disableDebugMode = () => {
		setIsDebugMode(false);
		setDebugOverrides({});
		// Clear cookies
		deleteCookie(COOKIE_NAME);
		localStorage.removeItem("debug-overrides");
		// Reload the page to ensure all components reflect the original role
		if (typeof window !== "undefined") {
			setTimeout(() => {
				window.location.reload();
			}, 50);
		}
	};

	// Auto-cleanup expired sessions
	useEffect(() => {
		if (isDebugMode && isDebugExpired()) {
			console.log("Debug session expired, cleaning up...");
			disableDebugMode();
		}
	}, [pathname, isDebugMode, isDebugExpired]); // Check on navigation

	const setDebugRole = (role: Role | undefined, navigate: boolean = true) => {
		setDebugOverrides((prev) => ({ ...prev, role }));

		// Navigate to the appropriate URL for the new role
		if (navigate && role && typeof window !== "undefined") {
			const targetPath = getRoleBasePath(role);
			const currentPath = pathname;

			// Only navigate if we're not already on a valid path for this role
			if (!isValidPathForRole(role, currentPath)) {
				console.log(
					`Debug: Navigating from ${currentPath} to ${targetPath} for role ${role}`
				);
				router.push(targetPath);
			}
		}

		// Dispatch event to trigger updates in components that need it
		// This ensures sidebar and other components re-render immediately
		if (typeof window !== "undefined") {
			setTimeout(() => {
				window.dispatchEvent(
					new CustomEvent("debug-role-changed", { detail: { role } })
				);
				// Also dispatch a storage event to trigger sidebar reactivity
				window.dispatchEvent(
					new StorageEvent("storage", {
						key: "debug-role-update",
						newValue: role || "",
						url: window.location.href,
					})
				);
				// Reload the page to ensure all components reflect the new debug role
				// This is the most reliable way to ensure consistency across all components
				window.location.reload();
			}, 50);
		}
	};

	const setDebugEmail = (email: string | undefined) => {
		setDebugOverrides((prev) => ({ ...prev, email }));
	};

	const setDebugPermissions = (permissions: string[] | undefined) => {
		setDebugOverrides((prev) => ({ ...prev, permissions }));
	};

	const resetDebugOverrides = () => {
		setDebugOverrides({});
		// Reload the page to ensure all components reflect the original role
		if (typeof window !== "undefined") {
			setTimeout(() => {
				window.location.reload();
			}, 50);
		}
	};

	const enableDebugMode = () => {
		if (process.env.NEXT_PUBLIC_API_ENVIRONMENT === "development") {
			setIsDebugMode(true);
			extendDebugSession(); // Set expiration time
		}
	};

	const value: DebugContextType = {
		isDebugMode:
			process.env.NEXT_PUBLIC_API_ENVIRONMENT === "development" &&
			isDebugMode &&
			!isDebugExpired(),
		debugOverrides,
		setDebugRole,
		setDebugEmail,
		setDebugPermissions,
		resetDebugOverrides,
		enableDebugMode,
		disableDebugMode,
		isDebugExpired,
		extendDebugSession,
	};

	return (
		<DebugContext.Provider value={value}>{children}</DebugContext.Provider>
	);
};

export { AVAILABLE_ROLES };
export type { Role, DebugOverrides };
