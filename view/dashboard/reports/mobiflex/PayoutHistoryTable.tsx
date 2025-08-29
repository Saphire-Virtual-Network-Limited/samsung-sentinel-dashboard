import React, { useMemo, useState } from "react";
import {
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/react";
import { MoreHorizontal } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import useSWR from "swr";
import {
	getAdminPayouts,
	getAdminPayoutStats,
	Payout,
	GetAdminPayoutsResponse,
	GetAdminPayoutStatsResponse,
} from "@/lib/api";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import type { SortDescriptor } from "@heroui/react";
import { StatCard } from "@/components/atoms/StatCard";

const DEFAULT_LIMIT = 200;

const fetcherPayouts = (_: string, page: number, limit: number) =>
	getAdminPayouts(page, limit);
const fetcherStats = () => getAdminPayoutStats();

const payoutColumns: ColumnDef[] = [
	{ name: "Payout ID", uid: "payoutId", sortable: true },
	{ name: "Type", uid: "payoutType", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Total Amount", uid: "totalAmount", sortable: true },
	{ name: "Currency", uid: "currency" },
	{ name: "Payout Date", uid: "payoutDate", sortable: true },
	{ name: "MBEs Paid", uid: "numMbesPaid" },
	{ name: "Agents Paid", uid: "numAgentsPaid" },
	{ name: "MBE Amount Paid", uid: "mbeAmountPaid" },
	{ name: "Agent Amount Paid", uid: "agentAmountPaid" },
	{ name: "Start Period", uid: "startPeriod" },
	{ name: "End Period", uid: "endPeriod" },
	{ name: "Processed", uid: "processedCount" },
	{ name: "Failed", uid: "failedCount" },
	{ name: "Actions", uid: "actions" },
];

const PayoutHistoryTable: React.FC = () => {
	const [page, setPage] = useState(1);
	// Use string for column in state, but accept Key from SortDescriptor
	const [sortDescriptor, setSortDescriptor] = useState<{
		column: string;
		direction: SortDescriptor["direction"];
	}>({ column: "payoutDate", direction: "descending" });

	// Handler to map SortDescriptor (with column: Key) to our state (column: string)
	const handleSortChange = (sd: SortDescriptor) => {
		setSortDescriptor({ column: String(sd.column), direction: sd.direction });
	};
	// SWR for payouts and stats
	const {
		data: payoutsRes,
		isLoading: payoutsLoading,
		error: payoutsError,
	} = useSWR(["getAdminPayouts", page, DEFAULT_LIMIT], ([, p, l]) =>
		fetcherPayouts("getAdminPayouts", p, l)
	);
	const {
		data: statsRes,
		isLoading: statsLoading,
		error: statsError,
	} = useSWR("getAdminPayoutStats", fetcherStats);

	const payouts: Payout[] = payoutsRes?.data?.data?.payouts || [];
	const allCount: number = payoutsRes?.data?.data?.pagination?.total || 0;
	const pages: number = payoutsRes?.data?.data?.pagination?.pages || 1;
	const stats = statsRes?.data?.data;

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

	const handleViewPayout = (payout: Payout) => {
		setSelectedPayout(payout);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedPayout(null);
	};

	// Table cell renderer
	const renderCell = (row: Payout, columnKey: string) => {
		switch (columnKey) {
			case "payoutId":
				return <span className="font-mono text-xs">{row.payoutId}</span>;
			case "payoutType":
				return row.payoutType;
			case "status":
				return row.status;
			case "totalAmount":
				return row.totalAmount;
			case "currency":
				return row.currency;
			case "payoutDate":
				return new Date(row.payoutDate).toLocaleString();
			case "numMbesPaid":
				return row.mbePayouts?.length ?? 0;
			case "numAgentsPaid":
				return row.partnerPayouts?.length ?? 0;
			case "mbeAmountPaid":
				return (
					row.mbePayouts?.reduce((sum, m) => sum + (m.amount || 0), 0) ?? 0
				);
			case "agentAmountPaid":
				return (
					row.partnerPayouts?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0
				);
			case "startPeriod":
				return new Date(row.startPeriod).toLocaleDateString();
			case "endPeriod":
				return new Date(row.endPeriod).toLocaleDateString();
			case "processedCount":
				return row.metadata.processedCount;
			case "failedCount":
				return row.metadata.failedCount;
			case "actions":
				return (
					<Dropdown>
						<DropdownTrigger>
							<Button variant="light" isIconOnly size="sm">
								<MoreHorizontal className="w-4 h-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem
								key="view"
								color="primary"
								onPress={() => handleViewPayout(row)}
							>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				);
			default:
				return null;
		}
	};

	const exportFn = async (data: Payout[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Payout History");
		ws.columns = [
			{ header: "Payout ID", key: "payoutId", width: 20 },
			{ header: "Type", key: "payoutType", width: 12 },
			{ header: "Status", key: "status", width: 12 },
			{ header: "Total Amount", key: "totalAmount", width: 16 },
			{ header: "Currency", key: "currency", width: 10 },
			{ header: "Payout Date", key: "payoutDate", width: 20 },
			{ header: "# MBEs Paid", key: "numMbesPaid", width: 14 },
			{ header: "# Agents Paid", key: "numAgentsPaid", width: 14 },
			{ header: "MBE Amount Paid", key: "mbeAmountPaid", width: 16 },
			{ header: "Agent Amount Paid", key: "agentAmountPaid", width: 16 },
			{ header: "Start Period", key: "startPeriod", width: 16 },
			{ header: "End Period", key: "endPeriod", width: 16 },
			{ header: "Processed", key: "processedCount", width: 12 },
			{ header: "Failed", key: "failedCount", width: 10 },
			{ header: "Paid MBE/Partner", key: "paidType", width: 14 },
			{ header: "Paid ID", key: "paidId", width: 20 },
			{ header: "Paid Name", key: "paidName", width: 24 },
			{ header: "Paid Email", key: "paidEmail", width: 28 },
			{ header: "Paid Account Name", key: "accountName", width: 24 },
			{ header: "Paid Account Number", key: "accountNumber", width: 18 },
			{ header: "Paid Bank Name", key: "bankName", width: 18 },
			{ header: "Paid Amount", key: "paidAmount", width: 16 },
			{ header: "Paid At", key: "paidAt", width: 20 },
			{ header: "Reference", key: "reference", width: 24 },
			{ header: "Remark", key: "remark", width: 24 },
			{ header: "Payment Provider", key: "paymentProvider", width: 16 },
			{ header: "Status (MBE/Partner)", key: "paidStatus", width: 16 },
		];

		// Add autofilter to the first row
		ws.autoFilter = {
			from: { row: 1, column: 1 },
			to: { row: 1, column: ws.columns.length },
		};

		// Assign a color to each payoutId
		const payoutIdColors: Record<string, string> = {};
		let colorIdx = 0;
		const colorPalette = [
			"FFEBF4FA",
			"FFFDEBD0",
			"FFE2F0CB",
			"FFF9D5E5",
			"FFD6EAF8",
			"FFFADBD8",
			"FFD5F5E3",
			"FFF6DDCC",
			"FFE8DAEF",
			"FFFDEBD0",
			"FFF9E79F",
			"FFD4E6F1",
			"FFF5EEF8",
			"FFFDEBD0",
			"FFF2D7D5",
		];

		data.forEach((r) => {
			// Calculate summary fields
			const numMbesPaid = r.mbePayouts?.length ?? 0;
			const numAgentsPaid = r.partnerPayouts?.length ?? 0;
			const mbeAmountPaid =
				r.mbePayouts?.reduce((sum, m) => sum + (m.amount || 0), 0) ?? 0;
			const agentAmountPaid =
				r.partnerPayouts?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;

			// Assign color for this payoutId if not already
			if (!payoutIdColors[r.payoutId]) {
				payoutIdColors[r.payoutId] =
					colorPalette[colorIdx % colorPalette.length];
				colorIdx++;
			}
			const rowColor = payoutIdColors[r.payoutId];

			// MBE payouts
			if (r.mbePayouts && r.mbePayouts.length > 0) {
				r.mbePayouts.forEach((mbe, i) => {
					const excelRow = ws.addRow({
						payoutId: r.payoutId,
						payoutType: r.payoutType,
						status: r.status,
						totalAmount: r.totalAmount,
						currency: r.currency,
						payoutDate: r.payoutDate
							? new Date(r.payoutDate).toLocaleString()
							: "",
						numMbesPaid,
						numAgentsPaid,
						mbeAmountPaid,
						agentAmountPaid,
						startPeriod: r.startPeriod
							? new Date(r.startPeriod).toLocaleDateString()
							: "",
						endPeriod: r.endPeriod
							? new Date(r.endPeriod).toLocaleDateString()
							: "",
						processedCount: r.metadata?.processedCount ?? "",
						failedCount: r.metadata?.failedCount ?? "",
						paidType: "MBE",
						paidId: mbe.mbeId,
						paidName: mbe.mbe ? `${mbe.mbe.firstname} ${mbe.mbe.lastname}` : "",
						paidEmail: mbe.mbe?.email ?? "",
						accountName: mbe.accountName,
						accountNumber: mbe.accountNumber,
						bankName: mbe.bankName,
						paidAmount: mbe.amount,
						paidAt: mbe.paidAt ? new Date(mbe.paidAt).toLocaleString() : "",
						reference: mbe.reference,
						remark: mbe.remark,
						paymentProvider: mbe.paymentProvider,
						paidStatus: mbe.status,
					});
					// Color the row
					excelRow.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: rowColor },
						};
					});
				});
			}
			// Partner payouts
			if (r.partnerPayouts && r.partnerPayouts.length > 0) {
				r.partnerPayouts.forEach((partner, i) => {
					const excelRow = ws.addRow({
						payoutId: r.payoutId,
						payoutType: r.payoutType,
						status: r.status,
						totalAmount: r.totalAmount,
						currency: r.currency,
						payoutDate: r.payoutDate
							? new Date(r.payoutDate).toLocaleString()
							: "",
						numMbesPaid,
						numAgentsPaid,
						mbeAmountPaid,
						agentAmountPaid,
						startPeriod: r.startPeriod
							? new Date(r.startPeriod).toLocaleDateString()
							: "",
						endPeriod: r.endPeriod
							? new Date(r.endPeriod).toLocaleDateString()
							: "",
						processedCount: r.metadata?.processedCount ?? "",
						failedCount: r.metadata?.failedCount ?? "",
						paidType: "Partner",
						paidId: partner.partnerId,
						paidName: partner.partner
							? `${partner.partner.firstName} ${partner.partner.lastName}`
							: "",
						paidEmail: partner.partner?.email ?? "",
						accountName: partner.accountName,
						accountNumber: partner.accountNumber,
						bankName: partner.bankName,
						paidAmount: partner.amount,
						paidAt: partner.paidAt
							? new Date(partner.paidAt).toLocaleString()
							: "",
						reference: partner.reference,
						remark: partner.remark,
						paymentProvider: partner.paymentProvider,
						paidStatus: partner.status,
					});
					// Color the row
					excelRow.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: rowColor },
						};
					});
				});
			}
			// If no payouts, add a summary row
			if (
				(!r.mbePayouts || r.mbePayouts.length === 0) &&
				(!r.partnerPayouts || r.partnerPayouts.length === 0)
			) {
				const excelRow = ws.addRow({
					payoutId: r.payoutId,
					payoutType: r.payoutType,
					status: r.status,
					totalAmount: r.totalAmount,
					currency: r.currency,
					payoutDate: r.payoutDate
						? new Date(r.payoutDate).toLocaleString()
						: "",
					numMbesPaid,
					numAgentsPaid,
					mbeAmountPaid,
					agentAmountPaid,
					startPeriod: r.startPeriod
						? new Date(r.startPeriod).toLocaleDateString()
						: "",
					endPeriod: r.endPeriod
						? new Date(r.endPeriod).toLocaleDateString()
						: "",
					processedCount: r.metadata?.processedCount ?? "",
					failedCount: r.metadata?.failedCount ?? "",
					paidType: "-",
					paidId: "-",
					paidName: "-",
					paidEmail: "-",
					accountName: "-",
					accountNumber: "-",
					bankName: "-",
					paidAmount: "-",
					paidAt: "-",
					reference: "-",
					remark: "-",
					paymentProvider: "-",
					paidStatus: "-",
				});
				excelRow.eachCell((cell) => {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: rowColor },
					};
				});
			}
		});

		// Apply currency formatting to the 'totalAmount' column
		const currencyColumns = ["totalAmount", "mbeAmountPaid", "agentAmountPaid"];
		currencyColumns.forEach((col) => {
			const colObj = ws.getColumn(col);
			if (colObj) {
				colObj.numFmt = "#,##0.00";
			}
		});

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Payout_History.xlsx");
	};

	// Table props
	const tableProps = {
		columns: payoutColumns,
		data: payouts,
		allCount,
		exportData: payouts,
		isLoading: payoutsLoading,
		filterValue: "",
		onFilterChange: () => {},
		sortDescriptor: {
			column: sortDescriptor.column,
			direction: sortDescriptor.direction,
		},
		onSortChange: handleSortChange,
		page,
		pages,
		onPageChange: setPage,
		exportFn,
		renderCell,
		hasNoRecords: !payoutsLoading && payouts.length === 0,
		showStatus: false,
		showColumnSelector: true,
		showRowsPerPageSelector: false,
		defaultRowsPerPage: DEFAULT_LIMIT,
	};

	return (
		<div className="space-y-6">
			{/* Stats summary */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
				{stats ? (
					<>
						<StatCard
							title="Total Payouts"
							value={stats.totalPayouts?.toLocaleString?.() ?? "-"}
						/>
						<StatCard
							title="Total Amount"
							value={`${stats.totalAmount?.toLocaleString?.() ?? "-"} `}
						/>
						<StatCard
							title="Pending Payouts"
							value={stats.pendingPayouts?.toLocaleString?.() ?? "-"}
						/>
						<StatCard
							title="Failed Payouts"
							value={stats.failedPayouts?.toLocaleString?.() ?? "-"}
						/>
						<StatCard
							title="This Month Amount"
							value={stats.thisMonthAmount?.toLocaleString?.() ?? "-"}
						/>
						<StatCard
							title="This Week Amount"
							value={stats.thisWeekAmount?.toLocaleString?.() ?? "-"}
						/>
					</>
				) : statsLoading ? (
					<div>Loading stats...</div>
				) : statsError ? (
					<div className="text-red-500">Failed to load stats</div>
				) : null}
			</div>

			{/* Table */}
			<GenericTable<Payout> {...tableProps} />

			{/* Modal for payout details */}
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				size="2xl"
				scrollBehavior="inside"
			>
				<ModalContent>
					<ModalHeader>Payout Details</ModalHeader>
					<ModalBody>
						{selectedPayout ? (
							<div className="space-y-4">
								<div>
									<div className="font-semibold">Payout ID:</div>
									<div className="font-mono text-xs">
										{selectedPayout.payoutId}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="font-semibold">Type:</div>
										<div>{selectedPayout.payoutType}</div>
									</div>
									<div>
										<div className="font-semibold">Status:</div>
										<div>{selectedPayout.status}</div>
									</div>
									<div>
										<div className="font-semibold">Total Amount:</div>
										<div>{selectedPayout.totalAmount}</div>
									</div>
									<div>
										<div className="font-semibold">Currency:</div>
										<div>{selectedPayout.currency}</div>
									</div>
									<div>
										<div className="font-semibold">Payout Date:</div>
										<div>
											{selectedPayout.payoutDate
												? new Date(selectedPayout.payoutDate).toLocaleString()
												: "-"}
										</div>
									</div>
									<div>
										<div className="font-semibold">Start Period:</div>
										<div>
											{selectedPayout.startPeriod
												? new Date(
														selectedPayout.startPeriod
												  ).toLocaleDateString()
												: "-"}
										</div>
									</div>
									<div>
										<div className="font-semibold">End Period:</div>
										<div>
											{selectedPayout.endPeriod
												? new Date(
														selectedPayout.endPeriod
												  ).toLocaleDateString()
												: "-"}
										</div>
									</div>
									<div>
										<div className="font-semibold">Processed:</div>
										<div>{selectedPayout.metadata?.processedCount ?? "-"}</div>
									</div>
									<div>
										<div className="font-semibold">Failed:</div>
										<div>{selectedPayout.metadata?.failedCount ?? "-"}</div>
									</div>
								</div>
								<div>
									<div className="font-semibold mb-2">Paid MBEs</div>
									{selectedPayout.mbePayouts &&
									selectedPayout.mbePayouts.length > 0 ? (
										<div className="overflow-x-auto">
											<table className="min-w-full text-xs border">
												<thead>
													<tr className="bg-gray-100">
														<th className="p-2 border">Name</th>
														<th className="p-2 border">Email</th>
														<th className="p-2 border">Account</th>
														<th className="p-2 border">Bank</th>
														<th className="p-2 border">Amount</th>
														<th className="p-2 border">Status</th>
														<th className="p-2 border">Paid At</th>
													</tr>
												</thead>
												<tbody>
													{selectedPayout.mbePayouts.map((mbe) => (
														<tr key={mbe.mbePayoutId}>
															<td className="p-2 border">
																{mbe.mbe
																	? `${mbe.mbe.firstname} ${mbe.mbe.lastname}`
																	: "-"}
															</td>
															<td className="p-2 border">
																{mbe.mbe?.email ?? "-"}
															</td>
															<td className="p-2 border">
																{mbe.accountNumber}
															</td>
															<td className="p-2 border">{mbe.bankName}</td>
															<td className="p-2 border">{mbe.amount}</td>
															<td className="p-2 border">{mbe.status}</td>
															<td className="p-2 border">
																{mbe.paidAt
																	? new Date(mbe.paidAt).toLocaleString()
																	: "-"}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : (
										<div className="text-gray-500">No MBE payouts</div>
									)}
								</div>
								<div>
									<div className="font-semibold mb-2">Paid Partners</div>
									{selectedPayout.partnerPayouts &&
									selectedPayout.partnerPayouts.length > 0 ? (
										<div className="overflow-x-auto">
											<table className="min-w-full text-xs border">
												<thead>
													<tr className="bg-gray-100">
														<th className="p-2 border">Name</th>
														<th className="p-2 border">Email</th>
														<th className="p-2 border">Account</th>
														<th className="p-2 border">Bank</th>
														<th className="p-2 border">Amount</th>
														<th className="p-2 border">Status</th>
														<th className="p-2 border">Paid At</th>
													</tr>
												</thead>
												<tbody>
													{selectedPayout.partnerPayouts.map((partner) => (
														<tr key={partner.partnerPayoutId}>
															<td className="p-2 border">
																{partner.partner
																	? `${partner.partner.firstName} ${partner.partner.lastName}`
																	: "-"}
															</td>
															<td className="p-2 border">
																{partner.partner?.email ?? "-"}
															</td>
															<td className="p-2 border">
																{partner.accountNumber}
															</td>
															<td className="p-2 border">{partner.bankName}</td>
															<td className="p-2 border">{partner.amount}</td>
															<td className="p-2 border">{partner.status}</td>
															<td className="p-2 border">
																{partner.paidAt
																	? new Date(partner.paidAt).toLocaleString()
																	: "-"}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : (
										<div className="text-gray-500">No Partner payouts</div>
									)}
								</div>
							</div>
						) : null}
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onPress={closeModal}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default PayoutHistoryTable;
