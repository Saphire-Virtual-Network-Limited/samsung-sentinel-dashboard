"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllLoanRecord, capitalize, calculateAge, showToast, verifyCustomerReferenceNumber, getAllCustomerRecord } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import DateFilter from "@/components/reususables/custom-ui/dateFilter";
import { SelectField } from "@/components/reususables/form";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "fullName", sortable: true },
	{ name: "Email", uid: "email", sortable: true },
	{ name: "BVN Phone", uid: "bvnPhoneNumber" },
	{ name: "Main Phone", uid: "mainPhoneNumber" },
	{ name: "Age", uid: "age" },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Loan Status", uid: "loanStatus", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
    { name: "Enrolled", uid: "enrolled" },
	{ name: "Pending", uid: "pending" },
	{ name: "Approved", uid: "approved" },
	{ name: "Rejected", uid: "rejected" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	approved: "success",
	rejected: "danger",
	enrolled: "warning",
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
	LoanRecord?: Array<{
		loanRecordId: string;
		customerId: string;
		loanDiskId: string;
		lastPoint: string;
		channel: string;
		loanStatus: string;
		createdAt: string;
		updatedAt: string;
		loanAmount: number;
		deviceId: string;
		downPayment: number;
		insurancePackage: string;
		insurancePrice: number;
		mbsEligibleAmount: number;
		payFrequency: string;
		storeId: string;
		devicePrice: number;
		deviceAmount: number;
		monthlyRepayment: number;
		duration: number;
		interestAmount: number;
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
	}>;
};

export default function LoansView() {
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
		startDate && endDate ? ["loan-records", startDate, endDate] : "loan-records",
		() => getAllLoanRecord(startDate, endDate)
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
				console.error("Error fetching loan records:", error);
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

	console.log(raw);

	const customers = useMemo(
		() =>
			raw.map((r: LoanRecord) => ({
				...r,
				fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
				email: r.email,
				age: calculateAge(r.dob),
				bvnPhoneNumber: r.bvnPhoneNumber,
				mainPhoneNumber: r.mainPhoneNumber,
				status: r.status,
				loanStatus: r.LoanRecord?.[0]?.loanStatus || 'N/A'
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => c.fullName.toLowerCase().includes(f) || c.email.toLowerCase().includes(f));
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
			const aVal = a[sortDescriptor.column as keyof LoanRecord];
			const bVal = b[sortDescriptor.column as keyof LoanRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);



	// Export all filtered
	const exportFn = async (data: LoanRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Loans");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status || '') }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Loan_Records.xlsx");
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
			return <p className="capitalize cursor-pointer" onClick={() => openModal("view", row)}>{row.fullName}</p>;
		}
		return <p className="text-small cursor-pointer" onClick={() => openModal("view", row)}>{(row as any)[key]}</p>;
	};

	return (
		<>
		<div className="mb-4 flex justify-center md:justify-end">
		</div>
			
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
												<div>
													<p className="text-sm text-default-500">Customer ID</p>
													<p className="font-medium">{selectedItem.customerId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Full Name</p>
													<p className="font-medium">{selectedItem.firstName && selectedItem.lastName ? `${selectedItem.firstName} ${selectedItem.lastName}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Email</p>
													<p className="font-medium">{selectedItem.email || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">BVN</p>
													<p className="font-medium">{selectedItem.bvn || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Date of Birth</p>
													<p className="font-medium">{selectedItem.dob || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">BVN Phone</p>
													<p className="font-medium">{selectedItem.bvnPhoneNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Main Phone</p>
													<p className="font-medium">{selectedItem.mainPhoneNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Dob Mismatch</p>
													<p className="font-medium">{selectedItem.dobMisMatch ? 'Yes' : 'No'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Channel</p>
													<p className="font-medium">{selectedItem.channel || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Created At</p>
													<p className="font-medium">{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Updated At</p>
													<p className="font-medium">{selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Mono Customer ID</p>
													<p className="font-medium">{selectedItem.monoCustomerConnectedCustomerId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Reg By</p>
													<p className="font-medium">{selectedItem.regBy || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">MBE ID</p>
													<p className="font-medium">{selectedItem.mbeId || 'N/A'}</p>
												</div>
											</div>
										</div>

										{/* Loan Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Loan Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">LoanDisk ID</p>
													<p className="font-medium">{selectedItem.customerLoanDiskId || 'N/A'}</p>
												</div>
												{selectedItem.LoanRecord?.[0] && (
													<>
														<div>
															<p className="text-sm text-default-500">Loan Record ID</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].loanRecordId || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Loan Disk ID</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].loanDiskId || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Last Point</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].lastPoint || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Channel</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].channel || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Loan Status</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].loanStatus || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Loan Amount</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].loanAmount !== undefined ? `₦${selectedItem.LoanRecord[0].loanAmount.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Device ID</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].deviceId || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Down Payment</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].downPayment !== undefined ? `₦${selectedItem.LoanRecord[0].downPayment.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Insurance Package</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].insurancePackage || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Insurance Price</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].insurancePrice !== undefined ? `₦${selectedItem.LoanRecord[0].insurancePrice.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">MBS Eligible Amount</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].mbsEligibleAmount !== undefined ? `₦${selectedItem.LoanRecord[0].mbsEligibleAmount.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Pay Frequency</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].payFrequency || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Store ID</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].storeId || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Device Price</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].devicePrice !== undefined ? `₦${selectedItem.LoanRecord[0].devicePrice.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Device Amount</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].deviceAmount !== undefined ? `₦${selectedItem.LoanRecord[0].deviceAmount.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Monthly Repayment</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].monthlyRepayment !== undefined ? `₦${selectedItem.LoanRecord[0].monthlyRepayment.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Duration</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].duration !== undefined ? `${selectedItem.LoanRecord[0].duration} months` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Interest Amount</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].interestAmount !== undefined ? `₦${selectedItem.LoanRecord[0].interestAmount.toLocaleString()}` : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Created At</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].createdAt ? new Date(selectedItem.LoanRecord[0].createdAt).toLocaleString() : 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Updated At</p>
															<p className="font-medium">{selectedItem.LoanRecord[0].updatedAt ? new Date(selectedItem.LoanRecord[0].updatedAt).toLocaleString() : 'N/A'}</p>
														</div>
													</>
												)}
											</div>
										</div>

										{/* Store Information */}
										{selectedItem.LoanRecord?.[0]?.store && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">Store Information</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="text-sm text-default-500">Store ID</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.storeId || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Store Name</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.storeName || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">City</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.city || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">State</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.state || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Region</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.region || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Address</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.address || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Phone Number</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.phoneNumber || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Email</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.storeEmail || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Partner</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].store.partner || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Store Hours</p>
														<p className="font-medium">{`${selectedItem.LoanRecord[0].store.storeOpen || 'N/A'} - ${selectedItem.LoanRecord[0].store.storeClose || 'N/A'}`}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Bank Details</p>
														<p className="font-medium">{`${selectedItem.LoanRecord[0].store.bankName || 'N/A'} - ${selectedItem.LoanRecord[0].store.accountNumber || 'N/A'}`}</p>
													</div>
												</div>
											</div>
										)}

										{/* Device Information */}
										{selectedItem.LoanRecord?.[0]?.device && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">Device Information</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<p className="text-sm text-default-500">Device Name</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.deviceName || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Model Number</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.deviceModelNumber || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Manufacturer</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.deviceManufacturer || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Type</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.deviceType || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">RAM</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.deviceRam || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Storage</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.deviceStorage || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Screen</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.deviceScreen || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Price</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.price !== undefined ? `₦${selectedItem.LoanRecord[0].device.price.toLocaleString()}` : 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Android Go</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.android_go || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm text-default-500">Device ID</p>
														<p className="font-medium">{selectedItem.LoanRecord[0].device.newDeviceId || 'N/A'}</p>
													</div>
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
