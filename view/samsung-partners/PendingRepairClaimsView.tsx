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
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import DocumentsCell from "@/components/reususables/DocumentsCell";
import { Eye, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
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

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const columns = [
		{
			header: "Claim ID",
			accessorKey: "id",
			cell: ({ row }: any) => (
				<span className="font-medium">{row.original.id}</span>
			),
		},
		{
			header: "Customer",
			accessorKey: "customerName",
		},
		{
			header: "IMEI",
			accessorKey: "imei",
		},
		{
			header: "Service Center",
			accessorKey: "serviceCenter",
		},
		{
			header: "Device",
			accessorKey: "deviceModel",
			cell: ({ row }: any) => (
				<div>
					<div className="font-medium">{row.original.deviceModel}</div>
					<div className="text-sm text-muted-foreground">
						{row.original.deviceBrand}
					</div>
				</div>
			),
		},
		{
			header: "Fault Type",
			accessorKey: "faultType",
			cell: ({ row }: any) => (
				<Chip variant="bordered" size="sm">
					{row.original.faultType?.replace("-", " ").toUpperCase()}
				</Chip>
			),
		},
		{
			header: "Repair Cost",
			accessorKey: "repairCost",
			cell: ({ row }: any) => (
				<span className="font-medium">
					₦{Number(row.original.repairCost).toLocaleString()}
				</span>
			),
		},
		{
			header: "Date Submitted",
			accessorKey: "dateSubmitted",
			cell: ({ row }: any) => formatDate(row.original.dateSubmitted),
		},
		{
			header: "Device Status",
			accessorKey: "deviceStatus",
			cell: ({ row }: any) => (
				<Chip color="primary" variant="flat" size="sm">
					{row.original.deviceStatus}
				</Chip>
			),
		},
		{
			header: "Documents",
			id: "documents",
			cell: ({ row }: any) => {
				const claim = row.original;
				return (
					<DocumentsCell
						documents={claim.documents || []}
						deviceImages={claim.deviceImages || []}
						claimId={claim.id}
					/>
				);
			},
		},
		{
			header: "Actions",
			id: "actions",
			cell: ({ row }: any) => {
				const claim = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							isIconOnly
							size="sm"
							variant="light"
							onPress={() => handleViewClaim(claim.id)}
						>
							<Eye size={16} />
						</Button>
						<Button
							isIconOnly
							size="sm"
							color="success"
							variant="light"
							onPress={() => handleApprove(claim.id)}
						>
							<CheckCircle size={16} />
						</Button>
						<Button
							isIconOnly
							size="sm"
							color="danger"
							variant="light"
							onPress={() => handleReject(claim.id)}
						>
							<XCircle size={16} />
						</Button>
					</div>
				);
			},
		},
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

			<GenericTable
				data={claims || []}
				columns={columns.map((col) => ({
					name: typeof col.header === "string" ? col.header : "",
					uid: col.accessorKey || "",
					sortable: true,
				}))}
				allCount={claims?.length || 0}
				exportData={claims || []}
				isLoading={isLoading}
				filterValue=""
				onFilterChange={() => {}}
				sortDescriptor={{ column: "id", direction: "ascending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={() => {}}
				renderCell={(item: any, columnKey: any) => {
					const column = columns.find((c) => c.accessorKey === columnKey);
					if (column?.cell) {
						return column.cell({ row: { original: item } });
					}
					return item[columnKey as keyof typeof item] || "-";
				}}
				hasNoRecords={!claims || claims.length === 0}
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
