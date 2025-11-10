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

// API Functions

/**
 * User login
 * @summary User login
 * @tag Authentication
 */
export async function login(
	data: LoginDto
): Promise<BaseApiResponse<LoginResponseDto>> {
	const response = await apiCall("/api/v1/auth/login", "POST", data);

	// Save tokens and user data after successful login
	if (response?.data) {
		const { access_token, refresh_token, user } = response.data;
		saveTokens(access_token, refresh_token);
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
	return apiCall("/api/v1/auth/register", "POST", data);
}

/**
 * Refresh access token
 * @summary Get a new access token using refresh token
 * @tag Authentication
 */
export async function refreshToken(
	data: RefreshTokenDto
): Promise<BaseApiResponse<RefreshTokenResponseDto>> {
	const response = await apiCall("/api/v1/auth/refresh", "POST", data);

	// Save new tokens after successful refresh
	if (response?.data) {
		const { access_token, refresh_token } = response.data;
		saveTokens(access_token, refresh_token);
	}

	return response;
}

/**
 * Logout user
 * @summary Revoke refresh token
 * @tag Authentication
 */
export async function logout(data: RefreshTokenDto): Promise<BaseApiResponse> {
	const response = await apiCall("/api/v1/auth/logout", "POST", data);

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
	const response = await apiCall("/api/v1/auth/revoke-all", "POST");

	// Clear all authentication data after revoking all tokens
	clearAuthData();

	return response;
}

/**
 * Set password using invitation token
 * @summary Used by repair store admins, engineers, and partners to set their password after receiving invitation
 * @tag Authentication
 */
export async function setPassword(
	data: SetPasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/api/v1/auth/set-password", "POST", data);
}

/**
 * Verify invitation token
 * @summary Check if invitation token is valid
 * @tag Authentication
 */
export async function verifyInvitation(
	token: string
): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/auth/verify-invitation?token=${token}`, "GET");
}

/**
 * Resend invitation
 * @summary Resend invitation email to user. Admin only.
 * @tag Authentication
 */
export async function resendInvitation(
	data: ResendInvitationDto
): Promise<BaseApiResponse> {
	return apiCall("/api/v1/auth/resend-invitation", "POST", data);
}

/**
 * Request password reset
 * @summary Send password reset email to user
 * @tag Authentication
 */
export async function forgotPassword(
	data: ForgotPasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/api/v1/auth/forgot-password", "POST", data);
}

/**
 * Reset password
 * @summary Reset password using reset token from email
 * @tag Authentication
 */
export async function resetPassword(
	data: ResetPasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/api/v1/auth/reset-password", "POST", data);
}

// Legacy aliases for backward compatibility
export const loginAdmin = login;
export const getAdminProfile = () => apiCall("/api/v1/users/me", "GET");
export const logoutAdmin = logout;
