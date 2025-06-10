"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import {  showToast,  getUnpaidStores, updateStoreStatus } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { SelectField } from "@/components/reususables";
import { TableSkeleton } from "@/components/reususables/custom-ui";

const columns: ColumnDef[] = [
	{ name: "Customer ID", uid: "customerId", sortable: true },
	{ name: "Store Name", uid: "fullName", sortable: true },
	{ name: "Bank Name", uid: "bankName", sortable: true },
	{ name: "Account Number", uid: "accountNumber", sortable: true },
	{ name: "Account Name", uid: "accountName", sortable: true },
	{ name: "Payment Channel", uid: "payChannel", sortable: true },
	{ name: "Amount", uid: "Amount", sortable: true },
	{ name: "Status", uid: "Status", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
  { name: "Unpaid", uid: "unpaid" },
{ name: "Paid", uid: "paid" },
{ name: "Pending", uid: "pending" },
{ name: "Failed", uid: "failed" },


];

const statusColorMap: Record<string, ChipProps["color"]> = {
	unpaid: "warning",
	paid: "success",
	pending: "primary",
	failed: "danger",
}; 

type StoreOnLoan = {
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
  loanRecord: {
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
      device: {
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
      customer: {
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
      };
  };
  // Add transformed fields
  id?: string;
  fullName?: string;
  PhoneNo?: string;
  Amount?: string;
  Status?: string;
};


export default function UnpaidStoresView() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isApproved, onOpen: onApproved, onClose: onApprovedClose } = useDisclosure();
	const [isButtonLoading, setIsButtonLoading] = useState(false);
	const [modalMode, setModalMode] = useState<"view" | null>(null);
	const [selectedItem, setSelectedItem] = useState<StoreOnLoan | null>(null);


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
		startDate && endDate ? ["unpaid-stores", startDate, endDate] : "unpaid-stores",
		() => getUnpaidStores(startDate, endDate)
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
				console.error("Error fetching unpaid stores:", error);
				setHasNoRecords(true);
				return [];
			}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 0,
			refreshInterval: 0,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true
		}
	);

	const { mutate } = useSWR(
		startDate && endDate ? ["unpaid-stores", startDate, endDate] : "unpaid-stores"
	);

	const customers = useMemo(
		() =>
			raw.map((r: StoreOnLoan) => ({
				...r,
				id: r.storeId,
				customerId: r.loanRecord?.customer?.customerId || "N/A",
				bankName: r.store.bankName || "N/A",
				accountNumber: r.store.accountNumber || "N/A",
				accountName: r.store.accountName || "N/A",
				fullName: r.store.storeName || "N/A",
				PhoneNo: r.store.phoneNumber || "N/A",
				Amount: `₦${r.amount?.toLocaleString() || '0'}`,
				payChannel: r.payChannel || r.bankUsed || "N/A",
				Status: r.status || "N/A",
				createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A',
			})),
		[raw]
	);

	// const [banks, setBanks] = useState([])
	const [selectedBank, setSelectedBank] = useState<string>("");


  const handleUpdateStoreStatus = async (row: StoreOnLoan) => {
    setIsButtonLoading(true);

    const storeDetails = {
      storeOnLoanId: row.storeOnLoanId,
      status: "PAID",
	  bankUsed: selectedBank,
    }

    console.log('Updating store with details:', storeDetails);
    try {
      const res = await updateStoreStatus(storeDetails);
      console.log('Update response:', res);

      if (res.statusCode === 200) {
        showToast({ type: "success", message: "Store status updated successfully", duration: 3000, position: "top-right" });
        onApprovedClose();
        onClose();
        mutate();
      } else {
        console.error('Update failed with response:', res);
        showToast({ type: "error", message: res.message || "Failed to update store status", duration: 8000, position: "top-right" });
      }
    } catch (error: any) {
      console.error('Error updating store status:', error);
      showToast({ type: "error", message: error.message || "Failed to update store status", duration: 8000, position: "top-right" });
    } finally {
      setIsButtonLoading(false);
    }
  };

	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				const fullName = (c.fullName || '').toLowerCase();
				const phone = (c.PhoneNo || '').toLowerCase();
				const amount = (c.Amount || '').toLowerCase();
				const status = (c.Status || '').toLowerCase();
				const customerId = (c.loanRecord?.customer?.customerId || '').toLowerCase();
				const storeId = (c.storeId || '').toLowerCase();
				
				return fullName.includes(f) || 
					   phone.includes(f) || 
					   amount.includes(f) || 
					   status.includes(f) ||
					   customerId.includes(f) ||
					   storeId.includes(f);
			});
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.Status || ''));	
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
			const aVal = (a[sortDescriptor.column as keyof StoreOnLoan] || '').toString();
			const bVal = (b[sortDescriptor.column as keyof StoreOnLoan] || '').toString();
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: StoreOnLoan[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Unpaid Stores");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r }));	
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "unpaidStores_Records.xlsx");
	};

	// When action clicked:
	const openModal = (mode: "view", row: StoreOnLoan) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: StoreOnLoan, key: string) => {
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
		
		if (key === "fullName") {
			return <p key={`${row.storeId}-name`} className="capitalize cursor-pointer" onClick={() => openModal("view", row)}>{row.fullName}</p>;	
		}

		if (key === "Status") {
			return (
				<Chip
					key={`${row.storeId}-status`}
					className="capitalize cursor-pointer"
					color={statusColorMap[row.Status?.toLowerCase() as keyof typeof statusColorMap] || "default"}
					size="sm"
					variant="flat"
					onClick={() => openModal("view", row)}>
					{row.Status}
				</Chip>
			);
		}

		return <div key={`${row.storeId}-${key}`} className="text-small cursor-pointer" onClick={() => openModal("view", row)}>{(row as any)[key] || ''}</div>;
	};

	return (
		<>
		<div className="mb-4 flex justify-center md:justify-end">
		</div>
			
			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable<StoreOnLoan>
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
			

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				className="m-4 max-w-[1200px] max-h-[650px] overflow-y-auto">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Store Loan Details</ModalHeader>
							<ModalBody>
								{selectedItem && (
									<div className="space-y-6">
										{/* Store Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<div className="flex items-center justify-between">
											<h3 className="text-lg font-semibold mb-3">Store Information</h3>

											<p className={`font-medium ${
												selectedItem.status === 'PAID' ? 'bg-green-500' : 
												selectedItem.status === 'PENDING' ? 'bg-yellow-500' :
												selectedItem.status === 'FAILED' ? 'bg-red-500' :
												'bg-red-500'} text-white p-2 px-5 rounded-md w-fit`}>
												{selectedItem.status || 'N/A'}
											</p>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Store ID</p>
													<p className="font-medium">{selectedItem.store.storeId || 'N/A'}</p>
												</div>
                        <div>
													<p className="text-sm text-default-500">Store on Loan ID</p>
													<p className="font-medium">{selectedItem.storeOnLoanId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Store Name</p>
													<p className="font-medium">{selectedItem.store.storeName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Partner</p>
													<p className="font-medium">{selectedItem.store.partner || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">City</p>
													<p className="font-medium">{selectedItem.store.city || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">State</p>
													<p className="font-medium">{selectedItem.store.state || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Region</p>
													<p className="font-medium">{selectedItem.store.region || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Address</p>
													<p className="font-medium">{selectedItem.store.address || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Phone Number</p>
													<p className="font-medium">{selectedItem.store.phoneNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Email</p>
													<p className="font-medium">{selectedItem.store.storeEmail || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Account Number</p>
													<p className="font-medium">{selectedItem.store.accountNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Account Name</p>
													<p className="font-medium">{selectedItem.store.accountName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Bank Name</p>
													<p className="font-medium">{selectedItem.store.bankName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Store Hours</p>
													<p className="font-medium">{`${selectedItem.store.storeOpen || '00:00'} - ${selectedItem.store.storeClose || '00:00'}`}</p>
												</div>
                        						<div>

													<div className="flex items-center justify-between col-span-2 mt-4">

												<div>
													<p className="text-sm text-default-500 my-2">Manual Payment</p>
													<SelectField
														label="Which Bank was used to make payment to this store?"
														htmlFor="bank"
														id="bank"
														placeholder="Select Bank"
														isInvalid={false}
														errorMessage=""
														onChange={(value) => setSelectedBank(value as string)}
														options={[
														{ label: "Access Bank", value: "access bank" },
														{ label: "First Bank", value: "first bank" },
														{ label: "GTBank", value: "gtbank" },
														{ label: "FCMB", value: "fcmb" },
														{ label: "UBA", value: "uba" },
														{ label: "Zenith Bank", value: "zenith bank" },
														{ label: "Fidelity Bank", value: "fidelity bank" },
														{ label: "Union Bank", value: "union bank" },
														{ label: "Sterling Bank", value: "sterling bank" },
														{ label: "Wema Bank", value: "wema bank" },
														{ label: "Stanbic IBTC", value: "stanbic ibtc" },
														{ label: "VFD Microfinance Bank", value: "vfd microfinance bank" },
														{ label: "GIRO", value: "GIRO" },
														{ label: "Paystack", value: "Paystack" }

														]}
													/>
												</div>

												<div>
													{selectedItem.status !== 'PAID' && (
														<Button
															color="success"
															variant="solid"
															onPress={() => onApproved()}  
															isLoading={isButtonLoading}>
															Mark as Paid
														</Button>
													)}
												</div>
                        					</div>
												</div>
											


											</div>
										</div>

										{/* Loan Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Loan Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Loan Record ID</p>
													<p className="font-medium">{selectedItem.loanRecord.loanRecordId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Loan Status</p>
													<p className="font-medium">{selectedItem.loanRecord.loanStatus || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Loan Amount</p>
													<p className="font-medium">₦{selectedItem.loanRecord.loanAmount?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Store Price</p>
													<p className="font-medium">₦{selectedItem.loanRecord.devicePrice?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Down Payment</p>
													<p className="font-medium">₦{selectedItem.loanRecord.downPayment?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Monthly Repayment</p>
													<p className="font-medium">₦{selectedItem.loanRecord.monthlyRepayment?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Duration (Months)</p>
													<p className="font-medium">{selectedItem.loanRecord.duration || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Interest Amount</p>
													<p className="font-medium">₦{selectedItem.loanRecord.interestAmount?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Insurance Package</p>
													<p className="font-medium">{selectedItem.loanRecord.insurancePackage || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Insurance Price</p>
													<p className="font-medium">₦{selectedItem.loanRecord.insurancePrice?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Payment Frequency</p>
													<p className="font-medium">{selectedItem.loanRecord.payFrequency || 'N/A'}</p>
												</div>
											</div>
										</div>

										{/* Device Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Device Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Device Name</p>
													<p className="font-medium">{selectedItem.loanRecord.device.deviceName || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device Model</p>
													<p className="font-medium">{selectedItem.loanRecord.device.deviceModelNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Manufacturer</p>
													<p className="font-medium">{selectedItem.loanRecord.device.deviceManufacturer || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device Type</p>
													<p className="font-medium">{selectedItem.loanRecord.device.deviceType || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Price</p>
													<p className="font-medium">₦{selectedItem.loanRecord.device.price?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">SAP</p>
													<p className="font-medium">₦{selectedItem.loanRecord.device.SAP?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">SLD</p>
													<p className="font-medium">₦{selectedItem.loanRecord.device.SLD?.toLocaleString() || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">SentiProtect</p>
													<p className="font-medium">₦{selectedItem.loanRecord.device.sentiprotect?.toLocaleString() || 'N/A'}</p>
												</div>
											</div>
										</div>

										{/* Customer Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">Customer Information</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Customer ID</p>
													<p className="font-medium">{selectedItem.loanRecord.customer.customerId || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Full Name</p>
													<p className="font-medium">{`${selectedItem.loanRecord.customer.firstName} ${selectedItem.loanRecord.customer.lastName}` || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Email</p>
													<p className="font-medium">{selectedItem.loanRecord.customer.email || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">BVN</p>
													<p className="font-medium">{selectedItem.loanRecord.customer.bvn || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Date of Birth</p>
													<p className="font-medium">{selectedItem.loanRecord.customer.dob || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">BVN Phone</p>
													<p className="font-medium">{selectedItem.loanRecord.customer.bvnPhoneNumber || 'N/A'}</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Main Phone</p>
													<p className="font-medium">{selectedItem.loanRecord.customer.mainPhoneNumber || 'N/A'}</p>
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

      <Modal
				isOpen={isApproved}
				onClose={onApprovedClose}
				size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Confirm Store Payment</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to mark this store as paid?  This action cannot be undone.
								</p>
                
								{selectedItem && (
									<div className="mt-4">
										<p className="font-medium">Store: {selectedItem.store.storeName}</p>
										<p className="font-medium">Amount: ₦{selectedItem.amount?.toLocaleString()}</p>
									</div>
								)}
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => selectedItem && handleUpdateStoreStatus(selectedItem)}
									isLoading={isButtonLoading}>
									Confirm Payment
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={onApprovedClose}>
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
