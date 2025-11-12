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

export interface ServiceCenterStatistics {
	totalClaims: number;
	pendingClaims: number;
	approvedClaims: number;
	rejectedClaims: number;
	completedClaims: number;
	inProgressClaims: number;
	totalRepairCost: number;
	averageRepairCost: number;
	// Add more fields as needed based on API response
}

export async function getServiceCenterDashboardStats(
	params?: DashboardFilterParams
): Promise<BaseApiResponse<ServiceCenterStatistics>> {
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
	totalClaims: number;
	authorizedRepairs: number;
	totalRepairCost: number;
	claimsRate: number;
	// Add more fields based on API response
}

export interface AdminTrends {
	claims: Array<{ date: string; count: number }>;
	repairCosts: Array<{ date: string; amount: number }>;
	// Add more fields based on API response
}

export interface DeviceModelStats {
	deviceModel: string;
	totalRepairs: number;
	totalCost: number;
	averageCost: number;
	// Add more fields based on API response
}

export interface ServiceCenterStats {
	serviceCenterId: string;
	serviceCenterName: string;
	totalClaims: number;
	completedClaims: number;
	totalCost: number;
	averageCompletionTime: number;
	// Add more fields based on API response
}

export async function getAdminStatistics(
	params?: DashboardFilterParams
): Promise<BaseApiResponse<AdminStatistics>> {
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
): Promise<BaseApiResponse<AdminTrends>> {
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
): Promise<BaseApiResponse<DeviceModelStats[]>> {
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
): Promise<BaseApiResponse<ServiceCenterStats[]>> {
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
	totalClaims: number;
	pendingClaims: number;
	approvedClaims: number;
	completedClaims: number;
	totalRepairCost: number;
	totalServiceCenters: number;
	totalEngineers: number;
	// Add more fields based on API response
}

export interface RepairStoreDetails {
	statistics: RepairStoreStatistics;
	trends: any; // Define based on actual API response
	// Add more fields based on API response
}

export interface ServiceCenterComparison {
	serviceCenterId: string;
	serviceCenterName: string;
	totalClaims: number;
	completedClaims: number;
	avgCompletionTime: number;
	totalCost: number;
	// Add more fields based on API response
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
): Promise<BaseApiResponse<ServiceCenterComparison[]>> {
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
