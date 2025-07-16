import useSWR from "swr";
import type { AgentType } from "@/view/dashboard/user-management/user";
import { useAuth } from "@/lib";
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
  { label: "Telemarketer", value: "TELEMARKETER" },
];

export const useAgentData = (): UseAgentDataReturn => {
  const { userResponse } = useAuth();
  const filteredFallbackData = useMemo(() => {
    const userRole = userResponse?.data?.role;

    if (userRole === "ADMIN") {
      return fallbackAgentTypes.filter(
        (type) => type.value !== "ADMIN" && type.value !== "SUPER_ADMIN"
      );
    } else if (userRole === "SUPER_ADMIN") {
      return fallbackAgentTypes;
    } else {
      return [];
    }
  }, [userResponse?.data?.role]);

  const {
    data: agentTypes,
    error: agentError,
    isLoading,
  } = useSWR<AgentType[], Error>("/api/agent-types", {
    fallbackData: filteredFallbackData,
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });

  return {
    agentTypes: agentTypes || fallbackAgentTypes,
    agentError,
    isLoading,
  };
};
