import React, { useMemo, useState } from "react";
import { useCommissionsData } from "./useCommissionsData";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const columns: ColumnDef[] = [
	{ name: "Type", uid: "type", sortable: true },
	{ name: "Name", uid: "name", sortable: true },
	{ name: "Total Commission", uid: "totalCommission", sortable: true },
	{ name: "Agent Commission", uid: "totalAgentCommission", sortable: true },
	{ name: "Amount Paid (Agent)", uid: "amountPaidAgent", sortable: true },
	{ name: "Amount Left (Agent)", uid: "amountLeftAgent", sortable: true },
	{ name: "Number Paid (Agent)", uid: "numberPaidAgent", sortable: true },
	{ name: "Number Left (Agent)", uid: "numberLeftAgent", sortable: true },
	{ name: "Partner Commission", uid: "totalPartnerCommission", sortable: true },
	{ name: "Amount Paid (Partner)", uid: "amountPaidPartner", sortable: true },
	{ name: "Amount Left (Partner)", uid: "amountLeftPartner", sortable: true },
	{ name: "Number Paid (Partner)", uid: "numberPaidPartner", sortable: true },
	{ name: "Number Left (Partner)", uid: "numberLeftPartner", sortable: true },
	{ name: "Commission Count", uid: "commissionCount", sortable: true },
];

function flattenRows(data: any) {
	if (!data?.agents) return [];
	// Agent summary
	const agentRows = data.agents.map((agent: any) => {
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
		const amountPaidAgent = commissions
			.filter((c: any) => c.agentPaid)
			.reduce((sum: number, c: any) => sum + (c.mbeCommission || 0), 0);
		const amountLeftAgent = commissions
			.filter((c: any) => !c.agentPaid)
			.reduce((sum: number, c: any) => sum + (c.mbeCommission || 0), 0);
		const numberPaidAgent = commissions.filter((c: any) => c.agentPaid).length;
		const numberLeftAgent = commissions.filter((c: any) => !c.agentPaid).length;
		const amountPaidPartner = commissions
			.filter((c: any) => c.partnerPaid)
			.reduce((sum: number, c: any) => sum + (c.partnerCommission || 0), 0);
		const amountLeftPartner = commissions
			.filter((c: any) => !c.partnerPaid)
			.reduce((sum: number, c: any) => sum + (c.partnerCommission || 0), 0);
		const numberPaidPartner = commissions.filter(
			(c: any) => c.partnerPaid
		).length;
		const numberLeftPartner = commissions.filter(
			(c: any) => !c.partnerPaid
		).length;
		return {
			type: "Agent",
			name: `${agent.firstname} ${agent.lastname}`,
			totalCommission,
			totalAgentCommission,
			amountPaidAgent,
			amountLeftAgent,
			numberPaidAgent,
			numberLeftAgent,
			totalPartnerCommission,
			amountPaidPartner,
			amountLeftPartner,
			numberPaidPartner,
			numberLeftPartner,
			commissionCount,
		};
	});
	// Partner summary
	const partnerMap = new Map();
	data.agents.forEach((agent: any) => {
		const partnerId = agent.scanPartner?.userId || "N/A";
		const partnerName =
			agent.scanPartner?.companyName || agent.scanPartner?.firstName || "N/A";
		if (!partnerMap.has(partnerId)) {
			partnerMap.set(partnerId, {
				type: "Partner",
				name: partnerName,
				totalCommission: 0,
				totalAgentCommission: 0,
				totalPartnerCommission: 0,
				amountPaidAgent: 0,
				amountLeftAgent: 0,
				numberPaidAgent: 0,
				numberLeftAgent: 0,
				amountPaidPartner: 0,
				amountLeftPartner: 0,
				numberPaidPartner: 0,
				numberLeftPartner: 0,
				commissionCount: 0,
			});
		}
		const partner = partnerMap.get(partnerId);
		const commissions = agent.Commission || [];
		partner.totalCommission += commissions.reduce(
			(sum: number, c: any) => sum + (c.commission || 0),
			0
		);
		partner.totalAgentCommission += commissions.reduce(
			(sum: number, c: any) => sum + (c.mbeCommission || 0),
			0
		);
		partner.totalPartnerCommission += commissions.reduce(
			(sum: number, c: any) => sum + (c.partnerCommission || 0),
			0
		);
		partner.amountPaidAgent += commissions
			.filter((c: any) => c.agentPaid)
			.reduce((sum: number, c: any) => sum + (c.mbeCommission || 0), 0);
		partner.amountLeftAgent += commissions
			.filter((c: any) => !c.agentPaid)
			.reduce((sum: number, c: any) => sum + (c.mbeCommission || 0), 0);
		partner.numberPaidAgent += commissions.filter(
			(c: any) => c.agentPaid
		).length;
		partner.numberLeftAgent += commissions.filter(
			(c: any) => !c.agentPaid
		).length;
		partner.amountPaidPartner += commissions
			.filter((c: any) => c.partnerPaid)
			.reduce((sum: number, c: any) => sum + (c.partnerCommission || 0), 0);
		partner.amountLeftPartner += commissions
			.filter((c: any) => !c.partnerPaid)
			.reduce((sum: number, c: any) => sum + (c.partnerCommission || 0), 0);
		partner.numberPaidPartner += commissions.filter(
			(c: any) => c.partnerPaid
		).length;
		partner.numberLeftPartner += commissions.filter(
			(c: any) => !c.partnerPaid
		).length;
		partner.commissionCount += commissions.length;
	});
	const partnerRows = Array.from(partnerMap.values());
	return [...agentRows, ...partnerRows];
}

const CommissionSummaryTable = () => {
	const { data, isLoading } = useCommissionsData();
	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState<{
		column: string;
		direction: "ascending" | "descending";
	}>({ column: "summary", direction: "descending" });
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
		const ws = wb.addWorksheet("Commission Summary");
		ws.columns = columns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));
		rows.forEach((r) => ws.addRow(r));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Commission_Summary.xlsx");
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
		/>
	);
};

export default CommissionSummaryTable;
