import React, { useMemo, useState } from "react";
import { useCommissionsData } from "./useCommissionsData";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const columns: ColumnDef[] = [
	{ name: "Agent", uid: "agent", sortable: true },
	{ name: "MBE ID", uid: "mbeId", sortable: true },
	{ name: "Total Commission", uid: "totalCommission", sortable: true },
	{ name: "Agent Commission", uid: "totalAgentCommission", sortable: true },
	{ name: "Amount Paid", uid: "amountPaid", sortable: true },
	{ name: "Amount Left", uid: "amountLeft", sortable: true },
	{ name: "Number Paid", uid: "numberPaid", sortable: true },
	{ name: "Number Left", uid: "numberLeft", sortable: true },
	{ name: "Partner Commission", uid: "totalPartnerCommission", sortable: true },
	{ name: "Commission Count", uid: "commissionCount", sortable: true },
	{ name: "Partner", uid: "partner", sortable: true },
];

function flattenRows(data: any) {
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
		};
	});
}

const AgentCommissionTable = () => {
	const { data, isLoading } = useCommissionsData();
	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState<{
		column: string;
		direction: "ascending" | "descending";
	}>({ column: "totalCommission", direction: "descending" });
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
		const ws = wb.addWorksheet("Agent Commissions");
		ws.columns = columns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));
		rows.forEach((r) => ws.addRow(r));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Agent_Commissions.xlsx");
	};

	const renderCell = (row: any, key: string) => {
		return <span>{row[key]}</span>;
	};

	if (isLoading) return <div>Loading...</div>;
	if (!data) return <div>No data</div>;

	return (
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
				direction: sortDescriptor.direction as "ascending" | "descending",
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
		/>
	);
};

export default AgentCommissionTable;
