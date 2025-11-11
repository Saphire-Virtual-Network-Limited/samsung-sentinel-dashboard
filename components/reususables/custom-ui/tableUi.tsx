"use client";

import React, { useState } from "react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Input,
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Pagination,
	ChipProps,
	SortDescriptor,
} from "@heroui/react";
import {
	ChevronDownIcon,
	DownloadIcon,
	PlusIcon,
	SearchIcon,
} from "lucide-react";
import DateFilter from "./dateFilter";
import { showToast } from "@/lib";
import { usePathname } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { useAuth } from "@/lib";

export interface ColumnDef {
	name: string;
	uid: string;
	sortable?: boolean;
}

export interface AdditionalButton {
	text: string;
	onClick: () => void;
	isLoading?: boolean;
	color?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export interface GenericTableProps<T> {
	columns: ColumnDef[];
	data: T[]; // current page
	allCount: number; // total filtered
	exportData: T[]; // full filtered for export
	isLoading: boolean;
	filterValue: string;
	onFilterChange: (v: string) => void;
	statusOptions?: { name: string; uid: string }[];
	statusFilter?: Set<string>;
	onStatusChange?: (sel: Set<string>) => void;
	statusColorMap?: Record<string, ChipProps["color"]>;
	showStatus?: boolean;
	sortDescriptor: SortDescriptor;
	onSortChange: (sd: SortDescriptor) => void;
	page: number;
	pages: number;
	onPageChange: (p: number) => void;
	exportFn: (data: T[]) => void;
	renderCell: (row: T, columnKey: string) => React.ReactNode;
	hasNoRecords: boolean;
	onDateFilterChange?: (start: string, end: string) => void;
	initialStartDate?: string;
	initialEndDate?: string;
	defaultDateRange?: { days: number };
	createButton?: {
		text: string;
		onClick: () => void;
		isLoading?: boolean;
	};
	additionalButtons?: AdditionalButton[];
	// Built-in selection props
	selectionMode?: "none" | "single" | "multiple";
	selectedKeys?: Set<string>;
	onSelectionChange?: (keys: any) => void; // HeroUI can pass "all", Set<string>, or other values
	disabledKeys?: Set<string>;
	searchPlaceholder?: string;
	// Column visibility controls
	initialVisibleColumns?: string[]; // Optional preset of columns to show
	initialHiddenColumns?: string[]; // Optional preset of columns to hide
	showColumnSelector?: boolean; // Whether to show the columns dropdown
	// Rows per page controls
	rowsPerPageOptions?: number[]; // Available options for rows per page
	defaultRowsPerPage?: number; // Default number of rows per page
	showRowsPerPageSelector?: boolean; // Whether to show the rows per page selector
	onRowsPerPageChange?: (rowsPerPage: number) => void; // Callback for rows per page change
}

export default function GenericTable<T>(props: GenericTableProps<T>) {
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/customers -> dev)
	const role = pathname.split("/")[2];
	const { userResponse } = useAuth(); // get the user email
	const userEmail = userResponse?.email || "";

	const {
		columns,
		data,
		allCount,
		exportData,
		isLoading,
		filterValue,
		onFilterChange,
		statusOptions = [],
		statusFilter,
		onStatusChange = () => {},
		showStatus = true,
		sortDescriptor,
		onSortChange,
		page,
		pages,
		onPageChange,
		exportFn,
		renderCell,
		hasNoRecords,
		onDateFilterChange,
		initialStartDate,
		initialEndDate,
		defaultDateRange,
		createButton,
		additionalButtons,
		selectionMode = "single",
		selectedKeys,
		onSelectionChange,
		disabledKeys,
		searchPlaceholder,
		initialVisibleColumns,
		initialHiddenColumns,
		showColumnSelector = true,
		rowsPerPageOptions = [5, 10, 15, 20, 25, 30, 50, 70, 80, 100],
		defaultRowsPerPage = 10,
		showRowsPerPageSelector = false,
		onRowsPerPageChange,
	} = props;

	// Column visibility state
	const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
		const allColumnUids = columns.map((col) => col.uid);

		if (initialVisibleColumns && initialVisibleColumns.length > 0) {
			return new Set(initialVisibleColumns);
		}

		if (initialHiddenColumns && initialHiddenColumns.length > 0) {
			const visibleCols = allColumnUids.filter(
				(uid) => !initialHiddenColumns.includes(uid)
			);
			return new Set(visibleCols);
		}

		// Default: show all columns except actions
		return new Set(allColumnUids);
	});

	// Rows per page state
	const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

	// Exclude status column if hidden and apply column visibility
	const displayedColumns = [
		{ name: "S/N", uid: "serialNumber" },
		...(showStatus ? columns : columns.filter((c) => c.uid !== "status")),
	].filter((col) => visibleColumns.has(col.uid));

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(
		initialStartDate
	);
	const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);

	// Update local state when props change
	React.useEffect(() => {
		setStartDate(initialStartDate);
		setEndDate(initialEndDate);
	}, [initialStartDate, initialEndDate]);

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		if (!start || !end) {
			showToast({ message: "Both dates must be selected.", type: "error" });
			return;
		}
		if (new Date(end) < new Date(start)) {
			showToast({
				message: "End date must be after start date.",
				type: "error",
			});
			return;
		}
		setStartDate(start);
		setEndDate(end);
		onDateFilterChange?.(start, end);
	};

	const topContent = (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col md:flex-row justify-between gap-3.5 items-end md:items-start md:justify-center">
				<Input
					isClearable
					className="w-full sm:max-w-[44%]"
					placeholder={searchPlaceholder || "Search by ID, Name, BVN"}
					startContent={<SearchIcon className="w-3" />}
					value={filterValue}
					onClear={() => onFilterChange("")}
					onValueChange={onFilterChange}
				/>

				<div className="flex gap-2">
					{hasPermission(role, "canCreate", userEmail) ? (
						<div>
							{createButton && (
								<Button
									color="primary"
									variant="flat"
									className="px-8"
									endContent={<PlusIcon className="w-3" />}
									onPress={createButton.onClick}
									isLoading={createButton.isLoading}
								>
									{createButton.text}
								</Button>
							)}
						</div>
					) : null}

					{hasPermission(role, "canSync", userEmail) ? (
						<div>
							{additionalButtons?.map((button, index) => (
								<Button
									key={index}
									color={button.color || "primary"}
									variant="solid"
									className="px-8"
									onPress={button.onClick}
									isLoading={button.isLoading}
								>
									{button.text}
								</Button>
							))}
						</div>
					) : null}
				</div>

				{onDateFilterChange && (
					<DateFilter
						className="w-full flex justify-end"
						onFilterChange={handleDateFilter}
						initialStartDate={startDate}
						initialEndDate={endDate}
						isLoading={isLoading}
						defaultDateRange={defaultDateRange}
					/>
				)}
				<div className="flex gap-3">
					{showStatus &&
						statusOptions.length > 0 &&
						statusFilter &&
						onStatusChange && (
							<Dropdown>
								<DropdownTrigger className="hidden sm:flex">
									<Button variant="flat" endContent={<ChevronDownIcon />}>
										Status
									</Button>
								</DropdownTrigger>
								<DropdownMenu
									disallowEmptySelection
									closeOnSelect={false}
									selectedKeys={statusFilter}
									selectionMode="multiple"
									onSelectionChange={onStatusChange as any}
								>
									{statusOptions.map((s) => (
										<DropdownItem key={s.uid} className="capitalize">
											{s.name}
										</DropdownItem>
									))}
								</DropdownMenu>
							</Dropdown>
						)}

					<Button
						color="primary"
						endContent={<DownloadIcon className="w-3" />}
						onPress={() => exportFn(exportData)}
					>
						Export
					</Button>
				</div>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-small text-default-400">
					Total {allCount} records
				</span>
				{showColumnSelector && (
					<Dropdown>
						<DropdownTrigger className="hidden sm:flex bg-transparent text-default-400">
							<Button variant="flat" size="sm" endContent={<ChevronDownIcon />}>
								Columns
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							disallowEmptySelection
							closeOnSelect={false}
							selectedKeys={visibleColumns}
							selectionMode="multiple"
							onSelectionChange={(keys) => {
								setVisibleColumns(keys as Set<string>);
							}}
							items={[
								{ key: "serialNumber", name: "S/N" },
								...columns.map((column) => ({
									key: column.uid,
									name: column.name,
								})),
							]}
						>
							{(item: any) => (
								<DropdownItem key={item.key} className="capitalize">
									{item.name}
								</DropdownItem>
							)}
						</DropdownMenu>
					</Dropdown>
				)}
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
				onChange={onPageChange}
			/>
			<div className="hidden sm:flex w-[30%] justify-end gap-2 items-center">
				{showRowsPerPageSelector && (
					<Dropdown>
						<DropdownTrigger>
							<Button size="sm" variant="flat" endContent={<ChevronDownIcon />}>
								{rowsPerPage} rows
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							disallowEmptySelection
							selectedKeys={new Set([rowsPerPage.toString()])}
							selectionMode="single"
							onSelectionChange={(keys) => {
								const selectedKey = Array.from(keys)[0] as string;
								const newRowsPerPage = Number(selectedKey);
								setRowsPerPage(newRowsPerPage);
								onRowsPerPageChange?.(newRowsPerPage);
							}}
						>
							{rowsPerPageOptions.map((option) => (
								<DropdownItem key={option.toString()}>
									{option} rows
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
				)}
				<Button
					isDisabled={page <= 1}
					size="sm"
					variant="flat"
					onPress={() => onPageChange(page - 1)}
				>
					Previous
				</Button>
				<Button
					isDisabled={page >= pages}
					size="sm"
					variant="flat"
					onPress={() => onPageChange(page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	);

	return (
		<Table
			isHeaderSticky
			aria-label="generic records"
			topContent={topContent}
			bottomContent={bottomContent}
			topContentPlacement="outside"
			bottomContentPlacement="outside"
			classNames={{
				wrapper: "max-h-[calc(100dvh_-_150px)]",
				tr: "cursor-pointer",
			}}
			selectionMode={selectionMode}
			selectedKeys={selectedKeys}
			onSelectionChange={onSelectionChange as any}
			disabledKeys={disabledKeys}
			color="primary"
			radius="md"
			shadow="sm"
			sortDescriptor={sortDescriptor}
			onSortChange={onSortChange}
			isVirtualized
		>
			<TableHeader columns={displayedColumns}>
				{(col) => (
					<TableColumn
						key={col.uid}
						align={col.uid === "actions" ? "center" : "start"}
						allowsSorting={col.sortable}
					>
						{col.name}
					</TableColumn>
				)}
			</TableHeader>
			<TableBody
				emptyContent={hasNoRecords ? "No records" : "No data found"}
				items={
					isLoading
						? Array(rowsPerPage).fill(null)
						: data.length
						? data
						: Array(rowsPerPage).fill(null)
				}
			>
				{(item) => {
					if (isLoading) {
						return (
							<TableRow key={`skeleton-${Math.random()}`}>
								{displayedColumns.map((c) => (
									<TableCell key={c.uid}>
										<div className="skeleton w-full h-6" />
									</TableCell>
								))}
							</TableRow>
						);
					}

					const rowIndex = data.indexOf(item as T);
					const uniqueKey = item
						? `${
								(item as any).id ||
								(item as any).loanId ||
								(item as any).customerId ||
								(item as any).deviceId ||
								(item as any).newDeviceId ||
								(item as any).loanRecordId ||
								(item as any).commissionId ||
								(item as any).mbeId ||
								(item as any).partnerUserId ||
								(item as any).userId ||
								(item as any).agentId ||
								`row-${rowIndex}-${JSON.stringify(item).slice(0, 50)}`
						  }`
						: `skeleton-${rowIndex}`;
					return (
						<TableRow key={uniqueKey}>
							{displayedColumns.map((colKey) => (
								<TableCell key={colKey.uid}>
									{colKey.uid === "serialNumber"
										? (page - 1) * rowsPerPage + rowIndex + 1
										: renderCell(item as T, colKey.uid)}
								</TableCell>
							))}
						</TableRow>
					);
				}}
			</TableBody>
		</Table>
	);
}
