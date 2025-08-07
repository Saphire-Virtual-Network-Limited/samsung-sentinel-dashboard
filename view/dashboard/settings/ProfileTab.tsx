"use client";

import React from "react";
import { Button, Input, Select, SelectItem, Divider } from "@heroui/react";
import {
	User,
	Building2,
	Phone,
	Mail,
	MapPin,
	Edit,
	Save,
	X,
	Copy,
} from "lucide-react";
import { useNaijaStates } from "@/hooks/user-mangement/use-naija-states";
import { cn, GeneralSans_SemiBold, showToast } from "@/lib";

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

interface ProfileTabProps {
	profileData: ProfileData | null;
	profileForm: Partial<ProfileData>;
	isEditingProfile: boolean;
	isUpdatingProfile: boolean;
	onProfileFieldChange: (field: keyof ProfileData, value: string) => void;
	onStartEdit: () => void;
	onCancelEdit: () => void;
	onUpdateProfile: () => void;
}

export default function ProfileTab({
	profileData,
	profileForm,
	isEditingProfile,
	isUpdatingProfile,
	onProfileFieldChange,
	onStartEdit,
	onCancelEdit,
	onUpdateProfile,
}: ProfileTabProps) {
	const { states, getLgas } = useNaijaStates();

	// Get LGAs for selected state
	const lgas = profileForm.companyState
		? getLgas(profileForm.companyState)
		: [];

	const copyEmailToClipboard = async () => {
		if (profileData?.email) {
			try {
				await navigator.clipboard.writeText(profileData.email);
				showToast({
					type: "success",
					message: "Email copied to clipboard",
				});
			} catch (err) {
				// Fallback for older browsers
				const textArea = document.createElement("textarea");
				textArea.value = profileData.email;
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				try {
					document.execCommand("copy");
					showToast({
						type: "success",
						message: "Email copied to clipboard",
					});
				} catch (fallbackErr) {
					showToast({
						type: "error",
						message: "Failed to copy email",
					});
				}
				document.body.removeChild(textArea);
			}
		}
	};

	return (
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
						onPress={onStartEdit}
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
							onPress={onCancelEdit}
							isDisabled={isUpdatingProfile}
							className="flex-1 sm:flex-none"
						>
							Cancel
						</Button>
						<Button
							color="primary"
							startContent={<Save className="w-4 h-4" />}
							onPress={onUpdateProfile}
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
				<h3 className={cn("font-medium mb-4", GeneralSans_SemiBold.className)}>
					Personal Information
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						label="First Name"
						placeholder="Enter first name"
						value={profileForm.firstName || ""}
						onChange={(e) => onProfileFieldChange("firstName", e.target.value)}
						isReadOnly={!isEditingProfile}
						startContent={<User className="w-4 h-4 text-default-400" />}
					/>

					<Input
						label="Last Name"
						placeholder="Enter last name"
						value={profileForm.lastName || ""}
						onChange={(e) => onProfileFieldChange("lastName", e.target.value)}
						isReadOnly={!isEditingProfile}
						startContent={<User className="w-4 h-4 text-default-400" />}
					/>

					<div className="sm:col-span-2">
						<Input
							label="Email Address"
							placeholder="Enter email address"
							value={profileForm.email || ""}
							onChange={(e) => onProfileFieldChange("email", e.target.value)}
							isReadOnly={!isEditingProfile}
							startContent={<Mail className="w-4 h-4 text-default-400" />}
							endContent={
								<button
									type="button"
									onClick={copyEmailToClipboard}
									className="text-default-400 hover:text-default-600 transition-colors"
									title="Copy email to clipboard"
								>
									<Copy className="w-4 h-4" />
								</button>
							}
						/>
					</div>

					<Input
						label="Phone Number"
						placeholder="Enter phone number"
						value={profileForm.telephoneNumber || ""}
						onChange={(e) =>
							onProfileFieldChange("telephoneNumber", e.target.value)
						}
						isReadOnly={!isEditingProfile}
						startContent={<Phone className="w-4 h-4 text-default-400" />}
					/>
				</div>
			</div>

			<Divider />

			{/* Company Information */}
			<div>
				<h3 className={cn("font-medium mb-4", GeneralSans_SemiBold.className)}>
					Company Information
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						label="Company Name"
						placeholder="Enter company name"
						value={profileForm.companyName || ""}
						onChange={(e) =>
							onProfileFieldChange("companyName", e.target.value)
						}
						isReadOnly={!isEditingProfile}
						startContent={<Building2 className="w-4 h-4 text-default-400" />}
						className="sm:col-span-2"
					/>

					<Input
						label="Company Address"
						placeholder="Enter company address"
						value={profileForm.companyAddress || ""}
						onChange={(e) =>
							onProfileFieldChange("companyAddress", e.target.value)
						}
						isReadOnly={!isEditingProfile}
						startContent={<MapPin className="w-4 h-4 text-default-400" />}
						className="sm:col-span-2"
					/>

					<Select
						label="State"
						placeholder="Select state"
						selectedKeys={
							profileForm.companyState ? [profileForm.companyState] : []
						}
						onSelectionChange={(keys) => {
							const selectedState = Array.from(keys)[0] as string;
							onProfileFieldChange("companyState", selectedState);
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
							onProfileFieldChange("companyLGA", selectedLGA);
						}}
						isDisabled={!isEditingProfile || !profileForm.companyState}
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
							onProfileFieldChange("companyCity", e.target.value)
						}
						isReadOnly={!isEditingProfile}
						startContent={<MapPin className="w-4 h-4 text-default-400" />}
						className="sm:col-span-2"
					/>
				</div>
			</div>
		</div>
	);
}
