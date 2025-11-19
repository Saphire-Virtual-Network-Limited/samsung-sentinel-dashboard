"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
	Select,
	SelectItem,
	Textarea,
	useDisclosure,
} from "@heroui/react";
import { InfoField, InfoCard } from "@/components/reususables";
import {
	ArrowLeft,
	Upload,
	Eye,
	Calendar,
	User,
	Phone,
	Wrench,
	FileText,
} from "lucide-react";
import UploadArea from "@/components/reususables/UploadArea";
import { showToast } from "@/lib/showNotification";
import {
	useServiceCenterClaim,
	useServiceCenterClaimActions,
} from "@/hooks/service-center/useServiceCenterClaim";
import { ClaimStatus, PaymentStatus } from "@/lib/api/shared/types";
import { useAuth } from "@/lib/globalContext";

import { ConfirmationModal } from "@/components/reususables";

interface ViewClaimDetailViewProps {
	claimId?: string; // Optional prop for modal usage
}

const ViewClaimDetailView = ({
	claimId: propClaimId,
}: ViewClaimDetailViewProps = {}) => {
	const params = useParams();
	const router = useRouter();
	const claimId = propClaimId || (params?.id as string);

	const [newStatus, setNewStatus] = useState("");
	const [statusNotes, setStatusNotes] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const {
		isOpen: isStatusModalOpen,
		onOpen: onStatusModalOpen,
		onClose: onStatusModalClose,
	} = useDisclosure();
	const {
		isOpen: isUploadModalOpen,
		onOpen: onUploadModalOpen,
		onClose: onUploadModalClose,
	} = useDisclosure();
	const {
		isOpen: isCompleteModalOpen,
		onOpen: onCompleteModalOpen,
		onClose: onCompleteModalClose,
	} = useDisclosure();
	const {
		isOpen: isApproveModalOpen,
		onOpen: onApproveModalOpen,
		onClose: onApproveModalClose,
	} = useDisclosure();
	const {
		isOpen: isRejectModalOpen,
		onOpen: onRejectModalOpen,
		onClose: onRejectModalClose,
	} = useDisclosure();
	const {
		isOpen: isAuthorizeModalOpen,
		onOpen: onAuthorizeModalOpen,
		onClose: onAuthorizeModalClose,
	} = useDisclosure();

	// Fetch claim data from API
	const { claim, isLoading, error, mutate } = useServiceCenterClaim(claimId);
	const { markAsCompleted, approveClaim, rejectClaim, authorizePayment } =
		useServiceCenterClaimActions();

	// Get user role from auth context
	const { userResponse } = useAuth();
	const userRole = userResponse?.role;

	// Debug logging
	React.useEffect(() => {
		console.log("ViewClaimDetailView Debug:", {
			claimId,
			isLoading,
			error,
			hasClaim: !!claim,
			claim,
		});
	}, [claimId, isLoading, error, claim]);

	const statusOptions = [
		{ key: "in-progress", label: "In Progress" },
		{ key: "waiting-parts", label: "Waiting for Parts" },
		{ key: "repair-completed", label: "Repair Completed" },
		{ key: "ready-pickup", label: "Ready for Pickup" },
		{ key: "completed", label: "Completed" },
		{ key: "cancelled", label: "Cancelled" },
	];

	// Claim action handlers
	const handleMarkAsCompleted = async () => {
		try {
			await markAsCompleted(claimId, { notes: statusNotes || undefined });
			showToast({
				type: "success",
				message: `Claim ${claim?.claim_number} marked as completed`,
			});
			onCompleteModalClose();
			setStatusNotes("");
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to mark claim as completed",
			});
		}
	};

	const handleApproveClaim = async () => {
		try {
			await approveClaim(claimId, { notes: statusNotes || undefined });
			showToast({
				type: "success",
				message: `Claim ${claim?.claim_number} approved`,
			});
			onApproveModalClose();
			setStatusNotes("");
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to approve claim",
			});
		}
	};

	const handleRejectClaim = async () => {
		if (!statusNotes) {
			showToast({
				type: "error",
				message: "Please provide a rejection reason",
			});
			return;
		}

		try {
			await rejectClaim(claimId, {
				reason: statusNotes,
				notes: statusNotes,
			});
			showToast({
				type: "success",
				message: `Claim ${claim?.claim_number} rejected`,
			});
			onRejectModalClose();
			setStatusNotes("");
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to reject claim",
			});
		}
	};

	const handleAuthorizePayment = async () => {
		try {
			await authorizePayment(claimId, { notes: statusNotes || undefined });
			showToast({
				type: "success",
				message: `Payment authorized for claim ${claim?.claim_number}`,
			});
			onAuthorizeModalClose();
			setStatusNotes("");
		} catch (error: any) {
			showToast({
				type: "error",
				message: error?.message || "Failed to authorize payment",
			});
		}
	};

	const handleStatusUpdate = async () => {
		if (!newStatus) {
			showToast({
				type: "error",
				message: "Please select a status",
			});
			return;
		}

		// This is for legacy status updates - can be removed if not needed
		showToast({
			type: "info",
			message: "Please use specific action buttons for claim status changes",
		});
		onStatusModalClose();
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

	if (error) {
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

	if (!claim) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<p className="text-gray-600">Claim not found</p>
					<Button
						color="primary"
						onPress={() => router.back()}
						className="mt-4"
					>
						Go Back
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
						<h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
						<p className="text-gray-600">Claim ID: {claim?.claim_number}</p>
					</div>
				</div>{" "}
				{/* Status and Actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Chip
							color={
								claim?.status === ClaimStatus.COMPLETED
									? "success"
									: claim?.status === ClaimStatus.REJECTED
									? "danger"
									: "warning"
							}
							variant="flat"
							size="lg"
						>
							{claim?.status
								?.split("_")
								.map(
									(word: string) =>
										word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
								)
								.join(" ") || "N/A"}
						</Chip>
					</div>

					<div className="flex gap-2 flex-wrap">
						{/* Engineer can mark as completed */}
						{(userRole === "engineer" ||
							userRole === "repair_store_admin" ||
							window?.location?.pathname?.includes("access/service-center")) &&
							claim?.status === ClaimStatus.APPROVED && (
								<>
									{console.log("Engineer/Admin Action Button Rendered", {
										userRole,
										claimStatus: claim?.status,
										claimId: claim?.claim_number,
									})}
									<Button
										color="success"
										onPress={() => {
											console.log("Mark as Completed button clicked", {
												claimId: claim?.claim_number,
												userRole,
											});
											onCompleteModalOpen();
										}}
									>
										Mark as Completed
									</Button>
								</>
							)}

						{/* Samsung Partner actions */}
						{userRole === "samsung_partner" && (
							<>
								{claim?.status === ClaimStatus.COMPLETED &&
									claim?.payment_status === PaymentStatus.UNPAID && (
										<>
											<Button color="success" onPress={onApproveModalOpen}>
												Approve Claim
											</Button>
											<Button
												color="danger"
												variant="flat"
												onPress={onRejectModalOpen}
											>
												Reject Claim
											</Button>
										</>
									)}
								{claim?.status === ClaimStatus.APPROVED &&
									claim?.payment_status === PaymentStatus.UNPAID && (
										<Button color="primary" onPress={onAuthorizeModalOpen}>
											Authorize Payment
										</Button>
									)}
							</>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Customer Information */}
					<InfoCard title="Customer Information" icon={<User size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField
								label="Full Name"
								value={`${claim?.customer_first_name} ${claim?.customer_last_name}`}
							/>
							<InfoField label="Phone Number" value={claim?.customer_phone} />
							<InfoField label="Email Address" value={claim?.customer_email} />
						</div>
					</InfoCard>

					{/* Device Information */}
					<InfoCard title="Device Information" icon={<Phone size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField label="IMEI Number" value={claim?.imei?.imei} />
							<InfoField label="Device Brand" value="Samsung" />
							<InfoField label="Device Model" value={claim?.product?.name} />
							<InfoField
								label="Repair Cost"
								value={`₦${parseFloat(
									claim?.product?.repair_cost || "0"
								).toLocaleString()}`}
							/>
							<InfoField
								label="Supplier"
								value={claim?.imei?.supplier || "N/A"}
							/>
							<InfoField
								label="Warranty Expiry"
								value={
									claim?.imei?.expiry_date
										? new Date(claim.imei.expiry_date).toLocaleDateString()
										: "N/A"
								}
							/>
						</div>
					</InfoCard>

					{/* Repair Information */}
					<InfoCard title="Repair Information" icon={<Wrench size={20} />}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InfoField
								label="Repair Price"
								value={`₦${parseFloat(
									claim?.repair_price?.toString() || "0"
								).toLocaleString()}`}
							/>
							<InfoField
								label="Assigned Engineer"
								value={claim?.engineer?.user?.name}
							/>
							<InfoField
								label="Engineer Phone"
								value={claim?.engineer?.user?.phone}
							/>
							<InfoField
								label="Service Center"
								value={claim?.service_center?.name}
							/>
						</div>
						{claim?.description && (
							<div className="mt-4">
								<InfoField label="Description" value={claim.description} />
							</div>
						)}
					</InfoCard>

					{/* Parts Required 
					claim?.partsRequired && claim.partsRequired.length > 0 && (
						<InfoCard title="Parts Required" icon={<Wrench size={20} />}>
							<div className="space-y-3">
								{claim.partsRequired.map((part: any, index: number) => (
									<div key={index} className="p-3 bg-gray-50 rounded-lg">
										<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
											<InfoField label="Part Name" value={part.partName} />
											<InfoField label="Part Code" value={part.partCode} />
											<InfoField
												label="Cost"
												value={`₦${part.cost?.toLocaleString()}`}
											/>
											<div>
												<p className="text-sm font-medium text-gray-600 mb-1">
													Availability
												</p>
												<Chip
													size="sm"
													color={
														part.availability === "In Stock"
															? "success"
															: "warning"
													}
													variant="flat"
												>
													{part.availability}
												</Chip>
											</div>
										</div>
									</div>
								))}
							</div>
						</InfoCard>
					)*/}

					{/* Repair History 
					<InfoCard title="Repair History" icon={<FileText size={20} />}>
						<div className="space-y-4">
							{claim?.timeline && claim.timeline.length > 0 ? (
								claim.timeline.map((entry: any, index: number) => (
									<div
										key={entry.id}
										className="relative border-l-2 border-blue-200 pl-4"
									>
										{index < (claim?.timeline?.length || 0) - 1 && (
											<div className="absolute left-0 top-8 w-0.5 h-12 bg-blue-200"></div>
										)}
										<div className="absolute left-0 top-2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1"></div>
										<div>
											<p className="font-medium text-gray-900">{entry.event}</p>
											<p className="text-sm text-gray-600">
												{entry.performed_by?.name || "System"}
											</p>
											{entry.details && (
												<p className="text-sm text-gray-700 mt-1">
													{typeof entry.details === "string"
														? entry.details
														: entry.details.notes ||
														  JSON.stringify(entry.details)}
												</p>
											)}
											<div className="flex items-center gap-2 mt-2">
												<p className="text-xs text-gray-500">
													{new Date(entry.performed_at).toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-gray-500">
									No repair history available
								</p>
							)}
						</div>
					</InfoCard>*/}
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
										{claim?.created_at
											? new Date(claim.created_at).toLocaleDateString()
											: "N/A"}
									</p>
								</div>
								{claim?.updated_at && (
									<div className="text-sm">
										<p className="font-medium text-gray-900">Last Updated</p>
										<p className="text-gray-600">
											{new Date(claim.updated_at).toLocaleDateString()}
										</p>
									</div>
								)}
							</div>
						</CardBody>
					</Card>

					<div className="h-4" />

					{/* Status History */}
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold">Status History</h3>
						</CardHeader>
						<CardBody>
							<div className="space-y-3">
								{claim?.timeline && claim.timeline.length > 0 ? (
									claim.timeline.map((status: any, index: number) => (
										<div key={status.id} className="relative">
											{index < (claim?.timeline?.length || 0) - 1 && (
												<div className="absolute left-2 top-6 w-0.5 h-8 bg-gray-200"></div>
											)}
											<div className="flex gap-3">
												<div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
												<div className="flex-1">
													<p className="font-medium text-sm capitalize">
														{status.event.split("_").join(" ")}
													</p>
													<p className="text-xs text-gray-600">
														{status.performed_by?.name || "System"}
													</p>
													{status.details && (
														<p className="text-xs text-gray-500">
															{typeof status.details === "string"
																? status.details
																: status.details.notes ||
																  JSON.stringify(status.details)}
														</p>
													)}
													<p className="text-xs text-gray-400 mt-1">
														{new Date(status.performed_at).toLocaleString()}
													</p>
												</div>
											</div>
										</div>
									))
								) : (
									<p className="text-sm text-gray-500">
										No status history available
									</p>
								)}
							</div>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* Status Update Modal */}
			<Modal isOpen={isStatusModalOpen} onClose={onStatusModalClose} size="md">
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Update Claim Status</h3>
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<Select
								label="New Status"
								placeholder="Select new status"
								selectedKeys={newStatus ? [newStatus] : []}
								onSelectionChange={(keys) =>
									setNewStatus(Array.from(keys)[0] as string)
								}
							>
								{statusOptions.map((option) => (
									<SelectItem key={option.key} value={option.key}>
										{option.label}
									</SelectItem>
								))}
							</Select>
							<Textarea
								label="Notes (Optional)"
								placeholder="Add any notes about this status change..."
								value={statusNotes}
								onValueChange={setStatusNotes}
								rows={3}
							/>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="danger" variant="light" onPress={onStatusModalClose}>
							Cancel
						</Button>
						<Button color="primary" onPress={handleStatusUpdate}>
							Update Status
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Mark as Completed Modal */}
			<Modal
				isOpen={isCompleteModalOpen}
				onClose={onCompleteModalClose}
				size="md"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Mark Claim as Completed</h3>
					</ModalHeader>
					<ModalBody>
						<Textarea
							label="Notes (Optional)"
							placeholder="Add any completion notes..."
							value={statusNotes}
							onValueChange={setStatusNotes}
							rows={3}
						/>
					</ModalBody>
					<ModalFooter>
						<Button
							color="danger"
							variant="light"
							onPress={onCompleteModalClose}
						>
							Cancel
						</Button>
						<Button color="success" onPress={handleMarkAsCompleted}>
							Mark as Completed
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Approve Claim Modal */}
			<Modal
				isOpen={isApproveModalOpen}
				onClose={onApproveModalClose}
				size="md"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Approve Claim</h3>
					</ModalHeader>
					<ModalBody>
						<Textarea
							label="Notes (Optional)"
							placeholder="Add approval notes..."
							value={statusNotes}
							onValueChange={setStatusNotes}
							rows={3}
						/>
					</ModalBody>
					<ModalFooter>
						<Button
							color="danger"
							variant="light"
							onPress={onApproveModalClose}
						>
							Cancel
						</Button>
						<Button color="success" onPress={handleApproveClaim}>
							Approve Claim
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Reject Claim Modal */}
			<Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose} size="md">
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Reject Claim</h3>
					</ModalHeader>
					<ModalBody>
						<Textarea
							label="Rejection Reason *"
							placeholder="Please provide a reason for rejection..."
							value={statusNotes}
							onValueChange={setStatusNotes}
							rows={3}
							isRequired
						/>
					</ModalBody>
					<ModalFooter>
						<Button color="danger" variant="light" onPress={onRejectModalClose}>
							Cancel
						</Button>
						<Button color="danger" onPress={handleRejectClaim}>
							Reject Claim
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Authorize Payment Modal */}
			<Modal
				isOpen={isAuthorizeModalOpen}
				onClose={onAuthorizeModalClose}
				size="md"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Authorize Payment</h3>
					</ModalHeader>
					<ModalBody>
						<Textarea
							label="Notes (Optional)"
							placeholder="Add payment authorization notes..."
							value={statusNotes}
							onValueChange={setStatusNotes}
							rows={3}
						/>
					</ModalBody>
					<ModalFooter>
						<Button
							color="danger"
							variant="light"
							onPress={onAuthorizeModalClose}
						>
							Cancel
						</Button>
						<Button color="primary" onPress={handleAuthorizePayment}>
							Authorize Payment
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ViewClaimDetailView;
