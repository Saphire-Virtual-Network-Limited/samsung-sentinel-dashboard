import useSWR from "swr";
import {
	getServiceCenterDashboardStats,
	ServiceCenterStatistics,
	DashboardFilterParams,
} from "@/lib/api/dashboard";
import { BaseApiResponse } from "@/lib/api/shared";

export function useServiceCenterDashboard(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR(
		options
			? ["service-center-dashboard", options]
			: "service-center-dashboard",
		async () => {
			const result = await getServiceCenterDashboardStats(options);
			return {
				data: result,
				status: "success",
				message: "",
			} as BaseApiResponse<ServiceCenterStatistics>;
		},
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		stats: data?.data,
		isLoading,
		error,
		refetch: mutate,
	};
}
