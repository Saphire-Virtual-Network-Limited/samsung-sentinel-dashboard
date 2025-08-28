"use client";

import React from "react";

const CreditflexLiquidationRequestsView = () => {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					Liquidation Requests
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Manage loan liquidation and settlement requests
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Total Requests
					</h3>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">47</p>
					<p className="text-sm text-blue-600">This month</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Pending Review
					</h3>
					<p className="text-2xl font-bold text-yellow-600">12</p>
					<p className="text-sm text-yellow-600">Awaiting approval</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Approved
					</h3>
					<p className="text-2xl font-bold text-green-600">28</p>
					<p className="text-sm text-green-600">Ready for liquidation</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Rejected
					</h3>
					<p className="text-2xl font-bold text-red-600">7</p>
					<p className="text-sm text-red-600">Did not meet criteria</p>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
				<div className="p-6 border-b">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							<input
								type="text"
								placeholder="Search liquidation requests..."
								className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
							/>
							<select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
								<option>All Status</option>
								<option>Pending</option>
								<option>Under Review</option>
								<option>Approved</option>
								<option>Rejected</option>
								<option>Completed</option>
							</select>
							<select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
								<option>All Priority</option>
								<option>High</option>
								<option>Medium</option>
								<option>Low</option>
							</select>
						</div>
						<button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
							Bulk Process
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
									Loan ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Customer
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Outstanding Amount
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Request Date
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Priority
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
									requestId: "LIQ-001",
									loanId: "CF-000201",
									customer: "Michael Chen",
									amount: 45000,
									requestDate: "Dec 15, 2024",
									priority: "High",
									status: "Pending",
								},
								{
									requestId: "LIQ-002",
									loanId: "CF-000202",
									customer: "Sarah Ahmed",
									amount: 28000,
									requestDate: "Dec 16, 2024",
									priority: "Medium",
									status: "Under Review",
								},
								{
									requestId: "LIQ-003",
									loanId: "CF-000203",
									customer: "James Parker",
									amount: 62000,
									requestDate: "Dec 17, 2024",
									priority: "High",
									status: "Approved",
								},
								{
									requestId: "LIQ-004",
									loanId: "CF-000204",
									customer: "Lisa Thompson",
									amount: 15000,
									requestDate: "Dec 18, 2024",
									priority: "Low",
									status: "Rejected",
								},
								{
									requestId: "LIQ-005",
									loanId: "CF-000205",
									customer: "Robert Davis",
									amount: 38000,
									requestDate: "Dec 19, 2024",
									priority: "Medium",
									status: "Pending",
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
										₦{request.amount.toLocaleString("en-GB")}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										{request.requestDate}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												request.priority === "High"
													? "bg-red-100 text-red-800"
													: request.priority === "Medium"
													? "bg-yellow-100 text-yellow-800"
													: "bg-green-100 text-green-800"
											}`}
										>
											{request.priority}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												request.status === "Approved"
													? "bg-green-100 text-green-800"
													: request.status === "Pending"
													? "bg-yellow-100 text-yellow-800"
													: request.status === "Under Review"
													? "bg-blue-100 text-blue-800"
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
										{request.status === "Pending" && (
											<>
												<button className="text-green-600 hover:text-green-900 mr-3">
													Approve
												</button>
												<button className="text-red-600 hover:text-red-900">
													Reject
												</button>
											</>
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

export default CreditflexLiquidationRequestsView;
