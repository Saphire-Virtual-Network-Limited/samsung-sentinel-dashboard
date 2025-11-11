import { apiCall, BaseApiResponse, UserRole, UserStatus } from "../shared";

// ============================================================================
// USERS APIs
// ============================================================================

// Types & Interfaces
export interface User {
	id: string;
	email: string;
	name: string;
	phone: string;
	role: UserRole;
	status: UserStatus;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateUserDto {
	name?: string;
	phone?: string;
}

export interface ChangePasswordDto {
	current_password: string;
	new_password: string;
}

export interface GetUsersParams {
	role?: UserRole;
	status?: UserStatus;
	search?: string;
	page?: number;
	limit?: number;
}

// API Functions

/**
 * Get all users
 * @summary Get all users with filters. Admin only.
 * @tag Users
 */
export async function getAllUsers(
	params?: GetUsersParams
): Promise<BaseApiResponse<User[]>> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/api/v1/users?${queryParams}`, "GET");
}

/**
 * Get current user profile
 * @summary Get logged-in user profile
 * @tag Users
 */
export async function getMyProfile(): Promise<User> {
	return apiCall("/api/v1/users/me", "GET");
}

/**
 * Update my profile
 * @summary Update logged-in user profile (name, phone)
 * @tag Users
 */
export async function updateMyProfile(data: UpdateUserDto): Promise<User> {
	return apiCall("/api/v1/users/me", "PATCH", data);
}

/**
 * Change my password
 * @summary Change password for logged-in user
 * @tag Users
 */
export async function changePassword(
	data: ChangePasswordDto
): Promise<BaseApiResponse> {
	return apiCall("/api/v1/users/me/change-password", "POST", data);
}

/**
 * Get user by ID
 * @tag Users
 */
export async function getUserById(id: string): Promise<BaseApiResponse<User>> {
	return apiCall(`/api/v1/users/${id}`, "GET");
}

/**
 * Update user
 * @summary Update user details. Admin only.
 * @tag Users
 */
export async function updateUser(
	id: string,
	data: UpdateUserDto
): Promise<BaseApiResponse<User>> {
	return apiCall(`/api/v1/users/${id}`, "PATCH", data);
}

/**
 * Delete user
 * @summary Soft delete user (deactivate). Admin only.
 * @tag Users
 */
export async function deleteUser(id: string): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/users/${id}`, "DELETE");
}

/**
 * Activate user
 * @summary Activate a disabled user. Admin only.
 * @tag Users
 */
export async function activateUser(id: string): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/users/${id}/activate`, "POST");
}

/**
 * Deactivate user
 * @summary Deactivate a user account. Admin only.
 * @tag Users
 */
export async function deactivateUser(id: string): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/users/${id}/deactivate`, "POST");
}

/**
 * Restore deleted user
 * @summary Restore a soft-deleted user. Admin only.
 * @tag Users
 */
export async function restoreUser(id: string): Promise<BaseApiResponse> {
	return apiCall(`/api/v1/users/${id}/restore`, "POST");
}
