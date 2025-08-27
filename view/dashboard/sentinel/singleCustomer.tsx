"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button, Chip, Snippet } from "@heroui/react";
import useSWR from "swr";
import {
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	User,
	Smartphone,
	Store,
	Calendar,
	Shield,
} from "lucide-react";
import {
	getSentinelCustomerById,
	SentinelCustomer,
	showToast,
	useAuth,
} from "@/lib";

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";

// Utility Components (reused from your example)
const InfoCard = ({
	title,
	children,
	className = "",
	icon,
	collapsible = false,
	defaultExpanded = true,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
	collapsible?: boolean;
	defaultExpanded?: boolean;
}) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	if (!collapsible) {
		return (
			<div
				className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
			>
				<div className="p-3 border-b border-default-200">
					<div className="flex items-center gap-2">
						{icon}
						<h3 className="text-lg font-semibold text-default-900">{title}</h3>
					</div>
				</div>
				<div className="p-4">{children}</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
		>
			<div
				className="p-3 border-b border-default-200 cursor-pointer hover:bg-default-50 transition-colors"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{icon}
						<h3 className="text-lg font-semibold text-default-900">{title}</h3>
					</div>
					<Button
						variant="light"
						size="sm"
						isIconOnly
						className="text-default-500"
					>
						{isExpanded ? (
							<ChevronUp className="w-4 h-4" />
						) : (
							<ChevronDown className="w-4 h-4" />
						)}
					</Button>
				</div>
			</div>
			<div
				className={`transition-all duration-300 ease-in-out ${
					isExpanded
						? "max-h-none opacity-100"
						: "max-h-0 opacity-0 overflow-hidden"
				}`}
			>
				<div className="p-4">{children}</div>
			</div>
		</div>
	);
};

const InfoField = ({
	label,
	value,
	endComponent,
	copyable = false,
}: {
	label: string;
	value?: string | null;
	endComponent?: React.ReactNode;
	copyable?: boolean;
}) => (
	<div className="bg-default-50 rounded-lg p-4">
		<div className="flex items-center justify-between mb-1">
			<div className="text-sm text-default-500">{label}</div>
			{endComponent}
		</div>
		<div className="font-medium text-default-900 flex items-center gap-2">
			{value || "N/A"}
			{copyable && value && (
				<Snippet
					codeString={value}
					className="p-0"
					size="sm"
					hideSymbol
					hideCopyButton={false}
				/>
			)}
		</div>
	</div>
);

const EmptyState = ({
	title,
	description,
	icon,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
}) => (
	<div className="text-center py-8">
		<div className="flex justify-center mb-4">
			<div className="p-3 bg-default-100 rounded-full">{icon}</div>
		</div>
		<h3 className="text-lg font-semibold text-default-900 mb-2">{title}</h3>
		<p className="text-default-500 text-sm">{description}</p>
	</div>
);

export const SentinelSingleCustomerPage: React.FC<{
	sentinelCustomerId: string;
}> = ({ sentinelCustomerId }) => {
	const router = useRouter();

	const {
		data: customer,
		error,
		isLoading,
	} = useSWR<SentinelCustomer>(
		sentinelCustomerId ? `sentinel-customer-${sentinelCustomerId}` : null,
		async () => {
			if (!sentinelCustomerId) return null;
			const response = await getSentinelCustomerById(sentinelCustomerId);
			console.log("Sentinel Customer", response);
			return response.data;
		},
		{
			refreshInterval: 60000, // auto refresh every 60s
			revalidateOnFocus: false,
		}
	);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!customer) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-default-900 mb-2">
						Customer Not Found
					</h2>
					<p className="text-default-500 mb-4">
						The requested sentinel customer information could not be found.
					</p>
					<Button
						variant="flat"
						color="primary"
						startContent={<ArrowLeft />}
						onPress={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	const getEnrollmentStatusColor = (status: string | null) => {
		switch (status?.toLowerCase()) {
			case "enrolled":
				return "success";
			case "pending":
				return "warning";
			case "rejected":
				return "danger";
			default:
				return "default";
		}
	};

	const getDeviceStatusColor = (isEnrolled: boolean | null) => {
		return isEnrolled ? "success" : "warning";
	};

	return (
		<div className="min-h-screen bg-default-50">
			{/* Header Section */}
			<div className="bg-white border-b border-default-200">
				<div className="py-6">
					<div className="flex items-center justify-between">
						<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
							<div>
								<h1 className="text-lg font-bold text-default-900">
									{customer.firstName} {customer.lastName}
								</h1>
								<p className="text-sm text-default-500">Sentinel Customer</p>
							</div>
							<Chip
								color="primary"
								variant="flat"
								className="font-medium w-fit"
							>
								{customer.SentinelCustomerDevice?.length || 0} Device(s)
							</Chip>
						</div>
						<Button
							variant="flat"
							color="primary"
							startContent={<ArrowLeft className="w-4 h-4" />}
							onPress={() => router.back()}
						>
							Back to List
						</Button>
					</div>
				</div>
			</div>

			<div className="px-2 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
					{/* Left Column - Personal Information */}
					<div className="lg:col-span-1 space-y-8">
						{/* Personal Information */}
						<InfoCard
							title="Personal Information"
							icon={<User className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 gap-6">
									<InfoField
										label="Customer ID"
										value={customer.sentinelCustomerId}
										copyable
									/>
									<InfoField
										label="Full Name"
										value={`${customer.firstName} ${customer.lastName}`}
									/>
									<InfoField label="Email" value={customer.email} />
									<InfoField
										label="Phone Number"
										value={customer.phoneNumber}
									/>
									<InfoField label="Address" value={customer.address} />
									<InfoField label="Country" value={customer.country} />
									<InfoField label="MBE ID" value={customer.mbeId} />
									<InfoField
										label="Device Enrollment ID"
										value={customer.deviceEnrollmentId}
									/>
									<InfoField
										label="Registration Date"
										value={
											customer.createdAt
												? new Date(customer.createdAt).toLocaleString("en-GB")
												: "N/A"
										}
									/>
									<InfoField
										label="Last Updated"
										value={
											customer.updatedAt
												? new Date(customer.updatedAt).toLocaleString("en-GB")
												: "N/A"
										}
									/>
								</div>
							</div>
						</InfoCard>

						{/* Store Information */}
						<InfoCard
							title="Store Information"
							icon={<Store className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 gap-6">
									<InfoField
										label="Store ID"
										value={customer.storeId || "N/A"}
									/>
									{customer.SentinelCustomerDevice?.[0]?.salesStoreId && (
										<InfoField
											label="Sales Store ID"
											value={customer.SentinelCustomerDevice[0].salesStoreId}
											copyable
										/>
									)}
								</div>
							</div>
						</InfoCard>
					</div>

					{/* Right Column - Device Information */}
					<div className="lg:col-span-2 space-y-8">
						{/* Device Information */}
						<InfoCard
							title="Device Information"
							icon={<Smartphone className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								{customer.SentinelCustomerDevice &&
								customer.SentinelCustomerDevice.length > 0 ? (
									<div className="space-y-6">
										{customer.SentinelCustomerDevice.map((device, index) => (
											<div
												key={device.sentinelCustomerDeviceId}
												className="bg-default-50 rounded-lg p-4"
											>
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
													<InfoField
														label="Device Name"
														value={device.deviceName}
													/>
													<InfoField
														label="Device Brand"
														value={device.deviceBrand}
													/>
													<InfoField
														label="Serial Number"
														value={device.serialNumber}
														copyable
													/>
													<InfoField
														label="Device ID"
														value={device.deviceId}
														copyable
													/>
													<InfoField
														label="Device Price"
														value={
															device.devicePrice
																? `₦${parseFloat(
																		device.devicePrice
																  ).toLocaleString("en-GB")}`
																: "N/A"
														}
													/>
													<InfoField
														label="Device OS"
														value={device.deviceOS}
													/>
													<InfoField
														label="Payment Option"
														value={device.paymentOption}
													/>
													<InfoField
														label="Sentinel Package"
														value={device.sentinelPackage}
													/>
													<InfoField
														label="Device Type"
														value={device.deviceType || "N/A"}
													/>
													<div className="bg-default-50 rounded-lg p-4">
														<div className="text-sm text-default-500 mb-1">
															Enrollment Status
														</div>
														<div className="font-medium">
															<Chip
																color={getDeviceStatusColor(device.isEnrolled)}
																variant="flat"
																className="font-medium"
															>
																{device.isEnrolled
																	? "Enrolled"
																	: "Not Enrolled"}
															</Chip>
														</div>
													</div>
													<InfoField
														label="Enrolled At"
														value={
															device.enrolledAt
																? new Date(device.enrolledAt).toLocalString(
																		"en-GB"
																  )
																: "N/A"
														}
													/>
													<InfoField
														label="Created At"
														value={
															device.createdAt
																? new Date(device.createdAt).toLocalString(
																		"en-GB"
																  )
																: "N/A"
														}
													/>
													<InfoField
														label="Updated At"
														value={
															device.updatedAt
																? new Date(device.updatedAt).toLocalString(
																		"en-GB"
																  )
																: "N/A"
														}
													/>
												</div>

												{/* Image URLs */}
												<div className="mt-6 pt-6 border-t border-default-200">
													<h4 className="text-base font-semibold text-default-900 mb-4">
														Document Images
													</h4>
													<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
														{device.purchaseReceiptImageUrl && (
															<div>
																<div className="text-sm text-default-500 mb-2">
																	Purchase Receipt
																</div>
																<a
																	href={device.purchaseReceiptImageUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary-600 hover:text-primary-800 text-sm underline"
																>
																	View Image
																</a>
															</div>
														)}
														{device.sentinelBlockformImageUrl && (
															<div>
																<div className="text-sm text-default-500 mb-2">
																	Blockform Image
																</div>
																<a
																	href={device.sentinelBlockformImageUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary-600 hover:text-primary-800 text-sm underline"
																>
																	View Image
																</a>
															</div>
														)}
														{device.sentinelReceiptImageUrl && (
															<div>
																<div className="text-sm text-default-500 mb-2">
																	Sentinel Receipt
																</div>
																<a
																	href={device.sentinelReceiptImageUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary-600 hover:text-primary-800 text-sm underline"
																>
																	View Image
																</a>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<EmptyState
										title="No Devices Registered"
										description="This customer doesn't have any registered devices yet."
										icon={<Smartphone className="w-12 h-12 text-default-300" />}
									/>
								)}
							</div>
						</InfoCard>

						{/* Enrollment Status Summary */}
						<InfoCard
							title="Enrollment Summary"
							icon={<Shield className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="bg-success-50 border border-success-200 rounded-lg p-4 text-center">
										<div className="text-2xl font-bold text-success-700">
											{customer.SentinelCustomerDevice?.filter(
												(device) => device.isEnrolled
											).length || 0}
										</div>
										<div className="text-sm text-success-600">
											Enrolled Devices
										</div>
									</div>
									<div className="bg-warning-50 border border-warning-200 rounded-lg p-4 text-center">
										<div className="text-2xl font-bold text-warning-700">
											{customer.SentinelCustomerDevice?.filter(
												(device) => !device.isEnrolled
											).length || 0}
										</div>
										<div className="text-sm text-warning-600">
											Pending Devices
										</div>
									</div>
									<div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
										<div className="text-2xl font-bold text-primary-700">
											{customer.SentinelCustomerDevice?.length || 0}
										</div>
										<div className="text-sm text-primary-600">
											Total Devices
										</div>
									</div>
								</div>
							</div>
						</InfoCard>

						{/* Timeline Information */}
						<InfoCard
							title="Timeline"
							icon={<Calendar className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="space-y-4">
									<div className="flex items-start space-x-3">
										<div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
										<div>
											<div className="text-sm font-medium text-default-900">
												Customer Registered
											</div>
											<div className="text-sm text-default-500">
												{customer.createdAt
													? new Date(customer.createdAt).toLocaleString("en-GB")
													: "N/A"}
											</div>
										</div>
									</div>

									{customer.SentinelCustomerDevice?.map((device, index) => (
										<div
											key={device.sentinelCustomerDeviceId}
											className="flex items-start space-x-3"
										>
											<div className="flex-shrink-0 w-2 h-2 bg-success-500 rounded-full mt-2"></div>
											<div>
												<div className="text-sm font-medium text-default-900">
													Device {index + 1}{" "}
													{device.isEnrolled ? "Enrolled" : "Registered"}
												</div>
												<div className="text-sm text-default-500">
													{device.isEnrolled && device.enrolledAt
														? `Enrolled: ${new Date(
																device.enrolledAt
														  ).toLocaleString("en-GB")}`
														: `Registered: ${new Date(
																device.createdAt
														  ).toLocaleString("en-GB")}`}
												</div>
												{device.updatedAt &&
													device.updatedAt !== device.createdAt && (
														<div className="text-xs text-default-400 mt-1">
															Last updated:{" "}
															{new Date(device.updatedAt).toLocalString(
																"en-GB"
															)}
														</div>
													)}
											</div>
										</div>
									))}
								</div>
							</div>
						</InfoCard>
					</div>
				</div>
			</div>
		</div>
	);
};
