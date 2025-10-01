import { useAuth as useOriginalAuth } from "@/lib/globalContext";
import { useDebug } from "@/lib/debugContext";
import { getUserRole } from "@/lib/helper";

export const useAuthWithDebug = () => {
	const auth = useOriginalAuth();
	const { isDebugMode, debugOverrides } = useDebug();

	// Get the effective role (debug override or original)
	const originalRole = auth.userResponse?.data?.role;
	const effectiveRole = isDebugMode && debugOverrides.role 
		? debugOverrides.role 
		: originalRole;

	// Get the effective email (debug override or original)  
	const originalEmail = auth.userResponse?.data?.email;
	const effectiveEmail = isDebugMode && debugOverrides.email
		? debugOverrides.email
		: originalEmail;

	return {
		...auth,
		// Add debug-aware properties
		debugInfo: {
			isDebugMode,
			originalRole,
			originalEmail,
			debugOverrides,
		},
		// Override with debug values when debug mode is active
		userResponse: auth.userResponse ? {
			...auth.userResponse,
			data: auth.userResponse.data ? {
				...auth.userResponse.data,
				role: effectiveRole,
				email: effectiveEmail,
			} : null
		} : null,
		// Helper to get the processed role string
		getProcessedRole: () => getUserRole(effectiveRole),
	};
};