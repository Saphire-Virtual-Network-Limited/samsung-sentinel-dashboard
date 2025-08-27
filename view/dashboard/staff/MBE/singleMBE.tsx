"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	Chip,
	Snippet,
	SortDescriptor,
	ChipProps,
} from "@heroui/react";
import { ArrowLeft, Users, Store, CreditCard, User } from "lucide-react";
import { getMBEwithCustomer, showToast } from "@/lib";
import { PaymentReceipt } from "@/components/reususables/custom-ui";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { FormField, SelectField } from "@/components/reususables";
import { MBERecord } from "./types";
import useSWR from "swr";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function SingleMBEPage() {
	const params = useParams();
	const router = useRouter();
	const [mbe, setMbe] = useState<MBERecord | null>(null);

	// Table state for customers
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "customerName",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;
	// Date filter state
	const [dateRange, setDateRange] = useState<{
		start: string | null;
		end: string | null;
	}>({ start: null, end: null });

	// Use SWR like mbeView.tsx does
	const {
		data: raw,
		isLoading,
		error,
	} = useSWR(
		"mbe-records",
		() =>
			getMBEwithCustomer()
				.then((r) => {
					console.log("API response:", r);
					// Handle different response structures
					let data;
					if (r.data) {
						data = r.data;
					} else if (Array.isArray(r)) {
						data = r;
					} else if (r.records) {
						data = r.records;
					} else {
						data = r;
					}

					if (!data || data.length === 0) {
						return [];
					}
					return data;
				})
				.catch((error) => {
					console.error("Error fetching mbe records:", error);
					throw error;
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

	// Process data like mbeView.tsx does
	const safeRaw =
		raw && Array.isArray(raw.data)
			? raw.data
			: raw && Array.isArray(raw)
			? raw
			: raw?.records
			? raw.records
			: [];

	useEffect(() => {
		if (!params.id || !safeRaw || safeRaw.length === 0) {
			return;
		}

		console.log("Looking for MBE with ID:", params.id);
		console.log("Available data:", safeRaw);

		// Find the specific MBE by ID - try both string and number comparison
		const mbeData = safeRaw.find(
			(c: MBERecord) =>
				c.mbeId === params.id ||
				c.mbeId === String(params.id) ||
				String(c.mbeId) === params.id
		);

		console.log("Found MBE data:", mbeData);

		// Debug: Show available MBE IDs and their types
		const availableIds = safeRaw
			.map((c: MBERecord) => ({
				id: c.mbeId,
				type: typeof c.mbeId,
				firstname: c.firstname,
			}))
			.slice(0, 5);
		console.log("Available MBE IDs (first 5):", availableIds);
		console.log("Looking for ID:", params.id);
		console.log("Looking for ID type:", typeof params.id);

		if (mbeData) {
			setMbe(mbeData);
		} else {
			showToast({
				type: "error",
				message: "MBE not found",
				duration: 5000,
			});
		}
	}, [params.id, safeRaw]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		console.error("SWR Error:", error);
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-default-900 mb-2">
						Error Loading Data
					</h2>
					<p className="text-default-500 mb-4">
						{error.message || "Failed to load MBE data"}
					</p>
					<Button
						variant="flat"
						color="primary"
						startContent={<ArrowLeft />}
						onPress={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	if (!raw || (Array.isArray(raw) && raw.length === 0)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-default-900 mb-2">
						No Data Available
					</h2>
					<p className="text-default-500 mb-4">
						No MBE data is currently available. Please try again later.
					</p>
					<Button
						variant="flat"
						color="primary"
						startContent={<ArrowLeft />}
						onPress={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	if (!mbe) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-default-900 mb-2">
						MBE Not Found
					</h2>
					<p className="text-default-500 mb-4">
						The requested MBE information could not be found.
					</p>
					<Button
						variant="flat"
						color="primary"
						startContent={<ArrowLeft />}
						onPress={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	// Calculate statistics
	const customerCount = mbe.Customers?.length || 0;
	const storeCount = mbe.stores?.length || 0;
	const totalLoanAmount =
		mbe.Customers?.reduce((total, customer) => {
			return total + (customer.LoanRecord?.[0]?.loanAmount || 0);
		}, 0) || 0;

	// Table columns for customers
	const columns: ColumnDef[] = [
		{ name: "Customer Name", uid: "customerName", sortable: true },
		{ name: "Customer ID", uid: "customerId", sortable: true },
		{ name: "Email", uid: "email", sortable: true },
		{ name: "Phone", uid: "phone", sortable: true },
		{ name: "BVN", uid: "bvn", sortable: true },
		{ name: "DOB Status", uid: "dobStatus", sortable: true },
		{ name: "Loan Amount", uid: "loanAmount", sortable: true },
		{ name: "Loan Status", uid: "loanStatus", sortable: true },
		{ name: "Device", uid: "device", sortable: true },
		{ name: "Created", uid: "createdAt", sortable: true },
	];

	// Status options for loan status filter
	const statusOptions = [
		{ name: "Approved", uid: "APPROVED" },
		{ name: "Pending", uid: "PENDING" },
		{ name: "Rejected", uid: "REJECTED" },
	];

	// Status color mapping
	const statusColorMap: Record<string, ChipProps["color"]> = {
		APPROVED: "success",
		PENDING: "warning",
		REJECTED: "danger",
	};

	// Process customers data for table
	const customersData = mbe.Customers
		? mbe.Customers.map((customer) => ({
				customerName: `${customer.firstName || ""} ${customer.lastName || ""}`,
				customerId: customer.customerId || "N/A",
				email: customer.email || "N/A",
				phone: customer.mainPhoneNumber || customer.bvnPhoneNumber || "N/A",
				bvn: customer.bvn || "N/A",
				dobStatus: customer.dobMisMatch ? "Mismatch" : "Verified",
				loanAmount: customer.LoanRecord?.[0]?.loanAmount || 0,
				loanStatus: customer.LoanRecord?.[0]?.loanStatus || "N/A",
				device: customer.LoanRecord?.[0]?.deviceName || "N/A",
				createdAt: customer.createdAt || "N/A",
				// Keep original data for reference
				originalCustomer: customer,
		  }))
		: [];

	// Debug: Log some sample createdAt values
	if (customersData.length > 0) {
		console.log(
			"Sample createdAt values:",
			customersData.slice(0, 3).map((c) => ({
				name: c.customerName,
				createdAt: c.createdAt,
				type: typeof c.createdAt,
			}))
		);
	}

	// Filter customers
	let filtered = [...customersData];

	// Date filter logic
	if (dateRange.start && dateRange.end) {
		console.log("Date filter active:", {
			start: dateRange.start,
			end: dateRange.end,
		});
		const start = new Date(dateRange.start);
		const end = new Date(dateRange.end);
		// Set end time to end of day for inclusive filtering
		end.setHours(23, 59, 59, 999);

		const beforeFilter = filtered.length;
		filtered = filtered.filter((c) => {
			if (!c.createdAt || c.createdAt === "N/A") return false;

			const created = new Date(c.createdAt);
			console.log(
				"Checking customer:",
				c.customerName,
				"createdAt:",
				c.createdAt,
				"parsed:",
				created
			);

			// Include if createdAt is between start and end (inclusive)
			const isInRange = created >= start && created <= end;
			console.log("Is in range:", isInRange);
			return isInRange;
		});

		console.log(`Date filter: ${beforeFilter} -> ${filtered.length} customers`);
	}

	if (filterValue) {
		const f = filterValue.toLowerCase();
		filtered = filtered.filter(
			(c) =>
				c.customerName.toLowerCase().includes(f) ||
				c.customerId.toLowerCase().includes(f) ||
				c.email.toLowerCase().includes(f) ||
				c.phone.toLowerCase().includes(f) ||
				c.bvn.toLowerCase().includes(f)
		);
	}

	if (statusFilter.size > 0) {
		filtered = filtered.filter((c) => statusFilter.has(c.loanStatus));
	}

	// Pagination
	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const start = (page - 1) * rowsPerPage;
	const paged = filtered.slice(start, start + rowsPerPage);

	// Sorting
	const sorted = [...paged].sort((a, b) => {
		const aVal = a[sortDescriptor.column as keyof typeof a];
		const bVal = b[sortDescriptor.column as keyof typeof b];
		const cmp = aVal && bVal ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) : 0;
		return sortDescriptor.direction === "descending" ? -cmp : cmp;
	});

	// Export function
	const exportFn = async (data: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("MBE Customers");

		ws.columns = columns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));

		data.forEach((r) => ws.addRow(r));
		const buf = await wb.xlsx.writeBuffer();
		saveAs(
			new Blob([buf]),
			`MBE_Customers_${mbe.firstname || "Unknown"}_${
				mbe.lastname || "MBE"
			}.xlsx`
		);
	};

	// Render cell function
	const renderCell = (row: any, key: string) => {
		if (key === "loanAmount") {
			return `₦${row[key]?.toLocalString("en-GB") || "N/A"}`;
		}
		if (key === "dobStatus") {
			return (
				<Chip
					color={row[key] === "Verified" ? "success" : "danger"}
					variant="flat"
					size="sm"
				>
					{row[key]}
				</Chip>
			);
		}
		if (key === "loanStatus") {
			return (
				<Chip
					color={statusColorMap[row[key]] || "default"}
					variant="flat"
					size="sm"
				>
					{row[key]}
				</Chip>
			);
		}
		if (key === "createdAt") {
			return row[key] !== "N/A"
				? new Date(row[key]).toLocaleDateString()
				: "N/A";
		}
		return row[key];
	};

	return (
		<div className="min-h-screen bg-default-50">
			{/* Header Section */}
			<div className="bg-white border-b border-default-200">
				<div className="py-4 md:py-6 px-4 md:px-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
							<div>
								<h1 className="text-base md:text-lg font-bold text-default-900">
									{mbe.firstname} {mbe.lastname}
								</h1>
								<p className="text-sm text-default-500">{mbe.title}</p>
							</div>
							<Chip
								color={mbe.accountStatus === "ACTIVE" ? "success" : "warning"}
								variant="flat"
								className="font-medium"
							>
								{mbe.accountStatus || "UNKNOWN"}
							</Chip>
						</div>
						<Button
							variant="flat"
							color="primary"
							startContent={<ArrowLeft />}
							onPress={() => router.back()}
							className="w-full sm:w-auto"
						>
							Go Back
						</Button>
					</div>
				</div>
			</div>

			<div className="px-2 py-8">
				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-primary-100 rounded-lg">
								<Users className="w-6 h-6 text-primary" />
							</div>
							<div>
								<p className="text-sm text-default-500">Total Customers</p>
								<p className="text-2xl font-bold text-default-900">
									{customerCount}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-success-100 rounded-lg">
								<Store className="w-6 h-6 text-success" />
							</div>
							<div>
								<p className="text-sm text-default-500">Assigned Stores</p>
								<p className="text-2xl font-bold text-default-900">
									{storeCount}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-warning-100 rounded-lg">
								<CreditCard className="w-6 h-6 text-warning" />
							</div>
							<div>
								<p className="text-sm text-default-500">Total Loan Amount</p>
								<p className="text-2xl font-bold text-default-900">
									₦{totalLoanAmount.toLocalString("en-GB")}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - MBE Information */}
					<div className="lg:col-span-1 space-y-6">
						{/* MBE Personal Information */}
						<div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
							<div className="p-4 border-b border-default-200">
								<h3 className="text-lg font-semibold text-default-900 flex items-center gap-2">
									<User className="w-5 h-5" />
									MBE Information
								</h3>
							</div>
							<div className="p-4">
								<div className="space-y-4">
									<div>
										<div className="text-sm text-default-500 mb-1">MBE ID</div>
										<div className="font-medium text-default-900 flex items-center gap-2">
											{mbe.mbeId || "N/A"}
											<Snippet
												codeString={mbe.mbeId || ""}
												classNames={{
													base: "p-0",
													content: "p-0",
												}}
												className="p-0"
												size="sm"
												hideSymbol
												hideCopyButton={false}
											/>
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">
											Full Name
										</div>
										<div className="font-medium text-default-900">
											{mbe.firstname && mbe.lastname
												? `${mbe.firstname} ${mbe.lastname}`
												: "N/A"}
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">Email</div>
										<div className="font-medium text-default-900">
											{mbe.email || "N/A"}
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">Phone</div>
										<div className="font-medium text-default-900">
											{mbe.phone || "N/A"}
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">BVN</div>
										<div className="font-medium text-default-900">
											{mbe.bvn || "N/A"}
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">
											MBE Old ID
										</div>
										<div className="font-medium text-default-900">
											{mbe.mbe_old_id || "N/A"}
										</div>
									</div>
									<div>
										<div className="text-sm text-default-500 mb-1">MBE ID</div>
										<div className="font-medium text-default-900">
											{mbe.mbeId || "N/A"}
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">State</div>
										<div className="font-medium text-default-900">
											{mbe.state || "N/A"}
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">Role</div>
										<div className="font-medium text-default-900">
											{mbe.role || "N/A"}
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">
											Account Status
										</div>
										<div className="font-medium">
											<Chip
												color={
													mbe.accountStatus === "ACTIVE" ? "success" : "warning"
												}
												variant="flat"
												size="sm"
											>
												{mbe.accountStatus || "UNKNOWN"}
											</Chip>
										</div>
									</div>

									<div>
										<div className="text-sm text-default-500 mb-1">
											Created At
										</div>
										<div className="font-medium text-default-900">
											{mbe.createdAt
												? new Date(mbe.createdAt).toLocalString("en-GB")
												: "N/A"}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Stores Assigned */}
						<div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
							<div className="p-4 border-b border-default-200">
								<h3 className="text-lg font-semibold text-default-900 flex items-center gap-2">
									<Store className="w-5 h-5" />
									Assigned Stores ({storeCount})
								</h3>
							</div>
							<div className="p-4">
								{mbe.stores && mbe.stores.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead>
												<tr className="bg-default-100">
													<th className="px-4 py-2 text-left text-sm font-medium text-default-700">
														Store ID
													</th>
													<th className="px-4 py-2 text-left text-sm font-medium text-default-700">
														MBE ID
													</th>
													<th className="px-4 py-2 text-left text-sm font-medium text-default-700">
														MBE Old ID
													</th>
													<th className="px-4 py-2 text-left text-sm font-medium text-default-700">
														Store Old ID
													</th>
												</tr>
											</thead>
											<tbody>
												{mbe.stores.map((store, index) => (
													<tr
														key={index}
														className="border-t border-default-200"
													>
														<td className="px-4 py-3 text-sm text-default-900">
															{store.storeId || "N/A"}
														</td>
														<td className="px-4 py-3 text-sm text-default-500">
															{store.mbeId || "N/A"}
														</td>
														<td className="px-4 py-3 text-sm text-default-500">
															{store.mbeOldId || "N/A"}
														</td>
														<td className="px-4 py-3 text-sm text-default-500">
															{store.storeOldId || "N/A"}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="text-center py-8 text-default-500">
										<Store className="w-12 h-12 mx-auto mb-2 text-default-300" />
										<p>No stores assigned</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Column - Customers Table */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden">
							<div className="p-4 border-b border-default-200">
								<h3 className="text-lg font-semibold text-default-900 flex items-center gap-2">
									<Users className="w-5 h-5" />
									Registered Customers ({customerCount})
								</h3>
							</div>
							<div className="p-4">
								{mbe.Customers && mbe.Customers.length > 0 ? (
									<GenericTable
										columns={columns}
										data={sorted}
										allCount={filtered.length}
										exportData={filtered}
										isLoading={false}
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
										exportFn={exportFn}
										renderCell={renderCell}
										hasNoRecords={filtered.length === 0}
										onDateFilterChange={(start, end) => {
											console.log("Date filter changed:", { start, end });
											setDateRange({ start, end });
											setPage(1);
										}}
										initialStartDate={dateRange.start || undefined}
										initialEndDate={dateRange.end || undefined}
									/>
								) : (
									<div className="text-center py-8 text-default-500">
										<Users className="w-12 h-12 mx-auto mb-2 text-default-300" />
										<p>No customers registered</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
