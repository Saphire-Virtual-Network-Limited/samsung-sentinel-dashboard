import useSWR from "swr";
import type { AgentType } from "@/view/dashboard/user-management/user";
import { useAuth } from "@/lib";
import { inviteAdmin } from "@/lib/api";
import { useMemo } from "react";
interface UseAgentDataReturn {
	agentTypes: AgentType[];
	agentError: Error | undefined;
	isLoading: boolean;
}

export const fallbackAgentTypes: AgentType[] = [
	{ label: "User", value: "USER" },
	{ label: "Super Admin", value: "SUPER_ADMIN" },
	{ label: "Admin", value: "ADMIN" },
	{ label: "Developer", value: "DEVELOPER" },
	{ label: "Merchant", value: "MERCHANT" },
	{ label: "Finance", value: "FINANCE" },
	{ label: "Verification", value: "VERIFICATION" },
	{ label: "Ver", value: "VER" },
	{ label: "Support", value: "SUPPORT" },
	{ label: "Telesales", value: "TELESALES" },
	{ label: "Human Resource", value: "HUMAN_RESOURCE" },
	{ label: "Verification Officer", value: "VERIFICATION_OFFICER" },
	{ label: "Inventory Manager", value: "INVENTORY_MANAGER" },
	{ label: "Agent", value: "AGENT" },
	{ label: "Store Branch Manager", value: "STORE_BRANCH_MANAGER" },
	{ label: "Store Manager", value: "STORE_MANAGER" },
	{ label: "Sales Manager", value: "SALES_MANAGER" },
	{ label: "Collection Admin", value: "COLLECTION_ADMIN" },
	{ label: "Collection Officer", value: "COLLECTION_OFFICER" },
	{ label: "Zoho Notifier", value: "ZOHO_NOTIFIER" },
	{ label: "Scan Partner", value: "SCAN_PARTNER" },
	{ label: "MBE", value: "MBE" },
	{ label: "Mobiflex MBE", value: "MOBIFLEX_MBE" },
	{ label: "Recovery Agent", value: "RECOVERY_AGENT" },
	{ label: "Recovery Supervisor", value: "RECOVERY_SUPERVISOR" },
	{ label: "Audit", value: "AUDIT" },
	{ label: "Cluster Supervisor", value: "CLUSTER_SUPERVISOR" },
	{ label: "State Manager", value: "STATE_MANAGER" },
	{ label: "State Supervisor", value: "STATE_SUPERVISOR" },
	{ label: "Telemarketer", value: "TELEMARKETER" },
];

const fetchValidRoles = async (): Promise<AgentType[]> => {
	try {
		await inviteAdmin({
			firstName: "temp",
			lastName: "temp",
			email: "temp@temp.com",
			telephoneNumber: "1234567890",
			role: "GOD_OF_ALL_CREATIONS", // Invalid role to trigger validation
		});

		console.warn(
			"Expected validation error but got success - using fallback roles"
		);
		return fallbackAgentTypes;
	} catch (error: any) {
		console.log("Extracting roles from validation error:", error?.message);

		if (error?.message && Array.isArray(error.message)) {
			const roleMessage = error.message.find((msg: string) =>
				msg.includes("role must be one of the following values:")
			);

			if (roleMessage) {
				console.log("Successfully extracted roles from API validation");
				const rolesString = roleMessage.replace(
					"role must be one of the following values: ",
					""
				);
				const roles = rolesString
					.split(", ")
					.map((role: string) => role.trim());

				const agentTypes: AgentType[] = roles.map((role: string) => {
					let label = role;

					if (role === "MBE") {
						label = "MBE";
					} else if (role === "MOBIFLEX_MBE") {
						label = "Mobiflex MBE";
					} else if (role === "VER") {
						label = "Ver";
					} else if (role === "TELESALES") {
						label = "Telesales";
					} else if (role === "AUDIT") {
						label = "Audit";
					} else {
						label = role
							.split("_")
							.map(
								(word) =>
									word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
							)
							.join(" ");
					}

					return {
						label,
						value: role,
					};
				});

				return agentTypes;
			}
		}

		return fallbackAgentTypes;
	}
};

export const useAgentData = (): UseAgentDataReturn => {
	const { userResponse } = useAuth();
	const filteredFallbackData = useMemo(() => {
		const userRole = userResponse?.data?.role;

		if (userRole === "ADMIN") {
			return fallbackAgentTypes.filter((type) => type.value !== "SUPER_ADMIN");
		} else if (userRole === "SUPER_ADMIN" || userRole == "DEVELOPER") {
			return fallbackAgentTypes;
		} else {
			return [];
		}
	}, [userResponse?.data?.role]);

	const {
		data: fetchedAgentTypes,
		error: agentError,
		isLoading,
	} = useSWR<AgentType[], Error>(
		"agent-roles-from-validation",
		fetchValidRoles,
		{
			fallbackData: filteredFallbackData,
			revalidateOnFocus: false,
			dedupingInterval: 300000, // 5 minutes
		}
	);

	const agentTypes = useMemo(() => {
		const userRole = userResponse?.data?.role;
		const typesToFilter = fetchedAgentTypes || filteredFallbackData;

		if (userRole === "ADMIN") {
			return typesToFilter.filter((type) => type.value !== "SUPER_ADMIN");
		} else if (userRole === "SUPER_ADMIN" || userRole === "DEVELOPER") {
			return typesToFilter;
		} else {
			return [];
		}
	}, [fetchedAgentTypes, filteredFallbackData, userResponse?.data?.role]);

	return {
		agentTypes: agentTypes || fallbackAgentTypes,
		agentError,
		isLoading,
	};
};
