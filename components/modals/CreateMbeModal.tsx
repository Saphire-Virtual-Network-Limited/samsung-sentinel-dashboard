"use client";

import React, { useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Select,
	SelectItem,
} from "@heroui/react";
import { toast } from "sonner";
import { createMbeRecord } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

interface CreateMbeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface CreateMbeData {
	title: string;
	firstname: string;
	lastname: string;
	phone: string;
	state: string;
	username: string;
	bvn: string;
	bvnPhoneNumber: string;
	channel: string;
	dob: string;
	email: string;
	password?: string;
	role: string;
}

// Nigerian states
const nigerianStates = [
	"Abia",
	"Adamawa",
	"Akwa Ibom",
	"Anambra",
	"Bauchi",
	"Bayelsa",
	"Benue",
	"Borno",
	"Cross River",
	"Delta",
	"Ebonyi",
	"Edo",
	"Ekiti",
	"Enugu",
	"FCT",
	"Gombe",
	"Imo",
	"Jigawa",
	"Kaduna",
	"Kano",
	"Katsina",
	"Kebbi",
	"Kogi",
	"Kwara",
	"Lagos",
	"Nasarawa",
	"Niger",
	"Ogun",
	"Ondo",
	"Osun",
	"Oyo",
	"Plateau",
	"Rivers",
	"Sokoto",
	"Taraba",
	"Yobe",
	"Zamfara",
];

export default function CreateMbeModal({
	isOpen,
	onClose,
	onSuccess,
}: CreateMbeModalProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<CreateMbeData>({
		title: "MOBIFLEX_MBE",
		firstname: "",
		lastname: "",
		phone: "",
		state: "",
		username: "",
		bvn: "",
		bvnPhoneNumber: "",
		channel: "Mobiflex",
		dob: "",
		email: "",
		password: "",
		role: "MBE",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const togglePasswordVisibility = () =>
		setIsPasswordVisible(!isPasswordVisible);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.firstname.trim())
			newErrors.firstname = "First name is required";
		if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
		if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
		if (!formData.state.trim()) newErrors.state = "State is required";
		if (!formData.username.trim()) newErrors.username = "Username is required";
		if (!formData.bvn.trim()) newErrors.bvn = "BVN is required";
		if (!formData.bvnPhoneNumber.trim())
			newErrors.bvnPhoneNumber = "BVN phone number is required";
		if (!formData.dob.trim()) newErrors.dob = "Date of birth is required";
		if (!formData.email.trim()) newErrors.email = "Email is required";

		// Validate email format
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Invalid email format";
		}

		// Validate phone number format (basic Nigerian phone number validation)
		if (
			formData.phone &&
			!/^\+?234[789][01]\d{8}$/.test(formData.phone.replace(/\s/g, ""))
		) {
			newErrors.phone = "Invalid Nigerian phone number format";
		}

		// Validate BVN (11 digits)
		if (formData.bvn && !/^\d{11}$/.test(formData.bvn)) {
			newErrors.bvn = "BVN must be 11 digits";
		}

		// Validate date of birth (must be 18+ years old)
		if (formData.dob) {
			const today = new Date();
			const birthDate = new Date(formData.dob);
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();

			if (
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
			) {
				age--;
			}

			if (age < 18) {
				newErrors.dob = "Must be at least 18 years old";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof CreateMbeData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			toast.error("Please fix the validation errors");
			return;
		}

		setLoading(true);
		try {
			const MOBIFLEX_APP_KEY = process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY;

			// Prepare the data for API
			const apiData = {
				title: "MOBIFLEX_MBE", // Always MOBIFLEX_MBE for MBEs
				firstname: formData.firstname,
				lastname: formData.lastname,
				phone: formData.phone,
				state: formData.state,
				username: formData.username,
				bvn: formData.bvn,
				bvnPhoneNumber: formData.bvnPhoneNumber,
				channel: "Mobiflex", // Default Mobiflex
				dob: formData.dob,
				email: formData.email,
				isActive: "", // As per API spec
				role: "MBE", // Always MBE
				// Include password only if provided (it's optional)
				...(formData.password ? { password: formData.password } : {}),
			};

			const result = await createMbeRecord(apiData, {
				appKey: MOBIFLEX_APP_KEY,
			});

			if (!result.data) {
				throw new Error("Failed to create MBE");
			}

			toast.success("MBE created successfully!");
			onSuccess();
			onClose();

			// Reset form
			setFormData({
				title: "MOBIFLEX_MBE",
				firstname: "",
				lastname: "",
				phone: "",
				state: "",
				username: "",
				bvn: "",
				bvnPhoneNumber: "",
				channel: "Mobiflex",
				dob: "",
				email: "",
				password: "",
				role: "MBE",
			});
		} catch (error) {
			console.error("Error creating MBE:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create MBE"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			onClose();
			setErrors({});
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="2xl"
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					Create New MBE
				</ModalHeader>
				<ModalBody className="gap-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="First Name"
							placeholder="Enter first name"
							value={formData.firstname}
							onValueChange={(value) => handleInputChange("firstname", value)}
							isInvalid={!!errors.firstname}
							errorMessage={errors.firstname}
							isRequired
						/>
						<Input
							label="Last Name"
							placeholder="Enter last name"
							value={formData.lastname}
							onValueChange={(value) => handleInputChange("lastname", value)}
							isInvalid={!!errors.lastname}
							errorMessage={errors.lastname}
							isRequired
						/>
						<Input
							label="Username"
							placeholder="Enter username"
							value={formData.username}
							onValueChange={(value) => handleInputChange("username", value)}
							isInvalid={!!errors.username}
							errorMessage={errors.username}
							isRequired
						/>
						<Input
							label="Email"
							type="email"
							placeholder="Enter email address"
							value={formData.email}
							onValueChange={(value) => handleInputChange("email", value)}
							isInvalid={!!errors.email}
							errorMessage={errors.email}
							isRequired
						/>
						<Input
							label="Phone Number"
							placeholder="e.g., +2348123456789"
							value={formData.phone}
							onValueChange={(value) => handleInputChange("phone", value)}
							isInvalid={!!errors.phone}
							errorMessage={errors.phone}
							isRequired
						/>
						<Input
							label="BVN Phone Number"
							placeholder="e.g., +2348123456789"
							value={formData.bvnPhoneNumber}
							onValueChange={(value) =>
								handleInputChange("bvnPhoneNumber", value)
							}
							isInvalid={!!errors.bvnPhoneNumber}
							errorMessage={errors.bvnPhoneNumber}
							isRequired
						/>
						<Input
							label="BVN"
							placeholder="Enter 11-digit BVN"
							value={formData.bvn}
							onValueChange={(value) => handleInputChange("bvn", value)}
							isInvalid={!!errors.bvn}
							errorMessage={errors.bvn}
							maxLength={11}
							isRequired
						/>
						<Select
							label="State"
							placeholder="Select state"
							selectedKeys={formData.state ? [formData.state] : []}
							onSelectionChange={(keys) => {
								const selectedState = Array.from(keys)[0] as string;
								handleInputChange("state", selectedState || "");
							}}
							isInvalid={!!errors.state}
							errorMessage={errors.state}
							isRequired
						>
							{nigerianStates.map((state) => (
								<SelectItem key={state} value={state}>
									{state}
								</SelectItem>
							))}
						</Select>
						<Input
							label="Date of Birth"
							type="date"
							value={formData.dob}
							onValueChange={(value) => handleInputChange("dob", value)}
							isInvalid={!!errors.dob}
							errorMessage={errors.dob}
							isRequired
						/>
						<Input
							label="Password (Optional)"
							type={isPasswordVisible ? "text" : "password"}
							placeholder="Enter password (optional)"
							value={formData.password}
							onValueChange={(value) => handleInputChange("password", value)}
							description="If not provided, a default password will be generated"
							endContent={
								<button
									className="focus:outline-none"
									type="button"
									onClick={togglePasswordVisibility}
									aria-label="toggle password visibility"
								>
									{isPasswordVisible ? (
										<EyeOff className="w-4 h-4 text-default-400 pointer-events-none" />
									) : (
										<Eye className="w-4 h-4 text-default-400 pointer-events-none" />
									)}
								</button>
							}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
						<Input
							label="Title"
							value={formData.title}
							isReadOnly
							description="Fixed: MOBIFLEX_MBE for all MBEs"
						/>
						<Input
							label="Channel"
							value={formData.channel}
							isReadOnly
							description="Fixed: Mobiflex for all MBEs"
						/>
						<Input
							label="Role"
							value={formData.role}
							isReadOnly
							description="Fixed: MBE for all MBEs"
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button
						color="danger"
						variant="light"
						onPress={handleClose}
						isDisabled={loading}
					>
						Cancel
					</Button>
					<Button color="primary" onPress={handleSubmit} isLoading={loading}>
						Create MBE
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
