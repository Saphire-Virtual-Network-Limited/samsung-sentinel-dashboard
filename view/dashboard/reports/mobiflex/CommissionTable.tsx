"use client";
import React, { useMemo, useState } from "react";
import { useCommissionsData } from "./useCommissionsData";
import ConfirmationModal from "@/components/reususables/custom-ui/ConfirmationModal";
import {
	markAgentPaid,
	markPartnerPaid,
	markBothPaid,
	unmarkAgentPaid,
	unmarkPartnerPaid,
	unmarkBothPaid,
} from "@/lib/api";
import { showToast } from "@/lib/showNotification";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";

import {
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const columns: ColumnDef[] = [
	{ name: "Agent", uid: "agent", sortable: true },
	{ name: "MBE ID", uid: "mbeId", sortable: true },
	{ name: "Partner", uid: "partner", sortable: true },
	{ name: "Commission", uid: "commission", sortable: true },
	{ name: "Agent Commission", uid: "mbeCommission", sortable: true },
	{ name: "Partner Commission", uid: "partnerCommission", sortable: true },
	{ name: "Split %", uid: "splitPercent", sortable: true },
	{ name: "Agent Paid", uid: "agentPaid", sortable: true },
	{ name: "Partner Paid", uid: "partnerPaid", sortable: true },
	{ name: "Fully Paid", uid: "fullyPaid", sortable: true },
	{ name: "Status", uid: "paymentStatus", sortable: true },
	{ name: "Date", uid: "date_created", sortable: true },
	{ name: "Actions", uid: "actions" },
];

function flattenRows(data: any) {
	if (!data?.agents) return [];
	return data.agents.flatMap((agent: any) =>
		(agent.Commission || []).map((commission: any) => ({
			commissionId: commission.commissionId,
			agent: `${agent.firstname} ${agent.lastname}`,
			mbeId: agent.mbeId,
			partner:
				agent.scanPartner?.companyName || agent.scanPartner?.firstName || "N/A",
			commission: commission.commission,
			mbeCommission: commission.mbeCommission,
			partnerCommission: commission.partnerCommission,
			splitPercent: commission.splitPercent,
			agentPaid: commission.agentPaid ? "Paid" : "Unpaid",
			partnerPaid: commission.partnerPaid ? "Paid" : "Unpaid",
			fullyPaid: commission.agentPaid && commission.partnerPaid ? "Yes" : "No",
			paymentStatus: commission.paymentStatus,
			date_created: commission.date_created
				? new Date(commission.date_created).toLocaleDateString()
				: "N/A",
			raw: commission,
		}))
	);
}

const CommissionTable = () => {
	const { data, isLoading } = useCommissionsData();
	const [modal, setModal] = useState<{
		open: boolean;
		row?: any;
		who?: "agent" | "partner" | "both";
		loading?: boolean;
		action?: "mark" | "unmark";
	}>({ open: false });
	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState<{
		column: string;
		direction: "ascending" | "descending";
	}>({ column: "date_created", direction: "descending" });
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;
	const allRows = useMemo(() => flattenRows(data), [data]);
	const filtered = useMemo(() => {
		if (!filterValue) return allRows;
		const f = filterValue.toLowerCase();
		return allRows.filter((row: any) =>
			Object.values(row).some((v) => String(v).toLowerCase().includes(f))
		);
	}, [allRows, filterValue]);
	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);
	const sorted = useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column];
			const bVal = b[sortDescriptor.column];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	const exportFn = async (rows: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Commissions");
		ws.columns = columns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));
		rows.forEach((r) => ws.addRow(r));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Commissions.xlsx");
	};

	const renderCell = (row: any, key: string) => {
		if (key === "actions") {
			return (
				<div className="flex gap-2">
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								...
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem
								key="markAgentPaid"
								onPress={() =>
									setModal({ open: true, row, who: "agent", action: "mark" })
								}
							>
								Mark Agent Paid
							</DropdownItem>
							<DropdownItem
								key="markPartnerPaid"
								onPress={() =>
									setModal({ open: true, row, who: "partner", action: "mark" })
								}
							>
								Mark Partner Paid
							</DropdownItem>
							<DropdownItem
								key="markBothPaid"
								onPress={() =>
									setModal({ open: true, row, who: "both", action: "mark" })
								}
							>
								Mark Both Paid
							</DropdownItem>
							<DropdownItem
								key="unmarkAgentPaid"
								onPress={() =>
									setModal({ open: true, row, who: "agent", action: "unmark" })
								}
							>
								Unmark Agent Paid
							</DropdownItem>
							<DropdownItem
								key="unmarkPartnerPaid"
								onPress={() =>
									setModal({
										open: true,
										row,
										who: "partner",
										action: "unmark",
									})
								}
							>
								Unmark Partner Paid
							</DropdownItem>
							<DropdownItem
								key="unmarkBothPaid"
								onPress={() =>
									setModal({ open: true, row, who: "both", action: "unmark" })
								}
							>
								Unmark Both Paid
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}
		if (key === "agentPaid" || key === "partnerPaid") {
			return (
				<span
					className={row[key] === "Paid" ? "text-green-600" : "text-red-600"}
				>
					{row[key]}
				</span>
			);
		}
		if (key === "fullyPaid") {
			return (
				<span
					className={row[key] === "Yes" ? "text-green-600" : "text-red-600"}
				>
					{row[key]}
				</span>
			);
		}
		return <span>{row[key]}</span>;
	};

	// Mark/unmark paid handler with API call, confirmation, and toast
	const handleConfirm = async () => {
		if (!modal.row || !modal.who || !modal.action) return;
		setModal((m) => ({ ...m, loading: true }));
		try {
			let res;
			if (modal.action === "mark") {
				if (modal.who === "agent") {
					res = await markAgentPaid(modal.row.commissionId);
				} else if (modal.who === "partner") {
					res = await markPartnerPaid(modal.row.commissionId);
				} else {
					res = await markBothPaid(modal.row.commissionId);
				}
			} else {
				if (modal.who === "agent") {
					res = await unmarkAgentPaid(modal.row.commissionId);
				} else if (modal.who === "partner") {
					res = await unmarkPartnerPaid(modal.row.commissionId);
				} else {
					res = await unmarkBothPaid(modal.row.commissionId);
				}
			}
			showToast({
				type: "success",
				message:
					res?.message ||
					(modal.action === "mark" ? "Marked as paid" : "Unmarked as paid"),
			});
			setModal({ open: false });
			// Optionally: trigger data refresh here
		} catch (e: any) {
			showToast({
				type: "error",
				message:
					e?.message ||
					(modal.action === "mark"
						? "Failed to mark as paid"
						: "Failed to unmark as paid"),
			});
			setModal((m) => ({ ...m, loading: false }));
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (!data) return <div>No data</div>;

	return (
		<>
			<GenericTable
				columns={columns}
				data={sorted}
				allCount={filtered.length}
				exportData={filtered}
				isLoading={isLoading}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				sortDescriptor={{
					column: sortDescriptor.column,
					direction: sortDescriptor.direction,
				}}
				onSortChange={(sd) => {
					setSortDescriptor({
						column: String(sd.column),
						direction: sd.direction as "ascending" | "descending",
					});
				}}
				page={page}
				pages={pages}
				onPageChange={setPage}
				exportFn={exportFn}
				renderCell={renderCell}
				hasNoRecords={filtered.length === 0}
				selectionMode="multiple"
				// Optionally: onSelectionChange, selectedKeys, etc.
			/>
			<ConfirmationModal
				isOpen={modal.open}
				onClose={() => setModal({ open: false })}
				onConfirm={handleConfirm}
				isLoading={modal.loading}
				title={
					modal.action === "mark"
						? modal.who === "agent"
							? "Mark Agent Paid"
							: modal.who === "partner"
							? "Mark Partner Paid"
							: "Mark Both Paid"
						: modal.who === "agent"
						? "Unmark Agent Paid"
						: modal.who === "partner"
						? "Unmark Partner Paid"
						: "Unmark Both Paid"
				}
				description={(() => {
					if (!modal.row) return "";
					const agentName = modal.row.agent;
					const partnerName = modal.row.partner;
					const agentAmount = modal.row.mbeCommission;
					const partnerAmount = modal.row.partnerCommission;
					if (modal.who === "agent") {
						return `${
							modal.action === "mark" ? "Mark" : "Unmark"
						} commission for agent: ${agentName} (₦${agentAmount})?`;
					}
					if (modal.who === "partner") {
						return `${
							modal.action === "mark" ? "Mark" : "Unmark"
						} commission for partner: ${partnerName} (₦${partnerAmount})?`;
					}
					if (modal.who === "both") {
						return `${
							modal.action === "mark" ? "Mark" : "Unmark"
						} commission for agent: ${agentName} (₦${agentAmount}) and partner: ${partnerName} (₦${partnerAmount})?`;
					}
					return "";
				})()}
				confirmText={
					modal.action === "mark" ? "Yes, Mark as Paid" : "Yes, Unmark as Paid"
				}
				cancelText="Cancel"
				variant={modal.action === "mark" ? "primary" : "warning"}
			/>
		</>
	);
};

export default CommissionTable;
