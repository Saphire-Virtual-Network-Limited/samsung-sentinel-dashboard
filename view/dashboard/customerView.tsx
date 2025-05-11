"use client";

import React from "react";
import useSWR from "swr";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, Pagination, Selection, ChipProps, SortDescriptor } from "@heroui/react";
import { getAllLoanRecord } from "@/lib";
import { ChevronDownIcon, DownloadIcon, EllipsisVertical, SearchIcon } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export function capitalize(s: string) {
	return s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}

const calculateAge = (dob: string) => {
	const birth = new Date(dob),
		today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
	return age;
};

export const columns = [
	{ name: "Name", uid: "fullName", sortable: true },
	{ name: "Email", uid: "email", sortable: true },
	{ name: "BVN Phone", uid: "bvnPhoneNumber" },
	{ name: "Main Phone", uid: "mainPhoneNumber" },
	{ name: "Age", uid: "age" },
	{ name: "DOB Match", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

export const statusOptions = [
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

const fetcher = async () => {
	const { data } = await getAllLoanRecord();
	return data.map((r: any) => ({
		fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
		email: r.email,
		age: calculateAge(r.dob),
		bvnPhoneNumber: r.bvnPhoneNumber,
		mainPhoneNumber: r.mainPhoneNumber,
		status: r.dobMisMatch ? "rejected" : "approved",
	}));
};

export default function App() {
	const [filterValue, setFilterValue] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
	const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
		column: "fullName",
		direction: "ascending",
	});
	const [page, setPage] = React.useState(1);
	const rowsPerPage = 10;

	const { data: customerRecords = [], isLoading } = useSWR("customer-records", fetcher, { refreshInterval: 5000 });

	const filteredItems = React.useMemo(() => {
		let list = [...customerRecords];
		if (filterValue) {
			list = list.filter((r) => r.fullName.toLowerCase().includes(filterValue.toLowerCase()) || r.email.toLowerCase().includes(filterValue.toLowerCase()));
		}
		if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
			list = list.filter((r) => Array.from(statusFilter).includes(r.status));
		}
		return list;
	}, [customerRecords, filterValue, statusFilter]);

	const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;
	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filteredItems.slice(start, start + rowsPerPage);
	}, [page, filteredItems]);

	const sortedItems = React.useMemo(() => {
		return [...items].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof CustomerRecord];
			const bVal = b[sortDescriptor.column as keyof CustomerRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [items, sortDescriptor]);

	const exportToExcel = async (data: CustomerRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Customers");
		ws.columns = [
			{ header: "Name", key: "fullName", width: 30 },
			{ header: "Email", key: "email", width: 30 },
			{ header: "BVN Phone", key: "bvnPhoneNumber", width: 20 },
			{ header: "Main Phone", key: "mainPhoneNumber", width: 20 },
			{ header: "Age", key: "age", width: 10 },
			{ header: "DOB Match", key: "status", width: 15 },
		];
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status) }));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Customer_Records.xlsx");
	};

	const renderCell = React.useCallback((rec: CustomerRecord, key: React.Key) => {
		const v = rec[key as keyof CustomerRecord];
		switch (key) {
			case "fullName":
				return <p className="capitalize">{v}</p>;
			case "status":
				return (
					<Chip
						className="capitalize"
						color={statusColorMap[rec.status]}
						size="sm"
						variant="flat">
						{capitalize(rec.status)}
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
				return <p className="text-small">{v}</p>;
		}
	}, []);

	const renderSkeleton = () => (
		<TableRow>
			{columns.map((c) => (
				<TableCell key={c.uid}>
					<div className="skeleton w-full h-6" />
				</TableCell>
			))}
		</TableRow>
	);

	const topContent = (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between gap-3 items-end">
				<Input
					isClearable
					className="w-full sm:max-w-[44%]"
					placeholder="Search by name or email…"
					startContent={<SearchIcon />}
					value={filterValue}
					onClear={() => setFilterValue("")}
					onValueChange={(v) => {
						setFilterValue(v);
						setPage(1);
					}}
				/>
				<div className="flex gap-3">
					<Dropdown>
						<DropdownTrigger className="hidden sm:flex">
							<Button
								variant="flat"
								endContent={<ChevronDownIcon />}>
								Status
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							disallowEmptySelection
							closeOnSelect={false}
							selectedKeys={statusFilter}
							selectionMode="multiple"
							onSelectionChange={setStatusFilter}>
							{statusOptions.map((s) => (
								<DropdownItem
									key={s.uid}
									className="capitalize">
									{capitalize(s.name)}
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
					<Button
						color="primary"
						endContent={<DownloadIcon className="w-3" />}
						onClick={() => exportToExcel(filteredItems)}>
						Export
					</Button>
				</div>
			</div>
			<span className="text-small text-default-400">Total {customerRecords.length} records</span>
		</div>
	);

	const bottomContent = (
		<div className="py-2 px-2 flex justify-between items-center">
			<Pagination
				isCompact
				showControls
				showShadow
				color="primary"
				page={page}
				total={pages}
				onChange={setPage}
			/>
			<div className="hidden sm:flex w-[30%] justify-end gap-2">
				<Button
					isDisabled={page <= 1}
					size="sm"
					variant="flat"
					onPress={() => setPage(page - 1)}>
					Previous
				</Button>
				<Button
					isDisabled={page >= pages}
					size="sm"
					variant="flat"
					onPress={() => setPage(page + 1)}>
					Next
				</Button>
			</div>
		</div>
	);

	return (
		<Table
			isHeaderSticky
			aria-label="customer records"
			topContent={topContent}
			bottomContent={bottomContent}
			bottomContentPlacement="outside"
			topContentPlacement="outside"
			classNames={{ wrapper: "max-h-[calc(100dvh_-_150px)]", tr: "cursor-pointer" }}
			selectionMode="single"
			color="primary"
			radius="md"
			shadow="sm"
			sortDescriptor={sortDescriptor}
			onSortChange={setSortDescriptor}
			isVirtualized>
			<TableHeader columns={columns}>
				{(col) => (
					<TableColumn
						key={col.uid}
						align={col.uid === "actions" ? "center" : "start"}
						allowsSorting={col.sortable}>
						{col.name}
					</TableColumn>
				)}
			</TableHeader>
			<TableBody
				emptyContent="No records"
				items={isLoading ? new Array(rowsPerPage).fill(null) : sortedItems}>
				{(item) => (isLoading ? renderSkeleton() : <TableRow key={item.fullName}>{(colKey) => <TableCell>{renderCell(item, colKey)}</TableCell>}</TableRow>)}
			</TableBody>
		</Table>
	);
}
