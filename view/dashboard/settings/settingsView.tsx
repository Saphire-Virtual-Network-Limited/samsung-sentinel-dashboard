"use client";

import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Tabs,
	Tab,
	Button,
	Input,
	Select,
	SelectItem,
	Avatar,
	Divider,
	Chip,
} from "@heroui/react";
import {
	User,
	Lock,
	Building2,
	Phone,
	Mail,
	MapPin,
	Calendar,
	Edit,
	Save,
	X,
	Camera,
	Eye,
	EyeOff,
} from "lucide-react";
import useSWR from "swr";
import { useNaijaStates } from "@/hooks/user-mangement/use-naija-states";
import {
	getAdminProfile,
	updateUserProfile,
	updateAdminPassword,
	validateOldPassword,
	showToast,
	cn,
	GeneralSans_SemiBold,
	GeneralSans_Meduim,
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

export default function SettingsView() {
	const [selectedTab, setSelectedTab] = useState("profile");
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [oldPasswordError, setOldPasswordError] = useState("");

	const { states, getLgas } = useNaijaStates();

	// Fetch profile data
	const {
		data: profileResponse,
		isLoading: isLoadingProfile,
		mutate: mutateProfile,
	} = useSWR("admin-profile", () => getAdminProfile());

	const profileData: ProfileData | null = profileResponse?.data || null;

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
			setProfileForm({
				firstName: profileData.firstName || "",
				lastName: profileData.lastName || "",
				email: profileData.email || "",
				telephoneNumber: profileData.telephoneNumber || "",
				companyName: profileData.companyName || "",
				companyAddress: profileData.companyAddress || "",
				companyState: profileData.companyState || "",
				companyCity: profileData.companyCity || "",
				companyLGA: profileData.companyLGA || "",
			});
		}
	}, [profileData]);

	// Get LGAs for selected state
	const lgas = profileForm.companyState
		? getLgas(profileForm.companyState)
		: [];

	const handleProfileFieldChange = (
		field: keyof ProfileData,
		value: string
	) => {
		setProfileForm((prev) => ({ ...prev, [field]: value }));

		// Clear city and LGA when state changes
		if (field === "companyState") {
			setProfileForm((prev) => ({
				...prev,
				[field]: value,
				companyCity: "",
				companyLGA: "",
			}));
		}
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

			// Transform the data to match UpdateUserDto interface
			const updateData = {
				firstName: profileForm.firstName || "",
				lastName: profileForm.lastName || "",
				email: profileForm.email || "",
				telephoneNumber: profileForm.telephoneNumber || "",
				companyName: profileForm.companyName || undefined,
				companyAddress: profileForm.companyAddress || undefined,
				companyState: profileForm.companyState || undefined,
				companyCity: profileForm.companyCity || undefined,
				companyLGA: profileForm.companyLGA || undefined,
			};

			await updateUserProfile(profileData.userId, updateData);
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

		try {
			setIsUpdatingPassword(true);
			setOldPasswordError("");

			const validation = await validateOldPassword(
				profileData.email,
				passwordForm.oldPassword
			);

			if (!validation.isValid) {
				setOldPasswordError(validation.message || "Invalid current password");
				showToast({
					type: "error",
					message: "Current password is incorrect",
				});
				return;
			}

			await updateAdminPassword({
				password: passwordForm.password,
				confirmPassword: passwordForm.confirmPassword,
			});

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
				firstName: profileData.firstName || "",
				lastName: profileData.lastName || "",
				email: profileData.email || "",
				telephoneNumber: profileData.telephoneNumber || "",
				companyName: profileData.companyName || "",
				companyAddress: profileData.companyAddress || "",
				companyState: profileData.companyState || "",
				companyCity: profileData.companyCity || "",
				companyLGA: profileData.companyLGA || "",
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
										src={profileData?.profile_picture || ""}
										className="w-16 h-16 sm:w-20 sm:h-20 text-large"
										name={`${profileData?.firstName?.[0] || ""}${
											profileData?.lastName?.[0] || ""
										}`}
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
									{profileData?.firstName} {profileData?.lastName}
								</h3>

								<p className="text-gray-600 text-sm mb-2 text-center">
									{profileData?.email}
								</p>

								<Chip
									size="sm"
									color={getStatusColor(profileData?.accountStatus || "")}
									variant="flat"
									className="mb-3"
								>
									{profileData?.accountStatus}
								</Chip>

								<div className="space-y-2 text-xs sm:text-sm text-gray-600 w-full">
									<div className="flex items-center justify-center gap-2">
										<User className="w-4 h-4 flex-shrink-0" />
										<span className="truncate">{profileData?.role}</span>
									</div>
									<div className="flex items-center justify-center gap-2">
										<Building2 className="w-4 h-4 flex-shrink-0" />
										<span className="truncate">{profileData?.accountType}</span>
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
								<div className="space-y-6">
									{/* Profile Header */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
										<div>
											<h2
												className={cn(
													"text-lg font-semibold",
													GeneralSans_SemiBold.className
												)}
											>
												Profile Information
											</h2>
											<p className="text-gray-600 text-sm">
												Update your personal and company information
											</p>
										</div>

										{!isEditingProfile ? (
											<Button
												color="primary"
												variant="flat"
												startContent={<Edit className="w-4 h-4" />}
												onPress={() => setIsEditingProfile(true)}
												className="w-full sm:w-auto"
											>
												Edit Profile
											</Button>
										) : (
											<div className="flex gap-2 w-full sm:w-auto">
												<Button
													color="danger"
													variant="flat"
													startContent={<X className="w-4 h-4" />}
													onPress={handleCancelEdit}
													isDisabled={isUpdatingProfile}
													className="flex-1 sm:flex-none"
												>
													Cancel
												</Button>
												<Button
													color="primary"
													startContent={<Save className="w-4 h-4" />}
													onPress={handleUpdateProfile}
													isLoading={isUpdatingProfile}
													className="flex-1 sm:flex-none"
												>
													Save Changes
												</Button>
											</div>
										)}
									</div>

									<Divider />

									{/* Personal Information */}
									<div>
										<h3
											className={cn(
												"font-medium mb-4",
												GeneralSans_SemiBold.className
											)}
										>
											Personal Information
										</h3>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<Input
												label="First Name"
												placeholder="Enter first name"
												value={profileForm.firstName || ""}
												onChange={(e) =>
													handleProfileFieldChange("firstName", e.target.value)
												}
												isReadOnly={!isEditingProfile}
												startContent={
													<User className="w-4 h-4 text-default-400" />
												}
											/>

											<Input
												label="Last Name"
												placeholder="Enter last name"
												value={profileForm.lastName || ""}
												onChange={(e) =>
													handleProfileFieldChange("lastName", e.target.value)
												}
												isReadOnly={!isEditingProfile}
												startContent={
													<User className="w-4 h-4 text-default-400" />
												}
											/>

											<Input
												label="Email Address"
												placeholder="Enter email address"
												value={profileForm.email || ""}
												onChange={(e) =>
													handleProfileFieldChange("email", e.target.value)
												}
												isReadOnly={!isEditingProfile}
												startContent={
													<Mail className="w-4 h-4 text-default-400" />
												}
												className="sm:col-span-2"
											/>

											<Input
												label="Phone Number"
												placeholder="Enter phone number"
												value={profileForm.telephoneNumber || ""}
												onChange={(e) =>
													handleProfileFieldChange(
														"telephoneNumber",
														e.target.value
													)
												}
												isReadOnly={!isEditingProfile}
												startContent={
													<Phone className="w-4 h-4 text-default-400" />
												}
											/>
										</div>
									</div>

									<Divider />

									{/* Company Information */}
									<div>
										<h3
											className={cn(
												"font-medium mb-4",
												GeneralSans_SemiBold.className
											)}
										>
											Company Information
										</h3>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<Input
												label="Company Name"
												placeholder="Enter company name"
												value={profileForm.companyName || ""}
												onChange={(e) =>
													handleProfileFieldChange(
														"companyName",
														e.target.value
													)
												}
												isReadOnly={!isEditingProfile}
												startContent={
													<Building2 className="w-4 h-4 text-default-400" />
												}
												className="sm:col-span-2"
											/>

											<Input
												label="Company Address"
												placeholder="Enter company address"
												value={profileForm.companyAddress || ""}
												onChange={(e) =>
													handleProfileFieldChange(
														"companyAddress",
														e.target.value
													)
												}
												isReadOnly={!isEditingProfile}
												startContent={
													<MapPin className="w-4 h-4 text-default-400" />
												}
												className="sm:col-span-2"
											/>

											<Select
												label="State"
												placeholder="Select state"
												selectedKeys={
													profileForm.companyState
														? [profileForm.companyState]
														: []
												}
												onSelectionChange={(keys) => {
													const selectedState = Array.from(keys)[0] as string;
													handleProfileFieldChange(
														"companyState",
														selectedState
													);
												}}
												isDisabled={!isEditingProfile}
											>
												{states.map((state) => (
													<SelectItem key={state.value} value={state.value}>
														{state.label}
													</SelectItem>
												))}
											</Select>

											<Select
												label="LGA"
												placeholder="Select LGA"
												selectedKeys={
													profileForm.companyLGA ? [profileForm.companyLGA] : []
												}
												onSelectionChange={(keys) => {
													const selectedLGA = Array.from(keys)[0] as string;
													handleProfileFieldChange("companyLGA", selectedLGA);
												}}
												isDisabled={
													!isEditingProfile || !profileForm.companyState
												}
											>
												{lgas.map((lga) => (
													<SelectItem key={lga.value} value={lga.value}>
														{lga.label}
													</SelectItem>
												))}
											</Select>

											<Input
												label="City"
												placeholder="Enter city"
												value={profileForm.companyCity || ""}
												onChange={(e) =>
													handleProfileFieldChange(
														"companyCity",
														e.target.value
													)
												}
												isReadOnly={!isEditingProfile}
												startContent={
													<MapPin className="w-4 h-4 text-default-400" />
												}
												className="sm:col-span-2"
											/>
										</div>
									</div>
								</div>
							)}

							{selectedTab === "security" && (
								<div className="space-y-6">
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
										<h3
											className={cn(
												"font-medium mb-4",
												GeneralSans_SemiBold.className
											)}
										>
											Change Password
										</h3>
										<div className="grid grid-cols-1 gap-4 max-w-lg">
											<Input
												label="Current Password"
												placeholder="Enter current password"
												type={showOldPassword ? "text" : "password"}
												value={passwordForm.oldPassword}
												onChange={(e) =>
													handlePasswordFieldChange(
														"oldPassword",
														e.target.value
													)
												}
												startContent={
													<Lock className="w-4 h-4 text-default-400" />
												}
												endContent={
													<button
														type="button"
														onClick={() => setShowOldPassword(!showOldPassword)}
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
												onChange={(e) =>
													handlePasswordFieldChange("password", e.target.value)
												}
												startContent={
													<Lock className="w-4 h-4 text-default-400" />
												}
												endContent={
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
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
													handlePasswordFieldChange(
														"confirmPassword",
														e.target.value
													)
												}
												startContent={
													<Lock className="w-4 h-4 text-default-400" />
												}
												endContent={
													<button
														type="button"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
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
												onPress={handleUpdatePassword}
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
										<h3
											className={cn(
												"font-medium mb-4",
												GeneralSans_SemiBold.className
											)}
										>
											Account Information
										</h3>
										<div className="space-y-3 max-w-md">
											<div className="flex justify-between items-center py-2 border-b border-gray-100">
												<span className="text-sm text-gray-600">
													Account Status
												</span>
												<Chip
													size="sm"
													color={getStatusColor(
														profileData?.accountStatus || ""
													)}
													variant="flat"
												>
													{profileData?.accountStatus}
												</Chip>
											</div>

											<div className="flex justify-between items-center py-2 border-b border-gray-100">
												<span className="text-sm text-gray-600">
													Account Type
												</span>
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
												<span className="text-sm text-gray-600">
													Member Since
												</span>
												<span className="text-sm font-medium">
													{new Date(
														profileData?.createdAt || ""
													).toLocaleDateString()}
												</span>
											</div>

											<div className="flex justify-between items-center py-2">
												<span className="text-sm text-gray-600">
													Last Updated
												</span>
												<span className="text-sm font-medium">
													{new Date(
														profileData?.updatedAt || ""
													).toLocaleDateString()}
												</span>
											</div>
										</div>
									</div>
								</div>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
}
