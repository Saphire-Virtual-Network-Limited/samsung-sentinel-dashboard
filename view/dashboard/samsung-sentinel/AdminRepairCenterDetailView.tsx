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
	Textarea,
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
import {
	showToast,
	getRepairStoreById,
	updateRepairStore,
	activateRepairStore as activateRepairStoreAPI,
	deactivateRepairStore as deactivateRepairStoreAPI,
	createServiceCenter,
	updateServiceCenter,
	activateServiceCenter,
	deactivateServiceCenter,
	type RepairStore,
	type ServiceCenter,
} from "@/lib";
import useSWR from "swr";

const serviceCenterColumns: ColumnDef[] = [
	{ name: "Service Center", uid: "name", sortable: true },
	{ name: "Location", uid: "address", sortable: true },
	{ name: "Contact", uid: "contact", sortable: false },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created", uid: "created_at", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap: Record<string, "success" | "default" | "danger"> = {
	ACTIVE: "success" as const,
	DISABLED: "default" as const,
	SUSPENDED: "danger" as const,
};

export default function AdminRepairCenterDetailView() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();
	const repairCenterId = params.id as string;
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
		email: "",
		phone: "",
		description: "",
		location: "",
		account_name: "",
		account_number: "",
		bank_name: "",
	});
	const [serviceCenterFormData, setServiceCenterFormData] = useState({
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

	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch repair partner details
	const {
		data: repairStore,
		mutate,
		isLoading,
		error,
	} = useSWR(
		repairCenterId ? ["repair-store-detail", repairCenterId] : null,
		() => getRepairStoreById(repairCenterId)
	);

	const serviceCenters = useMemo(
		() => repairStore?.service_centers || [],
		[repairStore]
	);

	// Statistics
	const stats = useMemo(
		() => ({
			totalServiceCenters: serviceCenters.length,
			activeServiceCenters: serviceCenters.filter(
				(sc) => sc.status === "ACTIVE"
			).length,
			inactiveServiceCenters: serviceCenters.filter(
				(sc) => sc.status === "DISABLED"
			).length,
			suspendedServiceCenters: serviceCenters.filter(
				(sc) => sc.status === "SUSPENDED"
			).length,
		}),
		[serviceCenters]
	);

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Handle edit repair partner
	const handleEditRepairCenter = async () => {
		const { name, email, phone, location } = centerFormData;

		if (!name || !email || !phone || !location) {
			showToast({ message: "Please fill in required fields", type: "error" });
			return;
		}

		setIsSubmitting(true);
		try {
			await updateRepairStore(repairCenterId, centerFormData);
			showToast({
				message: "Repair center updated successfully",
				type: "success",
			});
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

	// Handle add service center
	const handleAddServiceCenter = async () => {
		const { name, email, phone, state, city, address } = serviceCenterFormData;

		if (!name || !email || !phone || !state || !city || !address) {
			showToast({ message: "Please fill in required fields", type: "error" });
			return;
		}

		setIsSubmitting(true);
		try {
			await createServiceCenter({
				...serviceCenterFormData,
				repair_store_id: repairCenterId,
			});
			showToast({
				message: "Service center added successfully",
				type: "success",
			});
			onAddServiceCenterModalClose();
			setServiceCenterFormData({
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
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to add service center",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle toggle repair partner status
	const handleToggleRepairCenterStatus = async () => {
		if (!repairStore) return;

		setIsSubmitting(true);
		try {
			if (repairStore.status === "ACTIVE") {
				await deactivateRepairStoreAPI(repairCenterId);
				showToast({
					message: "Repair center deactivated successfully",
					type: "success",
				});
			} else {
				await activateRepairStoreAPI(repairCenterId);
				showToast({
					message: "Repair center activated successfully",
					type: "success",
				});
			}
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update repair partner status",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle toggle service center status
	const handleToggleServiceCenterStatus = async (
		id: string,
		currentStatus: string
	) => {
		try {
			if (currentStatus === "ACTIVE") {
				await deactivateServiceCenter(id);
				showToast({
					message: "Service center deactivated successfully",
					type: "success",
				});
			} else {
				await activateServiceCenter(id);
				showToast({
					message: "Service center activated successfully",
					type: "success",
				});
			}
			mutate();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to toggle service center status",
				type: "error",
			});
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
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{item.address}</p>
						<p className="text-sm text-default-400">
							{item.city}, {item.state}
						</p>
					</div>
				);
			case "contact":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{item.phone}</p>
						<p className="text-sm text-default-400">{item.email}</p>
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
											`/access/admin/samsung-sentinel/service-centers/${item.id}`
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
										item.status === "ACTIVE" ? (
											<PowerOff size={16} />
										) : (
											<Power size={16} />
										)
									}
									onPress={() =>
										handleToggleServiceCenterStatus(item.id, item.status)
									}
								>
									{item.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
		if (isEditModalOpen && repairStore) {
			setCenterFormData({
				name: repairStore.name,
				email: repairStore.email,
				phone: repairStore.phone,
				description: repairStore.description || "",
				location: repairStore.location,
				account_name: repairStore.account_name || "",
				account_number: repairStore.account_number || "",
				bank_name: repairStore.bank_name || "",
			});
		}
	}, [isEditModalOpen, repairStore]);

	if (isLoading) return <LoadingSpinner />;
	if (error)
		return (
			<NotFound
				title="Repair Store Not Found"
				description="The requested repair partner could not be found."
				onGoBack={() =>
					router.push("/access/admin/samsung-sentinel/repair-partners")
				}
			/>
		);
	if (!repairStore) return null;

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						isIconOnly
						variant="light"
						onPress={() =>
							router.push("/access/admin/samsung-sentinel/repair-partners")
						}
					>
						<ArrowLeft size={20} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{repairStore.name}</h1>
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
						color={repairStore.status === "ACTIVE" ? "danger" : "success"}
						variant="flat"
						startContent={
							repairStore.status === "ACTIVE" ? (
								<PowerOff size={16} />
							) : (
								<Power size={16} />
							)
						}
						onPress={handleToggleRepairCenterStatus}
						isLoading={isSubmitting}
					>
						{repairStore.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
					title="Inactive Centers"
					value={stats.inactiveServiceCenters.toString()}
					icon={<PowerOff className="w-5 h-5" />}
				/>
				<StatCard
					title="Suspended Centers"
					value={stats.suspendedServiceCenters.toString()}
					icon={<UserX className="w-5 h-5" />}
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
									<InfoField label="Center Name" value={repairStore.name} />
									<InfoField label="Location" value={repairStore.location} />
									<InfoField label="Phone" value={repairStore.phone} />
									<InfoField label="Email" value={repairStore.email} />
									{repairStore.description && (
										<InfoField
											label="Description"
											value={repairStore.description}
										/>
									)}
								</div>
							</CardBody>
						</Card>

						{/* Bank Details */}
						<Card>
							<CardHeader className="pb-3">
								<h3 className="text-lg font-semibold">Bank Details</h3>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-4">
									<InfoField
										label="Account Name"
										value={repairStore.account_name || "Not provided"}
									/>
									<InfoField
										label="Account Number"
										value={repairStore.account_number || "Not provided"}
									/>
									<InfoField
										label="Bank Name"
										value={repairStore.bank_name || "Not provided"}
									/>
								</div>
							</CardBody>
						</Card>

						{/* Status Information */}
						<Card>
							<CardHeader className="pb-3">
								<h3 className="text-lg font-semibold">Status Information</h3>
							</CardHeader>
							<CardBody className="pt-0">
								<div className="space-y-4">
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">Status</div>
										<Chip
											className="capitalize"
											color={statusColorMap[repairStore.status]}
											size="md"
											variant="flat"
										>
											{repairStore.status}
										</Chip>
									</div>
									<InfoField
										label="Service Centers"
										value={(repairStore.service_centers_count || 0).toString()}
									/>
									<InfoField
										label="Created"
										value={new Date(
											repairStore.created_at
										).toLocaleDateString()}
									/>
									<InfoField
										label="Last Updated"
										value={new Date(
											repairStore.updated_at
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
									Manage service centers under this repair partner
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
							data={serviceCenters}
							allCount={serviceCenters.length}
							exportData={serviceCenters}
							isLoading={false}
							filterValue=""
							onFilterChange={() => {}}
							statusOptions={[
								{ name: "Active", uid: "ACTIVE" },
								{ name: "Disabled", uid: "DISABLED" },
								//	{ name: "Suspended", uid: "SUSPENDED" },
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
							exportFn={async () => {
								// Export all service centers
								const ExcelJS = (await import("exceljs")).default;
								const workbook = new ExcelJS.Workbook();
								const worksheet = workbook.addWorksheet("Service Centers");
								worksheet.columns = [
									{ header: "Name", key: "name", width: 25 },
									{ header: "Location", key: "address", width: 30 },
									{ header: "Contact", key: "contact", width: 25 },
									{ header: "Status", key: "status", width: 12 },
								];
								worksheet.getRow(1).font = {
									bold: true,
									color: { argb: "FFFFFFFF" },
								};
								worksheet.getRow(1).fill = {
									type: "pattern",
									pattern: "solid",
									fgColor: { argb: "FF4472C4" },
								};
								worksheet.getRow(1).alignment = {
									vertical: "middle",
									horizontal: "center",
								};
								(serviceCenters || []).forEach((item: any) => {
									worksheet.addRow({
										name: item.name,
										address: item.address,
										contact: item.phone || item.email || "",
										status: item.status,
									});
								});
								const buffer = await workbook.xlsx.writeBuffer();
								const blob = new Blob([buffer], {
									type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
								});
								const url = URL.createObjectURL(blob);
								const link = document.createElement("a");
								link.href = url;
								link.download = `service-centers-${
									new Date().toISOString().split("T")[0]
								}.xlsx`;
								link.click();
								URL.revokeObjectURL(url);
							}}
							renderCell={renderServiceCenterCell}
							hasNoRecords={serviceCenters.length === 0}
							searchPlaceholder="Search service centers..."
							showRowsPerPageSelector={true}
						/>
					</div>
				</Tab>
			</Tabs>

			{/* Edit Repair Partner Modal */}
			<Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Repair Partner</ModalHeader>
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
										value={centerFormData.phone}
										onValueChange={(value) =>
											setCenterFormData({
												...centerFormData,
												phone: value,
											})
										}
										isRequired
									/>
									<Input
										label="Location"
										value={centerFormData.location}
										onValueChange={(value) =>
											setCenterFormData({ ...centerFormData, location: value })
										}
										isRequired
									/>
									<Input
										label="Account Name"
										value={centerFormData.account_name}
										onValueChange={(value) =>
											setCenterFormData({
												...centerFormData,
												account_name: value,
											})
										}
									/>
									<Input
										label="Account Number"
										value={centerFormData.account_number}
										onValueChange={(value) =>
											setCenterFormData({
												...centerFormData,
												account_number: value,
											})
										}
									/>
									<Input
										label="Bank Name"
										value={centerFormData.bank_name}
										onValueChange={(value) =>
											setCenterFormData({ ...centerFormData, bank_name: value })
										}
									/>
								</div>
								<Textarea
									label="Description"
									value={centerFormData.description}
									onValueChange={(value) =>
										setCenterFormData({ ...centerFormData, description: value })
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
									onPress={handleEditRepairCenter}
									isLoading={isSubmitting}
								>
									Update Repair Partner
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
										value={serviceCenterFormData.phone}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												phone: value,
											})
										}
										isRequired
									/>
									<Input
										label="State"
										placeholder="e.g., Lagos"
										value={serviceCenterFormData.state}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												state: value,
											})
										}
										isRequired
									/>
									<Input
										label="City"
										placeholder="e.g., Ikeja"
										value={serviceCenterFormData.city}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												city: value,
											})
										}
										isRequired
									/>
									<Input
										label="Account Name"
										placeholder="e.g., John Doe"
										value={serviceCenterFormData.account_name}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												account_name: value,
											})
										}
									/>
									<Input
										label="Account Number"
										placeholder="e.g., 1234567890"
										value={serviceCenterFormData.account_number}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												account_number: value,
											})
										}
									/>
									<Input
										label="Bank Name"
										placeholder="e.g., First Bank"
										value={serviceCenterFormData.bank_name}
										onValueChange={(value) =>
											setServiceCenterFormData({
												...serviceCenterFormData,
												bank_name: value,
											})
										}
									/>
								</div>
								<Input
									label="Address"
									placeholder="e.g., 123 Main Street, Ikeja"
									value={serviceCenterFormData.address}
									onValueChange={(value) =>
										setServiceCenterFormData({
											...serviceCenterFormData,
											address: value,
										})
									}
									isRequired
								/>
								<Textarea
									label="Description"
									placeholder="Enter service center description..."
									value={serviceCenterFormData.description}
									onValueChange={(value) =>
										setServiceCenterFormData({
											...serviceCenterFormData,
											description: value,
										})
									}
									minRows={3}
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onAddServiceCenterModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleAddServiceCenter}
									isLoading={isSubmitting}
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
