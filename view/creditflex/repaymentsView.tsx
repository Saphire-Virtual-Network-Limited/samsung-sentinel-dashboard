"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAdminRepayments } from "@/hooks/creditflex";
import Link from "next/link";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	SortDescriptor,
	Chip,
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	useDisclosure,
} from "@heroui/react";
import {
	MoreHorizontal,
	Eye,
	Link as LinkIcon,
	CreditCard,
} from "lucide-react";
import RepaymentDetailsModal from "@/components/modals/RepaymentDetailsModal";
import { getCDFRepayments, getCDFAllRepayments } from "@/lib/api";
import { showToast, capitalize, getColor } from "@/lib";
import { mutate } from "swr";

// Status color mapping for repayments
const statusColorMap: Record<string, any> = {
	paid: "success",
	pending: "warning",
	overdue: "danger",
	partial: "primary",
	default: "default",
};

// Status color mapping for Excel export
const STATUS_COLOR_MAP: Record<string, string> = {
	success: "FF28A745",
	warning: "FFFFC107",
	primary: "FF0D6EFD",
	danger: "FFDC3545",
	default: "FFE0E0E0",
};

const CreditflexRepaymentsView = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// Modal states
	const {
		isOpen: isRepaymentModalOpen,
		onOpen: openRepaymentModal,
		onClose: closeRepaymentModal,
	} = useDisclosure();

	const [startDate, setStartDate] = useState<string | undefined>(
		searchParams.get("startDate") || undefined
	);
	const [endDate, setEndDate] = useState<string | undefined>(
		searchParams.get("endDate") || undefined
	);
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [selectedRepayment, setSelectedRepayment] = useState<any>(null);
	const [urlRepaymentId, setUrlRepaymentId] = useState<string | null>(null);

	const initialFilters = useMemo(() => {
		const s = searchParams.get("status") || "all";
		const teleMarketerId = searchParams.get("teleMarketerId") || undefined;
		const loanId = searchParams.get("loanId") || undefined;
		const startDate = searchParams.get("startDate") || undefined;
		const endDate = searchParams.get("endDate") || undefined;
		const search = searchParams.get("search") || undefined;
		return {
			status: s,
			teleMarketerId,
			loanId,
			startDate,
			endDate,
			search,
		};
	}, [searchParams]);

	const {
		data: repaymentsRes,
		error,
		isLoading,
	} = useAdminRepayments(initialFilters as any);

	const [searchValue, setSearchValue] = useState(initialFilters.search || "");

	// Transform and prepare repayments data similar to allLoansView
	// Enhanced to handle both traditional Creditflex data and WACS (Web-based Application and Customer Services) data structure
	const repaymentsData = useMemo(() => {
		if (!repaymentsRes?.data) {
			setHasNoRecords(!isLoading && !error);
			return [];
		}

		setHasNoRecords(false);

		// Debug: Log first repayment to understand structure
		if (repaymentsRes?.data?.repayments.length > 0) {
			console.log(
				"Sample repayment data structure:",
				repaymentsRes?.data?.repayments[0]
			);
		}

		return repaymentsRes?.data?.repayments.map((repayment: any) => {
			// Handle both traditional Creditflex data and WACS data structure
			const isWacsData = !!repayment.wacsCustomerLoanId;

			let expectedAmount,
				paidAmount,
				balance,
				dueDate,
				loanId,
				customerName,
				customerIppis;
			let telemarketerName = "Unassigned",
				teleMarketerId = null;
			let status = "pending";

			if (isWacsData) {
				// WACS data structure handling
				expectedAmount = Number(repayment.amount || 0);
				paidAmount = repayment.isRepaid ? expectedAmount : 0;
				balance = expectedAmount - paidAmount;
				dueDate = new Date(repayment.date);
				loanId = repayment.loanId || repayment.wacsCustomerLoan?.loanId;

				// Extract customer info from nested WACS structure
				const wacsCustomer = repayment.wacsCustomerLoan?.wacsCustomer;
				customerName =
					wacsCustomer?.fullName ||
					`${wacsCustomer?.firstName || ""} ${wacsCustomer?.middleName || ""} ${
						wacsCustomer?.surname || ""
					}`.trim() ||
					repayment.wacsCustomerLoan?.debtor ||
					"N/A";
				customerIppis =
					repayment.customerIPPIS ||
					wacsCustomer?.ippisNumber ||
					repayment.wacsCustomerLoan?.customerIppis ||
					"N/A";

				// Extract telemarketer info if available
				if (wacsCustomer?.teleMarketerId) {
					teleMarketerId = wacsCustomer.teleMarketerId;
					// Note: telemarketer name might need to be fetched separately or joined
					telemarketerName = "Assigned"; // Placeholder - actual name might need separate lookup
				}

				// Determine status from WACS fields
				status = repayment.isRepaid ? "paid" : "pending";

				// Check if overdue
				const today = new Date();
				if (!repayment.isRepaid && dueDate < today) {
					status = "overdue";
				}
			} else {
				// Traditional Creditflex data structure handling
				expectedAmount = Number(
					repayment.expectedAmount ||
						repayment.expected ||
						repayment.amount_expected ||
						0
				);
				paidAmount = Number(
					repayment.paidAmount || repayment.paid || repayment.amount_paid || 0
				);
				balance = expectedAmount - paidAmount;
				dueDate = new Date(
					repayment.dueDate ||
						repayment.expectedDate ||
						repayment.repaymentDate ||
						repayment.due_date
				);
				loanId =
					repayment.loanId ||
					repayment.loan?.loanId ||
					repayment.loan_reference;
				customerName =
					repayment.customer?.fullName ||
					repayment.customer_name ||
					repayment.customerName ||
					"N/A";
				customerIppis =
					repayment.customer?.ippisNumber ||
					repayment.customerIppis ||
					repayment.ippis ||
					"N/A";
				telemarketerName =
					repayment.telemarketer?.name ||
					repayment.telemarketer?.fullName ||
					"Unassigned";
				teleMarketerId =
					repayment.telemarketer?.id ||
					repayment.teleMarketer?.id ||
					repayment.teleMarketerId;
				status =
					repayment.status ||
					repayment.paymentStatus ||
					repayment.statusType ||
					"pending";
			}

			const isOverdue = dueDate < new Date() && status !== "paid";
			const daysOverdue = isOverdue
				? Math.floor(
						(new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
				  )
				: 0;

			return {
				...repayment,
				// Standardized fields for consistent display
				repaymentId: repayment.repaymentId || repayment.id || repayment._id,
				loanId,
				customerName,
				customerIppis,
				expectedAmount,
				paidAmount,
				balance,
				dueDate: dueDate.toISOString(),
				rawDate:
					repayment.createdAt || repayment.dateCreated || dueDate.toISOString(),
				status,
				telemarketerName,
				teleMarketerId,
				isOverdue,
				daysOverdue,
				collectionProgress:
					expectedAmount > 0 ? (paidAmount / expectedAmount) * 100 : 0,

				// Additional WACS-specific fields for detailed view
				...(isWacsData && {
					wacsCustomerLoanId: repayment.wacsCustomerLoanId,
					wacsData: {
						loanProduct: repayment.wacsCustomerLoan?.loanProduct,
						loanProductCategory:
							repayment.wacsCustomerLoan?.loanProductCategory,
						interestRate: repayment.wacsCustomerLoan?.interestRate,
						disbursedAmount: repayment.wacsCustomerLoan?.disbursedAmount,
						repaymentAmount: repayment.wacsCustomerLoan?.repaymentAmount,
						monthlyRepaymentAmount:
							repayment.wacsCustomerLoan?.monthlyRepaymentAmount,
						loanTenure: repayment.wacsCustomerLoan?.loanTenure,
						mda: repayment.wacsCustomerLoan?.wacsCustomer?.mda,
						rank: repayment.wacsCustomerLoan?.wacsCustomer?.rank,
						gradeLevel: repayment.wacsCustomerLoan?.wacsCustomer?.gradeLevel,
						bankName: repayment.wacsCustomerLoan?.wacsCustomer?.bankName,
						accountNumber:
							repayment.wacsCustomerLoan?.wacsCustomer?.accountNumber,
					},
				}),
			};
		});
	}, [repaymentsRes, isLoading, error]);

	const total = repaymentsRes?.pagination?.total || repaymentsData.length;

	useEffect(() => {
		setSearchValue(initialFilters.search || "");
	}, [initialFilters.search]);

	// Handle URL parameters for repayment ID (similar to allLoansView)
	useEffect(() => {
		if (typeof window !== "undefined") {
			const repaymentIdParam =
				searchParams.get("i") || searchParams.get("repaymentId");

			if (repaymentIdParam && repaymentsData.length > 0) {
				const repayment = repaymentsData.find(
					(r: any) =>
						r.repaymentId === repaymentIdParam || r.id === repaymentIdParam
				);
				if (repayment) {
					setSelectedRepayment(repayment);
					setUrlRepaymentId(repaymentIdParam);
					openRepaymentModal();

					// Clean URL without causing page reload
					const params = new URLSearchParams(
						Object.fromEntries(searchParams.entries())
					);
					params.delete("i");
					params.delete("repaymentId");
					const newUrl =
						window.location.pathname +
						(params.toString() ? `?${params.toString()}` : "");
					window.history.replaceState({}, "", newUrl);
				}
			}
		}
	}, [repaymentsData, openRepaymentModal, searchParams]);

	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
		// Update URL params
		const params = new URLSearchParams(
			Object.fromEntries(searchParams.entries())
		);
		if (start) params.set("startDate", start);
		else params.delete("startDate");
		if (end) params.set("endDate", end);
		else params.delete("endDate");
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleSearch = () => {
		const params = new URLSearchParams(
			Object.fromEntries(searchParams.entries())
		);
		if (searchValue) params.set("search", searchValue);
		else params.delete("search");
		router.push(`${pathname}?${params.toString()}`);
	};

	// Handle viewing repayment details
	const handleViewRepayment = (repayment: any) => {
		setSelectedRepayment(repayment);
		openRepaymentModal();
	};

	// Handle copy shareable link
	const handleCopyRepaymentLink = (repayment: any) => {
		const currentUrl = window.location.origin + window.location.pathname;
		const shareableLink = `${currentUrl}?i=${repayment.repaymentId}`;

		navigator.clipboard.writeText(shareableLink);
		showToast({
			message: "Shareable link copied to clipboard!",
			type: "success",
		});
	};

	// Handle record payment action
	const handleRecordPayment = (repayment: any) => {
		const params = new URLSearchParams(
			Object.fromEntries(searchParams.entries())
		);
		params.set("i", repayment.repaymentId);
		router.push(`${pathname}?${params.toString()}`);
	};

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	// sort descriptor expected by GenericTable
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "dueDate",
		direction: "descending",
	});

	// status filter set for GenericTable
	const initialStatusSet = useMemo(() => {
		const s = initialFilters.status;
		if (!s || s === "all") return new Set<string>();
		return new Set([s]);
	}, [initialFilters.status]);
	const [statusSet, setStatusSet] = useState<Set<string>>(initialStatusSet);

	// Filter and sort data locally (similar to allLoansView approach)
	const filtered = useMemo(() => {
		if (!Array.isArray(repaymentsData)) return [];

		let list = [...repaymentsData];

		// Local status filtering
		if (statusSet.size > 0) {
			const selectedStatuses = Array.from(statusSet).map((s) =>
				s.toLowerCase()
			);
			list = list.filter((repayment: any) =>
				selectedStatuses.includes(repayment.status?.toLowerCase() || "")
			);
		}

		// Local text filtering
		if (searchValue) {
			const searchTerm = searchValue.toLowerCase();
			list = list.filter(
				(repayment: any) =>
					repayment.customerName?.toLowerCase().includes(searchTerm) ||
					repayment.loanId?.toLowerCase().includes(searchTerm) ||
					repayment.telemarketerName?.toLowerCase().includes(searchTerm) ||
					repayment.customerIppis?.toLowerCase().includes(searchTerm) ||
					repayment.status?.toLowerCase().includes(searchTerm) ||
					repayment.expectedAmount?.toString().includes(searchTerm) ||
					repayment.paidAmount?.toString().includes(searchTerm)
			);
		}

		return list;
	}, [repaymentsData, searchValue, statusSet]);

	const pages = 1; // Not used anymore with server-side filtering

	const sorted = useMemo(() => {
		return [...filtered].sort((a, b) => {
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
	}, [filtered, sortDescriptor]);

	// Calculate important metrics for dashboard
	const metrics = useMemo(() => {
		const totalExpected = filtered.reduce(
			(sum, r) => sum + r.expectedAmount,
			0
		);
		const totalCollected = filtered.reduce((sum, r) => sum + r.paidAmount, 0);
		const overdueAmount = filtered
			.filter((r) => r.isOverdue)
			.reduce((sum, r) => sum + r.balance, 0);
		const todaysDue = filtered
			.filter((r) => {
				const due = new Date(r.dueDate);
				const today = new Date();
				return due.toDateString() === today.toDateString();
			})
			.reduce((sum, r) => sum + r.expectedAmount, 0);
		const collectionRate =
			totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

		return {
			totalCollected,
			todaysDue,
			overdueAmount,
			collectionRate,
		};
	}, [filtered]);

	const exportFn = async (data: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Repayments");

		// Enhanced columns to accommodate WACS data
		ws.columns = [
			{ header: "S/N", key: "sn", width: 6 },
			{ header: "Loan ID", key: "loanId", width: 20 },
			{ header: "Customer Name", key: "customer", width: 30 },
			{ header: "Customer IPPIS", key: "customerIppis", width: 15 },
			{ header: "MDA", key: "mda", width: 25 },
			{ header: "Rank", key: "rank", width: 15 },
			{ header: "Grade Level", key: "gradeLevel", width: 15 },
			{ header: "Expected Amount", key: "expected", width: 18 },
			{ header: "Paid Amount", key: "paid", width: 18 },
			{ header: "Balance", key: "balance", width: 18 },
			{ header: "Due Date", key: "dueDate", width: 18 },
			{ header: "Days Overdue", key: "daysOverdue", width: 15 },
			{ header: "Collection Progress (%)", key: "progress", width: 20 },
			{ header: "Loan Product", key: "loanProduct", width: 20 },
			{ header: "Interest Rate", key: "interestRate", width: 15 },
			{ header: "Telemarketer", key: "telemarketer", width: 25 },
			{ header: "Status", key: "status", width: 15 },
		];

		data.forEach((r, idx) => {
			const row = ws.addRow({
				sn: idx + 1,
				loanId: r.loanId || r.loan?.loanId || r.loan_reference,
				customer: r.customerName || r.customer?.fullName || r.customer_name,
				customerIppis: r.customerIppis || r.customer?.ippisNumber || "N/A",
				mda: r.wacsData?.mda || r.customer?.mda || "N/A",
				rank: r.wacsData?.rank || r.customer?.rank || "N/A",
				gradeLevel: r.wacsData?.gradeLevel || r.customer?.gradeLevel || "N/A",
				expected: Number(
					r.expectedAmount || r.expected || r.amount_expected || 0
				),
				paid: Number(r.paidAmount || r.paid || r.amount_paid || 0),
				balance: r.balance || 0,
				dueDate: formatDate(
					r.dueDate || r.expectedDate || r.repaymentDate || r.due_date
				),
				daysOverdue: r.daysOverdue || 0,
				progress: r.collectionProgress
					? `${r.collectionProgress.toFixed(1)}%`
					: "0%",
				loanProduct: r.wacsData?.loanProduct || r.loanProduct || "N/A",
				interestRate: r.wacsData?.interestRate || r.interestRate || "N/A",
				telemarketer:
					r.telemarketerName ||
					r.telemarketer?.name ||
					r.telemarketer?.fullName ||
					"Unassigned",
				status: r.status || r.paymentStatus || r.statusType,
			});

			// Color code status cell
			const colorKey = getColor(r.status);
			const fillColor =
				STATUS_COLOR_MAP[colorKey] || STATUS_COLOR_MAP["default"];
			const statusCell = row.getCell("status");

			if (process.env.EXCEL_STATUS_COLOR === "true") {
				statusCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: fillColor },
				};
				statusCell.font = { color: { argb: "FFFFFFFF" } };
			}
		});

		// Format currency columns
		["expected", "paid", "balance"].forEach(
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
		const fileName = `Creditflex_Repayments_${formattedDate.replace(
			/ /g,
			"_"
		)}_${formattedTime.replace(/:/g, "-")}.xlsx`;
		saveAs(new Blob([buf]), fileName);
	};

	// Server-side full export: fetch all filtered records (no pagination) then export
	const handleFullExport = async () => {
		try {
			const filters = {
				status:
					initialFilters.status === "all" ? undefined : initialFilters.status,
				teleMarketerId: initialFilters.teleMarketerId,
				loanId: initialFilters.loanId,
				startDate: initialFilters.startDate,
				endDate: initialFilters.endDate,
				search: initialFilters.search,
			};
			// Fetch all records without page/limit
			const res = await getCDFRepayments(filters);
			const all = res?.data || [];
			await exportFn(all);
		} catch (err: any) {
			console.error(err);
			showToast({ message: err?.message || "Export failed", type: "error" });
		}
	};

	const columns = useMemo(
		() => [
			{ uid: "loanId", name: "Loan ID" },
			{ uid: "customerName", name: "Customer" },
			{ uid: "expected", name: "Expected Amount" },
			{ uid: "paid", name: "Paid Amount" },
			{ uid: "balance", name: "Balance" },
			{ uid: "dueDate", name: "Due Date" },
			{ uid: "telemarketer", name: "Telemarketer" },
			{ uid: "status", name: "Status" },
			{ uid: "actions", name: "Actions" },
		],
		[]
	);

	const renderCell = (row: any, key: string) => {
		if (key === "serialNumber") {
			const index = sorted.indexOf(row);
			const serialNumber = index + 1;
			return <span className="text-sm">{serialNumber}</span>;
		}

		if (key === "loanId") {
			return (
				<div>
					<span className="text-sm font-medium font-mono">
						{row.loanId || "N/A"}
					</span>
					{/* Show loan product for WACS data */}
					{row.wacsData?.loanProduct && (
						<div className="text-xs text-gray-500">
							{row.wacsData.loanProduct}
						</div>
					)}
					{row.wacsData?.interestRate && (
						<div className="text-xs text-gray-500">
							{row.wacsData.interestRate}% interest
						</div>
					)}
				</div>
			);
		}

		if (key === "customerName") {
			return (
				<div
					className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
					onClick={() => handleViewRepayment(row)}
				>
					<div className="capitalize">{row.customerName}</div>
					{row.customerIppis && row.customerIppis !== "N/A" && (
						<div className="text-xs text-gray-500">
							IPPIS: {row.customerIppis}
						</div>
					)}
					{/* Show additional WACS data if available */}
					{row.wacsData?.mda && (
						<div
							className="text-xs text-gray-500 truncate"
							title={row.wacsData.mda}
						>
							{row.wacsData.mda.length > 30
								? `${row.wacsData.mda.substring(0, 30)}...`
								: row.wacsData.mda}
						</div>
					)}
					{row.wacsData?.rank && row.wacsData?.gradeLevel && (
						<div className="text-xs text-gray-500">
							{row.wacsData.rank} - {row.wacsData.gradeLevel}
						</div>
					)}
				</div>
			);
		}

		if (key === "expected") {
			return (
				<span className="font-medium">
					₦{row.expectedAmount?.toLocaleString("en-GB") || 0}
				</span>
			);
		}

		if (key === "paid") {
			return (
				<span className="font-medium">
					₦{row.paidAmount?.toLocaleString("en-GB") || 0}
				</span>
			);
		}

		if (key === "balance") {
			const balance = row.balance || 0;
			return (
				<span
					className={`font-medium ${
						balance > 0 ? "text-red-600" : "text-green-600"
					}`}
				>
					₦{balance.toLocaleString("en-GB")}
					{row.collectionProgress !== undefined && (
						<div className="text-xs text-gray-500">
							{row.collectionProgress.toFixed(1)}% paid
						</div>
					)}
				</span>
			);
		}

		if (key === "dueDate") {
			const dueDate = new Date(row.dueDate);
			const isOverdue = row.isOverdue;
			return (
				<div>
					<span className={isOverdue ? "text-red-600 font-medium" : ""}>
						{formatDate(row.dueDate)}
					</span>
					{isOverdue && (
						<div className="text-xs text-red-500">
							{row.daysOverdue} days overdue
						</div>
					)}
				</div>
			);
		}

		if (key === "telemarketer") {
			if (row.teleMarketerId) {
				return (
					<Link
						href={`/access/admin/creditflex/telesales-agents/${row.teleMarketerId}`}
						className="text-blue-600 hover:underline"
					>
						{row.telemarketerName}
					</Link>
				);
			}
			return <span className="text-gray-500">{row.telemarketerName}</span>;
		}

		if (key === "status") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.status || ""] || "default"}
					size="sm"
					variant="flat"
				>
					{capitalize(row.status || "")}
				</Chip>
			);
		}

		if (key === "actions") {
			const dropdownItems = [
				<DropdownItem
					key="view"
					color="primary"
					startContent={<Eye className="w-4 h-4" />}
					onPress={() => handleViewRepayment(row)}
				>
					View Details
				</DropdownItem>,
				<DropdownItem
					key="copy-link"
					color="default"
					startContent={<LinkIcon className="w-4 h-4" />}
					onPress={() => handleCopyRepaymentLink(row)}
				>
					Copy Shareable Link
				</DropdownItem>,
			];

			if (row.status !== "paid") {
				dropdownItems.push(
					<DropdownItem
						key="record-payment"
						color="success"
						startContent={<CreditCard className="w-4 h-4" />}
						onPress={() => handleRecordPayment(row)}
					>
						Record Payment
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
					Repayments
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Track and manage loan repayments
				</p>
			</div>

			{/* Important Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Total Collected
					</h3>
					<p className="text-2xl font-bold text-green-600">
						₦{metrics.totalCollected.toLocaleString("en-GB")}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Expected Today
					</h3>
					<p className="text-2xl font-bold text-blue-600">
						₦{metrics.todaysDue.toLocaleString("en-GB")}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Overdue Amount
					</h3>
					<p className="text-2xl font-bold text-red-600">
						₦{metrics.overdueAmount.toLocaleString("en-GB")}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Collection Rate
					</h3>
					<p className="text-2xl font-bold text-green-600">
						{metrics.collectionRate.toFixed(1)}%
					</p>
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
						router.push(`${pathname}?${params.toString()}`);
					}}
					statusOptions={[
						{ name: "All", uid: "all" },
						{ name: "Paid", uid: "paid" },
						{ name: "Pending", uid: "pending" },
						{ name: "Overdue", uid: "overdue" },
						{ name: "Partial", uid: "partial" },
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
						router.push(`${pathname}?${params.toString()}`);
					}}
					statusColorMap={statusColorMap}
					showStatus={true}
					sortDescriptor={sortDescriptor}
					onSortChange={setSortDescriptor}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={hasNoRecords}
					page={1}
					pages={1}
					onPageChange={() => {}} // No-op since we're not using pagination
					onDateFilterChange={handleDateFilter}
					initialStartDate={startDate}
					initialEndDate={endDate}
					selectionMode="single"
				/>
			)}

			{/* Repayment Details Modal */}
			<RepaymentDetailsModal
				isOpen={isRepaymentModalOpen || Boolean(searchParams.get("i"))}
				onClose={() => {
					closeRepaymentModal();
					if (searchParams.get("i")) {
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						params.delete("i");
						router.push(`${pathname}?${params.toString()}`);
					}
					// Refresh data after modal closes
					mutate(
						(key: any) =>
							Array.isArray(key) &&
							key[0] === "creditflex" &&
							key[1] === "repayments"
					);
				}}
				repaymentId={selectedRepayment?.repaymentId || searchParams.get("i")}
			/>
		</div>
	);
};

export default CreditflexRepaymentsView;
