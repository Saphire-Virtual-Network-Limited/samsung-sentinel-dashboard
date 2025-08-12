import useSWR from "swr";
import {
	getMobiflexScanPartnerStatsById,
	getMobiflexPartnerApprovedAgents,
	PartnerSpecificData,
	PartnerAgentStatusData,
} from "@/lib/api";

// Re-export types for convenience
export type { PartnerSpecificData, PartnerAgentStatusData };

export interface ScanPartnerSalesData {
	partnerStats: PartnerSpecificData | null;
	approvedAgents: PartnerAgentStatusData | null;
	isLoading: boolean;
	error: any;
}

/**
 * Hook to fetch comprehensive sales data for a specific scan partner
 */
export const useScanPartnerSales = (
	partnerId: string | null,
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string
): ScanPartnerSalesData => {
	// Create cache keys that include all parameters
	const statsCacheKey = partnerId
		? `scan-partner-stats-${partnerId}-${period || "default"}-${
				start_date || "no-start"
		  }-${end_date || "no-end"}`
		: null;
	const agentsCacheKey = partnerId
		? `scan-partner-approved-agents-${partnerId}-${period || "default"}-${
				start_date || "no-start"
		  }-${end_date || "no-end"}`
		: null;

	// Fetch partner stats with period and date range filters
	const {
		data: partnerStats,
		error: statsError,
		isLoading: isStatsLoading,
	} = useSWR(
		statsCacheKey,
		() =>
			partnerId
				? getMobiflexScanPartnerStatsById(
						partnerId,
						period,
						start_date,
						end_date
				  ).then((r) => r.data)
				: null,
		{
			refreshInterval: 5 * 60 * 1000, // 5 minutes
			revalidateOnFocus: false,
			dedupingInterval: 2 * 60 * 1000, // 2 minutes
			shouldRetryOnError: true,
		}
	);

	// Fetch approved agents data with period and date range filters
	const {
		data: approvedAgents,
		error: agentsError,
		isLoading: isAgentsLoading,
	} = useSWR(
		agentsCacheKey,
		() =>
			partnerId
				? getMobiflexPartnerApprovedAgents(
						partnerId,
						period,
						start_date,
						end_date
				  ).then((r) => r.data)
				: null,
		{
			refreshInterval: 5 * 60 * 1000,
			revalidateOnFocus: false,
			dedupingInterval: 2 * 60 * 1000,
			shouldRetryOnError: true,
		}
	);

	return {
		partnerStats: partnerStats || null,
		approvedAgents: approvedAgents || null,
		isLoading: isStatsLoading || isAgentsLoading,
		error: statsError || agentsError,
	};
};
