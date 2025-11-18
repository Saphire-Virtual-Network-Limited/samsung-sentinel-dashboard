import {
	apiCall,
	BaseApiResponse,
	saveTokens,
	saveUser,
	clearAuthData,
} from "../shared";

// ============================================================================
// AUTH APIs
// ============================================================================

// Types & Interfaces
export interface LoginDto {
	email: string;
	password: string;
}

export interface LoginResponseDto {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
	};
}

export interface RegisterDto {
	email: string;
	password: string;
	name: string;
	phone: string;
	role: string;
}

export interface RefreshTokenDto {
	refresh_token: string;
}

export interface RefreshTokenResponseDto {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

export interface SetPasswordDto {
	token: string;
	password: string;
}

export interface VerifyInvitationResponse {
	valid: boolean;
	email?: string;
	expires_at?: string;
}

export interface ResendInvitationDto {
	email: string;
}

export interface ForgotPasswordDto {
	email: string;
}

export interface ResetPasswordDto {
	token: string;
	new_password: string;
}

export interface UserProfile {
	id: string;
	created_at: string;
	updated_at: string;
	email: string;
	name: string;
	phone: string;
	role:
		| "admin"
		| "repair_store_admin"
		| "service_center_admin"
		| "engineer"
		| "samsung_partner"
		| "finance"
		| "auditor";
	status: "ACTIVE" | "INACTIVE";
	last_login: string | null;
	created_by_id: string | null;
	deleted_at: string | null;
	repair_store_id?: string;
	service_center_id?: string;
}

// API Functions

/**
 * User login
 * @summary User login
 * @tag Authentication
 */
export async function login(
	data: LoginDto
): Promise<BaseApiResponse<LoginResponseDto>> {
	const response = await apiCall("/auth/login", "POST", data);

	// Save tokens and user data after successful login
	// Response structure: { access_token, refresh_token, token_type, expires_in, user }
	if (response) {
		const { access_token, refresh_token, expires_in, user } = response;
		saveTokens(access_token, refresh_token, expires_in || 86400);
		saveUser(user);
	}

	return response;
}

/**
 * Register new user
 * @summary Register new user
 * @tag Authentication
 */
export async function register(data: RegisterDto): Promise<BaseApiResponse> {
	return apiCall("/auth/register", "POST", {
		...data,
		phone: normalizePhoneNumber(data.phone),
	});
}

/**
 * Refresh access token
 * @summary Get a new access token using refresh token
 * @tag Authentication
 */
export async function refreshToken(
	data: RefreshTokenDto
): Promise<BaseApiResponse<RefreshTokenResponseDto>> {
	const response = await apiCall("/auth/refresh", "POST", data);

	// Save new tokens after successful refresh
	// Response structure: { access_token, refresh_token, token_type, expires_in }
	if (response) {
		const { access_token, refresh_token, expires_in } = response;
		saveTokens(access_token, refresh_token, expires_in || 86400);
	}

	return response;
}

/**
 * Logout user
 * @summary Revoke refresh token
 * @tag Authentication
 */
export async function logout(data: RefreshTokenDto): Promise<BaseApiResponse> {
	const response = await apiCall("/auth/logout", "POST", data);

	// Clear all authentication data after successful logout
	clearAuthData();

	return response;
}

/**
 * Revoke all user tokens
 * @summary Revoke all refresh tokens for current user (logout from all devices)
 * @tag Authentication
 */
export async function revokeAllTokens(): Promise<BaseApiResponse> {
	const response = await apiCall("/auth/revoke-all", "POST");

	// Clear all authentication data after revoking all tokens
	clearAuthData();

	return response;
}

/**
 * Set password using invitation token
 * @summary Used by repair partner admins, engineers, and partners to set their password after receiving invitation
 * @tag Authentication
 */
export async function setPassword(
	data: SetPasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/auth/set-password", "POST", data);
}

/**
 * Verify invitation token
 * @summary Check if invitation token is valid
 * @tag Authentication
 */
export async function verifyInvitation(
	token: string
): Promise<VerifyInvitationResponse> {
	return apiCall(`/auth/verify-invitation?token=${token}`, "GET");
}

/**
 * Resend invitation
 * @summary Resend invitation email to user. Admin only.
 * @tag Authentication
 */
export async function resendInvitation(
	data: ResendInvitationDto
): Promise<BaseApiResponse> {
	return apiCall("/auth/resend-invitation", "POST", data);
}

/**
 * Request password reset
 * @summary Send password reset email to user
 * @tag Authentication
 */
export async function forgotPassword(
	data: ForgotPasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/auth/forgot-password", "POST", data);
}

/**
 * Reset password
 * @summary Reset password using reset token from email
 * @tag Authentication
 */
export async function resetPassword(
	data: ResetPasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/auth/reset-password", "POST", data);
}

// Legacy aliases for backward compatibility
export const loginAdmin = login;
export const getAdminProfile = (): Promise<UserProfile> =>
	apiCall("/users/me", "GET");
export const logoutAdmin = logout;
