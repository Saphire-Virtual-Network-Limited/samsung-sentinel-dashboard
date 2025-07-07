"use client";

import {
  showToast,
  updateAgentGuarantorStatus,
  deleteAgentDetails,
  getAgentDevice,
  getAgentRecordByMbeId,
  updateAgentAddressStatus,
} from "@/lib";
import { useAuth } from "@/lib";
import { getUserRole } from "@/lib";

import {
  Avatar,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Snippet,
  useDisclosure,
  Image,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
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
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import type { AccountStatus, AgentRecord } from "./types";
import useSWR from "swr";

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
        Agent Not Found
      </h2>
      <p className="text-default-500 mb-4">
        The requested agent information could not be found.
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
        <div className="p-4 border-b border-default-200">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-default-900">{title}</h3>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
    >
      <div
        className="p-4 border-b border-default-200 cursor-pointer hover:bg-default-50 transition-colors"
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
        <div className="p-6">{children}</div>
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
    <div className="font-medium text-default-900 flex items-center gap-2">
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

const DeviceCard = ({ device }: { device: DeviceItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpiringSoon =
    device.expiryDate &&
    new Date(device.expiryDate) <=
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const isExpired =
    device.expiryDate && new Date(device.expiryDate) < new Date();

  return (
    <div className="bg-default-50 rounded-lg p-3 border border-default-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-default-900 text-sm truncate">
            {device.itemName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-default-500">
            <span>#{device.itemCode}</span>
            <span>•</span>
            <span>
              {device.availableQty} unit{device.availableQty !== 1 ? "s" : ""}
            </span>
            {device.expiryDate && (
              <>
                <span>•</span>
                <span
                  className={
                    isExpired
                      ? "text-danger"
                      : isExpiringSoon
                      ? "text-warning"
                      : "text-success"
                  }
                >
                  {isExpired
                    ? "Expired"
                    : isExpiringSoon
                    ? "Due Soon"
                    : "Active"}
                </span>
              </>
            )}
          </div>
        </div>
        <Button
          variant="light"
          size="md"
          isIconOnly
          className="text-default-400 hover:text-default-600 w-fit"
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <span>Hide</span> : <span>View More</span>}
        </Button>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-default-500">Serial Numbers:</div>
        {isExpanded ? (
          <div className="space-y-1">
            {device.serialNumbers.map((serial, index) => (
              <div
                key={serial}
                className="flex items-center justify-between bg-white rounded px-2 py-1 text-xs"
              >
                <span className="text-default-600">#{index + 1}</span>
                <Snippet
                  codeString={serial}
                  size="sm"
                  className="text-xs"
                  hideSymbol
                >
                  {serial}
                </Snippet>
              </div>
            ))}
          </div>
        ) : (
          <div className="hidden flex flex-wrap gap-1">
            {device.serialNumbers.slice(0, 3).map((serial) => (
              <Snippet
                key={serial}
                codeString={serial}
                size="sm"
                className="text-xs"
                hideSymbol
              >
                {serial.length > 8 ? `${serial.slice(0, 8)}...` : serial}
              </Snippet>
            ))}
            {device.serialNumbers.length > 3 && (
              <Chip size="sm" variant="flat" className="text-xs">
                +{device.serialNumbers.length - 3} more
              </Chip>
            )}
          </div>
        )}
      </div>

      {(isExpanded || device.expiryDate) && (
        <div className="flex items-center justify-between text-xs text-default-500 mt-2 pt-2 border-t border-default-200">
          <span>
            Assigned: {new Date(device.createdAt).toLocaleDateString()}
          </span>
          {device.expiryDate && (
            <span
              className={
                isExpired
                  ? "text-danger"
                  : isExpiringSoon
                  ? "text-warning"
                  : "text-success"
              }
            >
              Return by: {new Date(device.expiryDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "primary";
    case "VERIFIED":
      return "success";
    case "APPROVED":
      return "success";
    case "KYC_2":
      return "warning";
    case "KYC_1":
      return "warning";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "default";
  }
};

const StatusChip = ({ status }: { status?: string }) => {
  return (
    <Chip color={getStatusColor(status)} variant="flat" className="font-medium">
      {status || "PENDING"}
    </Chip>
  );
};

const GuarantorStatusChip = ({ status }: { status: string }) => {
  return (
    <Chip color={getStatusColor(status)} variant="flat" size="sm">
      {status}
    </Chip>
  );
};

const AddressStatusChip = ({ status }: { status: string }) => {
  return (
    <Chip color={getStatusColor(status)} variant="flat" size="sm">
      {status}
    </Chip>
  );
};

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
  agentId: string
) => {
  await updateAgentGuarantorStatus({
    status: newStatus,
    mbeId: agentId,
    guarantorId,
  });
  console.log(`Updating guarantor ${guarantorId} status to ${newStatus}`);
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
    const response: DeviceResponse = await getAgentDevice(
      { mbeId: agentId },
      { appKey: MOBIFLEX_APP_KEY }
    );
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching agent devices:", error);
    return [];
  }
};

// Main Component
export default function AgentSinglePage() {
  const params = useParams();
  const { userResponse } = useAuth();

  const role = getUserRole(String(userResponse?.data?.role));

  const router = useRouter();

  const [isUpdatingGuarantor, setIsUpdatingGuarantor] = useState<string | null>(
    null
  );
  const [isUpdatingAddress, setIsUpdatingAddress] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
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

  const handleGuarantorStatusUpdate = async (
    guarantorId: string,
    newStatus: string
  ) => {
    if (!agent) return;

    setIsUpdatingGuarantor(guarantorId);
    try {
      const result = await mockUpdateGuarantorStatus(
        guarantorId,
        newStatus,
        agent.mbeId
      );
      if (result.success) {
        const updatedGuarantors = agent.MbeGuarantor?.map((g) =>
          g.guarantorid === guarantorId
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
      }
    } catch (error) {
      console.error("Error updating guarantor status:", error);
      showToast({
        type: "error",
        message: "Failed to update guarantor status",
        duration: 5000,
      });
      mutate();
    } finally {
      setIsUpdatingGuarantor(null);
    }
  };

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
      }
    } catch (error) {
      console.error("Error updating address status:", error);
      showToast({
        type: "error",
        message: "Failed to update address status",
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
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      showToast({
        type: "error",
        message: "Failed to delete agent",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      onDeleteClose();
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
                    <Modal
                      isOpen={isOpen}
                      onClose={onClose}
                      size="sm"
                      placement="center"
                    >
                      <ModalContent>
                        <ModalHeader className="flex flex-col gap-1">
                          {agent.firstname} {agent.lastname}
                        </ModalHeader>
                        <ModalBody className="p-0">
                          <Image
                            src={agent.imageUrl || "/placeholder.svg"}
                            alt={`${agent.firstname} ${agent.lastname} - Full preview`}
                            className="w-full h-auto rounded-b-lg"
                          />
                        </ModalBody>
                      </ModalContent>
                    </Modal>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        size="md"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-danger">Delete Agent</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={agent?.imageUrl || "/placeholder.svg"}
                  alt={`${agent?.firstname} ${agent?.lastname}`}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-medium">
                    {agent?.firstname} {agent?.lastname}
                  </p>
                  <p className="text-small text-default-500">{agent?.email}</p>
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
                      This action cannot be undone. Deleting this agent will
                      permanently remove:
                    </p>
                    <ul className="text-sm text-danger-600 mt-2 ml-4 list-disc">
                      <li>All agent information and records</li>
                      <li>Associated KYC and account details</li>
                      <li>Guarantor information</li>
                      <li>Store assignments and transaction history</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-default-50 rounded-lg p-3">
                <p className="text-sm text-default-600">
                  <strong>Agent ID:</strong> {agent?.mbeId}
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onDeleteClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteAgent}
              isLoading={isDeleting}
              isDisabled={isDeleting}
              startContent={!isDeleting ? <Trash2 className="w-4 h-4" /> : null}
            >
              {isDeleting ? "Deleting..." : "Delete Agent"}
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
              collapsible={true}
              defaultExpanded={true}
            >
              <div className="grid gap-4">
                <InfoField label="Agent ID" value={agent.mbeId} copyable />
                {agent?.userId && (
                  <InfoField
                    endComponent={
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
                    }
                    label="SCAN Partner ID"
                    value={agent.userId}
                    copyable
                  />
                )}

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
              defaultExpanded={true}
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
            {/* Agent Devices */}
            <InfoCard
              title="Agent Devices"
              icon={<Smartphone className="w-5 h-5 text-default-600" />}
              collapsible={true}
              defaultExpanded={true}
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
                      <DeviceCard key={device.id} device={device} />
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
                defaultExpanded={true}
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
                defaultExpanded={true}
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
                defaultExpanded={true}
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
                    }
                  />
                </div>
              </InfoCard>
            ) : (
              <InfoCard
                title="KYC Information"
                icon={<User className="w-5 h-5 text-default-600" />}
                collapsible={true}
                defaultExpanded={true}
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
                defaultExpanded={true}
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
                defaultExpanded={true}
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
                defaultExpanded={true}
              >
                <div className="space-y-6">
                  {agent.MbeGuarantor.map((guarantor, index) => (
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
                                endContent={<ChevronDown className="w-4 h-4" />}
                                isDisabled={
                                  isUpdatingGuarantor === guarantor.guarantorid
                                }
                                isLoading={
                                  isUpdatingGuarantor === guarantor.guarantorid
                                }
                              >
                                Update Status
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Guarantor status actions"
                              onAction={(key) =>
                                handleGuarantorStatusUpdate(
                                  guarantor.guarantorid,
                                  key as string
                                )
                              }
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
                defaultExpanded={true}
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
    </div>
  );
}
