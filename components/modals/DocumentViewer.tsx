"use client";

import React, { useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Image,
	Spinner,
	Card,
	CardBody,
	Chip,
} from "@heroui/react";
import {
	FileText,
	Image as ImageIcon,
	Download,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";

interface Document {
	name: string;
	type: string;
	url: string;
}

interface DocumentViewerProps {
	isOpen: boolean;
	onClose: () => void;
	documents: Document[];
	deviceImages?: string[];
	title?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
	isOpen,
	onClose,
	documents,
	deviceImages = [],
	title = "Documents & Images",
}) => {
	const [selectedDocument, setSelectedDocument] = useState<Document | null>(
		null
	);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [zoom, setZoom] = useState(100);

	const handleDocumentClick = (doc: Document) => {
		if (
			doc.type === "image" ||
			doc.type === "jpg" ||
			doc.type === "png" ||
			doc.type === "jpeg"
		) {
			setSelectedImage(doc.url);
			setSelectedDocument(null);
		} else {
			setSelectedDocument(doc);
			setSelectedImage(null);
		}
		setZoom(100);
	};

	const handleImageClick = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setSelectedDocument(null);
		setZoom(100);
	};

	const handleDownload = (url: string, name: string) => {
		const link = document.createElement("a");
		link.href = url;
		link.download = name;
		link.target = "_blank";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const adjustZoom = (delta: number) => {
		setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
	};

	const resetView = () => {
		setSelectedDocument(null);
		setSelectedImage(null);
		setZoom(100);
	};

	const getFileIcon = (type: string) => {
		if (type === "pdf") return <FileText className="h-5 w-5" />;
		if (type === "image" || type === "jpg" || type === "png" || type === "jpeg")
			return <ImageIcon className="h-5 w-5" />;
		return <FileText className="h-5 w-5" />;
	};

	const getFileTypeColor = (type: string) => {
		if (type === "pdf") return "danger";
		if (type === "image" || type === "jpg" || type === "png" || type === "jpeg")
			return "success";
		return "default";
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="5xl"
			scrollBehavior="inside"
			classNames={{
				base: "max-h-[90vh]",
				body: "p-0",
			}}
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1 px-6 py-4">
							<div className="flex items-center justify-between w-full">
								<h3 className="text-lg font-semibold">{title}</h3>
								{(selectedDocument || selectedImage) && (
									<div className="flex items-center gap-2">
										{selectedImage && (
											<>
												<Button
													size="sm"
													variant="light"
													isIconOnly
													onClick={() => adjustZoom(-10)}
												>
													<ZoomOut className="h-4 w-4" />
												</Button>
												<span className="text-sm text-gray-500">{zoom}%</span>
												<Button
													size="sm"
													variant="light"
													isIconOnly
													onClick={() => adjustZoom(10)}
												>
													<ZoomIn className="h-4 w-4" />
												</Button>
											</>
										)}
										<Button
											size="sm"
											variant="light"
											isIconOnly
											onClick={resetView}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>
						</ModalHeader>
						<ModalBody className="px-0">
							{!selectedDocument && !selectedImage ? (
								// Document/Image Grid View
								<div className="px-6 space-y-6">
									{/* Device Images Section */}
									{deviceImages.length > 0 && (
										<div>
											<h4 className="text-md font-medium mb-3 flex items-center gap-2">
												<ImageIcon className="h-4 w-4" />
												Device Images ({deviceImages.length})
											</h4>
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
												{deviceImages.map((imageUrl, index) => (
													<Card
														key={index}
														isPressable
														className="cursor-pointer hover:scale-105 transition-transform"
														onClick={() => handleImageClick(imageUrl)}
													>
														<CardBody className="p-2">
															<Image
																src={imageUrl}
																alt={`Device image ${index + 1}`}
																className="w-full h-24 object-cover rounded"
																loading="lazy"
															/>
															<p className="text-xs text-center mt-1 text-gray-600">
																Image {index + 1}
															</p>
														</CardBody>
													</Card>
												))}
											</div>
										</div>
									)}

									{/* Documents Section */}
									{documents.length > 0 && (
										<div>
											<h4 className="text-md font-medium mb-3 flex items-center gap-2">
												<FileText className="h-4 w-4" />
												Documents ({documents.length})
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{documents.map((doc, index) => (
													<Card
														key={index}
														isPressable
														className="cursor-pointer hover:scale-105 transition-transform"
														onClick={() => handleDocumentClick(doc)}
													>
														<CardBody className="p-4">
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-3">
																	{getFileIcon(doc.type)}
																	<div>
																		<p className="font-medium text-sm">
																			{doc.name}
																		</p>
																		<Chip
																			size="sm"
																			color={getFileTypeColor(doc.type)}
																			variant="flat"
																		>
																			{doc.type.toUpperCase()}
																		</Chip>
																	</div>
																</div>
																<Button
																	size="sm"
																	variant="light"
																	isIconOnly
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDownload(doc.url, doc.name);
																	}}
																>
																	<Download className="h-4 w-4" />
																</Button>
															</div>
														</CardBody>
													</Card>
												))}
											</div>
										</div>
									)}

									{deviceImages.length === 0 && documents.length === 0 && (
										<div className="text-center py-8 text-gray-500">
											<FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
											<p>No documents or images available</p>
										</div>
									)}
								</div>
							) : selectedImage ? (
								// Image Viewer
								<div className="flex justify-center items-center p-6 bg-gray-50 min-h-[400px]">
									<div className="max-w-full max-h-full overflow-auto">
										<Image
											src={selectedImage}
											alt="Selected image"
											style={{
												transform: `scale(${zoom / 100})`,
												maxWidth: "none",
												maxHeight: "none",
											}}
											className="transition-transform"
										/>
									</div>
								</div>
							) : selectedDocument ? (
								// PDF Viewer
								<div className="p-6">
									{selectedDocument.type === "pdf" ? (
										<div className="w-full h-[500px] border rounded-lg">
											<iframe
												src={selectedDocument.url}
												className="w-full h-full rounded-lg"
												title={selectedDocument.name}
											/>
										</div>
									) : (
										<div className="text-center py-8">
											<FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
											<p className="text-gray-600 mb-4">
												Preview not available for this file type
											</p>
											<Button
												color="primary"
												onClick={() =>
													handleDownload(
														selectedDocument.url,
														selectedDocument.name
													)
												}
											>
												<Download className="h-4 w-4 mr-2" />
												Download File
											</Button>
										</div>
									)}
								</div>
							) : null}
						</ModalBody>
						<ModalFooter className="px-6 py-4">
							{selectedDocument && (
								<Button
									color="primary"
									variant="flat"
									onClick={() =>
										handleDownload(selectedDocument.url, selectedDocument.name)
									}
								>
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
							)}
							<Button color="danger" variant="light" onPress={onClose}>
								Close
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default DocumentViewer;
