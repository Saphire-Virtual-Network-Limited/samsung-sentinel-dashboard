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
  period?: "daily" | "weekly" | "monthly" | "yearly"
) => {
  const fetcher = async () => {
    const response = await getMobiflexLeaderboard(period, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
    return response.data as MobiflexLeaderboardData;
  };

  return useSWR(`mobiflex-leaderboard-${period || "default"}`, fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    errorRetryCount: 3,
    revalidateOnFocus: false,
    dedupingInterval: 2 * 60 * 1000, // 2 minutes
    shouldRetryOnError: true,
    revalidateIfStale: true,
  });
};
