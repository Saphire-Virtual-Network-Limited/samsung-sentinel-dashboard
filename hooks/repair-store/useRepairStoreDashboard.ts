import useSWR from "swr";
import {
	getRepairStoreDashboardStats,
	getRepairStoreDetails,
	getServiceCenterComparison,
	DashboardFilterParams,
	RepairStoreStatistics,
	RepairStoreDetails,
	ServiceCenterComparison,
} from "@/lib/api/dashboard";
import { BaseApiResponse } from "@/lib/api/shared";

export function useRepairStoreDashboard(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<RepairStoreStatistics>(
		options
			? ["repair-store-dashboard-stats", options]
			: "repair-store-dashboard-stats",
		() => getRepairStoreDashboardStats(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		stats: data,
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useRepairStoreDetails(
	options?: DashboardFilterParams & { service_center_id?: string }
) {
	const { data, error, mutate, isLoading } = useSWR<RepairStoreDetails>(
		options
			? ["repair-store-dashboard-details", options]
			: "repair-store-dashboard-details",
		() => getRepairStoreDetails(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		details: data,
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useServiceCenterComparison(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<ServiceCenterComparison>(
		options
			? ["service-center-comparison", options]
			: "service-center-comparison",
		() => getServiceCenterComparison(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		comparison: data,
		isLoading,
		error,
		refetch: mutate,
	};
}
