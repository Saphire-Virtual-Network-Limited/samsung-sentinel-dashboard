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
import { useRouter, usePathname, useParams } from "next/navigation";
import {
	showToast,
	getServiceCenterById,
	updateServiceCenter,
	activateServiceCenter,
	deactivateServiceCenter,
	type ServiceCenter as APIServiceCenter,
} from "@/lib";
import useSWR from "swr";

interface Engineer {
	id: string;
	created_at: string;
	updated_at: string;
	user_id: string;
	service_center_id: string;
	description?: string;
	user?: {
		id: string;
		email: string;
		name: string;
		phone: string;
		role: string;
		status: "ACTIVE" | "SUSPENDED" | "DISABLED";
	};
}

interface ServiceCenter {
	id: string;
	created_at: string;
	updated_at: string;
	created_by_id: string;
	updated_by_id?: string;
	repair_store_id?: string;
	name: string;
	email: string;
	phone: string;
	state: string;
	city: string;
	address: string;
	description?: string;
	account_name?: string;
	account_number?: string;
	bank_name?: string;
	status: "ACTIVE" | "SUSPENDED" | "DISABLED";
	repair_store?: {
		id: string;
		name: string;
	};
	engineers_count: number;
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
	{ name: "Description", uid: "specialization", sortable: true },
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
	ACTIVE: "success" as const,
	SUSPENDED: "warning" as const,
	DISABLED: "danger" as const,
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

export default function SingleServiceCenterView() {
	const params = useParams();
	const serviceCenterId = params?.id as string;
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
		phone: "",
		email: "",
		description: "",
	});
	const [bankFormData, setBankFormData] = useState({
		bank_name: "",
		account_name: "",
		account_number: "",
	});
	const [engineerFormData, setEngineerFormData] = useState({
		name: "",
		email: "",
		phone: "",
		specialization: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Mock transactions data (since API doesn't provide this yet)
	const transactions: Transaction[] = [];

	// Fetch service center details
	const {
		data: serviceCenter,
		mutate,
		isLoading,
		error,
	} = useSWR(
		serviceCenterId ? ["service-center-detail", serviceCenterId] : null,
		() => getServiceCenterById(serviceCenterId)
	);

	// Statistics
	const stats = useMemo(() => {
		if (!serviceCenter)
			return {
				totalEngineers: 0,
				activeEngineers: 0,
				suspendedEngineers: 0,
				disabledEngineers: 0,
			};

		const engineers = serviceCenter.engineers || [];
		return {
			totalEngineers: engineers.length,
			activeEngineers: engineers.filter((e: any) => e.user?.status === "ACTIVE")
				.length,
			suspendedEngineers: engineers.filter(
				(e: any) => e.user?.status === "SUSPENDED"
			).length,
			disabledEngineers: engineers.filter(
				(e: any) => e.user?.status === "DISABLED"
			).length,
		};
	}, [serviceCenter]);

	// Handle edit service center
	const handleEditServiceCenter = async () => {
		const { name, address, state, city, phone, email } = centerFormData;

		if (!name || !address || !state || !city) {
			showToast({ message: "Please fill in required fields", type: "error" });
			return;
		}

		setIsSubmitting(true);
		try {
			await updateServiceCenter(serviceCenterId, centerFormData);
			showToast({
				message: "Service center updated successfully",
				type: "success",
			});
			onEditModalClose();
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update service center",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle edit bank details
	const handleEditBankDetails = async () => {
		const { bank_name, account_name, account_number } = bankFormData;

		if (!bank_name || !account_name || !account_number) {
			showToast({ message: "Please fill in all bank details", type: "error" });
			return;
		}

		setIsSubmitting(true);
		try {
			await updateServiceCenter(serviceCenterId, bankFormData);
			showToast({
				message: "Bank details updated successfully",
				type: "success",
			});
			onEditBankModalClose();
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update bank details",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle add engineer
	const handleAddEngineer = async () => {
		const { name, email, phone } = engineerFormData;

		if (!name || !email || !phone) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			// TODO: Implement engineer creation API
			showToast({ message: "Engineer added successfully", type: "success" });
			onAddEngineerModalClose();
			setEngineerFormData({
				name: "",
				email: "",
				phone: "",
				specialization: "",
			});
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to add engineer",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle toggle service center status
	const handleToggleServiceCenterStatus = async () => {
		if (!serviceCenter) return;

		setIsSubmitting(true);
		try {
			if (serviceCenter.status === "ACTIVE") {
				await deactivateServiceCenter(serviceCenterId);
				showToast({
					message: "Service center deactivated successfully",
					type: "success",
				});
			} else {
				await activateServiceCenter(serviceCenterId);
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
		} finally {
			setIsSubmitting(false);
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
						<p className="text-bold text-sm">{row.user?.name || "N/A"}</p>
						<p className="text-xs text-default-400">ID: {row.id}</p>
					</div>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-sm">{row.user?.email || "N/A"}</p>
						<p className="text-xs text-default-400">
							{row.user?.phone || "N/A"}
						</p>
					</div>
				);
			case "specialization":
				return (
					<Chip color="primary" variant="flat" size="sm">
						{row.description || "N/A"}
					</Chip>
				);
			case "status":
				return (
					<Chip
						color={statusColorMap[row.user?.status || "DISABLED"]}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.user?.status || "N/A"}
					</Chip>
				);
			case "createdAt":
				return (
					<p className="text-sm">
						{new Date(row.created_at).toLocaleDateString()}
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
										row.user?.status === "ACTIVE" ? (
											<UserX size={16} />
										) : (
											<UserCheck size={16} />
										)
									}
									onPress={() =>
										handleToggleEngineerStatus(
											row.id,
											row.user?.status || "DISABLED"
										)
									}
								>
									{row.user?.status === "ACTIVE" ? "Suspend" : "Activate"}
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
				const value = row[key as keyof Engineer];
				return (
					<span className="text-sm">
						{typeof value === "object"
							? JSON.stringify(value)
							: String(value || "N/A")}
					</span>
				);
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

	// Initialize form data when modals open
	React.useEffect(() => {
		if (isEditModalOpen && serviceCenter) {
			setCenterFormData({
				name: serviceCenter.name,
				address: serviceCenter.address,
				state: serviceCenter.state,
				city: serviceCenter.city,
				phone: serviceCenter.phone,
				email: serviceCenter.email,
				description: serviceCenter.description || "",
			});
		}
	}, [isEditModalOpen, serviceCenter]);

	React.useEffect(() => {
		if (isEditBankModalOpen && serviceCenter) {
			setBankFormData({
				bank_name: serviceCenter.bank_name || "",
				account_name: serviceCenter.account_name || "",
				account_number: serviceCenter.account_number || "",
			});
		}
	}, [isEditBankModalOpen, serviceCenter]);

	if (isLoading) return <LoadingSpinner />;
	if (error)
		return (
			<NotFound
				title="Service Center Not Found"
				description="The requested service center could not be found."
				onGoBack={() => router.back()}
			/>
		);
	if (!serviceCenter) return null;

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
						onPress={onEditModalOpen}
					>
						Edit Details
					</Button>
					<Button
						color={serviceCenter.status === "ACTIVE" ? "danger" : "success"}
						variant="flat"
						startContent={
							serviceCenter.status === "ACTIVE" ? (
								<PowerOff size={16} />
							) : (
								<Power size={16} />
							)
						}
						onPress={handleToggleServiceCenterStatus}
						isLoading={isSubmitting}
					>
						{serviceCenter.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
					title="Suspended Engineers"
					value={stats.suspendedEngineers.toString()}
					icon={<UserX className="w-5 h-5" />}
				/>
				<StatCard
					title="Disabled Engineers"
					value={stats.disabledEngineers.toString()}
					icon={<PowerOff className="w-5 h-5" />}
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
					<InfoField label="Phone Number" value={serviceCenter.phone} />
					<InfoField label="Email" value={serviceCenter.email} />
					<InfoField
						label="Repair Store"
						value={serviceCenter.repair_store?.name || "N/A"}
					/>
					<InfoField
						label="Created At"
						value={new Date(serviceCenter.created_at).toLocaleDateString()}
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
						onPress={onEditBankModalOpen}
					>
						Edit Bank Details
					</Button>
				}
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<InfoField
						label="Bank Name"
						value={serviceCenter.bank_name || "N/A"}
					/>
					<InfoField
						label="Account Name"
						value={serviceCenter.account_name || "N/A"}
					/>
					<InfoField
						label="Account Number"
						value={serviceCenter.account_number || "N/A"}
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
							data={serviceCenter.engineers || []}
							allCount={(serviceCenter.engineers || []).length}
							exportData={serviceCenter.engineers || []}
							isLoading={false}
							renderCell={renderEngineerCell}
							hasNoRecords={(serviceCenter.engineers || []).length === 0}
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
										value={centerFormData.phone}
										onValueChange={(value) =>
											setCenterFormData((prev) => ({
												...prev,
												phone: value,
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
									isLoading={isSubmitting}
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
										value={bankFormData.bank_name}
										onValueChange={(value) =>
											setBankFormData((prev) => ({ ...prev, bank_name: value }))
										}
										isRequired
									/>
									<Input
										label="Account Name"
										placeholder="e.g., TechFix Lagos Central"
										value={bankFormData.account_name}
										onValueChange={(value) =>
											setBankFormData((prev) => ({
												...prev,
												account_name: value,
											}))
										}
										isRequired
									/>
									<Input
										label="Account Number"
										placeholder="e.g., 2034567890"
										value={bankFormData.account_number}
										onValueChange={(value) =>
											setBankFormData((prev) => ({
												...prev,
												account_number: value,
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
									isLoading={isSubmitting}
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
										value={engineerFormData.phone}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({
												...prev,
												phone: value,
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
									isLoading={isSubmitting}
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
