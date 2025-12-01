"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	Input,
	Divider,
} from "@heroui/react";
import {
	Lock,
	Eye,
	EyeOff,
	CheckCircle2,
	XCircle,
	AlertCircle,
} from "lucide-react";
import { showToast } from "@/lib";
import { VerifyInvitationResponse } from "@/lib/api/auth";
import { verifyINInvitation as verifyInvitation } from "@/lib";
import { setINPassword as setPasswordApi } from "@/lib";

export default function SetPasswordView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [isVerifying, setIsVerifying] = useState(true);
	const [isSettingPassword, setIsSettingPassword] = useState(false);
	const [invitationStatus, setInvitationStatus] = useState<
		VerifyInvitationResponse | any
	>(null);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Password validation
	const passwordRequirements = {
		minLength: password.length >= 8,
		hasUpperCase: /[A-Z]/.test(password),
		hasLowerCase: /[a-z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
	};

	const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
	const passwordsMatch =
		password === confirmPassword && confirmPassword.length > 0;

	// Verify invitation token on mount
	useEffect(() => {
		const verifyToken = async () => {
			if (!token) {
				showToast({
					message: "Invalid or missing invitation token",
					type: "error",
				});
				setIsVerifying(false);
				return;
			}

			try {
				const response = await verifyInvitation(token);
				setInvitationStatus(response);
			} catch (error: any) {
				showToast({
					message: error?.message || "Failed to verify invitation token",
					type: "error",
				});
				setInvitationStatus({ valid: false });
			} finally {
				setIsVerifying(false);
			}
		};

		verifyToken();
	}, [token]);

	const handleSetPassword = async () => {
		if (!isPasswordValid) {
			showToast({
				message: "Please meet all password requirements",
				type: "error",
			});
			return;
		}

		if (!passwordsMatch) {
			showToast({
				message: "Passwords do not match",
				type: "error",
			});
			return;
		}

		if (!token) {
			showToast({
				message: "Invalid token",
				type: "error",
			});
			return;
		}

		setIsSettingPassword(true);
		try {
			await setPasswordApi({
				token,
				password,
			});

			showToast({
				message: "Password set successfully! Redirecting to login...",
				type: "success",
			});

			// Redirect to login after 2 seconds
			setTimeout(() => {
				router.push("/auth/login");
			}, 2000);
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to set password",
				type: "error",
			});
		} finally {
			setIsSettingPassword(false);
		}
	};

	// Loading state
	if (isVerifying) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
				<Card className="w-full max-w-md">
					<CardBody className="flex flex-col items-center justify-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
						<p className="mt-4 text-gray-600 dark:text-gray-400">
							Verifying invitation...
						</p>
					</CardBody>
				</Card>
			</div>
		);
	}

	// Invalid token state
	if (!invitationStatus?.valid) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="flex flex-col items-center pb-0">
						<XCircle className="w-16 h-16 text-danger-600 mb-4" />
						<h1 className="text-2xl font-bold text-center">
							Invalid Invitation
						</h1>
					</CardHeader>
					<CardBody className="text-center">
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							This invitation link is invalid or has expired. Please contact
							your administrator for a new invitation.
						</p>
						<Button
							color="primary"
							onPress={() => router.push("/auth/login")}
							className="w-full"
						>
							Go to Login
						</Button>
					</CardBody>
				</Card>
			</div>
		);
	}

	// Set password form
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-col items-center pb-0">
					<div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mb-4">
						<Lock className="w-8 h-8 text-primary-600" />
					</div>
					<h1 className="text-2xl font-bold text-center">Set Your Password</h1>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
						{invitationStatus.email}
					</p>
				</CardHeader>
				<Divider className="my-4" />
				<CardBody>
					<div className="space-y-6">
						{/* Expiration notice */}
						{invitationStatus.expires_at && (
							<div className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
								<AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
								<div className="text-sm text-warning-800 dark:text-warning-200">
									<p className="font-semibold">Invitation expires on:</p>
									<p>
										{new Date(invitationStatus.expires_at).toLocaleString()}
									</p>
								</div>
							</div>
						)}

						{/* Password input */}
						<Input
							label="Password"
							type={showPassword ? "text" : "password"}
							placeholder="Enter your password"
							value={password}
							onValueChange={setPassword}
							isRequired
							endContent={
								<button
									className="focus:outline-none"
									type="button"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="text-2xl text-default-400 pointer-events-none" />
									) : (
										<Eye className="text-2xl text-default-400 pointer-events-none" />
									)}
								</button>
							}
						/>

						{/* Confirm password input */}
						<Input
							label="Confirm Password"
							type={showConfirmPassword ? "text" : "password"}
							placeholder="Confirm your password"
							value={confirmPassword}
							onValueChange={setConfirmPassword}
							isRequired
							color={
								confirmPassword.length > 0
									? passwordsMatch
										? "success"
										: "danger"
									: "default"
							}
							endContent={
								<button
									className="focus:outline-none"
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<EyeOff className="text-2xl text-default-400 pointer-events-none" />
									) : (
										<Eye className="text-2xl text-default-400 pointer-events-none" />
									)}
								</button>
							}
						/>

						{/* Password requirements */}
						<div className="space-y-2">
							<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
								Password Requirements:
							</p>
							<div className="space-y-1">
								{Object.entries({
									minLength: "At least 8 characters",
									hasUpperCase: "One uppercase letter",
									hasLowerCase: "One lowercase letter",
									hasNumber: "One number",
									hasSpecialChar: "One special character (!@#$%^&*...)",
								}).map(([key, label]) => (
									<div key={key} className="flex items-center gap-2">
										{passwordRequirements[
											key as keyof typeof passwordRequirements
										] ? (
											<CheckCircle2 className="w-4 h-4 text-success-600" />
										) : (
											<XCircle className="w-4 h-4 text-gray-400" />
										)}
										<span
											className={`text-sm ${
												passwordRequirements[
													key as keyof typeof passwordRequirements
												]
													? "text-success-600"
													: "text-gray-600 dark:text-gray-400"
											}`}
										>
											{label}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Submit button */}
						<Button
							color="primary"
							onPress={handleSetPassword}
							isLoading={isSettingPassword}
							isDisabled={!isPasswordValid || !passwordsMatch}
							className="w-full"
							size="lg"
						>
							{isSettingPassword ? "Setting Password..." : "Set Password"}
						</Button>

						{/* Login link */}
						<div className="text-center">
							<Button
								variant="light"
								onPress={() => router.push("/auth/login")}
								size="sm"
							>
								Already have a password? Login
							</Button>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
