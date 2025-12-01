import { apiCall, BaseApiResponse, AuditAction } from "../shared";

// ============================================================================
// AUDIT APIs
// ============================================================================

// Types & Interfaces
export interface AuditLog {
	id: string;
	created_at: string;
	updated_at: string;
	resource_type: string;
	resource_id: string;
	action: string;
	old_values: any;
	new_values: any;
	ip_address?: string;
	user_agent?: string;
	performed_by_id: string;
	performed_at: string;
	performed_by?: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
}

export interface GetAuditLogsParams {
	resource_type?: string;
	resource_id?: string;
	action?: AuditAction;
	performed_by_id?: string;
	date_from?: string;
	date_to?: string;
	page?: number;
	limit?: number;
}

export interface AuditStatistics {
	total_logs: number;
	action_counts: Record<AuditAction, number>;
	most_active_users: Array<{
		user_id: string;
		user_name: string;
		action_count: number;
	}>;
	resource_type_counts: Record<string, number>;
}

// API Functions

/**
 * Get all audit logs
 * @summary Get all audit logs with filters. Admin only.
 * @tag Audit
 */
export async function getAllAuditLogs(
	params?: GetAuditLogsParams
): Promise<BaseApiResponse<AuditLog[]>> {
	const queryParams = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return apiCall(`/audit?${queryParams}`, "GET");
}

/**
 * Get audit statistics
 * @summary Get statistics about audit logs including action counts and most active users
 * @tag Audit
 */
export async function getAuditStatistics(
	start_date: string,
	end_date: string
): Promise<BaseApiResponse<AuditStatistics>> {
	return apiCall(
		`/audit/statistics?start_date=${start_date}&end_date=${end_date}`,
		"GET"
	);
}

/**
 * Get audit logs for specific resource
 * @summary Get all audit logs for a specific resource
 * @tag Audit
 */
export async function getAuditLogsByResource(
	type: string,
	id: string
): Promise<BaseApiResponse<AuditLog[]>> {
	return apiCall(`/audit/resource/${type}/${id}`, "GET");
}
