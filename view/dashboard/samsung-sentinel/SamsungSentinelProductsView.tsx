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
	Smartphone,
	Users,
	Calendar,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";

interface Product {
	id: string;
	name: string;
	createdBy: string;
	createdAt: string;
	lastUpdatedAt: string;
	lastUpdatedBy: string;
	status: "active" | "inactive";
	repairTypesCount: number;
}

const columns: ColumnDef[] = [
	{ name: "Product Name", uid: "name", sortable: true },
	{ name: "Created By", uid: "createdBy", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Last Updated", uid: "lastUpdatedAt", sortable: true },
	{ name: "Last Updated By", uid: "lastUpdatedBy", sortable: true },
	{ name: "Repair Types", uid: "repairTypesCount", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	active: "success" as const,
	inactive: "danger" as const,
};

export default function SamsungSentinelProductsView() {
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
	const [productName, setProductName] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	// Filter and selection states (pagination/sorting handled by GenericTable)
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// Mock data
	const products: Product[] = useMemo(
		() => [
			{
				id: "prod_001",
				name: "Samsung Galaxy A05",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-08-15T10:30:00Z",
				lastUpdatedAt: "2024-10-01T14:20:00Z",
				lastUpdatedBy: "manager@sapphire.com",
				status: "active",
				repairTypesCount: 8,
			},
			{
				id: "prod_002",
				name: "Samsung Galaxy A06",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-08-20T09:15:00Z",
				lastUpdatedAt: "2024-09-28T11:45:00Z",
				lastUpdatedBy: "admin@sapphire.com",
				status: "active",
				repairTypesCount: 7,
			},
			{
				id: "prod_003",
				name: "Samsung Galaxy A07",
				createdBy: "manager@sapphire.com",
				createdAt: "2024-09-01T16:20:00Z",
				lastUpdatedAt: "2024-10-05T09:30:00Z",
				lastUpdatedBy: "operator@sapphire.com",
				status: "active",
				repairTypesCount: 6,
			},
			{
				id: "prod_004",
				name: "Samsung Galaxy A08",
				createdBy: "admin@sapphire.com",
				createdAt: "2024-09-15T13:10:00Z",
				lastUpdatedAt: "2024-09-20T10:15:00Z",
				lastUpdatedBy: "admin@sapphire.com",
				status: "inactive",
				repairTypesCount: 5,
			},
		],
		[]
	);

	// Let GenericTable handle filtering internally

	// Statistics
	const stats = useMemo(
		() => ({
			totalProducts: products.length,
			activeProducts: products.filter((p) => p.status === "active").length,
			totalRepairTypes: products.reduce(
				(sum, p) => sum + p.repairTypesCount,
				0
			),
		}),
		[products]
	);

	// Sort handling managed by GenericTable

	const handleCreateProduct = async () => {
		if (!productName.trim()) {
			showToast({ message: "Please enter a product name", type: "error" });
			return;
		}

		setIsCreating(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({ message: "Product created successfully", type: "success" });
			setProductName("");
			onCreateModalClose();
		} catch (error) {
			showToast({ message: "Failed to create product", type: "error" });
		} finally {
			setIsCreating(false);
		}
	};

	const handleToggleStatus = async (
		productId: string,
		currentStatus: string
	) => {
		const newStatus = currentStatus === "active" ? "inactive" : "active";
		const action = newStatus === "active" ? "enabled" : "disabled";

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({ message: `Product ${action} successfully`, type: "success" });
		} catch (error) {
			showToast({
				message: `Failed to ${
					newStatus === "active" ? "enable" : "disable"
				} product`,
				type: "error",
			});
		}
	};

	const handleDelete = async (productId: string) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			showToast({ message: "Product deleted successfully", type: "success" });
		} catch (error) {
			showToast({ message: "Failed to delete product", type: "error" });
		}
	};

	// Bulk actions
	const handleBulkEnable = async () => {
		if (selectedKeys.size === 0) return;
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} products enabled successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to enable products", type: "error" });
		}
	};

	const handleBulkDisable = async () => {
		if (selectedKeys.size === 0) return;
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			showToast({
				message: `${selectedKeys.size} products disabled successfully`,
				type: "success",
			});
			setSelectedKeys(new Set());
		} catch (error) {
			showToast({ message: "Failed to disable products", type: "error" });
		}
	};

	// Selection handler
	const handleSelectionChange = (keys: any) => {
		if (keys === "all") {
			if (selectedKeys.size === products.length) {
				setSelectedKeys(new Set());
			} else {
				setSelectedKeys(new Set(products.map((item: Product) => item.id)));
			}
		} else {
			setSelectedKeys(new Set(Array.from(keys)));
		}
	};

	// Export function
	const exportFn = async (data: Product[]) => {
		// Implementation for export functionality
		console.log("Exporting products:", data);
	};

	// Render cell content
	const renderCell = (row: Product, key: string) => {
		switch (key) {
			case "name":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm capitalize">{row.name}</p>
						<p className="text-bold text-xs capitalize text-default-400">
							ID: {row.id}
						</p>
					</div>
				);
			case "createdAt":
			case "lastUpdatedAt":
				return (
					<p className="text-sm">{new Date(row[key]).toLocaleDateString()}</p>
				);
			case "repairTypesCount":
				return (
					<Chip color="primary" variant="flat" size="sm">
						{row.repairTypesCount} types
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
											`/access/${role}/samsung-sentinel/products/${row.id}`
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
									Edit Product
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
									{row.status === "active" ? "Disable" : "Enable"}
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
		{ name: "Inactive", uid: "inactive" },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div></div>
				<div className="flex items-center gap-2">
					{selectedKeys.size > 0 && (
						<>
							<Button
								color="success"
								variant="flat"
								startContent={<Power size={16} />}
								onPress={handleBulkEnable}
								size="sm"
							>
								Enable ({selectedKeys.size})
							</Button>
							<Button
								color="warning"
								variant="flat"
								startContent={<PowerOff size={16} />}
								onPress={handleBulkDisable}
								size="sm"
							>
								Disable ({selectedKeys.size})
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
						Create Product
					</Button>
				</div>
			</div>
			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<StatCard
					title="Total Products"
					value={stats.totalProducts.toString()}
					icon={<Smartphone className="w-5 h-5" />}
				/>
				<StatCard
					title="Active Products"
					value={stats.activeProducts.toString()}
					icon={<Power className="w-5 h-5" />}
				/>
				<StatCard
					title="Total Repair Types"
					value={stats.totalRepairTypes.toString()}
					icon={<Users className="w-5 h-5" />}
				/>
			</div>
			{/* Products Table */}
			<GenericTable<Product>
				columns={columns}
				data={products}
				allCount={products.length}
				exportData={products}
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
				hasNoRecords={products.length === 0}
				searchPlaceholder="Search products by name, created by, or updated by..."
				selectedKeys={selectedKeys}
				onSelectionChange={handleSelectionChange}
				selectionMode="multiple"
			/>{" "}
			{/* Create Product Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Create New Product</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Product Name"
										placeholder="e.g., Samsung Galaxy A09"
										value={productName}
										onValueChange={setProductName}
										isRequired
									/>
									<p className="text-sm text-gray-600">
										After creating the product, you can add repair types and
										configure pricing.
									</p>
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
									onPress={handleCreateProduct}
									isLoading={isCreating}
									isDisabled={!productName.trim()}
								>
									{isCreating ? "Creating..." : "Create Product"}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
