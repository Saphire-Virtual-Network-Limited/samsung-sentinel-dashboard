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
import { Upload, Download, Eye, Trash2, EllipsisVertical } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const DEVICE_MODELS = [
	{ label: "Samsung A05", value: "SAMSUNG_A05" },
	{ label: "Samsung A06", value: "SAMSUNG_A06" },
	{ label: "Samsung A07", value: "SAMSUNG_A07" },
];

const columns: ColumnDef[] = [
	{ name: "File Name", uid: "fileName", sortable: true },
	{ name: "Device Model", uid: "deviceModel", sortable: true },
	{ name: "Total Records", uid: "totalRecords", sortable: true },
	{ name: "Uploaded By", uid: "uploadedBy", sortable: true },
	{ name: "Status", uid: "status", sortable: true },
	{ name: "Created At", uid: "createdAt", sortable: true },
	{ name: "Actions", uid: "actions" },
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

export default function SamsungSentinelIMEIView() {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/admin/samsung-sentinel -> admin)
	const role = pathname.split("/")[2];

	// Upload modal state
	const {
		isOpen: isUploadModalOpen,
		onOpen: onUploadModalOpen,
		onClose: onUploadModalClose,
	} = useDisclosure();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedDeviceModel, setSelectedDeviceModel] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "createdAt",
		direction: "descending",
	});
	const [page, setPage] = useState(1);

	// Handler to properly manage sort descriptor changes
	const handleSortChange = (sd: SortDescriptor) => {
		setSortDescriptor(sd);
	};

	// --- handle date filter ---
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

	// Update hasNoRecords when data changes
	React.useEffect(() => {
		setHasNoRecords(uploads.length === 0);
	}, [uploads]);

	// Apply filters and search (let GenericTable handle this)
	const filtered = useMemo(() => {
		let list = [...uploads];
		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter(
				(upload) =>
					upload.fileName.toLowerCase().includes(f) ||
					upload.uploadedBy.toLowerCase().includes(f) ||
					upload.deviceModel.toLowerCase().includes(f)
			);
		}
		if (statusFilter.size > 0) {
			list = list.filter((upload) => statusFilter.has(upload.status));
		}
		return list;
	}, [uploads, filterValue, statusFilter]);

	// Pagination and sorting handled by GenericTable
	const pages = Math.ceil(filtered.length / 10) || 1;

	// Export function (for GenericTable)
	const exportFn = async (data: UploadRecord[]) => {
		const wb = new ExcelJS.Workbook();
		const ws = wb.addWorksheet("Samsung Sentinel Uploads");
		ws.columns = columns
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

	// Render cell content (following customerView pattern)
	const renderCell = (row: UploadRecord, key: string) => {
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
										`/access/${role}/samsung-sentinel/upload/${row.id}`
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div></div>
				<div className="flex items-center gap-3">
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
				<TableSkeleton columns={columns.length} rows={10} />
			) : (
				<GenericTable<UploadRecord>
					columns={columns}
					data={filtered}
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
					onSortChange={handleSortChange}
					page={page}
					pages={pages}
					onPageChange={setPage}
					exportFn={exportFn}
					renderCell={renderCell}
					hasNoRecords={hasNoRecords}
					onDateFilterChange={handleDateFilter}
					initialStartDate={startDate}
					initialEndDate={endDate}
					searchPlaceholder="Search by file name, uploaded by, or device model..."
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
		</div>
	);
}
