"use client";
import {
	showToast,
	updateAgentGuarantorStatus,
	deleteAgentDetails,
	getAgentDevice,
	getAgentRecordByMbeId,
	updateAgentAddressStatus,
	getAgentLoansAndCommissionsByScanPartner,
	updateScanPartner,
	getAllScanPartners,
	getScanPartnerByUserId,
	assignAgentToStore,
	updateAgentStore,
	getAgentAvailableStores,
} from "@/lib";
import {
	getReconciliationHistory,
	getReconciliationStats,
	getMbeAssignedAgents,
	changeAgentMbeAssignment,
	unlinkAgentFromMbe,
} from "@/lib/api";
import { SelectField } from "@/components/reususables";
import {
	LoadingSpinner,
	NotFound,
	InfoCard,
	InfoField,
	EmptyState,
	AgentDeviceCard,
	StatusChip,
	GuarantorStatusChip,
	AddressStatusChip,
	getStatusColor,
	ConfirmationModal,
	FormModal,
	ImagePreviewModal,
	SelectionWithPreview,
	ReasonSelection,
	DateFilter,
} from "@/components/reususables/custom-ui";
import { useAuth } from "@/lib";
import { getUserRole } from "@/lib";
import { hasPermission } from "@/lib/permissions";
import {
	Avatar,
	Button,
	Chip,
	Snippet,
	useDisclosure,
	Image,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Divider,
	ButtonGroup,
	Select,
	SelectItem,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Input,
	Switch,
	Card,
	CardHeader,
	CardBody,
	Pagination,
	DateInput,
	DatePicker,
	Autocomplete,
	AutocompleteItem,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import {
	ArrowLeft,
	CreditCard,
	User,
	Users,
	Store,
	MapPin,
	Clock,
	ChevronDown,
	ChevronUp,
	Trash2,
	MoreVertical,
	Smartphone,
	DollarSign,
	TrendingUp,
	Calendar,
	UserIcon,
	Grid3X3,
	List,
	Eye,
	BarChart,
} from "lucide-react";
import { IoBusiness } from "react-icons/io5";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useState, useMemo, useEffect } from "react";
import type { AccountStatus, AgentRecord } from "./types";
import useSWR from "swr";
import GenericTable, {
	type ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Add the new interfaces for loan and commission data
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
}

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
}

interface CommissionSummary {
	totalCommission: number;
	totalMbeCommission: number;
	totalPartnerCommission: number;
	commissionCount: number;
	avgCommission: number;
	avgMbeCommission: number;
	avgPartnerCommission: number;
	maxCommission: number;
	minCommission: number;
	latestCommissionDate: string | null;
	earliestCommissionDate: string | null;
}

// Types for device data
interface DeviceItem {
	price: number;
	deviceModelNumber: string;
	SAP: number;
	SLD: number;
	createdAt: string;
	deviceManufacturer: string;
	deviceName: string;
	deviceRam: string;
	deviceScreen: string | null;
	deviceStorage: string;
	imageLink: string;
	newDeviceId: string;
	oldDeviceId: string | null;
	sentiprotect: number;
	updatedAt: string;
	deviceType: string | null;
	deviceCamera: any[];
	android_go: string;
	erpItemCode: string;
	erpName: string;
	erpSerialNo: string;
	devfinStatus: boolean;
}

interface DeviceResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: {
		devices: DeviceItem[];
		acceptedDate: string;
		expiryDate: string;
	};
	responseTime: string;
}

// Column definitions for loans table
const loanColumns: ColumnDef[] = [
	{ name: "Loan ID", uid: "loanRecordId", sortable: true },
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
	{ name: "Device Loan ID", uid: "deviceOnLoanId", sortable: true },
	{ name: "Total Commission", uid: "commission", sortable: true },
	{ name: "Agent Commission", uid: "mbeCommission", sortable: true },
	{ name: "Partner Commission", uid: "partnerCommission", sortable: true },
	{ name: "Split %", uid: "splitPercent", sortable: true },
	{ name: "Date Created", uid: "date_created", sortable: true },
	{ name: "Actions", uid: "actions" },
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

// Loan status options
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

const MOBIFLEX_APP_KEY = process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY;

// Delete agent function
const mockDeleteAgent = async (agentId: string) => {
	await deleteAgentDetails({ mbeId: agentId });
	console.log(`Deleting agent ${agentId}`);
	return { success: true, message: "Agent deleted successfully" };
};

// Mock function to update guarantor status
const mockUpdateGuarantorStatus = async (
	guarantorId: string,
	newStatus: string,
	agentId: string,
	comment?: string
) => {
	await updateAgentGuarantorStatus({
		status: newStatus,
		mbeId: agentId,
		guarantorId,
		comment: comment || "none stated",
	});
	console.log(
		`Updating guarantor ${guarantorId} status to ${newStatus} with comment: ${comment}`
	);
	return { success: true, message: `Guarantor status updated to ${newStatus}` };
};

// Mock function to update address status
const mockUpdateAddressStatus = async (
	kycId: string,
	newStatus: string,
	agentId: string
) => {
	await updateAgentAddressStatus({
		status: newStatus,
		mbeId: agentId,
		kycId,
	});
	console.log(`Updating address ${kycId} status to ${newStatus}`);
	return { success: true, message: `Address status updated to ${newStatus}` };
};

// Fetcher function for useSWR
const fetchAgent = async (agentId: string) => {
	if (!agentId) {
		throw new Error("Agent ID is required");
	}
	const response = await getAgentRecordByMbeId(agentId);
	const agentData: AgentRecord = response?.data?.data;
	if (!agentData) {
		throw new Error("Agent not found");
	}
	return agentData;
};

// Fetcher function for agent devices
const fetchAgentDevices = async (
	agentId: string,
	acceptedDate?: string
): Promise<DeviceResponse["data"]> => {
	if (!agentId) {
		throw new Error("Agent ID is required");
	}
	try {
		const response: DeviceResponse = await getAgentDevice({
			mbeId: agentId,
			acceptedDate: acceptedDate || new Date().toISOString().split("T")[0], // Default to today
		});
		return response?.data || { devices: [], acceptedDate: "", expiryDate: "" };
	} catch (error) {
		console.error("Error fetching agent devices:", error);
		return { devices: [], acceptedDate: "", expiryDate: "" };
	}
};

// Fetcher function for agent performance data
const fetchAgentPerformanceData = async (
	scanPartnerId: string,
	mbeId: string
) => {
	if (!scanPartnerId || !mbeId) {
		throw new Error("Scan Partner ID and Agent ID are required");
	}
	try {
		const response = await getAgentLoansAndCommissionsByScanPartner(
			scanPartnerId,
			mbeId
		);
		return response?.data;
	} catch (error) {
		console.error("Error fetching agent performance data:", error);
		return null;
	}
};

// Export functions
const exportLoans = async (data: LoanRecord[]) => {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet("Agent Loans");

	ws.columns = loanColumns
		.filter((c) => c.uid !== "actions")
		.map((c) => ({
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
			createdAt: new Date(loan.createdAt).toLocaleDateString(),
			updatedAt: new Date(loan.updatedAt).toLocaleDateString(),
		})
	);

	const buf = await wb.xlsx.writeBuffer();
	saveAs(new Blob([buf]), "Agent_Loans.xlsx");
};

const exportCommissions = async (data: CommissionRecord[]) => {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet("Agent Commissions");

	ws.columns = commissionColumns
		.filter((c) => c.uid !== "actions")
		.map((c) => ({
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
const renderLoanCell = (
	loan: LoanRecord,
	key: string,
	router: any,
	role: string
) => {
	switch (key) {
		case "loanRecordId":
			return <div className="font-mono text-xs">{loan.loanRecordId}</div>;
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
					{loan.loanStatus || ""}
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
				<div className="flex justify-end">
					{role != "scan-partner" && (
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly size="sm" variant="light">
									<MoreVertical className="w-4 h-4 text-default-400" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu aria-label="Loan actions">
								<DropdownItem
									key="view-customer"
									startContent={<UserIcon className="w-4 h-4" />}
									onPress={() =>
										router.push(`/access/${role}/customers/${loan.customerId}`)
									}
								>
									View Customer
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					)}
				</div>
			);
		default:
			return <div className="text-sm">{(loan as any)[key] || "N/A"}</div>;
	}
};

const renderCommissionCell = (commission: CommissionRecord, key: string) => {
	switch (key) {
		case "commissionId":
			return <div className="font-mono text-xs">{commission.commissionId}</div>;
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
			return <div className="flex justify-end"></div>;
		default:
			return <div className="text-sm">{(commission as any)[key] || "N/A"}</div>;
	}
};

// Main Component
export default function AgentSinglePage() {
	const params = useParams();
	const { userResponse } = useAuth();
	const role = getUserRole(String(userResponse?.data?.role));
	const canUpdateGuarantorStatus = hasPermission(role, "updateGuarantorStatus");
	const canUpdateAddressStatus = hasPermission(role, "updateAddressStatus");
	const canViewAgentPerformanceData = hasPermission(
		role,
		"viewAgentPerformanceData"
	);
	const canChangeScanPartner = hasPermission(role, "updateScanPartner");

	const router = useRouter();
	const [isUpdatingGuarantor, setIsUpdatingGuarantor] = useState<string | null>(
		null
	);
	const [isUpdatingAddress, setIsUpdatingAddress] = useState<string | null>(
		null
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const [performanceViewType, setPerformanceViewType] = useState<
		"loans" | "commissions"
	>("loans");

	const [isChangingScanPartner, setIsChangingScanPartner] = useState(false);
	const [selectedScanPartner, setSelectedScanPartner] = useState<any>(null);
	const [scanPartners, setScanPartners] = useState<any[]>([]);
	const [scanPartnerDetails, setScanPartnerDetails] = useState<any>(null);

	const [guarantorToUpdate, setGuarantorToUpdate] = useState<any>(null);
	const [guarantorUpdateAction, setGuarantorUpdateAction] = useState<
		"approve" | "reject" | null
	>(null);
	const [guarantorComment, setGuarantorComment] = useState("");
	const [guarantorReason, setGuarantorReason] = useState("");
	const [isOtherReason, setIsOtherReason] = useState(false);

	// Device states
	const [deviceViewMode, setDeviceViewMode] = useState<"card" | "table">(
		"card"
	);
	const [deviceDate, setDeviceDate] = useState<string>(
		new Date().toISOString().split("T")[0]
	);
	const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
	const [deviceMetadata, setDeviceMetadata] = useState<{
		acceptedDate: string;
		expiryDate: string;
	} | null>(null);

	// Store assignment states
	const [isAssigningStore, setIsAssigningStore] = useState(false);
	const [availableStores, setAvailableStores] = useState<any[]>([]);
	const [selectedStore, setSelectedStore] = useState<any>(null);
	const [storeSearchValue, setStoreSearchValue] = useState("");

	// Handle store search input change
	const handleStoreSearchChange = (value: string) => {
		setStoreSearchValue(value);
		// Clear selection when user is typing to search
		if (value && selectedStore) {
			setSelectedStore(null);
		}
	};

	const [currentScanPartnerDetails, setCurrentScanPartnerDetails] =
		useState<any>(null);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		isOpen: isDeleteOpen,
		onOpen: onDeleteOpen,
		onClose: onDeleteClose,
	} = useDisclosure();
	const {
		isOpen: isScanPartnerModalOpen,
		onOpen: onScanPartnerModalOpen,
		onClose: onScanPartnerModalClose,
	} = useDisclosure();
	const {
		isOpen: isGuarantorModalOpen,
		onOpen: onGuarantorModalOpen,
		onClose: onGuarantorModalClose,
	} = useDisclosure();
	const {
		isOpen: isDeviceModalOpen,
		onOpen: onDeviceModalOpen,
		onClose: onDeviceModalClose,
	} = useDisclosure();
	const {
		isOpen: isStoreModalOpen,
		onOpen: onStoreModalOpen,
		onClose: onStoreModalClose,
	} = useDisclosure();

	// Filter states for performance data
	const [loanFilterValue, setLoanFilterValue] = useState("");
	const [loanStatusFilter, setLoanStatusFilter] = useState<Set<string>>(
		new Set()
	);
	const [loanPage, setLoanPage] = useState(1);
	const [commissionFilterValue, setCommissionFilterValue] = useState("");
	const [commissionPage, setCommissionPage] = useState(1);

	// MBE-specific states
	const [mbeAssignedAgents, setMbeAssignedAgents] = useState<any[]>([]);
	const [reconciliationStats, setReconciliationStats] = useState<any>(null);
	const [reconciliationHistory, setReconciliationHistory] = useState<any>(null);
	const [reconciliationPage, setReconciliationPage] = useState(1);
	const [reconciliationDateFilter, setReconciliationDateFilter] = useState("");
	const [selectedAgentFilter, setSelectedAgentFilter] = useState<string | null>(
		null
	);
	const [reconciliationFilterValue, setReconciliationFilterValue] =
		useState("");
	const [reconciliationSortDescriptor, setReconciliationSortDescriptor] =
		useState<any>({
			column: "createdAt",
			direction: "descending",
		});
	const [isLoadingMbeData, setIsLoadingMbeData] = useState(false);
	const [selectedMbeForAgent, setSelectedMbeForAgent] = useState<any>(null);
	const [availableMbes, setAvailableMbes] = useState<any[]>([]);
	const [selectedReconciliation, setSelectedReconciliation] =
		useState<any>(null);

	// MBE-related modals
	const {
		isOpen: isChangeMbeModalOpen,
		onOpen: onChangeMbeModalOpen,
		onClose: onChangeMbeModalClose,
	} = useDisclosure();
	const {
		isOpen: isUnlinkMbeModalOpen,
		onOpen: onUnlinkMbeModalOpen,
		onClose: onUnlinkMbeModalClose,
	} = useDisclosure();
	const {
		isOpen: isReconciliationDetailsModalOpen,
		onOpen: onReconciliationDetailsModalOpen,
		onClose: onReconciliationDetailsModalClose,
	} = useDisclosure();

	// Use SWR for data fetching
	const userId = userResponse?.data?.userId;
	const {
		data: agent,
		error,
		isLoading,
		mutate,
	} = useSWR("sales-agent-records", () => fetchAgent(params.id as string), {
		onError: (error) => {
			console.error("Error fetching agent:", error);
			showToast({
				type: "error",
				message: error.message || "Failed to fetch agent data",
				duration: 5000,
			});
		},
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
		dedupingInterval: 30000,
	});

	// Use SWR for agent devices
	const {
		data: deviceData,
		error: devicesError,
		isLoading: devicesLoading,
		mutate: mutateDevices,
	} = useSWR(
		agent ? `agent-devices-${agent.mbeId}-${deviceDate}` : null,
		() => fetchAgentDevices(agent!.mbeId, deviceDate),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000,
			onSuccess: (data) => {
				setDeviceMetadata({
					acceptedDate: data.acceptedDate,
					expiryDate: data.expiryDate,
				});
			},
		}
	);

	// Extract devices array from deviceData
	const devices = deviceData?.devices || [];

	// Use SWR for agent performance data
	const {
		data: performanceData,
		error: performanceError,
		isLoading: performanceLoading,
	} = useSWR(
		agent && agent.userId ? `agent-performance-${agent.mbeId}` : null,
		() => fetchAgentPerformanceData(String(agent!.userId), agent!.mbeId),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000,
		}
	);

	// Process performance data
	const processedPerformanceData = useMemo(() => {
		if (!performanceData?.agent) {
			return {
				loans: [],
				commissions: [],
				summary: null,
			};
		}

		const agentData = performanceData.agent; // Get the specific agent's data
		return {
			loans: agentData.LoanRecord || [],
			commissions: agentData.Commission || [],
			summary: agentData.commissionSummary || null,
		};
	}, [performanceData]);

	// Fetch available stores for the agent
	const { data: storesData, error: storesError } = useSWR(
		agent?.mbeId ? `agent-stores-${agent.mbeId}` : null,
		() => getAgentAvailableStores(agent!.mbeId),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000,
		}
	);

	// Process stores data
	const processedStoresData = useMemo(() => {
		if (!storesData?.data) {
			return [];
		}
		return storesData.data;
	}, [storesData]);

	// Determine if this agent is an MBE
	const isMbe = useMemo(() => {
		const isAnMbe = agent?.role === "MOBIFLEX_MBE";
		console.log("MBE Detection:", { role: agent?.role, isMbe: isAnMbe });
		return isAnMbe;
	}, [agent?.role]);

	// Determine if this agent is MBE-managed (managed by another MBE)
	const isMbeManaged = useMemo(() => {
		const isManaged =
			agent?.mbeManaged === true &&
			agent?.assignedMbeId &&
			agent?.assignedMbeId !== agent?.mbeId;
		console.log("MBE-Managed Detection:", {
			mbeManaged: agent?.mbeManaged,
			assignedMbeId: agent?.assignedMbeId,
			ownMbeId: agent?.mbeId,
			isMbeManaged: isManaged,
		});
		return isManaged;
	}, [agent?.mbeManaged, agent?.assignedMbeId, agent?.mbeId]);

	// MBE-specific data fetching functions
	const fetchMbeReconciliationStats = async (mbeId: string) => {
		try {
			const response = await getReconciliationStats({ mbeId });
			return response.data;
		} catch (error) {
			console.error("Error fetching reconciliation stats:", error);
			return null;
		}
	};

	const fetchMbeReconciliationHistory = async (
		mbeId: string,
		page: number = 1,
		date?: string
	) => {
		try {
			const response = await getReconciliationHistory({
				mbeId,
				page,
				limit: 10,
				date: date || undefined,
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching reconciliation history:", error);
			return null;
		}
	};

	const fetchMbeAssignedAgents = async (mbeId: string) => {
		try {
			const response = await getMbeAssignedAgents({ mbeId });
			console.log("MBE Assigned Agents Response:", response.data);
			return response.data; // Return the full data object which contains mbe, agents, and totalAgents
		} catch (error) {
			console.error("Error fetching MBE assigned agents:", error);
			return null;
		}
	};

	const fetchAgentReconciliationHistory = async (
		agentId: string,
		assignedMbeId: string,
		page: number = 1,
		date?: string
	) => {
		try {
			const response = await getReconciliationHistory({
				agentId,
				mbeId: assignedMbeId,
				page,
				limit: 10,
				date: date || undefined,
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching agent reconciliation history:", error);
			return null;
		}
	};

	// Handle agent selection for filtering reconciliation history
	const handleAgentSelection = (agentId: string, agentName: string) => {
		if (selectedAgentFilter === agentId) {
			// If clicking the same agent, clear the filter
			setSelectedAgentFilter(null);
		} else {
			// Set the selected agent filter
			setSelectedAgentFilter(agentId);
		}
		// Reset pagination when changing filter
		setReconciliationPage(1);
	};

	// Reconciliation Table Configuration
	const reconciliationColumns: ColumnDef[] = [
		{ name: "ID", uid: "reconciliationId", sortable: true },
		{ name: "Agent", uid: "agent", sortable: true },
		{ name: "Status", uid: "status", sortable: true },
		{ name: "Target Warehouse", uid: "targetWarehouse", sortable: true },
		{ name: "Items", uid: "items", sortable: false },
		{ name: "Created", uid: "createdAt", sortable: true },
		{ name: "Actions", uid: "actions", sortable: false },
	];

	const renderReconciliationCell = (record: any, columnKey: string) => {
		switch (columnKey) {
			case "reconciliationId":
				return (
					<div className="text-xs font-mono text-default-600">
						{record.reconciliationId}
					</div>
				);
			case "agent":
				return (
					<div>
						<div className="text-sm font-medium">
							{record.agent?.name || "N/A"}
						</div>
						<div className="text-xs text-default-500">
							{record.agent?.email || "N/A"}
						</div>
					</div>
				);
			case "status":
				return <StatusChip status={record.status} />;
			case "targetWarehouse":
				return <div className="text-sm">{record.targetWarehouse || "N/A"}</div>;
			case "items":
				return (
					<div className="text-sm">{record.transferItems?.length || 0}</div>
				);
			case "createdAt":
				return (
					<div className="text-sm">
						{new Date(record.createdAt).toLocaleDateString()}
					</div>
				);
			case "actions":
				return (
					<Button
						size="sm"
						variant="flat"
						color="primary"
						onPress={() => handleViewReconciliationDetails(record)}
					>
						View Details
					</Button>
				);
			default:
				return record[columnKey];
		}
	};

	const exportReconciliationData = (data: any[]) => {
		// Export functionality placeholder
		console.log("Exporting reconciliation data:", data);
	};

	// Load MBE-specific data when agent is loaded and is an MBE
	useEffect(() => {
		if (agent && isMbe) {
			setIsLoadingMbeData(true);
			Promise.all([
				fetchMbeReconciliationStats(agent.mbeId),
				selectedAgentFilter
					? fetchAgentReconciliationHistory(
							selectedAgentFilter,
							agent.mbeId,
							reconciliationPage,
							reconciliationDateFilter
					  )
					: fetchMbeReconciliationHistory(
							agent.mbeId,
							reconciliationPage,
							reconciliationDateFilter
					  ),
				fetchMbeAssignedAgents(agent.mbeId),
			])
				.then(([stats, history, assignedAgents]) => {
					console.log("MBE Data loaded:", { stats, history, assignedAgents });
					setReconciliationStats(stats);
					setReconciliationHistory(history);
					setMbeAssignedAgents(assignedAgents?.agents || []);
					setIsLoadingMbeData(false);
				})
				.catch((error) => {
					console.error("Error loading MBE data:", error);
					setIsLoadingMbeData(false);
				});
		}
	}, [
		agent,
		isMbe,
		reconciliationPage,
		reconciliationDateFilter,
		selectedAgentFilter,
	]);

	// Load agent reconciliation data when agent is MBE-managed
	useEffect(() => {
		if (agent && isMbeManaged && agent.assignedMbeId) {
			setIsLoadingMbeData(true);
			fetchAgentReconciliationHistory(
				agent.mbeId,
				agent.assignedMbeId,
				reconciliationPage,
				reconciliationDateFilter
			).then((history) => {
				setReconciliationHistory(history);
				setIsLoadingMbeData(false);
			});
		}
	}, [agent, isMbeManaged, reconciliationPage, reconciliationDateFilter]);

	// Load reconciliation data for regular agents (non-MBE-managed)
	useEffect(() => {
		if (agent && !isMbe && !isMbeManaged) {
			setIsLoadingMbeData(true);
			// For regular agents, we might need to call a different API or pass empty mbeId
			fetchAgentReconciliationHistory(
				agent.mbeId,
				"", // No MBE ID for regular agents
				reconciliationPage,
				reconciliationDateFilter
			)
				.then((history) => {
					console.log("Regular Agent Reconciliation History:", history);
					setReconciliationHistory(history);
					setIsLoadingMbeData(false);
				})
				.catch((error) => {
					console.error("Error loading agent reconciliation:", error);
					setIsLoadingMbeData(false);
				});
		}
	}, [
		agent,
		isMbe,
		isMbeManaged,
		reconciliationPage,
		reconciliationDateFilter,
	]);

	// Load scan partners when modal opens
	useEffect(() => {
		if (isScanPartnerModalOpen && canChangeScanPartner) {
			loadScanPartners();
		}
	}, [isScanPartnerModalOpen, canChangeScanPartner]);

	// Load current scan partner details when agent is loaded
	useEffect(() => {
		const loadCurrentScanPartnerDetails = async () => {
			if (agent?.userId) {
				try {
					const response = await getScanPartnerByUserId(agent.userId);
					// The API returns an array with the scan partner data
					if (response.data && response.data.length > 0) {
						setCurrentScanPartnerDetails(response.data[0]);
					} else {
						setCurrentScanPartnerDetails(null);
					}
				} catch (error: any) {
					console.error("Error loading current scan partner details:", error);
					showToast({
						type: "error",
						message:
							error?.response?.data?.message ||
							error?.message ||
							"Failed to load current scan partner details",
						duration: 5000,
					});
				}
			}
		};

		loadCurrentScanPartnerDetails();
	}, [agent?.userId]);

	// Filter loans and commissions
	const filteredLoans = useMemo(() => {
		let filtered = [...processedPerformanceData.loans];

		if (loanFilterValue) {
			const searchTerm = loanFilterValue.toLowerCase();
			filtered = filtered.filter(
				(loan) =>
					loan.loanRecordId.toLowerCase().includes(searchTerm) ||
					loan.customerId.toLowerCase().includes(searchTerm) ||
					loan.deviceName?.toLowerCase().includes(searchTerm)
			);
		}

		if (loanStatusFilter.size > 0) {
			filtered = filtered.filter((loan) =>
				loanStatusFilter.has(loan.loanStatus)
			);
		}

		return filtered;
	}, [processedPerformanceData.loans, loanFilterValue, loanStatusFilter]);

	const filteredCommissions = useMemo(() => {
		let filtered = [...processedPerformanceData.commissions];

		if (commissionFilterValue) {
			const searchTerm = commissionFilterValue.toLowerCase();
			filtered = filtered.filter(
				(commission) =>
					commission.commissionId.toLowerCase().includes(searchTerm) ||
					commission.deviceOnLoanId.toLowerCase().includes(searchTerm)
			);
		}

		return filtered;
	}, [processedPerformanceData.commissions, commissionFilterValue]);

	const handleAddressStatusUpdate = async (
		kycId: string,
		newStatus: string
	) => {
		if (!agent) return;
		setIsUpdatingAddress(kycId);
		try {
			const result = await mockUpdateAddressStatus(
				kycId,
				newStatus,
				agent.mbeId
			);
			if (result.success) {
				// Update the KYC status in the local state
				const updatedKyc = agent.MbeKyc
					? {
							...agent.MbeKyc,
							addressStatus: newStatus as AccountStatus,
					  }
					: agent.MbeKyc;
				await mutate({ ...agent, MbeKyc: updatedKyc! }, { revalidate: false });
				showToast({
					type: "success",
					message: result.message,
					duration: 3000,
				});
			} else {
				showToast({
					type: "error",
					message: result.message || "Failed to update address status",
					duration: 5000,
				});
			}
		} catch (error: any) {
			console.error("Error updating address status:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to update address status",
				duration: 5000,
			});
			mutate();
		} finally {
			setIsUpdatingAddress(null);
		}
	};

	const handleDeleteAgent = async () => {
		if (!agent) return;
		setIsDeleting(true);
		try {
			const result = await mockDeleteAgent(agent.mbeId);
			if (result.success) {
				showToast({
					type: "success",
					message: result.message,
					duration: 3000,
				});
				router.back();
			} else {
				showToast({
					type: "error",
					message: result.message || "Failed to delete agent",
					duration: 5000,
				});
			}
		} catch (error: any) {
			console.error("Error deleting agent:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to delete agent",
				duration: 5000,
			});
		} finally {
			setIsDeleting(false);
			onDeleteClose();
		}
	};

	// Scan Partner Change Handlers
	const loadScanPartners = async () => {
		try {
			const response = await getAllScanPartners();
			console.log("Scan partners loaded:", response.data); // Debug log
			setScanPartners(response.data || []);
		} catch (error: any) {
			console.error("Error loading scan partners:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to load scan partners",
				duration: 5000,
			});
		}
	};

	const loadScanPartnerDetails = async (partnerId: string) => {
		try {
			const response = await getScanPartnerByUserId(partnerId);

			console.log("Scan partner details loaded:", response.data); // Debug log
			// The API returns an array with the scan partner data
			if (response.data && response.data.length > 0) {
				setScanPartnerDetails(response.data[0]);
			} else {
				setScanPartnerDetails(null);
			}
		} catch (error: any) {
			console.error("Error loading scan partner details:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to load scan partner details",
				duration: 5000,
			});
			setScanPartnerDetails(null);
		}
	};

	const handleScanPartnerSelect = async (partnerId: string) => {
		// Find partner by userId (based on API response structure)
		const partner = scanPartners.find((p) => p.userId === partnerId);
		console.log("Selected partner:", partner, "from ID:", partnerId); // Debug log
		setSelectedScanPartner(partner);
		if (partnerId) {
			await loadScanPartnerDetails(partnerId);
		} else {
			setScanPartnerDetails(null);
		}
	};

	const handleScanPartnerChange = async () => {
		if (!agent || !selectedScanPartner) return;
		setIsChangingScanPartner(true);
		try {
			// Use the correct ID property from the selected partner
			const partnerUserId =
				selectedScanPartner.userId ||
				selectedScanPartner.id ||
				selectedScanPartner.scanPartnerId ||
				selectedScanPartner.mbeId;

			console.log("Updating scan partner with ID:", partnerUserId); // Debug log

			const result = await updateScanPartner({
				mbeId: agent.mbeId,
				userId: partnerUserId,
			});
			if (result.success) {
				showToast({
					type: "success",
					message: result.message || "Scan Partner updated successfully",
					duration: 3000,
				});
				// Update local state
				await mutate(
					{ ...agent, userId: partnerUserId },
					{ revalidate: false }
				);
				// Update current scan partner details
				setCurrentScanPartnerDetails(scanPartnerDetails);
				onScanPartnerModalClose();
				setSelectedScanPartner(null);
				setScanPartnerDetails(null);
			} else {
				showToast({
					type: "error",
					message: result.message || "Failed to update scan partner",
					duration: 5000,
				});
			}
		} catch (error: any) {
			console.error("Error updating scan partner:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to update scan partner",
				duration: 5000,
			});
		} finally {
			setIsChangingScanPartner(false);
		}
	};

	const reasonOptions = [
		"Referees not reachable/switched off",
		"Referees doesn't want to stand",
		"Referees wants to speak with the agent",
		"Referees doesn't know the agent",
		"Agent used themselves as referees",
		"Other",
	];

	const handleGuarantorActionStart = (
		guarantor: any,
		action: "approve" | "reject"
	) => {
		setGuarantorToUpdate(guarantor);
		setGuarantorUpdateAction(action);
		setGuarantorComment("");
		setGuarantorReason("");
		setIsOtherReason(false);
		onGuarantorModalOpen();
	};

	const handleGuarantorStatusUpdateConfirm = async () => {
		if (!guarantorToUpdate || !guarantorUpdateAction || !agent) return;
		const comment =
			guarantorUpdateAction === "approve"
				? "No reason stated"
				: isOtherReason
				? guarantorComment
				: guarantorReason;

		if (guarantorUpdateAction === "reject" && !comment.trim()) {
			showToast({
				type: "error",
				message: "Please provide a reason for this action",
				duration: 3000,
			});
			return;
		}

		setIsUpdatingGuarantor(guarantorToUpdate.guarantorid);
		try {
			const newStatus =
				guarantorUpdateAction === "approve" ? "APPROVED" : "REJECTED";
			const result = await mockUpdateGuarantorStatus(
				guarantorToUpdate.guarantorid,
				newStatus,
				agent.mbeId,
				comment
			);
			if (result.success) {
				const updatedGuarantors = agent.MbeGuarantor?.map((g) =>
					g.guarantorid === guarantorToUpdate.guarantorid
						? { ...g, guarantorStatus: newStatus }
						: g
				);
				await mutate(
					{ ...agent, MbeGuarantor: updatedGuarantors },
					{ revalidate: false }
				);
				showToast({
					type: "success",
					message: result.message,
					duration: 3000,
				});
				onGuarantorModalClose();
			} else {
				showToast({
					type: "error",
					message: result.message || "Failed to update guarantor status",
					duration: 5000,
				});
			}
		} catch (error: any) {
			console.error("Error updating guarantor status:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to update guarantor status",
				duration: 5000,
			});
			mutate();
		} finally {
			setIsUpdatingGuarantor(null);
			setGuarantorToUpdate(null);
			setGuarantorUpdateAction(null);
		}
	};

	// Store Assignment Functions
	const handleStoreSelect = (store: any) => {
		setSelectedStore(store);
	};

	const handleStoreAssignment = async () => {
		if (!selectedStore || !agent?.mbeId) return;

		setIsAssigningStore(true);
		try {
			const data = {
				storeId: selectedStore.storeId,
				mbeId: agent.mbeId,
			};

			const result = mainStore?.storeNew
				? await updateAgentStore(data)
				: await assignAgentToStore(data);
			showToast({
				type: "success",
				message: mainStore?.storeNew
					? "Store assignment updated successfully!"
					: "Agent assigned to store successfully!",
				duration: 5000,
			});

			// Refresh agent data
			mutate();
			onStoreModalClose();
			setSelectedStore(null);
		} catch (error: any) {
			console.error("Error assigning store:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message ||
					error?.message ||
					"Failed to assign store",
				duration: 5000,
			});
		} finally {
			setIsAssigningStore(false);
		}
	};

	// Filter stores based on search with enhanced filtering
	const filteredStores = useMemo(() => {
		if (!processedStoresData) return [];

		if (!storeSearchValue || storeSearchValue.trim() === "")
			return processedStoresData;

		const searchTerm = storeSearchValue.toLowerCase().trim();
		return processedStoresData.filter(
			(store: any) =>
				store.storeName?.toLowerCase().includes(searchTerm) ||
				store.address?.toLowerCase().includes(searchTerm) ||
				store.city?.toLowerCase().includes(searchTerm) ||
				store.state?.toLowerCase().includes(searchTerm) ||
				store.storeId?.toLowerCase().includes(searchTerm) ||
				store.partner?.toLowerCase().includes(searchTerm)
		);
	}, [processedStoresData, storeSearchValue]);

	// MBE-specific handlers
	const handleChangeMbeAssignment = async () => {
		if (!hasPermission(role, "canChangeMbeAssignment")) {
			showToast({
				type: "error",
				message: "Access denied: Admin permission required",
				duration: 3000,
			});
			return;
		}

		if (!agent?.mbeId || !selectedMbeForAgent) return;

		try {
			await changeAgentMbeAssignment(agent.mbeId, selectedMbeForAgent.mbeId);

			showToast({
				type: "success",
				message: "MBE assignment changed successfully!",
				duration: 5000,
			});

			// Refresh agent data
			mutate();
			onChangeMbeModalClose();
			setSelectedMbeForAgent(null);
		} catch (error: any) {
			console.error("Error changing MBE assignment:", error);
			showToast({
				type: "error",
				message:
					error?.response?.data?.message || "Failed to change MBE assignment",
				duration: 5000,
			});
		}
	};

	const handleUnlinkMbe = async () => {
		if (!hasPermission(role, "canChangeMbeAssignment")) {
			showToast({
				type: "error",
				message: "Access denied: Admin permission required",
				duration: 3000,
			});
			return;
		}

		if (!agent?.mbeId) return;

		try {
			await unlinkAgentFromMbe(agent.mbeId);

			showToast({
				type: "success",
				message: "Agent unlinked from MBE successfully!",
				duration: 5000,
			});

			// Refresh agent data
			mutate();
			onUnlinkMbeModalClose();
		} catch (error: any) {
			console.error("Error unlinking MBE:", error);
			showToast({
				type: "error",
				message: error?.response?.data?.message || "Failed to unlink MBE",
				duration: 5000,
			});
		}
	};

	const handleReconciliationPageChange = (page: number) => {
		setReconciliationPage(page);
	};

	const handleReconciliationDateFilter = (date: string) => {
		setReconciliationDateFilter(date);
		setReconciliationPage(1); // Reset to first page when filtering
	};

	const handleViewReconciliationDetails = (reconciliation: any) => {
		if (!hasPermission(role, "canViewReconciliationHistory")) {
			showToast({
				type: "error",
				message: "Access denied: Admin permission required",
				duration: 3000,
			});
			return;
		}
		setSelectedReconciliation(reconciliation);
		onReconciliationDetailsModalOpen();
	};

	const handleCloseReconciliationDetails = () => {
		setSelectedReconciliation(null);
		onReconciliationDetailsModalClose();
	};

	// Handle loading state
	if (isLoading) return <LoadingSpinner />;

	// Handle error or not found
	if (error || !agent) {
		return <NotFound onGoBack={() => router.back()} />;
	}

	const kyc = agent.MbeKyc;
	const accountDetails = agent.MbeAccountDetails;
	const mainStore = agent.storesNew;
	const summary = processedPerformanceData.summary;

	const guarantorStatusOptions = [
		{ key: "APPROVED", label: "Approved", color: "success" },
		{ key: "REJECTED", label: "Rejected", color: "danger" },
	];

	const addressStatusOptions = [
		{ key: "APPROVED", label: "Approved", color: "success" },
		{ key: "REJECTED", label: "Rejected", color: "danger" },
	];

	return (
		<div className="min-h-screen bg-default-50">
			{/* Header */}
			<div className="bg-white border-b border-default-200">
				<div className="py-6 px-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="flex items-center gap-3">
								{agent.imageUrl && (
									<>
										<Avatar
											isBordered
											src={agent.imageUrl || "/placeholder.svg"}
											alt={`${agent.firstname} ${agent.lastname}`}
											className="w-12 h-12 cursor-pointer border-2 border-default-200"
											onClick={onOpen}
											color={getStatusColor(agent.accountStatus)}
										/>
										<ImagePreviewModal
											isOpen={isOpen}
											onClose={onClose}
											imageUrl={agent.imageUrl || "/placeholder.svg"}
											title={`${agent.firstname} ${agent.lastname}`}
											alt={`${agent.firstname} ${agent.lastname} - Full preview`}
										/>
									</>
								)}
								<div>
									<h1 className="text-xl font-bold text-default-900">
										{agent.firstname} {agent.lastname}
									</h1>
									<p className="text-sm text-default-500">{agent.role}</p>
								</div>
							</div>
							<div className="flex flex-col items-end gap-2">
								<StatusChip status={agent.accountStatus} />
								{isMbeManaged && (
									<Chip color="primary" size="sm">
										MBE Managed
									</Chip>
								)}
							</div>
						</div>
						{/* Action Buttons - Desktop */}
						<div className="hidden md:flex items-center gap-3">
							<Button
								color="danger"
								variant="light"
								size="sm"
								startContent={<Trash2 className="w-4 h-4" />}
								onPress={onDeleteOpen}
								isDisabled={isDeleting}
							>
								Delete
							</Button>
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
							<Dropdown>
								<DropdownTrigger>
									<div
										className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-default-600 bg-default-100 hover:bg-default-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
										style={{
											pointerEvents: isDeleting ? "none" : "auto",
											opacity: isDeleting ? 0.5 : 1,
										}}
									>
										<MoreVertical className="w-4 h-4" />
									</div>
								</DropdownTrigger>
								<DropdownMenu aria-label="Agent actions">
									<DropdownItem
										key="delete"
										startContent={<Trash2 className="w-4 h-4" />}
										className="text-danger"
										onPress={onDeleteOpen}
									>
										Delete Agent
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
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

			{/* Performance Statistics Cards */}
			{canViewAgentPerformanceData && (
				<div className="px-4 py-6 bg-default-50">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
						<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-primary-100 rounded-lg">
									<CreditCard className="w-6 h-6 text-primary" />
								</div>
								<div>
									<p className="text-sm text-default-500">Total Loans</p>
									<p className="text-2xl font-bold text-default-900">
										{processedPerformanceData.loans.length}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-success-100 rounded-lg">
									<DollarSign className="w-6 h-6 text-success" />
								</div>
								<div>
									<p className="text-sm text-default-500">Total Loan Amount</p>
									<p className="text-2xl font-bold text-default-900">
										₦
										{processedPerformanceData.loans
											.reduce(
												(sum: any, loan: any) => sum + (loan.loanAmount || 0),
												0
											)
											.toLocaleString("en-GB")}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-warning-100 rounded-lg">
									<TrendingUp className="w-6 h-6 text-warning" />
								</div>
								<div>
									<p className="text-sm text-default-500">Total Commissions</p>
									<p className="text-2xl font-bold text-default-900">
										₦{(summary?.totalCommission || 0).toLocaleString("en-GB")}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-secondary-100 rounded-lg">
									<Calendar className="w-6 h-6 text-secondary" />
								</div>
								<div>
									<p className="text-sm text-default-500">Avg Commission</p>
									<p className="text-2xl font-bold text-default-900">
										₦{(summary?.avgCommission || 0).toLocaleString("en-GB")}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={isDeleteOpen}
				onClose={onDeleteClose}
				onConfirm={handleDeleteAgent}
				title="Delete Agent"
				confirmText={isDeleting ? "Deleting..." : "Delete Agent"}
				isLoading={isDeleting}
				variant="danger"
				entity={{
					name: `${agent?.firstname} ${agent?.lastname}`,
					subtitle: agent?.email,
					imageUrl: agent?.imageUrl || "/placeholder.svg",
				}}
				warning={{
					title: "Permanent Deletion Warning",
					message:
						"This action cannot be undone. Deleting this agent will permanently remove:",
					items: [
						"All agent information and records",
						"Associated KYC and account details",
						"Guarantor information",
						"Store assignments and transaction history",
					],
					icon: (
						<Trash2 className="w-5 h-5 text-danger-600 mt-0.5 flex-shrink-0" />
					),
				}}
				additionalInfo={{
					label: "Agent ID",
					value: agent?.mbeId || "",
				}}
			/>

			<div className="px-4 py-8">
				{isMbe ? (
					// MBE-specific layout
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Personal Information and Store */}
						<div className="lg:col-span-1 space-y-6">
							{/* Personal Information */}
							<InfoCard
								title="Personal Information"
								icon={<User className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={true}
							>
								<div className="grid gap-4">
									<InfoField label="MBE ID" value={agent.mbeId} copyable />
									<InfoField label="First Name" value={agent.firstname} />
									<InfoField label="Last Name" value={agent.lastname} />
									<InfoField label="Email" value={agent.email} copyable />
									<InfoField label="Phone" value={agent.phone} copyable />
									<InfoField label="Role" value={agent.role} />
									<InfoField
										label="Account Status"
										value={agent.accountStatus || "N/A"}
										endComponent={<StatusChip status={agent.accountStatus} />}
									/>
									<InfoField
										label="Active Status"
										value={agent.isActive ? "Active" : "Inactive"}
									/>
								</div>
							</InfoCard>

							{/* Store Information */}
							{mainStore?.storeNew && (
								<InfoCard
									title="Store Assignment"
									icon={<Store className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={true}
								>
									<div className="grid gap-4">
										<InfoField
											label="Store Name"
											value={mainStore.storeNew?.storeName || "N/A"}
										/>
										<InfoField
											label="Address"
											value={mainStore.storeNew?.address || "N/A"}
										/>
										<InfoField
											label="City"
											value={mainStore.storeNew?.city || "N/A"}
										/>
										<InfoField
											label="State"
											value={mainStore.storeNew?.state || "N/A"}
										/>
									</div>
								</InfoCard>
							)}
						</div>

						{/* Right Column - MBE-specific content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Reconciliation Statistics */}
							<InfoCard
								title="Reconciliation Statistics"
								icon={<BarChart className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={true}
							>
								{reconciliationStats ? (
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-default-50 rounded-lg p-4">
											<div className="text-sm text-default-500 mb-1">Total</div>
											<div className="text-2xl font-bold text-default-900">
												{reconciliationStats.total}
											</div>
										</div>
										<div className="bg-success-50 rounded-lg p-4">
											<div className="text-sm text-success-600 mb-1">
												Completed
											</div>
											<div className="text-2xl font-bold text-success-700">
												{reconciliationStats.completed}
											</div>
											<div className="text-xs text-success-600">
												{reconciliationStats.statusBreakdown?.completed}%
											</div>
										</div>
										<div className="bg-warning-50 rounded-lg p-4">
											<div className="text-sm text-warning-600 mb-1">
												Pending
											</div>
											<div className="text-2xl font-bold text-warning-700">
												{reconciliationStats.pending}
											</div>
											<div className="text-xs text-warning-600">
												{reconciliationStats.statusBreakdown?.pending}%
											</div>
										</div>
										<div className="bg-danger-50 rounded-lg p-4">
											<div className="text-sm text-danger-600 mb-1">
												Rejected
											</div>
											<div className="text-2xl font-bold text-danger-700">
												{reconciliationStats.rejected}
											</div>
											<div className="text-xs text-danger-600">
												{reconciliationStats.statusBreakdown?.rejected}%
											</div>
										</div>
									</div>
								) : (
									<div className="text-center py-8 text-default-500">
										No reconciliation statistics available
									</div>
								)}
							</InfoCard>

							{/* Assigned Agents */}
							<InfoCard
								title="Assigned Agents"
								icon={<Users className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={true}
							>
								{isLoadingMbeData ? (
									<div className="flex items-center justify-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
										<span className="ml-2 text-default-500">
											Loading assigned agents...
										</span>
									</div>
								) : mbeAssignedAgents && mbeAssignedAgents.length > 0 ? (
									<GenericTable
										columns={[
											{
												name: "Name",
												uid: "name",
												sortable: true,
											},
											{
												name: "Email",
												uid: "email",
												sortable: true,
											},
											{
												name: "Phone",
												uid: "phone",
												sortable: true,
											},
											{
												name: "Agent ID",
												uid: "agentId",
												sortable: true,
											},
											{
												name: "Status",
												uid: "status",
												sortable: true,
											},
											{
												name: "Active",
												uid: "active",
												sortable: true,
											},
											{
												name: "Actions",
												uid: "actions",
												sortable: false,
											},
										]}
										data={mbeAssignedAgents}
										allCount={mbeAssignedAgents.length}
										exportData={mbeAssignedAgents}
										isLoading={isLoadingMbeData}
										selectionMode="multiple"
										selectedKeys={
											selectedAgentFilter
												? new Set([selectedAgentFilter])
												: new Set()
										}
										onSelectionChange={(keys) => {
											const selectedKey = Array.from(keys)[0];
											if (selectedKey) {
												const selectedAgent = mbeAssignedAgents.find(
													(agent: any) => agent.mbeId === selectedKey
												);
												if (selectedAgent) {
													handleAgentSelection(
														selectedAgent.mbeId,
														`${selectedAgent.firstname} ${selectedAgent.lastname}`
													);
												}
											} else {
												// Clear selection
												handleAgentSelection("", "");
											}
										}}
										filterValue=""
										onFilterChange={() => {}}
										sortDescriptor={{ column: "name", direction: "ascending" }}
										onSortChange={() => {}}
										page={1}
										pages={1}
										onPageChange={() => {}}
										exportFn={async () => {}}
										renderCell={(agent: any, columnKey: string) => {
											switch (columnKey) {
												case "name":
													return (
														<div className="flex items-center gap-3">
															<div>
																<div className="font-medium">
																	{agent.firstname} {agent.lastname}
																</div>
																{selectedAgentFilter === agent.mbeId && (
																	<span className="text-xs bg-primary-500 text-white px-2 py-1 rounded">
																		Filtered
																	</span>
																)}
															</div>
														</div>
													);
												case "email":
													return agent.email;
												case "phone":
													return agent.phone;
												case "agentId":
													return (
														<Snippet size="sm" symbol="">
															{agent.mbeId}
														</Snippet>
													);
												case "status":
													return <StatusChip status={agent.accountStatus} />;
												case "active":
													return (
														<Chip
															size="sm"
															color={agent.isActive ? "success" : "danger"}
															variant="flat"
														>
															{agent.isActive ? "Active" : "Inactive"}
														</Chip>
													);
												case "actions":
													return (
														<Dropdown>
															<DropdownTrigger>
																<Button variant="light" size="sm" isIconOnly>
																	<MoreVertical className="w-4 h-4" />
																</Button>
															</DropdownTrigger>
															<DropdownMenu>
																<DropdownItem
																	key="view"
																	onPress={() =>
																		router.push(
																			`/access/${role}/staff/agents/${agent.mbeId}`
																		)
																	}
																	startContent={<Eye className="w-4 h-4" />}
																>
																	View Agent
																</DropdownItem>
															</DropdownMenu>
														</Dropdown>
													);
												default:
													return null;
											}
										}}
										hasNoRecords={mbeAssignedAgents.length === 0}
									/>
								) : (
									<div className="text-center py-8 text-default-500">
										No agents assigned to this MBE
									</div>
								)}
							</InfoCard>

							{/* Reconciliation History */}
							{hasPermission(role, "canViewReconciliationHistory") && (
								<InfoCard
									title="Reconciliation History"
									icon={<Clock className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={true}
								>
									<div className="space-y-4">
										{/* Filter Status */}
										{selectedAgentFilter && (
											<div className="flex items-center justify-between bg-primary-50 p-3 rounded-lg">
												<span className="text-sm text-primary-700">
													🔍 Showing reconciliation history for selected agent
												</span>
												<Button
													size="sm"
													variant="flat"
													color="default"
													onPress={() => {
														setSelectedAgentFilter(null);
														setReconciliationPage(1);
													}}
												>
													Clear Filter
												</Button>
											</div>
										)}

										{/* Date Filter */}
										<div className="flex gap-2 items-end">
											<DatePicker
												label="Filter by Date"
												value={
													reconciliationDateFilter
														? parseDate(reconciliationDateFilter)
														: null
												}
												onChange={(date) => {
													if (date) {
														const dateString = date.toString();
														handleReconciliationDateFilter(dateString);
													} else {
														handleReconciliationDateFilter("");
													}
												}}
												className="max-w-[200px]"
												size="sm"
											/>
											<Button
												variant="flat"
												size="sm"
												onPress={() => handleReconciliationDateFilter("")}
											>
												Clear
											</Button>
										</div>

										{/* Reconciliation History Table */}
										{reconciliationHistory?.data ? (
											<GenericTable
												columns={reconciliationColumns}
												data={reconciliationHistory.data || []}
												allCount={
													reconciliationHistory.pagination?.totalItems || 0
												}
												exportData={reconciliationHistory.data || []}
												isLoading={isLoadingMbeData}
												filterValue={reconciliationFilterValue}
												onFilterChange={setReconciliationFilterValue}
												sortDescriptor={reconciliationSortDescriptor}
												onSortChange={setReconciliationSortDescriptor}
												page={
													reconciliationHistory.pagination?.currentPage || 1
												}
												pages={
													reconciliationHistory.pagination?.totalPages || 1
												}
												onPageChange={(page) => setReconciliationPage(page)}
												exportFn={exportReconciliationData}
												renderCell={renderReconciliationCell}
												hasNoRecords={
													(reconciliationHistory?.data?.length || 0) === 0
												}
												searchPlaceholder="Search reconciliation records..."
												showRowsPerPageSelector={false}
												rowsPerPageOptions={[10]}
												defaultRowsPerPage={10}
											/>
										) : (
											<div className="text-center py-8 text-default-500">
												No reconciliation history available
											</div>
										)}
									</div>
								</InfoCard>
							)}
						</div>
					</div>
				) : (
					// Regular agent layout
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Personal Information */}
						<div className="lg:col-span-1 space-y-6">
							{/* Personal Information */}
							<InfoCard
								title="Personal Information"
								icon={<User className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={true}
							>
								<div className="grid gap-4">
									<InfoField label="Agent ID" value={agent.mbeId} copyable />
									{/* MBE Management Section for MBE-managed agents */}
									{isMbeManaged ? (
										<InfoField
											label="Current MBE"
											value={agent.assignedMbeId || "Not specified"}
											endComponent={
												hasPermission(role, "canChangeMbeAssignment") ? (
													<div className="flex gap-2">
														<Button
															size="sm"
															variant="flat"
															color="warning"
															onPress={onChangeMbeModalOpen}
														>
															Change MBE
														</Button>
														<Button
															size="sm"
															variant="flat"
															color="danger"
															onPress={onUnlinkMbeModalOpen}
														>
															Unlink MBE
														</Button>
													</div>
												) : (
													<div className="text-sm text-default-500">
														Admin access required
													</div>
												)
											}
										/>
									) : (
										<InfoField
											label="MBE ID"
											value=""
											endComponent={
												<Button
													size="sm"
													variant="flat"
													color="primary"
													onPress={onChangeMbeModalOpen}
												>
													Link MBE
												</Button>
											}
										/>
									)}
									<InfoField
										endComponent={
											<div className="flex gap-2">
												{agent?.userId && (
													<Button
														variant="flat"
														color="primary"
														size="sm"
														onPress={() => {
															router.push(
																`/access/${role}/staff/scan-partners/${agent.userId}`
															);
														}}
														className="font-medium"
													>
														View Details
													</Button>
												)}
												{canChangeScanPartner && (
													<Button
														variant="flat"
														color={agent?.userId ? "warning" : "success"}
														size="sm"
														onPress={onScanPartnerModalOpen}
														className="font-medium"
													>
														{agent?.userId
															? "Change Partner"
															: "Assign Partner"}
													</Button>
												)}
											</div>
										}
										label="SCAN Partner ID"
										value={agent?.userId || "No partner assigned"}
										copyable={!!agent?.userId}
									/>
									<InfoField
										label="Full Name"
										value={`${agent.firstname} ${agent.lastname}`.trim()}
									/>
									<InfoField label="Email" value={agent.email} />
									<InfoField label="Phone" value={agent.phone} />
									<InfoField label="BVN" value={agent.bvn} />
									<InfoField label="BVN Phone" value={agent.bvnPhoneNumber} />
									<InfoField label="Date of Birth" value={agent.dob} />
									<InfoField label="Username" value={agent.username} />
									<InfoField label="Channel" value={agent.channel} />
									<InfoField
										label="State"
										value={agent.state || agent?.MbeKyc?.state}
									/>
									<InfoField
										label="City"
										value={agent.city || agent?.MbeKyc?.city}
									/>
									<InfoField
										label="Active Status"
										value={agent.isActive ? "Active" : "Inactive"}
									/>
									<InfoField
										label="Created At"
										value={
											agent.createdAt
												? new Date(agent.createdAt).toLocaleString("en-GB")
												: null
										}
									/>
									<InfoField
										label="Updated At"
										value={
											agent.updatedAt
												? new Date(agent.updatedAt).toLocaleString("en-GB")
												: null
										}
									/>
								</div>
							</InfoCard>

							{/* Statistics */}
							<InfoCard
								title="Statistics"
								icon={<Users className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={false}
							>
								<div className="grid gap-4">
									<InfoField
										label="Customers Count"
										value={agent.customersCount?.toString()}
									/>
									<InfoField
										label="Has an Assigned Store"
										value={mainStore ? "Yes" : "No"}
									/>
								</div>
							</InfoCard>
						</div>

						{/* Right Column - Detailed Information */}
						<div className="lg:col-span-2 space-y-6">
							{/* Current Scan Partner Details */}
							{agent?.userId && currentScanPartnerDetails && (
								<InfoCard
									title="Current Scan Partner"
									icon={<IoBusiness className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<InfoField
											label="Partner Name"
											value={`${currentScanPartnerDetails.firstName || ""} ${
												currentScanPartnerDetails.lastName || ""
											}`.trim()}
										/>
										<InfoField
											label="Company"
											value={currentScanPartnerDetails.companyName || "N/A"}
										/>
										<InfoField
											label="Email"
											value={currentScanPartnerDetails.email || "N/A"}
										/>
										<InfoField
											label="Phone"
											value={currentScanPartnerDetails.telephoneNumber || "N/A"}
										/>
										<InfoField
											label="State"
											value={currentScanPartnerDetails.companyState || "N/A"}
										/>
										<InfoField
											label="City"
											value={currentScanPartnerDetails.companyCity || "N/A"}
										/>
									</div>
								</InfoCard>
							)}

							{/* Reconciliation History for all agents */}
							{hasPermission(role, "canViewReconciliationHistory") && (
								<InfoCard
									title="Reconciliation History"
									icon={<Clock className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<div className="space-y-4">
										{/* Date Filter */}
										<div className="flex gap-2 items-end">
											<DatePicker
												label="Filter by Date"
												value={
													reconciliationDateFilter
														? parseDate(reconciliationDateFilter)
														: null
												}
												onChange={(date) => {
													if (date) {
														const dateString = date.toString();
														handleReconciliationDateFilter(dateString);
													} else {
														handleReconciliationDateFilter("");
													}
												}}
												className="max-w-[200px]"
												size="sm"
											/>
											<Button
												variant="flat"
												size="sm"
												onPress={() => handleReconciliationDateFilter("")}
											>
												Clear
											</Button>
										</div>

										{/* Reconciliation Table */}
										{reconciliationHistory?.data?.length > 0 ||
										(Array.isArray(reconciliationHistory) &&
											reconciliationHistory.length > 0) ? (
											<GenericTable
												columns={[
													{
														name: "ID",
														uid: "id",
														sortable: true,
													},
													{
														name: "Agent",
														uid: "agent",
														sortable: true,
													},
													{
														name: "Target Warehouse",
														uid: "targetWarehouse",
														sortable: true,
													},
													{
														name: "Items",
														uid: "items",
														sortable: true,
													},
													{
														name: "Status",
														uid: "status",
														sortable: true,
													},
													{
														name: "Date",
														uid: "date",
														sortable: true,
													},
													{
														name: "Actions",
														uid: "actions",
														sortable: false,
													},
												]}
												data={reconciliationHistory?.data || []}
												allCount={reconciliationHistory?.data?.length || 0}
												exportData={reconciliationHistory?.data || []}
												isLoading={false}
												filterValue=""
												onFilterChange={() => {}}
												sortDescriptor={{
													column: "date",
													direction: "descending",
												}}
												onSortChange={() => {}}
												page={reconciliationPage}
												pages={
													reconciliationHistory?.pagination?.totalPages || 1
												}
												onPageChange={handleReconciliationPageChange}
												exportFn={async () => {}}
												statusOptions={[
													{ name: "All", uid: "all" },
													{ name: "Pending", uid: "pending" },
													{ name: "Completed", uid: "completed" },
													{ name: "Rejected", uid: "rejected" },
												]}
												statusFilter={new Set(["all"])}
												onStatusChange={() => {}}
												statusColorMap={{
													pending: "warning",
													completed: "success",
													rejected: "danger",
												}}
												showStatus={true}
												renderCell={(record: any, columnKey: string) => {
													switch (columnKey) {
														case "id":
															return (
																<Snippet size="sm" symbol="">
																	{record.reconciliationId}
																</Snippet>
															);
														case "agent":
															return record.agent?.name || "N/A";
														case "targetWarehouse":
															return record.targetWarehouse || "N/A";
														case "items":
															return record.transferItems?.length || 0;
														case "status":
															return <StatusChip status={record.status} />;
														case "date":
															return new Date(
																record.createdAt
															).toLocaleDateString();
														case "actions":
															return (
																<Dropdown>
																	<DropdownTrigger>
																		<Button
																			variant="light"
																			size="sm"
																			isIconOnly
																		>
																			<MoreVertical className="w-4 h-4" />
																		</Button>
																	</DropdownTrigger>
																	<DropdownMenu>
																		<DropdownItem
																			key="view"
																			onPress={() =>
																				handleViewReconciliationDetails(record)
																			}
																			startContent={<Eye className="w-4 h-4" />}
																		>
																			View Details
																		</DropdownItem>
																	</DropdownMenu>
																</Dropdown>
															);
														default:
															return null;
													}
												}}
												hasNoRecords={
													(reconciliationHistory?.data?.length ||
														reconciliationHistory?.length ||
														0) === 0
												}
											/>
										) : (
											<div className="text-center py-8 text-default-500">
												No reconciliation history available
											</div>
										)}
									</div>
								</InfoCard>
							)}

							{/* Performance Data */}
							{canViewAgentPerformanceData && (
								<InfoCard
									title="Performance Data"
									icon={<TrendingUp className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
									headerContent={
										<ButtonGroup size="sm" variant="flat">
											<Button
												color={
													performanceViewType === "loans"
														? "primary"
														: "default"
												}
												onPress={() => setPerformanceViewType("loans")}
												startContent={<CreditCard className="w-4 h-4" />}
											>
												Loans ({processedPerformanceData.loans.length})
											</Button>
											<Button
												color={
													performanceViewType === "commissions"
														? "primary"
														: "default"
												}
												onPress={() => setPerformanceViewType("commissions")}
												startContent={<DollarSign className="w-4 h-4" />}
											>
												Commissions (
												{processedPerformanceData.commissions.length})
											</Button>
										</ButtonGroup>
									}
								>
									{performanceLoading ? (
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
										</div>
									) : (
										<>
											{/* Loans View */}
											{performanceViewType === "loans" && (
												<>
													{filteredLoans.length > 0 ? (
														<div className="space-y-4">
															<div className="flex items-center justify-between mb-4">
																<p className="text-sm text-default-600">
																	Loan records for this agent
																</p>
																<Chip size="sm" variant="flat" color="primary">
																	{filteredLoans.length} Loan
																	{filteredLoans.length !== 1 ? "s" : ""}
																</Chip>
															</div>
															<GenericTable<LoanRecord | any>
																columns={loanColumns}
																data={filteredLoans}
																allCount={filteredLoans.length}
																exportData={filteredLoans}
																isLoading={performanceLoading}
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
																sortDescriptor={{
																	column: "createdAt",
																	direction: "descending",
																}}
																onSortChange={() => {}}
																page={loanPage}
																pages={
																	Math.ceil(filteredLoans.length / 10) || 1
																}
																onPageChange={setLoanPage}
																exportFn={
																	role == "scan-partner "
																		? exportLoans
																		: (data) => {
																				console.log("exported");
																		  }
																}
																renderCell={(loan, key) =>
																	renderLoanCell(loan, key, router, role)
																}
																hasNoRecords={filteredLoans.length === 0}
															/>
														</div>
													) : (
														<EmptyState
															title="No Loans Found"
															description="This agent has no loan records."
															icon={
																<CreditCard className="w-6 h-6 text-default-400" />
															}
														/>
													)}
												</>
											)}

											{/* Commissions View */}
											{performanceViewType === "commissions" && (
												<>
													{filteredCommissions.length > 0 ? (
														<div className="space-y-4">
															<div className="flex items-center justify-between mb-4">
																<p className="text-sm text-default-600">
																	Commission records for this agent
																</p>
																<Chip size="sm" variant="flat" color="primary">
																	{filteredCommissions.length} Commission
																	{filteredCommissions.length !== 1 ? "s" : ""}
																</Chip>
															</div>
															<GenericTable<CommissionRecord | any>
																columns={commissionColumns}
																data={filteredCommissions}
																allCount={filteredCommissions.length}
																exportData={filteredCommissions}
																isLoading={performanceLoading}
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
																sortDescriptor={{
																	column: "date_created",
																	direction: "descending",
																}}
																onSortChange={() => {}}
																page={commissionPage}
																pages={
																	Math.ceil(filteredCommissions.length / 10) ||
																	1
																}
																onPageChange={setCommissionPage}
																exportFn={
																	role == "scan-partner "
																		? exportCommissions
																		: (data) => {
																				console.log("exported");
																		  }
																}
																renderCell={renderCommissionCell}
																hasNoRecords={filteredCommissions.length === 0}
															/>
														</div>
													) : (
														<EmptyState
															title="No Commissions Found"
															description="This agent has no commission records."
															icon={
																<DollarSign className="w-6 h-6 text-default-400" />
															}
														/>
													)}
												</>
											)}
										</>
									)}
								</InfoCard>
							)}

							{/* Agent Devices */}
							<InfoCard
								title="Agent Devices"
								icon={<Smartphone className="w-5 h-5 text-default-600" />}
								collapsible={true}
								defaultExpanded={false}
							>
								{devicesLoading ? (
									<div className="flex items-center justify-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
									</div>
								) : devices && devices.length > 0 ? (
									<div className="space-y-4">
										{/* Controls */}
										<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
											<div className="flex items-center gap-4">
												<p className="text-sm text-default-600">
													Devices assigned to this agent
												</p>
												<Chip size="sm" variant="flat" color="primary">
													{devices.length} Device
													{devices.length !== 1 ? "s" : ""}
												</Chip>
											</div>
											<div className="flex items-center gap-3">
												<DatePicker
													label="Filter by Date"
													value={deviceDate ? parseDate(deviceDate) : null}
													onChange={(date) => {
														if (date) {
															const dateString = date.toString();
															setDeviceDate(dateString);
														} else {
															setDeviceDate("");
														}
													}}
													className="max-w-[200px]"
													size="sm"
												/>
												<ButtonGroup size="sm" variant="flat">
													<Button
														variant={
															deviceViewMode === "card" ? "solid" : "flat"
														}
														color={
															deviceViewMode === "card" ? "primary" : "default"
														}
														onPress={() => setDeviceViewMode("card")}
														startContent={<Grid3X3 className="w-4 h-4" />}
													>
														Cards
													</Button>
													<Button
														variant={
															deviceViewMode === "table" ? "solid" : "flat"
														}
														color={
															deviceViewMode === "table" ? "primary" : "default"
														}
														onPress={() => setDeviceViewMode("table")}
														startContent={<List className="w-4 h-4" />}
													>
														Table
													</Button>
												</ButtonGroup>
											</div>
										</div>

										{/* Content */}
										{deviceViewMode === "card" ? (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												{devices.map((device, index) => (
													<div
														key={device.newDeviceId || index}
														className="p-4 border border-default-200 rounded-lg hover:shadow-md transition-shadow"
													>
														<div className="flex items-center gap-3 mb-3">
															{device.imageLink ? (
																<Image
																	src={device.imageLink}
																	alt={device.deviceName}
																	width={50}
																	height={50}
																	className="rounded-lg object-cover"
																/>
															) : (
																<div className="w-12 h-12 bg-default-200 rounded-lg flex items-center justify-center">
																	<Smartphone className="w-6 h-6 text-default-400" />
																</div>
															)}
															<div className="flex-1">
																<h4 className="font-semibold text-sm text-default-900">
																	{device.deviceName}
																</h4>
																<p className="text-xs text-default-500">
																	{device.deviceManufacturer}
																</p>
															</div>
														</div>
														<div className="space-y-2 text-xs">
															<div className="flex justify-between">
																<span className="text-default-500">Price:</span>
																<span className="font-medium">
																	₦{device.price?.toLocaleString("en-GB")}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-default-500">RAM:</span>
																<span>{device.deviceRam || "N/A"}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-default-500">
																	Storage:
																</span>
																<span>{device.deviceStorage || "N/A"}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-default-500">
																	Serial:
																</span>
																<span className="font-mono text-xs">
																	{device.erpSerialNo}
																</span>
															</div>
														</div>
														<Button
															size="sm"
															variant="flat"
															color="primary"
															className="w-full mt-3"
															onPress={() => {
																setSelectedDevice(device);
																onDeviceModalOpen();
															}}
															startContent={<Eye className="w-3 h-3" />}
														>
															View Details
														</Button>
													</div>
												))}
											</div>
										) : (
											<div className="overflow-x-auto">
												<Table aria-label="Agent devices table">
													<TableHeader>
														<TableColumn>DEVICE</TableColumn>
														<TableColumn>MANUFACTURER</TableColumn>
														<TableColumn>PRICE</TableColumn>
														<TableColumn>SPECS</TableColumn>
														<TableColumn>STATUS</TableColumn>
														<TableColumn>ACTIONS</TableColumn>
													</TableHeader>
													<TableBody>
														{devices.map((device, index) => (
															<TableRow key={device.newDeviceId || index}>
																<TableCell>
																	<div className="flex items-center gap-3">
																		{device.imageLink ? (
																			<Image
																				src={device.imageLink}
																				alt={device.deviceName}
																				width={40}
																				height={40}
																				className="rounded object-cover"
																			/>
																		) : (
																			<div className="w-10 h-10 bg-default-200 rounded flex items-center justify-center">
																				<Smartphone className="w-5 h-5 text-default-400" />
																			</div>
																		)}
																		<div>
																			<p className="font-medium text-sm">
																				{device.deviceName}
																			</p>
																			<p className="text-xs text-default-500">
																				{device.deviceModelNumber}
																			</p>
																		</div>
																	</div>
																</TableCell>
																<TableCell>
																	<span className="capitalize">
																		{device.deviceManufacturer}
																	</span>
																</TableCell>
																<TableCell>
																	<span className="font-medium">
																		₦{device.price?.toLocaleString("en-GB")}
																	</span>
																</TableCell>
																<TableCell>
																	<div className="text-xs">
																		<p>{device.deviceRam} RAM</p>
																		<p>{device.deviceStorage} Storage</p>
																	</div>
																</TableCell>
																<TableCell>
																	<Chip
																		size="sm"
																		color={
																			device.devfinStatus
																				? "success"
																				: "warning"
																		}
																		variant="flat"
																	>
																		{device.devfinStatus
																			? "Active"
																			: "Inactive"}
																	</Chip>
																</TableCell>
																<TableCell>
																	<Button
																		size="sm"
																		variant="flat"
																		onPress={() => {
																			setSelectedDevice(device);
																			onDeviceModalOpen();
																		}}
																		startContent={<Eye className="w-3 h-3" />}
																	>
																		View
																	</Button>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										)}
									</div>
								) : (
									<EmptyState
										title="No Devices Found"
										description={`No devices found for ${deviceDate}. Try selecting a different date.`}
										icon={<Smartphone className="w-6 h-6 text-default-400" />}
									/>
								)}
							</InfoCard>

							{/* Main Store Information */}
							{mainStore?.storeNew ? (
								<InfoCard
									title="Assigned Store"
									icon={<Store className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<div className="space-y-4">
										<div className="flex items-start justify-between">
											<div>
												<h4 className="text-lg font-semibold text-default-900 mb-1">
													{mainStore.storeNew.storeName}
												</h4>
												<div className="flex items-center gap-2 text-sm text-default-500">
													<Button
														as="a"
														href={`https://www.google.com/maps?q=${mainStore.storeNew.latitude},${mainStore.storeNew.longitude}`}
														target="_blank"
														rel="noopener noreferrer"
														variant="light"
														size="sm"
														className="gap-1 text-sm text-primary hover:underline pl-0"
														startContent={<MapPin className="w-4 h-4" />}
													>
														{mainStore.storeNew.city},{" "}
														{mainStore.storeNew.state}
													</Button>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Chip
													color={
														mainStore.storeNew.isArchived ? "danger" : "success"
													}
													variant="flat"
													size="sm"
												>
													{mainStore.storeNew.isArchived
														? "Archived"
														: "Active"}
												</Chip>
												<Button
													variant="flat"
													color="warning"
													size="sm"
													onPress={onStoreModalOpen}
													className="font-medium"
												>
													Change Store
												</Button>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<InfoField
												label="Store ID"
												value={mainStore.storeNew.storeId}
												copyable
											/>
											<InfoField
												label="Store ERP ID"
												value={mainStore.storeNew.storeErpId}
												copyable
											/>
											<InfoField
												label="Old Store ID"
												value={mainStore.storeNew.storeOldId?.toString()}
											/>
											<InfoField
												label="Partner"
												value={mainStore.storeNew.partner}
											/>
											<InfoField
												label="Channel"
												value={mainStore.storeNew.channel}
											/>
											<InfoField
												label="Cluster ID"
												value={mainStore.storeNew.clusterId?.toString()}
											/>
											<InfoField
												label="Region"
												value={mainStore.storeNew.region}
											/>
										</div>
										<div className="grid grid-cols-1 gap-4">
											<InfoField
												label="Address"
												value={mainStore.storeNew.address}
											/>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<InfoField
												label="Phone Number"
												value={mainStore.storeNew.phoneNumber}
											/>
											<InfoField
												label="Email"
												value={mainStore.storeNew.storeEmail}
											/>
										</div>
										<div className="bg-default-50 rounded-lg p-4">
											<h5 className="font-semibold text-default-900 mb-3 flex items-center gap-2">
												<CreditCard className="w-4 h-4" />
												Bank Details
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<InfoField
													label="Account Name"
													value={mainStore.storeNew.accountName}
												/>
												<InfoField
													label="Account Number"
													value={mainStore.storeNew.accountNumber}
													copyable
												/>
												<InfoField
													label="Bank Name"
													value={mainStore.storeNew.bankName}
												/>
												<InfoField
													label="Bank Code"
													value={mainStore.storeNew.bankCode}
												/>
											</div>
										</div>
										<div className="bg-default-50 rounded-lg p-4">
											<h5 className="font-semibold text-default-900 mb-3 flex items-center gap-2">
												<Clock className="w-4 h-4" />
												Operating Hours
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<InfoField
													label="Opening Time"
													value={mainStore.storeNew.storeOpen}
												/>
												<InfoField
													label="Closing Time"
													value={mainStore.storeNew.storeClose}
												/>
											</div>
										</div>
										<div className="bg-default-50 rounded-lg p-4">
											<div className="flex items-center justify-between mb-3">
												<h5 className="font-semibold text-default-900 flex items-center gap-2">
													<MapPin className="w-4 h-4" />
													Location Details
												</h5>
												{mainStore.storeNew.latitude &&
													mainStore.storeNew.longitude && (
														<Button
															variant="flat"
															color="primary"
															size="sm"
															startContent={<MapPin className="w-4 h-4" />}
															onPress={() => {
																const mapsUrl = `https://www.google.com/maps?q=${mainStore.storeNew.latitude},${mainStore.storeNew.longitude}`;
																window.open(mapsUrl, "_blank");
															}}
															className="font-medium"
														>
															View on Google Maps
														</Button>
													)}
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<InfoField
													label="Latitude"
													value={mainStore.storeNew.latitude?.toString()}
												/>
												<InfoField
													label="Longitude"
													value={mainStore.storeNew.longitude?.toString()}
												/>
												<InfoField
													label="Created At"
													value={
														mainStore.storeNew.createdAt
															? new Date(
																	mainStore.storeNew.createdAt
															  ).toLocaleString("en-GB")
															: null
													}
												/>
												<InfoField
													label="Updated At"
													value={
														mainStore.storeNew.updatedAt
															? new Date(
																	mainStore.storeNew.updatedAt
															  ).toLocaleString("en-GB")
															: null
													}
												/>
											</div>
										</div>
									</div>
								</InfoCard>
							) : (
								<InfoCard
									title="Assigned Store"
									icon={<Store className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
									headerContent={
										<Button
											variant="flat"
											color="success"
											size="sm"
											onPress={onStoreModalOpen}
											className="font-medium"
										>
											Assign Store
										</Button>
									}
								>
									<EmptyState
										title="No Store Assigned"
										description="This agent has not been assigned to any store yet."
										icon={<Store className="w-6 h-6 text-default-400" />}
									/>
								</InfoCard>
							)}

							{/* KYC Information */}
							{kyc ? (
								<InfoCard
									title="KYC Information"
									icon={<User className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<InfoField label="KYC ID" value={kyc.kycId} copyable />
										<InfoField label="Gender" value={kyc.gender} />
										<InfoField label="House Number" value={kyc.houseNumber} />
										<InfoField
											label="Street Address"
											value={kyc.streetAddress}
										/>
										<InfoField label="Landmark" value={kyc.landMark} />
										<InfoField
											label="Local Government"
											value={kyc.localGovernment}
										/>
										<InfoField label="State" value={kyc.state} />
										<InfoField label="City" value={kyc.city} />
										<InfoField label="Channel" value={kyc.channel} />
										<InfoField
											label="Created At"
											value={
												kyc.createdAt
													? new Date(kyc.createdAt).toLocaleString("en-GB")
													: null
											}
										/>
										<InfoField
											label="Updated At"
											value={
												kyc.updatedAt
													? new Date(kyc.updatedAt).toLocaleString("en-GB")
													: null
											}
										/>
									</div>
									<div className="mt-4">
										<InfoField
											label="Full Address"
											value={kyc.fullAddress}
											endComponent={
												canUpdateAddressStatus &&
												canChangeScanPartner && (
													<div className="flex items-center gap-2">
														<AddressStatusChip
															status={kyc.addressStatus || "PENDING"}
														/>
														<Dropdown>
															<DropdownTrigger>
																<Button
																	variant="flat"
																	size="sm"
																	endContent={
																		<ChevronDown className="w-4 h-4" />
																	}
																	isDisabled={isUpdatingAddress === kyc.kycId}
																	isLoading={isUpdatingAddress === kyc.kycId}
																>
																	Update Status
																</Button>
															</DropdownTrigger>
															<DropdownMenu
																aria-label="Address status actions"
																onAction={(key) =>
																	handleAddressStatusUpdate(
																		kyc.kycId,
																		key as string
																	)
																}
															>
																{addressStatusOptions.map((option) => (
																	<DropdownItem
																		key={option.key}
																		className={`text-${option.color}`}
																		color={option.color as any}
																	>
																		{option.label}
																	</DropdownItem>
																))}
															</DropdownMenu>
														</Dropdown>
													</div>
												)
											}
										/>
									</div>
								</InfoCard>
							) : (
								<InfoCard
									title="KYC Information"
									icon={<User className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<EmptyState
										title="No KYC Information"
										description="This agent has not completed their KYC verification yet."
										icon={<User className="w-6 h-6 text-default-400" />}
									/>
								</InfoCard>
							)}

							{/* Account Details */}
							{accountDetails ? (
								<InfoCard
									title="Bank Account Details"
									icon={<CreditCard className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<InfoField
											label="Account Details ID"
											value={accountDetails.mbeAccountDetailsId}
											copyable
										/>
										<InfoField
											label="Account Name"
											value={accountDetails.accountName}
										/>
										<InfoField
											label="Account Number"
											value={accountDetails.accountNumber}
											copyable
										/>
										<InfoField
											label="Bank Name"
											value={accountDetails.bankName}
										/>
										<InfoField
											label="Bank Code"
											value={accountDetails.bankCode}
										/>
										<InfoField
											label="Recipient Code"
											value={accountDetails.recipientCode}
											copyable
										/>
										<InfoField
											label="VFD Bank Code"
											value={accountDetails.vfdBankCode}
										/>
										<InfoField
											label="VFD Bank Name"
											value={accountDetails.vfdBankName}
										/>
										<InfoField label="Channel" value={accountDetails.channel} />
										<InfoField
											label="Created At"
											value={
												accountDetails.createdAt
													? new Date(accountDetails.createdAt).toLocalString(
															"en-GB"
													  )
													: null
											}
										/>
										<InfoField
											label="Updated At"
											value={
												accountDetails.updatedAt
													? new Date(accountDetails.updatedAt).toLocalString(
															"en-GB"
													  )
													: null
											}
										/>
									</div>
								</InfoCard>
							) : (
								<InfoCard
									title="Bank Account Details"
									icon={<CreditCard className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<EmptyState
										title="No Bank Account Details"
										description="This agent has not provided their bank account information yet."
										icon={<CreditCard className="w-6 h-6 text-default-400" />}
									/>
								</InfoCard>
							)}

							{/* Guarantors Information */}
							{agent.MbeGuarantor && agent.MbeGuarantor.length > 0 ? (
								<InfoCard
									title="Guarantors Information"
									icon={<Users className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<div className="space-y-6">
										{canUpdateGuarantorStatus &&
											agent.MbeGuarantor.map((guarantor, index) => (
												<div
													key={guarantor.guarantorid}
													className="bg-default-50 rounded-lg p-4"
												>
													<div className="flex items-center justify-between mb-4">
														<h4 className="font-semibold text-default-900">
															Guarantor {index + 1}
														</h4>
														<div className="flex items-center gap-2">
															<GuarantorStatusChip
																status={guarantor.guarantorStatus}
															/>
															<Dropdown>
																<DropdownTrigger>
																	<Button
																		variant="flat"
																		size="sm"
																		endContent={
																			<ChevronDown className="w-4 h-4" />
																		}
																		isDisabled={
																			isUpdatingGuarantor ===
																			guarantor.guarantorid
																		}
																		isLoading={
																			isUpdatingGuarantor ===
																			guarantor.guarantorid
																		}
																	>
																		Update Status
																	</Button>
																</DropdownTrigger>
																<DropdownMenu
																	aria-label="Guarantor status actions"
																	onAction={(key) => {
																		const action = key as string;
																		if (action === "APPROVED") {
																			handleGuarantorActionStart(
																				guarantor,
																				"approve"
																			);
																		} else if (action === "REJECTED") {
																			handleGuarantorActionStart(
																				guarantor,
																				"reject"
																			);
																		}
																	}}
																>
																	{guarantorStatusOptions.map((option) => (
																		<DropdownItem
																			key={option.key}
																			className={`text-${option.color}`}
																			color={option.color as any}
																		>
																			{option.label}
																		</DropdownItem>
																	))}
																</DropdownMenu>
															</Dropdown>
														</div>
													</div>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<InfoField
															label="Guarantor ID"
															value={guarantor.guarantorid}
															copyable
														/>
														<InfoField
															label="Name"
															value={guarantor.guarantorName}
														/>
														<InfoField
															label="Phone"
															value={guarantor.guarantorPhone}
														/>
														<InfoField
															label="Relationship"
															value={guarantor.guarantorRelationship}
														/>
														<InfoField
															label="Created At"
															value={
																guarantor.createdAt
																	? new Date(guarantor.createdAt).toLocalString(
																			"en-GB"
																	  )
																	: null
															}
														/>
														<InfoField
															label="Updated At"
															value={
																guarantor.updatedAt
																	? new Date(guarantor.updatedAt).toLocalString(
																			"en-GB"
																	  )
																	: null
															}
														/>
														{guarantor.comment && (
															<InfoField
																label="Comment/Reason"
																value={guarantor.comment}
															/>
														)}
													</div>
													<div className="mt-4">
														<InfoField
															label="Address"
															value={guarantor.guarantorAddress}
														/>
													</div>
												</div>
											))}
									</div>
								</InfoCard>
							) : (
								<InfoCard
									title="Guarantors Information"
									icon={<Users className="w-5 h-5 text-default-600" />}
									collapsible={true}
									defaultExpanded={false}
								>
									<EmptyState
										title="No Guarantors"
										description="This agent has not provided any guarantor information yet."
										icon={<Users className="w-6 h-6 text-default-400" />}
									/>
								</InfoCard>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Scan Partner Change Modal */}
			<FormModal
				isOpen={isScanPartnerModalOpen}
				onClose={onScanPartnerModalClose}
				onSubmit={handleScanPartnerChange}
				title={agent?.userId ? "Change Scan Partner" : "Assign Scan Partner"}
				description={
					agent?.userId
						? `Select a new scan partner for ${agent?.firstname} ${agent?.lastname}`
						: `Assign a scan partner to ${agent?.firstname} ${agent?.lastname}`
				}
				submitText={
					isChangingScanPartner
						? "Updating..."
						: agent?.userId
						? "Change Partner"
						: "Assign Partner"
				}
				isLoading={isChangingScanPartner}
				isSubmitDisabled={!selectedScanPartner}
				size="lg"
			>
				<SelectionWithPreview
					label="Select New Scan Partner"
					placeholder="Choose a scan partner..."
					options={scanPartners.map((partner) => ({
						value: partner.userId,
						label:
							`${partner.firstName || ""} ${partner.lastName || ""}`.trim() +
							` - ${partner.companyName || "N/A"}`,
					}))}
					selectedValue={selectedScanPartner?.userId}
					onSelectionChange={handleScanPartnerSelect}
					isDisabled={scanPartners.length === 0}
					warning={{
						message:
							"Select a new scan partner to assign or change the current assignment.",
						currentValue: agent?.userId || "Not assigned",
					}}
					previewData={scanPartnerDetails}
					renderPreview={(data) => (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<p className="text-sm text-default-600">Name</p>
								<p className="font-medium">
									{data.firstName || ""} {data.lastName || ""}
								</p>
							</div>
							<div>
								<p className="text-sm text-default-600">Company</p>
								<p className="font-medium">{data.companyName || "N/A"}</p>
							</div>
							<div>
								<p className="text-sm text-default-600">Email</p>
								<p className="font-medium">{data.email || "N/A"}</p>
							</div>
							<div>
								<p className="text-sm text-default-600">Phone</p>
								<p className="font-medium">{data.telephoneNumber || "N/A"}</p>
							</div>
						</div>
					)}
				/>
			</FormModal>

			{/* Guarantor Status Update Modal */}
			<FormModal
				isOpen={isGuarantorModalOpen}
				onClose={onGuarantorModalClose}
				onSubmit={handleGuarantorStatusUpdateConfirm}
				title={`${
					guarantorUpdateAction === "approve" ? "Approve" : "Reject"
				} Guarantor`}
				submitText={
					isUpdatingGuarantor !== null
						? "Updating..."
						: guarantorUpdateAction === "approve"
						? "Approve Guarantor"
						: "Reject Guarantor"
				}
				isLoading={isUpdatingGuarantor !== null}
				variant={guarantorUpdateAction === "approve" ? "success" : "danger"}
			>
				{guarantorToUpdate && (
					<div className="bg-default-50 rounded-lg p-4">
						<h4 className="font-semibold mb-2">Guarantor Information</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<p className="text-sm text-default-600">Name</p>
								<p className="font-medium">{guarantorToUpdate.guarantorName}</p>
							</div>
							<div>
								<p className="text-sm text-default-600">Phone</p>
								<p className="font-medium">
									{guarantorToUpdate.guarantorPhone}
								</p>
							</div>
							<div className="col-span-2">
								<p className="text-sm text-default-600">Relationship</p>
								<p className="font-medium">
									{guarantorToUpdate.guarantorRelationship}
								</p>
							</div>
						</div>
					</div>
				)}

				<div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
					<p className="text-sm text-warning-700">
						Are you sure you want to <strong>{guarantorUpdateAction}</strong>{" "}
						this guarantor? This action will update their status and cannot be
						easily undone.
					</p>
				</div>

				{guarantorUpdateAction === "reject" && (
					<ReasonSelection
						label="Reason for this action"
						reasonOptions={reasonOptions}
						selectedReason={guarantorReason}
						onReasonChange={setGuarantorReason}
						isOtherReason={isOtherReason}
						onOtherReasonToggle={setIsOtherReason}
						customComment={guarantorComment}
						onCustomCommentChange={setGuarantorComment}
					/>
				)}
			</FormModal>

			{/* Store Assignment Modal */}
			<Modal isOpen={isStoreModalOpen} onClose={onStoreModalClose} size="2xl">
				<ModalContent>
					<ModalHeader>
						{mainStore?.storeNew ? "Change Store Assignment" : "Assign Store"}
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							{/* Current store info if exists */}
							{mainStore?.storeNew && (
								<div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
									<h4 className="font-semibold text-warning-800 mb-2">
										Current Store Assignment
									</h4>
									<div className="text-sm text-warning-700">
										<p>
											<strong>Store:</strong> {mainStore.storeNew.storeName}
										</p>
										<p>
											<strong>Location:</strong> {mainStore.storeNew.city},{" "}
											{mainStore.storeNew.state}
										</p>
										<p>
											<strong>Store ID:</strong> {mainStore.storeNew.storeId}
										</p>
									</div>
								</div>
							)}

							{/* Store selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{mainStore?.storeNew
										? "Select New Store"
										: "Select Store to Assign"}
								</label>
								<Autocomplete
									placeholder="Search for a store..."
									inputValue={storeSearchValue}
									onInputChange={handleStoreSearchChange}
									selectedKey={selectedStore?.storeId || ""}
									onSelectionChange={(key) => {
										if (key) {
											const store = filteredStores.find(
												(s: any) => s.storeId === key
											);
											handleStoreSelect(store);
										}
									}}
									className="w-full"
									variant="bordered"
									size="lg"
									allowsCustomValue={true}
									menuTrigger="input"
									items={filteredStores}
									defaultFilter={() => true} // Disable internal filtering since we handle it
									startContent={<Store className="w-4 h-4 text-default-400" />}
								>
									{(store: any) => (
										<AutocompleteItem
											key={store.storeId}
											value={store.storeId}
											className="capitalize"
											description={`${store.address || "N/A"} - ${
												store.city
											}, ${store.state}`}
											startContent={
												<div className="w-2 h-2 bg-success-500 rounded-full" />
											}
										>
											<div className="flex flex-col">
												<span className="font-medium">{store.storeName}</span>
												<span className="text-xs text-default-500">
													ID: {store.storeId} | {store.partner || "N/A"}
												</span>
											</div>
										</AutocompleteItem>
									)}
								</Autocomplete>
								{filteredStores.length === 0 && (
									<p className="text-sm text-default-500 mt-2">
										{processedStoresData.length === 0
											? "No stores available for this agent"
											: "No stores match your search"}
									</p>
								)}
							</div>

							{/* Selected store preview */}
							{selectedStore && (
								<div className="bg-success-50 border border-success-200 rounded-lg p-4">
									<h4 className="font-semibold text-success-800 mb-2">
										Selected Store Details
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-success-700">
										<div>
											<p className="text-default-600">Store Name</p>
											<p className="font-medium">{selectedStore.storeName}</p>
										</div>
										<div>
											<p className="text-default-600">Store ID</p>
											<p className="font-medium">{selectedStore.storeId}</p>
										</div>
										<div>
											<p className="text-default-600">Partner</p>
											<p className="font-medium">
												{selectedStore.partner || "N/A"}
											</p>
										</div>
										<div>
											<p className="text-default-600">Channel</p>
											<p className="font-medium">
												{selectedStore.channel || "N/A"}
											</p>
										</div>
										<div className="col-span-2">
											<p className="text-default-600">Address</p>
											<p className="font-medium">
												{selectedStore.address || "N/A"}
											</p>
										</div>
										<div>
											<p className="text-default-600">Location</p>
											<p className="font-medium">
												{selectedStore.city}, {selectedStore.state}
											</p>
										</div>
										<div>
											<p className="text-default-600">Status</p>
											<Chip
												size="sm"
												color={selectedStore.isArchived ? "danger" : "success"}
												variant="flat"
											>
												{selectedStore.isArchived ? "Archived" : "Active"}
											</Chip>
										</div>
									</div>
								</div>
							)}

							{/* Warning message */}
							<div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
								<p className="text-sm text-warning-700">
									<strong>Note:</strong>{" "}
									{mainStore?.storeNew
										? "Changing the store assignment will update the agent's current store. This action cannot be easily undone."
										: "Assigning a store to this agent will link them to the selected store for their operations."}
								</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button variant="flat" onPress={onStoreModalClose}>
							Cancel
						</Button>
						<Button
							color={mainStore?.storeNew ? "warning" : "success"}
							onPress={handleStoreAssignment}
							isLoading={isAssigningStore}
							isDisabled={!selectedStore}
						>
							{isAssigningStore
								? "Processing..."
								: mainStore?.storeNew
								? "Change Store"
								: "Assign Store"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Device Details Modal */}
			<Modal
				isOpen={isDeviceModalOpen}
				onClose={onDeviceModalClose}
				size="5xl"
				scrollBehavior="inside"
				className="mx-2"
			>
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">
						<h2 className="text-xl font-bold">Device Details</h2>
						{deviceMetadata && (
							<div className="flex flex-col sm:flex-row gap-2 text-sm text-default-600">
								<span>
									Received:{" "}
									{new Date(deviceMetadata.acceptedDate).toLocaleDateString()}
								</span>
								<span className="hidden sm:inline">•</span>
								<span>
									Expires:{" "}
									{new Date(deviceMetadata.expiryDate).toLocaleDateString()}
								</span>
							</div>
						)}
					</ModalHeader>
					<ModalBody className="px-4 pb-4">
						{selectedDevice && (
							<div className="space-y-6">
								{/* Device Image and Basic Info */}
								<div className="flex flex-col sm:flex-row items-start gap-4">
									{selectedDevice.imageLink ? (
										<Image
											src={selectedDevice.imageLink}
											alt={selectedDevice.deviceName}
											width={120}
											height={120}
											className="rounded-lg object-cover mx-auto sm:mx-0"
										/>
									) : (
										<div className="w-30 h-30 bg-default-200 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
											<Smartphone className="w-8 h-8 text-default-400" />
										</div>
									)}
									<div className="flex-1 text-center sm:text-left">
										<h3 className="text-xl font-bold text-default-900 mb-1">
											{selectedDevice.deviceName}
										</h3>
										<p className="text-default-600 capitalize mb-2">
											{selectedDevice.deviceManufacturer}
										</p>
										<p className="text-sm text-default-500 mb-2">
											{selectedDevice.deviceModelNumber}
										</p>
										<Chip
											size="sm"
											color={
												selectedDevice.devfinStatus ? "success" : "warning"
											}
											variant="flat"
										>
											{selectedDevice.devfinStatus ? "Active" : "Inactive"}
										</Chip>
									</div>
								</div>

								{/* Device Specifications */}
								<div>
									<h4 className="font-semibold mb-3">Specifications</h4>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										<div className="bg-default-50 p-3 rounded-lg">
											<p className="text-xs text-default-500 mb-1">RAM</p>
											<p className="font-semibold">
												{selectedDevice.deviceRam || "N/A"}
											</p>
										</div>
										<div className="bg-default-50 p-3 rounded-lg">
											<p className="text-xs text-default-500 mb-1">Storage</p>
											<p className="font-semibold">
												{selectedDevice.deviceStorage || "N/A"}
											</p>
										</div>
										<div className="bg-default-50 p-3 rounded-lg">
											<p className="text-xs text-default-500 mb-1">Screen</p>
											<p className="font-semibold">
												{selectedDevice.deviceScreen || "N/A"}
											</p>
										</div>
										<div className="bg-default-50 p-3 rounded-lg">
											<p className="text-xs text-default-500 mb-1">
												Android Go
											</p>
											<p className="font-semibold">
												{selectedDevice.android_go}
											</p>
										</div>
										<div className="bg-default-50 p-3 rounded-lg">
											<p className="text-xs text-default-500 mb-1">
												Device Type
											</p>
											<p className="font-semibold">
												{selectedDevice.deviceType || "N/A"}
											</p>
										</div>
									</div>
								</div>

								{/* Pricing Information */}
								<div>
									<h4 className="font-semibold mb-3">Pricing Information</h4>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
										<div className="bg-success-50 p-3 rounded-lg">
											<p className="text-xs text-success-600 mb-1">
												Device Price
											</p>
											<p className="font-bold text-success-700">
												₦{selectedDevice.price?.toLocaleString("en-GB")}
											</p>
										</div>
										<div className="bg-primary-50 p-3 rounded-lg">
											<p className="text-xs text-primary-600 mb-1">SAP</p>
											<p className="font-bold text-primary-700">
												₦{selectedDevice.SAP?.toLocaleString("en-GB")}
											</p>
										</div>
										<div className="bg-warning-50 p-3 rounded-lg">
											<p className="text-xs text-warning-600 mb-1">SLD</p>
											<p className="font-bold text-warning-700">
												₦{selectedDevice.SLD?.toLocaleString("en-GB")}
											</p>
										</div>
										<div className="bg-secondary-50 p-3 rounded-lg">
											<p className="text-xs text-secondary-600 mb-1">
												Sentiprotect
											</p>
											<p className="font-bold text-secondary-700">
												₦{selectedDevice.sentiprotect?.toLocaleString("en-GB")}
											</p>
										</div>
									</div>
								</div>

								{/* ERP Information */}
								<div>
									<h4 className="font-semibold mb-3">ERP Information</h4>
									<div className="space-y-3">
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-default-100 gap-2">
											<span className="text-sm text-default-600">
												ERP Item Code
											</span>
											<span className="font-medium break-all">
												{selectedDevice.erpItemCode}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-default-100 gap-2">
											<span className="text-sm text-default-600">ERP Name</span>
											<span className="font-medium break-all">
												{selectedDevice.erpName}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-default-100 gap-2">
											<span className="text-sm text-default-600">
												Serial Number
											</span>
											<Snippet size="sm" symbol="" color="primary">
												{selectedDevice.erpSerialNo}
											</Snippet>
										</div>
									</div>
								</div>

								{/* Device IDs and Timestamps */}
								<div>
									<h4 className="font-semibold mb-3">Technical Information</h4>
									<div className="space-y-3">
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-default-100 gap-2">
											<span className="text-sm text-default-600">
												Device ID
											</span>
											<Snippet size="sm" symbol="" color="secondary">
												{selectedDevice.newDeviceId}
											</Snippet>
										</div>
										{selectedDevice.oldDeviceId && (
											<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-default-100 gap-2">
												<span className="text-sm text-default-600">
													Old Device ID
												</span>
												<span className="font-mono text-sm break-all">
													{selectedDevice.oldDeviceId}
												</span>
											</div>
										)}
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-default-100 gap-2">
											<span className="text-sm text-default-600">
												Created At
											</span>
											<span className="text-sm">
												{new Date(selectedDevice.createdAt).toLocaleDateString(
													"en-US",
													{
														year: "numeric",
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													}
												)}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2">
											<span className="text-sm text-default-600">
												Updated At
											</span>
											<span className="text-sm">
												{new Date(selectedDevice.updatedAt).toLocaleDateString(
													"en-US",
													{
														year: "numeric",
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													}
												)}
											</span>
										</div>
									</div>
								</div>

								{/* Device Assignment Dates */}
								{deviceMetadata && (
									<div>
										<h4 className="font-semibold mb-3">
											Assignment Information
										</h4>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="bg-blue-50 p-3 rounded-lg">
												<p className="text-xs text-blue-600 mb-1">
													Date Received
												</p>
												<p className="font-semibold text-blue-800">
													{new Date(
														deviceMetadata.acceptedDate
													).toLocaleDateString("en-US", {
														year: "numeric",
														month: "long",
														day: "numeric",
													})}
												</p>
											</div>
											<div className="bg-orange-50 p-3 rounded-lg">
												<p className="text-xs text-orange-600 mb-1">
													Expiry Date
												</p>
												<p className="font-semibold text-orange-800">
													{new Date(
														deviceMetadata.expiryDate
													).toLocaleDateString("en-US", {
														year: "numeric",
														month: "long",
														day: "numeric",
													})}
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</ModalBody>
					<ModalFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
						<Button
							variant="flat"
							onPress={onDeviceModalClose}
							className="w-full sm:w-auto"
						>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Change MBE Assignment Modal */}
			<Modal isOpen={isChangeMbeModalOpen} onClose={onChangeMbeModalClose}>
				<ModalContent>
					<ModalHeader>Change MBE Assignment</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<p className="text-default-600">
								Select a new MBE for {agent?.firstname} {agent?.lastname}
							</p>
							<Select
								label="Select MBE"
								placeholder="Choose an MBE"
								value={selectedMbeForAgent?.mbeId || ""}
								onChange={(e) => {
									const selectedMbe = availableMbes.find(
										(mbe) => mbe.mbeId === e.target.value
									);
									setSelectedMbeForAgent(selectedMbe);
								}}
							>
								{availableMbes.map((mbe) => (
									<SelectItem key={mbe.mbeId} value={mbe.mbeId}>
										{mbe.firstname} {mbe.lastname} - {mbe.email}
									</SelectItem>
								))}
							</Select>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button variant="flat" onPress={onChangeMbeModalClose}>
							Cancel
						</Button>
						<Button
							color="primary"
							onPress={handleChangeMbeAssignment}
							isDisabled={!selectedMbeForAgent}
						>
							Change MBE
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Unlink MBE Modal */}
			<Modal isOpen={isUnlinkMbeModalOpen} onClose={onUnlinkMbeModalClose}>
				<ModalContent>
					<ModalHeader>Unlink MBE</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<p className="text-default-600">
								Are you sure you want to unlink {agent?.firstname}{" "}
								{agent?.lastname} from their current MBE?
							</p>
							<div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
								<p className="text-warning-700 text-sm">
									This action will remove the MBE management for this agent.
									They will no longer be managed by an MBE.
								</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button variant="flat" onPress={onUnlinkMbeModalClose}>
							Cancel
						</Button>
						<Button color="danger" onPress={handleUnlinkMbe}>
							Unlink MBE
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* MBE-managed Agent Reconciliation History */}
			{isMbeManaged && reconciliationHistory && (
				<Modal isOpen={false} onClose={() => {}}>
					<ModalContent>
						<ModalHeader>Reconciliation History</ModalHeader>
						<ModalBody>
							<div className="space-y-4">
								{/* Date Filter */}
								<div className="flex gap-2 items-end">
									<DatePicker
										label="Filter by Date"
										value={
											reconciliationDateFilter
												? parseDate(reconciliationDateFilter)
												: null
										}
										onChange={(date) => {
											if (date) {
												const dateString = date.toString();
												handleReconciliationDateFilter(dateString);
											} else {
												handleReconciliationDateFilter("");
											}
										}}
										className="max-w-[200px]"
										size="sm"
									/>
									<Button
										variant="flat"
										size="sm"
										onPress={() => handleReconciliationDateFilter("")}
									>
										Clear
									</Button>
								</div>

								{/* History List */}
								{reconciliationHistory?.data?.length > 0 ? (
									<div className="space-y-3">
										{reconciliationHistory.data.map((record: any) => (
											<div
												key={record.reconciliationId}
												className="bg-default-50 rounded-lg p-4"
											>
												<div className="flex justify-between items-start mb-2">
													<div>
														<div className="font-medium text-default-900">
															{record.agent?.name || "N/A"}
														</div>
														<div className="text-sm text-default-500">
															Agent: {record.agent?.email || "N/A"}
														</div>
													</div>
													<div className="flex items-center gap-2">
														<StatusChip status={record.status} />
														<Button
															size="sm"
															variant="flat"
															color="primary"
															onPress={() =>
																handleViewReconciliationDetails(record)
															}
														>
															View Details
														</Button>
													</div>
												</div>
												<div className="text-sm text-default-500">
													<div>Target: {record.targetWarehouse || "N/A"}</div>
													<div>
														Items: {record.transferItems?.length || 0} item(s)
													</div>
													<div>
														Created:{" "}
														{new Date(record.createdAt).toLocaleDateString()}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-default-500">
										No reconciliation history available
									</div>
								)}

								{/* Pagination */}
								{reconciliationHistory?.pagination && (
									<div className="flex justify-center gap-2">
										<Button
											size="sm"
											variant="flat"
											isDisabled={
												!reconciliationHistory.pagination.hasPreviousPage
											}
											onPress={() =>
												handleReconciliationPageChange(reconciliationPage - 1)
											}
										>
											Previous
										</Button>
										<span className="px-3 py-2 text-sm">
											Page {reconciliationHistory.pagination.currentPage} of{" "}
											{reconciliationHistory.pagination.totalPages}
										</span>
										<Button
											size="sm"
											variant="flat"
											isDisabled={!reconciliationHistory.pagination.hasNextPage}
											onPress={() =>
												handleReconciliationPageChange(reconciliationPage + 1)
											}
										>
											Next
										</Button>
									</div>
								)}
							</div>
						</ModalBody>
						<ModalFooter>
							<Button variant="flat" onPress={() => {}}>
								Close
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}

			{/* Reconciliation Details Modal */}
			{hasPermission(role, "canViewReconciliationHistory") && (
				<Modal
					isOpen={isReconciliationDetailsModalOpen}
					onClose={handleCloseReconciliationDetails}
					size="3xl"
					scrollBehavior="inside"
				>
					<ModalContent>
						<ModalHeader className="pb-3">
							<div className="flex items-center justify-between w-full">
								<div className="flex flex-col gap-1">
									<h3 className="text-base font-semibold">
										Reconciliation Details
									</h3>
									{selectedReconciliation && (
										<p className="text-xs text-default-500">
											ID: {selectedReconciliation.reconciliationId}
										</p>
									)}
								</div>
								{selectedReconciliation && (
									<StatusChip status={selectedReconciliation.status} />
								)}
							</div>
						</ModalHeader>
						<ModalBody className="py-0">
							{selectedReconciliation && (
								<div className="space-y-4">
									{/* Basic Information */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div className="space-y-3">
											<div>
												<label className="text-xs font-medium text-default-600">
													Target Warehouse
												</label>
												<p className="mt-1 text-xs text-default-900">
													{selectedReconciliation.targetWarehouse || "N/A"}
												</p>
											</div>
											{selectedReconciliation.assignedMbe && (
												<div>
													<label className="text-xs font-medium text-default-600">
														Assigned MBE
													</label>
													<p className="mt-1 text-xs text-default-900">
														{selectedReconciliation.assignedMbe.name}
													</p>
													<p className="text-xs text-default-500">
														{selectedReconciliation.assignedMbe.email}
													</p>
												</div>
											)}
											<div>
												<label className="text-xs font-medium text-default-600">
													Created Date
												</label>
												<p className="mt-1 text-xs text-default-900">
													{new Date(
														selectedReconciliation.createdAt
													).toLocaleString("en-GB")}
												</p>
											</div>
										</div>
										<div className="space-y-3">
											<div>
												<label className="text-xs font-medium text-default-600">
													Agent Name
												</label>
												<p className="mt-1 text-xs text-default-900">
													{selectedReconciliation.agent?.name || "N/A"}
												</p>
											</div>
											<div>
												<label className="text-xs font-medium text-default-600">
													Agent Email
												</label>
												<p className="mt-1 text-xs text-default-900">
													{selectedReconciliation.agent?.email || "N/A"}
												</p>
											</div>
											<div>
												<label className="text-xs font-medium text-default-600">
													Total Items
												</label>
												<p className="mt-1 text-xs text-default-900">
													{selectedReconciliation.transferItems?.length || 0}{" "}
													item(s)
												</p>
											</div>
										</div>
									</div>

									{/* Additional Information */}
									{selectedReconciliation.description && (
										<div>
											<label className="text-xs font-medium text-default-600">
												Description
											</label>
											<p className="mt-1 text-xs text-default-900">
												{selectedReconciliation.description}
											</p>
										</div>
									)}

									{/* Transfer Items */}
									{selectedReconciliation.transferItems &&
										selectedReconciliation.transferItems.length > 0 && (
											<div>
												<label className="text-xs font-medium text-default-600 mb-2 block">
													Transfer Items (
													{selectedReconciliation.transferItems.length})
												</label>
												<div className="space-y-2 max-h-80 overflow-y-auto">
													{selectedReconciliation.transferItems.map(
														(item: any, index: number) => (
															<div
																key={index}
																className="bg-default-50 rounded-lg p-3"
															>
																<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
																	<div>
																		<label className="text-xs font-medium text-default-500">
																			Item Code
																		</label>
																		<p className="text-xs text-default-900 font-mono">
																			{item.item_code || "N/A"}
																		</p>
																	</div>
																	<div>
																		<label className="text-xs font-medium text-default-500">
																			Quantity
																		</label>
																		<p className="text-xs text-default-900">
																			{item.qty || "N/A"}
																		</p>
																	</div>
																	{item.serial_nos &&
																		item.serial_nos.length > 0 && (
																			<div className="md:col-span-2">
																				<label className="text-xs font-medium text-default-500 mb-1 block">
																					Serial Numbers (
																					{item.serial_nos.length})
																				</label>
																				<div className="flex flex-wrap gap-1">
																					{item.serial_nos.map(
																						(
																							serialNo: string,
																							serialIndex: number
																						) => (
																							<div
																								key={serialIndex}
																								className="flex items-center gap-1"
																							>
																								<Snippet
																									hideSymbol
																									size="sm"
																									variant="flat"
																									color="primary"
																									className="text-xs"
																								>
																									{serialNo}
																								</Snippet>
																								<span className="text-xs text-default-400">
																									#{serialIndex + 1}
																								</span>
																							</div>
																						)
																					)}
																				</div>
																			</div>
																		)}
																</div>
															</div>
														)
													)}
												</div>
											</div>
										)}

									{/* Additional Metadata */}
									{(selectedReconciliation.updatedAt ||
										selectedReconciliation.erpResponse ||
										selectedReconciliation.erpTransferId ||
										selectedReconciliation.notes ||
										selectedReconciliation.approvedBy) && (
										<div>
											<label className="text-xs font-medium text-default-600 mb-2 block">
												Additional Information
											</label>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												{selectedReconciliation.updatedAt && (
													<div>
														<label className="text-xs font-medium text-default-500">
															Last Updated
														</label>
														<p className="text-xs text-default-900">
															{new Date(
																selectedReconciliation.updatedAt
															).toLocaleString("en-GB")}
														</p>
													</div>
												)}
												{selectedReconciliation.erpTransferId && (
													<div>
														<label className="text-xs font-medium text-default-500">
															ERP Transfer ID
														</label>
														<p className="text-xs text-default-900">
															{selectedReconciliation.erpTransferId}
														</p>
													</div>
												)}
												{selectedReconciliation.erpResponse && (
													<div className="md:col-span-2">
														<label className="text-xs font-medium text-default-500">
															ERP Response
														</label>
														<div className="mt-1 bg-success-50 rounded-lg p-2">
															{selectedReconciliation.erpResponse.data
																?.message && (
																<p className="text-xs text-success-700 font-medium">
																	{
																		selectedReconciliation.erpResponse.data
																			.message
																	}
																</p>
															)}
															{selectedReconciliation.erpResponse.data
																?.stock_entry_id && (
																<p className="text-xs text-success-600 mt-1">
																	Stock Entry ID:{" "}
																	{
																		selectedReconciliation.erpResponse.data
																			.stock_entry_id
																	}
																</p>
															)}
														</div>
													</div>
												)}
												{selectedReconciliation.approvedBy && (
													<div>
														<label className="text-xs font-medium text-default-500">
															Approved By
														</label>
														<p className="text-xs text-default-900">
															{selectedReconciliation.approvedBy}
														</p>
													</div>
												)}
												{selectedReconciliation.notes && (
													<div className="md:col-span-2">
														<label className="text-xs font-medium text-default-500">
															Notes
														</label>
														<p className="text-xs text-default-900">
															{selectedReconciliation.notes}
														</p>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							)}
						</ModalBody>
						<ModalFooter>
							<Button variant="flat" onPress={handleCloseReconciliationDetails}>
								Close
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</div>
	);
}
