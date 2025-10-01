"use client";

import React, { useState } from "react";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Checkbox,
	Chip,
} from "@heroui/react";
import SimpleTable from "@/components/reususables/custom-ui/SimpleTable";
import { Eye, DollarSign } from "lucide-react";
import { showToast } from "@/lib/showNotification";
import {
	useProcessedClaims,
	useProcessedClaimActions,
} from "@/hooks/samsung-partners/useProcessedClaims";
import { useRouter } from "next/navigation";

const UnpaidProcessedClaimsView = () => {
	const router = useRouter();
	const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
	const [selectAll, setSelectAll] = useState(false);

	const {
		isOpen: isPaymentModalOpen,
		onOpen: onPaymentModalOpen,
		onClose: onPaymentModalClose,
	} = useDisclosure();

	const { claims, isLoading, mutate } = useProcessedClaims({
		paymentStatus: "unpaid",
	});

	const { authorizePayment, generatePaymentReport } =
		useProcessedClaimActions();

	const columns = [
		{ key: "select", label: "" },
		{ key: "id", label: "Payment ID" },
		{ key: "claimId", label: "Claim ID" },
		{ key: "imei", label: "IMEI" },
		{ key: "customerName", label: "Customer Name" },
		{ key: "serviceCenter", label: "Service Center" },
		{ key: "deviceModel", label: "Device Model" },
		{ key: "repairCost", label: "Repair Cost" },
		{ key: "commissionAmount", label: "Commission" },
		{ key: "dateCompleted", label: "Date Completed" },
		{ key: "paymentStatus", label: "Payment Status" },
		{ key: "actions", label: "Actions" },
	];

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedClaims([]);
		} else {
			setSelectedClaims(claims.map((claim: any) => claim.id));
		}
		setSelectAll(!selectAll);
	};

	const handleSelectClaim = (claimId: string) => {
		setSelectedClaims((prev) => {
			if (prev.includes(claimId)) {
				return prev.filter((id) => id !== claimId);
			} else {
				return [...prev, claimId];
			}
		});
	};

	const handleAuthorizePayment = async () => {
		if (selectedClaims.length === 0) {
			showToast({
				type: "error",
				message: "Please select claims to authorize payment",
			});
			return;
		}

		try {
			await authorizePayment(selectedClaims);
			showToast({
				type: "success",
				message: `Payment authorized for ${selectedClaims.length} claims`,
			});
			setSelectedClaims([]);
			setSelectAll(false);
			onPaymentModalClose();
			mutate();
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to authorize payment",
			});
		}
	};

	const handleGenerateReport = async () => {
		if (selectedClaims.length === 0) {
			showToast({
				type: "error",
				message: "Please select claims to generate report",
			});
			return;
		}

		try {
			await generatePaymentReport(selectedClaims);
			showToast({
				type: "success",
				message: "Payment report generated successfully",
			});
		} catch (error) {
			showToast({
				type: "error",
				message: "Failed to generate report",
			});
		}
	};

	const handleViewClaim = (claimId: string) => {
		router.push(`/access/samsung-partners/repair-claims/view/${claimId}`);
	};

	const renderCell = (item: any, columnKey: string) => {
		switch (columnKey) {
			case "select":
				return (
					<Checkbox
						isSelected={selectedClaims.includes(item.id)}
						onValueChange={() => handleSelectClaim(item.id)}
					/>
				);
			case "repairCost":
				return `₦${item.repairCost?.toLocaleString()}`;
			case "commissionAmount":
				return `₦${item.commissionAmount?.toLocaleString()}`;
			case "dateCompleted":
				return new Date(item.dateCompleted).toLocaleDateString();
			case "paymentStatus":
				return (
					<Chip color="warning" variant="flat" size="sm">
						Unpaid
					</Chip>
				);
			case "actions":
				return (
					<div className="flex items-center gap-2">
						<Button
							isIconOnly
							size="sm"
							variant="light"
							onPress={() => handleViewClaim(item.claimId)}
						>
							<Eye size={16} />
						</Button>
					</div>
				);
			default:
				return item[columnKey];
		}
	};

	const totalCommission = selectedClaims.reduce((total, claimId) => {
		const claim = claims.find((c: any) => c.id === claimId);
		return total + (claim?.repairCost || 0) * 0.1; // 10% commission
	}, 0);

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Unpaid Processed Claims
				</h1>
				<p className="text-gray-600">
					Authorize payments for completed repair claims
				</p>
			</div>

			{/* Mass Actions */}
			<div className="flex flex-wrap items-center gap-4 mb-6">
				<div className="flex items-center gap-2">
					<Checkbox isSelected={selectAll} onValueChange={handleSelectAll}>
						Select All
					</Checkbox>
				</div>

				{selectedClaims.length > 0 && (
					<>
						<div className="text-sm text-gray-600">
							{selectedClaims.length} selected • Total: ₦
							{totalCommission.toLocaleString()}
						</div>
						<Button
							color="success"
							onPress={onPaymentModalOpen}
							startContent={<DollarSign size={18} />}
						>
							Authorize Payment ({selectedClaims.length})
						</Button>
						<Button variant="bordered" onPress={handleGenerateReport}>
							Generate Report
						</Button>
					</>
				)}
			</div>

			<SimpleTable
				data={claims}
				columns={columns}
				isLoading={isLoading}
				searchable={true}
				searchPlaceholder="Search by customer name, IMEI, or device model..."
				emptyMessage="No unpaid processed claims found"
				selectable={false}
			/>

			{/* Payment Authorization Modal */}
			<Modal isOpen={isPaymentModalOpen} onClose={onPaymentModalClose}>
				<ModalContent>
					<ModalHeader>
						<h3 className="text-lg font-semibold">Authorize Payment</h3>
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<p className="text-gray-600">
								You are about to authorize payment for {selectedClaims.length}{" "}
								claims.
							</p>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="font-medium">Total Commission Amount:</span>
									<span className="text-lg font-bold text-green-600">
										₦{totalCommission.toLocaleString()}
									</span>
								</div>
							</div>
							<p className="text-sm text-gray-500">
								This action cannot be undone. Payments will be processed
								immediately.
							</p>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button variant="light" onPress={onPaymentModalClose}>
							Cancel
						</Button>
						<Button color="success" onPress={handleAuthorizePayment}>
							Authorize Payment
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default UnpaidProcessedClaimsView;
