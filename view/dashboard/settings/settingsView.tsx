"use client";

import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Tabs,
	Tab,
	Avatar,
	Chip,
} from "@heroui/react";
import { User, Lock, Building2, Calendar, Camera } from "lucide-react";
import useSWR from "swr";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import {
	getMyProfile,
	updateMyProfile,
	changePassword,
	showToast,
	cn,
	GeneralSans_SemiBold,
	onPasswordChanged,
} from "@/lib";

interface ProfileData {
	id: string;
	email: string;
	name: string;
	phone: string;
	role: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

interface PasswordFormData {
	oldPassword: string;
	password: string;
	confirmPassword: string;
}

export default function SettingsView() {
	const [selectedTab, setSelectedTab] = useState("profile");
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [oldPasswordError, setOldPasswordError] = useState("");

	// Fetch profile data
	const {
		data: profileResponse,
		isLoading: isLoadingProfile,
		mutate: mutateProfile,
	} = useSWR("my-profile", () => getMyProfile());

	const profileData: ProfileData | null = profileResponse || null;

	// Profile form state
	const [profileForm, setProfileForm] = useState<Partial<ProfileData>>({});

	// Password form state
	const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
		oldPassword: "",
		password: "",
		confirmPassword: "",
	});

	// Update profile form when data loads
	useEffect(() => {
		if (profileData) {
			const [firstName = "", lastName = ""] = profileData.name.split(" ");
			setProfileForm({
				name: profileData.name || "",
				email: profileData.email || "",
				phone: profileData.phone || "",
			});
		}
	}, [profileData]);

	const handleProfileFieldChange = (
		field: keyof ProfileData,
		value: string
	) => {
		setProfileForm((prev) => ({ ...prev, [field]: value }));
	};

	const handlePasswordFieldChange = (
		field: keyof PasswordFormData,
		value: string
	) => {
		setPasswordForm((prev) => ({ ...prev, [field]: value }));

		// Clear old password error when user starts typing
		if (field === "oldPassword" && oldPasswordError) {
			setOldPasswordError("");
		}
	};

	const handleUpdateProfile = async () => {
		if (!profileData) return;

		try {
			setIsUpdatingProfile(true);

			// Transform the data to match UpdateUserDto interface (name, phone only)
			const updateData = {
				name: profileForm.name || "",
				phone: profileForm.phone || "",
			};

			await updateMyProfile(updateData);
			await mutateProfile();
			setIsEditingProfile(false);
			showToast({ type: "success", message: "Profile updated successfully" });
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to update profile",
			});
		} finally {
			setIsUpdatingProfile(false);
		}
	};

	const handleUpdatePassword = async () => {
		if (!profileData?.email) {
			showToast({ type: "error", message: "User email not found" });
			return;
		}

		if (!passwordForm.oldPassword) {
			showToast({ type: "error", message: "Current password is required" });
			return;
		}

		if (passwordForm.password !== passwordForm.confirmPassword) {
			showToast({ type: "error", message: "Passwords do not match" });
			return;
		}

		if (passwordForm.password.length < 6) {
			showToast({
				type: "error",
				message: "Password must be at least 6 characters",
			});
			return;
		}

		// Prevent setting password back to default insecure password
		if (passwordForm.password === "Password123!") {
			showToast({
				type: "error",
				message:
					"You cannot use the default password 'Password123!' for security reasons",
			});
			return;
		}

		try {
			setIsUpdatingPassword(true);
			setOldPasswordError("");

			// Use changePassword API
			await changePassword({
				current_password: passwordForm.oldPassword,
				new_password: passwordForm.password,
			});

			// Update password security status
			onPasswordChanged(passwordForm.password);

			setPasswordForm({ oldPassword: "", password: "", confirmPassword: "" });
			showToast({ type: "success", message: "Password updated successfully" });
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to update password",
			});
		} finally {
			setIsUpdatingPassword(false);
		}
	};

	const handleCancelEdit = () => {
		if (profileData) {
			setProfileForm({
				name: profileData.name || "",
				email: profileData.email || "",
				phone: profileData.phone || "",
			});
		}
		setIsEditingProfile(false);
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case "active":
				return "success";
			case "pending":
				return "warning";
			case "suspended":
				return "danger";
			default:
				return "default";
		}
	};

	if (isLoadingProfile) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
			{/* Main Content */}
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
				{/* Sidebar with Profile Summary */}
				<div className="xl:col-span-1">
					<Card className="h-fit">
						<CardBody className="text-center p-4 sm:p-6">
							<div className="flex flex-col items-center">
								<div className="relative inline-block mb-4">
									<Avatar
										className="w-16 h-16 sm:w-20 sm:h-20 text-large"
										name={profileData?.name?.[0] || "U"}
									/>
									<button className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 text-white hover:bg-primary/80 transition-colors">
										<Camera className="w-3 h-3" />
									</button>
								</div>

								<h3
									className={cn(
										"font-semibold text-base sm:text-lg",
										GeneralSans_SemiBold.className
									)}
								>
									{profileData?.name}
								</h3>

								<p className="text-gray-600 text-sm mb-2 text-center">
									{profileData?.email}
								</p>

								<Chip
									size="sm"
									color={getStatusColor(profileData?.status || "")}
									variant="flat"
									className="mb-3"
								>
									{profileData?.status}
								</Chip>

								<div className="space-y-2 text-xs sm:text-sm text-gray-600 w-full">
									<div className="flex items-center justify-center gap-2">
										<User className="w-4 h-4 flex-shrink-0" />
										<span className="truncate">{profileData?.role}</span>
									</div>
									<div className="flex items-center justify-center gap-2">
										<Calendar className="w-4 h-4 flex-shrink-0" />
										<span className="truncate">
											Since{" "}
											{new Date(profileData?.createdAt || "").getFullYear()}
										</span>
									</div>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>

				{/* Main Settings Area */}
				<div className="xl:col-span-3">
					<Card>
						<CardHeader className="px-4 sm:px-6">
							<Tabs
								selectedKey={selectedTab}
								onSelectionChange={(key) => setSelectedTab(key as string)}
								variant="underlined"
								className="w-full"
								classNames={{
									tabList:
										"gap-6 w-full relative rounded-none p-0 border-b border-divider",
									cursor: "w-full bg-primary",
									tab: "max-w-fit px-0 h-12",
									tabContent: "group-data-[selected=true]:text-primary",
								}}
							>
								<Tab
									key="profile"
									title={
										<div className="flex items-center gap-2">
											<User className="w-4 h-4" />
											<span className="hidden sm:inline">Profile</span>
										</div>
									}
								/>
								<Tab
									key="security"
									title={
										<div className="flex items-center gap-2">
											<Lock className="w-4 h-4" />
											<span className="hidden sm:inline">Security</span>
										</div>
									}
								/>
							</Tabs>
						</CardHeader>

						<CardBody className="space-y-6 px-4 sm:px-6">
							{selectedTab === "profile" && (
								<ProfileTab
									profileData={profileData}
									profileForm={profileForm}
									isEditingProfile={isEditingProfile}
									isUpdatingProfile={isUpdatingProfile}
									onProfileFieldChange={handleProfileFieldChange}
									onStartEdit={() => setIsEditingProfile(true)}
									onCancelEdit={handleCancelEdit}
									onUpdateProfile={handleUpdateProfile}
								/>
							)}

							{selectedTab === "security" && (
								<SecurityTab
									profileData={profileData}
									passwordForm={passwordForm}
									isUpdatingPassword={isUpdatingPassword}
									showOldPassword={showOldPassword}
									showPassword={showPassword}
									showConfirmPassword={showConfirmPassword}
									oldPasswordError={oldPasswordError}
									onPasswordFieldChange={handlePasswordFieldChange}
									onUpdatePassword={handleUpdatePassword}
									onToggleOldPassword={() =>
										setShowOldPassword(!showOldPassword)
									}
									onTogglePassword={() => setShowPassword(!showPassword)}
									onToggleConfirmPassword={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
									getStatusColor={getStatusColor}
								/>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
}
