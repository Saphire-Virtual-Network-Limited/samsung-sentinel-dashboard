"use client";

import React, { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	getAllStores,
	showToast,
	syncStores,
	useAuth,
	deactivateStore,
} from "@/lib";
import ConfirmationModal from "@/components/reususables/custom-ui/ConfirmationModal";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	SortDescriptor,
	ChipProps,
	Chip,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission } from "@/lib/permissions";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "storeName", sortable: true },
	{ name: "Contact No.", uid: "phoneNumber", sortable: true },
	{ name: "Partner", uid: "partner", sortable: true },
	{ name: "State", uid: "state", sortable: true },
	{ name: "Region", uid: "region", sortable: true },
	{ name: "City", uid: "city", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const columns2: ColumnDef[] = [
	{ name: "Store ID", uid: "storeId", sortable: true },
	{ name: "Store Name", uid: "storeName", sortable: true },
	{ name: "Partner", uid: "partner", sortable: true },
	{ name: "State", uid: "state", sortable: true },
	{ name: "City", uid: "city", sortable: true },
	{ name: "Region", uid: "region", sortable: true },
	{ name: "Address", uid: "address", sortable: true },
	{ name: "Phone Number", uid: "phoneNumber", sortable: true },
	{ name: "Email", uid: "storeEmail", sortable: true },
	{ name: "Account Number", uid: "accountNumber", sortable: true },
	{ name: "Account Name", uid: "accountName", sortable: true },
	{ name: "Bank Name", uid: "bankName", sortable: true },
	{ name: "Bank Code", uid: "bankCode", sortable: true },
	{ name: "Store Hours", uid: "storeOpen", sortable: true },
	{ name: "Store Close", uid: "storeClose", sortable: true },
	{ name: "Longitude", uid: "longitude", sortable: true },
	{ name: "Latitude", uid: "latitude", sortable: true },
	{ name: "Cluster ID", uid: "clusterId", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Updated At", uid: "updatedAt", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "ACTIVE", uid: "ACTIVE" },
	{ name: "PENDING", uid: "PENDING" },
	{ name: "SUSPENDED", uid: "SUSPENDED" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	ACTIVE: "success",
	PENDING: "warning",
	SUSPENDED: "danger",
};

const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

type StoreRecord = {
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
	status: string;
	storeId: string;
};

export default function AllStoresView() {
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [confirmModalType, setConfirmModalType] = useState<
		"suspend" | "deactivate" | null
	>(null);
	const [selectedStore, setSelectedStore] = useState<StoreRecord | null>(null);
	const [isActionLoading, setIsActionLoading] = useState(false);

	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/customers -> dev)
	const role = pathname.split("/")[2];
	const { userResponse } = useAuth(); // get the user email
	const userEmail = userResponse?.data?.email || "";

	const router = useRouter();

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

	const [isSyncing, setIsSyncing] = useState(false);

	// Fetch sync stores from 1.9 dashboard
	const syncStoresFn = async () => {
		setIsSyncing(true);
		try {
			const response = await syncStores();
			showToast({
				type: "success",
				message: "Stores synced successfully",
				duration: 3000,
			});
			mutate(["stores-records"]);
		} catch (error: any) {
			console.error("Error syncing stores:", error);
			showToast({
				type: "error",
				message: error.message || "Error syncing stores",
				duration: 3000,
			});
		} finally {
			setIsSyncing(false);
		}
	};
	const handleConfirmAction = async () => {
		if (!selectedStore || !confirmModalType) return;
		setIsActionLoading(true);
		try {
			if (confirmModalType === "deactivate") {
				await deactivateStore(selectedStore.storeId);
				showToast({
					type: "success",
					message: "Store deactivated successfully",
					duration: 3000,
				});
			} else if (confirmModalType === "suspend") {
				await deactivateStore(selectedStore.storeId); // Replace with suspendStore if available
				showToast({
					type: "success",
					message: "Store suspended successfully",
					duration: 3000,
				});
			}
			setConfirmModalOpen(false);
			setSelectedStore(null);
			setConfirmModalType(null);
			mutate(["stores-records"]);
		} catch (error: any) {
			showToast({
				type: "error",
				message: error.message || "Action failed",
				duration: 3000,
			});
		} finally {
			setIsActionLoading(false);
		}
	};
	// Fetch data based on date filter
	const { data: raw = [], isLoading } = useSWR(
		["stores-records"],
		() =>
			getAllStores()
				.then((r) => {
					if (!r.data || r.data.length === 0) {
						setHasNoRecords(true);
						return [];
					}
					setHasNoRecords(false);
					return r.data;
				})
				.catch((error) => {
					console.error("Error fetching stores records:", error);
					setHasNoRecords(true);
					return [];
				}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 0,
			refreshInterval: 0,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true,
		}
	);

	console.log(raw);

	const stores = useMemo(
		() =>
			raw.map((r: StoreRecord) => ({
				...r,
				id: r.storeId, // Add unique id for table key generation
				fullName: r.storeName || "",
				Email: r.storeEmail || "",
				PhoneNo: r.phoneNumber || "",
				State: r.state || "",
				Partner: r.partner || "",
				StoreID: r.storeId || "",
				StoreName: r.storeName || "",
				AccountNumber: r.accountNumber || "",
				AccountName: r.accountName || "",
				BankName: r.bankName || "",
				BankCode: r.bankCode || "",
				StoreHours: r.storeOpen || "",
				StoreClose: r.storeClose || "",
				Longitude: r.longitude || "",
				Latitude: r.latitude || "",
				ClusterID: r.clusterId || "",
				CreatedAt: r.createdAt || "",
				UpdatedAt: r.updatedAt || "",
				status: r.status || "",
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...stores];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				const fullName = (c.fullName || "").toLowerCase();
				const email = (c.Email || "").toLowerCase();
				const phone = (c.PhoneNo || "").toLowerCase();
				const state = (c.State || "").toLowerCase();
				const partner = (c.Partner || "").toLowerCase();
				const storeId = (c.storeId || "").toLowerCase();
				const status = (c.status || "").toLowerCase();
				return (
					fullName.includes(f) ||
					email.includes(f) ||
					phone.includes(f) ||
					state.includes(f) ||
					partner.includes(f) ||
					storeId.includes(f) ||
					status.includes(f)
				);
			});
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.status || ""));
		}
		return list;
	}, [stores, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = (
				a[sortDescriptor.column as keyof StoreRecord] || ""
			).toString();
			const bVal = (
				b[sortDescriptor.column as keyof StoreRecord] || ""
			).toString();
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: StoreRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("All Stores");
		ws.columns = columns2
			.filter((c) => c.uid !== "actions")
			.map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) => ws.addRow({ ...r }));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "allStores_Records.xlsx");
	};

	// When action clicked:
	const openModal = (
		mode: "view" | "edit" | "suspend" | "deactivate",
		row: StoreRecord
	) => {
		if (mode === "edit") {
			const editUrl = `/access/${role}/stores/edit/${row.storeId}`;
			window.open(editUrl, "_blank");
		} else if (mode === "suspend" || mode === "deactivate") {
			setSelectedStore(row);
			setConfirmModalType(mode);
			setConfirmModalOpen(true);
		} else {
			const viewUrl = `/access/${role}/stores/${row.storeId}`;
			router.push(viewUrl);
		}
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: StoreRecord, key: string) => {
		if (key === "actions") {
			return (
				<div className="flex justify-end" key={`${row.storeId}-actions`}>
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Actions">
							<DropdownItem
								key={`${row.storeId}-view`}
								onPress={() => openModal("view", row)}
							>
								View
							</DropdownItem>
							{hasPermission(role, "canEdit", userEmail) ? (
								<DropdownItem
									key={`${row.storeId}-edit`}
									onPress={() => openModal("edit", row)}
								>
									Edit
								</DropdownItem>
							) : null}
							{/**	<DropdownItem
								key={`${row.storeId}-suspend`}
								onPress={() => openModal("suspend", row)}
							>
								Suspend
							</DropdownItem> */}
							<DropdownItem
								key={`${row.storeId}-deactivate`}
								onPress={() => openModal("deactivate", row)}
							>
								Deactivate
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "status") {
			const status = row.status || "";
			const color =
				statusColorMap[status] ||
				statusColorMap[status.toLowerCase()] ||
				"default";
			return (
				<Chip className="capitalize" color={color} size="sm" variant="flat">
					{capitalize(status)}
				</Chip>
			);
		}

		if (key === "storeName") {
			return (
				<div
					key={`${row.storeId}-name`}
					className="capitalize cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					{(row as any)[key] || ""}
				</div>
			);
		}

		return (
			<div
				key={`${row.storeId}-${key}`}
				className="text-small cursor-pointer"
				onClick={() => openModal("view", row)}
			>
				{(row as any)[key] || ""}
			</div>
		);
	};

	return (
		<>
			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable<StoreRecord>
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
					showStatus={true}
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
					createButton={{
						text: "Create Store",
						onClick: () => {
							const createUrl = `/access/${role}/stores/create`;
							window.open(createUrl, "_blank");
						},
					}}
					additionalButtons={[
						{
							text: "Sync Stores",
							onClick: () => {
								syncStoresFn();
							},
							isLoading: isSyncing,
						},
					]}
				/>
			)}
			{/* Confirmation Modal for Suspend/Deactivate */}
			<ConfirmationModal
				isOpen={confirmModalOpen}
				onClose={() => {
					setConfirmModalOpen(false);
					setSelectedStore(null);
					setConfirmModalType(null);
				}}
				onConfirm={handleConfirmAction}
				title={
					confirmModalType === "suspend" ? "Suspend Store" : "Deactivate Store"
				}
				description={
					confirmModalType === "suspend"
						? "Are you sure you want to suspend this store?"
						: "Are you sure you want to deactivate this store?"
				}
				confirmText={confirmModalType === "suspend" ? "Suspend" : "Deactivate"}
				cancelText="Cancel"
				isLoading={isActionLoading}
				variant={confirmModalType === "suspend" ? "warning" : "danger"}
				entity={
					selectedStore
						? {
								name: selectedStore.storeName,
								subtitle: selectedStore.partner,
								id: selectedStore.storeId,
						  }
						: undefined
				}
			/>
		</>
	);
}
