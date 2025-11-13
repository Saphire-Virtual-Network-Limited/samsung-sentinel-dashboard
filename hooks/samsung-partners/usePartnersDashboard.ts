import useSWR from "swr";
import {
	getPartnersDashboardStatistics,
	DashboardFilterParams,
	PartnersStatistics,
} from "@/lib/api/partners";
import { BaseApiResponse } from "@/lib/api/shared";

export function usePartnersDashboard(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<
		BaseApiResponse<PartnersStatistics>
	>(
		options
			? ["partners-dashboard-stats", options]
			: "partners-dashboard-stats",
		() => getPartnersDashboardStatistics(options),
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
