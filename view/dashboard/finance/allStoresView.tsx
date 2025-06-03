"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllStores } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, SortDescriptor, ChipProps, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "storeName", sortable: true },
	{ name: "Contact No.", uid: "phoneNumber", sortable: true },
	{ name: "Partner", uid: "partner", sortable: true },
	{ name: "State", uid: "state", sortable: true },
	{ name: "Region", uid: "region", sortable: true },
	{ name: "City", uid: "city", sortable: true },
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

type StoreRecord = {
  storeOldId: number;
  storeName: string;
  city: string;
  state: string;
  region: string;
  address: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  phoneNumber: string;
  storeEmail: string;
  longitude: number;
  latitude: number;
  clusterId: number;
  partner: string;
  storeOpen: string;
  storeClose: string;
  createdAt: string;
  updatedAt: string;
  storeId: string;
};

export default function AllStoresView() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | null>(null);
	const [selectedItem, setSelectedItem] = useState<StoreRecord | null>(null);


	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "fullName",
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
		["stores-records"],
		() => getAllStores()
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
					console.error("Error fetching stores records:", error);
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
			raw.map((r: StoreRecord) => ({
				...r,
				fullName: r.storeName || '',
				Email: r.storeEmail || '',
				PhoneNo: r.phoneNumber || '',
				State: r.state || '',
				Partner: r.partner || '',
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				const fullName = (c.fullName || '').toLowerCase();
				const email = (c.Email || '').toLowerCase();
				const phone = (c.PhoneNo || '').toLowerCase();
				const state = (c.State || '').toLowerCase();
				const partner = (c.Partner || '').toLowerCase();
				const storeId = (c.storeId || '').toLowerCase();
				
				return fullName.includes(f) || 
					   email.includes(f) || 
					   phone.includes(f) || 
					   state.includes(f) || 
					   partner.includes(f) ||
					   storeId.includes(f);
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
			const aVal = (a[sortDescriptor.column as keyof StoreRecord] || '').toString();
			const bVal = (b[sortDescriptor.column as keyof StoreRecord] || '').toString();
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: StoreRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("All Stores");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "allStores_Records.xlsx");
	};

	// When action clicked:
	const openModal = (mode: "view", row: StoreRecord) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: StoreRecord, key: string) => {
		if (key === "actions") {
			return (
				<div className="flex justify-end" key={`${row.storeId}-actions`}>
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
								key={`${row.storeId}-view`}
								onPress={() => openModal("view", row)}>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}
		
		if (key === "storeName") {
			return <div key={`${row.storeId}-name`} className="capitalize cursor-pointer" onClick={() => openModal("view", row)}>{(row as any)[key] || ''}</div>;	
		}

		return <div key={`${row.storeId}-${key}`} className="text-small cursor-pointer" onClick={() => openModal("view", row)}>{(row as any)[key] || ''}</div>;
	};

	return (
		<>
		<div className="mb-4 flex justify-center md:justify-end">
		</div>
			
			<GenericTable<StoreRecord>
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
										{/* Store Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Store Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Store ID</p>
													<p className="font-medium">{selectedItem.storeId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Store Name</p>
													<p className="font-medium">{selectedItem.storeName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Partner</p>
													<p className="font-medium">{selectedItem.partner || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">City</p>
													<p className="font-medium">{selectedItem.city || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">State</p>
													<p className="font-medium">{selectedItem.state || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Region</p>
													<p className="font-medium">{selectedItem.region || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Address</p>
													<p className="font-medium">{selectedItem.address || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Phone Number</p>
													<p className="font-medium">{selectedItem.phoneNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Email</p>
													<p className="font-medium">{selectedItem.storeEmail || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Account Number</p>
													<p className="font-medium">{selectedItem.accountNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Account Name</p>
													<p className="font-medium">{selectedItem.accountName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Bank Name</p>
													<p className="font-medium">{selectedItem.bankName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Store Hours</p>
													<p className="font-medium">{`${selectedItem.storeOpen || '00:00'} - ${selectedItem.storeClose || '00:00'}`}</p>
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
