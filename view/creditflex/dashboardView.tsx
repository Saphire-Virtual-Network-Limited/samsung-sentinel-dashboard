"use client";

import React from "react";

const CreditflexDashboardView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Creditflex Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your Creditflex operations and metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Loans
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            1,234
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Disbursed Amount
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₦25.6M
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Customers
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            856
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Collection Rate
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            92.3%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activities
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">
              New loan application received
            </span>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">
              Loan disbursement completed
            </span>
            <span className="text-sm text-gray-500">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">
              Customer repayment received
            </span>
            <span className="text-sm text-gray-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditflexDashboardView;
