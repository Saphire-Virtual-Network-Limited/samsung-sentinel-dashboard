"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
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
	DollarSign,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";
import {
	getAllProducts,
	Product,
	createProduct,
	updateProduct,
	deleteProduct,
	activateProduct,
	deactivateProduct,
} from "@/lib/api/products";
import { TableSkeleton } from "@/components/reususables/custom-ui";

const columns: ColumnDef[] = [
	{ name: "Product Name", uid: "name", sortable: true },
	{ name: "Sapphire Cost", uid: "sapphire_cost", sortable: true },
	{ name: "Repair Cost", uid: "repair_cost", sortable: true },
	{ name: "Created At", uid: "created_at", sortable: true },
	{ name: "Last Updated", uid: "updated_at", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Actions", uid: "actions" },
];

const statusColorMap = {
	ACTIVE: "success" as const,
	INACTIVE: "danger" as const,
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
	const [sapphireCost, setSapphireCost] = useState("");
	const [repairCost, setRepairCost] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	// Filter and selection states
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(25);
	const [dataLimit, setDataLimit] = useState(100);

	// Fetch all products once
	const {
		data: allProductsResponse,
		error,
		isLoading,
		mutate,
	} = useSWR(
		["/products/all", dataLimit],
		() =>
			getAllProducts({
				page: 1,
				limit: dataLimit,
			}),
		{
			revalidateOnFocus: false,
			onSuccess: (data) => {
				// If actual total is more than current limit, update limit and refetch
				if (data?.total && data.total > dataLimit) {
					setDataLimit(data.total);
				}
			},
		}
	);

	// All products from API
	const allProducts = useMemo(
		() => allProductsResponse?.data || [],
		[allProductsResponse?.data]
	);

	// Client-side filtering
	const filteredProducts = useMemo(() => {
		let filtered = [...allProducts];

		// Apply search filter
		if (filterValue) {
			const searchLower = filterValue.toLowerCase();
			filtered = filtered.filter((p) =>
				p.name.toLowerCase().includes(searchLower)
			);
		}

		// Apply status filter
		if (statusFilter.size > 0) {
			const selectedStatus = Array.from(statusFilter)[0];
			filtered = filtered.filter((p) => p.status === selectedStatus);
		}

		return filtered;
	}, [allProducts, filterValue, statusFilter]);

	// Paginated products for table display
	const products = useMemo(() => {
		const start = (page - 1) * limit;
		const end = start + limit;
		return filteredProducts.slice(start, end);
	}, [filteredProducts, page, limit]);

	const totalProducts = filteredProducts.length;
	const pages = Math.ceil(totalProducts / limit) || 1;

	// Statistics (calculated from all products, not filtered)
	const stats = useMemo(
		() => ({
			totalProducts: allProductsResponse?.total || 0,
			activeProducts: allProducts.filter((p) => p.status === "ACTIVE").length,
			averageSapphireCost:
				allProducts.length > 0
					? allProducts.reduce((sum, p) => sum + Number(p.sapphire_cost), 0) /
					  allProducts.length
					: 0,
			averageRepairCost:
				allProducts.length > 0
					? allProducts.reduce((sum, p) => sum + Number(p.repair_cost), 0) /
					  allProducts.length
					: 0,
		}),
		[allProducts, allProductsResponse?.total]
	);

	// Sort handling managed by GenericTable

	const handleCreateProduct = async () => {
		if (!productName.trim()) {
			showToast({ message: "Please enter a product name", type: "error" });
			return;
		}

		if (!sapphireCost || Number(sapphireCost) <= 0) {
			showToast({
				message: "Please enter a valid sapphire cost",
				type: "error",
			});
			return;
		}

		if (!repairCost || Number(repairCost) <= 0) {
			showToast({ message: "Please enter a valid repair cost", type: "error" });
			return;
		}

		setIsCreating(true);
		try {
			await createProduct({
				name: productName.trim(),
				sapphire_cost: Number(sapphireCost),
				repair_cost: Number(repairCost),
			});
			showToast({ message: "Product created successfully", type: "success" });
			setProductName("");
			setSapphireCost("");
			setRepairCost("");
			onCreateModalClose();
			mutate(); // Refresh the products list
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to create product",
				type: "error",
			});
		} finally {
			setIsCreating(false);
		}
	};

	const handleToggleStatus = async (
		productId: string,
		currentStatus: string
	) => {
		const action = currentStatus === "ACTIVE" ? "disabled" : "enabled";

		try {
			if (currentStatus === "ACTIVE") {
				await deactivateProduct(productId);
			} else {
				await activateProduct(productId);
			}
			showToast({ message: `Product ${action} successfully`, type: "success" });
			mutate(); // Refresh the products list
		} catch (error: any) {
			showToast({
				message: error?.message || `Failed to ${action} product`,
				type: "error",
			});
		}
	};

	const handleDelete = async (productId: string) => {
		try {
			await deleteProduct(productId);
			showToast({ message: "Product deleted successfully", type: "success" });
			mutate(); // Refresh the products list
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to delete product",
				type: "error",
			});
		}
	};

	// Bulk actions
	const handleBulkEnable = async () => {
		if (selectedKeys.size === 0) return;
		try {
			const productIds = Array.from(selectedKeys);
			const results = await Promise.allSettled(
				productIds.map((id) => activateProduct(id as string))
			);

			const successful = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;

			if (failed > 0) {
				showToast({
					message: `${successful} products enabled, ${failed} failed`,
					type: "warning",
				});
			} else {
				showToast({
					message: `${successful} products enabled successfully`,
					type: "success",
				});
			}

			setSelectedKeys(new Set());
			mutate();
		} catch (error) {
			showToast({ message: "Failed to enable products", type: "error" });
		}
	};

	const handleBulkDisable = async () => {
		if (selectedKeys.size === 0) return;
		try {
			const productIds = Array.from(selectedKeys);
			const results = await Promise.allSettled(
				productIds.map((id) => deactivateProduct(id as string))
			);

			const successful = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;

			if (failed > 0) {
				showToast({
					message: `${successful} products disabled, ${failed} failed`,
					type: "warning",
				});
			} else {
				showToast({
					message: `${successful} products disabled successfully`,
					type: "success",
				});
			}

			setSelectedKeys(new Set());
			mutate();
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
		try {
			const ExcelJS = await import("exceljs");
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Products");

			// Define columns
			worksheet.columns = [
				{ header: "Product ID", key: "id", width: 40 },
				{ header: "Product Name", key: "name", width: 30 },
				{ header: "Sapphire Cost (₦)", key: "sapphire_cost", width: 20 },
				{ header: "Repair Cost (₦)", key: "repair_cost", width: 20 },
				{ header: "Status", key: "status", width: 15 },
				{ header: "Created At", key: "created_at", width: 20 },
				{ header: "Updated At", key: "updated_at", width: 20 },
			];

			// Style header row
			worksheet.getRow(1).font = { bold: true };
			worksheet.getRow(1).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FF4472C4" },
			};
			worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

			// Add data
			data.forEach((product) => {
				worksheet.addRow({
					id: product.id,
					name: product.name,
					sapphire_cost: Number(product.sapphire_cost),
					repair_cost: Number(product.repair_cost),
					status: product.status,
					created_at: new Date(product.created_at).toLocaleDateString(),
					updated_at: new Date(product.updated_at).toLocaleDateString(),
				});
			});

			// Format currency columns
			worksheet.getColumn("sapphire_cost").numFmt = "#,##0.00";
			worksheet.getColumn("repair_cost").numFmt = "#,##0.00";

			// Generate buffer and download
			const buffer = await workbook.xlsx.writeBuffer();
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `products_export_${
				new Date().toISOString().split("T")[0]
			}.xlsx`;
			link.click();
			window.URL.revokeObjectURL(url);

			showToast({
				message: `Successfully exported ${data.length} products`,
				type: "success",
			});
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to export products",
				type: "error",
			});
		}
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
			case "created_at":
			case "updated_at":
				return (
					<p className="text-sm">{new Date(row[key]).toLocaleDateString()}</p>
				);
			case "sapphire_cost":
				return (
					<Chip color="success" variant="flat" size="sm">
						₦{Number(row.sapphire_cost).toLocaleString()}
					</Chip>
				);
			case "repair_cost":
				return (
					<Chip color="warning" variant="flat" size="sm">
						₦{Number(row.repair_cost).toLocaleString()}
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
										row.status === "ACTIVE" ? (
											<PowerOff size={16} />
										) : (
											<Power size={16} />
										)
									}
									onPress={() => handleToggleStatus(row.id, row.status)}
								>
									{row.status === "ACTIVE" ? "Disable" : "Enable"}
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
		{ name: "Active", uid: "ACTIVE" },
		{ name: "Inactive", uid: "INACTIVE" },
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
					title="Avg Sapphire Cost"
					value={`₦${stats.averageSapphireCost.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
				<StatCard
					title="Avg Repair Cost"
					value={`₦${stats.averageRepairCost.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
			</div>
			{/* Products Table */}
			{isLoading ? (
				<TableSkeleton columns={columns.length} />
			) : (
				<GenericTable<Product>
					columns={columns}
					data={products}
					allCount={totalProducts}
					exportData={filteredProducts}
					isLoading={isLoading}
					filterValue={filterValue}
					onFilterChange={setFilterValue}
					statusOptions={statusOptions}
					statusFilter={statusFilter}
					onStatusChange={setStatusFilter}
					statusColorMap={statusColorMap}
					showStatus={true}
					statusFilterMode="single"
					sortDescriptor={{ column: "created_at", direction: "descending" }}
					onSortChange={() => {}}
					page={page}
					pages={pages}
					onPageChange={setPage}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={products.length === 0}
					searchPlaceholder="Search products by name..."
					selectedKeys={selectedKeys}
					onSelectionChange={handleSelectionChange}
					selectionMode="multiple"
				/>
			)}
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
									<Input
										label="Sapphire Cost"
										placeholder="e.g., 5000"
										type="number"
										value={sapphireCost}
										onValueChange={setSapphireCost}
										isRequired
										startContent={
											<div className="pointer-events-none flex items-center">
												<span className="text-default-400 text-small">₦</span>
											</div>
										}
									/>
									<Input
										label="Repair Cost"
										placeholder="e.g., 12000"
										type="number"
										value={repairCost}
										onValueChange={setRepairCost}
										isRequired
										startContent={
											<div className="pointer-events-none flex items-center">
												<span className="text-default-400 text-small">₦</span>
											</div>
										}
									/>
									<p className="text-sm text-gray-600">
										Create a new product with pricing information. All fields
										are required.
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
									isDisabled={
										!productName.trim() || !sapphireCost || !repairCost
									}
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
