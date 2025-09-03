"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { usePaydayCustomers } from "@/hooks/creditflex";
import { useAuth } from "@/lib/globalContext";
import Link from "next/link";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	SortDescriptor,
	Chip,
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { MoreHorizontal, Eye, Mail, Phone, MapPin } from "lucide-react";
import { showToast, capitalize, getColor } from "@/lib";

// Status color mapping for customers
const statusColorMap: Record<string, any> = {
	active: "success",
	inactive: "danger",
	pending: "warning",
	suspended: "danger",
	verified: "success",
	default: "default",
};

// Status color mapping for Excel export
const STATUS_COLOR_MAP: Record<string, string> = {
	success: "FF28A745",
	warning: "FFFFC107",
	primary: "FF0D6EFD",
	danger: "FFDC3545",
	default: "FFE0E0E0",
};

const CreditflexCustomersView = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const { userResponse } = useAuth();

	const [hasNoRecords, setHasNoRecords] = useState(false);

	// Determine the user's access path based on their role
	const userAccessPath = useMemo(() => {
		const userRole = userResponse?.data?.role;
		switch (userRole) {
			case "SUPER_ADMIN":
				return "/access/admin";
			case "ADMIN":
				return "/access/sub-admin";
			case "DEVELOPER":
				return "/access/dev";
			case "FINANCE":
				return "/access/finance";
			case "AUDIT":
				return "/access/audit";
			case "VERIFICATION":
			case "VERIFICATION_OFFICER":
				return "/access/verify";
			case "SUPPORT":
				return "/access/support";
			case "HUMAN_RESOURCE":
				return "/access/hr";
			case "INVENTORY_MANAGER":
				return "/access/inventory";
			case "SALES":
				return "/access/sales";
			case "COLLECTION_ADMIN":
				return "/access/collection-admin";
			case "COLLECTION_OFFICER":
				return "/access/collection-officer";
			case "SCAN_PARTNER":
				return "/access/scan-partner";
			default:
				return "/access/admin"; // fallback
		}
	}, [userResponse?.data?.role]);

	const initialFilters = useMemo(() => {
		const search = searchParams.get("search") || undefined;
		const status = searchParams.get("status") || "all";
		const mda = searchParams.get("mda") || undefined;
		const teleMarketerId = searchParams.get("teleMarketerId") || undefined;
		const page = Number(searchParams.get("page") || 1);
		const limit = Number(searchParams.get("limit") || 10);
		return {
			search,
			status: status === "all" ? undefined : status,
			mda,
			teleMarketerId,
			page,
			limit,
		};
	}, [searchParams]);

	const {
		data: customersRes,
		error,
		isLoading,
	} = usePaydayCustomers(initialFilters);

	const [searchValue, setSearchValue] = useState(initialFilters.search || "");

	// Transform and prepare customers data
	const customersData = useMemo(() => {
		if (!customersRes?.data) {
			setHasNoRecords(!isLoading && !error);
			return [];
		}

		setHasNoRecords(false);

		// Debug: Log first customer to understand structure
		if (customersRes.data.length > 0) {
			console.log("Sample customer data structure:", customersRes.data[0]);
		}

		return customersRes.data.map((customer: any) => {
			return {
				...customer,
				customerId:
					customer.wacsCustomerId || customer.id || customer.customerId,
				fullName: `${customer.firstName || ""} ${customer.middleName || ""} ${
					customer.surname || ""
				}`.trim(),
				telemarketerName: customer.teleMarketer
					? `${customer.teleMarketer.firstname || ""} ${
							customer.teleMarketer.lastname || ""
					  }`.trim()
					: "Unassigned",
				teleMarketerId: customer.teleMarketer?.id,
				status: customer.status || "active",
				totalLoans: customer.loans?.length || 0,
				activeLoans:
					customer.loans?.filter((loan: any) => loan.status === "active")
						?.length || 0,
				totalBorrowed:
					customer.loans?.reduce(
						(sum: number, loan: any) => sum + (loan.loanAmount || 0),
						0
					) || 0,
			};
		});
	}, [customersRes, isLoading, error]);

	const total = customersRes?.pagination?.total || customersData.length;

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	const formatCurrency = (amount: number) => {
		return `₦${Number(amount).toLocaleString("en-GB")}`;
	};

	const rowsPerPage = initialFilters.limit || 10;
	const page = initialFilters.page || 1;

	// Sort descriptor expected by GenericTable
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "createdAt",
		direction: "descending",
	});

	// Status filter set for GenericTable
	const initialStatusSet = useMemo(() => {
		const s = searchParams.get("status");
		if (!s || s === "all") return new Set<string>();
		return new Set([s]);
	}, [searchParams]);
	const [statusSet, setStatusSet] = useState<Set<string>>(initialStatusSet);

	// Filter and sort data locally
	const filtered = useMemo(() => {
		if (!Array.isArray(customersData)) return [];

		let list = [...customersData];

		// Local status filtering
		if (statusSet.size > 0) {
			const selectedStatuses = Array.from(statusSet).map((s) =>
				s.toLowerCase()
			);
			list = list.filter((customer: any) =>
				selectedStatuses.includes(customer.status?.toLowerCase() || "")
			);
		}

		// Local text filtering
		if (searchValue) {
			const searchTerm = searchValue.toLowerCase();
			list = list.filter(
				(customer: any) =>
					customer.fullName?.toLowerCase().includes(searchTerm) ||
					customer.emailAddress?.toLowerCase().includes(searchTerm) ||
					customer.mobileNumber?.toLowerCase().includes(searchTerm) ||
					customer.ippisNumber?.toLowerCase().includes(searchTerm) ||
					customer.mda?.toLowerCase().includes(searchTerm) ||
					customer.telemarketerName?.toLowerCase().includes(searchTerm)
			);
		}

		return list;
	}, [customersData, searchValue, statusSet]);

	const pages = Math.ceil((total || filtered.length) / rowsPerPage) || 1;

	const paged = useMemo(() => {
		if (customersRes?.pagination) {
			return filtered;
		}

		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page, customersRes?.pagination, rowsPerPage]);

	const sorted = useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = (a as any)[sortDescriptor.column as string];
			const bVal = (b as any)[sortDescriptor.column as string];

			let cmp = 0;
			if (typeof aVal === "string" && typeof bVal === "string") {
				cmp = aVal.localeCompare(bVal);
			} else if (typeof aVal === "number" && typeof bVal === "number") {
				cmp = aVal - bVal;
			} else if (aVal instanceof Date && bVal instanceof Date) {
				cmp = aVal.getTime() - bVal.getTime();
			} else {
				cmp = String(aVal).localeCompare(String(bVal));
			}

			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Calculate important metrics for dashboard
	const metrics = useMemo(() => {
		const totalCustomers = filtered.length;
		const activeCustomers = filtered.filter(
			(c) => c.status === "active"
		).length;
		const totalBorrowed = filtered.reduce((sum, c) => sum + c.totalBorrowed, 0);
		const customersWithLoans = filtered.filter((c) => c.totalLoans > 0).length;

		return {
			totalCustomers,
			activeCustomers,
			totalBorrowed,
			customersWithLoans,
		};
	}, [filtered]);

	const exportFn = async (data: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Customers");

		ws.columns = [
			{ header: "Customer ID", key: "customerId", width: 20 },
			{ header: "Full Name", key: "fullName", width: 30 },
			{ header: "IPPIS Number", key: "ippisNumber", width: 15 },
			{ header: "Email", key: "emailAddress", width: 30 },
			{ header: "Phone", key: "mobileNumber", width: 15 },
			{ header: "MDA", key: "mda", width: 20 },
			{ header: "Rank", key: "rank", width: 15 },
			{ header: "Grade Level", key: "gradeLevel", width: 12 },
			{ header: "Monthly Salary", key: "monthlySalary", width: 15 },
			{ header: "Total Loans", key: "totalLoans", width: 12 },
			{ header: "Total Borrowed", key: "totalBorrowed", width: 18 },
			{ header: "Telemarketer", key: "telemarketerName", width: 25 },
			{ header: "Status", key: "status", width: 12 },
			{ header: "Created At", key: "createdAt", width: 18 },
		];

		data.forEach((customer, idx) => {
			const row = ws.addRow({
				sn: idx + 1,
				customerId:
					customer.wacsCustomerId || customer.customerId || customer.id,
				fullName: customer.fullName,
				ippisNumber: customer.ippisNumber || "N/A",
				emailAddress: customer.emailAddress || "N/A",
				mobileNumber: customer.mobileNumber || "N/A",
				mda: customer.mda || "N/A",
				rank: customer.rank || "N/A",
				gradeLevel: customer.gradeLevel || "N/A",
				monthlySalary: customer.monthlySalary || 0,
				totalLoans: customer.totalLoans || 0,
				totalBorrowed: customer.totalBorrowed || 0,
				telemarketerName: customer.telemarketerName || "Unassigned",
				status: customer.status || "Active",
				createdAt: formatDate(customer.createdAt),
			});

			// Color code status cell
			const colorKey = getColor(customer.status);
			const fillColor =
				STATUS_COLOR_MAP[colorKey] || STATUS_COLOR_MAP["default"];
			const statusCell = row.getCell("status");

			if (process.env.EXCEL_STATUS_COLOR === "true") {
				statusCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: fillColor },
				};
				statusCell.font = { color: { argb: "FFFFFFFF" } };
			}
		});

		// Format currency columns
		["monthlySalary", "totalBorrowed"].forEach(
			(c) => (ws.getColumn(c).numFmt = "#,##0")
		);

		// Format header row
		ws.getRow(1).font = { bold: true };
		ws.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE6E6E6" },
		};

		const buf = await wb.xlsx.writeBuffer();
		const now = new Date();
		const formattedDate = now.toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
		const formattedTime = now.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
		const fileName = `Creditflex_Customers_${formattedDate.replace(
			/ /g,
			"_"
		)}_${formattedTime.replace(/:/g, "-")}.xlsx`;
		saveAs(new Blob([buf]), fileName);
	};

	const columns = useMemo(
		() => [
			{ uid: "fullName", name: "Customer" },
			{ uid: "ippisNumber", name: "IPPIS" },
			{ uid: "emailAddress", name: "Email" },
			{ uid: "mda", name: "MDA" },
			{ uid: "totalLoans", name: "Loans" },
			{ uid: "totalBorrowed", name: "Total Borrowed" },
			{ uid: "telemarketer", name: "Telemarketer" },
			{ uid: "status", name: "Status" },
			{ uid: "actions", name: "Actions" },
		],
		[]
	);

	const renderCell = (row: any, key: string) => {
		if (key === "serialNumber") {
			const index = sorted.indexOf(row);
			const serialNumber = (page - 1) * rowsPerPage + index + 1;
			return <span className="text-sm">{serialNumber}</span>;
		}

		if (key === "fullName") {
			return (
				<div className="flex items-center gap-3">
					<div>
						<Link
							href={`${userAccessPath}/creditflex/customers/${row.customerId}`}
							className="font-medium text-blue-600 hover:text-blue-800"
						>
							{row.fullName}
						</Link>
						<div className="text-xs text-gray-500">ID: {row.customerId}</div>
					</div>
				</div>
			);
		}

		if (key === "ippisNumber") {
			return (
				<span className="font-mono text-sm">{row.ippisNumber || "N/A"}</span>
			);
		}

		if (key === "emailAddress") {
			return (
				<div className="flex items-center gap-2">
					<Mail className="w-4 h-4 text-gray-400" />
					<span className="text-sm">{row.emailAddress || "N/A"}</span>
				</div>
			);
		}

		if (key === "mda") {
			return (
				<div className="flex items-center gap-2">
					<MapPin className="w-4 h-4 text-gray-400" />
					<span className="text-sm">{row.mda || "N/A"}</span>
				</div>
			);
		}

		if (key === "totalLoans") {
			return (
				<div className="text-center">
					<div className="text-sm font-medium">{row.totalLoans}</div>
					{row.activeLoans > 0 && (
						<div className="text-xs text-green-600">
							{row.activeLoans} active
						</div>
					)}
				</div>
			);
		}

		if (key === "totalBorrowed") {
			return (
				<span className="font-medium">{formatCurrency(row.totalBorrowed)}</span>
			);
		}

		if (key === "telemarketer") {
			if (row.teleMarketerId) {
				return (
					<Link
						href={`${userAccessPath}/creditflex/telesales-agents/${row.teleMarketerId}`}
						className="text-blue-600 hover:underline"
					>
						{row.telemarketerName}
					</Link>
				);
			}
			return <span className="text-gray-500">{row.telemarketerName}</span>;
		}

		if (key === "status") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.status || ""] || "default"}
					size="sm"
					variant="flat"
				>
					{capitalize(row.status || "")}
				</Chip>
			);
		}

		if (key === "actions") {
			return (
				<Dropdown>
					<DropdownTrigger>
						<Button variant="light" isIconOnly size="sm">
							<MoreHorizontal className="w-4 h-4" />
						</Button>
					</DropdownTrigger>
					<DropdownMenu>
						<DropdownItem
							key="view"
							color="primary"
							startContent={<Eye className="w-4 h-4" />}
							onPress={() =>
								router.push(
									`${userAccessPath}/creditflex/customers/${row.customerId}`
								)
							}
						>
							View Profile
						</DropdownItem>
						<DropdownItem
							key="email"
							color="default"
							startContent={<Mail className="w-4 h-4" />}
							onPress={() =>
								window.open(`mailto:${row.emailAddress}`, "_blank")
							}
						>
							Send Email
						</DropdownItem>
						<DropdownItem
							key="phone"
							color="default"
							startContent={<Phone className="w-4 h-4" />}
							onPress={() => window.open(`tel:${row.mobileNumber}`, "_blank")}
						>
							Call Customer
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			);
		}

		return <span>{(row as any)[key] ?? "-"}</span>;
	};

	return (
		<div>
			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable
					columns={columns}
					data={sorted}
					allCount={total || filtered.length}
					exportData={filtered}
					isLoading={isLoading}
					filterValue={searchValue}
					onFilterChange={(v: string) => {
						setSearchValue(v);
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						if (v) params.set("search", v);
						else params.delete("search");
						params.set("page", "1");
						router.push(`${pathname}?${params.toString()}`);
					}}
					statusOptions={[
						{ name: "All", uid: "all" },
						{ name: "Active", uid: "active" },
						{ name: "Inactive", uid: "inactive" },
						{ name: "Pending", uid: "pending" },
						{ name: "Suspended", uid: "suspended" },
					]}
					statusFilter={statusSet}
					onStatusChange={(sel: Set<string>) => {
						setStatusSet(sel);
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						if (!sel || sel.size === 0) {
							params.delete("status");
						} else {
							const first = Array.from(sel)[0];
							if (first && first !== "all") params.set("status", first);
							else params.delete("status");
						}
						params.set("page", "1");
						router.push(`${pathname}?${params.toString()}`);
					}}
					statusColorMap={statusColorMap}
					showStatus={true}
					sortDescriptor={sortDescriptor}
					onSortChange={setSortDescriptor}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={hasNoRecords}
					page={page}
					pages={pages}
					onPageChange={(p: number) => {
						const params = new URLSearchParams(
							Object.fromEntries(searchParams.entries())
						);
						params.set("page", String(p));
						router.push(`${pathname}?${params.toString()}`);
					}}
					selectionMode="single"
				/>
			)}
		</div>
	);
};

export default CreditflexCustomersView;
