"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getDropOffsData, getDropOffsRecord } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, SortDescriptor, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "name", sortable: true },
	{ name: "TAT", uid: "totalTransactionTime" },
	{ name: "Highest Screen", uid: "mostTimeConsumingScreen" },
	{ name: "Time Spent.", uid: "timeTakenOnScreen" },
	{ name: "Mandate Time", uid: "mandateTime" },
	{ name: "Payment Time", uid: "paymentTime" },
	{ name: "Fulfillment Time", uid: "fullfillmentTime" },
	{ name: "Enrollment Time", uid: "enrollmentTime" },
	{ name: "Actions", uid: "actions" }
];

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
	mbeId: string | null;
	monoCustomerConnectedCustomerId: string;
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
		userId: string | null;
		created_at: string;
		updated_at: string;
		customerId: string;
	};
	WalletBalance?: {
		balanceId: string;
		userId: string | null;
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
		prevBalance: number;
		newBalance: number;
		paymentReference: string;
		extRef: string;
		currency: string;
		channel: string;
		charge: number;
		chargeNarration: string;
		senderBank: string | null;
		senderAccount: string | null;
		recieverBank: string | null;
		recieverAccount: string | null;
		paymentDescription: string;
		paid_at: string | null;
		createdAt: string;
		updatedAt: string;
		userid: string | null;
		customersCustomerId: string;
	}>;
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
		LoanRecordCard: any[];
	}>;
};

export default function DropOffsPage() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | "edit" | "delete" | null>(null);
	const [selectedItem, setSelectedItem] = useState<CustomerRecord | null>(null);
	const [dropOffLogs, setDropOffLogs] = useState<any[]>([]);
	const [isLoadingLogs, setIsLoadingLogs] = useState(false);

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "name",
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
		startDate && endDate ? ["drop-offs-records", startDate, endDate] : "drop-offs-records",
		() => getDropOffsData(startDate, endDate)
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
				console.error("Error fetching drop-offs data:", error);
				setHasNoRecords(true);
				return [];
			}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true, // Keep previous data while loading new data
			revalidateIfStale: true // Revalidate if data is stale
		}
	);

	const filtered = useMemo(() => {
		let list = [...raw];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => c.name.toLowerCase().includes(f) || c.bvn.toLowerCase().includes(f) || c.customerId.toLowerCase().includes(f) || c.mainPhoneNumber.toLowerCase().includes(f) || c.deviceName?.toLowerCase().includes(f) || c.deviceModelNumber?.toLowerCase().includes(f) || c.deviceRam?.toLowerCase().includes(f));
		}
		return list;
	}, [raw, filterValue]);

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
		const ws = wb.addWorksheet("Drop-offs");
		ws.columns = columns.filter((c) => c.uid !== "actions").map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow(r));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Drop_Offs_Records.xlsx");
	};

	// When action clicked:
	const openModal = async (mode: "view" | "edit" | "delete", row: CustomerRecord) => {
		setModalMode(mode);
		setSelectedItem(row);
		onOpen();
		
		if (mode === "view") {
			setIsLoadingLogs(true);
			try {
				const response = await getDropOffsRecord();
				const logs = response.data.find((item: any) => item.customerId === row.customerId)?.CustomerDropOffLog || [];
				setDropOffLogs(logs);
			} catch (error) {
				console.error("Error fetching drop-off logs:", error);
			} finally {
				setIsLoadingLogs(false);
			}
		}
	};

	// Handle row click
	const handleRowClick = (row: CustomerRecord) => {
		openModal("view", row);
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
		return <p className="text-small cursor-pointer" onClick={() => handleRowClick(row)}>{(row as any)[key]}</p>;
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end">
			</div>
			
			<GenericTable
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
				size="5xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								<h2 className="text-2xl font-bold">Customer Details</h2>
								<p className="text-sm text-gray-500">Complete customer information and transaction history</p>
							</ModalHeader>
							<ModalBody>
								{selectedItem ? (
									<div className="space-y-6">
										{/* Personal Information Section */}
										

										{/* Drop-off Logs Section */}
										{modalMode === "view" && (
											<div className="bg-white rounded-lg shadow-sm p-6">
												<h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Drop-off Logs</h3>
												{isLoadingLogs ? (
													<div className="text-center py-4">Loading logs...</div>
												) : dropOffLogs.length > 0 ? (
													<div className="overflow-x-auto">
														<table className="min-w-full divide-y divide-gray-200">
															<thead className="bg-gray-50">
																<tr>
																	<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screen Name</th>
																	<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
																	<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screen Time</th>
																	<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Response Time</th>
																	<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
																</tr>
															</thead>
															<tbody className="bg-white divide-y divide-gray-200">
																{dropOffLogs.map((log) => (
																	<tr key={log.dropOffLogId}>
																		<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.screenName}</td>
																		<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.channel}</td>
																		<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.screenTime}</td>
																		<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.apiResponseTime}</td>
																		<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
																			{new Date(log.createdAt).toLocaleString('en-US', {
																				year: 'numeric',
																				month: '2-digit',
																				day: '2-digit',
																				hour: '2-digit',
																				minute: '2-digit',
																				second: '2-digit',
																				hour12: false
																			})}
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												) : (
													<div className="text-center py-4 text-gray-500">No drop-off logs found</div>
												)}
											</div>
										)}
									</div>
								) : (
									<div className="text-center py-4 text-gray-500">No customer data available</div>
								)}
							</ModalBody>
							<ModalFooter>
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