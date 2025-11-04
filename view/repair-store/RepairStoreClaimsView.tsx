"use client";

import React, { useState, useMemo } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Avatar,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Textarea,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	Eye,
	EllipsisVertical,
	CheckCircle,
	XCircle,
	Clock,
	MessageSquare,
	FileText,
	CreditCard,
	AlertCircle,
	TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib";

interface Claim {
	id: string;
	customerName: string;
	customerPhone: string;
	deviceModel: string;
	issue: string;
	claimAmount: number;
	serviceCenterName: string;
	serviceCenterId: string;
	engineerName: string;
	engineerId: string;
	status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
	priority: "low" | "medium" | "high" | "urgent";
	submittedDate: string;
	updatedDate: string;
	completionDate?: string;
	adminNotes?: string;
	attachments?: string[];
}

const columns: ColumnDef[] = [
	{ name: "Claim ID", uid: "claimId", sortable: true },
	{ name: "Customer", uid: "customer", sortable: true },
	{ name: "Device", uid: "device", sortable: true },
	{ name: "Service Center", uid: "serviceCenter", sortable: true },
	{ name: "Engineer", uid: "engineer", sortable: true },
	{ name: "Amount", uid: "amount", sortable: true },
	{ name: "Priority", uid: "priority", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Submitted", uid: "submitted", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	pending: "warning" as const,
	approved: "success" as const,
	rejected: "danger" as const,
	in_progress: "primary" as const,
	completed: "success" as const,
};

const priorityColorMap = {
	low: "default" as const,
	medium: "warning" as const,
	high: "danger" as const,
	urgent: "danger" as const,
};

export default function RepairStoreClaimsView() {
	const router = useRouter();

	// Modal states
	const {
		isOpen: isViewModalOpen,
		onOpen: onViewModalOpen,
		onClose: onViewModalClose,
	} = useDisclosure();

	const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
	const [adminNotes, setAdminNotes] = useState("");

	// Filter states
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// Mock data
	const claims: Claim[] = useMemo(
		() => [
			{
				id: "CLM_001",
				customerName: "Adebayo Johnson",
				customerPhone: "+234 801 234 5678",
				deviceModel: "Samsung Galaxy S23",
				issue: "Screen Replacement",
				claimAmount: 45000,
				serviceCenterName: "Sapphire Tech Hub Lagos",
				serviceCenterId: "sc_001",
				engineerName: "John Adebayo",
				engineerId: "eng_001",
				status: "pending",
				priority: "high",
				submittedDate: "2024-10-15T10:30:00Z",
				updatedDate: "2024-10-15T10:30:00Z",
				adminNotes: "",
				attachments: ["receipt.pdf", "damage_photo.jpg"],
			},
			{
				id: "CLM_002",
				customerName: "Fatima Ibrahim",
				customerPhone: "+234 802 345 6789",
				deviceModel: "iPhone 14 Pro",
				issue: "Battery Replacement",
				claimAmount: 35000,
				serviceCenterName: "Sapphire Tech Hub Abuja",
				serviceCenterId: "sc_002",
				engineerName: "Sarah Ibrahim",
				engineerId: "eng_002",
				status: "in_progress",
				priority: "medium",
				submittedDate: "2024-10-14T15:20:00Z",
				updatedDate: "2024-10-15T09:45:00Z",
				adminNotes: "Customer confirmed battery issue. Replacement approved.",
			},
			{
				id: "CLM_003",
				customerName: "Michael Okonkwo",
				customerPhone: "+234 803 456 7890",
				deviceModel: "Samsung Galaxy Note 20",
				issue: "Water Damage Repair",
				claimAmount: 62000,
				serviceCenterName: "Sapphire Tech Hub Lagos",
				serviceCenterId: "sc_001",
				engineerName: "Michael Okafor",
				engineerId: "eng_003",
				status: "completed",
				priority: "urgent",
				submittedDate: "2024-10-12T11:15:00Z",
				updatedDate: "2024-10-14T16:30:00Z",
				completionDate: "2024-10-14T16:30:00Z",
				adminNotes: "Successfully repaired. Customer satisfied.",
				attachments: ["before.jpg", "after.jpg", "invoice.pdf"],
			},
			{
				id: "CLM_004",
				customerName: "Grace Okoro",
				customerPhone: "+234 804 567 8901",
				deviceModel: "iPhone 13",
				issue: "Camera Module Replacement",
				claimAmount: 28000,
				serviceCenterName: "Sapphire Tech Hub Port Harcourt",
				serviceCenterId: "sc_003",
				engineerName: "Ahmed Hassan",
				engineerId: "eng_005",
				status: "approved",
				priority: "low",
				submittedDate: "2024-10-13T14:45:00Z",
				updatedDate: "2024-10-15T11:20:00Z",
				adminNotes: "Approved for repair. Awaiting parts delivery.",
			},
			{
				id: "CLM_005",
				customerName: "Yusuf Mohammed",
				customerPhone: "+234 805 678 9012",
				deviceModel: "Samsung Galaxy A54",
				issue: "Charging Port Repair",
				claimAmount: 15000,
				serviceCenterName: "Sapphire Tech Hub Kano",
				serviceCenterId: "sc_004",
				engineerName: "Grace Okoro",
				engineerId: "eng_006",
				status: "rejected",
				priority: "low",
				submittedDate: "2024-10-11T09:30:00Z",
				updatedDate: "2024-10-12T10:15:00Z",
				adminNotes: "Device damage not covered under warranty terms.",
			},
		],
		[]
	);

	// Statistics
	const stats = useMemo(() => {
		const totalClaims = claims.length;
		const pendingClaims = claims.filter((c) => c.status === "pending").length;
		const approvedClaims = claims.filter((c) => c.status === "approved").length;
		const completedClaims = claims.filter(
			(c) => c.status === "completed"
		).length;
		const totalAmount = claims
			.filter((c) => c.status === "completed" || c.status === "approved")
			.reduce((sum, c) => sum + c.claimAmount, 0);

		return {
			totalClaims,
			pendingClaims,
			approvedClaims,
			completedClaims,
			totalAmount,
		};
	}, [claims]);

	const handleViewClaim = (claim: Claim) => {
		setSelectedClaim(claim);
		setAdminNotes(claim.adminNotes || "");
		onViewModalOpen();
	};

	const handleUpdateClaimStatus = async (
		claimId: string,
		newStatus: string,
		notes?: string
	) => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({
				message: `Claim ${newStatus} successfully`,
				type: "success",
			});
		} catch (error) {
			showToast({
				message: "Failed to update claim status",
				type: "error",
			});
		}
	};

	// Bulk actions
	const handleBulkApprove = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} claims approved successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to approve claims", type: "error" });
		}
	};

	const handleBulkReject = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} claims rejected successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to reject claims", type: "error" });
		}
	};

	// Selection handler
	const handleSelectionChange = (keys: any) => {
		if (keys === "all") {
			if (selectedKeys.size === claims.length) {
				setSelectedKeys(new Set());
			} else {
				setSelectedKeys(new Set(claims.map((item) => item.id)));
			}
		} else {
			setSelectedKeys(new Set(Array.from(keys)));
		}
	};

	// Export function
	const exportFn = async (data: Claim[]) => {
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
	const renderCell = (row: Claim, key: string) => {
		switch (key) {
			case "claimId":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{row.id}</p>
						<p className="text-bold text-xs text-default-400">
							{row.attachments?.length || 0} attachments
						</p>
					</div>
				);
			case "customer":
				return (
					<div className="flex flex-col">
						<p className="text-sm font-medium">{row.customerName}</p>
						<p className="text-xs text-default-400">{row.customerPhone}</p>
					</div>
				);
			case "device":
				return (
					<div className="flex flex-col">
						<p className="text-sm font-medium">{row.deviceModel}</p>
						<p className="text-xs text-default-400">{row.issue}</p>
					</div>
				);
			case "serviceCenter":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.serviceCenterName}</p>
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
					</div>
				);
			case "engineer":
				return (
					<div className="flex items-center gap-2">
						<Avatar name={row.engineerName} size="sm" />
						<div className="flex flex-col">
							<p className="text-sm">{row.engineerName}</p>
							<p className="text-xs text-default-400">ID: {row.engineerId}</p>
						</div>
					</div>
				);
			case "amount":
				return (
					<p className="text-sm font-medium">
						{formatCurrency(row.claimAmount)}
					</p>
				);
			case "priority":
				return (
					<Chip
						color={priorityColorMap[row.priority]}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.priority}
					</Chip>
				);
			case "status":
				return (
					<Chip
						color={statusColorMap[row.status]}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.status.replace("_", " ")}
					</Chip>
				);
			case "submitted":
				return <p className="text-sm">{formatDate(row.submittedDate)}</p>;
			case "actions":
				return (
					<div className="flex justify-end">
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light">
									<EllipsisVertical className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem
									key="view"
									startContent={<Eye size={16} />}
									onPress={() => handleViewClaim(row)}
								>
									View Details
								</DropdownItem>
								{row.status === "pending" ? (
									<React.Fragment>
										<DropdownItem
											key="approve"
											className="text-success"
											color="success"
											startContent={<CheckCircle size={16} />}
											onPress={() =>
												handleUpdateClaimStatus(row.id, "approved")
											}
										>
											Approve Claim
										</DropdownItem>
										<DropdownItem
											key="reject"
											className="text-danger"
											color="danger"
											startContent={<XCircle size={16} />}
											onPress={() =>
												handleUpdateClaimStatus(row.id, "rejected")
											}
										>
											Reject Claim
										</DropdownItem>
									</React.Fragment>
								) : null}
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <p className="text-sm">{(row as any)[key]}</p>;
		}
	};

	const statusOptions = [
		{ name: "Pending", uid: "pending" },
		{ name: "Approved", uid: "approved" },
		{ name: "Rejected", uid: "rejected" },
		{ name: "In Progress", uid: "in_progress" },
		{ name: "Completed", uid: "completed" },
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
				{selectedKeys.size > 0 && (
					<div className="flex items-center gap-2">
						<Button
							color="success"
							variant="flat"
							startContent={<CheckCircle size={16} />}
							onPress={handleBulkApprove}
							size="sm"
						>
							Approve ({selectedKeys.size})
						</Button>
						<Button
							color="danger"
							variant="flat"
							startContent={<XCircle size={16} />}
							onPress={handleBulkReject}
							size="sm"
						>
							Reject ({selectedKeys.size})
						</Button>
						<Button
							variant="light"
							onPress={() => setSelectedKeys(new Set())}
							size="sm"
						>
							Clear Selection
						</Button>
					</div>
				)}
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
					title="Completed"
					value={stats.completedClaims.toString()}
					icon={<TrendingUp className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Amount"
					value={formatCurrency(stats.totalAmount)}
					icon={<CreditCard className="w-5 h-5" />}
				/>
			</div>

			{/* Claims Table */}
			<GenericTable<Claim>
				columns={columns}
				data={claims}
				allCount={claims.length}
				exportData={claims}
				isLoading={false}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				statusOptions={statusOptions}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				statusColorMap={statusColorMap}
				showStatus={true}
				sortDescriptor={{ column: "submittedDate", direction: "descending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={exportFn}
				renderCell={renderCell}
				hasNoRecords={claims.length === 0}
				searchPlaceholder="Search claims by ID, customer name, or device model..."
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				selectionMode="multiple"
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
									<span>Claim Details - {selectedClaim?.id}</span>
									<Chip
										color={
											selectedClaim
												? statusColorMap[selectedClaim.status]
												: "default"
										}
										size="sm"
										variant="flat"
										className="capitalize"
									>
										{selectedClaim?.status.replace("_", " ")}
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
														<p className="text-sm text-gray-600">Phone</p>
														<p className="font-medium">
															{selectedClaim.customerPhone}
														</p>
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
															{selectedClaim.deviceModel}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Issue</p>
														<p className="font-medium">{selectedClaim.issue}</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">
															Claim Amount
														</p>
														<p className="font-medium text-lg">
															{formatCurrency(selectedClaim.claimAmount)}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Priority</p>
														<Chip
															color={priorityColorMap[selectedClaim.priority]}
															size="sm"
															variant="flat"
															className="capitalize"
														>
															{selectedClaim.priority}
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
															{selectedClaim.engineerName}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">Submitted</p>
														<p className="font-medium">
															{formatDate(selectedClaim.submittedDate)}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600">
															Last Updated
														</p>
														<p className="font-medium">
															{formatDate(selectedClaim.updatedDate)}
														</p>
													</div>
													{selectedClaim.completionDate && (
														<div className="md:col-span-2">
															<p className="text-sm text-gray-600">
																Completion Date
															</p>
															<p className="font-medium">
																{formatDate(selectedClaim.completionDate)}
															</p>
														</div>
													)}
												</div>
											</CardBody>
										</Card>

										{/* Attachments */}
										{selectedClaim.attachments &&
											selectedClaim.attachments.length > 0 && (
												<Card>
													<CardHeader>
														<h3 className="text-lg font-semibold">
															Attachments
														</h3>
													</CardHeader>
													<CardBody>
														<div className="flex flex-wrap gap-2">
															{selectedClaim.attachments.map((attachment) => (
																<Chip
																	key={attachment}
																	variant="flat"
																	startContent={<FileText size={14} />}
																>
																	{attachment}
																</Chip>
															))}
														</div>
													</CardBody>
												</Card>
											)}

										{/* Admin Notes */}
										<Card>
											<CardHeader>
												<h3 className="text-lg font-semibold">Admin Notes</h3>
											</CardHeader>
											<CardBody>
												<Textarea
													placeholder="Add notes about this claim..."
													value={adminNotes}
													onValueChange={setAdminNotes}
													minRows={3}
													maxRows={6}
												/>
											</CardBody>
										</Card>

										{/* Action Buttons */}
										{selectedClaim.status === "pending" && (
											<div className="flex gap-2">
												<Button
													color="success"
													startContent={<CheckCircle size={16} />}
													onPress={() => {
														handleUpdateClaimStatus(
															selectedClaim.id,
															"approved",
															adminNotes
														);
														onViewModalClose();
													}}
												>
													Approve Claim
												</Button>
												<Button
													color="danger"
													variant="flat"
													startContent={<XCircle size={16} />}
													onPress={() => {
														handleUpdateClaimStatus(
															selectedClaim.id,
															"rejected",
															adminNotes
														);
														onViewModalClose();
													}}
												>
													Reject Claim
												</Button>
											</div>
										)}
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onViewModalClose}>
									Close
								</Button>
								{selectedClaim && selectedClaim.status !== "pending" && (
									<Button
										color="primary"
										startContent={<MessageSquare size={16} />}
										onPress={() => {
											// Save admin notes
											showToast({
												message: "Notes updated successfully",
												type: "success",
											});
											onViewModalClose();
										}}
									>
										Save Notes
									</Button>
								)}
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
