"use client";

import React, { useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Textarea,
} from "@heroui/react";
import { DollarSign, AlertCircle } from "lucide-react";
import { cn, GeneralSans_SemiBold, showToast } from "@/lib";
import { bulkMarkClaimsPaid } from "@/lib/api/claims";

interface BulkMarkPaidModalProps {
	isOpen: boolean;
	onClose: () => void;
	claimIds: string[];
	onSuccess?: () => void;
}

export default function BulkMarkPaidModal({
	isOpen,
	onClose,
	claimIds,
	onSuccess,
}: BulkMarkPaidModalProps) {
	const [transactionReference, setTransactionReference] = useState("");
	const [notes, setNotes] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleMarkPaid = async () => {
		if (claimIds.length === 0) {
			showToast({
				type: "error",
				message: "No claims selected",
			});
			return;
		}

		if (!transactionReference.trim()) {
			showToast({
				type: "error",
				message: "Transaction reference is required",
			});
			return;
		}

		setIsLoading(true);

		try {
			const response = await bulkMarkClaimsPaid({
				claim_ids: claimIds,
				transaction_reference: transactionReference,
				notes: notes || undefined,
			});

			const { successful, failed } = response;

			if (successful > 0) {
				showToast({
					type: "success",
					message: `Successfully marked ${successful} claim${
						successful > 1 ? "s" : ""
					} as paid${failed > 0 ? ` (${failed} failed)` : ""}`,
				});
				onSuccess?.();
				handleClose();
			} else {
				showToast({
					type: "error",
					message: `Failed to mark claims as paid: ${failed} failed`,
				});
			}
		} catch (error: any) {
			console.error("Bulk mark paid failed:", error);
			showToast({
				type: "error",
				message: error?.message || "Failed to mark claims as paid",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setTransactionReference("");
		setNotes("");
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="2xl">
			<ModalContent>
				<ModalHeader
					className={cn("flex flex-col gap-1", GeneralSans_SemiBold.className)}
				>
					<div className="flex items-center gap-2">
						<DollarSign className="w-5 h-5 text-success" />
						<span>Mark Claims as Paid</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<div className="flex items-start gap-2">
								<AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-yellow-900">
										You are about to mark {claimIds.length} claim
										{claimIds.length > 1 ? "s" : ""} as paid
									</p>
									<p className="text-xs text-yellow-700 mt-1">
										Only authorized claims can be marked as paid. Please ensure
										you have processed the payment before proceeding.
									</p>
								</div>
							</div>
						</div>

						<Input
							label="Transaction Reference"
							placeholder="Enter transaction reference (e.g., TXN123456789)"
							value={transactionReference}
							onChange={(e) => setTransactionReference(e.target.value)}
							isRequired
							description="Provide the transaction ID or reference from your payment system"
						/>

						<Textarea
							label="Notes (Optional)"
							placeholder="Add any notes about this payment..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							minRows={3}
							maxRows={5}
						/>

						<div className="text-sm text-gray-600">
							<p className="font-medium">Selected Claims: {claimIds.length}</p>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="light" onPress={handleClose} isDisabled={isLoading}>
						Cancel
					</Button>
					<Button
						color="success"
						onPress={handleMarkPaid}
						isLoading={isLoading}
						isDisabled={!transactionReference.trim()}
						startContent={!isLoading && <DollarSign className="w-4 h-4" />}
					>
						Mark {claimIds.length} Claim{claimIds.length > 1 ? "s" : ""} as Paid
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
