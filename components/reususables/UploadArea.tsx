"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Progress,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Chip,
	Tooltip,
} from "@heroui/react";
import {
	Upload,
	Eye,
	FileText,
	Trash2,
	RefreshCw,
	File,
	Image as ImageIcon,
	FileSpreadsheet,
	Download,
	Clock,
} from "lucide-react";
import { ConfirmationModal } from "@/components/reususables";

type Doc = {
	id: string;
	name: string;
	type?: string; // 'image' | 'pdf' | ...
	url?: string;
	uploadDate?: string;
	size?: number;
};

type UploadAreaProps = {
	title?: string;
	accept?: string;
	files?: Doc[];
	onUpload?: (file: File) => Promise<Doc>;
	onReplace?: (docId: string, file: File) => Promise<Doc>;
	onDelete?: (docId: string) => Promise<void>;
	filter?: (doc: Doc) => boolean;
};

export default function UploadArea({
	title = "Uploads",
	accept = "image/*,application/pdf",
	files = [],
	onUpload,
	onReplace,
	onDelete,
	filter,
}: UploadAreaProps) {
	const [localFiles, setLocalFiles] = useState<Doc[]>(files || []);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const replaceInputRef = useRef<HTMLInputElement | null>(null);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		isOpen: isConfirmOpen,
		onOpen: onConfirmOpen,
		onClose: onConfirmClose,
	} = useDisclosure();

	const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
	const [replaceTarget, setReplaceTarget] = useState<Doc | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Doc | null>(null);
	const [uploadingFileName, setUploadingFileName] = useState<string>("");

	useEffect(() => {
		setLocalFiles(files || []);
	}, [files]);

	const formatFileSize = (bytes?: number): string => {
		if (!bytes) return "Unknown size";
		if (bytes < 1024) return bytes + " B";
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
		return (bytes / (1024 * 1024)).toFixed(1) + " MB";
	};

	const getFileIcon = (doc: Doc) => {
		const name = doc.name.toLowerCase();
		const type = doc.type?.toLowerCase() || "";

		if (
			name.endsWith(".jpg") ||
			name.endsWith(".jpeg") ||
			name.endsWith(".png") ||
			name.endsWith(".gif") ||
			type.includes("image")
		) {
			return <ImageIcon className="w-5 h-5 text-blue-500" />;
		}
		if (name.endsWith(".pdf") || type.includes("pdf")) {
			return <FileText className="w-5 h-5 text-red-500" />;
		}
		if (
			name.endsWith(".doc") ||
			name.endsWith(".docx") ||
			type.includes("word")
		) {
			return <File className="w-5 h-5 text-blue-600" />;
		}
		if (
			name.endsWith(".xls") ||
			name.endsWith(".xlsx") ||
			type.includes("spreadsheet")
		) {
			return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
		}
		return <File className="w-5 h-5 text-default-500" />;
	};

	const handleFilesAdded = useCallback(
		async (fileList: FileList | null) => {
			if (!fileList || fileList.length === 0) return;
			const file = fileList[0];
			if (!onUpload) return;
			try {
				setUploading(true);
				setProgress(0);
				setUploadingFileName(file.name);
				// fake progress while awaiting upload
				const timer = setInterval(() => {
					setProgress((p) =>
						Math.min(95, p + Math.floor(Math.random() * 10) + 5)
					);
				}, 300);
				const uploaded = await onUpload(file);
				clearInterval(timer);
				setProgress(100);
				setLocalFiles((prev) => [uploaded, ...prev]);
			} catch (err) {
				console.error(err);
			} finally {
				setTimeout(() => {
					setProgress(0);
					setUploadingFileName("");
				}, 400);
				setUploading(false);
			}
		},
		[onUpload]
	);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			const dt = e.dataTransfer;
			await handleFilesAdded(dt.files);
		},
		[handleFilesAdded]
	);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleClickBrowse = () => inputRef.current?.click();

	const handleReplace = async (doc: Doc, fileList: FileList | null) => {
		if (!fileList || fileList.length === 0 || !onReplace) return;
		const file = fileList[0];
		setUploading(true);
		setProgress(0);
		setUploadingFileName(file.name);
		const timer = setInterval(() => {
			setProgress((p) => Math.min(95, p + Math.floor(Math.random() * 10) + 5));
		}, 300);
		try {
			const replaced = await onReplace(doc.id, file);
			setLocalFiles((prev) =>
				prev.map((d) => (d.id === doc.id ? replaced : d))
			);
		} catch (err) {
			console.error(err);
		} finally {
			clearInterval(timer);
			setUploading(false);
			setProgress(0);
			setUploadingFileName("");
			setReplaceTarget(null);
		}
	};

	const confirmDelete = async () => {
		if (!deleteTarget || !onDelete) return;
		try {
			await onDelete(deleteTarget.id);
			setLocalFiles((prev) => prev.filter((d) => d.id !== deleteTarget.id));
		} catch (err) {
			console.error(err);
		} finally {
			setDeleteTarget(null);
			onConfirmClose();
		}
	};

	const renderThumb = (doc: Doc) => {
		const isImage =
			doc.url &&
			(/\.(jpg|jpeg|png|gif|webp)$/i.test(doc.url) ||
				doc.type?.includes("image"));
		const isPdf =
			doc.url && (/\.pdf$/i.test(doc.url) || doc.type?.includes("pdf"));

		if (isImage && doc.url) {
			return (
				<div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
					<Image src={doc.url} alt={doc.name} fill className="object-cover" />
				</div>
			);
		}

		const bgColors: Record<string, string> = {
			pdf: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
			word: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
			excel: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
			default: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
		};

		let bgClass = bgColors.default;
		if (isPdf) bgClass = bgColors.pdf;
		else if (doc.name.toLowerCase().includes(".doc")) bgClass = bgColors.word;
		else if (doc.name.toLowerCase().includes(".xls")) bgClass = bgColors.excel;

		return (
			<div
				className={`w-20 h-20 flex items-center justify-center rounded-lg border shadow-sm ${bgClass}`}
			>
				{getFileIcon(doc)}
			</div>
		);
	};

	const visibleFiles = filter ? localFiles.filter(filter) : localFiles;

	return (
		<Card className="shadow-md border border-default-200">
			<CardHeader className="bg-gradient-to-r from-default-50 to-default-100 border-b border-default-200">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center gap-2">
						<Upload className="w-5 h-5 text-primary" />
						<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
					</div>
					<Chip
						size="sm"
						variant="flat"
						color={visibleFiles.length > 0 ? "success" : "default"}
					>
						{visibleFiles.length} {visibleFiles.length === 1 ? "file" : "files"}
					</Chip>
				</div>
			</CardHeader>
			<CardBody className="p-6">
				{/* Upload Drop Zone */}
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onClick={handleClickBrowse}
					className={`
						relative border-2 border-dashed rounded-xl p-8 
						transition-all duration-300 cursor-pointer
						${
							isDragging
								? "border-primary bg-primary-50 scale-[1.02] shadow-lg"
								: "border-default-300 hover:border-primary hover:bg-default-50"
						}
					`}
				>
					<div className="flex flex-col items-center justify-center gap-4">
						<div
							className={`
							p-4 rounded-full transition-all duration-300
							${
								isDragging
									? "bg-primary text-white scale-110"
									: "bg-gradient-to-br from-primary-50 to-primary-100 text-primary"
							}
						`}
						>
							<Upload className="w-8 h-8" />
						</div>
						<div className="text-center">
							<p className="text-lg font-semibold text-gray-900 mb-1">
								{isDragging ? "Drop file here" : "Drag & drop files here"}
							</p>
							<p className="text-sm text-default-500">
								or click to browse from your device
							</p>
							<p className="text-xs text-default-400 mt-2">
								Supported: {accept.replace(/\*/g, "All")}
							</p>
						</div>
					</div>
					<input
						ref={inputRef}
						type="file"
						accept={accept}
						className="hidden"
						onChange={(e) => handleFilesAdded(e.target.files)}
					/>
				</div>

				{/* Upload Progress */}
				{uploading && (
					<div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100 animate-in fade-in slide-in-from-top-2 duration-300">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<Upload className="w-4 h-4 text-primary animate-pulse" />
								<span className="text-sm font-medium text-gray-900">
									Uploading {uploadingFileName}...
								</span>
							</div>
							<span className="text-sm font-semibold text-primary">
								{progress}%
							</span>
						</div>
						<Progress
							value={progress}
							color="primary"
							className="h-2"
							classNames={{
								indicator: "bg-gradient-to-r from-primary to-secondary",
							}}
						/>
					</div>
				)}

				{/* Files List */}
				{visibleFiles.length > 0 && (
					<div className="mt-6">
						<div className="flex items-center justify-between mb-3">
							<h4 className="text-sm font-semibold text-gray-700">
								Uploaded Files
							</h4>
							<Tooltip content="Refresh list">
								<Button
									size="sm"
									isIconOnly
									variant="light"
									onPress={() => setLocalFiles(files || [])}
								>
									<RefreshCw className="w-4 h-4" />
								</Button>
							</Tooltip>
						</div>
						<div className="space-y-3">
							{visibleFiles.map((doc, index) => (
								<div
									key={doc.id}
									className="group relative flex items-center gap-4 p-4 bg-white border border-default-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-left"
									style={{ animationDelay: `${index * 50}ms` }}
								>
									{/* Thumbnail */}
									{renderThumb(doc)}

									{/* File Info */}
									<div className="flex-1 min-w-0">
										<h5 className="text-sm font-semibold text-gray-900 truncate mb-1">
											{doc.name}
										</h5>
										<div className="flex items-center gap-3 text-xs text-default-500">
											<span className="flex items-center gap-1">
												{getFileIcon(doc)}
												{doc.type || "File"}
											</span>
											{doc.size && (
												<span className="flex items-center gap-1">
													<Download className="w-3 h-3" />
													{formatFileSize(doc.size)}
												</span>
											)}
											{doc.uploadDate && (
												<span className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{new Date(doc.uploadDate).toLocaleDateString()}
												</span>
											)}
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Tooltip content="Preview">
											<Button
												size="sm"
												isIconOnly
												variant="flat"
												color="primary"
												onPress={() => {
													setPreviewDoc(doc);
													onOpen();
												}}
											>
												<Eye className="w-4 h-4" />
											</Button>
										</Tooltip>

										<input
											ref={replaceInputRef}
											type="file"
											accept={accept}
											className="hidden"
											onChange={(e) => handleReplace(doc, e.target.files)}
										/>
										<Tooltip content="Replace">
											<Button
												size="sm"
												isIconOnly
												variant="flat"
												color="warning"
												onPress={() => {
													setReplaceTarget(doc);
													replaceInputRef.current?.click();
												}}
											>
												<RefreshCw className="w-4 h-4" />
											</Button>
										</Tooltip>

										<Tooltip content="Delete">
											<Button
												size="sm"
												isIconOnly
												variant="flat"
												color="danger"
												onPress={() => {
													setDeleteTarget(doc);
													onConfirmOpen();
												}}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</Tooltip>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{visibleFiles.length === 0 && !uploading && (
					<div className="mt-6 p-6 bg-default-50 rounded-lg border border-dashed border-default-300 text-center">
						<FileText className="w-12 h-12 mx-auto text-default-400 mb-2" />
						<p className="text-sm text-default-500">No files uploaded yet</p>
					</div>
				)}

				{/* Confirmation Modal */}
				<ConfirmationModal
					isOpen={isConfirmOpen}
					onClose={() => {
						setDeleteTarget(null);
						onConfirmClose();
					}}
					title="Delete File"
					description={`Are you sure you want to delete "${
						deleteTarget?.name || "this file"
					}"? This action cannot be undone.`}
					onConfirm={confirmDelete}
					confirmText="Delete"
					variant="danger"
				/>

				{/* Preview Modal */}
				<Modal
					isOpen={isOpen}
					onClose={() => {
						setPreviewDoc(null);
						onClose();
					}}
					size="4xl"
					className="max-h-[90vh]"
				>
					<ModalContent>
						<ModalHeader className="flex flex-col gap-1 border-b">
							<div className="flex items-center gap-2">
								{previewDoc && getFileIcon(previewDoc)}
								<h3 className="text-lg font-semibold">
									{previewDoc?.name || "Document Preview"}
								</h3>
							</div>
							{previewDoc && (
								<div className="flex items-center gap-3 text-xs text-default-500">
									{previewDoc.size && (
										<span>{formatFileSize(previewDoc.size)}</span>
									)}
									{previewDoc.uploadDate && (
										<span>
											Uploaded:{" "}
											{new Date(previewDoc.uploadDate).toLocaleDateString()}
										</span>
									)}
								</div>
							)}
						</ModalHeader>
						<ModalBody className="p-0">
							{previewDoc ? (
								previewDoc.url &&
								(/\.(jpg|jpeg|png|gif|webp)$/i.test(previewDoc.url) ||
									previewDoc.type?.includes("image")) ? (
									<div className="w-full h-[70vh] relative bg-gray-50 flex items-center justify-center">
										<Image
											src={previewDoc.url}
											alt={previewDoc.name}
											fill
											className="object-contain p-4"
										/>
									</div>
								) : previewDoc.url &&
								  (/\.pdf$/i.test(previewDoc.url) ||
										previewDoc.type?.includes("pdf")) ? (
									<div className="w-full h-[80vh] bg-gray-100">
										<iframe
											src={previewDoc.url}
											className="w-full h-full border-0"
											title={previewDoc.name}
										/>
									</div>
								) : (
									<div className="p-12 text-center">
										<FileText className="w-16 h-16 mx-auto text-default-300 mb-4" />
										<p className="text-default-500 font-medium">
											Preview not available for this file type
										</p>
										<p className="text-sm text-default-400 mt-2">
											{previewDoc.name}
										</p>
									</div>
								)
							) : null}
						</ModalBody>
						<ModalFooter className="border-t">
							<Button
								color="danger"
								variant="light"
								onPress={() => {
									setPreviewDoc(null);
									onClose();
								}}
							>
								Close
							</Button>
							{previewDoc?.url && (
								<Button
									color="primary"
									as="a"
									href={previewDoc.url}
									download={previewDoc.name}
									startContent={<Download className="w-4 h-4" />}
								>
									Download
								</Button>
							)}
						</ModalFooter>
					</ModalContent>
				</Modal>
			</CardBody>
		</Card>
	);
}
