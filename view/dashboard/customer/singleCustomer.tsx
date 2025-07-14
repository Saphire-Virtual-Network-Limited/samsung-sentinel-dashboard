"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button, Chip, Snippet } from "@heroui/react";
import { ArrowLeft, ChevronDown, ChevronUp, User, CreditCard, Store, Users, Smartphone, MapPin, Clock } from "lucide-react";
import {
 
  getCustomerRecordById,
  getAllCustomerRecord,
  showToast,
  updateCustomerLastPoint,
  updateCustomerVirtualWalletBalance,
  useAuth,
  lockDevice,
  unlockDevice,
  releaseDevice,
  changeLoanStatus,
  createCustomerVirtualWallet,
} from "@/lib";
import { hasPermission } from "@/lib/permissions";
import { PaymentReceipt } from "@/components/reususables/custom-ui";
import { FormField, SelectField } from "@/components/reususables";
import { CustomerRecord } from "./types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

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

export default function CollectionSingleCustomerPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/dev/customers -> dev)
  const role = pathname.split("/")[2];

  const { userResponse } = useAuth();
  const userEmail = userResponse?.data?.email || "";

  const params = useParams();

  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
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

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!params.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getAllCustomerRecord();
        const customerData = response.data.find(
          (c: CustomerRecord) => c.customerId === params.id
        );

        if (customerData) {
          setCustomer(customerData);
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
          message: "Failed to fetch customer data",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [params.id]);

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
      const response = await createCustomerVirtualWallet(
        customer.customerId,
      );
      console.log(response);
      showToast({
        type: "success",
        message: "Wallet created successfully",
        duration: 5000,
      });
      onCreateWalletClose();
      setSelectedCustomer(null);
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

  // Device action configuration
  const deviceActions = [
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

  // Unified device action handler
  const handleDeviceAction = async (action: string, imei: string) => {
    if (!imei || imei === "N/A") {
      showToast({
        type: "error",
        message: "No device found",
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
          response = await unlockDevice(imei);
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
      console.log("API Response:", response);
      showToast({
        type: "success",
        message: "Loan status updated successfully",
        duration: 5000,
      });

      // Refresh customer data to show updated status
      const updatedResponse = await getAllCustomerRecord();
      const updatedCustomerData = updatedResponse.data.find(
        (c: CustomerRecord) => c.customerId === params.id
      );
      if (updatedCustomerData) {
        setCustomer(updatedCustomerData);
      }

      onUpdateLoanStatusClose();
      setSelectedAction("");
      setSelectedCustomer(null);
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

  return (
    <div className="min-h-screen bg-default-50">
      {/* Header Section */}
      <div className="bg-white border-b border-default-200">
        <div className=" py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-lg font-bold text-default-900">
                  {customer.firstName} {customer.lastName}
                </h1>
              </div>
              <Chip
                color={customer.dobMisMatch ? "danger" : "success"}
                variant="flat"
                className="font-medium"
              >
                {customer.dobMisMatch === false
                  ? "DOB Verified"
                  : "DOB Mismatch"}
              </Chip>
            </div>
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
                  <InfoField
                    label="Full Name"
                    value={`${customer.firstName} ${customer.lastName}`}
                  />
                  <InfoField label="Email" value={customer.email} />
                  <InfoField label="BVN" value={customer.bvn} />
                  <InfoField label="BVN Date of Birth" value={customer.dob} />
                  <InfoField label="Inputted Date of Birth" value={customer.inputtedDob} />
                  <InfoField label="BVN Phone" value={customer.bvnPhoneNumber} />
                  <InfoField label="Main Phone" value={customer.mainPhoneNumber} />
                  <InfoField label="MBE ID" value={customer.mbeId} />
                  <InfoField label="Mono Customer Connected ID" value={customer.monoCustomerConnectedCustomerId} />
                  <InfoField label="Channel" value={customer.channel} />
                  <InfoField label="Created At" value={customer.createdAt ? new Date(customer.createdAt).toLocaleString() : "N/A"} />
                  <InfoField label="Updated At" value={customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : "N/A"} />
                  <InfoField label="Customer Loan Disk ID" value={customer.customerLoanDiskId} />
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
                  <InfoField label="Address" value={customer.CustomerKYC?.[0]?.applicantAddress} />
                  <InfoField label="House Number" value={customer.CustomerKYC?.[0]?.houseNumber} />
                  <InfoField label="Street Address" value={customer.CustomerKYC?.[0]?.streetAddress} />
                  <InfoField label="Nearest Bus Stop" value={customer.CustomerKYC?.[0]?.nearestBusStop} />
                  <InfoField label="Local Government" value={customer.CustomerKYC?.[0]?.localGovernment} />
                  <InfoField label="State" value={customer.CustomerKYC?.[0]?.state} />
                  <InfoField label="Town" value={customer.CustomerKYC?.[0]?.town} />
                  <InfoField label="Occupation" value={customer.CustomerKYC?.[0]?.occupation} />
                  <InfoField label="Business Name" value={customer.CustomerKYC?.[0]?.businessName} />
                  <InfoField label="Business Address" value={customer.CustomerKYC?.[0]?.applicantBusinessAddress} />
                  <InfoField label="Source" value={customer.CustomerKYC?.[0]?.source} />
                  <InfoField label="KYC Created At" value={customer.CustomerKYC?.[0]?.createdAt ? new Date(customer.CustomerKYC?.[0]?.createdAt).toLocaleString() : "N/A"} />
                  <InfoField label="KYC Updated At" value={customer.CustomerKYC?.[0]?.updatedAt ? new Date(customer.CustomerKYC?.[0]?.updatedAt).toLocaleString() : "N/A"} />
                  <InfoField label="KYC Channel" value={customer.CustomerKYC?.[0]?.channel} />
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
                      <InfoField label="Referee 1" value={customer.CustomerKYC?.[0]?.phone2} />
                      <InfoField label="Referee 2" value={customer.CustomerKYC?.[0]?.phone3} />
                      <InfoField label="Referee 3" value={customer.CustomerKYC?.[0]?.phone4} />
                      <InfoField label="Referee 4" value={customer.CustomerKYC?.[0]?.phone5} />
                    </div>
                    {customer.CustomerKYC?.[0]?.phoneApproved && (
                      <div className="bg-green-50 rounded-lg p-4 mt-4">
                        <p>Approved Referee number</p>
                        <div className="font-medium text-default-900">
                          {customer.CustomerKYC?.[0]?.phoneApproved}
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
                  <InfoField label="Full Name" value={`${customer.regBy?.firstname} ${customer.regBy?.lastname}`} />
                  <InfoField label="Phone" value={customer.regBy?.phone} />
                  <InfoField label="Username" value={customer.regBy?.username} />
                  <InfoField label="Account Status" value={customer.regBy?.accountStatus} />
                  <InfoField label="Role" value={customer.regBy?.role} />
                  <InfoField label="State" value={customer.regBy?.state} />
                  <InfoField label="Assigned Store Branch" value={customer.regBy?.assignedStoreBranch} />
                  <InfoField label="Created At" value={customer.regBy?.createdAt ? new Date(customer.regBy.createdAt).toLocaleString() : "N/A"} />
                  <InfoField label="Updated At" value={customer.regBy?.updatedAt ? new Date(customer.regBy.updatedAt).toLocaleString() : "N/A"} />
                  <InfoField label="MBE ID" value={customer.regBy?.mbeId} />
                  <InfoField label="MBE Old ID" value={customer.regBy?.mbe_old_id} />
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
            {hasPermission(role, "canTriggerDeviceActions", userEmail) && (
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
                  <InfoField label="Loan Amount" value={`₦${customer.LoanRecord?.[0]?.loanAmount?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Monthly Repayment" value={`₦${customer.LoanRecord?.[0]?.monthlyRepayment?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Duration" value={`${customer.LoanRecord?.[0]?.duration || "N/A"} months`} />
                  <InfoField label="Interest Amount" value={`₦${customer.LoanRecord?.[0]?.interestAmount?.toLocaleString() || "N/A"}`} />
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
                  <InfoField label="Last Point" value={customer.LoanRecord?.[0]?.lastPoint || "N/A"} />
                  <InfoField label="Down Payment" value={`₦${customer.LoanRecord?.[0]?.downPayment?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Insurance Package" value={customer.LoanRecord?.[0]?.insurancePackage || "N/A"} />
                  <InfoField label="Insurance Price" value={`₦${customer.LoanRecord?.[0]?.insurancePrice?.toLocaleString() || "N/A"}`} />
                  <InfoField label="MBS Eligible Amount" value={`₦${customer.LoanRecord?.[0]?.mbsEligibleAmount?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Pay Frequency" value={customer.LoanRecord?.[0]?.payFrequency || "N/A"} />
                  <InfoField label="Total Repayment" value={`₦${((customer.LoanRecord?.[0]?.monthlyRepayment ?? 0) * (customer.LoanRecord?.[0]?.duration ?? 0))?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Device Name" value={customer.LoanRecord?.[0]?.deviceName || "N/A"} />
                  <InfoField label="Device Price" value={`₦${customer.LoanRecord?.[0]?.devicePrice?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Device price with insurance" value={`₦${customer.LoanRecord?.[0]?.deviceAmount?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Loan Created At" value={customer.LoanRecord?.[0]?.createdAt ? new Date(customer.LoanRecord[0].createdAt).toLocaleString() : "N/A"} />
                  <InfoField label="Loan Updated At" value={customer.LoanRecord?.[0]?.updatedAt ? new Date(customer.LoanRecord[0].updatedAt).toLocaleString() : "N/A"} />
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
                  <InfoField label="Loan Record ID" value={customer.LoanRecord?.[0]?.loanRecordId || "N/A"} />
                  <InfoField label="Device ID" value={customer.LoanRecord?.[0]?.deviceId || "N/A"} />
                  <InfoField label="Loan Disk ID" value={customer.LoanRecord?.[0]?.loanDiskId || "N/A"} />
                  <InfoField label="Store ID" value={customer.LoanRecord?.[0]?.storeId || "N/A"} />
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
                                    ? `₦${store.amount.toLocaleString()}`
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
                                    ? new Date(store.createdAt).toLocaleString()
                                    : "N/A"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-default-500 mb-1">
                                  Updated At
                                </div>
                                <div className="font-medium text-default-900">
                                  {store.updatedAt
                                    ? new Date(store.updatedAt).toLocaleString()
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
                                    ? `₦${device.amount.toLocaleString()}`
                                    : "N/A"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-default-500 mb-1">
                                  Device Price
                                </div>
                                <div className="font-medium text-default-900">
                                  {device.devicePrice !== undefined
                                    ? `₦${device.devicePrice.toLocaleString()}`
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
                                    ? new Date(
                                        device.createdAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-default-500 mb-1">
                                  Updated At
                                </div>
                                <div className="font-medium text-default-900">
                                  {device.updatedAt
                                    ? new Date(
                                        device.updatedAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </div>
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
                  <InfoField label="Wallet ID" value={customer.Wallet?.wallet_id || "N/A"} />
                  <InfoField label="Account Number" value={customer.Wallet?.accountNumber || "N/A"} />
                  <InfoField label="Bank Name" value={customer.Wallet?.bankName || "N/A"} />
                  <InfoField label="Account Name" value={customer.Wallet?.accountName || "N/A"} />
                  <InfoField label="Current Balance" value={`₦${customer.WalletBalance?.balance?.toLocaleString() || "N/A"}`} />
                  <InfoField label="Last Balance" value={`₦${customer.WalletBalance?.lastBalance?.toLocaleString() || "N/A"}`} />
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
                              ? new Date(mandate.createdAt).toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">
                            Updated At
                          </div>
                          <div className="font-medium text-default-900">
                            {mandate.updatedAt
                              ? new Date(mandate.updatedAt).toLocaleString()
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
                              {transaction.amount !== undefined
                                ? `${
                                    transaction.currency
                                  } ${transaction.amount.toLocaleString()}`
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
                                  ).toLocaleString()}`
                                : `${transaction.currency} 0`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                              {transaction.newBalance !== undefined &&
                              transaction.newBalance !== null
                                ? `${transaction.currency} ${Number(
                                    transaction.newBalance
                                  ).toLocaleString()}`
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
                              {transaction.charge !== undefined
                                ? `${
                                    transaction.currency
                                  } ${transaction.charge.toLocaleString()}`
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
                                ? new Date(transaction.paid_at).toLocaleString()
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

            {/* Overdue Repayment */}
            {hasPermission(role, "canViewOverDuePayments", userEmail) && (
              <InfoCard
                title="Overdue Repayment"
                icon={<Clock className="w-5 h-5 text-default-600" />}
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
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                        >
                          Reason
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
                          Next Retry
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
                      {/* Sample row - Replace with actual data mapping */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                          1
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                          ₦50
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                          Testing
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                          2025-06-24
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                          2025-06-24
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                            Retry Debit
                          </button>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                            Delete
                          </button>
                        </td>
                      </tr>
                      {/* No records state */}
                      {(!customer?.LoanRecord ||
                        customer.LoanRecord.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <EmptyState
                              title="No Overdue Repayments"
                              description="There are no overdue repayments to display at this time."
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
            )}

            {/* Device Activity Log */}
            {hasPermission(role, "canViewDeviceActivityLog", userEmail) && (
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
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                        >
                          Updated By
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
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
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
                    </tbody>
                  </table>
                </div>
              </InfoCard>
            )}

            {/* COMMUNICATION LOG */}
            {hasPermission(role, "canViewCommunicationLog", userEmail) && (
              <InfoCard
                title="Communication LOG"
                icon={<Users className="w-5 h-5 text-default-600" />}
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
                          Message
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                        >
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-default-200">
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <EmptyState
                            title="No Communication Logs"
                            description="There are no messages to display at this time."
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
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                            }
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Post Communication Log */}
                <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
                  <div className="p-4">
                    <FormField
                      label="Post Communication"
                      htmlFor="message"
                      type="text"
                      id="message"
                      placeholder="Enter Communication Message"
                      value={""}
                      size="sm"
                    />
                    <Button
                      className="mt-4"
                      size="sm"
                      color="primary"
                      variant="solid"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </InfoCard>
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
                </div>
              </ModalBody>
              <ModalFooter className="flex gap-2">
                <Button
                  color="success"
                  variant="solid"
                  onPress={() =>
                    deviceActionData &&
                    handleDeviceAction(
                      deviceActionData.action,
                      deviceActionData.imei
                    )
                  }
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

      <Modal
        isOpen={isCreateWallet}
        onClose={onCreateWalletClose}
        size="lg"
      >
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
    </div>
  );
}
