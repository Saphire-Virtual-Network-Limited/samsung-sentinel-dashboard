"use client";

import React from "react";
import useSWR from "swr";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Pagination, Selection, ChipProps, SortDescriptor } from "@heroui/react";
import { getAllLoanRecord } from "@/lib";
import { ChevronDownIcon, EllipsisVertical, PlusIcon, SearchIcon } from "lucide-react";

// Helper function to capitalize each word
export function capitalize(s: string) {
	return s ? s.replace(/\b\w/g, (char) => char.toUpperCase()) : "";
}

// Function to calculate age from DOB
const calculateAge = (dob: string) => {
	const birthDate = new Date(dob);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const month = today.getMonth();
	const day = today.getDate();
	if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
		age--;
	}
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
	const response = await getAllLoanRecord();
	return response.data.map((record: any) => ({
		fullName: `${capitalize(record.firstName)} ${capitalize(record.lastName)}`,
		email: record.email,
		age: calculateAge(record.dob),
		bvnPhoneNumber: record.bvnPhoneNumber,
		mainPhoneNumber: record.mainPhoneNumber,
		// Use dobMisMatch as status: if true, status is 'rejected', if false, status is 'approved'
		status: record.dobMisMatch ? "rejected" : "approved",
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

	// SWR hook to fetch data
	const { data: customerRecords = [], isLoading } = useSWR("customer-records", fetcher, {
		refreshInterval: 5000,
	});

	const hasSearchFilter = Boolean(filterValue);

	const filteredItems = React.useMemo(() => {
		let filtered = [...customerRecords];

		// If there's a search filter, filter by both fullName and email
		if (hasSearchFilter) {
			filtered = filtered.filter((r) => r.fullName.toLowerCase().includes(filterValue.toLowerCase()) || r.email.toLowerCase().includes(filterValue.toLowerCase()));
		}

		if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
			filtered = filtered.filter((r) => Array.from(statusFilter).includes(r.status));
		}

		return filtered;
	}, [customerRecords, hasSearchFilter, filterValue, statusFilter]);

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

	const renderCell = React.useCallback((record: CustomerRecord, columnKey: React.Key) => {
		const cellValue = record[columnKey as keyof CustomerRecord];
		switch (columnKey) {
			case "fullName":
				return <p className="capitalize">{cellValue}</p>;
			case "email":
			case "bvnPhoneNumber":
			case "mainPhoneNumber":
				return <p className="text-small">{cellValue}</p>;
			case "status":
				return (
					<Chip
						className="capitalize"
						color={statusColorMap[record.status]}
						size="sm"
						variant="flat">
						{capitalize(record.status)}
					</Chip>
				);
			case "age":
				return <p className="text-small">{cellValue}</p>;
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

	// Skeleton loader content
	const renderSkeletonRow = () => {
		return (
			<TableRow>
				<TableCell>
					<div className="skeleton w-full h-6"></div>
				</TableCell>
				<TableCell>
					<div className="skeleton w-full h-6"></div>
				</TableCell>
				<TableCell>
					<div className="skeleton w-full h-6"></div>
				</TableCell>
				<TableCell>
					<div className="skeleton w-full h-6"></div>
				</TableCell>
				<TableCell>
					<div className="skeleton w-full h-6"></div>
				</TableCell>
				<TableCell>
					<div className="skeleton w-full h-6"></div>
				</TableCell>
				<TableCell>
					<div className="skeleton w-full h-6"></div>
				</TableCell>
			</TableRow>
		);
	};

	const topContent = (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between gap-3 items-end">
				<Input
					isClearable
					className="w-full sm:max-w-[44%]"
					placeholder="Search by customer name or email..."
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
						Add Customer
					</Button>
				</div>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-default-400 text-small">Total {customerRecords.length} records</span>
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
				wrapper: "max-h-[calc(100dvh_-_150px)]",
				tr: "cursor-pointer",
				th: " z-10",
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
				emptyContent="No customer records found"
				items={isLoading ? new Array(10).fill(null) : sortedItems}>
				{(item) => (isLoading ? renderSkeletonRow() : <TableRow key={item.fullName}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>)}
			</TableBody>
		</Table>
	);
}
