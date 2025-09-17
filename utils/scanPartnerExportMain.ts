import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	fetchExportData,
	createEnhancedImeiMapping,
	createFallbackExport,
	generateExportFilename,
	type ExportContext,
} from "./scanPartnerExportUtils";
import {
	createCommissionWorksheet,
	createMbeDetailsWorksheet,
	createScanPartnerSummaryWorksheet,
	createCustomerSalesWorksheet,
	createCommissionSummaryWorksheet,
	createAgentCommissionsWorksheet,
	createPartnerCommissionsWorksheet,
	createGuarantorsWorksheet,
	createLocationAnalysisWorksheet,
	createVerificationAnalysisWorksheet,
	createSalesReportSummaryWorksheet,
} from "./scanPartnerWorksheetGenerators";
import { createSummaryWorksheet } from "./summaryWorksheet";

/**
 * Main optimized export function with date range filtering and proper structure
 */
export async function exportScanPartnerData(
	data: any[],
	columns: any[],
	context: ExportContext
): Promise<void> {
	try {
		console.log(
			"Starting comprehensive scan partner export with context:",
			context
		);

		// Fetch all required data with date filtering
		const { allAgentData, salesData, allCommissionsData, customerRecords } =
			await fetchExportData(context);

		const commissionAgents = allCommissionsData.agents || [];

		// Create workbook
		const wb = new ExcelJS.Workbook();

		// Set workbook properties
		wb.creator = "Sapphire Finance";
		wb.lastModifiedBy = "System";
		wb.created = new Date();
		wb.modified = new Date();

		// Create enhanced IMEI mapping for customer details
		const enhancedImeiToCustomer = createEnhancedImeiMapping(customerRecords);

		console.log("Creating worksheets...");

		// 1. Commission Sheet - Most comprehensive data
		if (commissionAgents.length > 0) {
			createCommissionWorksheet(
				wb,
				commissionAgents,
				allAgentData,
				enhancedImeiToCustomer
			);
			console.log("✓ Commission worksheet created");
		}

		// 2. MBE Details Sheet - Including agents without partners
		if (allAgentData.length > 0 || commissionAgents.length > 0) {
			createMbeDetailsWorksheet(wb, allAgentData, commissionAgents);
			console.log("✓ MBE Details worksheet created");
		}

		// 3. Scan Partner Summary Sheet
		if (allAgentData.length > 0) {
			createScanPartnerSummaryWorksheet(wb, allAgentData);
			console.log("✓ Scan Partner Summary worksheet created");
		}

		// 4. Customer Sales Details Sheet
		if (customerRecords.length > 0) {
			createCustomerSalesWorksheet(wb, customerRecords, allAgentData);
			console.log("✓ Customer Sales Details worksheet created");
		}

		// 5. Commission Summary Sheet
		if (commissionAgents.length > 0) {
			createCommissionSummaryWorksheet(wb, commissionAgents, allAgentData);
			console.log("✓ Commission Summary worksheet created");
		}

		// 6. Agent Commissions Sheet
		if (commissionAgents.length > 0) {
			createAgentCommissionsWorksheet(wb, commissionAgents, allAgentData);
			console.log("✓ Agent Commissions worksheet created");
		}

		// 7. Partner Commissions Sheet
		if (commissionAgents.length > 0) {
			createPartnerCommissionsWorksheet(wb, commissionAgents, allAgentData);
			console.log("✓ Partner Commissions worksheet created");
		}

		// 8. Guarantors Sheet
		if (customerRecords.length > 0) {
			createGuarantorsWorksheet(wb, customerRecords, allAgentData);
			console.log("✓ Guarantors worksheet created");
		}

		// 9. Location Analysis Sheet
		if (customerRecords.length > 0) {
			createLocationAnalysisWorksheet(wb, customerRecords, allAgentData);
			console.log("✓ Location Analysis worksheet created");
		}

		// 10. Verification Analysis Sheet
		if (customerRecords.length > 0) {
			createVerificationAnalysisWorksheet(wb, customerRecords, allAgentData);
			console.log("✓ Verification Analysis worksheet created");
		}

		// 11. Sales Report Summary Sheet
		if (customerRecords.length > 0 && commissionAgents.length > 0) {
			createSalesReportSummaryWorksheet(
				wb,
				customerRecords,
				commissionAgents,
				allAgentData,
				salesData,
				"Current Export Period"
			);
			console.log("✓ Sales Report Summary worksheet created");
		}

		// 12. Summary Sheet (matches old export structure)
		if (allAgentData.length > 0) {
			createSummaryWorksheet(wb, allAgentData, commissionAgents);
			console.log("✓ Summary worksheet created");
		}

		// 13. Summary Statistics Sheet
		createSummaryStatisticsWorksheet(wb, {
			allAgentData,
			commissionAgents,
			customerRecords,
			context,
		});
		console.log("✓ Summary Statistics worksheet created");

		// 14. Sales Performance Sheet (if sales data available)
		if (salesData && salesData.partnerStats) {
			createSalesPerformanceWorksheet(wb, salesData, context);
			console.log("✓ Sales Performance worksheet created");
		}

		// Generate and save file
		const fileName = generateExportFilename(
			"Comprehensive_Scan_Partner_Report"
		);
		const buf = await wb.xlsx.writeBuffer();
		saveAs(new Blob([buf]), fileName);

		console.log(`✓ Export completed successfully: ${fileName}`);
	} catch (error) {
		console.error("Error creating comprehensive report:", error);

		// Fallback to simple export
		console.log("Attempting fallback export...");
		await createFallbackExport(data, columns);
	}
}

/**
 * Creates summary statistics worksheet
 */
function createSummaryStatisticsWorksheet(
	wb: ExcelJS.Workbook,
	data: {
		allAgentData: any[];
		commissionAgents: any[];
		customerRecords: any[];
		context: ExportContext;
	}
): void {
	const ws = wb.addWorksheet("Summary Statistics");

	ws.columns = [
		{ header: "Metric", key: "metric", width: 40 },
		{ header: "Count", key: "count", width: 20 },
		{ header: "Period", key: "period", width: 20 },
	];

	const { allAgentData, commissionAgents, customerRecords, context } = data;

	// Calculate statistics
	const totalScanPartners = allAgentData.length;
	const activeScanPartners = allAgentData.filter(
		(sp: any) => sp.isActive
	).length;

	let totalMBEAgents = 0;
	let activeMBEAgents = 0;
	let verifiedMBEAgents = 0;

	allAgentData.forEach((scanPartnerData: any) => {
		const agents = scanPartnerData.agents || [];
		totalMBEAgents += agents.length;
		activeMBEAgents += agents.filter((agent: any) => agent.isActive).length;
		verifiedMBEAgents += agents.filter(
			(agent: any) =>
				agent.accountStatus === "VERIFIED" || agent.accountStatus === "APPROVED"
		).length;
	});

	const totalCommissions = commissionAgents.reduce(
		(sum: number, agent: any) => sum + (agent.Commission || []).length,
		0
	);

	const totalCustomers = customerRecords.filter(
		(customer: any) => customer.LoanRecord?.[0]?.loanStatus === "APPROVED"
	).length;

	const period =
		context.startDate && context.endDate
			? `${context.startDate} to ${context.endDate}`
			: "All Time";

	// Summary data
	const summaryData = [
		{
			metric: "=== REPORTING PERIOD ===",
			count: period,
			period: context.salesPeriod,
		},
		{ metric: "", count: "", period: "" },
		{ metric: "=== SCAN PARTNER STATISTICS ===", count: "", period: "" },
		{ metric: "Total Scan Partners", count: totalScanPartners, period: period },
		{
			metric: "Active Scan Partners",
			count: activeScanPartners,
			period: period,
		},
		{
			metric: "Inactive Scan Partners",
			count: totalScanPartners - activeScanPartners,
			period: period,
		},
		{ metric: "", count: "", period: "" },
		{ metric: "=== AGENT STATISTICS ===", count: "", period: "" },
		{ metric: "Total MBE Agents", count: totalMBEAgents, period: period },
		{ metric: "Active Agents", count: activeMBEAgents, period: period },
		{
			metric: "Inactive Agents",
			count: totalMBEAgents - activeMBEAgents,
			period: period,
		},
		{ metric: "Verified Agents", count: verifiedMBEAgents, period: period },
		{
			metric: "Unverified Agents",
			count: totalMBEAgents - verifiedMBEAgents,
			period: period,
		},
		{ metric: "", count: "", period: "" },
		{ metric: "=== BUSINESS METRICS ===", count: "", period: "" },
		{
			metric: "Total Commission Records",
			count: totalCommissions,
			period: period,
		},
		{
			metric: "Total Approved Customers",
			count: totalCustomers,
			period: period,
		},
		{
			metric: "Agents without Partners",
			count: commissionAgents.length - totalMBEAgents,
			period: period,
		},
	];

	// Add location-based statistics
	const locationStats = calculateLocationStatistics(allAgentData);
	summaryData.push(
		{ metric: "", count: "", period: "" },
		{ metric: "=== TOP 5 STATES BY AGENTS ===", count: "", period: "" }
	);

	locationStats.topStatesByAgents.slice(0, 5).forEach(([state, count]) => {
		summaryData.push({
			metric: `Agents in ${state}`,
			count: count,
			period: period,
		});
	});

	// Add data to worksheet
	summaryData.forEach((item, index) => {
		const row = ws.addRow(item);

		// Style headers
		if (item.metric.includes("===")) {
			row.eachCell((cell) => {
				cell.font = { bold: true, color: { argb: "FF0066CC" } };
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFE6F3FF" },
				};
			});
		}
	});

	// Style header row
	ws.getRow(1).font = { bold: true };
	ws.getRow(1).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFD3D3D3" },
	};
}

/**
 * Creates sales performance worksheet
 */
function createSalesPerformanceWorksheet(
	wb: ExcelJS.Workbook,
	salesData: any,
	context: ExportContext
): void {
	const ws = wb.addWorksheet("Sales Performance");

	ws.columns = [
		{ header: "S/N", key: "sn", width: 8 },
		{ header: "Partner ID", key: "partnerId", width: 25 },
		{ header: "Partner Name", key: "partnerName", width: 30 },
		{ header: "Total Commission", key: "totalCommission", width: 20 },
		{ header: "Agent Commission", key: "agentCommission", width: 20 },
		{ header: "Partner Commission", key: "partnerCommission", width: 20 },
		{ header: "Commission Count", key: "commissionCount", width: 18 },
		{ header: "Agent Count", key: "agentCount", width: 15 },
		{ header: "Period", key: "period", width: 15 },
	];

	// Add partner performance data
	salesData.partnerStats.forEach((partner: any, index: number) => {
		const rowData = {
			sn: index + 1,
			partnerId: partner.partnerId,
			partnerName: partner.partnerName,
			totalCommission: partner.totalCommission || 0,
			agentCommission: partner.totalAgentCommission || 0,
			partnerCommission: partner.totalPartnerCommission || 0,
			commissionCount: partner.commissionCount || 0,
			agentCount: partner.agentCount || 0,
			period: salesData.period || context.salesPeriod,
		};

		const row = ws.addRow(rowData);

		// Apply light blue background
		row.eachCell((cell) => {
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFE6F3FF" },
			};
		});
	});

	// Add summary row
	if (salesData.summary) {
		const summaryRow = ws.addRow({
			sn: "",
			partnerId: "TOTAL",
			partnerName: "SUMMARY ACROSS ALL PARTNERS",
			totalCommission: salesData.summary.grandTotalCommission || 0,
			agentCommission: salesData.summary.grandTotalAgentCommission || 0,
			partnerCommission: salesData.summary.grandTotalPartnerCommission || 0,
			commissionCount: salesData.summary.totalCommissions || 0,
			agentCount: salesData.summary.totalAgents || 0,
			period: salesData.period || context.salesPeriod,
		});

		// Style summary row
		summaryRow.eachCell((cell) => {
			cell.font = { bold: true };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFFFD700" }, // Gold
			};
		});
	}

	// Style header and add autofilter
	ws.getRow(1).font = { bold: true };
	ws.getRow(1).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFD3D3D3" },
	};

	ws.autoFilter = {
		from: { row: 1, column: 1 },
		to: {
			row: salesData.partnerStats.length + 2,
			column: ws.columns.length,
		},
	};
}

/**
 * Calculates location-based statistics
 */
function calculateLocationStatistics(allAgentData: any[]) {
	const agentsByState = new Map<string, number>();
	const scanPartnersByState = new Map<string, number>();

	allAgentData.forEach((scanPartnerData: any) => {
		// Count scan partners by state
		const spState = (scanPartnerData.companyState || "Unknown")
			.toLowerCase()
			.trim();
		scanPartnersByState.set(
			spState,
			(scanPartnersByState.get(spState) || 0) + 1
		);

		// Count agents by state
		(scanPartnerData.agents || []).forEach((agent: any) => {
			const agentState = (agent.MbeKyc?.state || agent.state || "Unknown")
				.toLowerCase()
				.trim();
			agentsByState.set(agentState, (agentsByState.get(agentState) || 0) + 1);
		});
	});

	return {
		topStatesByAgents: Array.from(agentsByState.entries())
			.sort(([, a], [, b]) => b - a)
			.map(([state, count]) => [
				state
					.split(" ")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
				count,
			]),
		topStatesByScanPartners: Array.from(scanPartnersByState.entries())
			.sort(([, a], [, b]) => b - a)
			.map(([state, count]) => [
				state
					.split(" ")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
				count,
			]),
	};
}
