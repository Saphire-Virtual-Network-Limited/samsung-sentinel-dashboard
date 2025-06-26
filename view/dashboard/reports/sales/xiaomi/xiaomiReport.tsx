"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllCustomerRecord, capitalize } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";


const columns: ColumnDef[] = [
    { name: "Customer Id", uid: "customerId", sortable: true },
	{ name: "Loan ID", uid: "loanRecordId", sortable: true },
    { name: "Name", uid: "fullName", sortable: true },
    { name: "Phone No.", uid: "bvnPhoneNumber", sortable: true },
    { name: "Alt. No.", uid: "mainPhoneNumber", sortable: true },
    { name: "Email", uid: "email", sortable: true },
    { name: "Age", uid: "age", sortable: true },
    { name: "House No.", uid: "houseNumber", sortable: true },
    { name: "Street", uid: "streetAddress", sortable: true },
    { name: "Nearest Bus Stop", uid: "nearestBusStop", sortable: true },
    { name: "City", uid: "city", sortable: true },
    { name: "Region", uid: "customerRegion", sortable: true },
    { name: "State", uid: "customerState", sortable: true },
    { name: "Occupation", uid: "occupation", sortable: true },
    { name: "Business Name", uid: "businessName", sortable: true },
    { name: "Business Address", uid: "businessAddress", sortable: true },
    { name: "Device Name", uid: "deviceName", sortable: true },
    { name: "IMEI", uid: "imei", sortable: true },
    { name: "Device Status", uid: "deviceStatus", sortable: true },
    { name: "Insurance Package", uid: "insurancePackage", sortable: true },
    { name: "Insurance Price", uid: "insurancePrice", sortable: true },
    { name: "Device Price", uid: "devicePrice", sortable: true },
    { name: "Store Price", uid: "storePrice", sortable: true },
    // { name: "Margin", uid: "margin", sortable: true },
    { name: "Loan Amount", uid: "loanAmount", sortable: true },
    { name: "Down Payment", uid: "downPayment", sortable: true },
	{ name: "Monthly Repayment", uid: "monthlyRepayment", sortable: true },
    { name: "Amount Remaining", uid: "amountRemaining", sortable: true },
    { name: "Loan Tenure", uid: "duration", sortable: true },
    { name: "Application Date", uid: "createdAt", sortable: true },
    { name: "Next Pay Date", uid: "nextPayDate", sortable: true },
    { name: "Next Pay Amount", uid: "nextPayAmount", sortable: true },
    { name: "Completion Date", uid: "completionDate", sortable: true },
    { name: "Sale Channel", uid: "saleChannel", sortable: true },
    { name: "Sale Person", uid: "salePerson", sortable: true },
    { name: "Store Name", uid: "storeName", sortable: true },
    { name: "Cluster", uid: "cluster", sortable: true },
    { name: "Region", uid: "mbeRegion", sortable: true },
    { name: "State", uid: "mbeState", sortable: true },
    { name: "Source", uid: "source", sortable: true },
    { name: "Loan Status", uid: "loanStatus", sortable: true },
    { name: "Actions", uid: "actions"},
];

// Display columns for table view
const displayColumns: ColumnDef[] = [
    // { name: "Customer Id", uid: "customerId", sortable: true },
    { name: "Name", uid: "fullName", sortable: true },
    { name: "Phone No.", uid: "bvnPhoneNumber", sortable: true },
    // { name: "Email", uid: "email", sortable: true },
    // { name: "Device Name", uid: "deviceName", sortable: true },
	{ name: "Device Price", uid: "devicePrice", sortable: true },
	{ name: "Insurance Price", uid: "insurancePrice", sortable: true },
	{ name: "Store Price", uid: "storePrice", sortable: true },
	// { name: "Margin", uid: "margin", sortable: true },
    { name: "Loan Amount", uid: "loanAmount", sortable: true },
    { name: "Monthly Repayment", uid: "monthlyRepayment", sortable: true },
    { name: "Loan Status", uid: "loanStatus", sortable: true },
    { name: "Actions", uid: "actions"},
];

const statusOptions = [
	{ name: "Pending", uid: "pending" },
	{ name: "Approved", uid: "approved" },
	{ name: "Rejected", uid: "rejected" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	approved: "success",
	rejected: "danger",
};

type CustomerRecord = {
	customerId: string;
	firstName: string;
	lastName: string;
	email: string;
	bvn: string;
	dob: string;
  inputtedDob: string;
	dobMisMatch: boolean;
	createdAt: string;
	updatedAt: string;
	customerLoanDiskId: string;
	channel: string;
	bvnPhoneNumber: string;
	mainPhoneNumber: string;
	mbeId: string;
	monoCustomerConnectedCustomerId: string;
	fullName?: string;
	age?: number;
	status?: string;
	Wallet?: {
		wallet_id: string;
		accountNumber: string;
		bankName: string;
		dva_id: number;
		accountName: string;
		bankId: number;
		currency: string;
		cust_code: string;
		cust_id: number;
		userId: string;
		created_at: string;
		updated_at: string;
		customerId: string;
	};
	WalletBalance?: {
		balanceId: string;
		userId: string;
		balance: number;
		lastBalance: number;
		created_at: string;
		updated_at: string;
		customerId: string;
	};
	TransactionHistory?: Array<{
		transactionHistoryId: string;
		amount: number;
		paymentType: string;
		prevBalance: number | null | string;
		newBalance: number | null | string;
		paymentReference: string;
		extRef: string;
		currency: string;
		channel: string;
		charge: number;
		chargeNarration: string;
		senderBank: string;
		senderAccount: string;
		recieverBank: string;
		recieverAccount: string;
		paymentDescription: string;
		paid_at: string;
		createdAt: string;
		updatedAt: string;
		userid: string;
		customersCustomerId: string;
	}>;
	CustomerKYC?: Array<{
		kycId: string;
		customerId: string;
		houseNumber: string;
		streetAddress: string;
		nearestBusStop: string;
		localGovernment: string;
		state: string;
		town: string;
		occupation: string;
		businessName: string;
		applicantBusinessAddress: string;
		applicantAddress: string;
		source: string;
    phone2: string;
	phone3: string;
	phone4: string;
	phone5: string;
	phoneApproved: string;
  generalStatus: string;
		createdAt: string;
		updatedAt: string;
		status2Comment: string | null;
		status3Comment: string | null;
		channel: string;
		phone2Status: string;
		phone3Status: string;
	}>;
	CustomerAccountDetails?: Array<{
		customerAccountDetailsId: string;
		customerId: string;
		accountNumber: string;
		bankCode: string;
		channel: string;
		createdAt: string;
		updatedAt: string;
		bankID: number;
		bankName: string;
	}>;
	CustomerMandate?: Array<{
		customerMandateId: string;
		customerId: string;
		mandateId: string;
		status: string;
		monoCustomerId: string;
		mandate_type: string;
		debit_type: string;
		ready_to_debit: boolean;
		approved: boolean;
		start_date: string;
		end_date: string;
		reference: string;
		channel: string;
		createdAt: string;
		updatedAt: string;
		message: string;
	}>;
	LoanRecord?: Array<{
		loanRecordId: string;
		customerId: string;
		loanDiskId: string;
		customerLoanDiskId: string;
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
		LoanRecordCard: any[];
		store: {
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
		device: {
			price: number | string | null;
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
		StoresOnLoan: Array<{
			storeOnLoanId: string;
			storeId: string;
			loanRecordId: string;
			amount: number;
			status: string;
			createdAt: string;
			updatedAt: string;
			channel: string;
			tnxId: string | null;
			sessionId: string | null;
			reference: string | null;
			payChannel: string | null;
			bankUsed: string | null;
		}>;
		DeviceOnLoan: Array<{
			deviceOnLoanId: string;
			deviceId: string;
			loanRecordId: string;
			status: string;
			createdAt: string;
			updatedAt: string;
			channel: string;
			imei: string | null;
			amount: number;
			devicePrice: number;
		}>;
	}>;
	regBy: {
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
		assignedStoreBranch: string | null;
		bvn: string | null;
		bvnPhoneNumber: string | null;
		channel: string | null;
		dob: string | null;
		email: string | null;
		isActive: boolean;
		otp: string | null;
		otpExpiry: string | null;
		password: string | null;
		role: string;
		tokenVersion: number;
		stores: Array<{
			id: string;
			mbeOldId: string;
			storeOldId: number;
			mbeId: string | null;
			storeId: string | null;
			store: {
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
		}>;
	};
	MonoCustomer?: {
		customerId: string;
		createdAt: string;
		updatedAt: string;
		email: string;
		name: string;
		connectedCustomerId: string;
		monourl: string;
		tempAccountId: string | null;
		CustomerAccounts: any[];
	};
};

export default function XiaomiReport() {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/customers -> dev)
	const role = pathname.split('/')[2];
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
		startDate && endDate ? ["customer-records", startDate, endDate] : "customer-records",
		() => getAllCustomerRecord(startDate, endDate)
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
				console.error("Error fetching customer records:", error);
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
			raw.map((r: CustomerRecord) => ({
				...r,
                customerId: r.customerId || 'N/A',
				loanRecordId: r.LoanRecord?.[0]?.loanRecordId || 'N/A',
				fullName: (r.firstName ? r.firstName[0].toUpperCase() + r.firstName.slice(1).toLowerCase() : '') + ' ' + (r.lastName ? r.lastName[0].toUpperCase() + r.lastName.slice(1).toLowerCase() : '') || 'N/A',
				age: r.dob ? `${new Date().getFullYear() - new Date(r.dob).getFullYear()}` : 'N/A',
				houseNumber: r.CustomerKYC?.[0]?.houseNumber || 'N/A',
				streetAddress: r.CustomerKYC?.[0]?.streetAddress || 'N/A',
				nearestBusStop: r.CustomerKYC?.[0]?.nearestBusStop || 'N/A',
				city: r.CustomerKYC?.[0]?.town || 'N/A',
				customerRegion: r.CustomerKYC?.[0]?.localGovernment || 'N/A',
				customerState: r.CustomerKYC?.[0]?.state || 'N/A',
				occupation: r.CustomerKYC?.[0]?.occupation || 'N/A',
				businessName: r.CustomerKYC?.[0]?.businessName || 'N/A',
				businessAddress: r.CustomerKYC?.[0]?.applicantBusinessAddress || 'N/A',
				deviceName: r.LoanRecord?.[0]?.deviceName || 'N/A',
				imei: r.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.imei || 'N/A',
				deviceStatus: r.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.status || 'N/A',
				insurancePackage: r.LoanRecord?.[0]?.insurancePackage || 'N/A',
				insurancePrice: r.LoanRecord?.[0]?.insurancePrice ? `₦${r.LoanRecord[0].insurancePrice.toLocaleString()}` : 'N/A',
				devicePrice: r.LoanRecord?.[0]?.device?.price ? `₦${r.LoanRecord[0].device.price.toLocaleString()}` : 'N/A',
				storePrice: r.LoanRecord?.[0]?.devicePrice ? `₦${r.LoanRecord[0].devicePrice.toLocaleString()}` : 'N/A',
				margin: r.LoanRecord?.[0]?.devicePrice && r.LoanRecord?.[0]?.device?.price ? 
					`₦${(Number(r.LoanRecord[0].devicePrice) - Number(r.LoanRecord[0].device.price)).toLocaleString()}` : 'N/A',
				loanAmount: r.LoanRecord?.[0]?.loanAmount ? `₦${r.LoanRecord[0].loanAmount.toLocaleString()}` : 'N/A',
				downPayment: r.LoanRecord?.[0]?.downPayment ? `₦${r.LoanRecord[0].downPayment.toLocaleString()}` : 'N/A',
				duration: r.LoanRecord?.[0]?.duration || 'N/A',
				loanTenure: r.LoanRecord?.[0]?.duration || 'N/A',
				monthlyRepayment: r.LoanRecord?.[0]?.monthlyRepayment ? `₦${r.LoanRecord[0].monthlyRepayment.toLocaleString()}` : 'N/A',
				amountRemaining: r.LoanRecord?.[0]?.monthlyRepayment && r.LoanRecord[0]?.duration ? `₦${(r.LoanRecord[0].monthlyRepayment * r.LoanRecord[0].duration).toLocaleString()}` : 'N/A',
				createdAt: r.LoanRecord?.[0]?.createdAt ? new Date(r.LoanRecord[0].createdAt).toLocaleDateString() : 'N/A',
				nextPayDate: r.LoanRecord?.[0]?.createdAt ? new Date(new Date(r.LoanRecord[0].createdAt).setMonth(new Date(r.LoanRecord[0].createdAt).getMonth() + 1)).toLocaleDateString() : 'N/A',
				nextPayAmount: r.LoanRecord?.[0]?.monthlyRepayment ? `₦${r.LoanRecord[0].monthlyRepayment.toLocaleString()}` : 'N/A',
				completionDate: r.LoanRecord?.[0]?.createdAt ? new Date(new Date(r.LoanRecord[0].createdAt).setMonth(new Date(r.LoanRecord[0].createdAt).getMonth() + r.LoanRecord[0].duration)).toLocaleDateString() : 'N/A',
				saleChannel: r.regBy?.title || 'N/A',
				salePerson: (r.regBy?.firstname && r.regBy?.lastname) ? `${r.regBy.firstname} ${r.regBy.lastname}` : 'N/A',
				storeName: r.LoanRecord?.[0]?.store?.storeName || 'N/A',
				cluster: r.LoanRecord?.[0]?.store?.clusterId || 'N/A',
				// mbeRegion: r.LoanRecord?.[0]?.store?.region || 'N/A',
				mbeRegion: r.CustomerKYC?.[0]?.localGovernment || 'N/A',
				mbeState: r.LoanRecord?.[0]?.store?.state || 'N/A',
				source: r.CustomerKYC?.[0]?.source || 'N/A',
				loanStatus: r.LoanRecord?.[0]?.loanStatus || 'N/A',
               
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers].filter(c => c.LoanRecord?.[0]?.loanStatus === 'APPROVED' && c.regBy?.title === 'XIAOMI PROMOTER');
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => 
				c.firstName?.toLowerCase().includes(f) || 
			c.lastName?.toLowerCase().includes(f) || 
			c.email?.toLowerCase().includes(f) ||
			c.bvnPhoneNumber?.toLowerCase().includes(f) ||
			c.mainPhoneNumber?.toLowerCase().includes(f) ||
			c.regBy?.mbe_old_id?.toLowerCase().includes(f) ||
			c.customerId?.toLowerCase().includes(f) ||
			(c.bvn && c.bvn.toString().toLowerCase().includes(f)) ||
			c.LoanRecord?.[0]?.loanRecordId?.toLowerCase().includes(f) ||
			c.LoanRecord?.[0]?.storeId?.toLowerCase().includes(f) ||
			c.CustomerAccountDetails?.[0]?.accountNumber?.toLowerCase().includes(f)
			);
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
			const aVal = a[sortDescriptor.column as keyof CustomerRecord];
			const bVal = b[sortDescriptor.column as keyof CustomerRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: CustomerRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Xiaomi Customers");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status || '') }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "xiaomi_Records.xlsx");
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: CustomerRecord, key: string) => {
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
								onPress={() => router.push(`/access/${role}/customers/${row.customerId}`)}
                                >
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
		if (key === "fullName") {
			return <div className="capitalize cursor-pointer" onClick={() => router.push(`/access/${role}/customers/${row.customerId}`)}>{(row as any)[key]}</div>;
		}
		return <div className="text-small cursor-pointer" onClick={() => router.push(`/access/${role}/customers/${row.customerId}`)}>{(row as any)[key]}</div>;
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end">
			</div>
			
			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
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
