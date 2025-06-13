"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllLoanRecord, capitalize, calculateAge, showToast, verifyCustomerReferenceNumber, getAllCustomerRecord, getAllApprovedRecord } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";


const columns: ColumnDef[] = [
	{ name: "Full Name", uid: "fullName", sortable: true },
	{ name: "BVN", uid: "bvn", sortable: true },
	// { name: "Date of Birth", uid: "dob", sortable: true },
	{ name: "Device Price", uid: "devicePrice", sortable: true },
	{ name: "Down Payment", uid: "downPayment", sortable: true },
	{ name: "Loan Amount", uid: "loanAmount", sortable: true },
	// { name: "Monthly Repay.", uid: "monthlyRepayment", sortable: true },
	{ name: "Tenor", uid: "tenorInDays", sortable: true },
	{ name: "First Payment", uid: "firstPaymentDate", sortable: true },
	{ name: "Device", uid: "deviceName", sortable: true },
	{ name: "IMEI", uid: "imei", sortable: true },
	{ name: "Status", uid: "loanStatus", sortable: true },
	{ name: "Created", uid: "createdAt", sortable: true },
];

const statusOptions = [
    { name: "Enrolled", uid: "enrolled" },
	{ name: "Pending", uid: "pending" },
	{ name: "Approved", uid: "approved" },
	{ name: "Rejected", uid: "rejected" },
	{ name: "Defaulted", uid: "defaulted" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	approved: "success",
	rejected: "danger",
	enrolled: "warning",
	defaulted: "danger",
};  

type LoanRecord = {
	customerId: string;
	firstName: string;
	lastName: string;
	email: string;
	bvn: string;
	dob: string;
	dobMisMatch: boolean;
	createdAt: string;
	updatedAt: string;
	customerLoanDiskId: string;
	channel: string;
	bvnPhoneNumber: string;
	mainPhoneNumber: string;
	mbeId: string | null;
	monoCustomerConnectedCustomerId: string;
	fullName?: string;
	age?: number;
	status?: string;
	loanStatus?: string;
	regBy: string | null;
	loanRecordId?: string;
	loanDiskId?: string;
	lastPoint?: string;
	loanAmount?: number;
	deviceId?: string;
	downPayment?: number;
	insurancePackage?: string;
	insurancePrice?: number;
	mbsEligibleAmount?: number;
	payFrequency?: string;
	storeId?: string;
	devicePrice?: number;
	deviceName?: string;
	deviceAmount?: number;
	monthlyRepayment?: number;
	duration?: number;
	interestAmount?: number;
	customer?: {
		customerId: string;
		firstName: string;
		lastName: string;
		email: string;
		bvn: string;
		dob: string;
		dobMisMatch: boolean;
		createdAt: string;
		updatedAt: string;
		customerLoanDiskId: string;
		channel: string;
		bvnPhoneNumber: string;
		mainPhoneNumber: string;
		mbeId: string;
		monoCustomerConnectedCustomerId: string;
	};
	device?: {
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
		deviceCamera: any[];
		android_go: string;
	};
	store?: {
		storeOldId: number;
		storeName: string;
		city: string;
		state: string;
		region: string | null;
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
	DeviceOnLoan?: Array<{
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
	}>;
	StoresOnLoan?: Array<{
		storeOnLoanId: string;
		storeId: string;
		loanRecordId: string;
		tnxId: string | null;
		sessionId: string | null;
		reference: string | null;
		payChannel: string | null;
		amount: number;
		status: string;
		createdAt: string;
		updatedAt: string;
		channel: string;
		bankUsed: string;
	}>;
};


export default function UtilizationView() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | null>(null);
	const [selectedItem, setSelectedItem] = useState<LoanRecord | null>(null);

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
		startDate && endDate ? ["approved-records", startDate, endDate] : "approved-records",
		() => getAllApprovedRecord(startDate, endDate)
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
				console.error("Error fetching approved records:", error);
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

	// Transform the data
	const customers = useMemo(
		() =>
			raw.map((r: LoanRecord) => ({
				...r,
				// customerId: r.customer?.customerId || 'N/A',
				fullName: r.customer?.firstName && r.customer?.lastName ? `${capitalize(r.customer.firstName)} ${capitalize(r.customer.lastName)}` : 'N/A',
				bvn: r.customer?.bvn || 'N/A',
				dob: r.customer?.dob || 'N/A',
				// age: r.customer?.dob ? calculateAge(r.customer.dob) : 'N/A',
				// monthlyRepayment: r.monthlyRepayment ? `₦${r.monthlyRepayment.toLocaleString()}` : 'N/A',		
				tenorInDays: r.duration ? `${r.duration * 30} days` : 'N/A',
				status: r.status || 'N/A',
				loanAmount: r.loanAmount ? `₦${r.loanAmount.toLocaleString()}` : 'N/A',
				downPayment: r.downPayment ? `₦${r.downPayment.toLocaleString()}` : 'N/A',
				devicePrice: r.devicePrice ? `₦${r.devicePrice.toLocaleString()}` : 'N/A',
				loanStatus: r.loanStatus || 'N/A',
				imei: r.DeviceOnLoan?.[0]?.imei || 'N/A',
				deviceName: r.device?.deviceName || 'N/A',
				createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A',
                firstPaymentDate: r.updatedAt ? new Date(new Date(r.updatedAt).setMonth(new Date(r.updatedAt).getMonth() + 1)).toLocaleDateString() : 'N/A',
				
			})),
		[raw]
	);

	// Filter the data
	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				try {
					// Safely check each field with proper null checks
					const fullName = (c.fullName || '').toLowerCase();
					const email = (c.email || '').toLowerCase();
					const bvn = (c.bvn || '').toLowerCase();
					const customerId = (c.customerId || '').toLowerCase();
					const phone = (c.mainPhoneNumber || '').toLowerCase();
					const deviceName = (c.deviceName || '').toLowerCase();
					const deviceModel = (c.deviceModelNumber || '').toLowerCase();
					const deviceRam = (c.deviceRam || '').toLowerCase();
					
					return fullName.includes(f) || 
						   email.includes(f) || 
						   bvn.includes(f) || 
						   customerId.includes(f) || 
						   phone.includes(f) || 
						   deviceName.includes(f) || 
						   deviceModel.includes(f) || 
						   deviceRam.includes(f);
				} catch (error) {
					console.error('Error in filter:', error);
					return false;
				}
			});
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.status || ''));
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
			const aVal = String(a[sortDescriptor.column as keyof LoanRecord] || '');
			const bVal = String(b[sortDescriptor.column as keyof LoanRecord] || '');
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: LoanRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Approved_Loans");	
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status || '') }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Approved_Loans.xlsx");
	};

	// When action clicked:
	const openModal = (mode: "view", row: LoanRecord) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: LoanRecord, key: string) => {
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
		if (key === "status") {
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
					color={statusColorMap[row.loanStatus?.toLowerCase() || '']}
					size="sm"
					variant="flat">
					{capitalize(row.loanStatus || '')}
				</Chip>
			);
		}
		if (key === "fullName") {
			return <div className="capitalize cursor-pointer" onClick={() => openModal("view", row)}>{row.fullName}</div>;
		}
		// Ensure we're converting any value to a string before rendering
		const cellValue = (row as any)[key];
		if (cellValue === null || cellValue === undefined) {
			return <div className="text-small cursor-pointer" onClick={() => openModal("view", row)}>N/A</div>;
		}
		if (typeof cellValue === 'object') {
			return <div className="text-small cursor-pointer" onClick={() => openModal("view", row)}>View Details</div>;
		}
		return <div className="text-small cursor-pointer" onClick={() => openModal("view", row)}>{String(cellValue)}</div>;
	};

	return (
		<>
			<div className="w-full overflow-hidden">
				<div className="mb-4 flex justify-center md:justify-end">
				</div>
				
				{isLoading ? (
					<TableSkeleton columns={columns.length} rows={10} />
				) : (
					<GenericTable<LoanRecord>
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
			</div>

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
										{/* Personal Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Personal Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{Object.entries(selectedItem).map(([key, value]) => {
													// Skip nested objects as they're handled separately
													if (key === 'customer' || key === 'device' || key === 'store') return null;
													
													// Handle null/undefined values
													if (value === null || value === undefined) {
														return (
															<div key={`${selectedItem.customerId}-personal-${key}`}>
																<p className="text-sm text-default-500">{key}</p>
																<p className="font-medium">N/A</p>
															</div>
														);
													}

													// Handle objects
													if (typeof value === 'object') {
														return (
															<div key={`${selectedItem.customerId}-personal-${key}`}>
																<p className="text-sm text-default-500">{key}</p>
																<p className="font-medium">View Details</p>
															</div>
														);
													}

													// Handle dates
													if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
														try {
															const date = new Date(value as string);
															if (!isNaN(date.getTime())) {
																value = date.toLocaleString();
															}
														} catch (e) {
															// If date parsing fails, use the original value
														}
													}

													// Handle boolean values
													if (typeof value === 'boolean') {
														value = value ? 'Yes' : 'No';
													}

													// Format currency values
													if (typeof value === 'number' && 
														(key.toLowerCase().includes('amount') || 
														 key.toLowerCase().includes('price') || 
														 key.toLowerCase().includes('payment'))) {
														value = `₦${Number(value).toLocaleString()}`;
													}

													return (
														<div key={`${selectedItem.customerId}-personal-${key}`}>
															<p className="text-sm text-default-500">{key}</p>
															<p className="font-medium">{String(value)}</p>
														</div>
													);
												})}
											</div>
										</div>

										{/* Customer Information */}
										{selectedItem.customer && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">Customer Information</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedItem.customer).map(([key, value]) => {
														if (value === null || value === undefined) {
															return (
																<div key={`${selectedItem.customerId}-customer-${key}`}>
																	<p className="text-sm text-default-500">{key}</p>
																	<p className="font-medium">N/A</p>
																</div>
															);
														}

														if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
															try {
																const date = new Date(value as string);
																if (!isNaN(date.getTime())) {
																	value = date.toLocaleString();
																}
															} catch (e) {}
														}

														return (
															<div key={`${selectedItem.customerId}-customer-${key}`}>
																<p className="text-sm text-default-500">{key}</p>
																<p className="font-medium">{String(value)}</p>
															</div>
														);
													})}
												</div>
											</div>
										)}

										{/* Device Information */}
										{selectedItem.device && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">Device Information</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedItem.device).map(([key, value]) => {
														if (value === null || value === undefined) {
															return (
																<div key={`${selectedItem.customerId}-device-${key}`}>
																	<p className="text-sm text-default-500">{key}</p>
																	<p className="font-medium">N/A</p>
																</div>
															);
														}

														if (typeof value === 'number' && 
															(key.toLowerCase().includes('price') || 
															 key.toLowerCase().includes('amount'))) {
															value = `₦${Number(value).toLocaleString()}`;
														}

														return (
															<div key={`${selectedItem.customerId}-device-${key}`}>
																<p className="text-sm text-default-500">{key}</p>
																<p className="font-medium">{String(value)}</p>
															</div>
														);
													})}
												</div>
											</div>
										)}

										{/* Store Information */}
										{selectedItem.store && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">Store Information</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedItem.store).map(([key, value]) => {
														if (value === null || value === undefined) {
															return (
																<div key={`${selectedItem.customerId}-store-${key}`}>
																	<p className="text-sm text-default-500">{key}</p>
																	<p className="font-medium">N/A</p>
																</div>
															);
														}

														if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
															try {
																const date = new Date(value as string);
																if (!isNaN(date.getTime())) {
																	value = date.toLocaleString();
																}
															} catch (e) {}
														}

														return (
															<div key={`${selectedItem.customerId}-store-${key}`}>
																<p className="text-sm text-default-500">{key}</p>
																<p className="font-medium">{String(value)}</p>
															</div>
														);
													})}
												</div>
											</div>
										)}
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
