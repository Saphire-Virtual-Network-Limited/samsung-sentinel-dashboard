import { apiCall, BaseApiResponse, UserStatus } from "../shared";

// ============================================================================
// REPAIR STORES APIs
// ============================================================================

// Types & Interfaces
export interface RepairStore {
	id: string;
	name: string;
	email: string;
	phone: string;
	description?: string;
	location: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
	status: UserStatus;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRepairStoreDto {
	name: string;
	email: string;
	phone: string;
	description?: string;
	location: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
}

export interface UpdateRepairStoreDto {
	name?: string;
	phone?: string;
	description?: string;
	location?: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
}

export interface GetRepairStoresParams {
	status?: UserStatus;
	location?: string;
	search?: string;
	page?: number;
	limit?: number;
}

// API Functions

/**
 * Create repair store
 * @summary Create a new repair store with admin user. Admin only.
 * @tag Repair Stores
 */
export async function createRepairStore(
	data: CreateRepairStoreDto
): Promise<BaseApiResponse<RepairStore>> {
	return apiCall("/api/v1/repair-stores", "POST", data);
}

/**
 * Get all repair stores
 * @summary Get all repair stores with filters. Admin only.
 * @tag Repair Stores
 */
export async function getAllRepairStores(
	params?: GetRepairStoresParams
): Promise<BaseApiResponse<RepairStore[]>> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/api/v1/repair-stores?${queryParams}`, "GET");
}

/**
 * Get my repair store
 * @summary Get repair store for logged-in repair store admin
 * @tag Repair Stores
 */
export async function getMyRepairStore(): Promise<
	BaseApiResponse<RepairStore>
> {
	return apiCall("/api/v1/repair-stores/me", "GET");
}

/**
 * Get repair store by ID
 * @tag Repair Stores
 */
export async function getRepairStoreById(
	id: string
): Promise<BaseApiResponse<RepairStore>> {
	return apiCall(`/api/v1/repair-stores/${id}`, "GET");
}

/**
 * Update repair store
 * @tag Repair Stores
 */
export async function updateRepairStore(
	id: string,
	data: UpdateRepairStoreDto
): Promise<BaseApiResponse<RepairStore>> {
	return apiCall(`/api/v1/repair-stores/${id}`, "PATCH", data);
}

/**
 * Activate repair store
 * @tag Repair Stores
 */
export async function activateRepairStore(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/repair-stores/${id}/activate`, "POST");
}

/**
 * Deactivate repair store
 * @tag Repair Stores
 */
export async function deactivateRepairStore(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/repair-stores/${id}/deactivate`, "POST");
}

/**
 * Resend repair store admin invitation
 * @summary Resend invitation email to repair store admin
 * @tag Repair Stores
 */
export async function resendRepairStoreInvitation(): Promise<BaseApiResponse> {
	return apiCall("/api/v1/repair-stores/resend-invitation", "POST");
}
