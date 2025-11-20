import { apiCall, BaseApiResponse } from "../shared";

// ============================================================================
// INVITATIONS APIs
// ============================================================================

export interface SetINPasswordDto {
	token: string;
	password: string;
}

export interface ResendINInvitationDto {
	email: string;
}

/**
 * Set password using invitation token
 * Used by repair store admins, engineers, and partners to set their password after receiving invitation
 */
export async function setINPassword(
	data: SetINPasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/invitations/set-password", "POST", data);
}

/**
 * Verify invitation token
 * Check if invitation token is valid
 */
export async function verifyINInvitation(
	token: string
): Promise<BaseApiResponse> {
	const query = `?token=${encodeURIComponent(token)}`;
	return apiCall(`/invitations/verify-invitation${query}`, "GET");
}

/**
 * Resend invitation
 * Resend invitation email to user. Admin only.
 */
export async function resendINInvitation(
	data: ResendINInvitationDto
): Promise<BaseApiResponse> {
	return apiCall("/invitations/resend-invitation", "POST", data);
}

export type { ResendINInvitationDto as InvitationResendDto };
