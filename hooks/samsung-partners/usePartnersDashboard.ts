import useSWR from "swr";
import {
	getPartnersDashboardStatistics,
	DashboardFilterParams,
	PartnersStatistics,
} from "@/lib/api/partners";
import { BaseApiResponse } from "@/lib/api/shared";

export function usePartnersDashboard(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR(
		options
			? ["partners-dashboard-stats", options]
			: "partners-dashboard-stats",
		() => getPartnersDashboardStatistics(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	// The API is supposed to return BaseApiResponse<PartnersStatistics> but actually returns PartnersStatistics directly
	// Handle both cases for safety
	const stats = (data as any)?.data || (data as unknown as PartnersStatistics);

	return {
		stats: stats as PartnersStatistics | undefined,
		isLoading,
		error,
		refetch: mutate,
	};
}
