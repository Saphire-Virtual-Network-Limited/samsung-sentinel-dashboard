"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	getAllCustomerRecord,
	capitalize,
	getAllDownpaymentLowerThan20,
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
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";

const columns: ColumnDef[] = [
	{ name: "Customer Id", uid: "customerId", sortable: true },
	{ name: "Phone No.", uid: "bvnPhoneNumber", sortable: true },
	{ name: "Device Amount", uid: "deviceAmount", sortable: true },
	{ name: "Down Payment", uid: "downPayment", sortable: true },
	{ name: "Shortfall", uid: "shortfall", sortable: true },
	{ name: "Expected Down Payment", uid: "expectedDownPayment", sortable: true },
	{
		name: "Down Payment Percentage",
		uid: "downPaymentPercentage",
		sortable: true,
	},
	{ name: "Loan Amount", uid: "loanAmount", sortable: true },
	{ name: "Monthly Repayment", uid: "monthlyRepayment", sortable: true },
	{ name: "Loan Status", uid: "loanStatus", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Display columns for table view
const displayColumns: ColumnDef[] = [
	{ name: "Customer Id", uid: "customerId", sortable: true },
	{ name: "Customer Name", uid: "customerName", sortable: true },
	{ name: "Customer Phone", uid: "customerPhone", sortable: true },
	{ name: "Customer Email", uid: "customerEmail", sortable: true },
	{ name: "Device Id", uid: "deviceId", sortable: true },
	{ name: "Device Name", uid: "deviceName", sortable: true },
	{ name: "Device IMEI", uid: "deviceImei", sortable: true },
	{ name: "Device Manufacturer", uid: "deviceManufacturer", sortable: true },
	{ name: "Store Id", uid: "storeId", sortable: true },
	{ name: "Store Name", uid: "storeName", sortable: true },
	{ name: "Store City", uid: "storeCity", sortable: true },
	{ name: "Store State", uid: "storeState", sortable: true },
	{ name: "Store Partner", uid: "storePartner", sortable: true },
	{ name: "MBE Name", uid: "mbeName", sortable: true },
	{ name: "MBE Phone", uid: "mbePhone", sortable: true },
	{ name: "Insurance Package", uid: "insurancePackage", sortable: true },
	{ name: "Insurance Price", uid: "insurancePrice", sortable: true },
	{ name: "Mbs Eligible Amount", uid: "mbsEligibleAmount", sortable: true },
	{ name: "Pay Frequency", uid: "payFrequency", sortable: true },
	{ name: "Monthly Repayment", uid: "monthlyRepayment", sortable: true },
	{ name: "Duration", uid: "duration", sortable: true },
	{ name: "Interest Amount", uid: "interestAmount", sortable: true },
	{ name: "Device Price", uid: "devicePrice", sortable: true },
	{ name: "Device Amount", uid: "deviceAmount", sortable: true },
	{ name: "Loan Amount", uid: "loanAmount", sortable: true },
	{ name: "Down Payment", uid: "downPayment", sortable: true },
	{
		name: "Down Payment Percentage",
		uid: "downPaymentPercentage",
		sortable: true,
	},
	{ name: "Expected Down Payment", uid: "expectedDownPayment", sortable: true },
	{ name: "Shortfall", uid: "shortfall", sortable: true },
	{ name: "Device On Loan Status", uid: "deviceOnLoanStatus", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Updated At", uid: "updatedAt", sortable: true },
	{ name: "Channel", uid: "channel", sortable: true },
	{ name: "Loan Status", uid: "loanStatus", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "Pending", uid: "pending" },
	{ name: "Approved", uid: "approved" },
	{ name: "Rejected", uid: "rejected" },
	{ name: "Enrolled", uid: "enrolled" },
	{ name: "Defaulted", uid: "defaulted" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	approved: "success",
	rejected: "danger",
	enrolled: "warning",
	defaulted: "danger",
};

type CustomerRecord = {
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
	deviceName: string;
	mbeId: string;
	solarPackageId: string | null;
	powerflexCustomCalculationId: string | null;
	downPaymentPercentage: string;
	expectedDownPayment: number;
	shortfall: number;
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
		inputtedDob: string;
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
		deviceCamera: string[];
		android_go: string;
		erpItemCode: string | null;
		erpName: string | null;
		erpSerialNo: string | null;
		devfinStatus: boolean;
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
		phoneNumber: string | null;
		storeEmail: string;
		longitude: number;
		latitude: number;
		clusterId: number;
		partner: string;
		storeOpen: string;
		storeClose: string;
		status: string;
		createdAt: string;
		updatedAt: string;
		storeId: string;
		isArchived: boolean;
		storeErpId: string | null;
		channel: string | null;
	};
	mbe?: {
		title: string;
		createdAt: string;
		mbeId: string;
		mbe_old_id: string;
		updatedAt: string;
		firstname: string;
		lastname: string;
		phone: string;
		state: string | null;
		username: string;
		accountStatus: string;
		bvn: string | null;
		bvnPhoneNumber: string | null;
		channel: string;
		dob: string | null;
		email: string | null;
		isActive: boolean;
		otp: string | null;
		otpExpiry: string | null;
		password: string | null;
		role: string;
		tokenVersion: number;
		resetOtp: string | null;
		resetOtpExpiry: string | null;
		imagePublicId: string | null;
		imageUrl: string | null;
		defaultSplitPercent: number | null;
		userId: string | null;
	};
	solarPackage: any | null;
	powerflexCustomCalculation: any | null;
	DeviceOnLoan: Array<{
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
		lockType: string;
	}>;
	LoanRecordCard: any[];
	StoresOnLoan: Array<{
		storeOnLoanId: string;
		storeId: string;
		loanRecordId: string;
		amount: number;
		status: string;
		createdAt: string;
		updatedAt: string;
		channel: string;
		bankUsed: string;
		payChannel: string;
		reference: string;
		sessionId: string;
		tnxId: string;
	}>;
	WacsCustomerLoan: any | null;
};

export default function LowDownpayment() {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/customers -> dev)
	const role = pathname.split("/")[2];
	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "customerId",
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
	const { data: raw, isLoading } = useSWR(
		["low-downpayment"],
		() =>
			getAllDownpaymentLowerThan20()
				.then((r) => {
					if (!r.data || r.data.length === 0) {
						setHasNoRecords(true);
						return [];
					}
					setHasNoRecords(false);
					return r.data;
				})
				.catch((error) => {
					console.error("Error fetching low downpayment records:", error);
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

	console.log("Raw data:", raw);

	const customers = useMemo(
		() =>
			(Array.isArray(raw?.data) ? raw.data : []).map((r: CustomerRecord) => ({
				...r,
				customerId: r.customerId ? r.customerId : "N/A",
				channel: r.channel ? r.channel : "N/A",
				loanStatus: r.loanStatus ? r.loanStatus : "N/A",
				createdAt: r.createdAt
					? new Date(r.createdAt).toLocaleString("en-GB")
					: "N/A",
				updatedAt: r.updatedAt
					? new Date(r.updatedAt).toLocaleString("en-GB")
					: "N/A",
				downPaymentPercentage: r.downPaymentPercentage
					? `${r.downPaymentPercentage}%`
					: "N/A",
				expectedDownPayment: r.expectedDownPayment
					? r.expectedDownPayment.toString()
					: "N/A",
				shortfall: r.shortfall ? r.shortfall.toString() : "N/A",
				monthlyRepayment: r.monthlyRepayment
					? r.monthlyRepayment.toString()
					: "N/A",
				duration: r.duration ? r.duration.toString() : "N/A",
				interestAmount: r.interestAmount ? r.interestAmount.toString() : "N/A",
				deviceName: r.deviceName ? r.deviceName : "N/A",
				mbeId: r.mbeId ? r.mbeId : "N/A",
				deviceAmount: r.deviceAmount ? r.deviceAmount.toString() : "N/A",
				devicePrice: r.devicePrice ? r.devicePrice.toString() : "N/A",
				loanAmount: r.loanAmount ? r.loanAmount.toString() : "N/A",
				downPayment: r.downPayment ? r.downPayment.toString() : "N/A",
				insurancePackage: r.insurancePackage ? r.insurancePackage : "N/A",
				insurancePrice: r.insurancePrice ? r.insurancePrice.toString() : "N/A",
				mbsEligibleAmount: r.mbsEligibleAmount
					? r.mbsEligibleAmount.toString()
					: "N/A",
				payFrequency: r.payFrequency ? r.payFrequency : "N/A",
				storeId: r.storeId ? r.storeId : "N/A",
				deviceId: r.deviceId ? r.deviceId : "N/A",
				// Add customer information
				customerName: r.customer
					? `${r.customer.firstName} ${r.customer.lastName}`
					: "N/A",
				customerEmail: r.customer?.email || "N/A",
				customerPhone: r.customer?.bvnPhoneNumber || "N/A",
				customerBVN: r.customer?.bvn || "N/A",
				// Add store information
				storeName: r.store?.storeName || "N/A",
				storeCity: r.store?.city || "N/A",
				storeState: r.store?.state || "N/A",
				storePartner: r.store?.partner || "N/A",
				// Add MBE information
				mbeName: r.mbe ? `${r.mbe.firstname} ${r.mbe.lastname}` : "N/A",
				mbePhone: r.mbe?.phone || "N/A",
				mbeUsername: r.mbe?.username || "N/A",
				// Add device information
				deviceManufacturer: r.device?.deviceManufacturer || "N/A",
				deviceModelNumber: r.device?.deviceModelNumber || "N/A",
				deviceSAP: r.device?.SAP?.toString() || "N/A",
				deviceSLD: r.device?.SLD?.toString() || "N/A",
				deviceSentiprotect: r.device?.sentiprotect?.toString() || "N/A",
				// Add IMEI from DeviceOnLoan
				deviceImei: r.DeviceOnLoan?.[0]?.imei || "N/A",
				deviceOnLoanStatus: r.DeviceOnLoan?.[0]?.status || "N/A",
				// Add store payment information
				storePaymentStatus: r.StoresOnLoan?.[0]?.status || "N/A",
				storePaymentBank: r.StoresOnLoan?.[0]?.bankUsed || "N/A",
				storePaymentReference: r.StoresOnLoan?.[0]?.reference || "N/A",
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter(
				(c) =>
					c.customerId?.toLowerCase().includes(f) ||
					c.customerName?.toLowerCase().includes(f) ||
					c.customerPhone?.toLowerCase().includes(f) ||
					c.customerEmail?.toLowerCase().includes(f) ||
					c.customerBVN?.toLowerCase().includes(f) ||
					c.loanDiskId?.toLowerCase().includes(f) ||
					c.lastPoint?.toLowerCase().includes(f) ||
					c.channel?.toLowerCase().includes(f) ||
					c.loanStatus?.toLowerCase().includes(f) ||
					c.createdAt?.toLowerCase().includes(f) ||
					c.updatedAt?.toLowerCase().includes(f) ||
					c.loanAmount?.toString().toLowerCase().includes(f) ||
					c.deviceId?.toLowerCase().includes(f) ||
					c.deviceName?.toLowerCase().includes(f) ||
					c.deviceImei?.toLowerCase().includes(f) ||
					c.deviceManufacturer?.toLowerCase().includes(f) ||
					c.deviceModelNumber?.toLowerCase().includes(f) ||
					c.downPayment?.toString().toLowerCase().includes(f) ||
					c.insurancePackage?.toLowerCase().includes(f) ||
					c.insurancePrice?.toString().toLowerCase().includes(f) ||
					c.mbsEligibleAmount?.toString().toLowerCase().includes(f) ||
					c.payFrequency?.toLowerCase().includes(f) ||
					c.storeId?.toLowerCase().includes(f) ||
					c.storeName?.toLowerCase().includes(f) ||
					c.storeCity?.toLowerCase().includes(f) ||
					c.storeState?.toLowerCase().includes(f) ||
					c.storePartner?.toLowerCase().includes(f) ||
					c.mbeName?.toLowerCase().includes(f) ||
					c.mbePhone?.toLowerCase().includes(f) ||
					c.mbeUsername?.toLowerCase().includes(f) ||
					c.devicePrice?.toString().toLowerCase().includes(f) ||
					c.deviceAmount?.toString().toLowerCase().includes(f) ||
					c.monthlyRepayment?.toString().toLowerCase().includes(f) ||
					c.duration?.toString().toLowerCase().includes(f) ||
					c.interestAmount?.toString().toLowerCase().includes(f) ||
					c.mbeId?.toLowerCase().includes(f) ||
					c.solarPackageId?.toLowerCase().includes(f) ||
					c.powerflexCustomCalculationId?.toLowerCase().includes(f) ||
					c.downPaymentPercentage?.toLowerCase().includes(f) ||
					c.expectedDownPayment?.toString().toLowerCase().includes(f) ||
					c.shortfall?.toString().toLowerCase().includes(f) ||
					c.deviceOnLoanStatus?.toLowerCase().includes(f) ||
					c.storePaymentStatus?.toLowerCase().includes(f) ||
					c.storePaymentBank?.toLowerCase().includes(f) ||
					c.storePaymentReference?.toLowerCase().includes(f)
			);
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) =>
				statusFilter.has(c.loanStatus?.toLowerCase() || "")
			);
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
			const aVal = a[sortDescriptor.column as keyof CustomerRecord];
			const bVal = b[sortDescriptor.column as keyof CustomerRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: CustomerRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Low Downpayment");
		ws.columns = displayColumns
			.filter((c) => c.uid !== "actions")
			.map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) =>
			ws.addRow({ ...r, status: capitalize(r.loanStatus || "") })
		);

		// Apply Naira currency formatting to relevant columns
		const currencyColumns = [
			"deviceAmount",
			"downPayment",
			"expectedDownPayment",
			"loanAmount",
			"monthlyRepayment",
			"insurancePrice",
			"mbsEligibleAmount",
			"devicePrice",
			"interestAmount",
			"shortfall",
		];
		currencyColumns.forEach((col) => {
			const colObj = ws.getColumn(col);
			if (colObj) {
				colObj.numFmt = "#,##0.00";
			}
		});

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "low_downpayment.xlsx");
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: CustomerRecord, key: string) => {
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
							<DropdownItem
								key="view"
								onPress={() =>
									router.push(`/access/${role}/customers/${row.customerId}`)
								}
							>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}
		if (key === "loanStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.loanStatus || ""]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.loanStatus || "")}
				</Chip>
			);
		}
		return (
			<div
				className="text-small cursor-pointer"
				onClick={() =>
					router.push(`/access/${role}/customers/${row.customerId}`)
				}
			>
				{(row as any)[key]}
			</div>
		);
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end"></div>

			{isLoading ? (
				<TableSkeleton columns={displayColumns.length} rows={10} />
			) : (
				<GenericTable<CustomerRecord>
					columns={displayColumns}
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
