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
	Building2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";

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
	{ name: "Repair Center", uid: "name", sortable: true },
	{ name: "Location", uid: "location", sortable: true },
	{ name: "Service Centers", uid: "serviceCentersCount", sortable: true },
	{ name: "Total Repairs", uid: "totalRepairs", sortable: true },
	{ name: "Monthly Revenue", uid: "monthlyRevenue", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusOptions = [
	{ name: "Active", uid: "active" },
	{ name: "Inactive", uid: "inactive" },
	{ name: "Suspended", uid: "suspended" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "default" as const,
	suspended: "danger" as const,
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
	const repairCenters: RepairCenter[] = useMemo(
		() => [
			{
				id: "rc_001",
				name: "Sapphire Repair Center Lagos",
				address: "Plot 15, Admiralty Way, Lekki Phase 1",
				state: "Lagos",
				lga: "Eti-Osa",
				phoneNumber: "+234-903-123-4567",
				email: "lagos@sapphire-repair.com",
				serviceCentersCount: 12,
				totalRepairs: 2450,
				monthlyRevenue: 15750000,
				status: "active" as const,
				createdBy: "admin@sapphire.com",
				createdAt: "2024-01-15T10:30:00Z",
				lastUpdatedAt: "2024-12-20T14:45:00Z",
			},
			{
				id: "rc_002",
				name: "TechFix Repair Center Abuja",
				address: "Suite 203, Central Business District",
				state: "FCT",
				lga: "Abuja Municipal",
				phoneNumber: "+234-803-987-6543",
				email: "abuja@techfix-repair.com",
				serviceCentersCount: 8,
				totalRepairs: 1890,
				monthlyRevenue: 12300000,
				status: "active" as const,
				createdBy: "admin@sapphire.com",
				createdAt: "2024-02-10T09:15:00Z",
				lastUpdatedAt: "2024-12-19T16:20:00Z",
			},
			{
				id: "rc_003",
				name: "Mobile Masters Repair Center Kano",
				address: "No. 45, IBB Way, Nassarawa GRA",
				state: "Kano",
				lga: "Nassarawa",
				phoneNumber: "+234-703-555-7890",
				email: "kano@mobilemasters-repair.com",
				serviceCentersCount: 6,
				totalRepairs: 1234,
				monthlyRevenue: 8500000,
				status: "active" as const,
				createdBy: "admin@sapphire.com",
				createdAt: "2024-03-05T11:45:00Z",
				lastUpdatedAt: "2024-12-18T13:30:00Z",
			},
			{
				id: "rc_004",
				name: "Smart Device Repair Center Port Harcourt",
				address: "KM 5, East-West Road, GRA Phase 2",
				state: "Rivers",
				lga: "Port Harcourt",
				phoneNumber: "+234-813-444-2222",
				email: "portharcourt@smartdevice-repair.com",
				serviceCentersCount: 4,
				totalRepairs: 890,
				monthlyRevenue: 6200000,
				status: "suspended" as const,
				createdBy: "admin@sapphire.com",
				createdAt: "2024-04-12T08:20:00Z",
				lastUpdatedAt: "2024-12-15T10:10:00Z",
			},
		],
		[]
	);

	// Statistics
	const stats = useMemo(
		() => ({
			totalCenters: repairCenters.length,
			activeCenters: repairCenters.filter((c) => c.status === "active").length,
			totalServiceCenters: repairCenters.reduce(
				(sum, c) => sum + c.serviceCentersCount,
				0
			),
			totalRevenue: repairCenters.reduce((sum, c) => sum + c.monthlyRevenue, 0),
		}),
		[repairCenters]
	);

	// Handlers
	const handleCreateRepairCenter = async () => {
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
			// API call to create repair center
			showToast({
				message: "Repair center created successfully",
				type: "success",
			});
			onCreateModalClose();
			setFormData({
				name: "",
				address: "",
				state: "",
				lga: "",
				phoneNumber: "",
				email: "",
			});
		} catch (error) {
			showToast({ message: "Failed to create repair center", type: "error" });
		} finally {
			setIsCreating(false);
		}
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
	const exportFn = () => {
		// Export logic
		showToast({
			message: "Repair centers data exported successfully",
			type: "success",
		});
	};

	// Render cell content
	const renderCell = (item: RepairCenter, columnKey: React.Key) => {
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
						<p className="text-bold text-sm">
							{item.state}, {item.lga}
						</p>
						<p className="text-sm text-default-400">{item.address}</p>
					</div>
				);
			case "serviceCentersCount":
				return (
					<div className="flex items-center gap-2">
						<Building2 size={16} className="text-default-400" />
						<span className="text-sm">{item.serviceCentersCount}</span>
					</div>
				);
			case "totalRepairs":
				return (
					<div className="flex items-center gap-2">
						<Wrench size={16} className="text-default-400" />
						<span className="text-sm">
							{item.totalRepairs.toLocaleString()}
						</span>
					</div>
				);
			case "monthlyRevenue":
				return (
					<span className="text-sm font-semibold text-success">
						{formatCurrency(item.monthlyRevenue)}
					</span>
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
			case "createdAt":
				return (
					<span className="text-sm">
						{new Date(item.createdAt).toLocaleDateString()}
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
										router.push(`/access/${role}/repair-centers/${item.id}`)
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
										item.status === "active" ? (
											<PowerOff size={16} />
										) : (
											<Power size={16} />
										)
									}
									onPress={() => {
										/* Handle toggle status */
									}}
								>
									{item.status === "active" ? "Suspend" : "Activate"}
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
				return <span>{String(item[columnKey as keyof RepairCenter])}</span>;
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Repair Centers Management</h1>
					<p className="text-default-500">
						Manage all repair centers and their service locations
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
						Create Repair Center
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

			{/* Repair Centers Table */}
			<GenericTable<RepairCenter>
				columns={columns}
				data={repairCenters}
				allCount={repairCenters.length}
				exportData={repairCenters}
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
				hasNoRecords={repairCenters.length === 0}
				searchPlaceholder="Search repair centers by name, location, or email..."
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				selectionMode="multiple"
				showRowsPerPageSelector={true}
			/>

			{/* Create Repair Center Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Create New Repair Center</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Repair Center Name"
										placeholder="e.g., Sapphire Repair Center Lagos"
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
										value={formData.phoneNumber}
										onValueChange={(value) =>
											setFormData({ ...formData, phoneNumber: value })
										}
										isRequired
									/>
									<Select
										label="State"
										placeholder="Select state"
										selectedKeys={formData.state ? [formData.state] : []}
										onSelectionChange={(keys) =>
											setFormData({
												...formData,
												state: Array.from(keys)[0] as string,
											})
										}
										isRequired
									>
										<SelectItem key="Lagos" value="Lagos">
											Lagos
										</SelectItem>
										<SelectItem key="FCT" value="FCT">
											FCT (Abuja)
										</SelectItem>
										<SelectItem key="Kano" value="Kano">
											Kano
										</SelectItem>
										<SelectItem key="Rivers" value="Rivers">
											Rivers
										</SelectItem>
									</Select>
									<Input
										label="LGA"
										placeholder="e.g., Eti-Osa"
										value={formData.lga}
										onValueChange={(value) =>
											setFormData({ ...formData, lga: value })
										}
										isRequired
									/>
								</div>
								<Input
									label="Address"
									placeholder="e.g., Plot 15, Admiralty Way, Lekki Phase 1"
									value={formData.address}
									onValueChange={(value) =>
										setFormData({ ...formData, address: value })
									}
									isRequired
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onCreateModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleCreateRepairCenter}
									isLoading={isCreating}
								>
									Create Repair Center
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
