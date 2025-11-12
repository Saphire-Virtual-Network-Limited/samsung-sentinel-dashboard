import useSWR from "swr";
import {
	getPartnersStatistics,
	DashboardFilterParams,
	PartnersStatistics,
} from "@/lib/api/dashboard";
import { BaseApiResponse } from "@/lib/api/shared";

export function usePartnersDashboard(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<
		BaseApiResponse<PartnersStatistics>
	>(
		options
			? ["partners-dashboard-stats", options]
			: "partners-dashboard-stats",
		() => getPartnersStatistics(options),
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
