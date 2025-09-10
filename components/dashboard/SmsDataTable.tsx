"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button,
	Chip,
	Pagination,
	Input,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import {
	Search,
	ChevronDown,
	X,
	Eye,
	Download,
	RefreshCw,
} from "lucide-react";
import { getCustomerSmsTotalSent } from "@/lib";
import { showToast } from "@/lib";

export interface SmsRecord {
	id: string;
	messageId: string;
	phoneNumber: string[];
	message: string;
	status: string;
	statusCode: number;
	cost: number;
	messageParts: number;
	customerId: string | null;
	createdAt: string;
}

interface SmsDataTableProps {
	isVisible: boolean;
	onClose: () => void;
}

const SmsDataTable: React.FC<SmsDataTableProps> = ({ isVisible, onClose }) => {
	const [smsData, setSmsData] = useState<SmsRecord[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [sortDescriptor, setSortDescriptor] = useState({
		column: "createdAt" as string,
		direction: "descending" as "ascending" | "descending",
	});

	const columns = [
		{ name: "S/N", uid: "serialNumber", sortable: false },
		{ name: "Phone Number", uid: "phoneNumber", sortable: true },
		{ name: "Message", uid: "message", sortable: true },
		{ name: "Status", uid: "status", sortable: true },
		{ name: "Cost", uid: "cost", sortable: true },
		{ name: "Parts", uid: "messageParts", sortable: true },
		{ name: "Date", uid: "createdAt", sortable: true },
		{ name: "Actions", uid: "actions", sortable: false },
	];

	const rowsPerPageOptions = [5, 10, 15, 20, 25, 50];

	const fetchSmsData = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await getCustomerSmsTotalSent();
			const data = response.data?.numbers?.data || [];
			
			// Transform the data to match our interface
			const transformedData: SmsRecord[] = data.map((item: any) => ({
				id: item.id,
				messageId: item.messageId,
				phoneNumber: Array.isArray(item.phoneNumber) ? item.phoneNumber : [item.phoneNumber],
				message: item.message,
				status: item.status,
				statusCode: item.statusCode,
				cost: item.cost,
				messageParts: item.messageParts,
				customerId: item.customerId,
				createdAt: item.createdAt,
			}));

			// Check for duplicate IDs
			const ids = transformedData.map(item => item.id);
			const uniqueIds = new Set(ids);
			if (ids.length !== uniqueIds.size) {
				console.warn('Duplicate IDs found in SMS data:', {
					totalItems: transformedData.length,
					uniqueIds: uniqueIds.size,
					duplicates: ids.length - uniqueIds.size
				});
			}

			setSmsData(transformedData);
		} catch (error: any) {
			console.error("Error fetching SMS data:", error);
			showToast({
				type: "error",
				message: "Failed to fetch SMS data",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	}, []);

	React.useEffect(() => {
		if (isVisible) {
			fetchSmsData();
		}
	}, [isVisible, fetchSmsData]);

	const filteredData = useMemo(() => {
		let filtered = smsData;

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter((item) =>
				item.phoneNumber.some(phone => 
					phone.toLowerCase().includes(searchTerm.toLowerCase())
				) ||
				item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.status.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			const column = sortDescriptor.column as keyof SmsRecord;
			let aValue = a[column];
			let bValue = b[column];

			// Handle array values (phoneNumber)
			if (Array.isArray(aValue)) {
				aValue = aValue.join(", ");
			}
			if (Array.isArray(bValue)) {
				bValue = bValue.join(", ");
			}

			// Handle date values
			if (column === "createdAt") {
				aValue = new Date(aValue as string).getTime();
				bValue = new Date(bValue as string).getTime();
			}

			// Handle null/undefined values
			if (aValue == null && bValue == null) return 0;
			if (aValue == null) return 1;
			if (bValue == null) return -1;

			if (aValue < bValue) {
				return sortDescriptor.direction === "ascending" ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortDescriptor.direction === "ascending" ? 1 : -1;
			}
			return 0;
		});

		return filtered;
	}, [smsData, searchTerm, sortDescriptor]);

	const paginatedData = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filteredData.slice(start, start + rowsPerPage);
	}, [filteredData, page, rowsPerPage]);

	const totalPages = Math.ceil(filteredData.length / rowsPerPage);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "success":
				return "success";
			case "failed":
				return "danger";
			case "pending":
				return "warning";
			default:
				return "default";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const exportData = useCallback(() => {
		const csvContent = [
			["Phone Number", "Message", "Status", "Cost", "Parts", "Date"],
			...filteredData.map(item => [
				item.phoneNumber.join(", "),
				`"${item.message.replace(/"/g, '""')}"`,
				item.status,
				item.cost.toString(),
				item.messageParts.toString(),
				formatDate(item.createdAt),
			])
		].map(row => row.join(",")).join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `sms-data-${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, [filteredData]);

	if (!isVisible) return null;

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold">SMS Data</h3>
					<Chip size="sm" color="primary" variant="flat">
						{filteredData.length} records
					</Chip>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="flat"
						startContent={<RefreshCw className="w-4 h-4" />}
						onPress={fetchSmsData}
						isLoading={isLoading}
					>
						Refresh
					</Button>
					<Button
						size="sm"
						color="primary"
						variant="flat"
						startContent={<Download className="w-4 h-4" />}
						onPress={exportData}
					>
						Export
					</Button>
					<Button
						size="sm"
						variant="light"
						isIconOnly
						onPress={onClose}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
			</CardHeader>
			<CardBody className="pt-0">
				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-4 mb-4">
					<Input
						placeholder="Search by phone, message, or status..."
						startContent={<Search className="w-4 h-4 text-default-400" />}
						value={searchTerm}
						onValueChange={setSearchTerm}
						className="max-w-sm"
					/>
					<Dropdown>
						<DropdownTrigger>
							<Button variant="bordered" endContent={<ChevronDown className="w-4 h-4" />}>
								{rowsPerPage} rows
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							aria-label="Rows per page"
							selectedKeys={[rowsPerPage.toString()]}
							onSelectionChange={(keys) => {
								const selected = Array.from(keys)[0] as string;
								setRowsPerPage(Number(selected));
								setPage(1);
							}}
						>
							{rowsPerPageOptions.map((option) => (
								<DropdownItem key={option.toString()}>
									{option} rows
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<Table
						aria-label="SMS data table"
						selectionMode="none"
						sortDescriptor={sortDescriptor}
						onSortChange={(descriptor) => setSortDescriptor({
							column: descriptor.column as string,
							direction: descriptor.direction as "ascending" | "descending"
						})}
						classNames={{
							table: "min-h-[400px]",
						}}
					>
						<TableHeader columns={columns}>
							{(column) => (
								<TableColumn
									key={column.uid}
									allowsSorting={column.sortable}
									className={column.sortable ? "cursor-pointer" : ""}
								>
									{column.name}
								</TableColumn>
							)}
						</TableHeader>
						<TableBody
							emptyContent={isLoading ? "Loading..." : "No SMS records found"}
							items={isLoading ? Array(rowsPerPage).fill(null) : paginatedData}
						>
							{(item: any) => {
								const index = paginatedData.indexOf(item);
								
								if (isLoading) {
									return (
										<TableRow key={`skeleton-${Math.random()}`}>
											{columns.map((col) => (
												<TableCell key={col.uid}>
													<div className="skeleton w-full h-6" />
												</TableCell>
											))}
										</TableRow>
									);
								}

								// Calculate serial number with proper fallbacks
								const currentPage = page || 1;
								const currentRowsPerPage = rowsPerPage || 10;
								const currentIndex = index >= 0 ? index : 0;
								const serialNumber = (currentPage - 1) * currentRowsPerPage + currentIndex + 1;
								
								// Create unique key for each row
								const uniqueKey = `${item?.id || 'unknown'}-${currentPage}-${currentIndex}-${serialNumber}`;

								return (
									<TableRow key={uniqueKey}>
										<TableCell>
											<span className="font-medium text-default-600">
												{serialNumber}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												{item?.phoneNumber.map((phone: any, idx: number) => (
													<span key={idx} className="text-sm font-mono">
														{phone}
													</span>
												))}
											</div>
										</TableCell>
										<TableCell>
											<div className="max-w-xs">
												<p className="text-sm truncate" title={item?.message}>
													{item?.message}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<Chip
												size="sm"
												color={getStatusColor(item?.status || "")}
												variant="flat"
											>
												{item?.status}
											</Chip>
										</TableCell>
										<TableCell>
											<span className="font-medium">
												₦{item?.cost?.toFixed(2) || "0.00"}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-sm">{item?.messageParts}</span>
										</TableCell>
										<TableCell>
											<span className="text-sm text-default-600">
												{formatDate(item?.createdAt || "")}
											</span>
										</TableCell>
										<TableCell>
											<Button
												size="sm"
												variant="light"
												isIconOnly
												title="View details"
											>
												<Eye className="w-4 h-4" />
											</Button>
										</TableCell>
									</TableRow>
								);
							}}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center mt-4">
						<Pagination
							total={totalPages}
							page={page}
							onChange={setPage}
							showControls
							showShadow
							color="primary"
						/>
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default SmsDataTable;
