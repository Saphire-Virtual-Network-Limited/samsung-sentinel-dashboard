"use client";

import React, { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { FileText, Image as ImageIcon, Eye } from "lucide-react";
import DocumentViewer from "../modals/DocumentViewer";

interface Document {
	name: string;
	type: string;
	url: string;
}

interface DocumentsCellProps {
	documents?: Document[];
	deviceImages?: string[];
	claimId?: string;
}

const DocumentsCell: React.FC<DocumentsCellProps> = ({
	documents = [],
	deviceImages = [],
	claimId,
}) => {
	const [isViewerOpen, setIsViewerOpen] = useState(false);

	const totalCount = documents.length + deviceImages.length;
	const imageCount =
		deviceImages.length +
		documents.filter(
			(doc) =>
				doc.type === "image" ||
				doc.type === "jpg" ||
				doc.type === "png" ||
				doc.type === "jpeg"
		).length;
	const docCount = documents.filter(
		(doc) =>
			doc.type === "pdf" ||
			doc.type === "document" ||
			doc.type === "doc" ||
			doc.type === "docx"
	).length;

	if (totalCount === 0) {
		return <span className="text-gray-400">No documents</span>;
	}

	return (
		<div className="flex items-center gap-2">
			<div className="flex gap-1">
				{imageCount > 0 && (
					<Chip
						size="sm"
						color="success"
						variant="flat"
						startContent={<ImageIcon className="h-3 w-3" />}
					>
						{imageCount}
					</Chip>
				)}
				{docCount > 0 && (
					<Chip
						size="sm"
						color="primary"
						variant="flat"
						startContent={<FileText className="h-3 w-3" />}
					>
						{docCount}
					</Chip>
				)}
			</div>
			<Button
				size="sm"
				variant="light"
				isIconOnly
				onClick={() => setIsViewerOpen(true)}
				className="min-w-unit-8 h-unit-8"
			>
				<Eye className="h-4 w-4" />
			</Button>

			<DocumentViewer
				isOpen={isViewerOpen}
				onClose={() => setIsViewerOpen(false)}
				documents={documents}
				deviceImages={deviceImages}
				title={`Documents - ${claimId || "Claim"}`}
			/>
		</div>
	);
};

export default DocumentsCell;
