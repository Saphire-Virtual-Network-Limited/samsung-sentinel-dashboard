import React, { useState, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Chip,
	Select,
	SelectItem,
	DatePicker,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { Calendar } from "lucide-react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import ExcelJS from "exceljs";
import { useDeviceModelStats } from "@/hooks/admin/useAdminDashboard";
import { DashboardFilter } from "@/lib/api/dashboard";

const FILTER_OPTIONS = [
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Month to Date", value: "mtd" },
	{ label: "Since Inception", value: "inception" },
	{ label: "Custom", value: "custom" },
];

interface DeviceModelStatisticsTableProps {
	/**
	 * If provided, the component will use this external filter instead of managing its own
	 */
	externalFilter?: {
		filter: DashboardFilter;
		start_date?: string;
		end_date?: string;
	};

	/**
	 * Whether to show the built-in filter selector (only shown if externalFilter is not provided)
	 */
	showFilterSelector?: boolean;

	/**
	 * Custom title for the card
	 */
	title?: string;

	/**
	 * Custom hook to fetch device stats (if different from default admin hook)
	 */
	useCustomHook?: (params: any) => {
		deviceStats: any;
		isLoading: boolean;
	};
}

export default function DeviceModelStatisticsTable({
	externalFilter,
	showFilterSelector = true,
	title = "Device Model Statistics",
	useCustomHook,
}: DeviceModelStatisticsTableProps) {
	// Get MTD default values
	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const defaultStartDate = firstDayOfMonth.toISOString().split("T")[0];
	const defaultEndDate = today.toISOString().split("T")[0];

	// Internal filter state (only used if externalFilter is not provided)
	const [internalFilter, setInternalFilter] = useState<DashboardFilter>("mtd");
	const [customStartDate, setCustomStartDate] =
		useState<string>(defaultStartDate);
	const [customEndDate, setCustomEndDate] = useState<string>(defaultEndDate);
	const [deviceSearchFilter, setDeviceSearchFilter] = useState("");

	// Determine which filter to use
	const activeFilter = externalFilter || {
		filter: internalFilter,
		...(internalFilter === "custom" && {
			start_date: customStartDate,
			end_date: customEndDate,
		}),
	};

	// Build filter params
	const filterParams = useMemo(() => {
		if (
			activeFilter.filter === "custom" &&
			activeFilter.start_date &&
			activeFilter.end_date
		) {
			return {
				filter: activeFilter.filter,
				start_date: activeFilter.start_date,
				end_date: activeFilter.end_date,
			};
		}
		return { filter: activeFilter.filter };
	}, [activeFilter]);

	// Fetch device stats using provided hook or default
	const hookToUse = useCustomHook || useDeviceModelStats;
	const { deviceStats, isLoading: isLoadingDeviceStats } =
		hookToUse(filterParams);

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

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(amount);
	};

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

	// Handle internal filter change
	const handleFilterChange = (selected: DashboardFilter) => {
		setInternalFilter(selected);
		if (selected !== "custom") {
			setCustomStartDate(defaultStartDate);
			setCustomEndDate(defaultEndDate);
		}
	};

	// Determine if we should show the filter selector
	const shouldShowFilter = !externalFilter && showFilterSelector;
	const isCustomFilter = !externalFilter && internalFilter === "custom";

	return (
		<Card>
			<CardHeader className="flex flex-col gap-4">
				<div className="flex items-center justify-between w-full">
					<h3 className="text-lg font-semibold">{title}</h3>
					{shouldShowFilter && (
						<div className="w-48">
							<Select
								label="Time Period"
								selectedKeys={[internalFilter]}
								onSelectionChange={(keys) => {
									const selected = Array.from(keys)[0] as DashboardFilter;
									handleFilterChange(selected);
								}}
								size="sm"
							>
								{FILTER_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</Select>
						</div>
					)}
				</div>

				{/* Custom Date Range Picker */}
				{isCustomFilter && (
					<div className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
								<strong>
									{new Date(customStartDate).toLocaleDateString()}
								</strong>{" "}
								to{" "}
								<strong>{new Date(customEndDate).toLocaleDateString()}</strong>
							</div>
						)}
					</div>
				)}
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
						const worksheet = workbook.addWorksheet("Device Model Statistics");

						worksheet.columns = [
							{ header: "Product Name", key: "product_name", width: 30 },
							{ header: "Total Claims", key: "total_claims", width: 15 },
							{ header: "Completed", key: "completed_repairs", width: 15 },
							{ header: "Pending", key: "pending_repairs", width: 15 },
							{ header: "Rejected", key: "rejected_repairs", width: 15 },
							{ header: "Authorized", key: "authorized_repairs", width: 15 },
							{ header: "Total Cost", key: "total_cost", width: 20 },
							{
								header: "Total Unpaid Cost",
								key: "total_unpaid_cost",
								width: 20,
							},
							{
								header: "IMEIs Uploaded",
								key: "total_imeis_uploaded",
								width: 18,
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
								completed_repairs: item.completed_repairs || 0,
								pending_repairs: item.pending_repairs || 0,
								rejected_repairs: item.rejected_repairs || 0,
								authorized_repairs: item.authorized_repairs || 0,
								total_cost: item.total_cost || 0,
								total_unpaid_cost: item.total_unpaid_cost || 0,
								total_imeis_uploaded: item.total_imeis_uploaded || 0,
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
	);
}
