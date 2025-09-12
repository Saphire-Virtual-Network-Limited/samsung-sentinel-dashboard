"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
	type ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	getAllScanPartners,
	capitalize,
	calculateAge,
	getScanPartnerAgents,
	getMobiflexPartnerStats,
	getMobiflexScanPartnerStatsById,
	getMobiflexPartnerApprovedAgents,
	getAllCustomerRecord,
	getAllAgentsLoansAndCommissions,
} from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Chip,
	type SortDescriptor,
	type ChipProps,
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Tabs,
	Tab,
} from "@heroui/react";
import {
	EllipsisVertical,
	TrendingUp,
	Users,
	DollarSign,
	Calendar,
} from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import type { ScanPartnerRecord } from "./types";
import { statusOptions, columns, statusColorMap } from "./constants";

export default function ScanPartnerPage() {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/staff/scan-partners -> dev)
	const role = pathname.split("/")[2];

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "companyName",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// --- sales reporting state ---
	const [selectedTab, setSelectedTab] = useState("partners");
	const [salesPeriod, setSalesPeriod] = useState<
		"daily" | "weekly" | "monthly" | "yearly" | "mtd"
	>("mtd");
	const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	// Fetch data based on date filter
	const { data: raw = [], isLoading } = useSWR(
		startDate && endDate
			? ["scan-partner-records", startDate, endDate]
			: "scan-partner-records",
		() =>
			getAllScanPartners(startDate, endDate)
				.then((r: any) => {
					if (!r.data || r.data?.length === 0) {
						setHasNoRecords(true);
						return [];
					}
					setHasNoRecords(false);
					return r?.data;
				})
				.catch((error: any) => {
					console.error("Error fetching scan partner records:", error);
					setHasNoRecords(true);
					return [];
				}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true,
		}
	);

	console.log(raw);

	// Transform scan partner data
	const scanPartners = useMemo(() => {
		if (!Array.isArray(raw)) return [];

		return raw.map((r: ScanPartnerRecord) => ({
			...r,
			fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
			age: r.dob ? calculateAge(r.dob) : "N/A",
			mbeCount: r.Mbe ? r.Mbe.length : 0,
		}));
	}, [raw]);

	// Fetch sales data for Mobiflex integration
	const { data: partnerStatsData, isLoading: isPartnerStatsLoading } = useSWR(
		`mobiflex-partner-stats-${salesPeriod}`,
		() => getMobiflexPartnerStats(salesPeriod).then((r) => r.data),
		{
			refreshInterval: 5 * 60 * 1000, // 5 minutes
			revalidateOnFocus: false,
			dedupingInterval: 2 * 60 * 1000, // 2 minutes
		}
	);

	// Fetch specific partner stats when a partner is selected
	const { data: specificPartnerData, isLoading: isSpecificPartnerLoading } =
		useSWR(
			selectedPartnerId && selectedPartnerId !== ""
				? `mobiflex-partner-specific-${selectedPartnerId}-${salesPeriod}`
				: null,
			() =>
				selectedPartnerId && selectedPartnerId !== ""
					? getMobiflexScanPartnerStatsById(
							selectedPartnerId,
							salesPeriod
					  ).then(
							(r) =>
								r.data as {
									summary: {
										totalCommission: number;
										totalAgentCommission: number;
										totalPartnerCommission: number;
										totalAgents: number;
									};
									agentPerformance: Array<{
										agent: {
											firstname: string;
											lastname: string;
											phone: string;
											mbeId: string;
										};
										totalCommission: number;
										agentCommission: number;
										partnerCommission: number;
										commissionCount: number;
									}>;
								}
					  )
					: null,
			{
				refreshInterval: 5 * 60 * 1000,
				revalidateOnFocus: false,
			}
		);

	// Fetch approved agents data for the selected partner
	const { data: approvedAgentsData, isLoading: isApprovedAgentsLoading } =
		useSWR(
			selectedPartnerId && selectedPartnerId !== ""
				? `mobiflex-approved-agents-${selectedPartnerId}`
				: null,
			() =>
				selectedPartnerId && selectedPartnerId !== ""
					? getMobiflexPartnerApprovedAgents(selectedPartnerId).then(
							(r) =>
								r.data as {
									daily: {
										totalCount: number;
									};
									mtd: {
										totalCount: number;
										period: string;
									};
									scanPartner: {
										name: string;
									};
								}
					  )
					: null,
			{
				refreshInterval: 5 * 60 * 1000,
				revalidateOnFocus: false,
			}
		);

	const filtered = useMemo(() => {
		// Add safety check
		if (!scanPartners || !Array.isArray(scanPartners)) {
			return [];
		}

		let list = [...scanPartners];

		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter(
				(c: ScanPartnerRecord & { fullName: string }) =>
					c.firstName.toLowerCase().includes(f) ||
					c.lastName.toLowerCase().includes(f) ||
					c.email.toLowerCase().includes(f) ||
					c.telephoneNumber?.toLowerCase().includes(f) ||
					c.userId.toLowerCase().includes(f) ||
					c.accountType?.toLowerCase().includes(f) ||
					c.fullName.toLowerCase().includes(f)
			);
		}

		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.accountStatus || ""));
		}

		return list;
	}, [scanPartners, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;

	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page, rowsPerPage]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof ScanPartnerRecord];
			const bVal = b[sortDescriptor.column as keyof ScanPartnerRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Enhanced Export Function with Detailed Reports using optimized utilities
	const exportFn = async (data: ScanPartnerRecord[]) => {
		try {
			// Import the optimized export function
			const { exportScanPartnerData } = await import(
				"@/utils/scanPartnerExportMain"
			);

			// Create export context with date range filtering
			const exportContext = {
				startDate,
				endDate,
				salesPeriod,
			};

			// Use the optimized export function
			await exportScanPartnerData(data, columns, exportContext);
		} catch (error) {
			console.error("Error creating comprehensive report:", error);
			// Import fallback function
			const { createFallbackExport } = await import(
				"@/utils/scanPartnerExportUtils"
			);
			await createFallbackExport(data, columns);
		}
	};

	// Render each cell, including actions dropdown:
	const renderCell = (
		row: ScanPartnerRecord & { fullName: string },
		key: string
	) => {
		if (key === "actions") {
			return (
				<div className="flex justify-end">
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem
								key="view"
								onPress={() =>
									router.push(
										`/access/${role}/staff/scan-partners/${row.userId}`
									)
								}
							>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "accountStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.accountStatus || ""]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.accountStatus || "")}
				</Chip>
			);
		}

		if (key === "isActive") {
			return (
				<Chip
					className="capitalize"
					color={row.isActive ? "success" : "danger"}
					size="sm"
					variant="flat"
				>
					{row.isActive ? "Yes" : "No"}
				</Chip>
			);
		}

		if (key === "companyName") {
			return (
				<div
					className="capitalize cursor-pointer  hover:underline"
					onClick={() =>
						router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
					}
				>
					{row?.companyName}
				</div>
			);
		}
		if (key === "fullName") {
			return (
				<div
					className="capitalize cursor-pointer  hover:underline"
					onClick={() =>
						router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
					}
				>
					{row.fullName}
				</div>
			);
		}

		if (key === "createdAt") {
			return (
				<div className="text-small">
					{new Date(row.createdAt).toLocaleDateString()}
				</div>
			);
		}

		if (key === "telephoneNumber") {
			return <div className="text-small">{row.telephoneNumber || "N/A"}</div>;
		}

		if (key === "userId") {
			return <div className="text-small font-mono">{row.userId}</div>;
		}

		if (key === "accountType") {
			return (
				<div className="text-small capitalize">
					{row.accountType?.toLowerCase() || "N/A"}
				</div>
			);
		}

		return (
			<div
				className="text-small cursor-pointer"
				onClick={() =>
					router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
				}
			>
				{(row as any)[key] || "N/A"}
			</div>
		);
	};

	return (
		<>
			<div className="space-y-6">
				{/* Sales Reporting Section */}
				<Card className="w-full">
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold">
								Mobiflex Sales Analytics
							</h3>
						</div>
						<div className="flex items-center gap-3">
							<Select
								label="Period"
								size="sm"
								value={salesPeriod}
								onChange={(e) => setSalesPeriod(e.target.value as any)}
								className="w-36"
							>
								<SelectItem key="daily" value="daily">
									Daily
								</SelectItem>
								<SelectItem key="weekly" value="weekly">
									Weekly
								</SelectItem>
								<SelectItem key="monthly" value="monthly">
									Monthly
								</SelectItem>
								<SelectItem key="mtd" value="mtd">
									MTD
								</SelectItem>
								<SelectItem key="yearly" value="yearly">
									Yearly
								</SelectItem>
							</Select>
						</div>
					</CardHeader>
					<CardBody>
						<Tabs
							selectedKey={selectedTab}
							onSelectionChange={(key) => setSelectedTab(key as string)}
						>
							<Tab key="partners" title="Partner Overview">
								<div className="space-y-4">
									{/* Summary Cards */}
									{partnerStatsData?.summary && (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
											<Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-blue-600 font-medium">
															Total Partners
														</p>
														<p className="text-2xl font-bold text-blue-800">
															{partnerStatsData?.summary?.totalPartners || 0}
														</p>
													</div>
													<Users className="h-8 w-8 text-blue-600" />
												</CardBody>
											</Card>

											<Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-green-600 font-medium">
															Total Commission
														</p>
														<p className="text-2xl font-bold text-green-800">
															₦
															{(
																partnerStatsData.summary.grandTotalCommission ||
																0
															).toLocaleString("en-GB")}
														</p>
													</div>
													<DollarSign className="h-8 w-8 text-green-600" />
												</CardBody>
											</Card>

											<Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-purple-600 font-medium">
															Total Agents
														</p>
														<p className="text-2xl font-bold text-purple-800">
															{partnerStatsData?.summary?.totalAgents || 0}
														</p>
													</div>
													<Users className="h-8 w-8 text-purple-600" />
												</CardBody>
											</Card>

											<Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-orange-600 font-medium">
															Avg Agents/Partner
														</p>
														<p className="text-2xl font-bold text-orange-800">
															{(
																partnerStatsData?.summary
																	?.averageAgentsPerPartner || 0
															).toFixed(1)}
														</p>
													</div>
													<TrendingUp className="h-8 w-8 text-orange-600" />
												</CardBody>
											</Card>
										</div>
									)}

									{/* Partner Sales Table */}
									{partnerStatsData?.partnerStats && (
										<Card>
											<CardHeader>
												<h4 className="text-md font-semibold">
													Partner Performance Breakdown
												</h4>
											</CardHeader>
											<CardBody>
												<div className="overflow-x-auto">
													<table className="w-full table-auto">
														<thead>
															<tr className="border-b">
																<th className="text-left p-3 font-medium">
																	Partner
																</th>
																<th className="text-left p-3 font-medium">
																	Total Commission
																</th>
																<th className="text-left p-3 font-medium">
																	Agent Commission
																</th>
																<th className="text-left p-3 font-medium">
																	Partner Commission
																</th>
																<th className="text-left p-3 font-medium">
																	Agents
																</th>
																<th className="text-left p-3 font-medium">
																	States
																</th>
																<th className="text-left p-3 font-medium">
																	Avg/Agent
																</th>
																<th className="text-left p-3 font-medium">
																	Actions
																</th>
															</tr>
														</thead>
														<tbody>
															{partnerStatsData?.partnerStats?.map(
																(partner, index) => (
																	<tr
																		key={partner.partnerId}
																		className="border-b hover:bg-gray-50"
																	>
																		<td className="p-3">
																			<div>
																				<p className="font-medium">
																					{partner.partnerName}
																				</p>
																				<p className="text-sm text-gray-500">
																					{partner.partnerId}
																				</p>
																			</div>
																		</td>
																		<td className="p-3 font-medium text-green-600">
																			₦
																			{(
																				partner.totalCommission || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			₦
																			{(
																				partner.totalAgentCommission || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			₦
																			{(
																				partner.totalPartnerCommission || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			<Chip
																				size="sm"
																				color="primary"
																				variant="flat"
																			>
																				{partner.agentCount}
																			</Chip>
																		</td>
																		<td className="p-3">
																			{partner.stateCount}
																		</td>
																		<td className="p-3">
																			₦
																			{(
																				partner.averageCommissionPerAgent || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			<Button
																				size="sm"
																				color="primary"
																				variant="flat"
																				onPress={() => {
																					setSelectedPartnerId(
																						partner.partnerId
																					);
																					setSelectedTab("partner-details");
																				}}
																			>
																				View Details
																			</Button>
																		</td>
																	</tr>
																)
															)}
														</tbody>
													</table>
												</div>
											</CardBody>
										</Card>
									)}
								</div>
							</Tab>

							<Tab key="partner-details" title="Partner Details">
								<div className="space-y-4">
									{!selectedPartnerId ? (
										<Card>
											<CardBody className="text-center py-8">
												<p className="text-gray-500">
													Select a partner from the overview to view detailed
													analytics
												</p>
											</CardBody>
										</Card>
									) : (
										<>
											{/* Partner Selection */}
											<Card>
												<CardBody>
													<div className="flex items-center gap-4">
														<Select
															label="Select Partner"
															value={selectedPartnerId}
															onChange={(e) =>
																setSelectedPartnerId(e.target.value)
															}
															className="max-w-xs"
														>
															{partnerStatsData?.partnerStats?.map(
																(partner) => (
																	<SelectItem
																		key={partner.partnerId}
																		value={partner.partnerId}
																	>
																		{partner.partnerName}
																	</SelectItem>
																)
															) || []}
														</Select>
													</div>
												</CardBody>
											</Card>

											{/* Specific Partner Performance */}
											{specificPartnerData && (
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
													<Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-indigo-600 font-medium">
																		Partner Commission
																	</p>
																	<p className="text-xl font-bold text-indigo-800">
																		₦
																		{(
																			specificPartnerData?.summary
																				?.totalPartnerCommission || 0
																		).toLocaleString("en-GB")}
																	</p>
																</div>
																<DollarSign className="h-6 w-6 text-indigo-600" />
															</div>
														</CardBody>
													</Card>

													<Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-emerald-600 font-medium">
																		Agent Commission
																	</p>
																	<p className="text-xl font-bold text-emerald-800">
																		₦
																		{(
																			specificPartnerData?.summary
																				?.totalAgentCommission || 0
																		).toLocaleString("en-GB")}
																	</p>
																</div>
																<Users className="h-6 w-6 text-emerald-600" />
															</div>
														</CardBody>
													</Card>

													<Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-amber-600 font-medium">
																		Total Agents
																	</p>
																	<p className="text-xl font-bold text-amber-800">
																		{specificPartnerData?.summary
																			?.totalAgents || 0}
																	</p>
																</div>
																<Users className="h-6 w-6 text-amber-600" />
															</div>
														</CardBody>
													</Card>

													<Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-rose-600 font-medium">
																		Total Commission
																	</p>
																	<p className="text-xl font-bold text-rose-800">
																		₦
																		{(
																			specificPartnerData?.summary
																				?.totalCommission || 0
																		).toLocaleString("en-GB")}
																	</p>
																</div>
																<TrendingUp className="h-6 w-6 text-rose-600" />
															</div>
														</CardBody>
													</Card>
												</div>
											)}

											{/* Top Agents for Selected Partner */}
											{specificPartnerData?.agentPerformance &&
												specificPartnerData.agentPerformance.length > 0 && (
													<Card>
														<CardHeader>
															<h4 className="text-md font-semibold">
																Top Performing Agents
															</h4>
														</CardHeader>
														<CardBody>
															<div className="overflow-x-auto">
																<table className="w-full table-auto">
																	<thead>
																		<tr className="border-b">
																			<th className="text-left p-3 font-medium">
																				Agent
																			</th>
																			<th className="text-left p-3 font-medium">
																				MBE ID
																			</th>
																			<th className="text-left p-3 font-medium">
																				Phone
																			</th>
																			<th className="text-left p-3 font-medium">
																				Total Commission
																			</th>
																			<th className="text-left p-3 font-medium">
																				Agent Commission
																			</th>
																			<th className="text-left p-3 font-medium">
																				Partner Commission
																			</th>
																			<th className="text-left p-3 font-medium">
																				Sales Count
																			</th>
																		</tr>
																	</thead>
																	<tbody>
																		{specificPartnerData.agentPerformance.map(
																			(agentData: any, index: number) => (
																				<tr
																					key={agentData.agent.mbeId}
																					className="border-b hover:bg-gray-50"
																				>
																					<td className="p-3">
																						<div>
																							<p className="font-medium">
																								{agentData.agent.firstname}{" "}
																								{agentData.agent.lastname}
																							</p>
																							<p className="text-sm text-gray-500">
																								Rank #{index + 1}
																							</p>
																						</div>
																					</td>
																					<td className="p-3 font-mono text-sm">
																						{agentData.agent.mbeId}
																					</td>
																					<td className="p-3">
																						{agentData.agent.phone}
																					</td>
																					<td className="p-3 font-medium text-green-600">
																						₦
																						{(
																							agentData.totalCommission || 0
																						).toLocaleString("en-GB")}
																					</td>
																					<td className="p-3">
																						₦
																						{(
																							agentData.agentCommission || 0
																						).toLocaleString("en-GB")}
																					</td>
																					<td className="p-3">
																						₦
																						{(
																							agentData.partnerCommission || 0
																						).toLocaleString("en-GB")}
																					</td>
																					<td className="p-3">
																						<Chip
																							size="sm"
																							color="success"
																							variant="flat"
																						>
																							{agentData.commissionCount || 0}
																						</Chip>
																					</td>
																				</tr>
																			)
																		)}
																	</tbody>
																</table>
															</div>
														</CardBody>
													</Card>
												)}

											{/* Approved Agents Summary */}
											{approvedAgentsData && (
												<Card>
													<CardHeader>
														<h4 className="text-md font-semibold">
															Agent Approval Status
														</h4>
													</CardHeader>
													<CardBody>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															{/* Daily Stats */}
															<div className="space-y-3">
																<h5 className="font-medium text-gray-700">
																	Daily Summary
																</h5>
																<div className="grid grid-cols-3 gap-3">
																	<div className="text-center p-3 bg-green-50 rounded-lg">
																		<p className="text-sm text-green-600">
																			Total Agents
																		</p>
																		<p className="text-xl font-bold text-green-800">
																			{approvedAgentsData?.daily?.totalCount ||
																				0}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-orange-50 rounded-lg">
																		<p className="text-sm text-orange-600">
																			Partner
																		</p>
																		<p className="text-xl font-bold text-orange-800">
																			{approvedAgentsData?.scanPartner?.name ||
																				"N/A"}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-blue-50 rounded-lg">
																		<p className="text-sm text-blue-600">
																			Period
																		</p>
																		<p className="text-xl font-bold text-blue-800">
																			Daily
																		</p>
																	</div>
																</div>
															</div>

															{/* Month-to-Date Stats */}
															<div className="space-y-3">
																<h5 className="font-medium text-gray-700">
																	Month-to-Date
																</h5>
																<div className="grid grid-cols-3 gap-3">
																	<div className="text-center p-3 bg-green-50 rounded-lg">
																		<p className="text-sm text-green-600">
																			Total Agents
																		</p>
																		<p className="text-xl font-bold text-green-800">
																			{approvedAgentsData?.mtd?.totalCount || 0}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-orange-50 rounded-lg">
																		<p className="text-sm text-orange-600">
																			Period
																		</p>
																		<p className="text-xl font-bold text-orange-800">
																			{approvedAgentsData?.mtd?.period || "N/A"}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-blue-50 rounded-lg">
																		<p className="text-sm text-blue-600">
																			Status
																		</p>
																		<p className="text-xl font-bold text-blue-800">
																			MTD
																		</p>
																	</div>
																</div>
															</div>
														</div>
													</CardBody>
												</Card>
											)}
										</>
									)}
								</div>
							</Tab>
						</Tabs>
					</CardBody>
				</Card>

				{/* Scan Partner Management Section */}
				<Card className="w-full">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold">Scan Partner Management</h3>
						</div>
					</CardHeader>
					<CardBody>
						<div className="mb-4 flex justify-center md:justify-end"></div>
						{isLoading ? (
							<TableSkeleton columns={columns.length} rows={10} />
						) : (
							<GenericTable<
								ScanPartnerRecord & { fullName: string; companyName: string }
							>
								columns={columns}
								data={sorted}
								allCount={filtered.length}
								exportData={filtered}
								isLoading={isLoading}
								filterValue={filterValue}
								onFilterChange={(v) => {
									setFilterValue(v);
									setPage(1);
								}}
								statusOptions={statusOptions}
								statusFilter={statusFilter}
								onStatusChange={setStatusFilter}
								statusColorMap={statusColorMap}
								showStatus={true}
								sortDescriptor={sortDescriptor}
								onSortChange={setSortDescriptor}
								page={page}
								pages={pages}
								onPageChange={setPage}
								defaultRowsPerPage={rowsPerPage}
								onRowsPerPageChange={setRowsPerPage}
								exportFn={exportFn}
								renderCell={renderCell}
								hasNoRecords={hasNoRecords}
								onDateFilterChange={handleDateFilter}
								initialStartDate={startDate}
								initialEndDate={endDate}
							/>
						)}
					</CardBody>
				</Card>
			</div>
		</>
	);
}
