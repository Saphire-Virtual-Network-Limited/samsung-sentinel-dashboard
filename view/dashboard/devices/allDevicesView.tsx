"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllDevices } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, SortDescriptor, ChipProps, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "deviceName", sortable: true },
  { name: "Brand", uid: "deviceManufacturer", sortable: true },
  { name: "Type", uid: "deviceType", sortable: true },
	{ name: "Price", uid: "price", sortable: true },
	{ name: "SAP", uid: "SAP", sortable: true },
	{ name: "SLD", uid: "SLD", sortable: true },
	{ name: "Actions", uid: "actions"},
];

const statusOptions = [
	{ name: "Pending", uid: "pending" },
	{ name: "Paid", uid: "paid" },
	{ name: "Unpaid", uid: "unpaid" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	paid: "success",
	unpaid: "danger",
};

type DeviceRecord = {
  price: number;
  deviceModelNumber: string;
  SAP: number;
  SLD: number;
  createdAt: string;
  deviceManufacturer: string;
  deviceName: string;
  deviceRam: string | null;
  deviceScreen: string | null;
  deviceStorage: string | null;
  imageLink: string;
  newDeviceId: string;
  oldDeviceId: string;
  sentiprotect: number;
  updatedAt: string;
  deviceType: string;
  deviceCamera: string[];
  android_go: string;
};

export default function AllStoresView() {
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
		column: "deviceName",
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
	const { data: raw = [], isLoading } = useSWR(
		["devices-records"],
		() => getAllDevices()
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
					console.error("Error fetching devices records:", error);
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

	const customers = useMemo(
		() =>
			  raw.map((r: DeviceRecord) => ({
				...r,
				deviceName: r.deviceName || '',
				deviceManufacturer: r.deviceManufacturer || '',
				deviceType: r.deviceType || '',
				price: r.price || '',
				SAP: r.SAP || '',
				SLD: r.SLD || '',
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				const deviceName = (c.deviceName || '').toLowerCase();
				const deviceManufacturer = (c.deviceManufacturer || '').toLowerCase();
				const deviceType = (c.deviceType || '').toLowerCase();
				const price = (c.price || '').toLowerCase();
				const SAP = (c.SAP || '').toLowerCase();
				const SLD = (c.SLD || '').toLowerCase();
				
				return deviceName.includes(f) || 
					   deviceManufacturer.includes(f) || 
					   deviceType.includes(f) || 
					   price.includes(f) || 
					   SAP.includes(f) || 
					   SLD.includes(f);
			});
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.status || ''));	
		}
		return list;
	}, [customers, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = (a[sortDescriptor.column as keyof DeviceRecord] || '').toString();
			const bVal = (b[sortDescriptor.column as keyof DeviceRecord] || '').toString();
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: DeviceRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Devices");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Devices_Records.xlsx");
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
				<div className="flex justify-end" key={`${row.newDeviceId}-actions`}>
					<Dropdown>
						<DropdownTrigger>
							<Button
								isIconOnly
								size="sm"
								variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Actions">
							<DropdownItem
								key={`${row.newDeviceId}-view`}
								onPress={() => openModal("view", row)}>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}
		
		if (key === "deviceName") {
			return <p key={`${row.newDeviceId}-name`} className="capitalize cursor-pointer" onClick={() => openModal("view", row)}>{row.deviceName || ''}</p>;	
		}
		return <p key={`${row.newDeviceId}-${key}`} className="text-small cursor-pointer" onClick={() => openModal("view", row)}>{(row as any)[key] || ''}</p>;
	};

	return (
		<>
		<div className="mb-4 flex justify-center md:justify-end">
		</div>
			
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
			

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				// size="2xl"
				className="m-4 max-w-[1500px] max-h-[850px] overflow-y-auto">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>User Details</ModalHeader>
							<ModalBody>
								{selectedItem && (
									<div className="space-y-4">
										{/* Device Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Device Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Device ID</p>
													<p className="font-medium">{selectedItem.newDeviceId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Old Device ID</p>
													<p className="font-medium">{selectedItem.oldDeviceId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device Name</p>
													<p className="font-medium">{selectedItem.deviceName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Model Number</p>
													<p className="font-medium">{selectedItem.deviceModelNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Manufacturer</p>
													<p className="font-medium">{selectedItem.deviceManufacturer || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device Type</p>
													<p className="font-medium">{selectedItem.deviceType || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Price</p>
													<p className="font-medium">{selectedItem.price || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">SAP</p>
													<p className="font-medium">{selectedItem.SAP || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">SLD</p>
													<p className="font-medium">{selectedItem.SLD || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Sentiprotect</p>
													<p className="font-medium">{selectedItem.sentiprotect || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Android Go</p>
													<p className="font-medium">{selectedItem.android_go || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Created At</p>
													<p className="font-medium">{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Updated At</p>
													<p className="font-medium">{selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : 'N/A'}</p>
												</div>
											</div>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="danger"
									variant="light"
									onPress={onClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
