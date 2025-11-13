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
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
	showToast,
	getAllServiceCenters,
	createServiceCenter,
	updateServiceCenter,
	activateServiceCenter,
	deactivateServiceCenter,
	type ServiceCenter as APIServiceCenter,
	type PaginatedServiceCentersResponse,
} from "@/lib";
import useSWR from "swr";

interface ServiceCenter {
	id: string;
	name: string;
	address: string;
	state: string;
	city: string;
	phone: string;
	email: string;
	engineers_count?: number;
	status: "ACTIVE" | "SUSPENDED" | "DISABLED";
	created_at: string;
	repair_store?: {
		id: string;
		name: string;
	};
}

const columns: ColumnDef[] = [
	{ name: "Service Center", uid: "name", sortable: true },
	{ name: "Location", uid: "location", sortable: true },
	{ name: "Contact", uid: "contact", sortable: true },
	{ name: "Engineers", uid: "engineers_count", sortable: true },
	{ name: "Repair Store", uid: "repair_store", sortable: false },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap: Record<string, "success" | "default" | "danger"> = {
	ACTIVE: "success" as const,
	DISABLED: "default" as const,
	SUSPENDED: "danger" as const,
};

export default function SamsungSentinelServiceCentersView() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// Modal states
	const {
		isOpen: isCreateModalOpen,
		onOpen: onCreateModalOpen,
		onClose: onCreateModalClose,
	} = useDisclosure();

	// Form states
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		state: "",
		city: "",
		phone: "",
		email: "",
		description: "",
		account_name: "",
		account_number: "",
		bank_name: "",
	});
	const [isCreating, setIsCreating] = useState(false);

	// Filter and selection states
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);
	const [limit] = useState(25);

	// Fetch service centers with SWR
const {
	data: serviceCentersData,
	mutate,
	isLoading,
} = useSWR(["service-centers", page, limit, filterValue, statusFilter], () =>
	getAllServiceCenters({
		page,
		limit,
		...(filterValue && { search: filterValue }),
		...(statusFilter.size > 0 && { status: Array.from(statusFilter)[0] as any }),
	})
);	const serviceCenters: ServiceCenter[] = useMemo(
		() => serviceCentersData?.data || [],
		[serviceCentersData]
	);

	const totalPages = useMemo(
		() => serviceCentersData?.totalPages || 1,
		[serviceCentersData]
	);
	// Statistics
	const stats = useMemo(
		() => ({
			totalCenters: serviceCentersData?.total || 0,
			activeCenters: serviceCenters.filter((c) => c.status === "ACTIVE").length,
			totalEngineers: serviceCenters.reduce(
				(sum, c) => sum + (c.engineers_count || 0),
				0
			),
			suspendedCenters: serviceCenters.filter((c) => c.status === "SUSPENDED")
				.length,
		}),
		[serviceCenters, serviceCentersData]
	);

	// Handlers
	const handleCreateServiceCenter = async () => {
		const { name, address, state, city, phone, email } = formData;

		if (!name || !address || !state || !city || !phone || !email) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsCreating(true);
		try {
			await createServiceCenter(formData);
			showToast({
				message: "Service center created successfully",
				type: "success",
			});
			setFormData({
				name: "",
				address: "",
				state: "",
				city: "",
				phone: "",
				email: "",
				description: "",
				account_name: "",
				account_number: "",
				bank_name: "",
			});
			onCreateModalClose();
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to create service center",
				type: "error",
			});
		} finally {
			setIsCreating(false);
		}
	};

	const handleToggleStatus = async (
		centerId: string,
		currentStatus: string
	) => {
		try {
			if (currentStatus === "ACTIVE") {
				await deactivateServiceCenter(centerId);
				showToast({
					message: "Service center deactivated successfully",
					type: "success",
				});
			} else {
				await activateServiceCenter(centerId);
				showToast({
					message: "Service center activated successfully",
					type: "success",
				});
			}
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update service center status",
				type: "error",
			});
		}
	};

	// Bulk actions
	const handleBulkActivate = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await Promise.all(
				Array.from(selectedKeys).map((id) =>
					activateServiceCenter(id as string)
				)
			);
			showToast({
				message: `${selectedKeys.size} service centers activated successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to activate service centers",
				type: "error",
			});
		}
	};

	const handleBulkSuspend = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await Promise.all(
				Array.from(selectedKeys).map((id) =>
					deactivateServiceCenter(id as string)
				)
			);
			showToast({
				message: `${selectedKeys.size} service centers deactivated successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to deactivate service centers",
				type: "error",
			});
		}
	};

	// Selection handler
	const handleSelectionChange = (keys: any) => {
		if (keys === "all") {
			if (selectedKeys.size === serviceCenters.length) {
				setSelectedKeys(new Set());
			} else {
				setSelectedKeys(
					new Set(serviceCenters.map((item: ServiceCenter) => item.id))
				);
			}
		} else {
			setSelectedKeys(new Set(Array.from(keys)));
		}
	};

	// Export function
	const exportFn = async (data: ServiceCenter[]) => {
		// Implementation for export functionality
		console.log("Exporting service centers:", data);
	};

	// Render cell content
	const renderCell = (row: ServiceCenter, key: string) => {
		switch (key) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{row.name}</p>
						<p className="text-bold text-xs text-default-400">ID: {row.id}</p>
					</div>
				);
			case "location":
				return (
					<div className="flex flex-col">
						<p className="text-sm">
							{row.city}, {row.state}
						</p>
						<p className="text-xs text-default-400">{row.address}</p>
					</div>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.phone}</p>
						<p className="text-xs text-default-400">{row.email}</p>
					</div>
				);
			case "engineers_count":
				return (
					<Chip color="primary" variant="flat" size="sm">
						{row.engineers_count || 0} engineers
					</Chip>
				);
			case "repair_store":
				return <p className="text-sm">{row.repair_store?.name || "N/A"}</p>;
			case "status":
				return (
					<Chip
						color={statusColorMap[row.status]}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.status}
					</Chip>
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
											`/access/${role}/samsung-sentinel/service-centers/${row.id}`
										)
									}
								>
									View Details
								</DropdownItem>
								<DropdownItem
									key="edit"
									startContent={<Edit size={16} />}
									onPress={() => {
										/* Handle edit */
									}}
								>
									Edit Center
								</DropdownItem>
								<DropdownItem
									key="toggle"
									startContent={
										row.status === "ACTIVE" ? (
											<PowerOff size={16} />
										) : (
											<Power size={16} />
										)
									}
									onPress={() => handleToggleStatus(row.id, row.status)}
								>
									{row.status === "ACTIVE" ? "Deactivate" : "Activate"}
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <p className="text-sm">{(row as any)[key]}</p>;
		}
	};

	const statusOptions = [
		{ name: "Active", uid: "ACTIVE" },
		{ name: "Suspended", uid: "SUSPENDED" },
		{ name: "Disabled", uid: "DISABLED" },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div></div>
				<div className="flex items-center gap-2">
					{selectedKeys.size > 0 && (
						<>
							<Button
								color="success"
								variant="flat"
								startContent={<Power size={16} />}
								onPress={handleBulkActivate}
								size="sm"
							>
								Activate ({selectedKeys.size})
							</Button>
							<Button
								color="warning"
								variant="flat"
								startContent={<PowerOff size={16} />}
								onPress={handleBulkSuspend}
								size="sm"
							>
								Deactivate ({selectedKeys.size})
							</Button>
							<Button
								variant="light"
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
						Create Service Center
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
					title="Total Engineers"
					value={stats.totalEngineers.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
				<StatCard
					title="Suspended Centers"
					value={stats.suspendedCenters.toString()}
					icon={<PowerOff className="w-5 h-5" />}
				/>
			</div>
			{/* Service Centers Table */}
			<GenericTable<ServiceCenter>
				columns={columns}
				data={serviceCenters}
				allCount={serviceCentersData?.total || 0}
				exportData={serviceCenters}
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
				hasNoRecords={serviceCenters.length === 0}
				searchPlaceholder="Search service centers by name, location, or email..."
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				selectionMode="multiple"
				showRowsPerPageSelector={true}
			/>
			{/* Create Service Center Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Create New Service Center</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Service Center Name"
										placeholder="e.g., Sapphire Tech Hub Lagos"
										value={formData.name}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, name: value }))
										}
										isRequired
									/>
									<Input
										label="Email Address"
										type="email"
										placeholder="center@sapphiretech.com"
										value={formData.email}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, email: value }))
										}
										isRequired
									/>
									<Input
										label="Phone Number"
										placeholder="+234 801 234 5678"
										value={formData.phone}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, phone: value }))
										}
										isRequired
									/>
									<Input
										label="State"
										placeholder="e.g., Lagos"
										value={formData.state}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, state: value }))
										}
										isRequired
									/>
									<Input
										label="City"
										placeholder="e.g., Ikeja"
										value={formData.city}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, city: value }))
										}
										isRequired
									/>
									<Input
										label="Address"
										placeholder="123 Allen Avenue"
										value={formData.address}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, address: value }))
										}
										isRequired
									/>
									<Input
										label="Account Name"
										placeholder="e.g., John Doe"
										value={formData.account_name}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, account_name: value }))
										}
									/>
									<Input
										label="Account Number"
										placeholder="e.g., 1234567890"
										value={formData.account_number}
										onValueChange={(value) =>
											setFormData((prev) => ({
												...prev,
												account_number: value,
											}))
										}
									/>
									<Input
										label="Bank Name"
										placeholder="e.g., First Bank"
										value={formData.bank_name}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, bank_name: value }))
										}
									/>
								</div>
								<Input
									label="Description"
									placeholder="Enter service center description..."
									value={formData.description}
									onValueChange={(value) =>
										setFormData((prev) => ({ ...prev, description: value }))
									}
								/>
							</ModalBody>
							<ModalFooter>
								<Button
									color="danger"
									variant="light"
									onPress={onCreateModalClose}
								>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleCreateServiceCenter}
									isLoading={isCreating}
									isDisabled={
										!formData.name ||
										!formData.email ||
										!formData.phone ||
										!formData.state ||
										!formData.city ||
										!formData.address
									}
								>
									{isCreating ? "Creating..." : "Create Service Center"}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
