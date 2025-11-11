"use client";

import { useState, useCallback } from "react";
import { register } from "@/lib";
import { showToast } from "@/lib";
import { CreateUserFormData } from "@/view/dashboard/user-management/user";

interface UseUserCreatorReturn {
	createUser: (
		userData: CreateUserFormData
	) => Promise<{ success: boolean } | null>;
	isLoading: boolean;
	error: Error | null;
	success: boolean;
	reset: () => void;
}

export const useUserCreator = (): UseUserCreatorReturn => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [success, setSuccess] = useState(false);

	const createUser = useCallback(
		async (
			userData: CreateUserFormData
		): Promise<{ success: boolean } | null> => {
			// Validate required fields
			if (
				!userData.firstName?.trim() ||
				!userData.lastName?.trim() ||
				!userData.email?.trim() ||
				!userData.telephoneNumber?.trim() ||
				!userData.role?.trim()
			) {
				const errorMsg = "All required fields must be filled";
				setError(new Error(errorMsg));
				showToast({
					type: "error",
					message: errorMsg,
					duration: 5000,
				});
				return null;
			}

			setIsLoading(true);
			setError(null);
			setSuccess(false);

			try {
				// Use register API
				await register({
					email: userData.email,
					password: "Password123!", // Default password, user will set their own via invite link
					name: `${userData.firstName} ${userData.lastName}`.trim(),
					phone: userData.telephoneNumber,
					role: userData.role,
				});

				setSuccess(true);

				showToast({
					type: "success",
					message:
						"User created successfully! An invitation email will be sent.",
					duration: 5000,
				});

				return { success: true };
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				setError(error);
				showToast({
					type: "error",
					message: error.message || "Failed to create user",
					duration: 5000,
				});
				return null;
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const reset = useCallback(() => {
		setError(null);
		setSuccess(false);
		setIsLoading(false);
	}, []);

	return {
		createUser,
		isLoading,
		error,
		success,
		reset,
	};
};
