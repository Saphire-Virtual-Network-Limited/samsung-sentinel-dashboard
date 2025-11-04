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
	getSamsungSentinelUploads,
	uploadIMEIFile,
	deleteSamsungSentinelUpload,
	showToast,
	capitalize,
} from "@/lib";
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
import { useRouter, usePathname } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const DEVICE_MODELS = [
	{ label: "Samsung A05", value: "SAMSUNG_A05" },
	{ label: "Samsung A06", value: "SAMSUNG_A06" },
	{ label: "Samsung A07", value: "SAMSUNG_A07" },
];

// Upload columns
const uploadColumns: ColumnDef[] = [
	{ name: "File Name", uid: "fileName", sortable: true },
	{ name: "Device Model", uid: "deviceModel", sortable: true },
	{ name: "Total Records", uid: "totalRecords", sortable: true },
	{ name: "Uploaded By", uid: "uploadedBy", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Unverified IMEI columns
const unverifiedIMEIColumns: ColumnDef[] = [
	{ name: "IMEI", uid: "imei", sortable: true },
	{ name: "Distributor", uid: "distributor", sortable: true },
	{ name: "Service Center", uid: "serviceCenter", sortable: true },
	{ name: "Date", uid: "date", sortable: true },
];

const statusOptions = [
	{ name: "Processing", uid: "processing" },
	{ name: "Completed", uid: "completed" },
	{ name: "Failed", uid: "failed" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
	processing: "warning",
	completed: "success",
	failed: "danger",
};

interface UploadRecord {
	id: string;
	deviceModel: string;
	uploadedBy: string;
	totalRecords: number;
	fileName: string;
	createdAt: string;
	updatedAt: string;
	processedAt?: string;
	status: "processing" | "completed" | "failed";
}

interface UnverifiedIMEIRecord {
	id: string;
	imei: string;
	distributor: string;
	serviceCenter: string;
	date: string;
}

export default function SamsungSentinelIMEIView() {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/admin/samsung-sentinel -> admin)
	const role = pathname.split("/")[2];

	// Tab state
	const [activeTab, setActiveTab] = useState("uploads");

	// Upload modal state
	const {
		isOpen: isUploadModalOpen,
		onOpen: onUploadModalOpen,
		onClose: onUploadModalClose,
	} = useDisclosure();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedDeviceModel, setSelectedDeviceModel] = useState<string>("");
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

	// --- table state managed by GenericTable ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [imeiFilterValue, setImeiFilterValue] = useState("");

	// --- handle date filter (managed by GenericTable) ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	// Fetch upload records based on date filter
	const {
		data: uploadsData = [],
		error,
		mutate,
		isLoading,
	} = useSWR(
		startDate && endDate
			? ["samsung-sentinel-uploads", startDate, endDate]
			: ["samsung-sentinel-uploads"],
		() => getSamsungSentinelUploads({ startDate, endDate }),
		{ revalidateOnFocus: false, dedupingInterval: 300000 }
	);

	// Mock data for demo - replace with actual API data
	const uploads: UploadRecord[] = useMemo(
		() => [
			{
				id: "upload_001",
				deviceModel: "SAMSUNG_A05",
				uploadedBy:
					role === "admin" ? "admin@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 1500,
				fileName: "samsung_a05_batch_001.csv",
				createdAt: "2024-10-01T10:30:00Z",
				updatedAt: "2024-10-01T10:35:00Z",
				processedAt: "2024-10-01T10:35:00Z",
				status: "completed",
			},
			{
				id: "upload_002",
				deviceModel: "SAMSUNG_A06",
				uploadedBy:
					role === "admin" ? "manager@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 2300,
				fileName: "samsung_a06_batch_002.csv",
				createdAt: "2024-10-02T14:20:00Z",
				updatedAt: "2024-10-02T14:25:00Z",
				processedAt: "2024-10-02T14:25:00Z",
				status: "completed",
			},
			{
				id: "upload_003",
				deviceModel: "SAMSUNG_A07",
				uploadedBy:
					role === "admin" ? "admin@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 1800,
				fileName: "samsung_a07_batch_003.csv",
				createdAt: "2024-10-03T09:15:00Z",
				updatedAt: "2024-10-03T09:18:00Z",
				status: "processing",
			},
			{
				id: "upload_004",
				deviceModel: "SAMSUNG_A05",
				uploadedBy:
					role === "admin" ? "operator@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 800,
				fileName: "samsung_a05_batch_004.csv",
				createdAt: "2024-09-22T16:45:00Z",
				updatedAt: "2024-09-22T16:50:00Z",
				status: "failed",
			},
		],
		[role]
	);

	// Mock unverified IMEI data
	const unverifiedIMEIData: UnverifiedIMEIRecord[] = useMemo(
		() => [
			{
				id: "imei_001",
				imei: "123456789012345",
				distributor: "Sapphire Distributors Ltd",
				serviceCenter: "TechFix Lagos",
				date: "2024-10-01",
			},
			{
				id: "imei_002",
				imei: "234567890123456",
				distributor: "Global Tech Solutions",
				serviceCenter: "Samsung Care Abuja",
				date: "2024-10-02",
			},
			{
				id: "imei_003",
				imei: "345678901234567",
				distributor: "Metro Electronics",
				serviceCenter: "Mobile Masters Port Harcourt",
				date: "2024-10-03",
			},
			{
				id: "imei_004",
				imei: "456789012345678",
				distributor: "Digital Plus Nigeria",
				serviceCenter: "Galaxy Repairs Kano",
				date: "2024-10-04",
			},
			{
				id: "imei_005",
				imei: "567890123456789",
				distributor: "Sapphire Distributors Ltd",
				serviceCenter: "TechFix Lagos",
				date: "2024-10-05",
			},
			{
				id: "imei_006",
				imei: "678901234567890",
				distributor: "Prime Electronics",
				serviceCenter: "Smart Repair Ibadan",
				date: "2024-10-06",
			},
			{
				id: "imei_007",
				imei: "789012345678901",
				distributor: "NextGen Mobile",
				serviceCenter: "Fix It Pro Kaduna",
				date: "2024-10-07",
			},
		],
		[]
	);

	// Update hasNoRecords when data changes
	React.useEffect(() => {
		setHasNoRecords(uploads.length === 0);
	}, [uploads]);

	// Let GenericTable handle filtering internally
	const filteredUploads = uploads;

	// Let GenericTable handle filtering internally
	const filteredUnverifiedIMEI = unverifiedIMEIData;

	// Pagination handled by GenericTable

	// Export function for uploads (for GenericTable)
	const exportUploadsFn = async (data: UploadRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Samsung Sentinel Uploads");
		ws.columns = uploadColumns
			.filter((c) => c.uid !== "actions")
			.map((c) => ({
				header: c.name,
				key: c.uid,
				width: 20,
			}));
		data.forEach((r) =>
			ws.addRow({
				...r,
				deviceModel:
					DEVICE_MODELS.find((m) => m.value === r.deviceModel)?.label ||
					r.deviceModel,
				status: capitalize(r.status),
				createdAt: new Date(r.createdAt).toLocaleDateString(),
			})
		);
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Samsung_Sentinel_Uploads.xlsx");
	};

	// Export function for unverified IMEI
	const exportUnverifiedIMEIFn = async (data: UnverifiedIMEIRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Unverified IMEI");
		ws.columns = unverifiedIMEIColumns.map((c) => ({
			header: c.name,
			key: c.uid,
			width: 20,
		}));
		data.forEach((r) =>
			ws.addRow({
				...r,
				date: new Date(r.date).toLocaleDateString(),
			})
		);
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), "Unverified_IMEI.xlsx");
	};

	// Handle delete action
	const handleDelete = async (id: string) => {
		try {
			await deleteSamsungSentinelUpload(id);
			showToast({ message: "Upload deleted successfully", type: "success" });
			mutate();
		} catch (error) {
			showToast({ message: "Failed to delete upload", type: "error" });
		}
	};

	// Download Excel template
	const downloadTemplate = () => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("IMEI Template");

		ws.columns = [
			{ header: "IMEI", key: "imei", width: 20 },
			{ header: "Distributor (Optional)", key: "distributor", width: 25 },
			{ header: "Expiry Date (Optional)", key: "expiryDate", width: 15 },
		];

		// Add sample data
		ws.addRow({
			imei: "123456789012345",
			distributor: "Sapphire Distributors Ltd",
			expiryDate: "2025-12-31",
		});

		wb.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			saveAs(blob, "imei_upload_template.xlsx");
		});
	};

	// Handle file upload
	const handleFileUpload = async () => {
		if (!selectedFile || !selectedDeviceModel) {
			showToast({
				message: "Please select a file and device model",
				type: "error",
			});
			return;
		}

		setIsUploading(true);
		try {
			// Pass the correct object structure expected by uploadIMEIFile
			await uploadIMEIFile({
				csvFile: selectedFile,
				deviceModel: selectedDeviceModel,
			});
			showToast({ message: "File uploaded successfully", type: "success" });
			onUploadModalClose();
			setSelectedFile(null);
			setSelectedDeviceModel("");
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
			// Mock API call - replace with actual API
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Mock search results based on IMEI
			const isUsedImei =
				searchImei.includes("111") || searchImei.includes("222");

			if (!isUsedImei) {
				// Unused IMEI - show unverified status
				setSearchResult({
					type: "unused",
					imei: searchImei,
					status: "unverified",
					claimsCount: 0,
				});
			} else {
				// Used IMEI - show claims table
				setSearchResult({
					type: "used",
					imei: searchImei,
					claims: [
						{
							id: "claim_001",
							customerName: "John Doe",
							claimStatus: "approved",
							dateCreated: "2024-10-15T10:30:00Z",
							issueDescription: "Screen replacement",
						},
						{
							id: "claim_002",
							customerName: "Jane Smith",
							claimStatus: "pending",
							dateCreated: "2024-10-20T14:22:00Z",
							issueDescription: "Battery issue",
						},
					],
				});
			}
		} catch (error) {
			showToast({ message: "Failed to search IMEI", type: "error" });
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
		if (key === "status") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.status]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.status)}
				</Chip>
			);
		}
		if (key === "deviceModel") {
			const modelLabel =
				DEVICE_MODELS.find((m) => m.value === row.deviceModel)?.label ||
				row.deviceModel;
			return (
				<Chip variant="flat" color="primary" size="sm">
					{modelLabel}
				</Chip>
			);
		}
		if (key === "totalRecords") {
			return (
				<p className="text-sm font-medium">
					{row.totalRecords.toLocaleString()}
				</p>
			);
		}
		if (key === "fileName") {
			return <p className="text-sm font-mono">{row.fileName}</p>;
		}
		if (key === "createdAt") {
			return (
				<p className="text-sm">
					{new Date(row.createdAt).toLocaleDateString()}
				</p>
			);
		}
		return <p className="text-sm">{(row as any)[key]}</p>;
	};

	// Render cell content for unverified IMEI
	const renderUnverifiedIMEICell = (row: UnverifiedIMEIRecord, key: string) => {
		if (key === "imei") {
			return <p className="text-sm font-mono">{row.imei}</p>;
		}
		if (key === "distributor") {
			return (
				<Chip variant="flat" color="secondary" size="sm">
					{row.distributor}
				</Chip>
			);
		}
		if (key === "serviceCenter") {
			return (
				<Chip variant="flat" color="primary" size="sm">
					{row.serviceCenter}
				</Chip>
			);
		}
		if (key === "date") {
			return (
				<p className="text-sm">{new Date(row.date).toLocaleDateString()}</p>
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

			{/* Tabs Container */}
			<Tabs
				selectedKey={activeTab}
				onSelectionChange={(key) => setActiveTab(key as string)}
			>
				<Tab key="uploads" title="Uploads">
					{/* Table using GenericTable with all built-in features */}
					{isLoading ? (
						<TableSkeleton columns={uploadColumns.length} rows={10} />
					) : (
						<GenericTable<UploadRecord>
							columns={uploadColumns}
							data={uploads}
							allCount={uploads.length}
							exportData={uploads}
							isLoading={isLoading}
							filterValue={filterValue}
							onFilterChange={setFilterValue}
							statusOptions={statusOptions}
							statusFilter={statusFilter}
							onStatusChange={setStatusFilter}
							statusColorMap={statusColorMap}
							showStatus={true}
							sortDescriptor={{ column: "createdAt", direction: "descending" }}
							onSortChange={() => {}}
							page={1}
							pages={1}
							onPageChange={() => {}}
							exportFn={exportUploadsFn}
							renderCell={renderUploadCell}
							hasNoRecords={hasNoRecords}
							onDateFilterChange={handleDateFilter}
							initialStartDate={startDate}
							initialEndDate={endDate}
							searchPlaceholder="Search by file name, uploaded by, or device model..."
							showRowsPerPageSelector={true}
						/>
					)}
				</Tab>

				<Tab key="unverified" title="Unverified IMEI">
					{/* Unverified IMEI Table */}
					<GenericTable<UnverifiedIMEIRecord>
						columns={unverifiedIMEIColumns}
						data={unverifiedIMEIData}
						allCount={unverifiedIMEIData.length}
						exportData={unverifiedIMEIData}
						isLoading={false}
						filterValue={imeiFilterValue}
						onFilterChange={setImeiFilterValue}
						showStatus={false}
						sortDescriptor={{ column: "date", direction: "descending" }}
						onSortChange={() => {}}
						page={1}
						pages={1}
						onPageChange={() => {}}
						exportFn={exportUnverifiedIMEIFn}
						renderCell={renderUnverifiedIMEICell}
						hasNoRecords={unverifiedIMEIData.length === 0}
						searchPlaceholder="Search by IMEI, distributor, or service center..."
						showRowsPerPageSelector={true}
					/>
				</Tab>
			</Tabs>

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
											Select device model for this upload:
										</p>
										<Select
											placeholder="Choose device model"
											selectedKeys={
												selectedDeviceModel ? [selectedDeviceModel] : []
											}
											onSelectionChange={(keys) => {
												const selected = Array.from(keys)[0] as string;
												setSelectedDeviceModel(selected || "");
											}}
										>
											{DEVICE_MODELS.map((model) => (
												<SelectItem key={model.value} value={model.value}>
													{model.label}
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
											accept=".csv"
											onChange={(e) => {
												const file = e.target.files?.[0];
												setSelectedFile(file || null);
											}}
										/>
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
									isDisabled={!selectedFile || !selectedDeviceModel}
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
											{searchResult.type === "unused" ? (
												/* Unused IMEI Result */
												<div className="space-y-4">
													<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
														<h3 className="font-semibold text-blue-900 mb-2">
															IMEI: {searchResult.imei}
														</h3>
														<div className="grid grid-cols-2 gap-4 text-sm">
															<div>
																<span className="text-gray-600">Status:</span>{" "}
																<Chip color="default" size="sm">
																	{searchResult.status}
																</Chip>
															</div>
															<div>
																<span className="text-gray-600">Claims:</span>{" "}
																<span className="font-medium">
																	{searchResult.claimsCount}
																</span>
															</div>
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
																			{claim.customerName}
																		</td>
																		<td className="px-4 py-3 text-sm text-gray-600">
																			{claim.issueDescription}
																		</td>
																		<td className="px-4 py-3 text-sm">
																			<Chip
																				color={
																					claim.claimStatus === "approved"
																						? "success"
																						: claim.claimStatus === "pending"
																						? "warning"
																						: "danger"
																				}
																				size="sm"
																				className="capitalize"
																			>
																				{claim.claimStatus}
																			</Chip>
																		</td>
																		<td className="px-4 py-3 text-sm text-gray-600">
																			{new Date(
																				claim.dateCreated
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
