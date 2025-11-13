import useSWR from "swr";
import {
	getServiceCenterDashboardStats,
	ServiceCenterStatistics,
	DashboardFilterParams,
} from "@/lib/api/dashboard";

export const useServiceCenterDashboardStats = (
	params?: DashboardFilterParams
) => {
	// Create a serialized key to ensure SWR detects parameter changes
	const swrKey = params
		? `/service-center/dashboard/statistics?filter=${params.filter}${
				params.start_date ? `&start_date=${params.start_date}` : ""
		  }${params.end_date ? `&end_date=${params.end_date}` : ""}`
		: "/service-center/dashboard/statistics";

	const { data, error, mutate, isLoading } = useSWR<ServiceCenterStatistics>(
		swrKey,
		() => getServiceCenterDashboardStats(params),
		{
			refreshInterval: 30000, // Refresh every 30 seconds
			revalidateOnFocus: true,
		}
	);

	return {
		stats: data,
		isLoading,
		error,
		mutate,
	};
};
