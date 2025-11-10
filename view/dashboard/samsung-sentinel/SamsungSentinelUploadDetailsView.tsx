"use client";

import {
	InfoCard,
	InfoField,
	TableSkeleton,
} from "@/components/reususables/custom-ui";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import {
	getImeiUploadById,
	Imei,
	ImeiUploadWithDetails,
} from "@/lib/api/imeis";
import { Button, Card, Chip, SortDescriptor } from "@heroui/react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ArrowLeft, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";

const uploadStatusColorMap: Record<
	string,
	"success" | "warning" | "danger" | "default"
> = {
	PENDING: "default",
	PROCESSING: "warning",
	COMPLETED: "success",
	FAILED: "danger",
};

export default function SamsungSentinelUploadDetailsView() {
	const params = useParams();
	const uploadId = params?.id as string;
	const router = useRouter();

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "imei",
		direction: "ascending",
	});
	const [page, setPage] = useState(1);

	// Handler to properly manage sort descriptor changes
	const handleSortChange = (sd: SortDescriptor) => {
		setSortDescriptor(sd);
	};

	// Fetch upload details with SWR
	const {
		data: uploadDetails,
		error,
		isLoading,
	} = useSWR<ImeiUploadWithDetails>(
		uploadId ? `/imeis/uploads/${uploadId}` : null,
		() => getImeiUploadById(uploadId),
		{ revalidateOnFocus: false }
	);

	// Filter IMEI records
	const filteredRecords = useMemo(() => {
		if (!uploadDetails?.imeis) return [];

		let filtered = uploadDetails.imeis;

		if (filterValue) {
			const search = filterValue.toLowerCase();
			filtered = filtered.filter(
				(record) =>
					record.imei.includes(search) ||
					record.supplier?.toLowerCase().includes(search) ||
					record.id.toLowerCase().includes(search)
			);
		}

		if (statusFilter.size > 0) {
			filtered = filtered.filter((record) =>
				statusFilter.has(record.is_used ? "used" : "available")
			);
		}

		return filtered;
	}, [uploadDetails?.imeis, filterValue, statusFilter]);

	// GenericTable columns
	const columns = [
		{ name: "IMEI Number", uid: "imei", sortable: true },
		{ name: "Supplier", uid: "supplier", sortable: true },
		{ name: "Expiry Date", uid: "expiry_date", sortable: true },
		{ name: "Status", uid: "is_used", sortable: true },
		{ name: "Created At", uid: "created_at", sortable: true },
	];

	// Pagination
	const pages = Math.ceil(filteredRecords.length / 10) || 1;

	// Render cell content
	const renderCell = (record: Imei, key: string) => {
		if (key === "imei") {
			return (
				<span className="font-mono text-sm font-semibold">{record.imei}</span>
			);
		}
		if (key === "supplier") {
			return record.supplier || "-";
		}
		if (key === "expiry_date") {
			return record.expiry_date
				? new Date(record.expiry_date).toLocaleDateString()
				: "-";
		}
		if (key === "is_used") {
			return (
				<Chip
					variant="flat"
					color={record.is_used ? "warning" : "success"}
					size="sm"
				>
					{record.is_used ? "USED" : "AVAILABLE"}
				</Chip>
			);
		}
		if (key === "created_at") {
			return new Date(record.created_at).toLocaleDateString();
		}
		return "-";
	};

	const exportToExcel = () => {
		if (!uploadDetails) return;

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("IMEI Records");

		// Add headers
		const headers = [
			"IMEI Number",
			"Supplier",
			"Expiry Date",
			"Status",
			"Created At",
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
				record.imei,
				record.supplier || "",
				record.expiry_date || "",
				record.is_used ? "USED" : "AVAILABLE",
				new Date(record.created_at).toLocaleDateString(),
			]);
		});

		// Format IMEI column as number with no decimals
		worksheet.getColumn(1).numFmt = "0";

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

	// Status options for GenericTable
	const statusOptions = [
		{ name: "Available", uid: "available" },
		{ name: "Used", uid: "used" },
	];

	if (isLoading) {
		return <TableSkeleton columns={columns.length} />;
	}

	if (error || !uploadDetails) {
		return (
			<div className="flex flex-col items-center justify-center h-96">
				<p className="text-lg text-gray-500">Failed to load upload details</p>
				<Button
					color="primary"
					variant="flat"
					onPress={() => router.back()}
					className="mt-4"
				>
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button isIconOnly variant="light" onPress={() => router.back()}>
					<ArrowLeft size={20} />
				</Button>
				<div>
					<h1 className="text-2xl font-semibold">Upload Details</h1>
					<p className="text-muted-foreground">{uploadDetails.file_name}</p>
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
							value={uploadDetails.file_name}
							copyable
						/>
						<InfoField
							label="Product"
							value={uploadDetails.product?.name || "-"}
						/>
						<InfoField
							label="Total Records"
							value={uploadDetails.total_records.toLocaleString()}
						/>
						<InfoField
							label="Successful"
							value={uploadDetails.successful_records.toLocaleString()}
						/>
						<InfoField
							label="Failed"
							value={uploadDetails.failed_records.toLocaleString()}
						/>
						<InfoField
							label="Status"
							endComponent={
								<Chip
									variant="flat"
									color={uploadStatusColorMap[uploadDetails.processing_status]}
									size="sm"
								>
									{uploadDetails.processing_status}
								</Chip>
							}
							value={uploadDetails.processing_status}
						/>
					</div>
				</InfoCard>

				{/* Processing Details */}
				<InfoCard
					title="Processing Details"
					icon={<Upload className="w-5 h-5 text-primary-600" />}
					collapsible={false}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InfoField
							label="Uploaded At"
							value={new Date(uploadDetails.uploaded_at).toLocaleString()}
						/>
						<InfoField
							label="Created At"
							value={new Date(uploadDetails.created_at).toLocaleString()}
						/>
						<InfoField
							label="Last Updated"
							value={new Date(uploadDetails.updated_at).toLocaleString()}
						/>
						{uploadDetails.error_message && (
							<InfoField
								label="Error Message"
								value={uploadDetails.error_message}
							/>
						)}
					</div>
				</InfoCard>
			</div>

			{/* IMEI Records Table */}
			<Card>
				<GenericTable<Imei>
					columns={columns}
					data={filteredRecords}
					allCount={filteredRecords.length}
					exportData={filteredRecords}
					isLoading={isLoading}
					renderCell={renderCell}
					filterValue={filterValue}
					onFilterChange={setFilterValue}
					statusFilter={statusFilter}
					onStatusChange={setStatusFilter}
					statusOptions={statusOptions}
					sortDescriptor={sortDescriptor}
					onSortChange={handleSortChange}
					page={page}
					pages={pages}
					onPageChange={setPage}
					exportFn={exportToExcel}
					hasNoRecords={filteredRecords.length === 0}
					searchPlaceholder="Search by IMEI, supplier, or ID..."
				/>
			</Card>
		</div>
	);
}
