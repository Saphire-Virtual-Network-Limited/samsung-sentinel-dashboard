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
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd"
): ScanPartnerSalesData => {
	// Fetch partner stats with period filter
	const {
		data: partnerStats,
		error: statsError,
		isLoading: isStatsLoading,
	} = useSWR(
		partnerId ? `scan-partner-stats-${partnerId}-${period || "default"}` : null,
		() =>
			partnerId
				? getMobiflexScanPartnerStatsById(partnerId, period).then((r) => r.data)
				: null,
		{
			refreshInterval: 5 * 60 * 1000, // 5 minutes
			revalidateOnFocus: false,
			dedupingInterval: 2 * 60 * 1000, // 2 minutes
			shouldRetryOnError: true,
		}
	);

	// Fetch approved agents data (not period-dependent)
	const {
		data: approvedAgents,
		error: agentsError,
		isLoading: isAgentsLoading,
	} = useSWR(
		partnerId ? `scan-partner-approved-agents-${partnerId}` : null,
		() =>
			partnerId
				? getMobiflexPartnerApprovedAgents(partnerId).then((r) => r.data)
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

/**
 * Hook to get sales summary data for multiple scan partners
 */
export const useScanPartnerSalesSummary = (
	period?: "daily" | "weekly" | "monthly" | "yearly"
) => {
	return useSWR(
		`scan-partner-sales-summary-${period || "default"}`,
		async () => {
			// This could be expanded to fetch aggregated data across all partners
			// For now, we'll use the existing partner stats endpoint
			const response = await fetch(
				`/api/mobiflex/partner-stats?period=${period || "monthly"}`
			);
			return response.json();
		},
		{
			refreshInterval: 5 * 60 * 1000,
			revalidateOnFocus: false,
			dedupingInterval: 2 * 60 * 1000,
		}
	);
};
