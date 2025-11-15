"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
	Select,
	SelectItem,
	Chip,
	SortDescriptor,
	ChipProps,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Tabs,
	Tab,
} from "@heroui/react";
import GenericTable, {
	ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import DateFilter from "@/components/reususables/custom-ui/dateFilter";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import {
	getImeiUploads,
	uploadImeiCsv,
	searchImei as searchImeiApi,
	validateImei,
} from "@/lib/api/imeis";
import { getAllClaims } from "@/lib/api/claims";
import { getAllProducts } from "@/lib/api/products";
import { showToast, capitalize } from "@/lib";
import {
	Upload,
	Download,
	Eye,
	Trash2,
	EllipsisVertical,
	FileText,
	AlertTriangle,
	Search,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Upload columns
const uploadColumns: ColumnDef[] = [
	{ name: "File Name", uid: "file_name", sortable: true },
	{ name: "Product", uid: "product_id", sortable: true },
	{ name: "Total Records", uid: "total_records", sortable: true },
	{ name: "Successful", uid: "successful_records", sortable: true },
	{ name: "Failed", uid: "failed_records", sortable: true },
	{ name: "Status", uid: "processing_status", sortable: true },
	{ name: "Uploaded At", uid: "uploaded_at", sortable: true },
	{ name: "Actions", uid: "actions" },
];

interface UploadRecord {
	id: string;
	created_at: string;
	updated_at: string;
	file_name: string;
	product_id: string;
	total_records: number;
	successful_records: number;
	failed_records: number;
	uploaded_by_id: string | null;
	uploaded_at: string;
	processing_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	error_message: string | null;
	processing_details: {
		duplicates?: string[];
		errors?: string[];
	};
	product?: {
		id: string;
		name: string;
		sapphire_cost: string;
		repair_cost: string;
		status: string;
	};
	uploaded_by?: any | null;
}

interface ClaimRecord {
	id: string;
	customer_name: string;
	status: string;
	createdAt: string;
	issue_description: string;
	imei: string;
}

export default function SamsungSentinelIMEIView() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get the role from the URL path (e.g., /access/admin/samsung-sentinel -> admin)
	const role = pathname.split("/")[2];

	// Upload modal state
	const {
		isOpen: isUploadModalOpen,
		onOpen: onUploadModalOpen,
		onClose: onUploadModalClose,
	} = useDisclosure();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedProductId, setSelectedProductId] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);

	// Search IMEI modal state
	const {
		isOpen: isSearchModalOpen,
		onOpen: onSearchModalOpen,
		onClose: onSearchModalClose,
	} = useDisclosure();
	const [searchImei, setSearchImei] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [searchResult, setSearchResult] = useState<any>(null);

	// --- date filter state managed by GenericTable ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- pagination state (read from URL params) ---
	const [page, setPage] = useState(() => {
		const pageParam = searchParams.get("page");
		return pageParam ? parseInt(pageParam, 10) : 1;
	});
	const [rowsPerPage, setRowsPerPage] = useState(() => {
		const limitParam = searchParams.get("limit");
		return limitParam ? parseInt(limitParam, 10) : 25;
	});

	// --- table state managed by GenericTable ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [imeiFilterValue, setImeiFilterValue] = useState("");

	// Helper function to update URL params
	const updateURLParams = (newPage: number, newLimit: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", newPage.toString());
		params.set("limit", newLimit.toString());
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	// --- handle date filter (managed by GenericTable) ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
		setPage(1); // Reset to first page when filter changes
		updateURLParams(1, rowsPerPage);
	};

	// --- handle page change ---
	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		updateURLParams(newPage, rowsPerPage);
	};

	// --- handle rows per page change ---
	const handleRowsPerPageChange = (newRowsPerPage: number) => {
		setRowsPerPage(newRowsPerPage);
		setPage(1); // Reset to first page when rows per page changes
		updateURLParams(1, newRowsPerPage);
	};

	// Sync state with URL params when they change (browser back/forward)
	React.useEffect(() => {
		const pageParam = searchParams.get("page");
		const limitParam = searchParams.get("limit");

		if (pageParam) {
			const newPage = parseInt(pageParam, 10);
			if (newPage !== page && newPage > 0) {
				setPage(newPage);
			}
		}

		if (limitParam) {
			const newLimit = parseInt(limitParam, 10);
			if (newLimit !== rowsPerPage && newLimit > 0) {
				setRowsPerPage(newLimit);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// Fetch products for dropdown - fetch all products
	const { data: productsResponse } = useSWR(
		"products-all",
		() => getAllProducts({ page: 1, limit: 1000 }), // Fetch all products
		{ revalidateOnFocus: false }
	);

	const products = useMemo(
		() => productsResponse?.data || [],
		[productsResponse]
	);

	// Fetch upload records based on date filter and pagination
	const {
		data: uploadsResponse,
		error,
		mutate,
		isLoading,
	} = useSWR(
		["imei-uploads", startDate, endDate, page, rowsPerPage],
		() => getImeiUploads({ page, limit: rowsPerPage }),
		{ revalidateOnFocus: false, dedupingInterval: 300000 }
	);

	const uploads: UploadRecord[] = useMemo(
		() => uploadsResponse?.data || [],
		[uploadsResponse]
	);

	const totalRecords = uploadsResponse?.total || 0;
	const totalPages = uploadsResponse?.totalPages || 1;

	// Update hasNoRecords when data changes
	React.useEffect(() => {
		setHasNoRecords(uploads.length === 0);
	}, [uploads]);

	// Let GenericTable handle filtering internally
	const filteredUploads = uploads;

	// Get product name by ID
	const getProductName = (productId: string) => {
		const product = products.find((p: any) => p.id === productId);
		return product?.name || productId;
	};

	// Get status color
	const getStatusColor = (
		status: string
	): "default" | "primary" | "success" | "warning" | "danger" => {
		switch (status) {
			case "COMPLETED":
				return "success";
			case "PROCESSING":
				return "primary";
			case "PENDING":
				return "warning";
			case "FAILED":
				return "danger";
			default:
				return "default";
		}
	};

	// Export function for uploads (for GenericTable)
	const exportUploadsFn = async (data: UploadRecord[]) => {
		try {
			// Fetch all records for export (not just current page)
			const allRecordsResponse = await getImeiUploads({
				page: 1,
				limit: totalRecords || 1000, // Get all records
			});

			const allRecords = allRecordsResponse?.data || data;

			const wb = new ExcelJS.Workbook();
			const ws = wb.addWorksheet("Samsung Sentinel Uploads");
			ws.columns = uploadColumns
				.filter((c) => c.uid !== "actions")
				.map((c) => ({
					header: c.name,
					key: c.uid,
					width: 20,
				}));

			allRecords.forEach((r) =>
				ws.addRow({
					file_name: r.file_name,
					product_id: r.product?.name || r.product_id,
					total_records: r.total_records,
					successful_records: r.successful_records,
					failed_records: r.failed_records,
					processing_status: r.processing_status,
					uploaded_at: new Date(r.uploaded_at).toLocaleDateString(),
				})
			);

			const buf = await wb.xlsx.writeBuffer();
			saveAs(new Blob([buf]), "Samsung_Sentinel_Uploads.xlsx");
			showToast({
				message: `Exported ${allRecords.length} records`,
				type: "success",
			});
		} catch (error) {
			showToast({ message: "Failed to export records", type: "error" });
		}
	};

	// Handle delete action (Note: No delete endpoint in API, might need to add)
	const handleDelete = async (id: string) => {
		try {
			// TODO: Add delete endpoint to API when available
			// await deleteImeiUpload(id);
			showToast({ message: "Delete functionality coming soon", type: "info" });
			// mutate();
		} catch (error) {
			showToast({ message: "Failed to delete upload", type: "error" });
		}
	};

	// Download CSV template
	const downloadTemplate = () => {
		const csvContent = [
			["Device IMEI", "Distributor", "Expiry Date"],
			["123456789012345", "Test Distributor", "2025-12-31"],
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		saveAs(blob, "imei_upload_template.csv");
	};

	// Handle file upload
	const handleFileUpload = async () => {
		if (!selectedFile || !selectedProductId) {
			showToast({
				message: "Please select a file and product",
				type: "error",
			});
			return;
		}

		setIsUploading(true);
		try {
			await uploadImeiCsv(selectedFile, selectedProductId);
			showToast({ message: "File uploaded successfully", type: "success" });
			onUploadModalClose();
			setSelectedFile(null);
			setSelectedProductId("");
			mutate();
		} catch (error) {
			showToast({ message: "Failed to upload file", type: "error" });
		} finally {
			setIsUploading(false);
		}
	};

	// Handle IMEI search
	const handleSearchImei = async () => {
		if (!searchImei.trim()) {
			showToast({ message: "Please enter an IMEI number", type: "error" });
			return;
		}

		setIsSearching(true);
		try {
			// Search for IMEI - API returns Imei object directly
			const imeiData = await searchImeiApi(searchImei);

			// Check if IMEI is used
			if (!imeiData.is_used) {
				// Unused IMEI
				setSearchResult({
					type: "unused",
					imei: imeiData.imei,
					status: "Available",
					claimsCount: 0,
					supplier: imeiData.supplier,
					expiryDate: imeiData.expiry_date,
					product: imeiData.product,
				});
			} else {
				// Used IMEI - fetch claims
				const claimsResponse = await getAllClaims({
					imei: searchImei,
					page: 1,
					limit: 100,
				});

				setSearchResult({
					type: "used",
					imei: imeiData.imei,
					claims: claimsResponse.data || [],
					supplier: imeiData.supplier,
					expiryDate: imeiData.expiry_date,
					usedAt: imeiData.used_at,
					product: imeiData.product,
				});
			}
		} catch (error: any) {
			if (error?.response?.status === 404) {
				showToast({ message: "IMEI not found in database", type: "error" });
				setSearchResult({
					type: "not-found",
					imei: searchImei,
				});
			} else {
				showToast({ message: "Failed to search IMEI", type: "error" });
			}
		} finally {
			setIsSearching(false);
		}
	};

	// Reset search when modal closes
	const handleSearchModalClose = () => {
		setSearchResult(null);
		setSearchImei("");
		onSearchModalClose();
	};

	// Render cell content for uploads (following customerView pattern)
	const renderUploadCell = (row: UploadRecord, key: string) => {
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
										`/access/${role}/samsung-sentinel/imei/upload/${row.id}`
									)
								}
							>
								View Details
							</DropdownItem>
							<DropdownItem
								key="delete"
								className="text-danger"
								color="danger"
								onPress={() => handleDelete(row.id)}
							>
								Delete
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "product_id") {
			return (
				<Chip variant="flat" color="primary" size="sm">
					{row.product?.name || getProductName(row.product_id)}
				</Chip>
			);
		}
		if (key === "processing_status") {
			return (
				<Chip
					variant="flat"
					color={getStatusColor(row.processing_status)}
					size="sm"
				>
					{row.processing_status}
				</Chip>
			);
		}
		if (key === "total_records") {
			return (
				<p className="text-sm font-medium">
					{row.total_records.toLocaleString()}
				</p>
			);
		}
		if (key === "successful_records") {
			return (
				<p className="text-sm font-medium text-green-600">
					{row.successful_records.toLocaleString()}
				</p>
			);
		}
		if (key === "failed_records") {
			return (
				<p className="text-sm font-medium text-red-600">
					{row.failed_records.toLocaleString()}
				</p>
			);
		}
		if (key === "file_name") {
			return <p className="text-sm font-mono">{row.file_name}</p>;
		}
		if (key === "uploaded_at") {
			return (
				<p className="text-sm">
					{new Date(row.uploaded_at).toLocaleDateString()}
				</p>
			);
		}
		return <p className="text-sm">{(row as any)[key]}</p>;
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div></div>
				<div className="flex items-center gap-3">
					<Button
						variant="flat"
						startContent={<Search size={16} />}
						onPress={onSearchModalOpen}
					>
						Search IMEI
					</Button>
					<Button
						variant="flat"
						startContent={<Download size={16} />}
						onPress={downloadTemplate}
					>
						Download Template
					</Button>
					<Button
						color="primary"
						startContent={<Upload size={16} />}
						onPress={onUploadModalOpen}
					>
						Upload IMEI File
					</Button>
				</div>
			</div>

			{/* Table using GenericTable with all built-in features */}
			{isLoading ? (
				<TableSkeleton columns={uploadColumns.length} rows={10} />
			) : (
				<GenericTable<UploadRecord>
					columns={uploadColumns}
					data={uploads}
					allCount={totalRecords}
					exportData={uploads}
					isLoading={isLoading}
					filterValue={filterValue}
					onFilterChange={setFilterValue}
					sortDescriptor={{ column: "uploaded_at", direction: "descending" }}
					onSortChange={() => {}}
					page={page}
					pages={totalPages}
					onPageChange={handlePageChange}
					exportFn={exportUploadsFn}
					renderCell={renderUploadCell}
					hasNoRecords={hasNoRecords}
					onDateFilterChange={handleDateFilter}
					initialStartDate={startDate}
					initialEndDate={endDate}
					searchPlaceholder="Search by file name, product, or status..."
					showRowsPerPageSelector={true}
					rowsPerPageOptions={[10, 25, 50, 100]}
					defaultRowsPerPage={25}
					onRowsPerPageChange={handleRowsPerPageChange}
				/>
			)}

			{/* Upload Modal */}
			<Modal isOpen={isUploadModalOpen} onClose={onUploadModalClose} size="2xl">
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Upload IMEI File</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground mb-2">
											Select product for this upload:
										</p>
										<Select
											placeholder="Choose product"
											selectedKeys={
												selectedProductId ? [selectedProductId] : []
											}
											onSelectionChange={(keys) => {
												const selected = Array.from(keys)[0] as string;
												setSelectedProductId(selected || "");
											}}
										>
											{products.map((product: any) => (
												<SelectItem key={product.id} value={product.id}>
													{product.name}
												</SelectItem>
											))}
										</Select>
									</div>

									<div>
										<p className="text-sm text-muted-foreground mb-2">
											Upload CSV file with IMEI data:
										</p>
										<Input
											type="file"
											accept=".csv,.xlsx"
											onChange={(e) => {
												const file = e.target.files?.[0];
												setSelectedFile(file || null);
											}}
										/>
										<p className="text-xs text-muted-foreground mt-1">
											Required columns: IMEI, Supplier, Expiry Date (Optional)
										</p>
									</div>

									{selectedFile && (
										<div className="p-3 bg-gray-50 rounded-lg">
											<p className="text-sm">
												<span className="font-medium">Selected file:</span>{" "}
												{selectedFile.name}
											</p>
											<p className="text-sm text-muted-foreground">
												Size: {(selectedFile.size / 1024).toFixed(2)} KB
											</p>
										</div>
									)}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color="danger"
									variant="light"
									onPress={onUploadModalClose}
								>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleFileUpload}
									isLoading={isUploading}
									isDisabled={!selectedFile || !selectedProductId}
								>
									{isUploading ? "Uploading..." : "Upload File"}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			{/* Search IMEI Modal */}
			<Modal
				isOpen={isSearchModalOpen}
				onClose={handleSearchModalClose}
				size="3xl"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Search IMEI</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<div className="flex gap-2">
										<Input
											label="IMEI Number"
											placeholder="Enter IMEI to search"
											value={searchImei}
											onValueChange={setSearchImei}
											className="flex-1"
											maxLength={15}
										/>
										<Button
											color="primary"
											onPress={handleSearchImei}
											isLoading={isSearching}
											isDisabled={!searchImei.trim()}
										>
											Search
										</Button>
									</div>

									{/* Search Results */}
									{searchResult && (
										<div className="mt-6">
											{searchResult.type === "not-found" ? (
												/* IMEI Not Found */
												<div className="bg-red-50 border border-red-200 rounded-lg p-4">
													<h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
														<AlertTriangle size={18} />
														IMEI Not Found
													</h3>
													<p className="text-sm text-red-800">
														The IMEI{" "}
														<span className="font-mono font-bold">
															{searchResult.imei}
														</span>{" "}
														was not found in the database.
													</p>
												</div>
											) : searchResult.type === "unused" ? (
												/* Unused IMEI Result */
												<div className="space-y-4">
													<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
														<h3 className="font-semibold text-blue-900 mb-2">
															IMEI: {searchResult.imei}
														</h3>
														<div className="grid grid-cols-2 gap-4 text-sm">
															<div>
																<span className="text-gray-600">Status:</span>{" "}
																<Chip color="success" size="sm">
																	{searchResult.status}
																</Chip>
															</div>
															<div>
																<span className="text-gray-600">Claims:</span>{" "}
																<span className="font-medium">
																	{searchResult.claimsCount}
																</span>
															</div>
															{searchResult.product && (
																<div>
																	<span className="text-gray-600">
																		Product:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.product.name}
																	</span>
																</div>
															)}
															{searchResult.supplier && (
																<div>
																	<span className="text-gray-600">
																		Supplier:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.supplier}
																	</span>
																</div>
															)}
															{searchResult.expiryDate && (
																<div>
																	<span className="text-gray-600">
																		Expiry Date:
																	</span>{" "}
																	<span className="font-medium">
																		{new Date(
																			searchResult.expiryDate
																		).toLocaleDateString()}
																	</span>
																</div>
															)}
														</div>
													</div>
												</div>
											) : (
												/* Used IMEI Result - Show Claims Table */
												<div className="space-y-4">
													<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
														<h3 className="font-semibold text-amber-900 mb-2">
															IMEI: {searchResult.imei} (In Use)
														</h3>
														<div className="grid grid-cols-2 gap-4 text-sm mb-2">
															{searchResult.product && (
																<div>
																	<span className="text-gray-600">
																		Product:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.product.name}
																	</span>
																</div>
															)}
															{searchResult.supplier && (
																<div>
																	<span className="text-gray-600">
																		Supplier:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.supplier}
																	</span>
																</div>
															)}
															{searchResult.usedAt && (
																<div>
																	<span className="text-gray-600">
																		Used On:
																	</span>{" "}
																	<span className="font-medium">
																		{new Date(
																			searchResult.usedAt
																		).toLocaleDateString()}
																	</span>
																</div>
															)}
														</div>
														<p className="text-sm text-amber-800">
															This IMEI has {searchResult.claims.length}{" "}
															associated claim(s):
														</p>
													</div>

													{/* Claims Table */}
													<div className="overflow-x-auto">
														<table className="w-full border border-gray-200 rounded-lg">
															<thead className="bg-gray-50">
																<tr>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Customer Name
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Issue Description
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Status
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Date Created
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Actions
																	</th>
																</tr>
															</thead>
															<tbody className="bg-white divide-y divide-gray-200">
																{searchResult.claims.map((claim: any) => (
																	<tr
																		key={claim.id}
																		className="hover:bg-gray-50"
																	>
																		<td className="px-4 py-3 text-sm font-medium text-gray-900">
																			{claim.customer_name}
																		</td>
																		<td className="px-4 py-3 text-sm text-gray-600">
																			{claim.issue_description}
																		</td>
																		<td className="px-4 py-3 text-sm">
																			<Chip
																				color={
																					claim.status === "approved"
																						? "success"
																						: claim.status === "pending"
																						? "warning"
																						: claim.status === "completed"
																						? "primary"
																						: "danger"
																				}
																				size="sm"
																				className="capitalize"
																			>
																				{claim.status}
																			</Chip>
																		</td>
																		<td className="px-4 py-3 text-sm text-gray-600">
																			{new Date(
																				claim.createdAt
																			).toLocaleDateString()}
																		</td>
																		<td className="px-4 py-3 text-sm">
																			<Button
																				size="sm"
																				color="primary"
																				variant="flat"
																				startContent={<Eye size={14} />}
																				onPress={() => {
																					router.push(
																						`/access/${role}/samsung-sentinel/claims/${claim.id}`
																					);
																					handleSearchModalClose();
																				}}
																			>
																				View Details
																			</Button>
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={handleSearchModalClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
