"use client";
import {
  capitalize,
  getScanPartnerByUserId,
  getUserRole,
  showToast,
  suspendUser as suspendScanPartner,
  useAuth,
  getAgentLoansAndCommissions, // Add this import
} from "@/lib";
import { hasPermission } from "@/lib/permissions";
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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
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
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { statusColorMap } from "./constants";
import type { ScanPartnerRecord } from "./types";
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

// Utility Components
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const NotFound = ({ onGoBack }: { onGoBack: () => void }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-default-900 mb-2">
        Scan Partner Not Found
      </h2>
      <p className="text-default-500 mb-4">
        The requested scan partner information could not be found.
      </p>
      <Button
        variant="flat"
        color="primary"
        startContent={<ArrowLeft />}
        onPress={onGoBack}
      >
        Go Back
      </Button>
    </div>
  </div>
);

const InfoCard = ({
  title,
  children,
  className = "",
  icon,
  headerContent,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  headerContent?: React.ReactNode;
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-default-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-default-900">{title}</h3>
          </div>
          {headerContent}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

const InfoField = ({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value?: string | null;
  copyable?: boolean;
}) => (
  <div className="bg-default-50 rounded-lg p-4">
    <div className="text-sm text-default-500 mb-1">{label}</div>
    <div className="font-medium text-default-900 flex items-center gap-2">
      {value || "N/A"}
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

// Main Component
export default function ScanPartnerSinglePage() {
  const params = useParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewType, setViewType] = useState<"cards" | "table">("table");
  const [dataViewType, setDataViewType] = useState<
    "agents" | "loans" | "commissions"
  >("agents");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSuspendOpen,
    onOpen: onSuspendOpen,
    onClose: onSuspendClose,
  } = useDisclosure();

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

    return { loans: allLoans, commissions: allCommissions, agentMap };
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
        loanAmount: `₦${loan.loanAmount?.toLocaleString() || 0}`,
        devicePrice: `₦${loan.devicePrice?.toLocaleString() || 0}`,
        downPayment: `₦${loan.downPayment?.toLocaleString() || 0}`,
        monthlyRepayment: `₦${loan.monthlyRepayment?.toLocaleString() || 0}`,
        interestAmount: `₦${loan.interestAmount?.toLocaleString() || 0}`,
        insurancePrice: `₦${loan.insurancePrice?.toLocaleString() || 0}`,
        mbsEligibleAmount: `₦${loan.mbsEligibleAmount?.toLocaleString() || 0}`,
        deviceAmount: `₦${loan.deviceAmount?.toLocaleString() || 0}`,
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
                <Modal
                  isOpen={isOpen}
                  onClose={onClose}
                  size="sm"
                  placement="center"
                >
                  <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                      {`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName})`}
                    </ModalHeader>
                    <ModalBody className="p-0">
                      <Image
                        src={scanPartner.profile_picture || "/placeholder.svg"}
                        alt={`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName}) - Full preview`}
                        className="w-full h-auto rounded-b-lg"
                      />
                    </ModalBody>
                  </ModalContent>
                </Modal>
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
              <div className="p-2 bg-warning-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Loan Amount</p>
                <p className="text-2xl font-bold text-default-900">
                  ₦
                  {processedData.loans
                    .reduce((sum, loan) => sum + (loan.loanAmount || 0), 0)
                    .toLocaleString()}
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
                  ₦
                  {processedData.commissions
                    .reduce((sum, comm) => sum + (comm.commission || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      <Modal
        isOpen={isSuspendOpen}
        onClose={onSuspendClose}
        size="md"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-danger">
              Suspend Scan Partner
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={scanPartner?.profile_picture || "/placeholder.svg"}
                  alt={`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName})`}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-medium">
                    {`${scanPartner?.companyName} (${scanPartner.firstName} ${scanPartner.lastName})`}
                  </p>
                  <p className="text-small text-default-500">
                    {scanPartner?.email}
                  </p>
                </div>
              </div>
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-danger-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-danger-700 mb-1">
                      Permanent Deletion Warning
                    </p>
                    <p className="text-sm text-danger-600">
                      This action cannot be undone. Deleting this scan partner
                      will permanently remove:
                    </p>
                    <ul className="text-sm text-danger-600 mt-2 ml-4 list-disc">
                      <li>All scan partner information and records</li>
                      <li>Associated agent relationships</li>
                      <li>Transaction history and referrals</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-default-50 rounded-lg p-3">
                <p className="text-sm text-default-600">
                  <strong>User ID:</strong> {scanPartner?.userId}
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onSuspendClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleSuspendScanPartner}
              isLoading={isDeleting}
              isDisabled={isDeleting}
              startContent={!isDeleting ? <Trash2 className="w-4 h-4" /> : null}
            >
              {isDeleting ? "Deleting..." : "Suspend Scan Partner"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
                      ? new Date(scanPartner.createdAt).toLocaleString()
                      : null
                  }
                />
                <InfoField
                  label="Updated At"
                  value={
                    scanPartner.updatedAt
                      ? new Date(scanPartner.updatedAt).toLocaleString()
                      : null
                  }
                />
              </div>
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
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
