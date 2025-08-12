"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { capitalize } from "@/lib";
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
	Select,
	SelectItem,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { useMobiflexLeaderboard } from "@/hooks/mobiflex";

const columns: ColumnDef[] = [
	{ name: "Agent ID", uid: "agentId", sortable: true },
	{ name: "Agent Name", uid: "agentName", sortable: true },
	{ name: "Partner Name", uid: "partnerName", sortable: true },
	{ name: "Total Commission", uid: "totalCommission", sortable: true },
	{ name: "Commission Per Loan", uid: "commissionPerLoan", sortable: true },
	{ name: "Loan Count", uid: "loanCount", sortable: true },
	{ name: "State", uid: "state", sortable: true },
	{ name: "Performance Rating", uid: "performanceRating", sortable: true },
	{ name: "Commission Rank", uid: "commissionRank", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Display columns for table view
const displayColumns: ColumnDef[] = [
	{ name: "Agent Name", uid: "agentName", sortable: true },
	{ name: "Partner Name", uid: "partnerName", sortable: true },
	{ name: "Total Commission", uid: "totalCommission", sortable: true },
	{ name: "Commission Per Loan", uid: "commissionPerLoan", sortable: true },
	{ name: "Loan Count", uid: "loanCount", sortable: true },
	{ name: "Performance Rating", uid: "performanceRating", sortable: true },
	{ name: "Commission Rank", uid: "commissionRank", sortable: true },
	{ name: "Actions", uid: "actions" },
];

type CommissionRecord = {
	agentId: string;
	agentName: string;
	partnerName: string;
	totalCommission: number;
	commissionPerLoan: number;
	loanCount: number;
	state: string;
	performanceRating: string;
	commissionRank: number;
};

export default function MobiflexCommissionReportView() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<
		"daily" | "weekly" | "monthly" | "yearly" | "mtd" | undefined
	>("monthly");

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "totalCommission",
		direction: "descending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
		// Clear period when date range is selected - date takes precedence
		if (start) {
			setSelectedPeriod(undefined as any);
		}
	};

	// --- handle period change ---
	const handlePeriodChange = (
		period: "daily" | "weekly" | "monthly" | "yearly" | "mtd"
	) => {
		setSelectedPeriod(period);
		// Clear date range when period is selected - period takes precedence
		setStartDate(undefined);
		setEndDate(undefined);
	};

	// Fetch data using Mobiflex leaderboard hook with period only
	// Date range filtering disabled for now - only period filtering works
	const { data: leaderboardData, isLoading } =
		useMobiflexLeaderboard(selectedPeriod);

	// Performance rating helper
	const getPerformanceRating = (commission: number, avgCommission: number) => {
		if (commission >= avgCommission * 1.5) return "Excellent";
		if (commission >= avgCommission * 1.2) return "Good";
		if (commission >= avgCommission * 0.8) return "Average";
		return "Below Average";
	};

	// Transform leaderboard data to commission records
	const commissionRecords = useMemo(() => {
		if (!leaderboardData?.leaderboard) {
			setHasNoRecords(true);
			return [];
		}

		setHasNoRecords(false);
		const agents = leaderboardData.leaderboard;
		const totalCommission = agents.reduce(
			(sum, agent) => sum + (agent.totalCommission || 0),
			0
		);
		const avgCommission = totalCommission / agents.length;

		return agents.map((agent, index) => ({
			agentId: agent.mbeId || "N/A",
			agentName:
				`${agent.firstName || ""} ${agent.lastName || ""}`.trim() || "N/A",
			partnerName: agent.partnerName || "N/A",
			totalCommission: agent.totalCommission || 0,
			commissionPerLoan:
				agent.loanCount > 0
					? (agent.totalCommission || 0) / agent.loanCount
					: 0,
			loanCount: agent.loanCount || 0,
			state: agent.state || "N/A",
			performanceRating: getPerformanceRating(
				agent.totalCommission || 0,
				avgCommission
			),
			commissionRank: index + 1,
		}));
	}, [leaderboardData]);

	// Filter logic
	const filtered = useMemo(() => {
		let list = [...commissionRecords];
		if (filterValue) {
			list = list.filter(
				(record) =>
					record.agentName.toLowerCase().includes(filterValue.toLowerCase()) ||
					record.partnerName
						.toLowerCase()
						.includes(filterValue.toLowerCase()) ||
					record.state.toLowerCase().includes(filterValue.toLowerCase()) ||
					record.performanceRating
						.toLowerCase()
						.includes(filterValue.toLowerCase())
			);
		}
		return list;
	}, [commissionRecords, filterValue]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof CommissionRecord];
			const bVal = b[sortDescriptor.column as keyof CommissionRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export function
	const exportFn = async (data: CommissionRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Mobiflex Commission Analysis");
		ws.columns = columns
			.filter((c) => c.uid !== "actions")
			.map((c) => ({
				header: c.name,
				key: c.uid,
				width: 20,
			}));
		data.forEach((r) => ws.addRow(r));
		const buf = await wb.xlsx.writeBuffer();

		// Generate filename based on active filter mode
		const filterSuffix = startDate
			? `${startDate}_to_${endDate}`
			: selectedPeriod || "all";

		saveAs(
			new Blob([buf]),
			`mobiflex_commission_${filterSuffix}_${
				new Date().toISOString().split("T")[0]
			}.xlsx`
		);
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(amount);
	};

	// Performance rating color map
	const performanceColorMap: Record<string, ChipProps["color"]> = {
		Excellent: "success",
		Good: "primary",
		Average: "warning",
		"Below Average": "danger",
	};

	// Render each cell
	const renderCell = (row: CommissionRecord, key: string) => {
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
							<DropdownItem key="view">View Details</DropdownItem>
							<DropdownItem key="commission-history">
								Commission History
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "totalCommission" || key === "commissionPerLoan") {
			return (
				<div className="text-sm font-medium text-green-600">
					{formatCurrency((row as any)[key])}
				</div>
			);
		}

		if (key === "performanceRating") {
			return (
				<Chip
					size="sm"
					variant="flat"
					color={performanceColorMap[row.performanceRating]}
				>
					{row.performanceRating}
				</Chip>
			);
		}

		if (key === "commissionRank") {
			return (
				<Chip
					size="sm"
					variant="flat"
					color={
						row.commissionRank <= 3
							? "success"
							: row.commissionRank <= 10
							? "warning"
							: "default"
					}
				>
					#{row.commissionRank}
				</Chip>
			);
		}

		if (key === "agentName") {
			return (
				<div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600">
					{row.agentName}
				</div>
			);
		}

		return <div className="text-sm text-gray-900">{(row as any)[key]}</div>;
	};

	return (
		<>
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Mobiflex Commission Analysis Report
				</h1>
				<p className="text-gray-600">
					Detailed commission breakdown and performance analysis for all agents
				</p>
			</div>

			{/* Period Selector */}
			<div className="mb-4">
				<Select
					label="Select Period"
					placeholder="Choose reporting period"
					selectedKeys={selectedPeriod ? [selectedPeriod] : []}
					onSelectionChange={(keys) => {
						const value = Array.from(keys)[0] as string;
						handlePeriodChange(
							value as "daily" | "weekly" | "monthly" | "yearly" | "mtd"
						);
					}}
					className="max-w-xs"
				>
					<SelectItem key="daily" value="daily">
						Daily
					</SelectItem>
					<SelectItem key="weekly" value="weekly">
						Weekly
					</SelectItem>
					<SelectItem key="monthly" value="monthly">
						Monthly
					</SelectItem>
					<SelectItem key="yearly" value="yearly">
						Yearly
					</SelectItem>
					<SelectItem key="mtd" value="mtd">
						Month to Date (MTD)
					</SelectItem>
				</Select>
			</div>

			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable<CommissionRecord>
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
					sortDescriptor={sortDescriptor}
					onSortChange={setSortDescriptor}
					page={page}
					pages={pages}
					onPageChange={setPage}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={hasNoRecords}
					searchPlaceholder="Search by agent name, partner, state, or performance rating..."
				/>
			)}
		</>
	);
}
