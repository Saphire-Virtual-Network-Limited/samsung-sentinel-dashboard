"use client";

import React, { useState, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Button,
	Skeleton,
	Spinner,
} from "@heroui/react";
import { StatCard } from "@/components/atoms/StatCard";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
	LineChart,
	Line,
} from "recharts";
import {
	MapPin,
	Users,
	CreditCard,
	Wrench,
	TrendingUp,
	Calendar,
	Download,
	Clock,
} from "lucide-react";
import {
	useRepairStoreDashboard,
	useServiceCenterComparison,
	useRepairStoreDetails,
} from "@/hooks/repair-store/useRepairStoreDashboard";
import { useRepairStoreServiceCenters } from "@/hooks/repair-store/useRepairStoreServiceCenters";
import { DashboardFilter } from "@/lib/api/dashboard";

export default function RepairStoreStatisticsView() {
	// Filter states
	const [filter, setFilter] = useState<DashboardFilter>("mtd");
	const [selectedCenterId, setSelectedCenterId] = useState<string>("all");

	// Fetch service centers
	const { serviceCenters: serviceCentersData, isLoading: isLoadingCenters } =
		useRepairStoreServiceCenters();

	// Fetch dashboard statistics
	const { stats, isLoading, error } = useRepairStoreDashboard({ filter });

	// Fetch service center comparison data
	const {
		comparison,
		isLoading: isLoadingComparisons,
		error: comparisonsError,
	} = useServiceCenterComparison({ filter });

	// Fetch repair store details (includes monthly revenue trend & performance by state)
	const {
		details,
		isLoading: isLoadingDetails,
		error: detailsError,
	} = useRepairStoreDetails({
		filter,
		service_center_id:
			selectedCenterId === "all" ? undefined : selectedCenterId,
	});

	// Extract data from API response
	const overview = stats?.overview;
	const comparisonData = useMemo(
		() => comparison?.comparison || [],
		[comparison]
	);
	const detailsData = details?.details;

	// Selection handlers
	const handleFilterChange = (keys: any) => {
		const selectedFilter = Array.from(keys)[0] as DashboardFilter;
		setFilter(selectedFilter);
	};

	const handleSelectedCenterChange = (keys: any) => {
		const selected = Array.from(keys)[0] as string;
		setSelectedCenterId(selected);
	};

	// Service centers dropdown from fetched service centers
	const serviceCenters = [
		{ name: "All Centers", uid: "all" },
		...(serviceCentersData?.map((center) => ({
			name: center.name || "Unknown Center",
			uid: center.id,
		})) || []),
	];

	const filterOptions = [
		{ name: "Daily", uid: "daily" },
		{ name: "Weekly", uid: "weekly" },
		{ name: "Month to Date", uid: "mtd" },
		{ name: "All Time", uid: "inception" },
	];

	// Statistics data from API
	const overallStats = useMemo(
		() => ({
			totalCenters: overview?.total_service_centers || 0,
			totalEngineers: overview?.total_engineers || 0,
			totalRepairs: overview?.total_repairs || 0,
			totalRevenue: overview?.total_revenue || 0,
			monthlyRevenue: overview?.monthly_revenue || 0,
			pendingClaims: overview?.pending_claims || 0,
			inProgressClaims: overview?.in_progress_claims || 0,
			completedClaims: overview?.completed_claims || 0,
		}),
		[overview]
	);

	// Service center performance data (from comparison API)
	const centerPerformanceData = useMemo(
		() =>
			comparisonData?.map((center) => ({
				center: center.service_center_name || "Unknown",
				repairs: center.number_of_repairs || 0,
				revenue: center.total_revenue || 0,
				engineers: center.number_of_engineers || 0,
			})) || [],
		[comparisonData]
	);

	// State performance data (from details API)
	const statePerformanceData = useMemo(
		() =>
			detailsData?.service_center_performance?.map((state) => ({
				state: state.state || "Unknown",
				repairs: state.number_of_repairs || 0,
			})) || [],
		[detailsData]
	);

	// Monthly revenue trend data (from details API) - format date to month name
	const monthlyRevenueData = useMemo(
		() =>
			detailsData?.monthly_revenue_trend?.map((item) => ({
				month: new Date(item.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				revenue: item.revenue || 0,
			})) || [],
		[detailsData]
	);

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Export function
	const handleExportReport = () => {
		// Implementation for export functionality
		console.log("Exporting statistics report");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Analytics & Statistics
					</h1>
					<p className="text-gray-600">
						Monitor performance across all your service centers
					</p>
				</div>
				<div className="flex items-center gap-4">
					<Select
						label="Time Range"
						className="max-w-xs"
						selectedKeys={new Set([filter])}
						onSelectionChange={handleFilterChange}
						size="sm"
					>
						{filterOptions.map((option) => (
							<SelectItem key={option.uid} value={option.uid}>
								{option.name}
							</SelectItem>
						))}
					</Select>
					{/**	<Select
						label="Service Center"
						className="max-w-xs"
						selectedKeys={new Set([selectedCenterId])}
						onSelectionChange={handleSelectedCenterChange}
						size="sm"
						isDisabled={isLoadingCenters}
					>
						{serviceCenters.map((center) => (
							<SelectItem key={center.uid} value={center.uid}>
								{center.name}
							</SelectItem>
						))}
					</Select> */}
					<Button
						color="primary"
						startContent={<Download size={16} />}
						onPress={handleExportReport}
					>
						Export Report
					</Button>
				</div>
			</div>

			{/* Overview Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
				{isLoading ? (
					<>
						{[...Array(6)].map((_, idx) => (
							<Card key={idx} className="border border-default-200">
								<CardBody className="p-4">
									<Skeleton className="h-4 w-24 mb-2 rounded" />
									<Skeleton className="h-8 w-16 rounded" />
								</CardBody>
							</Card>
						))}
					</>
				) : (
					<>
						<StatCard
							title="Service Centers"
							value={overallStats.totalCenters.toString()}
							icon={<MapPin className="w-5 h-5" />}
						/>
						<StatCard
							title="Total Engineers"
							value={overallStats.totalEngineers.toString()}
							icon={<Users className="w-5 h-5" />}
						/>
						<StatCard
							title="Total Repairs"
							value={overallStats.totalRepairs.toLocaleString()}
							icon={<Wrench className="w-5 h-5" />}
						/>
						<StatCard
							title="Total Revenue"
							value={formatCurrency(overallStats.totalRevenue)}
							icon={<CreditCard className="w-5 h-5" />}
						/>
						<StatCard
							title="Monthly Revenue"
							value={formatCurrency(overallStats.monthlyRevenue)}
							icon={<TrendingUp className="w-5 h-5" />}
						/>
						<StatCard
							title="Pending Claims"
							value={overallStats.pendingClaims.toString()}
							icon={<Clock className="w-5 h-5" />}
						/>
					</>
				)}
			</div>

			{/* Charts Grid - Monthly Revenue & State Performance */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Monthly Revenue Trend */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Monthly Revenue Trend</h3>
					</CardHeader>
					<CardBody>
						{isLoadingDetails ? (
							<div className="h-[300px] flex items-center justify-center">
								<Spinner size="lg" />
							</div>
						) : monthlyRevenueData.length === 0 ? (
							<div className="h-[300px] flex items-center justify-center text-gray-500">
								No monthly revenue data available
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={monthlyRevenueData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis
										tickFormatter={(value) =>
											value >= 1000000
												? `₦${(value / 1000000).toFixed(1)}M`
												: value >= 1000
												? `₦${(value / 1000).toFixed(1)}K`
												: `₦${value}`
										}
									/>
									<Tooltip
										formatter={(value) => [
											formatCurrency(value as number),
											"Revenue",
										]}
									/>
									<Area
										type="monotone"
										dataKey="revenue"
										stroke="#0088FE"
										fill="#0088FE"
										fillOpacity={0.3}
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardBody>
				</Card>

				{/* State Performance */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Performance by State</h3>
					</CardHeader>
					<CardBody>
						{isLoadingDetails ? (
							<div className="h-[300px] flex items-center justify-center">
								<Spinner size="lg" />
							</div>
						) : statePerformanceData.length === 0 ? (
							<div className="h-[300px] flex items-center justify-center text-gray-500">
								No state performance data available
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={statePerformanceData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="state" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="repairs" fill="#00C49F" name="Repairs" />
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardBody>
				</Card>
			</div>

			{/* Service Center Performance Chart */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Service Center Performance</h3>
				</CardHeader>
				<CardBody>
					{isLoadingComparisons ? (
						<div className="h-[300px] flex items-center justify-center">
							<Spinner size="lg" />
						</div>
					) : centerPerformanceData.length === 0 ? (
						<div className="h-[300px] flex items-center justify-center text-gray-500">
							No service center data available
						</div>
					) : (
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={centerPerformanceData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="center" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="repairs" fill="#0088FE" name="Repairs" />
							</BarChart>
						</ResponsiveContainer>
					)}
				</CardBody>
			</Card>

			{/* Service Center Comparison */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Service Center Comparison</h3>
				</CardHeader>
				<CardBody>
					{isLoadingComparisons ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{[...Array(4)].map((_, idx) => (
								<div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
									<Skeleton className="h-6 w-32 rounded" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-full rounded" />
										<Skeleton className="h-4 w-full rounded" />
										<Skeleton className="h-4 w-full rounded" />
									</div>
								</div>
							))}
						</div>
					) : centerPerformanceData.length === 0 ? (
						<div className="h-32 flex items-center justify-center text-gray-500">
							No service center data available
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{centerPerformanceData.map((center) => (
								<div
									key={center.center}
									className="p-4 bg-gray-50 rounded-lg space-y-3"
								>
									<div className="flex items-center justify-between">
										<h4 className="font-semibold">{center.center}</h4>
									</div>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-sm text-gray-600">Engineers</span>
											<span className="font-medium">{center.engineers}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm text-gray-600">Repairs</span>
											<span className="font-medium">{center.repairs}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm text-gray-600">Revenue</span>
											<span className="font-medium">
												{formatCurrency(center.revenue)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
}
