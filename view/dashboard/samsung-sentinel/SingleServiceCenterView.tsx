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
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";

interface Engineer {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	specialization: string;
	status: "active" | "suspended" | "inactive";
	createdBy: string;
	createdAt: string;
	totalRepairs: number;
	monthlyRepairs: number;
}

interface ServiceCenter {
	id: string;
	name: string;
	address: string;
	state: string;
	lga: string;
	city: string;
	phoneNumber: string;
	email: string;
	bankName: string;
	accountName: string;
	accountNumber: string;
	engineersCount: number;
	totalRepairs: number;
	monthlyRevenue: number;
	totalPaidOut: number;
	pendingPayouts: number;
	status: "active" | "inactive" | "suspended";
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
	engineers: Engineer[];
}

interface Transaction {
	id: string;
	claimId: string;
	customerName: string;
	imei: string;
	amountPaidOut: number;
	transactionReference: string;
	processedAt: string;
	status: "completed" | "pending" | "failed";
}

const engineerColumns: ColumnDef[] = [
	{ name: "Engineer", uid: "name", sortable: true },
	{ name: "Contact", uid: "contact", sortable: true },
	{ name: "Specialization", uid: "specialization", sortable: true },
	{ name: "Total Repairs", uid: "totalRepairs", sortable: true },
	{ name: "Monthly Repairs", uid: "monthlyRepairs", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const transactionColumns: ColumnDef[] = [
	{ name: "Claim ID", uid: "claimId", sortable: true },
	{ name: "Customer", uid: "customerName", sortable: true },
	{ name: "IMEI", uid: "imei", sortable: true },
	{ name: "Amount", uid: "amountPaidOut", sortable: true },
	{ name: "Reference", uid: "transactionReference", sortable: true },
	{ name: "Processed At", uid: "processedAt", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "danger" as const,
	suspended: "warning" as const,
};

const transactionStatusColorMap = {
	completed: "success" as const,
	pending: "warning" as const,
	failed: "danger" as const,
};

const specializations = [
	{ label: "Screen Repair", value: "screen" },
	{ label: "Battery Replacement", value: "battery" },
	{ label: "Camera Repair", value: "camera" },
	{ label: "Software Issues", value: "software" },
	{ label: "General Repair", value: "general" },
];

const nigerianStates = [
	{ label: "Lagos", value: "lagos" },
	{ label: "Abuja", value: "abuja" },
	{ label: "Kano", value: "kano" },
	{ label: "Rivers", value: "rivers" },
	{ label: "Oyo", value: "oyo" },
	// Add more states as needed
];

interface SingleServiceCenterViewProps {
	serviceCenterId: string;
}

export default function SingleServiceCenterView({
	serviceCenterId,
}: SingleServiceCenterViewProps) {
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
		isOpen: isEditBankModalOpen,
		onOpen: onEditBankModalOpen,
		onClose: onEditBankModalClose,
	} = useDisclosure();
	const {
		isOpen: isAddEngineerModalOpen,
		onOpen: onAddEngineerModalOpen,
		onClose: onAddEngineerModalClose,
	} = useDisclosure();

	// Form states
	const [centerFormData, setCenterFormData] = useState({
		name: "",
		address: "",
		state: "",
		city: "",
		phoneNumber: "",
		email: "",
	});
	const [bankFormData, setBankFormData] = useState({
		bankName: "",
		accountName: "",
		accountNumber: "",
	});
	const [engineerFormData, setEngineerFormData] = useState({
		name: "",
		email: "",
		phoneNumber: "",
		specialization: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	// Mock service center data - replace with actual API call
	const serviceCenter: ServiceCenter = useMemo(
		() => ({
			id: serviceCenterId,
			name: "TechFix Lagos Central",
			address: "123 Allen Avenue, Ikeja",
			state: "Lagos",
			lga: "Ikeja",
			city: "Lagos",
			phoneNumber: "+234 802 123 4567",
			email: "contact@techfixlagos.com",
			bankName: "First Bank of Nigeria",
			accountName: "TechFix Lagos Central",
			accountNumber: "2034567890",
			engineersCount: 8,
			totalRepairs: 2450,
			monthlyRevenue: 1250000,
			totalPaidOut: 15750000,
			pendingPayouts: 350000,
			status: "active",
			createdBy: "admin@sapphire.com",
			createdAt: "2024-01-10T08:00:00Z",
			lastUpdatedAt: "2024-09-28T16:30:00Z",
			engineers: [
				{
					id: "eng_001",
					name: "John Adebayo",
					email: "john.adebayo@techfixlagos.com",
					phoneNumber: "+234 803 123 4567",
					specialization: "screen",
					status: "active",
					createdBy: "admin@sapphire.com",
					createdAt: "2024-01-15T09:00:00Z",
					totalRepairs: 456,
					monthlyRepairs: 38,
				},
				{
					id: "eng_002",
					name: "Sarah Okafor",
					email: "sarah.okafor@techfixlagos.com",
					phoneNumber: "+234 804 123 4567",
					specialization: "battery",
					status: "active",
					createdBy: "admin@sapphire.com",
					createdAt: "2024-02-01T10:30:00Z",
					totalRepairs: 312,
					monthlyRepairs: 26,
				},
				{
					id: "eng_003",
					name: "Michael Ogundimu",
					email: "michael.ogundimu@techfixlagos.com",
					phoneNumber: "+234 805 123 4567",
					specialization: "camera",
					status: "suspended",
					createdBy: "subadmin@sapphire.com",
					createdAt: "2024-03-15T14:15:00Z",
					totalRepairs: 187,
					monthlyRepairs: 0,
				},
			],
		}),
		[serviceCenterId]
	);

	// Mock transaction history - replace with actual API call
	const transactions: Transaction[] = useMemo(
		() => [
			{
				id: "txn_001",
				claimId: "CLM_2024_001",
				customerName: "Adewale Johnson",
				imei: "123456789012345",
				amountPaidOut: 25000,
				transactionReference: "TXN_REF_001",
				processedAt: "2024-10-01T10:30:00Z",
				status: "completed",
			},
			{
				id: "txn_002",
				claimId: "CLM_2024_002",
				customerName: "Fatima Abubakar",
				imei: "234567890123456",
				amountPaidOut: 18000,
				transactionReference: "TXN_REF_002",
				processedAt: "2024-10-02T14:15:00Z",
				status: "completed",
			},
			{
				id: "txn_003",
				claimId: "CLM_2024_003",
				customerName: "Emeka Okonkwo",
				imei: "345678901234567",
				amountPaidOut: 32000,
				transactionReference: "TXN_REF_003",
				processedAt: "2024-10-03T09:45:00Z",
				status: "pending",
			},
		],
		[]
	);

	// Statistics
	const stats = useMemo(
		() => ({
			totalEngineers: serviceCenter.engineers.length,
			activeEngineers: serviceCenter.engineers.filter(
				(e) => e.status === "active"
			).length,
			monthlyRepairs: serviceCenter.engineers.reduce(
				(sum, e) => sum + e.monthlyRepairs,
				0
			),
			avgRepairsPerEngineer: Math.round(
				serviceCenter.totalRepairs / serviceCenter.engineers.length
			),
		}),
		[serviceCenter]
	);

	// Handle edit service center
	const handleEditServiceCenter = async () => {
		if (!centerFormData.name.trim() || !centerFormData.address.trim()) {
			showToast({ message: "Please fill in required fields", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			// API call to update service center
			showToast({
				message: "Service center updated successfully",
				type: "success",
			});
			onEditModalClose();
		} catch (error) {
			showToast({ message: "Failed to update service center", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle edit bank details
	const handleEditBankDetails = async () => {
		if (
			!bankFormData.bankName.trim() ||
			!bankFormData.accountName.trim() ||
			!bankFormData.accountNumber.trim()
		) {
			showToast({ message: "Please fill in all bank details", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			// API call to update bank details
			showToast({
				message: "Bank details updated successfully",
				type: "success",
			});
			onEditBankModalClose();
		} catch (error) {
			showToast({ message: "Failed to update bank details", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle add engineer
	const handleAddEngineer = async () => {
		if (
			!engineerFormData.name.trim() ||
			!engineerFormData.email.trim() ||
			!engineerFormData.phoneNumber.trim()
		) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsLoading(true);
		try {
			// API call to add engineer
			showToast({ message: "Engineer added successfully", type: "success" });
			onAddEngineerModalClose();
			setEngineerFormData({
				name: "",
				email: "",
				phoneNumber: "",
				specialization: "",
			});
		} catch (error) {
			showToast({ message: "Failed to add engineer", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle toggle service center status
	const handleToggleServiceCenterStatus = async () => {
		setIsLoading(true);
		try {
			// API call to toggle service center status
			showToast({
				message: `Service center ${
					serviceCenter.status === "active" ? "disabled" : "enabled"
				} successfully`,
				type: "success",
			});
		} catch (error) {
			showToast({
				message: "Failed to update service center status",
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle toggle engineer status
	const handleToggleEngineerStatus = async (
		engineerId: string,
		currentStatus: string
	) => {
		try {
			// API call to toggle engineer status
			const newStatus = currentStatus === "active" ? "suspended" : "active";
			showToast({
				message: `Engineer ${
					newStatus === "suspended" ? "suspended" : "activated"
				} successfully`,
				type: "success",
			});
		} catch (error) {
			showToast({ message: "Failed to update engineer status", type: "error" });
		}
	};

	// Render engineer cell
	const renderEngineerCell = (row: Engineer, key: string) => {
		switch (key) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{row.name}</p>
						<p className="text-xs text-default-400">ID: {row.id}</p>
					</div>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.email}</p>
						<p className="text-xs text-default-400">{row.phoneNumber}</p>
					</div>
				);
			case "specialization":
				const specializationLabel =
					specializations.find((s) => s.value === row.specialization)?.label ||
					row.specialization;
				return (
					<Chip color="primary" variant="flat" size="sm">
						{specializationLabel}
					</Chip>
				);
			case "totalRepairs":
			case "monthlyRepairs":
				return (
					<div className="flex items-center gap-1">
						<Wrench size={12} className="text-primary" />
						<span className="text-sm font-medium">{row[key]}</span>
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
			case "createdAt":
				return (
					<p className="text-sm">
						{new Date(row.createdAt).toLocaleDateString()}
					</p>
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
									key="toggle"
									startContent={
										row.status === "active" ? (
											<UserX size={16} />
										) : (
											<UserCheck size={16} />
										)
									}
									onPress={() => handleToggleEngineerStatus(row.id, row.status)}
								>
									{row.status === "active" ? "Suspend" : "Activate"}
								</DropdownItem>
								<DropdownItem
									key="delete"
									className="text-danger"
									color="danger"
									startContent={<Trash2 size={16} />}
								>
									Remove Engineer
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <span className="text-sm">{row[key as keyof Engineer]}</span>;
		}
	};

	// Render transaction cell
	const renderTransactionCell = (row: Transaction, key: string) => {
		switch (key) {
			case "claimId":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{row.claimId}</p>
						<p className="text-xs text-default-400">ID: {row.id}</p>
					</div>
				);
			case "amountPaidOut":
				return (
					<div className="flex items-center gap-1">
						<DollarSign size={12} className="text-success" />
						<span className="text-sm font-medium">
							₦{row.amountPaidOut.toLocaleString()}
						</span>
					</div>
				);
			case "processedAt":
				return (
					<p className="text-sm">
						{new Date(row.processedAt).toLocaleDateString()}
					</p>
				);
			case "status":
				return (
					<Chip
						color={transactionStatusColorMap[row.status]}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.status}
					</Chip>
				);
			default:
				return <span className="text-sm">{row[key as keyof Transaction]}</span>;
		}
	};

	if (!serviceCenter) {
		return <NotFound onGoBack={() => router.back()} />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button isIconOnly variant="light" onPress={() => router.back()}>
						<ArrowLeft size={20} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{serviceCenter.name}</h1>
						<p className="text-sm text-default-500">
							Service Center ID: {serviceCenter.id}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						color="warning"
						variant="flat"
						startContent={<Edit size={16} />}
						onPress={() => {
							setCenterFormData({
								name: serviceCenter.name,
								address: serviceCenter.address,
								state: serviceCenter.state,
								city: serviceCenter.city,
								phoneNumber: serviceCenter.phoneNumber,
								email: serviceCenter.email,
							});
							onEditModalOpen();
						}}
					>
						Edit Details
					</Button>
					<Button
						color={serviceCenter.status === "active" ? "danger" : "success"}
						variant="flat"
						startContent={
							serviceCenter.status === "active" ? (
								<PowerOff size={16} />
							) : (
								<Power size={16} />
							)
						}
						onPress={handleToggleServiceCenterStatus}
						isLoading={isLoading}
					>
						{serviceCenter.status === "active" ? "Disable" : "Enable"}
					</Button>
				</div>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Total Engineers"
					value={stats.totalEngineers.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
				<StatCard
					title="Active Engineers"
					value={stats.activeEngineers.toString()}
					icon={<UserCheck className="w-5 h-5" />}
				/>
				<StatCard
					title="Monthly Repairs"
					value={stats.monthlyRepairs.toString()}
					icon={<Wrench className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Paid Out"
					value={`₦${serviceCenter.totalPaidOut.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
			</div>

			{/* Service Center Info Card */}
			<InfoCard title="Service Center Information">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<InfoField label="Center Name" value={serviceCenter.name} />
					<InfoField
						label="Status"
						value={serviceCenter.status}
						endComponent={<StatusChip status={serviceCenter.status} />}
					/>
					<InfoField label="Address" value={serviceCenter.address} />
					<InfoField label="State" value={serviceCenter.state} />
					<InfoField label="City" value={serviceCenter.city} />
					<InfoField label="Phone Number" value={serviceCenter.phoneNumber} />
					<InfoField label="Email" value={serviceCenter.email} />
					<InfoField label="Created By" value={serviceCenter.createdBy} />
					<InfoField
						label="Created At"
						value={new Date(serviceCenter.createdAt).toLocaleDateString()}
					/>
				</div>
			</InfoCard>

			{/* Bank Details Card */}
			<InfoCard
				title="Bank Details"
				headerContent={
					<Button
						size="sm"
						color="warning"
						variant="flat"
						startContent={<Edit size={14} />}
						onPress={() => {
							setBankFormData({
								bankName: serviceCenter.bankName,
								accountName: serviceCenter.accountName,
								accountNumber: serviceCenter.accountNumber,
							});
							onEditBankModalOpen();
						}}
					>
						Edit Bank Details
					</Button>
				}
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<InfoField label="Bank Name" value={serviceCenter.bankName} />
					<InfoField label="Account Name" value={serviceCenter.accountName} />
					<InfoField
						label="Account Number"
						value={serviceCenter.accountNumber}
					/>
				</div>
			</InfoCard>

			{/* Tabs */}
			<Tabs aria-label="Service center details" className="w-full">
				<Tab key="engineers" title="Engineers">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-semibold">Engineers</h3>
							<Button
								color="primary"
								startContent={<Plus size={16} />}
								onPress={onAddEngineerModalOpen}
							>
								Add Engineer
							</Button>
						</div>

						<GenericTable<Engineer>
							columns={engineerColumns}
							data={serviceCenter.engineers}
							allCount={serviceCenter.engineers.length}
							exportData={serviceCenter.engineers}
							isLoading={false}
							renderCell={renderEngineerCell}
							hasNoRecords={serviceCenter.engineers.length === 0}
							sortDescriptor={{ column: "createdAt", direction: "descending" }}
							onSortChange={() => {}}
							page={1}
							pages={1}
							onPageChange={() => {}}
							filterValue=""
							onFilterChange={() => {}}
							searchPlaceholder="Search engineers..."
							showRowsPerPageSelector={true}
							exportFn={(data) => {
								console.log("Exporting engineers:", data);
							}}
						/>
					</div>
				</Tab>

				<Tab key="transactions" title="Transaction History">
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Transaction History</h3>

						<GenericTable<Transaction>
							columns={transactionColumns}
							data={transactions}
							allCount={transactions.length}
							exportData={transactions}
							isLoading={false}
							renderCell={renderTransactionCell}
							hasNoRecords={transactions.length === 0}
							sortDescriptor={{
								column: "processedAt",
								direction: "descending",
							}}
							onSortChange={() => {}}
							page={1}
							pages={1}
							onPageChange={() => {}}
							filterValue=""
							onFilterChange={() => {}}
							searchPlaceholder="Search transactions..."
							showRowsPerPageSelector={true}
							exportFn={(data) => {
								console.log("Exporting transactions:", data);
							}}
						/>
					</div>
				</Tab>
			</Tabs>

			{/* Edit Service Center Modal */}
			<Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Service Center</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Center Name"
										placeholder="e.g., TechFix Lagos Central"
										value={centerFormData.name}
										onValueChange={(value) =>
											setCenterFormData((prev) => ({ ...prev, name: value }))
										}
										isRequired
									/>
									<Input
										label="Email"
										placeholder="contact@techfixlagos.com"
										value={centerFormData.email}
										onValueChange={(value) =>
											setCenterFormData((prev) => ({ ...prev, email: value }))
										}
										type="email"
										isRequired
									/>
									<Input
										label="Phone Number"
										placeholder="+234 802 123 4567"
										value={centerFormData.phoneNumber}
										onValueChange={(value) =>
											setCenterFormData((prev) => ({
												...prev,
												phoneNumber: value,
											}))
										}
										isRequired
									/>
									<Select
										label="State"
										placeholder="Select state"
										selectedKeys={
											centerFormData.state ? [centerFormData.state] : []
										}
										onSelectionChange={(keys) => {
											const key = Array.from(keys)[0] as string;
											setCenterFormData((prev) => ({ ...prev, state: key }));
										}}
										isRequired
									>
										{nigerianStates.map((state) => (
											<SelectItem key={state.value} value={state.value}>
												{state.label}
											</SelectItem>
										))}
									</Select>
									<Input
										label="City"
										placeholder="e.g., Lagos"
										value={centerFormData.city}
										onValueChange={(value) =>
											setCenterFormData((prev) => ({ ...prev, city: value }))
										}
										isRequired
									/>
									<div className="md:col-span-2">
										<Input
											label="Address"
											placeholder="123 Allen Avenue, Ikeja"
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
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditServiceCenter}
									isLoading={isLoading}
								>
									Save Changes
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Edit Bank Details Modal */}
			<Modal
				isOpen={isEditBankModalOpen}
				onClose={onEditBankModalClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Bank Details</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Bank Name"
										placeholder="e.g., First Bank of Nigeria"
										value={bankFormData.bankName}
										onValueChange={(value) =>
											setBankFormData((prev) => ({ ...prev, bankName: value }))
										}
										isRequired
									/>
									<Input
										label="Account Name"
										placeholder="e.g., TechFix Lagos Central"
										value={bankFormData.accountName}
										onValueChange={(value) =>
											setBankFormData((prev) => ({
												...prev,
												accountName: value,
											}))
										}
										isRequired
									/>
									<Input
										label="Account Number"
										placeholder="e.g., 2034567890"
										value={bankFormData.accountNumber}
										onValueChange={(value) =>
											setBankFormData((prev) => ({
												...prev,
												accountNumber: value,
											}))
										}
										isRequired
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditBankModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditBankDetails}
									isLoading={isLoading}
								>
									Save Bank Details
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Add Engineer Modal */}
			<Modal
				isOpen={isAddEngineerModalOpen}
				onClose={onAddEngineerModalClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Add Engineer</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Engineer Name"
										placeholder="e.g., John Adebayo"
										value={engineerFormData.name}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({ ...prev, name: value }))
										}
										isRequired
									/>
									<Input
										label="Email"
										placeholder="john.adebayo@techfixlagos.com"
										value={engineerFormData.email}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({ ...prev, email: value }))
										}
										type="email"
										isRequired
									/>
									<Input
										label="Phone Number"
										placeholder="+234 803 123 4567"
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
										label="Specialization"
										placeholder="Select specialization"
										selectedKeys={
											engineerFormData.specialization
												? [engineerFormData.specialization]
												: []
										}
										onSelectionChange={(keys) => {
											const key = Array.from(keys)[0] as string;
											setEngineerFormData((prev) => ({
												...prev,
												specialization: key,
											}));
										}}
									>
										{specializations.map((spec) => (
											<SelectItem key={spec.value} value={spec.value}>
												{spec.label}
											</SelectItem>
										))}
									</Select>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onAddEngineerModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleAddEngineer}
									isLoading={isLoading}
								>
									Add Engineer
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
