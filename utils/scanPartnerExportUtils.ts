import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	getAllScanPartners,
	getScanPartnerAgents,
	getMobiflexPartnerStats,
	getAllCustomerRecord,
	getAllAgentsLoansAndCommissions,
	getAllAgentRecord,
	capitalize,
	calculateAge,
} from "@/lib";

// Types for better type safety
export interface ExportContext {
	startDate?: string;
	endDate?: string;
	salesPeriod: "daily" | "weekly" | "monthly" | "yearly" | "mtd";
}

export interface ProcessedAgentData {
	scanPartnerData: any;
	agentInfo: any;
	color: string;
}

export interface EnhancedCustomerData {
	customerId: string;
	customerName: string;
	customerPhone: string;
	deviceName: string;
	devicePrice: number;
	loanAmount: number;
	downPayment: number;
	monthlyPayment: number;
	duration: number;
	deviceStatus: string;
}

// Color palette for scan partners
const SCAN_PARTNER_COLORS = [
	"FFFFE0E0", // Light Red
	"FFE0F0E0", // Light Green
	"FFE0E0FF", // Light Blue
	"FFFFF0E0", // Light Orange
	"FFE0FFFF", // Light Cyan
	"FFFFE0FF", // Light Magenta
	"FFFFF0FF", // Light Pink
	"FFE0FFE0", // Light Lime
	"FFFFE0E0", // Light Coral
	"FFE0E0E0", // Light Gray
];

/**
 * Creates a color mapping for scan partners
 */
export function createScanPartnerColorMap(
	allAgentData: any[]
): Map<string, string> {
	const colorMap = new Map<string, string>();
	if (Array.isArray(allAgentData)) {
		allAgentData.forEach((scanPartnerData: any, index: number) => {
			if (scanPartnerData && scanPartnerData.userId) {
				colorMap.set(
					scanPartnerData.userId,
					SCAN_PARTNER_COLORS[index % SCAN_PARTNER_COLORS.length]
				);
			}
		});
	}
	return colorMap;
}

/**
 * Fetches all required data for export with proper date filtering
 */
export async function fetchExportData(context: ExportContext) {
	try {
		console.log("Fetching export data with context:", context);

		// Fetch data with date filtering where supported
		const [
			agentsResponse,
			allScanPartnersResponse,
			allMbeAgentsResponse,
			salesDataResponse,
			allCommissionsResponse,
			customerRecordsResponse,
		] = await Promise.all([
			getScanPartnerAgents(),
			getAllScanPartners(), // Get ALL scan partners (including those without agents)
			getAllAgentRecord(context.startDate, context.endDate), // Get ALL MBE agents
			getMobiflexPartnerStats(
				context.salesPeriod,
				context.startDate,
				context.endDate
			),
			getAllAgentsLoansAndCommissions({
				startDate: context.startDate,
				endDate: context.endDate,
			}),
			getAllCustomerRecord(context.startDate, context.endDate),
		]);

		// Safely extract arrays from API responses with proper type checking
		const scanPartnersWithAgents = Array.isArray(agentsResponse?.data)
			? agentsResponse.data
			: [];
		const allScanPartners = Array.isArray(allScanPartnersResponse?.data)
			? allScanPartnersResponse.data
			: [];
		const allMbeAgents = Array.isArray(allMbeAgentsResponse?.data)
			? allMbeAgentsResponse.data
			: [];
		const commissionAgents = Array.isArray(allCommissionsResponse?.data?.agents)
			? allCommissionsResponse.data.agents
			: [];
		const customerRecords = Array.isArray(customerRecordsResponse?.data)
			? customerRecordsResponse.data
			: [];

		console.log("Data extraction completed:", {
			scanPartnersWithAgents: scanPartnersWithAgents.length,
			allScanPartners: allScanPartners.length,
			allMbeAgents: allMbeAgents.length,
			commissionAgents: commissionAgents.length,
			customerRecords: customerRecords.length,
		});

		// Create a comprehensive list ensuring all partners are included
		const scanPartnerMap = new Map();

		// First, add all partners with agents (they have the agent data)
		scanPartnersWithAgents.forEach((partner: any) => {
			if (partner && partner.userId) {
				scanPartnerMap.set(partner.userId, partner);
			}
		});

		// Then, add any partners without agents (they won't have agent data but should still be shown)
		allScanPartners.forEach((partner: any) => {
			if (partner && partner.userId && !scanPartnerMap.has(partner.userId)) {
				scanPartnerMap.set(partner.userId, {
					...partner,
					agents: [], // Empty agents array for partners without agents
				});
			}
		});

		// Create comprehensive agents list by combining all sources
		const allAgentsMap = new Map();

		// Add commission agents (these have commission data)
		commissionAgents.forEach((agent: any) => {
			if (agent && agent.mbeId) {
				allAgentsMap.set(agent.mbeId, agent);
			}
		});

		// Add all MBE agents (may include agents without commissions)
		allMbeAgents.forEach((agent: any) => {
			if (agent && agent.mbeId && !allAgentsMap.has(agent.mbeId)) {
				allAgentsMap.set(agent.mbeId, agent);
			}
		});

		return {
			allAgentData: Array.from(scanPartnerMap.values()),
			salesData: salesDataResponse?.data || null,
			allCommissionsData: {
				...allCommissionsResponse?.data,
				agents: Array.from(allAgentsMap.values()), // Comprehensive agents list
			},
			customerRecords: customerRecords,
		};
	} catch (error) {
		console.error("Error fetching export data:", error);
		throw error;
	}
}

/**
 * Creates enhanced IMEI to customer mapping
 */
export function createEnhancedImeiMapping(
	customerRecords: any[]
): Map<string, EnhancedCustomerData> {
	const enhancedImeiToCustomer = new Map<string, EnhancedCustomerData>();

	if (!Array.isArray(customerRecords)) {
		return enhancedImeiToCustomer;
	}

	for (const customer of customerRecords) {
		const loanRecord = customer.LoanRecord?.[0];
		const deviceOnLoan = loanRecord?.DeviceOnLoan?.[0];
		const imei = deviceOnLoan?.imei;

		if (imei) {
			enhancedImeiToCustomer.set(imei, {
				customerId: customer.customerId,
				customerName:
					customer.firstName && customer.lastName
						? `${customer.firstName} ${customer.lastName}`
						: "N/A",
				customerPhone:
					customer.bvnPhoneNumber || customer.mainPhoneNumber || "N/A",
				deviceName:
					loanRecord?.deviceName || deviceOnLoan?.device?.deviceName || "N/A",
				devicePrice:
					loanRecord?.devicePrice || deviceOnLoan?.device?.price || 0,
				loanAmount: loanRecord?.loanAmount || 0,
				downPayment: loanRecord?.downPayment || 0,
				monthlyPayment: loanRecord?.monthlyRepayment || 0,
				duration: loanRecord?.duration || 0,
				deviceStatus: deviceOnLoan?.status || "N/A",
			});
		}
	}

	return enhancedImeiToCustomer;
}

/**
 * Finds scan partner data for an agent
 */
export function findScanPartnerForAgent(
	allAgentData: any[],
	mbeId: string
): ProcessedAgentData | null {
	for (const scanPartnerData of allAgentData) {
		if (scanPartnerData.agents?.some((a: any) => a.mbeId === mbeId)) {
			const agentInfo = scanPartnerData.agents.find(
				(a: any) => a.mbeId === mbeId
			);
			const colorMap = createScanPartnerColorMap(allAgentData);
			const color = colorMap.get(scanPartnerData.userId) || "FFFFFF";

			return {
				scanPartnerData,
				agentInfo,
				color,
			};
		}
	}
	return null;
}

/**
 * Gets all agents without partners (for inclusion in MBE Details)
 */
export function getAgentsWithoutPartners(
	commissionAgents: any[],
	allAgentData: any[]
): any[] {
	const agentsWithPartners = new Set<string>();

	// Collect all agent IDs that have partners (safe array handling)
	if (Array.isArray(allAgentData)) {
		allAgentData.forEach((scanPartnerData: any) => {
			if (scanPartnerData && Array.isArray(scanPartnerData.agents)) {
				scanPartnerData.agents.forEach((agent: any) => {
					if (agent && agent.mbeId) {
						agentsWithPartners.add(agent.mbeId);
					}
				});
			}
		});
	}

	// Return agents that don't have partners (safe array handling)
	if (!Array.isArray(commissionAgents)) {
		return [];
	}

	return commissionAgents.filter(
		(agent: any) => agent && agent.mbeId && !agentsWithPartners.has(agent.mbeId)
	);
}

/**
 * Formats date values consistently
 */
export function formatDateValue(dateValue: any): Date | string {
	if (!dateValue) return "N/A";

	try {
		const date = new Date(dateValue);
		return isNaN(date.getTime()) ? "N/A" : date;
	} catch {
		return "N/A";
	}
}

/**
 * Formats currency values consistently
 */
export function formatCurrency(value: number | string): string {
	if (!value || value === 0) return "N/A";
	const numValue = typeof value === "string" ? parseFloat(value) : value;
	return numValue > 0 ? numValue.toLocaleString("en-GB") : "N/A";
}

/**
 * Applies consistent cell styling
 */
export function applyCellStyle(
	row: ExcelJS.Row,
	color?: string,
	isHeader = false
) {
	if (isHeader) {
		row.font = { bold: true, size: 11 };
		row.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD3D3D3" },
		};
	} else if (color) {
		row.eachCell((cell) => {
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: color },
			};
		});
	}
}

/**
 * Gets all partners without agents (for inclusion in partner listings)
 */
export function getPartnersWithoutAgents(allAgentData: any[]): any[] {
	return allAgentData.filter((scanPartnerData: any) => {
		const agents = scanPartnerData.agents || [];
		return agents.length === 0;
	});
}

/**
 * Gets comprehensive agent list including all possible sources
 */
export async function getAllAgentsComprehensive(
	commissionAgents: any[],
	allAgentData: any[]
): Promise<any[]> {
	const allAgents = new Map<string, any>();

	// Add agents from scan partner data
	allAgentData.forEach((scanPartnerData: any) => {
		(scanPartnerData.agents || []).forEach((agent: any) => {
			allAgents.set(agent.mbeId, {
				...agent,
				hasPartner: true,
				partnerInfo: scanPartnerData,
			});
		});
	});

	// Add commission agents (may include agents not in scan partner data)
	commissionAgents.forEach((agent: any) => {
		if (!allAgents.has(agent.mbeId)) {
			allAgents.set(agent.mbeId, {
				...agent,
				hasPartner: false,
				partnerInfo: null,
			});
		}
	});

	return Array.from(allAgents.values());
}

/**
 * Sets date column types for better filtering and sorting
 */
export function setDateColumnTypes(
	row: ExcelJS.Row,
	rowData: any,
	dateColumns: string[]
) {
	dateColumns.forEach((columnKey) => {
		if (rowData[columnKey] instanceof Date) {
			row.getCell(columnKey).value = rowData[columnKey];
			row.getCell(columnKey).numFmt = "dd/mm/yyyy";
		}
	});
}

/**
 * Adds autofilter to worksheet
 */
export function addAutofilter(worksheet: ExcelJS.Worksheet, rowCount: number) {
	if (rowCount > 1) {
		worksheet.autoFilter = {
			from: { row: 1, column: 1 },
			to: { row: rowCount, column: worksheet.columns.length },
		};
	}
}

/**
 * Creates a fallback simple export when comprehensive export fails
 */
export async function createFallbackExport(data: any[], columns: any[]) {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet("Scan Partners");

	ws.columns = columns
		.filter((c) => c.uid !== "actions")
		.map((c) => ({ header: c.name, key: c.uid, width: 20 }));

	data.forEach((r) =>
		ws.addRow({
			...r,
			accountStatus: capitalize(r.accountStatus || ""),
			isActive: r.isActive ? "Yes" : "No",
			createdAt: formatDateValue(r.createdAt),
		})
	);

	const buf = await wb.xlsx.writeBuffer();
	saveAs(new Blob([buf]), "Scan_Partner_Records.xlsx");
}

/**
 * Generates worksheet name with date range and generation time
 */
export function generateWorksheetName(
	baseName: string,
	context: ExportContext
): string {
	const now = new Date();
	const generatedTime = now.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	let dateRange = "";
	if (context.startDate && context.endDate) {
		const start = new Date(context.startDate).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		});
		const end = new Date(context.endDate).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		});
		dateRange = ` (${start} - ${end})`;
	} else if (context.salesPeriod) {
		dateRange = ` (${context.salesPeriod.toUpperCase()})`;
	}

	return `${baseName}${dateRange} - Generated ${generatedTime}`;
}

/**
 * Generates filename with timestamp
 */
export function generateExportFilename(baseName: string): string {
	const date = new Date().toISOString().split("T")[0];
	return `${baseName}_${date}.xlsx`;
}
