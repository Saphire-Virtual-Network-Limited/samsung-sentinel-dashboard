"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, ChipProps, SortDescriptor } from "@heroui/react";
import { ChevronDownIcon, DownloadIcon, PlusIcon, SearchIcon } from "lucide-react";
import DateFilter from "./dateFilter";
import { showToast } from "@/lib";
import { useRouter } from "next/navigation";


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
}

export default function GenericTable<T>(props: GenericTableProps<T>) {
	const { columns, data, allCount, exportData, isLoading, filterValue, onFilterChange, statusOptions = [], statusFilter, onStatusChange = () => {}, showStatus = true, sortDescriptor, onSortChange, page, pages, onPageChange, exportFn, renderCell, hasNoRecords, onDateFilterChange, initialStartDate, initialEndDate, defaultDateRange, createButton, additionalButtons } = props;

	// Exclude status column if hidden
	const displayedColumns = [
		{ name: "S/N", uid: "serialNumber" },
		...(showStatus ? columns : columns.filter((c) => c.uid !== "status"))
	];

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
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
			showToast({ message: "End date must be after start date.", type: "error" });
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
					placeholder="Search by ID, Name, BVN"
					startContent={<SearchIcon className="w-3" />}
					value={filterValue}
					onClear={() => onFilterChange("")}
					onValueChange={onFilterChange}
				/>

				<div className="flex gap-2">
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
					{showStatus && statusOptions.length > 0 && statusFilter && onStatusChange && (
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
								onSelectionChange={onStatusChange as any}>
								{statusOptions.map((s) => (
									<DropdownItem
										key={s.uid}
										className="capitalize">
										{s.name}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
					)}
					
					<Button 
						color="primary"
						endContent={<DownloadIcon className="w-3" />}
						onPress={() => exportFn(exportData)}>
						Export
					</Button>
				</div>
			</div>
			<span className="text-small text-default-400">Total {allCount} records</span>
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
			<div className="hidden sm:flex w-[30%] justify-end gap-2">
				<Button
					isDisabled={page <= 1}
					size="sm"
					variant="flat"
					onPress={() => onPageChange(page - 1)}>
					Previous
				</Button>
				<Button
					isDisabled={page >= pages}
					size="sm"
					variant="flat"
					onPress={() => onPageChange(page + 1)}>
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
			classNames={{ wrapper: "max-h-[calc(100dvh_-_150px)]", tr: "cursor-pointer" }}
			selectionMode="single"
			color="primary"
			radius="md"
			shadow="sm"
			sortDescriptor={sortDescriptor}
			onSortChange={onSortChange}
			isVirtualized>
			<TableHeader columns={displayedColumns}>
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
				emptyContent={hasNoRecords ? "No records" : "No data found"}
				items={isLoading ? Array(10).fill(null) : data.length ? data : Array(10).fill(null)}>
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
					const uniqueKey = item ? `${(item as any).id || (item as any)[displayedColumns[1].uid]}-${rowIndex}` : `skeleton-${rowIndex}`;
					return (
						<TableRow key={uniqueKey}>
							{displayedColumns.map((colKey) => (
								<TableCell key={colKey.uid}>
									{colKey.uid === "serialNumber" 
										? ((page - 1) * 10) + rowIndex + 1
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