"use client";

import React from "react";

const CreditflexInvoicesView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Invoices
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage invoices and billing for Creditflex services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Invoices
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            287
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Paid
          </h3>
          <p className="text-2xl font-bold text-green-600">203</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending
          </h3>
          <p className="text-2xl font-bold text-yellow-600">64</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Overdue
          </h3>
          <p className="text-2xl font-bold text-red-600">20</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search invoices..."
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              <select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option>All Status</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
                <option>Cancelled</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              + Create Invoice
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                {
                  id: "INV-001",
                  customer: "John Doe",
                  amount: 15000,
                  dueDate: "Dec 25, 2024",
                  status: "Paid",
                },
                {
                  id: "INV-002",
                  customer: "Jane Smith",
                  amount: 25000,
                  dueDate: "Dec 28, 2024",
                  status: "Pending",
                },
                {
                  id: "INV-003",
                  customer: "Mike Johnson",
                  amount: 18000,
                  dueDate: "Dec 20, 2024",
                  status: "Overdue",
                },
                {
                  id: "INV-004",
                  customer: "Sarah Wilson",
                  amount: 32000,
                  dueDate: "Dec 30, 2024",
                  status: "Pending",
                },
                {
                  id: "INV-005",
                  customer: "David Brown",
                  amount: 12000,
                  dueDate: "Dec 22, 2024",
                  status: "Paid",
                },
              ].map((invoice, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invoice.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ₦{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      Download
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditflexInvoicesView;
