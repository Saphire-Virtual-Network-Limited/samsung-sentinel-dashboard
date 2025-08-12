import useSWR from "swr";
import {
	getMobiflexLeaderboard,
	MobiflexLeaderboardData,
	type MobiflexAgent,
} from "@/lib/api";

// Re-export types for backward compatibility
export type { MobiflexAgent, MobiflexLeaderboardData };

export interface MobiflexLeaderboardResponse {
	statusCode: number;
	message: string;
	data: MobiflexLeaderboardData;
	responseTime: string;
	channel: string;
}

export const useMobiflexLeaderboard = (
	period?: "daily" | "weekly" | "monthly" | "yearly" | "mtd",
	start_date?: string,
	end_date?: string,
	sortBy?: "loans" | "commission",
	limit?: number
) => {
	const fetcher = async () => {
		const response = await getMobiflexLeaderboard(
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
		return response.data as MobiflexLeaderboardData;
	};

	// Create a cache key that includes all parameters
	const cacheKey = `mobiflex-leaderboard-${period || "default"}-${
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
