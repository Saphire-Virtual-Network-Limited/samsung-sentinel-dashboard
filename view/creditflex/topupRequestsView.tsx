"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAuth } from "@/lib/globalContext";
import {
	SortDescriptor,
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
	useDisclosure,
} from "@heroui/react";
import {
	MoreHorizontal,
	Eye,
	CheckCircle,
	XCircle,
	Clock,
	DollarSign,
	FileText,
	User,
} from "lucide-react";
import { showToast, capitalize, getColor } from "@/lib";
import InfoCard from "@/components/reususables/custom-ui/InfoCard";
import InfoField from "@/components/reususables/custom-ui/InfoField";

// Mock API function - replace with real API when backend is ready
const getTopupRequests = async (filters: any = {}) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	// Mock data that represents the structure expected from real API
	const mockRequests = [
		{
			id: "req_001",
			requestId: "TOP-001",
			loanId: "CF-000301",
			customerId: "cust_001",
			customer: {
				firstName: "Jennifer",
				lastName: "Lee",
				fullName: "Jennifer Lee",
				emailAddress: "jennifer.lee@example.com",
				mobileNumber: "08123456789",
			},
			originalLoan: {
				id: "CF-000301",
				loanAmount: 50000,
				currentBalance: 25000,
				repaidAmount: 25000,
				status: "active",
				loanProduct: "Quick Cash",
			},
			requestedAmount: 15000,
			currentBalance: 25000,
			maxEligibleAmount: 75000,
			requestDate: "2024-12-18T10:30:00Z",
			status: "pending",
			priority: "medium",
			reason: "Business expansion",
			documents: ["payslip.pdf", "business_plan.pdf"],
			reviewer: null,
			reviewDate: null,
			approvedAmount: null,
			rejectionReason: null,
			disbursementDate: null,
			createdAt: "2024-12-18T10:30:00Z",
			updatedAt: "2024-12-18T10:30:00Z",
		},
		{
			id: "req_002",
			requestId: "TOP-002",
			loanId: "CF-000302",
			customerId: "cust_002",
			customer: {
				firstName: "Kevin",
				lastName: "Martinez",
				fullName: "Kevin Martinez",
				emailAddress: "kevin.martinez@example.com",
				mobileNumber: "08134567890",
			},
			originalLoan: {
				id: "CF-000302",
				loanAmount: 75000,
				currentBalance: 40000,
				repaidAmount: 35000,
				status: "active",
				loanProduct: "Salary Advance",
			},
			requestedAmount: 25000,
			currentBalance: 40000,
			maxEligibleAmount: 100000,
			requestDate: "2024-12-17T14:15:00Z",
			status: "under_review",
			priority: "high",
			reason: "Medical emergency",
			documents: ["medical_report.pdf", "salary_certificate.pdf"],
			reviewer: "admin_001",
			reviewDate: "2024-12-17T16:00:00Z",
			approvedAmount: null,
			rejectionReason: null,
			disbursementDate: null,
			createdAt: "2024-12-17T14:15:00Z",
			updatedAt: "2024-12-17T16:00:00Z",
		},
		{
			id: "req_003",
			requestId: "TOP-003",
			loanId: "CF-000303",
			customerId: "cust_003",
			customer: {
				firstName: "Amanda",
				lastName: "Foster",
				fullName: "Amanda Foster",
				emailAddress: "amanda.foster@example.com",
				mobileNumber: "08145678901",
			},
			originalLoan: {
				id: "CF-000303",
				loanAmount: 40000,
				currentBalance: 18000,
				repaidAmount: 22000,
				status: "active",
				loanProduct: "Personal Loan",
			},
			requestedAmount: 12000,
			currentBalance: 18000,
			maxEligibleAmount: 60000,
			requestDate: "2024-12-16T09:45:00Z",
			status: "approved",
			priority: "medium",
			reason: "Home improvement",
			documents: ["id_card.pdf", "bank_statement.pdf"],
			reviewer: "admin_002",
			reviewDate: "2024-12-16T15:30:00Z",
			approvedAmount: 12000,
			rejectionReason: null,
			disbursementDate: null,
			createdAt: "2024-12-16T09:45:00Z",
			updatedAt: "2024-12-16T15:30:00Z",
		},
		{
			id: "req_004",
			requestId: "TOP-004",
			loanId: "CF-000304",
			customerId: "cust_004",
			customer: {
				firstName: "Marcus",
				lastName: "Williams",
				fullName: "Marcus Williams",
				emailAddress: "marcus.williams@example.com",
				mobileNumber: "08156789012",
			},
			originalLoan: {
				id: "CF-000304",
				loanAmount: 100000,
				currentBalance: 55000,
				repaidAmount: 45000,
				status: "active",
				loanProduct: "Business Loan",
			},
			requestedAmount: 35000,
			currentBalance: 55000,
			maxEligibleAmount: 80000,
			requestDate: "2024-12-15T11:20:00Z",
			status: "rejected",
			priority: "low",
			reason: "Investment opportunity",
			documents: ["investment_proposal.pdf"],
			reviewer: "admin_001",
			reviewDate: "2024-12-15T17:45:00Z",
			approvedAmount: null,
			rejectionReason: "Insufficient repayment history",
			disbursementDate: null,
			createdAt: "2024-12-15T11:20:00Z",
			updatedAt: "2024-12-15T17:45:00Z",
		},
		{
			id: "req_005",
			requestId: "TOP-005",
			loanId: "CF-000305",
			customerId: "cust_005",
			customer: {
				firstName: "Rachel",
				lastName: "Green",
				fullName: "Rachel Green",
				emailAddress: "rachel.green@example.com",
				mobileNumber: "08167890123",
			},
			originalLoan: {
				id: "CF-000305",
				loanAmount: 60000,
				currentBalance: 22000,
				repaidAmount: 38000,
				status: "active",
				loanProduct: "Emergency Loan",
			},
			requestedAmount: 18000,
			currentBalance: 22000,
			maxEligibleAmount: 70000,
			requestDate: "2024-12-14T16:30:00Z",
			status: "disbursed",
			priority: "high",
			reason: "Education fees",
			documents: ["school_fees_receipt.pdf", "admission_letter.pdf"],
			reviewer: "admin_002",
			reviewDate: "2024-12-14T18:00:00Z",
			approvedAmount: 18000,
			rejectionReason: null,
			disbursementDate: "2024-12-15T10:00:00Z",
			createdAt: "2024-12-14T16:30:00Z",
			updatedAt: "2024-12-15T10:00:00Z",
		},
	];

	// Filter by status if provided
	let filteredRequests = mockRequests;
	if (filters.status && filters.status !== "all") {
		filteredRequests = mockRequests.filter(
			(req) => req.status === filters.status
		);
	}

	// Filter by search if provided
	if (filters.search) {
		const searchTerm = filters.search.toLowerCase();
		filteredRequests = filteredRequests.filter(
			(req) =>
				req.requestId.toLowerCase().includes(searchTerm) ||
				req.customer.fullName.toLowerCase().includes(searchTerm) ||
				req.originalLoan.id.toLowerCase().includes(searchTerm) ||
				req.reason.toLowerCase().includes(searchTerm)
		);
	}

	// Calculate metrics
	const totalRequests = mockRequests.length;
	const pendingRequests = mockRequests.filter(
		(r) => r.status === "pending"
	).length;
	const underReviewRequests = mockRequests.filter(
		(r) => r.status === "under_review"
	).length;
	const approvedRequests = mockRequests.filter(
		(r) => r.status === "approved"
	).length;
	const disbursedRequests = mockRequests.filter(
		(r) => r.status === "disbursed"
	).length;
	const totalRequestedValue = mockRequests.reduce(
		(sum, r) => sum + r.requestedAmount,
		0
	);
	const totalApprovedValue = mockRequests
		.filter((r) => r.status === "approved" || r.status === "disbursed")
		.reduce((sum, r) => sum + (r.approvedAmount || r.requestedAmount), 0);

	return {
		data: filteredRequests,
		pagination: {
			total: filteredRequests.length,
			page: filters.page || 1,
			limit: filters.limit || 10,
		},
		metrics: {
			total: totalRequests,
			pending: pendingRequests,
			underReview: underReviewRequests,
			approved: approvedRequests,
			disbursed: disbursedRequests,
			totalRequestedValue,
			totalApprovedValue,
		},
	};
};

// Status color mapping for topup requests
const statusColorMap: Record<string, any> = {
	pending: "warning",
	under_review: "primary",
	approved: "success",
	rejected: "danger",
	disbursed: "secondary",
	default: "default",
};

// Priority color mapping
const priorityColorMap: Record<string, any> = {
	high: "danger",
	medium: "warning",
	low: "default",
};

const CreditflexTopupRequestsView = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const { userResponse } = useAuth();

	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<any>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();

	// Determine the user's access path based on their role
	const userAccessPath = useMemo(() => {
		const userRole = userResponse?.data?.role;
		switch (userRole) {
			case "SUPER_ADMIN":
				return "/access/admin";
			case "ADMIN":
				return "/access/sub-admin";
			case "DEVELOPER":
				return "/access/dev";
			case "FINANCE":
				return "/access/finance";
			case "AUDIT":
				return "/access/audit";
			case "VERIFICATION":
			case "VERIFICATION_OFFICER":
				return "/access/verify";
			case "SUPPORT":
				return "/access/support";
			case "HUMAN_RESOURCE":
				return "/access/hr";
			case "INVENTORY_MANAGER":
				return "/access/inventory";
			case "SALES":
				return "/access/sales";
			case "COLLECTION_ADMIN":
				return "/access/collection-admin";
			case "COLLECTION_OFFICER":
				return "/access/collection-officer";
			case "SCAN_PARTNER":
				return "/access/scan-partner";
			default:
				return "/access/admin"; // fallback
		}
	}, [userResponse?.data?.role]);

	const initialFilters = useMemo(() => {
		const search = searchParams.get("search") || undefined;
		const status = searchParams.get("status") || "all";
		const priority = searchParams.get("priority") || undefined;
		const page = Number(searchParams.get("page") || 1);
		const limit = Number(searchParams.get("limit") || 10);
		return {
			search,
			status: status === "all" ? undefined : status,
			priority,
			page,
			limit,
		};
	}, [searchParams]);

	const {
		data: requestsRes,
		error,
		isLoading,
	} = useSWR(
		["creditflex", "topup-requests", initialFilters],
		() => getTopupRequests(initialFilters),
		{
			revalidateOnFocus: false,
			dedupingInterval: 60000,
			shouldRetryOnError: true,
		}
	);

	const [searchValue, setSearchValue] = useState(initialFilters.search || "");

	// Transform and prepare requests data
	const requestsData = useMemo(() => {
		if (!requestsRes?.data) {
			setHasNoRecords(!isLoading && !error);
			return [];
		}

		setHasNoRecords(false);
		return requestsRes.data;
	}, [requestsRes, isLoading, error]);

	const metrics = requestsRes?.metrics || {
		total: 0,
		pending: 0,
		underReview: 0,
		approved: 0,
		disbursed: 0,
		totalRequestedValue: 0,
		totalApprovedValue: 0,
	};

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	const formatCurrency = (amount: number) => {
		return `₦${Number(amount).toLocaleString("en-GB")}`;
	};

	const rowsPerPage = initialFilters.limit || 10;
	const page = initialFilters.page || 1;
	const total = requestsRes?.pagination?.total || requestsData.length;
	const pages = Math.ceil(total / rowsPerPage) || 1;

	// Sort descriptor expected by GenericTable
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "requestDate",
		direction: "descending",
	});

	// Status filter set for GenericTable
	const initialStatusSet = useMemo(() => {
		const s = searchParams.get("status");
		if (!s || s === "all") return new Set<string>();
		return new Set([s]);
	}, [searchParams]);
	const [statusSet, setStatusSet] = useState<Set<string>>(initialStatusSet);

	// Filter and sort data locally
	const filtered = useMemo(() => {
		if (!Array.isArray(requestsData)) return [];

		let list = [...requestsData];

		// Local status filtering
		if (statusSet.size > 0) {
			const selectedStatuses = Array.from(statusSet).map((s) =>
				s.toLowerCase()
			);
			list = list.filter((request: any) =>
				selectedStatuses.includes(request.status?.toLowerCase() || "")
			);
		}

		// Local text filtering
		if (searchValue) {
			const searchTerm = searchValue.toLowerCase();
			list = list.filter(
				(request: any) =>
					request.requestId?.toLowerCase().includes(searchTerm) ||
					request.customer?.fullName?.toLowerCase().includes(searchTerm) ||
					request.originalLoan?.id?.toLowerCase().includes(searchTerm) ||
					request.reason?.toLowerCase().includes(searchTerm)
			);
		}

		return list;
	}, [requestsData, searchValue, statusSet]);

	const paged = useMemo(() => {
		if (requestsRes?.pagination) {
			return filtered;
		}

		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page, requestsRes?.pagination, rowsPerPage]);

	const sorted = useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = (a as any)[sortDescriptor.column as string];
			const bVal = (b as any)[sortDescriptor.column as string];

			let cmp = 0;
			if (typeof aVal === "string" && typeof bVal === "string") {
				cmp = aVal.localeCompare(bVal);
			} else if (typeof aVal === "number" && typeof bVal === "number") {
				cmp = aVal - bVal;
			} else if (aVal instanceof Date && bVal instanceof Date) {
				cmp = aVal.getTime() - bVal.getTime();
			} else {
				cmp = String(aVal).localeCompare(String(bVal));
			}

			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	const exportFn = async (data: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Topup Requests");

		ws.columns = [
			{ header: "S/N", key: "sn", width: 6 },
			{ header: "Request ID", key: "requestId", width: 15 },
			{ header: "Loan ID", key: "loanId", width: 15 },
			{ header: "Customer", key: "customerName", width: 25 },
			{ header: "Current Balance", key: "currentBalance", width: 18 },
			{ header: "Requested Amount", key: "requestedAmount", width: 18 },
			{ header: "Max Eligible", key: "maxEligible", width: 18 },
			{ header: "Priority", key: "priority", width: 12 },
			{ header: "Status", key: "status", width: 15 },
			{ header: "Reason", key: "reason", width: 30 },
			{ header: "Request Date", key: "requestDate", width: 18 },
		];

		data.forEach((request, idx) => {
			ws.addRow({
				sn: idx + 1,
				requestId: request.requestId,
				loanId: request.originalLoan?.id || request.loanId,
				customerName: request.customer?.fullName || "N/A",
				currentBalance: request.currentBalance || 0,
				requestedAmount: request.requestedAmount || 0,
				maxEligible: request.maxEligibleAmount || 0,
				priority: request.priority || "medium",
				status: request.status || "pending",
				reason: request.reason || "N/A",
				requestDate: formatDate(request.requestDate),
			});
		});

		// Format currency columns
		["currentBalance", "requestedAmount", "maxEligible"].forEach(
			(c) => (ws.getColumn(c).numFmt = "#,##0")
		);

		// Format header row
		ws.getRow(1).font = { bold: true };
		ws.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE6E6E6" },
		};

		const buf = await wb.xlsx.writeBuffer();
		const now = new Date();
		const formattedDate = now.toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
		const formattedTime = now.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
		const fileName = `Creditflex_Topup_Requests_${formattedDate.replace(
			/ /g,
			"_"
		)}_${formattedTime.replace(/:/g, "-")}.xlsx`;
		saveAs(new Blob([buf]), fileName);
	};

	const columns = useMemo(
		() => [
			{ uid: "serialNumber", name: "S/N" },
			{ uid: "requestDetails", name: "Request Details" },
			{ uid: "customer", name: "Customer" },
			{ uid: "loanInfo", name: "Loan Info" },
			{ uid: "amounts", name: "Amounts" },
			{ uid: "priority", name: "Priority" },
			{ uid: "status", name: "Status" },
			{ uid: "requestDate", name: "Date" },
			{ uid: "actions", name: "Actions" },
		],
		[]
	);

	const renderCell = (row: any, key: string) => {
		if (key === "serialNumber") {
			const index = sorted.indexOf(row);
			const serialNumber = (page - 1) * rowsPerPage + index + 1;
			return <span className="text-sm">{serialNumber}</span>;
		}

		if (key === "requestDetails") {
			return (
				<div className="flex flex-col gap-1">
					<span className="font-medium text-blue-600">{row.requestId}</span>
					<span className="text-xs text-gray-500">
						{row.reason || "No reason provided"}
					</span>
					{row.documents && row.documents.length > 0 && (
						<div className="flex items-center gap-1">
							<FileText className="w-3 h-3 text-gray-400" />
							<span className="text-xs text-gray-500">
								{row.documents.length} doc{row.documents.length > 1 ? "s" : ""}
							</span>
						</div>
					)}
				</div>
			);
		}

		if (key === "customer") {
			return (
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
						<User className="w-4 h-4 text-blue-600" />
					</div>
					<div>
						<Link
							href={`${userAccessPath}/creditflex/customers/${row.customerId}`}
							className="font-medium text-blue-600 hover:text-blue-800"
						>
							{row.customer?.fullName || "Unknown Customer"}
						</Link>
						<div className="text-xs text-gray-500">
							{row.customer?.emailAddress || "No email"}
						</div>
					</div>
				</div>
			);
		}

		if (key === "loanInfo") {
			return (
				<div className="flex flex-col gap-1">
					<Link
						href={`${userAccessPath}/creditflex/loans/${row.originalLoan?.id}`}
						className="font-medium text-blue-600 hover:underline"
					>
						{row.originalLoan?.id || row.loanId}
					</Link>
					<span className="text-xs text-gray-500">
						{row.originalLoan?.loanProduct || "Unknown Product"}
					</span>
					<span className="text-xs text-gray-500">
						Balance: {formatCurrency(row.currentBalance || 0)}
					</span>
				</div>
			);
		}

		if (key === "amounts") {
			return (
				<div className="flex flex-col gap-1">
					<div className="text-sm">
						<span className="text-gray-500">Requested:</span>
						<span className="font-medium ml-1">
							{formatCurrency(row.requestedAmount)}
						</span>
					</div>
					<div className="text-xs text-gray-500">
						Max: {formatCurrency(row.maxEligibleAmount || 0)}
					</div>
					{row.approvedAmount && (
						<div className="text-xs text-green-600">
							Approved: {formatCurrency(row.approvedAmount)}
						</div>
					)}
				</div>
			);
		}

		if (key === "priority") {
			return (
				<Chip
					className="capitalize"
					color={priorityColorMap[row.priority || "medium"]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.priority || "medium")}
				</Chip>
			);
		}

		if (key === "status") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.status || "pending"]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.status?.replace("_", " ") || "pending")}
				</Chip>
			);
		}

		if (key === "requestDate") {
			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm">{formatDate(row.requestDate)}</span>
					{row.reviewDate && (
						<span className="text-xs text-gray-500">
							Reviewed: {formatDate(row.reviewDate)}
						</span>
					)}
				</div>
			);
		}

		if (key === "actions") {
			const dropdownItems = [
				<DropdownItem
					key="view"
					color="primary"
					startContent={<Eye className="w-4 h-4" />}
					onPress={() => {
						setSelectedRequest(row);
						onOpen();
					}}
				>
					View Details
				</DropdownItem>,
			];

			if (row.status === "pending") {
				dropdownItems.push(
					<DropdownItem
						key="approve"
						color="success"
						startContent={<CheckCircle className="w-4 h-4" />}
						onPress={() => {
							showToast({
								type: "success",
								message: `Request ${row.requestId} approved successfully`,
							});
						}}
					>
						Approve
					</DropdownItem>,
					<DropdownItem
						key="reject"
						color="danger"
						startContent={<XCircle className="w-4 h-4" />}
						onPress={() => {
							showToast({
								type: "error",
								message: `Request ${row.requestId} rejected`,
							});
						}}
					>
						Reject
					</DropdownItem>
				);
			}

			if (row.status === "approved") {
				dropdownItems.push(
					<DropdownItem
						key="disburse"
						color="secondary"
						startContent={<DollarSign className="w-4 h-4" />}
						onPress={() => {
							showToast({
								type: "success",
								message: `Request ${row.requestId} disbursed successfully`,
							});
						}}
					>
						Disburse
					</DropdownItem>
				);
			}

			return (
				<Dropdown>
					<DropdownTrigger>
						<Button variant="light" isIconOnly size="sm">
							<MoreHorizontal className="w-4 h-4" />
						</Button>
					</DropdownTrigger>
					<DropdownMenu>{dropdownItems}</DropdownMenu>
				</Dropdown>
			);
		}

		return <span>{(row as any)[key] ?? "-"}</span>;
	};

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					Topup Requests
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Manage loan topup and enhancement requests from customers
				</p>
			</div>

			{/* Enhanced Metrics Cards with Real Data */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Pending Requests
							</h3>
							<p className="text-2xl font-bold text-blue-600">
								{metrics.pending}
							</p>
						</div>
						<Clock className="w-8 h-8 text-blue-600" />
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Under Review
							</h3>
							<p className="text-2xl font-bold text-yellow-600">
								{metrics.underReview}
							</p>
						</div>
						<Eye className="w-8 h-8 text-yellow-600" />
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Approved/Disbursed
							</h3>
							<p className="text-2xl font-bold text-green-600">
								{metrics.approved + metrics.disbursed}
							</p>
						</div>
						<CheckCircle className="w-8 h-8 text-green-600" />
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Total Requested
							</h3>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(metrics.totalRequestedValue)}
							</p>
						</div>
						<DollarSign className="w-8 h-8 text-purple-600" />
					</div>
				</div>
			</div>

			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable
					columns={columns}
					data={sorted}
					allCount={total || filtered.length}
					exportData={filtered}
					isLoading={isLoading}
					filterValue={searchValue}
					onFilterChange={(v: string) => {
						setSearchValue(v);
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						if (v) params.set("search", v);
						else params.delete("search");
						params.set("page", "1");
						router.push(`${pathname}?${params.toString()}`);
					}}
					statusOptions={[
						{ name: "All", uid: "all" },
						{ name: "Pending", uid: "pending" },
						{ name: "Under Review", uid: "under_review" },
						{ name: "Approved", uid: "approved" },
						{ name: "Rejected", uid: "rejected" },
						{ name: "Disbursed", uid: "disbursed" },
					]}
					statusFilter={statusSet}
					onStatusChange={(sel: Set<string>) => {
						setStatusSet(sel);
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						if (!sel || sel.size === 0) {
							params.delete("status");
						} else {
							const first = Array.from(sel)[0];
							if (first && first !== "all") params.set("status", first);
							else params.delete("status");
						}
						params.set("page", "1");
						router.push(`${pathname}?${params.toString()}`);
					}}
					statusColorMap={statusColorMap}
					showStatus={true}
					sortDescriptor={sortDescriptor}
					onSortChange={setSortDescriptor}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={hasNoRecords}
					page={page}
					pages={pages}
					onPageChange={(p: number) => {
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						params.set("page", String(p));
						router.push(`${pathname}?${params.toString()}`);
					}}
					selectionMode="single"
				/>
			)}

			{/* Request Details Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="2xl">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								Topup Request Details
								{selectedRequest && (
									<span className="text-sm text-gray-500">
										{selectedRequest.requestId}
									</span>
								)}
							</ModalHeader>
							<ModalBody>
								{selectedRequest && (
									<div className="space-y-6">
										{/* Customer Info */}
										<InfoCard title="Customer Information">
											<div className="grid grid-cols-2 gap-4">
												<InfoField
													label="Name"
													value={selectedRequest.customer?.fullName}
												/>
												<InfoField
													label="Email"
													value={selectedRequest.customer?.emailAddress}
													copyable
												/>
											</div>
										</InfoCard>

										{/* Loan Info */}
										<InfoCard title="Original Loan Details">
											<div className="grid grid-cols-2 gap-4">
												<InfoField
													label="Loan ID"
													value={selectedRequest.originalLoan?.id}
													copyable
												/>
												<InfoField
													label="Product"
													value={selectedRequest.originalLoan?.loanProduct}
												/>
												<InfoField
													label="Original Amount"
													value={formatCurrency(
														selectedRequest.originalLoan?.loanAmount || 0
													)}
												/>
												<InfoField
													label="Current Balance"
													value={formatCurrency(selectedRequest.currentBalance)}
												/>
											</div>
										</InfoCard>

										{/* Request Details */}
										<InfoCard title="Request Details">
											<div className="grid grid-cols-2 gap-4">
												<InfoField
													label="Requested Amount"
													value={formatCurrency(
														selectedRequest.requestedAmount
													)}
												/>
												<InfoField
													label="Max Eligible"
													value={formatCurrency(
														selectedRequest.maxEligibleAmount
													)}
												/>
												<div>
													<span className="text-sm text-gray-500">
														Priority:
													</span>
													<div className="mt-1">
														<Chip
															color={priorityColorMap[selectedRequest.priority]}
															size="sm"
														>
															{capitalize(selectedRequest.priority)}
														</Chip>
													</div>
												</div>
												<div>
													<span className="text-sm text-gray-500">Status:</span>
													<div className="mt-1">
														<Chip
															color={statusColorMap[selectedRequest.status]}
															size="sm"
														>
															{capitalize(
																selectedRequest.status?.replace("_", " ")
															)}
														</Chip>
													</div>
												</div>
											</div>
											<div className="mt-4">
												<InfoField
													label="Reason"
													value={selectedRequest.reason || "No reason provided"}
												/>
											</div>
										</InfoCard>

										{/* Documents */}
										{selectedRequest.documents &&
											selectedRequest.documents.length > 0 && (
												<InfoCard title="Attached Documents">
													<div className="space-y-2">
														{selectedRequest.documents.map(
															(doc: string, idx: number) => (
																<div
																	key={idx}
																	className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
																>
																	<FileText className="w-4 h-4 text-gray-500" />
																	<span className="text-sm">{doc}</span>
																</div>
															)
														)}
													</div>
												</InfoCard>
											)}

										{/* Review Information */}
										{selectedRequest.reviewer && (
											<InfoCard title="Review Information">
												<div className="grid grid-cols-2 gap-4">
													<InfoField
														label="Reviewed By"
														value={selectedRequest.reviewer}
													/>
													<InfoField
														label="Review Date"
														value={formatDate(selectedRequest.reviewDate)}
													/>
													{selectedRequest.approvedAmount && (
														<InfoField
															label="Approved Amount"
															value={formatCurrency(
																selectedRequest.approvedAmount
															)}
															className="text-green-600 font-medium"
														/>
													)}
													{selectedRequest.rejectionReason && (
														<div className="col-span-2">
															<InfoField
																label="Rejection Reason"
																value={selectedRequest.rejectionReason}
																className="text-red-600 font-medium"
															/>
														</div>
													)}
												</div>
											</InfoCard>
										)}
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									Close
								</Button>
								{selectedRequest?.status === "pending" && (
									<>
										<Button
											color="danger"
											onPress={() => {
												showToast({
													type: "error",
													message: `Request ${selectedRequest.requestId} rejected`,
												});
												onClose();
											}}
										>
											Reject
										</Button>
										<Button
											color="success"
											onPress={() => {
												showToast({
													type: "success",
													message: `Request ${selectedRequest.requestId} approved successfully`,
												});
												onClose();
											}}
										>
											Approve
										</Button>
									</>
								)}
								{selectedRequest?.status === "approved" && (
									<Button
										color="secondary"
										onPress={() => {
											showToast({
												type: "success",
												message: `Request ${selectedRequest.requestId} disbursed successfully`,
											});
											onClose();
										}}
									>
										Disburse
									</Button>
								)}
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default CreditflexTopupRequestsView;
