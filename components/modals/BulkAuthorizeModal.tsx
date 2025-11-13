"use client";

import React, { useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Textarea,
} from "@heroui/react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn, GeneralSans_SemiBold, showToast } from "@/lib";
import { bulkAuthorizeClaims } from "@/lib/api/claims";

interface BulkAuthorizeModalProps {
	isOpen: boolean;
	onClose: () => void;
	claimIds: string[];
	onSuccess?: () => void;
}

export default function BulkAuthorizeModal({
	isOpen,
	onClose,
	claimIds,
	onSuccess,
}: BulkAuthorizeModalProps) {
	const [notes, setNotes] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleAuthorize = async () => {
		if (claimIds.length === 0) {
			showToast({
				type: "error",
				message: "No claims selected",
			});
			return;
		}

		setIsLoading(true);

		try {
			const response = await bulkAuthorizeClaims({
				claim_ids: claimIds,
				notes: notes || undefined,
			});

			const { authorized, failed } = response.data || {
				authorized: 0,
				failed: 0,
			};

			if (authorized > 0) {
				showToast({
					type: "success",
					message: `Successfully authorized ${authorized} claim${
						authorized > 1 ? "s" : ""
					}${failed > 0 ? ` (${failed} failed)` : ""}`,
				});
				onSuccess?.();
				handleClose();
			} else {
				showToast({
					type: "error",
					message: `Failed to authorize claims: ${failed} failed`,
				});
			}
		} catch (error: any) {
			console.error("Bulk authorize failed:", error);
			showToast({
				type: "error",
				message: error?.message || "Failed to authorize claims",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
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
						<CheckCircle className="w-5 h-5 text-success" />
						<span>Authorize Claims for Payment</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="space-y-4">
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-start gap-2">
								<AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-blue-900">
										You are about to authorize {claimIds.length} claim
										{claimIds.length > 1 ? "s" : ""} for payment
									</p>
									<p className="text-xs text-blue-700 mt-1">
										Only completed claims will be authorized. This action will
										allow these claims to be marked as paid by the admin.
									</p>
								</div>
							</div>
						</div>

						<Textarea
							label="Notes (Optional)"
							placeholder="Add any notes about this authorization..."
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
						onPress={handleAuthorize}
						isLoading={isLoading}
						startContent={!isLoading && <CheckCircle className="w-4 h-4" />}
					>
						Authorize {claimIds.length} Claim{claimIds.length > 1 ? "s" : ""}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
