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
import {
	showToast,
	validateImei,
	createClaim,
	getProductById,
	type ValidateImeiResponse,
} from "@/lib";

interface ClaimData {
	imei: string;
	firstName: string;
	lastName: string;
	customerPhone: string;
	customerEmail: string;
	state: string;
	location: string;
	deviceModel: string;
	deviceRepairPrice: number;
	description: string;
}

const CreateClaimView = () => {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [imeiInput, setImeiInput] = useState("");
	const [validationData, setValidationData] =
		useState<ValidateImeiResponse | null>(null);
	const [isValidating, setIsValidating] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [claimData, setClaimData] = useState<ClaimData>({
		imei: "",
		firstName: "",
		lastName: "",
		customerPhone: "",
		customerEmail: "",
		state: "",
		location: "",
		deviceModel: "",
		deviceRepairPrice: 0,
		description: "",
	});

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

	const handleIMEIValidation = async () => {
		if (!imeiInput.trim()) {
			showToast({ type: "error", message: "Please enter an IMEI number" });
			return;
		}

		setIsValidating(true);
		try {
			const result = await validateImei({ imei: imeiInput });

			if (result.is_eligible && result.exists) {
				setValidationData(result);

				// Get repair cost from validation response or fetch from product API
				let repairCost = result.repair_cost || 0;

				// If repair cost not returned by validation, fetch from product API
				if (!result.repair_cost && result.product_id) {
					try {
						const productResponse = await getProductById(result.product_id);
						const product = productResponse?.data || productResponse;
						if (product?.repair_cost) {
							repairCost = product.repair_cost;
						}
					} catch (error) {
						console.error("Failed to fetch product details:", error);
						// Continue with repair_cost = 0, backend will handle default
					}
				}

				setClaimData((prev) => ({
					...prev,
					imei: imeiInput,
					deviceModel: result?.product?.name,
					deviceRepairPrice: result?.product?.price,
				}));
				showToast({
					type: "success",
					message: "IMEI validated successfully",
				});
			} else if (!result.exists) {
				showToast({
					type: "error",
					message: "IMEI not found in the system",
				});
			} else if (result.is_used) {
				showToast({
					type: "error",
					message: "IMEI has already been used for a claim",
				});
			} else if (result.is_expired) {
				showToast({
					type: "error",
					message: "IMEI has expired",
				});
			} else {
				showToast({
					type: "error",
					message: result.eligibility_reason || "IMEI is not eligible",
				});
			}
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to validate IMEI",
			});
		} finally {
			setIsValidating(false);
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
			!claimData.location
		) {
			showToast({
				type: "error",
				message: "Please fill in all required fields",
			});
			return;
		}

		// Note: deviceRepairPrice will be 0 if not provided by API - backend should handle default value
		setIsCreating(true);
		try {
			const response = await createClaim({
				imei: claimData.imei,
				customer_first_name: claimData.firstName,
				customer_last_name: claimData.lastName,
				customer_phone: claimData.customerPhone,
				customer_email: claimData.customerEmail,
				repair_price: claimData.deviceRepairPrice,
				description: claimData.description,
			});

			showToast({
				type: "success",
				message: `Claim ${response.data.claim_number} created successfully`,
			});

			// Navigate to the claim detail view
			router.push(`/access/service-center/claims/${response.data.id}`);
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to create claim",
			});
		} finally {
			setIsCreating(false);
		}
	};

	const canProceedToStep2 =
		validationData?.is_eligible &&
		validationData?.exists &&
		!validationData?.is_used;
	const canSubmit =
		claimData.firstName &&
		claimData.lastName &&
		claimData.customerPhone &&
		claimData.state &&
		claimData.location;
	// Note: deviceRepairPrice validation removed - will be auto-populated from product data

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
									{validationData.is_eligible && validationData.exists ? (
										<Chip
											color="success"
											startContent={<CheckCircle className="h-3 w-3" />}
										>
											Valid Imei
										</Chip>
									) : (
										<Chip
											color="danger"
											startContent={<AlertTriangle className="h-3 w-3" />}
										>
											{validationData.eligibility_reason}
										</Chip>
									)}
								</div>

								<div className="bg-blue-50 p-4 rounded-lg">
									<h4 className="font-medium text-blue-900">
										IMEI Validation Details
									</h4>
									<div className="text-sm text-blue-700 mt-2 space-y-1">
										<p>IMEI: {imeiInput}</p>
										<p>Product: {validationData?.product?.name}</p>

										<p>
											Expiry Date:{" "}
											{new Date(
												validationData.expiry_date
											).toLocaleDateString()}
										</p>
										<p>
											Status:{" "}
											{!validationData.is_eligible
												? "Already Used"
												: validationData.is_expired
												? "Expired"
												: "Available"}
										</p>
										{!validationData.is_eligible && (
											<p className="text-red-600 font-medium mt-2">
												⚠️ {validationData.eligibility_reason}
											</p>
										)}
									</div>
								</div>

								{/* TODO: Claim History - Uncomment when API is available */}
								{/* {validationData.claimHistory && (
								<div className="bg-blue-50 p-4 rounded-lg">
									<h4 className="font-medium text-blue-900">
										Previous Claims History
									</h4>
									<div className="text-sm text-blue-700 mt-2 space-y-1">
										<p>Total Claims: {validationData.claimHistory.totalClaims}</p>
										<p>Claims in last 2 years: {validationData.claimHistory.recentClaims}</p>
										<p>Insurance Status: {validationData.claimHistory.insuranceStatus}</p>
										<p>Last Claim Date: {validationData.claimHistory.lastClaimDate}</p>
										{validationData.claimHistory.recentClaims >= 2 && (
											<p className="text-red-600 font-medium">
												⚠️ Maximum claims limit reached (2 claims in 2 years)
											</p>
										)}
									</div>
								</div>
							)} */}
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
								{canProceedToStep2 && (
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
									<Label htmlFor="deviceRepairPrice">Repair Price (₦)</Label>
									<Input
										id="deviceRepairPrice"
										type="number"
										value={claimData.deviceRepairPrice || ""}
										disabled
										className="bg-gray-100"
									/>
									{claimData.deviceRepairPrice === 0 && (
										<p className="text-xs text-muted-foreground">
											Note: Repair price will be fetched from product data when
											available
										</p>
									)}
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
