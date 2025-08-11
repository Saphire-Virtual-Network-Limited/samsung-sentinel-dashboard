import useSWR from "swr";
import {
	getMobiflexRegionStats,
	RegionStatsData,
	type RegionStat,
} from "@/lib/api";

// Re-export types for backward compatibility
export type { RegionStat, RegionStatsData };

export interface RegionStatsResponse {
	statusCode: number;
	message: string;
	data: RegionStatsData;
	responseTime: string;
	channel: string;
}

export const useMobiflexRegionStats = (
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	sortBy?: "loans" | "commission",
	limit?: number
) => {
	const fetcher = async () => {
		const response = await getMobiflexRegionStats(
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
		return response.data as RegionStatsData;
	};

	// Create a cache key that includes all parameters
	const cacheKey = `mobiflex-region-stats-${period || "default"}-${
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
