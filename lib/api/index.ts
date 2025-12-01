// Export shared utilities and types
export * from "./shared";

// Export auth APIs
export * from "./auth";

// Export users APIs
export * from "./users";

// Export products APIs
export * from "./products";

// Export repair partners APIs
export * from "./repair-partners";

// Export service centers APIs
export * from "./service-centers";

// Export engineers APIs
export * from "./engineers";

// Export IMEIs APIs
// Note: IMEI module also exports Product type, but products module is authoritative
export {
	type Imei,
	type ImeiUpload,
	type ValidateImeiDto,
	type ValidateImeiResponse,
	type GetImeisParams,
	type GetUploadsParams,
	type PaginatedImeiUploadsResponse,
	type PaginatedImeisResponse,
	uploadImeiCsv,
	getImeiUploads,
	getImeiUploadById,
	getAllImeis,
	validateImei,
	searchImei,
} from "./imeis";

// Export claims APIs
export * from "./claims";

// Export partners APIs
export * from "./partners";

// Export audit APIs
export * from "./audit";

// Export invitations APIs
export * from "./invitations";

// Export dashboard APIs - explicitly export to avoid duplicates with partners
export {
	getAdminStatistics,
	getRepairStoreDashboardStats,
	getServiceCenterDashboardStats,
	type AdminStatistics,
	type RepairStoreStatistics,
	type ServiceCenterStatistics,
} from "./dashboard";
