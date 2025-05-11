"use client";

import React from "react";
import useSWR from "swr";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Pagination, Selection, ChipProps, SortDescriptor } from "@heroui/react";
import { getAllLoanRecord } from "@/lib";
import { ChevronDownIcon, EllipsisVertical, PlusIcon, SearchIcon } from "lucide-react";

export function capitalize(s: string) {
	return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const columns = [
	{ name: "CUSTOMER NAME", uid: "customerName", sortable: true },
	{ name: "LOAN AMOUNT", uid: "loanAmount", sortable: true },
	{ name: "INTEREST RATE", uid: "interestRate", sortable: true },
	{ name: "LOAN TERM", uid: "loanTerm" },
	{ name: "LOAN TYPE", uid: "loanType" },
	{ name: "CREATED AT", uid: "createdAt", sortable: true },
	{ name: "STATUS", uid: "status", sortable: true },
	{ name: "ACTIONS", uid: "actions" },
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

type LoanRecord = {
	id: string;
	customerName: string;
	loanAmount: number;
	interestRate: number;
	loanTerm: string;
	loanType: string;
	createdAt: string;
	status: string;
};

const fetcher = async () => {
	const response = await getAllLoanRecord();
	return response.data.map((record: any, idx: number) => ({
		id: record.customerId,
		customerName: `${record.firstName} ${record.lastName}`,
		loanAmount: parseFloat((Math.random() * 50000 + 10000).toFixed(2)),
		interestRate: parseFloat((Math.random() * 10 + 5).toFixed(2)),
		loanTerm: `${Math.floor(Math.random() * 24 + 12)} months`,
		loanType: ["Personal", "Auto", "Home"][idx % 3],
		createdAt: new Date(Date.now() - idx * 86400000).toISOString().split("T")[0],
		status: ["pending", "approved", "rejected"][idx % 3],
	}));
};

export default function App() {
	const [filterValue, setFilterValue] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
	const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
		column: "loanAmount",
		direction: "ascending",
	});
	const [page, setPage] = React.useState(1);
	const rowsPerPage = 10;

	const { data: loanRecords = [] } = useSWR("loan-records", fetcher, {
		refreshInterval: 5000,
	});

	const hasSearchFilter = Boolean(filterValue);

	const filteredItems = React.useMemo(() => {
		let filtered = [...loanRecords];
		if (hasSearchFilter) {
			filtered = filtered.filter((r) => r.customerName.toLowerCase().includes(filterValue.toLowerCase()));
		}
		if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
			filtered = filtered.filter((r) => Array.from(statusFilter).includes(r.status));
		}
		return filtered;
	}, [loanRecords, hasSearchFilter, filterValue, statusFilter]);

	const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filteredItems.slice(start, start + rowsPerPage);
	}, [page, filteredItems]);

	const sortedItems = React.useMemo(() => {
		return [...items].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof LoanRecord];
			const bVal = b[sortDescriptor.column as keyof LoanRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [items, sortDescriptor]);

	const renderCell = React.useCallback((record: LoanRecord, columnKey: React.Key) => {
		const cellValue = record[columnKey as keyof LoanRecord];
		switch (columnKey) {
			case "customerName":
				return <p className="text-bold text-small capitalize">{cellValue}</p>;
			case "loanAmount":
				return <p className="text-bold text-small">{cellValue.toLocaleString()}</p>;
			case "status":
				return (
					<Chip
						className="capitalize"
						color={statusColorMap[record.status]}
						size="sm"
						variant="flat">
						{cellValue}
					</Chip>
				);
			case "createdAt":
				return <p className="text-small text-default-500">{cellValue}</p>;
			case "loanType":
				return <p className="capitalize">{cellValue}</p>;
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
				return cellValue;
		}
	}, []);

	const onSearchChange = (value?: string) => {
		setFilterValue(value ?? "");
		setPage(1);
	};

	const topContent = (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between gap-3 items-end">
				<Input
					isClearable
					className="w-full sm:max-w-[44%]"
					placeholder="Search by customer name..."
					startContent={<SearchIcon className="w-3" />}
					value={filterValue}
					onClear={() => onSearchChange("")}
					onValueChange={onSearchChange}
				/>
				<div className="flex gap-3">
					<Dropdown>
						<DropdownTrigger className="hidden sm:flex">
							<Button
								endContent={<ChevronDownIcon className="text-small" />}
								variant="flat">
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
						endContent={<PlusIcon />}>
						Add New Loan
					</Button>
				</div>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-default-400 text-small">Total {loanRecords.length} loans</span>
			</div>
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
			aria-label="customer records table"
			bottomContent={bottomContent}
			bottomContentPlacement="outside"
			classNames={{
				wrapper: "max-h-[calc(100dvh_-_150px)]", // Fit to screen height
				tr: "cursor-pointer",
				th: "bg-white z-10", // Opaque header, adjust color as needed
			}}
			selectionMode="single"
			color="primary"
			radius="md"
			shadow="sm"
			sortDescriptor={sortDescriptor}
			topContent={topContent}
			isVirtualized
			topContentPlacement="outside"
			onSortChange={setSortDescriptor}>
			<TableHeader columns={columns}>
				{(column) => (
					<TableColumn
						key={column.uid}
						align={column.uid === "actions" ? "center" : "start"}
						allowsSorting={column.sortable}>
						{column.name}
					</TableColumn>
				)}
			</TableHeader>
			<TableBody
				emptyContent="No loan records found"
				items={sortedItems}>
				{(item) => <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
			</TableBody>
		</Table>
	);
}
