import ExcelJS from "exceljs";
import {
	formatDateValue,
	formatCurrency,
	applyCellStyle,
	addAutofilter,
	setDateColumnTypes,
	createScanPartnerColorMap,
	findScanPartnerForAgent,
	createEnhancedImeiMapping,
	getAgentsWithoutPartners,
} from "./scanPartnerExportUtils";

/**
 * Creates comprehensive commission worksheet
 */
export function createCommissionWorksheet(
	wb: ExcelJS.Workbook,
	commissionAgents: any[],
	allAgentData: any[],
	enhancedImeiToCustomer: Map<string, any>
): void {
	const ws = wb.addWorksheet("Commissions");
	const colorMap = createScanPartnerColorMap(allAgentData);

	// Define columns with proper date types
	ws.columns = [
		{ header: "S/N", key: "sn", width: 8 },
		{ header: "Scan Partner Company", key: "scanPartnerCompany", width: 25 },
		{ header: "Scan Partner Name", key: "scanPartnerName", width: 25 },
		{ header: "Scan Partner User ID", key: "scanPartnerUserId", width: 25 },
		{ header: "Scan Partner Phone", key: "scanPartnerPhone", width: 20 },
		{ header: "Agent Name", key: "agentName", width: 25 },
		{ header: "Agent MBE ID", key: "mbeId", width: 20 },
		{ header: "Agent Email", key: "agentEmail", width: 30 },
		{ header: "Agent Phone", key: "agentPhone", width: 20 },
		{ header: "Agent Status", key: "agentStatus", width: 15 },
		{ header: "Device Name", key: "deviceName", width: 25 },
		{ header: "IMEI", key: "imei", width: 18 },
		{ header: "Device Price", key: "devicePrice", width: 15 },
		{ header: "Loan Amount", key: "loanAmount", width: 15 },
		{ header: "Customer Name", key: "customerName", width: 25 },
		{ header: "Customer Phone", key: "customerPhone", width: 20 },
		{ header: "Total Commission", key: "totalCommission", width: 18 },
		{ header: "Agent Commission", key: "agentCommission", width: 18 },
		{ header: "Partner Commission", key: "partnerCommission", width: 18 },
		{ header: "Payment Status", key: "paymentStatus", width: 15 },
		{ header: "Commission Date", key: "commissionDate", width: 18 },
		{ header: "Last Updated", key: "lastUpdated", width: 18 },
	];

	let rowIndex = 1;

	// Process commission data (safe array handling)
	if (Array.isArray(commissionAgents)) {
		commissionAgents.forEach((agent: any) => {
			if (!agent) return;
			
			const scanPartnerInfo = findScanPartnerForAgent(allAgentData, agent.mbeId);
			const scanPartner = scanPartnerInfo?.scanPartnerData || {};
			const color = scanPartnerInfo?.color;

			const commissions = Array.isArray(agent.Commission) ? agent.Commission : [];
			commissions.forEach((commission: any) => {
				if (!commission) return;
			// Get device and customer details
			let deviceDetails = null;
			let customerDetails = null;
			let imei = "N/A";

			if (commission.devicesOnLoan) {
				const deviceOnLoan = commission.devicesOnLoan;
				imei = deviceOnLoan.imei || "N/A";
				deviceDetails = {
					deviceName: deviceOnLoan.device?.deviceName || "N/A",
					devicePrice:
						deviceOnLoan.device?.price || deviceOnLoan.devicePrice || 0,
				};
			}

			if (imei && enhancedImeiToCustomer.has(imei)) {
				customerDetails = enhancedImeiToCustomer.get(imei);
			}

			const rowData = {
				sn: rowIndex++,
				scanPartnerCompany: scanPartner?.companyName || "N/A",
				scanPartnerName:
					scanPartner?.firstName && scanPartner?.lastName
						? `${scanPartner.firstName} ${scanPartner.lastName}`
						: "N/A",
				scanPartnerUserId: scanPartner?.userId || "N/A",
				scanPartnerPhone: scanPartner?.telephoneNumber || "N/A",
				agentName: `${agent.firstname || ""} ${agent.lastname || ""}`.trim(),
				mbeId: agent.mbeId || "N/A",
				agentEmail: agent.email || "N/A",
				agentPhone: agent.phone || "N/A",
				agentStatus: agent.accountStatus || "N/A",
				deviceName:
					deviceDetails?.deviceName || customerDetails?.deviceName || "N/A",
				imei: imei,
				devicePrice: formatCurrency(
					deviceDetails?.devicePrice || customerDetails?.devicePrice || 0
				),
				loanAmount: formatCurrency(customerDetails?.loanAmount || 0),
				customerName: customerDetails?.customerName || "N/A",
				customerPhone: customerDetails?.customerPhone || "N/A",
				totalCommission: formatCurrency(commission.commission || 0),
				agentCommission: formatCurrency(commission.mbeCommission || 0),
				partnerCommission: formatCurrency(commission.partnerCommission || 0),
				paymentStatus: commission.paymentStatus || "N/A",
				commissionDate: formatDateValue(commission.date_created),
				lastUpdated: formatDateValue(commission.updated_at),
			};

			const row = ws.addRow(rowData);

			// Set date column types
			setDateColumnTypes(row, rowData, ["commissionDate", "lastUpdated"]);

			applyCellStyle(row, color);

			// Apply conditional formatting for payment status
			const paymentStatusCell = row.getCell("paymentStatus");
			if (commission.paymentStatus === "PAID") {
				paymentStatusCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FF90EE90" }, // Light green
				};
			} else if (commission.paymentStatus === "UNPAID") {
				paymentStatusCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFFFCCCB" }, // Light red
				};
			}
			});
		});
	}

	// Style header and add autofilter
	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, rowIndex);
}

/**
 * Creates MBE details worksheet with agents without partners
 */
export function createMbeDetailsWorksheet(
	wb: ExcelJS.Workbook,
	allAgentData: any[],
	commissionAgents: any[]
): void {
	const ws = wb.addWorksheet("MBE Details");
	const colorMap = createScanPartnerColorMap(allAgentData);

	ws.columns = [
		{ header: "S/N", key: "sn", width: 8 },
		{ header: "Scan Partner Company", key: "scanPartnerCompany", width: 25 },
		{ header: "Scan Partner User ID", key: "scanPartnerUserId", width: 25 },
		{ header: "MBE ID", key: "mbeId", width: 20 },
		{ header: "Full Name", key: "fullName", width: 20 },
		{ header: "Email", key: "email", width: 30 },
		{ header: "Phone", key: "phone", width: 20 },
		{ header: "State", key: "state", width: 15 },
		{ header: "Account Status", key: "accountStatus", width: 15 },
		{ header: "Is Active", key: "isActive", width: 12 },
		{ header: "Date of Birth", key: "dob", width: 15 },
		{ header: "Created At", key: "createdAt", width: 20 },
		{ header: "Updated At", key: "updatedAt", width: 20 },
		{ header: "City", key: "city", width: 15 },
		{ header: "Account Name", key: "accountName", width: 25 },
		{ header: "Account Number", key: "accountNumber", width: 20 },
		{ header: "Bank Name", key: "bankName", width: 25 },
	];

	let rowIndex = 1;
	const processedAgents = new Set<string>(); // Track processed agent IDs

	// Process agents with partners first (safe array handling)
	if (Array.isArray(allAgentData)) {
		for (const scanPartnerData of allAgentData) {
			if (!scanPartnerData) continue;
			
			const agents = Array.isArray(scanPartnerData.agents) ? scanPartnerData.agents : [];
			const color = colorMap.get(scanPartnerData.userId);

			for (const agent of agents) {
				if (!agent) continue;
				
				if (!processedAgents.has(agent.mbeId)) {
					const rowData = {
						sn: rowIndex++,
						scanPartnerCompany: scanPartnerData.companyName || "N/A",
						scanPartnerUserId: scanPartnerData.userId || "N/A",
						mbeId: agent.mbeId,
						fullName:
							`${agent?.firstname || ""} ${agent?.lastname || ""}`.trim() ||
							"N/A",
						email: agent.email || "N/A",
						phone: agent.phone || "N/A",
						state: agent.state || agent.MbeKyc?.state || "N/A",
						accountStatus: agent.accountStatus || "N/A",
						isActive: agent.isActive ? "Yes" : "No",
						dob: formatDateValue(agent.dob),
						createdAt: formatDateValue(agent.createdAt),
						updatedAt: formatDateValue(agent.updatedAt),
						city: agent.MbeKyc?.city || agent.city || "N/A",
						accountName:
							agent.MbeBank?.[0]?.accountName ||
							agent.MbeAccountDetails?.accountName ||
							"N/A",
						accountNumber:
							agent.MbeBank?.[0]?.accountNumber ||
							agent.MbeAccountDetails?.accountNumber ||
							"N/A",
						bankName:
							agent.MbeBank?.[0]?.bankName ||
							agent.MbeAccountDetails?.bankName ||
							"N/A",
					};

					const row = ws.addRow(rowData);

					// Set date column types
					setDateColumnTypes(row, rowData, ["dob", "createdAt", "updatedAt"]);

					applyCellStyle(row, color);
					processedAgents.add(agent.mbeId);
				}
			}
		}
	}

	// Process ALL commission agents (including those without partners)
	if (Array.isArray(commissionAgents)) {
		for (const agent of commissionAgents) {
			if (!agent) continue;
			
			if (!processedAgents.has(agent.mbeId)) {
				const rowData = {
					sn: rowIndex++,
					scanPartnerCompany: "N/A",
					scanPartnerUserId: "N/A",
					mbeId: agent.mbeId,
					fullName:
						`${agent?.firstname || ""} ${agent?.lastname || ""}`.trim() || "N/A",
					email: agent.email || "N/A",
					phone: agent.phone || "N/A",
					state: agent.state || agent.MbeKyc?.state || "N/A",
					accountStatus: agent.accountStatus || "N/A",
					isActive: agent.isActive ? "Yes" : "No",
					dob: formatDateValue(agent.dob),
					createdAt: formatDateValue(agent.createdAt),
					updatedAt: formatDateValue(agent.updatedAt),
					city: agent.MbeKyc?.city || agent.city || "N/A",
					accountName:
						agent.MbeBank?.[0]?.accountName ||
						agent.MbeAccountDetails?.accountName ||
						"N/A",
					accountNumber:
						agent.MbeBank?.[0]?.accountNumber ||
						agent.MbeAccountDetails?.accountNumber ||
						"N/A",
					bankName:
						agent.MbeBank?.[0]?.bankName ||
						agent.MbeAccountDetails?.bankName ||
						"N/A",
				};

				const row = ws.addRow(rowData);

				// Set date column types
				setDateColumnTypes(row, rowData, ["dob", "createdAt", "updatedAt"]);

				// Highlight agents without partners in light gray
				applyCellStyle(row, "FFF0F0F0");
				processedAgents.add(agent.mbeId);
			}
		}
	}

	// Style header and add autofilter
	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, rowIndex);
}/**
 * Creates scan partner summary worksheet
 */
export function createScanPartnerSummaryWorksheet(
	wb: ExcelJS.Workbook,
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Scan Partners Summary");
	const colorMap = createScanPartnerColorMap(allAgentData);

	ws.columns = [
		{ header: "S/N", key: "sn", width: 8 },
		{ header: "User ID", key: "userId", width: 25 },
		{ header: "Company Name", key: "companyName", width: 25 },
		{ header: "Full Name", key: "fullName", width: 25 },
		{ header: "Email", key: "email", width: 30 },
		{ header: "Phone", key: "telephoneNumber", width: 20 },
		{ header: "Company Address", key: "companyAddress", width: 40 },
		{ header: "Company State", key: "companyState", width: 20 },
		{ header: "Company City", key: "companyCity", width: 20 },
		{ header: "Account Status", key: "accountStatus", width: 15 },
		{ header: "Is Active", key: "isActive", width: 12 },
		{ header: "Total Agents", key: "totalAgents", width: 15 },
		{ header: "Active Agents", key: "activeAgents", width: 15 },
		{ header: "Created At", key: "createdAt", width: 20 },
	];

	allAgentData.forEach((scanPartnerData: any, index: number) => {
		const agents = scanPartnerData.agents || [];
		const totalAgents = agents.length;
		const activeAgents = agents.filter((agent: any) => agent.isActive).length;

		const rowData = {
			sn: index + 1,
			userId: scanPartnerData.userId,
			companyName: scanPartnerData.companyName,
			fullName: `${scanPartnerData.firstName || ""} ${
				scanPartnerData.lastName || ""
			}`.trim(),
			email: scanPartnerData.email,
			telephoneNumber: scanPartnerData.telephoneNumber,
			companyAddress: scanPartnerData.companyAddress || "N/A",
			companyState: scanPartnerData.companyState || "N/A",
			companyCity: scanPartnerData.companyCity || "N/A",
			accountStatus: scanPartnerData.accountStatus || "N/A",
			isActive: scanPartnerData.isActive ? "Yes" : "No",
			totalAgents,
			activeAgents,
			createdAt: formatDateValue(scanPartnerData.createdAt),
		};

		const row = ws.addRow(rowData);

		// Set date column types
		setDateColumnTypes(row, rowData, ["createdAt"]);

		const color = colorMap.get(scanPartnerData.userId);
		applyCellStyle(row, color);
	});

	// Style header and add autofilter
	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, allAgentData.length + 1);
}

/**
 * Creates customer sales details worksheet
 */
export function createCustomerSalesWorksheet(
	wb: ExcelJS.Workbook,
	customerRecords: any[],
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Customer Sales Details");
	const colorMap = createScanPartnerColorMap(allAgentData);

	ws.columns = [
		{ header: "Customer Id", key: "customerId", width: 20 },
		{ header: "Loan ID", key: "loanRecordId", width: 20 },
		{ header: "Name", key: "fullName", width: 25 },
		{ header: "Phone No.", key: "bvnPhoneNumber", width: 20 },
		{ header: "Email", key: "email", width: 30 },
		{ header: "Age", key: "age", width: 10 },
		{ header: "City", key: "city", width: 20 },
		{ header: "State", key: "customerState", width: 20 },
		{ header: "Device Name", key: "deviceName", width: 25 },
		{ header: "IMEI", key: "imei", width: 20 },
		{ header: "Device Price", key: "devicePrice", width: 15 },
		{ header: "Loan Amount", key: "loanAmount", width: 15 },
		{ header: "Down Payment", key: "downPayment", width: 15 },
		{ header: "Monthly Repayment", key: "monthlyRepayment", width: 18 },
		{ header: "Loan Tenure", key: "duration", width: 12 },
		{ header: "Application Date", key: "createdAt", width: 18 },
		{ header: "Sale Person", key: "salePerson", width: 25 },
		{ header: "MBE ID", key: "mbeId", width: 20 },
		{ header: "Scan Partner Company", key: "scanPartnerCompany", width: 25 },
		{ header: "Scan Partner Name", key: "scanPartnerName", width: 25 },
		{ header: "Loan Status", key: "loanStatus", width: 15 },
	];

	let rowIndex = 2;

	for (const customer of customerRecords) {
		// Only include customers with approved loans
		if (
			!customer.LoanRecord?.[0] ||
			customer.LoanRecord[0]?.loanStatus !== "APPROVED" ||
			!customer.regBy
		) {
			continue;
		}

		// Find scan partner info
		let scanPartnerInfo = null;
		for (const scanPartnerData of allAgentData) {
			const matchingAgent = (scanPartnerData.agents || []).find(
				(agent: any) => agent.mbeId === customer.regBy?.mbeId
			);
			if (matchingAgent) {
				scanPartnerInfo = scanPartnerData;
				break;
			}
		}

		const loanRecord = customer.LoanRecord[0];
		const rowData = {
			customerId: customer.customerId || "N/A",
			loanRecordId: loanRecord.loanRecordId || "N/A",
			fullName:
				customer.firstName && customer.lastName
					? `${customer.firstName} ${customer.lastName}`
					: "N/A",
			bvnPhoneNumber: customer.bvnPhoneNumber || "N/A",
			email: customer.email || "N/A",
			age: customer.dob
				? `${new Date().getFullYear() - new Date(customer.dob).getFullYear()}`
				: "N/A",
			city: customer.CustomerKYC?.[0]?.town || "N/A",
			customerState: customer.CustomerKYC?.[0]?.state || "N/A",
			deviceName: loanRecord.deviceName || "N/A",
			imei: loanRecord.DeviceOnLoan?.[0]?.imei || "N/A",
			devicePrice: formatCurrency(loanRecord.device?.price || 0),
			loanAmount: formatCurrency(loanRecord.loanAmount || 0),
			downPayment: formatCurrency(loanRecord.downPayment || 0),
			monthlyRepayment: formatCurrency(loanRecord.monthlyRepayment || 0),
			duration: loanRecord.duration || "N/A",
			createdAt: formatDateValue(loanRecord.createdAt),
			salePerson:
				customer.regBy?.firstname && customer.regBy?.lastname
					? `${customer.regBy.firstname} ${customer.regBy.lastname}`
					: "N/A",
			mbeId: customer.regBy?.mbeId || "N/A",
			scanPartnerCompany: scanPartnerInfo?.companyName || "N/A",
			scanPartnerName: scanPartnerInfo
				? `${scanPartnerInfo.firstName || ""} ${
						scanPartnerInfo.lastName || ""
				  }`.trim()
				: "N/A",
			loanStatus: loanRecord.loanStatus || "N/A",
		};

		const row = ws.addRow(rowData);

		// Set date column types
		setDateColumnTypes(row, rowData, ["createdAt"]);

		// Apply color coding based on scan partner
		if (scanPartnerInfo) {
			const color = colorMap.get(scanPartnerInfo.userId);
			applyCellStyle(row, color);
		}

		rowIndex++;
	}

	// Style header and add autofilter
	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, rowIndex - 1);
}

/**
 * Creates commission summary worksheet
 */
export function createCommissionSummaryWorksheet(
	wb: ExcelJS.Workbook,
	commissionAgents: any[],
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Commission Summary");
	const colorMap = createScanPartnerColorMap(allAgentData);

	// Define columns to match old export
	ws.columns = [
		{ header: "Type", key: "type", width: 18 },
		{ header: "Name", key: "name", width: 30 },
		{ header: "ID/User ID", key: "id", width: 25 },
		{ header: "Location", key: "location", width: 25 },
		{ header: "Status", key: "status", width: 15 },
		{ header: "Total Commission", key: "totalCommission", width: 18 },
		{ header: "Agent Commission", key: "totalAgentCommission", width: 20 },
		{
			header: "Partner Commission",
			key: "totalPartnerCommission",
			width: 20,
		},
		{ header: "Commission Count", key: "commissionCount", width: 18 },
		{ header: "Avg per Transaction", key: "avgPerTransaction", width: 20 },
		{ header: "Paid Count", key: "paidCount", width: 15 },
		{ header: "Unpaid Count", key: "unpaidCount", width: 15 },
	];

	// Enhanced Agent summary (matching old export structure)
	commissionAgents.forEach((agent: any) => {
		const scanPartnerInfo = findScanPartnerForAgent(allAgentData, agent.mbeId);
		const scanPartner = scanPartnerInfo?.scanPartnerData || {};

		const commissions = agent.Commission || [];
		const totalCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.commission || 0),
			0
		);
		const totalAgentCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.mbeCommission || 0),
			0
		);
		const totalPartnerCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.partnerCommission || 0),
			0
		);
		const paidCount = commissions.filter(
			(c: any) => c.agentCommissionPaid && c.partnerCommissionPaid
		).length;
		const unpaidCount = commissions.length - paidCount;
		const avgPerTransaction =
			commissions.length > 0 ? totalCommission / commissions.length : 0;

		const agentLocation = `${agent.MbeKyc?.city || agent.city || "N/A"}, ${
			agent.MbeKyc?.state || agent.state || "N/A"
		}`;

		const rowData = {
			type: "Agent",
			name: `${agent.firstname || ""} ${agent.lastname || ""}`.trim() || "N/A",
			id: agent.mbeId || "N/A",
			location: agentLocation,
			status: agent.accountStatus || "N/A",
			totalCommission: formatCurrency(totalCommission),
			totalAgentCommission: formatCurrency(totalAgentCommission),
			totalPartnerCommission: formatCurrency(totalPartnerCommission),
			commissionCount: commissions.length,
			avgPerTransaction: formatCurrency(avgPerTransaction),
			paidCount,
			unpaidCount,
		};

		const row = ws.addRow(rowData);

		if (scanPartnerInfo?.scanPartnerData) {
			const color = colorMap.get(scanPartnerInfo.scanPartnerData.userId);
			applyCellStyle(row, color);
		}
	});

	// Enhanced Partner summary (matching old export structure)
	const partnerMap = new Map();
	commissionAgents.forEach((agent: any) => {
		const scanPartnerInfo = findScanPartnerForAgent(allAgentData, agent.mbeId);
		const scanPartner = scanPartnerInfo?.scanPartnerData;

		if (scanPartner) {
			const partnerKey = scanPartner.userId;

			if (!partnerMap.has(partnerKey)) {
				partnerMap.set(partnerKey, {
					scanPartnerData: scanPartner,
					agents: new Set(),
					totalCommission: 0,
					totalAgentCommission: 0,
					totalPartnerCommission: 0,
					commissionCount: 0,
					paidCount: 0,
					unpaidCount: 0,
				});
			}

			const partner = partnerMap.get(partnerKey);
			partner.agents.add(agent.mbeId);

			const commissions = agent.Commission || [];
			commissions.forEach((c: any) => {
				partner.totalCommission += c.commission || 0;
				partner.totalAgentCommission += c.mbeCommission || 0;
				partner.totalPartnerCommission += c.partnerCommission || 0;
				partner.commissionCount += 1;

				if (c.agentCommissionPaid && c.partnerCommissionPaid) {
					partner.paidCount += 1;
				} else {
					partner.unpaidCount += 1;
				}
			});
		}
	});

	Array.from(partnerMap.values()).forEach((partner: any) => {
		const partnerLocation = `${partner.scanPartnerData.companyCity || "N/A"}, ${
			partner.scanPartnerData.companyState || "N/A"
		}`;
		const avgPerTransaction =
			partner.commissionCount > 0
				? partner.totalCommission / partner.commissionCount
				: 0;

		const rowData = {
			type: "Partner",
			name: partner.scanPartnerData.companyName || "N/A",
			id: partner.scanPartnerData.userId || "N/A",
			location: partnerLocation,
			status: partner.scanPartnerData.accountStatus || "N/A",
			totalCommission: formatCurrency(partner.totalCommission),
			totalAgentCommission: formatCurrency(partner.totalAgentCommission),
			totalPartnerCommission: formatCurrency(partner.totalPartnerCommission),
			commissionCount: partner.commissionCount,
			avgPerTransaction: formatCurrency(avgPerTransaction),
			paidCount: partner.paidCount,
			unpaidCount: partner.unpaidCount,
		};

		const row = ws.addRow(rowData);
		const color = colorMap.get(partner.scanPartnerData.userId);
		applyCellStyle(row, color);
	});

	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, ws.rowCount);
}

/**
 * Creates agent commissions worksheet
 */
export function createAgentCommissionsWorksheet(
	wb: ExcelJS.Workbook,
	commissionAgents: any[],
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Agent Commissions");
	const colorMap = createScanPartnerColorMap(allAgentData);

	// Match old export structure
	ws.columns = [
		{ header: "S/N", key: "sn", width: 8 },
		{ header: "Agent Name", key: "agentName", width: 25 },
		{ header: "MBE ID", key: "mbeId", width: 20 },
		{ header: "Agent Email", key: "agentEmail", width: 30 },
		{ header: "Agent Phone", key: "agentPhone", width: 20 },
		{ header: "Agent Status", key: "agentStatus", width: 15 },
		{ header: "Partner Name", key: "partnerName", width: 25 },
		{ header: "Partner User ID", key: "partnerUserId", width: 25 },
		{ header: "Agent State", key: "agentState", width: 15 },
		{ header: "Agent City", key: "agentCity", width: 20 },
		{ header: "Total Commission", key: "totalCommission", width: 18 },
		{
			header: "Total Agent Commission",
			key: "totalAgentCommission",
			width: 20,
		},
		{
			header: "Total Partner Commission",
			key: "totalPartnerCommission",
			width: 20,
		},
		{ header: "Commission Count", key: "commissionCount", width: 18 },
		{
			header: "Avg Commission per Transaction",
			key: "avgCommission",
			width: 25,
		},
		{ header: "Paid Commissions", key: "paidCommissions", width: 18 },
		{ header: "Unpaid Commissions", key: "unpaidCommissions", width: 18 },
		{ header: "Agent Account Name", key: "agentAccountName", width: 25 },
		{
			header: "Agent Account Number",
			key: "agentAccountNumber",
			width: 20,
		},
		{ header: "Agent Bank Name", key: "agentBankName", width: 25 },
		{
			header: "Latest Commission Date",
			key: "latestCommissionDate",
			width: 20,
		},
	];

	// Match old export logic
	let agentCommissionRowIndex = 1;
	commissionAgents.forEach((agent: any) => {
		agentCommissionRowIndex++;
		const scanPartnerInfo = findScanPartnerForAgent(allAgentData, agent.mbeId);
		const scanPartner = scanPartnerInfo?.scanPartnerData || {};

		// Calculate totals from Commission array
		const commissions = agent.Commission || [];
		const totalCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.commission || 0),
			0
		);
		const totalAgentCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.mbeCommission || 0),
			0
		);
		const totalPartnerCommission = commissions.reduce(
			(sum: number, c: any) => sum + (c.partnerCommission || 0),
			0
		);
		const paidCommissions = commissions.filter(
			(c: any) => c.agentCommissionPaid
		).length;
		const unpaidCommissions = commissions.length - paidCommissions;
		const avgCommission =
			commissions.length > 0 ? totalCommission / commissions.length : 0;

		// Get latest commission date
		const latestCommissionDate =
			commissions.length > 0
				? new Date(
						Math.max(
							...commissions.map((c: any) =>
								new Date(c.createdAt || c.updatedAt).getTime()
							)
						)
				  )
				: null;

		const rowData = {
			sn: agentCommissionRowIndex - 1,
			agentName: `${agent.firstname || ""} ${agent.lastname || ""}`.trim(),
			mbeId: agent.mbeId || "N/A",
			agentEmail: agent.email || "N/A",
			agentPhone: agent.phone || "N/A",
			agentStatus: agent.accountStatus || "N/A",
			partnerName: scanPartner?.companyName || "N/A",
			partnerUserId: scanPartner?.userId || "N/A",
			agentState: agent.MbeKyc?.state || agent.state || "N/A",
			agentCity: agent.MbeKyc?.city || agent.city || "N/A",
			totalCommission: formatCurrency(totalCommission),
			totalAgentCommission: formatCurrency(totalAgentCommission),
			totalPartnerCommission: formatCurrency(totalPartnerCommission),
			commissionCount: commissions.length,
			avgCommission: formatCurrency(avgCommission),
			paidCommissions,
			unpaidCommissions,
			agentAccountName: agent.MbeBank?.[0]?.accountName || "N/A",
			agentAccountNumber: agent.MbeBank?.[0]?.accountNumber || "N/A",
			agentBankName: agent.MbeBank?.[0]?.bankName || "N/A",
			latestCommissionDate: formatDateValue(latestCommissionDate),
		};

		const row = ws.addRow(rowData);

		// Set date column types
		setDateColumnTypes(row, rowData, ["latestCommissionDate"]);

		if (scanPartnerInfo?.scanPartnerData) {
			const color = colorMap.get(scanPartnerInfo.scanPartnerData.userId);
			applyCellStyle(row, color);
		}
	});

	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, agentCommissionRowIndex);
}

/**
 * Creates partner commissions worksheet
 */
export function createPartnerCommissionsWorksheet(
	wb: ExcelJS.Workbook,
	commissionAgents: any[],
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Partner Commissions");
	const colorMap = createScanPartnerColorMap(allAgentData);

	// Match old export structure
	ws.columns = [
		{ header: "S/N", key: "sn", width: 8 },
		{ header: "Partner Name", key: "partnerName", width: 25 },
		{ header: "Partner User ID", key: "partnerUserId", width: 25 },
		{ header: "Partner Email", key: "partnerEmail", width: 30 },
		{ header: "Partner Phone", key: "partnerPhone", width: 20 },
		{ header: "Company State", key: "companyState", width: 20 },
		{ header: "Company City", key: "companyCity", width: 20 },
		{ header: "Account Status", key: "accountStatus", width: 15 },
		{ header: "Total Commission", key: "totalCommission", width: 18 },
		{
			header: "Total Agent Commission",
			key: "totalAgentCommission",
			width: 20,
		},
		{
			header: "Total Partner Commission",
			key: "totalPartnerCommission",
			width: 20,
		},
		{ header: "Commission Count", key: "commissionCount", width: 18 },
		{ header: "Agent Count", key: "agentCount", width: 15 },
		{ header: "Active Agents", key: "activeAgents", width: 15 },
		{ header: "Inactive Agents", key: "inactiveAgents", width: 15 },
		{
			header: "Avg Commission per Agent",
			key: "avgCommissionPerAgent",
			width: 25,
		},
		{
			header: "Avg Commission per Transaction",
			key: "avgCommissionPerTransaction",
			width: 28,
		},
		{
			header: "Partner Paid Commissions",
			key: "partnerPaidCommissions",
			width: 25,
		},
		{
			header: "Partner Unpaid Commissions",
			key: "partnerUnpaidCommissions",
			width: 25,
		},
		{ header: "SP Account Name", key: "spAccountName", width: 25 },
		{ header: "SP Account Number", key: "spAccountNumber", width: 20 },
		{ header: "SP Bank Name", key: "spBankName", width: 25 },
	];

	// Group by partner with enhanced data (match old export)
	const partnerMap = new Map();
	commissionAgents.forEach((agent: any) => {
		const scanPartnerInfo = findScanPartnerForAgent(allAgentData, agent.mbeId);
		const scanPartner = scanPartnerInfo?.scanPartnerData;

		if (scanPartner) {
			const partnerKey = scanPartner.userId;

			if (!partnerMap.has(partnerKey)) {
				partnerMap.set(partnerKey, {
					scanPartnerData: scanPartner,
					agents: new Set(),
					activeAgents: new Set(),
					inactiveAgents: new Set(),
					totalCommission: 0,
					totalAgentCommission: 0,
					totalPartnerCommission: 0,
					commissionCount: 0,
					partnerPaidCommissions: 0,
					partnerUnpaidCommissions: 0,
				});
			}

			const partner = partnerMap.get(partnerKey);
			partner.agents.add(agent.mbeId);

			if (agent.isActive) {
				partner.activeAgents.add(agent.mbeId);
			} else {
				partner.inactiveAgents.add(agent.mbeId);
			}

			const commissions = agent.Commission || [];
			commissions.forEach((c: any) => {
				partner.totalCommission += c.commission || 0;
				partner.totalAgentCommission += c.mbeCommission || 0;
				partner.totalPartnerCommission += c.partnerCommission || 0;
				partner.commissionCount += 1;

				if (c.partnerCommissionPaid) {
					partner.partnerPaidCommissions += c.partnerCommission || 0;
				} else {
					partner.partnerUnpaidCommissions += c.partnerCommission || 0;
				}
			});
		}
	});

	let partnerCommissionRowIndex = 1;
	Array.from(partnerMap.values()).forEach((partner: any) => {
		partnerCommissionRowIndex++;
		const avgCommissionPerAgent =
			partner.agents.size > 0
				? partner.totalCommission / partner.agents.size
				: 0;
		const avgCommissionPerTransaction =
			partner.commissionCount > 0
				? partner.totalCommission / partner.commissionCount
				: 0;

		const rowData = {
			sn: partnerCommissionRowIndex - 1,
			partnerName: partner.scanPartnerData.companyName || "N/A",
			partnerUserId: partner.scanPartnerData.userId || "N/A",
			partnerEmail: partner.scanPartnerData.email || "N/A",
			partnerPhone: partner.scanPartnerData.telephoneNumber || "N/A",
			companyState: partner.scanPartnerData.companyState || "N/A",
			companyCity: partner.scanPartnerData.companyCity || "N/A",
			accountStatus: partner.scanPartnerData.accountStatus || "N/A",
			totalCommission: formatCurrency(partner.totalCommission),
			totalAgentCommission: formatCurrency(partner.totalAgentCommission),
			totalPartnerCommission: formatCurrency(partner.totalPartnerCommission),
			commissionCount: partner.commissionCount,
			agentCount: partner.agents.size,
			activeAgents: partner.activeAgents.size,
			inactiveAgents: partner.inactiveAgents.size,
			avgCommissionPerAgent: formatCurrency(avgCommissionPerAgent),
			avgCommissionPerTransaction: formatCurrency(avgCommissionPerTransaction),
			partnerPaidCommissions: formatCurrency(partner.partnerPaidCommissions),
			partnerUnpaidCommissions: formatCurrency(
				partner.partnerUnpaidCommissions
			),
			spAccountName:
				partner.scanPartnerData.UserAccountDetails?.[0]?.accountName || "N/A",
			spAccountNumber:
				partner.scanPartnerData.UserAccountDetails?.[0]?.accountNumber || "N/A",
			spBankName:
				partner.scanPartnerData.UserAccountDetails?.[0]?.bankName || "N/A",
		};

		const row = ws.addRow(rowData);
		const color = colorMap.get(partner.scanPartnerData.userId);
		applyCellStyle(row, color);
	});

	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, partnerCommissionRowIndex);
}

/**
 * Creates guarantors worksheet
 */
export function createGuarantorsWorksheet(
	wb: ExcelJS.Workbook,
	customerSales: any[],
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Guarantors");
	const colorMap = createScanPartnerColorMap(allAgentData);

	ws.columns = [
		{ header: "S/N", key: "sn", width: 8 },
		{ header: "MBE ID", key: "mbeId", width: 20 },
		{ header: "MBE Name", key: "mbeName", width: 25 },
		{ header: "MBE Phone", key: "mbePhone", width: 20 },
		{ header: "Guarantor Name", key: "guarantorName", width: 25 },
		{ header: "Guarantor Phone", key: "guarantorPhone", width: 20 },
		{ header: "Guarantor Address", key: "guarantorAddress", width: 40 },
		{ header: "Relationship", key: "relationship", width: 20 },
		{ header: "Guarantor Status", key: "guarantorStatus", width: 15 },
		{ header: "Created At", key: "createdAt", width: 20 },
		{ header: "Updated At", key: "updatedAt", width: 20 },
	];

	let rowIndex = 2;
	let sn = 1;

	// Group guarantors by MBE ID using allAgentData
	for (const scanPartnerData of allAgentData) {
		const agents = scanPartnerData.agents || [];
		const color = colorMap.get(scanPartnerData.userId);

		for (const agent of agents) {
			const guarantors = agent.MbeGuarantor || [];

			for (const guarantor of guarantors) {
				const rowData = {
					sn: sn++,
					mbeId: agent.mbeId,
					mbeName: `${agent.firstname || ""} ${agent.lastname || ""}`.trim(),
					mbePhone: agent.phone || "N/A",
					guarantorName: guarantor.guarantorName || "N/A",
					guarantorPhone: guarantor.guarantorPhone || "N/A",
					guarantorAddress: guarantor.guarantorAddress || "N/A",
					relationship: guarantor.guarantorRelationship || "N/A",
					guarantorStatus: guarantor.status || "Active",
					createdAt: formatDateValue(guarantor.createdAt || agent.createdAt),
					updatedAt: formatDateValue(guarantor.updatedAt || agent.updatedAt),
				};

				const row = ws.addRow(rowData);

				// Set date column types
				setDateColumnTypes(row, rowData, ["createdAt", "updatedAt"]);

				if (color) {
					applyCellStyle(row, color);
				}
				rowIndex++;
			}
		}
	}

	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, rowIndex - 1);
}

/**
 * Creates location analysis worksheet
 */
export function createLocationAnalysisWorksheet(
	wb: ExcelJS.Workbook,
	customerSales: any[],
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Location Analysis");
	const colorMap = createScanPartnerColorMap(allAgentData);

	ws.columns = [
		{ header: "Category", key: "category", width: 30 },
		{ header: "Type", key: "type", width: 25 },
		{ header: "Name/Company", key: "name", width: 30 },
		{ header: "Location", key: "location", width: 25 },
		{ header: "State", key: "state", width: 15 },
		{ header: "Status", key: "status", width: 15 },
		{ header: "Verification Status", key: "verificationStatus", width: 20 },
	];

	// Add all scan partners and their agents by location using allAgentData
	allAgentData.forEach((scanPartnerData: any) => {
		const scanPartnerLocation =
			scanPartnerData.companyCity || scanPartnerData.companyState || "Unknown";
		const scanPartnerState = scanPartnerData.companyState || "Unknown";

		// Add scan partner (no location filtering - show all)
		const color = colorMap.get(scanPartnerData.userId);
		const rowData = {
			category: "Scan Partner",
			type: "Company",
			name: `${scanPartnerData.companyName} (${scanPartnerData.firstName} ${scanPartnerData.lastName})`,
			location: scanPartnerLocation,
			state: scanPartnerState,
			status: scanPartnerData.accountStatus,
			verificationStatus: scanPartnerData.isActive ? "Active" : "Inactive",
		};

		const row = ws.addRow(rowData);
		if (color) {
			applyCellStyle(row, color);
		}

		// Add all agents under this scan partner by location
		const agents = scanPartnerData.agents || [];
		agents.forEach((agent: any) => {
			const agentLocation =
				agent.MbeKyc?.city || agent.MbeKyc?.state || agent.state || "Unknown";
			const agentState = agent.MbeKyc?.state || agent.state || "Unknown";

			// Add all agents (no location filtering - show all)
			const isVerified =
				agent.accountStatus === "VERIFIED" ||
				agent.accountStatus === "APPROVED";

			const agentRowData = {
				category: "Agent",
				type: "Individual",
				name: `${agent.firstname} ${agent.lastname}`,
				location: agentLocation,
				state: agentState,
				status: agent.accountStatus,
				verificationStatus: isVerified ? "Verified" : "Unverified",
			};

			const agentRow = ws.addRow(agentRowData);
			if (color) {
				applyCellStyle(agentRow, color);
			}
		});
	});

	// Add autofilter to Location Analysis sheet
	let totalLocationRows = 0;
	allAgentData.forEach((scanPartnerData: any) => {
		totalLocationRows += 1; // For scan partner
		totalLocationRows += (scanPartnerData.agents || []).length; // For agents
	});

	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, totalLocationRows + 1);
}

/**
 * Creates verification analysis worksheet
 */
export function createVerificationAnalysisWorksheet(
	wb: ExcelJS.Workbook,
	customerSales: any[],
	allAgentData: any[]
): void {
	const ws = wb.addWorksheet("Verification Analysis");
	const colorMap = createScanPartnerColorMap(allAgentData);

	ws.columns = [
		{
			header: "Scan Partner Company",
			key: "scanPartnerCompany",
			width: 25,
		},
		{
			header: "Scan Partner Location",
			key: "scanPartnerLocation",
			width: 25,
		},
		{ header: "Total Agents", key: "totalAgents", width: 15 },
		{ header: "Verified Agents", key: "verifiedAgents", width: 15 },
		{ header: "Unverified Agents", key: "unverifiedAgents", width: 15 },
		{ header: "Verification Rate (%)", key: "verificationRate", width: 20 },
		{
			header: "Agent Names (Verified)",
			key: "verifiedAgentNames",
			width: 50,
		},
		{
			header: "Agent Names (Unverified)",
			key: "unverifiedAgentNames",
			width: 50,
		},
	];

	allAgentData.forEach((scanPartnerData: any) => {
		const agents = scanPartnerData.agents || [];
		const verifiedAgentsList = agents.filter(
			(agent: any) =>
				agent.accountStatus === "VERIFIED" || agent.accountStatus === "APPROVED"
		);
		const unverifiedAgentsList = agents.filter(
			(agent: any) =>
				agent.accountStatus !== "VERIFIED" && agent.accountStatus !== "APPROVED"
		);

		const verificationRate =
			agents.length > 0
				? ((verifiedAgentsList.length / agents.length) * 100).toFixed(1)
				: "0.0";

		const color = colorMap.get(scanPartnerData.userId);
		const rowData = {
			scanPartnerCompany: scanPartnerData.companyName,
			scanPartnerLocation: `${scanPartnerData.companyCity || "N/A"}, ${
				scanPartnerData.companyState || "N/A"
			}`,
			totalAgents: agents.length,
			verifiedAgents: verifiedAgentsList.length,
			unverifiedAgents: unverifiedAgentsList.length,
			verificationRate: `${verificationRate}%`,
			verifiedAgentNames:
				verifiedAgentsList
					.map((agent: any) => `${agent.firstname} ${agent.lastname}`)
					.join(", ") || "None",
			unverifiedAgentNames:
				unverifiedAgentsList
					.map((agent: any) => `${agent.firstname} ${agent.lastname}`)
					.join(", ") || "None",
		};

		const row = ws.addRow(rowData);
		if (color) {
			applyCellStyle(row, color);
		}
	});

	// Add autofilter to Verification Analysis sheet
	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, allAgentData.length + 1);
}

/**
 * Creates sales report summary worksheet
 */
export function createSalesReportSummaryWorksheet(
	wb: ExcelJS.Workbook,
	customerSales: any[],
	commissionAgents: any[],
	allAgentData: any[],
	salesData?: any,
	salesPeriod?: string
): void {
	const ws = wb.addWorksheet("Sales Report Summary");

	ws.columns = [
		{ header: "Metric", key: "metric", width: 35 },
		{ header: "Value", key: "value", width: 20 },
		{ header: "Period", key: "period", width: 15 },
	];

	const salesSummaryData = [
		{ metric: "=== MOBIFLEX SALES SUMMARY ===", value: "", period: "" },
		{
			metric: "Reporting Period",
			value: salesData?.period || salesPeriod || "Current Period",
			period: salesData?.period || salesPeriod || "Current Period",
		},
		{
			metric: "Total Active Partners",
			value: salesData?.summary?.totalPartners || allAgentData.length,
			period: salesData?.period || salesPeriod || "",
		},
		{
			metric: "Grand Total Commission",
			value: `₦${(
				salesData?.summary?.grandTotalCommission ||
				commissionAgents.reduce(
					(sum, agent) => sum + (agent.paidCommission || 0),
					0
				)
			).toLocaleString("en-GB")}`,
			period: salesData?.period || salesPeriod || "",
		},
		{
			metric: "Total Agent Commission",
			value: `₦${(
				salesData?.summary?.grandTotalAgentCommission ||
				commissionAgents.reduce(
					(sum, agent) => sum + (agent.paidCommission || 0),
					0
				)
			).toLocaleString("en-GB")}`,
			period: salesData?.period || salesPeriod || "",
		},
		{
			metric: "Total Partner Commission",
			value: `₦${(
				salesData?.summary?.grandTotalPartnerCommission || 0
			).toLocaleString("en-GB")}`,
			period: salesData?.period || salesPeriod || "",
		},
		{
			metric: "Total Commission Transactions",
			value: salesData?.summary?.totalCommissions || commissionAgents.length,
			period: salesData?.period || salesPeriod || "",
		},
		{
			metric: "Total Active Agents",
			value: salesData?.summary?.totalAgents || commissionAgents.length,
			period: salesData?.period || salesPeriod || "",
		},
		{
			metric: "Average Agents per Partner",
			value:
				salesData?.summary?.averageAgentsPerPartner ||
				(allAgentData.length > 0
					? (commissionAgents.length / allAgentData.length).toFixed(1)
					: 0),
			period: salesData?.period || salesPeriod || "",
		},
		{ metric: "", value: "", period: "" },
		{ metric: "=== TOP PERFORMING PARTNER ===", value: "", period: "" },
	];

	// Add top performing partner details if available
	if (salesData?.summary?.topPerformingPartner) {
		const topPartner = salesData.summary.topPerformingPartner;
		salesSummaryData.push(
			{
				metric: "Top Partner Name",
				value: topPartner.partnerName,
				period: salesData.period || salesPeriod || "",
			},
			{
				metric: "Top Partner ID",
				value: topPartner.partnerId,
				period: salesData.period || salesPeriod || "",
			},
			{
				metric: "Top Partner Total Commission",
				value: `₦${(topPartner.totalCommission || 0).toLocaleString("en-GB")}`,
				period: salesData.period || salesPeriod || "",
			},
			{
				metric: "Top Partner Agent Count",
				value: topPartner.agentCount || 0,
				period: salesData.period || salesPeriod || "",
			},
			{
				metric: "Top Partner States Covered",
				value: topPartner.stateCount || 0,
				period: salesData.period || salesPeriod || "",
			}
		);
	}

	salesSummaryData.forEach((item) => {
		const row = ws.addRow(item);

		// Style headers and totals
		if (
			item.metric.includes("===") ||
			item.metric.includes("Grand Total") ||
			item.metric.includes("Top Partner")
		) {
			row.eachCell((cell) => {
				cell.font = { bold: true };
				if (item.metric.includes("===")) {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFE6F3FF" },
					};
				}
			});
		}
	});

	// Add autofilter
	applyCellStyle(ws.getRow(1), undefined, true);
	addAutofilter(ws, salesSummaryData.length + 1);
}
