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
	Card,
	CardBody,
	CardHeader,
	Divider,
	Tabs,
	Tab,
	SortDescriptor,
} from "@heroui/react";
import {
	InfoCard,
	InfoField,
	TableSkeleton,
} from "@/components/reususables/custom-ui";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { StatCard } from "@/components/atoms/StatCard";
import {
	ArrowLeft,
	Edit,
	Power,
	PowerOff,
	DollarSign,
	Calendar,
	TrendingUp,
	Eye,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";
import {
	getProductById,
	Product,
	updateProduct,
	activateProduct,
	deactivateProduct,
} from "@/lib/api/products";
import { getAuditLogsByResource, AuditLog } from "@/lib/api/audit";

const statusColorMap = {
	ACTIVE: "success" as const,
	INACTIVE: "danger" as const,
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

	// Fetch product data with SWR
	const {
		data: productResponse,
		error,
		isLoading: isLoadingData,
		mutate,
	} = useSWR(
		productId ? `/products/${productId}` : null,
		() => getProductById(productId),
		{ revalidateOnFocus: false }
	);

	// Handle both response formats: direct object or wrapped in data property
	const product =
		productResponse?.data || (productResponse as Product | undefined);

	// Fetch audit logs
	const { data: auditLogsResponse, isLoading: isLoadingAuditLogs } = useSWR(
		productId ? `/audit/product/${productId}` : null,
		() => getAuditLogsByResource("product", productId),
		{ revalidateOnFocus: false }
	);

	const auditLogs =
		auditLogsResponse?.data || (auditLogsResponse as AuditLog[] | undefined);

	// Transform audit logs into table rows
	interface AuditTableRow {
		id: string;
		action: string;
		field: string;
		oldValue: string;
		newValue: string;
		modifiedBy: string;
		modifiedAt: string;
		auditLog: AuditLog; // Full audit log for detail view
	}

	const auditTableData = useMemo(() => {
		if (!auditLogs) return [];

		const rows: AuditTableRow[] = [];

		auditLogs.forEach((log) => {
			const modifiedBy = log.performed_by
				? `${log.performed_by.name} (${log.performed_by.email})`
				: "Unknown";
			const modifiedAt = new Date(log.performed_at).toLocaleString();
			const action = log.action.replace(/_/g, " ").toUpperCase();

			// Extract field changes
			if (log.new_values) {
				const fields = ["name", "sapphire_cost", "repair_cost", "status"];

				fields.forEach((field) => {
					if (log.new_values[field] !== undefined) {
						const oldValue = log.old_values?.[field]
							? field.includes("cost")
								? `₦${log.old_values[field]}`
								: log.old_values[field]
							: "-";
						const newValue = field.includes("cost")
							? `₦${log.new_values[field]}`
							: log.new_values[field];

						rows.push({
							id: `${log.id}-${field}`,
							action,
							field: field.replace(/_/g, " ").toUpperCase(),
							oldValue,
							newValue,
							modifiedBy,
							modifiedAt,
							auditLog: log,
						});
					}
				});
			} else {
				// For actions without field changes
				rows.push({
					id: log.id,
					action,
					field: "-",
					oldValue: "-",
					newValue: "-",
					modifiedBy,
					modifiedAt,
					auditLog: log,
				});
			}
		});

		return rows;
	}, [auditLogs]);

	// Pagination and filter state for audit logs
	const [auditPage, setAuditPage] = useState(1);
	const [auditFilterValue, setAuditFilterValue] = useState("");
	const [auditSortDescriptor, setAuditSortDescriptor] =
		useState<SortDescriptor>({
			column: "modifiedAt",
			direction: "descending",
		});

	const rowsPerPage = 10;
	const auditPages = Math.ceil(auditTableData.length / rowsPerPage);
	const paginatedAuditData = auditTableData.slice(
		(auditPage - 1) * rowsPerPage,
		auditPage * rowsPerPage
	);

	// Define audit table columns
	const auditColumns: ColumnDef[] = [
		{
			name: "Action",
			uid: "action",
			sortable: true,
		},
		{
			name: "Field",
			uid: "field",
			sortable: true,
		},
		{
			name: "Old Value",
			uid: "oldValue",
			sortable: false,
		},
		{
			name: "New Value",
			uid: "newValue",
			sortable: false,
		},
		{
			name: "Modified By",
			uid: "modifiedBy",
			sortable: true,
		},
		{
			name: "Modified At",
			uid: "modifiedAt",
			sortable: true,
		},
		{
			name: "Actions",
			uid: "actions",
			sortable: false,
		},
	];

	// Render cell function for audit table
	const renderAuditCell = (row: AuditTableRow, columnKey: string) => {
		switch (columnKey) {
			case "action":
				return row.action;
			case "field":
				return row.field;
			case "oldValue":
				return row.oldValue;
			case "newValue":
				return row.newValue;
			case "modifiedBy":
				return row.modifiedBy;
			case "modifiedAt":
				return row.modifiedAt;
			case "actions":
				return (
					<Button
						isIconOnly
						size="sm"
						variant="light"
						onPress={() => {
							setSelectedAuditLog(row.auditLog);
							onAuditDetailModalOpen();
						}}
					>
						<Eye size={16} />
					</Button>
				);
			default:
				return null;
		}
	};

	// Export function for audit logs (optional)
	const exportAuditLogs = (data: AuditTableRow[]) => {
		console.log("Exporting audit logs:", data);
		// Implement export logic if needed
	};

	// Modal states
	const {
		isOpen: isEditNameModalOpen,
		onOpen: onEditNameModalOpen,
		onClose: onEditNameModalClose,
	} = useDisclosure();
	const {
		isOpen: isEditSapphireCostModalOpen,
		onOpen: onEditSapphireCostModalOpen,
		onClose: onEditSapphireCostModalClose,
	} = useDisclosure();
	const {
		isOpen: isEditRepairCostModalOpen,
		onOpen: onEditRepairCostModalOpen,
		onClose: onEditRepairCostModalClose,
	} = useDisclosure();
	const {
		isOpen: isAuditDetailModalOpen,
		onOpen: onAuditDetailModalOpen,
		onClose: onAuditDetailModalClose,
	} = useDisclosure();

	// Form states
	const [productName, setProductName] = useState("");
	const [sapphireCost, setSapphireCost] = useState("");
	const [repairCost, setRepairCost] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
		null
	);

	// Statistics
	const stats = useMemo(() => {
		if (!product)
			return {
				sapphireCost: 0,
				repairCost: 0,
				totalValue: 0,
				profitMargin: 0,
			};

		const sapphire = Number(product.sapphire_cost);
		const repair = Number(product.repair_cost);
		const totalValue = sapphire + repair;
		const profitMargin =
			sapphire > 0 ? Math.round(((sapphire - repair) / sapphire) * 100) : 0;

		return {
			sapphireCost: sapphire,
			repairCost: repair,
			totalValue,
			profitMargin,
		};
	}, [product]);

	// Handle edit product name
	const handleEditProductName = async () => {
		if (!productName.trim()) {
			showToast({ message: "Please enter a product name", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			await updateProduct(productId, { name: productName.trim() });
			showToast({
				message: "Product name updated successfully",
				type: "success",
			});
			onEditNameModalClose();
			setProductName("");
			mutate(); // Refresh product data
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update product name",
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle edit sapphire cost
	const handleEditSapphireCost = async () => {
		const cost = parseFloat(sapphireCost);
		if (isNaN(cost) || cost < 0) {
			showToast({ message: "Please enter a valid cost amount", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			await updateProduct(productId, { sapphire_cost: cost });
			showToast({
				message: "Sapphire cost updated successfully",
				type: "success",
			});
			onEditSapphireCostModalClose();
			setSapphireCost("");
			mutate(); // Refresh product data
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update sapphire cost",
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle edit repair cost
	const handleEditRepairCost = async () => {
		const cost = parseFloat(repairCost);
		if (isNaN(cost) || cost < 0) {
			showToast({ message: "Please enter a valid cost amount", type: "error" });
			return;
		}

		setIsLoading(true);
		try {
			await updateProduct(productId, { repair_cost: cost });
			showToast({
				message: "Repair cost updated successfully",
				type: "success",
			});
			onEditRepairCostModalClose();
			setRepairCost("");
			mutate(); // Refresh product data
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update repair cost",
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle toggle product status
	const handleToggleProductStatus = async () => {
		if (!product) return;

		setIsLoading(true);
		try {
			if (product.status === "ACTIVE") {
				await deactivateProduct(productId);
			} else {
				await activateProduct(productId);
			}
			showToast({
				message: `Product ${
					product.status === "ACTIVE" ? "disabled" : "enabled"
				} successfully`,
				type: "success",
			});
			mutate(); // Refresh product data
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to update product status",
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Loading state
	if (isLoadingData) {
		return <TableSkeleton columns={4} />;
	}

	// Error state
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-96">
				<p className="text-lg text-gray-500">Failed to load product</p>
				<Button
					color="primary"
					variant="flat"
					onPress={() => router.back()}
					className="mt-4"
				>
					Go Back
				</Button>
			</div>
		);
	}

	// Product not found
	if (!product) {
		return (
			<div className="flex flex-col items-center justify-center h-96">
				<p className="text-lg text-gray-500">Product not found</p>
				<Button
					color="primary"
					variant="flat"
					onPress={() => router.back()}
					className="mt-4"
				>
					Go Back
				</Button>
			</div>
		);
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
							onEditNameModalOpen();
						}}
					>
						Edit Name
					</Button>
					<Button
						color={product.status === "ACTIVE" ? "danger" : "success"}
						variant="flat"
						startContent={
							product.status === "ACTIVE" ? (
								<PowerOff size={16} />
							) : (
								<Power size={16} />
							)
						}
						onPress={handleToggleProductStatus}
						isLoading={isLoading}
					>
						{product.status === "ACTIVE" ? "Disable" : "Enable"}
					</Button>
				</div>
			</div>

			{/* Product Info Card */}
			<InfoCard title="Product Information">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<InfoField
						label="Product Name"
						value={product.name}
						endComponent={
							<Button
								size="sm"
								variant="light"
								isIconOnly
								onPress={() => {
									setProductName(product.name);
									onEditNameModalOpen();
								}}
							>
								<Edit size={14} />
							</Button>
						}
					/>
					<InfoField
						label="Status"
						value={product.status}
						endComponent={
							<Chip
								color={statusColorMap[product.status]}
								size="sm"
								variant="flat"
							>
								{product.status}
							</Chip>
						}
					/>
					<InfoField
						label="Created At"
						value={new Date(product.created_at).toLocaleDateString()}
					/>
					<InfoField
						label="Last Updated At"
						value={new Date(product.updated_at).toLocaleDateString()}
					/>
					<InfoField
						label="Sapphire Cost"
						value={`₦${Number(product.sapphire_cost).toLocaleString()}`}
						endComponent={
							<Button
								size="sm"
								variant="light"
								isIconOnly
								onPress={() => {
									setSapphireCost(product.sapphire_cost.toString());
									onEditSapphireCostModalOpen();
								}}
							>
								<Edit size={14} />
							</Button>
						}
					/>
					<InfoField
						label="Repair Cost"
						value={`₦${Number(product.repair_cost).toLocaleString()}`}
						endComponent={
							<Button
								size="sm"
								variant="light"
								isIconOnly
								onPress={() => {
									setRepairCost(product.repair_cost.toString());
									onEditRepairCostModalOpen();
								}}
							>
								<Edit size={14} />
							</Button>
						}
					/>
				</div>
			</InfoCard>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<StatCard
					title="Sapphire Cost"
					value={`₦${stats.sapphireCost.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
				<StatCard
					title="Repair Cost"
					value={`₦${stats.repairCost.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
			
			</div>

			{/* Audit Logs Section */}
			<div>
				<h3 className="text-lg font-semibold mb-4">Audit History</h3>
				<GenericTable<AuditTableRow>
					data={paginatedAuditData}
					columns={auditColumns}
					allCount={auditTableData.length}
					exportData={auditTableData}
					isLoading={isLoadingAuditLogs}
					filterValue={auditFilterValue}
					onFilterChange={setAuditFilterValue}
					sortDescriptor={auditSortDescriptor}
					onSortChange={setAuditSortDescriptor}
					page={auditPage}
					pages={auditPages}
					onPageChange={setAuditPage}
					exportFn={exportAuditLogs}
					renderCell={renderAuditCell}
					hasNoRecords={auditTableData.length === 0}
					searchPlaceholder="Search audit logs..."
				/>
			</div>

			{/* Edit Product Name Modal */}
			<Modal
				isOpen={isEditNameModalOpen}
				onClose={onEditNameModalClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Product Name</ModalHeader>
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
								<Button variant="light" onPress={onEditNameModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditProductName}
									isLoading={isLoading}
								>
									Save Changes
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Edit Sapphire Cost Modal */}
			<Modal
				isOpen={isEditSapphireCostModalOpen}
				onClose={onEditSapphireCostModalClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Sapphire Cost</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Sapphire Cost (₦)"
										placeholder="e.g., 150000"
										value={sapphireCost}
										onValueChange={setSapphireCost}
										type="number"
										isRequired
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditSapphireCostModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditSapphireCost}
									isLoading={isLoading}
								>
									Save Changes
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Edit Repair Cost Modal */}
			<Modal
				isOpen={isEditRepairCostModalOpen}
				onClose={onEditRepairCostModalClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Edit Repair Cost</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<Input
										label="Repair Cost (₦)"
										placeholder="e.g., 25000"
										value={repairCost}
										onValueChange={setRepairCost}
										type="number"
										isRequired
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onEditRepairCostModalClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleEditRepairCost}
									isLoading={isLoading}
								>
									Save Changes
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Audit Detail Modal */}
			<Modal
				isOpen={isAuditDetailModalOpen}
				onClose={onAuditDetailModalClose}
				size="2xl"
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader>Audit Log Details</ModalHeader>
							<ModalBody>
								{selectedAuditLog && (
									<div className="space-y-4">
										{/* Action & Timestamp */}
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
													Action
												</p>
												<p className="text-base font-medium">
													{selectedAuditLog.action
														.replace(/_/g, " ")
														.toUpperCase()}
												</p>
											</div>
											<div>
												<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
													Performed At
												</p>
												<p className="text-base font-medium">
													{new Date(
														selectedAuditLog.performed_at
													).toLocaleString()}
												</p>
											</div>
										</div>

										<Divider />

										{/* User Information */}
										<div>
											<h4 className="text-md font-semibold mb-3">
												Performed By
											</h4>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
														Name
													</p>
													<p className="text-base">
														{selectedAuditLog.performed_by?.name || "Unknown"}
													</p>
												</div>
												<div>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
														Email
													</p>
													<p className="text-base">
														{selectedAuditLog.performed_by?.email || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
														User ID
													</p>
													<p className="text-xs font-mono">
														{selectedAuditLog.performed_by_id}
													</p>
												</div>
												<div>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
														Role
													</p>
													<p className="text-base">
														{selectedAuditLog.performed_by?.role || "N/A"}
													</p>
												</div>
											</div>
										</div>

										<Divider />

										{/* Technical Information */}
										<div>
											<h4 className="text-md font-semibold mb-3">
												Technical Details
											</h4>
											<div className="space-y-3">
												<div>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
														IP Address
													</p>
													<p className="text-sm font-mono">
														{selectedAuditLog.ip_address || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
														User Agent
													</p>
													<p className="text-sm break-all">
														{selectedAuditLog.user_agent || "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
														Resource ID
													</p>
													<p className="text-xs font-mono">
														{selectedAuditLog.resource_id}
													</p>
												</div>
											</div>
										</div>

										{/* Changes */}
										{selectedAuditLog.new_values && (
											<>
												<Divider />
												<div>
													<h4 className="text-md font-semibold mb-3">
														Changes Made
													</h4>
													<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
														{selectedAuditLog.old_values && (
															<div>
																<p className="text-sm font-semibold text-red-600 dark:text-red-400">
																	Old Values:
																</p>
																<pre className="text-xs mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-auto">
																	{JSON.stringify(
																		selectedAuditLog.old_values,
																		null,
																		2
																	)}
																</pre>
															</div>
														)}
														<div>
															<p className="text-sm font-semibold text-green-600 dark:text-green-400">
																New Values:
															</p>
															<pre className="text-xs mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-auto">
																{JSON.stringify(
																	selectedAuditLog.new_values,
																	null,
																	2
																)}
															</pre>
														</div>
													</div>
												</div>
											</>
										)}
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button color="primary" onPress={onClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
