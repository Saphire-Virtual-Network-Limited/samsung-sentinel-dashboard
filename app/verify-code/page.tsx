"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaymentReceipt from "@/components/reususables/custom-ui/paymentReceipt";

interface TransactionData {
  receiptNumber: string;
  transactionId: string;
  sessionId: string;
  amount: string;
  currency: string;
  date: string;
  status: string;
  paymentMethod: string;
  sender: {
    name: string;
    company: string;
    email: string;
  };
  recipient: {
    name: string;
    company: string;
    account: string;
    bank: string;
  };
  fee: string;
  reference: string;
  description: string;
}

export default function VerifyCodePage() {
  const searchParams = useSearchParams();
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const receiptNumber = searchParams.get("code");
    
    if (!receiptNumber) {
      setError("No receipt number provided");
      setLoading(false);
      return;
    }

    // TODO: Replace with actual API call to fetch transaction data
    const fetchTransactionData = async () => {
      try {
        // This is a mock API call - replace with your actual API endpoint
        const response = await fetch(`/api/transactions/${receiptNumber}`);
        if (!response.ok) {
          throw new Error("Failed to fetch transaction data");
        }
        const data = await response.json();
        setTransactionData(data);
      } catch (err) {
        setError("Failed to load transaction data");
        console.error("Error fetching transaction:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Not Found</h2>
            <p className="text-yellow-600">Transaction receipt not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Transaction Receipt
            </h1>
            <p className="text-gray-600">
              Receipt Number: {transactionData.receiptNumber}
            </p>
          </div>

          {/* Transaction Details Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.transactionId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Session ID</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.sessionId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.currency} {Number(transactionData.amount).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1 text-lg text-gray-900">{new Date(transactionData.date).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      transactionData.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      transactionData.status === 'UNPAID' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transactionData.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.paymentMethod}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fee</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.currency} {Number(transactionData.fee).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reference</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.reference}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sender and Recipient Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Sender Information */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sender Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.sender.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.sender.company}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.sender.email}</p>
                </div>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recipient Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.recipient.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.recipient.company}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.recipient.account}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bank</h3>
                  <p className="mt-1 text-lg text-gray-900">{transactionData.recipient.bank}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipt Component */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <PaymentReceipt transactionData={transactionData} />
          </div>
        </div>
      </div>
    </div>
  );
} 