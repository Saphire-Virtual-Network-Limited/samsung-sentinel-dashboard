"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { getAllCustomerRecord, showToast } from "@/lib";
import GenericTable, { ColumnDef } from "@/components/reususables/custom-ui/tableUi";

type CustomerRecord = {
	customerId: string;
	firstName: string;
	lastName: string;
	email: string;
	bvn: string;
	dob: string;
  inputtedDob: string;
	
	dobMisMatch: boolean;
	createdAt: string;
	updatedAt: string;
	customerLoanDiskId: string;
	channel: string;
	bvnPhoneNumber: string;
	mainPhoneNumber: string;
	mbeId: string;
	monoCustomerConnectedCustomerId: string;
	fullName?: string;
	age?: number;
	status?: string;
	Wallet?: {
		wallet_id: string;
		accountNumber: string;
		bankName: string;
		dva_id: number;
		accountName: string;
		bankId: number;
		currency: string;
		cust_code: string;
		cust_id: number;
		userId: string;
		created_at: string;
		updated_at: string;
		customerId: string;
	};
	WalletBalance?: {
		balanceId: string;
		userId: string;
		balance: number;
		lastBalance: number;
		created_at: string;
		updated_at: string;
		customerId: string;
	};
	TransactionHistory?: Array<{
		transactionHistoryId: string;
		amount: number;
		paymentType: string;
		prevBalance: number;
		newBalance: number;
		paymentReference: string;
		extRef: string;
		currency: string;
		channel: string;
		charge: number;
		chargeNarration: string;
		senderBank: string;
		senderAccount: string;
		recieverBank: string;
		recieverAccount: string;
		paymentDescription: string;
		paid_at: string;
		createdAt: string;
		updatedAt: string;
		userid: string;
		customersCustomerId: string;
	}>;
	CustomerKYC?: Array<{
		kycId: string;
		customerId: string;

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

    phone2: string;
	phone3: string;
	phone4: string;
	phone5: string;
	phoneApproved: string;
  generalStatus: string;
		createdAt: string;
		updatedAt: string;
		status2Comment: string | null;
		status3Comment: string | null;
		channel: string;
		phone2Status: string;
		phone3Status: string;
	}>;
	CustomerAccountDetails?: Array<{
		customerAccountDetailsId: string;
		customerId: string;
		accountNumber: string;
		bankCode: string;
		channel: string;
		createdAt: string;
		updatedAt: string;
		bankID: number;
		bankName: string;
	}>;
	CustomerMandate?: Array<{
		customerMandateId: string;
		customerId: string;
		mandateId: string;
		status: string;
		monoCustomerId: string;
		mandate_type: string;
		debit_type: string;
		ready_to_debit: boolean;
		approved: boolean;
		start_date: string;
		end_date: string;
		reference: string;
		channel: string;
		createdAt: string;
		updatedAt: string;
		message: string;
	}>;
	LoanRecord?: Array<{
		loanRecordId: string;
		customerId: string;
		loanDiskId: string;
		customerLoanDiskId: string;
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
		deviceName: string;
		LoanRecordCard: any[];
		store: {
			storeOldId: number;
			storeName: string;
			city: string;
			state: string;
			region: string | null;
			address: string;
			accountNumber: string;
			accountName: string;
			bankName: string;
			bankCode: string;
			phoneNumber: string;
			storeEmail: string;
			longitude: number;
			latitude: number;
			clusterId: number;
			partner: string;
			storeOpen: string;
			storeClose: string;
			createdAt: string;
			updatedAt: string;
			storeId: string;
		};
		device: {
			price: number;
			deviceModelNumber: string;
			SAP: number;
			SLD: number;
			createdAt: string;
			deviceManufacturer: string;
			deviceName: string;
			deviceRam: string | null;
			deviceScreen: string | null;
			deviceStorage: string | null;
			imageLink: string;
			newDeviceId: string;
			oldDeviceId: string;
			sentiprotect: number;
			updatedAt: string;
			deviceType: string;
			deviceCamera: any[];
			android_go: string;
		};
		StoresOnLoan: Array<{
			storeOnLoanId: string;
			storeId: string;
			loanRecordId: string;
			amount: number;
			status: string;
			createdAt: string;
			updatedAt: string;
			channel: string;
		}>;
		DeviceOnLoan: Array<{
			deviceOnLoanId: string;
			deviceId: string;
			loanRecordId: string;
			status: string;
			createdAt: string;
			updatedAt: string;
			channel: string;
			imei: string | null;
			amount: number;
			devicePrice: number;
		}>;
	}>;
	regBy: {
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
		stores: Array<{
			id: string;
			mbeOldId: string;
			storeOldId: number;
			mbeId: string | null;
			storeId: string | null;
			store: {
				storeOldId: number;
				storeName: string;
				city: string;
				state: string;
				region: string;
				address: string;
				accountNumber: string;
				accountName: string;
				bankName: string;
				bankCode: string;
				phoneNumber: string;
				storeEmail: string;
				longitude: number;
				latitude: number;
				clusterId: number;
				partner: string;
				storeOpen: string;
				storeClose: string;
				createdAt: string;
				updatedAt: string;
				storeId: string;
			};
		}>;
	};
	MonoCustomer?: {
		customerId: string;
		createdAt: string;
		updatedAt: string;
		email: string;
		name: string;
		connectedCustomerId: string;
		monourl: string;
		tempAccountId: string | null;
		CustomerAccounts: any[];
	};
};


export default function SingleCustomerPage() {  
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);




  useEffect(() => {
    const fetchCustomer = async () => {
      if (!params.id) {
        setIsLoading(false);
        return;
      }

      try {
        let response = await getAllCustomerRecord();
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
      } catch (error) {
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
          <div className="flex items-center space-x-2">
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

      <div className="  px-2  py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-1 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Personal Information</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
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
                    <div className="text-sm text-default-500 mb-1">MBE ID</div>
                    <div className="font-medium text-default-900">{customer.mbeId || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Mono Customer Connected ID</div>
                    <div className="font-medium text-default-900">{customer.monoCustomerConnectedCustomerId || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Channel</div>
                    <div className="font-medium text-default-900">{customer.channel || 'N/A'}</div>
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
                  <div>
                    <div className="text-sm text-default-500 mb-1">Customer Loan Disk ID</div>
                    <div className="font-medium text-default-900">{customer.customerLoanDiskId || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Information */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">KYC Information</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                  {/* <div>
                    <div className="text-sm text-default-500 mb-1">KYC ID</div>
                    <div className="font-medium text-default-900">{customer.CustomerKYC?.[0]?.kycId || 'N/A'}</div>
                  </div> */}
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

                {/* Referee Information */}
                <div className="mt-8 pt-8 border-t border-default-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-default-900 mb-4">KYC Status</h4>
                        <p className={`text-sm mb-1 ${
                        customer.CustomerKYC?.[0]?.generalStatus === 'APPROVED' ? 'text-success-500 font-medium bg-success-50 px-4 py-1 rounded-md' :
                        customer.CustomerKYC?.[0]?.generalStatus === 'REJECTED' ? 'text-danger-500 font-medium bg-danger-50 px-4 py-1 rounded-md' :
                        'text-warning-500 font-medium bg-warning-50 px-4 py-1 rounded-md'
                      }`}>
                        {customer.CustomerKYC?.[0]?.generalStatus}
                      </p>
                  </div>

                  <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
              </div>
            </div>

            {/* Registration Details */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
                <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Registed By:</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div>
                    <div className="text-sm text-default-500 mb-1">Title</div>
                    <div className="font-medium text-default-900">{customer.regBy?.title || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Full Name</div>
                    <div className="font-medium text-default-900">
                      {customer.regBy?.firstname && customer.regBy?.lastname 
                        ? `${customer.regBy.firstname} ${customer.regBy.lastname}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Phone</div>
                    <div className="font-medium text-default-900">{customer.regBy?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Username</div>
                    <div className="font-medium text-default-900">{customer.regBy?.username || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Account Status</div>
                    <div className="font-medium text-default-900">{customer.regBy?.accountStatus || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Role</div>
                    <div className="font-medium text-default-900">{customer.regBy?.role || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">State</div>
                    <div className="font-medium text-default-900">{customer.regBy?.state || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Assigned Store Branch</div>
                    <div className="font-medium text-default-900">{customer.regBy?.assignedStoreBranch || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Created At</div>
                    <div className="font-medium text-default-900">
                      {customer.regBy?.createdAt ? new Date(customer.regBy.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">Updated At</div>
                    <div className="font-medium text-default-900">
                      {customer.regBy?.updatedAt ? new Date(customer.regBy.updatedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">MBE ID</div>
                    <div className="font-medium text-default-900">{customer.regBy?.mbeId || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-default-500 mb-1">MBE Old ID</div>
                    <div className="font-medium text-default-900">{customer.regBy?.mbe_old_id || 'N/A'}</div>
                  </div>
                </div>

                {/* Store Information */}
                {customer.regBy?.stores && customer.regBy.stores.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-default-200">
                    <h4 className="text-base font-semibold text-default-900  mb-4">Store Information</h4>
                    <div className="grid grid-cols-1 gap-6">
                      {customer.regBy.stores.map((store, index) => (
                        <div key={index} className="bg-default-50 rounded-lg p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-default-500 mb-1">Store Name</div>
                              <div className="font-medium text-default-900">{store.store.storeName || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Address</div>
                              <div className="font-medium text-default-900">{store.store.address || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">City</div>
                              <div className="font-medium text-default-900">{store.store.city || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">State</div>
                              <div className="font-medium text-default-900">{store.store.state || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Region</div>
                              <div className="font-medium text-default-900">{store.store.region || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Phone Number</div>
                              <div className="font-medium text-default-900">{store.store.phoneNumber || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Store Email</div>
                              <div className="font-medium text-default-900">{store.store.storeEmail || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Bank Name</div>
                              <div className="font-medium text-default-900">
                                {store.store.bankName || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Account Number</div>
                              <div className="font-medium text-default-900">
                                {store.store.accountNumber || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Account Name</div>
                              <div className="font-medium text-default-900">
                                {store.store.accountName || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Bank Code</div>
                              <div className="font-medium text-default-900">
                                {store.store.bankCode || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Operating Hours</div>
                              <div className="font-medium text-default-900">
                                {store.store.storeOpen} - {store.store.storeClose}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Referees and Loan Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Loan Information */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Loan Information</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <div className="text-sm text-default-500 mb-1">Last Point</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.lastPoint || 'N/A'}</div>
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
                    <div className="text-sm text-default-500 mb-1">Device price with insurance</div>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
                <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Record ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.loanRecordId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Device ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.deviceId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Loan Disk ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.customerLoanDiskId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Store ID</div>
                    <div className="font-medium text-default-900">{customer.LoanRecord?.[0]?.storeId || 'N/A'}</div>
                  </div>
                </div>

                {/* Store on Loan Information */}
                <div className="mt-8 pt-8 border-t border-default-200">
                  <h4 className="text-base font-semibold text-default-900 mb-4">Store on Loan</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {customer.LoanRecord?.[0]?.StoresOnLoan && customer.LoanRecord[0].StoresOnLoan.length > 0 ? (
                      customer.LoanRecord[0].StoresOnLoan.map((store, index) => (
                        <div key={index} className="bg-default-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-default-500 mb-1">Store ID</div>
                              <div className="font-medium text-default-900">{store.storeId || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Amount</div>
                              <div className="font-medium text-default-900">
                                {store.amount !== undefined ? `₦${store.amount.toLocaleString()}` : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Status</div>
                              <div className="font-medium">
                                <Chip 
                                  color={
                                    store.status === 'PAID' 
                                      ? 'success' 
                                      : store.status === 'UNPAID'
                                      ? 'warning'
                                      : 'danger'
                                  }
                                  variant="flat"
                                  className="font-medium"
                                >
                                  {store.status || 'UNPAID'}
                                </Chip>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Channel</div>
                              <div className="font-medium text-default-900">{store.channel || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Created At</div>
                              <div className="font-medium text-default-900">
                                {store.createdAt ? new Date(store.createdAt).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Updated At</div>
                              <div className="font-medium text-default-900">
                                {store.updatedAt ? new Date(store.updatedAt).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-default-50 rounded-lg p-8 text-center">
                        <div className="flex flex-col items-center justify-center text-default-500">
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
                          <p className="text-sm font-medium">No store on loan data available</p>
                          <p className="text-xs mt-1">There are no stores on loan to display at this time.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device on Loan Information */}
                <div className="mt-8 pt-8 border-t border-default-200">
                  <h4 className="text-base font-semibold text-default-900 mb-4">Device on Loan</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {customer.LoanRecord?.[0]?.DeviceOnLoan && customer.LoanRecord[0].DeviceOnLoan.length > 0 ? (
                      customer.LoanRecord[0].DeviceOnLoan.map((device, index) => (
                        <div key={index} className="bg-default-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-default-500 mb-1">Device ID</div>
                              <div className="font-medium text-default-900">{device.deviceId || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Status</div>
                              <div className="font-medium">
                                <Chip 
                                  color={
                                    device.status === 'ENROLLED' 
                                      ? 'success' 
                                      : device.status === 'UNENROLLED'
                                      ? 'danger'
                                      : 'warning'
                                  }
                                  variant="flat"
                                  className="font-medium"
                                >
                                  {device.status || 'UNENROLLED'}
                                </Chip>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">IMEI</div>
                              <div className="font-medium text-default-900">{device.imei || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Amount</div>
                              <div className="font-medium text-default-900">
                                {device.amount !== undefined ? `₦${device.amount.toLocaleString()}` : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Device Price</div>
                              <div className="font-medium text-default-900">
                                {device.devicePrice !== undefined ? `₦${device.devicePrice.toLocaleString()}` : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Channel</div>
                              <div className="font-medium text-default-900">{device.channel || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Created At</div>
                              <div className="font-medium text-default-900">
                                {device.createdAt ? new Date(device.createdAt).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-default-500 mb-1">Updated At</div>
                              <div className="font-medium text-default-900">
                                {device.updatedAt ? new Date(device.updatedAt).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-default-50 rounded-lg p-8 text-center">
                        <div className="flex flex-col items-center justify-center text-default-500">
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
                          <p className="text-sm font-medium">No device on loan data available</p>
                          <p className="text-xs mt-1">There are no devices on loan to display at this time.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Information */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Virtual Account Information</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Wallet ID</div>
                    <div className="font-medium text-default-900">{customer.Wallet?.wallet_id || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Account Number</div>
                    <div className="font-medium text-default-900">{customer.Wallet?.accountNumber || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Bank Name</div>
                    <div className="font-medium text-default-900">{customer.Wallet?.bankName || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Account Name</div>
                    <div className="font-medium text-default-900">{customer.Wallet?.accountName || 'N/A'}</div>
                  </div>
                  {/* <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Balance ID</div>
                    <div className="font-medium text-default-900">{customer.WalletBalance?.balanceId || 'N/A'}</div>
                  </div> */}
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Current Balance</div>
                    <div className="font-medium text-default-900">
                      {customer.WalletBalance?.balance !== undefined 
                        ? `₦${customer.WalletBalance.balance.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Last Balance</div>
                    <div className="font-medium text-default-900">
                      {customer.WalletBalance?.lastBalance !== undefined 
                        ? `₦${customer.WalletBalance.lastBalance.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                  {/* <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Currency</div>
                    <div className="font-medium text-default-900">{customer.Wallet?.currency || 'N/A'}</div>
                  </div> */}
                  {/* <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Customer Code</div>
                    <div className="font-medium text-default-900">{customer.Wallet?.cust_code || 'N/A'}</div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Mono Customer */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
              <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Mono Customer</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Connected Customer ID</div>
                    <div className="font-medium text-default-900">{customer.MonoCustomer?.connectedCustomerId || 'N/A'}</div>
                  </div>
                  
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Temporary Account ID</div>
                    <div className="font-medium text-default-900">{customer.MonoCustomer?.tempAccountId || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Email</div>
                    <div className="font-medium text-default-900">{customer.MonoCustomer?.email || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Name</div>
                    <div className="font-medium text-default-900">{customer.MonoCustomer?.name || 'N/A'}</div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Created At</div>
                    <div className="font-medium text-default-900">
                      {customer.MonoCustomer?.createdAt ? new Date(customer.MonoCustomer.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-default-50 rounded-lg p-4">
                    <div className="text-sm text-default-500 mb-1">Updated At</div>
                    <div className="font-medium text-default-900">
                      {customer.MonoCustomer?.updatedAt ? new Date(customer.MonoCustomer.updatedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="bg-default-50 rounded-lg p-4 mt-4">
                    <div className="text-sm text-default-500 mb-1">Mono URL</div>
                    <div className="font-medium text-default-900">
                      <div className="bg-white rounded-lg p-2 border border-default-200">
                        {customer.MonoCustomer?.monourl || 'N/A'}
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden w-full">
              <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Customer Account Details</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-6 w-full">
                  {customer.CustomerAccountDetails?.map((account, index) => (
                    <div key={index} className="bg-default-50 rounded-lg p-4 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-default-500 mb-1">Account Number</div>
                          <div className="font-medium text-default-900">{account.accountNumber || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Bank Code</div>
                          <div className="font-medium text-default-900">{account.bankCode || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Channel</div>
                          <div className="font-medium text-default-900">{account.channel || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Bank ID</div>
                          <div className="font-medium text-default-900">{account.bankID || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Bank Name</div>
                          <div className="font-medium text-default-900">{account.bankName || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Created At</div>
                          <div className="font-medium text-default-900">
                            {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Updated At</div>
                          <div className="font-medium text-default-900">
                            {account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mandate Information */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden w-full">
              <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Mandate Information</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4 w-full">
                  {customer.CustomerMandate?.map((mandate, index) => (
                    <div key={index} className="bg-default-50 rounded-lg p-4 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-default-500 mb-1">Status</div>
                          <Chip 
                            color={
                              mandate.status === 'approved' 
                                ? 'success' 
                                : mandate.status === 'initiated'
                                ? 'warning'
                                : 'danger'
                            }
                            variant="flat"
                            className="font-medium"
                          >
                            {mandate.status || 'PENDING'}
                          </Chip>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Mandate Type</div>
                          <div className="font-medium text-default-900">{mandate.mandate_type || 'N/A'}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-default-500 mb-1">Debit Type</div>
                          <div className="font-medium text-default-900">{mandate.debit_type || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Ready to Debit</div>
                          <div className="font-medium text-default-900">{mandate.ready_to_debit ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Approved</div>
                          <div className="font-medium text-default-900">{mandate.approved ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Start Date</div>
                          <div className="font-medium text-default-900">
                            {mandate.start_date ? new Date(mandate.start_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">End Date</div>
                          <div className="font-medium text-default-900">
                            {mandate.end_date ? new Date(mandate.end_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Reference</div>
                          <div className="font-medium text-default-900">{mandate.reference || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Channel</div>
                          <div className="font-medium text-default-900">{mandate.channel || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Created At</div>
                          <div className="font-medium text-default-900">
                            {mandate.createdAt ? new Date(mandate.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Updated At</div>
                          <div className="font-medium text-default-900">
                            {mandate.updatedAt ? new Date(mandate.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      <div>
                          <div className="text-sm text-default-500 mb-1">Mandate ID</div>
                          <div className="font-medium text-default-900">{mandate.mandateId || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-default-500 mb-1">Message</div>
                          <div className="font-medium text-default-900">{mandate.message || 'N/A'}</div>
                        </div>
                      </div>
                        
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
                <div className="p-3 border-b border-default-200">
                <h3 className="text-lg font-semibold text-default-900">Transaction History</h3>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto rounded-lg border border-default-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-default-50 border-b border-default-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Payment Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Previous Balance</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">New Balance</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Payment Reference</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">External Reference</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Currency</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Charge</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Charge Narration</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Payment Description</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">Paid At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default-200">
                      {customer.TransactionHistory?.map((transaction, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-default-50 transition-colors duration-150 ease-in-out"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-default-900">
                            {transaction.amount !== undefined 
                              ? `${transaction.currency} ${transaction.amount.toLocaleString()}` 
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.paymentType || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.prevBalance !== undefined 
                              ? `${transaction.currency} ${transaction.prevBalance.toLocaleString()}` 
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.newBalance !== undefined 
                              ? `${transaction.currency} ${transaction.newBalance.toLocaleString()}` 
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.paymentReference || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.extRef || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.currency || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.charge !== undefined 
                              ? `${transaction.currency} ${transaction.charge.toLocaleString()}` 
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.chargeNarration || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.paymentDescription || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                            {transaction.paid_at ? new Date(transaction.paid_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {(!customer.TransactionHistory || customer.TransactionHistory.length === 0) && (
                        <tr>
                          <td colSpan={11} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-default-500">
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
                              <p className="text-sm font-medium">No transaction history available</p>
                              <p className="text-xs mt-1">There are no transactions to display at this time.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}