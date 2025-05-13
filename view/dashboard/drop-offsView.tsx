// app/customers/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getDropOffsData } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, SortDescriptor, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import DateFilter from "@/components/reususables/custom-ui/dateFilter";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "name", sortable: true },
	{ name: "Email", uid: "email", sortable: true },
	{ name: "TAT", uid: "totalTransactionTime" },
	{ name: "Screen with MTC", uid: "mostTimeConsumingScreen" },
	{ name: "Time Spent on Sc.", uid: "timeTakenOnScreen" },
	{ name: "Fulfillment Time", uid: "fullfillmentTime" },
	{ name: "Payment Time", uid: "paymentTime" },
	{ name: "Enrollment Time", uid: "enrollmentTime" },
	{ name: "Mandate Time", uid: "mandateTime" },
	{ name: "Actions", uid: "actions" }
];

type CustomerRecord = {
	customerId: string;
	name: string;
	email: string;
	totalTransactionTime: string;
	mostTimeConsumingScreen: string;
	timeTakenOnScreen: string;
	fullfillmentTime: string;
	paymentTime: string;
	enrollmentTime: string;
	mandateTime: string;
};

export default function DropOffsPage() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | "edit" | "delete" | null>(null);
	const [selectedItem, setSelectedItem] = useState<CustomerRecord | null>(null);

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
			list = list.filter((c) => c.name.toLowerCase().includes(f) || c.email.toLowerCase().includes(f));
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
	const openModal = (mode: "view" | "edit" | "delete", row: CustomerRecord) => {
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
		return <p className="text-small">{(row as any)[key]}</p>;
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
				size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Drop-off Details</ModalHeader>
							<ModalBody>
								{selectedItem && (
									<div className="space-y-4">
										{Object.entries(selectedItem).map(([k, v]) => (
											<div
												key={k}
												className="flex justify-between">
												<strong className="capitalize">{k.replace(/([A-Z])/g, " $1").trim()}:</strong>
												<span>{String(v)}</span>
											</div>
										))}
									</div>
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
