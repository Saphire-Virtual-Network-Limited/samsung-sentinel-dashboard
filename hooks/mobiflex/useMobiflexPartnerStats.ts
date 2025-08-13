import useSWR from "swr";
import {
	getMobiflexPartnerStats,
	PartnerStatsData,
	type PartnerStat,
} from "@/lib/api";

// Re-export types for backward compatibility
export type { PartnerStat, PartnerStatsData };

// Interface for actual API response structure
interface ActualPartnerStatsResponse {
	period: string;
	current: {
		partnerStats: PartnerStat[];
		summary: {
			totalPartners: number;
			grandTotalCommission: number;
			grandTotalAgentCommission: number;
			grandTotalPartnerCommission: number;
			totalCommissions: number;
			totalAgents: number;
			topPerformingPartner: PartnerStat | null;
			averageAgentsPerPartner: number;
		};
	};
	previous: {
		partnerStats: PartnerStat[];
		summary: {
			totalPartners: number;
			grandTotalCommission: number;
			grandTotalAgentCommission: number;
			grandTotalPartnerCommission: number;
			totalCommissions: number;
			totalAgents: number;
			topPerformingPartner: PartnerStat | null;
			averageAgentsPerPartner: number;
		};
	};
	comparison: {
		commissionChange: number;
		agentCommissionChange: number;
		partnerCommissionChange: number;
		commissionCountChange: number;
		agentCountChange: number;
		partnerCountChange: number;
	};
	dateRanges: {
		current: {
			start: string;
			end: string;
		};
		previous: {
			start: string;
			end: string;
		};
	};
}

// Interface for new flat API response structure (date range requests)
interface FlatPartnerStatsResponse {
	period: string;
	partnerStats: PartnerStat[];
	summary: {
		totalPartners: number;
		grandTotalCommission: number;
		grandTotalAgentCommission: number;
		grandTotalPartnerCommission: number;
		totalCommissions: number;
		totalAgents: number;
		topPerformingPartner: PartnerStat | null;
		averageAgentsPerPartner: number;
	};
	dateRange: {
		start: string;
		end: string;
	};
}

export interface PartnerStatsResponse {
	statusCode: number;
	message: string;
	data: ActualPartnerStatsResponse;
	responseTime: string;
	channel: string;
}

export const useMobiflexPartnerStats = (
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	sortBy?: "loans" | "commission",
	limit?: number
) => {
	const fetcher = async () => {
		const response = await getMobiflexPartnerStats(
			period,
			start_date,
			end_date,
			sortBy,
			limit,
			{
				useCache: true,
				cacheTTL: 5 * 60 * 1000, // 5 minutes
			}
		);

		// The actual API response structure (updated format)
		const actualData = response.data as any;

		// Debug logging to see the response structure
		console.log("Partner Stats API Response:", {
			period,
			start_date,
			end_date,
			response: actualData,
			hasPartnerStats: !!actualData.partnerStats,
			hasCurrent: !!actualData.current,
			isNewFormat: actualData.partnerStats && !actualData.current,
			partnerCount:
				actualData.partnerStats?.length ||
				actualData.current?.partnerStats?.length ||
				0,
		});

		// Check if this is the new flat structure or old nested structure
		const isNewFormat = actualData.partnerStats && !actualData.current;

		if (isNewFormat) {
			// New flat response structure (for date range requests)
			const flatData = actualData as FlatPartnerStatsResponse;
			const transformedData: PartnerStatsData = {
				period: flatData.period,
				partnerStats: flatData.partnerStats,
				summary: {
					...flatData.summary,
					topPerformingPartner:
						flatData.summary.topPerformingPartner || flatData.partnerStats[0],
				},
			};
			return transformedData;
		} else {
			// Old nested structure (for period-based requests)
			const nestedData = actualData as ActualPartnerStatsResponse;
			const transformedData: PartnerStatsData = {
				period: nestedData.period,
				partnerStats: nestedData.current.partnerStats,
				summary: {
					...nestedData.current.summary,
					topPerformingPartner:
						nestedData.current.summary.topPerformingPartner ||
						nestedData.current.partnerStats[0],
				},
			};
			return transformedData;
		}
	};

	// Create a cache key that includes all parameters
	const cacheKey = `mobiflex-partner-stats-${period || "default"}-${
		start_date || "no-start"
	}-${end_date || "no-end"}-${sortBy || "default"}-${limit || "unlimited"}`;

	return useSWR(cacheKey, fetcher, {
		refreshInterval: 5 * 60 * 1000, // 5 minutes
		errorRetryCount: 3,
		revalidateOnFocus: false,
		dedupingInterval: 2 * 60 * 1000, // 2 minutes
		shouldRetryOnError: true,
		revalidateIfStale: true,
	});
};
