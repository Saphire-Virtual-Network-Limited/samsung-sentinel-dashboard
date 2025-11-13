"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Chip,
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
	useDisclosure,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import DocumentsCell from "@/components/reususables/DocumentsCell";
import {
	MoreHorizontal,
	Eye,
	CheckCircle,
	XCircle,
	DollarSign,
	FileText,
	Wrench,
} from "lucide-react";
import { formatDate } from "@/lib";
import { showToast } from "@/lib/showNotification";
import testData from "@/lib/testData/claimsRepairsTestData.json";

export type ClaimRepairRole =
	| "service-center"
	| "repair_store"
	| "samsung-partners"
	| "samsung-sentinel";

export interface ClaimRepairItem {
	id: string;
	claimId: string;
	customerName: string;
	imei: string;
	deviceName: string;
	brand: string;
	model: string;
	faultType: string;
	repairCost: number;
	status: "pending" | "approved" | "rejected" | "authorized";
	repairStatus: "pending" | "awaiting-parts" | "received-device" | "completed";
	paymentStatus?: "paid" | "unpaid";
	transactionRef?: string;
	sessionId?: string;
	createdAt: string;
	serviceCenterName?: string;
	serviceCenterId?: string;
	engineerName?: string;
	completedAt?: string;
	completedById?: string;
	approvedAt?: string;
	approvedById?: string;
	rejectedAt?: string;
	rejectedById?: string;
	rejectionReason?: string;
	authorizedAt?: string;
	authorizedById?: string;
	paidAt?: string;
	paidById?: string;
	transactionId?: string;
	referenceId?: string;
}

export interface ClaimsRepairsTableProps {
	data: ClaimRepairItem[];
	isLoading?: boolean;
	error?: any;
	role: ClaimRepairRole;
	onApprove?: (claimId: string) => void;
	onReject?: (claimId: string, reason: string) => void;
	onAuthorizePayment?: (claimId: string) => void;
	onExecutePayment?: (claimIds: string[]) => void;
	onBulkPayment?: (claimIds: string[], transactionRef: string) => void;
	onBulkApprove?: (claimIds: string[]) => void;
	onBulkReject?: (claimIds: string[], reason: string) => void;
	onBulkAuthorizePayment?: (claimIds: string[]) => void;
	onViewDetails?: (claim: ClaimRepairItem) => void;
	onUpdateRepairStatus?: (
		claimId: string,
		newRepairStatus:
			| "pending"
			| "awaiting-parts"
			| "received-device"
			| "completed"
	) => void;
	showPaymentColumns?: boolean;
	enableMultiSelect?: boolean;
	onDateFilterChange?: (start: string, end: string) => void;
	initialStartDate?: string;
	initialEndDate?: string;
	defaultDateRange?: { days: number };
}

const ClaimsRepairsTable: React.FC<ClaimsRepairsTableProps> = ({
	data,
	isLoading,
	error,
	role,
	onApprove,
	onReject,
	onAuthorizePayment,
	onExecutePayment,
	onBulkPayment,
	onBulkApprove,
	onBulkReject,
	onBulkAuthorizePayment,
	onViewDetails,
	onUpdateRepairStatus,
	showPaymentColumns = false,
	enableMultiSelect = false,
	onDateFilterChange,
	initialStartDate,
	initialEndDate,
	defaultDateRange,
}) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const status = searchParams.get("status") || "all";
	const paymentFilter = searchParams.get("payment") || "all";

	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState({
		column: "createdAt",
		direction: "descending" as "ascending" | "descending",
	});
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// Rejection modal state
	const {
		isOpen: isRejectModalOpen,
		onOpen: onRejectModalOpen,
		onClose: onRejectModalClose,
	} = useDisclosure();
	const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");

	// Bulk rejection modal state
	const {
		isOpen: isBulkRejectModalOpen,
		onOpen: onBulkRejectModalOpen,
		onClose: onBulkRejectModalClose,
	} = useDisclosure();
	const [bulkRejectionReason, setBulkRejectionReason] = useState("");

	// Filter data based on search params
	const filteredData = useMemo(() => {
		let filtered = [...data];

		// Filter by status
		if (status !== "all") {
			filtered = filtered.filter((item) => item.status === status);
		}

		// Filter by payment status
		if (paymentFilter !== "all" && showPaymentColumns) {
			filtered = filtered.filter(
				(item) => item.paymentStatus === paymentFilter
			);
		}

		return filtered;
	}, [data, status, paymentFilter, showPaymentColumns]);

	// Define columns based on role and payment view
	const columns: ColumnDef[] = useMemo(() => {
		const baseColumns: ColumnDef[] = [
			{
				name: "Claim ID",
				uid: "claimId",
				sortable: true,
			},
			{
				name: "Customer",
				uid: "customerName",
				sortable: true,
			},
			{
				name: "IMEI",
				uid: "imei",
				sortable: true,
			},
			{
				name: "Device",
				uid: "device",
				sortable: true,
			},
			{
				name: "Fault Type",
				uid: "faultType",
				sortable: true,
			},
			{
				name: "Repair Cost",
				uid: "repairCost",
				sortable: true,
			},
			{
				name: "Status",
				uid: "status",
				sortable: true,
			},
			{
				name: "Date",
				uid: "createdAt",
				sortable: true,
			},
		];

		// Add role-specific columns
		if (role === "samsung-partners" || role === "samsung-sentinel") {
			baseColumns.splice(2, 0, {
				name: "Service Center",
				uid: "serviceCenterName",
				sortable: true,
			});
		}

		if (role === "samsung-sentinel") {
			baseColumns.splice(3, 0, {
				name: "Engineer",
				uid: "engineerName",
				sortable: true,
			});
		}

		// Add rejection details for rejected claims (all roles)
		if (role === "service-center" || role === "repair_store") {
			baseColumns.push({
				name: "Rejection Info",
				uid: "rejectionInfo",
				sortable: false,
			});
			baseColumns.push({
				name: "Completion Info",
				uid: "completionInfo",
				sortable: false,
			});
		}

		// Add payment columns if needed
		if (showPaymentColumns) {
			const paymentColumns: ColumnDef[] = [
				{
					name: "Payment Status",
					uid: "paymentStatus",
					sortable: true,
				},
			];

			// Add bank details column for samsung-sentinel only
			if (role === "samsung-sentinel") {
				paymentColumns.push({
					name: "Bank Details",
					uid: "bankDetails",
					sortable: false,
				});
			}

			paymentColumns.push({
				name: "Completed Date",
				uid: "completedAt",
				sortable: true,
			});

			// Add payment details for paid claims
			paymentColumns.push({
				name: "Payment Details",
				uid: "paymentDetails",
				sortable: false,
			});

			baseColumns.push(...paymentColumns);
		}

		// Add all audit fields for Samsung admin
		if (role === "samsung-sentinel") {
			baseColumns.push(
				{
					name: "Approved Info",
					uid: "approvedInfo",
					sortable: false,
				},
				{
					name: "Authorized Info",
					uid: "authorizedInfo",
					sortable: false,
				},
				{
					name: "Rejected Info",
					uid: "rejectedInfo",
					sortable: false,
				},
				{
					name: "Completed Info",
					uid: "completedInfo",
					sortable: false,
				},
				{
					name: "Paid Info",
					uid: "paidInfo",
					sortable: false,
				}
			);
		}

		// Samsung partners need to see ALL details
		if (role === "samsung-partners") {
			baseColumns.push(
				{
					name: "Approved Info",
					uid: "approvedInfo",
					sortable: false,
				},
				{
					name: "Authorized Info",
					uid: "authorizedInfo",
					sortable: false,
				},
				{
					name: "Rejected Info",
					uid: "rejectedInfo",
					sortable: false,
				},
				{
					name: "Completed Info",
					uid: "completedInfo",
					sortable: false,
				},
				{
					name: "Paid Info",
					uid: "paidInfo",
					sortable: false,
				}
			);
		}

		// Always add actions column
		baseColumns.push({
			name: "Actions",
			uid: "actions",
		});

		return baseColumns;
	}, [role, showPaymentColumns]);

	// Helper to generate action menu items based on role and item status
	const getActionMenuItems = (item: ClaimRepairItem) => {
		const items = [
			<DropdownItem
				key="view"
				startContent={<Eye className="h-4 w-4" />}
				onPress={() => handleViewDetailsClick(item)}
			>
				Expand
			</DropdownItem>,
		];

		// Service Center Actions
		if (role === "service-center" && item.status === "pending") {
			items.push(
				<DropdownItem
					key="edit"
					startContent={<FileText className="h-4 w-4" />}
					onPress={() =>
						router.push(`/access/service-center/claims/${item.claimId}`)
					}
				>
					Edit Claim
				</DropdownItem>
			);
		}

		// Samsung Partners Actions
		if (role === "samsung-partners" && item.status === "pending") {
			items.push(
				<DropdownItem
					key="approve"
					startContent={<CheckCircle className="h-4 w-4" />}
					onPress={() => onApprove?.(item.id)}
					color="success"
				>
					Approve Claim
				</DropdownItem>,
				<DropdownItem
					key="reject"
					startContent={<XCircle className="h-4 w-4" />}
					onPress={() => handleReject(item.id)}
					color="danger"
				>
					Reject Claim
				</DropdownItem>
			);
		}

		// Samsung Partners: Authorize payment for approved claims
		if (
			role === "samsung-partners" &&
			item.status === "approved" &&
			item.paymentStatus === "unpaid"
		) {
			items.push(
				<DropdownItem
					key="authorize"
					startContent={<DollarSign className="h-4 w-4" />}
					onPress={() => onAuthorizePayment?.(item.id)}
					color="primary"
				>
					Authorize Payment
				</DropdownItem>
			);
		}

		// Samsung Sentinel Actions: Execute payment for authorized claims (status=AUTHORIZED)
		if (
			role === "samsung-sentinel" &&
			item.status === "approved" &&
			item.paymentStatus === "unpaid"
		) {
			items.push(
				<DropdownItem
					key="execute"
					startContent={<DollarSign className="h-4 w-4" />}
					onPress={() => onExecutePayment?.([item.id])}
					color="success"
				>
					Execute Payment
				</DropdownItem>
			);
		}

		return items;
	};

	const handleViewDetailsClick = (item: ClaimRepairItem) => {
		if (onViewDetails) {
			// Use callback if provided (for modal view)
			onViewDetails(item);
		} else {
			// Fall back to navigation (for dedicated pages)
			const basePath =
				role === "service-center"
					? "/access/service-center/claims"
					: role === "samsung-partners"
					? "/access/samsung-partners/repair-claims"
					: "/access/repair-store/repairs";
			router.push(`${basePath}/${item.claimId}`);
		}
	};

	const handleReject = (id: string) => {
		// Open rejection modal to collect reason
		setRejectingClaimId(id);
		setRejectionReason("");
		onRejectModalOpen();
	};

	const handleConfirmReject = () => {
		if (!rejectionReason.trim()) {
			showToast({
				type: "error",
				message: "Please provide a rejection reason",
			});
			return;
		}

		if (rejectingClaimId) {
			onReject?.(rejectingClaimId, rejectionReason);
			onRejectModalClose();
			setRejectingClaimId(null);
			setRejectionReason("");
		}
	};

	// Check if item is disabled for selection
	const isItemDisabled = (item: ClaimRepairItem) => {
		return enableMultiSelect && disabledKeys.has(item.id);
	};

	// Custom render for cells
	const renderCell = (item: ClaimRepairItem, columnKey: string) => {
		const disabled = isItemDisabled(item);
		const cellClassName = disabled ? "opacity-50" : "";

		switch (columnKey) {
			case "claimId":
				return (
					<span className={`font-medium ${cellClassName}`}>{item.claimId}</span>
				);

			case "device":
				return (
					<div className={cellClassName}>
						<div className="font-medium">{item.deviceName}</div>
					</div>
				);

			case "faultType":
				return (
					<Chip variant="bordered" size="sm" className={cellClassName}>
						{item.faultType?.replace("-", " ").toUpperCase()}
					</Chip>
				);

			case "repairCost":
				return (
					<span className="font-medium">
						₦{Number(item.repairCost).toLocaleString()}
					</span>
				);

			case "status":
				const statusColors: Record<string, any> = {
					pending: "warning",
					approved: "success",
					rejected: "danger",
					"in-progress": "primary",
				};
				return (
					<div className="flex items-center gap-2">
						<Chip
							color={statusColors[item.status || "pending"] || "default"}
							variant="flat"
							size="sm"
							className={cellClassName}
						>
							{(item.status || "pending").toUpperCase().replace("-", " ")}
						</Chip>
						{disabled && item.status !== "approved" && (
							<span
								className="text-xs text-gray-400"
								title="Not eligible for selection"
							>
								🔒
							</span>
						)}
					</div>
				);

			case "paymentStatus":
				return item.paymentStatus ? (
					<Chip
						color={item.paymentStatus === "paid" ? "success" : "warning"}
						variant="flat"
						size="sm"
					>
						{item.paymentStatus.toUpperCase()}
					</Chip>
				) : (
					<span className="text-gray-400">N/A</span>
				);

			case "transactionRef":
				return item.transactionRef ? (
					<span className="font-mono text-xs">{item.transactionRef}</span>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "sessionId":
				return item.sessionId ? (
					<span className="font-mono text-xs">{item.sessionId}</span>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "bankDetails":
				// Bank details are loaded from test data via serviceCenterId
				// This will be displayed in a compact format
				if (item.serviceCenterId && item.status === "approved") {
					const serviceCenter = testData.serviceCenters.find(
						(sc: any) => sc.id === item.serviceCenterId
					);

					if (serviceCenter?.bankDetails) {
						return (
							<div className="text-xs">
								<div className="font-semibold">
									{serviceCenter.bankDetails.bankName}
								</div>
								<div className="text-gray-600 dark:text-gray-400">
									{serviceCenter.bankDetails.accountNumber}
								</div>
								<div className="text-gray-500 dark:text-gray-500 truncate max-w-[150px]">
									{serviceCenter.bankDetails.accountName}
								</div>
							</div>
						);
					}
				}
				return <span className="text-gray-400">-</span>;

			case "completedAt":
				return item.completedAt ? (
					<span className="text-sm">{formatDate(item.completedAt)}</span>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "createdAt":
				return <span className="text-sm">{formatDate(item.createdAt)}</span>;

			case "serviceCenterName":
				return (
					<span className="text-sm">{item.serviceCenterName || "N/A"}</span>
				);

			case "engineerName":
				return <span className="text-sm">{item.engineerName || "N/A"}</span>;

			case "rejectionInfo":
				return item.status === "rejected" ? (
					<div className="text-xs space-y-1">
						{item.rejectedAt && (
							<div className="text-gray-600">{formatDate(item.rejectedAt)}</div>
						)}
						{item.rejectionReason && (
							<div className="text-danger-600 line-clamp-2">
								{item.rejectionReason}
							</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "completionInfo":
				return item.completedAt ? (
					<div className="text-xs space-y-1">
						<div className="text-gray-600">{formatDate(item.completedAt)}</div>
						{item.completedById && (
							<div className="text-gray-500 font-mono">
								{item.completedById.slice(0, 8)}...
							</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "paymentDetails":
				return item.paymentStatus === "paid" ? (
					<div className="text-xs space-y-1">
						{item.paidAt && (
							<div className="text-gray-600">{formatDate(item.paidAt)}</div>
						)}
						{item.transactionId && (
							<div className="text-gray-500 font-mono truncate max-w-[120px]">
								Txn: {item.transactionId}
							</div>
						)}
						{item.referenceId && (
							<div className="text-gray-500">Ref: {item.referenceId}</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "approvedInfo":
				return item.approvedAt ? (
					<div className="text-xs space-y-1">
						<div className="text-gray-600">{formatDate(item.approvedAt)}</div>
						{item.approvedById && (
							<div className="text-gray-500 font-mono">
								{item.approvedById.slice(0, 8)}...
							</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "authorizedInfo":
				return item.authorizedAt ? (
					<div className="text-xs space-y-1">
						<div className="text-gray-600">{formatDate(item.authorizedAt)}</div>
						{item.authorizedById && (
							<div className="text-gray-500 font-mono">
								{item.authorizedById.slice(0, 8)}...
							</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "rejectedInfo":
				return item.rejectedAt ? (
					<div className="text-xs space-y-1">
						<div className="text-gray-600">{formatDate(item.rejectedAt)}</div>
						{item.rejectedById && (
							<div className="text-gray-500 font-mono">
								{item.rejectedById.slice(0, 8)}...
							</div>
						)}
						{item.rejectionReason && (
							<div className="text-danger-600 line-clamp-2">
								{item.rejectionReason}
							</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "completedInfo":
				return item.completedAt ? (
					<div className="text-xs space-y-1">
						<div className="text-gray-600">{formatDate(item.completedAt)}</div>
						{item.completedById && (
							<div className="text-gray-500 font-mono">
								{item.completedById.slice(0, 8)}...
							</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "paidInfo":
				return item.paidAt ? (
					<div className="text-xs space-y-1">
						<div className="text-gray-600">{formatDate(item.paidAt)}</div>
						{item.paidById && (
							<div className="text-gray-500 font-mono">
								{item.paidById.slice(0, 8)}...
							</div>
						)}
						{item.transactionId && (
							<div className="text-gray-500 font-mono truncate max-w-[120px]">
								{item.transactionId}
							</div>
						)}
						{item.referenceId && (
							<div className="text-gray-500">Ref: {item.referenceId}</div>
						)}
					</div>
				) : (
					<span className="text-gray-400">-</span>
				);

			case "actions":
				return (
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Actions">
							{getActionMenuItems(item)}
						</DropdownMenu>
					</Dropdown>
				);

			default:
				return (
					<span>{String(item[columnKey as keyof ClaimRepairItem] || "")}</span>
				);
		}
	};

	// Transform data for GenericTable
	const tableData = filteredData.map((item) => ({
		...item,
		device: item.deviceName, // For sorting
	}));

	// Pagination
	const pages = Math.ceil(tableData.length / rowsPerPage);
	const paginatedData = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return tableData.slice(start, end);
	}, [tableData, page, rowsPerPage]);

	// Determine disabled keys based on role and current status/payment filter
	const disabledKeys = useMemo(() => {
		if (!enableMultiSelect) return new Set<string>();

		// For partners authorizing payment: only completed+unpaid claims are selectable
		if (
			role === "samsung-partners" &&
			status === "completed" &&
			paymentFilter === "unpaid"
		) {
			return new Set(
				data
					.filter(
						(item) =>
							item.status !== "approved" || // Must be completed (approved status in API)
							item.paymentStatus === "paid" || // Not already paid
							item.authorizedAt !== undefined // Not already authorized
					)
					.map((item) => item.id)
			);
		}

		// For admin marking as paid: only authorized+unpaid claims are selectable
		if (
			role === "samsung-sentinel" &&
			status === "completed" &&
			paymentFilter === "unpaid"
		) {
			return new Set(
				data
					.filter(
						(item) =>
							!item.authorizedAt || // Must be authorized
							item.paymentStatus === "paid" // Not already paid
					)
					.map((item) => item.id)
			);
		}

		// Default: disable non-approved or already paid claims
		return new Set(
			data
				.filter(
					(item) => item.status !== "approved" || item.paymentStatus === "paid"
				)
				.map((item) => item.id)
		);
	}, [data, enableMultiSelect, role, status, paymentFilter]);

	// Calculate total amount for selected claims
	const selectedTotalAmount = useMemo(() => {
		const selectedIds = Array.from(selectedKeys) as string[];
		return data
			.filter((item) => selectedIds.includes(item.id))
			.reduce((sum, item) => sum + item.repairCost, 0);
	}, [selectedKeys, data]);

	// Export function with proper column mapping
	const handleExport = (exportData: any[]) => {
		try {
			// Map data to CSV format with role-specific columns
			const exportHeaders = [
				"Claim ID",
				"Customer Name",
				"IMEI",
				"Device Name",
				"Brand",
				"Model",
				"Fault Type",
				"Repair Cost",
				"Status",
				"Created Date",
			];

			// Add role-specific columns
			if (role === "samsung-partners" || role === "samsung-sentinel") {
				exportHeaders.splice(2, 0, "Service Center");
			}
			if (role === "samsung-sentinel") {
				exportHeaders.splice(3, 0, "Engineer");
			}

			// Add payment columns if visible
			if (showPaymentColumns) {
				exportHeaders.push("Payment Status", "Completed Date");
				if (role === "samsung-sentinel") {
					exportHeaders.push("Bank Name", "Account Number", "Account Name");
				}
			}

			// Map data rows
			const csvRows = exportData.map((item) => {
				const row: any[] = [
					item.claimId,
					item.customerName,
					item.imei,
					item.deviceName,
					item.brand,
					item.model,
					item.faultType,
					item.repairCost,
					item.status,
					formatDate(item.createdAt),
				];

				// Add role-specific data
				if (role === "samsung-partners" || role === "samsung-sentinel") {
					row.splice(2, 0, item.serviceCenterName || "N/A");
				}
				if (role === "samsung-sentinel") {
					row.splice(3, 0, item.engineerName || "N/A");
				}

				// Add payment data
				if (showPaymentColumns) {
					row.push(
						item.paymentStatus || "N/A",
						item.completedAt ? formatDate(item.completedAt) : "N/A"
					);

					// Add bank details for samsung-sentinel
					if (role === "samsung-sentinel" && item.serviceCenterId) {
						const serviceCenter = testData.serviceCenters.find(
							(sc: any) => sc.id === item.serviceCenterId
						);
						if (serviceCenter?.bankDetails) {
							row.push(
								serviceCenter.bankDetails.bankName,
								serviceCenter.bankDetails.accountNumber,
								serviceCenter.bankDetails.accountName
							);
						} else {
							row.push("N/A", "N/A", "N/A");
						}
					}
				}

				return row;
			});

			// Create CSV content
			const csvContent = [
				exportHeaders.join(","),
				...csvRows.map((row) =>
					row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
				),
			].join("\n");

			// Create and download file
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`claims_export_${role}_${new Date().toISOString().split("T")[0]}.csv`
			);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			showToast({
				message: `Exported ${exportData.length} claims successfully`,
				type: "success",
			});
		} catch (error) {
			console.error("Export error:", error);
			showToast({
				message: "Failed to export data",
				type: "error",
			});
		}
	};

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">Error loading data: {error.message}</p>
			</div>
		);
	}

	// Handle selection change
	const handleSelectionChange = (keys: any) => {
		if (keys === "all") {
			// Select all non-disabled items
			const allKeys = new Set(
				data.filter((item) => !disabledKeys.has(item.id)).map((item) => item.id)
			);
			setSelectedKeys(allKeys);
		} else {
			setSelectedKeys(keys);
		}
	};

	// Handle bulk actions
	const handleBulkPaymentClick = () => {
		if (selectedKeys.size > 0 && onBulkPayment) {
			const selectedIds = Array.from(selectedKeys) as string[];
			// Generate a transaction reference (in real implementation, this would come from a modal)
			const transactionRef = `TXN-${Date.now()}`;
			onBulkPayment(selectedIds, transactionRef);
			setSelectedKeys(new Set()); // Clear selection
		}
	};

	const handleBulkApproveClick = () => {
		if (selectedKeys.size > 0 && onBulkApprove) {
			const selectedIds = Array.from(selectedKeys) as string[];
			onBulkApprove(selectedIds);
			setSelectedKeys(new Set());
		}
	};

	const handleBulkRejectClick = () => {
		if (selectedKeys.size > 0 && onBulkReject) {
			// Open bulk rejection modal to collect reason
			setBulkRejectionReason("");
			onBulkRejectModalOpen();
		}
	};

	const handleConfirmBulkReject = () => {
		if (!bulkRejectionReason.trim()) {
			showToast({
				type: "error",
				message: "Please provide a rejection reason",
			});
			return;
		}

		if (selectedKeys.size > 0 && onBulkReject) {
			const selectedIds = Array.from(selectedKeys) as string[];
			onBulkReject(selectedIds, bulkRejectionReason);
			onBulkRejectModalClose();
			setSelectedKeys(new Set());
			setBulkRejectionReason("");
		}
	};

	const handleBulkAuthorizeClick = () => {
		if (selectedKeys.size > 0 && onBulkAuthorizePayment) {
			const selectedIds = Array.from(selectedKeys) as string[];
			onBulkAuthorizePayment(selectedIds);
			setSelectedKeys(new Set());
		}
	};

	// Determine what bulk actions to show
	const getBulkActions = () => {
		// Samsung Sentinel: Execute bulk payment for completed/unpaid
		if (
			role === "samsung-sentinel" &&
			status === "completed" &&
			paymentFilter === "unpaid"
		) {
			return (
				<Button
					size="sm"
					color="success"
					startContent={<DollarSign className="h-4 w-4" />}
					onPress={handleBulkPaymentClick}
				>
					Execute Bulk Payment
				</Button>
			);
		}

		// Samsung Partners: Bulk approve/reject for pending
		if (role === "samsung-partners" && status === "pending") {
			return (
				<>
					<Button
						size="sm"
						color="success"
						startContent={<CheckCircle className="h-4 w-4" />}
						onPress={handleBulkApproveClick}
					>
						Bulk Approve
					</Button>
					<Button
						size="sm"
						color="danger"
						startContent={<XCircle className="h-4 w-4" />}
						onPress={handleBulkRejectClick}
					>
						Bulk Reject
					</Button>
				</>
			);
		}

		// Samsung Partners: Bulk authorize payment for completed/unpaid
		if (
			role === "samsung-partners" &&
			status === "completed" &&
			paymentFilter === "unpaid"
		) {
			return (
				<Button
					size="sm"
					color="primary"
					startContent={<DollarSign className="h-4 w-4" />}
					onPress={handleBulkAuthorizeClick}
				>
					Bulk Authorize Payment
				</Button>
			);
		}

		return null;
	};

	return (
		<div className="space-y-4">
			{/* Bulk Action Bar */}
			{enableMultiSelect && selectedKeys.size > 0 && (
				<div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="text-sm font-medium text-primary-700 dark:text-primary-300">
							{selectedKeys.size} claim{selectedKeys.size !== 1 ? "s" : ""}{" "}
							selected
						</div>
						{(status === "completed" || paymentFilter === "unpaid") && (
							<div className="text-sm text-primary-600 dark:text-primary-400">
								Total:{" "}
								<span className="font-bold">
									₦{selectedTotalAmount.toLocaleString()}
								</span>
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="flat"
							onPress={() => setSelectedKeys(new Set())}
						>
							Clear Selection
						</Button>
						{getBulkActions()}
					</div>
				</div>
			)}

			{/* Table */}
			<GenericTable
				data={paginatedData}
				allCount={tableData.length}
				exportData={tableData}
				columns={columns}
				renderCell={
					renderCell as (row: unknown, columnKey: string) => React.ReactNode
				}
				isLoading={isLoading || false}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				sortDescriptor={sortDescriptor}
				onSortChange={setSortDescriptor as any}
				page={page}
				pages={pages}
				onPageChange={setPage}
				exportFn={handleExport}
				hasNoRecords={tableData.length === 0}
				searchPlaceholder="Search by claim ID, customer name, IMEI, device, or fault type..."
				selectionMode={enableMultiSelect ? "multiple" : "none"}
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				disabledKeys={disabledKeys}
				onDateFilterChange={onDateFilterChange}
				initialStartDate={initialStartDate}
				initialEndDate={initialEndDate}
				defaultDateRange={defaultDateRange}
				showRowsPerPageSelector={true}
				onRowsPerPageChange={(newRowsPerPage) => {
					setRowsPerPage(newRowsPerPage);
					setPage(1);
				}}
			/>

			{/* Rejection Confirmation Modal */}
			<Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose} size="md">
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Reject Claim</h3>
					</ModalHeader>
					<ModalBody>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Please provide a reason for rejecting this claim. This information
							will be shared with the service center.
						</p>
						<Textarea
							label="Rejection Reason *"
							placeholder="Enter detailed reason for rejection..."
							value={rejectionReason}
							onValueChange={setRejectionReason}
							rows={4}
							isRequired
							variant="bordered"
							classNames={{
								input: "min-h-[100px]",
							}}
						/>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
							* Rejection reason is required
						</p>
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="light"
							onPress={() => {
								onRejectModalClose();
								setRejectionReason("");
								setRejectingClaimId(null);
							}}
						>
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={handleConfirmReject}
							isDisabled={!rejectionReason.trim()}
						>
							Confirm Rejection
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Bulk Rejection Confirmation Modal */}
			<Modal
				isOpen={isBulkRejectModalOpen}
				onClose={onBulkRejectModalClose}
				size="md"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Reject Multiple Claims</h3>
					</ModalHeader>
					<ModalBody>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
							You are about to reject{" "}
							<span className="font-bold text-danger">{selectedKeys.size}</span>{" "}
							claim{selectedKeys.size !== 1 ? "s" : ""}.
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Please provide a reason for rejecting these claims. This
							information will be shared with the service centers.
						</p>
						<Textarea
							label="Rejection Reason *"
							placeholder="Enter detailed reason for bulk rejection..."
							value={bulkRejectionReason}
							onValueChange={setBulkRejectionReason}
							rows={4}
							isRequired
							variant="bordered"
							classNames={{
								input: "min-h-[100px]",
							}}
						/>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
							* Rejection reason is required
						</p>
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="light"
							onPress={() => {
								onBulkRejectModalClose();
								setBulkRejectionReason("");
							}}
						>
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={handleConfirmBulkReject}
							isDisabled={!bulkRejectionReason.trim()}
						>
							Reject {selectedKeys.size} Claim
							{selectedKeys.size !== 1 ? "s" : ""}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ClaimsRepairsTable;
