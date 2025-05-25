"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllCustomerRecord, capitalize, calculateAge } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { SelectField } from "@/components/reususables/form";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "fullName", sortable: true },
	{ name: "Contact No.", uid: "bvnPhoneNumber" },
	{ name: "Age", uid: "age", sortable: true },
	{ name: "State", uid: "state", sortable: true },
	{ name: "City", uid: "city", sortable: true },
	{ name: "Region", uid: "region", sortable: true },
	{ name: "Loan Amount", uid: "loanAmount", sortable: true },

	


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
	MonoCustomer?: {
		customerId: string;
		createdAt: string;
		updatedAt: string;
		email: string;
		name: string;
		connectedCustomerId: string;
		monourl: string;
		tempAccountId: string;
	};
	regBy: string;
	CustomerKYC?: Array<{
		kycId: string;
		customerId: string;
		phone2: string;
		phone3: string;
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
		createdAt: string;		
		updatedAt: string;
		phone2Status: string;
		phone3Status: string;
		status2Comment: string;
		status3Comment: string;
		channel: string;
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
		LoanRecordCard: [];
	}>;
	TransactionHistory?: Array<{
		transactionHistoryId: string;
		amount: number;
		paymentType: string;
		prevBalance: number;
		newBalance: number;
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
};

export default function CustomerPage() {
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
				fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,

				age: calculateAge(r.dob),
				state: r.CustomerKYC?.[0]?.state || 'N/A',
				city: r.CustomerKYC?.[0]?.town || 'N/A',
				bvnPhoneNumber: r.bvnPhoneNumber,
				loanAmount: r.LoanRecord?.[0]?.loanAmount || 'N/A',
				region: r.CustomerKYC?.[0]?.localGovernment || 'N/A',
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
			const aVal = a[sortDescriptor.column as keyof CustomerRecord];
			const bVal = b[sortDescriptor.column as keyof CustomerRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: CustomerRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Customers");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status || '') }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Customer_Records.xlsx");
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
								onPress={() => router.push(`/access/${role}/customers/${row.customerId}`)}>
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
			return <p className="capitalize cursor-pointer" onClick={() => router.push(`/access/${role}/customers/${row.customerId}`)}>{row.fullName}</p>;
		}
		return <p className="text-small cursor-pointer" onClick={() => router.push(`/access/${role}/customers/${row.customerId}`)}>{(row as any)[key]}</p>;
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end">
			</div>
			
			<GenericTable<CustomerRecord>
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
		</>
	);
}
