"use client";

import { useState, useCallback } from "react";
import { setINPassword as setPassword } from "@/lib";
import { showToast } from "@/lib";
import {
	AcceptInviteResponse,
	InviteAcceptFormData,
} from "../../view/dashboard/user-management/user";

interface UseInviteAcceptorReturn {
	acceptInvite: (
		inviteData: InviteAcceptFormData
	) => Promise<AcceptInviteResponse | null>;
	isLoading: boolean;
	error: Error | null;
	success: AcceptInviteResponse | null;
	reset: () => void;
}

export const useInviteAcceptor = (): UseInviteAcceptorReturn => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [success, setSuccess] = useState<AcceptInviteResponse | null>(null);

	const acceptInviteHandler = useCallback(
		async (
			inviteData: InviteAcceptFormData
		): Promise<AcceptInviteResponse | null> => {
			// More robust validation - check for empty strings specifically

			console.log("Form data received:", {
				password: inviteData.password,
				confirmPassword: inviteData.confirmPassword,
				adminId: inviteData.adminId,
				passwordLength: inviteData.password?.length,
				confirmPasswordLength: inviteData.confirmPassword?.length,
				adminIdLength: inviteData.adminId?.length,
			});

			if (
				!inviteData.password?.trim() ||
				!inviteData.confirmPassword?.trim() ||
				!inviteData.adminId?.trim()
			) {
				const errorMsg = "All fields are required";
				setError(new Error(errorMsg));
				showToast({
					type: "error",
					message: errorMsg,
					duration: 5000,
				});
				return null;
			}

			if (inviteData.password !== inviteData.confirmPassword) {
				const errorMsg = "Passwords do not match";
				setError(new Error(errorMsg));
				showToast({
					type: "error",
					message: errorMsg,
					duration: 5000,
				});
				return null;
			}

			// Additional password length validation
			if (inviteData.password.length < 8) {
				const errorMsg = "Password must be at least 8 characters long";
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
			setSuccess(null);

			try {
				// Use setPassword API with token from URL query param
				const result = await setPassword({
					token: inviteData.adminId, // adminId is actually the token from URL
					password: inviteData.password,
				});

				setSuccess(result as any);

				showToast({
					type: "success",
					message: "Account activated successfully! Redirecting to login...",
					duration: 5000,
				});

				return result as any;
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Unknown error occurred");
				setError(error);
				showToast({
					type: "error",
					message: error.message || "Failed to accept invitation",
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
		setSuccess(null);
		setIsLoading(false);
	}, []);

	return {
		acceptInvite: acceptInviteHandler,
		isLoading,
		error,
		success,
		reset,
	};
};
