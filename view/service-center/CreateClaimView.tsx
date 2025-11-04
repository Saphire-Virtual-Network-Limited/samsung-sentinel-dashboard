"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectItem,
	Chip,
	Card,
	CardBody,
	CardHeader,
} from "@heroui/react";
import {
	CheckCircle,
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
} from "lucide-react";
// import {
//	useValidateIMEI,
//	useCreateClaim,
// } from "@/hooks/service-center/useClaims"; // Not implemented
import { showToast } from "@/lib";

interface ClaimData {
	imei: string;
	firstName: string;
	lastName: string;
	customerPhone: string;
	customerEmail: string;
	state: string;
	location: string;
	deviceModel: string;
	deviceFault: string;
	deviceRepairPrice: number;
	description: string;
}

const CreateClaimView = () => {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [imeiInput, setImeiInput] = useState("");
	const [validationData, setValidationData] = useState<any>(null);
	const [claimData, setClaimData] = useState<ClaimData>({
		imei: "",
		firstName: "",
		lastName: "",
		customerPhone: "",
		customerEmail: "",
		state: "",
		location: "",
		deviceModel: "",
		deviceFault: "screen-repair",
		deviceRepairPrice: 0,
		description: "",
	});

	// Device repair prices based on model
	const repairPrices = {
		"Samsung A05": 25000,
		"Samsung A06": 30000,
		"Samsung A07": 35000,
	};

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
		"Federal Capital Territory",
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

	// Auto-detect device model and set repair price based on IMEI
	const detectDeviceModel = (imei: string) => {
		// Simple logic to determine device model from IMEI
		// Check for A06 patterns
		if (imei.includes("06") || imei.includes("111")) {
			return "Samsung A06";
		}
		// Check for A07 patterns
		else if (imei.includes("07") || imei.includes("222")) {
			return "Samsung A07";
		}
		// Default to A05
		else {
			return "Samsung A05";
		}
	};

	// Mock functions since hooks don't exist
	const validateIMEI = async (imei: string) => {
		const isValid = imei.length === 15;
		const deviceModel = detectDeviceModel(imei);
		const response: any = {
			isValid,
			device: { model: deviceModel, brand: "Samsung" },
			claimHistory: {
				totalClaims: 1,
				recentClaims: 1,
				insuranceStatus: "Active",
				lastClaimDate: "2024-03-20",
			},
		};

		// Add different claim history for specific IMEI
		if (imei === "352924996382946") {
			response.claimHistory = {
				totalClaims: 2,
				recentClaims: 2,
				insuranceStatus: "Active",
				lastClaimDate: "2024-08-15",
			};
		}

		return response;
	};
	const createClaim = async (data: any) => ({ success: true });
	const isValidating = false;
	const isCreating = false;

	const handleIMEIValidation = async () => {
		if (!imeiInput.trim()) {
			showToast({ type: "error", message: "Please enter an IMEI number" });
			return;
		}

		try {
			const result = await validateIMEI(imeiInput);
			if (result.isValid) {
				const deviceModel = result.device.model;
				const repairPrice =
					repairPrices[deviceModel as keyof typeof repairPrices] || 25000;

				setValidationData(result);
				setClaimData((prev) => ({
					...prev,
					imei: imeiInput,
					deviceModel: deviceModel,
					deviceRepairPrice: repairPrice,
				}));
				showToast({
					type: "success",
					message: "IMEI validated successfully",
				});
			} else {
				showToast({
					type: "error",
					message: "IMEI is not valid",
				});
			}
		} catch (error) {
			showToast({ type: "error", message: "Failed to validate IMEI" });
		}
	};

	const handleInputChange = (field: keyof ClaimData, value: any) => {
		setClaimData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmitClaim = async () => {
		// Validate required fields
		if (
			!claimData.firstName ||
			!claimData.lastName ||
			!claimData.customerPhone ||
			!claimData.state ||
			!claimData.location ||
			!claimData.deviceFault
		) {
			showToast({
				type: "error",
				message: "Please fill in all required fields",
			});
			return;
		}

		try {
			await createClaim(claimData);
			showToast({ type: "success", message: "Claim created successfully" });
			router.push("/access/service-center/claims/pending");
		} catch (error) {
			showToast({ type: "error", message: "Failed to create claim" });
		}
	};

	const canProceedToStep2 = validationData?.isValid;
	const canSubmit =
		claimData.firstName &&
		claimData.lastName &&
		claimData.customerPhone &&
		claimData.state &&
		claimData.location &&
		claimData.deviceFault;

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<div>
					<h1 className="text-2xl font-bold">Create New Claim</h1>
					<p className="text-muted-foreground">Submit a new insurance claim</p>
				</div>
			</div>

			{/* Progress Steps */}
			<div className="flex items-center space-x-4">
				<div
					className={`flex items-center space-x-2 ${
						currentStep >= 1 ? "text-primary" : "text-muted-foreground"
					}`}
				>
					<div
						className={`rounded-full h-8 w-8 flex items-center justify-center ${
							currentStep >= 1
								? "bg-primary text-primary-foreground"
								: "bg-muted"
						}`}
					>
						{currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
					</div>
					<span className="font-medium">IMEI Validation</span>
				</div>
				<Separator className="flex-1" />
				<div
					className={`flex items-center space-x-2 ${
						currentStep >= 2 ? "text-primary" : "text-muted-foreground"
					}`}
				>
					<div
						className={`rounded-full h-8 w-8 flex items-center justify-center ${
							currentStep >= 2
								? "bg-primary text-primary-foreground"
								: "bg-muted"
						}`}
					>
						2
					</div>
					<span className="font-medium">Claim Details</span>
				</div>
			</div>

			{/* Step 1: IMEI Validation */}
			{currentStep === 1 && (
				<Card>
					<CardHeader>
						<h3 className="flex items-center gap-2 text-lg font-semibold">
							<CheckCircle className="h-5 w-5" />
							Step 1: Validate Device IMEI
						</h3>
					</CardHeader>
					<CardBody className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="imei">IMEI Number *</Label>
							<Input
								id="imei"
								value={imeiInput}
								onChange={(e) => setImeiInput(e.target.value)}
								placeholder="Enter 15-digit IMEI number"
								maxLength={15}
							/>
						</div>

						{validationData && (
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									{validationData.isValid ? (
										<Chip
											color="success"
											startContent={<CheckCircle className="h-3 w-3" />}
										>
											Valid IMEI
										</Chip>
									) : (
										<Chip
											color="danger"
											startContent={<AlertTriangle className="h-3 w-3" />}
										>
											Invalid IMEI
										</Chip>
									)}
								</div>

								{validationData.claimHistory && (
									<div className="bg-blue-50 p-4 rounded-lg">
										<h4 className="font-medium text-blue-900">
											Previous Claims History
										</h4>
										<div className="text-sm text-blue-700 mt-2 space-y-1">
											<p>
												Total Claims: {validationData.claimHistory.totalClaims}
											</p>
											<p>
												Claims in last 2 years:{" "}
												{validationData.claimHistory.recentClaims}
											</p>
											<p>
												Insurance Status:{" "}
												{validationData.claimHistory.insuranceStatus}
											</p>
											<p>
												Last Claim Date:{" "}
												{validationData.claimHistory.lastClaimDate}
											</p>
											{validationData.claimHistory.recentClaims >= 2 && (
												<p className="text-red-600 font-medium">
													⚠️ Maximum claims limit reached (2 claims in 2 years)
												</p>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						<div className="flex justify-between">
							<div></div>
							<div className="space-x-2">
								<Button
									onClick={handleIMEIValidation}
									disabled={isValidating || !imeiInput.trim()}
								>
									{isValidating ? "Validating..." : "Validate IMEI"}
								</Button>
								{canProceedToStep2 &&
									validationData.claimHistory.recentClaims < 2 && (
										<Button onClick={() => setCurrentStep(2)}>
											Next Step
											<ArrowRight className="h-4 w-4 ml-2" />
										</Button>
									)}
							</div>
						</div>
					</CardBody>
				</Card>
			)}

			{/* Step 2: Claim Form */}
			{currentStep === 2 && (
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Step 2: Claim Details</h3>
					</CardHeader>
					<CardBody className="space-y-6">
						{/* Customer Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Customer Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name *</Label>
									<Input
										id="firstName"
										value={claimData.firstName}
										onChange={(e) =>
											handleInputChange("firstName", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name *</Label>
									<Input
										id="lastName"
										value={claimData.lastName}
										onChange={(e) =>
											handleInputChange("lastName", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="customerEmail">Email</Label>
									<Input
										id="customerEmail"
										type="email"
										value={claimData.customerEmail}
										onChange={(e) =>
											handleInputChange("customerEmail", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="customerPhone">Phone Number *</Label>
									<Input
										id="customerPhone"
										value={claimData.customerPhone}
										onChange={(e) =>
											handleInputChange("customerPhone", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="state">State *</Label>
									<Select
										placeholder="Select state"
										selectedKeys={claimData.state ? [claimData.state] : []}
										onSelectionChange={(keys) => {
											const value = Array.from(keys)[0] as string;
											handleInputChange("state", value);
										}}
									>
										{nigerianStates.map((state) => (
											<SelectItem key={state} value={state}>
												{state}
											</SelectItem>
										))}
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="location">Location *</Label>
									<Input
										id="location"
										value={claimData.location}
										onChange={(e) =>
											handleInputChange("location", e.target.value)
										}
										placeholder="Enter city/area"
									/>
								</div>
							</div>
						</div>

						{/* Device Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Device Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="imeiDisplay">IMEI</Label>
									<Input id="imeiDisplay" value={claimData.imei} disabled />
								</div>
								<div className="space-y-2">
									<Label htmlFor="deviceModel">Device Model</Label>
									<Input
										id="deviceModel"
										value={claimData.deviceModel}
										disabled
										className="bg-gray-100"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="deviceFault">Device Fault</Label>
									<Input
										id="deviceFault"
										value="Screen Repair"
										disabled
										className="bg-gray-100"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="deviceRepairPrice">
										Device Repair Price (₦)
									</Label>
									<Input
										id="deviceRepairPrice"
										value={claimData.deviceRepairPrice.toLocaleString()}
										disabled
										className="bg-gray-100"
									/>
								</div>
							</div>
						</div>

						{/* Claim Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Claim Information</h3>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<textarea
									id="description"
									className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									value={claimData.description}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										handleInputChange("description", e.target.value)
									}
									placeholder="Describe the damage or issue..."
									rows={3}
								/>
							</div>
						</div>

						<div className="flex justify-between">
							<Button variant="outline" onClick={() => setCurrentStep(1)}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<Button
								onClick={handleSubmitClaim}
								disabled={!canSubmit || isCreating}
							>
								{isCreating ? "Creating Claim..." : "Submit Claim"}
							</Button>
						</div>
					</CardBody>
				</Card>
			)}
		</div>
	);
};

export default CreateClaimView;
