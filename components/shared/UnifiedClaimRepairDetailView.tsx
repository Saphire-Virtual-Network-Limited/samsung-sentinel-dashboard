"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardHeader,
	CardBody,
	Chip,
	Button,
	Divider,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import {
	ArrowLeft,
	Calendar,
	User,
	Smartphone,
	Wrench,
	DollarSign,
	FileText,
	CheckCircle,
	XCircle,
	CreditCard,
	Building2,
	Hash,
} from "lucide-react";
import { InfoCard, InfoField } from "@/components/reususables";
import UploadArea from "@/components/reususables/UploadArea";
import {
	ClaimRepairRole,
	ClaimRepairItem,
} from "@/components/shared/ClaimsRepairsTable";
import { formatDate } from "@/lib";

export interface UnifiedClaimRepairDetailViewProps {
	claimData: ClaimRepairItem;
	role: ClaimRepairRole;
	onApprove?: (claimId: string) => Promise<void>;
	onReject?: (claimId: string, reason: string) => Promise<void>;
	onAuthorizePayment?: (claimId: string) => Promise<void>;
	onExecutePayment?: (claimId: string, transactionRef: string) => Promise<void>;
	onMakePayment?: (claimId: string, paymentDetails: any) => Promise<void>;
	serviceCenterBankDetails?: {
		bankName: string;
		accountNumber: string;
		accountName: string;
	};
}

const UnifiedClaimRepairDetailView: React.FC<
	UnifiedClaimRepairDetailViewProps
> = ({
	claimData,
	role,
	onApprove,
	onReject,
	onAuthorizePayment,
	onExecutePayment,
	onMakePayment,
	serviceCenterBankDetails,
}) => {
	const router = useRouter();
	const {
		isOpen: isRejectOpen,
		onOpen: onRejectOpen,
		onClose: onRejectClose,
	} = useDisclosure();
	const {
		isOpen: isPaymentOpen,
		onOpen: onPaymentOpen,
		onClose: onPaymentClose,
	} = useDisclosure();
	const [rejectionReason, setRejectionReason] = useState("");
	const [transactionRef, setTransactionRef] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	const handleBack = () => {
		router.back();
	};

	const handleApprove = async () => {
		if (!onApprove) return;
		setIsProcessing(true);
		try {
			await onApprove(claimData.id);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleRejectSubmit = async () => {
		if (!onReject || !rejectionReason.trim()) return;
		setIsProcessing(true);
		try {
			await onReject(claimData.id, rejectionReason);
			onRejectClose();
			setRejectionReason("");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleAuthorizePayment = async () => {
		if (!onAuthorizePayment) return;
		setIsProcessing(true);
		try {
			await onAuthorizePayment(claimData.id);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleExecutePayment = async () => {
		if (!onExecutePayment || !transactionRef.trim()) return;
		setIsProcessing(true);
		try {
			await onExecutePayment(claimData.id, transactionRef);
			onPaymentClose();
			setTransactionRef("");
		} finally {
			setIsProcessing(false);
		}
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, any> = {
			pending: "warning",
			approved: "success",
			rejected: "danger",
			"in-progress": "primary",
			completed: "success",
		};
		return colors[status] || "default";
	};

	const isPaid = claimData.paymentStatus === "paid";
	const isUnpaidCompleted =
		claimData.status === "completed" && claimData.paymentStatus === "unpaid";

	return (
		<div className="space-y-6 pb-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button isIconOnly variant="light" onPress={handleBack}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Claim Details</h1>
						<p className="text-sm text-gray-500">{claimData.claimId}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Chip color={getStatusColor(claimData.status)} variant="flat" size="lg">
						{claimData.status.toUpperCase().replace("-", " ")}
					</Chip>
					<Button 
						color="primary" 
						variant="bordered"
						onPress={() => {
							const path = role === "service-center"
								? `/access/service-center/claims/${claimData.claimId}`
								: role === "samsung-partners"
								? `/access/samsung-partners/claims/${claimData.claimId}`
								: `/access/admin/samsung-sentinel/claims/${claimData.claimId}`;
							router.push(path);
						}}
						startContent={<FileText className="h-4 w-4" />}
					>
						View Full Details
					</Button>
				</div>
			</div>

			{/* Payment Status Banner for Paid Items */}
			{isPaid && (
				<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
					<CardBody>
						<div className="flex items-start gap-3">
							<CheckCircle className="text-green-500 mt-0.5" size={20} />
							<div className="flex-1">
								<h3 className="font-semibold text-green-900 mb-2">
									Payment Completed
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<InfoField
										label="Transaction Reference"
										value={claimData.transactionRef || "N/A"}
									/>
									<InfoField
										label="Session ID"
										value={claimData.sessionId || "N/A"}
									/>
								</div>
							</div>
						</div>
					</CardBody>
				</Card>
			)}

			{/* Authorization Status Banner for Samsung Sentinel */}
			{role === "samsung-sentinel" &&
				isUnpaidCompleted &&
				(claimData.authorizedForPayment ? (
					<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
						<CardBody>
							<div className="flex items-start gap-3">
								<CheckCircle className="text-blue-600 mt-0.5" size={20} />
								<div className="flex-1">
									<h3 className="font-semibold text-blue-900 mb-1">
										✓ Authorized for Payment
									</h3>
									<p className="text-sm text-blue-700">
										This claim has been authorized by Samsung Partners and is
										ready for payment execution.
									</p>
								</div>
							</div>
						</CardBody>
					</Card>
				) : (
					<Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
						<CardBody>
							<div className="flex items-start gap-3">
								<XCircle className="text-yellow-600 mt-0.5" size={20} />
								<div className="flex-1">
									<h3 className="font-semibold text-yellow-900 mb-1">
										⚠️ Pending Authorization
									</h3>
									<p className="text-sm text-yellow-700">
										This claim is awaiting payment authorization from Samsung
										Partners before payment can be executed.
									</p>
								</div>
							</div>
						</CardBody>
					</Card>
				))}

			{/* Bank Details & Payment Button for Unpaid Completed Items */}
			{isUnpaidCompleted &&
				serviceCenterBankDetails &&
				role !== "service-center" && (
					<Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
						<CardBody>
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<Building2 className="text-orange-600 mt-0.5" size={20} />
									<div className="flex-1">
										<h3 className="font-semibold text-orange-900 mb-3">
											Service Center Bank Details
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg p-4">
											<InfoField
												label="Bank Name"
												value={serviceCenterBankDetails.bankName}
											/>
											<InfoField
												label="Account Number"
												value={serviceCenterBankDetails.accountNumber}
											/>
											<InfoField
												label="Account Name"
												value={serviceCenterBankDetails.accountName}
											/>
										</div>
									</div>
								</div>

								{role === "samsung-partners" && onAuthorizePayment && (
									<Button
										color="primary"
										startContent={<DollarSign className="h-4 w-4" />}
										onPress={handleAuthorizePayment}
										isLoading={isProcessing}
										className="w-full md:w-auto"
									>
										Authorize Payment
									</Button>
								)}

								{role === "samsung-sentinel" && onExecutePayment && (
									<Button
										color="success"
										startContent={<DollarSign className="h-4 w-4" />}
										onPress={onPaymentOpen}
										isLoading={isProcessing}
										className="w-full md:w-auto"
									>
										Execute Payment
									</Button>
								)}
							</div>
						</CardBody>
					</Card>
				)}

			{/* Customer Information */}
			<InfoCard title="Customer Information" icon={<User size={18} />}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<InfoField label="Name" value={claimData.customerName} />
					<InfoField label="IMEI" value={claimData.imei} />
				</div>
			</InfoCard>

			{/* Device Information */}
			<InfoCard title="Device Information" icon={<Smartphone size={18} />}>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<InfoField label="Device" value={claimData.deviceName} />
					<InfoField label="Brand" value={claimData.brand} />
					<InfoField label="Model" value={claimData.model} />
				</div>
			</InfoCard>

			{/* Repair Information */}
			<InfoCard title="Repair Information" icon={<Wrench size={18} />}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<InfoField
						label="Fault Type"
						value={claimData.faultType?.replace("-", " ").toUpperCase()}
					/>
					<InfoField
						label="Repair Cost"
						value={`₦${Number(claimData.repairCost).toLocaleString()}`}
					/>
					{claimData.serviceCenterName && (
						<InfoField
							label="Service Center"
							value={claimData.serviceCenterName}
						/>
					)}
					{claimData.engineerName && (
						<InfoField label="Engineer" value={claimData.engineerName} />
					)}
				</div>
			</InfoCard>

			{/* Documents */}
			{role === "service-center" &&
				claimData.documents &&
				claimData.documents.length > 0 && (
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<FileText size={18} />
								Documents
							</h3>
						</CardHeader>
						<CardBody>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{claimData.documents.map((doc, index) => (
									<div key={index} className="border rounded-lg p-3">
										<p className="text-sm text-gray-600 truncate">
											{doc.name || `Document ${index + 1}`}
										</p>
									</div>
								))}
							</div>
						</CardBody>
					</Card>
				)}

			{/* Timeline */}
			<InfoCard title="Timeline" icon={<Calendar size={18} />}>
				<div className="space-y-3">
					<InfoField
						label="Submitted"
						value={formatDate(claimData.createdAt)}
					/>
					{claimData.approvedAt && (
						<InfoField
							label="Approved"
							value={formatDate(claimData.approvedAt)}
						/>
					)}
					{claimData.rejectedAt && (
						<InfoField
							label="Rejected"
							value={formatDate(claimData.rejectedAt)}
						/>
					)}
					{claimData.completedAt && (
						<InfoField
							label="Completed"
							value={formatDate(claimData.completedAt)}
						/>
					)}
				</div>
			</InfoCard>

			{/* Rejection Reason */}
			{claimData.status === "rejected" && claimData.rejectionReason && (
				<Card className="border-red-200 bg-red-50">
					<CardBody>
						<div className="flex items-start gap-3">
							<XCircle className="text-red-500 mt-0.5" size={20} />
							<div>
								<h4 className="font-semibold text-red-900 mb-1">
									Rejection Reason
								</h4>
								<p className="text-red-700">{claimData.rejectionReason}</p>
							</div>
						</div>
					</CardBody>
				</Card>
			)}

			{/* Action Buttons - Role-based */}
			<div className="flex gap-3 justify-end">
				{/* Samsung Partners: Approve/Reject for pending claims */}
				{role === "samsung-partners" &&
					claimData.status === "pending" &&
					onApprove &&
					onReject && (
						<>
							<Button
								color="danger"
								variant="flat"
								startContent={<XCircle className="h-4 w-4" />}
								onPress={onRejectOpen}
								isDisabled={isProcessing}
							>
								Reject Claim
							</Button>
							<Button
								color="success"
								startContent={<CheckCircle className="h-4 w-4" />}
								onPress={handleApprove}
								isLoading={isProcessing}
							>
								Approve Claim
							</Button>
						</>
					)}

				{/* Samsung Partners: Authorize payment for completed/unpaid claims */}
				{role === "samsung-partners" &&
					claimData.status === "completed" &&
					claimData.paymentStatus === "unpaid" &&
					!claimData.authorizedForPayment &&
					onAuthorizePayment && (
						<Button
							color="primary"
							startContent={<DollarSign className="h-4 w-4" />}
							onPress={handleAuthorizePayment}
							isLoading={isProcessing}
						>
							Authorize Payment
						</Button>
					)}

				{/* Samsung Sentinel: Execute payment for authorized claims */}
				{role === "samsung-sentinel" &&
					claimData.status === "completed" &&
					claimData.paymentStatus === "unpaid" &&
					claimData.authorizedForPayment &&
					onExecutePayment && (
						<Button
							color="success"
							startContent={<CreditCard className="h-4 w-4" />}
							onPress={onPaymentOpen}
							isLoading={isProcessing}
						>
							Execute Payment
						</Button>
					)}

				{/* Show authorization status */}
				{claimData.status === "completed" &&
					claimData.paymentStatus === "unpaid" &&
					claimData.authorizedForPayment &&
					role !== "samsung-sentinel" && (
						<Chip
							color="success"
							variant="flat"
							startContent={<CheckCircle className="h-4 w-4" />}
						>
							✓ Authorized for Payment
						</Chip>
					)}
			</div>

			{/* Rejection Modal */}
			<Modal isOpen={isRejectOpen} onClose={onRejectClose}>
				<ModalContent>
					<ModalHeader>Reject Claim</ModalHeader>
					<ModalBody>
						<textarea
							className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Enter rejection reason..."
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
						/>
					</ModalBody>
					<ModalFooter>
						<Button variant="light" onPress={onRejectClose}>
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={handleRejectSubmit}
							isLoading={isProcessing}
							isDisabled={!rejectionReason.trim()}
						>
							Reject
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Payment Modal */}
			<Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="2xl">
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">
						<span>Execute Payment</span>
						<span className="text-sm font-normal text-gray-500">
							Claim ID: {claimData.claimId}
						</span>
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							{/* Payment Summary */}
							<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
								<CardBody>
									<h4 className="font-semibold text-blue-900 mb-3">
										Payment Summary
									</h4>
									<div className="grid grid-cols-2 gap-3 text-sm">
										<div>
											<p className="text-gray-600">Amount</p>
											<p className="font-bold text-lg text-blue-900">
												₦{Number(claimData.repairCost).toLocaleString()}
											</p>
										</div>
										<div>
											<p className="text-gray-600">Service Center</p>
											<p className="font-semibold text-blue-900">
												{claimData.serviceCenterName}
											</p>
										</div>
									</div>
								</CardBody>
							</Card>

							{/* Bank Details */}
							{serviceCenterBankDetails && (
								<Card className="border-gray-200">
									<CardBody>
										<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<Building2 className="h-4 w-4" />
											Bank Account Details
										</h4>
										<div className="grid grid-cols-1 gap-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">Bank Name:</span>
												<span className="font-medium">
													{serviceCenterBankDetails.bankName}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Account Number:</span>
												<span className="font-medium font-mono">
													{serviceCenterBankDetails.accountNumber}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Account Name:</span>
												<span className="font-medium">
													{serviceCenterBankDetails.accountName}
												</span>
											</div>
										</div>
									</CardBody>
								</Card>
							)}

							{/* Transaction Reference Input */}
							<div>
								<label className="text-sm font-medium mb-2 flex items-center gap-2">
									<Hash className="h-4 w-4" />
									Transaction Reference *
								</label>
								<input
									type="text"
									className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="e.g., TXN-2024-XXXX or Bank Reference Number"
									value={transactionRef}
									onChange={(e) => setTransactionRef(e.target.value.trim())}
									minLength={5}
								/>
								{transactionRef && transactionRef.length < 5 && (
									<p className="text-xs text-danger-500 mt-1">
										Transaction reference must be at least 5 characters
									</p>
								)}
							</div>

							{/* Warning */}
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
								<p className="text-xs text-yellow-800">
									⚠️ <strong>Important:</strong> Ensure payment has been
									completed in your banking system before entering the
									transaction reference. This action cannot be undone.
								</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="light"
							onPress={onPaymentClose}
							isDisabled={isProcessing}
						>
							Cancel
						</Button>
						<Button
							color="success"
							onPress={handleExecutePayment}
							isLoading={isProcessing}
							isDisabled={!transactionRef.trim() || transactionRef.length < 5}
						>
							Execute Payment
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default UnifiedClaimRepairDetailView;
