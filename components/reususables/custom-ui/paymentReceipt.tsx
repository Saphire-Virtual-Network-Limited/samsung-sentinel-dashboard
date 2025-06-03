"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { Card, CardBody, CardHeader } from "@heroui/card"
// import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
// import { DynamicQRCode } from "./index"
import QRCode from "qrcode"


interface Sender {
  name: string
  company: string
  email: string
}

interface Recipient {
  name: string
  company: string
  account: string
  bank: string
}

interface TransactionData {
  customerId: string
  receiptNumber: string
  transactionId: string
  sessionId: string
  amount: string
  currency: string
  date: string
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
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  const userUrl = `https://sentiflex.connectwithsapphire.com/verify-code?customerId=${transactionData.customerId}`; // dynamic data

  useEffect(() => {
    // Generate QR code when component mounts
    QRCode.toDataURL(userUrl, { width: 200 })
      .then(url => setQrCodeUrl(url))
      .catch(console.error);
  }, [userUrl]);

  const generatePDF = async () => {
    setIsDownloading(true)

    try {
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Receipt - ${transactionData.receiptNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 0.25in;
                background: white;
                max-height: 100vh;
                overflow: hidden;
              }
              @page { 
                margin: 0.25in; 
                size: letter;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .print-page {
                page-break-inside: avoid;
                break-inside: avoid;
                height: 100vh;
                overflow: hidden;
              }
              .print-content {
                transform: scale(0.95);
                transform-origin: top center;
              }
            }
            body {
              background: white;
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
            }
            .print-page {
              padding: 0.5in;
              box-sizing: border-box;
            }
            .print-content {
              max-width: 100%;
              margin: 0 auto;
            }
            .bg-gradient-to-r {
              background-image: linear-gradient(to right, var(--tw-gradient-stops));
            }
            .from-blue-600 {
              --tw-gradient-from: #2563eb;
              --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
            }
            .to-blue-700 {
              --tw-gradient-to: #1d4ed8;
            }
            .bg-blue-600 {
              background-color: #2563eb;
            }
            .bg-blue-700 {
              background-color: #1d4ed8;
            }
            .bg-slate-50 {
              background-color: #f8fafc;
            }
            .bg-blue-50 {
              background-color: #eff6ff;
            }
            .bg-green-500 {
              background-color: #22c55e;
            }
            .bg-red-500 {
              background-color: #ef4444;
            }
            .border-blue-600 {
              border-color: #2563eb;
            }
            .border-green-500 {
              border-color: #22c55e;
            }
            .text-blue-600 {
              color: #2563eb;
            }
            .text-blue-700 {
              color: #1d4ed8;
            }
            .text-blue-900 {
              color: #1e3a8a;
            }
            .text-blue-100 {
              color: #dbeafe;
            }
            .text-slate-900 {
              color: #0f172a;
            }
            .text-slate-600 {
              color: #475569;
            }
            .text-slate-500 {
              color: #64748b;
            }
            .text-white {
              color: white;
            }
            .shadow-2xl {
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .rounded-lg {
              border-radius: 0.5rem;
            }
            .rounded-t-lg {
              border-top-left-radius: 0.5rem;
              border-top-right-radius: 0.5rem;
            }
            .rounded-full {
              border-radius: 9999px;
            }
            .border-l-4 {
              border-left-width: 4px;
            }
            .border-t {
              border-top-width: 1px;
            }
            .border-0 {
              border-width: 0;
            }
            .border {
              border-width: 1px;
            }
            .border-slate-200 {
              border-color: #e2e8f0;
            }
          </style>
        </head>
        <body class="bg-white font-sans text-gray-900">
          <div class="print-page">
            <div class="print-content">
              <div class="bg-white shadow-2xl border-0">
                <div class="text-center pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex-row">
                  <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h1 class="text-blue-100 text-xs tracking-wide uppercase">Sapphire Virtual Network</h1>
                  <p class="text-blue-100 text-xs tracking-wide uppercase">Payment Acknowledgement</p>
                  <div class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    transactionData.status === 'PAID' ? 'bg-green-500' :
                    transactionData.status === 'PENDING' ? 'bg-yellow-500' :
                    transactionData.status === 'FAILED' ? 'bg-red-500' :
                    'bg-red-500'
                  } text-white mt-2">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    ${transactionData.status}
                  </div>
                </div>

                <div class="p-4">
                  <div class="text-center bg-slate-50 p-3 rounded-lg mb-4">
                    <p class="text-2xl font-bold text-slate-900 mb-1">NGN ${Number(transactionData.amount).toLocaleString()}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="space-y-2">
                      <h3 class="text-base font-bold text-slate-900 border-b-2 border-blue-600 pb-1">
                        Transaction Information
                      </h3>
                      <div class="space-y-2">
                        <div>
                          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference Number</p>
                          <p class="text-sm font-mono text-slate-900">${transactionData.receiptNumber}</p>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction ID</p>
                          <p class="text-sm font-mono text-slate-900 break-all">${transactionData.transactionId}</p>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Session ID</p>
                          <p class="text-sm font-mono text-slate-900 break-all">${transactionData.sessionId}</p>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date & Time</p>
                          <p class="text-sm text-slate-900">${new Date(transactionData.date).toLocaleString()}</p>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment Method</p>
                          <p class="text-sm text-slate-900">${transactionData.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-2">
                      
                      <div class="bg-slate-50 p-3 rounded-lg flex flex-col items-center justify-center h-full">
                        <img src="${qrCodeUrl}" alt="QR Code" class="w-64 h-64" />
                        <p class="text-xs text-center text-slate-500 mt-2">Scan to verify receipt</p>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h3 class="text-base font-bold text-slate-900 border-b-2 border-blue-600 pb-1">
                        Payment Breakdown
                      </h3>
                      <div class="bg-slate-50 p-3 rounded-lg space-y-2">
                        <div class="flex justify-between text-sm">
                          <span class="text-slate-600">Transfer Amount</span>
                          <span class="font-semibold text-slate-900">
                            NGN ${Number(transactionData.fee).toLocaleString()}
                          </span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-slate-600">Processing Fee</span>
                          <span class="font-semibold text-slate-900">
                            NGN ${(Number.parseFloat(transactionData.amount.replace(",", "")) - Number.parseFloat(transactionData.fee)).toFixed(2)}
                          </span>
                        </div>
                        <hr class="my-2" />
                        <div class="flex justify-between text-sm font-bold">
                          <span class="text-slate-900">Total Amount</span>
                          <span class="text-slate-900">NGN ${Number(transactionData.amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h3 class="text-base font-bold text-slate-900 border-b-2 border-blue-600 pb-1">
                        Description
                      </h3>
                      <div class="bg-slate-50 p-3 rounded-lg">
                        <p class="text-sm text-slate-900">${transactionData.description}</p>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="space-y-2">
                      <h3 class="text-base font-bold text-slate-900 border-b-2 border-blue-600 pb-1">
                        Payment From
                      </h3>
                      <div class="bg-slate-50 p-3 rounded-lg border-l-4 border-blue-600">
                        <p class="text-sm font-bold text-slate-900">${transactionData.sender.name}</p>
                        <p class="text-xs font-semibold text-blue-600">${transactionData.sender.company}</p>
                        <div class="mt-1 space-y-0.5 text-xs text-slate-600">
                          <p>${transactionData.sender.email}</p>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h3 class="text-base font-bold text-slate-900 border-b-2 border-blue-600 pb-1">
                        Payment To
                      </h3>
                      <div class="bg-slate-50 p-3 rounded-lg border-l-4 border-green-500">
                        <p class="text-sm font-bold text-slate-900">${transactionData.recipient.name}</p>
                        <div class="mt-1 space-y-0.5 text-xs text-slate-600">
                          <p>Account: ${transactionData.recipient.account}</p>
                          <p>Bank: ${transactionData.recipient.bank}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="border-t border-slate-200 pt-3">
                    <div class="bg-blue-50 p-3 rounded-lg text-center">
                      <p class="text-xs font-semibold text-blue-900 mb-0.5">
                        🔒 Secure Transaction Completed
                      </p>
                      <p class="text-xs text-blue-700">
                        Receipt generated on ${new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      iframe.contentDocument?.write(receiptHTML)
      iframe.contentDocument?.close()

      // Wait for content to load
      setTimeout(() => {
        iframe.contentWindow?.print()
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
      }, 1000)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  // const handleShare = async () => {
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: `Payment Receipt - ${transactionData.receiptNumber}`,
  //         text: `Payment receipt for NGN${transactionData.amount} - Transaction ID: ${transactionData.transactionId}`,
  //       })
  //     } catch (error) {
  //       console.log("Error sharing:", error)
  //     }
  //   } else {
  //     const receiptText = `Payment Receipt - ${transactionData.receiptNumber}\nAmount: NGN${transactionData.amount}\nTransaction ID: ${transactionData.transactionId}\nDate: ${transactionData.date}`
  //     navigator.clipboard.writeText(receiptText)
  //   }
  // }

  return (
    <Button onClick={generatePDF} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700">
      <Download className="w-4 h-4 mr-2" />
      {isDownloading ? "Generating..." : "Payment Acknowledgement"}
    </Button>
  )
}