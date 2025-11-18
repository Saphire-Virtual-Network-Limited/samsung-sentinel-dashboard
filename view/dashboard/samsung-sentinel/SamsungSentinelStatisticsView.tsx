"use client";

import React, { useState, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Chip,
	Skeleton,
	Spinner,
	DatePicker,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { StatCard } from "@/components/atoms/StatCard";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import ExcelJS from "exceljs";
import {
	Smartphone,
	Wrench,
	DollarSign,
	CreditCard,
	TrendingUp,
	CheckCircle,
	Calendar,
} from "lucide-react";
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	useAdminDashboardStatistics,
	useAdminTrends,
	useDeviceModelStats,
	useServiceCenterStatsForAdmin,
} from "@/hooks/admin/useAdminDashboard";
import { DashboardFilter } from "@/lib/api/dashboard";

const FILTER_OPTIONS = [
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Month to Date", value: "mtd" },
	{ label: "Since Inception", value: "inception" },
	{ label: "Custom", value: "custom" },
];

export default function SamsungSentinelStatisticsView() {
	// Get MTD default values
	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const defaultStartDate = firstDayOfMonth.toISOString().split("T")[0];
	const defaultEndDate = today.toISOString().split("T")[0];

	const [filter, setFilter] = useState<DashboardFilter>("mtd");
	const [customStartDate, setCustomStartDate] =
		useState<string>(defaultStartDate);
	const [customEndDate, setCustomEndDate] = useState<string>(defaultEndDate);
	const [deviceSearchFilter, setDeviceSearchFilter] = useState("");
	const [serviceCenterSearchFilter, setServiceCenterSearchFilter] =
		useState("");

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

	// Fetch all dashboard data
	const { stats, isLoading: isLoadingStats } =
		useAdminDashboardStatistics(filterParams);
	const { trends, isLoading: isLoadingTrends } = useAdminTrends(filterParams);
	const { deviceStats, isLoading: isLoadingDeviceStats } =
		useDeviceModelStats(filterParams);
	const { serviceCenterStats, isLoading: isLoadingServiceCenters } =
		useServiceCenterStatsForAdmin(filterParams);

	// Filtered data based on search
	const filteredDeviceStats = useMemo(() => {
		const data = deviceStats?.device_statistics || [];
		if (!deviceSearchFilter) return data;
		return data.filter((item: any) =>
			item.product_name
				?.toLowerCase()
				.includes(deviceSearchFilter.toLowerCase())
		);
	}, [deviceStats, deviceSearchFilter]);

	const filteredServiceCenterStats = useMemo(() => {
		const data = serviceCenterStats?.service_center_statistics || [];
		if (!serviceCenterSearchFilter) return data;
		return data.filter(
			(item: any) =>
				item.service_center_name
					?.toLowerCase()
					.includes(serviceCenterSearchFilter.toLowerCase()) ||
				item.location
					?.toLowerCase()
					.includes(serviceCenterSearchFilter.toLowerCase())
		);
	}, [serviceCenterStats, serviceCenterSearchFilter]);

	// Handle filter selection change
	const handleFilterChange = (selected: DashboardFilter) => {
		setFilter(selected);
		if (selected !== "custom") {
			// Reset to MTD defaults when switching away from custom
			setCustomStartDate(defaultStartDate);
			setCustomEndDate(defaultEndDate);
		}
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Format date for charts
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	// Transform trends data for charts
	const claimsChartData = useMemo(() => {
		if (!trends?.trends?.claims_over_time) return [];
		return trends.trends.claims_over_time.map((item) => ({
			date: formatDate(item.date),
			claims: item.count,
		}));
	}, [trends]);

	const costChartData = useMemo(() => {
		if (!trends?.trends?.repair_cost_over_time) return [];
		return trends.trends.repair_cost_over_time.map((item) => ({
			date: formatDate(item.date),
			total: item.total_amount,
			paid: item.paid_amount,
			unpaid: item.total_amount - item.paid_amount,
		}));
	}, [trends]);

	// Device Model Table Columns
	const deviceColumns: ColumnDef[] = [
		{ name: "Device Model", uid: "product_name", sortable: true },
		{ name: "Total Claims", uid: "total_claims", sortable: true },
		{ name: "Completed", uid: "completed_repairs", sortable: true },
		{ name: "Pending", uid: "pending_repairs", sortable: true },
		{ name: "Rejected", uid: "rejected_repairs", sortable: true },
		{ name: "Authorized", uid: "authorized_repairs", sortable: true },
		{ name: "Total Cost", uid: "total_cost", sortable: true },
		{ name: "Unpaid Cost", uid: "total_unpaid_cost", sortable: true },
		{ name: "IMEIs Uploaded", uid: "total_imeis_uploaded", sortable: true },
		{ name: "Claim Rate", uid: "claim_rate", sortable: true },
	];

	// Service Center Table Columns
	const serviceCenterColumns: ColumnDef[] = [
		{ name: "Service Center", uid: "service_center_name", sortable: true },
		{ name: "Location", uid: "location", sortable: true },
		{ name: "Approved", uid: "approved_repairs", sortable: true },
		{ name: "Completed", uid: "completed_repairs", sortable: true },
		{ name: "Rejected", uid: "rejected_repairs", sortable: true },
		{ name: "Pending", uid: "pending_repairs", sortable: true },
		{ name: "Authorized", uid: "authorized_repairs", sortable: true },
	];

	// Render cells for device table
	const renderDeviceCell = (item: any, columnKey: string) => {
		switch (columnKey) {
			case "total_cost":
			case "total_unpaid_cost":
				return formatCurrency(item[columnKey] || 0);
			case "claim_rate":
				return (
					<Chip size="sm" color="primary">
						{item[columnKey]}
					</Chip>
				);
			default:
				return item[columnKey] || 0;
		}
	};

	// Render cells for service center table
	const renderServiceCenterCell = (item: any, columnKey: string) => {
		switch (columnKey) {
			case "approved_repairs":
				return (
					<Chip size="sm" color="success" variant="flat">
						{item[columnKey] || 0}
					</Chip>
				);
			case "rejected_repairs":
				return (
					<Chip size="sm" color="danger" variant="flat">
						{item[columnKey] || 0}
					</Chip>
				);
			case "pending_repairs":
				return (
					<Chip size="sm" color="warning" variant="flat">
						{item[columnKey] || 0}
					</Chip>
				);
			default:
				return item[columnKey] || 0;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Platform Statistics
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Comprehensive analytics across all service centers
					</p>
					{/* Display current date range */}
					{stats?.filter && (
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							{stats.filter.start_date && stats.filter.end_date
								? `Showing data from ${new Date(
										stats.filter.start_date
								  ).toLocaleDateString()} to ${new Date(
										stats.filter.end_date
								  ).toLocaleDateString()}`
								: `Filter: ${stats.filter.type}`}
						</p>
					)}
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

			{/* Overview Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{isLoadingStats ? (
					<>
						{[...Array(8)].map((_, idx) => (
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
							title="Total Repairs"
							value={stats?.statistics?.total_repairs?.toString() || "0"}
							icon={<Wrench className="w-5 h-5" />}
						/>
						<StatCard
							title="Authorized Repairs"
							value={stats?.statistics?.authorized_repairs?.toString() || "0"}
							icon={<CheckCircle className="w-5 h-5" />}
						/>
						<StatCard
							title="Total Repair Cost"
							value={formatCurrency(stats?.statistics?.total_repair_cost || 0)}
							icon={<DollarSign className="w-5 h-5" />}
						/>
						<StatCard
							title="Unpaid Cost"
							value={formatCurrency(stats?.statistics?.unpaid_repair_cost || 0)}
							icon={<CreditCard className="w-5 h-5" />}
						/>
						<StatCard
							title="Total Sapphire Cost"
							value={formatCurrency(
								stats?.statistics?.total_sapphire_cost || 0
							)}
							icon={<DollarSign className="w-5 h-5" />}
						/>
						<StatCard
							title="Unpaid Sapphire Cost"
							value={formatCurrency(
								stats?.statistics?.unpaid_sapphire_cost || 0
							)}
							icon={<CreditCard className="w-5 h-5" />}
						/>
						<StatCard
							title="IMEIs Uploaded"
							value={stats?.statistics?.total_imeis_uploaded?.toString() || "0"}
							icon={<Smartphone className="w-5 h-5" />}
						/>
						<StatCard
							title="Claims Rate"
							value={stats?.statistics?.claims_rate || "0%"}
							icon={<TrendingUp className="w-5 h-5" />}
						/>
					</>
				)}
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Claims Over Time */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Claims Over Time</h3>
					</CardHeader>
					<CardBody>
						{isLoadingTrends ? (
							<div className="h-[300px] flex items-center justify-center">
								<Spinner size="lg" />
							</div>
						) : claimsChartData.length === 0 ? (
							<div className="h-[300px] flex items-center justify-center text-gray-500">
								No claims data available
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={claimsChartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis />
									<Tooltip />
									<Area
										type="monotone"
										dataKey="claims"
										stroke="#0088FE"
										fill="#0088FE"
										fillOpacity={0.3}
										name="Claims"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardBody>
				</Card>

				{/* Repair Costs Over Time */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Repair Costs Over Time</h3>
					</CardHeader>
					<CardBody>
						{isLoadingTrends ? (
							<div className="h-[300px] flex items-center justify-center">
								<Spinner size="lg" />
							</div>
						) : costChartData.length === 0 ? (
							<div className="h-[300px] flex items-center justify-center text-gray-500">
								No cost data available
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={costChartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis
										tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`}
									/>
									<Tooltip
										formatter={(value) => formatCurrency(value as number)}
									/>
									<Legend />
									<Bar
										dataKey="paid"
										stackId="cost"
										fill="#00C49F"
										name="Paid"
									/>
									<Bar
										dataKey="unpaid"
										stackId="cost"
										fill="#FFBB28"
										name="Unpaid"
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardBody>
				</Card>
			</div>

			{/* Device Model Statistics Table */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Device Model Statistics</h3>
				</CardHeader>
				<CardBody>
					<GenericTable
						data={filteredDeviceStats}
						columns={deviceColumns}
						renderCell={renderDeviceCell}
						allCount={filteredDeviceStats.length}
						exportData={filteredDeviceStats}
						isLoading={isLoadingDeviceStats}
						filterValue={deviceSearchFilter}
						onFilterChange={setDeviceSearchFilter}
						showStatus={false}
						sortDescriptor={{ column: "product_name", direction: "ascending" }}
						onSortChange={() => {}}
						page={1}
						pages={1}
						onPageChange={() => {}}
						hasNoRecords={filteredDeviceStats.length === 0}
						searchPlaceholder="Search by device model..."
						exportFn={async (data) => {
							const workbook = new ExcelJS.Workbook();
							const worksheet = workbook.addWorksheet(
								"Device Model Statistics"
							);

							worksheet.columns = [
								{ header: "Product Name", key: "product_name", width: 30 },
								{ header: "Total Claims", key: "total_claims", width: 15 },
								{ header: "Total Cost", key: "total_cost", width: 20 },
								{
									header: "Total Unpaid Cost",
									key: "total_unpaid_cost",
									width: 20,
								},
								{ header: "Claim Rate", key: "claim_rate", width: 15 },
							];

							worksheet.getRow(1).font = {
								bold: true,
								color: { argb: "FFFFFFFF" },
							};
							worksheet.getRow(1).fill = {
								type: "pattern",
								pattern: "solid",
								fgColor: { argb: "FF4472C4" },
							};
							worksheet.getRow(1).alignment = {
								vertical: "middle",
								horizontal: "center",
							};

							filteredDeviceStats.forEach((item: any) => {
								const row = worksheet.addRow({
									product_name: item.product_name,
									total_claims: item.total_claims || 0,
									total_cost: item.total_cost || 0,
									total_unpaid_cost: item.total_unpaid_cost || 0,
									claim_rate: item.claim_rate || "0%",
								});
								row.getCell("total_cost").numFmt = "₦#,##0.00";
								row.getCell("total_unpaid_cost").numFmt = "₦#,##0.00";
							});

							const buffer = await workbook.xlsx.writeBuffer();
							const blob = new Blob([buffer], {
								type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							});
							const url = URL.createObjectURL(blob);
							const link = document.createElement("a");
							link.href = url;
							link.download = `device-model-statistics-${
								new Date().toISOString().split("T")[0]
							}.xlsx`;
							link.click();
							URL.revokeObjectURL(url);
						}}
					/>
				</CardBody>
			</Card>

			{/* Service Center Statistics Table */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Service Center Performance</h3>
				</CardHeader>
				<CardBody>
					<GenericTable
						data={filteredServiceCenterStats}
						columns={serviceCenterColumns}
						renderCell={renderServiceCenterCell}
						allCount={filteredServiceCenterStats.length}
						exportData={filteredServiceCenterStats}
						isLoading={isLoadingServiceCenters}
						filterValue={serviceCenterSearchFilter}
						onFilterChange={setServiceCenterSearchFilter}
						showStatus={false}
						sortDescriptor={{
							column: "service_center_name",
							direction: "ascending",
						}}
						onSortChange={() => {}}
						page={1}
						pages={1}
						onPageChange={() => {}}
						hasNoRecords={filteredServiceCenterStats.length === 0}
						searchPlaceholder="Search by service center or location..."
						exportFn={async (data) => {
							const workbook = new ExcelJS.Workbook();
							const worksheet = workbook.addWorksheet(
								"Service Center Performance"
							);

							worksheet.columns = [
								{
									header: "Service Center",
									key: "service_center_name",
									width: 30,
								},
								{ header: "Location", key: "location", width: 25 },
								{
									header: "Approved Repairs",
									key: "approved_repairs",
									width: 18,
								},
								{
									header: "Completed Repairs",
									key: "completed_repairs",
									width: 18,
								},
								{
									header: "Rejected Repairs",
									key: "rejected_repairs",
									width: 18,
								},
								{
									header: "Pending Repairs",
									key: "pending_repairs",
									width: 18,
								},
								{
									header: "Authorized Repairs",
									key: "authorized_repairs",
									width: 18,
								},
							];

							worksheet.getRow(1).font = {
								bold: true,
								color: { argb: "FFFFFFFF" },
							};
							worksheet.getRow(1).fill = {
								type: "pattern",
								pattern: "solid",
								fgColor: { argb: "FF4472C4" },
							};
							worksheet.getRow(1).alignment = {
								vertical: "middle",
								horizontal: "center",
							};

							filteredServiceCenterStats.forEach((item: any) => {
								worksheet.addRow({
									service_center_name: item.service_center_name,
									location: item.location,
									approved_repairs: item.approved_repairs || 0,
									completed_repairs: item.completed_repairs || 0,
									rejected_repairs: item.rejected_repairs || 0,
									pending_repairs: item.pending_repairs || 0,
									authorized_repairs: item.authorized_repairs || 0,
								});
							});

							const buffer = await workbook.xlsx.writeBuffer();
							const blob = new Blob([buffer], {
								type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							});
							const url = URL.createObjectURL(blob);
							const link = document.createElement("a");
							link.href = url;
							link.download = `service-center-performance-${
								new Date().toISOString().split("T")[0]
							}.xlsx`;
							link.click();
							URL.revokeObjectURL(url);
						}}
					/>
				</CardBody>
			</Card>
		</div>
	);
}
