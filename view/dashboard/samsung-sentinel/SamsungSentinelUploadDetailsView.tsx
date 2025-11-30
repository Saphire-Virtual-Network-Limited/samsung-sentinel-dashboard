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
import { ArrowLeft, Upload, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
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

// Extended record type to include failed records
interface ImeiTableRecord extends Partial<Imei> {
	imei: string;
	id?: string;
	supplier?: string;
	expiry_date?: string;
	is_used?: boolean;
	created_at?: string;
	failure_reason?: string; // For failed records
	is_failed?: boolean; // Flag for failed records
}

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
	const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

	// Combine successful and failed records
	const allRecords = useMemo(() => {
		if (!uploadDetails) return [];

		const records: ImeiTableRecord[] = [];

		// Add successful IMEIs
		if (uploadDetails.imeis) {
			records.push(
				...uploadDetails.imeis.map((imei) => ({
					...imei,
					is_failed: false,
				}))
			);
		}

		// Add duplicate IMEIs
		if (uploadDetails.processing_details?.duplicates) {
			uploadDetails.processing_details.duplicates.forEach((imei) => {
				records.push({
					imei: typeof imei === "string" ? imei : imei,
					is_failed: true,
					failure_reason: "Duplicate IMEI",
				});
			});
		}

		// Add error IMEIs
		if (uploadDetails.processing_details?.errors) {
			uploadDetails.processing_details.errors.forEach((error: any) => {
				records.push({
					imei: error.imei || "N/A",
					is_failed: true,
					failure_reason: error.error || "Unknown error",
				});
			});
		}

		return records;
	}, [uploadDetails]);

	// Filter IMEI records
	const filteredRecords = useMemo(() => {
		let filtered = allRecords;

		if (filterValue) {
			const search = filterValue.toLowerCase();
			filtered = filtered.filter((record) => {
				const imei = (record.imei || "").toString().toLowerCase();
				const supplier = (record.supplier || "").toString().toLowerCase();
				const id = (record.id || "").toString().toLowerCase();
				const reason = (record.failure_reason || "").toString().toLowerCase();
				return (
					imei.includes(search) ||
					supplier.includes(search) ||
					id.includes(search) ||
					reason.includes(search)
				);
			});
		}

		if (statusFilter.size > 0) {
			filtered = filtered.filter((record) => {
				if (statusFilter.has("failed")) {
					return record.is_failed;
				}
				if (record.is_failed) return false;
				return statusFilter.has(record.is_used ? "used" : "available");
			});
		}

		return filtered;
	}, [allRecords, filterValue, statusFilter]);

	// Local pagination: compute pages based on rowsPerPage and filteredRecords
	const pages = useMemo(
		() => Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage)),
		[filteredRecords.length, rowsPerPage]
	);

	// Ensure current page is within bounds whenever filteredRecords or rowsPerPage changes
	useEffect(() => {
		if (page > pages) setPage(pages);
		if (page < 1) setPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pages]);

	const paginatedRecords = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filteredRecords.slice(start, start + rowsPerPage);
	}, [filteredRecords, page, rowsPerPage]);

	// GenericTable columns
	const columns = [
		{ name: "IMEI Number", uid: "imei", sortable: true },
		{ name: "Status", uid: "status", sortable: true },
		{ name: "Reason", uid: "reason", sortable: false },
		{ name: "Supplier", uid: "supplier", sortable: true },
		{ name: "Expiry Date", uid: "expiry_date", sortable: true },
		{ name: "Created At", uid: "created_at", sortable: true },
	];

	// NOTE: `pages` is computed above with rowsPerPage, and `paginatedRecords` contains the current page

	// Render cell content
	const renderCell = (record: ImeiTableRecord, key: string) => {
		if (key === "imei") {
			return (
				<span className="font-mono text-sm font-semibold">{record.imei}</span>
			);
		}
		if (key === "status") {
			if (record.is_failed) {
				return (
					<Chip variant="flat" color="danger" size="sm">
						FAILED
					</Chip>
				);
			}
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
		if (key === "reason") {
			if (record.is_failed && record.failure_reason) {
				return (
					<span className="text-sm text-danger-600 dark:text-danger-400">
						{record.failure_reason}
					</span>
				);
			}
			return "-";
		}
		if (key === "supplier") {
			return record.supplier || "-";
		}
		if (key === "expiry_date") {
			return record.expiry_date
				? new Date(record.expiry_date).toLocaleDateString()
				: "-";
		}
		if (key === "created_at") {
			return record.created_at
				? new Date(record.created_at).toLocaleDateString()
				: "-";
		}
		return "-";
	};

	const exportToExcel = async () => {
		if (!uploadDetails) return;

		// Try to fetch all records for export (not just current page)
		const recordsToExport = filteredRecords;
		if (
			uploadDetails.total_records &&
			uploadDetails.total_records > filteredRecords.length
		) {
			try {
				// If you have an API to fetch all, use it here. Example:
				// const allDetails = await getImeiUploadById(uploadId, { page: 1, limit: uploadDetails.total_records + 20 });
				// recordsToExport = ...combine allDetails as above
				// For now, fallback to filteredRecords
			} catch (e) {
				// fallback to filteredRecords
			}
		}

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("IMEI Records");

		// Add headers
		const headers = [
			"IMEI Number",
			"Status",
			"Failure Reason",
			"Supplier",
			"Expiry Date",
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
		recordsToExport.forEach((record) => {
			worksheet.addRow([
				record.imei,
				record.is_failed ? "FAILED" : record.is_used ? "USED" : "AVAILABLE",
				record.failure_reason || "",
				record.supplier || "",
				record.expiry_date || "",
				record.created_at
					? new Date(record.created_at).toLocaleDateString()
					: "",
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
		{ name: "Failed", uid: "failed" },
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

			{/* Processing Errors (if any) */}
			{uploadDetails.processing_details?.errors &&
				uploadDetails.processing_details.errors.length > 0 && (
					<InfoCard
						title={`Upload Errors (${uploadDetails.processing_details.errors.length})`}
						icon={<AlertCircle className="w-5 h-5 text-danger-600" />}
						collapsible={true}
						defaultExpanded={uploadDetails.failed_records > 0}
					>
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{uploadDetails.processing_details.errors.map(
								(error: any, index: number) => (
									<div
										key={index}
										className="flex items-start gap-3 p-3 bg-danger-50 dark:bg-danger-900/10 rounded-lg border border-danger-200 dark:border-danger-800"
									>
										<AlertCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<p className="text-sm font-medium text-danger-800 dark:text-danger-200">
												{error.imei !== "N/A"
													? `IMEI: ${error.imei}`
													: "Row Data"}
											</p>
											<p className="text-sm text-danger-700 dark:text-danger-300">
												{error.error}
											</p>
										</div>
									</div>
								)
							)}
						</div>
					</InfoCard>
				)}

			{/* IMEI Records Table */}
			<GenericTable<ImeiTableRecord>
				columns={columns}
				data={paginatedRecords}
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
				showRowsPerPageSelector={true}
				rowsPerPageOptions={[10, 25, 50, 100]}
				defaultRowsPerPage={rowsPerPage}
				onRowsPerPageChange={(r) => {
					setRowsPerPage(r);
					setPage(1);
				}}
				exportFn={exportToExcel}
				hasNoRecords={filteredRecords.length === 0}
				searchPlaceholder="Search by IMEI, supplier, or ID..."
			/>
		</div>
	);
}
