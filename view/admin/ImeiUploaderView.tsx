"use client";

import React, { useState } from "react";
import SimpleTable from "@/components/reususables/custom-ui/SimpleTable";
import { FormField, SelectField } from "@/components/reususables";
import { Button, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
import { Upload, Download, Eye, FileText } from "lucide-react";
import { showToast } from "@/lib/showNotification";
import useSWR from "swr";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Mock data fetcher
const fetcher = (url: string) => {
	return Promise.resolve([
		{
			id: "IU001",
			deviceType: "Samsung Galaxy A24",
			fileName: "samsung_a24_imei_batch_1.csv",
			imeiCount: 1500,
			uploadDate: "2024-01-15",
			uploadedBy: "Admin User",
			status: "completed",
		},
		{
			id: "IU002",
			deviceType: "Samsung Galaxy S22",
			fileName: "samsung_s22_imei_batch_2.csv",
			imeiCount: 2200,
			uploadDate: "2024-01-14",
			uploadedBy: "Admin User",
			status: "processing",
		},
		{
			id: "IU003",
			deviceType: "Samsung Galaxy Note 20",
			fileName: "samsung_note20_imei_batch_3.csv",
			imeiCount: 800,
			uploadDate: "2024-01-13",
			uploadedBy: "Sub Admin",
			status: "failed",
		},
	]);
};

const ImeiUploaderView = () => {
	const [selectedDeviceType, setSelectedDeviceType] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadReport, setUploadReport] = useState<any>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { isOpen: isReportModalOpen, onOpen: onReportModalOpen, onClose: onReportModalClose } = useDisclosure();

	const { data: uploads = [], error, mutate } = useSWR("/api/admin/imei-uploads", fetcher);

	const deviceTypes = [
		{ value: "samsung_galaxy_a24", label: "Samsung Galaxy A24" },
		{ value: "samsung_galaxy_s22", label: "Samsung Galaxy S22" },
		{ value: "samsung_galaxy_s23", label: "Samsung Galaxy S23" },
		{ value: "samsung_galaxy_s24", label: "Samsung Galaxy S24" },
		{ value: "samsung_galaxy_note20", label: "Samsung Galaxy Note 20" },
		{ value: "samsung_galaxy_zfold", label: "Samsung Galaxy Z Fold" },
		{ value: "samsung_galaxy_zflip", label: "Samsung Galaxy Z Flip" },
	];

	const filteredUploads = uploads.filter((upload: any) => {
		const matchesSearch = !searchQuery || 
			upload.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
			upload.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			upload.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
		
		return matchesSearch;
	});

	const columns = [
		{
			key: "deviceType",
			label: "Device Type",
		},
		{
			key: "fileName",
			label: "File Name",
		},
		{
			key: "imei",
			label: "IMEI Count",
			render: (item: any) => (
				<span className="font-medium">{item.imeiCount.toLocaleString()}</span>
			),
		},
		{
			key: "uploadDate",
			label: "Upload Date",
			render: (item: any) => new Date(item.uploadDate).toLocaleDateString(),
		},
		{
			key: "uploadedBy",
			label: "Uploaded By",
		},
		{
			key: "status",
			label: "Status",
			render: (item: any) => {
				const statusColors = {
					completed: "success",
					processing: "warning",
					failed: "danger",
				};
				return (
					<Chip 
						color={statusColors[item.status as keyof typeof statusColors] as any} 
						variant="flat" 
						size="sm"
					>
						{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
					</Chip>
				);
			},
		},
		{
			key: "actions",
			label: "Actions",
			render: (item: any) => (
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="ghost"
						onPress={() => viewUploadReport(item.id)}
						startContent={<Eye size={16} />}
					>
						View Report
					</Button>
				</div>
			),
		},
	];

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const generateTemplate = async () => {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("IMEI Template");

		// Add headers
		worksheet.addRow(["IMEI Number", "Device Serial", "Device Model"]);

		// Style headers
		const headerRow = worksheet.getRow(1);
		headerRow.font = { bold: true };
		headerRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE0E0E0" },
		};

		// Add some sample data
		worksheet.addRow(["123456789012345", "SN001", selectedDeviceType || "Samsung Galaxy A24"]);
		worksheet.addRow(["987654321098765", "SN002", selectedDeviceType || "Samsung Galaxy A24"]);

		// Set column widths
		worksheet.columns = [
			{ width: 20 },
			{ width: 15 },
			{ width: 25 },
		];

		// Generate file
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], { 
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
		});
		const fileName = `imei_template_${selectedDeviceType || "samsung"}.xlsx`;
		saveAs(blob, fileName);

		showToast({
			type: "success",
			message: "IMEI template downloaded successfully",
		});
	};

	const handleUpload = async () => {
		if (!selectedFile || !selectedDeviceType) {
			showToast({
				type: "error",
				message: "Please select both device type and file",
			});
			return;
		}

		setIsUploading(true);

		try {
			// Mock upload process
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Mock upload report
			const mockReport = {
				totalProcessed: 1500,
				successful: 1450,
				failed: 50,
				duplicates: 25,
				invalid: 25,
				failedItems: [
					{ row: 15, imei: "123456789012345", reason: "Invalid IMEI format" },
					{ row: 32, imei: "987654321098765", reason: "Duplicate IMEI" },
				],
			};

			setUploadReport(mockReport);
			mutate(); // Refresh the uploads list
			onReportModalOpen();

			showToast({
				type: "success",
				message: `Upload completed! ${mockReport.successful} IMEIs processed successfully`,
			});

			// Reset form
			setSelectedFile(null);
			setSelectedDeviceType("");
		} catch (error) {
			showToast({
				type: "error",
				message: "Upload failed. Please try again.",
			});
		} finally {
			setIsUploading(false);
		}
	};

	const viewUploadReport = (uploadId: string) => {
		// Mock report for viewing
		const mockReport = {
			totalProcessed: 2200,
			successful: 2150,
			failed: 50,
			duplicates: 30,
			invalid: 20,
			failedItems: [
				{ row: 25, imei: "123456789012345", reason: "Invalid IMEI format" },
				{ row: 56, imei: "987654321098765", reason: "Duplicate IMEI" },
				{ row: 78, imei: "456789012345678", reason: "IMEI already exists" },
			],
		};

		setUploadReport(mockReport);
		onReportModalOpen();
	};

	const downloadReport = () => {
		if (!uploadReport) return;

		const csvContent = [
			["Type", "Count"],
			["Total Processed", uploadReport.totalProcessed],
			["Successful", uploadReport.successful],
			["Failed", uploadReport.failed],
			["Duplicates", uploadReport.duplicates],
			["Invalid", uploadReport.invalid],
			[""],
			["Failed Items"],
			["Row", "IMEI", "Reason"],
			...uploadReport.failedItems.map((item: any) => [item.row, item.imei, item.reason])
		].map(row => row.join(",")).join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		saveAs(blob, "upload_report.csv");
	};

	if (error) {
		return (
			<div className="p-6">
				<div className="text-center py-8">
					<p className="text-red-500">Failed to load upload history</p>
					<Button onClick={() => mutate()} className="mt-4">
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">IMEI Uploader</h1>
					<p className="text-gray-600 mt-1">Upload and manage Samsung device IMEIs for warranty verification</p>
				</div>
			</div>

			{/* Upload Section */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Upload New IMEI Batch</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<SelectField
								label="Device Type"
								htmlFor="device-type"
								id="device-type"
								defaultSelectedKeys={selectedDeviceType ? [selectedDeviceType] : []}
								onChange={(value) => setSelectedDeviceType(Array.isArray(value) ? value[0] : value)}
								options={deviceTypes}
								placeholder="Select Samsung device type"
								required
							/>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Upload File
								</label>
								<input
									type="file"
									accept=".csv,.xlsx,.xls"
									onChange={handleFileSelect}
									className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
								/>
								{selectedFile && (
									<p className="mt-2 text-sm text-gray-600">
										Selected: {selectedFile.name}
									</p>
								)}
							</div>

							<div className="flex gap-3">
								<Button
									color="primary"
									onPress={handleUpload}
									isLoading={isUploading}
									isDisabled={!selectedFile || !selectedDeviceType}
									startContent={<Upload size={16} />}
								>
									Upload IMEIs
								</Button>
								<Button
									variant="bordered"
									onPress={generateTemplate}
									startContent={<Download size={16} />}
								>
									Download Template
								</Button>
							</div>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="font-medium mb-2">Upload Guidelines:</h4>
							<ul className="text-sm text-gray-600 space-y-1">
								<li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
								<li>• Required columns: IMEI Number, Device Serial, Device Model</li>
								<li>• Maximum file size: 10MB</li>
								<li>• Maximum records per file: 10,000</li>
								<li>• IMEI must be 15 digits</li>
								<li>• Duplicate IMEIs will be flagged</li>
							</ul>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Upload History */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Upload History</h3>
				</CardHeader>
				<CardBody>
					<SimpleTable
						data={filteredUploads}
						columns={columns}
						searchable
						searchPlaceholder="Search by device type, file name, or uploaded by..."
						searchValue={searchQuery}
						onSearchChange={setSearchQuery}
						isLoading={!uploads && !error}
						emptyMessage="No IMEI uploads found"
						selectable={false}
					/>
				</CardBody>
			</Card>

			{/* Upload Report Modal */}
			<Modal 
				isOpen={isReportModalOpen} 
				onClose={onReportModalClose}
				size="2xl"
			>
				<ModalContent>
					<ModalHeader>
						<h3>Upload Report</h3>
					</ModalHeader>
					<ModalBody>
						{uploadReport && (
							<div className="space-y-4">
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									<div className="bg-blue-50 p-3 rounded-lg">
										<div className="text-2xl font-bold text-blue-600">
											{uploadReport.totalProcessed.toLocaleString()}
										</div>
										<div className="text-sm text-blue-800">Total Processed</div>
									</div>
									<div className="bg-green-50 p-3 rounded-lg">
										<div className="text-2xl font-bold text-green-600">
											{uploadReport.successful.toLocaleString()}
										</div>
										<div className="text-sm text-green-800">Successful</div>
									</div>
									<div className="bg-red-50 p-3 rounded-lg">
										<div className="text-2xl font-bold text-red-600">
											{uploadReport.failed.toLocaleString()}
										</div>
										<div className="text-sm text-red-800">Failed</div>
									</div>
								</div>

								{uploadReport.failedItems && uploadReport.failedItems.length > 0 && (
									<div>
										<h4 className="font-medium mb-2">Failed Items (First 10):</h4>
										<div className="max-h-40 overflow-y-auto">
											<table className="w-full text-sm">
												<thead>
													<tr className="border-b">
														<th className="text-left p-2">Row</th>
														<th className="text-left p-2">IMEI</th>
														<th className="text-left p-2">Reason</th>
													</tr>
												</thead>
												<tbody>
													{uploadReport.failedItems.slice(0, 10).map((item: any, index: number) => (
														<tr key={index} className="border-b">
															<td className="p-2">{item.row}</td>
															<td className="p-2 font-mono">{item.imei}</td>
															<td className="p-2">{item.reason}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button
							variant="light"
							onPress={onReportModalClose}
						>
							Close
						</Button>
						<Button
							color="primary"
							onPress={downloadReport}
							startContent={<FileText size={16} />}
						>
							Download Report
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ImeiUploaderView;