"use client";

import {
  getScanPartnerByUserId,
  showToast,
  suspendUser as suspendScanPartner,
  capitalize,
  useAuth,
} from "@/lib";

import {
  Avatar,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Image,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";

import {
  ArrowLeft,
  User,
  Users,
  Trash2,
  MoreVertical,
  ExternalLink,
  Calendar,
  Phone,
  Hash,
  UserCheck,
  Building,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import type { ScanPartnerRecord } from "./types";
import { statusColorMap } from "./constants";
import useSWR from "swr";

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
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-default-200">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-default-900">{title}</h3>
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
            <span className="capitalize">{agent.role.toLowerCase()}</span>
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

// Main Component
export default function ScanPartnerSinglePage() {
  const params = useParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSuspendOpen,
    onOpen: onSuspendOpen,
    onClose: onSuspendClose,
  } = useDisclosure();

  // Get the role from the URL path

  // Use SWR for data fetching

  const { userResponse } = useAuth();
  const getUserRole = (userRole: string) => {
    const role = userRole.toLowerCase();
    if (role === "admin") return "sub-admin";
    if (role === "super-admin") return "admin";
    return role;
  };

  const role = getUserRole(String(userResponse?.data?.role));
  const isScanPartner = userResponse?.data?.role == "SCAN_PARTNER";
  const userId = userResponse?.data?.userId;

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
    } catch (error) {
      console.error("Error deleting scan partner:", error);
      showToast({
        type: "error",
        message: "Failed to suspend scan partner",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      onSuspendClose();
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
                  alt={`${scanPartner.firstName} ${scanPartner.lastName}`}
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
                      {scanPartner.firstName} {scanPartner.lastName}
                    </ModalHeader>
                    <ModalBody className="p-0">
                      <Image
                        src={scanPartner.profile_picture || "/placeholder.svg"}
                        alt={`${scanPartner.firstName} ${scanPartner.lastName} - Full preview`}
                        className="w-full h-auto rounded-b-lg"
                      />
                    </ModalBody>
                  </ModalContent>
                </Modal>
                <div>
                  <h1 className="text-xl font-bold text-default-900">
                    {scanPartner.firstName} {scanPartner.lastName}
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
                  alt={`${scanPartner?.firstName} ${scanPartner?.lastName}`}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-medium">
                    {scanPartner?.firstName} {scanPartner?.lastName}
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

          {/* Right Column - Associated Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            <InfoCard
              title="Statistics"
              icon={<Building className="w-5 h-5 text-default-600" />}
            >
              <div className="flex flex-row flex-between w-full gap-x-5">
                <InfoField
                  label="Total Agents"
                  value={agents.length.toString()}
                />
                <InfoField
                  label="Active Agents"
                  value={agents
                    .filter((agent) => agent.isActive)
                    .length.toString()}
                />
                <InfoField
                  label="Approved Agents"
                  value={agents
                    .filter((agent) => agent.accountStatus === "APPROVED")
                    .length.toString()}
                />
              </div>
            </InfoCard>
            {/* Associated Agents */}
            <InfoCard
              title="Associated Agents"
              icon={<Users className="w-5 h-5 text-default-600" />}
            >
              {agents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-default-600">
                      Agents managed by this scan partner
                    </p>
                    <Chip size="sm" variant="flat" color="primary">
                      {agents.length} Agent{agents.length !== 1 ? "s" : ""}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {agents.map((agent) => (
                      <AgentCard key={agent.mbeId} agent={agent} role={role} />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Agents Assigned"
                  description="This scan partner currently has no agents assigned to them."
                  icon={<Users className="w-6 h-6 text-default-400" />}
                />
              )}
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
