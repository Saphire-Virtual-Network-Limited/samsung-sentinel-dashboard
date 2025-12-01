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
	ServiceCenterStatsResponse,
} from "@/lib/api/dashboard";

export function useAdminDashboardStatistics(options?: DashboardFilterParams) {
	// Create a serialized key to ensure SWR detects parameter changes
	const swrKey = options
		? `admin-dashboard-stats?filter=${options.filter}${
				options.start_date ? `&start_date=${options.start_date}` : ""
		  }${options.end_date ? `&end_date=${options.end_date}` : ""}`
		: "admin-dashboard-stats";

	const { data, error, mutate, isLoading } = useSWR<AdminStatistics>(
		swrKey,
		() => getAdminStatistics(options),
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

export function useAdminTrends(options?: DashboardFilterParams) {
	// Create a serialized key to ensure SWR detects parameter changes
	const swrKey = options
		? `admin-dashboard-trends?filter=${options.filter}${
				options.start_date ? `&start_date=${options.start_date}` : ""
		  }${options.end_date ? `&end_date=${options.end_date}` : ""}`
		: "admin-dashboard-trends";

	const { data, error, mutate, isLoading } = useSWR<AdminTrends>(
		swrKey,
		() => getAdminTrends(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		trends: data,
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useDeviceModelStats(options?: DashboardFilterParams) {
	// Create a serialized key to ensure SWR detects parameter changes
	const swrKey = options
		? `admin-device-model-stats?filter=${options.filter}${
				options.start_date ? `&start_date=${options.start_date}` : ""
		  }${options.end_date ? `&end_date=${options.end_date}` : ""}`
		: "admin-device-model-stats";

	const { data, error, mutate, isLoading } = useSWR<DeviceModelStats>(
		swrKey,
		() => getDeviceModelStats(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		deviceStats: data,
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useServiceCenterStatsForAdmin(options?: DashboardFilterParams) {
	// Create a serialized key to ensure SWR detects parameter changes
	const swrKey = options
		? `admin-service-center-stats?filter=${options.filter}${
				options.start_date ? `&start_date=${options.start_date}` : ""
		  }${options.end_date ? `&end_date=${options.end_date}` : ""}`
		: "admin-service-center-stats";

	const { data, error, mutate, isLoading } = useSWR<ServiceCenterStatsResponse>(
		swrKey,
		() => getServiceCenterStatsForAdmin(options),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	);

	return {
		serviceCenterStats: data,
		isLoading,
		error,
		refetch: mutate,
	};
}
