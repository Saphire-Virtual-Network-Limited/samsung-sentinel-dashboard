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
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd"
) => {
	const fetcher = async () => {
		const response = await getMobiflexRegionStats(period, {
			useCache: true,
			cacheTTL: 5 * 60 * 1000, // 5 minutes
		});
		return response.data as RegionStatsData;
	};

	return useSWR(`mobiflex-region-stats-${period || "default"}`, fetcher, {
		refreshInterval: 5 * 60 * 1000, // 5 minutes
		errorRetryCount: 3,
		revalidateOnFocus: false,
		dedupingInterval: 2 * 60 * 1000, // 2 minutes
		shouldRetryOnError: true,
		revalidateIfStale: true,
	});
};
