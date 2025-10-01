"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
	useDisclosure,
} from "@heroui/react";
import { InfoField, InfoCard } from "@/components/reususables";
import {
	ArrowLeft,
	CheckCircle,
	XCircle,
	Eye,
	Calendar,
	User,
	Phone,
	Wrench,
} from "lucide-react";
import { showToast } from "@/lib/showNotification";
import {
	useRepairClaim,
	useRepairClaimActions,
} from "@/hooks/samsung-partners/useRepairClaims";

const ViewRepairClaimView = () => {
	const params = useParams();
	const router = useRouter();
	const claimId = params?.id as string;

	const [rejectionReason, setRejectionReason] = useState("");
	const {
		isOpen: isRejectModalOpen,
		onOpen: onRejectModalOpen,
		onClose: onRejectModalClose,
	} = useDisclosure();

	const { claim, isLoading, error, mutate } = useRepairClaim(claimId);
	const { approveClaim, rejectClaim } = useRepairClaimActions();

	const handleApprove = async () => {
		try {
			await approveClaim(claimId);
			showToast({
				type: "success",
				message: "Claim approved successfully",
			});
			mutate();
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to approve claim",
			});
		}
	};

	const handleReject = () => {
		setRejectionReason("");
		onRejectModalOpen();
	};

	const handleConfirmReject = async () => {
		if (!rejectionReason.trim()) {
			showToast({
				type: "error",
				message: "Please provide a reason for rejection",
			});
			return;
		}

		try {
			await rejectClaim(claimId, rejectionReason);
			showToast({
				type: "success",
				message: "Claim rejected successfully",
			});
			onRejectModalClose();
			mutate();
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to reject claim",
			});
		}
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="space-y-4">
						<div className="h-32 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !claim) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<p className="text-red-600">Failed to load claim details</p>
					<Button color="primary" onPress={() => mutate()} className="mt-4">
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-4 mb-4">
					<Button isIconOnly variant="light" onPress={() => router.back()}>
						<ArrowLeft size={20} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Repair Claim Details
						</h1>
						<p className="text-gray-600">Claim ID: {claim.id}</p>
					</div>
				</div>

				{/* Status and Actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Chip
							color={
								claim.status === "approved"
									? "success"
									: claim.status === "rejected"
									? "danger"
									: "warning"
							}
							variant="flat"
							size="lg"
						>
							{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
						</Chip>
						<Chip color="primary" variant="flat" size="lg">
							{claim.deviceStatus}
						</Chip>
					</div>

					{claim.status === "pending" && (
						<div className="flex gap-2">
							<Button
								color="success"
								onPress={handleApprove}
								startContent={<CheckCircle size={16} />}
							>
								Approve
							</Button>
							<Button
								color="danger"
								variant="bordered"
								onPress={handleReject}
								startContent={<XCircle size={16} />}
							>
								Reject
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Customer Information */}
					<InfoCard title="Customer Information" icon={<User size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="Full Name" value={claim.customerName} />
							<InfoField label="Phone Number" value={claim.customerPhone} />
							<InfoField label="Email Address" value={claim.customerEmail} />
							<InfoField label="Address" value={claim.customerAddress} />
						</div>
					</InfoCard>

					{/* Device Information */}
					<InfoCard title="Device Information" icon={<Phone size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="IMEI Number" value={claim.imei} />
							<InfoField label="Device Brand" value={claim.deviceBrand} />
							<InfoField label="Device Model" value={claim.deviceModel} />
							<InfoField
								label="Device Price"
								value={`₦${claim.devicePrice?.toLocaleString()}`}
							/>
							<InfoField
								label="Warranty Start"
								value={
									claim.warrantyStartDate
										? new Date(claim.warrantyStartDate).toLocaleDateString()
										: "N/A"
								}
							/>
							<InfoField
								label="Warranty End"
								value={
									claim.warrantyEndDate
										? new Date(claim.warrantyEndDate).toLocaleDateString()
										: "N/A"
								}
							/>
						</div>
					</InfoCard>

					{/* Repair Information */}
					<InfoCard title="Repair Information" icon={<Wrench size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="Fault Type" value={claim.faultType} />
							<InfoField
								label="Repair Cost"
								value={`₦${claim.repairCost?.toLocaleString()}`}
							/>
							<InfoField label="Assigned Engineer" value={claim.engineer} />
							<InfoField label="Engineer Phone" value={claim.engineerPhone} />
							<InfoField
								label="Estimated Completion"
								value={
									claim.estimatedCompletionDate
										? new Date(
												claim.estimatedCompletionDate
										  ).toLocaleDateString()
										: "N/A"
								}
							/>
						</div>
						{claim.faultDescription && (
							<div className="mt-4">
								<InfoField
									label="Fault Description"
									value={claim.faultDescription}
								/>
							</div>
						)}
					</InfoCard>

					{/* Service Center Information */}
					<InfoCard
						title="Service Center Information"
						icon={<Wrench size={20} />}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="Service Center" value={claim.serviceCenter} />
							<InfoField
								label="Phone Number"
								value={claim.serviceCenterPhone}
							/>
							<InfoField label="Address" value={claim.serviceCenterAddress} />
						</div>
					</InfoCard>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Timeline */}
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Calendar size={20} />
								Timeline
							</h3>
						</CardHeader>
						<CardBody>
							<div className="space-y-4">
								<div className="text-sm">
									<p className="font-medium text-gray-900">Submitted</p>
									<p className="text-gray-600">
										{new Date(claim.dateSubmitted).toLocaleDateString()}
									</p>
								</div>
								{claim.dateUpdated && (
									<div className="text-sm">
										<p className="font-medium text-gray-900">Last Updated</p>
										<p className="text-gray-600">
											{new Date(claim.dateUpdated).toLocaleDateString()}
										</p>
									</div>
								)}
							</div>
						</CardBody>
					</Card>

					{/* Previous Claims */}
					{claim.previousClaims && claim.previousClaims.length > 0 && (
						<Card>
							<CardHeader>
								<h3 className="text-lg font-semibold">Previous Claims</h3>
							</CardHeader>
							<CardBody>
								<div className="space-y-3">
									{claim.previousClaims.map((prevClaim: any) => (
										<div
											key={prevClaim.id}
											className="p-3 bg-gray-50 rounded-lg"
										>
											<p className="font-medium text-sm">
												{prevClaim.faultType}
											</p>
											<p className="text-xs text-gray-600">{prevClaim.date}</p>
											<Chip
												size="sm"
												color={
													prevClaim.status === "completed"
														? "success"
														: "default"
												}
												variant="flat"
											>
												{prevClaim.status}
											</Chip>
										</div>
									))}
								</div>
							</CardBody>
						</Card>
					)}

					{/* Documents */}
					{claim.documents && claim.documents.length > 0 && (
						<Card>
							<CardHeader>
								<h3 className="text-lg font-semibold">Documents</h3>
							</CardHeader>
							<CardBody>
								<div className="space-y-2">
									{claim.documents.map((doc: any) => (
										<div
											key={doc.id}
											className="flex items-center justify-between p-2 bg-gray-50 rounded"
										>
											<div>
												<p className="font-medium text-sm">{doc.name}</p>
												<p className="text-xs text-gray-600">
													{doc.uploadDate}
												</p>
											</div>
											<Button isIconOnly size="sm" variant="light">
												<Eye size={16} />
											</Button>
										</div>
									))}
								</div>
							</CardBody>
						</Card>
					)}

					{/* Activity Log */}
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold">Activity Log</h3>
						</CardHeader>
						<CardBody>
							<div className="space-y-3">
								{claim.activityLog?.map((activity: any, index: number) => (
									<div key={activity.id} className="relative">
										{index < (claim.activityLog?.length || 0) - 1 && (
											<div className="absolute left-2 top-6 w-0.5 h-8 bg-gray-200"></div>
										)}
										<div className="flex gap-3">
											<div className="w-4 h-4 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
											<div className="flex-1">
												<p className="font-medium text-sm">{activity.action}</p>
												<p className="text-xs text-gray-600">{activity.user}</p>
												<p className="text-xs text-gray-500">
													{activity.details}
												</p>
												<p className="text-xs text-gray-400 mt-1">
													{new Date(activity.date).toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* Rejection Modal */}
			<Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose} size="md">
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Reject Claim</h3>
					</ModalHeader>
					<ModalBody>
						<p className="text-gray-600 mb-4">
							Please provide a reason for rejecting this claim:
						</p>
						<Textarea
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder="Enter rejection reason..."
							minRows={3}
							maxRows={6}
							variant="bordered"
						/>
					</ModalBody>
					<ModalFooter>
						<Button variant="light" onPress={onRejectModalClose}>
							Cancel
						</Button>
						<Button color="danger" onPress={handleConfirmReject}>
							Reject Claim
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ViewRepairClaimView;
