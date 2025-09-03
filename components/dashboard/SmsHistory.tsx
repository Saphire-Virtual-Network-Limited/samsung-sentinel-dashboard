"use client";

import React, { useState } from "react";
import {
	Chip,
	Spinner,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import {
	MessageSquare,
	Clock,
	Phone,
	CheckCircle,
	AlertTriangle,
	MoreVertical,
	Eye,
} from "lucide-react";
import useSWR from "swr";
import { getCustomerSmsById } from "@/lib";
import InfoCard from "@/components/reususables/custom-ui/InfoCard";

interface SmsRecord {
	id: string;
	phoneNumber: string[];
	message: string;
	channel: string;
	cost: number;
	messageId: string;
	messageParts: number;
	status: string;
	statusCode: number;
	createdAt: string;
	updatedAt: string;
	customerId: string;
}

interface SmsHistoryProps {
	customerId: string;
}

const SmsHistory: React.FC<SmsHistoryProps> = ({ customerId }) => {
	const [selectedSms, setSelectedSms] = useState<SmsRecord | null>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const fetchCustomerSms = async () => {
		if (!customerId) return { data: [], count: 0 };

		try {
			const response = await getCustomerSmsById(customerId);
			console.log("SMS API Response:", response); // Debug log
			return response.data || { data: [], count: 0 };
		} catch (error) {
			console.error("Error fetching customer SMS history:", error);
			return { data: [], count: 0 };
		}
	};

	const {
		data: smsData,
		error,
		isLoading,
	} = useSWR(
		customerId ? `customer-sms-${customerId}` : null,
		fetchCustomerSms,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000, // Cache for 1 minute
		}
	);

	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString("en-GB", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "Invalid Date";
		}
	};

	const formatCurrency = (amount: number) => {
		return `₦${amount.toFixed(2)}`;
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "success":
				return "success";
			case "failed":
			case "error":
				return "danger";
			case "pending":
				return "warning";
			default:
				return "default";
		}
	};

	const handleViewSms = (sms: SmsRecord) => {
		setSelectedSms(sms);
		onOpen();
	};

	if (isLoading) {
		return (
			<InfoCard
				title="SMS History"
				icon={<MessageSquare className="w-5 h-5 text-default-600" />}
				collapsible={true}
				defaultExpanded={true}
			>
				<div className="flex items-center justify-center py-8">
					<Spinner size="lg" />
				</div>
			</InfoCard>
		);
	}

	if (error) {
		return (
			<InfoCard
				title="SMS History"
				icon={<MessageSquare className="w-5 h-5 text-default-600" />}
				collapsible={true}
				defaultExpanded={true}
			>
				<div className="text-center py-8 text-danger">
					<AlertTriangle className="w-8 h-8 mx-auto mb-2" />
					<p>Error loading SMS history</p>
				</div>
			</InfoCard>
		);
	}

	const smsRecords: SmsRecord[] = smsData?.data || [];
	const totalCount = smsData?.count || 0;

	console.log("SMS Records:", smsRecords); // Debug log
	console.log("Total Count:", totalCount); // Debug log

	return (
		<>
			<InfoCard
				title="SMS History"
				icon={<MessageSquare className="w-5 h-5 text-default-600" />}
				collapsible={true}
				defaultExpanded={true}
				headerContent={
					<Chip size="sm" variant="flat" color="primary">
						{totalCount} SMS{totalCount !== 1 ? "s" : ""}
					</Chip>
				}
			>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-default-200">
						<thead className="bg-default-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									S/N
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									Phone Number(s)
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									Message Preview
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									Channel
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									Cost
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									Date
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-default-200">
							{smsRecords.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-12 text-center">
										<MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50 text-default-400" />
										<p className="font-medium text-default-600">
											No SMS History
										</p>
										<p className="text-sm text-default-500">
											No SMS messages have been sent to this customer yet.
										</p>
									</td>
								</tr>
							) : (
								smsRecords.map((sms, index) => (
									<tr key={sms.id} className="hover:bg-default-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
											{index + 1}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
											<div className="flex flex-wrap gap-1">
												{sms.phoneNumber
													.slice(0, 2)
													.map((phone, phoneIndex) => (
														<Chip
															key={phoneIndex}
															size="sm"
															variant="bordered"
															color="primary"
														>
															{phone}
														</Chip>
													))}
												{sms.phoneNumber.length > 2 && (
													<Chip size="sm" variant="flat" color="default">
														+{sms.phoneNumber.length - 2} more
													</Chip>
												)}
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-default-900 max-w-xs">
											<div className="truncate" title={sms.message}>
												{sms.message.length > 50
													? `${sms.message.substring(0, 50)}...`
													: sms.message}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
											{sms.channel}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
											<div className="flex items-center gap-2">
												<Chip
													color={getStatusColor(sms.status)}
													size="sm"
													variant="flat"
												>
													{sms.status}
												</Chip>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900 font-medium">
											{formatCurrency(sms.cost)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-default-500">
											{formatDate(sms.createdAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
											<Dropdown>
												<DropdownTrigger>
													<Button variant="light" size="sm" isIconOnly>
														<MoreVertical className="w-4 h-4" />
													</Button>
												</DropdownTrigger>
												<DropdownMenu aria-label="SMS Actions">
													<DropdownItem
														key="view"
														startContent={<Eye className="w-4 h-4" />}
														onPress={() => handleViewSms(sms)}
													>
														View Details
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</InfoCard>

			<Modal isOpen={isOpen} onClose={onClose} size="2xl">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								SMS Details
							</ModalHeader>
							<ModalBody>
								{selectedSms && (
									<div className="space-y-4">
										<div className="flex items-center gap-4">
											<div className="flex items-center gap-2">
												<Chip
													color={getStatusColor(selectedSms.status)}
													size="sm"
													variant="flat"
												>
													{selectedSms.status}
												</Chip>
											</div>

											<Chip size="sm" variant="flat" color="primary">
												{formatCurrency(selectedSms.cost)}
											</Chip>
										</div>

										<div>
											<h4 className="font-medium text-default-700 mb-2 flex items-center gap-2">
												<Phone className="w-4 h-4" />
												Phone Number(s)
											</h4>
											<div className="flex flex-wrap gap-2">
												{selectedSms.phoneNumber.map((phone, index) => (
													<Chip
														key={index}
														size="sm"
														variant="flat"
														color="primary"
													>
														{phone}
													</Chip>
												))}
											</div>
										</div>

										<div>
											<h4 className="font-medium text-default-700 mb-2">
												Message
											</h4>
											<div className="bg-default-50 rounded-lg p-3">
												<p className="text-sm text-default-700 whitespace-pre-wrap">
													{selectedSms.message}
												</p>
											</div>
										</div>

										<div>
											<h4 className="font-medium text-default-700 mb-2">
												Technical Details
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
												<div className="bg-default-50 rounded-lg p-3">
													<span className="font-medium text-default-600">
														Message ID:
													</span>
													<div className="text-default-700 break-all">
														{selectedSms.messageId}
													</div>
												</div>
												<div className="bg-default-50 rounded-lg p-3">
													<span className="font-medium text-default-600">
														Message Parts:
													</span>
													<div className="text-default-700">
														{selectedSms.messageParts}
													</div>
												</div>
												<div className="bg-default-50 rounded-lg p-3">
													<span className="font-medium text-default-600">
														Status Code:
													</span>
													<div className="text-default-700">
														{selectedSms.statusCode}
													</div>
												</div>
												<div className="bg-default-50 rounded-lg p-3">
													<span className="font-medium text-default-600">
														Date Sent:
													</span>
													<div className="text-default-700">
														{formatDate(selectedSms.createdAt)}
													</div>
												</div>
											</div>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default SmsHistory;
