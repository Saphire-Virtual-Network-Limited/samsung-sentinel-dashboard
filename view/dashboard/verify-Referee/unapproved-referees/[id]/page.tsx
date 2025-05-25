"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { getUnapprovedReferees, verifyCustomerReferenceNumber, showToast } from "@/lib";
import { SelectField } from "@/components/reususables/form";

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

export default function SingleCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [refereeType, setRefereeType] = useState<"referee1" | "referee2" | null>(null);
  const [reason, setReason] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await getUnapprovedReferees();
        const customerData = response.data.find(
          (c: CustomerRecord) => c.customerId === params.id
        );
        if (customerData) {
          setCustomer(customerData);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [params.id]);

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
    return <div>Loading...</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="light"
          startContent={<ArrowLeft />}
          onPress={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-default-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-default-500">Customer ID</p>
              <p className="font-medium">{customer.customerId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Full Name</p>
              <p className="font-medium">
                {customer.firstName && customer.lastName 
                  ? `${customer.firstName} ${customer.lastName}` 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Email</p>
              <p className="font-medium">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Date of Birth</p>
              <p className="font-medium">{customer.dob || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">BVN Phone</p>
              <p className="font-medium">{customer.bvnPhoneNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Main Phone</p>
              <p className="font-medium">{customer.mainPhoneNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">DOB Mismatch</p>
              <p className="font-medium">
                <Chip color={customer.dobMisMatch ? "danger" : "success"}>
                  {customer.dobMisMatch ? 'Yes' : 'No'}
                </Chip>
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Registered By</p>
              <p className="font-medium">{customer.mbeId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* KYC Information */}
        <div className="bg-default-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">KYC Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-default-500">Address</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.applicantAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Business Address</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.applicantBusinessAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Occupation</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.occupation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Business Name</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.businessName || 'N/A'}</p>
            </div>

            {/* Referee 1 Section */}
            <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Referee 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-default-500">Phone Number</p>
                  <p className="font-medium">{customer.CustomerKYC?.[0]?.phone2 || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Status</p>
                  <p className="font-medium">
                    <Chip 
                      color={
                        customer.CustomerKYC?.[0]?.phone2Status === 'APPROVED' 
                          ? 'success' 
                          : customer.CustomerKYC?.[0]?.phone2Status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {customer.CustomerKYC?.[0]?.phone2Status || 'PENDING'}
                    </Chip>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Comment</p>
                  <p className="font-medium">{customer.CustomerKYC?.[0]?.status2Comment || 'N/A'}</p>
                </div>
              </div>
              {customer.CustomerKYC?.[0]?.phone2 && customer.CustomerKYC?.[0]?.phone2 !== 'N/A' && (
                <div className="flex gap-4">
                  {customer.CustomerKYC?.[0]?.phone2Status !== 'APPROVED' && (
                    <Button
                      color="success"
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

            {/* Referee 2 Section */}
            <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Referee 2</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-default-500">Phone Number</p>
                  <p className="font-medium">{customer.CustomerKYC?.[0]?.phone3 || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Status</p>
                  <p className="font-medium">
                    <Chip 
                      color={
                        customer.CustomerKYC?.[0]?.phone3Status === 'APPROVED' 
                          ? 'success' 
                          : customer.CustomerKYC?.[0]?.phone3Status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {customer.CustomerKYC?.[0]?.phone3Status || 'PENDING'}
                    </Chip>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Comment</p>
                  <p className="font-medium">{customer.CustomerKYC?.[0]?.status3Comment || 'N/A'}</p>
                </div>
              </div>
              {customer.CustomerKYC?.[0]?.phone3 && customer.CustomerKYC?.[0]?.phone3 !== 'N/A' && (
                <div className="flex gap-4">
                  {customer.CustomerKYC?.[0]?.phone3Status !== 'APPROVED' && (
                    <Button
                      color="success"
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

            {/* Additional KYC Information */}
            <div>
              <p className="text-sm text-default-500">House Number</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.houseNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Street Address</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.streetAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Nearest Bus Stop</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.nearestBusStop || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Local Government</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.localGovernment || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">State</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.state || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Town</p>
              <p className="font-medium">{customer.CustomerKYC?.[0]?.town || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Loan Information */}
        <div className="bg-default-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Loan Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-default-500">Loan Amount</p>
              <p className="font-medium">
                {customer.LoanRecord?.[0]?.loanAmount !== undefined 
                  ? `₦${customer.LoanRecord[0].loanAmount.toLocaleString()}` 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Monthly Repayment</p>
              <p className="font-medium">
                {customer.LoanRecord?.[0]?.monthlyRepayment !== undefined 
                  ? `₦${customer.LoanRecord[0].monthlyRepayment.toLocaleString()}` 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Duration</p>
              <p className="font-medium">
                {customer.LoanRecord?.[0]?.duration !== undefined 
                  ? `${customer.LoanRecord[0].duration} months` 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Interest Amount</p>
              <p className="font-medium">
                {customer.LoanRecord?.[0]?.interestAmount !== undefined 
                  ? `₦${customer.LoanRecord[0].interestAmount.toLocaleString()}` 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Loan Status</p>
              <p className="font-medium">
                <Chip 
                  color={
                    customer.LoanRecord?.[0]?.loanStatus === 'APPROVED' 
                      ? 'success' 
                      : customer.LoanRecord?.[0]?.loanStatus === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {customer.LoanRecord?.[0]?.loanStatus || 'PENDING'}
                </Chip>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Approve Referee</h3>
            <p className="mb-4">Are you sure you want to approve this referee?</p>
            <div className="flex justify-end gap-4">
              <Button
                color="danger"
                variant="light"
                onPress={() => setShowApproveModal(false)}>
                Cancel
              </Button>
              <Button
                color="success"
                isLoading={isButtonLoading}
                onPress={() => refereeType && handleApproveReferee(refereeType)}>
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Referee</h3>
            <div className="mb-4">
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
                onPress={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                color="success"
                isLoading={isButtonLoading}
                onPress={() => refereeType && handleRejectReferee(refereeType)}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 