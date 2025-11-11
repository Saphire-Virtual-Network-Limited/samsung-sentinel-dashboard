import { apiCall, BaseApiResponse, UserStatus } from "../shared";

// ============================================================================
// SERVICE CENTERS APIs
// ============================================================================

// Types & Interfaces
export interface ServiceCenter {
	id: string;
	created_at: string;
	updated_at: string;
	created_by_id: string;
	updated_by_id: string | null;
	repair_store_id: string;
	name: string;
	email: string;
	phone: string;
	state: string;
	city: string;
	address: string;
	description?: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
	status: UserStatus;
	repair_store?: any;
	engineers_count?: number;
	engineers?: any[];
}

export interface CreateServiceCenterDto {
	name: string;
	email: string;
	phone: string;
	state: string;
	city: string;
	address: string;
	description?: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
	repair_store_id?: string;
}

export interface UpdateServiceCenterDto {
	name?: string;
	email?: string;
	phone?: string;
	state?: string;
	city?: string;
	address?: string;
	description?: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
}

export interface GetServiceCentersParams {
	repair_store_id?: string;
	status?: UserStatus;
	state?: string;
	city?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface PaginatedServiceCentersResponse {
	data: ServiceCenter[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// API Functions

/**
 * Create service center
 * @summary Create a new service center. Admin can create for any repair store. Repair store admin creates for their own store.
 * @tag Service Centers
 */
export async function createServiceCenter(
	data: CreateServiceCenterDto
): Promise<ServiceCenter> {
	return apiCall("/service-centers", "POST", data);
}

/**
 * Get all service centers
 * @summary Get all service centers with filters. Repair store admin only sees their service centers.
 * @tag Service Centers
 */
export async function getAllServiceCenters(
	params?: GetServiceCentersParams
): Promise<PaginatedServiceCentersResponse> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/service-centers?${queryParams}`, "GET");
}

/**
 * Get service center by ID
 * @tag Service Centers
 */
export async function getServiceCenterById(id: string): Promise<ServiceCenter> {
	return apiCall(`/service-centers/${id}`, "GET");
}

/**
 * Update service center
 * @summary Update service center details
 * @tag Service Centers
 */
export async function updateServiceCenter(
	id: string,
	data: UpdateServiceCenterDto
): Promise<ServiceCenter> {
	return apiCall(`/service-centers/${id}`, "PATCH", data);
}

/**
 * Activate service center
 * @summary Activate a deactivated service center
 * @tag Service Centers
 */
export async function activateServiceCenter(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/service-centers/${id}/activate`, "POST");
}

/**
 * Deactivate service center
 * @summary Deactivate a service center
 * @tag Service Centers
 */
export async function deactivateServiceCenter(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/service-centers/${id}/deactivate`, "POST");
}
