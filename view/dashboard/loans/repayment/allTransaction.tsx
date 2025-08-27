"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { getTransactionData } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Chip,
	SortDescriptor,
	ChipProps,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";

// Minimal columns for table view (only essential ones)
const displayColumns: ColumnDef[] = [
	{ name: "Customer Name", uid: "customerName", sortable: true },
	{ name: "Amount", uid: "amount", sortable: true },
	{ name: "Channel", uid: "channel", sortable: true },
	{ name: "Payment Reference", uid: "paymentReference", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Type", uid: "paymentType", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Full columns for export (all data)
const exportColumns: ColumnDef[] = [
	{ name: "Transaction ID", uid: "transactionId", sortable: true },
	{ name: "Customer ID", uid: "customerId", sortable: true },
	{ name: "Loan ID", uid: "loanId", sortable: true },
	{ name: "Amount", uid: "amount", sortable: true },
	{ name: "Channel", uid: "channel", sortable: true },
	{ name: "Payment Reference", uid: "paymentReference", sortable: true },
	{ name: "Payment Description", uid: "paymentDescription", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Is Down Payment", uid: "isDownPayment", sortable: true },
	{ name: "Is Card Tokenization", uid: "isCardTokenization", sortable: true },
	{ name: "Is Loan Repayment", uid: "isLoanRepayment", sortable: true },
	{ name: "Customer Name", uid: "customerName", sortable: true },
	{ name: "Customer Email", uid: "customerEmail", sortable: true },
];

const statusOptions = [
	{ name: "Enrolled", uid: "enrolled" },
	{ name: "Pending", uid: "pending" },
	{ name: "Approved", uid: "approved" },
	{ name: "Running", uid: "running" },
	{ name: "Completed", uid: "completed" },
	{ name: "Cancelled", uid: "cancelled" },
	{ name: "Due", uid: "due" },
	{ name: "Rejected", uid: "rejected" },
	{ name: "Defaulted", uid: "defaulted" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	approved: "success",
	rejected: "danger",
	enrolled: "warning",
	defaulted: "danger",
	due: "warning",
	completed: "success",
	cancelled: "danger",
	running: "warning",
};

type AllTransactionRecord = {
	totalTransactions: number;
	totalAmount: number;
	breakdown: {
		downPayments: {
			count: number;
			amount: number;
		};
		loanRepayments: {
			count: number;
			amount: number;
		};
		cardTokenizations: {
			count: number;
			amount: number;
		};
	};
	allTransactions: Array<{
		transactionId: string;
		customerId: string;
		loanId: string;
		amount: number;
		channel: string;
		paymentReference: string;
		paymentDescription: string;
		createdAt: string;
		isDownPayment: boolean;
		isCardTokenization: boolean;
		isLoanRepayment: boolean;
		customerName: string;
		customerEmail: string;
	}>;
};

type TransformedDueLoanRecord = {
	transactionId: string;
	customerId: string;
	loanId: string;
	amount: number;
	channel: string;
	paymentReference: string;
	paymentDescription: string;
	createdAt: string;
	isDownPayment: boolean;
	isCardTokenization: boolean;
	isLoanRepayment: boolean;
	customerName: string;
	customerEmail: string;
};

export default function AllTransactionView() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | null>(null);
	const [selectedItem, setSelectedItem] =
		useState<TransformedDueLoanRecord | null>(null);

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string>(() => {
		// Set default to yesterday (1 day ago)
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		return yesterday.toISOString().split("T")[0];
	});
	const [endDate, setEndDate] = useState<string>(() => {
		// Set default to today
		return new Date().toISOString().split("T")[0];
	});
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [channel, setChannel] = useState<string | undefined>(undefined);
	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "customerName",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	const fromDate = startDate;
	const toDate = endDate;

	// Fetch data based on date filter - Fixed SWR settings to prevent data disappearing
	const {
		data: raw = [],
		isLoading,
		error,
	} = useSWR(
		["all-transaction-data", fromDate, toDate],
		() => {
			console.log("Fetching data with params:", { fromDate, toDate });
			return getTransactionData(fromDate, toDate)
				.then((r) => {
					console.log("API response:", r);
					if (!r.data || r.data.length === 0) {
						console.log("No data in response, setting hasNoRecords to true");
						setHasNoRecords(true);
						return [];
					}
					console.log("Data found, setting hasNoRecords to false");
					setHasNoRecords(false);
					return r.data;
				})
				.catch((error) => {
					console.error("Error fetching all transaction data:", error);
					setHasNoRecords(true);
					return [];
				});
		},
		{
			revalidateOnFocus: false, // Changed from true to false
			dedupingInterval: 300000, // Increased from 60000 to 300000 (5 minutes)
			refreshInterval: 0, // Changed from 60000 to 0 (no auto-refresh)
			shouldRetryOnError: true, // Changed from false to true
			keepPreviousData: true,
			revalidateIfStale: false, // Changed from true to false
		}
	);

	console.log("SWR state:", { raw, isLoading, error });
	console.log("repayment raw", raw);

	// Transform the data
	const customers = useMemo(() => {
		console.log("Raw data structure:", raw);
		console.log("Raw data type:", typeof raw);
		console.log("Raw data keys:", raw ? Object.keys(raw) : "No data");

		// Handle the actual API response structure
		let customersData = [];

		if (raw && typeof raw === "object") {
			// Extract from the correct path: data.repayments
			customersData = raw.allTransactions || [];
		}

		console.log("Extracted customers data:", customersData);
		console.log("Customers data length:", customersData.length);

		if (customersData.length === 0) {
			console.log("No customers data found, returning empty array");
			return [];
		}

		return customersData.map(
			(customer: any, index: number): TransformedDueLoanRecord => {
				console.log(`Processing customer ${index}:`, customer);
				return {
					transactionId: customer.transactionId || "N/A",
					customerId: customer.customerId || "N/A",
					loanId: customer.loanId || "N/A",
					amount: customer.amount || 0,
					channel: customer.channel || "N/A",
					paymentReference: customer.paymentReference || "N/A",
					paymentDescription: customer.paymentDescription || "N/A",
					createdAt: customer.createdAt || "N/A",
					isDownPayment: customer.isDownPayment || false,
					isCardTokenization: customer.isCardTokenization || false,
					isLoanRepayment: customer.isLoanRepayment || false,
					customerName: customer.customerName || "N/A",
					customerEmail: customer.customerEmail || "N/A",
				};
			}
		);
	}, [raw]);

	// Filter the data - Fixed to use actual fields from the data
	const filtered = useMemo(() => {
		console.log("Filtering customers data:", customers);
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				try {
					// Use only the fields that actually exist in the data
					const customerName = (c.customerName || "").toLowerCase();
					const customerEmail = (c.customerEmail || "").toLowerCase();
					const customerId = (c.customerId || "").toLowerCase();
					const transactionId = (c.transactionId || "").toLowerCase();
					const paymentReference = (c.paymentReference || "").toLowerCase();
					const channel = (c.channel || "").toLowerCase();

					return (
						customerName.includes(f) ||
						customerEmail.includes(f) ||
						customerId.includes(f) ||
						transactionId.includes(f) ||
						paymentReference.includes(f) ||
						channel.includes(f)
					);
				} catch (error) {
					console.error("Error in filter:", error);
					return false;
				}
			});
		}
		// Removed status filter since it's not applicable to this data
		console.log("Filtered data:", list);
		return list;
	}, [customers, filterValue]);

	// Paginate the data
	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const result = filtered.slice(start, start + rowsPerPage);
		console.log("Paged data:", result);
		return result;
	}, [filtered, page]);

	// Sort the data
	const sorted = React.useMemo(() => {
		const result = [...paged].sort((a, b) => {
			const aVal = String(
				a[sortDescriptor.column as keyof TransformedDueLoanRecord] || ""
			);
			const bVal = String(
				b[sortDescriptor.column as keyof TransformedDueLoanRecord] || ""
			);
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
		console.log("Sorted data:", result);
		return result;
	}, [paged, sortDescriptor]);

	// Export all filtered data with full columns
	const exportFn = async (data: TransformedDueLoanRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("All_Transactions");
		ws.columns = exportColumns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));
		data.forEach((r) => ws.addRow(r));

		// Apply Naira currency formatting to the 'amount' column
		const currencyColumns = ["amount"];
		currencyColumns.forEach((col) => {
			const colObj = ws.getColumn(col);
			if (colObj) {
				colObj.numFmt = "#,##0.00";
			}
		});

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "All_Transactions.xlsx");
	};

	// When action clicked:
	const openModal = (mode: "view", row: TransformedDueLoanRecord) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: TransformedDueLoanRecord, key: string) => {
		if (key === "actions") {
			return (
				<div className="flex justify-end">
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem key="view" onPress={() => openModal("view", row)}>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}
		if (key === "paymentType") {
			return (
				<Chip
					className="capitalize"
					color={row.isLoanRepayment ? "success" : "warning"}
					size="sm"
					variant="flat"
				>
					{row.isLoanRepayment ? "Loan Repayment" : "Down Payment"}
				</Chip>
			);
		}
		if (key === "amount") {
			return (
				<div className="text-small">₦{row.amount?.toLocaleString() || "0"}</div>
			);
		}
		if (key === "createdAt") {
			return (
				<div className="text-small">
					{new Date(row.createdAt).toLocaleDateString()}
				</div>
			);
		}
		// Ensure we're converting any value to a string before rendering
		const cellValue = (row as any)[key];
		if (cellValue === null || cellValue === undefined) {
			return <div className="text-small">N/A</div>;
		}
		if (typeof cellValue === "object") {
			return <div className="text-small">View Details</div>;
		}
		return <div className="text-small">{String(cellValue)}</div>;
	};

	return (
		<>
			<div className="w-full overflow-hidden">
				{/* Summary Cards Section */}
				{!isLoading && raw && typeof raw === "object" && (
					<div className="mb-8 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-100/80 backdrop-blur-sm">
						{/* Header Section */}
						<div className="px-8 py-6 border-b border-gray-100/60">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
										<svg
											className="w-5 h-5 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2.5}
												d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
											/>
										</svg>
									</div>
									<div>
										<h2 className="text-xl font-bold text-gray-900 tracking-tight">
											Transaction Summary
										</h2>
										<p className="text-sm text-gray-500 font-medium">
											Financial overview for selected period
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2 bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-200/60">
									<svg
										className="w-4 h-4 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									<span className="text-sm font-semibold text-gray-700">
										{startDate} - {endDate}
									</span>
								</div>
							</div>
						</div>

						{/* Metrics Grid */}
						<div className="px-8 py-8">
							<div className="grid grid-cols-5 gap-8">
								{/* Total Transactions */}
								<div className="group relative">
									<div className="bg-gradient-to-br from-blue-50 to-blue-100/80 rounded-2xl p-6 border border-blue-200/40 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:border-blue-300/60">
										<div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
											<svg
												className="w-7 h-7 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2.5}
													d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
												/>
											</svg>
										</div>
										<p className="text-sm font-semibold text-blue-700 mb-2 tracking-wide">
											Total Transactions
										</p>
										<p className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
											{raw.totalTransactions?.toLocaleString() || "0"}
										</p>
										<div className="w-full bg-blue-200/40 rounded-full h-1">
											<div
												className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full"
												style={{ width: "100%" }}
											></div>
										</div>
									</div>
								</div>

								{/* Total Amount */}
								<div className="group relative">
									<div className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-2xl p-6 border border-emerald-200/40 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:border-emerald-300/60">
										<div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
											<svg
												className="w-7 h-7 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2.5}
													d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
												/>
											</svg>
										</div>
										<p className="text-sm font-semibold text-emerald-700 mb-2 tracking-wide">
											Total Amount
										</p>
										<p className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
											₦{raw.totalAmount?.toLocaleString() || "0"}
										</p>
										<div className="w-full bg-emerald-200/40 rounded-full h-1">
											<div
												className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full"
												style={{ width: "100%" }}
											></div>
										</div>
									</div>
								</div>

								{/* Down Payments */}
								<div className="group relative">
									<div className="bg-gradient-to-br from-amber-50 to-amber-100/80 rounded-2xl p-6 border border-amber-200/40 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:border-amber-300/60">
										<div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-4 shadow-lg">
											<svg
												className="w-7 h-7 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2.5}
													d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
												/>
											</svg>
										</div>
										<p className="text-sm font-semibold text-amber-700 mb-2 tracking-wide">
											Down Payments
										</p>
										<p className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
											{raw.breakdown?.downPayments?.count?.toLocaleString() ||
												"0"}
										</p>
										<p className="text-sm font-medium text-amber-600 mb-2">
											₦
											{raw.breakdown?.downPayments?.amount?.toLocaleString() ||
												"0"}
										</p>
										<div className="w-full bg-amber-200/40 rounded-full h-1">
											<div
												className="bg-gradient-to-r from-amber-500 to-amber-600 h-1 rounded-full"
												style={{ width: "100%" }}
											></div>
										</div>
									</div>
								</div>

								{/* Loan Repayments */}
								<div className="group relative">
									<div className="bg-gradient-to-br from-violet-50 to-violet-100/80 rounded-2xl p-6 border border-violet-200/40 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:border-violet-300/60">
										<div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl mb-4 shadow-lg">
											<svg
												className="w-7 h-7 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2.5}
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										</div>
										<p className="text-sm font-semibold text-violet-700 mb-2 tracking-wide">
											Loan Repayments
										</p>
										<p className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
											{raw.breakdown?.loanRepayments?.count?.toLocaleString() ||
												"0"}
										</p>
										<p className="text-sm font-medium text-violet-600 mb-2">
											₦
											{raw.breakdown?.loanRepayments?.amount?.toLocaleString() ||
												"0"}
										</p>
										<div className="w-full bg-violet-200/40 rounded-full h-1">
											<div
												className="bg-gradient-to-r from-violet-500 to-violet-600 h-1 rounded-full"
												style={{ width: "100%" }}
											></div>
										</div>
									</div>
								</div>

								{/* Card Tokenizations */}
								<div className="group relative">
									<div className="bg-gradient-to-br from-indigo-50 to-indigo-100/80 rounded-2xl p-6 border border-indigo-200/40 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:border-indigo-300/60">
										<div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
											<svg
												className="w-7 h-7 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2.5}
													d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
												/>
											</svg>
										</div>
										<p className="text-sm font-semibold text-indigo-700 mb-2 tracking-wide">
											Card Tokenizations
										</p>
										<p className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
											{raw.breakdown?.cardTokenizations?.count?.toLocaleString() ||
												"0"}
										</p>
										<p className="text-sm font-medium text-indigo-600 mb-2">
											₦
											{raw.breakdown?.cardTokenizations?.amount?.toLocaleString() ||
												"0"}
										</p>
										<div className="w-full bg-indigo-200/40 rounded-full h-1">
											<div
												className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1 rounded-full"
												style={{ width: "100%" }}
											></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="mb-4 flex justify-center md:justify-end"></div>

				{isLoading ? (
					<TableSkeleton columns={displayColumns.length} rows={10} />
				) : (
					<>
						<GenericTable<TransformedDueLoanRecord>
							columns={displayColumns}
							data={sorted}
							allCount={filtered.length}
							exportData={filtered}
							isLoading={isLoading}
							filterValue={filterValue}
							onFilterChange={(v) => {
								setFilterValue(v);
								setPage(1);
							}}
							statusOptions={statusOptions}
							statusFilter={statusFilter}
							onStatusChange={setStatusFilter}
							statusColorMap={statusColorMap}
							showStatus={false}
							sortDescriptor={sortDescriptor}
							onSortChange={setSortDescriptor}
							page={page}
							pages={pages}
							onPageChange={setPage}
							exportFn={exportFn}
							renderCell={renderCell}
							hasNoRecords={hasNoRecords}
							onDateFilterChange={handleDateFilter}
							initialStartDate={startDate}
							initialEndDate={endDate}
							defaultDateRange={{ days: 1 }}
						/>
					</>
				)}
			</div>
		</>
	);
}
