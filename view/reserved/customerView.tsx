// app/customers/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { getAllLoanRecord, capitalize, calculateAge, showToast } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import DateFilter from "@/components/reususables/custom-ui/dateFilter";

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
	fullName: string;
	email: string;
	age: number;
	bvnPhoneNumber: string;
	mainPhoneNumber: string;
	status: string;
};

export default function CustomerPage() {
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<"view" | "edit" | "delete" | null>(null);
	const [selectedItem, setSelectedItem] = useState<CustomerRecord | null>(null);

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		if (!start || !end) {
			showToast({ message: "Both dates must be selected.", type: "error" });
			return;
		}
		if (new Date(end) < new Date(start)) {
			showToast({ message: "End date must be after start date.", type: "error" });
			return;
		}
		setStartDate(start);
		setEndDate(end);
	};

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "fullName",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;


	// build a dynamic changeString once per render
	const changeString = startDate && endDate ? `${startDate} to ${endDate}` : "from previous month";

	const { data: raw = [], isLoading } = useSWR(["customer-records", startDate, endDate], () => getAllLoanRecord(startDate, endDate).then((r) => r.data), { revalidateOnFocus: true, dedupingInterval: 60000, refreshInterval: 60000 });
    console.log(raw)
	const customers = useMemo(
		() =>
			raw.map((r: any) => ({
				fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
				email: r.email,
				age: calculateAge(r.dob),
				bvnPhoneNumber: r.bvnPhoneNumber,
				mainPhoneNumber: r.mainPhoneNumber,
				status: r.dobMisMatch ? "rejected" : "approved",
			})),
		[raw]
	);

	const filtered = React.useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => c.fullName.toLowerCase().includes(f) || c.email.toLowerCase().includes(f));
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.status));
		}
		return list;
	}, [customers, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = React.useMemo(() => {
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
		data.forEach((r) => ws.addRow({ ...r, status: capitalize(r.status) }));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Customer_Records.xlsx");
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
							<DropdownItem
								key="edit"
								onPress={() => openModal("edit", row)}>
								Edit
							</DropdownItem>
							<DropdownItem
								key="delete"
								onPress={() => openModal("delete", row)}>
								Delete
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
					color={statusColorMap[row.status]}
					size="sm"
					variant="flat">
					{capitalize(row.status)}
				</Chip>
			);
		}
		if (key === "fullName") {
			return <p className="capitalize">{row.fullName}</p>;
		}
		return <p className="text-small">{(row as any)[key]}</p>;
	};

	return (
		<>
		<div className="mb-4 flex justify-center md:justify-end">
		<DateFilter
				className="w-full flex justify-end"
				onFilterChange={handleDateFilter}
				initialStartDate={startDate}
				initialEndDate={endDate}
				isLoading={isLoading}
			/>
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
				hasNoRecords={customers.length === 0}
			/>
			

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>User Details</ModalHeader>
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
							<ModalFooter className="flex gap-2">
								{modalMode !== "view" && (
									<Button
										color={modalMode === "delete" ? "danger" : "primary"}
										variant="light"
										onPress={() => {
											// your edit/delete logic here, e.g.:
											console.log(modalMode, selectedItem);
											onClose();
										}}>
										{modalMode === "edit" ? "Save Changes" : "Confirm Delete"}
									</Button>
								)}
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
