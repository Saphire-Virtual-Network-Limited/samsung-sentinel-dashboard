"use client";

import React from "react";

const CreditflexLoanProductsView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Loan Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your Creditflex loan products and configurations
        </p>
      </div>

      <div className="mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Create New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: "Quick Cash",
            description: "Short-term loans for immediate needs",
            minAmount: 5000,
            maxAmount: 50000,
            interestRate: 15,
            tenure: "7-30 days",
            status: "Active",
          },
          {
            name: "Business Boost",
            description: "Medium-term loans for business expansion",
            minAmount: 20000,
            maxAmount: 200000,
            interestRate: 12,
            tenure: "1-6 months",
            status: "Active",
          },
          {
            name: "Salary Advance",
            description: "Salary-based loans for employees",
            minAmount: 10000,
            maxAmount: 100000,
            interestRate: 10,
            tenure: "1-3 months",
            status: "Active",
          },
          {
            name: "Emergency Fund",
            description: "Quick access to emergency funds",
            minAmount: 5000,
            maxAmount: 75000,
            interestRate: 18,
            tenure: "7-21 days",
            status: "Draft",
          },
        ].map((product, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {product.description}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  product.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {product.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount Range:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ₦{product.minAmount.toLocaleString()} - ₦
                  {product.maxAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Interest Rate:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.interestRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tenure:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.tenure}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditflexLoanProductsView;
