"use client";

import React from "react";
import { Button, Input, Divider, Chip, Card, CardBody } from "@heroui/react";
import { Lock, Save, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
	cn,
	GeneralSans_SemiBold,
	getPasswordSecurityStatus,
	PasswordStatus,
} from "@/lib";

interface ProfileData {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	dob: string | null;
	gender: string | null;
	role: string;
	telephoneNumber: string;
	profile_picture: string | null;
	accountStatus: string;
	isActive: boolean;
	accountType: string;
	companyName: string | null;
	companyAddress: string | null;
	companyState: string | null;
	companyCity: string | null;
	companyLGA: string | null;
	createdAt: string;
	updatedAt: string;
}

interface PasswordFormData {
	oldPassword: string;
	password: string;
	confirmPassword: string;
}

interface SecurityTabProps {
	profileData: ProfileData | null;
	passwordForm: PasswordFormData;
	isUpdatingPassword: boolean;
	showOldPassword: boolean;
	showPassword: boolean;
	showConfirmPassword: boolean;
	oldPasswordError: string;
	onPasswordFieldChange: (field: keyof PasswordFormData, value: string) => void;
	onUpdatePassword: () => void;
	onToggleOldPassword: () => void;
	onTogglePassword: () => void;
	onToggleConfirmPassword: () => void;
	getStatusColor: (
		status: string
	) => "success" | "warning" | "danger" | "default";
}

export default function SecurityTab({
	profileData,
	passwordForm,
	isUpdatingPassword,
	showOldPassword,
	showPassword,
	showConfirmPassword,
	oldPasswordError,
	onPasswordFieldChange,
	onUpdatePassword,
	onToggleOldPassword,
	onTogglePassword,
	onToggleConfirmPassword,
	getStatusColor,
}: SecurityTabProps) {
	const passwordStatus = getPasswordSecurityStatus();
	const hasInsecurePassword = passwordStatus === PasswordStatus.INSECURE;

	return (
		<div className="space-y-6">
			{/* Security Warning for Insecure Password */}
			{hasInsecurePassword && (
				<Card className="border-l-4 border-l-warning bg-warning-50">
					<CardBody className="p-4">
						<div className="flex items-start gap-3">
							<AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
							<div>
								<h4
									className={cn(
										"font-medium text-warning-800",
										GeneralSans_SemiBold.className
									)}
								>
									Security Warning: Insecure Password Detected
								</h4>
								<p className="text-warning-700 text-sm mt-1">
									You are currently using an insecure password. Please you must
									change your password immediately to protect your account.
								</p>
							</div>
						</div>
					</CardBody>
				</Card>
			)}

			{/* Security Header */}
			<div>
				<h2
					className={cn(
						"text-lg font-semibold",
						GeneralSans_SemiBold.className
					)}
				>
					Password & Security
				</h2>
				<p className="text-gray-600 text-sm">
					Update your password and security settings
				</p>
			</div>

			<Divider />

			{/* Change Password */}
			<div>
				<h3 className={cn("font-medium mb-4", GeneralSans_SemiBold.className)}>
					Change Password
				</h3>
				<div className="grid grid-cols-1 gap-4 max-w-lg">
					<Input
						label="Current Password"
						placeholder="Enter current password"
						type={showOldPassword ? "text" : "password"}
						value={passwordForm.oldPassword}
						onChange={(e) =>
							onPasswordFieldChange("oldPassword", e.target.value)
						}
						startContent={<Lock className="w-4 h-4 text-default-400" />}
						endContent={
							<button
								type="button"
								onClick={onToggleOldPassword}
								className="text-default-400 hover:text-default-600"
							>
								{showOldPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						}
						isInvalid={!!oldPasswordError}
						errorMessage={oldPasswordError}
						color={oldPasswordError ? "danger" : "default"}
					/>

					<Input
						label="New Password"
						placeholder="Enter new password"
						type={showPassword ? "text" : "password"}
						value={passwordForm.password}
						onChange={(e) => onPasswordFieldChange("password", e.target.value)}
						startContent={<Lock className="w-4 h-4 text-default-400" />}
						endContent={
							<button
								type="button"
								onClick={onTogglePassword}
								className="text-default-400 hover:text-default-600"
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						}
					/>

					<Input
						label="Confirm Password"
						placeholder="Confirm new password"
						type={showConfirmPassword ? "text" : "password"}
						value={passwordForm.confirmPassword}
						onChange={(e) =>
							onPasswordFieldChange("confirmPassword", e.target.value)
						}
						startContent={<Lock className="w-4 h-4 text-default-400" />}
						endContent={
							<button
								type="button"
								onClick={onToggleConfirmPassword}
								className="text-default-400 hover:text-default-600"
							>
								{showConfirmPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						}
					/>
				</div>

				<div className="mt-4">
					<Button
						color="primary"
						onPress={onUpdatePassword}
						isLoading={isUpdatingPassword}
						isDisabled={
							!passwordForm.oldPassword ||
							!passwordForm.password ||
							!passwordForm.confirmPassword
						}
						startContent={<Save className="w-4 h-4" />}
					>
						Update Password
					</Button>
				</div>
			</div>

			<Divider />

			{/* Account Information */}
			<div>
				<h3 className={cn("font-medium mb-4", GeneralSans_SemiBold.className)}>
					Account Information
				</h3>
				<div className="space-y-3 max-w-md">
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-gray-600">Account Status</span>
						<Chip
							size="sm"
							color={getStatusColor(profileData?.accountStatus || "")}
							variant="flat"
						>
							{profileData?.accountStatus}
						</Chip>
					</div>

					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-gray-600">Account Type</span>
						<span className="text-sm font-medium break-words">
							{profileData?.accountType}
						</span>
					</div>

					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-gray-600">Role</span>
						<span className="text-sm font-medium break-words">
							{profileData?.role}
						</span>
					</div>

					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-gray-600">Member Since</span>
						<span className="text-sm font-medium">
							{new Date(profileData?.createdAt || "").toLocaleDateString()}
						</span>
					</div>

					<div className="flex justify-between items-center py-2">
						<span className="text-sm text-gray-600">Last Updated</span>
						<span className="text-sm font-medium">
							{new Date(profileData?.updatedAt || "").toLocaleDateString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
