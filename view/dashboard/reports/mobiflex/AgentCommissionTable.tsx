import React, { useMemo, useState } from "react";
import { useCommissionsData } from "./useCommissionsData";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { paySingleMbe, bulkPayMbes } from "@/lib/api";
import { showToast } from "@/lib/showNotification";
import ConfirmationModal from "@/components/reususables/custom-ui/ConfirmationModal";
import {
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from "@heroui/react";

// Status options
const statusOptions = [
	{ name: "All", uid: "all" },
	{ name: "Unpaid", uid: "unpaid" },
	{ name: "Fully Paid", uid: "fullyPaid" },
	{ name: "Partial Paid", uid: "partialPaid" },
];

// Table columns
const columns: ColumnDef[] = [
	{ name: "Agent", uid: "agent", sortable: true },
	{ name: "MBE ID", uid: "mbeId", sortable: true },
	{ name: "Total Commission", uid: "totalCommission", sortable: true },
	{ name: "Agent Commission", uid: "totalAgentCommission", sortable: true },
	{ name: "Amount Paid", uid: "amountPaid", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Row type
interface AgentRow {
	agent: string;
	mbeId: string;
	totalCommission: number;
	totalAgentCommission: number;
	amountPaid: number;
	amountLeft: number;
	numberPaid: number;
	numberLeft: number;
	totalPartnerCommission: number;
	commissionCount: number;
	partner: string;
	latestCommissionDate?: string;
	[key: string]: string | number | undefined;
}

// Payment result interface
interface PaymentResult {
	mbeId: string;
	agent: string;
	amountPaid: number;
	status: "success" | "failed";
	reason?: string;
}

// Flatten API data to table rows
function flattenRows(data: any): AgentRow[] {
	if (!data?.agents) return [];
	return data.agents.map((agent: any) => {
		const commissions = agent.Commission || [];
		const totalCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.commission || 0),
			0
		);
		const totalAgentCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.mbeCommission || 0),
			0
		);
		const totalPartnerCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.partnerCommission || 0),
			0
		);
		const commissionCount = commissions.length;
		const amountPaid = commissions
			.filter((c: any) => c.agentPaid)
			.reduce((sum: number, c: any) => sum + (c.mbeCommission || 0), 0);
		const amountLeft = commissions
			.filter((c: any) => !c.agentPaid)
			.reduce((sum: number, c: any) => sum + (c.mbeCommission || 0), 0);
		const numberPaid = commissions.filter((c: any) => c.agentPaid).length;
		const numberLeft = commissions.filter((c: any) => !c.agentPaid).length;
		return {
			agent: `${agent.firstname} ${agent.lastname}`,
			mbeId: agent.mbeId,
			totalCommission,
			totalAgentCommission,
			amountPaid,
			amountLeft,
			numberPaid,
			numberLeft,
			totalPartnerCommission,
			commissionCount,
			partner:
				agent.scanPartner?.companyName || agent.scanPartner?.firstName || "N/A",
			latestCommissionDate: commissions.length
				? commissions[commissions.length - 1].createdAt
				: undefined,
		};
	});
}

const AgentCommissionTable = () => {
	const [internalDateRange, setInternalDateRange] = useState<{
		start?: string;
		end?: string;
	}>({});
	const { data, isLoading, mutate } = useCommissionsData({
		startDate: internalDateRange.start,
		endDate: internalDateRange.end,
	});
	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState<{
		column: string;
		direction: "ascending" | "descending";
	}>({ column: "totalCommission", direction: "descending" });
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [statusFilter, setStatusFilter] = useState<Set<string>>(
		new Set(["all"])
	);
	const [modal, setModal] = useState<{
		open: boolean;
		agent?: any;
		bulk?: boolean;
		loading?: boolean;
		failed?: any[];
		result?: any;
		selectedRows?: AgentRow[];
		paymentResults?: PaymentResult[];
	} | null>(null);

	// State for bulk payment
	const [isBulkPaying, setIsBulkPaying] = useState(false);

	// Flatten and filter rows
	const allRows: AgentRow[] = useMemo(() => flattenRows(data), [data]);
	const filteredRows = useMemo(() => {
		let rows = allRows;
		// Date filter
		if (internalDateRange.start || internalDateRange.end) {
			rows = rows.filter((r) => {
				const date = r.latestCommissionDate
					? new Date(r.latestCommissionDate)
					: null;
				if (!date) return true;
				if (internalDateRange.start && date < new Date(internalDateRange.start))
					return false;
				if (internalDateRange.end && date > new Date(internalDateRange.end))
					return false;
				return true;
			});
		}
		// Status filter
		if (!statusFilter.has("all")) {
			if (statusFilter.has("unpaid"))
				rows = rows.filter((r) => r.amountLeft > 0);
			if (statusFilter.has("fullyPaid"))
				rows = rows.filter((r) => r.amountLeft === 0);
			if (statusFilter.has("partialPaid"))
				rows = rows.filter((r) => r.amountPaid > 0 && r.amountLeft > 0);
		}
		// Text filter
		if (filterValue) {
			const f = filterValue.toLowerCase();
			rows = rows.filter((row: any) =>
				Object.values(row).some((v) => String(v).toLowerCase().includes(f))
			);
		}
		return rows;
	}, [allRows, internalDateRange, statusFilter, filterValue]);

	// Sort
	const sorted = useMemo(() => {
		return [...filteredRows].sort((a, b) => {
			if (a.latestCommissionDate && b.latestCommissionDate) {
				return (
					new Date(b.latestCommissionDate).getTime() -
					new Date(a.latestCommissionDate).getTime()
				);
			}
			const aVal = a[sortDescriptor.column] ?? 0;
			const bVal = b[sortDescriptor.column] ?? 0;
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [filteredRows, sortDescriptor]);

	const rowsPerPage = 10;
	const pages = Math.ceil(sorted.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return sorted.slice(start, start + rowsPerPage);
	}, [sorted, page]);

	// Payable agents (those with unpaid commissions)
	const payableAgents = useMemo(() => {
		return filteredRows.filter((r) => r.amountLeft > 0);
	}, [filteredRows]);

	const payableAgentIds = useMemo(() => {
		return new Set(payableAgents.map((r) => r.mbeId));
	}, [payableAgents]);

	const allPayableSelected = useMemo(() => {
		if (payableAgentIds.size === 0) return false;
		if (!(selected instanceof Set)) return false;
		return Array.from(payableAgentIds).every((id) => selected.has(id));
	}, [payableAgentIds, selected]);

	const selectedPayableIds = useMemo(() => {
		if (!(selected instanceof Set)) return [];
		return Array.from(selected).filter((id) => payableAgentIds.has(id));
	}, [selected, payableAgentIds]);

	const selectedPayableRows = useMemo(() => {
		return filteredRows.filter((row) => selectedPayableIds.includes(row.mbeId));
	}, [filteredRows, selectedPayableIds]);

	const selectedPayableCount = selectedPayableIds.length;

	// Calculate total amount to be paid
	const totalAmountToPay = useMemo(() => {
		return selectedPayableRows.reduce((sum, row) => sum + row.amountLeft, 0);
	}, [selectedPayableRows]);

	// Disabled keys for fully paid agents
	const disabledKeys = useMemo(() => {
		return new Set(
			filteredRows.filter((r) => r.amountLeft === 0).map((r) => r.mbeId)
		);
	}, [filteredRows]);

	// Export function
	const exportFn = async (rows: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Agent Commissions");
		ws.columns = columns
			.filter((c) => c.uid !== "actions")
			.map((c) => ({
				header: c.name,
				key: c.uid,
				width: 20,
			}));
		rows.forEach((r) => ws.addRow(r));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Agent_Commissions.xlsx");
	};

	// Download payment report function
	const downloadPaymentReport = async (paymentResults: PaymentResult[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Payment Report");

		// Add header information
		ws.mergeCells("A1:E1");
		ws.getCell("A1").value = "AGENT COMMISSION PAYMENT REPORT";
		ws.getCell("A1").font = { bold: true, size: 16 };
		ws.getCell("A1").alignment = { horizontal: "center" };

		ws.mergeCells("A2:E2");
		ws.getCell(
			"A2"
		).value = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
		ws.getCell("A2").alignment = { horizontal: "center" };

		// Add summary
		const successfulPayments = paymentResults.filter(
			(p) => p.status === "success"
		);
		const failedPayments = paymentResults.filter((p) => p.status === "failed");
		const totalPaid = successfulPayments.reduce(
			(sum, p) => sum + p.amountPaid,
			0
		);

		ws.getCell("A4").value = "SUMMARY:";
		ws.getCell("A4").font = { bold: true };
		ws.getCell("A5").value = `Total Agents Processed: ${paymentResults.length}`;
		ws.getCell(
			"A6"
		).value = `Successful Payments: ${successfulPayments.length}`;
		ws.getCell("A7").value = `Failed Payments: ${failedPayments.length}`;
		ws.getCell("A8").value = `Total Amount Paid: ₦${totalPaid.toLocaleString(
			"en-GB"
		)}`;

		// Add table headers
		ws.getCell("A10").value = "MBE ID";
		ws.getCell("B10").value = "Agent Name";
		ws.getCell("C10").value = "Amount Paid (₦)";
		ws.getCell("D10").value = "Status";
		ws.getCell("E10").value = "Reason/Notes";

		// Style headers
		["A10", "B10", "C10", "D10", "E10"].forEach((cell) => {
			ws.getCell(cell).font = { bold: true };
			ws.getCell(cell).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFE6E6E6" },
			};
		});

		// Add payment data
		paymentResults.forEach((result, index) => {
			const row = 11 + index;
			ws.getCell(`A${row}`).value = result.mbeId;
			ws.getCell(`B${row}`).value = result.agent;
			ws.getCell(`C${row}`).value = result.amountPaid;
			ws.getCell(`C${row}`).numFmt = "#,##0.00";
			ws.getCell(`D${row}`).value = result.status.toUpperCase();
			ws.getCell(`E${row}`).value =
				result.reason ||
				(result.status === "success"
					? "Payment processed successfully"
					: "Unknown error");

			// Color code status
			if (result.status === "success") {
				ws.getCell(`D${row}`).font = { color: { argb: "FF008000" } };
			} else {
				ws.getCell(`D${row}`).font = { color: { argb: "FFFF0000" } };
			}
		});

		// Set column widths
		ws.getColumn("A").width = 15;
		ws.getColumn("B").width = 25;
		ws.getColumn("C").width = 15;
		ws.getColumn("D").width = 12;
		ws.getColumn("E").width = 30;

		// Generate and download
		const buffer = await wb.xlsx.writeBuffer();
		const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
		saveAs(new Blob([buffer]), `Payment_Report_${timestamp}.xlsx`);
	};

	// Render cell with actions
	const renderCell = (row: any, key: string) => {
		if (key === "actions") {
			return (
				<Dropdown>
					<DropdownTrigger>
						<Button isIconOnly size="sm" variant="light">
							...
						</Button>
					</DropdownTrigger>
					<DropdownMenu>
						<DropdownItem
							key="payAgent"
							isDisabled={row.amountLeft === 0}
							onPress={() => setModal({ open: true, agent: row })}
						>
							Pay Agent
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			);
		}

		// Format currency values
		if (
			key === "totalCommission" ||
			key === "totalAgentCommission" ||
			key === "amountPaid"
		) {
			const amount = row[key] || 0;
			return (
				<span className="font-medium">₦{amount.toLocaleString("en-GB")}</span>
			);
		}

		return <span>{row[key]}</span>;
	};

	// Single payout
	const handlePayAgent = async () => {
		if (!modal?.agent) return;
		setModal((m) => (m ? { ...m, loading: true } : m));
		try {
			const res = await paySingleMbe({
				mbeId: modal.agent.mbeId,
			});

			// Create payment result for report
			const paymentResult: PaymentResult = {
				mbeId: modal.agent.mbeId,
				agent: modal.agent.agent,
				amountPaid: modal.agent.amountLeft,
				status: "success",
			};

			// Download payment report
			await downloadPaymentReport([paymentResult]);

			showToast({
				type: "success",
				message: res?.message || "Payout successful",
			});
			setModal(null);
			mutate();
		} catch (e: any) {
			showToast({ type: "error", message: e.message || "Payout failed" });
			setModal(null);
		}
	};

	// Bulk payout
	const handleBulkPay = async () => {
		setIsBulkPaying(true);
		try {
			const mbeIds = Array.from(selected).filter((id) =>
				payableAgentIds.has(id)
			);
			if (mbeIds.length === 0) {
				showToast({
					type: "warning",
					message: "No valid agents selected for payment",
				});
				setIsBulkPaying(false);
				return;
			}

			let didRespond = false;
			// Start a timer: if no response in 30s, show fallback toast
			const timer = setTimeout(() => {
				if (!didRespond) {
					showToast({
						type: "success",
						message:
							"Payout request submitted successfully. Check payout history in 3 minutes for feedback.",
					});
					setModal(null);
					setSelected(new Set());
					setIsBulkPaying(false);
				}
			}, 30000);

			const res = await bulkPayMbes({
				mbeIds: Array.from(mbeIds),
			});
			didRespond = true;
			clearTimeout(timer);

			// Create payment results for report
			const paymentResults: PaymentResult[] = selectedPayableRows.map((row) => {
				const failed = res?.data?.failedPayouts?.find(
					(f: any) => f.mbeId === row.mbeId
				);
				return {
					mbeId: row.mbeId,
					agent: row.agent,
					amountPaid: failed ? 0 : row.amountLeft,
					status: failed ? "failed" : "success",
					reason: failed?.reason,
				};
			});

			// Download payment report
			await downloadPaymentReport(paymentResults);

			if (res?.data?.failedPayouts?.length) {
				setModal({
					open: false,
					failed: res.data.failedPayouts,
					result: res.data,
					paymentResults,
				});
			} else {
				showToast({
					type: "success",
					message: res?.message || "Bulk payout successful",
				});
				setModal(null);
				setSelected(new Set());
			}
			mutate();
		} catch (e: any) {
			showToast({
				type: "error",
				message: e.message || "Bulk payout failed",
			});
		} finally {
			setIsBulkPaying(false);
		}
	};

	// Print-based PDF download for failed payouts
	const downloadFailedPdf = () => {
		if (!modal?.failed) return;
		const html = `
			<html><head><title>Failed Payouts Report</title></head><body>
			<h2>Failed Payouts Report</h2>
			<ul>
				${modal.failed
					.map(
						(fail: any, i: number) =>
							`<li>${i + 1}. MBE ID: ${fail.mbeId || "-"}, Reason: ${
								fail.reason || "Unknown"
							}</li>`
					)
					.join("")}
			</ul>
			</body></html>
		`;
		const win = window.open("", "_blank");
		if (win) {
			win.document.write(html);
			win.document.close();
			win.print();
		}
	};

	// Selection handler
	const handleSelect = (keys: any) => {
		if (keys === "all") {
			if (allPayableSelected && payableAgentIds.size > 0) {
				setSelected(new Set());
			} else {
				setSelected(new Set(Array.from(payableAgentIds)));
			}
		} else if (keys instanceof Set) {
			const validSelection = new Set(
				Array.from(keys).filter((id) => payableAgentIds.has(id))
			);
			setSelected(validSelection);
		} else {
			setSelected(new Set());
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (!data) return <div>No data</div>;

	return (
		<div className="p-6">
			{/* Bulk Actions Bar - Similar to All Loans View */}
			{selectedPayableCount > 0 && (
				<div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<div className="flex flex-wrap items-center gap-2">
						<Button
							color="primary"
							variant="solid"
							size="sm"
							onPress={() =>
								setModal({
									open: true,
									bulk: true,
									selectedRows: selectedPayableRows,
								})
							}
							isDisabled={selectedPayableCount === 0}
							className="min-w-fit"
							isLoading={isBulkPaying}
						>
							Pay Selected ({selectedPayableCount})
						</Button>
						<Button
							color="default"
							variant="bordered"
							size="sm"
							onPress={() => setSelected(new Set())}
							isDisabled={selected.size === 0}
							className="min-w-fit"
						>
							Clear Selection
						</Button>
					</div>
					<div className="flex-1 flex justify-end">
						<div className="text-sm text-blue-700 self-center">
							<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
								{selectedPayableCount} selected • Total: ₦
								{totalAmountToPay.toLocaleString("en-GB")}
							</span>
						</div>
					</div>
				</div>
			)}

			<GenericTable
				columns={columns}
				data={paged}
				allCount={filteredRows.length}
				exportData={filteredRows}
				isLoading={isLoading}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				statusOptions={statusOptions}
				statusFilter={statusFilter}
				onStatusChange={(status) => {
					setStatusFilter(status as Set<string>);
					setPage(1);
				}}
				sortDescriptor={sortDescriptor}
				onSortChange={(desc) =>
					setSortDescriptor(desc as typeof sortDescriptor)
				}
				page={page}
				pages={pages}
				onPageChange={setPage}
				exportFn={exportFn}
				renderCell={renderCell}
				hasNoRecords={filteredRows.length === 0}
				selectedKeys={
					selected.size === payableAgentIds.size && payableAgentIds.size > 0
						? payableAgentIds
						: selected
				}
				onSelectionChange={handleSelect}
				selectionMode="multiple"
				onDateFilterChange={(start, end) =>
					setInternalDateRange({ start, end })
				}
				initialStartDate={internalDateRange.start}
				initialEndDate={internalDateRange.end}
				disabledKeys={disabledKeys}
			/>

			{/* Single payout confirmation modal */}
			{modal?.open && modal.agent && !modal.bulk && (
				<ConfirmationModal
					isOpen={modal.open}
					title="Pay Agent"
					description={`Are you sure you want to pay agent ${modal.agent.agent}? Only unpaid commissions will be paid.`}
					isLoading={modal.loading}
					confirmText="Pay"
					onConfirm={handlePayAgent}
					onClose={() => setModal(null)}
				/>
			)}

			{/* Bulk payout confirmation modal with enhanced table */}
			{modal?.open && modal.bulk && (
				<ConfirmationModal
					isOpen={modal.open}
					title="Bulk Pay Agents"
					isLoading={isBulkPaying}
					confirmText={`Pay ${selectedPayableCount} Agents`}
					onConfirm={handleBulkPay}
					onClose={() => setModal(null)}
				>
					<div>
						<div className="mb-4 p-3 bg-blue-50 rounded-lg">
							<div className="text-sm text-blue-800">
								<strong>Summary:</strong> You are about to pay{" "}
								{modal.selectedRows?.length} agents
								<br />
								<strong>Total Amount:</strong> ₦
								{totalAmountToPay.toLocaleString("en-GB")}
							</div>
						</div>

						<div className="mb-4 overflow-x-auto">
							<Table
								aria-label="Agents to be paid"
								classNames={{
									wrapper: "max-h-80 overflow-auto",
									table: "min-w-full",
								}}
								removeWrapper
							>
								<TableHeader>
									<TableColumn className="w-32">MBE ID</TableColumn>
									<TableColumn className="w-48">Agent Name</TableColumn>
									<TableColumn className="w-32 text-right">
										Amount to Pay
									</TableColumn>
								</TableHeader>
								<TableBody>
									{modal.selectedRows?.map((row: AgentRow) => (
										<TableRow key={row.mbeId}>
											<TableCell>
												<span
													className="font-mono text-sm block truncate max-w-28"
													title={row.mbeId}
												>
													{row.mbeId}
												</span>
											</TableCell>
											<TableCell>
												<span
													className="font-medium block max-w-44"
													title={row.agent}
												>
													{row.agent}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<span className="text-green-700 font-semibold">
													₦{row.amountLeft?.toLocaleString("en-GB")}
												</span>
											</TableCell>
										</TableRow>
									)) || []}
								</TableBody>
							</Table>
						</div>

						<div className="text-center p-3 bg-red-50 rounded-lg">
							<div className="text-red-700 font-medium">
								⚠️ This action cannot be undone. Are you sure you want to
								proceed?
							</div>
						</div>
					</div>
				</ConfirmationModal>
			)}

			{/* Failed payout report modal */}
			{modal?.failed && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
						<h2 className="text-lg font-bold mb-2">
							Payment Processing Complete
						</h2>
						<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
							<p className="text-yellow-800">
								Some payments failed to process. Please review the details
								below:
							</p>
						</div>
						<ul className="mb-4 max-h-60 overflow-y-auto border rounded p-2">
							{modal.failed.map((fail: any, i: number) => (
								<li key={i} className="mb-2 p-2 bg-red-50 rounded">
									<strong>MBE ID:</strong> {fail.mbeId || "-"}
									<br />
									<strong>Reason:</strong> {fail.reason || "Unknown error"}
								</li>
							))}
						</ul>
						<div className="flex gap-2">
							<Button color="primary" onClick={downloadFailedPdf}>
								Download Failed Report
							</Button>
							{modal.paymentResults && (
								<Button
									color="success"
									onClick={() => downloadPaymentReport(modal.paymentResults!)}
								>
									Download Full Report
								</Button>
							)}
							<Button variant="light" onClick={() => setModal(null)}>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AgentCommissionTable;
