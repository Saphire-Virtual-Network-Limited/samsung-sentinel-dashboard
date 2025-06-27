"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import {  capitalize, calculateAge, getAllEnrolledDevices } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";


const columns: ColumnDef[] = [
	{ name: "Device ID", uid: "deviceId", sortable: true },
	{ name: "IMEI", uid: "imei", sortable: true },
	{ name: "Device Price", uid: "devicePrice", sortable: true },
	{ name: "Date Enrolled", uid: "updatedAt", sortable: true },
	{ name: "Device Status", uid: "deviceStatus", sortable: true },
	{ name: "Channel", uid: "channel", sortable: true },
	{ name: "Actions", uid: "actions" }
];

const statusOptions = [
    { name: "ENROLLED", uid: "enrolled" },
	{ name: "LOANED", uid: "loaned" },
	{ name: "RETURNED", uid: "returned" },
	{ name: "Defaulted", uid: "defaulted" },
	{ name: "LOST", uid: "lost" },
	{ name: "REPAIRED", uid: "repaired" },
	{ name: "SOLD", uid: "sold" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	enrolled: "success",
	loaned: "success",
	returned: "danger",
	defaulted: "danger",
	lost: "danger",
	repaired: "success",
	sold: "success",
};  

type DeviceRecord = {
	deviceOnLoanId: string;
	deviceId: string;
	loanRecordId: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	channel: string;
	imei: string;
	amount: number;
	devicePrice: number;
};


export default function EnrolledDevicesView() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | null>(null);
	const [selectedItem, setSelectedItem] = useState<DeviceRecord | null>(null);

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "deviceId",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	// Fetch data based on date filter
	const { data: raw = [], isLoading, error } = useSWR(
		startDate && endDate ? ["enrolled-devices", startDate, endDate] : "enrolled-devices",
		() => getAllEnrolledDevices("ENROLLED", startDate, endDate)
			.then((r) => {
				console.log("API Response:", r);
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
				console.error("Error fetching enrolled devices:", error);
				setHasNoRecords(true);
				return [];
			}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true
		}
	);

	console.log("Raw data:", raw);
	console.log("Error:", error);
	console.log("Is loading:", isLoading);

	// Transform the data
	const customers = useMemo(
		() =>
			raw.map((r: DeviceRecord) => ({
				...r,
				deviceId: r.deviceId || 'N/A',
				imei: r.imei || 'N/A',
				devicePrice: r.devicePrice || 'N/A',
				deviceStatus: r.status || 'N/A',
				updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-GB') : 'N/A',
				channel: r.channel || 'N/A',
					
			})),
		[raw]
	);

	// Filter the data
	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => 
				c.deviceId?.toLowerCase().includes(f) || 
				c.imei?.toLowerCase().includes(f)
			);
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.deviceStatus || ''));
		}
		return list;
	}, [customers, filterValue, statusFilter]);

	// Paginate the data
	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	// Sort the data
	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = String(a[sortDescriptor.column as keyof DeviceRecord] || '');
			const bVal = String(b[sortDescriptor.column as keyof DeviceRecord] || '');
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: DeviceRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Enrolled_Devices");	
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status || '') }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Enrolled_Devices.xlsx");
	};

	// When action clicked:
	const openModal = (mode: "view", row: DeviceRecord) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: DeviceRecord, key: string) => {
		if (key === "actions") {
			return (
				<div className="flex justify-end">
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
							<DropdownItem
								key="view"
								onPress={() => openModal("view", row)}>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}
		if (key === "deviceStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.status || '']}
					size="sm"
					variant="flat">
					{capitalize(row.status || '')}
				</Chip>
			);
		}
		if (key === "loanStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.status?.toLowerCase() || '']}
					size="sm"
					variant="flat">
					{capitalize(row.status || '')}
				</Chip>
			);
		}
		if (key === "deviceId") {
			return <p className="capitalize cursor-pointer" onClick={() => openModal("view", row)}>{row.deviceId}</p>;
		}
		// Ensure we're converting any value to a string before rendering
		const cellValue = (row as any)[key];
		if (cellValue === null || cellValue === undefined) {
			return <p className="text-small cursor-pointer" onClick={() => openModal("view", row)}>N/A</p>;
		}
		if (typeof cellValue === 'object') {
			return <p className="text-small cursor-pointer" onClick={() => openModal("view", row)}>View Details</p>;
		}
		return <p className="text-small cursor-pointer" onClick={() => openModal("view", row)}>{String(cellValue)}</p>;
	};

	return (
		<>
		<div className="mb-4 flex justify-center md:justify-end">
		</div>
			
		{isLoading ? (
			<TableSkeleton columns={columns.length} rows={10} />
		) : (
			<GenericTable<DeviceRecord>
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
				showStatus={false}
				sortDescriptor={sortDescriptor}
				onSortChange={setSortDescriptor}
				page={page}
				pages={pages}
				onPageChange={setPage}
				exportFn={exportFn}
				renderCell={renderCell}
				hasNoRecords={hasNoRecords}
				onDateFilterChange={handleDateFilter}
				initialStartDate={startDate}
				initialEndDate={endDate}
			/>
		)}

		</>
	);
}
