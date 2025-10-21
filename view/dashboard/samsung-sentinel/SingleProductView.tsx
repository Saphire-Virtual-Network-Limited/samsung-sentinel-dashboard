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
	Wrench,
	DollarSign,
	History,
	Calendar,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";
import {
	useSamsungSentinelProduct,
	type RepairType,
	type Product,
	type AuditHistory,
} from "@/hooks/shared/useSamsungSentinelProduct";

const repairTypeColumns: ColumnDef[] = [
	{ name: "Repair Type", uid: "name", sortable: true },
	{ name: "Category", uid: "category", sortable: true },
	{ name: "Price (₦)", uid: "price", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created By", uid: "createdBy", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const auditColumns: ColumnDef[] = [
	{ name: "Action", uid: "action", sortable: true },
	{ name: "Field", uid: "field", sortable: true },
	{ name: "Old Value", uid: "oldValue", sortable: true },
	{ name: "New Value", uid: "newValue", sortable: true },
	{ name: "Modified By", uid: "modifiedBy", sortable: true },
	{ name: "Modified At", uid: "modifiedAt", sortable: true },
];

const repairCategories = [
	{ label: "Screen", value: "screen" },
	{ label: "Camera", value: "camera" },
	{ label: "Battery", value: "battery" },
	{ label: "Charging Port", value: "charging_port" },
	{ label: "Speaker", value: "speaker" },
	{ label: "Microphone", value: "microphone" },
	{ label: "Button", value: "button" },
	{ label: "Software", value: "software" },
	{ label: "Other", value: "other" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "danger" as const,
};

interface SingleProductViewProps {
	productId: string;
}

export default function SingleProductView({
	productId,
}: SingleProductViewProps) {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	// Fetch product data using the hook
	const {
		product,
		auditHistory,
		isLoading: isLoadingData,
		isError,
		mutate,
	} = useSamsungSentinelProduct(productId);

	// Modal states
	const {
		isOpen: isEditModalOpen,
		onOpen: onEditModalOpen,
		onClose: onEditModalClose,
	} = useDisclosure();
	const {
		isOpen: isAddRepairModalOpen,
		onOpen: onAddRepairModalOpen,
		onClose: onAddRepairModalClose,
	} = useDisclosure();
	const {
		isOpen: isEditRepairModalOpen,
		onOpen: onEditRepairModalOpen,
		onClose: onEditRepairModalClose,
	} = useDisclosure();

	// Form states
	const [productName, setProductName] = useState("");
	const [repairFormData, setRepairFormData] = useState({
		name: "",
		category: "",
		price: "",
	});
	const [selectedRepairType, setSelectedRepairType] =
		useState<RepairType | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Statistics
	const stats = useMemo(() => {
		if (!product)
			return {
				totalRepairTypes: 0,
				activeRepairTypes: 0,
				averagePrice: 0,
				totalValue: 0,
			};

		return {
			totalRepairTypes: product.repairTypes.length,
			activeRepairTypes: product.repairTypes.filter(
				(rt) => rt.status === "active"
			).length,
			averagePrice: Math.round(
				product.repairTypes.reduce((sum, rt) => sum + rt.price, 0) /
					product.repairTypes.length || 0
			),
			totalValue: product.repairTypes.reduce((sum, rt) => sum + rt.price, 0),
		};
	}, [product]);

	// Handle edit product
	const handleEditProduct = async () => {
		if (!productName.trim()) {
			showToast({ message: "Please enter a product name", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			// API call to update product name
			showToast({ message: "Product updated successfully", type: "success" });
			onEditModalClose();
			setProductName("");
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to update product", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle add repair type
	const handleAddRepairType = async () => {
		if (
			!repairFormData.name.trim() ||
			!repairFormData.category ||
			!repairFormData.price
		) {
			showToast({ message: "Please fill in all fields", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			// API call to add repair type
			showToast({ message: "Repair type added successfully", type: "success" });
			onAddRepairModalClose();
			setRepairFormData({ name: "", category: "", price: "" });
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to add repair type", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle edit repair type
	const handleEditRepairType = async () => {
		if (
			!selectedRepairType ||
			!repairFormData.name.trim() ||
			!repairFormData.category ||
			!repairFormData.price
		) {
			showToast({ message: "Please fill in all fields", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			// API call to update repair type
			showToast({
				message: "Repair type updated successfully",
				type: "success",
			});
			onEditRepairModalClose();
			setSelectedRepairType(null);
			setRepairFormData({ name: "", category: "", price: "" });
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to update repair type", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle toggle product status
	const handleToggleProductStatus = async () => {
		setIsLoading(true);
		try {
			// API call to toggle product status
			showToast({
				message: `Product ${
					product!.status === "active" ? "disabled" : "enabled"
				} successfully`,
				type: "success",
			});
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to update product status", type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	// Handle toggle repair type status
	const handleToggleRepairTypeStatus = async (
		repairTypeId: string,
		currentStatus: string
	) => {
		try {
			// API call to toggle repair type status
			showToast({
				message: `Repair type ${
					currentStatus === "active" ? "disabled" : "enabled"
				} successfully`,
				type: "success",
			});
			mutate(); // Refresh product data
		} catch (error) {
			showToast({
				message: "Failed to update repair type status",
				type: "error",
			});
		}
	};

	// Handle delete repair type
	const handleDeleteRepairType = async (repairTypeId: string) => {
		try {
			// API call to delete repair type
			showToast({
				message: "Repair type deleted successfully",
				type: "success",
			});
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to delete repair type", type: "error" });
		}
	};

	// Render repair type cell
	const renderRepairTypeCell = (row: RepairType, key: string) => {
		switch (key) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm">{row.name}</p>
						<p className="text-xs text-default-400">ID: {row.id}</p>
					</div>
				);
			case "category":
				const categoryLabel =
					repairCategories.find((c) => c.value === row.category)?.label ||
					row.category;
				return (
					<Chip color="primary" variant="flat" size="sm" className="capitalize">
						{categoryLabel}
					</Chip>
				);
			case "price":
				return (
					<div className="flex items-center gap-1">
						<DollarSign size={12} className="text-success" />
						<span className="text-sm font-medium">
							₦{row.price.toLocaleString()}
						</span>
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
									key="edit"
									startContent={<Edit size={16} />}
									onPress={() => {
										setSelectedRepairType(row);
										setRepairFormData({
											name: row.name,
											category: row.category,
											price: row.price.toString(),
										});
										onEditRepairModalOpen();
									}}
								>
									Edit
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
									onPress={() =>
										handleToggleRepairTypeStatus(row.id, row.status)
									}
								>
									{row.status === "active" ? "Disable" : "Enable"}
								</DropdownItem>
								<DropdownItem
									key="delete"
									className="text-danger"
									color="danger"
									startContent={<Trash2 size={16} />}
									onPress={() => handleDeleteRepairType(row.id)}
								>
									Delete
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return <span className="text-sm">{row[key as keyof RepairType]}</span>;
		}
	};

	// Render audit history cell
	const renderAuditCell = (row: AuditHistory, key: string) => {
		switch (key) {
			case "action":
				const actionColor =
					row.action === "CREATE"
						? "success"
						: row.action === "UPDATE"
						? "warning"
						: row.action === "DELETE"
						? "danger"
						: "default";
				return (
					<Chip color={actionColor} variant="flat" size="sm">
						{row.action}
					</Chip>
				);
			case "modifiedAt":
				return (
					<p className="text-sm">{new Date(row.modifiedAt).toLocaleString()}</p>
				);
			default:
				return (
					<span className="text-sm">{row[key as keyof AuditHistory]}</span>
				);
		}
	};

	// Loading state
	if (isLoadingData) {
		return <LoadingSpinner />;
	}

	// Error state
	if (isError) {
		return (
			<NotFound title="Error Loading Product" onGoBack={() => router.back()} />
		);
	}

	// Product not found
	if (!product) {
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
						<h1 className="text-2xl font-bold">{product.name}</h1>
						<p className="text-sm text-default-500">Product ID: {product.id}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						color="warning"
						variant="flat"
						startContent={<Edit size={16} />}
						onPress={() => {
							setProductName(product.name);
							onEditModalOpen();
						}}
					>
						Edit Product
					</Button>
					<Button
						color={product.status === "active" ? "danger" : "success"}
						variant="flat"
						startContent={
							product.status === "active" ? (
								<PowerOff size={16} />
							) : (
								<Power size={16} />
							)
						}
						onPress={handleToggleProductStatus}
						isLoading={isLoading}
					>
						{product.status === "active" ? "Disable" : "Enable"}
					</Button>
				</div>
			</div>

			{/* Product Info Card */}
			<InfoCard title="Product Information">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<InfoField label="Product Name" value={product.name} />
					<InfoField
						label="Status"
						value={product.status}
						endComponent={<StatusChip status={product.status} />}
					/>
					<InfoField label="Created By" value={product.createdBy} />
					<InfoField
						label="Created At"
						value={new Date(product.createdAt).toLocaleDateString()}
					/>
					<InfoField label="Last Updated By" value={product.lastUpdatedBy} />
					<InfoField
						label="Last Updated At"
						value={new Date(product.lastUpdatedAt).toLocaleDateString()}
					/>
					<InfoField
						label="Total Repair Types"
						value={product.repairTypesCount}
						endComponent={
							<Chip color="primary" variant="flat" size="sm">
								{product.repairTypesCount}
							</Chip>
						}
					/>
				</div>
			</InfoCard>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Total Repair Types"
					value={stats.totalRepairTypes.toString()}
					icon={<Wrench className="w-5 h-5" />}
				/>
				<StatCard
					title="Active Repair Types"
					value={stats.activeRepairTypes.toString()}
					icon={<Power className="w-5 h-5" />}
				/>
				<StatCard
					title="Average Price"
					value={`₦${stats.averagePrice.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Value"
					value={`₦${stats.totalValue.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
			</div>

			{/* Tabs */}
			<Tabs aria-label="Product details" className="w-full">
				<Tab key="repair-types" title="Repair Types">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-semibold">Repair Types</h3>
							<Button
								color="primary"
								startContent={<Plus size={16} />}
								onPress={onAddRepairModalOpen}
							>
								Add Repair Type
							</Button>
						</div>

						<GenericTable<RepairType>
							columns={repairTypeColumns}
							data={product.repairTypes}
							allCount={product.repairTypes.length}
							exportData={product.repairTypes}
							isLoading={false}
							renderCell={renderRepairTypeCell}
							hasNoRecords={product.repairTypes.length === 0}
							sortDescriptor={{ column: "createdAt", direction: "descending" }}
							onSortChange={() => {}}
							page={1}
							pages={1}
							onPageChange={() => {}}
							filterValue=""
							onFilterChange={() => {}}
							searchPlaceholder="Search repair types..."
							showRowsPerPageSelector={true}
							exportFn={(data) => {
								console.log("Exporting repair types:", data);
							}}
						/>
					</div>
				</Tab>

				<Tab key="audit-history" title="Audit History">
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Audit History</h3>

						<GenericTable<AuditHistory>
							columns={auditColumns}
							data={auditHistory}
							allCount={auditHistory.length}
							exportData={auditHistory}
							isLoading={false}
							renderCell={renderAuditCell}
							hasNoRecords={auditHistory.length === 0}
							sortDescriptor={{ column: "modifiedAt", direction: "descending" }}
							onSortChange={() => {}}
							page={1}
							pages={1}
							onPageChange={() => {}}
							filterValue=""
							onFilterChange={() => {}}
							searchPlaceholder="Search audit history..."
							showRowsPerPageSelector={true}
							exportFn={(data) => {
								console.log("Exporting audit history:", data);
							}}
						/>
					</div>
				</Tab>
			</Tabs>

			{/* Edit Product Modal */}
			<Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Product</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Product Name"
										placeholder="e.g., Samsung Galaxy A05"
										value={productName}
										onValueChange={setProductName}
										isRequired
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditProduct}
									isLoading={isLoading}
								>
									Save Changes
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Add Repair Type Modal */}
			<Modal
				isOpen={isAddRepairModalOpen}
				onClose={onAddRepairModalClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Add Repair Type</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Repair Type Name"
										placeholder="e.g., Screen Replacement"
										value={repairFormData.name}
										onValueChange={(value) =>
											setRepairFormData((prev) => ({ ...prev, name: value }))
										}
										isRequired
									/>
									<Select
										label="Category"
										placeholder="Select repair category"
										selectedKeys={
											repairFormData.category ? [repairFormData.category] : []
										}
										onSelectionChange={(keys) => {
											const key = Array.from(keys)[0] as string;
											setRepairFormData((prev) => ({ ...prev, category: key }));
										}}
										isRequired
									>
										{repairCategories.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
											</SelectItem>
										))}
									</Select>
									<Input
										label="Price (₦)"
										placeholder="e.g., 25000"
										value={repairFormData.price}
										onValueChange={(value) =>
											setRepairFormData((prev) => ({ ...prev, price: value }))
										}
										type="number"
										isRequired
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onAddRepairModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleAddRepairType}
									isLoading={isLoading}
								>
									Add Repair Type
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Edit Repair Type Modal */}
			<Modal
				isOpen={isEditRepairModalOpen}
				onClose={onEditRepairModalClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Repair Type</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Repair Type Name"
										placeholder="e.g., Screen Replacement"
										value={repairFormData.name}
										onValueChange={(value) =>
											setRepairFormData((prev) => ({ ...prev, name: value }))
										}
										isRequired
									/>
									<Select
										label="Category"
										placeholder="Select repair category"
										selectedKeys={
											repairFormData.category ? [repairFormData.category] : []
										}
										onSelectionChange={(keys) => {
											const key = Array.from(keys)[0] as string;
											setRepairFormData((prev) => ({ ...prev, category: key }));
										}}
										isRequired
									>
										{repairCategories.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
											</SelectItem>
										))}
									</Select>
									<Input
										label="Price (₦)"
										placeholder="e.g., 25000"
										value={repairFormData.price}
										onValueChange={(value) =>
											setRepairFormData((prev) => ({ ...prev, price: value }))
										}
										type="number"
										isRequired
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditRepairModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditRepairType}
									isLoading={isLoading}
								>
									Save Changes
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
