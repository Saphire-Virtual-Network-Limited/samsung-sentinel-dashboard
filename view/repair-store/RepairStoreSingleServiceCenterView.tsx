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
	Textarea,
	Badge,
	Avatar,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	ArrowLeft,
	Plus,
	Eye,
	Trash2,
	Power,
	PowerOff,
	Users,
	MapPin,
	Phone,
	Mail,
	Calendar,
	CreditCard,
	Wrench,
	Star,
	Edit,
	EllipsisVertical,
	Shield,
	TrendingUp,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { showToast } from "@/lib";
import { useRepairStoreSingleServiceCenter } from "@/hooks/repair-store/useRepairStoreSingleServiceCenter";
import type { Engineer } from "@/lib/api";
import { UserStatus } from "@/lib/api/shared";

const engineerColumns: ColumnDef[] = [
	{ name: "Engineer", uid: "engineer", sortable: true },
	{ name: "Email", uid: "email", sortable: true },
	{ name: "Phone", uid: "phone", sortable: true },
	{ name: "Description", uid: "description", sortable: false },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created", uid: "created", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	ACTIVE: "success" as const,
	SUSPENDED: "warning" as const,
	DISABLED: "danger" as const,
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

	// Use the single service center hook
	const {
		serviceCenter,
		isLoading,
		engineers,
		isLoadingEngineers,
		handleUpdate,
		handleToggleStatus,
		handleCreateEngineer,
		handleDeleteEngineer,
		isUpdating,
		isChangingStatus,
	} = useRepairStoreSingleServiceCenter(serviceCenterId);

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
		name: "",
		email: "",
		phone: "",
		description: "",
	});

	const [centerFormData, setCenterFormData] = useState({
		name: "",
		address: "",
		phone: "",
		email: "",
		state: "",
		city: "",
		description: "",
		account_name: "",
		account_number: "",
		bank_name: "",
	});

	// Filter states
	const [filterValue, setFilterValue] = useState("");

	// Initialize edit form data when modal opens
	React.useEffect(() => {
		if (isEditModalOpen && serviceCenter) {
			setCenterFormData({
				name: serviceCenter.name,
				address: serviceCenter.address,
				phone: serviceCenter.phone,
				email: serviceCenter.email,
				state: serviceCenter.state,
				city: serviceCenter.city,
				description: serviceCenter.description || "",
				account_name: serviceCenter.account_name || "",
				account_number: serviceCenter.account_number || "",
				bank_name: serviceCenter.bank_name || "",
			});
		}
	}, [isEditModalOpen, serviceCenter]);

	const handleCreateEngineerSubmit = async () => {
		const { name, email, phone, description } = engineerFormData;

		if (!name || !email || !phone) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		try {
			await handleCreateEngineer({
				name,
				email,
				phone,
				service_center_id: serviceCenterId,
				description,
			});
			setEngineerFormData({
				name: "",
				email: "",
				phone: "",
				description: "",
			});
			onCreateModalClose();
		} catch (error) {
			// Error handled by hook
		}
	};

	const handleUpdateServiceCenterSubmit = async () => {
		const {
			name,
			address,
			phone,
			email,
			state,
			city,
			description,
			account_name,
			account_number,
			bank_name,
		} = centerFormData;

		if (!name || !address || !phone || !email || !state || !city) {
			showToast({
				message: "Please fill in all required fields",
				type: "error",
			});
			return;
		}

		try {
			await handleUpdate({
				name,
				address,
				phone,
				email,
				state,
				city,
				description,
				account_name,
				account_number,
				bank_name,
			});
			onEditModalClose();
		} catch (error) {
			// Error handled by hook
		}
	};

	const handleDeleteEngineerConfirm = async (engineerId: string) => {
		try {
			await handleDeleteEngineer(engineerId);
		} catch (error) {
			// Error handled by hook
		}
	};

	// Render cell content
	const renderCell = (row: Engineer, key: string) => {
		switch (key) {
			case "engineer":
				return (
					<div className="flex items-center gap-3">
						<Avatar
							name={row.user?.name || row.name || "N/A"}
							size="sm"
							className="flex-shrink-0"
						/>
						<div className="flex flex-col">
							<p className="text-bold text-sm">
								{row.user?.name || row.name || "N/A"}
							</p>
							<p className="text-bold text-xs text-default-400">ID: {row.id}</p>
						</div>
					</div>
				);
			case "email":
				return (
					<p className="text-sm">{row.user?.email || row.email || "N/A"}</p>
				);
			case "phone":
				return (
					<p className="text-sm">{row.user?.phone || row.phone || "N/A"}</p>
				);
			case "description":
				return (
					<p className="text-sm text-gray-600">
						{row.description || "No description"}
					</p>
				);
			case "status":
				return (
					<Chip
						color={
							row.user?.status === "ACTIVE"
								? "success"
								: row.user?.status === "SUSPENDED"
								? "warning"
								: "danger"
						}
						size="sm"
						variant="flat"
						className="capitalize"
					>
						{row.user?.status || "N/A"}
					</Chip>
				);
			case "created":
				return (
					<p className="text-sm">
						{row.created_at || row.createdAt
							? new Date(row.created_at || row.createdAt!).toLocaleDateString(
									"en-US",
									{
										year: "numeric",
										month: "short",
										day: "numeric",
									}
							  )
							: "N/A"}
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
									key="delete"
									className="text-danger"
									color="danger"
									startContent={<Trash2 size={16} />}
									onPress={() => handleDeleteEngineerConfirm(row.id)}
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
								{serviceCenter?.name || "Loading..."}
							</h1>
							{serviceCenter && (
								<Chip
									color={statusColorMap[serviceCenter.status]}
									size="sm"
									variant="flat"
									className="capitalize"
								>
									{serviceCenter.status}
								</Chip>
							)}
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
						isDisabled={!serviceCenter}
					>
						Edit Center
					</Button>
					<Button
						color={
							serviceCenter?.status === UserStatus.ACTIVE
								? "warning"
								: "success"
						}
						variant="flat"
						startContent={
							serviceCenter?.status === UserStatus.ACTIVE ? (
								<PowerOff size={16} />
							) : (
								<Power size={16} />
							)
						}
						onPress={() => handleToggleStatus()}
						isLoading={isChangingStatus}
						isDisabled={!serviceCenter}
					>
						{serviceCenter?.status === UserStatus.ACTIVE
							? "Deactivate"
							: "Activate"}
					</Button>
				</div>
			</div>

			{isLoading && !serviceCenter ? (
				<div className="flex justify-center items-center py-12">
					<div className="text-center">
						<p className="text-gray-500">Loading service center details...</p>
					</div>
				</div>
			) : !serviceCenter ? (
				<div className="flex justify-center items-center py-12">
					<div className="text-center">
						<p className="text-gray-500">Service center not found</p>
					</div>
				</div>
			) : (
				<>
					{/* Service Center Info Card */}
					<Card>
						<CardHeader>
							<h2 className="text-lg font-semibold">
								Service Center Information
							</h2>
						</CardHeader>
						<CardBody>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-blue-100 rounded-lg">
										<MapPin className="w-5 h-5 text-blue-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Location</p>
										<p className="font-medium">
											{serviceCenter.city}, {serviceCenter.state}
										</p>
										<p className="text-xs text-gray-500">
											{serviceCenter.address}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-green-100 rounded-lg">
										<Phone className="w-5 h-5 text-green-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Phone</p>
										<p className="font-medium">{serviceCenter.phone}</p>
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
										<Users className="w-5 h-5 text-orange-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Total Engineers</p>
										<p className="font-medium">{engineers?.length || 0}</p>
									</div>
								</div>
							</div>

							{(serviceCenter.account_name ||
								serviceCenter.account_number ||
								serviceCenter.bank_name) && (
								<div className="mt-6 p-4 bg-gray-50 rounded-lg">
									<h3 className="font-medium mb-3 flex items-center gap-2">
										<Shield className="w-4 h-4" />
										Bank Details
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										{serviceCenter.account_name && (
											<div>
												<p className="text-gray-600">Account Name</p>
												<p className="font-medium">
													{serviceCenter.account_name}
												</p>
											</div>
										)}
										{serviceCenter.account_number && (
											<div>
												<p className="text-gray-600">Account Number</p>
												<p className="font-medium">
													{serviceCenter.account_number}
												</p>
											</div>
										)}
										{serviceCenter.bank_name && (
											<div>
												<p className="text-gray-600">Bank Name</p>
												<p className="font-medium">{serviceCenter.bank_name}</p>
											</div>
										)}
									</div>
								</div>
							)}
						</CardBody>
					</Card>

					{/* Engineers Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold">Engineers</h2>
							<Button
								color="primary"
								startContent={<Plus size={16} />}
								onPress={onCreateModalOpen}
							>
								Add Engineer
							</Button>
						</div>

						<GenericTable<Engineer>
							columns={engineerColumns}
							data={engineers || []}
							allCount={engineers?.length || 0}
							exportData={engineers || []}
							isLoading={isLoadingEngineers}
							filterValue={filterValue}
							onFilterChange={setFilterValue}
							renderCell={renderCell}
							hasNoRecords={(engineers?.length || 0) === 0}
							searchPlaceholder="Search engineers by name or email..."
							sortDescriptor={{ column: "created", direction: "descending" }}
							onSortChange={() => {}}
							page={1}
							pages={1}
							onPageChange={() => {}}
							exportFn={async () => {}}
						/>
					</div>
				</>
			)}

			{/* Create Engineer Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Add New Engineer</ModalHeader>
							<ModalBody>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Full Name"
										placeholder="Enter full name"
										value={engineerFormData.name}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({
												...prev,
												name: value,
											}))
										}
										isRequired
									/>
									<Input
										label="Email Address"
										type="email"
										placeholder="engineer@example.com"
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
										value={engineerFormData.phone}
										onValueChange={(value) =>
											setEngineerFormData((prev) => ({
												...prev,
												phone: value,
											}))
										}
										isRequired
									/>
									<div className="md:col-span-2">
										<Textarea
											label="Description (Optional)"
											placeholder="Enter engineer description or notes"
											value={engineerFormData.description}
											onValueChange={(value) =>
												setEngineerFormData((prev) => ({
													...prev,
													description: value,
												}))
											}
											minRows={3}
										/>
									</div>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onCreateModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleCreateEngineerSubmit}
									isLoading={isUpdating}
								>
									Add Engineer
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
												value={centerFormData.phone}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														phone: value,
													}))
												}
												isRequired
											/>
											<Input
												label="Email Address"
												type="email"
												placeholder="center@example.com"
												value={centerFormData.email}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														email: value,
													}))
												}
												isRequired
											/>
											<Input
												label="State"
												placeholder="Enter state"
												value={centerFormData.state}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														state: value,
													}))
												}
												isRequired
											/>
											<Input
												label="City"
												placeholder="Enter city"
												value={centerFormData.city}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														city: value,
													}))
												}
												isRequired
											/>
											<div className="md:col-span-2">
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
													minRows={2}
												/>
											</div>
											<div className="md:col-span-2">
												<Textarea
													label="Description (Optional)"
													placeholder="Enter description"
													value={centerFormData.description}
													onValueChange={(value) =>
														setCenterFormData((prev) => ({
															...prev,
															description: value,
														}))
													}
													minRows={2}
												/>
											</div>
										</div>
									</div>

									{/* Bank Details */}
									<div>
										<h3 className="text-lg font-medium mb-4">
											Bank Details (Optional)
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<Input
												label="Account Name"
												placeholder="Enter account name"
												value={centerFormData.account_name}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														account_name: value,
													}))
												}
											/>
											<Input
												label="Account Number"
												placeholder="Enter account number"
												value={centerFormData.account_number}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														account_number: value,
													}))
												}
											/>
											<Input
												label="Bank Name"
												placeholder="Enter bank name"
												value={centerFormData.bank_name}
												onValueChange={(value) =>
													setCenterFormData((prev) => ({
														...prev,
														bank_name: value,
													}))
												}
											/>
										</div>
									</div>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleUpdateServiceCenterSubmit}
									isLoading={isUpdating}
									isDisabled={
										!centerFormData.name ||
										!centerFormData.address ||
										!centerFormData.phone ||
										!centerFormData.email ||
										!centerFormData.state ||
										!centerFormData.city
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
