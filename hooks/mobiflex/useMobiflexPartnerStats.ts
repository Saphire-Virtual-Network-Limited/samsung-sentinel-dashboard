import useSWR from "swr";
import {
	getMobiflexPartnerStats,
	PartnerStatsData,
	type PartnerStat,
} from "@/lib/api";

// Re-export types for backward compatibility
export type { PartnerStat, PartnerStatsData };

export interface PartnerStatsResponse {
	statusCode: number;
	message: string;
	data: PartnerStatsData;
	responseTime: string;
	channel: string;
}

export const useMobiflexPartnerStats = (
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd"
) => {
	const fetcher = async () => {
		const response = await getMobiflexPartnerStats(period, {
			useCache: true,
			cacheTTL: 5 * 60 * 1000, // 5 minutes
		});
		return response.data as PartnerStatsData;
	};

	return useSWR(`mobiflex-partner-stats-${period || "default"}`, fetcher, {
		refreshInterval: 5 * 60 * 1000, // 5 minutes
		errorRetryCount: 3,
		revalidateOnFocus: false,
		dedupingInterval: 2 * 60 * 1000, // 2 minutes
		shouldRetryOnError: true,
		revalidateIfStale: true,
	});
};
