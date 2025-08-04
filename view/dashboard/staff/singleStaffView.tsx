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
} from "@/lib";
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
} from "@heroui/react";
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
	id: string;
	itemCode: string;
	itemName: string;
	availableQty: number;
	serialNumbers: string[];
	createdAt: string;
	updatedAt: string;
	mbeId: string;
	expiryDate?: string;
}

interface DeviceResponse {
	statusCode: number;
	statusType: string;
	message: string;
	data: DeviceItem[];
	responseTime: string;
	channel: string;
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
const fetchAgentDevices = async (agentId: string): Promise<DeviceItem[]> => {
	if (!agentId) {
		throw new Error("Agent ID is required");
	}
	try {
		const response: DeviceResponse = await getAgentDevice({
			mbeId: agentId,
		});
		return response?.data || [];
	} catch (error) {
		console.error("Error fetching agent devices:", error);
		return [];
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
			loanAmount: `₦${loan.loanAmount?.toLocaleString() || 0}`,
			devicePrice: `₦${loan.devicePrice?.toLocaleString() || 0}`,
			downPayment: `₦${loan.downPayment?.toLocaleString() || 0}`,
			monthlyRepayment: `₦${loan.monthlyRepayment?.toLocaleString() || 0}`,
			interestAmount: `₦${loan.interestAmount?.toLocaleString() || 0}`,
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
			commission: `₦${commission.commission?.toLocaleString() || 0}`,
			mbeCommission: `₦${commission.mbeCommission?.toLocaleString() || 0}`,
			partnerCommission: `₦${
				commission.partnerCommission?.toLocaleString() || 0
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
					₦{loan.loanAmount?.toLocaleString() || 0}
				</div>
			);
		case "devicePrice":
			return (
				<div className="font-medium">
					₦{loan.devicePrice?.toLocaleString() || 0}
				</div>
			);
		case "downPayment":
			return (
				<div className="font-medium">
					₦{loan.downPayment?.toLocaleString() || 0}
				</div>
			);
		case "monthlyRepayment":
			return (
				<div className="font-medium">
					₦{loan.monthlyRepayment?.toLocaleString() || 0}
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
					₦{commission.commission?.toLocaleString() || 0}
				</div>
			);
		case "mbeCommission":
			return (
				<div className="font-medium">
					₦{commission.mbeCommission?.toLocaleString() || 0}
				</div>
			);
		case "partnerCommission":
			return (
				<div className="font-medium">
					₦{commission.partnerCommission?.toLocaleString() || 0}
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

	// Filter states for performance data
	const [loanFilterValue, setLoanFilterValue] = useState("");
	const [loanStatusFilter, setLoanStatusFilter] = useState<Set<string>>(
		new Set()
	);
	const [loanPage, setLoanPage] = useState(1);
	const [commissionFilterValue, setCommissionFilterValue] = useState("");
	const [commissionPage, setCommissionPage] = useState(1);

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
		data: devices,
		error: devicesError,
		isLoading: devicesLoading,
	} = useSWR(
		agent ? `agent-devices-${agent.mbeId}` : null,
		() => fetchAgentDevices(agent!.mbeId),
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000,
		}
	);

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
							<StatusChip status={agent.accountStatus} />
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
											.toLocaleString()}
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
										₦{(summary?.totalCommission || 0).toLocaleString()}
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
										₦{(summary?.avgCommission || 0).toLocaleString()}
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
													{agent?.userId ? "Change Partner" : "Assign Partner"}
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
											? new Date(agent.createdAt).toLocaleString()
											: null
									}
								/>
								<InfoField
									label="Updated At"
									value={
										agent.updatedAt
											? new Date(agent.updatedAt).toLocaleString()
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
												performanceViewType === "loans" ? "primary" : "default"
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
											Commissions ({processedPerformanceData.commissions.length}
											)
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
															pages={Math.ceil(filteredLoans.length / 10) || 1}
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
																Math.ceil(filteredCommissions.length / 10) || 1
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
									<div className="flex items-center justify-between mb-4">
										<p className="text-sm text-default-600">
											Individual devices currently assigned to this agent
										</p>
										<Chip size="sm" variant="flat" color="primary">
											{devices.reduce(
												(total, device) => total + device.serialNumbers.length,
												0
											)}{" "}
											Total Device
											{devices.reduce(
												(total, device) => total + device.serialNumbers.length,
												0
											) !== 1
												? "s"
												: ""}
										</Chip>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{devices.map((device) => (
											<AgentDeviceCard key={device.id} device={device} />
										))}
									</div>
								</div>
							) : (
								<EmptyState
									title="No Devices Assigned"
									description="This agent currently has no devices assigned to them."
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
													{mainStore.storeNew.city}, {mainStore.storeNew.state}
												</Button>
											</div>
										</div>
										<Chip
											color={
												mainStore.storeNew.isArchived ? "danger" : "success"
											}
											variant="flat"
											size="sm"
										>
											{mainStore.storeNew.isArchived ? "Archived" : "Active"}
										</Chip>
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
														  ).toLocaleString()
														: null
												}
											/>
											<InfoField
												label="Updated At"
												value={
													mainStore.storeNew.updatedAt
														? new Date(
																mainStore.storeNew.updatedAt
														  ).toLocaleString()
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
									<InfoField label="Street Address" value={kyc.streetAddress} />
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
												? new Date(kyc.createdAt).toLocaleString()
												: null
										}
									/>
									<InfoField
										label="Updated At"
										value={
											kyc.updatedAt
												? new Date(kyc.updatedAt).toLocaleString()
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
																endContent={<ChevronDown className="w-4 h-4" />}
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
												? new Date(accountDetails.createdAt).toLocaleString()
												: null
										}
									/>
									<InfoField
										label="Updated At"
										value={
											accountDetails.updatedAt
												? new Date(accountDetails.updatedAt).toLocaleString()
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
																? new Date(guarantor.createdAt).toLocaleString()
																: null
														}
													/>
													<InfoField
														label="Updated At"
														value={
															guarantor.updatedAt
																? new Date(guarantor.updatedAt).toLocaleString()
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
		</div>
	);
}
