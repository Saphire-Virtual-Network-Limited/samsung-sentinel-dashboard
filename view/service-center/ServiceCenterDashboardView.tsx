"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardBody,
	CardHeader,
	Chip,
	Button,
	Skeleton,
	Select,
	SelectItem,
	DatePicker,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import {
	ClipboardList,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	TrendingUp,
	Wrench,
	Package,
	ShoppingBag,
	Eye,
	ArrowRight,
	Search,
	DollarSign,
	Calendar,
} from "lucide-react";
import { useServiceCenterDashboardStats } from "@/hooks/service-center";
import { DashboardFilter } from "@/lib/api/dashboard";
import ServiceCenterSearchImeiModal from "@/components/modals/ServiceCenterSearchImeiModal";

const FILTER_OPTIONS = [
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Month to Date", value: "mtd" },
	{ label: "Since Inception", value: "inception" },
	{ label: "Custom", value: "custom" },
];

const ServiceCenterDashboardView = () => {
	const router = useRouter();

	// Get MTD default values
	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const defaultStartDate = firstDayOfMonth.toISOString().split("T")[0];
	const defaultEndDate = today.toISOString().split("T")[0];

	const [filter, setFilter] = useState<DashboardFilter>("mtd");
	const [customStartDate, setCustomStartDate] =
		useState<string>(defaultStartDate);
	const [customEndDate, setCustomEndDate] = useState<string>(defaultEndDate);

	// Build filter params based on selection
	const filterParams = useMemo(() => {
		if (filter === "custom" && customStartDate && customEndDate) {
			return {
				filter,
				start_date: customStartDate,
				end_date: customEndDate,
			};
		}
		return { filter };
	}, [filter, customStartDate, customEndDate]);

	const { stats, isLoading, error } =
		useServiceCenterDashboardStats(filterParams);

	// Handle filter change
	const handleFilterChange = (selected: DashboardFilter) => {
		setFilter(selected);
		if (selected !== "custom") {
			// Reset to MTD defaults when switching away from custom
			setCustomStartDate(defaultStartDate);
			setCustomEndDate(defaultEndDate);
		}
	};

	const statCards = [
		{
			title: "Pending Claims",
			value: stats?.claim_statistics?.pending?.count || 0,
			icon: <Clock className="w-8 h-8" />,
			color: "warning",
			bgGradient: "from-warning-50 to-warning-100",
			iconBg: "bg-warning-100",
			iconColor: "text-warning-600",
			link: "/access/service-center/pending-claims",
			description: "Awaiting approval",
		},
		{
			title: "Approved Claims",
			value: stats?.claim_statistics?.approved?.count || 0,
			icon: <CheckCircle className="w-8 h-8" />,
			color: "success",
			bgGradient: "from-success-50 to-success-100",
			iconBg: "bg-success-100",
			iconColor: "text-success-600",
			link: "/access/service-center/approved-claims",
			description: "Ready to proceed",
		},
		{
			title: "Authorized Claims",
			value: stats?.claim_statistics?.authorized?.count || 0,
			icon: <Wrench className="w-8 h-8" />,
			color: "primary",
			bgGradient: "from-primary-50 to-primary-100",
			iconBg: "bg-primary-100",
			iconColor: "text-primary-600",
			link: "/access/service-center/claims?status=authorized",
			description: "Authorized for repair",
		},
		{
			title: "Completed",
			value: stats?.claim_statistics?.completed?.count || 0,
			icon: <CheckCircle className="w-8 h-8" />,
			color: "success",
			bgGradient: "from-green-50 to-green-100",
			iconBg: "bg-green-100",
			iconColor: "text-green-600",
			link: "/access/service-center/completed-repairs",
			description: "Repairs finished",
		},
		{
			title: "Paid Claims",
			value: stats?.claim_statistics?.paid?.count || 0,
			icon: <DollarSign className="w-8 h-8" />,
			color: "secondary",
			bgGradient: "from-purple-50 to-purple-100",
			iconBg: "bg-purple-100",
			iconColor: "text-purple-600",
			link: "/access/service-center/claims?status=paid",
			description: "Payments completed",
		},
		{
			title: "Rejected",
			value: stats?.claim_statistics?.rejected?.count || 0,
			icon: <XCircle className="w-8 h-8" />,
			color: "danger",
			bgGradient: "from-danger-50 to-danger-100",
			iconBg: "bg-danger-100",
			iconColor: "text-danger-600",
			link: "/access/service-center/rejected-claims",
			description: "Not approved",
		},
		{
			title: "Total Claims",
			value: stats?.claim_statistics?.total || 0,
			icon: <ClipboardList className="w-8 h-8" />,
			color: "default",
			bgGradient: "from-default-50 to-default-100",
			iconBg: "bg-default-100",
			iconColor: "text-default-600",
			link: "/access/service-center/claims",
			description: "All time",
		},
	];

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	if (error) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<AlertCircle className="w-16 h-16 mx-auto text-danger mb-4" />
					<p className="text-danger-600 font-medium">
						Failed to load dashboard statistics
					</p>
					<Button
						color="primary"
						className="mt-4"
						onPress={() => window.location.reload()}
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Service Center Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Monitor and manage all repair claims and service requests
					</p>
				</div>
				<div className="w-48">
					<Select
						label="Time Period"
						selectedKeys={[filter]}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0] as DashboardFilter;
							handleFilterChange(selected);
						}}
					>
						{FILTER_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</Select>
				</div>
			</div>

			{/* Custom Date Range Picker - Visible when Custom is selected */}
			{filter === "custom" && (
				<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-2 mb-3">
						<Calendar className="w-4 h-4 text-primary" />
						<h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Custom Date Range
						</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<DatePicker
							label="Start Date"
							value={customStartDate ? parseDate(customStartDate) : null}
							onChange={(date) => {
								if (date) {
									setCustomStartDate(date.toString());
								}
							}}
							maxValue={customEndDate ? parseDate(customEndDate) : undefined}
							showMonthAndYearPickers
						/>
						<DatePicker
							label="End Date"
							value={customEndDate ? parseDate(customEndDate) : null}
							onChange={(date) => {
								if (date) {
									setCustomEndDate(date.toString());
								}
							}}
							minValue={
								customStartDate ? parseDate(customStartDate) : undefined
							}
							showMonthAndYearPickers
						/>
					</div>
					{customStartDate && customEndDate && (
						<div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
							Showing data from{" "}
							<strong>{new Date(customStartDate).toLocaleDateString()}</strong>{" "}
							to <strong>{new Date(customEndDate).toLocaleDateString()}</strong>
						</div>
					)}
				</div>
			)}

			{/* Current Date Range Display */}
			{stats?.filter?.start_date && stats?.filter?.end_date && (
				<div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
					Showing data from{" "}
					{new Date(stats.filter.start_date).toLocaleDateString()} to{" "}
					{new Date(stats.filter.end_date).toLocaleDateString()}
				</div>
			)}

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((card, index) => (
					<Card
						key={index}
						isPressable
						onPress={() => router.push(card.link)}
						className="group hover:shadow-xl transition-all duration-300 border border-default-200"
					>
						<CardBody className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-600 mb-2">
										{card.title}
									</p>
									{isLoading ? (
										<Skeleton className="h-10 w-24 rounded" />
									) : (
										<div className="flex items-baseline gap-2 mb-2">
											<h3 className="text-4xl font-bold text-gray-900">
												{card.value}
											</h3>
											{card.title === "Pending Claims" && card.value > 20 && (
												<Chip
													size="sm"
													color="warning"
													variant="flat"
													className="animate-pulse"
												>
													High
												</Chip>
											)}
										</div>
									)}
									<p className="text-xs text-gray-500">{card.description}</p>
								</div>
								<div
									className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform`}
								>
									{card.icon}
								</div>
							</div>

							{/* Progress bar for visual appeal */}
							{!isLoading && stats && stats.claim_statistics.total > 0 && (
								<div className="mt-4">
									<div className="h-1.5 bg-default-100 rounded-full overflow-hidden">
										<div
											className={`h-full bg-gradient-to-r ${card.bgGradient} transition-all duration-500`}
											style={{
												width: `${Math.min(
													(card.value / stats.claim_statistics.total) * 100,
													100
												)}%`,
											}}
										/>
									</div>
								</div>
							)}
						</CardBody>
					</Card>
				))}
			</div>

			{/* Summary Cards Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Total Repair Cost */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-blue-600" />
							<h3 className="text-lg font-semibold">Total Repair Cost</h3>
						</div>
					</CardHeader>
					<CardBody className="p-6">
						{isLoading ? (
							<Skeleton className="h-12 w-32 rounded" />
						) : (
							<>
								<p className="text-3xl font-bold text-gray-900 dark:text-white">
									{formatCurrency(stats?.aggregates?.total_repair_cost || 0)}
								</p>
								<p className="text-sm text-gray-500 mt-2">
									Cumulative repair value
								</p>
							</>
						)}
					</CardBody>
				</Card>

				{/* Average Repair Time */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b">
						<div className="flex items-center gap-2">
							<Clock className="w-5 h-5 text-purple-600" />
							<h3 className="text-lg font-semibold">Avg. Repair Time</h3>
						</div>
					</CardHeader>
					<CardBody className="p-6">
						{isLoading ? (
							<Skeleton className="h-12 w-32 rounded" />
						) : (
							<>
								<p className="text-3xl font-bold text-gray-900 dark:text-white">
									{stats?.aggregates?.average_repair_time_days || "0.00"} days
								</p>
								<p className="text-sm text-gray-500 mt-2">
									Average turnaround time
								</p>
							</>
						)}
					</CardBody>
				</Card>

				{/* Completion Rate */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 border-b">
						<div className="flex items-center gap-2">
							<CheckCircle className="w-5 h-5 text-green-600" />
							<h3 className="text-lg font-semibold">Completion Rate</h3>
						</div>
					</CardHeader>
					<CardBody className="p-6">
						{isLoading ? (
							<Skeleton className="h-12 w-32 rounded" />
						) : (
							<>
								<p className="text-3xl font-bold text-gray-900 dark:text-white">
									{stats?.aggregates?.completion_rate || "0.00%"}
								</p>
								<p className="text-sm text-gray-500 mt-2">
									Successfully completed claims
								</p>
							</>
						)}
					</CardBody>
				</Card>
			</div>

			{/* Quick Actions Card */}
			<Card className="border border-default-200 shadow-md">
				<CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border-b">
					<div className="flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-primary-600" />
						<h3 className="text-lg font-semibold">Quick Actions</h3>
					</div>
				</CardHeader>
				<CardBody className="p-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
						<Button
							fullWidth
							color="primary"
							variant="flat"
							onPress={() => router.push("/access/service-center/create-claim")}
							startContent={<ClipboardList className="w-4 h-4" />}
						>
							Create New Claim
						</Button>
						<Button
							fullWidth
							color="warning"
							variant="flat"
							onPress={() =>
								router.push("/access/service-center/pending-claims")
							}
							startContent={<Clock className="w-4 h-4" />}
						>
							View Pending
						</Button>
						<ServiceCenterSearchImeiModal
							buttonText="Search IMEI"
							buttonColor="secondary"
							buttonVariant="flat"
							buttonSize="md"
							showIcon={true}
							className="w-full"
						/>
					</div>
				</CardBody>
			</Card>

			{/* Claims Distribution by Status */}
			{stats && stats.claim_statistics.total > 0 && (
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-default-50 to-default-100 dark:from-default-900 dark:to-default-950 border-b">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-primary" />
							<h3 className="text-lg font-semibold">Claims Distribution</h3>
						</div>
					</CardHeader>
					<CardBody className="p-6">
						{isLoading ? (
							<div className="space-y-4">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<Skeleton key={i} className="h-8 w-full rounded" />
								))}
							</div>
						) : (
							<div className="space-y-4">
								{[
									{
										status: "Pending",
										count: stats.claim_statistics.pending?.count || 0,
										percentage:
											stats.claim_statistics.pending?.percentage || "0%",
										color: "from-warning-400 to-warning-600",
									},
									{
										status: "Approved",
										count: stats.claim_statistics.approved?.count || 0,
										percentage:
											stats.claim_statistics.approved?.percentage || "0%",
										color: "from-success-400 to-success-600",
									},
									{
										status: "Authorized",
										count: stats.claim_statistics.authorized?.count || 0,
										percentage:
											stats.claim_statistics.authorized?.percentage || "0%",
										color: "from-primary-400 to-primary-600",
									},
									{
										status: "Completed",
										count: stats.claim_statistics.completed?.count || 0,
										percentage:
											stats.claim_statistics.completed?.percentage || "0%",
										color: "from-green-400 to-green-600",
									},
									{
										status: "Rejected",
										count: stats.claim_statistics.rejected?.count || 0,
										percentage:
											stats.claim_statistics.rejected?.percentage || "0%",
										color: "from-danger-400 to-danger-600",
									},
									{
										status: "Paid",
										count: stats.claim_statistics.paid?.count || 0,
										percentage: stats.claim_statistics.paid?.percentage || "0%",
										color: "from-purple-400 to-purple-600",
									},
								]
									.filter((item) => item.count > 0)
									.map((item, index) => {
										const percentageValue = parseFloat(
											item.percentage.replace("%", "")
										);
										return (
											<div key={index}>
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
														{item.status}
													</span>
													<span className="text-sm font-semibold text-gray-900 dark:text-white">
														{item.count} ({item.percentage})
													</span>
												</div>
												<div className="h-2 bg-default-100 rounded-full overflow-hidden">
													<div
														className={`h-full transition-all duration-500 bg-gradient-to-r ${item.color}`}
														style={{ width: `${percentageValue}%` }}
													/>
												</div>
											</div>
										);
									})}
							</div>
						)}
					</CardBody>
				</Card>
			)}

			{/* Search IMEI Modal handled by ServiceCenterSearchImeiModal */}
		</div>
	);
};

export default ServiceCenterDashboardView;
