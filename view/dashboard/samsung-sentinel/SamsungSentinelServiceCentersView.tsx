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
import { showToast } from "@/lib";

interface ServiceCenter {
	id: string;
	name: string;
	address: string;
	state: string;
	lga: string;
	phoneNumber: string;
	email: string;
	engineersCount: number;
	totalRepairs: number;
	monthlyRevenue: number;
	status: "active" | "inactive" | "suspended";
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
}

const columns: ColumnDef[] = [
	{ name: "Service Center", uid: "name", sortable: true },
	{ name: "Location", uid: "location", sortable: true },
	{ name: "Contact", uid: "contact", sortable: true },
	{ name: "Engineers", uid: "engineersCount", sortable: true },
	{ name: "Total Repairs", uid: "totalRepairs", sortable: true },
	{ name: "Monthly Revenue", uid: "monthlyRevenue", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "danger" as const,
	suspended: "warning" as const,
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
		lga: "",
		phoneNumber: "",
		email: "",
	});
	const [isCreating, setIsCreating] = useState(false);

	// Filter and selection states (pagination/sorting handled by GenericTable)
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// Mock data
	const serviceCenters: ServiceCenter[] = useMemo(
		() => [
			{
				id: "sc_001",
				name: "Sapphire Tech Hub Lagos",
				address: "123 Allen Avenue, Ikeja",
				state: "Lagos",
				lga: "Ikeja",
				phoneNumber: "+234 801 234 5678",
				email: "lagos@sapphiretech.com",
				engineersCount: 8,
				totalRepairs: 1245,
				monthlyRevenue: 2850000,
				status: "active",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-01-15T10:30:00Z",
				lastUpdatedAt: "2024-10-01T14:20:00Z",
			},
			{
				id: "sc_002",
				name: "Sapphire Tech Hub Abuja",
				address: "45 Wuse II District",
				state: "FCT",
				lga: "Wuse",
				phoneNumber: "+234 802 345 6789",
				email: "abuja@sapphiretech.com",
				engineersCount: 6,
				totalRepairs: 892,
				monthlyRevenue: 2100000,
				status: "active",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-02-20T09:15:00Z",
				lastUpdatedAt: "2024-09-28T11:45:00Z",
			},
			{
				id: "sc_003",
				name: "Sapphire Tech Hub Port Harcourt",
				address: "78 GRA Phase II",
				state: "Rivers",
				lga: "Port Harcourt",
				phoneNumber: "+234 803 456 7890",
				email: "portharcourt@sapphiretech.com",
				engineersCount: 5,
				totalRepairs: 654,
				monthlyRevenue: 1750000,
				status: "active",
				createdBy: "manager@sapphire.com",
				createdAt: "2024-03-10T16:20:00Z",
				lastUpdatedAt: "2024-10-05T09:30:00Z",
			},
			{
				id: "sc_004",
				name: "Sapphire Tech Hub Kano",
				address: "12 Bompai Road",
				state: "Kano",
				lga: "Nassarawa",
				phoneNumber: "+234 804 567 8901",
				email: "kano@sapphiretech.com",
				engineersCount: 4,
				totalRepairs: 423,
				monthlyRevenue: 1200000,
				status: "suspended",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-04-05T13:10:00Z",
				lastUpdatedAt: "2024-09-20T10:15:00Z",
			},
		],
		[]
	);

	// Let GenericTable handle filtering internally	// Statistics
	const stats = useMemo(
		() => ({
			totalCenters: serviceCenters.length,
			activeCenters: serviceCenters.filter((c) => c.status === "active").length,
			totalEngineers: serviceCenters.reduce(
				(sum, c) => sum + c.engineersCount,
				0
			),
			totalRevenue: serviceCenters.reduce(
				(sum, c) => sum + c.monthlyRevenue,
				0
			),
		}),
		[serviceCenters]
	);

	// Handlers
	// Sort handling managed by GenericTable

	const handleCreateServiceCenter = async () => {
		const { name, address, state, lga, phoneNumber, email } = formData;

		if (!name || !address || !state || !lga || !phoneNumber || !email) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsCreating(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: "Service center created successfully",
				type: "success",
			});
			setFormData({
				name: "",
				address: "",
				state: "",
				lga: "",
				phoneNumber: "",
				email: "",
			});
			onCreateModalClose();
		} catch (error) {
			showToast({ message: "Failed to create service center", type: "error" });
		} finally {
			setIsCreating(false);
		}
	};

	const handleToggleStatus = async (
		centerId: string,
		currentStatus: string
	) => {
		let newStatus: "active" | "inactive" | "suspended";
		if (currentStatus === "active") {
			newStatus = "suspended";
		} else if (currentStatus === "suspended") {
			newStatus = "inactive";
		} else {
			newStatus = "active";
		}

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({
				message: `Service center status updated to ${newStatus}`,
				type: "success",
			});
		} catch (error) {
			showToast({
				message: "Failed to update service center status",
				type: "error",
			});
		}
	};

	const handleDelete = async (centerId: string) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({
				message: "Service center deleted successfully",
				type: "success",
			});
		} catch (error) {
			showToast({ message: "Failed to delete service center", type: "error" });
		}
	};

	// Bulk actions
	const handleBulkActivate = async () => {
		if (selectedKeys.size === 0) return;
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} service centers activated successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({
				message: "Failed to activate service centers",
				type: "error",
			});
		}
	};

	const handleBulkSuspend = async () => {
		if (selectedKeys.size === 0) return;
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} service centers suspended successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({
				message: "Failed to suspend service centers",
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
						<p className="text-bold text-xs text-default-400">ID: {row.id}</p>
					</div>
				);
			case "location":
				return (
					<div className="flex flex-col">
						<p className="text-sm">
							{row.state}, {row.lga}
						</p>
						<p className="text-xs text-default-400">{row.address}</p>
					</div>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.phoneNumber}</p>
						<p className="text-xs text-default-400">{row.email}</p>
					</div>
				);
			case "engineersCount":
				return (
					<Chip color="primary" variant="flat" size="sm">
						{row.engineersCount} engineers
					</Chip>
				);
			case "totalRepairs":
				return <p className="text-sm font-medium">{row.totalRepairs}</p>;
			case "monthlyRevenue":
				return (
					<p className="text-sm font-medium">
						{formatCurrency(row.monthlyRevenue)}
					</p>
				);
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
										row.status === "active" ? (
											<PowerOff size={16} />
										) : (
											<Power size={16} />
										)
									}
									onPress={() => handleToggleStatus(row.id, row.status)}
								>
									Change Status
								</DropdownItem>
								<DropdownItem
									key="delete"
									className="text-danger"
									color="danger"
									startContent={<Trash2 size={16} />}
									onPress={() => handleDelete(row.id)}
								>
									Delete
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
		{ name: "Active", uid: "active" },
		{ name: "Suspended", uid: "suspended" },
		{ name: "Inactive", uid: "inactive" },
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
								Suspend ({selectedKeys.size})
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
					title="Monthly Revenue"
					value={formatCurrency(stats.totalRevenue)}
					icon={<CreditCard className="w-5 h-5" />}
				/>
			</div>
			{/* Service Centers Table */}
			<GenericTable<ServiceCenter>
				columns={columns}
				data={serviceCenters}
				allCount={serviceCenters.length}
				exportData={serviceCenters}
				isLoading={false}
				filterValue={filterValue}
				onFilterChange={setFilterValue}
				statusOptions={statusOptions}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				statusColorMap={statusColorMap}
				showStatus={true}
				sortDescriptor={{ column: "createdAt", direction: "descending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={exportFn}
				renderCell={renderCell}
				hasNoRecords={serviceCenters.length === 0}
				searchPlaceholder="Search service centers by name, location, or email..."
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				selectionMode="multiple"
				showRowsPerPageSelector={true}
			/>{" "}
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
										value={formData.phoneNumber}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, phoneNumber: value }))
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
										label="Local Government Area"
										placeholder="e.g., Ikeja"
										value={formData.lga}
										onValueChange={(value) =>
											setFormData((prev) => ({ ...prev, lga: value }))
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
										!formData.name || !formData.email || !formData.phoneNumber
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
