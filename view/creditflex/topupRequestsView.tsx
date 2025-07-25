"use client";

import React from "react";

const CreditflexTopupRequestsView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Topup Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage loan topup and enhancement requests from customers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            New Requests
          </h3>
          <p className="text-2xl font-bold text-blue-600">23</p>
          <p className="text-sm text-blue-600">Today</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Under Review
          </h3>
          <p className="text-2xl font-bold text-yellow-600">18</p>
          <p className="text-sm text-yellow-600">Processing</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Approved
          </h3>
          <p className="text-2xl font-bold text-green-600">156</p>
          <p className="text-sm text-green-600">This month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Value
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₦4.2M
          </p>
          <p className="text-sm text-green-600">+18% vs last month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search topup requests..."
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              <select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option>All Status</option>
                <option>New</option>
                <option>Under Review</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Disbursed</option>
              </select>
              <select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option>All Amounts</option>
                <option>Under ₦50K</option>
                <option>₦50K - ₦100K</option>
                <option>Above ₦100K</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Export Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Original Loan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requested Topup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Request Date
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
                  requestId: "TOP-001",
                  loanId: "CF-000301",
                  customer: "Jennifer Lee",
                  currentBalance: 25000,
                  requestedTopup: 15000,
                  requestDate: "Dec 18, 2024",
                  status: "New",
                },
                {
                  requestId: "TOP-002",
                  loanId: "CF-000302",
                  customer: "Kevin Martinez",
                  currentBalance: 40000,
                  requestedTopup: 25000,
                  requestDate: "Dec 17, 2024",
                  status: "Under Review",
                },
                {
                  requestId: "TOP-003",
                  loanId: "CF-000303",
                  customer: "Amanda Foster",
                  currentBalance: 18000,
                  requestedTopup: 12000,
                  requestDate: "Dec 16, 2024",
                  status: "Approved",
                },
                {
                  requestId: "TOP-004",
                  loanId: "CF-000304",
                  customer: "Marcus Williams",
                  currentBalance: 55000,
                  requestedTopup: 35000,
                  requestDate: "Dec 15, 2024",
                  status: "Rejected",
                },
                {
                  requestId: "TOP-005",
                  loanId: "CF-000305",
                  customer: "Rachel Green",
                  currentBalance: 22000,
                  requestedTopup: 18000,
                  requestDate: "Dec 14, 2024",
                  status: "Disbursed",
                },
              ].map((request, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {request.requestId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {request.loanId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {request.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ₦{request.currentBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ₦{request.requestedTopup.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {request.requestDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "New"
                          ? "bg-blue-100 text-blue-800"
                          : request.status === "Under Review"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "Disbursed"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    {request.status === "New" && (
                      <>
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          Review
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900">
                          Assign
                        </button>
                      </>
                    )}
                    {request.status === "Approved" && (
                      <button className="text-purple-600 hover:text-purple-900">
                        Disburse
                      </button>
                    )}
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

export default CreditflexTopupRequestsView;
