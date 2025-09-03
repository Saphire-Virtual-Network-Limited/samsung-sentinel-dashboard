"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAdminInvoices } from "@/hooks/creditflex";
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
	Copy,
} from "lucide-react";
import InvoiceDetailsModal from "@/components/modals/InvoiceDetailsModal";
import { getCDFInvoices } from "@/lib/api";
import { showToast, capitalize, getColor } from "@/lib";
import { mutate } from "swr";

// Status color mapping for invoices
const statusColorMap: Record<string, any> = {
	paid: "success",
	unpaid: "warning",
	pending: "warning",
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

const CreditflexInvoicesView = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// Modal states
	const {
		isOpen: isInvoiceModalOpen,
		onOpen: openInvoiceModal,
		onClose: closeInvoiceModal,
	} = useDisclosure();

	const [startDate, setStartDate] = useState<string | undefined>(
		searchParams.get("startDate") || undefined
	);
	const [endDate, setEndDate] = useState<string | undefined>(
		searchParams.get("endDate") || undefined
	);
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

	const initialFilters = useMemo(() => {
		const isPaidParam = searchParams.get("isPaid");
		const isPaid =
			isPaidParam === "true"
				? true
				: isPaidParam === "false"
				? false
				: undefined;
		const dateField = searchParams.get("dateField") || "createdAt";
		const startDate = searchParams.get("startDate") || undefined;
		const endDate = searchParams.get("endDate") || undefined;
		const search = searchParams.get("search") || undefined;
		return {
			isPaid,
			dateField,
			startDate,
			endDate,
			search,
		};
	}, [searchParams]);

	const {
		data: invoicesRes,
		error,
		isLoading,
	} = useAdminInvoices(initialFilters as any);

	const [searchValue, setSearchValue] = useState(initialFilters.search || "");

	// Transform and prepare invoices data
	const invoicesData = useMemo(() => {
		if (!invoicesRes?.data) {
			setHasNoRecords(!isLoading && !error);
			return [];
		}

		setHasNoRecords(false);

		// Debug: Log first invoice to understand structure
		if (invoicesRes?.data?.invoices.length > 0) {
			console.log(
				"Sample invoice data structure:",
				invoicesRes?.data?.invoices[0]
			);
		}

		return invoicesRes?.data?.invoices.map((invoice: any) => {
			// Extract customer info from WACS structure
			const wacsCustomer = invoice.wacsCustomerLoan?.wacsCustomer;
			const customerName =
				wacsCustomer?.fullName ||
				invoice.wacsCustomerLoan?.debtor ||
				invoice.accountName ||
				"N/A";

			const customerIppis =
				invoice.wacsCustomerLoan?.customerIppis ||
				wacsCustomer?.ippisNumber ||
				"N/A";

			// Extract MDA and other employment details
			const mda = invoice.wacsCustomerLoan?.mda || wacsCustomer?.mda || "N/A";
			const rank = wacsCustomer?.rank || "N/A";
			const gradeLevel = wacsCustomer?.gradeLevel || "N/A";

			// Loan information
			const loanProduct = invoice.wacsCustomerLoan?.loanProduct || "N/A";
			const amountRequested = invoice.wacsCustomerLoan?.amountRequested || 0;
			const disbursedAmount = invoice.wacsCustomerLoan?.disbursedAmount || 0;
			const interestRate = invoice.wacsCustomerLoan?.interestRate || 0;

			return {
				...invoice,
				invoiceId: invoice.id,
				customerName,
				customerIppis,
				mda,
				rank,
				gradeLevel,
				loanProduct,
				amountRequested,
				disbursedAmount,
				interestRate,
				status: invoice.isPaid ? "paid" : "unpaid",
				createdDate: new Date(invoice.createdAt),
				paymentDate: invoice.paymentCompletedAt
					? new Date(invoice.paymentCompletedAt)
					: null,
			};
		});
	}, [invoicesRes?.data, isLoading, error]);

	const total =
		invoicesRes?.data?.pagination?.totalCount || invoicesData.length;

	// Handle invoice modal opening from URL
	useEffect(() => {
		const invoiceId = searchParams.get("i");
		if (invoiceId && invoicesData.length > 0) {
			const invoice = invoicesData.find(
				(inv: any) => inv.invoiceId === invoiceId
			);
			if (invoice) {
				setSelectedInvoice(invoice);
				openInvoiceModal();
			}
		}
	}, [invoicesData, openInvoiceModal, searchParams]);

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

	// Handle viewing invoice details
	const handleViewInvoice = (invoice: any) => {
		setSelectedInvoice(invoice);
		openInvoiceModal();
	};

	// Handle copy shareable link
	const handleCopyInvoiceLink = (invoice: any) => {
		const currentUrl = window.location.origin + window.location.pathname;
		const shareableLink = `${currentUrl}?i=${invoice.invoiceId}`;

		navigator.clipboard.writeText(shareableLink);
		showToast({
			message: "Shareable link copied to clipboard!",
			type: "success",
		});
	};

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);

	// sort descriptor expected by GenericTable
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "createdDate",
		direction: "descending",
	});

	// status filter set for GenericTable
	const initialStatusSet = useMemo(() => {
		const isPaid = initialFilters.isPaid;
		if (isPaid === undefined) return new Set<string>();
		return new Set([isPaid ? "paid" : "unpaid"]);
	}, [initialFilters.isPaid]);
	const [statusSet, setStatusSet] = useState<Set<string>>(initialStatusSet);

	// Filter and sort data locally
	const filtered = useMemo(() => {
		if (!Array.isArray(invoicesData)) return [];

		let list = [...invoicesData];

		// Local status filtering
		if (statusSet.size > 0) {
			const selectedStatuses = Array.from(statusSet).map((s) =>
				s.toLowerCase()
			);
			list = list.filter((invoice: any) =>
				selectedStatuses.includes(invoice.status?.toLowerCase() || "")
			);
		}

		// Local text filtering
		if (searchValue) {
			const searchTerm = searchValue.toLowerCase();
			list = list.filter(
				(invoice: any) =>
					invoice.customerName?.toLowerCase().includes(searchTerm) ||
					invoice.reference?.toLowerCase().includes(searchTerm) ||
					invoice.accountName?.toLowerCase().includes(searchTerm) ||
					invoice.customerIppis?.toLowerCase().includes(searchTerm) ||
					invoice.loanId?.toString().includes(searchTerm) ||
					invoice.amount?.toString().includes(searchTerm)
			);
		}

		return list;
	}, [invoicesData, searchValue, statusSet]);

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
		const totalAmount = filtered.reduce((sum, inv) => sum + inv.amount, 0);
		const paidAmount = filtered
			.filter((inv) => inv.isPaid)
			.reduce((sum, inv) => sum + inv.amount, 0);
		const unpaidAmount = filtered
			.filter((inv) => !inv.isPaid)
			.reduce((sum, inv) => sum + inv.amount, 0);
		const totalInvoices = filtered.length;
		const paidInvoices = filtered.filter((inv) => inv.isPaid).length;
		const paymentRate =
			totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

		return {
			totalAmount,
			paidAmount,
			unpaidAmount,
			totalInvoices,
			paidInvoices,
			paymentRate,
		};
	}, [filtered]);

	const exportFn = async (data: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Invoices");

		// Enhanced columns for invoice data
		ws.columns = [
			{ header: "S/N", key: "sn", width: 6 },
			{ header: "Invoice Reference", key: "reference", width: 25 },
			{ header: "Customer Name", key: "customer", width: 30 },
			{ header: "Customer IPPIS", key: "customerIppis", width: 15 },
			{ header: "MDA", key: "mda", width: 25 },
			{ header: "Rank", key: "rank", width: 15 },
			{ header: "Grade Level", key: "gradeLevel", width: 15 },
			{ header: "Amount", key: "amount", width: 18 },
			{ header: "Loan ID", key: "loanId", width: 15 },
			{ header: "Account Name", key: "accountName", width: 30 },
			{ header: "Account Number", key: "accountNumber", width: 20 },
			{ header: "Bank Name", key: "bankName", width: 25 },
			{ header: "Loan Product", key: "loanProduct", width: 25 },
			{ header: "Amount Requested", key: "amountRequested", width: 18 },
			{ header: "Disbursed Amount", key: "disbursedAmount", width: 18 },
			{ header: "Interest Rate", key: "interestRate", width: 15 },
			{ header: "Status", key: "status", width: 15 },
			{ header: "Created Date", key: "createdDate", width: 18 },
			{ header: "Payment Date", key: "paymentDate", width: 18 },
		];

		data.forEach((inv, idx) => {
			const row = ws.addRow({
				sn: idx + 1,
				reference: inv.reference,
				customer: inv.customerName,
				customerIppis: inv.customerIppis,
				mda: inv.mda,
				rank: inv.rank,
				gradeLevel: inv.gradeLevel,
				amount: Number(inv.amount || 0),
				loanId: inv.loanId,
				accountName: inv.accountName,
				accountNumber: inv.accountNumber,
				bankName: inv.bankName,
				loanProduct: inv.loanProduct,
				amountRequested: Number(inv.amountRequested || 0),
				disbursedAmount: Number(inv.disbursedAmount || 0),
				interestRate: `${inv.interestRate}%`,
				status: inv.status,
				createdDate: formatDate(inv.createdAt),
				paymentDate: inv.paymentCompletedAt
					? formatDate(inv.paymentCompletedAt)
					: "N/A",
			});

			// Color code status cell
			const colorKey = getColor(inv.status);
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
		["amount", "amountRequested", "disbursedAmount"].forEach(
			(c) => (ws.getColumn(c).numFmt = "#,##0")
		);

		// Format header row
		ws.getRow(1).font = { bold: true };
		ws.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE6E6E6" },
		};

		// Auto-fit columns
		ws.columns.forEach((column) => {
			if (column.header && column.key) {
				const maxLength = Math.max(
					String(column.header).length,
					...data.map(
						(row) => String(row[column.key as keyof typeof row] || "").length
					)
				);
				column.width = Math.min(Math.max(maxLength + 2, 10), 50);
			}
		});

		// Generate and download file
		const buffer = await wb.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		saveAs(
			blob,
			`creditflex-invoices-${new Date().toISOString().split("T")[0]}.xlsx`
		);
	};

	// Server-side full export: fetch all filtered records then export
	const handleFullExport = async () => {
		try {
			const filters = {
				isPaid: initialFilters.isPaid,
				dateField: initialFilters.dateField,
				startDate: initialFilters.startDate,
				endDate: initialFilters.endDate,
				search: initialFilters.search,
			};
			// Fetch all records
			const res = await getCDFInvoices(filters);
			const allInvoices = res?.data?.invoices || [];
			await exportFn(allInvoices);
		} catch (err: any) {
			console.error(err);
			showToast({ message: err?.message || "Export failed", type: "error" });
		}
	};

	const columns = [
		{ uid: "serialNumber", name: "S/N" },
		{ uid: "reference", name: "Reference" },
		{ uid: "customerName", name: "Customer" },
		{ uid: "amount", name: "Amount" },
		{ uid: "loanId", name: "Loan ID" },
		{ uid: "bankName", name: "Bank" },
		{ uid: "status", name: "Status" },
		{ uid: "createdDate", name: "Created" },
		{ uid: "actions", name: "Actions" },
	];

	const renderCell = (row: any, key: string) => {
		if (key === "serialNumber") {
			const index = sorted.indexOf(row);
			const serialNumber = index + 1;
			return <span className="text-sm">{serialNumber}</span>;
		}

		if (key === "reference") {
			return (
				<div>
					<span className="text-sm font-medium font-mono">{row.reference}</span>
				</div>
			);
		}

		if (key === "customerName") {
			return (
				<div className="flex flex-col">
					<span className="text-sm font-medium">{row.customerName}</span>
					{row.customerIppis !== "N/A" && (
						<span className="text-xs text-gray-500 font-mono">
							IPPIS: {row.customerIppis}
						</span>
					)}
					{row.mda !== "N/A" && (
						<span className="text-xs text-gray-400 truncate max-w-40">
							{row.mda}
						</span>
					)}
				</div>
			);
		}

		if (key === "amount") {
			return (
				<div className="flex flex-col">
					<span className="text-sm font-medium">
						{formatCurrency(row.amount)}
					</span>
				</div>
			);
		}

		if (key === "loanId") {
			return <span className="text-sm font-mono">{row.loanId}</span>;
		}

		if (key === "bankName") {
			return (
				<div className="flex flex-col">
					<span className="text-sm">{row.bankName}</span>
					<span className="text-xs text-gray-500 font-mono">
						{row.accountNumber}
					</span>
				</div>
			);
		}

		if (key === "status") {
			return (
				<Chip
					className="capitalize border-none gap-1 text-default-600"
					color={statusColorMap[row.status] || statusColorMap.default}
					size="sm"
					variant="dot"
				>
					{row.status}
				</Chip>
			);
		}

		if (key === "createdDate") {
			return (
				<div className="flex flex-col">
					<span className="text-sm">{formatDate(row.createdAt)}</span>
					{row.paymentCompletedAt && (
						<span className="text-xs text-green-600">
							Paid: {formatDate(row.paymentCompletedAt)}
						</span>
					)}
				</div>
			);
		}

		if (key === "actions") {
			return (
				<div className="relative flex justify-end items-center gap-2">
					<Dropdown className="bg-background border-1 border-default-200">
						<DropdownTrigger>
							<Button isIconOnly radius="full" size="sm" variant="light">
								<MoreHorizontal className="text-default-400" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem
								key="view"
								startContent={<Eye className="w-4 h-4" />}
								onPress={() => handleViewInvoice(row)}
							>
								View Details
							</DropdownItem>
							<DropdownItem
								key="link"
								startContent={<LinkIcon className="w-4 h-4" />}
								onPress={() => handleCopyInvoiceLink(row)}
							>
								Copy Link
							</DropdownItem>
							<DropdownItem
								key="copy"
								startContent={<Copy className="w-4 h-4" />}
								onPress={() => {
									navigator.clipboard.writeText(row.reference);
									showToast({
										message: "Reference copied to clipboard!",
										type: "success",
									});
								}}
							>
								Copy Reference
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		return row[key];
	};

	return (
		<div className="space-y-6">
			{/* Metrics Dashboard */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Total Invoices
					</h3>
					<p className="text-2xl font-bold text-blue-600">
						{metrics.totalInvoices.toLocaleString("en-GB")}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Total Amount
					</h3>
					<p className="text-2xl font-bold text-green-600">
						{formatCurrency(metrics.totalAmount)}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Paid Amount
					</h3>
					<p className="text-2xl font-bold text-green-600">
						{formatCurrency(metrics.paidAmount)}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Payment Rate
					</h3>
					<p className="text-2xl font-bold text-blue-600">
						{metrics.paymentRate.toFixed(1)}%
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
						{ name: "Unpaid", uid: "unpaid" },
					]}
					statusFilter={statusSet}
					onStatusChange={(sel: Set<string>) => {
						setStatusSet(sel);
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						if (!sel || sel.size === 0) {
							params.delete("isPaid");
						} else {
							const first = Array.from(sel)[0];
							if (first === "paid") params.set("isPaid", "true");
							else if (first === "unpaid") params.set("isPaid", "false");
							else params.delete("isPaid");
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
					searchPlaceholder="Search by reference, customer name, IPPIS, loan ID..."
				/>
			)}

			{/* Invoice Details Modal */}
			<InvoiceDetailsModal
				isOpen={isInvoiceModalOpen || Boolean(searchParams.get("i"))}
				onClose={() => {
					closeInvoiceModal();
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
							key[1] === "invoices"
					);
				}}
				invoiceId={selectedInvoice?.invoiceId || searchParams.get("i")}
			/>
		</div>
	);
};

export default CreditflexInvoicesView;
