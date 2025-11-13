import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// DASHBOARD APIs
// ============================================================================

// Common filter types
export type DashboardFilter =
	| "daily"
	| "weekly"
	| "mtd"
	| "inception"
	| "custom";

export interface DashboardFilterParams {
	filter?: DashboardFilter;
	start_date?: string; // YYYY-MM-DD
	end_date?: string; // YYYY-MM-DD
}

// ============================================================================
// SERVICE CENTER DASHBOARD
// ============================================================================

export interface ServiceCenterClaimStatistics {
	pending: { count: number; percentage: string } | null;
	approved: { count: number; percentage: string } | null;
	rejected: { count: number; percentage: string } | null;
	authorized: { count: number; percentage: string } | null;
	completed: { count: number; percentage: string } | null;
	paid: { count: number; percentage: string } | null;
	total: number;
}

export interface ServiceCenterAggregates {
	total_repair_cost: number;
	average_repair_time_days: string;
	completion_rate: string;
}

export interface ServiceCenterStatistics {
	filter: {
		type: string;
		start_date?: string;
		end_date?: string;
	};
	claim_statistics: ServiceCenterClaimStatistics;
	aggregates: ServiceCenterAggregates;
	_debug?: {
		endpoint: string;
		method: string;
		responseStatus: number;
		timestamp: string;
	};
}

export async function getServiceCenterDashboardStats(
	params?: DashboardFilterParams
): Promise<ServiceCenterStatistics> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/service-center/dashboard/statistics${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

export interface AdminStatistics {
	filter: {
		type: string;
		start_date?: string;
		end_date?: string;
	};
	statistics: {
		authorized_repairs: number;
		total_repairs: number;
		total_sapphire_cost: number;
		total_repair_cost: number;
		unpaid_repair_cost: number;
		unpaid_sapphire_cost: number;
		total_imeis_uploaded: number;
		claims_rate: string;
	};
	_debug?: {
		endpoint: string;
		method: string;
		responseStatus: number;
		timestamp: string;
	};
}

export interface AdminTrends {
	filter: {
		type: string;
		start_date?: string;
		end_date?: string;
	};
	trends: {
		claims_over_time: Array<{ date: string; count: number }>;
		repair_cost_over_time: Array<{
			date: string;
			paid_amount: number;
			total_amount: number;
		}>;
	};
	_debug?: {
		endpoint: string;
		method: string;
		responseStatus: number;
		timestamp: string;
	};
}

export interface DeviceModelStat {
	product_name: string;
	completed_repairs: number;
	pending_repairs: number;
	authorized_repairs: number;
	rejected_repairs: number;
	total_claims: number;
	total_cost: number;
	total_unpaid_cost: number;
	total_imeis_uploaded: number;
	claim_rate: string;
}

export interface DeviceModelStats {
	filter: {
		type: string;
		start_date?: string;
		end_date?: string;
	};
	device_statistics: DeviceModelStat[];
	_debug?: {
		endpoint: string;
		method: string;
		responseStatus: number;
		timestamp: string;
	};
}

export interface ServiceCenterStat {
	service_center_name: string;
	location: string;
	approved_repairs: number;
	completed_repairs: number;
	rejected_repairs: number;
	pending_repairs: number;
	authorized_repairs: number;
}

export interface ServiceCenterStatsResponse {
	filter: {
		type: string;
		start_date?: string;
		end_date?: string;
	};
	service_center_statistics: ServiceCenterStat[];
	_debug?: {
		endpoint: string;
		method: string;
		responseStatus: number;
		timestamp: string;
	};
}

export async function getAdminStatistics(
	params?: DashboardFilterParams
): Promise<AdminStatistics> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/admin/dashboard/statistics${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}

export async function getAdminTrends(
	params?: DashboardFilterParams
): Promise<AdminTrends> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/admin/dashboard/trends${queryString ? `?${queryString}` : ""}`;

	return apiCall(url, "GET");
}

export async function getDeviceModelStats(
	params?: DashboardFilterParams
): Promise<DeviceModelStats> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/admin/dashboard/device-model-stats${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}

export async function getServiceCenterStatsForAdmin(
	params?: DashboardFilterParams
): Promise<ServiceCenterStatsResponse> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/admin/dashboard/service-center-stats${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}

// ============================================================================
// REPAIR STORE DASHBOARD
// ============================================================================

export interface RepairStoreStatistics {
	filter: {
		type: string;
	};
	overview: {
		total_service_centers: number;
		total_engineers: number;
		monthly_revenue: number;
		total_revenue: number;
		total_repairs: number;
		pending_claims: number;
		in_progress_claims: number;
		completed_claims: number;
	};
}

export interface MonthlyRevenueTrend {
	month: string;
	revenue: number;
}

export interface ServiceCenterPerformance {
	state: string;
	number_of_repairs: number;
}

export interface RepairStoreDetails {
	filter: {
		type: string;
		service_center_id?: string; // Optional - only present when filtering by specific center
	};
	details: {
		number_of_engineers: number;
		total_repairs: number;
		total_revenue: number;
		monthly_revenue_trend: MonthlyRevenueTrend[];
		service_center_performance: ServiceCenterPerformance[];
	};
}

export interface ServiceCenterComparisonData {
	service_center_name: string;
	number_of_engineers: number;
	number_of_repairs: number;
	total_revenue: number;
}

export interface ServiceCenterComparison {
	filter: {
		type: string;
		start_date?: string;
		end_date?: string;
	};
	comparison: ServiceCenterComparisonData[];
}

export async function getRepairStoreDashboardStats(
	params?: DashboardFilterParams
): Promise<BaseApiResponse<RepairStoreStatistics>> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/repair-store/dashboard/statistics${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}

export async function getRepairStoreDetails(
	params?: DashboardFilterParams & {
		service_center_id?: string;
	}
): Promise<BaseApiResponse<RepairStoreDetails>> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);
	if (params?.service_center_id)
		queryParams.set("service_center_id", params.service_center_id);

	const queryString = queryParams.toString();
	const url = `/repair-store/dashboard/details${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}

export async function getServiceCenterComparison(
	params?: DashboardFilterParams
): Promise<BaseApiResponse<ServiceCenterComparison>> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/repair-store/dashboard/comparison${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}

// ============================================================================
// SAMSUNG PARTNERS DASHBOARD
// ============================================================================

export interface PartnersStatistics {
	totalClaims: number;
	totalRepairs: number;
	totalRepairCost: number;
	pendingClaims: number;
	completedClaims: number;
	// Add more fields based on API response
}

export async function getPartnersStatistics(
	params?: DashboardFilterParams
): Promise<BaseApiResponse<PartnersStatistics>> {
	const queryParams = new URLSearchParams();
	if (params?.filter) queryParams.set("filter", params.filter);
	if (params?.start_date) queryParams.set("start_date", params.start_date);
	if (params?.end_date) queryParams.set("end_date", params.end_date);

	const queryString = queryParams.toString();
	const url = `/partners/dashboard/statistics${
		queryString ? `?${queryString}` : ""
	}`;

	return apiCall(url, "GET");
}
