import { apiCall, BaseApiResponse, UserStatus } from "../shared";
import type { ServiceCenter } from "../service-centers";

// ============================================================================
// REPAIR STORES APIs
// ============================================================================

// Types & Interfaces
export type { ServiceCenter } from "../service-centers";

export interface RepairStore {
	id: string;
	created_at: string;
	updated_at: string;
	created_by_id: string | null;
	updated_by_id: string | null;
	name: string;
	email: string;
	phone: string;
	description?: string;
	location: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
	status: UserStatus;
	user_id: string | null;
	user: any | null;
	service_centers_count?: number; // Available in list view
	service_centers?: ServiceCenter[]; // Available in detail view
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

export interface PaginatedRepairStoresResponse {
	data: RepairStore[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// API Functions

/**
 * Create repair store
 * @summary Create a new repair store with admin user. Admin only.
 * @tag Repair Stores
 */
export async function createRepairStore(
	data: CreateRepairStoreDto
): Promise<RepairStore> {
	return apiCall("/repair-stores", "POST", data);
}

/**
 * Get all repair stores
 * @summary Get all repair stores with filters. Admin only.
 * @tag Repair Stores
 */
export async function getAllRepairStores(
	params?: GetRepairStoresParams
): Promise<PaginatedRepairStoresResponse> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/repair-stores?${queryParams}`, "GET");
}

/**
 * Get my repair store
 * @summary Get repair store for logged-in repair store admin
 * @tag Repair Stores
 */
export async function getMyRepairStore(): Promise<RepairStore> {
	return apiCall("/repair-stores/me", "GET");
}

/**
 * Get repair store by ID
 * @tag Repair Stores
 */
export async function getRepairStoreById(id: string): Promise<RepairStore> {
	return apiCall(`/repair-stores/${id}`, "GET");
}

/**
 * Update repair store
 * @tag Repair Stores
 */
export async function updateRepairStore(
	id: string,
	data: UpdateRepairStoreDto
): Promise<RepairStore> {
	return apiCall(`/repair-stores/${id}`, "PATCH", data);
}

/**
 * Activate repair store
 * @tag Repair Stores
 */
export async function activateRepairStore(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/repair-stores/${id}/activate`, "POST");
}

/**
 * Deactivate repair store
 * @tag Repair Stores
 */
export async function deactivateRepairStore(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/repair-stores/${id}/deactivate`, "POST");
}

/**
 * Resend repair store admin invitation
 * @summary Resend invitation email to repair store admin
 * @tag Repair Stores
 */
export async function resendRepairStoreInvitation(): Promise<BaseApiResponse> {
	return apiCall("/repair-stores/resend-invitation", "POST");
}
