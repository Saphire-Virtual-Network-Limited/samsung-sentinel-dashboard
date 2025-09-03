"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Chip,
	Input,
} from "@heroui/react";
import { Plus, MessageSquare } from "lucide-react";
import { TextAreaField } from "@/components/reususables";
import { showToast, sendSms, SendSmsData } from "@/lib";

interface SendSmsModalProps {
	isOpen: boolean;
	onClose: () => void;
	customer: {
		channel?: string;
		customerId: string;
		phone?: string;
		bvnPhoneNumber?: string;
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
	const [phoneInput, setPhoneInput] = useState("");
	const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const formatPhoneNumber = useCallback((phone: string) => {
		if (!phone) return phone;

		const cleaned = phone.replace(/[^\d+]/g, "");

		if (cleaned.startsWith("+")) return cleaned;

		if (cleaned.startsWith("234")) return `+${cleaned}`;

		if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;

		if (/^[789]\d{9}$/.test(cleaned)) return `+234${cleaned}`;

		if (/^\d{10,15}$/.test(cleaned) && !cleaned.startsWith("234")) {
			return `+${cleaned}`;
		}

		return cleaned;
	}, []);

	const initializePhoneNumbers = useCallback(() => {
		const numbers: string[] = [];

		if (customer.phone && customer.phone !== "N/A") {
			const formattedPhone = formatPhoneNumber(customer.phone);
			numbers.push(formattedPhone);
		}

		if (customer.bvnPhoneNumber && customer.bvnPhoneNumber !== "N/A") {
			const formattedBvnPhone = formatPhoneNumber(customer.bvnPhoneNumber);
			if (!numbers.includes(formattedBvnPhone)) {
				numbers.push(formattedBvnPhone);
			}
		}

		setPhoneNumbers(numbers);
	}, [customer.phone, customer.bvnPhoneNumber, formatPhoneNumber]);

	React.useEffect(() => {
		if (isOpen) {
			initializePhoneNumbers();
			setMessage("");
			setPhoneInput("");
		}
	}, [isOpen, initializePhoneNumbers]);

	const isValidPhoneNumber = useCallback((phone: string) => {
		if (!phone) return false;

		const cleaned = phone.replace(/[^\d+]/g, "");

		return (
			/^(\+234|234)[789]\d{9}$/.test(cleaned) ||
			/^0[789]\d{9}$/.test(cleaned) ||
			/^[789]\d{9}$/.test(cleaned) ||
			/^\+\d{10,15}$/.test(cleaned)
		);
	}, []);

	const addPhoneNumber = useCallback(
		(phone: string) => {
			const trimmed = phone.trim();
			if (!trimmed) return;

			if (!isValidPhoneNumber(trimmed)) {
				showToast({
					type: "error",
					message: "Please enter a valid phone number",
					duration: 3000,
				});
				return;
			}

			const formatted = formatPhoneNumber(trimmed);

			if (phoneNumbers.some((existingNumber) => existingNumber === formatted)) {
				showToast({
					type: "warning",
					message: "Phone number already added",
					duration: 3000,
				});
				return;
			}

			setPhoneNumbers((prev) => [...prev, formatted]);
			setPhoneInput("");
		},
		[phoneNumbers, isValidPhoneNumber, formatPhoneNumber]
	);

	const handlePhoneInputChange = useCallback(
		(value: string) => {
			if (value.includes(",")) {
				const numbers = value.split(",");
				const newNumber = numbers[0].trim();
				const remaining = numbers.slice(1).join(",");

				if (newNumber) {
					addPhoneNumber(newNumber);
				}
				setPhoneInput(remaining);
			} else {
				setPhoneInput(value);
			}
		},
		[addPhoneNumber]
	);

	const handlePhoneInputKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === ",") {
				e.preventDefault();
				addPhoneNumber(phoneInput);
			}
		},
		[phoneInput, addPhoneNumber]
	);

	const removePhoneNumber = useCallback((index: number) => {
		setPhoneNumbers((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent) => {
			e.preventDefault();
			const pastedText = e.clipboardData.getData("text");
			const numbers = pastedText.split(/[,\s\n]+/).filter(Boolean);

			numbers.forEach((number) => {
				addPhoneNumber(number);
			});
		},
		[addPhoneNumber]
	);

	const messageLength = useMemo(() => message.length, [message]);
	const isMessageValid = useMemo(
		() => message.trim().length > 0 && messageLength <= 120,
		[message, messageLength]
	);

	const canSend = useMemo(() => {
		return isMessageValid && phoneNumbers.length > 0 && !isLoading;
	}, [isMessageValid, phoneNumbers.length, isLoading]);

	const handleSendSms = useCallback(async () => {
		if (!canSend) return;

		setIsLoading(true);
		try {
			const smsData: SendSmsData = {
				phone: phoneNumbers,
				message: message.trim(),
				customerId: customer.customerId,
				channel: customer.channel,
			};

			await sendSms(smsData);

			showToast({
				type: "success",
				message: `SMS sent successfully to ${phoneNumbers.length} number${
					phoneNumbers.length > 1 ? "s" : ""
				}`,
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
	}, [
		canSend,
		phoneNumbers,
		message,
		customer.customerId,
		customer.channel,
		onClose,
	]);

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

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium text-default-700">
								Phone Numbers
							</label>
							<span className="text-xs text-default-500">
								{phoneNumbers.length} number
								{phoneNumbers.length !== 1 ? "s" : ""} added
							</span>
						</div>

						<div className="flex gap-2">
							<Input
								placeholder="Enter phone number (comma-separated for multiple)"
								value={phoneInput}
								onValueChange={handlePhoneInputChange}
								onKeyDown={handlePhoneInputKeyPress}
								onPaste={handlePaste}
								variant="bordered"
								classNames={{
									inputWrapper:
										"data-[hover=true]:border-primary group-data-[focus=true]:border-primary",
								}}
								disabled={isLoading}
							/>
							<Button
								color="primary"
								variant="flat"
								onPress={() => addPhoneNumber(phoneInput)}
								isDisabled={!phoneInput.trim() || isLoading}
								className="shrink-0"
							>
								<Plus className="w-4 h-4" />
								Add
							</Button>
						</div>

						{phoneNumbers.length > 0 && (
							<div className="space-y-2">
								<div className="flex flex-wrap gap-2">
									{phoneNumbers.map((phone, index) => (
										<Chip
											key={`${phone}-${index}`}
											onClose={
												!isLoading ? () => removePhoneNumber(index) : undefined
											}
											variant="flat"
											color="primary"
										>
											{phone}
										</Chip>
									))}
								</div>
							</div>
						)}

						<p className="text-xs text-default-500">
							Default numbers from customer profile are automatically added. You
							can add more numbers or paste comma-separated numbers.
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
						{isLoading ? "Sending SMS..." : `Send SMS (${phoneNumbers.length})`}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
