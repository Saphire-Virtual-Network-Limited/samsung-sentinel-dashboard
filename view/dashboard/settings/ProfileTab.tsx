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
	id: string;
	email: string;
	name: string;
	phone: string;
	role: string;
	status: string;
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
					<div className="sm:col-span-2">
						<Input
							label="Full Name"
							placeholder="Enter full name"
							value={profileForm.name || ""}
							onChange={(e) => onProfileFieldChange("name", e.target.value)}
							isReadOnly={!isEditingProfile}
							startContent={<User className="w-4 h-4 text-default-400" />}
						/>
					</div>

					<div className="sm:col-span-2">
						<Input
							label="Email Address"
							placeholder="Enter email address"
							value={profileForm.email || ""}
							isReadOnly={true}
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

					<div className="sm:col-span-2">
						<Input
							label="Phone Number"
							placeholder="Enter phone number"
							value={profileForm.phone || ""}
							onChange={(e) => onProfileFieldChange("phone", e.target.value)}
							isReadOnly={!isEditingProfile}
							startContent={<Phone className="w-4 h-4 text-default-400" />}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
