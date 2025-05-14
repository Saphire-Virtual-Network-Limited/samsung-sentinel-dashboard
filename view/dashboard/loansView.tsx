"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllCustomerRecord, capitalize, calculateAge, showToast, verifyCustomerReferenceNumber } from "@/lib";
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
	{ name: "DOB Match", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
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

export default function LoansView() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isApproved, onOpen: onApproved, onClose: onApprovedClose } = useDisclosure();
	const { isOpen: isRejected, onOpen: onRejected, onClose: onRejectedClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | null>(null);
	const [selectedItem, setSelectedItem] = useState<CustomerRecord | null>(null);
	const [isButtonLoading, setIsButtonLoading] = useState(false);
	const [refereeType, setRefereeType] = useState<"referee1" | "referee2" | null>(null);
	const [reason, setReason] = useState("");

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
				email: r.email,
				age: calculateAge(r.dob),
				bvnPhoneNumber: r.bvnPhoneNumber,
				mainPhoneNumber: r.mainPhoneNumber,
				status: r.dobMisMatch ? "rejected" : "approved",
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

	const handleApproveReferee = async (selectedItem: CustomerRecord | null, type: "referee1" | "referee2" | null) => {
		if (!selectedItem || !type) return;
		
		setIsButtonLoading(true);
		setRefereeType(type);
		onApproved();

		try {
			const phoneNumber = type === "referee1" 
				? String(selectedItem?.CustomerKYC?.[0]?.phone2)
				: String(selectedItem?.CustomerKYC?.[0]?.phone3);

			const verifyCustomerReferenceNumberDetails = {
				customerId: selectedItem.customerId,
				phoneNumber,
				phoneVerified: true,
				comment: `Referee ${type === "referee1" ? "1" : "2"} has been verified`,
			};

			await verifyCustomerReferenceNumber(verifyCustomerReferenceNumberDetails);
			showToast({
				type: "success",
				message: `Referee ${type === "referee1" ? "1" : "2"} verified successfully`,
				duration: 3000,
			});
		} catch (error: any) {
			console.error(`Failed to verify referee ${type === "referee1" ? "1" : "2"}`, error);
			showToast({
				type: "error", 
				message: error.message || `Failed to verify referee ${type === "referee1" ? "1" : "2"}`,
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
			onApprovedClose();
		}
	};

	const handleRejectReferee = async (selectedItem: CustomerRecord | null, type: "referee1" | "referee2" | null) => {
		if (!selectedItem || !type) return;

		setIsButtonLoading(true);
		setRefereeType(type);
		onRejected();

		try {
			const phoneNumber = type === "referee1"
				? String(selectedItem?.CustomerKYC?.[0]?.phone2)
				: String(selectedItem?.CustomerKYC?.[0]?.phone3);

			const verifyCustomerReferenceNumberDetails = {
				customerId: selectedItem.customerId,
				phoneNumber,
				phoneVerified: false,
				comment: reason,
			};

			await verifyCustomerReferenceNumber(verifyCustomerReferenceNumberDetails);
			showToast({
				type: "success",
				message: `Referee ${type === "referee1" ? "1" : "2"} rejected successfully`,
				duration: 3000,
			});
		} catch (error: any) {
			console.error(`Failed to reject referee ${type === "referee1" ? "1" : "2"}`, error);
			showToast({
				type: "error",
				message: error.message || `Failed to reject referee ${type === "referee1" ? "1" : "2"}`,
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
			onRejectedClose();
		}
	};

	// Export all filtered
	const exportFn = async (data: CustomerRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Customers");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status || '') }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Customer_Records.xlsx");
	};

	// When action clicked:
	const openModal = (mode: "view", row: CustomerRecord) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
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
		if (key === "fullName") {
			return <p className="capitalize cursor-pointer" onClick={() => openModal("view", row)}>{row.fullName}</p>;
		}
		return <p className="text-small cursor-pointer" onClick={() => openModal("view", row)}>{(row as any)[key]}</p>;
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
													<p className="text-sm text-default-500">Reg by:</p>
													<p className="font-medium">{selectedItem.mbeId || 'N/A'}</p>
												</div>
											</div>
										</div>

										{/* Wallet Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Wallet Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Account Number</p>
													<p className="font-medium">{selectedItem.Wallet?.accountNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Bank Name</p>
													<p className="font-medium">{selectedItem.Wallet?.bankName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Account Name</p>
													<p className="font-medium">{selectedItem.Wallet?.accountName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">DVA ID</p>
													<p className="font-medium">{selectedItem.Wallet?.dva_id || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Bank ID</p>
													<p className="font-medium">{selectedItem.Wallet?.bankId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Currency</p>
													<p className="font-medium">{selectedItem.Wallet?.currency || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Customer Code</p>
													<p className="font-medium">{selectedItem.Wallet?.cust_code || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Customer ID</p>
													<p className="font-medium">{selectedItem.Wallet?.cust_id || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">User ID</p>
													<p className="font-medium">{selectedItem.Wallet?.userId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Created At</p>
													<p className="font-medium">{selectedItem.Wallet?.created_at ? new Date(selectedItem.Wallet.created_at).toLocaleDateString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Updated At</p>
													<p className="font-medium">{selectedItem.Wallet?.updated_at ? new Date(selectedItem.Wallet.updated_at).toLocaleDateString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Current Balance</p>
													<p className="font-medium">{selectedItem.WalletBalance?.balance !== undefined ? `₦${selectedItem.WalletBalance.balance.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Last Balance</p>
													<p className="font-medium">{selectedItem.WalletBalance?.lastBalance !== undefined ? `₦${selectedItem.WalletBalance.lastBalance.toLocaleString()}` : 'N/A'}</p>
												</div>
											</div>
										</div>

										{/* KYC Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">KYC Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Address</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.applicantAddress || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Business Address</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.applicantBusinessAddress || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Occupation</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.occupation || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Business Name</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.businessName || 'N/A'}</p>
												</div>

												<div className="flex flex-col gap-4 bg-gray-200 p-4 rounded-lg">
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
														<div>
															<p className="text-sm text-default-500">Referee Phone 1</p>
															<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.phone2 || 'N/A'}</p>
														</div>
														
														<div>
															<p className="text-sm text-default-500">Status</p>
															<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.phone2Status || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Comment</p>
															<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.status2Comment || 'N/A'}</p>
														</div>
													</div>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<Button
														className="w-full"
														variant="flat"
														color="success"
														onPress={() => {
															setRefereeType("referee1");
															onApproved();
														}}>
															Approve
														</Button>
														<Button
														className="w-full"
														variant="flat"
														color="danger"
														onPress={() => {
															setRefereeType("referee1");
															onRejected();
														}}>
															Reject
														</Button>
													</div>
												</div>

												<div className="flex flex-col gap-4 bg-gray-200 p-4 rounded-lg">
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
														<div>
															<p className="text-sm text-default-500">Referee Phone 2</p>
															<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.phone3 || 'N/A'}</p>
														</div>
														
														<div>
															<p className="text-sm text-default-500">Status</p>
															<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.phone3Status || 'N/A'}</p>
														</div>
														<div>
															<p className="text-sm text-default-500">Comment</p>
															<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.status3Comment || 'N/A'}</p>
														</div>
													</div>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<Button
														className="w-full"
														variant="flat"
														color="success"
														onPress={() => {
															setRefereeType("referee2");
															onApproved();
														}}>
															Approve
														</Button>
														<Button
														className="w-full"
														variant="flat"
														color="danger"
														onPress={() => {
															setRefereeType("referee2");
															onRejected();
														}}>
															Reject
														</Button>
													</div>
												</div>
												
												<div>
													<p className="text-sm text-default-500">House Number</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.houseNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Street Address</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.streetAddress || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Nearest Bus Stop</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.nearestBusStop || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Local Government</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.localGovernment || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">State</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.state || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Town</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.town || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Channel</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.channel || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Source</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.source || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Created At</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.createdAt ? new Date(selectedItem.CustomerKYC[0].createdAt).toLocaleDateString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Updated At</p>
													<p className="font-medium">{selectedItem.CustomerKYC?.[0]?.updatedAt ? new Date(selectedItem.CustomerKYC[0].updatedAt).toLocaleDateString() : 'N/A'}</p>
												</div>
											</div>
										</div>

										{/* Mandate Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Mandate Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Customer Mandate ID</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.customerMandateId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Customer ID</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.customerId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Mandate ID</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.mandateId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Status</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.status || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Mono Customer ID</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.monoCustomerId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Mandate Type</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.mandate_type || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Debit Type</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.debit_type || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Ready to Debit</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.ready_to_debit?.toString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Approved</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.approved?.toString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Start Date</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.start_date ? new Date(selectedItem.CustomerMandate[0].start_date).toLocaleDateString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">End Date</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.end_date ? new Date(selectedItem.CustomerMandate[0].end_date).toLocaleDateString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Reference</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.reference || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Channel</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.channel || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Created At</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.createdAt ? new Date(selectedItem.CustomerMandate[0].createdAt).toLocaleDateString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Updated At</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.updatedAt ? new Date(selectedItem.CustomerMandate[0].updatedAt).toLocaleDateString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Message</p>
													<p className="font-medium">{selectedItem.CustomerMandate?.[0]?.message || 'N/A'}</p>
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
												<div>
													<p className="text-sm text-default-500">Loan Amount</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.loanAmount !== undefined ? `₦${selectedItem.LoanRecord[0].loanAmount.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Monthly Repayment</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.monthlyRepayment !== undefined ? `₦${selectedItem.LoanRecord[0].monthlyRepayment.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Duration</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.duration !== undefined ? `${selectedItem.LoanRecord[0].duration} months` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Interest Amount</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.interestAmount !== undefined ? `₦${selectedItem.LoanRecord[0].interestAmount.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Down Payment</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.downPayment !== undefined ? `₦${selectedItem.LoanRecord[0].downPayment.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Insurance Package</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.insurancePackage || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Insurance Price</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.insurancePrice !== undefined ? `₦${selectedItem.LoanRecord[0].insurancePrice.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">MBS Eligible Amount</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.mbsEligibleAmount !== undefined ? `₦${selectedItem.LoanRecord[0].mbsEligibleAmount.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Pay Frequency</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.payFrequency || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device Price</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.devicePrice !== undefined ? `₦${selectedItem.LoanRecord[0].devicePrice.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device Amount</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.deviceAmount !== undefined ? `₦${selectedItem.LoanRecord[0].deviceAmount.toLocaleString()}` : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Last Point</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.lastPoint || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Loan Status</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.loanStatus || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Channel</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.channel || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Loan Record ID</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.loanRecordId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Created At</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.createdAt ? new Date(selectedItem.LoanRecord[0].createdAt).toLocaleString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Updated At</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.updatedAt ? new Date(selectedItem.LoanRecord[0].updatedAt).toLocaleString() : 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device ID</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.deviceId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Store ID</p>
													<p className="font-medium">{selectedItem.LoanRecord?.[0]?.storeId || 'N/A'}</p>
												</div>
											</div>
										</div>

										{/* Transaction History */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
											{selectedItem.TransactionHistory && selectedItem.TransactionHistory.length > 0 ? (
												<div className="space-y-4">
													{selectedItem.TransactionHistory.map((transaction, index) => (
														<div key={index} className="border-b pb-3 last:border-b-0">
															<div className="flex justify-between items-start">
																<div>
																	<p className="font-medium">{transaction.paymentDescription || 'N/A'}</p>
																	<p className="text-sm text-default-500">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}</p>
																</div>
																<div className="text-right">
																	<p className={`font-medium ${transaction.paymentType === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
																		{transaction.paymentType === 'CREDIT' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
																	</p>
																	<p className="text-sm text-default-500">Balance: ₦{transaction.newBalance.toLocaleString()}</p>
																</div>
															</div>
														</div>
													))}
												</div>
											) : (
												<p className="text-default-500">No transaction history available</p>
											)}
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

			<Modal
				isOpen={isApproved}
				onClose={onApprovedClose}
				size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Are you sure you want to approve this customer referee?</ModalHeader>
							<ModalBody>
								<p className="text-sm text-default-500">This action cannot be undone.</p>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => handleApproveReferee(selectedItem, refereeType)}
									isLoading={isButtonLoading}>
									Yes
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={onApprovedClose}>
									No
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal
				isOpen={isRejected}
				onClose={onRejectedClose}
				size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Are you sure you want to reject this customer referee?</ModalHeader>
							<ModalBody>
								<SelectField
									label="Select a reason"
									placeholder="Select Reason"
									required
									options={[
										{ label: "Referee not answering calls", value: "Referee not answering calls" },
										{ label: "Number switched off / unreachable", value: "Number switched off / unreachable" },
										{ label: "Referee does not know the customer", value: "Referee does not know the customer" },
										{ label: "Referee advised us to cancel the loan", value: "Referee advised us to cancel the loan" },
										{ label: "Referee declined standing as a referee", value: "Referee declined standing as a referee" },
										{ label: "Others", value: "Others" }
									]}
									htmlFor="reason"
									id="reason"
									isInvalid={false}
									errorMessage="Reason is required"
									onChange={(e) => setReason(e.toString())}
								/>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => handleRejectReferee(selectedItem, refereeType)}
									isLoading={isButtonLoading}>
									Submit
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={onRejectedClose}>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
