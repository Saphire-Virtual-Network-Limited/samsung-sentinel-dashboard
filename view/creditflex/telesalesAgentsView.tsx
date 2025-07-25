"use client";

import React from "react";

const CreditflexTelesalesAgentsView = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Telesales Agents
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage telesales agents and their performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Agents
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">34</p>
          <p className="text-sm text-green-600">+3 this month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Avg. Conversion
          </h3>
          <p className="text-2xl font-bold text-blue-600">24.8%</p>
          <p className="text-sm text-blue-600">Above target</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Monthly Sales
          </h3>
          <p className="text-2xl font-bold text-green-600">₦12.4M</p>
          <p className="text-sm text-green-600">+22% vs last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Top Performer
          </h3>
          <p className="text-lg font-bold text-purple-600">Sarah M.</p>
          <p className="text-sm text-purple-600">₦850K this month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search agents..."
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              <select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
                <option>Training</option>
              </select>
              <select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option>All Teams</option>
                <option>Team Alpha</option>
                <option>Team Beta</option>
                <option>Team Gamma</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                + Add Agent
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Performance Report
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Calls Made
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sales (Month)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
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
                  name: "Sarah Mitchell",
                  email: "s.mitchell@company.com",
                  team: "Alpha",
                  calls: 245,
                  conversions: 68,
                  sales: 850000,
                  performance: "Excellent",
                  status: "Active",
                },
                {
                  name: "David Rodriguez",
                  email: "d.rodriguez@company.com",
                  team: "Beta",
                  calls: 198,
                  conversions: 52,
                  sales: 620000,
                  performance: "Good",
                  status: "Active",
                },
                {
                  name: "Emily Chen",
                  email: "e.chen@company.com",
                  team: "Gamma",
                  calls: 156,
                  conversions: 41,
                  sales: 485000,
                  performance: "Good",
                  status: "Active",
                },
                {
                  name: "Michael Johnson",
                  email: "m.johnson@company.com",
                  team: "Alpha",
                  calls: 134,
                  conversions: 28,
                  sales: 320000,
                  performance: "Average",
                  status: "Training",
                },
                {
                  name: "Lisa Wang",
                  email: "l.wang@company.com",
                  team: "Beta",
                  calls: 89,
                  conversions: 15,
                  sales: 180000,
                  performance: "Below Average",
                  status: "Active",
                },
              ].map((agent, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {agent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    Team {agent.team}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {agent.calls}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {agent.conversions} (
                    {((agent.conversions / agent.calls) * 100).toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ₦{agent.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.performance === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : agent.performance === "Good"
                          ? "bg-blue-100 text-blue-800"
                          : agent.performance === "Average"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.performance}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : agent.status === "Training"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      Edit
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      Reports
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

export default CreditflexTelesalesAgentsView;
