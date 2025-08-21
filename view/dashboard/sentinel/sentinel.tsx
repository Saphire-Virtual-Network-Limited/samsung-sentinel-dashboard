"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import { capitalize, getAllSentinelCustomers, SentinelCustomer } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, SortDescriptor, ChipProps } from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { exportColumns, statusOptions, columns, statusColorMap } from "./constants";



export function SentinelPage() {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split('/')[2];

	// Date filter state
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// Table state
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "registrationDate",
		direction: "descending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// Handle date filter
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	// Fetch Sentinel customers
	const { data: raw = [], isLoading } = useSWR(
		startDate && endDate ? ["sentinel-data", startDate, endDate] : "sentinel-data",
		() => getAllSentinelCustomers(startDate, endDate)
			.then((r) => {
				if (!r.data || r.data.length === 0) {
					setHasNoRecords(true);
					return [];
				}
				setHasNoRecords(false);
				return r.data;
			})
			.catch((error) => {
				console.error("Error fetching sentinel data:", error);
				setHasNoRecords(true);
				return [];
			}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true
		}
	);

	// Process the data to match what we want to display
	const customers = useMemo(() =>
		raw.map((customer: SentinelCustomer) => {
			const deviceCount = customer.SentinelCustomerDevice?.length || 0;
			const enrolledDevices = customer.SentinelCustomerDevice?.filter(
				device => device.enrollmentStatus === 'enrolled' || device.isEnrolled
			).length || 0;

			const salesStoreId = customer.SentinelCustomerDevice?.[0]?.salesStoreId || 'N/A';
			// Determine overall enrollment status
			let enrollmentStatus = "not-enrolled";
			if (enrolledDevices > 0) {
				enrollmentStatus = "enrolled";
			} else if (deviceCount > 0) {
				enrollmentStatus = "pending";
			}

			return {
				...customer,
				fullName: `${capitalize(customer.firstName)} ${capitalize(customer.lastName)}`,
				deviceCount: deviceCount.toString(),
				enrolledDevices: enrolledDevices.toString(),
				enrollmentStatus,
				storeId: salesStoreId,
				registrationDate: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-GB') : 'N/A',
				updatedDate: customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString('en-GB') : 'N/A',
			};
		}),
		[raw]
	);

	const filtered = useMemo(() => {
		let list = [...customers];

		// Filter by search value
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter((c) =>
				c.fullName?.toLowerCase().includes(f) ||
				c.email?.toLowerCase().includes(f) ||
				c.phoneNumber?.toLowerCase().includes(f) ||
				c.sentinelCustomerId?.toLowerCase().includes(f) ||
				c.storeId?.toLowerCase().includes(f) ||
				c.mbeId?.toLowerCase().includes(f) ||
				c.storeId?.toLowerCase().includes(f)
			);
		}

		// Filter by status
		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.enrollmentStatus || ''));
		}

		return list;
	}, [customers, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof typeof a];
			const bVal = b[sortDescriptor.column as keyof typeof b];

			// Handle date sorting
			if (sortDescriptor.column === 'registrationDate') {
				const aDate = new Date(a.createdAt || 0).getTime();
				const bDate = new Date(b.createdAt || 0).getTime();
				const cmp = aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
				return sortDescriptor.direction === "descending" ? -cmp : cmp;
			}

			// Handle numeric sorting for device count
			if (sortDescriptor.column === 'deviceCount') {
				const aNum = parseInt(a.deviceCount || '0');
				const bNum = parseInt(b.deviceCount || '0');
				const cmp = aNum < bNum ? -1 : aNum > bNum ? 1 : 0;
				return sortDescriptor.direction === "descending" ? -cmp : cmp;
			}

			// Default string sorting
			const cmp = String(aVal || '').localeCompare(String(bVal || ''));
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Export function
	const exportFn = async (data: any[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Sentinel Customers");

		ws.columns = exportColumns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20
		}));

		data.forEach((r) => ws.addRow({
			...r,
			enrollmentStatus: capitalize(r.enrollmentStatus || '')
		}));

		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Sentinel_Customers.xlsx");
	};

	// Render cell content
	const renderCell = (row: any, key: string) => {
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
								key="devices"
								onPress={() => router.push(`/access/${role}/reports/sales/sentinel/${row.sentinelCustomerId}`)}>
								View Devices
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "enrollmentStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.enrollmentStatus || 'not-enrolled']}
					size="sm"
					variant="flat">
					{capitalize(row.enrollmentStatus || 'not-enrolled')}
				</Chip>
			);
		}

		if (key === "fullName") {
			return (
				<div
					className="capitalize cursor-pointer"
					onClick={() => router.push(`/access/${role}/reports/sales/sentinel/${row.sentinelCustomerId}`)}>
					{row[key]}
				</div>
			);
		}

		return <div className="text-small">{row[key]}</div>;
	};

	return (
		<>
			<div className="mb-4 flex justify-center md:justify-end">
				{/* You can add filter buttons here if needed */}
			</div>

			{isLoading ? (
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable<any>
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
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={hasNoRecords}
					onDateFilterChange={handleDateFilter}
					initialStartDate={startDate}
					initialEndDate={endDate}
					searchPlaceholder="Search by name, email, phone, or ID..."
				/>
			)}
		</>
	);
}