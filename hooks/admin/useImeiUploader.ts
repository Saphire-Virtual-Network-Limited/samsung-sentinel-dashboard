import useSWR from "swr";
import { apiCall } from "@/lib/api";

export interface ImeiValidationResult {
	isValid: boolean;
	device?: {
		brand: string;
		model: string;
		storage: string;
		color?: string;
	};
	reason?: string;
	eligibleForWarranty?: boolean;
	warrantyStartDate?: string;
	warrantyEndDate?: string;
}

export interface ImeiUpload {
	id: string;
	fileName: string;
	status: "processing" | "success" | "failed";
	totalImeis: number;
	validImeis: number;
	invalidImeis: number;
	errorMessage?: string;
	createdAt: string;
	processedAt?: string;
}

export interface PendingImei {
	id: string;
	imei: string;
	deviceName?: string;
	brand?: string;
	model?: string;
	storage?: string;
	status: "valid" | "invalid" | "pending";
	reason?: string;
	uploadId: string;
}

export const useImeiUploader = () => {
	const {
		data: uploads,
		error: uploadsError,
		isLoading: uploadsLoading,
		mutate: mutateUploads,
	} = useSWR("/api/admin/imei-uploads", (url: string) => apiCall(url, "GET"));

	const {
		data: pendingImeis,
		error: imeisError,
		isLoading: imeisLoading,
		mutate: mutateImeis,
	} = useSWR("/api/admin/pending-imeis", (url: string) => apiCall(url, "GET"));

	const uploadFile = async (
		file: File,
		onProgress?: (progress: number) => void
	) => {
		const formData = new FormData();
		formData.append("file", file);

		// Create XMLHttpRequest for progress tracking
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable && onProgress) {
					const progress = Math.round((event.loaded * 100) / event.total);
					onProgress(progress);
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					try {
						const response = JSON.parse(xhr.responseText);
						mutateUploads();
						mutateImeis();
						resolve(response);
					} catch (error) {
						reject(new Error("Invalid response format"));
					}
				} else {
					reject(new Error(`Upload failed with status ${xhr.status}`));
				}
			});

			xhr.addEventListener("error", () => {
				reject(new Error("Upload failed"));
			});

			xhr.open("POST", "/api/admin/imei-uploads");

			// Add auth headers if needed
			const token = localStorage.getItem("authToken");
			if (token) {
				xhr.setRequestHeader("Authorization", `Bearer ${token}`);
			}

			xhr.send(formData);
		});
	};

	const downloadTemplate = async () => {
		try {
			const response = await apiCall("/api/admin/imei-template", "GET");

			// Create blob and download
			const blob = new Blob([response], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "imei-upload-template.xlsx";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download template:", error);
			throw error;
		}
	};

	const validateImei = async (imei: string): Promise<ImeiValidationResult> => {
		try {
			const response = await apiCall(`/api/admin/validate-imei/${imei}`, "GET");
			return response;
		} catch (error) {
			console.error("IMEI validation failed:", error);
			throw error;
		}
	};

	const deleteUpload = async (uploadId: string) => {
		try {
			await apiCall(`/api/admin/imei-uploads/${uploadId}`, "DELETE");
			mutateUploads();
			mutateImeis();
		} catch (error) {
			console.error("Failed to delete upload:", error);
			throw error;
		}
	};

	return {
		uploads: uploads || [],
		pendingImeis: pendingImeis || [],
		uploadFile,
		downloadTemplate,
		validateImei,
		deleteUpload,
		isLoading: uploadsLoading || imeisLoading,
		error: uploadsError || imeisError,
	};
};
