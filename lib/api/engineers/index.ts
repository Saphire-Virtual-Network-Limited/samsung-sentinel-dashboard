import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// ENGINEERS APIs
// ============================================================================

// Helper function to build clean query strings without undefined values
function buildQueryString(params?: Record<string, any>): string {
	if (!params) return "";

	const cleanParams: Record<string, string> = {};

	Object.entries(params).forEach(([key, value]) => {
		if (
			value !== undefined &&
			value !== null &&
			value !== "" &&
			value !== "undefined"
		) {
			cleanParams[key] = String(value);
		}
	});

	const queryString = new URLSearchParams(cleanParams).toString();
	return queryString ? `?${queryString}` : "";
}

// Types & Interfaces
export interface Engineer {
	id: string;
	created_at: string;
	updated_at: string;
	created_by_id: string;
	updated_by_id: string | null;
	user_id: string;
	service_center_id: string;
	description?: string;
	user: {
		id: string;
		created_at: string;
		updated_at: string;
		email: string;
		name: string;
		phone: string;
		role: string;
		status: string;
		last_login: string | null;
		created_by_id: string | null;
		deleted_at: string | null;
	};
	// Computed fields for backward compatibility
	name?: string;
	email?: string;
	phone?: string;
	createdAt?: string;
	updatedAt?: string;
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
	const queryString = buildQueryString(params as Record<string, any>);
	return apiCall(`/engineers${queryString}`, "GET");
}

/**
 * Get my engineer profile
 * @summary Get logged-in engineer profile with service center and repair partner details
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
