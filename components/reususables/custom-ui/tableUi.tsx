"use client";

import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, ChipProps, SortDescriptor } from "@heroui/react";
import { ChevronDownIcon, DownloadIcon, SearchIcon } from "lucide-react";

export interface ColumnDef {
	name: string;
	uid: string;
	sortable?: boolean;
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
}

export default function GenericTable<T>(props: GenericTableProps<T>) {
	const { columns, data, allCount, exportData, isLoading, filterValue, onFilterChange, statusOptions = [], statusFilter, onStatusChange = () => {}, showStatus = true, sortDescriptor, onSortChange, page, pages, onPageChange, exportFn, renderCell } = props;

	// Exclude status column if hidden
	const displayedColumns = showStatus ? columns : columns.filter((c) => c.uid !== "status");

	const renderSkeleton = () => (
		<TableRow>
			{displayedColumns.map((c) => (
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
					startContent={<SearchIcon className="w-3" />}
					value={filterValue}
					onClear={() => onFilterChange("")}
					onValueChange={onFilterChange}
				/>
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
				emptyContent="No records"
				items={isLoading ? new Array(displayedColumns.length).fill(null) : data}>
				{(item: T | null) => (item === null ? renderSkeleton() : <TableRow key={(item as any)[displayedColumns[0].uid]}>{(colKey) => <TableCell>{renderCell(item as T, colKey as string)}</TableCell>}</TableRow>)}
			</TableBody>
		</Table>
	);
}
