import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// SAMSUNG PARTNERS APIs
// ============================================================================

// Types & Interfaces
export interface Partner {
	id: string;
	name: string;
	email: string;
	phone: string;
	organization?: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePartnerDto {
	name: string;
	email: string;
	phone: string;
	organization?: string;
	description?: string;
}

export interface GetPartnersParams {
	search?: string;
	page?: number;
	limit?: number;
}

// API Functions

/**
 * Create Samsung partner
 * @summary Create a new Samsung partner and send invitation email. Admin only.
 * @tag Samsung Partners
 */
export async function createPartner(
	data: CreatePartnerDto
): Promise<BaseApiResponse<Partner>> {
	return apiCall("/partners", "POST", data);
}

/**
 * Get all partners
 * @summary Get all Samsung partners with filters. Admin only.
 * @tag Samsung Partners
 */
export async function getAllPartners(
	params?: GetPartnersParams
): Promise<BaseApiResponse<Partner[]>> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/partners?${queryParams}`, "GET");
}

/**
 * Get my partner profile
 * @summary Get logged-in partner profile details
 * @tag Samsung Partners
 */
export async function getMyPartnerProfile(): Promise<BaseApiResponse<Partner>> {
	return apiCall("/partners/me/profile", "GET");
}

/**
 * Get partner by ID
 * @tag Samsung Partners
 */
export async function getPartnerById(
	id: string
): Promise<BaseApiResponse<Partner>> {
	return apiCall(`/partners/${id}`, "GET");
}

/**
 * Delete partner
 * @summary Permanently delete a Samsung partner
 * @tag Samsung Partners
 */
export async function deletePartner(id: string): Promise<BaseApiResponse> {
	return apiCall(`/partners/${id}`, "DELETE");
}

/**
 * Resend partner invitation
 * @summary Resend invitation email to a Samsung partner
 * @tag Samsung Partners
 */
export async function resendPartnerInvitation(): Promise<BaseApiResponse> {
	return apiCall("/partners/resend-invitation", "POST");
}
