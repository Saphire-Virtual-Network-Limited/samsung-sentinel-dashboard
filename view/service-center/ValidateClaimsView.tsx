"use client";

import React, { useState } from "react";
import {
	Button,
	Input,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Chip,
} from "@heroui/react";
import { FormField } from "@/components/reususables";
import { showToast } from "@/lib/showNotification";
import {
	Search,
	AlertCircle,
	CheckCircle,
	Smartphone,
	Calendar,
	Shield,
	History,
	Clock,
	Award,
} from "lucide-react";
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
					{/* Device Details Card */}
					{validationResult && validationResult.isValid && (
						<div className="space-y-6 mb-6">
							{/* Quick Validation Status */}
							<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
								<CardBody>
									<div className="flex items-start gap-3">
										<CheckCircle className="text-green-500 mt-0.5" size={20} />
										<div className="flex-1">
											<h3 className="font-semibold text-green-900 mb-1">
												IMEI Validated Successfully
											</h3>
											<p className="text-sm text-green-700">
												Device is eligible for warranty claim
											</p>
										</div>
									</div>
								</CardBody>
							</Card>

							{/* Comprehensive Device Details */}
							<Card className="border-primary-200">
								<CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 pb-3">
									<h2 className="text-lg font-semibold flex items-center gap-2">
										<Smartphone size={20} className="text-primary-600" />
										Device & Coverage Details
									</h2>
								</CardHeader>
								<CardBody className="space-y-6">
									{/* Device Information Section */}
									<div>
										<div className="flex items-center gap-2 mb-4">
											<Smartphone size={18} className="text-gray-600" />
											<h3 className="text-md font-semibold text-gray-900">
												Device Information
											</h3>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
											<div className="space-y-1">
												<p className="text-xs text-gray-500 uppercase tracking-wide">
													IMEI Number
												</p>
												<p className="text-sm font-mono font-semibold text-gray-900">
													{imei}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-xs text-gray-500 uppercase tracking-wide">
													Device Model
												</p>
												<p className="text-sm font-semibold text-gray-900">
													{validationResult.deviceModel || "Not specified"}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-xs text-gray-500 uppercase tracking-wide">
													Device Brand
												</p>
												<p className="text-sm font-semibold text-gray-900">
													{validationResult.deviceBrand || "Not specified"}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-xs text-gray-500 uppercase tracking-wide">
													Customer Name
												</p>
												<p className="text-sm font-semibold text-gray-900">
													{validationResult.customerName}
												</p>
											</div>
										</div>
									</div>

									<Divider />

									{/* Warranty & Coverage Period */}
									{validationResult.previousClaims && (
										<div>
											<div className="flex items-center gap-2 mb-4">
												<Shield size={18} className="text-primary-600" />
												<h3 className="text-md font-semibold text-gray-900">
													Warranty & Coverage Period
												</h3>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{/* Coverage Timeline */}
												<div className="grid grid-cols-1 gap-4">
													<div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-100 h-[120px] flex">
														<div className="flex items-start gap-3 w-full">
															<Calendar
																className="text-primary-600 mt-1 flex-shrink-0"
																size={20}
															/>
															<div className="flex-1 min-w-0">
																<p className="text-xs text-primary-700 font-medium mb-1">
																	Registration Date
																</p>
																<p className="text-sm font-semibold text-gray-900">
																	{new Date(
																		validationResult.previousClaims.registrationDate
																	).toLocaleDateString("en-US", {
																		year: "numeric",
																		month: "long",
																		day: "numeric",
																	})}
																</p>
															</div>
														</div>
													</div>

													<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 h-[120px] flex">
														<div className="flex items-start gap-3 w-full">
															<Calendar
																className="text-green-600 mt-1 flex-shrink-0"
																size={20}
															/>
															<div className="flex-1 min-w-0">
																<p className="text-xs text-green-700 font-medium mb-1">
																	Coverage Expires
																</p>
																<p className="text-sm font-semibold text-gray-900">
																	{new Date(
																		validationResult.previousClaims.insuranceExpiry
																	).toLocaleDateString("en-US", {
																		year: "numeric",
																		month: "long",
																		day: "numeric",
																	})}
																</p>
																<div className="mt-2">
																	{(() => {
																		const expiryDate = new Date(
																			validationResult.previousClaims.insuranceExpiry
																		);
																		const today = new Date();
																		const daysRemaining = Math.ceil(
																			(expiryDate.getTime() - today.getTime()) /
																				(1000 * 60 * 60 * 24)
																		);
																		const isExpired = daysRemaining < 0;
																		const isExpiringSoon =
																			daysRemaining <= 30 && daysRemaining > 0;

																		return (
																			<div className="flex items-center gap-2">
																				<Clock
																					size={14}
																					className={
																						isExpired
																							? "text-red-500"
																							: isExpiringSoon
																							? "text-orange-500"
																							: "text-green-500"
																					}
																				/>
																				<span
																					className={`text-xs font-medium ${
																						isExpired
																							? "text-red-600"
																							: isExpiringSoon
																							? "text-orange-600"
																							: "text-green-600"
																					}`}
																				>
																					{isExpired
																						? `Expired ${Math.abs(
																								daysRemaining
																						  )} days ago`
																						: isExpiringSoon
																						? `Expires in ${daysRemaining} days`
																						: `${daysRemaining} days remaining`}
																				</span>
																			</div>
																		);
																	})()}
																</div>
															</div>
														</div>
													</div>
												</div>

												{/* Coverage Stats */}
												<div className="grid grid-cols-1 gap-4">
													<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 h-[120px] flex">
														<div className="flex items-start gap-3 w-full">
															<Award
																className="text-purple-600 mt-1 flex-shrink-0"
																size={20}
															/>
															<div className="flex-1 min-w-0">
																<p className="text-xs text-purple-700 font-medium mb-1">
																	Claims Remaining
																</p>
																<div className="flex items-baseline gap-2">
																	<p className="text-3xl font-bold text-gray-900">
																		{
																			validationResult.previousClaims
																				.remainingClaims
																		}
																	</p>
																	<p className="text-sm text-gray-600">
																		/ 5 total
																	</p>
																</div>
																<div className="mt-3">
																	<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
																		<div
																			className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
																			style={{
																				width: `${
																					(validationResult.previousClaims
																						.remainingClaims /
																						5) *
																					100
																				}%`,
																			}}
																		/>
																	</div>
																	<p className="text-xs text-gray-600 mt-1">
																		{(
																			(validationResult.previousClaims
																				.remainingClaims /
																				5) *
																			100
																		).toFixed(0)}
																		% coverage available
																	</p>
																</div>
															</div>
														</div>
													</div>

													<div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100 h-[120px] flex">
														<div className="flex items-start gap-3 w-full">
															<History
																className="text-orange-600 mt-1 flex-shrink-0"
																size={20}
															/>
															<div className="flex-1 min-w-0">
																<p className="text-xs text-orange-700 font-medium mb-1">
																	Claims Used
																</p>
																<div className="flex items-baseline gap-2">
																	<p className="text-3xl font-bold text-gray-900">
																		{validationResult.previousClaims.count}
																	</p>
																	<p className="text-sm text-gray-600">
																		claims
																	</p>
																</div>
																{validationResult.previousClaims
																	.lastClaimDate && (
																	<p className="text-xs text-gray-600 mt-2">
																		Last claim:{" "}
																		{new Date(
																			validationResult.previousClaims.lastClaimDate
																		).toLocaleDateString("en-US", {
																			month: "short",
																			day: "numeric",
																			year: "numeric",
																		})}
																	</p>
																)}
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}

									<Divider />

									{/* Claim History Section */}
									{validationResult.previousClaims && (
										<div>
											<div className="flex items-center gap-2 mb-4">
												<History size={18} className="text-gray-600" />
												<h3 className="text-md font-semibold text-gray-900">
													Claim History
												</h3>
											</div>
											{validationResult.previousClaims.count > 0 ? (
												<div className="space-y-3">
													{validationResult.previousClaims.claimHistory &&
													validationResult.previousClaims.claimHistory.length >
														0 ? (
														validationResult.previousClaims.claimHistory.map(
															(claim, idx) => (
																<div
																	key={claim.id}
																	className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
																>
																	<div className="flex items-start justify-between">
																		<div className="flex-1">
																			<div className="flex items-center gap-2 mb-2">
																				<p className="font-semibold text-gray-900 text-sm">
																					Claim #{claim.id}
																				</p>
																				<Chip
																					size="sm"
																					color={
																						claim.status === "Completed"
																							? "success"
																							: claim.status === "Pending"
																							? "warning"
																							: "default"
																					}
																					variant="flat"
																				>
																					{claim.status}
																				</Chip>
																			</div>
																			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
																				<div>
																					<p className="text-gray-500">Issue</p>
																					<p className="text-gray-900 font-medium">
																						{claim.issue}
																					</p>
																				</div>
																				<div>
																					<p className="text-gray-500">
																						Claim Date
																					</p>
																					<p className="text-gray-900 font-medium">
																						{new Date(
																							claim.claimDate
																						).toLocaleDateString("en-US", {
																							month: "short",
																							day: "numeric",
																							year: "numeric",
																						})}
																					</p>
																				</div>
																				<div>
																					<p className="text-gray-500">
																						Repair Cost
																					</p>
																					<p className="text-gray-900 font-medium">
																						₦{claim.repairCost.toLocaleString()}
																					</p>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															)
														)
													) : (
														// Fallback if claimHistory array exists but is empty
														<div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
															<History
																className="mx-auto text-gray-400 mb-2"
																size={40}
															/>
															<p className="text-gray-600 font-medium">
																No Claim Details Available
															</p>
															<p className="text-sm text-gray-500 mt-1">
																{validationResult.previousClaims.count} claim(s)
																recorded but details unavailable
															</p>
														</div>
													)}
												</div>
											) : (
												<div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
													<History
														className="mx-auto text-gray-400 mb-2"
														size={40}
													/>
													<p className="text-gray-600 font-medium">
														No Previous Claims
													</p>
													<p className="text-sm text-gray-500 mt-1">
														This device has a clean claim history
													</p>
												</div>
											)}
										</div>
									)}
								</CardBody>
							</Card>
						</div>
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
