import useSWR from "swr";
import {
  getCDFAdminDashboardStatistics,
  AdminDashboardStatistics,
} from "@/lib/api";

export const useAdminDashboardStatistics = () => {
  const fetcher = async () => {
    const response = await getCDFAdminDashboardStatistics();
    return response.data as AdminDashboardStatistics;
  };

  return useSWR("admin-dashboard-statistics", fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    errorRetryCount: 3,
    revalidateOnFocus: false,
  });
};
