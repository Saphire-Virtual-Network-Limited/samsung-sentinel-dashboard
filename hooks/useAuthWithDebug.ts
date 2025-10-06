import { useAuth as useOriginalAuth } from "@/lib/globalContext";
import { useDebug } from "@/lib/debugContext";
import { getUserRole } from "@/lib/helper";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRoleBasePath, isValidPathForRole } from "@/lib/roleMapping";

export const useAuthWithDebug = () => {
	const auth = useOriginalAuth();
	const { isDebugMode, debugOverrides } = useDebug();
	const router = useRouter();
	const pathname = usePathname();

	// The globalContext now handles debug overrides internally
	// So we can get the effective role and email directly from userResponse
	const effectiveRole = auth.userResponse?.data?.role;
	const effectiveEmail = auth.userResponse?.data?.email;

	// Keep track of original values for debug info
	const originalRole = effectiveRole; // This comes from globalContext (with debug overrides applied)
	const originalEmail = effectiveEmail; // This comes from globalContext (with debug overrides applied)

	// Listen for debug role changes and navigate accordingly
	useEffect(() => {
		const handleDebugRoleChange = (event: CustomEvent) => {
			const { role } = event.detail;
			if (role && !isValidPathForRole(role, pathname)) {
				const targetPath = getRoleBasePath(role);
				console.log(
					`Debug role changed: navigating to ${targetPath} for role ${role}`
				);
				router.push(targetPath);
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener(
				"debug-role-changed",
				handleDebugRoleChange as EventListener
			);
			return () => {
				window.removeEventListener(
					"debug-role-changed",
					handleDebugRoleChange as EventListener
				);
			};
		}
	}, [pathname, router]);

	// Auto-navigate when debug mode changes the effective role
	useEffect(() => {
		if (isDebugMode && debugOverrides.role && effectiveRole !== originalRole) {
			if (!isValidPathForRole(effectiveRole, pathname)) {
				const targetPath = getRoleBasePath(effectiveRole);
				console.log(
					`Auto-navigating to ${targetPath} for debug role ${effectiveRole}`
				);
				setTimeout(() => router.push(targetPath), 100); // Small delay to avoid conflicts
			}
		}
	}, [
		isDebugMode,
		debugOverrides.role,
		effectiveRole,
		originalRole,
		pathname,
		router,
	]);

	return {
		...auth,
		// Add debug-aware properties
		debugInfo: {
			isDebugMode,
			originalRole,
			originalEmail,
			debugOverrides,
		},
		// userResponse already has debug overrides applied by globalContext
		userResponse: auth.userResponse,
		// Helper to get the processed role string
		getProcessedRole: () => getUserRole(effectiveRole),
	};
};
