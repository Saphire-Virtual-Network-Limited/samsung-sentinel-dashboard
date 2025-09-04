"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Input,
	Divider,
} from "@heroui/react";
import { Plus, MessageSquare, Send, Trash2 } from "lucide-react";
import { TextAreaField } from "@/components/reususables";
import { showToast, sendSms, SendSmsData } from "@/lib";

export default function BulkSmsPage() {
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

	const clearAllNumbers = useCallback(() => {
		setPhoneNumbers([]);
	}, []);

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
				channel: "AT", // Always use AT as channel
			};

			await sendSms(smsData);

			showToast({
				type: "success",
				message: `SMS sent successfully to ${phoneNumbers.length} number${
					phoneNumbers.length > 1 ? "s" : ""
				}`,
				duration: 5000,
			});

			// Clear form after successful send
			setMessage("");
			setPhoneNumbers([]);
			setPhoneInput("");
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
	}, [canSend, phoneNumbers, message]);

	return (
		<div className=" max-w-4xl mx-auto">
			<div className="mb-6">
				<p className="text-default-600">
					Send SMS messages to multiple phone numbers at once
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader className="flex gap-3">
						<MessageSquare className="w-5 h-5 text-primary" />
						<div className="flex flex-col">
							<p className="text-md font-semibold">Compose Message</p>
							<p className="text-small text-default-500">
								Write your SMS message (max 120 characters)
							</p>
						</div>
					</CardHeader>
					<Divider />
					<CardBody className="gap-4">
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
									className={
										messageLength > 120 ? "text-danger" : "text-success"
									}
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
								<div className="flex items-center gap-2">
									<span className="text-xs text-default-500">
										{phoneNumbers.length} number
										{phoneNumbers.length !== 1 ? "s" : ""} added
									</span>
									{phoneNumbers.length > 0 && (
										<Button
											size="sm"
											color="danger"
											variant="light"
											startContent={<Trash2 className="w-3 h-3" />}
											onPress={clearAllNumbers}
											isDisabled={isLoading}
										>
											Clear All
										</Button>
									)}
								</div>
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

							<p className="text-xs text-default-500">
								Enter phone numbers in international format one by one or paste
								comma-separated numbers.
							</p>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardHeader className="flex gap-3">
						<div className="flex flex-col flex-1">
							<p className="text-md font-semibold">Recipients</p>
							<p className="text-small text-default-500">
								{phoneNumbers.length === 0
									? "No recipients added yet"
									: `${phoneNumbers.length} recipient${
											phoneNumbers.length !== 1 ? "s" : ""
									  } ready`}
							</p>
						</div>
					</CardHeader>
					<Divider />
					<CardBody className="gap-4">
						{phoneNumbers.length > 0 ? (
							<>
								<div className="max-h-60 overflow-y-auto space-y-2">
									{phoneNumbers.map((phone, index) => (
										<div
											key={`${phone}-${index}`}
											className="flex items-center justify-between p-2 bg-default-50 rounded-lg"
										>
											<span className="text-sm font-medium">{phone}</span>
											<Button
												size="sm"
												color="danger"
												variant="light"
												isIconOnly
												onPress={() => removePhoneNumber(index)}
												isDisabled={isLoading}
											>
												<Trash2 className="w-3 h-3" />
											</Button>
										</div>
									))}
								</div>

								<Divider />

								<div className="space-y-4">
									<div className="bg-default-100 rounded-lg p-4">
										<h4 className="font-medium text-default-900 mb-2">
											Summary
										</h4>
										<div className="space-y-1 text-sm text-default-600">
											<div className="flex justify-between">
												<span>Recipients:</span>
												<span className="font-medium">
													{phoneNumbers.length}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Message Length:</span>
												<span className="font-medium">
													{messageLength}/120 chars
												</span>
											</div>
											<div className="flex justify-between">
												<span>Estimated Cost:</span>
												<span className="font-medium">
													₦{(phoneNumbers.length * 5.4).toFixed(2)}
												</span>
											</div>
										</div>
									</div>

									<Button
										color="primary"
										size="lg"
										className="w-full"
										startContent={<Send className="w-4 h-4" />}
										onPress={handleSendSms}
										isLoading={isLoading}
										isDisabled={!canSend}
									>
										{isLoading
											? "Sending SMS..."
											: `Send SMS to ${phoneNumbers.length} recipient${
													phoneNumbers.length !== 1 ? "s" : ""
											  }`}
									</Button>
								</div>
							</>
						) : (
							<div className="text-center py-12 text-default-500">
								<MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
								<p className="font-medium">No Recipients Added</p>
								<p className="text-sm">
									Add phone numbers to start sending SMS messages
								</p>
							</div>
						)}
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
