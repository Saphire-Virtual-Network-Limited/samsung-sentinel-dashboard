"use client"

import { Check, Download, PrinterIcon as Print, Share, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

interface Sender {
  name: string
  company: string
  account: string
  email: string
  address: string
}

interface Recipient {
  name: string
  company: string
  account: string
  email: string
  address: string
}

interface TransactionData {
  receiptNumber: string
  transactionId: string
  amount: string
  currency: string
  date: string
  time: string
  status: string
  paymentMethod: string
  sender: Sender
  recipient: Recipient
  fee: string
  reference: string
  description: string
}

interface PaymentReceiptProps {
  transactionData: TransactionData
}

export default function PaymentReceipt({ transactionData }: PaymentReceiptProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const generatePDF = async () => {
    setIsDownloading(true)

    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      // Get the receipt content
      const receiptElement = document.getElementById("receipt-content")
      if (!receiptElement) return

      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Receipt - ${transactionData.receiptNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0.5in; }
              .no-print { display: none !important; }
              @page { margin: 0.5in; size: letter; }
            }
          </style>
        </head>
        <body class="bg-white font-sans text-gray-900">
          ${receiptElement.innerHTML}
        </body>
        </html>
      `

      printWindow.document.write(receiptHTML)
      printWindow.document.close()

      setTimeout(() => {
        printWindow.print()
      }, 1000)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment Receipt - ${transactionData.receiptNumber}`,
          text: `Payment receipt for $${transactionData.amount} - Transaction ID: ${transactionData.transactionId}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      const receiptText = `Payment Receipt - ${transactionData.receiptNumber}\nAmount: $${transactionData.amount}\nTransaction ID: ${transactionData.transactionId}\nDate: ${transactionData.date}`
      navigator.clipboard.writeText(receiptText)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-4 no-print">
          <Button onClick={generatePDF} disabled={isDownloading} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="outline" onClick={generatePDF} className="flex-1">
            <Print className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex-1">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Single Page Receipt Card */}
        <Card className="bg-white shadow-2xl border-0 print:shadow-none print:border-0">
          <div id="receipt-content">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg print:bg-blue-600 print:rounded-none">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">SecurePay Business</h1>
              <p className="text-blue-100 text-sm tracking-wide uppercase">Payment Receipt</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white mt-3">
                <Check className="w-3 h-3 mr-1" />
                {transactionData.status}
              </div>
            </CardHeader>

            <CardBody className="p-6 print:p-4">
              {/* Amount Display */}
              <div className="text-center bg-slate-50 p-4 rounded-lg mb-6 print:bg-gray-100 print:mb-4">
                <p className="text-3xl font-bold text-slate-900 mb-1 print:text-2xl">${transactionData.amount}</p>
                <p className="text-sm text-slate-600">{transactionData.currency}</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
                {/* Left Column - Transaction Details */}
                <div className="space-y-4 print:space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 border-b-2 border-blue-600 pb-1 print:text-base print:border-b">
                    Transaction Information
                  </h3>

                  <div className="space-y-3 print:space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Receipt Number</p>
                      <p className="text-sm font-mono text-slate-900 print:text-xs">{transactionData.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction ID</p>
                      <p className="text-sm font-mono text-slate-900 break-all print:text-xs">
                        {transactionData.transactionId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date & Time</p>
                      <p className="text-sm text-slate-900 print:text-xs">
                        {transactionData.date} at {transactionData.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment Method</p>
                      <p className="text-sm text-slate-900 print:text-xs">{transactionData.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Payment Breakdown */}
                <div className="space-y-4 print:space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 border-b-2 border-blue-600 pb-1 print:text-base print:border-b">
                    Payment Breakdown
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-2 print:bg-gray-100 print:p-3 print:space-y-1">
                    <div className="flex justify-between text-sm print:text-xs">
                      <span className="text-slate-600">Transfer Amount</span>
                      <span className="font-semibold text-slate-900">
                        $
                        {(
                          Number.parseFloat(transactionData.amount.replace(",", "")) -
                          Number.parseFloat(transactionData.fee)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm print:text-xs">
                      <span className="text-slate-600">Processing Fee</span>
                      <span className="font-semibold text-slate-900">${transactionData.fee}</span>
                    </div>
                    <Separator className="my-2 print:my-1" />
                    <div className="flex justify-between text-base font-bold print:text-sm">
                      <span className="text-slate-900">Total Amount</span>
                      <span className="text-slate-900">${transactionData.amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description and Reference */}
              <div className="mb-6 space-y-3 print:mb-4 print:space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-slate-900 print:text-xs">{transactionData.description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</p>
                  <p className="text-sm text-slate-900 print:text-xs">{transactionData.reference}</p>
                </div>
              </div>

              {/* Sender and Recipient - Two Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
                {/* Payment From */}
                <div className="space-y-3 print:space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 border-b-2 border-blue-600 pb-1 print:text-base print:border-b">
                    Payment From
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-600 print:bg-gray-100 print:p-3 print:border-l-2">
                    <p className="text-base font-bold text-slate-900 print:text-sm">{transactionData.sender.name}</p>
                    <p className="text-sm font-semibold text-blue-600 print:text-xs">
                      {transactionData.sender.company}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-slate-600 print:text-xs print:mt-1">
                      <p>{transactionData.sender.email}</p>
                      <p>Account: {transactionData.sender.account}</p>
                      <p>{transactionData.sender.address}</p>
                    </div>
                  </div>
                </div>

                {/* Payment To */}
                <div className="space-y-3 print:space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 border-b-2 border-blue-600 pb-1 print:text-base print:border-b">
                    Payment To
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-green-500 print:bg-gray-100 print:p-3 print:border-l-2">
                    <p className="text-base font-bold text-slate-900 print:text-sm">{transactionData.recipient.name}</p>
                    <p className="text-sm font-semibold text-green-600 print:text-xs">
                      {transactionData.recipient.company}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-slate-600 print:text-xs print:mt-1">
                      <p>{transactionData.recipient.email}</p>
                      <p>Account: {transactionData.recipient.account}</p>
                      <p>{transactionData.recipient.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 pt-4 print:pt-3">
                <div className="bg-blue-50 p-4 rounded-lg text-center mb-4 print:bg-blue-100 print:p-3 print:mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1 print:text-xs">
                    🔒 Secure Transaction Completed
                  </p>
                  <p className="text-xs text-blue-700 print:text-xs">
                    This transaction was processed with bank-level security. Receipt generated on{" "}
                    {new Date().toLocaleString()}
                  </p>
                </div>

                <div className="text-center space-y-1 print:space-y-0">
                  <p className="text-sm font-semibold text-slate-900 print:text-xs">SecurePay Business</p>
                  <p className="text-xs text-slate-600">support@securepay.com | 1-800-SECURE-PAY</p>
                  <p className="text-xs text-slate-500">
                    This is an official payment receipt. Please retain for your records.
                  </p>
                  <p className="text-xs text-slate-500">Transaction processed in compliance with PCI DSS standards.</p>
                </div>
              </div>
            </CardBody>
          </div>
        </Card>
      </div>
    </div>
  )
}