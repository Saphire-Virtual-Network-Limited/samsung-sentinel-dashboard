"use client";

import React, { useState, useMemo } from "react";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
	Chip,
	SortDescriptor,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Select,
	SelectItem,
	Textarea,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	Plus,
	Eye,
	Edit,
	Trash2,
	Power,
	PowerOff,
	EllipsisVertical,
	MapPin,
	Users,
	CreditCard,
	Wrench,
	Building2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
	showToast,
	getAllRepairPartners,
	createRepairStore,
	updateRepairStore,
	activateRepairStore,
	deactivateRepairStore,
	type RepairStore,
} from "@/lib";
import useSWR from "swr";

interface RepairCenter {
	id: string;
	name: string;
	address: string;
	state: string;
	lga: string;
	phoneNumber: string;
	email: string;
	serviceCentersCount: number;
	totalRepairs: number;
	monthlyRevenue: number;
	status: "active" | "inactive" | "suspended";
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
}

const columns: ColumnDef[] = [
	{ name: "Repair Store", uid: "name", sortable: true },
	{ name: "Location", uid: "location", sortable: true },
	{ name: "Contact", uid: "contact", sortable: false },
	{ name: "Service Centers", uid: "service_centers_count", sortable: true },
	{ name: "Bank Details", uid: "bank", sortable: false },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created", uid: "created_at", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "Active", uid: "ACTIVE" },
	{ name: "Inactive", uid: "INACTIVE" },
	{ name: "Suspended", uid: "SUSPENDED" },
];

const statusColorMap: Record<string, "success" | "default" | "danger"> = {
	ACTIVE: "success" as const,
	INACTIVE: "default" as const,
	SUSPENDED: "danger" as const,
	DISABLED: "danger" as const,
};

export default function AdminRepairCentersView() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// Modal states
	const {
		isOpen: isCreateModalOpen,
		onOpen: onCreateModalOpen,
		onClose: onCreateModalClose,
	} = useDisclosure();

	const {
		isOpen: isEditModalOpen,
		onOpen: onEditModalOpen,
		onClose: onEditModalClose,
	} = useDisclosure();

	// Form states
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		description: "",
		location: "",
		account_name: "",
		account_number: "",
		bank_name: "",
	});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Filter and selection states
	const [filterValue, setFilterValue] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(25);

	// Fetch repair partners
	const {
		data: repairPartnersData,
		mutate,
		isLoading,
	} = useSWR(
		[
			"repair-partners",
			page,
			limit,
			filterValue,
			locationFilter,
			Array.from(statusFilter)[0],
		],
		() =>
			getAllRepairPartners({
				page,
				limit,
				...(filterValue && { search: filterValue }),
				...(locationFilter && { location: locationFilter }),
				...(statusFilter.size > 0 && {
					status: Array.from(statusFilter)[0] as any,
				}),
			})
	);
	const repairPartners = useMemo(
		() => repairPartnersData?.data || [],
		[repairPartnersData]
	);
	const total = repairPartnersData?.total || 0;
	const totalPages = repairPartnersData?.totalPages || 1;

	// Statistics
	const stats = useMemo(
		() => ({
			totalCenters: total,
			activeCenters: repairPartners.filter((s) => s.status === "ACTIVE").length,
			totalServiceCenters: repairPartners.reduce(
				(sum, s) => sum + (s.service_centers_count || 0),
				0
			),
			totalRevenue: 0, // TODO: Calculate from actual revenue data when available
		}),
		[repairPartners, total]
	);

	// Handlers
	const handleCreateRepairStore = async () => {
		const { name, email, phone, location } = formData;

		if (!name || !email || !phone || !location) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await createRepairStore(formData);
			showToast({
				message: "Repair store created successfully",
				type: "success",
			});
			setFormData({
				name: "",
				email: "",
				phone: "",
				description: "",
				location: "",
				account_name: "",
				account_number: "",
				bank_name: "",
			});
			onCreateModalClose();
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to create repair partner",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditRepairStore = async () => {
		if (!editingId) return;

		const { name, email, phone, location } = formData;

		if (!name || !email || !phone || !location) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await updateRepairStore(editingId, formData);
			showToast({
				message: "Repair store updated successfully",
				type: "success",
			});
			setFormData({
				name: "",
				email: "",
				phone: "",
				description: "",
				location: "",
				account_name: "",
				account_number: "",
				bank_name: "",
			});
			setEditingId(null);
			onEditModalClose();
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update repair partner",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleToggleStatus = async (id: string, currentStatus: string) => {
		try {
			if (currentStatus === "ACTIVE") {
				await deactivateRepairStore(id);
				showToast({
					message: "Repair store deactivated successfully",
					type: "success",
				});
			} else {
				await activateRepairStore(id);
				showToast({
					message: "Repair store activated successfully",
					type: "success",
				});
			}
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to toggle repair partner status",
				type: "error",
			});
		}
	};

	const handleEditClick = (store: RepairStore) => {
		setEditingId(store.id);
		setFormData({
			name: store.name,
			email: store.email,
			phone: store.phone,
			description: store.description || "",
			location: store.location,
			account_name: store.account_name || "",
			account_number: store.account_number || "",
			bank_name: store.bank_name || "",
		});
		onEditModalOpen();
	};

	const handleSelectionChange = (keys: any) => {
		setSelectedKeys(new Set(keys));
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Export function
	const exportFn = async () => {
		try {
			// Fetch all data using total as limit
			const allData = await getAllRepairPartners({
				page: 1,
				limit: total || 1000, // Use total or fallback to 1000
			});

			const dataToExport = allData?.data || [];

			if (dataToExport.length === 0) {
				showToast({
					message: "No data to export",
					type: "warning",
				});
				return;
			}

			const ExcelJS = await import("exceljs");
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Repair Partners");

			// Define columns
			worksheet.columns = [
				{ header: "ID", key: "id", width: 40 },
				{ header: "Name", key: "name", width: 30 },
				{ header: "Email", key: "email", width: 30 },
				{ header: "Phone", key: "phone", width: 20 },
				{ header: "Location", key: "location", width: 25 },
				{ header: "Service Centers", key: "service_centers_count", width: 18 },
				{ header: "Account Name", key: "account_name", width: 30 },
				{ header: "Account Number", key: "account_number", width: 20 },
				{ header: "Bank Name", key: "bank_name", width: 30 },
				{ header: "Status", key: "status", width: 15 },
				{ header: "Created At", key: "created_at", width: 20 },
			];

			// Style header row
			worksheet.getRow(1).font = { bold: true };
			worksheet.getRow(1).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FF4472C4" },
			};
			worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

			// Add data
			dataToExport.forEach((partner: RepairStore) => {
				worksheet.addRow({
					id: partner.id,
					name: partner.name,
					email: partner.email,
					phone: partner.phone,
					location: partner.location,
					service_centers_count: partner.service_centers_count || 0,
					account_name: partner.account_name || "N/A",
					account_number: partner.account_number || "N/A",
					bank_name: partner.bank_name || "N/A",
					status: partner.status,
					created_at: new Date(partner.created_at).toLocaleDateString(),
				});
			});

			// Generate buffer and download
			const buffer = await workbook.xlsx.writeBuffer();
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `repair_partners_export_${
				new Date().toISOString().split("T")[0]
			}.xlsx`;
			link.click();
			window.URL.revokeObjectURL(url);

			showToast({
				message: `Successfully exported ${dataToExport.length} repair partners`,
				type: "success",
			});
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to export repair partners",
				type: "error",
			});
		}
	};

	// Render cell content
	const renderCell = (item: RepairStore, columnKey: React.Key) => {
		switch (columnKey) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm capitalize">{item.name}</p>
						<p className="text-bold text-sm capitalize text-default-400">
							{item.email}
						</p>
					</div>
				);
			case "location":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{item.location}</p>
					</div>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{item.phone}</p>
						<p className="text-sm text-default-400">{item.email}</p>
					</div>
				);
			case "service_centers_count":
				return (
					<div className="flex items-center gap-2">
						<Building2 size={16} className="text-default-400" />
						<span className="text-sm">{item.service_centers_count || 0}</span>
					</div>
				);
			case "bank":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{item.account_name || "N/A"}</p>
						<p className="text-sm text-default-400">
							{item.account_number || "N/A"} - {item.bank_name || "N/A"}
						</p>
					</div>
				);
			case "status":
				return (
					<Chip
						className="capitalize"
						color={statusColorMap[item.status]}
						size="sm"
						variant="flat"
					>
						{item.status}
					</Chip>
				);
			case "created_at":
				return (
					<span className="text-sm">
						{new Date(item.created_at).toLocaleDateString()}
					</span>
				);
			case "actions":
				return (
					<div className="flex justify-end">
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light">
									<EllipsisVertical className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem
									key="view"
									startContent={<Eye size={16} />}
									onPress={() =>
										router.push(
											`/access/admin/samsung-sentinel/repair-partners/${item.id}`
										)
									}
								>
									View Details
								</DropdownItem>
								<DropdownItem
									key="edit"
									startContent={<Edit size={16} />}
									onPress={() => handleEditClick(item)}
								>
									Edit Center
								</DropdownItem>
								<DropdownItem
									key="toggle"
									startContent={
										item.status === "ACTIVE" ? (
											<PowerOff size={16} />
										) : (
											<Power size={16} />
										)
									}
									onPress={() => handleToggleStatus(item.id, item.status)}
								>
									{item.status === "ACTIVE" ? "Deactivate" : "Activate"}
								</DropdownItem>
								<DropdownItem
									key="delete"
									className="text-danger"
									color="danger"
									startContent={<Trash2 size={16} />}
									onPress={() => {
										/* Handle delete */
									}}
								>
									Delete Center
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <span>{String(item[columnKey as keyof RepairStore])}</span>;
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Repair Partners Management</h1>
					<p className="text-default-500">
						Manage all repair partners and their service locations
					</p>
				</div>
				<div className="flex items-center gap-3">
					{selectedKeys.size > 0 && (
						<>
							<Button
								color="danger"
								variant="flat"
								startContent={<Trash2 size={16} />}
								onPress={() => {
									/* Handle bulk delete */
								}}
							>
								Delete Selected ({selectedKeys.size})
							</Button>
							<Button
								variant="flat"
								onPress={() => setSelectedKeys(new Set())}
								size="sm"
							>
								Clear Selection
							</Button>
						</>
					)}
					<Button
						color="primary"
						startContent={<Plus size={16} />}
						onPress={onCreateModalOpen}
					>
						Create Repair Partner
					</Button>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<StatCard
					title="Total Centers"
					value={stats.totalCenters.toString()}
					icon={<MapPin className="w-5 h-5" />}
				/>
				<StatCard
					title="Active Centers"
					value={stats.activeCenters.toString()}
					icon={<Power className="w-5 h-5" />}
				/>
				<StatCard
					title="Service Locations"
					value={stats.totalServiceCenters.toString()}
					icon={<Building2 className="w-5 h-5" />}
				/>
				<StatCard
					title="Monthly Revenue"
					value={formatCurrency(stats.totalRevenue)}
					icon={<CreditCard className="w-5 h-5" />}
				/>
			</div>

			{/* Repair Partners Table */}
			<GenericTable<RepairStore>
				columns={columns}
				data={repairPartners}
				allCount={repairPartners.length}
				exportData={repairPartners}
				isLoading={isLoading}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				statusOptions={statusOptions}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				statusColorMap={statusColorMap}
				showStatus={true}
				sortDescriptor={{ column: "created_at", direction: "descending" }}
				onSortChange={() => {}}
				page={page}
				pages={totalPages}
				onPageChange={setPage}
				exportFn={exportFn}
				renderCell={renderCell}
				statusFilterMode="single"
				hasNoRecords={repairPartners.length === 0}
				searchPlaceholder="Search repair partners by name"
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				selectionMode="multiple"
				showRowsPerPageSelector={true}
			/>

			{/* Create Repair Partner Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Create New Repair Partner</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Repair Partner Name"
										placeholder="e.g., Sapphire Repair Partner Lagos"
										value={formData.name}
										onValueChange={(value) =>
											setFormData({ ...formData, name: value })
										}
										isRequired
									/>
									<Input
										label="Email Address"
										placeholder="e.g., lagos@sapphire-repair.com"
										value={formData.email}
										onValueChange={(value) =>
											setFormData({ ...formData, email: value })
										}
										isRequired
									/>
									<Input
										label="Phone Number"
										placeholder="e.g., +234-903-123-4567"
										value={formData.phone}
										onValueChange={(value) =>
											setFormData({ ...formData, phone: value })
										}
										isRequired
									/>
									<Input
										label="Location"
										placeholder="e.g., Lagos, Nigeria"
										value={formData.location}
										onValueChange={(value) =>
											setFormData({ ...formData, location: value })
										}
										isRequired
									/>
									<Input
										label="Account Name"
										placeholder="e.g., Sapphire Repairs Ltd"
										value={formData.account_name}
										onValueChange={(value) =>
											setFormData({ ...formData, account_name: value })
										}
									/>
									<Input
										label="Account Number"
										placeholder="e.g., 0123456789"
										value={formData.account_number}
										onValueChange={(value) =>
											setFormData({ ...formData, account_number: value })
										}
									/>
									<Input
										label="Bank Name"
										placeholder="e.g., First Bank of Nigeria"
										value={formData.bank_name}
										onValueChange={(value) =>
											setFormData({ ...formData, bank_name: value })
										}
									/>
								</div>
								<Textarea
									label="Description"
									placeholder="Enter repair partner description..."
									value={formData.description}
									onValueChange={(value) =>
										setFormData({ ...formData, description: value })
									}
									minRows={3}
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onCreateModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleCreateRepairStore}
									isLoading={isSubmitting}
								>
									Create Repair Partner
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Edit Repair Partner Modal */}
			<Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Repair Partner</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Repair Partner Name"
										placeholder="e.g., Sapphire Repair Partner Lagos"
										value={formData.name}
										onValueChange={(value) =>
											setFormData({ ...formData, name: value })
										}
										isRequired
									/>
									<Input
										label="Email Address"
										placeholder="e.g., lagos@sapphire-repair.com"
										value={formData.email}
										onValueChange={(value) =>
											setFormData({ ...formData, email: value })
										}
										isRequired
									/>
									<Input
										label="Phone Number"
										placeholder="e.g., +234-903-123-4567"
										value={formData.phone}
										onValueChange={(value) =>
											setFormData({ ...formData, phone: value })
										}
										isRequired
									/>
									<Input
										label="Location"
										placeholder="e.g., Lagos, Nigeria"
										value={formData.location}
										onValueChange={(value) =>
											setFormData({ ...formData, location: value })
										}
										isRequired
									/>
									<Input
										label="Account Name"
										placeholder="e.g., Sapphire Repairs Ltd"
										value={formData.account_name}
										onValueChange={(value) =>
											setFormData({ ...formData, account_name: value })
										}
									/>
									<Input
										label="Account Number"
										placeholder="e.g., 0123456789"
										value={formData.account_number}
										onValueChange={(value) =>
											setFormData({ ...formData, account_number: value })
										}
									/>
									<Input
										label="Bank Name"
										placeholder="e.g., First Bank of Nigeria"
										value={formData.bank_name}
										onValueChange={(value) =>
											setFormData({ ...formData, bank_name: value })
										}
									/>
								</div>
								<Textarea
									label="Description"
									placeholder="Enter repair partner description..."
									value={formData.description}
									onValueChange={(value) =>
										setFormData({ ...formData, description: value })
									}
									minRows={3}
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditRepairStore}
									isLoading={isSubmitting}
								>
									Update Repair Partner
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
