import { apiCall, BaseApiResponse, UserStatus } from "../shared";
import type { ServiceCenter } from "../service-centers";
import { normalizePhoneNumber } from "@/utils/helpers";

// ============================================================================
// REPAIR STORES APIs
// ============================================================================

// Types & Interfaces
export type { ServiceCenter } from "../service-centers";

export interface RepairStoreUser {
	id: string;
	created_at: string;
	updated_at: string;
	email: string;
	password: string;
	name: string;
	phone: string | null;
	role: string;
	status: string;
	last_login: string | null;
	created_by_id: string | null;
	deleted_at: string | null;
}

export interface RepairStore {
	id: string;
	created_at: string;
	updated_at: string;
	created_by_id: string | null;
	updated_by_id: string | null;
	name?: string; // Deprecated - now in user object
	email?: string; // Deprecated - now in user object
	phone?: string; // Deprecated - now in user object
	description?: string;
	location: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
	status: UserStatus;
	user_id: string | null;
	user?: RepairStoreUser | null; // User data containing name, email, phone
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

export interface GetRepairPartnersParams {
	status?: UserStatus;
	location?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface PaginatedRepairPartnersResponse {
	data: RepairStore[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// API Functions

/**
 * Create repair partner
 * @summary Create a new repair partner with admin user. Admin only.
 * @tag Repair Partners
 */
export async function createRepairStore(
	data: CreateRepairStoreDto
): Promise<RepairStore> {
	return apiCall("/repair-stores", "POST", {
		...data,
		phone: normalizePhoneNumber(data.phone),
	});
}

/**
 * Get all repair partners
 * @summary Get all repair partners with filters. Admin only.
 * @tag Repair Partners
 */
export async function getAllRepairPartners(
	params?: GetRepairPartnersParams
): Promise<PaginatedRepairPartnersResponse> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/repair-stores?${queryParams}`, "GET");
}

/**
 * Get my repair partner
 * @summary Get repair partner for logged-in repair partner admin
 * @tag Repair Partners
 */
export async function getMyRepairStore(): Promise<RepairStore> {
	return apiCall("/repair-stores/me", "GET");
}

/**
 * Get repair partner by ID
 * @tag Repair Partners
 */
export async function getRepairStoreById(id: string): Promise<RepairStore> {
	return apiCall(`/repair-stores/${id}`, "GET");
}

/**
 * Update repair partner
 * @tag Repair Partners
 */
export async function updateRepairStore(
	id: string,
	data: UpdateRepairStoreDto
): Promise<RepairStore> {
	return apiCall(`/repair-stores/${id}`, "PATCH", {
		...data,
		...(data.phone && { phone: normalizePhoneNumber(data.phone) }),
	});
}

/**
 * Activate repair partner
 * @tag Repair Partners
 */
export async function activateRepairStore(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/repair-stores/${id}/activate`, "POST");
}

/**
 * Deactivate repair partner
 * @tag Repair Partners
 */
export async function deactivateRepairStore(
	id: string
): Promise<BaseApiResponse> {
	return apiCall(`/repair-stores/${id}/deactivate`, "POST");
}

/**
 * Resend repair partner admin invitation
 * @summary Resend invitation email to repair partner admin
 * @tag Repair Partners
 */
export async function resendRepairStoreInvitation(): Promise<BaseApiResponse> {
	return apiCall("/repair-stores/resend-invitation", "POST");
}
