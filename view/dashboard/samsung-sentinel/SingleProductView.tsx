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
} from "@heroui/react";
import {
	InfoCard,
	InfoField,
	TableSkeleton,
} from "@/components/reususables/custom-ui";
import { StatCard } from "@/components/atoms/StatCard";
import {
	ArrowLeft,
	Edit,
	Power,
	PowerOff,
	DollarSign,
	Calendar,
	TrendingUp,
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

	const product = productResponse?.data;

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
