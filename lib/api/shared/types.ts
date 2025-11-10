// ============================================================================
// API Configuration & Options
// ============================================================================

export interface ApiCallOptions {
	cache?: RequestCache;
	revalidate?: number;
	appKey?: string;
	useCache?: boolean;
	cacheTTL?: number;
}

export interface BaseApiResponse<T = any> {
	statusCode: number;
	statusType: string;
	message: string;
	data: T;
	responseTime: string;
	channel: string;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// ============================================================================
// Common Enums
// ============================================================================

export enum UserRole {
	ADMIN = "admin",
	REPAIR_STORE_ADMIN = "repair_store_admin",
	SERVICE_CENTER_ADMIN = "service_center_admin",
	ENGINEER = "engineer",
	SAMSUNG_PARTNER = "samsung_partner",
	FINANCE = "finance",
	AUDITOR = "auditor",
}

export enum UserStatus {
	ACTIVE = "ACTIVE",
	SUSPENDED = "SUSPENDED",
	DISABLED = "DISABLED",
}

export enum ProductStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
}

export enum ClaimStatus {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
	COMPLETED = "COMPLETED",
	AUTHORIZED = "AUTHORIZED",
}

export enum PaymentStatus {
	UNPAID = "UNPAID",
	PAID = "PAID",
}

export enum AuditAction {
	USER_CREATED = "user_created",
	USER_UPDATED = "user_updated",
	USER_DELETED = "user_deleted",
	USER_LOGIN = "user_login",
	USER_LOGOUT = "user_logout",
	PASSWORD_CHANGED = "password_changed",
	REPAIR_STORE_CREATED = "repair_store_created",
	REPAIR_STORE_UPDATED = "repair_store_updated",
	REPAIR_STORE_ACTIVATED = "repair_store_activated",
	REPAIR_STORE_DEACTIVATED = "repair_store_deactivated",
	SERVICE_CENTER_CREATED = "service_center_created",
	SERVICE_CENTER_UPDATED = "service_center_updated",
	SERVICE_CENTER_ACTIVATED = "service_center_activated",
	SERVICE_CENTER_DEACTIVATED = "service_center_deactivated",
	ENGINEER_CREATED = "engineer_created",
	ENGINEER_UPDATED = "engineer_updated",
	ENGINEER_DELETED = "engineer_deleted",
	PARTNER_CREATED = "partner_created",
	PARTNER_UPDATED = "partner_updated",
	PARTNER_DELETED = "partner_deleted",
	PRODUCT_CREATED = "product_created",
	PRODUCT_UPDATED = "product_updated",
	PRODUCT_ACTIVATED = "product_activated",
	PRODUCT_DEACTIVATED = "product_deactivated",
	PRODUCT_DELETED = "product_deleted",
	IMEI_UPLOADED = "imei_uploaded",
	IMEI_VALIDATED = "imei_validated",
	IMEI_USED = "imei_used",
	CLAIM_CREATED = "claim_created",
	CLAIM_UPDATED = "claim_updated",
	CLAIM_APPROVED = "claim_approved",
	CLAIM_REJECTED = "claim_rejected",
	CLAIM_COMPLETED = "claim_completed",
	CLAIM_AUTHORIZED = "claim_authorized",
	CLAIM_PAID = "claim_paid",
	INVITATION_SENT = "invitation_sent",
	INVITATION_RESENT = "invitation_resent",
	INVITATION_ACCEPTED = "invitation_accepted",
}
