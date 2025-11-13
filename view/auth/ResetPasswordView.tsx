"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { PasswordField } from "@/components/reususables";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	GeneralSans_Meduim,
	GeneralSans_SemiBold,
	cn,
	useField,
	showToast,
} from "@/lib";
import { resetPassword } from "@/lib/api/auth";
import { CheckCircle } from "lucide-react";

const PasswordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number");

export default function ResetPasswordView() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const {
		value: password,
		error: passwordError,
		handleChange: handlePasswordChange,
	} = useField("", PasswordSchema);

	const {
		value: confirmPassword,
		error: confirmPasswordError,
		handleChange: handleConfirmPasswordChange,
		setError: setConfirmPasswordError,
	} = useField("", PasswordSchema);

	const [isLoading, setIsLoading] = useState(false);
	const [passwordReset, setPasswordReset] = useState(false);

	useEffect(() => {
		if (!token) {
			showToast({
				type: "error",
				message: "Invalid or missing reset token",
			});
		}
	}, [token]);

	useEffect(() => {
		// Check if passwords match
		if (confirmPassword && password !== confirmPassword) {
			setConfirmPasswordError("Passwords do not match");
		}
	}, [password, confirmPassword, setConfirmPasswordError]);

	const handleSubmit = async () => {
		if (!token) {
			showToast({
				type: "error",
				message: "Invalid or missing reset token",
			});
			return;
		}

		if (!password?.trim() || passwordError) {
			showToast({
				type: "error",
				message: "Please enter a valid password",
			});
			return;
		}

		if (password !== confirmPassword) {
			showToast({
				type: "error",
				message: "Passwords do not match",
			});
			return;
		}

		setIsLoading(true);

		try {
			await resetPassword({ token, new_password: password });
			setPasswordReset(true);
			showToast({
				type: "success",
				message: "Password has been reset successfully",
				duration: 5000,
			});

			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/auth/login");
			}, 3000);
		} catch (error: any) {
			console.error("Reset password failed", error);
			showToast({
				type: "error",
				message:
					error?.message ||
					"Failed to reset password. Please try again or request a new reset link.",
				duration: 8000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className={cn("p-5")}>
			<CardHeader className="flex flex-col gap-2 text-center mb-5">
				<h1 className={cn("text-2xl", GeneralSans_SemiBold.className)}>
					{passwordReset ? "Password reset successful" : "Reset your password"}
				</h1>
				<p className="text-xs text-muted-foreground">
					{passwordReset
						? "You can now login with your new password"
						: "Enter your new password below"}
				</p>
			</CardHeader>
			<CardBody>
				{!passwordReset ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
					>
						<div className="grid gap-6">
							<div className="grid gap-2">
								<PasswordField
									PasswordText="New Password"
									placheolderText="Enter your new password"
									handlePasswordChange={handlePasswordChange}
									showForgotPassword={false}
									passwordError={passwordError}
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Password must be at least 8 characters with uppercase,
									lowercase, and numbers
								</p>
							</div>
							<div className="grid gap-2">
								<PasswordField
									PasswordText="Confirm Password"
									placheolderText="Confirm your new password"
									handlePasswordChange={handleConfirmPasswordChange}
									showForgotPassword={false}
									passwordError={confirmPasswordError}
								/>
							</div>
							<Button
								className={cn(
									"w-full p-6 mb-0 bg-primary text-white font-medium text-base",
									GeneralSans_Meduim.className
								)}
								size="md"
								radius="lg"
								isDisabled={
									!password?.trim() ||
									!confirmPassword?.trim() ||
									!!passwordError ||
									!!confirmPasswordError ||
									password !== confirmPassword
								}
								isLoading={isLoading}
								onPress={handleSubmit}
								type="submit"
							>
								Reset password
							</Button>
						</div>
					</form>
				) : (
					<div className="grid gap-6">
						<div className="text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
								<CheckCircle className="w-6 h-6 text-success" />
							</div>
							<p className="text-sm text-muted-foreground">
								Your password has been successfully reset. You will be
								redirected to the login page shortly.
							</p>
						</div>
						<Button
							className={cn(
								"w-full p-6 mb-0 bg-primary text-white font-medium text-base",
								GeneralSans_Meduim.className
							)}
							size="md"
							radius="lg"
							onPress={() => router.push("/auth/login")}
						>
							Go to login
						</Button>
					</div>
				)}
			</CardBody>
		</Card>
	);
}
