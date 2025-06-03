// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import PaymentReceipt from "@/components/reususables/custom-ui/paymentReceipt";
// import { getCustomerDetails } from "@/lib/api";

// type CustomerRecord = {
// 	customerId: string;
// 	firstName: string;
// 	lastName: string;
// 	email: string;
// 	bvn: string;
// 	dob: string;
//   inputtedDob: string;
// 	dobMisMatch: boolean;
// 	createdAt: string;
// 	updatedAt: string;
// 	customerLoanDiskId: string;
// 	channel: string;
// 	bvnPhoneNumber: string;
// 	mainPhoneNumber: string;
// 	mbeId: string;
// 	monoCustomerConnectedCustomerId: string;
// 	fullName?: string;
// 	age?: number;
// 	status?: string;
// 	Wallet?: {
// 		wallet_id: string;
// 		accountNumber: string;
// 		bankName: string;
// 		dva_id: number;
// 		accountName: string;
// 		bankId: number;
// 		currency: string;
// 		cust_code: string;
// 		cust_id: number;
// 		userId: string;
// 		created_at: string;
// 		updated_at: string;
// 		customerId: string;
// 	};
// 	WalletBalance?: {
// 		balanceId: string;
// 		userId: string;
// 		balance: number;
// 		lastBalance: number;
// 		created_at: string;
// 		updated_at: string;
// 		customerId: string;
// 	};
// 	TransactionHistory?: Array<{
// 		transactionHistoryId: string;
// 		amount: number;
// 		paymentType: string;
// 		prevBalance: number;
// 		newBalance: number;
// 		paymentReference: string;
// 		extRef: string;
// 		currency: string;
// 		channel: string;
// 		charge: number;
// 		chargeNarration: string;
// 		senderBank: string;
// 		senderAccount: string;
// 		recieverBank: string;
// 		recieverAccount: string;
// 		paymentDescription: string;
// 		paid_at: string;
// 		createdAt: string;
// 		updatedAt: string;
// 		userid: string;
// 		customersCustomerId: string;
// 	}>;
// 	CustomerKYC?: Array<{
// 		kycId: string;
// 		customerId: string;
// 		houseNumber: string;
// 		streetAddress: string;
// 		nearestBusStop: string;
// 		localGovernment: string;
// 		state: string;
// 		town: string;
// 		occupation: string;
// 		businessName: string;
// 		applicantBusinessAddress: string;
// 		applicantAddress: string;
// 		source: string;
//     phone2: string;
// 	phone3: string;
// 	phone4: string;
// 	phone5: string;
// 	phoneApproved: string;
//   generalStatus: string;
// 		createdAt: string;
// 		updatedAt: string;
// 		status2Comment: string | null;
// 		status3Comment: string | null;
// 		channel: string;
// 		phone2Status: string;
// 		phone3Status: string;
// 	}>;
// 	CustomerAccountDetails?: Array<{
// 		customerAccountDetailsId: string;
// 		customerId: string;
// 		accountNumber: string;
// 		bankCode: string;
// 		channel: string;
// 		createdAt: string;
// 		updatedAt: string;
// 		bankID: number;
// 		bankName: string;
// 	}>;
// 	CustomerMandate?: Array<{
// 		customerMandateId: string;
// 		customerId: string;
// 		mandateId: string;
// 		status: string;
// 		monoCustomerId: string;
// 		mandate_type: string;
// 		debit_type: string;
// 		ready_to_debit: boolean;
// 		approved: boolean;
// 		start_date: string;
// 		end_date: string;
// 		reference: string;
// 		channel: string;
// 		createdAt: string;
// 		updatedAt: string;
// 		message: string;
// 	}>;
// 	LoanRecord?: Array<{
// 		loanRecordId: string;
// 		customerId: string;
// 		loanDiskId: string;
// 		customerLoanDiskId: string;
// 		lastPoint: string;
// 		channel: string;
// 		loanStatus: string;
// 		createdAt: string;
// 		updatedAt: string;
// 		loanAmount: number;
// 		deviceId: string;
// 		downPayment: number;
// 		insurancePackage: string;
// 		insurancePrice: number;
// 		mbsEligibleAmount: number;
// 		payFrequency: string;
// 		storeId: string;
// 		devicePrice: number;
// 		deviceAmount: number;
// 		monthlyRepayment: number;
// 		duration: number;
// 		interestAmount: number;
// 		deviceName: string;
// 		LoanRecordCard: any[];
// 		store: {
// 			storeOldId: number;
// 			storeName: string;
// 			city: string;
// 			state: string;
// 			region: string | null;
// 			address: string;
// 			accountNumber: string;
// 			accountName: string;
// 			bankName: string;
// 			bankCode: string;
// 			phoneNumber: string;
// 			storeEmail: string;
// 			longitude: number;
// 			latitude: number;
// 			clusterId: number;
// 			partner: string;
// 			storeOpen: string;
// 			storeClose: string;
// 			createdAt: string;
// 			updatedAt: string;
// 			storeId: string;
// 		};
// 		device: {
// 			price: number;
// 			deviceModelNumber: string;
// 			SAP: number;
// 			SLD: number;
// 			createdAt: string;
// 			deviceManufacturer: string;
// 			deviceName: string;
// 			deviceRam: string | null;
// 			deviceScreen: string | null;
// 			deviceStorage: string | null;
// 			imageLink: string;
// 			newDeviceId: string;
// 			oldDeviceId: string;
// 			sentiprotect: number;
// 			updatedAt: string;
// 			deviceType: string;
// 			deviceCamera: any[];
// 			android_go: string;
// 		};
// 		StoresOnLoan: Array<{
// 			storeOnLoanId: string;
// 			storeId: string;
// 			loanRecordId: string;
// 			amount: number;
// 			status: string;
// 			createdAt: string;
// 			updatedAt: string;
// 			channel: string;
// 			tnxId: string | null;
// 			sessionId: string | null;
// 			reference: string | null;
// 			payChannel: string | null;
// 			bankUsed: string | null;
// 		}>;
// 		DeviceOnLoan: Array<{
// 			deviceOnLoanId: string;
// 			deviceId: string;
// 			loanRecordId: string;
// 			status: string;
// 			createdAt: string;
// 			updatedAt: string;
// 			channel: string;
// 			imei: string | null;
// 			amount: number;
// 			devicePrice: number;
// 		}>;
// 	}>;
// 	regBy: {
// 		title: string;
// 		createdAt: string;
// 		mbeId: string;
// 		mbe_old_id: string;
// 		updatedAt: string;
// 		firstname: string;
// 		lastname: string;
// 		phone: string;
// 		state: string | null;
// 		username: string;
// 		accountStatus: string;
// 		assignedStoreBranch: string | null;
// 		bvn: string | null;
// 		bvnPhoneNumber: string | null;
// 		channel: string | null;
// 		dob: string | null;
// 		email: string | null;
// 		isActive: boolean;
// 		otp: string | null;
// 		otpExpiry: string | null;
// 		password: string | null;
// 		role: string;
// 		tokenVersion: number;
// 		stores: Array<{
// 			id: string;
// 			mbeOldId: string;
// 			storeOldId: number;
// 			mbeId: string | null;
// 			storeId: string | null;
// 			store: {
// 				storeOldId: number;
// 				storeName: string;
// 				city: string;
// 				state: string;
// 				region: string;
// 				address: string;
// 				accountNumber: string;
// 				accountName: string;
// 				bankName: string;
// 				bankCode: string;
// 				phoneNumber: string;
// 				storeEmail: string;
// 				longitude: number;
// 				latitude: number;
// 				clusterId: number;
// 				partner: string;
// 				storeOpen: string;
// 				storeClose: string;
// 				createdAt: string;
// 				updatedAt: string;
// 				storeId: string;
// 			};
// 		}>;
// 	};
// 	MonoCustomer?: {
// 		customerId: string;
// 		createdAt: string;
// 		updatedAt: string;
// 		email: string;
// 		name: string;
// 		connectedCustomerId: string;
// 		monourl: string;
// 		tempAccountId: string | null;
// 		CustomerAccounts: any[];
// 	};
// };

// export default function VerifyCodePage() {
//   const searchParams = useSearchParams();
//   const [customerDetails, setCustomerDetails] = useState<CustomerRecord | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const customerId = searchParams.get("customerId");

//     if (!customerId) {
//       setError("No customer ID provided");
//       setLoading(false);
//       return;
//     }

//     const fetchTransactionData = async () => {
//       try {
//         const response = await getCustomerDetails(customerId);
//         console.log(response);
//         setCustomerDetails(response);
//       } catch (err) {
//         setError("Failed to load transaction data");
//         console.error("Error fetching transaction:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactionData();
//   }, [searchParams]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading transaction details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-red-50 p-4 rounded-lg">
//             <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
//             <p className="text-red-600">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!customerDetails) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-yellow-50 p-4 rounded-lg">
//             <h2 className="text-xl font-semibold text-yellow-800 mb-2">Not Found</h2>
//             <p className="text-yellow-600">Transaction details not found</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
//       <div className="container mx-auto px-4 py-16">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-gray-900 mb-4">
//               Transaction Receipt
//             </h1>
//             <p className="text-gray-600">
//               Customer ID: {customerDetails?.customerId}
//             </p>
//           </div>

//           {/* Transaction Details Section */}
//           <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
//             <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction Details</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//               <div>
//                   <h3 className="text-sm font-medium text-gray-500">Receipt Number</h3>
//                   <p className="mt-1 text-lg text-gray-900">{customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.reference || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
//                   <p className="mt-1 text-lg text-gray-900">{customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.tnxId}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Session ID</h3>
//                   <p className="mt-1 text-lg text-gray-900">{customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.sessionId}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Amount</h3>
//                   <p className="mt-1 text-lg text-gray-900">{customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.amount.toString()}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Date</h3>
//                   <p className="mt-1 text-lg text-gray-900">{customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.createdAt ? new Date(customerDetails.LoanRecord[0].StoresOnLoan[0].createdAt).toLocaleString() : 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Status</h3>
//                   <p className="mt-1">
//                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                       customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.status === 'PAID' ? 'bg-green-100 text-green-800' :
//                       customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.status === 'UNPAID' ? 'bg-red-100 text-red-800' :
//                       'bg-yellow-100 text-yellow-800'
//                     }`}>
//                       {customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.status}
//                     </span>
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
//                   <p className="mt-1 text-lg text-gray-900">{customerDetails?.LoanRecord?.[0]?.StoresOnLoan?.[0]?.bankUsed}</p>
//                 </div>
//                   <div>
//                   <h3 className="text-sm font-medium text-gray-500">Description</h3>
//                   <p className="mt-1 text-lg text-gray-900">{"Payment for " + customerDetails?.LoanRecord?.[0]?.device.deviceName}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Payment Receipt Component */}
//           <div className="bg-white rounded-lg shadow-lg p-8">
//             <PaymentReceipt transactionData={{
//               customerId: customerDetails.customerId,
//               receiptNumber: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.reference || 'N/A',
//               transactionId: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.tnxId || 'N/A',
//               sessionId: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.sessionId || 'N/A',
//               amount: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.amount?.toString() || '0',
//               currency: 'NGN',
//               date: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.createdAt || new Date().toISOString(),
//               status: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.status || 'UNKNOWN',
//               paymentMethod: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.bankUsed || 'N/A',
//               sender: {
//                 name: `Sentiflex`,
//                 company: 'Sapphire Virtual Network',
//                 email: `info@sapphirevirtual.com`
//               },
//               recipient: {
//                 name: customerDetails.LoanRecord?.[0]?.store?.accountName || 'N/A',
//                 company: customerDetails.LoanRecord?.[0]?.store?.storeName || 'N/A',
//                 account: customerDetails.LoanRecord?.[0]?.store?.accountNumber || 'N/A',
//                 bank: customerDetails.LoanRecord?.[0]?.store?.bankName || 'N/A'
//               },
//               fee: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.amount?.toString() || '0',
//               reference: customerDetails.LoanRecord?.[0]?.StoresOnLoan?.[0]?.reference || 'N/A',
//               description: `Payment for ${customerDetails.LoanRecord?.[0]?.device?.deviceName || 'device'}`
//             }} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// } 