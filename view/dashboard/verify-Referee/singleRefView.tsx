"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Snippet } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { getApprovedReferees, getUnapprovedReferees, getRejectedReferees, verifyCustomerReferenceNumber, showToast, updateLinkStatus } from "@/lib";
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
  inputtedDob: string;
  bvnPhoneNumber: string;
  mainPhoneNumber: string;
  mbeId: string | null;
  monoCustomerConnectedCustomerId: string;

  regBy?: {
        title: string;
        createdAt: string;
        mbeId: string;
        mbe_old_id: string;
        updatedAt: string;
        firstname: string;
        lastname: string;
        phone: string;
        state: string | null;
        username: string;
        accountStatus: string;
        assignedStoreBranch: string | null;
        bvn: string | null;
        bvnPhoneNumber: string | null;
        channel: string | null;
        dob: string | null;
        email: string | null;
        isActive: boolean;
        otp: string | null;
        otpExpiry: string | null;
        password: string | null;
        role: string;
        tokenVersion: number;
      },
  CustomerKYC?: Array<{
    kycId: string;
    customerId: string;
    phone2: string;
    phone3: string;
    phone4: string;
    phone5: string;
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
    linkStatus: string;
    phoneApproved: string;
    generalComment: string;
    generalStatus: string;
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
    deviceName: string;
    deviceAmount: number;
    monthlyRepayment: number;
    duration: number;
    interestAmount: number;
  }>;
};

interface SingleRefereeViewProps {
  id: string;
  role?: string;
}

export default function SingleRefereeView({ id, role = 'verify' }: SingleRefereeViewProps) {
  const router = useRouter();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const { data: response, error, isLoading } = useSWR(
    id ? ['referee', id] : null,
    async () => {
      const [approved, unapproved, rejected] = await Promise.all([
        getApprovedReferees(),
        getUnapprovedReferees(),
        getRejectedReferees()
      ]);
      
      // Combine all results and find the customer
      const allReferees = [
        ...(approved?.data || []),
        ...(unapproved?.data || []),
        ...(rejected?.data || [])
      ];
      
      return { data: allReferees };
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

  // useEffect(() => {
  //   const handleLinkStatus = async () => {
  //     try {
  //       await updateLinkStatus(customer?.customerId);
  //     } catch (error: any) {
  //       showToast({ 
  //         type: "error", 
  //         message: error.message || "A user is already on the customer's account", 
  //         duration: 8000,
  //       });
  //       router.push(`/access/${role}/referees/unapproved-referees/`);
  //       console.error("Failed to update link status", error);
  //     }
  //   };
    
  //   if (customer?.customerId) {
  //     handleLinkStatus();
  //   }
  // }, [customer?.customerId, role, router]);

  const handleBack = () => {
    router.push(`/access/${role}/referees/approved-referees/${customer.customerId}`);
  };

  const phones = useMemo(() => {
    const phoneOptions = [
      {
        id: 1,
        label: "Referee 1",
        value: customer?.CustomerKYC?.[0]?.phone2,
      },
      {
        id: 2,
        label: "Referee 2",
        value: customer?.CustomerKYC?.[0]?.phone3,
      },
      {
        id: 3,
        label: "Referee 3",
        value: customer?.CustomerKYC?.[0]?.phone4,
      },
      {
        id: 4,
        label: "Referee 4",
        value: customer?.CustomerKYC?.[0]?.phone5,
      },
    ];

    // Filter out phones with null/undefined values and ensure each has a unique key
    return phoneOptions
      .filter(phone => phone.value)
      .map(phone => ({
        ...phone,
        key: `phone-${phone.id}-${phone.value}`,
        label: `${phone.label} - ${phone.value}` // Combine label and value in the display text
      }));
  }, [customer?.CustomerKYC]);

  const handlePhoneChange = (value: string) => {
    setSelectedPhone([value]);
  };

  const handleApproveReferee = async () => {
    
    setIsButtonLoading(true);
    try {
      const verifyCustomerReferenceNumberDetails = {
        customerId: customer.customerId,
        phoneNumber: selectedPhone[0], // Convert array to single string
        phoneVerified: true,
        comment: `Referee has been verified`,
      };

      await verifyCustomerReferenceNumber(verifyCustomerReferenceNumberDetails);
      showToast({ type: "success", message: "Referee verified successfully, Please check approved referees", duration: 4000,});
      router.push(`/access/${role}/referees/approved-referees/${customer.customerId}`);
    } catch (error: any) {
      console.error("Failed to verify referee", error);

      showToast({ type: "error", message: error.message || "Failed to verify referee", duration: 5000,});
    } finally {
      setIsButtonLoading(false);
      setShowApproveModal(false);
    }
  };

  const handleRejectReferee = async () => {
    if (!customer) return;

    setIsButtonLoading(true);
    try {
      const verifyCustomerReferenceNumberDetails = {
        customerId: customer.customerId,
        phoneNumber: selectedPhone[0], // Use selected phone number
        phoneVerified: false,
        comment: reason,
      };

      await verifyCustomerReferenceNumber(verifyCustomerReferenceNumberDetails);
      showToast({ type: "success", message: "Referee rejected successfully, Please check rejected referees", duration: 4000,});
      router.push(`/access/${role}/referees/rejected-referees/${customer.customerId}`);
    } catch (error: any) {
      console.error("Failed to reject referee", error);
      showToast({
        type: "error",
        message: error.message || "Failed to reject referee",
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
        <div className=" py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
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

      <div className=" py-8">
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
                    <div className="font-medium text-default-900 flex items-center justify-between">
                      {customer.customerId || 'N/A'} 

                      <Snippet
                        codeString={customer.customerId}
                        classNames={{
                          base: "p-0",        // Adds padding to the outer container
                          content: "p-0",    // Adds horizontal padding to the content wrapper
                        }}
                        className="p-0"
                        size="sm"
                        hideSymbol
                        hideCopyButton={false}  // show only the copy icon
                        
                      />
                    </div>
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
                    <div className="text-sm text-default-500 mb-1">BVN Date of Birth</div>
                    <div className="font-medium text-default-900">{customer.dob || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Inputted Date of Birth</div>
                    <div className="font-medium text-default-900">
                      {customer.inputtedDob ? new Date(customer.inputtedDob).toISOString().split('T')[0] : 'N/A'}
                    </div>
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
                    <div className="text-sm text-default-500 mb-1">Business Address</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.applicantBusinessAddress || 'N/A'}</div>
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
              <div className="p-6 border-b border-default-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-default-900">Referees</h3>
                <p className={`text-sm mb-1 ${
                  customer.CustomerKYC?.[0]?.generalStatus === 'APPROVED' ? 'text-success-500 font-medium bg-success-50 px-4 py-1 rounded-md' :
                  customer.CustomerKYC?.[0]?.generalStatus === 'REJECTED' ? 'text-danger-500 font-medium bg-danger-50 px-4 py-1 rounded-md' :
                  'text-warning-500 font-medium bg-warning-50 px-4 py-1 rounded-md'
                }`}>
                  {customer.CustomerKYC?.[0]?.generalStatus}
                </p>
              </div>
              <div className="p-6 space-y-8">

                <div className="flex items-center space-x-4">

                <SelectField
                  key="phone-select"
                  htmlFor="phone-select"
                  id="phone-select"
                  placeholder={isLoading ? "Loading referees..." : phones?.length > 0 ? "Choose Referees" : "No referee number available"}
                  defaultSelectedKeys={selectedPhone}
                  onChange={(value) => handlePhoneChange(value as string)}
                  options={phones}
                  size="md"
                />

                        {customer?.CustomerKYC?.[0]?.generalStatus === 'PENDING' && (
                          <>
                            <Button
                              color="success"
                              variant="flat"
                              className="font-medium"
                              isDisabled={!selectedPhone.length}
                              onPress={() => {
                                setShowApproveModal(true);
                              }}>
                              Approve
                            </Button>

                            <Button
                              color="danger"
                              variant="flat"
                              className="font-medium"
                              isDisabled={!selectedPhone.length}
                              onPress={() => {
                                setShowRejectModal(true);
                              }}>
                              Reject
                            </Button>
                          </>
                        )}
                        {customer?.CustomerKYC?.[0]?.generalStatus === 'APPROVED' && (
                          <Button
                            color="danger"
                            variant="flat"
                            className="font-medium"
                            isDisabled={!selectedPhone.length}
                            onPress={() => {
                              setShowRejectModal(true);
                            }}>
                            Reject
                          </Button>
                        )}
                        
                      </div>

              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-default-50 rounded-lg p-4">
                    <p>Referee 1</p>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.phone2 || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <p>Referee 2</p>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.phone3 || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <p>Referee 3</p>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.phone4 || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <p>Referee 4</p>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.phone5 || 'N/A'}</div>
                  </div>
                 
                </div>
                {customer.CustomerKYC?.[0]?.phoneApproved && (
                  <div className="bg-green-50 rounded-lg p-4 mt-4">
                    <p>Approved Referee number</p>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.phoneApproved}</div>
                  </div>
                )}
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
                    <div className="text-sm text-default-500 mb-1">Device Name</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.deviceName || 'N/A'}</div>
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
                    <div className="text-sm text-default-500 mb-1">Device Amount with insurance</div>
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
                  onPress={handleApproveReferee}>
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
                  onPress={handleRejectReferee}>
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