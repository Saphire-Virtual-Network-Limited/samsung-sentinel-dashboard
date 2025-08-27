"use client";

import React, { useState } from "react";
import { Card, CardBody, Select, SelectItem, Button } from "@heroui/react";
import Link from "next/link";
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	Users,
	DollarSign,
	Target,
	Award,
	Calendar,
} from "lucide-react";
import {
	useMobiflexLeaderboard,
	useMobiflexPartnerStats,
} from "@/hooks/mobiflex";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn } from "@/lib";
import { formatCurrency, formatNumber } from "@/lib/helper";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts";

// Period options for the dashboard
const periodOptions = [
	{ key: "daily", label: "Daily" },
	{ key: "weekly", label: "Weekly" },
	{ key: "monthly", label: "Monthly" },
	{ key: "mtd", label: "MTD" },
	{ key: "yearly", label: "Yearly" },
];

const MobiflexDailyDashCard = () => {
	const [hasNoRecords, setHasNoRecords] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<
		"daily" | "weekly" | "monthly" | "yearly" | "mtd"
	>("mtd");

	const { data: leaderboardData, isLoading: loadingLeaderboard } =
		useMobiflexLeaderboard(selectedPeriod);
	const { data: partnerData, isLoading: loadingPartners } =
		useMobiflexPartnerStats(selectedPeriod);

	const isLoading = loadingLeaderboard || loadingPartners;

	// Helper to format numbers with commas
	const formatDisplayNumber = (num: string | number) => {
		if (typeof num === "string" && num.includes(".")) {
			const [intPart, decPart] = num.split(".");
			return `${Number(intPart).toLocalString("en-GB")}.${decPart}`;
		}
		return Number(num).toLocalString("en-GB");
	};

	// Helper to format each metric card
	const formatMetric = (
		title: string,
		value: string | number,
		change: string,
		href: string,
		hasNaira: boolean = false
	) => {
		const numericChange = parseFloat(change);
		const isPositive = numericChange > 0;
		const trendIcon = isPositive ? (
			<TrendingUp className="w-3.5 h-3.5" />
		) : (
			<TrendingDown className="w-3.5 h-3.5" />
		);
		const changeColor = isPositive ? "text-green-600" : "text-red-600";
		const changeBg = isPositive ? "bg-green-100" : "bg-red-100";

		return {
			title,
			value,
			change: `${change}%`,
			trendIcon,
			changeColor,
			changeBg,
			href,
			hasNaira,
		};
	};

	// Build dynamic metrics from API response
	const metrics = [
		formatMetric(
			"Average Commission",
			formatDisplayNumber(
				leaderboardData?.summary?.totalLoans &&
					leaderboardData?.summary?.totalLoans > 0 &&
					leaderboardData?.summary?.totalCommission
					? (
							leaderboardData.summary.totalCommission /
							leaderboardData.summary.totalLoans
					  ).toFixed(2)
					: 0
			),
			"0",
			"#",
			true
		),
		formatMetric(
			"Total Sales Count",
			formatDisplayNumber(leaderboardData?.summary?.totalLoans || 0),
			"0",
			"#"
		),
		formatMetric(
			"Top Agent Sales",
			formatDisplayNumber(leaderboardData?.summary?.topAgent?.loanCount || 0),
			"0",
			"#"
		),
	];

	// Card configurations
	const cardConfigs = {
		agents: {
			name: "Agent Metrics",
			color: "from-blue-500 to-blue-600",
			bgColor: "bg-blue-50",
			borderColor: "border-blue-200",
			icon: <Users className="w-4 h-4 text-blue-600" />,
			url: "/access/admin/reports/mobiflex/agents",
			metrics: [
				{
					label: "Total Agents",
					value: leaderboardData?.totalAgents || 0,
					isCurrency: false,
				},
				{
					label: "Total Sales",
					value: leaderboardData?.summary?.totalLoans || 0,
					isCurrency: false,
				},
				{
					label: "Top Agent Sales",
					value: leaderboardData?.summary?.topAgent?.loanCount || 0,
					isCurrency: false,
				},
				{
					label: "Agent Commission",
					value: leaderboardData?.summary?.totalAgentCommission || 0,
					isCurrency: true,
				},
			],
		},
		commission: {
			name: "Commission Metrics",
			color: "from-green-500 to-green-600",
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
			icon: <DollarSign className="w-4 h-4 text-green-600" />,
			url: "/access/admin/reports/mobiflex/commission",
			metrics: [
				{
					label: "Total Commission",
					value: leaderboardData?.summary?.totalCommission || 0,
					isCurrency: true,
				},
				{
					label: "Total Sales",
					value: leaderboardData?.summary?.totalLoans || 0,
					isCurrency: false,
				},
				{
					label: "Average Commission",
					value:
						leaderboardData?.summary?.totalLoans &&
						leaderboardData?.summary?.totalLoans > 0 &&
						leaderboardData?.summary?.totalCommission
							? (
									leaderboardData.summary.totalCommission /
									leaderboardData.summary.totalLoans
							  ).toFixed(2)
							: 0,
					isCurrency: true,
				},
				{
					label: "Agent Commission",
					value: leaderboardData?.summary?.totalAgentCommission || 0,
					isCurrency: true,
				},
			],
		},
		loans: {
			name: "Sales & Partner Metrics",
			color: "from-purple-500 to-purple-600",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-200",
			icon: <Target className="w-4 h-4 text-purple-600" />,
			url: "/access/admin/reports/mobiflex/partners",
			metrics: [
				{
					label: "Total Sales",
					value: leaderboardData?.summary?.totalLoans || 0,
					isCurrency: false,
				},
				{
					label: "Total Partners",
					value: partnerData?.summary?.totalPartners || 0,
					isCurrency: false,
				},
				{
					label: "Avg Sales per Agent",
					value:
						leaderboardData?.totalAgents && leaderboardData?.totalAgents > 0
							? Math.round(
									(leaderboardData?.summary?.totalLoans || 0) /
										leaderboardData.totalAgents
							  )
							: 0,
					isCurrency: false,
				},
				{
					label: "Partner Commission",
					value: partnerData?.summary?.grandTotalPartnerCommission || 0,
					isCurrency: true,
				},
			],
		},
	};

	const renderMetricRow = (
		label: string,
		value: string | number,
		isCurrency: boolean = false
	) => (
		<div className="flex flex-row items-center justify-between lg:flex-col lg:items-start xl:flex-col xl:items-start py-1 border-b border-gray-100 last:border-b-0">
			<span
				className={cn(
					"text-xs text-gray-600 lg:mb-0.5 xl:mb-0.5",
					GeneralSans_Meduim.className
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					"text-xs font-semibold text-gray-900",
					GeneralSans_SemiBold.className
				)}
			>
				{isCurrency
					? `₦${formatDisplayNumber(value)}`
					: formatDisplayNumber(value)}
			</span>
		</div>
	);

	const renderMetricCard = (configKey: keyof typeof cardConfigs) => {
		const config = cardConfigs[configKey];

		return (
			<Card
				as={Link}
				isPressable
				href={config.url}
				className={cn(
					"group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] min-h-[200px]",
					config.borderColor,
					"hover:border-gray-300"
				)}
			>
				{/* Gradient header */}
				<div className={cn("bg-gradient-to-r p-3", config.color)}>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className={cn("p-1.5 rounded-lg", config.bgColor)}>
								{config.icon}
							</div>
							<h2
								className={cn(
									"text-white font-semibold text-sm",
									GeneralSans_SemiBold.className
								)}
							>
								{config.name}
							</h2>
						</div>
					</div>
				</div>

				{/* Card body */}
				<CardBody className="p-3 space-y-1">
					{config.metrics.map((metric, index) => (
						<div key={index}>
							{renderMetricRow(metric.label, metric.value, metric.isCurrency)}
						</div>
					))}
				</CardBody>

				{/* Hover effect overlay */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
			</Card>
		);
	};

	// Chart component for scan partners
	const renderPartnersChart = () => {
		const chartData =
			partnerData?.partnerStats?.slice(0, 6).map((partner) => ({
				name:
					partner.partnerName.length > 15
						? partner.partnerName.substring(0, 15) + "..."
						: partner.partnerName,
				commission: partner.totalCommission,
				agents: partner.agentCount,
				sales: partner.commissionCount,
				color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
			})) || [];

		const CustomTooltip = ({ active, payload, label }: any) => {
			if (active && payload && payload.length) {
				return (
					<div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
						<p
							className={cn(
								"font-semibold text-gray-900 mb-2",
								GeneralSans_SemiBold.className
							)}
						>
							{label}
						</p>
						<div className="space-y-1">
							<p className="text-sm text-blue-600">
								Commission: ₦{formatDisplayNumber(payload[0].value)}
							</p>
							<p className="text-sm text-green-600">
								Agents: {formatDisplayNumber(payload[1].value)}
							</p>
							<p className="text-sm text-purple-600">
								Sales: {formatDisplayNumber(payload[2].value)}
							</p>
						</div>
					</div>
				);
			}
			return null;
		};

		return (
			<Card className="h-[350px] border border-gray-200 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900",
							GeneralSans_SemiBold.className
						)}
					>
						Top Scan Partners Performance
					</h3>
					<p className="text-sm text-gray-600">
						Commission, agents, and sales count by partner
					</p>
				</div>
				<CardBody className="p-0">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={chartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
							<YAxis />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar dataKey="commission" fill="#3b82f6" name="Commission (₦)" />
							<Bar dataKey="agents" fill="#22c55e" name="Agents" />
							<Bar dataKey="sales" fill="#a855f7" name="Sales" />
						</BarChart>
					</ResponsiveContainer>
				</CardBody>
			</Card>
		);
	};

	// Table component for partner performance
	const renderPartnerPerformanceTable = () => {
		const tableData =
			partnerData?.partnerStats?.map((partner) => {
				return {
					partnerName: partner.partnerName,
					totalCommission: partner.totalCommission,
					partnerCommission: partner.totalPartnerCommission,
					agentCommission: partner.totalAgentCommission,
					agentCount: partner.agentCount,
					salesCount: partner.commissionCount,
					averageCommissionPerAgent: partner.averageCommissionPerAgent,
				};
			}) || [];

		return (
			<Card className="border border-gray-200 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900",
							GeneralSans_SemiBold.className
						)}
					>
						Partner Performance & Sales Analytics
					</h3>
					<p className="text-sm text-gray-600">
						Detailed view of partner commission distribution and sales
						performance
					</p>
				</div>
				<CardBody className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Partner Name
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Total Commission
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Partner Commission
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Agent Commission
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Sales Count
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Agents
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Avg/Agent
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{tableData.map((partner, index) => (
									<tr
										key={index}
										className="hover:bg-gray-50 transition-colors duration-150"
									>
										<td className="px-4 py-3 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{partner.partnerName}
											</div>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-right">
											<div className="text-sm font-semibold text-gray-900">
												₦{formatDisplayNumber(partner.totalCommission)}
											</div>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-right">
											<div className="text-sm text-blue-600 font-medium">
												₦{formatDisplayNumber(partner.partnerCommission)}
											</div>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-right">
											<div className="text-sm text-green-600 font-medium">
												₦{formatDisplayNumber(partner.agentCommission)}
											</div>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-center">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
												{formatDisplayNumber(partner.salesCount)}
											</span>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-center">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
												{formatDisplayNumber(partner.agentCount)}
											</span>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-right">
											<div className="text-sm text-orange-600 font-medium">
												₦
												{formatDisplayNumber(partner.averageCommissionPerAgent)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
							{/* Summary Footer */}
							{tableData.length > 0 && (
								<tfoot className="bg-gray-100 border-t-2 border-gray-300">
									<tr>
										<td className="px-4 py-3 font-semibold text-gray-900">
											Total ({tableData.length} Partners)
										</td>
										<td className="px-4 py-3 text-right font-bold text-gray-900">
											₦
											{formatDisplayNumber(
												partnerData?.summary?.grandTotalCommission || 0
											)}
										</td>
										<td className="px-4 py-3 text-right font-bold text-blue-600">
											₦
											{formatDisplayNumber(
												partnerData?.summary?.grandTotalPartnerCommission || 0
											)}
										</td>
										<td className="px-4 py-3 text-right font-bold text-green-600">
											₦
											{formatDisplayNumber(
												partnerData?.summary?.grandTotalAgentCommission || 0
											)}
										</td>
										<td className="px-4 py-3 text-center">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-200 text-orange-900">
												{formatDisplayNumber(
													partnerData?.summary?.totalCommissions || 0
												)}
											</span>
										</td>
										<td className="px-4 py-3 text-center">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-200 text-purple-900">
												{formatDisplayNumber(
													partnerData?.summary?.totalAgents || 0
												)}
											</span>
										</td>
										<td className="px-4 py-3 text-right font-bold text-orange-600">
											₦
											{formatDisplayNumber(
												partnerData?.summary?.totalAgents &&
													partnerData?.summary?.totalAgents > 0
													? (partnerData?.summary?.grandTotalCommission || 0) /
															partnerData.summary.totalAgents
													: 0
											)}
										</td>
									</tr>
								</tfoot>
							)}
						</table>
					</div>
					{tableData.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							<p className="text-sm">No partner performance data available</p>
						</div>
					)}
				</CardBody>
			</Card>
		);
	};

	// Chart component for top agents
	const renderAgentsChart = () => {
		const chartData =
			leaderboardData?.leaderboard?.slice(0, 6).map((agent) => ({
				name:
					`${agent.firstName} ${agent.lastName}`.length > 20
						? `${agent.firstName} ${agent.lastName}`.substring(0, 20) + "..."
						: `${agent.firstName} ${agent.lastName}`,
				commission: agent.totalCommission,
				sales: agent.loanCount,
				color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
			})) || [];

		const CustomTooltip = ({ active, payload, label }: any) => {
			if (active && payload && payload.length) {
				return (
					<div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
						<p
							className={cn(
								"font-semibold text-gray-900 mb-2",
								GeneralSans_SemiBold.className
							)}
						>
							{label}
						</p>
						<div className="space-y-1">
							<p className="text-sm text-blue-600">
								Commission: ₦{formatDisplayNumber(payload[0].value)}
							</p>
							<p className="text-sm text-green-600">
								Sales: {formatDisplayNumber(payload[1].value)}
							</p>
						</div>
					</div>
				);
			}
			return null;
		};

		return (
			<Card className="h-[350px] border border-gray-200 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900",
							GeneralSans_SemiBold.className
						)}
					>
						Top Agents Performance
					</h3>
					<p className="text-sm text-gray-600">
						Commission and sales count by agent
					</p>
				</div>
				<CardBody className="p-0">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={chartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
							<YAxis />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar dataKey="commission" fill="#8b5cf6" name="Commission (₦)" />
							<Bar dataKey="sales" fill="#f59e0b" name="Sales" />
						</BarChart>
					</ResponsiveContainer>
				</CardBody>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="text-center sm:text-left">
					<h1
						className={cn(
							"text-2xl sm:text-3xl font-bold text-gray-900 mb-2",
							GeneralSans_SemiBold.className
						)}
					>
						Mobiflex Performance Dashboard
					</h1>
					<p className="text-gray-600 text-sm sm:text-base">
						Agent performance and commission statistics by period
					</p>
				</div>

				{/* Period Selector */}
				<div className="flex items-center gap-2 sm:min-w-[200px]">
					<Calendar className="w-4 h-4 text-gray-500" />
					<Select
						label="Period"
						placeholder="Select period"
						value={selectedPeriod}
						onChange={(e) =>
							setSelectedPeriod(
								e.target.value as
									| "daily"
									| "weekly"
									| "monthly"
									| "yearly"
									| "mtd"
							)
						}
						className="max-w-xs"
						size="sm"
					>
						{periodOptions.map((period) => (
							<SelectItem key={period.key} value={period.key}>
								{period.label}
							</SelectItem>
						))}
					</Select>
				</div>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="space-y-6">
					{/* Metric Cards Loading */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="animate-pulse">
								<div className="bg-gray-200 h-16 rounded-t-xl"></div>
								<div className="bg-white p-4 space-y-3 rounded-b-xl border">
									{[...Array(4)].map((_, j) => (
										<div key={j} className="flex justify-between">
											<div className="h-3 bg-gray-200 rounded w-20"></div>
											<div className="h-3 bg-gray-200 rounded w-16"></div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					{/* Charts Loading */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
						{[...Array(2)].map((_, i) => (
							<div key={i} className="animate-pulse">
								<div className="bg-gray-200 h-80 rounded-xl"></div>
							</div>
						))}
					</div>

					{/* Table Loading */}
					<div className="animate-pulse">
						<div className="bg-gray-200 h-64 rounded-xl"></div>
					</div>
				</div>
			)}

			{/* Cards Grid - Only show when not loading */}
			{!isLoading && (
				<div className="space-y-6">
					{/* Metric Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{renderMetricCard("agents")}
						{renderMetricCard("commission")}
						{renderMetricCard("loans")}
					</div>

					{/* Charts */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
						{renderPartnersChart()}
						{renderAgentsChart()}
					</div>

					{/* Partner Performance Table */}
					<div className="w-full">{renderPartnerPerformanceTable()}</div>

					{/* Additional Metrics Grid */}
					{metrics.length > 0 && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							{metrics.map((metric, index) => (
								<div
									key={index}
									className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
								>
									<div className="flex items-center justify-between mb-2">
										<h3
											className={cn(
												"text-sm font-medium text-gray-700",
												GeneralSans_Meduim.className
											)}
										>
											{metric.title}
										</h3>
									</div>
									<div className="flex items-baseline justify-between">
										<span
											className={cn(
												"text-lg font-bold text-gray-900",
												GeneralSans_SemiBold.className
											)}
										>
											{metric.hasNaira ? `₦${metric.value}` : metric.value}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* No records state */}
			{hasNoRecords && !isLoading && (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<BarChart3 className="w-8 h-8 text-gray-400" />
					</div>
					<h3
						className={cn(
							"text-lg font-semibold text-gray-900 mb-2",
							GeneralSans_SemiBold.className
						)}
					>
						No Mobiflex Data Available
					</h3>
					<p className="text-gray-600">
						There are no Mobiflex performance records available at the moment.
					</p>
				</div>
			)}
		</div>
	);
};

export default MobiflexDailyDashCard;
