"use client";

import React, { useState } from "react";
import {
	Button,
	Input,
	Select,
	SelectItem,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
	useDisclosure,
} from "@heroui/react";
import SimpleTable from "@/components/reususables/custom-ui/SimpleTable";
import { Search, Filter, CheckCircle, XCircle, Eye } from "lucide-react";
import { showToast } from "@/lib/showNotification";
import {
	useRepairClaims,
	useRepairClaimActions,
} from "@/hooks/samsung-partners/useRepairClaims";
import { useRouter } from "next/navigation";

const AllRepairClaimsView = () => {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [dateRange, setDateRange] = useState<
		{ start: string; end: string } | undefined
	>();
	const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
	const [rejectionReason, setRejectionReason] = useState("");
	const [currentClaimId, setCurrentClaimId] = useState<string | null>(null);

	const {
		isOpen: isRejectModalOpen,
		onOpen: onRejectModalOpen,
		onClose: onRejectModalClose,
	} = useDisclosure();

	const { claims, isLoading, mutate } = useRepairClaims({
		status: statusFilter as any,
		search: searchTerm,
		dateRange,
	});

	const { approveClaim, rejectClaim, bulkApproveClaims } =
		useRepairClaimActions();

	const columns = [
		{ key: "id", label: "Claim ID" },
		{ key: "imei", label: "IMEI" },
		{ key: "customerName", label: "Customer Name" },
		{ key: "customerPhone", label: "Phone" },
		{ key: "serviceCenter", label: "Service Center" },
		{ key: "deviceModel", label: "Device" },
		{ key: "faultType", label: "Fault Type" },
		{ key: "repairCost", label: "Repair Cost" },
		{ key: "dateSubmitted", label: "Date Submitted" },
		{ key: "status", label: "Status" },
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
			case "status":
				const statusColors = {
					pending: "warning",
					approved: "success",
					rejected: "danger",
				};
				return (
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${
							item.status === "approved"
								? "bg-green-100 text-green-800"
								: item.status === "rejected"
								? "bg-red-100 text-red-800"
								: "bg-yellow-100 text-yellow-800"
						}`}
					>
						{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
					</span>
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
						{item.status === "pending" && (
							<>
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
							</>
						)}
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
					All Repair Claims
				</h1>
				<p className="text-gray-600">
					Manage and review all repair claims submitted
				</p>
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Input
					placeholder="Search claims..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					startContent={<Search size={18} className="text-gray-400" />}
					variant="bordered"
				/>
				<Select
					label="Status"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					variant="bordered"
				>
					<SelectItem key="all" value="all">
						All Status
					</SelectItem>
					<SelectItem key="pending" value="pending">
						Pending
					</SelectItem>
					<SelectItem key="approved" value="approved">
						Approved
					</SelectItem>
					<SelectItem key="rejected" value="rejected">
						Rejected
					</SelectItem>
				</Select>
				<Button variant="bordered" startContent={<Filter size={18} />}>
					Date Range
				</Button>
				{selectedClaims.length > 0 && (
					<Button
						color="success"
						onPress={handleBulkApprove}
						startContent={<CheckCircle size={18} />}
					>
						Approve Selected ({selectedClaims.length})
					</Button>
				)}
			</div>

			<SimpleTable
				data={claims}
				columns={columns}
				isLoading={isLoading}
				selectable={true}
				searchable={true}
				searchPlaceholder="Search by customer name, IMEI, or device model..."
				emptyMessage="No repair claims found"
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

export default AllRepairClaimsView;
