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
	Card,
	CardBody,
	CardHeader,
	Divider,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
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
	TrendingUp,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib";
import {
	useSamsungSentinelProduct,
	type Product,
	type AuditHistory,
} from "@/hooks/shared/useSamsungSentinelProduct";

const auditColumns: ColumnDef[] = [
	{ name: "Action", uid: "action", sortable: true },
	{ name: "Field", uid: "field", sortable: true },
	{ name: "Old Value", uid: "oldValue", sortable: true },
	{ name: "New Value", uid: "newValue", sortable: true },
	{ name: "Modified By", uid: "modifiedBy", sortable: true },
	{ name: "Modified At", uid: "modifiedAt", sortable: true },
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

	// Form states
	const [productName, setProductName] = useState("");
	const [sapphireCost, setSapphireCost] = useState("");
	const [repairCost, setRepairCost] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Statistics
	const stats = useMemo(() => {
		if (!product)
			return {
				sapphireCost: 0,
				repairCost: 0,
				totalValue: 0,
				profitMargin: 0,
			};

		const totalValue = product.sapphireCost + product.repairCost;
		const profitMargin =
			product.sapphireCost > 0
				? Math.round(
						((product.sapphireCost - product.repairCost) /
							product.sapphireCost) *
							100
				  )
				: 0;

		return {
			sapphireCost: product.sapphireCost,
			repairCost: product.repairCost,
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
			// API call to update product name
			showToast({
				message: "Product name updated successfully",
				type: "success",
			});
			onEditNameModalClose();
			setProductName("");
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to update product name", type: "error" });
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
			// API call to update sapphire cost
			showToast({
				message: "Sapphire cost updated successfully",
				type: "success",
			});
			onEditSapphireCostModalClose();
			setSapphireCost("");
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to update sapphire cost", type: "error" });
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
			// API call to update repair cost
			showToast({
				message: "Repair cost updated successfully",
				type: "success",
			});
			onEditRepairCostModalClose();
			setRepairCost("");
			mutate(); // Refresh product data
		} catch (error) {
			showToast({ message: "Failed to update repair cost", type: "error" });
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
							onEditNameModalOpen();
						}}
					>
						Edit Name
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
						label="Sapphire Cost"
						value={`₦${product.sapphireCost.toLocaleString()}`}
						endComponent={
							<Button
								size="sm"
								variant="light"
								isIconOnly
								onPress={() => {
									setSapphireCost(product.sapphireCost.toString());
									onEditSapphireCostModalOpen();
								}}
							>
								<Edit size={14} />
							</Button>
						}
					/>
					<InfoField
						label="Repair Cost"
						value={`₦${product.repairCost.toLocaleString()}`}
						endComponent={
							<Button
								size="sm"
								variant="light"
								isIconOnly
								onPress={() => {
									setRepairCost(product.repairCost.toString());
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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
				<StatCard
					title="Total Value"
					value={`₦${stats.totalValue.toLocaleString()}`}
					icon={<DollarSign className="w-5 h-5" />}
				/>
				<StatCard
					title="Profit Margin"
					value={`${stats.profitMargin}%`}
					icon={<TrendingUp className="w-5 h-5" />}
				/>
			</div>

			{/* Audit History */}
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
		</div>
	);
}
