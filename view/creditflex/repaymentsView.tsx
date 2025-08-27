"use client";

import React from "react";

const CreditflexRepaymentsView = () => {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					Repayments
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Track and manage loan repayments
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Total Collected
					</h3>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">
						₦8.7M
					</p>
					<p className="text-sm text-green-600">+15% this month</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Expected Today
					</h3>
					<p className="text-2xl font-bold text-blue-600">₦156K</p>
					<p className="text-sm text-gray-500">42 payments due</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Overdue
					</h3>
					<p className="text-2xl font-bold text-red-600">₦89K</p>
					<p className="text-sm text-red-500">23 overdue payments</p>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						Collection Rate
					</h3>
					<p className="text-2xl font-bold text-green-600">91.2%</p>
					<p className="text-sm text-green-600">Above target</p>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
				<div className="p-6 border-b">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							<input
								type="text"
								placeholder="Search repayments..."
								className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
							/>
							<select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
								<option>All Status</option>
								<option>Paid</option>
								<option>Pending</option>
								<option>Overdue</option>
								<option>Partial</option>
							</select>
							<select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
								<option>Today</option>
								<option>This Week</option>
								<option>This Month</option>
								<option>All Time</option>
							</select>
						</div>
						<button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
							Record Payment
						</button>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Loan ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Customer
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Expected Amount
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Paid Amount
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
									loanId: "CF-000101",
									customer: "Alice Johnson",
									expected: 15000,
									paid: 15000,
									dueDate: "Dec 18, 2024",
									status: "Paid",
								},
								{
									loanId: "CF-000102",
									customer: "Bob Smith",
									expected: 25000,
									paid: 0,
									dueDate: "Dec 19, 2024",
									status: "Pending",
								},
								{
									loanId: "CF-000103",
									customer: "Carol Davis",
									expected: 18000,
									paid: 9000,
									dueDate: "Dec 17, 2024",
									status: "Partial",
								},
								{
									loanId: "CF-000104",
									customer: "Daniel Brown",
									expected: 32000,
									paid: 0,
									dueDate: "Dec 15, 2024",
									status: "Overdue",
								},
								{
									loanId: "CF-000105",
									customer: "Emma Wilson",
									expected: 12000,
									paid: 12000,
									dueDate: "Dec 19, 2024",
									status: "Paid",
								},
							].map((payment, index) => (
								<tr key={index}>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										{payment.loanId}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										{payment.customer}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₦{payment.expected.toLocaleString("en-GB")}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₦{payment.paid.toLocaleString("en-GB")}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										{payment.dueDate}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												payment.status === "Paid"
													? "bg-green-100 text-green-800"
													: payment.status === "Pending"
													? "bg-yellow-100 text-yellow-800"
													: payment.status === "Partial"
													? "bg-blue-100 text-blue-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{payment.status}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<button className="text-blue-600 hover:text-blue-900 mr-3">
											View
										</button>
										{payment.status !== "Paid" && (
											<button className="text-green-600 hover:text-green-900">
												Record Payment
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

export default CreditflexRepaymentsView;
