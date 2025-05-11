// app/customers/page.tsx
"use client";

import React from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllLoanRecord, capitalize, calculateAge } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, DropdownItem, DropdownMenu, Dropdown, DropdownTrigger, Chip, SortDescriptor, ChipProps } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "fullName", sortable: true },
	{ name: "Email", uid: "email", sortable: true },
	{ name: "BVN Phone", uid: "bvnPhoneNumber" },
	{ name: "Main Phone", uid: "mainPhoneNumber" },
	{ name: "Age", uid: "age" },
	{ name: "DOB Match", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "Pending", uid: "pending" },
	{ name: "Approved", uid: "approved" },
	{ name: "Rejected", uid: "rejected" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	approved: "success",
	rejected: "danger",
};

type CustomerRecord = {
	fullName: string;
	email: string;
	age: number;
	bvnPhoneNumber: string;
	mainPhoneNumber: string;
	status: string;
};

export default function CustomerPage() {
	const [filterValue, setFilterValue] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
		column: "fullName",
		direction: "ascending",
	});
	const [page, setPage] = React.useState(1);
	const rowsPerPage = 10;

	const { data: raw = [], isLoading } = useSWR("customer-records", () => getAllLoanRecord().then((r) => r.data), { refreshInterval: 5000 });

	const customers = React.useMemo(() => {
		return raw.map((r: any) => ({
			fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
			email: r.email,
			age: calculateAge(r.dob),
			bvnPhoneNumber: r.bvnPhoneNumber,
			mainPhoneNumber: r.mainPhoneNumber,
			status: r.dobMisMatch ? "rejected" : "approved",
		}));
	}, [raw]);

	const filtered = React.useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => c.fullName.toLowerCase().includes(f) || c.email.toLowerCase().includes(f));
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.status));
		}
		return list;
	}, [customers, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof CustomerRecord];
			const bVal = b[sortDescriptor.column as keyof CustomerRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	const exportFn = async (data: CustomerRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Customers");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status) }));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Customer_Records.xlsx");
	};

	const renderCell = (row: CustomerRecord, key: string) => {
		switch (key) {
			case "fullName":
				return <p className="capitalize">{row.fullName}</p>;
			case "status":
				return (
					<Chip
						className="capitalize"
						color={statusColorMap[row.status]}
						size="sm"
						variant="flat">
						{capitalize(row.status)}
					</Chip>
				);
			case "actions":
				return (
					<div className="relative flex justify-end items-center gap-2">
						<Dropdown>
							<DropdownTrigger>
								<Button
									isIconOnly
									size="sm"
									variant="light">
									<EllipsisVertical className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem key="view">View</DropdownItem>
								<DropdownItem key="edit">Edit</DropdownItem>
								<DropdownItem key="delete">Delete</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <p className="text-small">{(row as any)[key]}</p>;
		}
	};

	return (
		<GenericTable<CustomerRecord>
			columns={columns}
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
			showStatus={false} // toggle to false to hide the status column
			sortDescriptor={sortDescriptor}
			onSortChange={setSortDescriptor}
			page={page}
			pages={pages}
			onPageChange={setPage}
			exportFn={exportFn}
			renderCell={renderCell}
		/>
	);
}
