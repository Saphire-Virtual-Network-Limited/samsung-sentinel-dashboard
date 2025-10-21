"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { getAllDueLoanRecord, capitalize, calculateAge } from "@/lib";
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

// Display columns for table view
const displayColumns: ColumnDef[] = [
	{ name: "Name", uid: "fullName", sortable: true },
	{ name: "Device Price", uid: "devicePrice", sortable: true },
	{ name: "Loan Amount", uid: "loanAmount", sortable: true },
	{ name: "Monthly Repayment", uid: "monthlyRepayment", sortable: true },
	{ name: "Loan Status", uid: "loanStatus", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const columns: ColumnDef[] = [
	{ name: "Customer ID", uid: "customerId", sortable: true },
	{ name: "Full Name", uid: "fullName", sortable: true },
	{ name: "Age", uid: "age", sortable: true },
	{ name: "Email", uid: "email", sortable: true },
	{ name: "Phone", uid: "phone", sortable: true },
	{ name: "Alt Phone", uid: "altPhone", sortable: true },
	{ name: "State", uid: "state", sortable: true },
	{ name: "Loan Amount", uid: "loanAmount", sortable: true },
	{ name: "Duration", uid: "duration", sortable: true },
	{ name: "Start Date", uid: "startDate", sortable: true },
	{ name: "End Date", uid: "endDate", sortable: true },
	{ name: "Interest", uid: "interest", sortable: true },
	{ name: "Loan Balance", uid: "loanBalance", sortable: true },
	{ name: "Amount Paid", uid: "AmountPaid", sortable: true },
	{ name: "Total Amount", uid: "totalAmount", sortable: true },
	{ name: "Principal Repaid", uid: "PrincipalRepaid", sortable: true },
	{ name: "Interest Repaid", uid: "interestRepaid", sortable: true },
	{ name: "Monthly Repayment", uid: "monthlyRepayment", sortable: true },
	{ name: "Number of Repayments", uid: "numberOfRepayments", sortable: true },
	{
		name: "Number of Missed Repayments",
		uid: "numberOfMissedRepayments",
		sortable: true,
	},
	{ name: "Due Date", uid: "DueDate", sortable: true },
	{ name: "Status", uid: "Status", sortable: true },
	{ name: "Device Name", uid: "deviceName", sortable: true },
	{ name: "Device IMEI", uid: "deviceImei", sortable: true },
	{ name: "Service", uid: "service", sortable: true },
	{ name: "Sale Channel", uid: "saleChannel", sortable: true },
	{ name: "Sale Rep", uid: "sale_Rep", sortable: true },
	{
		name: "Sale Rep Phone Number",
		uid: "sale_Rep_Phone_Number",
		sortable: true,
	},

	{ name: "Store Name", uid: "storeName", sortable: true },
	{ name: "Down Payment", uid: "downPayment", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "Enrolled", uid: "enrolled" },
	{ name: "Pending", uid: "pending" },
	{ name: "Approved", uid: "approved" },
	{ name: "Running", uid: "running" },
	{ name: "Completed", uid: "completed" },
	{ name: "Cancelled", uid: "cancelled" },
	{ name: "Due", uid: "due" },
	{ name: "Rejected", uid: "rejected" },
	{ name: "Defaulted", uid: "defaulted" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	pending: "warning",
	approved: "success",
	rejected: "danger",
	enrolled: "warning",
	defaulted: "danger",
	due: "warning",
	completed: "success",
	cancelled: "danger",
	running: "warning",
};

type DueLoanRecord = {
	customers?: Array<{
		customerId?: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		bvn?: string;
		dob?: string;
		dobMisMatch?: boolean;
		createdAt?: string;
		updatedAt?: string;
		customerLoanDiskId?: string;
		channel?: string;
		bvnPhoneNumber?: string;
		mainPhoneNumber?: string;
		mbeId?: string;
		monoCustomerConnectedCustomerId?: string;
		inputtedDob?: string;
		LoanRecord?: [
			{
				loanRecordId?: string;
				customerId?: string;
				loanDiskId?: string;
				lastPoint?: string;
				channel?: string;
				loanStatus?: string;
				createdAt?: string;
				updatedAt?: string;
				loanAmount?: number;
				deviceId?: string;
				downPayment?: number;
				insurancePackage?: string;
				insurancePrice?: number;
				mbsEligibleAmount?: number;
				payFrequency?: string;
				storeId?: string;
				devicePrice?: number;
				deviceAmount?: number;
				monthlyRepayment?: number;
				duration?: number;
				interestAmount?: number;
				deviceName?: string;
				mbeId?: string;
				LoanRecordCard?: [
					{
						cardId?: string;
						cardRef?: string;
						cardAuthCode?: string;
						createdAt?: string;
						updatedAt?: string | null;
						loanRecordId?: string;
						channel?: string;
						deviceEnrollmentId?: string | null;
					}
				];

				DeviceOnLoan?: Array<{
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
				store?: {
					storeOldId?: number;
					storeName?: string;
					city?: string;
					state?: string;
					region?: string;
					address?: string;
					accountNumber?: string;
					accountName?: string;
					bankName?: string;
					bankCode?: string;
					phoneNumber?: string;
					storeEmail?: string;
					longitude?: number;
					latitude?: number;
					clusterId?: number;
					partner?: string;
					storeOpen?: string;
					storeClose?: string;
					createdAt?: string;
					updatedAt?: string;
					storeId?: string;
					isArchived?: boolean;
					storeErpId?: string | null;
					channel?: string | null;
				};
				device: {
					price?: number;
					deviceModelNumber?: string;
					SAP?: number;
					SLD?: number;
					createdAt?: string;
					deviceManufacturer?: string;
					deviceName?: string;
					newDeviceId?: string;
					oldDeviceId?: string;
					sentiprotect?: number;
					updatedAt?: string;
					deviceType?: string;
					deviceCamera?: any[];
					android_go?: string;
					erpItemCode?: string | null;
					erpName?: string | null;
					erpSerialNo?: string | null;
					devfinStatus?: boolean;
				};
				dueDate?: string;
				startDate?: string;
				endDate?: string;
				nextDueDate?: string;
			}
		];
		regBy: {
			title?: string;
			createdAt?: string;
			mbeId?: string;
			mbe_old_id?: string;
			updatedAt?: string;
			firstname?: string;
			lastname?: string;
			phone?: string;
			state?: string | null;
			username?: string;
			accountStatus?: string;
			bvn?: string | null;
			bvnPhoneNumber?: string | null;
			channel?: string;
			dob?: string | null;
			email?: string | null;
			isActive?: boolean;
			otp?: string | null;
			otpExpiry?: string | null;
			password?: string | null;
			role?: string;
			tokenVersion?: number;
			resetOtp?: string | null;
			resetOtpExpiry?: string | null;
			imagePublicId?: string | null;
			imageUrl?: string | null;
			userId?: string | null;
		};
		repaymentData?: {
			totalTransactions?: number;
			downPayments?: Array<{
				transactionId?: string;
				customerId?: string;
				loanId?: string;
				amount?: number;
				channel?: string;
				paymentReference?: string;
				paymentDescription?: string;
				createdAt?: string;
				isDownPayment?: boolean;
				isCardTokenization?: boolean;
				isLoanRepayment?: boolean;
				customerName?: string;
				customerEmail?: string;
			}>;
			cardTokenizations?: Array<{
				transactionId?: string;
				customerId?: string;
				loanId?: string;
				amount?: number;
				channel?: string;
				paymentReference?: string;
				paymentDescription?: string;
				createdAt?: string;
				isDownPayment?: boolean;
				isCardTokenization?: boolean;
				isLoanRepayment?: boolean;
				customerName?: string;
				customerEmail: string;
			}>;
			loanRepayments?: Array<{
				transactionId?: string;
				customerId?: string;
				loanId?: string;
				amount?: number;
				channel?: string;
				paymentReference?: string;
				paymentDescription?: string;
				createdAt?: string;
				isDownPayment?: boolean;
				isCardTokenization?: boolean;
				isLoanRepayment?: boolean;
				customerName?: string;
				customerEmail?: string;
			}>;
			summary?: {
				totalDownPaymentAmount?: number;
				totalRepaymentAmount?: number;
				totalCardTokenizationAmount?: number;
				repaymentCount?: number;
				downPaymentCount?: number;
				cardTokenizationCount?: number;
				loanInfo?: {
					totalLoanAmount?: number;
					totalDownPayment?: number;
					totalRepaid?: number;
					remainingAmount?: number;
					duration?: number;
					monthlyRepayment?: number;
					repaymentsLeft?: number;
				};
			};
		};
	}>;

	summary: {
		totalDue: number;
		totalWithRepaymentData: number;
		totalWithoutRepaymentData: number;
	};
	pagination: {	
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	}
};

type TransformedDueLoanRecord = {
	customerId?: string;
	fullName: string;
	age: string | number;
	email: string;
	phone: string;
	altPhone: string;
	state: string;
	loanAmount: string;
	duration: string | number;
	startDate: string;
	endDate: string;
	interest: string;
	loanBalance: string;
	AmountPaid: string;
	totalAmount: string;
	PrincipalRepaid: string;
	interestRepaid: string;
	monthlyRepayment: string;
	numberOfRepayments: string;
	numberOfMissedRepayments: string;
	DueDate: string;
	Status: string;
	deviceName: string;
	deviceImei: string;
	service: string;
	saleChannel: string;
	sale_Rep: string;
	sale_Rep_Phone_Number?: string;
	storeName: string;
	downPayment: string;
	devicePrice: string;
	loanStatus: string;
	customer?: any;
	device?: any;
	store?: any;
};

export default function DueLoansView() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | null>(null);

	const [selectedItem, setSelectedItem] =
		useState<TransformedDueLoanRecord | null>(null);

	// --- date filter state ---
	// Set default dates to last month 1st to 10th
	const getLastMonthDates = () => {
		const now = new Date();
		const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const start = lastMonth.toISOString().split('T')[0]; // YYYY-MM-DD format
		const end = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10).toISOString().split('T')[0];
		return { start, end };
	};

	const { start: defaultStartDate, end: defaultEndDate } = getLastMonthDates();
	const [startDate, setStartDate] = useState<string | undefined>(defaultStartDate);
	const [endDate, setEndDate] = useState<string | undefined>(defaultEndDate);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "fullName",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(50);
	const [totalCount, setTotalCount] = useState<number>(0);

	// Debug totalCount changes
	useEffect(() => {
		console.log("totalCount changed to:", totalCount);
	}, [totalCount]);

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
		setPage(1);
		setRowsPerPage(50);
	};

	const fromDate = startDate;
	const toDate = endDate;

	// Fetch data based on date filter
	const { data: raw = [], isLoading } = useSWR(
		fromDate && toDate
			? ["due-loans-records", fromDate, toDate, page, rowsPerPage]
			: ["due-loans-records", page, rowsPerPage],
		() =>
			getAllDueLoanRecord(fromDate, toDate, page, rowsPerPage)
				.then((r) => {
					console.log("API Response:", r); // Debug log
					console.log("r.pagination:", r.pagination); // Debug log
					console.log("r.data.pagination:", r.data?.pagination); // Debug log
					console.log("r.data?.pagination?.totalCount:", r.data?.pagination?.totalCount); // Debug log
					
					if (!r.data || !r.data.customers || r.data.customers.length === 0) {
						setHasNoRecords(true);
						setTotalCount(0);
						return [];
					}
					setHasNoRecords(false);
					// Set total count from the response if available
					// Try both possible locations for pagination
					if (r.data?.pagination?.totalCount) {
						setTotalCount(r.data.pagination.totalCount);
						console.log("Total count set to (from r.data.pagination):", r.data.pagination.totalCount);
					} else if (r.pagination?.totalCount) {
						setTotalCount(r.pagination.totalCount);
						console.log("Total count set to (from r.pagination):", r.pagination.totalCount);
					} else {
						console.log("No pagination.totalCount found in response");
					}
					return r.data;
				})
				.catch((error) => {
					console.error("Error fetching due loans records:", error);
					setHasNoRecords(true);
					setTotalCount(0);
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

	console.log(raw);

	// Transform the data
	const customers = useMemo(() => {
		// Extract customers array from the response structure
		const customersData = raw?.customers || [];

		return customersData.map((customer: any): TransformedDueLoanRecord => {
			const loanRecord = customer.LoanRecord?.[0];
			const device = loanRecord?.device;
			const store = loanRecord?.store;
			const age = customer.dob ? calculateAge(customer.dob) : "N/A";

			return {
				customerId: customer.customerId || "N/A",
				fullName:
					(customer.firstName
						? customer.firstName[0].toUpperCase() +
						  customer.firstName.slice(1).toLowerCase()
						: "") +
						" " +
						(customer.lastName
							? customer.lastName[0].toUpperCase() +
							  customer.lastName.slice(1).toLowerCase()
							: "") || "N/A",
				age: age,
				email: customer.email || "N/A",
				phone: customer.bvnPhoneNumber || "N/A",
				altPhone: customer.mainPhoneNumber || "N/A",
				state: loanRecord?.store?.state || "N/A",
				loanAmount: loanRecord?.loanAmount
					? `₦${loanRecord.loanAmount.toLocaleString("en-GB")}`
					: "N/A",
				duration: loanRecord?.duration || "N/A",
				startDate: loanRecord?.startDate
					? new Date(loanRecord.startDate).toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
					  })
					: "N/A",
				endDate: loanRecord?.endDate
					? new Date(loanRecord.endDate).toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
					  })
					: "N/A",
				interest: "9.50%",
				loanBalance: loanRecord?.loanAmount
					? `₦${loanRecord.loanAmount.toLocaleString("en-GB")}`
					: "N/A",
				AmountPaid: customer.repaymentData?.summary?.loanInfo?.totalRepaid
					? `₦${customer.repaymentData.summary.loanInfo.totalRepaid.toLocaleString(
							"en-GB"
					  )}`
					: "0",
				totalAmount: loanRecord?.monthlyRepayment
					? `₦${loanRecord.monthlyRepayment.toLocaleString("en-GB")}`
					: "N/A",
				PrincipalRepaid:
					loanRecord?.monthlyRepayment && loanRecord?.interestAmount
						? `₦${(
								loanRecord.monthlyRepayment - loanRecord.interestAmount
						  ).toLocaleString("en-GB")}`
						: "N/A",
				interestRepaid: loanRecord?.interestAmount
					? `₦${loanRecord.interestAmount.toLocaleString("en-GB")}`
					: "N/A",
				monthlyRepayment: loanRecord?.monthlyRepayment
					? `₦${loanRecord.monthlyRepayment.toLocaleString("en-GB")}`
					: "N/A",
				numberOfRepayments:
					customer.repaymentData?.summary?.repaymentCount || "0",
				numberOfMissedRepayments:
					customer.repaymentData?.summary?.loanInfo?.repaymentsLeft || "0",
				DueDate: loanRecord?.nextDueDate
					? new Date(loanRecord.nextDueDate).toLocaleDateString("en-GB")
					: "N/A",
				Status: "Running",
				deviceName: loanRecord?.deviceName || "N/A",
				deviceImei: loanRecord?.DeviceOnLoan?.[0]?.imei || "N/A",
				service: loanRecord?.channel || "N/A",
				saleChannel: customer.regBy?.title || "N/A",
				sale_Rep:
					customer.regBy?.firstname && customer.regBy?.lastname
						? `${customer.regBy.firstname} ${customer.regBy.lastname}`
						: "N/A",
				sale_Rep_Phone_Number: customer.regBy?.phone || "N/A",
				storeName: loanRecord?.store?.storeName || "N/A",
				downPayment: loanRecord?.downPayment
					? `₦${loanRecord.downPayment.toLocaleString("en-GB")}`
					: "N/A",
				devicePrice: loanRecord?.devicePrice
					? `₦${loanRecord.devicePrice.toLocaleString("en-GB")}`
					: "N/A",
				loanStatus: loanRecord?.loanStatus || "N/A",
				customer: customer,
				device: device,
				store: store,
			};
		});
	}, [raw]);

	// Filter the data
	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				try {
					// Safely check each field with proper null checks
					const fullName = (c.fullName || "").toLowerCase();
					const email = (c.email || "").toLowerCase();
					const customerId = (c.customerId || "").toLowerCase();
					const phone = (c.phone || "").toLowerCase();
					const altPhone = (c.altPhone || "").toLowerCase();
					const deviceName = (c.deviceName || "").toLowerCase();
					const storeName = (c.storeName || "").toLowerCase();
					const service = (c.service || "").toLowerCase();

					return (
						fullName.includes(f) ||
						email.includes(f) ||
						customerId.includes(f) ||
						phone.includes(f) ||
						altPhone.includes(f) ||
						deviceName.includes(f) ||
						storeName.includes(f) ||
						service.includes(f)
					);
				} catch (error) {
					console.error("Error in filter:", error);
					return false;
				}
			});
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.loanStatus || ""));
		}
		return list;
	}, [customers, filterValue, statusFilter]);

	// Paginate the data
	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page, rowsPerPage]);

	// Sort the data
	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = String(
				a[sortDescriptor.column as keyof TransformedDueLoanRecord] || ""
			);
			const bVal = String(
				b[sortDescriptor.column as keyof TransformedDueLoanRecord] || ""
			);
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: TransformedDueLoanRecord[]) => {
		try {
			// If we have a total count, fetch all records for export
			let exportData = data;
			console.log("Current totalCount:", totalCount);
			
			// Try to get total count from current response if totalCount is still 0
			let actualTotalCount = totalCount;
			if (actualTotalCount === 0 && raw && raw.pagination?.totalCount) {
				actualTotalCount = raw.pagination.totalCount;
				console.log("Using raw.pagination.totalCount as fallback:", actualTotalCount);
			}
			
			if (actualTotalCount > 0) {
				console.log(`Fetching all ${actualTotalCount} records for export...`);
				console.log("Export parameters:", { fromDate, toDate, page: 1, limit: actualTotalCount });
				
				const allRecordsResponse = await getAllDueLoanRecord(fromDate, toDate, 1, actualTotalCount);
				console.log("Export API Response:", allRecordsResponse);
				
				if (allRecordsResponse.data && allRecordsResponse.data.customers) {
					// Transform the complete dataset
					const allCustomers = allRecordsResponse.data.customers.map((customer: any): TransformedDueLoanRecord => {
						const loanRecord = customer.LoanRecord?.[0];
						const device = loanRecord?.device;
						const store = loanRecord?.store;
						const age = customer.dob ? calculateAge(customer.dob) : "N/A";

						return {
							customerId: customer.customerId || "N/A",
							fullName:
								(customer.firstName
									? customer.firstName[0].toUpperCase() +
									  customer.firstName.slice(1).toLowerCase()
									: "") +
									" " +
									(customer.lastName
										? customer.lastName[0].toUpperCase() +
										  customer.lastName.slice(1).toLowerCase()
										: "") || "N/A",
							age: age,
							email: customer.email || "N/A",
							phone: customer.bvnPhoneNumber || "N/A",
							altPhone: customer.mainPhoneNumber || "N/A",
							state: loanRecord?.store?.state || "N/A",
							loanAmount: loanRecord?.loanAmount
								? `₦${loanRecord.loanAmount.toLocaleString("en-GB")}`
								: "N/A",
							duration: loanRecord?.duration || "N/A",
							startDate: loanRecord?.startDate
								? new Date(loanRecord.startDate).toLocaleDateString("en-GB", {
										day: "2-digit",
										month: "2-digit",
										year: "numeric",
								  })
								: "N/A",
							endDate: loanRecord?.endDate
								? new Date(loanRecord.endDate).toLocaleDateString("en-GB", {
										day: "2-digit",
										month: "2-digit",
										year: "numeric",
								  })
								: "N/A",
							interest: "9.50%",
							loanBalance: loanRecord?.loanAmount
								? `₦${loanRecord.loanAmount.toLocaleString("en-GB")}`
								: "N/A",
							AmountPaid: customer.repaymentData?.summary?.loanInfo?.totalRepaid
								? `₦${customer.repaymentData.summary.loanInfo.totalRepaid.toLocaleString(
										"en-GB"
								  )}`
								: "0",
							totalAmount: loanRecord?.monthlyRepayment
								? `₦${loanRecord.monthlyRepayment.toLocaleString("en-GB")}`
								: "N/A",
							PrincipalRepaid:
								loanRecord?.monthlyRepayment && loanRecord?.interestAmount
									? `₦${(
											loanRecord.monthlyRepayment - loanRecord.interestAmount
									  ).toLocaleString("en-GB")}`
									: "N/A",
							interestRepaid: loanRecord?.interestAmount
								? `₦${loanRecord.interestAmount.toLocaleString("en-GB")}`
								: "N/A",
							monthlyRepayment: loanRecord?.monthlyRepayment
								? `₦${loanRecord.monthlyRepayment.toLocaleString("en-GB")}`
								: "N/A",
							numberOfRepayments:
								customer.repaymentData?.summary?.repaymentCount || "0",
							numberOfMissedRepayments:
								customer.repaymentData?.summary?.loanInfo?.repaymentsLeft || "0",
							DueDate: loanRecord?.nextDueDate
								? new Date(loanRecord.nextDueDate).toLocaleDateString("en-GB")
								: "N/A",
							Status: "Running",
							deviceName: loanRecord?.deviceName || "N/A",
							deviceImei: loanRecord?.DeviceOnLoan?.[0]?.imei || "N/A",
							service: loanRecord?.channel || "N/A",
							saleChannel: customer.regBy?.title || "N/A",
							sale_Rep:
								customer.regBy?.firstname && customer.regBy?.lastname
									? `${customer.regBy.firstname} ${customer.regBy.lastname}`
									: "N/A",
							sale_Rep_Phone_Number: customer.regBy?.phone || "N/A",
							storeName: loanRecord?.store?.storeName || "N/A",
							downPayment: loanRecord?.downPayment
								? `₦${loanRecord.downPayment.toLocaleString("en-GB")}`
								: "N/A",
							devicePrice: loanRecord?.devicePrice
								? `₦${loanRecord.devicePrice.toLocaleString("en-GB")}`
								: "N/A",
							loanStatus: loanRecord?.loanStatus || "N/A",
							customer: customer,
							device: device,
							store: store,
						};
					});
					exportData = allCustomers;
					console.log(`Exporting ${exportData.length} records`);
				} else {
					console.log("No customers data in export response, using current page data");
				}
			} else {
				console.log("No totalCount available, using current page data for export");
			}

			const wb = new ExcelJS.Workbook();
			const ws = wb.addWorksheet("Due_Loans");
			ws.columns = columns
				.filter((c) => c.uid !== "actions")
				.map((c) => ({ header: c.name, key: c.uid, width: 20 }));

			// Columns to format as currency (Naira)
			const currencyCols = [
				"loanBalance",
				"AmountPaid",
				"totalAmount",
				"PrincipalRepaid",
				"interestRepaid",
				"monthlyRepayment",
				"downPayment",
				"devicePrice",
				"loanAmount",
			];

			exportData.forEach((r) => {
				// Prepare row object, removing Naira sign and formatting as number for currency columns
				const rowObj: any = { ...r, Status: capitalize(r.Status || "") };
				currencyCols.forEach((col) => {
					if (rowObj[col]) {
						// Remove any non-numeric characters (except dot and minus)
						const num = String(rowObj[col]).replace(/[^\d.-]/g, "");
						rowObj[col] = num ? Number(num) : null;
					}
				});
				ws.addRow(rowObj);
			});

			// Apply currency format to relevant columns
			currencyCols.forEach((col) => {
				const colIdx = ws.columns.findIndex((c) => c.key === col) + 1;
				if (colIdx > 0) {
					ws.getColumn(colIdx).numFmt = "#,##0.00";
				}
			});

			const buf = await wb.xlsx.writeBuffer();
			saveAs(new Blob([buf]), "Due_Loans.xlsx");
		} catch (error) {
			console.error("Error during export:", error);
			// Fallback to current page data if export fails
			const wb = new ExcelJS.Workbook();
			const ws = wb.addWorksheet("Due_Loans");
			ws.columns = columns
				.filter((c) => c.uid !== "actions")
				.map((c) => ({ header: c.name, key: c.uid, width: 20 }));

			const currencyCols = [
				"loanBalance",
				"AmountPaid",
				"totalAmount",
				"PrincipalRepaid",
				"interestRepaid",
				"monthlyRepayment",
				"downPayment",
				"devicePrice",
				"loanAmount",
			];

			data.forEach((r) => {
				const rowObj: any = { ...r, Status: capitalize(r.Status || "") };
				currencyCols.forEach((col) => {
					if (rowObj[col]) {
						const num = String(rowObj[col]).replace(/[^\d.-]/g, "");
						rowObj[col] = num ? Number(num) : null;
					}
				});
				ws.addRow(rowObj);
			});

			currencyCols.forEach((col) => {
				const colIdx = ws.columns.findIndex((c) => c.key === col) + 1;
				if (colIdx > 0) {
					ws.getColumn(colIdx).numFmt = "#,##0.00";
				}
			});

			const buf = await wb.xlsx.writeBuffer();
			saveAs(new Blob([buf]), "Due_Loans.xlsx");
		}
	};

	// When action clicked:
	const openModal = (mode: "view", row: TransformedDueLoanRecord) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: TransformedDueLoanRecord, key: string) => {
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
		if (key === "Status") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.Status || ""]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.Status || "")}
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
				<div
					className="capitalize cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					{row.fullName}
				</div>
			);
		}
		// Ensure we're converting any value to a string before rendering
		const cellValue = (row as any)[key];
		if (cellValue === null || cellValue === undefined) {
			return (
				<div
					className="text-small cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					N/A
				</div>
			);
		}
		if (typeof cellValue === "object") {
			return (
				<div
					className="text-small cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					View Details
				</div>
			);
		}
		return (
			<div
				className="text-small cursor-pointer"
				onClick={() => openModal("view", row)}
			>
				{String(cellValue)}
			</div>
		);
	};

	return (
		<>
			<div className="w-full overflow-hidden">
				<div className="mb-4 flex justify-center md:justify-end"></div>

				{isLoading ? (
					<TableSkeleton columns={displayColumns.length} rows={10} />
				) : (
					<GenericTable<TransformedDueLoanRecord>
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
			</div>

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
													// Skip nested objects as they're handled separately
													if (
														key === "customer" ||
														key === "device" ||
														key === "store"
													)
														return null;

													// Handle null/undefined values
													if (value === null || value === undefined) {
														return (
															<div
																key={`${
																	selectedItem.customerId || "item"
																}-personal-${key}`}
															>
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
															<div
																key={`${
																	selectedItem.customerId || "item"
																}-personal-${key}`}
															>
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
																value = date.toLocaleDateString("en-GB");
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
														value = `₦${Number(value).toLocaleString("en-GB")}`;
													}

													return (
														<div
															key={`${
																selectedItem.customerId || "item"
															}-personal-${key}`}
														>
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
												<h3 className="text-lg font-semibold mb-3">
													Customer Information
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedItem.customer).map(
														([key, value]) => {
															if (value === null || value === undefined) {
																return (
																	<div
																		key={`${
																			selectedItem.customerId || "item"
																		}-customer-${key}`}
																	>
																		<p className="text-sm text-default-500">
																			{key}
																		</p>
																		<p className="font-medium">N/A</p>
																	</div>
																);
															}

															if (
																key.toLowerCase().includes("date") ||
																key.toLowerCase().includes("at")
															) {
																try {
																	const date = new Date(value as string);
																	if (!isNaN(date.getTime())) {
																		value = date.toLocaleDateString("en-GB");
																	}
																} catch (e) {}
															}

															return (
																<div
																	key={`${
																		selectedItem.customerId || "item"
																	}-customer-${key}`}
																>
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
										{selectedItem.device && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">
													Device Information
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedItem.device).map(
														([key, value]) => {
															if (value === null || value === undefined) {
																return (
																	<div
																		key={`${
																			selectedItem.customerId || "item"
																		}-device-${key}`}
																	>
																		<p className="text-sm text-default-500">
																			{key}
																		</p>
																		<p className="font-medium">N/A</p>
																	</div>
																);
															}

															if (
																typeof value === "number" &&
																(key.toLowerCase().includes("price") ||
																	key.toLowerCase().includes("amount"))
															) {
																value = `₦${Number(value).toLocaleString(
																	"en-GB"
																)}`;
															}

															return (
																<div
																	key={`${
																		selectedItem.customerId || "item"
																	}-device-${key}`}
																>
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

										{/* Store Information */}
										{selectedItem.store && (
											<div className="bg-default-50 p-4 rounded-lg">
												<h3 className="text-lg font-semibold mb-3">
													Store Information
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedItem.store).map(
														([key, value]) => {
															if (value === null || value === undefined) {
																return (
																	<div
																		key={`${
																			selectedItem.customerId || "item"
																		}-store-${key}`}
																	>
																		<p className="text-sm text-default-500">
																			{key}
																		</p>
																		<p className="font-medium">N/A</p>
																	</div>
																);
															}

															if (
																key.toLowerCase().includes("date") ||
																key.toLowerCase().includes("at")
															) {
																try {
																	const date = new Date(value as string);
																	if (!isNaN(date.getTime())) {
																		value = date.toLocaleDateString("en-GB");
																	}
																} catch (e) {}
															}

															return (
																<div
																	key={`${
																		selectedItem.customerId || "item"
																	}-store-${key}`}
																>
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
