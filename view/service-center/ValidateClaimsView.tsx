"use client";

import React, { useState } from "react";
import {
	Button,
	Input,
	Card,
	CardBody,
	CardHeader,
	Divider,
} from "@heroui/react";
import { FormField } from "@/components/reususables";
import { showToast } from "@/lib/showNotification";
import { Search, AlertCircle, CheckCircle } from "lucide-react";
import {
	useValidateClaims,
	ValidationResult,
	ClaimFormData,
} from "@/hooks/service-center/useValidateClaims";

const ValidateClaimsView = () => {
	const [step, setStep] = useState<1 | 2>(1);
	const [imei, setImei] = useState("");
	const [validationResult, setValidationResult] =
		useState<ValidationResult | null>(null);
	const [isValidating, setIsValidating] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState<ClaimFormData>({
		imei: "",
		customerName: "",
		customerPhone: "",
		customerEmail: "",
		deviceBrand: "",
		deviceModel: "",
		devicePrice: "",
		faultType: "",
		repairCost: "",
		description: "",
	});

	const { validateImei, submitClaimForm } = useValidateClaims();

	const handleValidation = async () => {
		if (!imei.trim()) {
			showToast({
				type: "error",
				message: "Please enter IMEI number",
			});
			return;
		}

		setIsValidating(true);
		try {
			const result = await validateImei(imei);
			setValidationResult(result);

			if (result.isValid) {
				setFormData((prev) => ({
					...prev,
					imei,
					customerName: result.customerName || "",
				}));
				setStep(2);
				showToast({
					type: "success",
					message: "IMEI validated successfully",
				});
			} else {
				showToast({
					type: "error",
					message: result.error || "IMEI validation failed",
				});
			}
		} catch (error) {
			showToast({
				type: "error",
				message: "Validation failed. Please try again.",
			});
		} finally {
			setIsValidating(false);
		}
	};

	const handleInputChange = (field: keyof ClaimFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async () => {
		// Basic validation
		const requiredFields: (keyof ClaimFormData)[] = [
			"customerPhone",
			"deviceBrand",
			"deviceModel",
			"devicePrice",
			"faultType",
			"repairCost",
			"description",
		];

		for (const field of requiredFields) {
			if (!formData[field].trim()) {
				showToast({
					type: "error",
					message: `Please fill in ${field
						.replace(/([A-Z])/g, " $1")
						.toLowerCase()}`,
				});
				return;
			}
		}

		setIsSubmitting(true);
		try {
			const result = await submitClaimForm(formData);

			if (result.success) {
				showToast({
					type: "success",
					message: `Claim submitted successfully! Claim ID: ${result.claimId}`,
				});
				// Reset form
				setStep(1);
				setImei("");
				setValidationResult(null);
				setFormData({
					imei: "",
					customerName: "",
					customerPhone: "",
					customerEmail: "",
					deviceBrand: "",
					deviceModel: "",
					devicePrice: "",
					faultType: "",
					repairCost: "",
					description: "",
				});
			} else {
				showToast({
					type: "error",
					message: result.error || "Failed to submit claim",
				});
			}
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to submit claim. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBack = () => {
		setStep(1);
		setValidationResult(null);
	};

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Validate Claims
				</h1>
				<p className="text-gray-600">
					Validate device IMEI and create repair claims
				</p>
			</div>

			{step === 1 ? (
				<Card className="max-w-2xl mx-auto">
					<CardHeader>
						<h2 className="text-lg font-semibold flex items-center gap-2">
							<Search size={20} />
							IMEI Validation
						</h2>
					</CardHeader>
					<CardBody className="space-y-4">
						<div>
							<FormField
								label="IMEI Number"
								htmlFor="imei"
								id="imei"
								type="text"
								placeholder="Enter 15-digit IMEI number"
								value={imei}
								onChange={(value) => setImei(value)}
								size="lg"
								maxLen={15}
							/>
							<p className="text-sm text-gray-500 mt-1">
								Enter the device IMEI to validate insurance coverage
							</p>
						</div>

						{validationResult && !validationResult.isValid && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
								<AlertCircle className="text-red-500 mt-0.5" size={20} />
								<div>
									<p className="text-red-700 font-medium">Validation Failed</p>
									<p className="text-red-600 text-sm">
										{validationResult.error}
									</p>
								</div>
							</div>
						)}

						<Button
							color="primary"
							size="lg"
							onPress={handleValidation}
							isLoading={isValidating}
							disabled={!imei.trim()}
							className="w-full"
						>
							{isValidating ? "Validating..." : "Validate IMEI"}
						</Button>
					</CardBody>
				</Card>
			) : (
				<>
					{/* Validation Result Summary */}
					{validationResult && validationResult.isValid && (
						<Card className="mb-6 border-green-200 bg-green-50">
							<CardBody>
								<div className="flex items-start gap-3">
									<CheckCircle className="text-green-500 mt-0.5" size={20} />
									<div className="flex-1">
										<h3 className="font-semibold text-green-900 mb-2">
											IMEI Validated Successfully
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
											<div>
												<p className="text-green-700">
													<span className="font-medium">Customer:</span>{" "}
													{validationResult.customerName}
												</p>
												<p className="text-green-700">
													<span className="font-medium">IMEI:</span> {imei}
												</p>
											</div>
											{validationResult.previousClaims && (
												<div>
													<p className="text-green-700">
														<span className="font-medium">
															Previous Claims:
														</span>{" "}
														{validationResult.previousClaims.count}
													</p>
													<p className="text-green-700">
														<span className="font-medium">
															Remaining Claims:
														</span>{" "}
														{validationResult.previousClaims.remainingClaims}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					)}

					{/* Claim Form */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold">Create Repair Claim</h2>
								<Button variant="light" onPress={handleBack} size="sm">
									← Back to Validation
								</Button>
							</div>
						</CardHeader>
						<CardBody className="space-y-6">
							{/* Customer Information */}
							<div>
								<h3 className="text-md font-semibold mb-4">
									Customer Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										label="Customer Name"
										htmlFor="customerName"
										id="customerName"
										type="text"
										placeholder=""
										value={formData.customerName}
										onChange={(value) =>
											handleInputChange("customerName", value)
										}
										size="lg"
										disabled
									/>
									<FormField
										label="Phone Number"
										htmlFor="customerPhone"
										id="customerPhone"
										type="tel"
										placeholder="+234..."
										value={formData.customerPhone}
										onChange={(value) =>
											handleInputChange("customerPhone", value)
										}
										size="lg"
									/>
									<FormField
										label="Email Address (Optional)"
										htmlFor="customerEmail"
										id="customerEmail"
										type="email"
										placeholder="customer@example.com"
										value={formData.customerEmail}
										onChange={(value) =>
											handleInputChange("customerEmail", value)
										}
										size="lg"
									/>
								</div>
							</div>

							<Divider />

							{/* Device Information */}
							<div>
								<h3 className="text-md font-semibold mb-4">
									Device Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										label="Device Brand"
										htmlFor="deviceBrand"
										id="deviceBrand"
										type="text"
										placeholder="e.g., Samsung"
										value={formData.deviceBrand}
										onChange={(value) =>
											handleInputChange("deviceBrand", value)
										}
										size="lg"
									/>
									<FormField
										label="Device Model"
										htmlFor="deviceModel"
										id="deviceModel"
										type="text"
										placeholder="e.g., Galaxy S22"
										value={formData.deviceModel}
										onChange={(value) =>
											handleInputChange("deviceModel", value)
										}
										size="lg"
									/>
									<FormField
										label="Device Price (₦)"
										htmlFor="devicePrice"
										id="devicePrice"
										type="number"
										placeholder="450000"
										value={formData.devicePrice}
										onChange={(value) =>
											handleInputChange("devicePrice", value)
										}
										size="lg"
									/>
								</div>
							</div>

							<Divider />

							{/* Repair Information */}
							<div>
								<h3 className="text-md font-semibold mb-4">
									Repair Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										label="Fault Type"
										htmlFor="faultType"
										id="faultType"
										type="text"
										placeholder="e.g., Screen Damage"
										value={formData.faultType}
										onChange={(value) => handleInputChange("faultType", value)}
										size="lg"
									/>
									<FormField
										label="Estimated Repair Cost (₦)"
										htmlFor="repairCost"
										id="repairCost"
										type="number"
										placeholder="45000"
										value={formData.repairCost}
										onChange={(value) => handleInputChange("repairCost", value)}
										size="lg"
									/>
								</div>
								<div className="mt-4">
									<FormField
										label="Problem Description"
										htmlFor="description"
										id="description"
										type="text"
										placeholder="Describe the device problem in detail..."
										value={formData.description}
										onChange={(value) =>
											handleInputChange("description", value)
										}
										size="lg"
									/>
								</div>
							</div>

							<div className="flex justify-end pt-4">
								<Button
									color="primary"
									size="lg"
									onPress={handleSubmit}
									isLoading={isSubmitting}
									className="px-8"
								>
									{isSubmitting ? "Submitting..." : "Submit Claim"}
								</Button>
							</div>
						</CardBody>
					</Card>
				</>
			)}
		</div>
	);
};

export default ValidateClaimsView;
