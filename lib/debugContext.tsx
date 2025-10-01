"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Available roles from the permissions system  
const AVAILABLE_ROLES = [
	"ADMIN",
	"SUB_ADMIN", 
	"SALES",
	"FINANCE",
	"HR",
	"INVENTORY",
	"AUDIT",
	"COLLECTION_ADMIN",
	"COLLECTION_OFFICER",
	"DEV",
	"SUPPORT",
	"VERIFY",
	"SCAN_PARTNER",
	"SERVICE_CENTER"
] as const;

type Role = typeof AVAILABLE_ROLES[number];

interface DebugOverrides {
	role?: Role;
	email?: string;
	permissions?: string[];
}

interface DebugContextType {
	isDebugMode: boolean;
	debugOverrides: DebugOverrides;
	setDebugRole: (role: Role | undefined) => void;
	setDebugEmail: (email: string | undefined) => void;
	setDebugPermissions: (permissions: string[] | undefined) => void;
	resetDebugOverrides: () => void;
	enableDebugMode: () => void;
	disableDebugMode: () => void;
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

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
	const [isDebugMode, setIsDebugMode] = useState(false);
	const [debugOverrides, setDebugOverrides] = useState<DebugOverrides>({});

	// Only enable debug mode in development
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			const savedDebugState = localStorage.getItem("debug-overrides");
			if (savedDebugState) {
				try {
					const parsed = JSON.parse(savedDebugState);
					setDebugOverrides(parsed.overrides || {});
					setIsDebugMode(parsed.enabled || false);
				} catch (error) {
					console.warn("Failed to parse debug state:", error);
				}
			}
		}
	}, []);

	// Save debug state to localStorage
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			localStorage.setItem("debug-overrides", JSON.stringify({
				enabled: isDebugMode,
				overrides: debugOverrides
			}));
		}
	}, [isDebugMode, debugOverrides]);

	const setDebugRole = (role: Role | undefined) => {
		setDebugOverrides(prev => ({ ...prev, role }));
	};

	const setDebugEmail = (email: string | undefined) => {
		setDebugOverrides(prev => ({ ...prev, email }));
	};

	const setDebugPermissions = (permissions: string[] | undefined) => {
		setDebugOverrides(prev => ({ ...prev, permissions }));
	};

	const resetDebugOverrides = () => {
		setDebugOverrides({});
	};

	const enableDebugMode = () => {
		if (process.env.NODE_ENV === "development") {
			setIsDebugMode(true);
		}
	};

	const disableDebugMode = () => {
		setIsDebugMode(false);
		setDebugOverrides({});
	};

	const value: DebugContextType = {
		isDebugMode: process.env.NODE_ENV === "development" && isDebugMode,
		debugOverrides,
		setDebugRole,
		setDebugEmail,
		setDebugPermissions,
		resetDebugOverrides,
		enableDebugMode,
		disableDebugMode,
	};

	return (
		<DebugContext.Provider value={value}>
			{children}
		</DebugContext.Provider>
	);
};

export { AVAILABLE_ROLES };
export type { Role, DebugOverrides };