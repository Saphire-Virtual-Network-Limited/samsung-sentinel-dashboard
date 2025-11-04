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
	Select,
	SelectItem,
	Chip,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Tabs,
	Tab,
} from "@heroui/react";
import {
	InfoCard,
	InfoField,
	StatusChip,
	LoadingSpinner,
	NotFound,
} from "@/components/reususables/custom-ui";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	ArrowLeft,
	Plus,
	Edit,
	Trash2,
	Power,
	PowerOff,
	EllipsisVertical,
	Users,
	DollarSign,
	CreditCard,
	MapPin,
	Phone,
	Mail,
	Calendar,
	Wrench,
	TrendingUp,
	UserCheck,
	UserX,
	Building2,
	Eye,
} from "lucide-react";
import { useParams, useRouter, usePathname } from "next/navigation";
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
	serviceCenters: ServiceCenter[];
}

interface ServiceCenter {
	id: string;
	name: string;
	address: string;
	phoneNumber: string;
	email: string;
	engineersCount: number;
	totalRepairs: number;
	monthlyRevenue: number;
	status: "active" | "inactive" | "suspended";
	createdAt: string;
}

const serviceCenterColumns: ColumnDef[] = [
	{ name: "Service Center", uid: "name", sortable: true },
	{ name: "Location", uid: "address", sortable: true },
	{ name: "Engineers", uid: "engineersCount", sortable: true },
	{ name: "Total Repairs", uid: "totalRepairs", sortable: true },
	{ name: "Revenue", uid: "monthlyRevenue", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "default" as const,
	suspended: "danger" as const,
};

interface AdminRepairCenterDetailViewProps {
	repairCenterId: string;
}

export default function AdminRepairCenterDetailView({
	repairCenterId,
}: AdminRepairCenterDetailViewProps) {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// Modal states
	const {
		isOpen: isEditModalOpen,
		onOpen: onEditModalOpen,
		onClose: onEditModalClose,
	} = useDisclosure();
	const {
		isOpen: isAddServiceCenterModalOpen,
		onOpen: onAddServiceCenterModalOpen,
		onClose: onAddServiceCenterModalClose,
	} = useDisclosure();

	// Form states
	const [centerFormData, setCenterFormData] = useState({
		name: "",
		address: "",
		state: "",
		lga: "",
		phoneNumber: "",
		email: "",
	});
	const [serviceCenterFormData, setServiceCenterFormData] = useState({
		name: "",
		address: "",
		phoneNumber: "",
		email: "",
	});

	const [isLoading, setIsLoading] = useState(false);

	// Mock data - replace with actual API call
	const repairCenter: RepairCenter = useMemo(
		() => ({
			id: repairCenterId,
			name: "Sapphire Repair Center Lagos",
			address: "Plot 15, Admiralty Way, Lekki Phase 1",
			state: "Lagos",
			lga: "Eti-Osa",
			phoneNumber: "+234-903-123-4567",
			email: "lagos@sapphire-repair.com",
			serviceCentersCount: 12,
			totalRepairs: 2450,
			monthlyRevenue: 15750000,
			status: "active",
			createdBy: "admin@sapphire.com",
			createdAt: "2024-01-15T10:30:00Z",
			lastUpdatedAt: "2024-12-20T14:45:00Z",
			serviceCenters: [
				{
					id: "sc_001",
					name: "Sapphire Service Center Ikeja",
					address: "45, Obafemi Awolowo Way, Ikeja",
					phoneNumber: "+234-903-111-1111",
					email: "ikeja@sapphire.com",
					engineersCount: 8,
					totalRepairs: 450,
					monthlyRevenue: 2750000,
					status: "active",
					createdAt: "2024-01-20T09:00:00Z",
				},
				{
					id: "sc_002",
					name: "Sapphire Service Center Victoria Island",
					address: "Plot 12, Tiamiyu Savage Street, VI",
					phoneNumber: "+234-903-222-2222",
					email: "vi@sapphire.com",
					engineersCount: 12,
					totalRepairs: 680,
					monthlyRevenue: 4200000,
					status: "active",
					createdAt: "2024-02-05T11:30:00Z",
				},
				{
					id: "sc_003",
					name: "Sapphire Service Center Lekki",
					address: "Shop 15, Palms Shopping Mall, Lekki",
					phoneNumber: "+234-903-333-3333",
					email: "lekki@sapphire.com",
					engineersCount: 6,
					totalRepairs: 320,
					monthlyRevenue: 1800000,
					status: "suspended",
					createdAt: "2024-03-10T14:15:00Z",
				},
			],
		}),
		[repairCenterId]
	);

	// Statistics
	const stats = useMemo(
		() => ({
			totalServiceCenters: repairCenter.serviceCenters.length,
			activeServiceCenters: repairCenter.serviceCenters.filter(
				(sc) => sc.status === "active"
			).length,
			totalEngineers: repairCenter.serviceCenters.reduce(
				(sum, sc) => sum + sc.engineersCount,
				0
			),
			avgRepairsPerCenter: Math.round(
				repairCenter.totalRepairs / repairCenter.serviceCenters.length
			),
		}),
		[repairCenter]
	);

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Handle edit repair center
	const handleEditRepairCenter = async () => {
		if (!centerFormData.name.trim() || !centerFormData.address.trim()) {
			showToast({ message: "Please fill in required fields", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			// API call to update repair center
			showToast({
				message: "Repair center updated successfully",
				type: "success",
			});
			onEditModalClose();
		} catch (error) {
			showToast({ message: "Failed to update repair center", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle add service center
	const handleAddServiceCenter = async () => {
		if (
			!serviceCenterFormData.name.trim() ||
			!serviceCenterFormData.address.trim()
		) {
			showToast({ message: "Please fill in required fields", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			// API call to add service center
			showToast({
				message: "Service center added successfully",
				type: "success",
			});
			onAddServiceCenterModalClose();
			setServiceCenterFormData({
				name: "",
				address: "",
				phoneNumber: "",
				email: "",
			});
		} catch (error) {
			showToast({ message: "Failed to add service center", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle toggle repair center status
	const handleToggleRepairCenterStatus = async () => {
		setIsLoading(true);
		try {
			// API call to toggle repair center status
			showToast({
				message: `Repair center ${
					repairCenter.status === "active" ? "suspended" : "activated"
				} successfully`,
				type: "success",
			});
		} catch (error) {
			showToast({
				message: "Failed to update repair center status",
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Render service center cell content
	const renderServiceCenterCell = (
		item: ServiceCenter,
		columnKey: React.Key
	) => {
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
			case "address":
				return <span className="text-sm">{item.address}</span>;
			case "engineersCount":
				return (
					<div className="flex items-center gap-2">
						<Users size={16} className="text-default-400" />
						<span className="text-sm">{item.engineersCount}</span>
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
											`/access/${role}/samsung-sentinel/service-centers/${item.id}`
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
									Edit Service Center
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
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <span>{String(item[columnKey as keyof ServiceCenter])}</span>;
		}
	};

	// Initialize form data when modal opens
	React.useEffect(() => {
		if (isEditModalOpen) {
			setCenterFormData({
				name: repairCenter.name,
				address: repairCenter.address,
				state: repairCenter.state,
				lga: repairCenter.lga,
				phoneNumber: repairCenter.phoneNumber,
				email: repairCenter.email,
			});
		}
	}, [isEditModalOpen, repairCenter]);

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						isIconOnly
						variant="light"
						onPress={() => router.push(`/access/${role}/repair-centers`)}
					>
						<ArrowLeft size={20} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{repairCenter.name}</h1>
						<p className="text-default-500">
							Repair center details and service locations
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Button
						color="secondary"
						variant="flat"
						startContent={<Edit size={16} />}
						onPress={() => {
							onEditModalOpen();
						}}
					>
						Edit Details
					</Button>
					<Button
						color={repairCenter.status === "active" ? "danger" : "success"}
						variant="flat"
						startContent={
							repairCenter.status === "active" ? (
								<PowerOff size={16} />
							) : (
								<Power size={16} />
							)
						}
						onPress={handleToggleRepairCenterStatus}
						isLoading={isLoading}
					>
						{repairCenter.status === "active" ? "Suspend" : "Activate"}
					</Button>
				</div>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Service Centers"
					value={stats.totalServiceCenters.toString()}
					icon={<Building2 className="w-5 h-5" />}
				/>
				<StatCard
					title="Active Centers"
					value={stats.activeServiceCenters.toString()}
					icon={<Power className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Engineers"
					value={stats.totalEngineers.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
				<StatCard
					title="Avg Repairs/Center"
					value={stats.avgRepairsPerCenter.toString()}
					icon={<TrendingUp className="w-5 h-5" />}
				/>
			</div>

			{/* Content Tabs */}
			<Tabs aria-label="Repair center details" defaultSelectedKey="details">
				<Tab key="details" title="Center Details">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Basic Information */}
						<Card>
							<CardHeader className="pb-3">
								<h3 className="text-lg font-semibold">Basic Information</h3>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-4">
									<InfoField label="Center Name" value={repairCenter.name} />
									<InfoField label="Address" value={repairCenter.address} />
									<InfoField
										label="Location"
										value={`${repairCenter.state}, ${repairCenter.lga}`}
									/>
									<InfoField label="Phone" value={repairCenter.phoneNumber} />
									<InfoField label="Email" value={repairCenter.email} />
								</div>
							</CardBody>
						</Card>

						{/* Status & Performance */}
						<Card>
							<CardHeader className="pb-3">
								<h3 className="text-lg font-semibold">Status & Performance</h3>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-4">
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">Status</div>
										<StatusChip status={repairCenter.status} />
									</div>
									<InfoField
										label="Service Centers"
										value={repairCenter.serviceCentersCount.toString()}
									/>
									<InfoField
										label="Total Repairs"
										value={repairCenter.totalRepairs.toLocaleString()}
									/>
									<InfoField
										label="Monthly Revenue"
										value={formatCurrency(repairCenter.monthlyRevenue)}
									/>
									<InfoField
										label="Created"
										value={new Date(
											repairCenter.createdAt
										).toLocaleDateString()}
									/>
								</div>
							</CardBody>
						</Card>
					</div>
				</Tab>

				<Tab key="service-centers" title="Service Centers">
					<div className="space-y-6">
						{/* Service Centers Header */}
						<div className="flex justify-between items-center">
							<div>
								<h3 className="text-lg font-semibold">Service Centers</h3>
								<p className="text-default-500">
									Manage service centers under this repair center
								</p>
							</div>
							<Button
								color="primary"
								startContent={<Plus size={16} />}
								onPress={onAddServiceCenterModalOpen}
							>
								Add Service Center
							</Button>
						</div>

						{/* Service Centers Table */}
						<GenericTable<ServiceCenter>
							columns={serviceCenterColumns}
							data={repairCenter.serviceCenters}
							allCount={repairCenter.serviceCenters.length}
							exportData={repairCenter.serviceCenters}
							isLoading={false}
							filterValue=""
							onFilterChange={() => {}}
							statusOptions={[
								{ name: "Active", uid: "active" },
								{ name: "Inactive", uid: "inactive" },
								{ name: "Suspended", uid: "suspended" },
							]}
							statusFilter={new Set()}
							onStatusChange={() => {}}
							statusColorMap={statusColorMap}
							showStatus={true}
							sortDescriptor={{ column: "name", direction: "ascending" }}
							onSortChange={() => {}}
							page={1}
							pages={1}
							onPageChange={() => {}}
							exportFn={() => {}}
							renderCell={renderServiceCenterCell}
							hasNoRecords={repairCenter.serviceCenters.length === 0}
							searchPlaceholder="Search service centers..."
							showRowsPerPageSelector={true}
						/>
					</div>
				</Tab>
			</Tabs>

			{/* Edit Repair Center Modal */}
			<Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Repair Center</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Center Name"
										value={centerFormData.name}
										onValueChange={(value) =>
											setCenterFormData({ ...centerFormData, name: value })
										}
										isRequired
									/>
									<Input
										label="Email Address"
										value={centerFormData.email}
										onValueChange={(value) =>
											setCenterFormData({ ...centerFormData, email: value })
										}
										isRequired
									/>
									<Input
										label="Phone Number"
										value={centerFormData.phoneNumber}
										onValueChange={(value) =>
											setCenterFormData({
												...centerFormData,
												phoneNumber: value,
											})
										}
										isRequired
									/>
									<Select
										label="State"
										selectedKeys={
											centerFormData.state ? [centerFormData.state] : []
										}
										onSelectionChange={(keys) =>
											setCenterFormData({
												...centerFormData,
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
										value={centerFormData.lga}
										onValueChange={(value) =>
											setCenterFormData({ ...centerFormData, lga: value })
										}
										isRequired
									/>
								</div>
								<Input
									label="Address"
									value={centerFormData.address}
									onValueChange={(value) =>
										setCenterFormData({ ...centerFormData, address: value })
									}
									isRequired
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditRepairCenter}
									isLoading={isLoading}
								>
									Update Repair Center
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Add Service Center Modal */}
			<Modal
				isOpen={isAddServiceCenterModalOpen}
				onClose={onAddServiceCenterModalClose}
				size="2xl"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Add Service Center</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Service Center Name"
										placeholder="e.g., Sapphire Service Center Ikeja"
										value={serviceCenterFormData.name}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												name: value,
											})
										}
										isRequired
									/>
									<Input
										label="Email Address"
										placeholder="e.g., ikeja@sapphire.com"
										value={serviceCenterFormData.email}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												email: value,
											})
										}
										isRequired
									/>
									<Input
										label="Phone Number"
										placeholder="e.g., +234-903-111-1111"
										value={serviceCenterFormData.phoneNumber}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												phoneNumber: value,
											})
										}
										isRequired
									/>
								</div>
								<Input
									label="Address"
									placeholder="e.g., 45, Obafemi Awolowo Way, Ikeja"
									value={serviceCenterFormData.address}
									onValueChange={(value) =>
										setServiceCenterFormData({
											...serviceCenterFormData,
											address: value,
										})
									}
									isRequired
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onAddServiceCenterModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleAddServiceCenter}
									isLoading={isLoading}
								>
									Add Service Center
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
