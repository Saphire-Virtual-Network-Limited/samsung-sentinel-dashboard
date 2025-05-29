"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { getApprovedReferees, getUnapprovedReferees, getRejectedReferees, verifyCustomerReferenceNumber, showToast } from "@/lib";
import { SelectField } from "@/components/reususables/form";
import useSWR from "swr";

type CustomerRecord = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  bvn: string;
  dob: string;
  dobMisMatch: boolean;
  createdAt: string;
  updatedAt: string;
  customerLoanDiskId: string;
  channel: string;
  bvnPhoneNumber: string;
  mainPhoneNumber: string;
  mbeId: string | null;
  monoCustomerConnectedCustomerId: string;
  CustomerKYC?: Array<{
    kycId: string;
    customerId: string;
    phone2: string;
    phone3: string;
    houseNumber: string;
    streetAddress: string;
    nearestBusStop: string;
    localGovernment: string;
    state: string;
    town: string;
    occupation: string;
    businessName: string;
    applicantBusinessAddress: string;
    applicantAddress: string;
    source: string;
    createdAt: string;
    updatedAt: string;
    status2Comment: string | null;
    status3Comment: string | null;
    channel: string;
    phone2Status: string;
    phone3Status: string;
  }>;
  LoanRecord?: Array<{
    loanRecordId: string;
    customerId: string;
    loanDiskId: string;
    lastPoint: string;
    channel: string;
    loanStatus: string;
    createdAt: string;
    updatedAt: string;
    loanAmount: number;
    deviceId: string;
    downPayment: number;
    insurancePackage: string;
    insurancePrice: number;
    mbsEligibleAmount: number;
    payFrequency: string;
    storeId: string;
    devicePrice: number;
    deviceAmount: number;
    monthlyRepayment: number;
    duration: number;
    interestAmount: number;
  }>;
};

interface SingleRefereeViewProps {
  status: string;
  id: string;
  role?: string;
}

export default function SingleRefereeView({ status, id, role = 'verify' }: SingleRefereeViewProps) {
  const router = useRouter();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [refereeType, setRefereeType] = useState<"referee1" | "referee2" | null>(null);
  const [reason, setReason] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const { data: response, error, isLoading } = useSWR(
    status && id ? [status, id] : null,
    async () => {
      let result;
      if (status === 'approved-referees') {
        result = await getApprovedReferees();
      } else if (status === 'unapproved-referees') {
        result = await getUnapprovedReferees();
      } else if (status === 'rejected-referees') {
        result = await getRejectedReferees();
      } else {
        throw new Error('Invalid status');
      }
      return result;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 0,
      refreshInterval: 0,
      shouldRetryOnError: false,
      keepPreviousData: true,
      revalidateIfStale: true
    }
  );

  

  const customer = useMemo(() => {
    if (!response?.data) return null;
    return response.data.find((c: CustomerRecord) => c.customerId === id);
  }, [response?.data, id]);

  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        message: error.message || "Failed to fetch customer data",
        duration: 3000,
      });
    }
  }, [error]);

  useEffect(() => {
    if (response?.data && !customer) {
      showToast({
        type: "error",
        message: "Customer not found",
        duration: 3000,
      });
    }
  }, [response?.data, customer]);

  const handleBack = () => {
    router.push(`/access/${role}/referees/${status}`);
  };

  const handleApproveReferee = async (type: "referee1" | "referee2") => {
    if (!customer) return;
    
    setIsButtonLoading(true);
    try {
      const phoneNumber = type === "referee1" 
        ? String(customer?.CustomerKYC?.[0]?.phone2)
        : String(customer?.CustomerKYC?.[0]?.phone3);

      const verifyCustomerReferenceNumberDetails = {
        customerId: customer.customerId,
        phoneNumber,
        phoneVerified: true,
        comment: `Referee ${type === "referee1" ? "1" : "2"} has been verified`,
      };

      await verifyCustomerReferenceNumber(verifyCustomerReferenceNumberDetails);
      showToast({
        type: "success",
        message: `Referee ${type === "referee1" ? "1" : "2"} verified successfully`,
        duration: 3000,
      });
      router.refresh();
      router.back();
    } catch (error: any) {
      console.error(`Failed to verify referee ${type === "referee1" ? "1" : "2"}`, error);
      showToast({
        type: "error",
        message: error.message || `Failed to verify referee ${type === "referee1" ? "1" : "2"}`,
        duration: 5000,
      });
    } finally {
      setIsButtonLoading(false);
      setShowApproveModal(false);
    }
  };

  const handleRejectReferee = async (type: "referee1" | "referee2") => {
    if (!customer) return;

    setIsButtonLoading(true);
    try {
      const phoneNumber = type === "referee1"
        ? String(customer?.CustomerKYC?.[0]?.phone2)
        : String(customer?.CustomerKYC?.[0]?.phone3);

      const verifyCustomerReferenceNumberDetails = {
        customerId: customer.customerId,
        phoneNumber,
        phoneVerified: false,
        comment: reason,
      };

      await verifyCustomerReferenceNumber(verifyCustomerReferenceNumberDetails);
      showToast({
        type: "success",
        message: `Referee ${type === "referee1" ? "1" : "2"} rejected successfully`,
        duration: 3000,
      });
      router.refresh();
      router.back();
    } catch (error: any) {
      console.error(`Failed to reject referee ${type === "referee1" ? "1" : "2"}`, error);
      showToast({
        type: "error",
        message: error.message || `Failed to reject referee ${type === "referee1" ? "1" : "2"}`,
        duration: 5000,
      });
    } finally {
      setIsButtonLoading(false);
      setShowRejectModal(false);
    }
  };

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
          <h2 className="text-2xl font-semibold text-default-900 mb-2">Customer Not Found</h2>
          <p className="text-default-500 mb-4">The requested customer information could not be found.</p>
          <Button
            variant="flat"
            color="primary"
            startContent={<ArrowLeft />}
            onPress={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50">
      {/* Header Section */}
      <div className="bg-white border-b border-default-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              {/* <Button
                variant="light"
                startContent={<ArrowLeft />}
                className="hover:bg-default-100 transition-colors"
                onPress={() => router.back()}>
                Back
              </Button> */}
              <div>
                <h1 className="text-lg font-bold text-default-900">
                  {customer.firstName} {customer.lastName}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Chip
                color={customer.dobMisMatch ? "danger" : "success"}
                variant="flat"
                className="font-medium"
              >
                {customer.dobMisMatch === false ? 'DOB Verified' : 'DOB Mismatch'}
              </Chip>
             
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-6 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Personal Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-default-500 mb-1">Customer ID</div>
                    <div className="font-medium text-default-900">{customer.customerId || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Full Name</div>
                    <div className="font-medium text-default-900">
                      {customer.firstName && customer.lastName 
                        ? `${customer.firstName} ${customer.lastName}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Email</div>
                    <div className="font-medium text-default-900">{customer.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">BVN</div>
                    <div className="font-medium text-default-900">{customer.bvn || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Date of Birth</div>
                    <div className="font-medium text-default-900">{customer.dob || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">BVN Phone</div>
                    <div className="font-medium text-default-900">{customer.bvnPhoneNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Main Phone</div>
                    <div className="font-medium text-default-900">{customer.mainPhoneNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Registered By</div>
                    <div className="font-medium text-default-900">{customer.mbeId || 'N/A'}</div>
                  </div>
                  {/* <div>
                    <div className="text-sm text-default-500 mb-1">Mono Customer Connected ID</div>
                    <div className="font-medium text-default-900">{customer.monoCustomerConnectedCustomerId || 'N/A'}</div>
                  </div> */}
                  {/* <div>
                    <div className="text-sm text-default-500 mb-1">Customer Loan Disk ID</div>
                    <div className="font-medium text-default-900">{customer.customerLoanDiskId || 'N/A'}</div>
                  </div> */}
                  <div>
                    <div className="text-sm text-default-500 mb-1">Created At</div>
                    <div className="font-medium text-default-900">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Updated At</div>
                    <div className="font-medium text-default-900">
                      {customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Information */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-6 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">KYC Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-default-500 mb-1">Address</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.applicantAddress || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Business Address</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.applicantBusinessAddress || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">House Number</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.houseNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Street Address</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.streetAddress || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Nearest Bus Stop</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.nearestBusStop || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Local Government</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.localGovernment || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">State</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.state || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Town</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.town || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Occupation</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.occupation || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Business Name</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.businessName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Source</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.source || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">KYC Created At</div>
                    <div className="font-medium text-default-900">
                      {customer.CustomerKYC?.[0]?.createdAt ? new Date(customer.CustomerKYC?.[0]?.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">KYC Updated At</div>
                    <div className="font-medium text-default-900">
                      {customer.CustomerKYC?.[0]?.updatedAt ? new Date(customer.CustomerKYC?.[0]?.updatedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">KYC Channel</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.channel || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Referees and Loan Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referees Section */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-6 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Referees</h3>
              </div>
              <div className="p-6 space-y-8">
                {/* Referee 1 */}
                <div className="bg-default-50 rounded-xl p-6 border border-default-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-default-900">Referee 1</h4>
                    <Chip 
                      color={
                        customer.CustomerKYC?.[0]?.phone2Status === 'APPROVED' 
                          ? 'success' 
                          : customer.CustomerKYC?.[0]?.phone2Status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      variant="flat"
                      className="font-medium"
                    >
                      {customer.CustomerKYC?.[0]?.phone2Status || 'PENDING'}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-default-500 mb-1">Phone Number</div>
                      <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.phone2 || 'N/A'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-default-500 mb-1">Comment</div>
                      <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.status2Comment || 'N/A'}</div>
                    </div>
                  </div>
                  {customer.CustomerKYC?.[0]?.phone2 && customer.CustomerKYC?.[0]?.phone2 !== 'N/A' && (
                    <div className="flex gap-4">
                      {customer.CustomerKYC?.[0]?.phone2Status !== 'APPROVED' && (
                        <Button
                          color="success"
                          variant="flat"
                          className="font-medium"
                          onPress={() => {
                            setRefereeType("referee1");
                            setShowApproveModal(true);
                          }}>
                          Approve
                        </Button>
                      )}
                      {customer.CustomerKYC?.[0]?.phone2Status !== 'REJECTED' && (
                        <Button
                          color="danger"
                          variant="flat"
                          className="font-medium"
                          onPress={() => {
                            setRefereeType("referee1");
                            setShowRejectModal(true);
                          }}>
                          Reject
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Referee 2 */}
                <div className="bg-default-50 rounded-xl p-6 border border-default-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-default-900">Referee 2</h4>
                    <Chip 
                      color={
                        customer.CustomerKYC?.[0]?.phone3Status === 'APPROVED' 
                          ? 'success' 
                          : customer.CustomerKYC?.[0]?.phone3Status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      variant="flat"
                      className="font-medium"
                    >
                      {customer.CustomerKYC?.[0]?.phone3Status || 'PENDING'}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-default-500 mb-1">Phone Number</div>
                      <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.phone3 || 'N/A'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-default-500 mb-1">Comment</div>
                      <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.status3Comment || 'N/A'}</div>
                    </div>
                  </div>
                  {customer.CustomerKYC?.[0]?.phone3 && customer.CustomerKYC?.[0]?.phone3 !== 'N/A' && (
                    <div className="flex gap-4">
                      {customer.CustomerKYC?.[0]?.phone3Status !== 'APPROVED' && (
                        <Button
                          color="success"
                          variant="flat"
                          className="font-medium"
                          onPress={() => {
                            setRefereeType("referee2");
                            setShowApproveModal(true);
                          }}>
                          Approve
                        </Button>
                      )}
                      {customer.CustomerKYC?.[0]?.phone3Status !== 'REJECTED' && (
                        <Button
                          color="danger"
                          variant="flat"
                          className="font-medium"
                          onPress={() => {
                            setRefereeType("referee2");
                            setShowRejectModal(true);
                          }}>
                          Reject
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loan Information */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-6 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Loan Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Amount</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.loanAmount !== undefined 
                        ? `₦${customer.LoanRecord[0].loanAmount.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Monthly Repayment</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.monthlyRepayment !== undefined 
                        ? `₦${customer.LoanRecord[0].monthlyRepayment.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Duration</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.duration !== undefined 
                        ? `${customer.LoanRecord[0].duration} months` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Interest Amount</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.interestAmount !== undefined 
                        ? `₦${customer.LoanRecord[0].interestAmount.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Status</div>
                    <div className="font-medium">
                      <Chip 
                        color={
                          customer.LoanRecord?.[0]?.loanStatus === 'APPROVED' 
                            ? 'success' 
                            : customer.LoanRecord?.[0]?.loanStatus === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                        variant="flat"
                        className="font-medium"
                      >
                        {customer.LoanRecord?.[0]?.loanStatus || 'PENDING'}
                      </Chip>
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Record ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.loanRecordId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Disk ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.loanDiskId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Last Point</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.lastPoint || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Device ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.deviceId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Down Payment</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.downPayment !== undefined
                        ? `₦${customer.LoanRecord[0].downPayment.toLocaleString()}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Insurance Package</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.insurancePackage || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Insurance Price</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.insurancePrice !== undefined
                        ? `₦${customer.LoanRecord[0].insurancePrice.toLocaleString()}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">MBS Eligible Amount</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.mbsEligibleAmount !== undefined
                        ? `₦${customer.LoanRecord[0].mbsEligibleAmount.toLocaleString()}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Pay Frequency</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.payFrequency || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Store ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.storeId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Device Price</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.devicePrice !== undefined
                        ? `₦${customer.LoanRecord[0].devicePrice.toLocaleString()}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Device Amount</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.deviceAmount !== undefined
                        ? `₦${customer.LoanRecord[0].deviceAmount.toLocaleString()}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Created At</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.createdAt ? new Date(customer.LoanRecord[0].createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Updated At</div>
                    <div className="font-medium text-default-900">
                      {customer.LoanRecord?.[0]?.updatedAt ? new Date(customer.LoanRecord[0].updatedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Channel</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.channel || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div className="p-6 border-b border-default-200">
              <h3 className="text-xl font-semibold text-default-900">Approve Referee</h3>
            </div>
            <div className="p-6">
              <div className="mb-6 text-default-600">Are you sure you want to approve this referee?</div>
              <div className="flex justify-end gap-4">
                <Button
                  color="danger"
                  variant="light"
                  className="font-medium"
                  onPress={() => setShowApproveModal(false)}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  className="font-medium"
                  isLoading={isButtonLoading}
                  onPress={() => refereeType && handleApproveReferee(refereeType)}>
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div className="p-6 border-b border-default-200">
              <h3 className="text-xl font-semibold text-default-900">Reject Referee</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <SelectField
                  label="Select a reason"
                  placeholder="Select Reason"
                  required
                  options={[
                    { label: "Referee not answering calls", value: "Referee not answering calls" },
                    { label: "Number switched off / unreachable", value: "Number switched off / unreachable" },
                    { label: "Referee does not know the customer", value: "Referee does not know the customer" },
                    { label: "Referee advised us to cancel the loan", value: "Referee advised us to cancel the loan" },
                    { label: "Referee declined standing as a referee", value: "Referee declined standing as a referee" },
                    { label: "Others", value: "Others" }
                  ]}
                  htmlFor="reason"
                  id="reason"
                  isInvalid={false}
                  errorMessage="Reason is required"
                  onChange={(e) => setReason(e.toString())}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  color="danger"
                  variant="light"
                  className="font-medium"
                  onPress={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  className="font-medium"
                  isLoading={isButtonLoading}
                  onPress={() => refereeType && handleRejectReferee(refereeType)}>
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}