"use client";

import React, { useState, useMemo } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
	Select,
	SelectItem,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Textarea,
	Avatar,
	Badge,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	ArrowLeft,
	Plus,
	Eye,
	Edit,
	Trash2,
	Power,
	PowerOff,
	EllipsisVertical,
	Users,
	MapPin,
	Phone,
	Mail,
	Calendar,
	CreditCard,
	Wrench,
	Star,
	TrendingUp,
	Shield,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { showToast } from "@/lib";

interface Engineer {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	avatar?: string;
	role: "Engineer" | "Senior Engineer" | "Lead Engineer";
	specialization: string;
	totalRepairs: number;
	monthlyRepairs: number;
	rating: number;
	status: "active" | "inactive" | "suspended";
	joinedDate: string;
	lastActiveDate: string;
}

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
	monthlyRepairs: number;
	averageRating: number;
	status: "active" | "inactive" | "suspended";
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
	bankDetails?: {
		accountName: string;
		accountNumber: string;
		bankName: string;
	};
}

const engineerColumns: ColumnDef[] = [
	{ name: "Engineer", uid: "engineer", sortable: true },
	{ name: "Role", uid: "role", sortable: true },
	{ name: "Contact", uid: "contact", sortable: true },
	{ name: "Specialization", uid: "specialization", sortable: true },
	{ name: "Total Repairs", uid: "totalRepairs", sortable: true },
	{ name: "Monthly Repairs", uid: "monthlyRepairs", sortable: true },
	{ name: "Rating", uid: "rating", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "danger" as const,
	suspended: "warning" as const,
};

interface RepairStoreSingleServiceCenterViewProps {
	centerId?: string;
}

export default function RepairStoreSingleServiceCenterView({
	centerId,
}: RepairStoreSingleServiceCenterViewProps = {}) {
	const router = useRouter();
	const params = useParams();
	const serviceCenterId = centerId || (params.id as string);

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
	const [engineerFormData, setEngineerFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phoneNumber: "",
		role: "Engineer" as "Engineer" | "Senior Engineer" | "Lead Engineer",
		specialization: "",
	});

	const [centerFormData, setCenterFormData] = useState({
		name: "",
		address: "",
		phoneNumber: "",
		email: "",
		accountName: "",
		accountNumber: "",
		bankName: "",
	});

	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Filter states
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// Mock data
	const serviceCenter: ServiceCenter = useMemo(
		() => ({
			id: serviceCenterId,
			name: "Sapphire Tech Hub Lagos",
			address: "123 Allen Avenue, Ikeja, Lagos State",
			state: "Lagos",
			lga: "Ikeja",
			phoneNumber: "+234 801 234 5678",
			email: "lagos@sapphiretech.com",
			engineersCount: 8,
			totalRepairs: 1245,
			monthlyRevenue: 2850000,
			monthlyRepairs: 156,
			averageRating: 4.7,
			status: "active",
			createdBy: "admin@sapphire.com",
			createdAt: "2024-01-15T10:30:00Z",
			lastUpdatedAt: "2024-10-01T14:20:00Z",
			bankDetails: {
				accountName: "Sapphire Tech Hub Lagos",
				accountNumber: "0123456789",
				bankName: "First Bank of Nigeria",
			},
		}),
		[serviceCenterId]
	);

	const engineers: Engineer[] = useMemo(
		() => [
			{
				id: "eng_001",
				firstName: "John",
				lastName: "Adebayo",
				email: "john.adebayo@sapphiretech.com",
				phoneNumber: "+234 801 111 2222",
				avatar: "",
				role: "Lead Engineer",
				specialization: "Mobile Repairs",
				totalRepairs: 420,
				monthlyRepairs: 32,
				rating: 4.8,
				status: "active",
				joinedDate: "2024-01-20T09:00:00Z",
				lastActiveDate: "2024-10-15T16:30:00Z",
			},
			{
				id: "eng_002",
				firstName: "Sarah",
				lastName: "Ibrahim",
				email: "sarah.ibrahim@sapphiretech.com",
				phoneNumber: "+234 802 333 4444",
				avatar: "",
				role: "Senior Engineer",
				specialization: "Samsung Devices",
				totalRepairs: 315,
				monthlyRepairs: 28,
				rating: 4.6,
				status: "active",
				joinedDate: "2024-02-10T10:15:00Z",
				lastActiveDate: "2024-10-15T15:45:00Z",
			},
			{
				id: "eng_003",
				firstName: "Michael",
				lastName: "Okafor",
				email: "michael.okafor@sapphiretech.com",
				phoneNumber: "+234 803 555 6666",
				avatar: "",
				role: "Engineer",
				specialization: "Screen Repairs",
				totalRepairs: 256,
				monthlyRepairs: 24,
				rating: 4.4,
				status: "active",
				joinedDate: "2024-03-05T11:30:00Z",
				lastActiveDate: "2024-10-14T17:20:00Z",
			},
			{
				id: "eng_004",
				firstName: "Fatima",
				lastName: "Yusuf",
				email: "fatima.yusuf@sapphiretech.com",
				phoneNumber: "+234 804 777 8888",
				avatar: "",
				role: "Engineer",
				specialization: "Battery & Charging",
				totalRepairs: 189,
				monthlyRepairs: 18,
				rating: 4.3,
				status: "suspended",
				joinedDate: "2024-04-12T14:00:00Z",
				lastActiveDate: "2024-10-10T12:15:00Z",
			},
		],
		[]
	);

	// Initialize edit form data when modal opens
	React.useEffect(() => {
		if (isEditModalOpen) {
			setCenterFormData({
				name: serviceCenter.name,
				address: serviceCenter.address,
				phoneNumber: serviceCenter.phoneNumber,
				email: serviceCenter.email,
				accountName: serviceCenter.bankDetails?.accountName || "",
				accountNumber: serviceCenter.bankDetails?.accountNumber || "",
				bankName: serviceCenter.bankDetails?.bankName || "",
			});
		}
	}, [isEditModalOpen, serviceCenter]);

	const handleCreateEngineer = async () => {
		const { firstName, lastName, email, phoneNumber, role, specialization } =
			engineerFormData;

		if (!firstName || !lastName || !email || !phoneNumber || !specialization) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsCreating(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: "Engineer created successfully",
				type: "success",
			});
			setEngineerFormData({
				firstName: "",
				lastName: "",
				email: "",
				phoneNumber: "",
				role: "Engineer",
				specialization: "",
			});
			onCreateModalClose();
		} catch (error) {
			showToast({ message: "Failed to create engineer", type: "error" });
		} finally {
			setIsCreating(false);
		}
	};

	const handleUpdateServiceCenter = async () => {
		const { name, address, phoneNumber, email } = centerFormData;

		if (!name || !address || !phoneNumber || !email) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsUpdating(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: "Service center updated successfully",
				type: "success",
			});
			onEditModalClose();
		} catch (error) {
			showToast({ message: "Failed to update service center", type: "error" });
		} finally {
			setIsUpdating(false);
		}
	};

	const handleToggleEngineerStatus = async (
		engineerId: string,
		currentStatus: string
	) => {
		const newStatus = currentStatus === "active" ? "suspended" : "active";
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({
				message: `Engineer status updated to ${newStatus}`,
				type: "success",
			});
		} catch (error) {
			showToast({ message: "Failed to update engineer status", type: "error" });
		}
	};

	const handleDeleteEngineer = async (engineerId: string) => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({
				message: "Engineer removed successfully",
				type: "success",
			});
		} catch (error) {
			showToast({ message: "Failed to remove engineer", type: "error" });
		}
	};

	// Selection handler
	const handleSelectionChange = (keys: any) => {
		if (keys === "all") {
			if (selectedKeys.size === engineers.length) {
				setSelectedKeys(new Set());
			} else {
				setSelectedKeys(new Set(engineers.map((item) => item.id)));
			}
		} else {
			setSelectedKeys(new Set(Array.from(keys)));
		}
	};

	// Bulk actions
	const handleBulkActivate = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} engineers activated successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to activate engineers", type: "error" });
		}
	};

	const handleBulkSuspend = async () => {
		if (selectedKeys.size === 0) return;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} engineers suspended successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to suspend engineers", type: "error" });
		}
	};

	// Export function
	const exportFn = async (data: Engineer[]) => {
		console.log("Exporting engineers:", data);
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
	const renderCell = (row: Engineer, key: string) => {
		switch (key) {
			case "engineer":
				return (
					<div className="flex items-center gap-3">
						<Avatar
							name={`${row.firstName} ${row.lastName}`}
							size="sm"
							src={row.avatar}
							className="flex-shrink-0"
						/>
						<div className="flex flex-col">
							<p className="text-bold text-sm">
								{row.firstName} {row.lastName}
							</p>
							<p className="text-bold text-xs text-default-400">ID: {row.id}</p>
						</div>
					</div>
				);
			case "role":
				return (
					<Chip
						color={
							row.role === "Lead Engineer"
								? "success"
								: row.role === "Senior Engineer"
								? "warning"
								: "default"
						}
						variant="flat"
						size="sm"
						className="capitalize"
					>
						{row.role}
					</Chip>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.phoneNumber}</p>
						<p className="text-xs text-default-400">{row.email}</p>
					</div>
				);
			case "specialization":
				return <p className="text-sm">{row.specialization}</p>;
			case "totalRepairs":
				return <p className="text-sm font-medium">{row.totalRepairs}</p>;
			case "monthlyRepairs":
				return <p className="text-sm font-medium">{row.monthlyRepairs}</p>;
			case "rating":
				return (
					<div className="flex items-center gap-1">
						<Star className="w-4 h-4 text-yellow-500 fill-current" />
						<p className="text-sm font-medium">{row.rating}</p>
					</div>
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
								<DropdownItem key="view" startContent={<Eye size={16} />}>
									View Profile
								</DropdownItem>
								<DropdownItem key="edit" startContent={<Edit size={16} />}>
									Edit Engineer
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
									onPress={() => handleToggleEngineerStatus(row.id, row.status)}
								>
									Change Status
								</DropdownItem>
								<DropdownItem
									key="delete"
									className="text-danger"
									color="danger"
									startContent={<Trash2 size={16} />}
									onPress={() => handleDeleteEngineer(row.id)}
								>
									Remove Engineer
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

	const engineerRoles = [
		{ label: "Engineer", value: "Engineer" },
		{ label: "Senior Engineer", value: "Senior Engineer" },
		{ label: "Lead Engineer", value: "Lead Engineer" },
	];

	const specializations = [
		"Mobile Repairs",
		"Samsung Devices",
		"Screen Repairs",
		"Battery & Charging",
		"Water Damage",
		"Software Issues",
		"Hardware Diagnostics",
		"Camera Repairs",
		"Audio Issues",
	];

	const banks = [
		"Access Bank",
		"First Bank of Nigeria",
		"Guaranty Trust Bank",
		"United Bank for Africa",
		"Zenith Bank",
		"Fidelity Bank",
		"Sterling Bank",
		"Union Bank",
		"Polaris Bank",
		"Wema Bank",
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="light"
						startContent={<ArrowLeft size={16} />}
						onPress={() => router.back()}
					>
						Back to Service Centers
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold text-gray-900">
								{serviceCenter.name}
							</h1>
							<Chip
								color={statusColorMap[serviceCenter.status]}
								size="sm"
								variant="flat"
								className="capitalize"
							>
								{serviceCenter.status}
							</Chip>
						</div>
						<p className="text-gray-600">
							Manage engineers and monitor service center performance
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="flat"
						startContent={<Edit size={16} />}
						onPress={onEditModalOpen}
					>
						Edit Center
					</Button>
				</div>
			</div>

			{/* Service Center Info Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Service Center Information</h2>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<MapPin className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Location</p>
								<p className="font-medium">{serviceCenter.address}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-100 rounded-lg">
								<Phone className="w-5 h-5 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Phone</p>
								<p className="font-medium">{serviceCenter.phoneNumber}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Mail className="w-5 h-5 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Email</p>
								<p className="font-medium">{serviceCenter.email}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="p-2 bg-orange-100 rounded-lg">
								<Calendar className="w-5 h-5 text-orange-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Created</p>
								<p className="font-medium">
									{new Date(serviceCenter.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					{serviceCenter.bankDetails && (
						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<h3 className="font-medium mb-3 flex items-center gap-2">
								<Shield className="w-4 h-4" />
								Bank Details
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div>
									<p className="text-gray-600">Account Name</p>
									<p className="font-medium">
										{serviceCenter.bankDetails.accountName}
									</p>
								</div>
								<div>
									<p className="text-gray-600">Account Number</p>
									<p className="font-medium">
										{serviceCenter.bankDetails.accountNumber}
									</p>
								</div>
								<div>
									<p className="text-gray-600">Bank Name</p>
									<p className="font-medium">
										{serviceCenter.bankDetails.bankName}
									</p>
								</div>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<StatCard
					title="Total Engineers"
					value={serviceCenter.engineersCount.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Repairs"
					value={serviceCenter.totalRepairs.toString()}
					icon={<Wrench className="w-5 h-5" />}
				/>
				<StatCard
					title="Monthly Repairs"
					value={serviceCenter.monthlyRepairs.toString()}
					icon={<TrendingUp className="w-5 h-5" />}
				/>
				<StatCard
					title="Average Rating"
					value={serviceCenter.averageRating.toString()}
					icon={<Star className="w-5 h-5" />}
				/>
				<StatCard
					title="Monthly Revenue"
					value={formatCurrency(serviceCenter.monthlyRevenue)}
					icon={<CreditCard className="w-5 h-5" />}
				/>
			</div>

			{/* Engineers Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Engineers</h2>
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
							Add Engineer
						</Button>
					</div>
				</div>

				<GenericTable<Engineer>
					columns={engineerColumns}
					data={engineers}
					allCount={engineers.length}
					exportData={engineers}
					isLoading={false}
					filterValue={filterValue}
					onFilterChange={setFilterValue}
					statusOptions={statusOptions}
					statusFilter={statusFilter}
					onStatusChange={setStatusFilter}
					statusColorMap={statusColorMap}
					showStatus={true}
					sortDescriptor={{ column: "joinedDate", direction: "descending" }}
					onSortChange={() => {}}
					page={1}
					pages={1}
					onPageChange={() => {}}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={engineers.length === 0}
					searchPlaceholder="Search engineers by name, email, or specialization..."
					selectedKeys={selectedKeys}
					onSelectionChange={handleSelectionChange}
					selectionMode="multiple"
					showRowsPerPageSelector={true}
				/>
			</div>

			{/* Create Engineer Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Add New Engineer</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="First Name"
										placeholder="Enter first name"
										value={engineerFormData.firstName}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({
												...prev,
												firstName: value,
											}))
										}
										isRequired
									/>
									<Input
										label="Last Name"
										placeholder="Enter last name"
										value={engineerFormData.lastName}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({
												...prev,
												lastName: value,
											}))
										}
										isRequired
									/>
									<Input
										label="Email Address"
										type="email"
										placeholder="engineer@sapphiretech.com"
										value={engineerFormData.email}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({
												...prev,
												email: value,
											}))
										}
										isRequired
									/>
									<Input
										label="Phone Number"
										placeholder="+234 801 234 5678"
										value={engineerFormData.phoneNumber}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({
												...prev,
												phoneNumber: value,
											}))
										}
										isRequired
									/>
									<Select
										label="Role"
										placeholder="Select engineer role"
										selectedKeys={
											engineerFormData.role ? [engineerFormData.role] : []
										}
										onSelectionChange={(keys) => {
											const selectedRole = Array.from(keys)[0] as
												| "Engineer"
												| "Senior Engineer"
												| "Lead Engineer";
											setEngineerFormData((prev) => ({
												...prev,
												role: selectedRole,
											}));
										}}
										isRequired
									>
										{engineerRoles.map((role) => (
											<SelectItem key={role.value} value={role.value}>
												{role.label}
											</SelectItem>
										))}
									</Select>
									<Select
										label="Specialization"
										placeholder="Select specialization"
										selectedKeys={
											engineerFormData.specialization
												? [engineerFormData.specialization]
												: []
										}
										onSelectionChange={(keys) => {
											const selectedSpec = Array.from(keys)[0] as string;
											setEngineerFormData((prev) => ({
												...prev,
												specialization: selectedSpec,
											}));
										}}
										isRequired
									>
										{specializations.map((spec) => (
											<SelectItem key={spec} value={spec}>
												{spec}
											</SelectItem>
										))}
									</Select>
								</div>
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
									onPress={handleCreateEngineer}
									isLoading={isCreating}
									isDisabled={
										!engineerFormData.firstName ||
										!engineerFormData.lastName ||
										!engineerFormData.email ||
										!engineerFormData.phoneNumber ||
										!engineerFormData.specialization
									}
								>
									{isCreating ? "Creating..." : "Add Engineer"}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Edit Service Center Modal */}
			<Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="3xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Service Center</ModalHeader>
							<ModalBody>
								<div className="space-y-6">
									{/* Basic Information */}
									<div>
										<h3 className="text-lg font-medium mb-4">
											Basic Information
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<Input
												label="Service Center Name"
												placeholder="Enter service center name"
												value={centerFormData.name}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														name: value,
													}))
												}
												isRequired
											/>
											<Input
												label="Phone Number"
												placeholder="+234 801 234 5678"
												value={centerFormData.phoneNumber}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														phoneNumber: value,
													}))
												}
												isRequired
											/>
											<Input
												label="Email Address"
												type="email"
												placeholder="center@sapphiretech.com"
												value={centerFormData.email}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														email: value,
													}))
												}
												isRequired
											/>
											<Textarea
												label="Address"
												placeholder="Enter full address"
												value={centerFormData.address}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														address: value,
													}))
												}
												isRequired
											/>
										</div>
									</div>

									{/* Bank Details */}
									<div>
										<h3 className="text-lg font-medium mb-4">Bank Details</h3>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<Input
												label="Account Name"
												placeholder="Enter account name"
												value={centerFormData.accountName}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														accountName: value,
													}))
												}
											/>
											<Input
												label="Account Number"
												placeholder="Enter account number"
												value={centerFormData.accountNumber}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														accountNumber: value,
													}))
												}
											/>
											<Select
												label="Bank Name"
												placeholder="Select bank"
												selectedKeys={
													centerFormData.bankName
														? [centerFormData.bankName]
														: []
												}
												onSelectionChange={(keys) => {
													const selectedBank = Array.from(keys)[0] as string;
													setCenterFormData((prev) => ({
														...prev,
														bankName: selectedBank,
													}));
												}}
											>
												{banks.map((bank) => (
													<SelectItem key={bank} value={bank}>
														{bank}
													</SelectItem>
												))}
											</Select>
										</div>
									</div>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color="danger"
									variant="light"
									onPress={onEditModalClose}
								>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleUpdateServiceCenter}
									isLoading={isUpdating}
									isDisabled={
										!centerFormData.name ||
										!centerFormData.address ||
										!centerFormData.phoneNumber ||
										!centerFormData.email
									}
								>
									{isUpdating ? "Updating..." : "Update Service Center"}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
