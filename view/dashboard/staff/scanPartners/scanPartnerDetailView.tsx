"use client";
import {
	capitalize,
	getScanPartnerByUserId,
	getUserRole,
	showToast,
	suspendUser as suspendScanPartner,
	useAuth,
	getAgentLoansAndCommissions, // Add this import
	getVfdBanks,
	getPaystackBanks,
	verifyBankAccount,
	addUserBankDetails,
	getMobiflexScanPartnerStatsById, // Add this import
	getCommissionAnalytics, // Add this import
} from "@/lib";
import { hasPermission } from "@/lib/permissions";
import {
	LoadingSpinner,
	NotFound,
	InfoCard,
	InfoField,
	EmptyState,
	ConfirmationModal,
	FormModal,
	ImagePreviewModal,
	BankDetailsModal,
} from "@/components/reususables/custom-ui";
import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Divider,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Image,
	useDisclosure,
	Input,
	Select,
	SelectItem,
	Tabs,
	Tab,
} from "@heroui/react";
import {
	ArrowLeft,
	Calendar,
	ExternalLink,
	Hash,
	MoreVertical,
	Phone,
	Trash2,
	User,
	UserCheck,
	Users,
	DollarSign,
	CreditCard,
	Eye,
	UserIcon,
	Smartphone,
	Plus,
	Edit,
	Building2,
	TrendingUp,
	FileText,
	CheckCircle,
	Clock,
	XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { statusColorMap } from "./constants";
import type { ScanPartnerRecord, UserAccountDetails } from "./types";
import {
	ButtonGroup,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	type SortDescriptor,
} from "@heroui/react";
import { Grid3X3, List } from "lucide-react";
import GenericTable, {
	type ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import AutoCompleteField from "@/components/reususables/form/AutoCompleteField";

// Agent interface for the Mbe array
interface AgentRecord {
	mbeId: string;
	firstname: string;
	lastname: string;
	email: string;
	phone: string;
	accountStatus: string;
	role: string;
	isActive: boolean;
	createdAt: string;
	imageUrl?: string;
	bvn: string;
	dob: string;
	channel: string;
}

// Bank details interfaces
interface BankDetails {
	mbeAccountDetailsId?: string;
	mbeId?: string;
	accountName: string;
	accountNumber: string;
	bankName: string;
	bankCode: string;
	channel: string;
	createdAt?: string;
	updatedAt?: string;
	recipientCode?: string;
	vfdBankCode: string;
	vfdBankName: string;
	bankID?: number;
}

interface VfdBank {
	id: number;
	code: string;
	name: string;
	logo: string;
	created: string;
}

interface PaystackBank {
	id: number;
	name: string;
	slug: string;
	code: string;
	longcode: string;
	gateway: string;
	pay_with_bank: boolean;
	supports_transfer: boolean;
	available_for_direct_debit: boolean;
	active: boolean;
	country: string;
	currency: string;
	type: string;
	is_deleted: boolean;
	createdAt: string;
	updatedAt: string;
}

interface BankVerificationResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: {
		account_number: string;
		account_name: string;
		bank_id: number;
	};
	responseTime: string;
	channel: string;
}

// Loan record interface
interface LoanRecord {
	loanRecordId: string;
	customerId: string;
	loanDiskId: string | null;
	lastPoint: string;
	channel: string;
	loanStatus: string;
	createdAt: string;
	updatedAt: string;
	loanAmount: number;
	deviceId: string | null;
	downPayment: number;
	insurancePackage: string | null;
	insurancePrice: number;
	mbsEligibleAmount: number;
	payFrequency: string | null;
	storeId: string | null;
	devicePrice: number;
	deviceAmount: number;
	monthlyRepayment: number;
	duration: number | null;
	interestAmount: number;
	deviceName: string | null;
	mbeId: string;
	solarPackageId: string | null;
	agentName?: string; // We'll add this for display
}

// Commission record interface
interface CommissionRecord {
	commissionId: string;
	mbeId: string;
	deviceOnLoanId: string;
	commission: number;
	mbeCommission: number;
	partnerCommission: number;
	splitPercent: number;
	date_created: string;
	updated_at: string;
	agentName?: string; // We'll add this for display
}

// Column definitions for loans table
const loanColumns: ColumnDef[] = [
	{ name: "Loan ID", uid: "loanRecordId", sortable: true },
	{ name: "Agent", uid: "agentName", sortable: true },
	{ name: "Customer ID", uid: "customerId", sortable: true },
	{ name: "Device Name", uid: "deviceName", sortable: true },
	{ name: "Loan Amount", uid: "loanAmount", sortable: true },
	{ name: "Device Price", uid: "devicePrice", sortable: true },
	{ name: "Down Payment", uid: "downPayment", sortable: true },
	{ name: "Monthly Payment", uid: "monthlyRepayment", sortable: true },
	{ name: "Duration", uid: "duration", sortable: true },
	{ name: "Status", uid: "loanStatus", sortable: true },
	{ name: "Created", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Column definitions for commissions table
const commissionColumns: ColumnDef[] = [
	{ name: "Commission ID", uid: "commissionId", sortable: true },
	{ name: "Agent", uid: "agentName", sortable: true },
	{ name: "Device Loan ID", uid: "deviceOnLoanId", sortable: true },
	{ name: "Total Commission", uid: "commission", sortable: true },
	{ name: "Agent Commission", uid: "mbeCommission", sortable: true },
	{ name: "Partner Commission", uid: "partnerCommission", sortable: true },
	{ name: "Split %", uid: "splitPercent", sortable: true },
	{ name: "Date Created", uid: "date_created", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Export columns for loans (all data)
const loanExportColumns: ColumnDef[] = [
	...loanColumns.filter((col) => col.uid !== "actions"),
	{ name: "Last Point", uid: "lastPoint" },
	{ name: "Channel", uid: "channel" },
	{ name: "Loan Disk ID", uid: "loanDiskId" },
	{ name: "Device ID", uid: "deviceId" },
	{ name: "Insurance Package", uid: "insurancePackage" },
	{ name: "Insurance Price", uid: "insurancePrice" },
	{ name: "MBS Eligible Amount", uid: "mbsEligibleAmount" },
	{ name: "Pay Frequency", uid: "payFrequency" },
	{ name: "Store ID", uid: "storeId" },
	{ name: "Device Amount", uid: "deviceAmount" },
	{ name: "Interest Amount", uid: "interestAmount" },
	{ name: "Solar Package ID", uid: "solarPackageId" },
	{ name: "Updated", uid: "updatedAt" },
];

// Export columns for commissions (all data)
const commissionExportColumns: ColumnDef[] = [
	...commissionColumns.filter((col) => col.uid !== "actions"),
	{ name: "Updated", uid: "updated_at" },
];

// Loan status color mapping
const loanStatusColorMap: Record<string, any> = {
	ACTIVE: "success",
	PENDING: "warning",
	COMPLETED: "primary",
	DEFAULTED: "danger",
	CANCELLED: "default",
	ENROLLED: "warning",
	APPROVED: "success",
	REJECTED: "danger",
};

// Add these status options for loans
const loanStatusOptions = [
	{ name: "Active", uid: "ACTIVE" },
	{ name: "Pending", uid: "PENDING" },
	{ name: "Completed", uid: "COMPLETED" },
	{ name: "Defaulted", uid: "DEFAULTED" },
	{ name: "Cancelled", uid: "CANCELLED" },
	{ name: "Enrolled", uid: "ENROLLED" },
	{ name: "Approved", uid: "APPROVED" },
	{ name: "Rejected", uid: "REJECTED" },
];

// Add agent filter options (will be populated dynamically)
const getAgentFilterOptions = (agents: AgentRecord[]) => {
	return agents.map((agent) => ({
		name: `${agent.firstname} ${agent.lastname}`,
		uid: agent.mbeId,
	}));
};

// Use imported reusable components from components/reususables/custom-ui

const AgentCard = ({ agent, role }: { agent: AgentRecord; role: string }) => {
	const router = useRouter();
	const getStatusColor = (status: string) => {
		return statusColorMap[status] || "default";
	};

	const handleCardClick = (e: React.MouseEvent) => {
		// Prevent card click when clicking on buttons or dropdown
		if ((e.target as HTMLElement).closest('button, [role="button"]')) {
			return;
		}
		router.push(`/access/${role}/staff/agents/${agent.mbeId}`);
	};

	return (
		<Card className="hover:shadow-md transition-shadow cursor-pointer">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center gap-3">
						<Avatar
							src={agent.imageUrl || "/placeholder.svg"}
							alt={`${agent.firstname} ${agent.lastname}`}
							className="w-10 h-10"
							color={getStatusColor(agent.accountStatus)}
						/>
						<div>
							<h4 className="font-semibold text-default-900 capitalize">
								{agent.firstname} {agent.lastname}
							</h4>
							<p className="text-sm text-default-500">{agent.email}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Chip
							color={getStatusColor(agent.accountStatus)}
							variant="flat"
							size="sm"
						>
							{capitalize(agent.accountStatus)}
						</Chip>
						<Dropdown>
							<DropdownTrigger>
								<div
									className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-default-100 hover:bg-default-200 cursor-pointer transition-colors"
									role="button"
									tabIndex={0}
								>
									<MoreVertical className="w-4 h-4" />
								</div>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem
									key="view"
									startContent={<ExternalLink className="w-4 h-4" />}
									onPress={() =>
										router.push(`/access/${role}/staff/agents/${agent.mbeId}`)
									}
								>
									View Details
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>
			</CardHeader>
			<CardBody className="pt-0">
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="flex items-center gap-2">
						<Hash className="w-4 h-4 text-default-400" />
						<span className="text-default-600">ID:</span>
						<span className="font-mono text-xs">{agent.mbeId}</span>
					</div>
					<div className="flex items-center gap-2">
						<Phone className="w-4 h-4 text-default-400" />
						<span className="text-default-600">{agent.phone}</span>
					</div>
					<div className="flex items-center gap-2">
						<UserCheck className="w-4 h-4 text-default-400" />
						<span className="text-default-600">Role:</span>
						<span className="capitalize">{agent?.role?.toLowerCase()}</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="w-4 h-4 text-default-400" />
						<span className="text-default-600">Joined:</span>
						<span>{new Date(agent.createdAt).toLocaleDateString()}</span>
					</div>
				</div>
				<div className="mt-3 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${
								agent.isActive ? "bg-success" : "bg-danger"
							}`}
						></div>
						<span className="text-sm text-default-600">
							{agent.isActive ? "Active" : "Inactive"}
						</span>
					</div>
					<Button
						size="sm"
						variant="flat"
						color="primary"
						startContent={<ExternalLink className="w-4 h-4" />}
						onPress={() =>
							router.push(`/access/${role}/staff/agents/${agent.mbeId}`)
						}
					>
						View Details
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

const AgentTable = ({
	agents,
	role,
}: {
	agents: AgentRecord[];
	role: string;
}) => {
	const router = useRouter();
	const getStatusColor = (status: string) => {
		return statusColorMap[status] || "default";
	};

	const renderCell = (agent: AgentRecord, columnKey: string) => {
		switch (columnKey) {
			case "name":
				return (
					<div className="flex items-center gap-3">
						<Avatar
							src={agent.imageUrl || "/placeholder.svg"}
							alt={`${agent.firstname} ${agent.lastname}`}
							className="w-8 h-8"
							color={getStatusColor(agent.accountStatus)}
						/>
						<div>
							<p className="font-semibold text-default-900 capitalize">
								{agent.firstname} {agent.lastname}
							</p>
							<p className="text-sm text-default-500">{agent.email}</p>
						</div>
					</div>
				);
			case "mbeId":
				return (
					<div className="font-mono text-xs text-default-600">
						{agent.mbeId}
					</div>
				);
			case "phone":
				return <div className="text-sm text-default-600">{agent.phone}</div>;
			case "role":
				return (
					<div className="text-sm capitalize text-default-600">
						{agent?.role?.toLowerCase()}
					</div>
				);
			case "accountStatus":
				return (
					<Chip
						color={getStatusColor(agent.accountStatus)}
						variant="flat"
						size="sm"
					>
						{capitalize(agent.accountStatus)}
					</Chip>
				);
			case "isActive":
				return (
					<Chip
						color={agent.isActive ? "success" : "danger"}
						variant="flat"
						size="sm"
					>
						{agent.isActive ? "Active" : "Inactive"}
					</Chip>
				);
			case "createdAt":
				return (
					<div className="text-sm text-default-600">
						{new Date(agent.createdAt).toLocaleDateString()}
					</div>
				);
			case "actions":
				return (
					role != "scan-partner" && (
						<div className="flex justify-end">
							<Dropdown>
								<DropdownTrigger>
									<Button isIconOnly size="sm" variant="light">
										<MoreVertical className="w-4 h-4 text-default-400" />
									</Button>
								</DropdownTrigger>
								<DropdownMenu>
									<DropdownItem
										key="view"
										startContent={<ExternalLink className="w-4 h-4" />}
										onPress={() =>
											router.push(`/access/${role}/staff/agents/${agent.mbeId}`)
										}
									>
										View Details
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</div>
					)
				);
			default:
				return null;
		}
	};

	return (
		<Table
			aria-label="Agents table"
			className="min-w-full"
			removeWrapper
			classNames={{
				th: "bg-default-100 text-default-700 font-semibold",
				td: "py-3",
			}}
		>
			<TableHeader>
				<TableColumn key="name">Name</TableColumn>
				<TableColumn key="mbeId">Agent ID</TableColumn>
				<TableColumn key="phone">Phone</TableColumn>
				<TableColumn key="role">Role</TableColumn>
				<TableColumn key="accountStatus">Status</TableColumn>
				<TableColumn key="isActive">Active</TableColumn>
				<TableColumn key="createdAt">Joined</TableColumn>
				<TableColumn key="actions">Actions</TableColumn>
			</TableHeader>
			<TableBody>
				{agents.map((agent) => (
					<TableRow
						key={agent.mbeId}
						className="hover:bg-default-50 cursor-pointer"
						onClick={() =>
							router.push(`/access/${role}/staff/agents/${agent.mbeId}`)
						}
					>
						<TableCell>{renderCell(agent, "name")}</TableCell>
						<TableCell>{renderCell(agent, "mbeId")}</TableCell>
						<TableCell>{renderCell(agent, "phone")}</TableCell>
						<TableCell>{renderCell(agent, "role")}</TableCell>
						<TableCell>{renderCell(agent, "accountStatus")}</TableCell>
						<TableCell>{renderCell(agent, "isActive")}</TableCell>
						<TableCell>{renderCell(agent, "createdAt")}</TableCell>
						<TableCell onClick={(e) => e.stopPropagation()}>
							{renderCell(agent, "actions")}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

const StatusChip = ({ status }: { status?: string }) => {
	return (
		<Chip
			color={statusColorMap[status || ""]}
			variant="flat"
			className="font-medium"
		>
			{status || "PENDING"}
		</Chip>
	);
};

// Suspend scan partner function
const mockSuspendScanPartner = async (userId: string) => {
	await suspendScanPartner({ adminId: userId, status: "SUSPENDED" });
	console.log(`Suspending scan partner ${userId}`);
	return { success: true, message: "Scan partner suspended successfully" };
};

// Fetcher function for useSWR
const fetchScanPartner = async (userId: string) => {
	if (!userId) {
		throw new Error("User ID is required");
	}
	const response = await getScanPartnerByUserId(userId);
	const scanPartnerData: ScanPartnerRecord = response?.data?.[0];
	if (!scanPartnerData) {
		throw new Error("Scan partner not found");
	}
	return scanPartnerData;
};

// Fetcher function for agent loans and commissions
const fetchAgentLoanAndCommission = async (userId: string) => {
	if (!userId) {
		throw new Error("User ID is required");
	}
	const response = await getAgentLoansAndCommissions(userId);
	return response?.data;
};

// Bank API functions
const fetchVfdBanks = async (): Promise<VfdBank[]> => {
	try {
		const response = await getVfdBanks();
		return response?.data?.data?.bank || [];
	} catch (error) {
		console.error("Error fetching VFD banks:", error);
		return [];
	}
};

const fetchPaystackBanks = async (): Promise<PaystackBank[]> => {
	try {
		const response = await getPaystackBanks();
		return response?.data?.data || [];
	} catch (error) {
		console.error("Error fetching Paystack banks:", error);
		return [];
	}
};

const verifyBankDetails = async (
	accountNumber: string,
	bankCode: string
): Promise<BankVerificationResponse> => {
	try {
		const response = await verifyBankAccount({
			accountNumber,
			bankCode, // Paystack bank code
		});

		return response as BankVerificationResponse;
	} catch (error) {
		console.error("Error verifying bank details:", error);
		throw error;
	}
};

const addAccountDetails = async (
	userId: string,
	bankDetails: BankDetails
): Promise<any> => {
	try {
		const response = await addUserBankDetails(userId, {
			accountName: bankDetails.accountName,
			accountNumber: bankDetails.accountNumber,
			vfdBankName: bankDetails.vfdBankName,
			vfdBankCode: bankDetails.vfdBankCode,
			channel: "Mobiflex",
			bankID: bankDetails.bankID || 0,
			bankCode: bankDetails.bankCode,
			bankName: bankDetails.bankName,
		});

		return response;
	} catch (error) {
		console.error("Error adding account details:", error);
		throw error;
	}
};

// Reusable Performance Card Component
interface PerformanceCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	gradient: string;
	textColor: string;
	iconColor: string;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({
	title,
	value,
	icon,
	gradient,
	textColor,
	iconColor,
}) => {
	return (
		<Card className={`bg-gradient-to-r ${gradient} border-opacity-20`}>
			<CardBody className="flex flex-row items-center justify-between p-4">
				<div>
					<p className={`text-sm ${textColor} font-medium`}>{title}</p>
					<p
						className={`text-2xl font-bold ${textColor.replace("600", "800")}`}
					>
						{value}
					</p>
				</div>
				<div className={iconColor}>{icon}</div>
			</CardBody>
		</Card>
	);
};

// Main Component
export default function ScanPartnerSinglePage() {
	const params = useParams();
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const [viewType, setViewType] = useState<"cards" | "table">("table");
	const [dataViewType, setDataViewType] = useState<
		"agents" | "loans" | "commissions" | "analytics"
	>("agents");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		isOpen: isSuspendOpen,
		onOpen: onSuspendOpen,
		onClose: onSuspendClose,
	} = useDisclosure();

	// Bank details modal state
	const {
		isOpen: isBankModalOpen,
		onOpen: onBankModalOpen,
		onClose: onBankModalClose,
	} = useDisclosure();

	// Bank details form state
	const [bankFormData, setBankFormData] = useState<BankDetails>({
		accountName: "",
		accountNumber: "",
		bankName: "",
		bankCode: "",
		vfdBankName: "",
		vfdBankCode: "",
		channel: "Mobiflex",
		bankID: 0,
	});

	const [isVerifyingBank, setIsVerifyingBank] = useState(false);
	const [isSavingBank, setIsSavingBank] = useState(false);
	const [isAccountVerified, setIsAccountVerified] = useState(false);
	const [selectedVfdBank, setSelectedVfdBank] = useState<VfdBank | null>(null);
	const [selectedPaystackBank, setSelectedPaystackBank] =
		useState<PaystackBank | null>(null);

	// Add these state variables after the existing ones
	const [loanFilterValue, setLoanFilterValue] = useState("");
	const [loanStatusFilter, setLoanStatusFilter] = useState<Set<string>>(
		new Set()
	);
	const [loanAgentFilter, setLoanAgentFilter] = useState<Set<string>>(
		new Set()
	);
	const [loanSortDescriptor, setLoanSortDescriptor] = useState<SortDescriptor>({
		column: "createdAt",
		direction: "descending",
	});
	const [loanPage, setLoanPage] = useState(1);

	const [commissionFilterValue, setCommissionFilterValue] = useState("");
	const [commissionAgentFilter, setCommissionAgentFilter] = useState<
		Set<string>
	>(new Set());
	const [commissionSortDescriptor, setCommissionSortDescriptor] =
		useState<SortDescriptor>({
			column: "date_created",
			direction: "descending",
		});
	const [commissionPage, setCommissionPage] = useState(1);

	// Get the role from the URL path
	// Use SWR for data fetching
	const { userResponse } = useAuth();
	const role = getUserRole(String(userResponse?.data?.role));
	const isScanPartner = userResponse?.data?.role == "SCAN_PARTNER";
	const userId = userResponse?.data?.userId;
	const canSuspendUser = hasPermission(role, "suspendDashboardUser");

	const {
		data: scanPartner,
		error,
		isLoading,
		mutate,
	} = useSWR(
		"scan-partner-record",
		() =>
			fetchScanPartner(
				isScanPartner ? (userId as string) : (params.id as string)
			),
		{
			onError: (error) => {
				console.error("Error fetching scan partner:", error);
				showToast({
					type: "error",
					message: error.message || "Failed to fetch scan partner data",
					duration: 5000,
				});
			},
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 30000,
		}
	);

	// Fetch agent loans and commissions data
	const {
		data: agentLoanCommissionData,
		error: loanCommissionError,
		isLoading: isLoadingLoanCommission,
	} = useSWR(
		scanPartner ? ["agent-loan-commission", scanPartner.userId] : null,
		() => fetchAgentLoanAndCommission(scanPartner!.userId),
		{
			onError: (error) => {
				console.error("Error fetching agent loan and commission data:", error);
			},
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 30000,
		}
	);

	// Sales Analytics State
	const [salesPeriod, setSalesPeriod] = useState<
		"" | "daily" | "weekly" | "monthly" | "yearly" | "mtd"
	>("");

	// Commission Analytics State
	const [commissionPeriod, setCommissionPeriod] = useState<
		"daily" | "weekly" | "monthly" | "yearly"
	>("monthly");

	const partnerId = isScanPartner ? userId : params.id;

	// Sales Analytics Data - pass period as empty string for "all time"
	const { data: salesStats, isLoading: salesStatsLoading } = useSWR<any>(
		partnerId ? `/mobiflex-stats/${partnerId}/${salesPeriod}` : null,
		() =>
			getMobiflexScanPartnerStatsById(
				partnerId as string,
				salesPeriod === "" ? undefined : salesPeriod,
				undefined,
				undefined
			).then((r) => r.data),
		{ refreshInterval: 30000 }
	);

	// Commission Analytics Data
	const { data: commissionAnalytics, isLoading: commissionAnalyticsLoading } =
		useSWR<any>(
			partnerId
				? `/commission-analytics/${partnerId}/${commissionPeriod}`
				: null,
			() =>
				getCommissionAnalytics(partnerId as string, commissionPeriod).then(
					(r) => r.data
				),
			{ refreshInterval: 30000 }
		);

	// Fetch VFD banks
	const { data: vfdBanks = [] } = useSWR("vfd-banks", fetchVfdBanks, {
		revalidateOnFocus: false,
		dedupingInterval: 3600000, // 1 hour
	});

	// Fetch Paystack banks
	const { data: paystackBanks = [] } = useSWR(
		"paystack-banks",
		fetchPaystackBanks,
		{
			revalidateOnFocus: false,
			dedupingInterval: 3600000, // 1 hour
		}
	);

	// Extract the latest user bank details from UserAccountDetails array
	const userBankDetails = useMemo(() => {
		if (
			!scanPartner?.UserAccountDetails ||
			scanPartner.UserAccountDetails.length === 0
		) {
			return null;
		}

		// Get the latest bank details (most recent updatedAt)
		const latestBankDetails = scanPartner.UserAccountDetails.reduce(
			(latest, current) => {
				return new Date(current.updatedAt) > new Date(latest.updatedAt)
					? current
					: latest;
			}
		);

		// Convert UserAccountDetails to BankDetails format
		return {
			accountName: latestBankDetails.accountName,
			accountNumber: latestBankDetails.accountNumber,
			bankName: latestBankDetails.bankName,
			bankCode: latestBankDetails.bankCode,
			vfdBankName: latestBankDetails.vfdBankName,
			vfdBankCode: latestBankDetails.vfdBankCode,
			channel: latestBankDetails.channel,
			bankID: latestBankDetails.bankID,
			createdAt: latestBankDetails.createdAt,
			updatedAt: latestBankDetails.updatedAt,
		} as BankDetails;
	}, [scanPartner?.UserAccountDetails]);

	// Function to refresh bank details after adding new ones
	const mutateBankDetails = () => {
		// Refetch the scan partner data to get updated UserAccountDetails
		mutate();
	};

	const handleSuspendScanPartner = async () => {
		if (!scanPartner) return;
		setIsDeleting(true);
		try {
			const result = await mockSuspendScanPartner(scanPartner.userId);
			if (result.success) {
				showToast({
					type: "success",
					message: result.message,
					duration: 3000,
				});
				router.back();
			}
		} catch (error: any) {
			console.error("Error deleting scan partner:", error);
			showToast({
				type: "error",
				message:
					error?.statusType == "UNAUTHORIZED"
						? "Failed to suspend scan partner"
						: error?.message,
				duration: 5000,
			});
		} finally {
			setIsDeleting(false);
			onSuspendClose();
		}
	};

	// Bank details management functions
	const handleOpenBankModal = () => {
		if (userBankDetails) {
			// Edit mode - populate form with existing data
			setBankFormData({
				accountName: userBankDetails.accountName,
				accountNumber: userBankDetails.accountNumber,
				bankName: userBankDetails.bankName,
				bankCode: userBankDetails.bankCode,
				vfdBankName: userBankDetails.vfdBankName,
				vfdBankCode: userBankDetails.vfdBankCode,
				channel: userBankDetails.channel || "Mobiflex",
				bankID: userBankDetails.bankID || 0,
			});
			setIsAccountVerified(true);
		} else {
			// Add mode - reset form
			setBankFormData({
				accountName: "",
				accountNumber: "",
				bankName: "",
				bankCode: "",
				vfdBankName: "",
				vfdBankCode: "",
				channel: "Mobiflex",
				bankID: 0,
			});
			setIsAccountVerified(false);
		}
		setSelectedVfdBank(null);
		setSelectedPaystackBank(null);
		onBankModalOpen();
	};

	const handleVfdBankSelect = (bankCode: string) => {
		const bank = vfdBanks.find((b) => b.code === bankCode);
		if (bank) {
			setSelectedVfdBank(bank);
			setBankFormData((prev) => ({
				...prev,
				vfdBankName: bank.name,
				vfdBankCode: bank.code,
			}));
		}
	};

	const handlePaystackBankSelect = (bankCode: string) => {
		const bank = paystackBanks.find((b) => b.code === bankCode);
		if (bank) {
			setSelectedPaystackBank(bank);
			setBankFormData((prev) => ({
				...prev,
				bankName: bank.name,
				bankCode: bank.code,
				bankID: bank.id,
			}));
		}
	};

	const handleVerifyBankDetails = async () => {
		if (!bankFormData.accountNumber || !bankFormData.bankCode) {
			showToast({
				type: "error",
				message: "Please select a bank and enter account number",
				duration: 3000,
			});
			return;
		}

		setIsVerifyingBank(true);
		try {
			const response = await verifyBankDetails(
				bankFormData.accountNumber,
				bankFormData.bankCode // This is the Paystack bank code
			);

			if (response.statusCode === 200) {
				setBankFormData((prev) => ({
					...prev,
					accountName: response.data.account_name,
					bankID: response.data.bank_id,
				}));
				setIsAccountVerified(true);
				showToast({
					type: "success",
					message: "Bank details verified successfully",
					duration: 3000,
				});
			}
		} catch (error: any) {
			console.error("Bank verification error:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to verify bank details",
				duration: 5000,
			});
		} finally {
			setIsVerifyingBank(false);
		}
	};

	const handleSaveBankDetails = async () => {
		if (!scanPartner || !isAccountVerified) {
			showToast({
				type: "error",
				message: "Please verify bank details first",
				duration: 3000,
			});
			return;
		}

		setIsSavingBank(true);
		try {
			await addAccountDetails(scanPartner.userId, bankFormData);

			showToast({
				type: "success",
				message: "Bank details saved successfully",
				duration: 3000,
			});

			// Refresh bank details
			mutateBankDetails();
			onBankModalClose();
		} catch (error: any) {
			console.error("Save bank details error:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to save bank details",
				duration: 5000,
			});
		} finally {
			setIsSavingBank(false);
		}
	};

	// Process loan and commission data
	const processedData = React.useMemo(() => {
		if (!agentLoanCommissionData?.agents) {
			return { loans: [], commissions: [], agentMap: new Map() };
		}

		const agentMap = new Map();
		const allLoans: LoanRecord[] = [];
		const allCommissions: CommissionRecord[] = [];

		agentLoanCommissionData.agents.forEach((agent: any) => {
			const agentName = `${agent.firstname} ${agent.lastname}`;
			agentMap.set(agent.mbeId, agentName);

			// Process loans
			agent.LoanRecord?.forEach((loan: any) => {
				allLoans.push({
					...loan,
					agentName,
				});
			});

			// Process commissions
			agent.Commission?.forEach((commission: any) => {
				allCommissions.push({
					...commission,
					agentName,
				});
			});
		});

		return {
			loans: allLoans,
			commissions: allCommissions,
			agentMap,
			overallSummary: agentLoanCommissionData?.overallSummary,
		};
	}, [agentLoanCommissionData]);

	// Add these filtering functions after the processedData useMemo
	const filteredLoans = useMemo(() => {
		let filtered = [...processedData.loans];

		// Text filter
		if (loanFilterValue) {
			const searchTerm = loanFilterValue.toLowerCase();
			filtered = filtered.filter(
				(loan) =>
					loan.loanRecordId.toLowerCase().includes(searchTerm) ||
					loan.customerId.toLowerCase().includes(searchTerm) ||
					loan.deviceName?.toLowerCase().includes(searchTerm) ||
					loan.agentName?.toLowerCase().includes(searchTerm)
			);
		}

		// Status filter
		if (loanStatusFilter.size > 0) {
			filtered = filtered.filter((loan) =>
				loanStatusFilter.has(loan.loanStatus)
			);
		}

		// Agent filter
		if (loanAgentFilter.size > 0) {
			filtered = filtered.filter((loan) => loanAgentFilter.has(loan.mbeId));
		}

		return filtered;
	}, [processedData.loans, loanFilterValue, loanStatusFilter, loanAgentFilter]);

	const filteredCommissions = useMemo(() => {
		let filtered = [...processedData.commissions];

		// Text filter
		if (commissionFilterValue) {
			const searchTerm = commissionFilterValue.toLowerCase();
			filtered = filtered.filter(
				(commission) =>
					commission.commissionId.toLowerCase().includes(searchTerm) ||
					commission.deviceOnLoanId.toLowerCase().includes(searchTerm) ||
					commission.agentName?.toLowerCase().includes(searchTerm)
			);
		}

		// Agent filter
		if (commissionAgentFilter.size > 0) {
			filtered = filtered.filter((commission) =>
				commissionAgentFilter.has(commission.mbeId)
			);
		}

		return filtered;
	}, [processedData.commissions, commissionFilterValue, commissionAgentFilter]);

	// Export functions
	const exportLoans = async (data: LoanRecord[]) => {
		if (isScanPartner) {
			showToast({
				type: "error",
				message: "Scan partners cannot export loan data",
				duration: 3000,
			});
			return;
		}
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Agent Loans");

		ws.columns = loanExportColumns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));

		data.forEach((loan) =>
			ws.addRow({
				...loan,
				loanAmount: `₦${loan.loanAmount?.toLocaleString("en-GB") || 0}`,
				devicePrice: `₦${loan.devicePrice?.toLocaleString("en-GB") || 0}`,
				downPayment: `₦${loan.downPayment?.toLocaleString("en-GB") || 0}`,
				monthlyRepayment: `₦${
					loan.monthlyRepayment?.toLocaleString("en-GB") || 0
				}`,
				interestAmount: `₦${loan.interestAmount?.toLocaleString("en-GB") || 0}`,
				insurancePrice: `₦${loan.insurancePrice?.toLocaleString("en-GB") || 0}`,
				mbsEligibleAmount: `₦${
					loan.mbsEligibleAmount?.toLocaleString("en-GB") || 0
				}`,
				deviceAmount: `₦${loan.deviceAmount?.toLocaleString("en-GB") || 0}`,
				createdAt: new Date(loan.createdAt).toLocaleDateString(),
				updatedAt: new Date(loan.updatedAt).toLocaleDateString(),
				loanStatus: capitalize(loan.loanStatus || ""),
			})
		);

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Agent_Loans.xlsx");
	};

	const exportCommissions = async (data: CommissionRecord[]) => {
		if (isScanPartner) {
			showToast({
				type: "error",
				message: "Scan partners cannot export loan data",
				duration: 3000,
			});
			return;
		}
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Agent Commissions");

		ws.columns = commissionExportColumns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));

		data.forEach((commission) =>
			ws.addRow({
				...commission,
				commission: `₦${commission.commission?.toLocaleString("en-GB") || 0}`,
				mbeCommission: `₦${
					commission.mbeCommission?.toLocaleString("en-GB") || 0
				}`,
				partnerCommission: `₦${
					commission.partnerCommission?.toLocaleString("en-GB") || 0
				}`,
				splitPercent: `${commission.splitPercent || 0}%`,
				date_created: new Date(commission.date_created).toLocaleDateString(),
				updated_at: new Date(commission.updated_at).toLocaleDateString(),
			})
		);

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Agent_Commissions.xlsx");
	};

	// Render cell functions
	const renderLoanCell = (loan: LoanRecord, key: string) => {
		switch (key) {
			case "loanRecordId":
				return <div className="font-mono text-xs">{loan.loanRecordId}</div>;
			case "agentName":
				return <div className="font-medium">{loan.agentName}</div>;
			case "customerId":
				return <div className="font-mono text-xs">{loan.customerId}</div>;
			case "deviceName":
				return <div className="text-sm">{loan.deviceName || "N/A"}</div>;
			case "loanAmount":
				return (
					<div className="font-medium">
						₦{loan.loanAmount?.toLocaleString("en-GB") || 0}
					</div>
				);
			case "devicePrice":
				return (
					<div className="font-medium">
						₦{loan.devicePrice?.toLocaleString("en-GB") || 0}
					</div>
				);
			case "downPayment":
				return (
					<div className="font-medium">
						₦{loan.downPayment?.toLocaleString("en-GB") || 0}
					</div>
				);
			case "monthlyRepayment":
				return (
					<div className="font-medium">
						₦{loan.monthlyRepayment?.toLocaleString("en-GB") || 0}
					</div>
				);
			case "duration":
				return (
					<div className="text-sm">
						{loan.duration ? `${loan.duration} months` : "N/A"}
					</div>
				);
			case "loanStatus":
				return (
					<Chip
						color={loanStatusColorMap[loan.loanStatus] || "default"}
						variant="flat"
						size="sm"
					>
						{capitalize(loan.loanStatus || "")}
					</Chip>
				);
			case "createdAt":
				return (
					<div className="text-sm">
						{new Date(loan.createdAt).toLocaleDateString()}
					</div>
				);
			case "actions":
				return (
					userResponse?.data?.role != "SCAN_PARTNER" && (
						<div className="flex justify-end">
							<Dropdown>
								<DropdownTrigger>
									<Button isIconOnly size="sm" variant="light">
										<MoreVertical className="w-4 h-4 text-default-400" />
									</Button>
								</DropdownTrigger>
								<DropdownMenu aria-label="Loan actions">
									{/** <DropdownItem
                  key="view-loan"
                  startContent={<Eye className="w-4 h-4" />}
                  onPress={() =>
                    router.push(`/access/${role}/loans/${loan.loanRecordId}`)
                  }
                >
                  View Loan
                </DropdownItem> */}
									<DropdownItem
										key="view-customer"
										startContent={<UserIcon className="w-4 h-4" />}
										onPress={() =>
											router.push(
												`/access/${role}/customers/${loan.customerId}`
											)
										}
									>
										View Customer
									</DropdownItem>
									{/*loan.deviceId ? (
                  <DropdownItem
                    key="view-device"
                    startContent={<Smartphone className="w-4 h-4" />}
                    onPress={() =>
                      router.push(`/access/${role}/devices/${loan.deviceId}`)
                    }
                  >
                    View Device
                  </DropdownItem>
                ) : null*/}
								</DropdownMenu>
							</Dropdown>
						</div>
					)
				);
			default:
				return <div className="text-sm">{(loan as any)[key] || "N/A"}</div>;
		}
	};

	const renderCommissionCell = (commission: CommissionRecord, key: string) => {
		switch (key) {
			case "commissionId":
				return (
					<div className="font-mono text-xs">{commission.commissionId}</div>
				);
			case "agentName":
				return <div className="font-medium">{commission.agentName}</div>;
			case "deviceOnLoanId":
				return (
					<div className="font-mono text-xs">{commission.deviceOnLoanId}</div>
				);
			case "commission":
				return (
					<div className="font-medium">
						₦{commission.commission?.toLocaleString("en-GB") || 0}
					</div>
				);
			case "mbeCommission":
				return (
					<div className="font-medium">
						₦{commission.mbeCommission?.toLocaleString("en-GB") || 0}
					</div>
				);
			case "partnerCommission":
				return (
					<div className="font-medium">
						₦{commission.partnerCommission?.toLocaleString("en-GB") || 0}
					</div>
				);
			case "splitPercent":
				return <div className="text-sm">{commission.splitPercent || 0}%</div>;
			case "date_created":
				return (
					<div className="text-sm">
						{new Date(commission.date_created).toLocaleDateString()}
					</div>
				);
			case "actions":
				return (
					userResponse?.data?.role != "SCAN_PARTNER" && (
						<div className="flex justify-end">
							{/**
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="w-4 h-4 text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Commission actions">
                 <DropdownItem
                  key="view-commission"
                  startContent={<Eye className="w-4 h-4" />}
                  onPress={() =>
                    router.push(
                      `/access/${role}/commissions/${commission.commissionId}`
                    )
                  }
                >
                  View Commission
                </DropdownItem
                <DropdownItem
                  key="view-loan"
                  startContent={<CreditCard className="w-4 h-4" />}
                  onPress={() =>
                    router.push(
                      `/access/${role}/loans/${commission.deviceOnLoanId}`
                    )
                  }
                >
                  View Loan
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>> */}
						</div>
					)
				);
			default:
				return (
					<div className="text-sm">{(commission as any)[key] || "N/A"}</div>
				);
		}
	};

	// Handle loading state
	if (isLoading) return <LoadingSpinner />;

	// Handle error or not found
	if (error || !scanPartner) {
		return <NotFound onGoBack={() => router.back()} />;
	}

	const agents = scanPartner.Mbe || [];

	return (
		<div className="min-h-screen bg-default-50">
			{/* Header */}
			<div className="bg-white border-b border-default-200">
				<div className="py-6 px-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="flex items-center gap-3">
								<Avatar
									src={scanPartner.profile_picture || "/placeholder.svg"}
									alt={`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName})`}
									className="w-12 h-12 cursor-pointer border-2 border-default-200"
									onClick={onOpen}
									color={statusColorMap[scanPartner.accountStatus]}
								/>
								<ImagePreviewModal
									isOpen={isOpen}
									onClose={onClose}
									imageUrl={scanPartner.profile_picture || "/placeholder.svg"}
									title={`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName})`}
									alt={`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName}) - Full preview`}
								/>
								<div>
									<h1 className="text-xl font-bold text-default-900">
										{`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName})`}
									</h1>
									<p className="text-sm text-default-500">
										{scanPartner.role?.replace("_", " ")}
									</p>
								</div>
							</div>
							<StatusChip status={scanPartner.accountStatus} />
						</div>
						{/* Action Buttons - Desktop */}
						<div className="hidden md:flex items-center gap-3">
							{canSuspendUser && (
								<Button
									color="danger"
									variant="light"
									size="sm"
									startContent={<Trash2 className="w-4 h-4" />}
									onPress={onSuspendOpen}
									isDisabled={isDeleting}
								>
									Suspend
								</Button>
							)}
							<Divider orientation="vertical" className="h-6" />
							<Button
								variant="flat"
								color="primary"
								size="sm"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => router.back()}
							>
								Go Back
							</Button>
						</div>
						{/* Action Buttons - Mobile */}
						<div className="flex md:hidden items-center gap-2">
							{canSuspendUser && (
								<Dropdown>
									<DropdownTrigger>
										<div
											className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-default-100 hover:bg-default-200 cursor-pointer transition-colors"
											role="button"
											tabIndex={0}
										>
											<MoreVertical className="w-4 h-4" />
										</div>
									</DropdownTrigger>
									<DropdownMenu aria-label="Scan partner actions">
										<DropdownItem
											key="suspend"
											startContent={<Trash2 className="w-4 h-4" />}
											className="text-danger"
											onPress={onSuspendOpen}
										>
											Suspend Scan Partner
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							)}
							<Button
								variant="flat"
								color="primary"
								size="sm"
								isIconOnly
								onPress={() => router.back()}
							>
								<ArrowLeft className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Dashboard Statistics Cards */}
			<div className="px-4 py-6 bg-default-50">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-primary-100 rounded-lg">
								<Users className="w-6 h-6 text-primary" />
							</div>
							<div>
								<p className="text-sm text-default-500">Total Agents</p>
								<p className="text-2xl font-bold text-default-900">
									{agents.length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-success-100 rounded-lg">
								<CreditCard className="w-6 h-6 text-success" />
							</div>
							<div>
								<p className="text-sm text-default-500">Total Loans</p>
								<p className="text-2xl font-bold text-default-900">
									{processedData.loans.length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-success-100 rounded-lg">
								<CreditCard className="w-6 h-6 text-success" />
							</div>
							<div>
								<p className="text-sm text-default-500">Total Approved Loans</p>
								<p className="text-2xl font-bold text-default-900">
									{processedData?.overallSummary?.totalCommissionCount}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-secondary-100 rounded-lg">
								<DollarSign className="w-6 h-6 text-secondary" />
							</div>
							<div>
								<p className="text-sm text-default-500">Total Commissions</p>
								<p className="text-2xl font-bold text-default-900">
									₦{processedData?.overallSummary?.totalPartnerCommission}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Suspend Confirmation Modal */}
			<ConfirmationModal
				isOpen={isSuspendOpen}
				onClose={onSuspendClose}
				onConfirm={handleSuspendScanPartner}
				title="Suspend Scan Partner"
				confirmText={isDeleting ? "Deleting..." : "Suspend Scan Partner"}
				isLoading={isDeleting}
				variant="danger"
				entity={{
					name: `${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName})`,
					subtitle: scanPartner?.email,
					imageUrl: scanPartner?.profile_picture || "/placeholder.svg",
				}}
				warning={{
					title: "Permanent Deletion Warning",
					message:
						"This action cannot be undone. Deleting this scan partner will permanently remove:",
					items: [
						"All scan partner information and records",
						"Associated agent relationships",
						"Transaction history and referrals",
					],
					icon: (
						<Trash2 className="w-5 h-5 text-danger-600 mt-0.5 flex-shrink-0" />
					),
				}}
				additionalInfo={{
					label: "User ID",
					value: scanPartner?.userId || "",
				}}
			/>

			<div className="px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Personal Information */}
					<div className="lg:col-span-1 space-y-6">
						{/* Personal Information */}
						<InfoCard
							title="Personal Information"
							icon={<User className="w-5 h-5 text-default-600" />}
						>
							<div className="grid gap-4">
								<InfoField
									label="User ID"
									value={scanPartner.userId}
									copyable
								/>
								<InfoField
									label="Company Name"
									value={`${scanPartner.companyName}`.trim()}
								/>
								<InfoField
									label="Full Name"
									value={`${scanPartner.firstName} ${scanPartner.lastName}`.trim()}
								/>
								<InfoField label="Email" value={scanPartner.email} />
								<InfoField label="Phone" value={scanPartner.telephoneNumber} />
								<InfoField
									label="Date of Birth"
									value={scanPartner.dob || "N/A"}
								/>
								<InfoField label="Gender" value={scanPartner.gender || "N/A"} />
								<InfoField
									label="Role"
									value={scanPartner.role?.replace("_", " ")}
								/>
								<InfoField
									label="Account Type"
									value={scanPartner.accountType}
								/>
								<InfoField
									label="Referral Code"
									value={scanPartner.referralCode || "N/A"}
								/>
								<InfoField
									label="Active Status"
									value={scanPartner.isActive ? "Active" : "Inactive"}
								/>
								<InfoField
									label="Created At"
									value={
										scanPartner.createdAt
											? new Date(scanPartner.createdAt).toLocaleString("en-GB")
											: null
									}
								/>
								<InfoField
									label="Updated At"
									value={
										scanPartner.updatedAt
											? new Date(scanPartner.updatedAt).toLocaleString("en-GB")
											: null
									}
								/>
							</div>
						</InfoCard>

						{/* Bank Details */}
						<InfoCard
							title="Bank Details"
							icon={<CreditCard className="w-5 h-5 text-default-600" />}
							headerContent={
								!userBankDetails ? (
									<Button
										size="sm"
										color="primary"
										variant="flat"
										startContent={<Plus className="w-4 h-4" />}
										onPress={handleOpenBankModal}
									>
										Add Bank Details
									</Button>
								) : (
									<Button
										size="sm"
										color="default"
										variant="flat"
										startContent={<Edit className="w-4 h-4" />}
										onPress={handleOpenBankModal}
									>
										Edit
									</Button>
								)
							}
						>
							{userBankDetails ? (
								<div className="grid gap-4">
									<InfoField
										label="Account Name"
										value={userBankDetails.accountName}
									/>
									<InfoField
										label="Account Number"
										value={userBankDetails.accountNumber}
										copyable
									/>
									<InfoField
										label="Bank Name"
										value={userBankDetails.bankName}
									/>
									<InfoField
										label="Bank Code"
										value={userBankDetails.bankCode}
									/>
									{userBankDetails.vfdBankName && (
										<InfoField
											label="VFD Bank Name"
											value={userBankDetails.vfdBankName}
										/>
									)}
									{userBankDetails.vfdBankCode && (
										<InfoField
											label="VFD Bank Code"
											value={userBankDetails.vfdBankCode}
										/>
									)}
									<InfoField label="Channel" value={userBankDetails.channel} />
									<InfoField
										label="Last Updated"
										value={
											userBankDetails.updatedAt
												? new Date(userBankDetails.updatedAt).toLocalString(
														"en-GB"
												  )
												: "N/A"
										}
									/>
								</div>
							) : (
								<EmptyState
									title="No Bank Details"
									description="No bank account information has been added for this scan partner yet."
									icon={<CreditCard className="w-6 h-6 text-default-400" />}
								/>
							)}
						</InfoCard>
					</div>

					{/* Right Column - Associated Agents, Loans, and Commissions */}
					<div className="lg:col-span-2 space-y-6">
						{/* Data View Selector */}
						<InfoCard
							title="Data Overview"
							icon={<Users className="w-5 h-5 text-default-600" />}
							headerContent={
								<ButtonGroup size="sm" variant="flat">
									<Button
										color={dataViewType === "agents" ? "primary" : "default"}
										onPress={() => setDataViewType("agents")}
										startContent={<Users className="w-4 h-4" />}
									>
										Agents ({agents.length})
									</Button>
									<Button
										color={dataViewType === "loans" ? "primary" : "default"}
										onPress={() => setDataViewType("loans")}
										startContent={<CreditCard className="w-4 h-4" />}
									>
										Loans ({processedData.loans.length})
									</Button>
									<Button
										color={
											dataViewType === "commissions" ? "primary" : "default"
										}
										onPress={() => setDataViewType("commissions")}
										startContent={<DollarSign className="w-4 h-4" />}
									>
										Commissions ({processedData.commissions.length})
									</Button>
									<Button
										color={dataViewType === "analytics" ? "primary" : "default"}
										onPress={() => setDataViewType("analytics")}
										startContent={<TrendingUp className="w-4 h-4" />}
									>
										Sales Analytics
									</Button>
								</ButtonGroup>
							}
						>
							{/* Agents View */}
							{dataViewType === "agents" && (
								<>
									{agents.length > 0 ? (
										<div className="space-y-4">
											<div className="flex items-center justify-between mb-4">
												<p className="text-sm text-default-600">
													Agents managed by this scan partner
												</p>
												<div className="flex items-center gap-2">
													<Chip size="sm" variant="flat" color="primary">
														{agents.length} Agent
														{agents.length !== 1 ? "s" : ""}
													</Chip>
													<ButtonGroup size="sm" variant="flat">
														<Button
															color={
																viewType === "cards" ? "primary" : "default"
															}
															onPress={() => setViewType("cards")}
															startContent={<Grid3X3 className="w-4 h-4" />}
														>
															Cards
														</Button>
														<Button
															color={
																viewType === "table" ? "primary" : "default"
															}
															onPress={() => setViewType("table")}
															startContent={<List className="w-4 h-4" />}
														>
															Table
														</Button>
													</ButtonGroup>
												</div>
											</div>
											{viewType === "cards" ? (
												<div className="grid grid-cols-1 gap-4">
													{agents.map((agent) => (
														<AgentCard
															key={agent.mbeId}
															agent={agent}
															role={role}
														/>
													))}
												</div>
											) : (
												<div className="overflow-x-auto">
													<AgentTable agents={agents} role={role} />
												</div>
											)}
										</div>
									) : (
										<EmptyState
											title="No Agents Assigned"
											description="This scan partner currently has no agents assigned to them."
											icon={<Users className="w-6 h-6 text-default-400" />}
										/>
									)}
								</>
							)}

							{/* Loans View */}
							{dataViewType === "loans" && (
								<>
									{isLoadingLoanCommission ? (
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
										</div>
									) : filteredLoans.length > 0 ? (
										<div className="space-y-4">
											<div className="flex items-center justify-between mb-4">
												<p className="text-sm text-default-600">
													Loans processed by agents under this scan partner
												</p>
												<Chip size="sm" variant="flat" color="primary">
													{filteredLoans.length} Loan
													{filteredLoans.length !== 1 ? "s" : ""}
												</Chip>
											</div>
											<GenericTable<LoanRecord>
												columns={loanColumns}
												data={filteredLoans}
												allCount={filteredLoans.length}
												exportData={filteredLoans}
												isLoading={isLoadingLoanCommission}
												filterValue={loanFilterValue}
												onFilterChange={(value) => {
													setLoanFilterValue(value);
													setLoanPage(1);
												}}
												statusOptions={loanStatusOptions}
												statusFilter={loanStatusFilter}
												onStatusChange={setLoanStatusFilter}
												statusColorMap={loanStatusColorMap}
												showStatus={true}
												sortDescriptor={loanSortDescriptor}
												onSortChange={setLoanSortDescriptor}
												page={loanPage}
												pages={Math.ceil(filteredLoans.length / 10) || 1}
												onPageChange={setLoanPage}
												exportFn={exportLoans}
												renderCell={renderLoanCell}
												hasNoRecords={filteredLoans.length === 0}
											/>
										</div>
									) : (
										<EmptyState
											title="No Loans Found"
											description="No loan records found for agents under this scan partner."
											icon={<CreditCard className="w-6 h-6 text-default-400" />}
										/>
									)}
								</>
							)}

							{/* Commissions View */}
							{dataViewType === "commissions" && (
								<>
									{isLoadingLoanCommission ? (
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
										</div>
									) : filteredCommissions.length > 0 ? (
										<div className="space-y-4">
											<div className="flex items-center justify-between mb-4">
												<p className="text-sm text-default-600">
													Commissions earned by agents under this scan partner
												</p>
												<Chip size="sm" variant="flat" color="primary">
													{filteredCommissions.length} Commission
													{filteredCommissions.length !== 1 ? "s" : ""}
												</Chip>
											</div>
											<GenericTable<CommissionRecord>
												columns={commissionColumns}
												data={filteredCommissions}
												allCount={filteredCommissions.length}
												exportData={filteredCommissions}
												isLoading={isLoadingLoanCommission}
												filterValue={commissionFilterValue}
												onFilterChange={(value) => {
													setCommissionFilterValue(value);
													setCommissionPage(1);
												}}
												statusOptions={[]}
												statusFilter={new Set()}
												onStatusChange={() => {}}
												statusColorMap={{}}
												showStatus={false}
												sortDescriptor={commissionSortDescriptor}
												onSortChange={setCommissionSortDescriptor}
												page={commissionPage}
												pages={Math.ceil(filteredCommissions.length / 10) || 1}
												onPageChange={setCommissionPage}
												exportFn={exportCommissions}
												renderCell={renderCommissionCell}
												hasNoRecords={filteredCommissions.length === 0}
											/>
										</div>
									) : (
										<EmptyState
											title="No Commissions Found"
											description="No commission records found for agents under this scan partner."
											icon={<DollarSign className="w-6 h-6 text-default-400" />}
										/>
									)}
								</>
							)}

							{/* Sales Analytics View */}
							{dataViewType === "analytics" && (
								<>
									{salesStatsLoading ? (
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
										</div>
									) : (
										<div className="space-y-6">
											{/* Period Selector */}
											<div className="flex items-center justify-between mb-6">
												<div>
													<p className="text-sm text-default-600">
														Sales performance analytics for this scan partner
													</p>
													{salesStats?.period && (
														<p className="text-xs text-default-500 mt-1">
															Current period: {salesStats.period.toUpperCase()}
															{salesStats?.dateRanges?.current && (
																<span className="ml-2">
																	(
																	{new Date(
																		salesStats.dateRanges.current.start
																	).toLocaleDateString()}{" "}
																	-{" "}
																	{new Date(
																		salesStats.dateRanges.current.end
																	).toLocaleDateString()}
																	)
																</span>
															)}
														</p>
													)}
												</div>
												<Select
													label="Period"
													size="sm"
													className="max-w-[200px]"
													selectedKeys={[salesPeriod]}
													onSelectionChange={(keys) =>
														setSalesPeriod(
															Array.from(keys)[0] as
																| ""
																| "daily"
																| "weekly"
																| "monthly"
																| "yearly"
																| "mtd"
														)
													}
												>
													<SelectItem key="" value="">
														All Time
													</SelectItem>
													<SelectItem key="daily" value="daily">
														Daily
													</SelectItem>
													<SelectItem key="weekly" value="weekly">
														Weekly
													</SelectItem>
													<SelectItem key="monthly" value="monthly">
														Monthly
													</SelectItem>
													<SelectItem key="yearly" value="yearly">
														Yearly
													</SelectItem>
													<SelectItem key="mtd" value="mtd">
														Month to Date (MTD)
													</SelectItem>
												</Select>
											</div>

											{/* Performance Cards */}
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
												<PerformanceCard
													title="Total Commission"
													value={`₦${(
														salesStats?.current?.summary?.totalCommission || 0
													).toLocaleString("en-GB")}`}
													icon={<DollarSign className="w-6 h-6" />}
													gradient="from-green-100 to-green-200"
													textColor="text-green-600"
													iconColor="text-green-500"
												/>
												<PerformanceCard
													title="Partner Commission"
													value={`₦${(
														salesStats?.current?.summary
															?.totalPartnerCommission || 0
													).toLocaleString("en-GB")}`}
													icon={<TrendingUp className="w-6 h-6" />}
													gradient="from-blue-100 to-blue-200"
													textColor="text-blue-600"
													iconColor="text-blue-500"
												/>
												<PerformanceCard
													title="Agent Commission"
													value={`₦${(
														salesStats?.current?.summary
															?.totalAgentCommission || 0
													).toLocaleString("en-GB")}`}
													icon={<Users className="w-6 h-6" />}
													gradient="from-purple-100 to-purple-200"
													textColor="text-purple-600"
													iconColor="text-purple-500"
												/>
												<PerformanceCard
													title="Commission Count"
													value={
														salesStats?.current?.summary?.commissionCount || 0
													}
													icon={<CheckCircle className="w-6 h-6" />}
													gradient="from-amber-100 to-amber-200"
													textColor="text-amber-600"
													iconColor="text-amber-500"
												/>
											</div>

											{/* Additional Metrics */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
												<div className="bg-white rounded-lg border border-default-200 p-4">
													<div className="flex items-center justify-between">
														<div>
															<h4 className="text-sm font-medium text-default-600">
																Average Commission Per Agent
															</h4>
															<p className="text-2xl font-bold text-primary">
																₦
																{(
																	salesStats?.current?.summary
																		?.averageCommissionPerAgent || 0
																).toLocaleString("en-GB")}
															</p>
														</div>
														<Users className="w-8 h-8 text-primary opacity-50" />
													</div>
												</div>
												<div className="bg-white rounded-lg border border-default-200 p-4">
													<div className="flex items-center justify-between">
														<div>
															<h4 className="text-sm font-medium text-default-600">
																Average Commission Per Transaction
															</h4>
															<p className="text-2xl font-bold text-success">
																₦
																{(
																	salesStats?.current?.summary
																		?.averageCommissionPerTransaction || 0
																).toLocaleString("en-GB")}
															</p>
														</div>
														<DollarSign className="w-8 h-8 text-success opacity-50" />
													</div>
												</div>
											</div>

											{/* Comparison Section */}
											{salesStats?.comparison && salesStats.period !== "" && (
												<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-default-200 p-4 mb-6">
													<h4 className="text-lg font-semibold text-default-700 mb-3">
														Performance Comparison vs Previous Period
													</h4>
													<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
														<div className="text-center">
															<p className="text-xs text-default-600">
																Total Commission
															</p>
															<p className="text-lg font-bold text-green-600">
																{salesStats.comparison.totalCommissionChange >=
																0
																	? "+"
																	: ""}
																{salesStats.comparison.totalCommissionChange}%
															</p>
														</div>
														<div className="text-center">
															<p className="text-xs text-default-600">
																Agent Commission
															</p>
															<p className="text-lg font-bold text-blue-600">
																{salesStats.comparison
																	.totalAgentCommissionChange >= 0
																	? "+"
																	: ""}
																{
																	salesStats.comparison
																		.totalAgentCommissionChange
																}
																%
															</p>
														</div>
														<div className="text-center">
															<p className="text-xs text-default-600">
																Partner Commission
															</p>
															<p className="text-lg font-bold text-purple-600">
																{salesStats.comparison
																	.totalPartnerCommissionChange >= 0
																	? "+"
																	: ""}
																{
																	salesStats.comparison
																		.totalPartnerCommissionChange
																}
																%
															</p>
														</div>
														<div className="text-center">
															<p className="text-xs text-default-600">
																Commission Count
															</p>
															<p className="text-lg font-bold text-amber-600">
																{salesStats.comparison.commissionCountChange >=
																0
																	? "+"
																	: ""}
																{salesStats.comparison.commissionCountChange}%
															</p>
														</div>
														<div className="text-center">
															<p className="text-xs text-default-600">
																Total Agents
															</p>
															<p className="text-lg font-bold text-indigo-600">
																{salesStats.comparison.totalAgentsChange >= 0
																	? "+"
																	: ""}
																{salesStats.comparison.totalAgentsChange}%
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Top Agents Table */}
											{salesStats?.current?.agentPerformance &&
												salesStats.current.agentPerformance.length > 0 && (
													<div className="space-y-4">
														<div className="flex items-center justify-between">
															<h3 className="text-lg font-semibold">
																Top Performing Agents
															</h3>
															<Chip size="sm" variant="flat" color="success">
																{salesStats.current.agentPerformance.length}{" "}
																Agent
																{salesStats.current.agentPerformance.length !==
																1
																	? "s"
																	: ""}
															</Chip>
														</div>
														<div className="overflow-x-auto">
															<Table
																aria-label="Top performing agents"
																className="w-full"
															>
																<TableHeader>
																	<TableColumn>AGENT</TableColumn>
																	<TableColumn>MBE ID</TableColumn>
																	<TableColumn>PHONE</TableColumn>
																	<TableColumn>TOTAL COMMISSION</TableColumn>
																	<TableColumn>AGENT COMMISSION</TableColumn>
																	<TableColumn>PARTNER COMMISSION</TableColumn>
																	<TableColumn>SALES COUNT</TableColumn>
																</TableHeader>
																<TableBody>
																	{salesStats.current.agentPerformance.map(
																		(agentData: any, index: number) => (
																			<TableRow key={index}>
																				<TableCell>
																					<div>
																						<p className="font-medium">
																							{agentData.agent.firstname}{" "}
																							{agentData.agent.lastname}
																						</p>
																						<p className="text-sm text-default-500">
																							Rank #{index + 1}
																						</p>
																					</div>
																				</TableCell>
																				<TableCell>
																					<p className="font-mono text-sm">
																						{agentData.agent.mbeId}
																					</p>
																				</TableCell>
																				<TableCell>
																					{agentData.agent.phone}
																				</TableCell>
																				<TableCell>
																					<p className="font-medium text-green-600">
																						₦
																						{(
																							agentData.totalCommission || 0
																						).toLocaleString("en-GB")}
																					</p>
																				</TableCell>
																				<TableCell>
																					<p className="text-sm">
																						₦
																						{(
																							agentData.agentCommission || 0
																						).toLocaleString("en-GB")}
																					</p>
																				</TableCell>
																				<TableCell>
																					<p className="text-sm">
																						₦
																						{(
																							agentData.partnerCommission || 0
																						).toLocaleString("en-GB")}
																					</p>
																				</TableCell>
																				<TableCell>
																					<Chip
																						size="sm"
																						variant="flat"
																						color="success"
																					>
																						{agentData.commissionCount || 0}
																					</Chip>
																				</TableCell>
																			</TableRow>
																		)
																	)}
																</TableBody>
															</Table>
														</div>
													</div>
												)}

											{/* Approved Agents Summary - Using same data as sales stats since APIs return same structure */}
											{salesStats && (
												<div className="mt-6">
													<h3 className="text-lg font-semibold mb-4">
														Agent Performance Summary
													</h3>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
														{/* Current Period Stats */}
														<div className="space-y-3">
															<h5 className="font-medium text-default-700">
																Current Period (
																{salesStats?.period || "All Time"})
															</h5>
															<div className="grid grid-cols-3 gap-3">
																<div className="text-center p-3 bg-green-50 rounded-lg">
																	<p className="text-sm text-green-600">
																		Total Agents
																	</p>
																	<p className="text-xl font-bold text-green-800">
																		{salesStats?.current?.summary
																			?.totalAgents || 0}
																	</p>
																</div>
																<div className="text-center p-3 bg-blue-50 rounded-lg">
																	<p className="text-sm text-blue-600">
																		Partner
																	</p>
																	<p className="text-xl font-bold text-blue-800">
																		{salesStats?.scanPartner?.name || "N/A"}
																	</p>
																</div>
																<div className="text-center p-3 bg-purple-50 rounded-lg">
																	<p className="text-sm text-purple-600">
																		Commission Count
																	</p>
																	<p className="text-xl font-bold text-purple-800">
																		{salesStats?.current?.summary
																			?.commissionCount || 0}
																	</p>
																</div>
															</div>
														</div>

														{/* Previous Period Stats */}
														<div className="space-y-3">
															<h5 className="font-medium text-default-700">
																Previous Period
															</h5>
															<div className="grid grid-cols-3 gap-3">
																<div className="text-center p-3 bg-green-50 rounded-lg">
																	<p className="text-sm text-green-600">
																		Total Agents
																	</p>
																	<p className="text-xl font-bold text-green-800">
																		{salesStats?.previous?.summary
																			?.totalAgents || 0}
																	</p>
																</div>
																<div className="text-center p-3 bg-blue-50 rounded-lg">
																	<p className="text-sm text-blue-600">
																		Growth
																	</p>
																	<p className="text-xl font-bold text-blue-800">
																		{salesStats?.comparison
																			?.totalAgentsChange || 0}
																		%
																	</p>
																</div>
																<div className="text-center p-3 bg-purple-50 rounded-lg">
																	<p className="text-sm text-purple-600">
																		Commission Count
																	</p>
																	<p className="text-xl font-bold text-purple-800">
																		{salesStats?.previous?.summary
																			?.commissionCount || 0}
																	</p>
																</div>
															</div>
														</div>
													</div>

													{/* Recent Commissions */}
													{salesStats?.current?.recentCommissions &&
														salesStats.current.recentCommissions.length > 0 && (
															<div className="mt-6">
																<h5 className="font-medium text-default-700 mb-3">
																	Recent Commissions
																</h5>
																<div className="overflow-x-auto">
																	<Table
																		aria-label="Recent commissions"
																		className="w-full"
																	>
																		<TableHeader>
																			<TableColumn>COMMISSION ID</TableColumn>
																			<TableColumn>AGENT</TableColumn>
																			<TableColumn>AMOUNT</TableColumn>
																			<TableColumn>AGENT SHARE</TableColumn>
																			<TableColumn>PARTNER SHARE</TableColumn>
																			<TableColumn>DATE</TableColumn>
																		</TableHeader>
																		<TableBody>
																			{salesStats.current.recentCommissions
																				.slice(0, 5)
																				.map(
																					(commission: any, index: number) => (
																						<TableRow key={index}>
																							<TableCell>
																								<p className="font-mono text-xs">
																									{commission.commissionId}
																								</p>
																							</TableCell>
																							<TableCell>
																								<p className="font-medium">
																									{commission.agent}
																								</p>
																							</TableCell>
																							<TableCell>
																								<p className="font-medium text-green-600">
																									₦
																									{(
																										commission.amount || 0
																									).toLocaleString("en-GB")}
																								</p>
																							</TableCell>
																							<TableCell>
																								₦
																								{(
																									commission.agentShare || 0
																								).toLocaleString("en-GB")}
																							</TableCell>
																							<TableCell>
																								₦
																								{(
																									commission.partnerShare || 0
																								).toLocaleString("en-GB")}
																							</TableCell>
																							<TableCell>
																								{new Date(
																									commission.date
																								).toLocaleDateString()}
																							</TableCell>
																						</TableRow>
																					)
																				)}
																		</TableBody>
																	</Table>
																</div>
															</div>
														)}
												</div>
											)}

											{!salesStats && !salesStatsLoading && (
												<EmptyState
													title="No Analytics Data"
													description="No sales analytics data available for this scan partner yet."
													icon={
														<TrendingUp className="w-6 h-6 text-default-400" />
													}
												/>
											)}
										</div>
									)}
								</>
							)}
						</InfoCard>

						{/* Commission Analytics */}
						<InfoCard
							title="Commission Analytics"
							icon={<TrendingUp className="w-5 h-5 text-default-600" />}
							headerContent={
								<div className="flex items-center gap-2">
									<Select
										size="sm"
										placeholder="Select period"
										defaultSelectedKeys={[commissionPeriod]}
										onSelectionChange={(keys) => {
											const selectedKey = Array.from(keys)[0] as string;
											setCommissionPeriod(
												selectedKey as "daily" | "weekly" | "monthly" | "yearly"
											);
										}}
										className="w-32"
									>
										<SelectItem key="daily" value="daily">
											Daily
										</SelectItem>
										<SelectItem key="weekly" value="weekly">
											Weekly
										</SelectItem>
										<SelectItem key="monthly" value="monthly">
											Monthly
										</SelectItem>
										<SelectItem key="yearly" value="yearly">
											Yearly
										</SelectItem>
									</Select>
								</div>
							}
						>
							{commissionAnalyticsLoading ? (
								<div className="flex items-center justify-center py-8">
									<LoadingSpinner size="lg" />
								</div>
							) : (
								<>
									{commissionAnalytics && (
										<div className="space-y-6">
											{/* Period Information */}
											<div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
												<div className="flex items-center justify-between">
													<div>
														<h4 className="font-medium text-default-800">
															Period:{" "}
															{commissionAnalytics.period || commissionPeriod}
														</h4>
														<p className="text-sm text-default-600">
															Generated:{" "}
															{new Date(
																commissionAnalytics.generatedAt
															).toLocaleString("en-GB")}
														</p>
													</div>
													<div className="text-right">
														<p className="text-sm text-default-600">
															Total Agents
														</p>
														<p className="text-2xl font-bold text-blue-600">
															{commissionAnalytics.analytics?.length || 0}
														</p>
													</div>
												</div>
											</div>

											{/* Commission Summary Cards */}
											{commissionAnalytics.analytics &&
												commissionAnalytics.analytics.length > 0 && (
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
														<div className="p-4 bg-green-50 rounded-lg border border-green-100">
															<h5 className="text-sm font-medium text-green-700 mb-2">
																Total Commission
															</h5>
															<p className="text-2xl font-bold text-green-800">
																₦
																{commissionAnalytics.analytics
																	.reduce(
																		(sum: number, item: any) =>
																			sum + (item._sum?.commission || 0),
																		0
																	)
																	.toLocaleString("en-GB")}
															</p>
															<p className="text-xs text-green-600 mt-1">
																{commissionAnalytics.analytics.reduce(
																	(sum: number, item: any) =>
																		sum + (item._count?.commissionId || 0),
																	0
																)}{" "}
																transactions
															</p>
														</div>

														<div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
															<h5 className="text-sm font-medium text-blue-700 mb-2">
																Agent Commission
															</h5>
															<p className="text-2xl font-bold text-blue-800">
																₦
																{commissionAnalytics.analytics
																	.reduce(
																		(sum: number, item: any) =>
																			sum + (item._sum?.mbeCommission || 0),
																		0
																	)
																	.toLocaleString("en-GB")}
															</p>
															<p className="text-xs text-blue-600 mt-1">
																{(
																	(commissionAnalytics.analytics.reduce(
																		(sum: number, item: any) =>
																			sum + (item._sum?.mbeCommission || 0),
																		0
																	) /
																		commissionAnalytics.analytics.reduce(
																			(sum: number, item: any) =>
																				sum + (item._sum?.commission || 0),
																			0
																		)) *
																	100
																).toFixed(1)}
																% of total
															</p>
														</div>

														<div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
															<h5 className="text-sm font-medium text-purple-700 mb-2">
																Partner Commission
															</h5>
															<p className="text-2xl font-bold text-purple-800">
																₦
																{commissionAnalytics.analytics
																	.reduce(
																		(sum: number, item: any) =>
																			sum + (item._sum?.partnerCommission || 0),
																		0
																	)
																	.toLocaleString("en-GB")}
															</p>
															<p className="text-xs text-purple-600 mt-1">
																{(
																	(commissionAnalytics.analytics.reduce(
																		(sum: number, item: any) =>
																			sum + (item._sum?.partnerCommission || 0),
																		0
																	) /
																		commissionAnalytics.analytics.reduce(
																			(sum: number, item: any) =>
																				sum + (item._sum?.commission || 0),
																			0
																		)) *
																	100
																).toFixed(1)}
																% of total
															</p>
														</div>
													</div>
												)}

											{/* Agent Commission Breakdown Table */}
											{commissionAnalytics.analytics &&
												commissionAnalytics.analytics.length > 0 && (
													<div className="mt-6">
														<h5 className="font-medium text-default-700 mb-3">
															Individual Agent Performance
														</h5>
														<div className="overflow-x-auto">
															<Table
																aria-label="Agent commission breakdown"
																className="w-full"
															>
																<TableHeader>
																	<TableColumn>AGENT ID</TableColumn>
																	<TableColumn>TOTAL COMMISSION</TableColumn>
																	<TableColumn>AGENT SHARE</TableColumn>
																	<TableColumn>PARTNER SHARE</TableColumn>
																	<TableColumn>TRANSACTIONS</TableColumn>
																	<TableColumn>AVG PER TRANSACTION</TableColumn>
																</TableHeader>
																<TableBody>
																	{commissionAnalytics.analytics.map(
																		(agent: any, index: number) => (
																			<TableRow key={index}>
																				<TableCell>
																					<p className="font-mono text-xs">
																						{agent.mbeId}
																					</p>
																				</TableCell>
																				<TableCell>
																					<p className="font-medium text-green-600">
																						₦
																						{(
																							agent._sum?.commission || 0
																						).toLocaleString("en-GB")}
																					</p>
																				</TableCell>
																				<TableCell>
																					<p className="font-medium text-blue-600">
																						₦
																						{(
																							agent._sum?.mbeCommission || 0
																						).toLocaleString("en-GB")}
																					</p>
																				</TableCell>
																				<TableCell>
																					<p className="font-medium text-purple-600">
																						₦
																						{(
																							agent._sum?.partnerCommission || 0
																						).toLocaleString("en-GB")}
																					</p>
																				</TableCell>
																				<TableCell>
																					<p className="font-medium">
																						{agent._count?.commissionId || 0}
																					</p>
																				</TableCell>
																				<TableCell>
																					<p className="text-sm text-default-600">
																						₦
																						{(
																							(agent._sum?.commission || 0) /
																							(agent._count?.commissionId || 1)
																						).toLocaleString("en-GB")}
																					</p>
																				</TableCell>
																			</TableRow>
																		)
																	)}
																</TableBody>
															</Table>
														</div>
													</div>
												)}

											{commissionAnalytics.analytics &&
												commissionAnalytics.analytics.length === 0 && (
													<EmptyState
														title="No Commission Data"
														description="No commission data available for  agents in this period."
														icon={
															<TrendingUp className="w-6 h-6 text-default-400" />
														}
													/>
												)}
										</div>
									)}

									{!commissionAnalytics && !commissionAnalyticsLoading && (
										<EmptyState
											title="No Commission Analytics"
											description="No commission analytics data available for this scan partner yet."
											icon={<TrendingUp className="w-6 h-6 text-default-400" />}
										/>
									)}
								</>
							)}
						</InfoCard>

						{/* Bank Details */}
						<InfoCard
							title="Bank Details"
							icon={<Building2 className="w-5 h-5 text-default-600" />}
							headerContent={
								<Button
									size="sm"
									color="primary"
									variant="flat"
									startContent={
										userBankDetails ? (
											<Edit className="w-4 h-4" />
										) : (
											<Plus className="w-4 h-4" />
										)
									}
									onPress={handleOpenBankModal}
								>
									{userBankDetails ? "Edit" : "Add"} Bank Details
								</Button>
							}
						>
							{userBankDetails ? (
								<div className="grid gap-4">
									<InfoField
										label="Account Name"
										value={userBankDetails.accountName}
									/>
									<InfoField
										label="Account Number"
										value={userBankDetails.accountNumber}
										copyable
									/>
									<InfoField
										label="Bank Name"
										value={userBankDetails.bankName}
									/>
									<InfoField
										label="VFD Bank Name"
										value={userBankDetails.vfdBankName}
									/>
									<InfoField label="Channel" value={userBankDetails.channel} />
									{userBankDetails.createdAt && (
										<InfoField
											label="Added At"
											value={new Date(userBankDetails.createdAt).toLocalString(
												"en-GB"
											)}
										/>
									)}
								</div>
							) : (
								<EmptyState
									title="No Bank Details"
									description="No bank account details have been added for this scan partner yet."
									icon={<Building2 className="w-6 h-6 text-default-400" />}
								/>
							)}
						</InfoCard>
					</div>
				</div>
			</div>

			{/* Bank Details Modal */}
			<BankDetailsModal
				isOpen={isBankModalOpen}
				onClose={onBankModalClose}
				onSave={handleSaveBankDetails}
				isEdit={!!userBankDetails}
				bankFormData={bankFormData}
				setBankFormData={setBankFormData}
				vfdBanks={vfdBanks}
				paystackBanks={paystackBanks}
				selectedVfdBank={selectedVfdBank}
				selectedPaystackBank={selectedPaystackBank}
				onVfdBankSelect={handleVfdBankSelect}
				onPaystackBankSelect={handlePaystackBankSelect}
				onVerifyBankDetails={handleVerifyBankDetails}
				isVerifyingBank={isVerifyingBank}
				isSavingBank={isSavingBank}
				isAccountVerified={isAccountVerified}
				setIsAccountVerified={setIsAccountVerified}
			/>
		</div>
	);
}
