"use client";

import React, { useState } from "react";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
	useDisclosure,
	Chip,
} from "@heroui/react";
import SimpleTable from "@/components/reususables/custom-ui/SimpleTable";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { showToast } from "@/lib/showNotification";
import {
	useRepairClaims,
	useRepairClaimActions,
} from "@/hooks/samsung-partners/useRepairClaims";
import { useRouter } from "next/navigation";

const PendingRepairClaimsView = () => {
	const router = useRouter();
	const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
	const [rejectionReason, setRejectionReason] = useState("");
	const [currentClaimId, setCurrentClaimId] = useState<string | null>(null);

	const {
		isOpen: isRejectModalOpen,
		onOpen: onRejectModalOpen,
		onClose: onRejectModalClose,
	} = useDisclosure();

	const { claims, isLoading, mutate } = useRepairClaims({
		status: "pending",
	});

	const { approveClaim, rejectClaim, bulkApproveClaims } =
		useRepairClaimActions();

	const columns = [
		{ key: "id", label: "Claim ID" },
		{ key: "imei", label: "IMEI" },
		{ key: "customerName", label: "Customer Name" },
		{ key: "customerPhone", label: "Phone" },
		{ key: "serviceCenter", label: "Service Center" },
		{ key: "deviceModel", label: "Device Model" },
		{ key: "faultType", label: "Fault Type" },
		{ key: "repairCost", label: "Repair Cost" },
		{ key: "dateSubmitted", label: "Date Submitted" },
		{ key: "deviceStatus", label: "Device Status" },
		{ key: "actions", label: "Actions" },
	];

	const handleApprove = async (claimId: string) => {
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

	const handleReject = (claimId: string) => {
		setCurrentClaimId(claimId);
		setRejectionReason("");
		onRejectModalOpen();
	};

	const handleConfirmReject = async () => {
		if (!currentClaimId || !rejectionReason.trim()) {
			showToast({
				type: "error",
				message: "Please provide a reason for rejection",
			});
			return;
		}

		try {
			await rejectClaim(currentClaimId, rejectionReason);
			showToast({
				type: "success",
				message: "Claim rejected successfully",
			});
			onRejectModalClose();
			setCurrentClaimId(null);
			mutate();
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to reject claim",
			});
		}
	};

	const handleBulkApprove = async () => {
		if (selectedClaims.length === 0) {
			showToast({
				type: "error",
				message: "Please select claims to approve",
			});
			return;
		}

		try {
			await bulkApproveClaims(selectedClaims);
			showToast({
				type: "success",
				message: `${selectedClaims.length} claims approved successfully`,
			});
			setSelectedClaims([]);
			mutate();
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to approve selected claims",
			});
		}
	};

	const handleViewClaim = (claimId: string) => {
		router.push(`/access/samsung-partners/repair-claims/view/${claimId}`);
	};

	const renderCell = (item: any, columnKey: string) => {
		switch (columnKey) {
			case "repairCost":
				return `₦${item.repairCost?.toLocaleString()}`;
			case "dateSubmitted":
				return new Date(item.dateSubmitted).toLocaleDateString();
			case "deviceStatus":
				return (
					<Chip color="primary" variant="flat" size="sm">
						{item.deviceStatus}
					</Chip>
				);
			case "actions":
				return (
					<div className="flex items-center gap-2">
						<Button
							isIconOnly
							size="sm"
							variant="light"
							onPress={() => handleViewClaim(item.id)}
						>
							<Eye size={16} />
						</Button>
						<Button
							isIconOnly
							size="sm"
							color="success"
							variant="light"
							onPress={() => handleApprove(item.id)}
						>
							<CheckCircle size={16} />
						</Button>
						<Button
							isIconOnly
							size="sm"
							color="danger"
							variant="light"
							onPress={() => handleReject(item.id)}
						>
							<XCircle size={16} />
						</Button>
					</div>
				);
			default:
				return item[columnKey];
		}
	};

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Pending Repair Claims
				</h1>
				<p className="text-gray-600">
					Review and approve pending repair claims
				</p>
			</div>

			{/* Bulk Actions */}
			{selectedClaims.length > 0 && (
				<div className="mb-4">
					<Button
						color="success"
						onPress={handleBulkApprove}
						startContent={<CheckCircle size={18} />}
					>
						Approve Selected ({selectedClaims.length})
					</Button>
				</div>
			)}

			<SimpleTable
				data={claims}
				columns={columns}
				isLoading={isLoading}
				searchable={true}
				searchPlaceholder="Search by customer name, IMEI, or device model..."
				emptyMessage="No pending repair claims found"
				selectable={false}
			/>

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

export default PendingRepairClaimsView;
