import useSWR from "swr";
import {
	getAdminStatistics,
	getAdminTrends,
	getDeviceModelStats,
	getServiceCenterStatsForAdmin,
	DashboardFilterParams,
	AdminStatistics,
	AdminTrends,
	DeviceModelStats,
	ServiceCenterStats,
} from "@/lib/api/dashboard";
import { BaseApiResponse } from "@/lib/api/shared";

export function useAdminDashboardStatistics(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<
		BaseApiResponse<AdminStatistics>
	>(
		options ? ["admin-dashboard-stats", options] : "admin-dashboard-stats",
		() => getAdminStatistics(options),
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

export function useAdminTrends(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<
		BaseApiResponse<AdminTrends>
	>(
		options ? ["admin-dashboard-trends", options] : "admin-dashboard-trends",
		() => getAdminTrends(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		trends: data?.data,
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useDeviceModelStats(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<
		BaseApiResponse<DeviceModelStats[]>
	>(
		options
			? ["admin-device-model-stats", options]
			: "admin-device-model-stats",
		() => getDeviceModelStats(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		deviceStats: data?.data,
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useServiceCenterStatsForAdmin(options?: DashboardFilterParams) {
	const { data, error, mutate, isLoading } = useSWR<
		BaseApiResponse<ServiceCenterStats[]>
	>(
		options
			? ["admin-service-center-stats", options]
			: "admin-service-center-stats",
		() => getServiceCenterStatsForAdmin(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		serviceCenterStats: data?.data,
		isLoading,
		error,
		refetch: mutate,
	};
}
