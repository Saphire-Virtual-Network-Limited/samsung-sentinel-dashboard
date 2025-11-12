"use client";

import React, { useState, useMemo } from "react";
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
	useDisclosure,
	Textarea,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	Eye,
	CheckCircle,
	XCircle,
	Clock,
	FileText,
	CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib";
import { useClaimsApi } from "@/hooks/shared/useClaimsApi";
import { ClaimRepairItem } from "@/components/shared/ClaimsRepairsTable";

const columns: ColumnDef[] = [
	{ name: "Claim ID", uid: "claimId", sortable: true },
	{ name: "Customer", uid: "customer", sortable: true },
	{ name: "Device", uid: "device", sortable: true },
	{ name: "Service Center", uid: "serviceCenter", sortable: true },
	{ name: "Engineer", uid: "engineer", sortable: true },
	{ name: "Amount", uid: "amount", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Payment", uid: "payment", sortable: true },
	{ name: "Submitted", uid: "submitted", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	pending: "warning" as const,
	approved: "success" as const,
	rejected: "danger" as const,
	authorized: "primary" as const,
	paid: "success" as const,
};

const paymentColorMap = {
	paid: "success" as const,
	unpaid: "warning" as const,
};


export default function RepairStoreClaimsView() {
	const router = useRouter();

	// Modal states
	const {
		isOpen: isViewModalOpen,
		onOpen: onViewModalOpen,
		onClose: onViewModalClose,
	} = useDisclosure();

	const [selectedClaim, setSelectedClaim] = useState<ClaimRepairItem | null>(
		null
	);
	const [adminNotes, setAdminNotes] = useState("");

	// Filter states
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [paymentFilter, setPaymentFilter] = useState("");

	// Use Claims API hook
	const {
		data: claims,
		isLoading,
		error,
		refetch,
	} = useClaimsApi({
		role: "repair_store",
		status: statusFilter,
		payment: paymentFilter,
		search: filterValue,
	});

	// Calculate statistics
	const stats = useMemo(() => {
		const total = claims.length;
		const pending = claims.filter((c) => c.status === "pending").length;
		const approved = claims.filter((c) => c.status === "approved").length;
		const paid = claims.filter((c) => c.paymentStatus === "paid").length;
		const totalAmount = claims.reduce((sum, claim) => sum + claim.repairCost, 0);

		return {
			totalClaims: total,
			pendingClaims: pending,
			approvedClaims: approved,
			paidClaims: paid,
			totalAmount,
		};
	}, [claims]);

	const handleViewClaim = (claim: ClaimRepairItem) => {
		setSelectedClaim(claim);
		setAdminNotes("");
		onViewModalOpen();
	};

	// Export function
	const exportFn = async (data: ClaimRepairItem[]) => {
		console.log("Exporting claims:", data);
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Render cell content
	const renderCell = (row: ClaimRepairItem, key: string) => {
		switch (key) {
			case "claimId":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{row.claimId}</p>
						<p className="text-bold text-xs text-default-400">
							IMEI: {row.imei}
						</p>
					</div>
				);
			case "customer":
				return (
					<div className="flex flex-col">
						<p className="text-sm font-medium">{row.customerName}</p>
					</div>
				);
			case "device":
				return (
					<div className="flex flex-col">
						<p className="text-sm font-medium">{row.deviceName}</p>
						<p className="text-xs text-default-400">{row.faultType}</p>
					</div>
				);
			case "serviceCenter":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.serviceCenterName}</p>
						{row.serviceCenterId && (
							<Button
								size="sm"
								variant="light"
								className="h-auto p-0 text-xs text-primary"
								onPress={() =>
									router.push(
										`/access/repair-store/service-centers/${row.serviceCenterId}`
									)
								}
							>
								View Center
							</Button>
						)}
					</div>
				);
			case "engineer":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.engineerName || "Not assigned"}</p>
					</div>
				);
			case "amount":
				return (
					<p className="text-sm font-medium">
						{formatCurrency(row.repairCost)}
					</p>
				);
			case "status":
				return (
					<Chip
						color={statusColorMap[row.status] || "default"}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.status}
					</Chip>
				);
			case "payment":
				return (
					<Chip
						color={
							row.paymentStatus
								? paymentColorMap[row.paymentStatus] || "default"
								: "default"
						}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.paymentStatus}
					</Chip>
				);
			case "submitted":
				return <p className="text-sm">{formatDate(row.createdAt)}</p>;
			case "actions":
				return (
					<div className="flex justify-end">
						<Button
							isIconOnly
							size="sm"
							variant="light"
							onPress={() => handleViewClaim(row)}
						>
							<Eye className="text-default-300" />
						</Button>
					</div>
				);
			default:
				return <p className="text-sm">{(row as any)[key]}</p>;
		}
	};

	const statusOptions = [
		{ name: "All", uid: "all" },
		{ name: "Pending", uid: "pending" },
		{ name: "Approved", uid: "approved" },
		{ name: "Rejected", uid: "rejected" },
		{ name: "Authorized", uid: "authorized" },
	];

	const paymentOptions = [
		{ name: "All", uid: "all" },
		{ name: "Paid", uid: "paid" },
		{ name: "Unpaid", uid: "unpaid" },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Claims Management
					</h1>
					<p className="text-gray-600">
						Review and manage repair claims from all service centers
					</p>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<StatCard
					title="Total Claims"
					value={stats.totalClaims.toString()}
					icon={<FileText className="w-5 h-5" />}
				/>
				<StatCard
					title="Pending Review"
					value={stats.pendingClaims.toString()}
					icon={<Clock className="w-5 h-5" />}
				/>
				<StatCard
					title="Approved"
					value={stats.approvedClaims.toString()}
					icon={<CheckCircle className="w-5 h-5" />}
				/>
				<StatCard
					title="Paid"
					value={stats.paidClaims.toString()}
					icon={<CheckCircle className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Amount"
					value={formatCurrency(stats.totalAmount)}
					icon={<CreditCard className="w-5 h-5" />}
				/>
			</div>

			{/* Claims Table */}
			<GenericTable<ClaimRepairItem>
				columns={columns}
				data={claims}
				allCount={claims.length}
				exportData={claims}
				isLoading={isLoading}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				sortDescriptor={{ column: "createdAt", direction: "descending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={exportFn}
				renderCell={renderCell}
				hasNoRecords={claims.length === 0}
				searchPlaceholder="Search by claim ID, IMEI, or customer name..."
				showRowsPerPageSelector={true}
			/>

			{/* View Claim Details Modal */}
			<Modal
				isOpen={isViewModalOpen}
				onClose={onViewModalClose}
				size="3xl"
				scrollBehavior="inside"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>
								<div className="flex items-center gap-2">
									<span>Claim Details - {selectedClaim?.claimId}</span>
									<Chip
										color={
											selectedClaim
												? statusColorMap[selectedClaim.status] || "default"
												: "default"
										}
										size="sm"
										variant="flat"
										className="capitalize"
									>
										{selectedClaim?.status}
									</Chip>
								</div>
							</ModalHeader>
							<ModalBody>
								{selectedClaim && (
									<div className="space-y-6">

										{/* Customer Information */}
										<Card>
											<CardHeader>
												<h3 className="text-lg font-semibold">
													Customer Information
												</h3>
											</CardHeader>
											<CardBody>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="text-sm text-gray-600">Name</p>
														<p className="font-medium">
															{selectedClaim.customerName}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">IMEI</p>
														<p className="font-medium">{selectedClaim.imei}</p>
													</div>
												</div>
											</CardBody>
										</Card>

										{/* Device Information */}
										<Card>
											<CardHeader>
												<h3 className="text-lg font-semibold">
													Device Information
												</h3>
											</CardHeader>
											<CardBody>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="text-sm text-gray-600">
															Device Model
														</p>
														<p className="font-medium">
															{selectedClaim.deviceName}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Fault Type</p>
														<p className="font-medium">
															{selectedClaim.faultType}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">
															Repair Cost
														</p>
														<p className="font-medium text-lg">
															{formatCurrency(selectedClaim.repairCost)}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">
															Payment Status
														</p>
														<Chip
															color={
																selectedClaim.paymentStatus
																	? paymentColorMap[selectedClaim.paymentStatus] ||
																	  "default"
																	: "default"
															}
															size="sm"
															variant="flat"
															className="capitalize"
														>
															{selectedClaim.paymentStatus}
														</Chip>
													</div>
												</div>
											</CardBody>
										</Card>

										{/* Service Information */}
										<Card>
											<CardHeader>
												<h3 className="text-lg font-semibold">
													Service Information
												</h3>
											</CardHeader>
											<CardBody>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="text-sm text-gray-600">
															Service Center
														</p>
														<p className="font-medium">
															{selectedClaim.serviceCenterName}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Engineer</p>
														<p className="font-medium">
															{selectedClaim.engineerName || "Not assigned"}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Submitted</p>
														<p className="font-medium">
															{formatDate(selectedClaim.createdAt)}
														</p>
													</div>
													{selectedClaim.approvedAt && (
														<div>
															<p className="text-sm text-gray-600">Approved At</p>
															<p className="font-medium">
																{formatDate(selectedClaim.approvedAt)}
															</p>
														</div>
													)}
													{selectedClaim.completedAt && (
														<div>
															<p className="text-sm text-gray-600">
																Completed At
															</p>
															<p className="font-medium">
																{formatDate(selectedClaim.completedAt)}
															</p>
														</div>
													)}
													{selectedClaim.rejectedAt && (
														<div className="md:col-span-2">
															<p className="text-sm text-gray-600">
																Rejected At
															</p>
															<p className="font-medium">
																{formatDate(selectedClaim.rejectedAt)}
															</p>
															{selectedClaim.rejectionReason && (
																<p className="text-sm text-danger mt-2">
																	Reason: {selectedClaim.rejectionReason}
																</p>
															)}
														</div>
													)}
												</div>
											</CardBody>
										</Card>

										{selectedClaim.transactionRef && (
											<Card>
												<CardHeader>
													<h3 className="text-lg font-semibold">
														Payment Information
													</h3>
												</CardHeader>
												<CardBody>
													<div className="space-y-2">
														<div>
															<p className="text-sm text-gray-600">
																Transaction Reference
															</p>
															<p className="font-medium">
																{selectedClaim.transactionRef}
															</p>
														</div>
														{selectedClaim.sessionId && (
															<div>
																<p className="text-sm text-gray-600">
																	Session ID
																</p>
																<p className="font-medium">
																	{selectedClaim.sessionId}
																</p>
															</div>
														)}
													</div>
												</CardBody>
											</Card>
										)}
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onViewModalClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
