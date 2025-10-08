"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import {
	Card,
	CardBody,
	CardHeader,
	Chip,
	Input,
	Select,
	SelectItem,
	Button,
	Divider,
	SortDescriptor,
} from "@heroui/react";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import {
	TableSkeleton,
	InfoCard,
	InfoField,
} from "@/components/reususables/custom-ui";
import { getSamsungSentinelUploadDetails } from "@/lib";
import { ArrowLeft, Download, Search, Upload } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const DEVICE_MODELS = [
	{ label: "Samsung A05", value: "SAMSUNG_A05" },
	{ label: "Samsung A06", value: "SAMSUNG_A06" },
	{ label: "Samsung A07", value: "SAMSUNG_A07" },
];

interface IMEIRecord {
	recordId: string;
	deviceImei: string;
	distributor?: string;
	expiryDate?: string;
	status: "active" | "used";
}

interface UploadDetails {
	id: string;
	deviceModel: string;
	uploadedBy: string;
	totalRecords: number;
	fileName: string;
	createdAt: string;
	updatedAt: string;
	processedAt?: string;
	status: "processing" | "completed" | "failed";
	imeiRecords: IMEIRecord[];
}

interface Props {
	uploadId: string;
}

export default function SamsungSentinelUploadDetailsView({ uploadId }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/admin/samsung-sentinel -> admin)
	const role = pathname.split("/")[2];
	// --- table state (let GenericTable handle filtering) ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "recordId",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);

	// Handler to properly manage sort descriptor changes
	const handleSortChange = (sd: SortDescriptor) => {
		setSortDescriptor(sd);
	};

	// Fetch upload details - disabled for demo, using mock data
	// const { data: uploadData, error, isLoading } = useSWR(
	// 	uploadId ? `samsung-sentinel-upload-${uploadId}` : null,
	// 	() => getSamsungSentinelUploadDetails(uploadId)
	// );

	// Use mock data for demo
	const uploadData = null;
	const error = null;
	const isLoading = false;

	// Mock data for demo - replace with actual API data
	const uploadDetails: UploadDetails = useMemo(() => {
		// Mock data matching the IDs from the main view
		const mockUploads = {
			upload_001: {
				id: "upload_001",
				deviceModel: "SAMSUNG_A05",
				uploadedBy:
					role === "admin" ? "admin@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 1500,
				fileName: "samsung_a05_batch_001.csv",
				createdAt: "2024-10-01T10:30:00Z",
				updatedAt: "2024-10-01T10:35:00Z",
				processedAt: "2024-10-01T10:35:00Z",
				status: "completed" as const,
			},
			upload_002: {
				id: "upload_002",
				deviceModel: "SAMSUNG_A06",
				uploadedBy:
					role === "admin" ? "manager@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 2300,
				fileName: "samsung_a06_batch_002.csv",
				createdAt: "2024-10-02T14:20:00Z",
				updatedAt: "2024-10-02T14:25:00Z",
				processedAt: "2024-10-02T14:25:00Z",
				status: "completed" as const,
			},
			upload_003: {
				id: "upload_003",
				deviceModel: "SAMSUNG_A07",
				uploadedBy:
					role === "admin" ? "admin@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 1800,
				fileName: "samsung_a07_batch_003.csv",
				createdAt: "2024-10-03T09:15:00Z",
				updatedAt: "2024-10-03T09:18:00Z",
				status: "processing" as const,
			},
			upload_004: {
				id: "upload_004",
				deviceModel: "SAMSUNG_A05",
				uploadedBy:
					role === "admin" ? "operator@sapphire.com" : "subadmin@sapphire.com",
				totalRecords: 800,
				fileName: "samsung_a05_batch_004.csv",
				createdAt: "2024-09-22T16:45:00Z",
				updatedAt: "2024-09-22T16:50:00Z",
				status: "failed" as const,
			},
		};

		const baseData =
			mockUploads[uploadId as keyof typeof mockUploads] ||
			mockUploads.upload_001;

		return {
			...baseData,
			imeiRecords: [
				{
					recordId: `${uploadId}_rec_001`,
					deviceImei: "123456789012345",
					distributor: "Sapphire Distributors Ltd",
					expiryDate: "2025-12-31",
					status: "active",
				},
				{
					recordId: `${uploadId}_rec_002`,
					deviceImei: "234567890123456",
					distributor: "Global Tech Distribution",
					expiryDate: "2025-11-30",
					status: "used",
				},
				{
					recordId: `${uploadId}_rec_003`,
					deviceImei: "345678901234567",
					distributor: "Samsung Official Store",
					expiryDate: "2025-10-15",
					status: "active",
				},
				{
					recordId: `${uploadId}_rec_004`,
					deviceImei: "456789012345678",
					distributor: "Tech World Nigeria",
					expiryDate: "2025-09-30",
					status: "used",
				},
				{
					recordId: `${uploadId}_rec_005`,
					deviceImei: "567890123456789",
					distributor: "Mobile Hub Limited",
					expiryDate: "2025-08-20",
					status: "active",
				},
				{
					recordId: `${uploadId}_rec_006`,
					deviceImei: "678901234567890",
					distributor: "Mobile Network Ltd",
					expiryDate: "2025-07-15",
					status: "active",
				},
			],
		};
	}, [uploadId, role]);

	// Filter IMEI records (following staffView pattern)
	const filteredRecords = useMemo(() => {
		let filtered = uploadDetails.imeiRecords;

		if (filterValue) {
			const search = filterValue.toLowerCase();
			filtered = filtered.filter(
				(record) =>
					record.deviceImei.includes(search) ||
					record.distributor?.toLowerCase().includes(search) ||
					record.recordId.toLowerCase().includes(search)
			);
		}

		if (statusFilter.size > 0) {
			filtered = filtered.filter((record) => statusFilter.has(record.status));
		}

		return filtered;
	}, [uploadDetails.imeiRecords, filterValue, statusFilter]);

	// GenericTable columns (following staffView pattern)
	const columns = [
		{ name: "Record ID", uid: "recordId", sortable: true },
		{ name: "Device IMEI", uid: "deviceImei", sortable: true },
		{ name: "Distributor", uid: "distributor", sortable: true },
		{ name: "Expiry Date", uid: "expiryDate", sortable: true },
		{ name: "Status", uid: "status", sortable: true },
	];

	// Pagination
	const pages = Math.ceil(filteredRecords.length / 10) || 1;

	// Render cell content (following staffView pattern)
	const renderCell = (record: IMEIRecord, key: string) => {
		if (key === "recordId") {
			return <span className="font-mono text-sm">{record.recordId}</span>;
		}
		if (key === "deviceImei") {
			return (
				<span className="font-mono text-sm font-semibold">
					{record.deviceImei}
				</span>
			);
		}
		if (key === "distributor") {
			return record.distributor || "-";
		}
		if (key === "expiryDate") {
			return record.expiryDate
				? new Date(record.expiryDate).toLocaleDateString()
				: "-";
		}
		if (key === "status") {
			return (
				<Chip variant="flat" color={statusColorMap[record.status]} size="sm">
					{record.status.toUpperCase()}
				</Chip>
			);
		}
		return (record as any)[key] || "-";
	};

	const exportToExcel = () => {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("IMEI Records");

		// Add headers
		const headers = [
			"Record ID",
			"Device IMEI",
			"Distributor",
			"Expiry Date",
			"Status",
		];
		worksheet.addRow(headers);

		// Style headers
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE6F3FF" },
		};

		// Add data
		filteredRecords.forEach((record) => {
			worksheet.addRow([
				record.recordId,
				record.deviceImei,
				record.distributor || "",
				record.expiryDate || "",
				record.status.toUpperCase(),
			]);
		});

		// Format IMEI column as number with no decimals
		worksheet.getColumn(2).numFmt = "0";

		// Auto-fit columns
		worksheet.columns.forEach((column) => {
			column.width = 20;
		});

		// Generate buffer and download
		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			saveAs(blob, `imei_records_${uploadDetails.id}.xlsx`);
		});
	};

	const deviceModelLabel =
		DEVICE_MODELS.find((m) => m.value === uploadDetails.deviceModel)?.label ||
		uploadDetails.deviceModel;

	const uploadStatusColorMap = {
		processing: "warning",
		completed: "success",
		failed: "danger",
	} as const;

	// Status options for GenericTable (following staffView pattern)
	const statusOptions = [
		{ name: "Active", uid: "active" },
		{ name: "Used", uid: "used" },
	];

	const statusColorMap = {
		active: "success" as const,
		used: "warning" as const,
	};

	// For demo, always show mock data
	if (isLoading) {
		return <TableSkeleton columns={columns.length} />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button isIconOnly variant="light" onPress={() => router.back()}>
					<ArrowLeft size={20} />
				</Button>
				<div>
					<p className="text-muted-foreground">{uploadDetails.fileName}</p>
				</div>
			</div>

			{/* Upload Information */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Basic Information */}
				<InfoCard
					title="Upload Information"
					icon={<Upload className="w-5 h-5 text-primary-600" />}
					collapsible={false}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InfoField
							label="File Name"
							value={uploadDetails.fileName}
							copyable
						/>
						<InfoField label="Device Model" value={deviceModelLabel} />
						<InfoField
							label="Total Records"
							value={uploadDetails.totalRecords.toLocaleString()}
						/>
						<InfoField
							label="Uploaded By"
							value={uploadDetails.uploadedBy}
							copyable
						/>
						<InfoField
							label="Status"
							value={uploadDetails.status.toUpperCase()}
							endComponent={
								<Chip
									variant="flat"
									color={uploadStatusColorMap[uploadDetails.status]}
									size="sm"
								>
									{uploadDetails.status.toUpperCase()}
								</Chip>
							}
						/>
					</div>
				</InfoCard>

				{/* Timeline Information */}
				<InfoCard
					title="Timeline"
					icon={<Download className="w-5 h-5 text-success-600" />}
					collapsible={false}
				>
					<div className="grid grid-cols-1 gap-4">
						<InfoField
							label="Created At"
							value={new Date(uploadDetails.createdAt).toLocaleString("en-GB")}
						/>
						<InfoField
							label="Updated At"
							value={new Date(uploadDetails.updatedAt).toLocaleString("en-GB")}
						/>
						<InfoField
							label="Processed At"
							value={
								uploadDetails.processedAt
									? new Date(uploadDetails.processedAt).toLocaleString("en-GB")
									: "Not processed yet"
							}
						/>
					</div>
				</InfoCard>
			</div>

			<Divider />

			{/* IMEI Records Section */}
			<div className="space-y-4">
				{/* IMEI Records Table - using GenericTable's built-in features */}
				<GenericTable<IMEIRecord>
					columns={columns}
					data={filteredRecords}
					allCount={filteredRecords.length}
					exportData={filteredRecords}
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
					exportFn={exportToExcel}
					renderCell={renderCell}
					hasNoRecords={filteredRecords.length === 0}
					searchPlaceholder="Search by IMEI, distributor, or record ID..."
				/>
			</div>
		</div>
	);
}
