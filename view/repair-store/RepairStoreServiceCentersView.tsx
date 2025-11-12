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
import { showToast } from "@/lib";
import { useRepairStoreServiceCenters } from "@/hooks/repair-store/useRepairStoreServiceCenters";
import type { ServiceCenter } from "@/lib/api";

const columns: ColumnDef[] = [
	{ name: "Service Center", uid: "name", sortable: true },
	{ name: "Location", uid: "location", sortable: true },
	{ name: "Contact", uid: "contact", sortable: true },
	{ name: "Engineers", uid: "engineers_count", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	ACTIVE: "success" as const,
	SUSPENDED: "warning" as const,
	DISABLED: "danger" as const,
};

export default function RepairStoreServiceCentersView() {
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
		email: "",
		phone: "",
		state: "",
		city: "",
		address: "",
		description: "",
		account_name: "",
		account_number: "",
		bank_name: "",
	});

	// Filter and selection states
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [stateFilter, setStateFilter] = useState("");
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);

	// Use the API hook
	const {
		serviceCenters,
		total,
		totalPages,
		isLoading,
		error,
		isCreating,
		isChangingStatus,
		handleCreate,
		handleActivate,
		handleDeactivate,
	} = useRepairStoreServiceCenters({
		status: statusFilter.size > 0 ? Array.from(statusFilter)[0] : undefined,
		state: stateFilter || undefined,
		search: filterValue || undefined,
		page,
		limit: 25,
	});

	// Statistics
	const stats = useMemo(
		() => ({
			totalCenters: total,
			activeCenters: serviceCenters.filter((c) => c.status === "ACTIVE").length,
			totalEngineers: serviceCenters.reduce(
				(sum, c) => sum + (c.engineers_count || 0),
				0
			),
		}),
		[serviceCenters, total]
	);

	const handleCreateServiceCenter = async () => {
		const {
			name,
			email,
			phone,
			state,
			city,
			address,
			description,
			account_name,
			account_number,
			bank_name,
		} = formData;

		if (!name || !email || !phone || !state || !city || !address) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		try {
			await handleCreate({
				name,
				email,
				phone,
				state,
				city,
				address,
				description: description || undefined,
				account_name: account_name || undefined,
				account_number: account_number || undefined,
				bank_name: bank_name || undefined,
			});

			setFormData({
				name: "",
				email: "",
				phone: "",
				state: "",
				city: "",
				address: "",
				description: "",
				account_name: "",
				account_number: "",
				bank_name: "",
			});
			onCreateModalClose();
		} catch (error) {
			// Error already handled in hook
		}
	};

	const handleToggleStatus = async (
		centerId: string,
		currentStatus: string
	) => {
		try {
			if (currentStatus === "ACTIVE") {
				await handleDeactivate(centerId);
			} else {
				await handleActivate(centerId);
			}
		} catch (error) {
			// Error already handled in hook
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

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Render cell content
	const renderCell = (row: ServiceCenter, key: string) => {
		switch (key) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{row.name}</p>
						<p className="text-bold text-xs text-default-400">
							ID: {row.id.slice(0, 8)}...
						</p>
					</div>
				);
			case "location":
				return (
					<div className="flex flex-col">
						<p className="text-sm">
							{row.state}, {row.city}
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
			case "status":
				return (
					<Chip
						color={statusColorMap[row.status]}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.status.toLowerCase()}
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
										router.push(`/access/${role}/service-centers/${row.id}`)
									}
								>
									View Details
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

	const states = [
		"Lagos",
		"FCT",
		"Rivers",
		"Kano",
		"Kaduna",
		"Oyo",
		"Delta",
		"Edo",
		"Anambra",
		"Imo",
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Service Centers</h1>
					<p className="text-gray-600">
						Manage and monitor all service centers in your repair network
					</p>
				</div>
				<Button
					color="primary"
					startContent={<Plus size={16} />}
					onPress={onCreateModalOpen}
				>
					Create Service Center
				</Button>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
			</div>

			{/* Service Centers Table */}
			<GenericTable<ServiceCenter>
				columns={columns}
				data={serviceCenters}
				isLoading={isLoading}
				allCount={total}
				exportData={serviceCenters}
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
										label="Phone Number"
										placeholder="+234 801 234 5678"
										value={formData.phone}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, phone: value }))
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
									<Select
										label="State"
										placeholder="Select state"
										selectedKeys={formData.state ? [formData.state] : []}
										onSelectionChange={(keys) => {
											const selectedState = Array.from(keys)[0] as string;
											setFormData((prev) => ({
												...prev,
												state: selectedState,
											}));
										}}
										isRequired
									>
										{states.map((state) => (
											<SelectItem key={state} value={state}>
												{state}
											</SelectItem>
										))}
									</Select>
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
										className="md:col-span-2"
										isRequired
									/>
								</div>
								<p className="text-sm text-gray-600 mt-4">
									After creating the service center, you can add engineers and
									configure bank details.
								</p>
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
										!formData.name || !formData.email || !formData.phone
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
