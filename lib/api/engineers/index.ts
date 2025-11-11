import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// ENGINEERS APIs
// ============================================================================

// Types & Interfaces
export interface Engineer {
	id: string;
	name: string;
	email: string;
	phone: string;
	service_center_id: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateEngineerDto {
	name: string;
	email: string;
	phone: string;
	service_center_id: string;
	description?: string;
}

export interface UpdateEngineerDto {
	name?: string;
	phone?: string;
	description?: string;
}

export interface ResendEngineerInvitationDto {
	email: string;
}

export interface GetEngineersParams {
	service_center_id?: string;
	repair_store_id?: string;
	search?: string;
	page?: number;
	limit?: number;
}

// API Functions

/**
 * Create engineer
 * @summary Create a new engineer and send invitation email. Admin can create for any service center. Repair store admin creates for their service centers.
 * @tag Engineers
 */
export async function createEngineer(
	data: CreateEngineerDto
): Promise<BaseApiResponse<Engineer>> {
	return apiCall("/engineers", "POST", data);
}

/**
 * Get all engineers
 * @summary Get all engineers with filters. Engineers can only see colleagues from same service center.
 * @tag Engineers
 */
export async function getAllEngineers(
	params?: GetEngineersParams
): Promise<BaseApiResponse<Engineer[]>> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/engineers?${queryParams}`, "GET");
}

/**
 * Get my engineer profile
 * @summary Get logged-in engineer profile with service center and repair store details
 * @tag Engineers
 */
export async function getMyEngineerProfile(): Promise<
	BaseApiResponse<Engineer>
> {
	return apiCall("/engineers/me/profile", "GET");
}

/**
 * Get engineer by ID
 * @tag Engineers
 */
export async function getEngineerById(
	id: string
): Promise<BaseApiResponse<Engineer>> {
	return apiCall(`/engineers/${id}`, "GET");
}

/**
 * Update engineer
 * @summary Update engineer details
 * @tag Engineers
 */
export async function updateEngineer(
	id: string,
	data: UpdateEngineerDto
): Promise<BaseApiResponse<Engineer>> {
	return apiCall(`/engineers/${id}`, "PATCH", data);
}

/**
 * Delete engineer
 * @summary Permanently delete an engineer
 * @tag Engineers
 */
export async function deleteEngineer(id: string): Promise<BaseApiResponse> {
	return apiCall(`/engineers/${id}`, "DELETE");
}

/**
 * Resend engineer invitation
 * @summary Resend invitation email to an engineer
 * @tag Engineers
 */
export async function resendEngineerInvitation(
	data: ResendEngineerInvitationDto
): Promise<BaseApiResponse> {
	return apiCall("/engineers/resend-invitation", "POST", data);
}
