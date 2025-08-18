"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	getAllAgentRecord,
	capitalize,
	calculateAge,
	GeneralSans_Meduim,
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
	SortDescriptor,
	ChipProps,
	Tabs,
	Tab,
	cn,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { AgentsData, AgentRecord } from "./types";
import {
	statusOptions,
	columns,
	verifyColumns,
	statusColorMap,
} from "./constants";
import CreateMbeModal from "@/components/modals/CreateMbeModal";

export default function SalesUsersPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get the role from the URL path (e.g., /access/dev/staff/agents -> dev)
	const role = pathname.split("/")[2];

	// Determine if we're on the verify route
	const isVerifyRoute = role === "verify";

	// Choose columns based on route
	const tableColumns = isVerifyRoute ? verifyColumns : columns;

	// State for guarantor status filter from search params
	const [guarantorStatusFilter, setGuarantorStatusFilter] = useState<
		string | null
	>(null);

	// State for active tab
	const [activeTab, setActiveTab] = useState<string>("agents");

	// State for create MBE modal
	const [isCreateMbeModalOpen, setIsCreateMbeModalOpen] = useState(false);
	const [isCreatingMbe, setIsCreatingMbe] = useState(false);

	// Extract search params and update filters
	useEffect(() => {
		const status = searchParams.get("status");
		setGuarantorStatusFilter(status);
	}, [searchParams]); // Re-run when search params change

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "fullName",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	// Handle status filter change and update URL
	const handleStatusFilterChange = (newStatusFilter: Set<string>) => {
		setStatusFilter(newStatusFilter);

		// Update URL with new status
		const params = new URLSearchParams(searchParams.toString());
		if (newStatusFilter.size > 0) {
			const firstStatus = Array.from(newStatusFilter)[0];
			params.set("status", firstStatus);
			setGuarantorStatusFilter(firstStatus);
		} else {
			params.delete("status");
			setGuarantorStatusFilter(null);
		}

		// Update URL without triggering a page reload
		const newUrl = `${pathname}?${params.toString()}`;
		router.replace(newUrl);
	};
	const MOBIFLEX_APP_KEY = process.env.NEXT_PUBLIC_MOBIFLEX_APP_KEY;
	// Fetch data based on date filter
	const {
		data: raw = [],
		isLoading,
		mutate,
	} = useSWR(
		startDate && endDate
			? ["sales-agent-records", startDate, endDate]
			: "sales-agent-records",
		() =>
			getAllAgentRecord(startDate, endDate, {
				appKey: MOBIFLEX_APP_KEY,
			})
				.then((r) => {
					if (!r.data?.data || r.data?.data?.length === 0) {
						setHasNoRecords(true);
						return [];
					}
					setHasNoRecords(false);
					return r?.data?.data;
				})
				.catch((error) => {
					console.error("Error fetching customer records:", error);
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

	// Handle create MBE modal
	const handleCreateMbe = () => {
		setIsCreateMbeModalOpen(true);
	};

	const handleCreateMbeSuccess = () => {
		// Refresh the data after successful creation
		mutate();
		setIsCreateMbeModalOpen(false);
	};

	// Create button configuration for MBEs tab
	const createMbeButton = {
		text: "Create MBE",
		onClick: handleCreateMbe,
		isLoading: isCreatingMbe,
	};

	console.log(raw);

	// FIX: Remove the extra .data access since raw is already the data array
	const salesStaff = useMemo(() => {
		if (!Array.isArray(raw)) return [];
		return raw.map((r: AgentRecord) => {
			const guarantors = r.MbeGuarantor || [];
			const guarantor1 = guarantors[0] || null;
			const guarantor2 = guarantors[1] || null;

			return {
				...r,
				fullName: `${capitalize(r.firstname)} ${capitalize(r.lastname)}`,
				age: calculateAge(r.dob),
				state: r?.MbeKyc?.state || "N/A",
				city: r?.MbeKyc?.city || "N/A",
				bvnPhoneNumber: r.bvnPhoneNumber,
				title: r?.title || "N/A",
				mainPhoneNumber: r.phone,
				// Add guarantor information for verify route
				guarantor1Status: guarantor1?.guarantorStatus || "N/A",
				guarantor1Comment: guarantor1?.comment || "No comment",
				guarantor2Status: guarantor2?.guarantorStatus || "N/A",
				guarantor2Comment: guarantor2?.comment || "No comment",
			};
		});
	}, [raw]);

	const filtered = useMemo(() => {
		// Add safety check
		if (!salesStaff || !Array.isArray(salesStaff)) {
			return [];
		}

		let list = [...salesStaff];

		// Filter by tab selection first
		if (activeTab === "agents") {
			// Filter out MBEs - assuming MBE titles contain "mbe" or specific patterns
			list = list.filter((agent: AgentRecord) => {
				const title = agent.title?.toLowerCase() || "";
				return (
					!title.includes("mbe") &&
					!title.includes("mobiflex_mbe") &&
					!title.includes("micro_business_entrepreneur")
				);
			});
		} else if (activeTab === "mbes") {
			// Filter for MBEs only
			list = list.filter((agent: AgentRecord) => {
				const title = agent.title?.toLowerCase() || "";
				return (
					title.includes("mbe") ||
					title.includes("mobiflex_mbe") ||
					title.includes("micro_business_entrepreneur")
				);
			});
		}

		// Filter by guarantor status with priority-based logic
		if (guarantorStatusFilter) {
			const targetStatus = guarantorStatusFilter.toLowerCase().trim();
			list = list.filter((agent: AgentRecord) => {
				const guarantors = agent.MbeGuarantor || [];

				if (guarantors.length === 0) return false;

				// Get all guarantor statuses in lowercase
				const statuses = guarantors
					.map((g) => g.guarantorStatus?.toLowerCase().trim())
					.filter(Boolean);

				//  If any guarantor is pending, agent appears in "pending" filter (even if some are rejected)
				if (targetStatus === "pending" && statuses.includes("pending")) {
					return true;
				}
				//  If any guarantor is rejected, agent appears in "rejected" filter
				if (targetStatus === "rejected" && statuses.includes("rejected")) {
					return true;
				}

				//  If all guarantors are approved, agent appears in "approved" filter
				if (
					targetStatus === "approved" &&
					statuses.length > 0 &&
					statuses.every((status) => status === "approved")
				) {
					return true;
				}

				return false;
			});
		}

		// Filter by search text
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter(
				(c: AgentRecord) =>
					c.firstname.toLowerCase().includes(f) ||
					c.lastname.toLowerCase().includes(f) ||
					c.email.toLowerCase().includes(f) ||
					c.bvnPhoneNumber?.toLowerCase().includes(f) ||
					c.phone?.toLowerCase().includes(f) ||
					c.title?.toLowerCase().includes(f) ||
					c.mbeId.toLowerCase().includes(f) ||
					(c.bvn && c.bvn.toString().toLowerCase().includes(f)) ||
					String(c?.customersCount)?.toLowerCase().includes(f) ||
					//     c.LoanRecord?.[0]?.storeId?.toLowerCase().includes(f) ||
					c.MbeAccountDetails?.accountNumber?.toLowerCase().includes(f)
			);
		}

		// Filter by account status
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.accountStatus || ""));
		}

		return list;
	}, [salesStaff, filterValue, statusFilter, guarantorStatusFilter, activeTab]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;

	// Calculate counts for each tab
	const agentCount = useMemo(() => {
		if (!salesStaff || !Array.isArray(salesStaff)) return 0;
		return salesStaff.filter((agent: AgentRecord) => {
			const title = agent.title?.toLowerCase() || "";
			return (
				!title.includes("mbe") &&
				!title.includes("mobiflex_mbe") &&
				!title.includes("micro_business_entrepreneur")
			);
		}).length;
	}, [salesStaff]);

	const mbeCount = useMemo(() => {
		if (!salesStaff || !Array.isArray(salesStaff)) return 0;
		return salesStaff.filter((agent: AgentRecord) => {
			const title = agent.title?.toLowerCase() || "";
			return (
				title.includes("mbe") ||
				title.includes("mobiflex_mbe") ||
				title.includes("micro_business_entrepreneur")
			);
		}).length;
	}, [salesStaff]);
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof AgentRecord];
			const bVal = b[sortDescriptor.column as keyof AgentRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export all filtered
	const exportFn = useCallback(
		async (data: AgentRecord[]) => {
			const wb = new ExcelJS.Workbook();
			const tabName = activeTab === "agents" ? "Agents" : "MBEs";
			const ws = wb.addWorksheet(
				isVerifyRoute ? `${tabName} Verification Records` : tabName
			);
			ws.columns = tableColumns
				.filter((c) => c.uid !== "actions")
				.map((c) => ({ header: c.name, key: c.uid, width: 20 }));

			data.forEach((r) => {
				const rowData: any = {
					...r,
					status: capitalize(r.accountStatus || ""),
				};
				// Add guarantor data for verify route
				if (isVerifyRoute) {
					const guarantors = r.MbeGuarantor || [];
					const guarantor1 = guarantors[0] || null;
					const guarantor2 = guarantors[1] || null;

					rowData.guarantor1Status = guarantor1?.guarantorStatus || "N/A";
					rowData.guarantor1Comment = guarantor1?.comment || "No comment";
					rowData.guarantor2Status = guarantor2?.guarantorStatus || "N/A";
					rowData.guarantor2Comment = guarantor2?.comment || "No comment";
				}
				ws.addRow(rowData);
			});

			const buf = await wb.xlsx.writeBuffer();
			const fileName = isVerifyRoute
				? `${tabName}_Verification_Records.xlsx`
				: `${tabName}_Records.xlsx`;
			saveAs(new Blob([buf]), fileName);
		},
		[activeTab, isVerifyRoute, tableColumns]
	);

	// Render each cell, including actions dropdown:
	const renderCell = (row: AgentRecord, key: string) => {
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
									router.push(`/access/${role}/staff/agents/${row.mbeId}`)
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
		// Handle guarantor status columns
		if (key === "guarantor1Status" || key === "guarantor2Status") {
			const statusValue = (row as any)[key];
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[statusValue?.toLowerCase()] || "default"}
					size="sm"
					variant="flat"
				>
					{capitalize(statusValue || "N/A")}
				</Chip>
			);
		}
		// Handle guarantor comment columns
		if (key === "guarantor1Comment" || key === "guarantor2Comment") {
			const comment = (row as any)[key];
			return (
				<div className="text-small max-w-xs">
					<span className="truncate block" title={comment}>
						{comment || "No comment"}
					</span>
				</div>
			);
		}
		if (key === "fullName") {
			return (
				<div
					className="capitalize cursor-pointer"
					onClick={() =>
						router.push(`/access/${role}/staff/agents/${row.mbeId}`)
					}
				>
					{(row as any)[key]}
				</div>
			);
		}
		return (
			<div
				className="text-small cursor-pointer"
				onClick={() => router.push(`/access/${role}/staff/agents/${row.mbeId}`)}
			>
				{(row as any)[key]}
			</div>
		);
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end"></div>

			<div className="flex w-full flex-col">
				<Tabs
					selectedKey={activeTab}
					onSelectionChange={(key) => {
						setActiveTab(key as string);
						setPage(1); // Reset to first page when switching tabs
					}}
					aria-label="Staff Categories"
					size="lg"
					radius="lg"
					color="primary"
					className={cn("pb-5", GeneralSans_Meduim.className)}
					classNames={{
						tab: "lg:p-4 text-sm lg:text-base",
					}}
				>
					<Tab
						key="agents"
						title={
							<div className="flex items-center space-x-2">
								<span>Agents</span>
								<Chip size="sm" variant="faded">
									{agentCount}
								</Chip>
							</div>
						}
						className="lg:p-4 text-base"
					>
						{isLoading ? (
							<TableSkeleton columns={tableColumns.length} rows={10} />
						) : (
							<GenericTable<AgentRecord>
								columns={tableColumns}
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
								onStatusChange={handleStatusFilterChange}
								statusColorMap={statusColorMap}
								showStatus={!isVerifyRoute} // Hide status filter for verify route since we show guarantor status
								sortDescriptor={sortDescriptor}
								onSortChange={setSortDescriptor}
								page={page}
								pages={pages}
								onPageChange={setPage}
								exportFn={exportFn}
								renderCell={renderCell}
								hasNoRecords={hasNoRecords}
								onDateFilterChange={handleDateFilter}
								initialStartDate={startDate}
								initialEndDate={endDate}
							/>
						)}
					</Tab>
					<Tab
						key="mbes"
						title={
							<div className="flex items-center space-x-2">
								<span>MBEs</span>
								<Chip size="sm" variant="faded">
									{mbeCount}
								</Chip>
							</div>
						}
						className="lg:p-4 text-base"
					>
						{isLoading ? (
							<TableSkeleton columns={tableColumns.length} rows={10} />
						) : (
							<GenericTable<AgentRecord>
								columns={tableColumns}
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
								onStatusChange={handleStatusFilterChange}
								statusColorMap={statusColorMap}
								showStatus={!isVerifyRoute} // Hide status filter for verify route since we show guarantor status
								sortDescriptor={sortDescriptor}
								onSortChange={setSortDescriptor}
								page={page}
								pages={pages}
								onPageChange={setPage}
								exportFn={exportFn}
								renderCell={renderCell}
								hasNoRecords={hasNoRecords}
								onDateFilterChange={handleDateFilter}
								initialStartDate={startDate}
								initialEndDate={endDate}
								createButton={createMbeButton}
							/>
						)}
					</Tab>
				</Tabs>
			</div>

			{/* Create MBE Modal */}
			<CreateMbeModal
				isOpen={isCreateMbeModalOpen}
				onClose={() => setIsCreateMbeModalOpen(false)}
				onSuccess={handleCreateMbeSuccess}
			/>
		</>
	);
}
