"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	activateDevice,
	deactivateDevice,
	getAllDevices,
	showToast,
	useAuth,
} from "@/lib";
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
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { usePathname } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { capitalize } from "@/utils/helpers";

const columns: ColumnDef[] = [
	{ name: "Name", uid: "deviceName", sortable: true },
	{ name: "Brand", uid: "deviceManufacturer", sortable: true },
	{ name: "Type", uid: "deviceType", sortable: true },
	{ name: "Sentiprotect", uid: "sentiprotect", sortable: true },
	{ name: "SAP", uid: "SAP", sortable: true },
	{ name: "SLD", uid: "SLD", sortable: true },

	{ name: "Price", uid: "price", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "ACTIVE", uid: "ACTIVE" },
	{ name: "SUSPENDED", uid: "SUSPENDED" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	ACTIVE: "success",
	SUSPENDED: "danger",
};

type DeviceRecord = {
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
	status: "ACTIVE" | "SUSPENDED";
};

export default function AllDevicesView() {
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/customers -> dev)
	const role = pathname.split("/")[2];
	const { userResponse } = useAuth(); // get the user email
	const userEmail = userResponse?.data?.email || "";
	// --- modal state ---
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [modalMode, setModalMode] = useState<
		"view" | "edit" | "deactivate" | null
	>(null);
	const [selectedItem, setSelectedItem] = useState<DeviceRecord | null>(null);
	const [reason, setReason] = useState("");

	const {
		isOpen: isDeactivateDevice,
		onOpen: onDeactivateDevice,
		onClose: onDeactivateDeviceClose,
	} = useDisclosure();

	const {
		isOpen: isActivateDevice,
		onOpen: onActivateDevice,
		onClose: onActivateDeviceClose,
	} = useDisclosure();

	// Reset reason when modal closes
	const handleDeactivateDeviceClose = () => {
		setReason("");
		setSelectedItem(null);
		onDeactivateDeviceClose();
	};

	// Reset when activate modal closes
	const handleActivateDeviceClose = () => {
		setSelectedItem(null);
		onActivateDeviceClose();
	};

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "deviceName",
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
		["devices-records"],
		() =>
			getAllDevices()
				.then((r) => {
					if (!r.data || r.data.length === 0) {
						setHasNoRecords(true);
						return [];
					}
					setHasNoRecords(false);
					return r.data;
				})
				.catch((error) => {
					console.error("Error fetching devices records:", error);
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
			raw.map((r: DeviceRecord) => ({
				...r,
				deviceName: r.deviceName || "",
				deviceManufacturer: r.deviceManufacturer || "",
				deviceType: r.deviceType || "",
				price: r.price ? `₦${r.price.toLocaleString("en-GB")}` : "",
				sentiProtect: r.sentiprotect
					? `₦${r.sentiprotect.toLocaleString("en-GB")}`
					: "",
				SAP: r.SAP ? `₦${r.SAP.toLocaleString("en-GB")}` : "",
				SLD: r.SLD ? `₦${r.SLD.toLocaleString("en-GB")}` : "",
				status: r.status || "ACTIVE", // Default to active if no status
			})),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) => {
				const deviceName = (c.deviceName || "").toLowerCase();
				const deviceId = (c.newDeviceId || "").toLowerCase();
				const oldDeviceId = (c.oldDeviceId || "").toLowerCase();
				const deviceManufacturer = (c.deviceManufacturer || "").toLowerCase();
				const deviceType = (c.deviceType || "").toLowerCase();
				const price = (c.price || "").toLowerCase();
				const SAP = (c.SAP || "").toLowerCase();
				const SLD = (c.SLD || "").toLowerCase();
				const status = (c.status || "ACTIVE").toLowerCase();

				return (
					deviceName.includes(f) ||
					deviceId.includes(f) ||
					oldDeviceId.includes(f) ||
					deviceManufacturer.includes(f) ||
					deviceType.includes(f) ||
					price.includes(f) ||
					SAP.includes(f) ||
					SLD.includes(f) ||
					status.includes(f)
				);
			});
		}
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.status || "ACTIVE"));
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
			const aVal = (
				a[sortDescriptor.column as keyof DeviceRecord] || ""
			).toString();
			const bVal = (
				b[sortDescriptor.column as keyof DeviceRecord] || ""
			).toString();
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = async (data: DeviceRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Devices");
		ws.columns = columns
			.filter((c) => c.uid !== "actions")
			.map((c) => ({ header: c.name, key: c.uid, width: 20 }));
		data.forEach((r) =>
			ws.addRow({ ...r, status: capitalize(r.status || "") })
		);
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Devices_Records.xlsx");
	};

	// When action clicked:
	const openModal = (
		mode: "view" | "edit" | "deactivate",
		row: DeviceRecord
	) => {
		setModalMode(mode);
		setSelectedItem(row);
		if (mode === "edit") {
			// Open edit page in new tab with store data using dynamic route
			const editUrl = `/access/${role}/inventory/devices/edit/${row.newDeviceId}`;
			// If using Next.js dynamic route, should be /edit/[deviceId]
			const dynamicEditUrl = `/access/${role}/inventory/devices/edit/${row.newDeviceId}`;
			window.open(dynamicEditUrl, "_blank");
		} else {
			onDeactivateDevice();
		}
	};

	const handleDeactivateDevice = async () => {
		if (!selectedItem || !reason.trim()) {
			showToast({
				type: "error",
				message: "Please provide a reason for deactivation",
				duration: 5000,
			});
			return;
		}

		try {
			const response = await deactivateDevice(selectedItem.newDeviceId, reason);
			showToast({
				type: "success",
				message: "Device deactivated successfully",
				duration: 5000,
			});
			handleDeactivateDeviceClose();
		} catch (error: any) {
			console.error("Error deactivating device:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to deactivate device",
				duration: 5000,
			});
		}
	};

	const handleActivateDevice = async (deviceId: string) => {
		if (!selectedItem) {
			showToast({
				type: "error",
				message: "No device selected",
				duration: 5000,
			});
			return;
		}

		try {
			const response = await activateDevice(selectedItem.newDeviceId);
			showToast({
				type: "success",
				message: "Device activated successfully",
				duration: 5000,
			});
			handleActivateDeviceClose();
		} catch (error: any) {
			console.error("Error activating device:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to activate device",
				duration: 5000,
			});
		}
	};

	// Render each cell, including actions dropdown:
	const renderCell = (row: DeviceRecord, key: string) => {
		if (key === "actions") {
			return (
				<div className="flex justify-end" key={`${row.newDeviceId}-actions`}>
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Actions">
							<DropdownItem
								key={`${row.newDeviceId}-view`}
								onPress={() => openModal("view", row)}
							>
								View
							</DropdownItem>
							{hasPermission(role, "canEdit", userEmail) ? (
								<DropdownItem
									key={`${row.newDeviceId}-edit`}
									onPress={() => openModal("edit", row)}
								>
									Edit
								</DropdownItem>
							) : null}
							{row.status === "ACTIVE" ? (
								<DropdownItem
									key={`${row.newDeviceId}-deactivate`}
									onPress={() => {
										setSelectedItem(row);
										onDeactivateDevice();
									}}
								>
									Deactivate
								</DropdownItem>
							) : (
								<DropdownItem
									key={`${row.newDeviceId}-activate`}
									onPress={() => {
										setSelectedItem(row);
										onActivateDevice();
									}}
								>
									Activate
								</DropdownItem>
							)}
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "deviceName") {
			return (
				<p
					key={`${row.newDeviceId}-name`}
					className="capitalize cursor-pointer"
					onClick={() => openModal("view", row)}
				>
					{row.deviceName || ""}
				</p>
			);
		}

		if (key === "status") {
			const statusColor =
				row.status === "ACTIVE" ? "text-success" : "text-danger";
			return (
				<Chip
					key={`${row.newDeviceId}-status`}
					color={row.status === "ACTIVE" ? "success" : "danger"}
					variant="flat"
					size="sm"
					className="capitalize"
				>
					{row.status || "N/A"}
				</Chip>
			);
		}

		return (
			<p
				key={`${row.newDeviceId}-${key}`}
				className="text-small cursor-pointer"
				onClick={() => openModal("view", row)}
			>
				{(row as any)[key] || ""}
			</p>
		);
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end"></div>

			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable<DeviceRecord>
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
						text: "Create",
						onClick: () => {
							const createUrl = `/access/${role}/inventory/devices/create`;
							window.open(createUrl, "_blank");
						},
					}}
				/>
			)}

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
										{/* Device Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">
												Device Information
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-sm text-default-500">Device ID</p>
													<p className="font-medium">
														{selectedItem.newDeviceId || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Old Device ID
													</p>
													<p className="font-medium">
														{selectedItem.oldDeviceId || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Device Name
													</p>
													<p className="font-medium">
														{selectedItem.deviceName || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Model Number
													</p>
													<p className="font-medium">
														{selectedItem.deviceModelNumber || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Manufacturer
													</p>
													<p className="font-medium">
														{selectedItem.deviceManufacturer || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Device Type
													</p>
													<p className="font-medium">
														{selectedItem.deviceType || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Price</p>
													<p className="font-medium">
														{selectedItem.price
															? `₦${selectedItem.price.toLocaleString("en-GB")}`
															: "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">SAP</p>
													<p className="font-medium">
														{selectedItem.SAP
															? `₦${selectedItem.SAP.toLocaleString("en-GB")}`
															: "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">SLD</p>
													<p className="font-medium">
														{selectedItem.SLD
															? `₦${selectedItem.SLD.toLocaleString("en-GB")}`
															: "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Sentiprotect
													</p>
													<p className="font-medium">
														{selectedItem.sentiprotect
															? `₦${selectedItem.sentiprotect.toLocalString(
																	"en-GB"
															  )}`
															: "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Android Go</p>
													<p className="font-medium">
														{selectedItem.android_go || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Created At</p>
													<p className="font-medium">
														{selectedItem.createdAt
															? new Date(selectedItem.createdAt).toLocalString(
																	"en-GB"
															  )
															: "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Updated At</p>
													<p className="font-medium">
														{selectedItem.updatedAt
															? new Date(selectedItem.updatedAt).toLocalString(
																	"en-GB"
															  )
															: "N/A"}
													</p>
												</div>
											</div>
										</div>
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

			<Modal
				isOpen={isDeactivateDevice}
				onClose={handleDeactivateDeviceClose}
				className="m-4 max-w-[600px]"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Deactivate Device</ModalHeader>
							<ModalBody>
								{selectedItem && (
									<div className="space-y-4">
										{/* Device Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">
												Device Information
											</h3>
											<div className="space-y-3">
												<div>
													<p className="text-sm text-default-500">
														Device Name
													</p>
													<p className="font-medium">
														{selectedItem.deviceName || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device ID</p>
													<p className="font-medium">
														{selectedItem.newDeviceId || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Manufacturer
													</p>
													<p className="font-medium">
														{selectedItem.deviceManufacturer || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Device Type
													</p>
													<p className="font-medium">
														{selectedItem.deviceType || "N/A"}
													</p>
												</div>
											</div>
										</div>

										{/* Reason Input */}
										<div>
											<p className="text-sm text-default-500 mb-2">
												Reason for Deactivation *
											</p>
											<Input
												placeholder="Enter reason for deactivation"
												value={reason}
												onChange={(e) => setReason(e.target.value)}
												className="w-full"
											/>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="danger"
									variant="solid"
									onPress={handleDeactivateDevice}
									isDisabled={!reason.trim()}
								>
									Confirm
								</Button>

								<Button
									color="default"
									variant="light"
									onPress={handleDeactivateDeviceClose}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Activate Device Modal */}
			<Modal
				isOpen={isActivateDevice}
				onClose={handleActivateDeviceClose}
				className="m-4 max-w-[600px]"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Activate Device</ModalHeader>
							<ModalBody>
								{selectedItem && (
									<div className="space-y-4">
										{/* Device Information */}
										<div className="bg-default-50 p-4 rounded-lg">
											<h3 className="text-lg font-semibold mb-3">
												Device Information
											</h3>
											<div className="space-y-3">
												<div>
													<p className="text-sm text-default-500">
														Device Name
													</p>
													<p className="font-medium">
														{selectedItem.deviceName || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">Device ID</p>
													<p className="font-medium">
														{selectedItem.newDeviceId || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Manufacturer
													</p>
													<p className="font-medium">
														{selectedItem.deviceManufacturer || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Device Type
													</p>
													<p className="font-medium">
														{selectedItem.deviceType || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-default-500">
														Current Status
													</p>
													<p className="font-medium capitalize">
														{selectedItem.status || "N/A"}
													</p>
												</div>
											</div>
										</div>

										{/* Confirmation Message */}
										<div className="bg-blue-50 p-4 rounded-lg">
											<p className="text-sm text-blue-700">
												Are you sure you want to activate this device? This will
												make it available for use again.
											</p>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() =>
										handleActivateDevice(selectedItem?.newDeviceId || "")
									}
								>
									Activate Device
								</Button>

								<Button
									color="default"
									variant="light"
									onPress={handleActivateDeviceClose}
								>
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
