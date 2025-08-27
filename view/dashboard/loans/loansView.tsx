"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	getAllLoanRecord,
	capitalize,
	calculateAge,
	showToast,
	verifyCustomerReferenceNumber,
	getAllCustomerRecord,
} from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Chip,
	SortDescriptor,
	ChipProps,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";

const columns: ColumnDef[] = [
	{ name: "Customer ID", uid: "customerId", sortable: true },
	{ name: "Loan ID", uid: "loanRecordId", sortable: true },
	{ name: "Name", uid: "fullName", sortable: true },
	{ name: "Age", uid: "age" },
	{ name: "Device Price", uid: "devicePrice" },
	{ name: "Loan Amount", uid: "loanAmount" },
	{ name: "Down Payment", uid: "downPayment" },
	{ name: "Monthly Repay.", uid: "monthlyRepayment" },
	{ name: "Duration", uid: "duration" },
	{ name: "Loan Status", uid: "loanStatus", sortable: true },
	{ name: "Actions", uid: "actions" },
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
		startDate && endDate
			? ["loan-records", startDate, endDate]
			: "loan-records",
		() =>
			getAllLoanRecord(startDate, endDate)
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
			revalidateIfStale: true,
		}
	);

	// console.log(raw);

	const customers = useMemo(
		() =>
			raw.map((r: LoanRecord) => ({
				...r,
				customerId: r.customerId,
				loanRecordId: r.LoanRecord?.[0]?.loanRecordId,
				fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
				age: calculateAge(r.dob),
				monthlyRepayment: r.LoanRecord?.[0]?.monthlyRepayment
					? `₦${r.LoanRecord[0].monthlyRepayment.toLocaleString()}`
					: "N/A",
				duration: r.LoanRecord?.[0]?.duration
					? `${r.LoanRecord[0].duration} months`
					: "N/A",
				status: r.status,
				loanAmount: r.LoanRecord?.[0]?.loanAmount
					? `₦${r.LoanRecord[0].loanAmount.toLocaleString()}`
					: "N/A",
				downPayment: r.LoanRecord?.[0]?.downPayment
					? `₦${r.LoanRecord[0].downPayment.toLocaleString()}`
					: "N/A",
				devicePrice: r.LoanRecord?.[0]?.devicePrice
					? `₦${r.LoanRecord[0].devicePrice.toLocaleString()}`
					: "N/A",
				loanStatus: r.LoanRecord?.[0]?.loanStatus || "N/A",
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter(
				(c) =>
					(c.fullName || "").toLowerCase().includes(f) ||
					(c.firstName || "").toLowerCase().includes(f) ||
					(c.lastName || "").toLowerCase().includes(f) ||
					(c.email || "").toLowerCase().includes(f) ||
					(c.bvn || "").toLowerCase().includes(f) ||
					(c.loanRecordId || "").toLowerCase().includes(f) ||
					(c.bvnPhoneNumber || "").toLowerCase().includes(f) ||
					(c.mainPhoneNumber || "").toLowerCase().includes(f) ||
					(c.mbeId || "").toLowerCase().includes(f) ||
					(c.channel || "").toLowerCase().includes(f) ||
					(typeof c.regBy === "string" ? c.regBy : String(c.regBy || ""))
						.toLowerCase()
						.includes(f)
			);
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.status || ""));
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
			const aVal = String(a[sortDescriptor.column as keyof LoanRecord] || "");
			const bVal = String(b[sortDescriptor.column as keyof LoanRecord] || "");
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: LoanRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Loans");
		const exportColumns = columns.filter((c) => c.uid !== "actions");
		ws.columns = exportColumns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));

		// Currency columns to format as numbers with commas
		const currencyColumns = [
			"devicePrice",
			"downPayment",
			"loanAmount",
			"monthlyRepayment",
			"insurancePrice",
			"mbsEligibleAmount",
			"deviceAmount",
			"interestAmount",
		];

		data.forEach((r) => {
			const row: Record<string, any> = {};
			exportColumns.forEach((col) => {
				let value = r[col.uid as keyof LoanRecord];
				if (currencyColumns.includes(col.uid)) {
					if (typeof value === "string") {
						value = value.replace(/[^\d.-]/g, "");
					}
					value = value ? Number(value).toLocaleString() : "0";
				}
				row[col.uid] = value;
			});
			ws.addRow(row);
		});

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "All_Loan_Records.xlsx");
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
							<Button isIconOnly size="sm" variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem key="view" onPress={() => openModal("view", row)}>
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
					color={statusColorMap[row.status || ""]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.status || "")}
				</Chip>
			);
		}
		if (key === "loanStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.loanStatus?.toLowerCase() || ""]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.loanStatus || "")}
				</Chip>
			);
		}
		if (key === "fullName") {
			return (
				<p
					className="capitalize cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					{row.fullName}
				</p>
			);
		}
		// Ensure we're converting any value to a string before rendering
		const cellValue = (row as any)[key];
		if (cellValue === null || cellValue === undefined) {
			return (
				<p
					className="text-small cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					N/A
				</p>
			);
		}
		if (typeof cellValue === "object") {
			return (
				<p
					className="text-small cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					View Details
				</p>
			);
		}
		return (
			<p
				className="text-small cursor-pointer"
				onClick={() => openModal("view", row)}
			>
				{String(cellValue)}
			</p>
		);
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end"></div>

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
					defaultDateRange={{ days: 2 }}
				/>
			)}

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				// size="2xl"
				className="m-4 max-w-[1500px] max-h-[850px] overflow-y-auto"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>User Details</ModalHeader>
							<ModalBody>
								{selectedItem && (
									<div className="space-y-4">
										{/* Personal Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">
												Personal Information
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{Object.entries(selectedItem).map(([key, value]) => {
													// Skip LoanRecord as it's handled separately
													if (key === "LoanRecord") return null;

													// Handle null/undefined values
													if (value === null || value === undefined) {
														return (
															<div key={key}>
																<p className="text-sm text-default-500">
																	{key}
																</p>
																<p className="font-medium">N/A</p>
															</div>
														);
													}

													// Handle objects
													if (typeof value === "object") {
														return (
															<div key={key}>
																<p className="text-sm text-default-500">
																	{key}
																</p>
																<p className="font-medium">View Details</p>
															</div>
														);
													}

													// Handle dates
													if (
														key.toLowerCase().includes("date") ||
														key.toLowerCase().includes("at")
													) {
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
													if (typeof value === "boolean") {
														value = value ? "Yes" : "No";
													}

													return (
														<div key={key}>
															<p className="text-sm text-default-500">{key}</p>
															<p className="font-medium">{String(value)}</p>
														</div>
													);
												})}
											</div>
										</div>

										{/* Loan Information */}
										{selectedItem.LoanRecord &&
											selectedItem.LoanRecord.length > 0 && (
												<div className="bg-default-50 p-4 rounded-lg">
													<h3 className="text-lg font-semibold mb-3">
														Loan Information
													</h3>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{Object.entries(selectedItem.LoanRecord[0]).map(
															([key, value]) => {
																// Skip store and device as they're handled separately
																if (key === "store" || key === "device")
																	return null;

																// Handle null/undefined values
																if (value === null || value === undefined) {
																	return (
																		<div key={key}>
																			<p className="text-sm text-default-500">
																				{key}
																			</p>
																			<p className="font-medium">N/A</p>
																		</div>
																	);
																}

																// Handle objects
																if (typeof value === "object") {
																	return (
																		<div key={key}>
																			<p className="text-sm text-default-500">
																				{key}
																			</p>
																			<p className="font-medium">
																				View Details
																			</p>
																		</div>
																	);
																}

																// Handle dates
																if (
																	key.toLowerCase().includes("date") ||
																	key.toLowerCase().includes("at")
																) {
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
																if (typeof value === "boolean") {
																	value = value ? "Yes" : "No";
																}

																// Format currency values
																if (
																	typeof value === "number" &&
																	(key.toLowerCase().includes("amount") ||
																		key.toLowerCase().includes("price") ||
																		key.toLowerCase().includes("payment"))
																) {
																	value = `₦${Number(value).toLocaleString()}`;
																}

																return (
																	<div key={key}>
																		<p className="text-sm text-default-500">
																			{key}
																		</p>
																		<p className="font-medium">
																			{String(value)}
																		</p>
																	</div>
																);
															}
														)}
													</div>
												</div>
											)}

										{/* Store Information */}
										{selectedItem.LoanRecord?.[0]?.store && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">
													Store Information
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedItem.LoanRecord[0].store).map(
														([key, value]) => {
															// Handle null/undefined values
															if (value === null || value === undefined) {
																return (
																	<div key={key}>
																		<p className="text-sm text-default-500">
																			{key}
																		</p>
																		<p className="font-medium">N/A</p>
																	</div>
																);
															}

															// Handle objects
															if (typeof value === "object") {
																return (
																	<div key={key}>
																		<p className="text-sm text-default-500">
																			{key}
																		</p>
																		<p className="font-medium">View Details</p>
																	</div>
																);
															}

															// Handle dates
															if (
																key.toLowerCase().includes("date") ||
																key.toLowerCase().includes("at")
															) {
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
															if (typeof value === "boolean") {
																value = value ? "Yes" : "No";
															}

															return (
																<div key={key}>
																	<p className="text-sm text-default-500">
																		{key}
																	</p>
																	<p className="font-medium">{String(value)}</p>
																</div>
															);
														}
													)}
												</div>
											</div>
										)}

										{/* Device Information */}
										{selectedItem.LoanRecord?.[0]?.device && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">
													Device Information
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(
														selectedItem.LoanRecord[0].device
													).map(([key, value]) => {
														// Handle null/undefined values
														if (value === null || value === undefined) {
															return (
																<div key={key}>
																	<p className="text-sm text-default-500">
																		{key}
																	</p>
																	<p className="font-medium">N/A</p>
																</div>
															);
														}

														// Handle objects
														if (typeof value === "object") {
															return (
																<div key={key}>
																	<p className="text-sm text-default-500">
																		{key}
																	</p>
																	<p className="font-medium">View Details</p>
																</div>
															);
														}

														// Handle dates
														if (
															key.toLowerCase().includes("date") ||
															key.toLowerCase().includes("at")
														) {
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
														if (typeof value === "boolean") {
															value = value ? "Yes" : "No";
														}

														// Format currency values
														if (
															typeof value === "number" &&
															(key.toLowerCase().includes("price") ||
																key.toLowerCase().includes("amount"))
														) {
															value = `₦${Number(value).toLocaleString()}`;
														}

														return (
															<div key={key}>
																<p className="text-sm text-default-500">
																	{key}
																</p>
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
								<Button color="danger" variant="light" onPress={onClose}>
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
