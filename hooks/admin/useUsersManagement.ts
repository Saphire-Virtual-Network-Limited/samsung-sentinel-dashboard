"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import {
	getAllUsers,
	activateUser,
	deactivateUser,
	deleteUser,
	restoreUser,
	updateUser,
	showToast,
	type User,
	type GetUsersParams,
	type UpdateUserDto,
	type UserRole,
	type UserStatus,
	type ResendInvitationDto,
} from "@/lib";
import { resendINInvitation } from "@/lib";

export function useUsersManagement() {
	const [filters, setFilters] = useState<GetUsersParams>({
		page: 1,
		limit: 10,
	});

	// Fetch users with SWR
	const {
		data: usersResponse,
		isLoading,
		mutate,
	} = useSWR(["users", filters], () => getAllUsers(filters), {
		revalidateOnFocus: false,
	});

	// Map API response to match User interface (convert snake_case to camelCase)
	const users = (usersResponse?.data || []).map((user: any) => ({
		...user,
		createdAt: user.created_at || user.createdAt,
		updatedAt: user.updated_at || user.updatedAt,
	})) as User[];

	// Get total and totalPages from API response
	const totalUsers = (usersResponse as any)?.total || users.length;
	const totalPages =
		(usersResponse as any)?.totalPages ||
		Math.ceil(totalUsers / (filters.limit || 10));

	// Filter handlers
	const handleRoleChange = useCallback((role: string) => {
		setFilters((prev) => ({
			...prev,
			role: (role || undefined) as UserRole | undefined,
			page: 1,
		}));
	}, []);

	const handleStatusChange = useCallback((status: string) => {
		setFilters((prev) => ({
			...prev,
			status: (status || undefined) as UserStatus | undefined,
			page: 1,
		}));
	}, []);

	const handleSearchChange = useCallback((search: string) => {
		setFilters((prev) => ({
			...prev,
			search: search || undefined,
			page: 1,
		}));
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setFilters((prev) => ({
			...prev,
			page,
		}));
	}, []);

	// User actions
	const handleActivateUser = useCallback(
		async (userId: string) => {
			try {
				await activateUser(userId);
				await mutate();
				showToast({ type: "success", message: "User activated successfully" });
				return true;
			} catch (error: any) {
				showToast({
					type: "error",
					message: error?.message || "Failed to activate user",
				});
				return false;
			}
		},
		[mutate]
	);

	const handleDeactivateUser = useCallback(
		async (userId: string) => {
			try {
				await deactivateUser(userId);
				await mutate();
				showToast({
					type: "success",
					message: "User deactivated successfully",
				});
				return true;
			} catch (error: any) {
				showToast({
					type: "error",
					message: error?.message || "Failed to deactivate user",
				});
				return false;
			}
		},
		[mutate]
	);

	const handleDeleteUser = useCallback(
		async (userId: string) => {
			try {
				await deleteUser(userId);
				await mutate();
				showToast({ type: "success", message: "User deleted successfully" });
				return true;
			} catch (error: any) {
				showToast({
					type: "error",
					message: error?.message || "Failed to delete user",
				});
				return false;
			}
		},
		[mutate]
	);

	const handleRestoreUser = useCallback(
		async (userId: string) => {
			try {
				await restoreUser(userId);
				await mutate();
				showToast({ type: "success", message: "User restored successfully" });
				return true;
			} catch (error: any) {
				showToast({
					type: "error",
					message: error?.message || "Failed to restore user",
				});
				return false;
			}
		},
		[mutate]
	);

	const handleUpdateUser = useCallback(
		async (userId: string, data: UpdateUserDto) => {
			try {
				await updateUser(userId, data);
				await mutate();
				showToast({ type: "success", message: "User updated successfully" });
				return true;
			} catch (error: any) {
				showToast({
					type: "error",
					message: error?.message || "Failed to update user",
				});
				return false;
			}
		},
		[mutate]
	);

	const handleResendInvitation = useCallback(
		async (userEmail: string, userRole: string) => {
			try {
				const payload: ResendInvitationDto = { email: userEmail };

				await resendINInvitation(payload);

				showToast({
					type: "success",
					message: "Invitation resent successfully",
				});
				return true;
			} catch (error: any) {
				showToast({
					type: "error",
					message: error?.message || "Failed to resend invitation",
				});
				return false;
			}
		},
		[]
	);

	return {
		users,
		totalUsers,
		totalPages,
		isLoading,
		filters,
		handleRoleChange,
		handleStatusChange,
		handleSearchChange,
		handlePageChange,
		handleActivateUser,
		handleDeactivateUser,
		handleDeleteUser,
		handleRestoreUser,
		handleUpdateUser,
		handleResendInvitation,
		mutate,
	};
}
