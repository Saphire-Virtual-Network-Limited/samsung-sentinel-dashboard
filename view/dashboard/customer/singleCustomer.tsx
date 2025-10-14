"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button, Chip, Snippet, DateInput } from "@heroui/react";
import { parseDateTime, now, CalendarDateTime } from "@internationalized/date";
import useSWR from "swr";
import {
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	User,
	CreditCard,
	Store,
	Users,
	Smartphone,
	MapPin,
	Clock,
	Search,
	Plus,
	RefreshCw,
	MessageSquare,
	Calendar,
	CheckCircle,
	AlertCircle,
	XCircle,
	TrendingUp,
	DollarSign,
	CalendarDays,
} from "lucide-react";
import {
	getCustomerRecordById,
	showToast,
	updateCustomerLastPoint,
	updateCustomerVirtualWalletBalance,
	useAuth,
	lockDevice,
	unlockDevice,
	releaseDevice,
	changeLoanStatus,
	createCustomerVirtualWallet,
	updateDeviceImeiNumber,
	assignCustomersToMBE,
	getMBEWithCustomerForRelay,
	searchGlobalCustomer,
	getVfdBanks,
	injectPaymentHistory,
	InjectPaymentHistoryData,
	getDeviceLocksLogs,
	deleteCustomerMandateAndUpdateLastPoint,
	sendSms,
	getcustomerRepaymentSchedule,
} from "@/lib";
import { hasPermission } from "@/lib/permissions";
import {
	PaymentReceipt,
	CustomerSearch,
	CommunicationLog,
	ConfirmationModal,
} from "@/components/reususables/custom-ui";
import {
	FormField,
	SelectField,
	AutoCompleteField,
} from "@/components/reususables";
import { 
	CustomerRecord, 
	RepaymentScheduleData, 
	RepaymentScheduleItem, 
	RepaymentScheduleSummary 
} from "./types";
import SendSmsModal from "@/components/modals/SendSmsModal";
import SmsHistory from "@/components/dashboard/SmsHistory";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { createSchema, useField } from "@/lib";

const ImeiSchema = createSchema(
	(value: string) => /^\d{15}$/.test(value),
	"IMEI must be a 15 digit number"
);
const AgentSchema = createSchema(
	(value: string) => /^[a-zA-Z0-9]+$/.test(value),
	"Agent must contain only numbers and letters"
);

// Utility Components
const InfoCard = ({
	title,
	children,
	className = "",
	icon,
	collapsible = false,
	defaultExpanded = true,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
	collapsible?: boolean;
	defaultExpanded?: boolean;
}) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	if (!collapsible) {
		return (
			<div
				className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
			>
				<div className="p-3 border-b border-default-200">
					<div className="flex items-center gap-2">
						{icon}
						<h3 className="text-lg font-semibold text-default-900">{title}</h3>
					</div>
				</div>
				<div className="p-4">{children}</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
		>
			<div
				className="p-3 border-b border-default-200 cursor-pointer hover:bg-default-50 transition-colors"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{icon}
						<h3 className="text-lg font-semibold text-default-900">{title}</h3>
					</div>
					<Button
						variant="light"
						size="sm"
						isIconOnly
						className="text-default-500"
					>
						{isExpanded ? (
							<ChevronUp className="w-4 h-4" />
						) : (
							<ChevronDown className="w-4 h-4" />
						)}
					</Button>
				</div>
			</div>
			<div
				className={`transition-all duration-300 ease-in-out ${
					isExpanded
						? "max-h-none opacity-100"
						: "max-h-0 opacity-0 overflow-hidden"
				}`}
			>
				<div className="p-4">{children}</div>
			</div>
		</div>
	);
};

const InfoField = ({
	label,
	value,
	endComponent,
	copyable = false,
}: {
	label: string;
	value?: string | null;
	endComponent?: React.ReactNode;
	copyable?: boolean;
}) => (
	<div className="bg-default-50 rounded-lg p-4">
		<div className="flex items-center justify-between mb-1">
			<div className="text-sm text-default-500">{label}</div>
			{endComponent}
		</div>
		<div
			className="font-medium text-default-900 flex items-center gap-2 break-words whitespace-pre-line"
			style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
		>
			{value || "N/A"}
			{copyable && value && (
				<Snippet
					codeString={value}
					className="p-0"
					size="sm"
					hideSymbol
					hideCopyButton={false}
				/>
			)}
		</div>
	</div>
);

const EmptyState = ({
	title,
	description,
	icon,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
}) => (
	<div className="text-center py-8">
		<div className="flex justify-center mb-4">
			<div className="p-3 bg-default-100 rounded-full">{icon}</div>
		</div>
		<h3 className="text-lg font-semibold text-default-900 mb-2">{title}</h3>
		<p className="text-default-500 text-sm">{description}</p>
	</div>
);

// Memoized Inject Payment Modal Component - Self-contained state
const InjectPaymentModal = React.memo(
	({
		isOpen,
		onClose,
		vfdBanks,
		onSubmit,
		parseLocalDateTime,
		customer,
	}: {
		isOpen: boolean;
		onClose: () => void;
		vfdBanks: any[];
		onSubmit: (paymentData: InjectPaymentHistoryData) => void;
		parseLocalDateTime: (dateTime: string) => any;
		customer: CustomerRecord | null;
	}) => {
		// Internal state - isolated from parent component
		const [internalPaymentData, setInternalPaymentData] =
			useState<InjectPaymentHistoryData>(() => {
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, "0");
				const day = String(now.getDate()).padStart(2, "0");
				const hours = String(now.getHours()).padStart(2, "0");
				const minutes = String(now.getMinutes()).padStart(2, "0");
				const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

				// Find matching VFD bank for customer's virtual account bank
				let defaultReceiverBank = "";
				if (customer?.Wallet?.bankName && vfdBanks.length > 0) {
					const matchingBank = vfdBanks.find(
						(bank) =>
							bank.name
								?.toLowerCase()
								.includes(customer.Wallet!.bankName.toLowerCase()) ||
							customer
								.Wallet!.bankName.toLowerCase()
								.includes(bank.name?.toLowerCase())
					);
					if (matchingBank) {
						defaultReceiverBank = matchingBank.name;
					}
				}

				return {
					amount: "",
					paymentType: "CREDIT",
					paymentReference: "",
					paymentDescription: "",
					paid_at: currentDateTime,
					// Note: senderAccount, senderBank, receiverAccount, and receiverBank are hidden fields
					// but kept in state for API compatibility
					senderAccount: "",
					senderBank: "",
					receiverAccount: customer?.Wallet?.accountNumber || "",
					receiverBank: defaultReceiverBank,
				};
			});

		// Error state for visual feedback
		const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

		// Reset form when modal closes
		React.useEffect(() => {
			if (!isOpen) {
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, "0");
				const day = String(now.getDate()).padStart(2, "0");
				const hours = String(now.getHours()).padStart(2, "0");
				const minutes = String(now.getMinutes()).padStart(2, "0");
				const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

				// Find matching VFD bank for customer's virtual account bank
				let defaultReceiverBank = "";
				if (customer?.Wallet?.bankName && vfdBanks.length > 0) {
					const matchingBank = vfdBanks.find(
						(bank) =>
							bank.name
								?.toLowerCase()
								.includes(customer.Wallet!.bankName.toLowerCase()) ||
							customer
								.Wallet!.bankName.toLowerCase()
								.includes(bank.name?.toLowerCase())
					);
					if (matchingBank) {
						defaultReceiverBank = matchingBank.name;
					}
				}

				setInternalPaymentData({
					amount: "",
					paymentType: "CREDIT",
					paymentReference: "",
					paymentDescription: "",
					paid_at: currentDateTime,
					// Note: senderAccount, senderBank, receiverAccount, and receiverBank are hidden fields
					// but kept in state for API compatibility
					senderAccount: "",
					senderBank: "",
					receiverAccount: customer?.Wallet?.accountNumber || "",
					receiverBank: defaultReceiverBank,
				});
				setFieldErrors({});
			}
		}, [isOpen, customer, vfdBanks]);

		// Internal handlers - no parent re-renders
		const handleInternalPaymentDataChange = React.useCallback(
			(field: keyof InjectPaymentHistoryData, value: any) => {
				setInternalPaymentData((prev) => ({
					...prev,
					[field]: value,
				}));
				// Clear field error when user starts typing
				if (fieldErrors[field]) {
					setFieldErrors((prev) => ({
						...prev,
						[field]: "",
					}));
				}
			},
			[fieldErrors]
		);

		// Internal amount handler
		const handleInternalAmountChange = React.useCallback(
			(value: string) => {
				if (value === "") {
					handleInternalPaymentDataChange("amount", "");
					return;
				}

				const sanitizedValue = value.replace(/[^0-9.]/g, "");
				const parts = sanitizedValue.split(".");
				const formattedValue =
					parts.length > 2
						? parts[0] + "." + parts.slice(1).join("")
						: sanitizedValue;

				handleInternalPaymentDataChange("amount", formattedValue);
			},
			[handleInternalPaymentDataChange]
		);

		// Internal date handler
		const handleInternalDateChange = React.useCallback(
			(value: any) => {
				if (value && "hour" in value && "minute" in value) {
					const year = value.year;
					const month = String(value.month).padStart(2, "0");
					const day = String(value.day).padStart(2, "0");
					const hour = String(value.hour).padStart(2, "0");
					const minute = String(value.minute).padStart(2, "0");
					const localFormat = `${year}-${month}-${day}T${hour}:${minute}`;
					handleInternalPaymentDataChange("paid_at", localFormat);
				} else {
					handleInternalPaymentDataChange("paid_at", "");
				}
			},
			[handleInternalPaymentDataChange]
		);

		// Form submission handler
		const handleFormSubmit = React.useCallback(() => {
			const errors: Record<string, string> = {};

			// Validate amount
			const amountNumber = parseFloat(internalPaymentData.amount || "0");
			if (
				!internalPaymentData.amount ||
				internalPaymentData.amount.trim() === "" ||
				isNaN(amountNumber) ||
				amountNumber <= 0
			) {
				errors.amount = "Please enter a valid amount greater than 0";
			}

			// Generate default payment reference if not provided
			const paymentReference = internalPaymentData.paymentReference?.trim() || 
				`PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

			// Validate payment description
			if (!internalPaymentData.paymentDescription?.trim()) {
				errors.paymentDescription = "Please enter a payment description";
			}

			// Validate payment date
			if (!internalPaymentData.paid_at) {
				errors.paid_at = "Please select payment date and time";
			}

			// Note: Sender account, sender bank, receiver account, and receiver bank fields are hidden
			// so their validation has been removed

			// If there are errors, set them and show toast
			if (Object.keys(errors).length > 0) {
				console.log("Validation errors:", errors);
				console.log("Current form data:", internalPaymentData);
				setFieldErrors(errors);
				showToast({
					type: "error",
					message: `Please fill in all required fields correctly. Errors: ${Object.keys(errors).join(", ")}`,
					duration: 5000,
				});
				return;
			}

			// If all validations pass, submit the form with generated payment reference
			setFieldErrors({});
			onSubmit({
				...internalPaymentData,
				paymentReference: paymentReference
			});
		}, [internalPaymentData, onSubmit]);

		// Transform banks data for AutoCompleteField
		const bankOptions = React.useMemo(
			() =>
				vfdBanks?.map((bank) => ({
					label: bank.name,
					value: bank.name,
				})) || [],
			[vfdBanks]
		);

		return (
			<Modal isOpen={isOpen} onClose={onClose} size="3xl">
				<ModalContent className="max-h-[90vh] overflow-hidden">
					{() => (
						<>
							<ModalHeader>Inject Payment History</ModalHeader>
							<ModalBody className="overflow-y-auto max-h-[calc(90vh-120px)]">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										label="Amount"
										htmlFor="amount"
										id="amount"
										type="text"
										placeholder="Enter amount (e.g., 1000.50)"
										value={internalPaymentData.amount}
										onChange={handleInternalAmountChange}
										size="sm"
										isInvalid={!!fieldErrors.amount}
										errorMessage={fieldErrors.amount}
										required
									/>

									<div className="space-y-2">
										<label className="block text-sm font-medium text-default-700">
											Payment Type *
										</label>
										<select
											className="w-full px-3 py-2 border border-default-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
											value={internalPaymentData.paymentType}
											onChange={(e) =>
												handleInternalPaymentDataChange(
													"paymentType",
													e.target.value
												)
											}
										>
											<option value="CREDIT">CREDIT</option>
											<option value="DEBIT">DEBIT</option>
										</select>
									</div>

									<FormField
										label="Payment Reference"
										htmlFor="paymentReference"
										id="paymentReference"
										type="text"
										placeholder="Enter payment reference (auto-generated if empty)"
										value={internalPaymentData.paymentReference || ""}
										onChange={(value) =>
											handleInternalPaymentDataChange("paymentReference", value)
										}
										size="sm"
									/>

									<FormField
										label="Payment Description"
										htmlFor="paymentDescription"
										id="paymentDescription"
										type="text"
										placeholder="Enter payment description"
										value={internalPaymentData.paymentDescription}
										onChange={(value) =>
											handleInternalPaymentDataChange(
												"paymentDescription",
												value
											)
										}
										size="sm"
										isInvalid={!!fieldErrors.paymentDescription}
										errorMessage={fieldErrors.paymentDescription}
										required
									/>

									<div className="space-y-2">
										<label className="block text-sm font-medium text-default-700">
											Payment Date & Time *
										</label>
										<DateInput
											aria-label="Payment Date and Time"
											granularity="minute"
											value={parseLocalDateTime(internalPaymentData.paid_at || "")}
											onChange={handleInternalDateChange}
											isRequired
											size="sm"
											className="w-full"
											isInvalid={!!fieldErrors.paid_at}
										/>
										{fieldErrors.paid_at && (
											<div className="text-red-500 text-xs">
												{fieldErrors.paid_at}
											</div>
										)}
									</div>
{/* 
									<FormField
										label="Sender Account Number"
										htmlFor="senderAccount"
										id="senderAccount"
										type="text"
										placeholder="Enter sender account number"
										value={internalPaymentData.senderAccount}
										onChange={(value) =>
											handleInternalPaymentDataChange("senderAccount", value)
										}
										size="sm"
										isInvalid={!!fieldErrors.senderAccount}
										errorMessage={fieldErrors.senderAccount}
										required
									/> */}

									{/* <AutoCompleteField
										label="Sender Bank"
										htmlFor="senderBank"
										id="senderBank"
										placeholder="Select Sender Bank"
										value={internalPaymentData.senderBank}
										onChange={(value: string) =>
											handleInternalPaymentDataChange("senderBank", value)
										}
										options={bankOptions}
										isInvalid={!!fieldErrors.senderBank}
										errorMessage={fieldErrors.senderBank}
										required
									/> */}

									{/* <FormField
										label="Receiver Account Number"
										htmlFor="receiverAccount"
										id="receiverAccount"
										type="text"
										placeholder="Enter receiver account number"
										value={internalPaymentData.receiverAccount}
										onChange={(value) =>
											handleInternalPaymentDataChange("receiverAccount", value)
										}
										size="sm"
										isInvalid={!!fieldErrors.receiverAccount}
										errorMessage={fieldErrors.receiverAccount}
										required
									/> */}

									{/* <AutoCompleteField
										label="Receiver Bank"
										htmlFor="receiverBank"
										id="receiverBank"
										placeholder="Select Receiver Bank"
										value={internalPaymentData.receiverBank}
										onChange={(value: string) =>
											handleInternalPaymentDataChange("receiverBank", value)
										}
										options={bankOptions}
										isInvalid={!!fieldErrors.receiverBank}
										errorMessage={fieldErrors.receiverBank}
										required
									/> */}
								</div>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="primary"
									variant="solid"
									onPress={handleFormSubmit}
								>
									Inject Payment
								</Button>
								<Button color="danger" variant="light" onPress={onClose}>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		);
	}
);

InjectPaymentModal.displayName = "InjectPaymentModal";

export default function CollectionSingleCustomerPage() {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/customers -> dev)
	const role = pathname.split("/")[2];

	// Debug logging for role extraction
	console.log("Pathname:", pathname);
	console.log("Extracted role:", role);

	const { userResponse } = useAuth();
	const userEmail = userResponse?.data?.email || "";

	const params = useParams();

	const [customer, setCustomer] = useState<CustomerRecord | null>(null);
	const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentScheduleData | null>(null);
	const [repaymentLoading, setRepaymentLoading] = useState(false);
	const [repaymentError, setRepaymentError] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");

	const {
		value: imei,
		error: imeiError,
		handleChange: handleImeiChange,
	} = useField("", ImeiSchema);
	const {
		value: agent,
		error: agentError,
		handleChange: handleAgentChange,
	} = useField("", AgentSchema);

	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<any[]>([]);

	const [isLoading, setIsLoading] = useState(true);
	const [selectedCustomer, setSelectedCustomer] =
		useState<CustomerRecord | null>(null);
	const [amount, setAmount] = useState<string>("");
	const [isButtonLoading, setIsButtonLoading] = useState(false);
	const [lastPoint, setLastPoint] = useState<string>("");
	const [selectedAction, setSelectedAction] = useState<string>("");
	const [deviceActionData, setDeviceActionData] = useState<{
		action: string;
		label: string;
		description: string;
		imei: string;
	} | null>(null);
	const [dueDate, setDueDate] = useState<string>("");
	const [dueTime, setDueTime] = useState<string>("");
	const [currentPaymentData, setCurrentPaymentData] =
		useState<InjectPaymentHistoryData | null>(null);

	const {
		isOpen: isUpdateWallet,
		onOpen: onUpdateWallet,
		onClose: onUpdateWalletClose,
	} = useDisclosure();
	const {
		isOpen: isUpdateLastPoint,
		onOpen: onUpdateLastPoint,
		onClose: onUpdateLastPointClose,
	} = useDisclosure();
	const {
		isOpen: isDeviceAction,
		onOpen: onDeviceAction,
		onClose: onDeviceActionClose,
	} = useDisclosure();
	const {
		isOpen: isUpdateLoanStatus,
		onOpen: onUpdateLoanStatus,
		onClose: onUpdateLoanStatusClose,
	} = useDisclosure();

	const {
		isOpen: isCreateWallet,
		onOpen: onCreateWallet,
		onClose: onCreateWalletClose,
	} = useDisclosure();

	const {
		isOpen: isSearch,
		onOpen: onSearch,
		onClose: onSearchClose,
	} = useDisclosure();

	const {
		isOpen: isUpdateImei,
		onOpen: onUpdateImei,
		onClose: onUpdateImeiClose,
	} = useDisclosure();

	const {
		isOpen: isAssignAgent,
		onOpen: onAssignAgent,
		onClose: onAssignAgentClose,
	} = useDisclosure();

	const {
		isOpen: isSubmitToRelay,
		onOpen: onSubmitToRelay,
		onClose: onSubmitToRelayClose,
	} = useDisclosure();

	// Inject Payment History modals
	const {
		isOpen: isInjectPayment,
		onOpen: onInjectPayment,
		onClose: onInjectPaymentClose,
	} = useDisclosure();

	const {
		isOpen: isConfirmInjectPayment,
		onOpen: onConfirmInjectPayment,
		onClose: onConfirmInjectPaymentClose,
	} = useDisclosure();

	// Regenerate Mandate modal
	const {
		isOpen: isRegenerateMandate,
		onOpen: onRegenerateMandate,
		onClose: onRegenerateMandateClose,
	} = useDisclosure();

	const {
		isOpen: isRegenerateMandateSuccess,
		onOpen: onRegenerateMandateSuccess,
		onClose: onRegenerateMandateSuccessClose,
	} = useDisclosure();

	// Send SMS modal
	const {
		isOpen: isSendSms,
		onOpen: onSendSms,
		onClose: onSendSmsClose,
	} = useDisclosure();

	const [isInjectingPayment, setIsInjectingPayment] = useState(false);
	const [isRegeneratingMandate, setIsRegeneratingMandate] = useState(false);

	// VFD Banks interface (copied from scanPartnerDetailView)
	interface VfdBank {
		id: number;
		code: string;
		name: string;
		logo: string;
		created: string;
	}

	// Fetch VFD Banks
	const fetchVfdBanks = async (): Promise<VfdBank[]> => {
		try {
			const response = await getVfdBanks();
			return response.data?.data?.bank || [];
		} catch (error) {
			console.error("Error fetching VFD banks:", error);
			return [];
		}
	};

	const { data: vfdBanks = [] } = useSWR("vfd-banks", fetchVfdBanks, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
		dedupingInterval: 300000, // Cache for 5 minutes
	});

	// Fetch Device Locks Logs
	const fetchDeviceLocksLogs = async () => {
		try {
			const imei = customer?.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.imei;
			if (!imei || imei === "N/A") return [];

			const response = await getDeviceLocksLogs(imei);
			return response.data || [];
		} catch (error) {
			console.error("Error fetching device locks logs:", error);
			return [];
		}
	};

	const { data: deviceLocksLogs = [], isLoading: isLoadingDeviceLogs } = useSWR(
		customer?.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.imei
			? `device-locks-logs-${customer.LoanRecord[0].DeviceOnLoan[0].imei}`
			: null,
		fetchDeviceLocksLogs,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000, // Cache for 1 minute
		}
	);

	useEffect(() => {
		const fetchCustomer = async () => {
			if (!params.id) {
				setIsLoading(false);
				return;
			}

			try {
				const response = await getCustomerRecordById(params.id as string);

				if (response && response.data) {
					setCustomer(response.data);
				} else {
					showToast({
						type: "error",
						message: "Customer not found",
						duration: 5000,
					});
				}
			} catch (error: any) {
				console.error("Error fetching customer:", error);
				showToast({
					type: "error",
					message: error.message || "Failed to fetch customer data",
					duration: 5000,
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchCustomer();
	}, [params.id]);

	// Fetch repayment schedule when customer data is available
	const loanRecordId = customer?.LoanRecord?.[0]?.loanRecordId;
	
	useEffect(() => {
		const fetchRepaymentSchedule = async () => {
			if (!loanRecordId) {
				setRepaymentSchedule(null);
				setRepaymentError(null);
				return;
			}

			setRepaymentLoading(true);
			setRepaymentError(null);
			
			try {
				const response = await getcustomerRepaymentSchedule(loanRecordId);
				
				if (response?.statusCode === 200 && response?.data) {
					setRepaymentSchedule(response.data);
				} else {
					const errorMessage = response?.message || "Invalid response format";
					setRepaymentError(errorMessage);
					showToast({
						type: "error",
						message: `Failed to load repayment schedule: ${errorMessage}`,
						duration: 5000,
					});
				}
			} catch (error: any) {
				const errorMessage = error?.message || "Network error occurred";
				setRepaymentError(errorMessage);
				console.error("Error fetching repayment schedule:", error);
				showToast({
					type: "error",
					message: `Failed to fetch repayment schedule: ${errorMessage}`,
					duration: 5000,
				});
			} finally {
				setRepaymentLoading(false);
			}
		};

		fetchRepaymentSchedule();
	}, [loanRecordId]);

	// Helper functions for repayment schedule
	const formatCurrency = useCallback((amount: number | undefined): string => {
		return amount ? `₦${amount.toLocaleString("en-GB")}` : "₦0";
	}, []);

	const formatDate = useCallback((dateString: string | undefined): string => {
		if (!dateString) return "N/A";
		try {
			return new Date(dateString).toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
		} catch {
			return "Invalid Date";
		}
	}, []);

	const formatDateTime = useCallback((dateString: string | undefined): string => {
		if (!dateString) return "N/A";
		try {
			return new Date(dateString).toLocaleString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
		} catch {
			return "Invalid Date";
		}
	}, []);

	const getStatusColor = useCallback((status: string): "success" | "warning" | "danger" => {
		switch (status) {
			case "COMPLETED":
				return "success";
			case "PENDING":
				return "warning";
			case "PARTIAL":
				return "danger";
			default:
				return "warning";
		}
	}, []);

	const getStatusIcon = useCallback((status: string) => {
		switch (status) {
			case "COMPLETED":
				return <CheckCircle className="w-6 h-6 text-green-500" />;
			case "PENDING":
				return <Clock className="w-6 h-6 text-yellow-500" />;
			case "PARTIAL":
				return <AlertCircle className="w-6 h-6 text-orange-500" />;
			default:
				return <Clock className="w-6 h-6 text-gray-500" />;
		}
	}, []);

	const calculateProgressPercentage = useCallback((amountPaid: number, amount: number): number => {
		if (!amount || amount === 0) return 0;
		return Math.min((amountPaid / amount) * 100, 100);
	}, []);

	// Helper function to convert datetime-local format to CalendarDateTime
	const parseLocalDateTime = useCallback((localDateTime: string) => {
		if (!localDateTime) return null;
		try {
			// Convert YYYY-MM-DDTHH:mm to proper format for parseDateTime
			// Remove any trailing Z or milliseconds if present
			const cleanDateTime = localDateTime
				.replace(/\.000Z$/, "")
				.replace(/Z$/, "");

			// Ensure the format is YYYY-MM-DDTHH:mm:ss
			const formattedDateTime =
				cleanDateTime.includes(":") && cleanDateTime.split(":").length === 2
					? cleanDateTime + ":00"
					: cleanDateTime;

			return parseDateTime(formattedDateTime);
		} catch (error) {
			// Silently return null to prevent console spam
			return null;
		}
	}, []);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!customer) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-default-900 mb-2">
						Customer Not Found
					</h2>
					<p className="text-default-500 mb-4">
						The requested customer information could not be found.
					</p>
					<Button
						variant="flat"
						color="primary"
						startContent={<ArrowLeft />}
						onPress={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	const handleUpdateWalletBalance = async () => {
		if (!amount || isNaN(Number(amount))) {
			showToast({
				type: "error",
				message: "Please enter a valid amount",
				duration: 5000,
			});
			return;
		}

		setIsButtonLoading(true);
		try {
			const response = await updateCustomerVirtualWalletBalance(
				customer.customerId,
				Number(amount)
			);
			console.log(response);
			showToast({
				type: "success",
				message: "Wallet balance updated successfully",
				duration: 5000,
			});
			onUpdateWalletClose();
			setAmount("");
			setSelectedCustomer(null);
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log(error);
			showToast({
				type: "error",
				message: error.message || "Failed to update wallet balance",
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	const handleCreateWallet = async () => {
		setIsButtonLoading(true);
		try {
			const response = await createCustomerVirtualWallet(customer.customerId);
			console.log(response);
			showToast({
				type: "success",
				message: "Wallet created successfully",
				duration: 5000,
			});
			onCreateWalletClose();
			setSelectedCustomer(null);
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log(error);
			showToast({
				type: "error",
				message: error.message || "Failed to create wallet",
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	const handleUpdateLastPoint = async () => {
		if (!lastPoint) {
			showToast({
				type: "error",
				message: "Please select a last point",
				duration: 5000,
			});
			return;
		}

		setIsButtonLoading(true);
		try {
			const response = await updateCustomerLastPoint(
				customer.customerId,
				lastPoint
			);
			console.log(response);
			showToast({
				type: "success",
				message: "Last point updated successfully",
				duration: 5000,
			});
			onUpdateLastPointClose();
			setLastPoint("");
			setSelectedCustomer(null);
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log(error);
			showToast({
				type: "error",
				message: error.message || "Failed to update last point",
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	const handleUpdateImei = async () => {
		if (!imei) {
			showToast({
				type: "error",
				message: "Please enter a valid imei",
				duration: 5000,
			});
			return;
		}

		setIsButtonLoading(true);
		try {
			const deviceOnLoanId =
				customer?.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.deviceOnLoanId;

			if (!deviceOnLoanId) {
				throw new Error("Device ID not found");
			}

			const response = await updateDeviceImeiNumber(deviceOnLoanId, imei);
			console.log(response);
			showToast({
				type: "success",
				message: "IMEI updated successfully",
				duration: 5000,
			});
			onUpdateImeiClose();
			handleImeiChange("");
			setSelectedCustomer(null);
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log(error);
			showToast({
				type: "error",
				message: error.message || "Failed to update IMEI",
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	const handleAssignCustomerToMbe = async () => {
		console.log("handleAssignCustomerToMbe called with agent:", agent);

		if (!agent) {
			showToast({
				type: "error",
				message: "Please enter a valid agent",
				duration: 5000,
			});
			return;
		}
		setIsButtonLoading(true);
		try {
			const response = await assignCustomersToMBE(customer.customerId, agent);
			console.log(response);
			showToast({
				type: "success",
				message: "Agent assigned to customer successfully",
				duration: 5000,
			});
			onAssignAgentClose();
			handleAgentChange("");
			setSelectedCustomer(null);
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log(error);
			showToast({
				type: "error",
				message: error.message || "Failed to assign Agent to customer",
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	const handleSubmitCustomerToRelay = async () => {
		console.log("handleSubmitCustomerToRelay called with agent:", agent);

		if (!agent) {
			showToast({
				type: "error",
				message: "Please enter a valid agent",
				duration: 5000,
			});
			return;
		}

		setIsButtonLoading(true);
		try {
			const response = await getMBEWithCustomerForRelay(agent);
			console.log(response);
			showToast({
				type: "success",
				message: "Customer submitted to relay successfully",
				duration: 5000,
			});
			onSubmitToRelayClose();
			handleAgentChange("");
			setSelectedCustomer(null);
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log(error);
			showToast({
				type: "error",
				message: error.message || "Failed to submit customer to relay",
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	const handleGlobalSearch = async (searchQuery: string) => {
		if (!searchQuery.trim()) return;
		setIsLoading(true);

		try {
			const response = await searchGlobalCustomer(searchQuery);
			console.log(response);
			setResults(response.data);
			showToast({
				type: "success",
				message: "Search results fetched successfully",
				duration: 5000,
			});
			setSearchQuery(searchQuery);
		} catch (error: any) {
			console.error("Error searching customers:", error);
			setResults([]);
			showToast({
				type: "error",
				message: error.message || "Error searching customers",
				duration: 5000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Device action configuration
	const allDeviceActions = [
		{
			label: "Lock Device",
			value: "lock_device",
			description: "Lock the customer's device remotely",
			color: "danger",
		},
		{
			label: "Unlock Device",
			value: "unlock_device",
			description: "Unlock the customer's device remotely",
			color: "success",
		},
		{
			label: "Release Device",
			value: "release_device",
			description: "Release the device from the customer's account",
			color: "warning",
		},
	];

	// Filter device actions based on user permissions
	const deviceActions = allDeviceActions.filter((action) => {
		switch (action.value) {
			case "lock_device":
				return hasPermission(role, "canLockDevice", userEmail);
			case "unlock_device":
				return hasPermission(role, "canTriggerDeviceActions", userEmail);
			case "release_device":
				return hasPermission(role, "canTriggerDeviceActions", userEmail);
			default:
				return false;
		}
	});

	// Debug logging
	console.log("Current role:", role);
	console.log(
		"Available device actions:",
		deviceActions.map((a) => a.label)
	);

	// Unified device action handler
	const handleDeviceAction = async (action: string, imei: string) => {
		if (!imei || imei === "N/A") {
			showToast({
				type: "error",
				message: "No device imei found",
				duration: 5000,
			});
			return;
		}

		setIsButtonLoading(true);
		try {
			let response;
			let successMessage = "";

			switch (action) {
				case "lock_device":
					response = await lockDevice(imei);
					successMessage = "Device locked successfully";
					break;
				case "unlock_device":
					// Format date as DD/MM/YYYY and convert time to 24hr format minus 1 hour
					const formattedDate = formatDateForEndpoint(dueDate);
					const formattedTime = formatTimeForEndpoint(dueTime);
					response = await unlockDevice(imei, formattedDate, formattedTime);
					successMessage = "Device unlocked successfully";
					break;
				case "release_device":
					response = await releaseDevice(imei);
					successMessage = "Device released successfully";
					break;
				default:
					throw new Error("Invalid action");
			}

			console.log(response);
			showToast({
				type: "success",
				message: successMessage,
				duration: 5000,
			});
			onDeviceActionClose();
			setSelectedAction("");
			setDeviceActionData(null);
			setDueDate("");
			setDueTime("");
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log(error);
			showToast({
				type: "error",
				message: error.message || `Failed to ${action.replace(/_/g, " ")}`,
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	// Helper function to format date as DD/MM/YYYY
	const formatDateForEndpoint = (dateString: string): string => {
		if (!dateString) return "";

		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();

		return `${day}/${month}/${year}`;
	};

	// Helper function to convert time to 24hr format and subtract 1 hour
	const formatTimeForEndpoint = (timeString: string): string => {
		if (!timeString) return "";

		const [hours, minutes] = timeString.split(":").map(Number);

		// Convert to 24hr format (already in 24hr format from input type="time")
		// Subtract 1 hour
		let adjustedHours = hours - 1;

		// Handle negative hours (wrap to previous day)
		if (adjustedHours < 0) {
			adjustedHours = 23;
		}

		const formattedHours = adjustedHours.toString().padStart(2, "0");
		const formattedMinutes = minutes.toString().padStart(2, "0");

		return `${formattedHours}:${formattedMinutes}`;
	};

	// Handle action selection and modal opening
	const handleActionSelection = (actionValue: string) => {
		const action = deviceActions.find((a) => a.value === actionValue);
		if (!action) return;

		const imei = customer.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.imei || "N/A";

		setDeviceActionData({
			action: action.value,
			label: action.label,
			description: action.description,
			imei: imei,
		});

		onDeviceAction();
	};

	// update loan status
	const handleUpdateLoanStatus = async () => {
		console.log(
			"handleUpdateLoanStatus called with selectedAction:",
			selectedAction
		);
		console.log(
			"customer.LoanRecord?.[0]?.loanRecordId:",
			customer.LoanRecord?.[0]?.loanRecordId
		);

		if (!selectedAction) {
			showToast({
				type: "error",
				message: "Please select a valid loan status",
				duration: 5000,
			});
			return;
		}

		if (!customer.LoanRecord?.[0]?.loanRecordId) {
			showToast({
				type: "error",
				message: "No loan record found for this customer",
				duration: 5000,
			});
			return;
		}

		setIsButtonLoading(true);
		try {
			const response = await changeLoanStatus(
				customer.LoanRecord[0].loanRecordId,
				selectedAction
			);
			showToast({
				type: "success",
				message: "Loan status updated successfully",
				duration: 5000,
			});

			onUpdateLoanStatusClose();
			setSelectedAction("");
			setSelectedCustomer(null);
			// Refresh the page
			window.location.reload();
		} catch (error: any) {
			console.log("Error updating loan status:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to update loan status",
				duration: 5000,
			});
		} finally {
			setIsButtonLoading(false);
		}
	};

	// Inject Payment History Handlers
	const handleOpenInjectPaymentModal = () => {
		// Reset form data with current date/time as default
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const hours = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

		onInjectPayment();
	};

	const handleInjectPaymentSubmit = (paymentData: InjectPaymentHistoryData) => {
		setCurrentPaymentData(paymentData);
		onInjectPaymentClose();
		onConfirmInjectPayment();
	};

	const handleConfirmInjectPayment = async () => {
		if (!customer?.customerId || !currentPaymentData) return;

		setIsInjectingPayment(true);
		try {
			// Convert datetime-local format to ISO string for API
			const apiPaymentData = {
				...currentPaymentData,
				paid_at: new Date(currentPaymentData.paid_at || "").toISOString(),
			};

			const response = await injectPaymentHistory(
				customer.customerId,
				apiPaymentData
			);

			showToast({
				type: "success",
				message: "Payment history injected successfully",
				duration: 5000,
			});

			// Add the new transaction to the frontend optimistically
			if (customer.TransactionHistory) {
				const amountNumber = parseFloat(currentPaymentData.amount || "0");
				const prevBalance = Number(
					customer.TransactionHistory[0]?.newBalance || 0
				);

				const newTransaction = {
					transactionHistoryId: `temp-${Date.now()}`,
					amount: amountNumber,
					paymentType: currentPaymentData.paymentType || "CREDIT",
					prevBalance: prevBalance,
					newBalance:
						currentPaymentData.paymentType === "CREDIT"
							? prevBalance + amountNumber
							: prevBalance - amountNumber,
					paymentReference: currentPaymentData.paymentReference || "PAYSTACK63764",
					extRef: currentPaymentData.paymentReference || "N/A",
					currency: "NGN",
					channel: "MANUAL_INJECTION",
					charge: 0,
					chargeNarration: "N/A",
					senderBank: currentPaymentData.senderBank || "",
					senderAccount: currentPaymentData.senderAccount || "",
					recieverBank: currentPaymentData.receiverBank || "N/A",
					recieverAccount: currentPaymentData.receiverAccount || "N/A",
					paymentDescription: currentPaymentData.paymentDescription || "monthly repayment",
					paid_at: currentPaymentData.paid_at || new Date().toISOString(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					userid: customer.customerId,
					customersCustomerId: customer.customerId,
				};

				setCustomer((prev: CustomerRecord | null) =>
					prev
						? {
								...prev,
								TransactionHistory: [
									newTransaction,
									...(prev?.TransactionHistory || []),
								],
						  }
						: null as CustomerRecord | null			
				);
			}

			onConfirmInjectPaymentClose();
		} catch (error: any) {
			console.error("Error injecting payment history:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to inject payment history",
				duration: 5000,
			});
		} finally {
			setIsInjectingPayment(false);
		}
	};

	const handleRegenerateMandate = async () => {
		if (!customer?.customerId) return;

		setIsRegeneratingMandate(true);
		try {
			await deleteCustomerMandateAndUpdateLastPoint(
				customer.customerId,
				"Loan Data Submission"
			);

			showToast({
				type: "success",
				message: "Customer mandate regenerated successfully",
				duration: 5000,
			});

			onRegenerateMandateClose();
			onRegenerateMandateSuccess();
		} catch (error: any) {
			console.error("Error regenerating mandate:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to regenerate mandate",
				duration: 5000,
			});
		} finally {
			setIsRegeneratingMandate(false);
			onRegenerateMandateClose();
		}
	};

	return (
		<div className="min-h-screen bg-default-50">
			{/* Header Section */}
			<div className="bg-white border-b border-default-200">
				<div className=" py-6">
					<div className="flex items-center justify-between">
						<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
							<div>
								<h1 className="text-lg font-bold text-default-900">
									{customer.firstName} {customer.lastName}
								</h1>
							</div>
							<Chip
								color={customer.dobMisMatch ? "danger" : "success"}
								variant="flat"
								className="font-medium w-fit"
							>
								{customer.dobMisMatch === false
									? "DOB Verified"
									: "DOB Mismatch"}
							</Chip>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="flat"
								color="primary"
								startContent={<Search className="w-4 h-4" />}
								onPress={() => {
									setSelectedCustomer(customer);
									onSearch();
								}}
								className="mr-2"
							>
								Search
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="  px-2  py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
					{/* Left Column - Personal Information */}
					<div className="lg:col-span-1 space-y-8">
						{/* Personal Information */}
						<InfoCard
							title="Personal Information"
							icon={<User className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
									<InfoField
										label="Customer ID"
										value={customer.customerId}
										copyable
									/>

									{/* Repayment Profile Link using InfoField */}
									<InfoField
										label="Repayment Profile"
										value={`sentiflex.connectwithsapphire.com/repay/${customer.customerId}`}
										endComponent={
											<div className="flex items-center gap-2">
												<a
													href={`https://sentiflex.connectwithsapphire.com/repay/${customer.customerId}`}
													target="_blank"
													rel="noopener noreferrer"
													className="max-w-[180px] truncate text-blue-600 hover:underline"
													title={`https://sentiflex.connectwithsapphire.com/repay/${customer.customerId}`}
												>
													View
												</a>
												<Snippet
													codeString={`https://sentiflex.connectwithsapphire.com/repay/${customer.customerId}`}
													className="p-0"
													size="sm"
													hideSymbol
													hideCopyButton={false}
												/>
											</div>
										}
									/>
									<InfoField
										label="Full Name"
										value={`${customer.firstName} ${customer.lastName}`}
									/>
									<InfoField label="Email" value={customer.email} />
									<InfoField label="BVN" value={customer.bvn} />
									<InfoField label="BVN Date of Birth" value={customer.dob} />
									<InfoField
										label="Inputted Date of Birth"
										value={customer.inputtedDob}
									/>
									<InfoField
										label="BVN Phone"
										value={customer.bvnPhoneNumber}
									/>
									<InfoField
										label="Main Phone"
										value={customer.mainPhoneNumber}
									/>

									{/* SMS Button */}
									{hasPermission(role, "canSendSms", userEmail) && (
										<div className="bg-default-50 rounded-lg p-4">
											<Button
												color="primary"
												variant="solid"
												onPress={() => {
													setSelectedCustomer(customer);
													onSendSms();
												}}
												startContent={<MessageSquare className="w-4 h-4" />}
											>
												Send SMS
											</Button>
										</div>
									)}

									<InfoField label="MBE ID" value={customer.mbeId} />
									<InfoField
										label="Mono Customer Connected ID"
										value={customer.monoCustomerConnectedCustomerId}
									/>
									<InfoField label="Channel" value={customer.channel} />
									<InfoField
										label="Created At"
										value={
											customer.createdAt
												? new Date(customer.createdAt).toLocaleString("en-GB")
												: "N/A"
										}
									/>
									<InfoField
										label="Updated At"
										value={
											customer.updatedAt
												? new Date(customer.updatedAt).toLocaleString("en-GB")
												: "N/A"
										}
									/>
									<InfoField
										label="Customer Loan Disk ID"
										value={customer.customerLoanDiskId}
									/>
								</div>
							</div>
						</InfoCard>

						{/* KYC Information */}
						<InfoCard
							title="KYC Information"
							icon={<User className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
									<InfoField
										label="Address"
										value={customer.CustomerKYC?.[0]?.applicantAddress}
									/>
									<InfoField
										label="House Number"
										value={customer.CustomerKYC?.[0]?.houseNumber}
									/>
									<InfoField
										label="Street Address"
										value={customer.CustomerKYC?.[0]?.streetAddress}
									/>
									<InfoField
										label="Nearest Bus Stop"
										value={customer.CustomerKYC?.[0]?.nearestBusStop}
									/>
									<InfoField
										label="Local Government"
										value={customer.CustomerKYC?.[0]?.localGovernment}
									/>
									<InfoField
										label="State"
										value={customer.CustomerKYC?.[0]?.state}
									/>
									<InfoField
										label="Town"
										value={customer.CustomerKYC?.[0]?.town}
									/>
									<InfoField
										label="Occupation"
										value={customer.CustomerKYC?.[0]?.occupation}
									/>
									<InfoField
										label="Business Name"
										value={customer.CustomerKYC?.[0]?.businessName}
									/>
									<InfoField
										label="Business Address"
										value={customer.CustomerKYC?.[0]?.applicantBusinessAddress}
									/>
									<InfoField
										label="Source"
										value={customer.CustomerKYC?.[0]?.source}
									/>
									<InfoField
										label="KYC Created At"
										value={
											customer.CustomerKYC?.[0]?.createdAt
												? new Date(
														customer.CustomerKYC?.[0]?.createdAt
												  ).toLocaleString("en-GB")
												: "N/A"
										}
									/>
									<InfoField
										label="KYC Updated At"
										value={
											customer.CustomerKYC?.[0]?.updatedAt
												? new Date(
														customer.CustomerKYC?.[0]?.updatedAt
												  ).toLocaleString("en-GB")
												: "N/A"
										}
									/>
									<InfoField
										label="KYC Channel"
										value={customer.CustomerKYC?.[0]?.channel}
									/>
								</div>

								{/* Referee Information */}
								<div className="mt-8 pt-8 border-t border-default-200">
									<div className="flex items-center justify-between mb-4">
										<h4 className="text-base font-semibold text-default-900 mb-4">
											KYC Status
										</h4>
										<p
											className={`text-sm mb-1 ${
												customer.CustomerKYC?.[0]?.generalStatus === "APPROVED"
													? "text-success-500 font-medium bg-success-50 px-4 py-1 rounded-md"
													: customer.CustomerKYC?.[0]?.generalStatus ===
													  "REJECTED"
													? "text-danger-500 font-medium bg-danger-50 px-4 py-1 rounded-md"
													: "text-warning-500 font-medium bg-warning-50 px-4 py-1 rounded-md"
											}`}
										>
											{customer.CustomerKYC?.[0]?.generalStatus}
										</p>
									</div>

									<div>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
											<InfoField
												label="Referee 1"
												value={
													customer.CustomerKYC?.[0]?.refName2
														? `${customer.CustomerKYC[0].refName2} - ${
																customer.CustomerKYC?.[0]?.phone2 || "N/A"
														  }`
														: customer.CustomerKYC?.[0]?.phone2 || "N/A"
												}
											/>
											<InfoField
												label="Referee 2"
												value={
													customer.CustomerKYC?.[0]?.refName3
														? `${customer.CustomerKYC[0].refName3} - ${
																customer.CustomerKYC?.[0]?.phone3 || "N/A"
														  }`
														: customer.CustomerKYC?.[0]?.phone3 || "N/A"
												}
											/>
											<InfoField
												label="Referee 3"
												value={
													customer.CustomerKYC?.[0]?.refName4
														? `${customer.CustomerKYC[0].refName4} - ${
																customer.CustomerKYC?.[0]?.phone4 || "N/A"
														  }`
														: customer.CustomerKYC?.[0]?.phone4 || "N/A"
												}
											/>
											<InfoField
												label="Referee 4"
												value={
													customer.CustomerKYC?.[0]?.refName5
														? `${customer.CustomerKYC[0].refName5} - ${
																customer.CustomerKYC?.[0]?.phone5 || "N/A"
														  }`
														: customer.CustomerKYC?.[0]?.phone5 || "N/A"
												}
											/>
										</div>
										{customer.CustomerKYC?.[0]?.phoneApproved && (
											<div className="bg-green-50 rounded-lg p-4 mt-4">
												<p>Approved Referee number</p>
												<div className="font-medium text-default-900">
													{customer.CustomerKYC?.[0]?.phoneApproved}
												</div>
											</div>
										)}

										{customer.CustomerKYC?.[0]?.generalStatus === "REJECTED" &&
											customer.CustomerKYC?.[0]?.generalComment && (
												<div className="bg-red-50 rounded-lg p-4 mt-4">
													<p className="text-red-700 font-medium mb-2">
														Rejection Reason
													</p>
													<div className="font-medium text-default-900">
														{customer.CustomerKYC?.[0]?.generalComment}
													</div>
												</div>
											)}

										{/* Updated By Information */}
										{customer.CustomerKYC?.[0]?.updated_by && (
											<div className="bg-blue-50 rounded-lg p-4 mt-4">
												<p className="text-blue-700 font-medium mb-2">
													Last Updated By
												</p>
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													<div>
														<div className="text-sm text-blue-600 mb-1">
															Updated By
														</div>
														<div className="font-medium text-default-900">
															{customer.CustomerKYC[0].updated_by.user
																?.firstName &&
															customer.CustomerKYC[0].updated_by.user?.lastName
																? `${customer.CustomerKYC[0].updated_by.user.firstName} ${customer.CustomerKYC[0].updated_by.user.lastName}`
																: customer.CustomerKYC[0].updated_by.adminid ||
																  "N/A"}
														</div>
													</div>
													<div>
														<div className="text-sm text-blue-600 mb-1">
															Email
														</div>
														<div className="font-medium text-default-900">
															{customer.CustomerKYC[0].updated_by.user?.email ||
																"N/A"}
														</div>
													</div>
													<div>
														<div className="text-sm text-blue-600 mb-1">
															Phone
														</div>
														<div className="font-medium text-default-900">
															{customer.CustomerKYC[0].updated_by.user
																?.telephoneNumber || "N/A"}
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</InfoCard>

						{/* Registration Details */}
						<InfoCard
							title="Registered By"
							icon={<Users className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
									<InfoField label="Title" value={customer.regBy?.title} />
									<InfoField
										label="Full Name"
										value={`${customer.regBy?.firstname} ${customer.regBy?.lastname}`}
									/>
									<InfoField label="Phone" value={customer.regBy?.phone} />
									<InfoField
										label="Username"
										value={customer.regBy?.username}
									/>
									<InfoField
										label="Account Status"
										value={customer.regBy?.accountStatus}
									/>
									<InfoField label="Role" value={customer.regBy?.role} />
									<InfoField label="State" value={customer.regBy?.state} />
									<InfoField
										label="Assigned Store Branch"
										value={customer.regBy?.assignedStoreBranch}
									/>
									<InfoField
										label="Created At"
										value={
											customer.regBy?.createdAt
												? new Date(customer.regBy.createdAt).toLocaleString(
														"en-GB"
												  )
												: "N/A"
										}
									/>
									<InfoField
										label="Updated At"
										value={
											customer.regBy?.updatedAt
												? new Date(customer.regBy.updatedAt).toLocaleString(
														"en-GB"
												  )
												: "N/A"
										}
									/>
									<InfoField label="MBE ID" value={customer.regBy?.mbeId} />
									<InfoField
										label="MBE Old ID"
										value={customer.regBy?.mbe_old_id}
									/>
									{hasPermission(role, "canAssignAgent", userEmail) && (
										<div className="flex items-center gap-2">
											<Button
												color="primary"
												variant="solid"
												onPress={() => {
													setSelectedCustomer(customer);
													onAssignAgent();
												}}
											>
												Assign Agent
											</Button>
											<Button
												color="primary"
												variant="solid"
												onPress={() => {
													setSelectedCustomer(customer);
													onSubmitToRelay();
												}}
											>
												submit to relay
											</Button>
										</div>
									)}
								</div>

								{/* Stores Table */}
								<div className="mt-8 pt-8 border-t border-default-200">
									<h4 className="text-base font-semibold text-default-900 mb-4">
										Stores Assigned to MBE
									</h4>
									<div className="overflow-x-auto rounded-lg border border-default-200">
										<table className="w-full">
											<thead>
												<tr className="bg-default-50 border-b border-default-200">
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Store Name
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Address
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														City
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														State
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Region
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Phone
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Email
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Operating Hours
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Bank Name
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Account Number
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Account Name
													</th>
													<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
														Bank Code
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-default-200">
												{customer.regBy?.stores?.map((store, index) => (
													<tr
														key={index}
														className="hover:bg-default-50 transition-colors duration-150 ease-in-out"
													>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-default-900">
															{store.store?.storeName || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.address || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.city || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.state || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.region || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.phoneNumber || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.storeEmail || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.storeOpen && store.store?.storeClose
																? `${store.store.storeOpen} - ${store.store.storeClose}`
																: "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.bankName || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.accountNumber || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.accountName || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{store.store?.bankCode || "N/A"}
														</td>
													</tr>
												))}
												{(!customer.regBy?.stores ||
													customer.regBy.stores.length === 0) && (
													<tr>
														<td colSpan={12} className="px-6 py-12 text-center">
															<EmptyState
																title="No Stores Registered"
																description="There are no stores to display at this time."
																icon={
																	<svg
																		className="w-12 h-12 mb-4 text-default-300"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
																		/>
																	</svg>
																}
															/>
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</InfoCard>

						{/* locking and unlocking device*/}

						{/* Device Activity Actions*/}
						{(() => {
							const hasDevicePermission = hasPermission(
								role,
								"canTriggerDeviceActions",
								userEmail
							);
							console.log("Has device permission:", hasDevicePermission);
							return hasDevicePermission;
						})() && (
							<InfoCard
								title="Device Activity Actions"
								icon={<Smartphone className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={true}
							>
								<div className="p-4">
									<SelectField
										label="Trigger Action"
										htmlFor="action"
										id="action"
										placeholder="Select Action"
										size="sm"
										defaultSelectedKeys={selectedAction ? [selectedAction] : []}
										options={deviceActions.map((action) => ({
											label: action.label,
											value: action.value,
										}))}
										onChange={(e) => setSelectedAction(e as string)}
									/>
									<Button
										className="mt-4"
										size="sm"
										color="primary"
										variant="solid"
										isDisabled={!selectedAction}
										onPress={() => handleActionSelection(selectedAction)}
									>
										Trigger
									</Button>
								</div>
							</InfoCard>
						)}
					</div>

					{/* Right Column - Referees and Loan Info */}
					<div className="lg:col-span-2 space-y-8">
						{/* Loan Information */}
						<InfoCard
							title="Loan Information"
							icon={<CreditCard className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									<InfoField
										label="Loan Amount"
										value={`₦${
											customer.LoanRecord?.[0]?.loanAmount?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="Monthly Repayment"
										value={`₦${
											customer.LoanRecord?.[0]?.monthlyRepayment?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="Duration"
										value={`${
											customer.LoanRecord?.[0]?.duration || "N/A"
										} months`}
									/>
									<InfoField
										label="Interest Amount"
										value={`₦${
											customer.LoanRecord?.[0]?.interestAmount?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Loan Status
										</div>
										<div className="font-medium">
											<Chip
												color={
													customer.LoanRecord?.[0]?.loanStatus === "APPROVED"
														? "success"
														: customer.LoanRecord?.[0]?.loanStatus ===
														  "REJECTED"
														? "danger"
														: "warning"
												}
												variant="flat"
												className="font-medium"
											>
												{customer.LoanRecord?.[0]?.loanStatus || "PENDING"}
											</Chip>
										</div>
									</div>
									<InfoField
										label="Last Point"
										value={customer.LoanRecord?.[0]?.lastPoint || "N/A"}
									/>
									<InfoField
										label="Down Payment"
										value={`₦${
											customer.LoanRecord?.[0]?.downPayment?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="Insurance Package"
										value={customer.LoanRecord?.[0]?.insurancePackage || "N/A"}
									/>
									<InfoField
										label="Insurance Price"
										value={`₦${
											customer.LoanRecord?.[0]?.insurancePrice?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="MBS Eligible Amount"
										value={`₦${
											customer.LoanRecord?.[0]?.mbsEligibleAmount?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="Pay Frequency"
										value={customer.LoanRecord?.[0]?.payFrequency || "N/A"}
									/>
									<InfoField
										label="Total Repayment"
										value={`₦${
											(
												(customer.LoanRecord?.[0]?.monthlyRepayment ?? 0) *
												(customer.LoanRecord?.[0]?.duration ?? 0)
											)?.toLocaleString("en-GB") || "N/A"
										}`}
									/>
									<InfoField
										label="Device Name"
										value={customer.LoanRecord?.[0]?.deviceName || "N/A"}
									/>
									<InfoField
										label="Device Price"
										value={`₦${
											customer.LoanRecord?.[0]?.devicePrice?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="Device price with insurance"
										value={`₦${
											customer.LoanRecord?.[0]?.deviceAmount?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="Loan Created At"
										value={
											customer.LoanRecord?.[0]?.createdAt
												? new Date(
														customer.LoanRecord[0].createdAt
												  ).toLocaleString("en-GB")
												: "N/A"
										}
									/>
									<InfoField
										label="Loan Updated At"
										value={
											customer.LoanRecord?.[0]?.updatedAt
												? new Date(
														customer.LoanRecord[0].updatedAt
												  ).toLocaleString("en-GB")
												: "N/A"
										}
									/>
									{hasPermission(role, "canUpdateLastPoint", userEmail) ? (
										<div className="bg-default-50 rounded-lg p-4">
											<button
												className="bg-primary text-white px-4 py-2 rounded-md"
												onClick={() => {
													onUpdateLastPoint();
													setSelectedCustomer(customer);
												}}
											>
												Update Last Point
											</button>
										</div>
									) : null}
									{hasPermission(role, "canUpdateLoanStatus", userEmail) ? (
										<div className="bg-default-50 rounded-lg p-4">
											<button
												className="bg-primary text-white px-4 py-2 rounded-md"
												onClick={() => {
													onUpdateLoanStatus();
													setSelectedCustomer(customer);
													setSelectedAction(""); // Clear previous selection
												}}
											>
												Update Loan Status
											</button>
										</div>
									) : null}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
									<InfoField
										label="Loan Record ID"
										value={customer.LoanRecord?.[0]?.loanRecordId || "N/A"}
									/>
									<InfoField
										label="Device ID"
										value={customer.LoanRecord?.[0]?.deviceId || "N/A"}
									/>
									<InfoField
										label="Loan Disk ID"
										value={customer.LoanRecord?.[0]?.loanDiskId || "N/A"}
									/>
									<InfoField
										label="Store ID"
										value={customer.LoanRecord?.[0]?.storeId || "N/A"}
									/>
								</div>

								{/* Store on Loan Information */}
								<div className="mt-8 pt-8 border-t border-default-200">
									<h4 className="text-base font-semibold text-default-900 mb-4">
										Store on Loan
									</h4>
									<div className="grid grid-cols-1 gap-6">
										{customer.LoanRecord?.[0]?.StoresOnLoan &&
										customer.LoanRecord[0].StoresOnLoan.length > 0 ? (
											customer.LoanRecord[0].StoresOnLoan.map(
												(store, index) => (
													<div
														key={index}
														className="bg-default-50 rounded-lg p-4"
													>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Store ID
																</div>
																<div className="font-medium text-default-900">
																	{store.storeId || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Amount
																</div>
																<div className="font-medium text-default-900">
																	{store.amount !== undefined
																		? `₦${store.amount.toLocaleString("en-GB")}`
																		: "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Status
																</div>
																<div className="font-medium">
																	<Chip
																		color={
																			store.status === "PAID"
																				? "success"
																				: store.status === "PENDING"
																				? "warning"
																				: store.status === "UNPAID"
																				? "danger"
																				: store.status === "FAILED"
																				? "danger"
																				: "default"
																		}
																		variant="flat"
																		className="font-medium"
																	>
																		{store.status || "UNPAID"}
																	</Chip>
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Pay Channel
																</div>
																<div className="font-medium text-default-900">
																	{store.payChannel || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Bank Used
																</div>
																<div className="font-medium text-default-900">
																	{store.bankUsed || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Channel
																</div>
																<div className="font-medium text-default-900">
																	{store.channel || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Created At
																</div>
																<div className="font-medium text-default-900">
																	{store.createdAt
																		? new Date(store.createdAt).toLocaleString(
																				"en-GB"
																		  )
																		: "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Updated At
																</div>
																<div className="font-medium text-default-900">
																	{store.updatedAt
																		? new Date(store.updatedAt).toLocaleString(
																				"en-GB"
																		  )
																		: "N/A"}
																</div>
															</div>
															<PaymentReceipt
																transactionData={{
																	customerId: customer?.customerId || "N/A",
																	receiptNumber:
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.reference || "N/A",
																	transactionId:
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.tnxId || "N/A",
																	sessionId:
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.sessionId || "N/A",
																	amount: (
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.amount || 0
																	).toString(),
																	currency: "NGN",
																	date:
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.createdAt || "N/A",
																	status:
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.status || "N/A",
																	paymentMethod:
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.bankUsed || "N/A",
																	sender: {
																		name: "Sentiflex",
																		company: "Sapphire Virtual Network",
																		email: "info@sapphirevirtual.com",
																	},
																	recipient: {
																		name:
																			customer?.LoanRecord?.[0]?.store
																				?.accountName || "N/A",
																		company:
																			customer?.LoanRecord?.[0]?.store
																				?.storeName || "N/A",
																		account:
																			customer?.LoanRecord?.[0]?.store
																				?.accountNumber || "N/A",
																		bank:
																			customer?.LoanRecord?.[0]?.store
																				?.bankName || "N/A",
																	},
																	fee: (
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.amount || 0
																	).toString(),
																	reference:
																		customer?.LoanRecord?.[0]?.StoresOnLoan?.[0]
																			?.tnxId || "N/A",
																	description:
																		"Payment for " +
																		(customer?.LoanRecord?.[0]?.device
																			?.deviceName || "N/A"),
																}}
															/>
														</div>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Session ID
																</div>
																<div className="font-medium text-default-900">
																	{store.sessionId || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Reference
																</div>
																<div className="font-medium text-default-900">
																	{store.reference || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Transaction ID
																</div>
																<div className="font-medium text-default-900">
																	{store.tnxId || "N/A"}
																</div>
															</div>
														</div>
													</div>
												)
											)
										) : (
											<EmptyState
												title="No Store on Loan Data"
												description="There are no stores on loan to display at this time."
												icon={
													<svg
														className="w-12 h-12 mb-4 text-default-300"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
														/>
													</svg>
												}
											/>
										)}
									</div>
								</div>

								{/* Device on Loan Information */}
								<div className="mt-8 pt-8 border-t border-default-200">
									<h4 className="text-base font-semibold text-default-900 mb-4">
										Device on Loan
									</h4>
									<div className="grid grid-cols-1 gap-6">
										{customer.LoanRecord?.[0]?.DeviceOnLoan &&
										customer.LoanRecord[0].DeviceOnLoan.length > 0 ? (
											customer.LoanRecord[0].DeviceOnLoan.map(
												(device, index) => (
													<div
														key={index}
														className="bg-default-50 rounded-lg p-4"
													>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Device ID
																</div>
																<div className="font-medium text-default-900">
																	{device.deviceId || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Status
																</div>
																<div className="font-medium">
																	<Chip
																		color={
																			device.status === "ENROLLED"
																				? "success"
																				: device.status === "UNENROLLED"
																				? "danger"
																				: "warning"
																		}
																		variant="flat"
																		className="font-medium"
																	>
																		{device.status || "UNENROLLED"}
																	</Chip>
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	IMEI
																</div>
																<div className="font-medium text-default-900">
																	{device.imei || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Amount
																</div>
																<div className="font-medium text-default-900">
																	{device.amount !== undefined
																		? `₦${device.amount.toLocaleString(
																				"en-GB"
																		  )}`
																		: "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Device Price
																</div>
																<div className="font-medium text-default-900">
																	{device.devicePrice !== undefined
																		? `₦${device.devicePrice.toLocaleString(
																				"en-GB"
																		  )}`
																		: "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Channel
																</div>
																<div className="font-medium text-default-900">
																	{device.channel || "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Created At
																</div>
																<div className="font-medium text-default-900">
																	{device.createdAt
																		? new Date(device.createdAt).toLocaleString(
																				"en-GB"
																		  )
																		: "N/A"}
																</div>
															</div>
															<div>
																<div className="text-sm text-default-500 mb-1">
																	Updated At
																</div>
																<div className="font-medium text-default-900">
																	{device.updatedAt
																		? new Date(device.updatedAt).toLocaleString(
																				"en-GB"
																		  )
																		: "N/A"}
																</div>
															</div>
															<div>
																{hasPermission(
																	role,
																	"canUpdateDeviceImei",
																	userEmail
																) ? (
																	<div className="font-medium text-default-900">
																		<Button
																			color="primary"
																			variant="solid"
																			onPress={() => {
																				onUpdateImei();
																				setSelectedCustomer(customer);
																			}}
																		>
																			Update IMEI
																		</Button>
																	</div>
																) : null}
															</div>
														</div>
													</div>
												)
											)
										) : (
											<EmptyState
												title="No Device on Loan Data"
												description="There are no devices on loan to display at this time."
												icon={
													<svg
														className="w-12 h-12 mb-4 text-default-300"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
														/>
													</svg>
												}
											/>
										)}
									</div>
								</div>
							</div>
						</InfoCard>

						{/* Wallet Information */}
						<InfoCard
							title="Virtual Account Information"
							icon={<CreditCard className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
									<InfoField
										label="Wallet ID"
										value={customer.Wallet?.wallet_id || "N/A"}
									/>
									<InfoField
										label="Account Number"
										value={customer.Wallet?.accountNumber || "N/A"}
									/>
									<InfoField
										label="Bank Name"
										value={customer.Wallet?.bankName || "N/A"}
									/>
									<InfoField
										label="Account Name"
										value={customer.Wallet?.accountName || "N/A"}
									/>
									<InfoField
										label="Current Balance"
										value={`₦${
											customer.WalletBalance?.balance?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									<InfoField
										label="Last Balance"
										value={`₦${
											customer.WalletBalance?.lastBalance?.toLocaleString(
												"en-GB"
											) || "N/A"
										}`}
									/>
									{hasPermission(role, "canUpdateWalletBalance", userEmail) ? (
										<div className="bg-default-50 rounded-lg p-4">
											<button
												className="bg-primary text-white px-4 py-2 rounded-md"
												onClick={() => {
													onUpdateWallet();
													setSelectedCustomer(customer);
												}}
											>
												Update Wallet Balance
											</button>
										</div>
									) : null}
									{hasPermission(role, "canUpdateWalletBalance", userEmail) ? (
										<div className="bg-default-50 rounded-lg p-4">
											<button
												className="bg-primary text-white px-4 py-2 rounded-md"
												onClick={() => {
													onCreateWallet();
													setSelectedCustomer(customer);
												}}
											>
												Create Wallet
											</button>
										</div>
									) : null}
								</div>
							</div>
						</InfoCard>

						{/* Account Details */}
						<InfoCard
							title="Customer Account Details"
							icon={<CreditCard className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 gap-6 w-full">
									{customer.CustomerAccountDetails?.map((account, index) => (
										<div
											key={index}
											className="bg-default-50 rounded-lg p-4 w-full"
										>
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
												<div>
													<div className="text-sm text-default-500 mb-1">
														Account Number
													</div>
													<div className="font-medium text-default-900">
														{account.accountNumber || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Bank Code
													</div>
													<div className="font-medium text-default-900">
														{account.bankCode || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Channel
													</div>
													<div className="font-medium text-default-900">
														{account.channel || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Bank ID
													</div>
													<div className="font-medium text-default-900">
														{account.bankID || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Bank Name
													</div>
													<div className="font-medium text-default-900">
														{account.bankName || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Created At
													</div>
													<div className="font-medium text-default-900">
														{account.createdAt
															? new Date(account.createdAt).toLocaleDateString()
															: "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Updated At
													</div>
													<div className="font-medium text-default-900">
														{account.updatedAt
															? new Date(account.updatedAt).toLocaleDateString()
															: "N/A"}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</InfoCard>

						{/* Mandate Information */}
						<InfoCard
							title="Mandate Information"
							icon={<CreditCard className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 gap-4 w-full">
									{customer.CustomerMandate?.map((mandate, index) => (
										<div
											key={index}
											className="bg-default-50 rounded-lg p-4 w-full"
										>
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
												<div>
													<div className="text-sm text-default-500 mb-1">
														Status
													</div>
													<Chip
														color={
															mandate.status === "approved"
																? "success"
																: mandate.status === "initiated"
																? "warning"
																: "danger"
														}
														variant="flat"
														className="font-medium"
													>
														{mandate.status || "PENDING"}
													</Chip>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Mandate Type
													</div>
													<div className="font-medium text-default-900">
														{mandate.mandate_type || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Debit Type
													</div>
													<div className="font-medium text-default-900">
														{mandate.debit_type || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Ready to Debit
													</div>
													<div className="font-medium text-default-900">
														{mandate.ready_to_debit ? "Yes" : "No"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Approved
													</div>
													<div className="font-medium text-default-900">
														{mandate.approved ? "Yes" : "No"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Start Date
													</div>
													<div className="font-medium text-default-900">
														{mandate.start_date
															? new Date(
																	mandate.start_date
															  ).toLocaleDateString()
															: "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														End Date
													</div>
													<div className="font-medium text-default-900">
														{mandate.end_date
															? new Date(mandate.end_date).toLocaleDateString()
															: "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Reference
													</div>
													<div className="font-medium text-default-900">
														{mandate.reference || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Channel
													</div>
													<div className="font-medium text-default-900">
														{mandate.channel || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Created At
													</div>
													<div className="font-medium text-default-900">
														{mandate.createdAt
															? new Date(mandate.createdAt).toLocaleString(
																	"en-GB"
															  )
															: "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Updated At
													</div>
													<div className="font-medium text-default-900">
														{mandate.updatedAt
															? new Date(mandate.updatedAt).toLocaleString(
																	"en-GB"
															  )
															: "N/A"}
													</div>
												</div>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
												<div>
													<div className="text-sm text-default-500 mb-1">
														Mandate ID
													</div>
													<div className="font-medium text-default-900">
														{mandate.mandateId || "N/A"}
													</div>
												</div>
												<div>
													<div className="text-sm text-default-500 mb-1">
														Message
													</div>
													<div className="font-medium text-default-900">
														{mandate.message || "N/A"}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>

								{/* Regenerate Mandate Button */}
								{hasPermission(role, "canUpdateLastPoint", userEmail) && (
									<div className="mt-6 pt-4 border-t border-default-200">
										<Button
											color="warning"
											variant="flat"
											size="sm"
											onClick={onRegenerateMandate}
											startContent={<RefreshCw className="w-4 h-4" />}
											isLoading={isRegeneratingMandate}
										>
											Regenerate Mandate
										</Button>
									</div>
								)}
							</div>
						</InfoCard>

						{/* Store Information */}
						<InfoCard
							title="Store Information"
							icon={<Store className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Store Name
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.storeName || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">Address</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.address || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">City</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.city || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">State</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.state || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">Region</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.region || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Phone Number
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.phoneNumber || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Store Email
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.storeEmail || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Bank Name
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.bankName || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Account Number
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.accountNumber || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Account Name
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.accountName || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Bank Code
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.bankCode || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Store ID
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.storeId || "N/A"}
										</div>
									</div>
									<div className="bg-default-50 rounded-lg p-4">
										<div className="text-sm text-default-500 mb-1">
											Operating Hours
										</div>
										<div className="font-medium text-default-900">
											{customer.LoanRecord?.[0]?.store?.storeOpen} -{" "}
											{customer.LoanRecord?.[0]?.store?.storeClose}
										</div>
									</div>
								</div>
							</div>
						</InfoCard>

						{/* Transaction History */}
						<InfoCard
							title="Transaction History"
							icon={<Clock className="w-5 h-5 text-default-600" />}
							collapsible={true}
							defaultExpanded={true}
						>
							<div className="p-4">
								{/* Transaction Header with Inject Button */}
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-semibold text-default-700"></h3>
									<Button
										color="primary"
										variant="solid"
										size="sm"
										startContent={<Plus className="w-4 h-4" />}
										onPress={handleOpenInjectPaymentModal}
									>
										Inject Transaction
									</Button>
								</div>

								<div className="overflow-x-auto rounded-lg border border-default-200">
									<table className="w-full">
										<thead>
											<tr className="bg-default-50 border-b border-default-200">
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Amount
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Payment Type
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Previous Balance
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													New Balance
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Payment Reference
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													External Reference
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Currency
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Charge
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Charge Narration
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Payment Description
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
													Paid At
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-default-200">
											{customer.TransactionHistory?.map(
												(transaction, index) => (
													<tr
														key={index}
														className="hover:bg-default-50 transition-colors duration-150 ease-in-out"
													>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-default-900">
															{transaction.amount !== undefined &&
															transaction.amount !== null
																? `${
																		transaction.currency
																  } ${transaction.amount.toLocaleString(
																		"en-GB"
																  )}`
																: "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.paymentType || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.prevBalance !== undefined &&
															transaction.prevBalance !== null
																? `${transaction.currency} ${Number(
																		transaction.prevBalance
																  ).toLocaleString("en-GB")}`
																: `${transaction.currency} 0`}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.newBalance !== undefined &&
															transaction.newBalance !== null
																? `${transaction.currency} ${Number(
																		transaction.newBalance
																  ).toLocaleString("en-GB")}`
																: `${transaction.currency} 0`}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.paymentReference || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.extRef || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.currency || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.charge !== undefined &&
															transaction.charge !== null
																? `${
																		transaction.currency
																  } ${transaction.charge.toLocaleString(
																		"en-GB"
																  )}`
																: "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.chargeNarration || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.paymentDescription || "N/A"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
															{transaction.paid_at
																? new Date(transaction.paid_at).toLocaleString(
																		"en-GB"
																  )
																: "N/A"}
														</td>
													</tr>
												)
											)}
											{(!customer.TransactionHistory ||
												customer.TransactionHistory.length === 0) && (
												<tr>
													<td colSpan={11} className="px-6 py-12 text-center">
														<EmptyState
															title="No Transaction History"
															description="There are no transactions to display at this time."
															icon={
																<svg
																	className="w-12 h-12 mb-4 text-default-300"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																	/>
																</svg>
															}
														/>
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</InfoCard>

						{/* Repayment Schedule */}
						{hasPermission(role, "canViewOverDuePayments", userEmail) && (
							<InfoCard
								title="Repayment Schedule"
								icon={<Calendar className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={true}
							>
								{repaymentLoading ? (
									<div className="flex flex-col items-center justify-center py-12 space-y-4">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
										<p className="text-sm text-gray-500">Loading repayment schedule...</p>
									</div>
								) : repaymentError ? (
									<div className="text-center py-12">
										<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
											<XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
											<h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Schedule</h3>
											<p className="text-sm text-red-700 mb-4">{repaymentError}</p>
											<Button 
												color="danger" 
												variant="flat" 
												size="sm"
												onPress={() => {
													if (loanRecordId) {
														setRepaymentError(null);
														// Trigger refetch by updating loanRecordId dependency
													}
												}}
											>
												Try Again
											</Button>
										</div>
									</div>
								) : repaymentSchedule ? (
									<div className="space-y-6">
										{/* Summary Cards */}
										<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
											<div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm font-medium text-blue-600">Total Due</p>
														<p className="text-2xl font-bold text-blue-900">
															{formatCurrency(repaymentSchedule.summary?.totalDue)}
														</p>
													</div>
												</div>
											</div>
											<div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm font-medium text-green-600">Total Paid</p>
														<p className="text-2xl font-bold text-green-900">
															{formatCurrency(repaymentSchedule.summary?.totalPaid)}
														</p>
													</div>
													<CheckCircle className="w-8 h-8 text-green-500" />
												</div>
											</div>
											<div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm font-medium text-orange-600">Remaining</p>
														<p className="text-2xl font-bold text-orange-900">
															{formatCurrency(repaymentSchedule.summary?.remainingBalance)}
														</p>
													</div>
													<TrendingUp className="w-8 h-8 text-orange-500" />
												</div>
											</div>
											<div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm font-medium text-purple-600">Progress</p>
														<p className="text-2xl font-bold text-purple-900">
															{repaymentSchedule.summary?.percentagePaid || "0"}%
														</p>
													</div>
													<CalendarDays className="w-8 h-8 text-purple-500" />
												</div>
											</div>
										</div>

										{/* Progress Bar */}
										<div className="bg-gray-100 rounded-full h-3 overflow-hidden">
											<div 
												className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out"
												style={{ width: `${parseFloat(repaymentSchedule.summary?.percentagePaid || "0")}%` }}
											></div>
										</div>

										{/* Installment Schedule - Creative Views */}
										<div className="space-y-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-3">
													<h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
													<div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
														{viewMode === "timeline" ? "Timeline View" : "Grid View"}
													</div>
												</div>
												<div className="flex items-center space-x-4">
													<div className="text-sm text-gray-500">
														{repaymentSchedule.schedules?.length || 0} installment{(repaymentSchedule.schedules?.length || 0) !== 1 ? 's' : ''}
													</div>
													<div className="flex space-x-2">
														<Chip color="success" variant="flat" size="sm">
															{repaymentSchedule.summary?.completedSchedules || 0} Paid
														</Chip>
														<Chip color="warning" variant="flat" size="sm">
															{repaymentSchedule.summary?.pendingSchedules || 0} Pending
														</Chip>
													</div>
													{/* View Toggle */}
													<div className="flex bg-gray-100 rounded-lg p-1">
														<button
															onClick={() => setViewMode("timeline")}
															className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
																viewMode === "timeline"
																	? "bg-white text-gray-900 shadow-sm"
																	: "text-gray-500 hover:text-gray-700"
															}`}
														>
															Timeline
														</button>
														<button
															onClick={() => setViewMode("grid")}
															className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
																viewMode === "grid"
																	? "bg-white text-gray-900 shadow-sm"
																	: "text-gray-500 hover:text-gray-700"
															}`}
														>
															Grid
														</button>
													</div>
												</div>
											</div>

											{/* Conditional View Rendering */}
											{viewMode === "timeline" ? (
												/* Timeline View */
												<div className="relative">
													{/* Timeline Line */}
													<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
													
													<div className="space-y-4">
														{repaymentSchedule.schedules?.map((schedule: RepaymentScheduleItem, index: number) => (
														<div key={schedule.id} className="relative flex items-start space-x-4">
															{/* Timeline Dot */}
															<div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 ${
																schedule.status === "COMPLETED" 
																	? "bg-green-100 border-green-500" 
																	: schedule.status === "PENDING"
																	? "bg-yellow-100 border-yellow-500"
																	: "bg-orange-100 border-orange-500"
															}`}>
																{getStatusIcon(schedule.status)}
															</div>

															{/* Content Card */}
															<div className={`flex-1 bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
																schedule.status === "COMPLETED" 
																	? "border-green-200 bg-green-50/30" 
																	: schedule.status === "PENDING"
																	? "border-yellow-200 bg-yellow-50/30"
																	: "border-orange-200 bg-orange-50/30"
															}`}>
																<div className="p-4">
																	{/* Header */}
																	<div className="flex items-center justify-between mb-3">
																		<div className="flex items-center space-x-3">
																			<div className="text-2xl font-bold text-gray-700">
																				#{schedule.installmentNumber}
																			</div>
																			<div>
																				<h4 className="text-lg font-semibold text-gray-900">
																					{formatCurrency(schedule.amount)}
																				</h4>
																				<p className="text-sm text-gray-500">
																					Due {formatDate(schedule.dueDate)}
																				</p>
																			</div>
																		</div>
																		<div className="text-right">
																			<Chip
																				color={getStatusColor(schedule.status)}
																				variant="flat"
																				size="sm"
																				className="font-medium"
																			>
																				{schedule.status}
																			</Chip>
																			{schedule.completedAt && (
																				<p className="text-xs text-gray-500 mt-1">
																					Completed {formatDate(schedule.completedAt)}
																				</p>
																			)}
																		</div>
																	</div>

																	{/* Progress Bar - Compact */}
																	<div className="mb-3">
																		<div className="flex justify-between text-xs text-gray-600 mb-1">
																			<span>Progress</span>
																			<span>{formatCurrency(schedule.amountPaid)} / {formatCurrency(schedule.amount)}</span>
																		</div>
																		<div className="bg-gray-200 rounded-full h-1.5">
																			<div 
																				className={`h-1.5 rounded-full transition-all duration-300 ${
																					schedule.status === "COMPLETED" 
																						? "bg-gradient-to-r from-green-400 to-green-600" 
																						: schedule.status === "PENDING"
																						? "bg-gradient-to-r from-yellow-400 to-yellow-600"
																						: "bg-gradient-to-r from-orange-400 to-orange-600"
																				}`}
																				style={{ width: `${calculateProgressPercentage(schedule.amountPaid, schedule.amount)}%` }}
																			></div>
																		</div>
																	</div>

																	{/* Payment Details - Collapsible */}
																	{schedule.repayments && schedule.repayments.length > 0 && (
																		<div className="border-t border-gray-200 pt-3">
																			<details className="group">
																				<summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
																					<span className="flex items-center space-x-2">
																						<CreditCard className="w-4 h-4" />
																						<span>{schedule.repayments.length} Payment{schedule.repayments.length > 1 ? 's' : ''}</span>
																					</span>
																					<ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
																				</summary>
																				<div className="mt-3 space-y-2">
																					{schedule.repayments.map((repayment, repaymentIndex) => (
																						<div key={repayment.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
																							<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
																								<div>
																									<span className="font-medium text-gray-600 block">Amount</span>
																									<p className="text-gray-900 font-semibold">{formatCurrency(repayment.amount)}</p>
																								</div>
																								<div>
																									<span className="font-medium text-gray-600 block">Channel</span>
																									<p className="text-gray-900">{repayment.channel}</p>
																								</div>
																								<div>
																									<span className="font-medium text-gray-600 block">Date</span>
																									<p className="text-gray-900">{formatDate(repayment.createdAt)}</p>
																								</div>
																								<div>
																									<span className="font-medium text-gray-600 block">Reference</span>
																									<p className="text-gray-900 font-mono text-xs break-all">{repayment.paymentReference}</p>
																								</div>
																								{repayment.paymentDescription && (
																	<div className="col-span-2 md:col-span-4">
																		<span className="font-medium text-gray-600 block">Description</span>
																		<p className="text-gray-900 text-xs">{repayment.paymentDescription}</p>
																	</div>
																)}
																							</div>
																						</div>
																					))}
																				</div>
																			</details>
																		</div>
																	)}
																</div>
															</div>
														</div>
														))}
													</div>
												</div>
											) : (
												/* Grid View - Compact Cards */
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
													{repaymentSchedule.schedules?.map((schedule: RepaymentScheduleItem) => (
														<div key={schedule.id} className={`bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-all duration-200 ${
															schedule.status === "COMPLETED" 
																? "border-green-200 bg-green-50/30" 
																: schedule.status === "PENDING"
																? "border-yellow-200 bg-yellow-50/30"
																: "border-orange-200 bg-orange-50/30"
														}`}>
															{/* Header */}
															<div className="flex items-center justify-between mb-3">
																<div className="flex items-center space-x-2">
																	<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
																		schedule.status === "COMPLETED" 
																			? "bg-green-100" 
																			: schedule.status === "PENDING"
																			? "bg-yellow-100"
																			: "bg-orange-100"
																	}`}>
																		{getStatusIcon(schedule.status)}
																	</div>
																	<div>
																		<h4 className="font-semibold text-gray-900">#{schedule.installmentNumber}</h4>
																		<p className="text-xs text-gray-500">{formatDate(schedule.dueDate)}</p>
																	</div>
																</div>
																<Chip
																	color={getStatusColor(schedule.status)}
																	variant="flat"
																	size="sm"
																	className="text-xs"
																>
																	{schedule.status}
																</Chip>
															</div>

															{/* Amount */}
															<div className="mb-3">
																<p className="text-lg font-bold text-gray-900">{formatCurrency(schedule.amount)}</p>
																<p className="text-xs text-gray-500">
																	Paid: {formatCurrency(schedule.amountPaid)}
																</p>
															</div>

															{/* Progress Bar */}
															<div className="mb-3">
																<div className="flex justify-between text-xs text-gray-600 mb-1">
																	<span>Progress</span>
																	<span>{Math.round(calculateProgressPercentage(schedule.amountPaid, schedule.amount))}%</span>
																</div>
																<div className="bg-gray-200 rounded-full h-1.5">
																	<div 
																		className={`h-1.5 rounded-full transition-all duration-300 ${
																			schedule.status === "COMPLETED" 
																				? "bg-gradient-to-r from-green-400 to-green-600" 
																				: schedule.status === "PENDING"
																				? "bg-gradient-to-r from-yellow-400 to-yellow-600"
																				: "bg-gradient-to-r from-orange-400 to-orange-600"
																		}`}
																		style={{ width: `${calculateProgressPercentage(schedule.amountPaid, schedule.amount)}%` }}
																	></div>
																</div>
															</div>

															{/* Payment Details - Collapsible */}
															{schedule.repayments && schedule.repayments.length > 0 && (
																<div className="border-t border-gray-200 pt-3">
																	<details className="group">
																		<summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-gray-700 hover:text-gray-900">
																			<span className="flex items-center space-x-1">
																				<CreditCard className="w-3 h-3" />
																				<span>{schedule.repayments.length} Payment{schedule.repayments.length > 1 ? 's' : ''}</span>
																			</span>
																			<ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
																		</summary>
																		<div className="mt-2 space-y-1">
																			{schedule.repayments.map((repayment) => (
																				<div key={repayment.id} className="bg-gray-50 p-2 rounded text-xs">
																					<div className="grid grid-cols-2 gap-1">
																						<div>
																							<span className="font-medium text-gray-600">Amount:</span>
																							<p className="text-gray-900 font-semibold">{formatCurrency(repayment.amount)}</p>
																						</div>
																						<div>
																							<span className="font-medium text-gray-600">Channel:</span>
																							<p className="text-gray-900">{repayment.channel}</p>
																						</div>
																						<div className="col-span-2">
																							<span className="font-medium text-gray-600">Date:</span>
																							<p className="text-gray-900">{formatDate(repayment.createdAt)}</p>
																						</div>
																						<div className="col-span-2">
																							<span className="font-medium text-gray-600">Ref:</span>
																							<p className="text-gray-900 font-mono text-xs break-all">{repayment.paymentReference}</p>
																						</div>
																					</div>
																				</div>
																			))}
																		</div>
																	</details>
																</div>
															)}

															{schedule.completedAt && (
																<div className="mt-2 text-xs text-gray-500">
																	Completed {formatDate(schedule.completedAt)}
																</div>
															)}
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="text-center py-12">
														<EmptyState
											title="No Repayment Schedule"
											description="No repayment schedule data available for this customer."
															icon={
												<Calendar className="w-12 h-12 mb-4 text-default-300" />
											}
										/>
								</div>
								)}
							</InfoCard>
						)}


						{/* Device Activity Log */}

							<InfoCard
								title="Device Activity Log"
								icon={<Smartphone className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={true}
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
													Action
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
													Performed By
												</th>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
												>
													Date
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-default-200">
											{isLoadingDeviceLogs ? (
												<tr>
													<td colSpan={5} className="px-6 py-12 text-center">
														<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
														<p className="mt-2 text-sm text-default-500">
															Loading device activity logs...
														</p>
													</td>
												</tr>
											) : deviceLocksLogs && deviceLocksLogs.length > 0 ? (
												deviceLocksLogs.map((log: any, index: number) => (
													<tr
														key={log.id || index}
														className="hover:bg-default-50"
													>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
															{index + 1}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
															<Chip
																color={
																	log.action === "LOCKED"
																		? "danger"
																		: log.action === "UNLOCKED"
																		? "success"
																		: log.action === "RELEASED"
																		? "warning"
																		: "default"
																}
																variant="flat"
																size="sm"
															>
																{log.action || "N/A"}
															</Chip>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
															<Chip
																color={
																	log.status === "SUCCESS"
																		? "success"
																		: log.status === "FAILED"
																		? "danger"
																		: "default"
																}
																variant="flat"
																size="sm"
															>
																{log.status || "N/A"}
															</Chip>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-900">
															{log.performed_by || "System"}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-default-500">
															{log.createdAt
																? new Date(log.createdAt).toLocaleString(
																		"en-GB"
																  )
																: "N/A"}
														</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan={5} className="px-6 py-12 text-center">
														<EmptyState
															title="No Device Activity Logs"
															description="There are no activities to display at this time."
															icon={
																<svg
																	className="w-12 h-12 mb-4 text-default-300"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																	/>
																</svg>
															}
														/>
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</InfoCard>

						{hasPermission(role, "canViewCommunicationLog", userEmail) && (
							<SmsHistory customerId={customer?.customerId || ""} />
						)}

						{/* COMMUNICATION LOG */}
						{hasPermission(role, "canViewCommunicationLog", userEmail) && (
							<CommunicationLog />
							// <InfoCard
							//   title="Communication LOG"
							//   icon={<Users className="w-5 h-5 text-default-600" />}
							//   collapsible={true}
							//   defaultExpanded={true}
							// >
							//   <div className="overflow-x-auto">
							//     <table className="min-w-full divide-y divide-default-200">
							//       <thead className="bg-default-50">
							//         <tr>
							//           <th
							//             scope="col"
							//             className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
							//           >
							//             S/N
							//           </th>
							//           <th
							//             scope="col"
							//             className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
							//           >
							//             Message
							//           </th>
							//           <th
							//             scope="col"
							//             className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
							//           >
							//             Time
							//           </th>
							//         </tr>
							//       </thead>
							//       <tbody className="bg-white divide-y divide-default-200">
							//         <tr>
							//           <td colSpan={3} className="px-6 py-12 text-center">
							//             <EmptyState
							//               title="No Communication Logs"
							//               description="There are no messages to display at this time."
							//               icon={
							//                 <svg
							//                   className="w-12 h-12 mb-4 text-default-300"
							//                   fill="none"
							//                   stroke="currentColor"
							//                   viewBox="0 0 24 24"
							//                 >
							//                   <path
							//                     strokeLinecap="round"
							//                     strokeLinejoin="round"
							//                     strokeWidth={2}
							//                     d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
							//                   />
							//                 </svg>
							//               }
							//             />
							//           </td>
							//         </tr>
							//       </tbody>
							//     </table>
							//   </div>

							//   {/* Post Communication Log */}
							//   <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
							//     <div className="p-4">
							//       <FormField
							//         label="Post Communication"
							//         htmlFor="message"
							//         type="text"
							//         id="message"
							//         placeholder="Enter Communication Message"
							//         value={""}
							//         size="sm"
							//       />
							//       <Button
							//         className="mt-4"
							//         size="sm"
							//         color="primary"
							//         variant="solid"
							//       >
							//         Post
							//       </Button>
							//     </div>
							//   </div>
							// </InfoCard>
						)}
					</div>
				</div>
			</div>

			<Modal isOpen={isUpdateWallet} onClose={onUpdateWalletClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Update Wallet Balance</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to update this customer&apos;s wallet
									balance? This action cannot be undone.
								</p>

								<FormField
									label="Amount"
									htmlFor="amount"
									type="number"
									id="amount"
									placeholder="Enter Amount"
									value={amount}
									onChange={(e) => setAmount(e as string)}
									size="sm"
								/>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() =>
										selectedCustomer && handleUpdateWalletBalance()
									}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onUpdateWalletClose();
										setSelectedCustomer(null);
										setAmount("");
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal
				isOpen={isUpdateLastPoint}
				onClose={onUpdateLastPointClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Update Last Point</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to update this customer&apos;s last
									point? This action cannot be undone.
								</p>

								<SelectField
									label="Last Point"
									htmlFor="lastPoint"
									id="lastPoint"
									placeholder="Select Last Point"
									options={[
										{ label: "BVN Credit Check", value: "BVN Credit Check" },
										{
											label: "Loan Eligibility Check",
											value: "Loan Eligibility Check",
										},
										{ label: "Card Tokenization", value: "Card Tokenization" },
										{ label: "KYC Submission", value: "KYC Submission" },
										{ label: "Mandate Creation", value: "Mandate Creation" },
										{
											label: "Loan Data Submission",
											value: "Loan Data Submission",
										},
										{ label: "Down Payment", value: "Down Payment" },
										{
											label: "Virtual Account Creation",
											value: "Virtual Account Creation",
										},
										{ label: "Mandate Approved", value: "Mandate Approved" },
										{
											label: "Device Enrollment Started",
											value: "Device Enrollment Started",
										},
										{
											label: "Device Enrollment Completed",
											value: "Device Enrollment Completed",
										},
									]}
									onChange={(e) => setLastPoint(e as string)}
									size="sm"
								/>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => selectedCustomer && handleUpdateLastPoint()}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onUpdateLastPointClose();
										setSelectedCustomer(null);
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Dynamic Device Action Modal */}
			<Modal isOpen={isDeviceAction} onClose={onDeviceActionClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>{deviceActionData?.label}</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<p className="text-md text-default-500">
										{deviceActionData?.description}
									</p>

									<div className="bg-default-50 rounded-lg p-4 space-y-2">
										<p className="text-sm font-medium text-default-700">
											Customer Details:
										</p>
										<p className="text-sm text-default-600">
											Name: {customer?.firstName} {customer?.lastName}
										</p>
										<p className="text-sm text-default-600">
											Device: {customer?.LoanRecord?.[0]?.deviceName || "N/A"}
										</p>
										<p className="text-sm text-default-600">
											IMEI: {deviceActionData?.imei || "N/A"}
										</p>
									</div>

									<div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
										<p className="text-sm text-warning-700 font-medium">
											⚠️ Warning: This action cannot be undone.
										</p>
									</div>

									{/* Due Date and Time fields for unlock device action */}
									{deviceActionData?.action === "unlock_device" && (
										<div className="space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-default-700 mb-2">
														Due Date
													</label>
													<input
														type="date"
														value={dueDate}
														onChange={(e) => setDueDate(e.target.value)}
														className="w-full px-3 py-2 border border-default-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
														required
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-default-700 mb-2">
														Due Time
													</label>
													<input
														type="time"
														value={dueTime}
														onChange={(e) => setDueTime(e.target.value)}
														className="w-full px-3 py-2 border border-default-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
														required
													/>
												</div>
											</div>
											<div className="bg-info-50 border border-info-200 rounded-lg p-3">
												<p className="text-sm text-info-700">
													📅 Please set the due date and time for when the
													device should be locked again.
												</p>
											</div>
										</div>
									)}
								</div>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => {
										if (
											deviceActionData?.action === "unlock_device" &&
											(!dueDate || !dueTime)
										) {
											showToast({
												type: "error",
												message: "Please select both due date and due time",
												duration: 5000,
											});
											return;
										}

										if (deviceActionData) {
											handleDeviceAction(
												deviceActionData.action,
												deviceActionData.imei
											);
										}
									}}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onDeviceActionClose();
										setSelectedAction("");
										setDeviceActionData(null);
										setDueDate("");
										setDueTime("");
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal
				isOpen={isUpdateLoanStatus}
				onClose={onUpdateLoanStatusClose}
				size="lg"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Update Loan Status</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to update this customer&apos;s loan
									status? This action cannot be undone.
								</p>

								<SelectField
									label="Loan Status"
									htmlFor="loanStatus"
									id="loanStatus"
									placeholder="Select Loan Status"
									options={[
										{ label: "ENROLLED", value: "ENROLLED" },
										{ label: "APPROVED", value: "APPROVED" },
										{ label: "REJECTED", value: "REJECTED" },
										{ label: "FULFILLED", value: "FULFILLED" },
										{ label: "OPEN", value: "OPEN" },
										{ label: "CLOSED", value: "CLOSED" },
										{ label: "OVERDUE", value: "OVERDUE" },
										{ label: "DEFAULTED", value: "DEFAULTED" },
									]}
									onChange={(e) => setSelectedAction(e as string)}
									size="sm"
								/>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => selectedCustomer && handleUpdateLoanStatus()}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onUpdateLoanStatusClose();
										setSelectedCustomer(null);
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal isOpen={isCreateWallet} onClose={onCreateWalletClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Create Wallet</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to create a wallet for this customer?
									This action cannot be undone.
								</p>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => selectedCustomer && handleCreateWallet()}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onCreateWalletClose();
										setSelectedCustomer(null);
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal
				isOpen={isSearch}
				onClose={onSearchClose}
				size="2xl"
				className="m-4 max-w-[800px] max-h-[850px] overflow-y-auto"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Search Customer</ModalHeader>
							<ModalBody>
								<CustomerSearch onClose={onSearchClose} />
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button color="danger" variant="light" onPress={onSearchClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal isOpen={isUpdateImei} onClose={onUpdateImeiClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Update IMEI</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to update this customer&apos;s IMEI?
									This action cannot be undone.
								</p>

								<FormField
									label="IMEI"
									htmlFor="imei"
									id="imei"
									type="text"
									placeholder="Enter new IMEI"
									onChange={handleImeiChange}
									size="sm"
								/>
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() => selectedCustomer && handleUpdateImei()}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onUpdateImeiClose();
										setSelectedCustomer(null);
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal isOpen={isAssignAgent} onClose={onAssignAgentClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Assign Agent</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to assign this customer&apos;s to an
									agent? This action cannot be undone.
								</p>

								<FormField
									label="Agent"
									htmlFor="agent"
									id="agent"
									type="text"
									placeholder="Enter Agent"
									value={agent}
									onChange={handleAgentChange}
									size="sm"
								/>
								{agentError && (
									<p className="text-danger-500 text-sm mt-1">{agentError}</p>
								)}
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() =>
										selectedCustomer && handleAssignCustomerToMbe()
									}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onAssignAgentClose();
										setSelectedCustomer(null);
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<Modal isOpen={isSubmitToRelay} onClose={onSubmitToRelayClose} size="lg">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Submit to Relay</ModalHeader>
							<ModalBody>
								<p className="text-md text-default-500">
									Are you sure you want to submit this customer&apos;s to relay?
									This action cannot be undone.
								</p>

								<FormField
									label="Agent"
									htmlFor="agent"
									id="agent"
									type="text"
									placeholder="Enter Relay"
									value={agent}
									onChange={handleAgentChange}
									size="sm"
								/>
								{agentError && (
									<p className="text-danger-500 text-sm mt-1">{agentError}</p>
								)}
							</ModalBody>
							<ModalFooter className="flex gap-2">
								<Button
									color="success"
									variant="solid"
									onPress={() =>
										selectedCustomer && handleSubmitCustomerToRelay()
									}
									isLoading={isButtonLoading}
								>
									Confirm
								</Button>
								<Button
									color="danger"
									variant="light"
									onPress={() => {
										onSubmitToRelayClose();
										setSelectedCustomer(null);
									}}
								>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Inject Payment History Modal */}
			<InjectPaymentModal
				isOpen={isInjectPayment}
				onClose={onInjectPaymentClose}
				vfdBanks={vfdBanks || []}
				onSubmit={handleInjectPaymentSubmit}
				parseLocalDateTime={parseLocalDateTime}
				customer={customer}
			/>

			{/* Confirmation Modal for Inject Payment */}
			<ConfirmationModal
				isOpen={isConfirmInjectPayment}
				onClose={onConfirmInjectPaymentClose}
				onConfirm={handleConfirmInjectPayment}
				title="Confirm Payment Injection"
				description={`Are you sure you want to inject a ${
					currentPaymentData?.paymentType || "CREDIT"
				} payment of ₦${
					currentPaymentData?.amount
						? parseFloat(currentPaymentData.amount).toLocaleString("en-GB")
						: "0"
				} for ${customer?.firstName} ${
					customer?.lastName
				}? This action cannot be undone.`}
				confirmText="Inject Payment"
				cancelText="Cancel"
				isLoading={isInjectingPayment}
				variant="warning"
			/>

			{/* Confirmation Modal for Regenerate Mandate */}
			<ConfirmationModal
				isOpen={isRegenerateMandate}
				onClose={onRegenerateMandateClose}
				onConfirm={handleRegenerateMandate}
				title="Regenerate Customer Mandate"
				description={`Are you sure you want to regenerate the mandate for ${customer?.firstName} ${customer?.lastName}? This will delete the current mandate and update the customer's last point to "Loan Data Submission". This action cannot be undone.`}
				confirmText="Regenerate Mandate"
				cancelText="Cancel"
				isLoading={isRegeneratingMandate}
				variant="warning"
			/>

			{/* Success Modal for Regenerate Mandate */}
			<ConfirmationModal
				isOpen={isRegenerateMandateSuccess}
				onClose={onRegenerateMandateSuccessClose}
				onConfirm={onRegenerateMandateSuccessClose}
				title="Mandate Regenerated Successfully"
				description={`The mandate for ${customer?.firstName} ${customer?.lastName} has been successfully regenerated. Please inform the agent to restart their enrollment process to see the changes.`}
				confirmText="Got It"
				cancelText=""
				variant="success"
			/>

			{/* Send SMS Modal */}
			<SendSmsModal
				isOpen={isSendSms}
				onClose={onSendSmsClose}
				customer={{
					customerId: customer?.customerId || "",
					firstName: customer?.firstName,
					lastName: customer?.lastName,
				}}
			/>
		</div>
	);
}
