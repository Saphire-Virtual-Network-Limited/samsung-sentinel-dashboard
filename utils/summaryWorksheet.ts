import ExcelJS from "exceljs";

export function createSummaryWorksheet(
	wb: ExcelJS.Workbook,
	allAgentData: any[],
	commissionAgents: any[]
): void {
	console.log("Creating Summary worksheet...");

	const ws = wb.addWorksheet("Summary");
	ws.columns = [
		{ header: "Metric", key: "metric", width: 30 },
		{ header: "Count", key: "count", width: 15 },
	];

	// Calculate summary statistics using allAgentData
	const totalScanPartners = allAgentData.length;
	const activeScanPartners = allAgentData.filter(
		(sp: any) => sp.isActive
	).length;
	const inactiveScanPartners = totalScanPartners - activeScanPartners;

	let totalMBEAgents = 0;
	let activeMBEAgents = 0;
	let inactiveMBEAgents = 0;
	let pendingMBEAgents = 0;
	let approvedMBEAgents = 0;
	let verifiedMBEAgents = 0;
	let unverifiedMBEAgents = 0;
	let totalGuarantors = 0;
	let totalStores = 0;
	let agentsWithKYC = 0;
	let agentsWithBankDetails = 0;

	// Dynamic Location-based statistics
	const scanPartnersByState = new Map<string, number>();
	const scanPartnersByCity = new Map<string, number>();
	const agentsByState = new Map<string, number>();
	const agentsByCity = new Map<string, number>();

	allAgentData.forEach((scanPartnerData: any) => {
		const agents = scanPartnerData.agents || [];
		totalMBEAgents += agents.length;
		activeMBEAgents += agents.filter((agent: any) => agent.isActive).length;
		inactiveMBEAgents += agents.filter((agent: any) => !agent.isActive).length;
		pendingMBEAgents += agents.filter(
			(agent: any) => agent.accountStatus === "PENDING"
		).length;
		approvedMBEAgents += agents.filter(
			(agent: any) => agent.accountStatus === "APPROVED"
		).length;
		verifiedMBEAgents += agents.filter(
			(agent: any) =>
				agent.accountStatus === "VERIFIED" || agent.accountStatus === "APPROVED"
		).length;
		unverifiedMBEAgents += agents.filter(
			(agent: any) =>
				agent.accountStatus !== "VERIFIED" && agent.accountStatus !== "APPROVED"
		).length;

		// Dynamic location-based counting for scan partners
		const scanPartnerState = (scanPartnerData.companyState || "Unknown")
			.toLowerCase()
			.trim();
		const scanPartnerCity = (scanPartnerData.companyCity || "Unknown")
			.toLowerCase()
			.trim();

		// Count scan partners by state
		scanPartnersByState.set(
			scanPartnerState,
			(scanPartnersByState.get(scanPartnerState) || 0) + 1
		);

		// Count scan partners by city
		scanPartnersByCity.set(
			scanPartnerCity,
			(scanPartnersByCity.get(scanPartnerCity) || 0) + 1
		);

		agents.forEach((agent: any) => {
			totalGuarantors += (agent.MbeGuarantor || []).length;
			totalStores += agent.storesNew ? 1 : 0;
			if (agent.MbeKyc) agentsWithKYC++;
			if (agent.MbeAccountDetails) agentsWithBankDetails++;

			// Dynamic location-based counting for agents
			const agentState = (agent.MbeKyc?.state || agent.state || "Unknown")
				.toLowerCase()
				.trim();
			const agentCity = (agent.MbeKyc?.city || "Unknown").toLowerCase().trim();

			// Count agents by state
			agentsByState.set(agentState, (agentsByState.get(agentState) || 0) + 1);

			// Count agents by city
			agentsByCity.set(agentCity, (agentsByCity.get(agentCity) || 0) + 1);
		});
	});

	// Create dynamic summary data
	const summaryData = [
		{ metric: "=== GENERAL STATISTICS ===", count: "" },
		{ metric: "Total Scan Partners", count: totalScanPartners },
		{ metric: "Active Scan Partners", count: activeScanPartners },
		{ metric: "Inactive Scan Partners", count: inactiveScanPartners },
		{ metric: "Total MBE Agents", count: totalMBEAgents },
		{ metric: "Active Agents", count: activeMBEAgents },
		{ metric: "Inactive Agents", count: inactiveMBEAgents },
		{ metric: "Pending Agents", count: pendingMBEAgents },
		{ metric: "Approved Agents", count: approvedMBEAgents },
		{ metric: "Verified Agents", count: verifiedMBEAgents },
		{ metric: "Unverified Agents", count: unverifiedMBEAgents },
		{ metric: "Total Guarantors", count: totalGuarantors },
		{ metric: "Total Stores", count: totalStores },
		{ metric: "Agents with KYC", count: agentsWithKYC },
		{ metric: "Agents with Bank Details", count: agentsWithBankDetails },
		{ metric: "", count: "" },
		{ metric: "=== SCAN PARTNERS BY STATE ===", count: "" },
		...Array.from(scanPartnersByState.entries())
			.sort(([, a], [, b]) => b - a) // Sort by count descending
			.map(([state, count]) => ({
				metric: `Scan Partners in ${state
					.split(" ")
					.map(
						(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
					)
					.join(" ")}`,
				count,
			})),
		{ metric: "", count: "" },
		{ metric: "=== SCAN PARTNERS BY CITY ===", count: "" },
		...Array.from(scanPartnersByCity.entries())
			.sort(([, a], [, b]) => b - a) // Sort by count descending
			.filter(([city]) => city !== "unknown") // Filter out Unknown cities
			.slice(0, 10) // Show top 10 cities
			.map(([city, count]) => ({
				metric: `Scan Partners in ${city
					.split(" ")
					.map(
						(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
					)
					.join(" ")}`,
				count,
			})),
		{ metric: "", count: "" },
		{ metric: "=== AGENTS BY STATE ===", count: "" },
		...Array.from(agentsByState.entries())
			.sort(([, a], [, b]) => b - a) // Sort by count descending
			.map(([state, count]) => ({
				metric: `Agents in ${state
					.split(" ")
					.map(
						(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
					)
					.join(" ")}`,
				count,
			})),
		{ metric: "", count: "" },
		{ metric: "=== AGENTS BY CITY ===", count: "" },
		...Array.from(agentsByCity.entries())
			.sort(([, a], [, b]) => b - a) // Sort by count descending
			.filter(([city]) => city !== "unknown") // Filter out Unknown cities
			.slice(0, 15) // Show top 15 cities
			.map(([city, count]) => ({
				metric: `Agents in ${city
					.split(" ")
					.map(
						(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
					)
					.join(" ")}`,
				count,
			})),
	];

	summaryData.forEach((item) => {
		const row = ws.addRow(item);

		// Style section headers
		if (item.metric.includes("===")) {
			row.eachCell((cell) => {
				cell.font = { bold: true };
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFE6F3FF" },
				};
			});
		}
	});

	console.log("Summary worksheet created successfully");
}
