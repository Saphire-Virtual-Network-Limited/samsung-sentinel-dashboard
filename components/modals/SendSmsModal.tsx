"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
} from "@heroui/react";
import { MessageSquare } from "lucide-react";
import { TextAreaField } from "@/components/reususables";
import { showToast, sendSms, SendSmsData } from "@/lib";

interface SendSmsModalProps {
	isOpen: boolean;
	onClose: () => void;
	customer: {
		customerId: string;
		firstName?: string;
		lastName?: string;
	};
}

export default function SendSmsModal({
	isOpen,
	onClose,
	customer,
}: SendSmsModalProps) {
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	React.useEffect(() => {
		if (isOpen) {
			setMessage("");
		}
	}, [isOpen]);

	const messageLength = useMemo(() => message.length, [message]);
	const isMessageValid = useMemo(
		() => message.trim().length > 0 && messageLength <= 120,
		[message, messageLength]
	);

	const canSend = useMemo(() => {
		return isMessageValid && !isLoading;
	}, [isMessageValid, isLoading]);

	const handleSendSms = useCallback(async () => {
		if (!canSend) return;

		setIsLoading(true);
		try {
			const smsData: SendSmsData = {
				message: message.trim(),
				customerId: customer.customerId,
				channel: "AT", // Always use AT as channel
			};

			await sendSms(smsData);

			showToast({
				type: "success",
				message: "SMS sent successfully",
				duration: 5000,
			});

			onClose();
		} catch (error: any) {
			console.error("Error sending SMS:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to send SMS",
				duration: 5000,
			});
		} finally {
			setIsLoading(false);
		}
	}, [canSend, message, customer.customerId, onClose]);

	const handleClose = useCallback(() => {
		if (!isLoading) {
			onClose();
		}
	}, [isLoading, onClose]);

	const customerName = useMemo(() => {
		if (customer.firstName && customer.lastName) {
			return `${customer.firstName} ${customer.lastName}`;
		}
		return customer.customerId;
	}, [customer.firstName, customer.lastName, customer.customerId]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="2xl"
			isDismissable={!isLoading}
			hideCloseButton={isLoading}
			classNames={{
				backdrop:
					"bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<MessageSquare className="w-5 h-5 text-primary" />
						<span>Send SMS</span>
					</div>
					<p className="text-sm text-default-500 font-normal">
						Send SMS to {customerName}
					</p>
				</ModalHeader>

				<ModalBody className="gap-4">
					<div className="space-y-2">
						<TextAreaField
							label="Message"
							htmlFor="sms-message"
							id="sms-message"
							placeholder="Type your message here..."
							value={message}
							onChange={setMessage}
							isInvalid={messageLength > 120}
							errorMessage={
								messageLength > 120
									? "Message cannot exceed 120 characters"
									: ""
							}
							maxLen={120}
							rows={4}
							required
						/>
						<div className="flex justify-between text-xs text-default-500">
							<span>{messageLength}/120 characters</span>
							<span
								className={messageLength > 120 ? "text-danger" : "text-success"}
							>
								{120 - messageLength} remaining
							</span>
						</div>
					</div>

					<div className="bg-default-50 rounded-lg p-4">
						<p className="text-sm text-default-600">
							<strong>Channel:</strong> AT
						</p>
						<p className="text-xs text-default-500 mt-1">
							SMS will be sent to customer&apos;s registered phone numbers via
							AT channel.
						</p>
					</div>
				</ModalBody>

				<ModalFooter>
					<Button
						color="danger"
						variant="light"
						onPress={handleClose}
						isDisabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={handleSendSms}
						isLoading={isLoading}
						isDisabled={!canSend}
					>
						{isLoading ? "Sending SMS..." : "Send SMS"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
