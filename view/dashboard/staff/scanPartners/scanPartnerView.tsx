"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
	type ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import {
	getAllScanPartners,
	capitalize,
	calculateAge,
	getScanPartnerAgents,
	getMobiflexPartnerStats,
	getMobiflexScanPartnerStatsById,
	getMobiflexPartnerApprovedAgents,
	getAllCustomerRecord,
	getAllAgentsLoansAndCommissions,
} from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Chip,
	type SortDescriptor,
	type ChipProps,
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Tabs,
	Tab,
} from "@heroui/react";
import {
	EllipsisVertical,
	TrendingUp,
	Users,
	DollarSign,
	Calendar,
} from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import type { ScanPartnerRecord } from "./types";
import { statusOptions, columns, statusColorMap } from "./constants";

export default function ScanPartnerPage() {
	const router = useRouter();
	const pathname = usePathname();
	// Get the role from the URL path (e.g., /access/dev/staff/scan-partners -> dev)
	const role = pathname.split("/")[2];

	// --- date filter state ---
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);
	const [hasNoRecords, setHasNoRecords] = useState(false);

	// --- table state ---
	const [filterValue, setFilterValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "companyName",

		direction: "ascending",
	});
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// --- sales reporting state ---
	const [selectedTab, setSelectedTab] = useState("partners");
	const [salesPeriod, setSalesPeriod] = useState<
		"daily" | "weekly" | "monthly" | "yearly" | "mtd"
	>("mtd");
	const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");

	// --- handle date filter ---
	const handleDateFilter = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
	};

	// Fetch data based on date filter
	const { data: raw = [], isLoading } = useSWR(
		startDate && endDate
			? ["scan-partner-records", startDate, endDate]
			: "scan-partner-records",
		() =>
			getAllScanPartners(startDate, endDate)
				.then((r: any) => {
					if (!r.data || r.data?.length === 0) {
						setHasNoRecords(true);
						return [];
					}
					setHasNoRecords(false);
					return r?.data;
				})
				.catch((error: any) => {
					console.error("Error fetching scan partner records:", error);
					setHasNoRecords(true);
					return [];
				}),
		{
			revalidateOnFocus: true,
			dedupingInterval: 60000,
			refreshInterval: 60000,
			shouldRetryOnError: false,
			keepPreviousData: true,
			revalidateIfStale: true,
		}
	);

	console.log(raw);

	// Transform scan partner data
	const scanPartners = useMemo(() => {
		if (!Array.isArray(raw)) return [];

		return raw.map((r: ScanPartnerRecord) => ({
			...r,
			fullName: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
			age: r.dob ? calculateAge(r.dob) : "N/A",
			mbeCount: r.Mbe ? r.Mbe.length : 0,
		}));
	}, [raw]);

	// Fetch sales data for Mobiflex integration
	const { data: partnerStatsData, isLoading: isPartnerStatsLoading } = useSWR(
		`mobiflex-partner-stats-${salesPeriod}`,
		() => getMobiflexPartnerStats(salesPeriod).then((r) => r.data),
		{
			refreshInterval: 5 * 60 * 1000, // 5 minutes
			revalidateOnFocus: false,
			dedupingInterval: 2 * 60 * 1000, // 2 minutes
		}
	);

	// Fetch specific partner stats when a partner is selected
	const { data: specificPartnerData, isLoading: isSpecificPartnerLoading } =
		useSWR(
			selectedPartnerId && selectedPartnerId !== ""
				? `mobiflex-partner-specific-${selectedPartnerId}-${salesPeriod}`
				: null,
			() =>
				selectedPartnerId && selectedPartnerId !== ""
					? getMobiflexScanPartnerStatsById(
							selectedPartnerId,
							salesPeriod
					  ).then(
							(r) =>
								r.data as {
									summary: {
										totalCommission: number;
										totalAgentCommission: number;
										totalPartnerCommission: number;
										totalAgents: number;
									};
									agentPerformance: Array<{
										agent: {
											firstname: string;
											lastname: string;
											phone: string;
											mbeId: string;
										};
										totalCommission: number;
										agentCommission: number;
										partnerCommission: number;
										commissionCount: number;
									}>;
								}
					  )
					: null,
			{
				refreshInterval: 5 * 60 * 1000,
				revalidateOnFocus: false,
			}
		);

	// Fetch approved agents data for the selected partner
	const { data: approvedAgentsData, isLoading: isApprovedAgentsLoading } =
		useSWR(
			selectedPartnerId && selectedPartnerId !== ""
				? `mobiflex-approved-agents-${selectedPartnerId}`
				: null,
			() =>
				selectedPartnerId && selectedPartnerId !== ""
					? getMobiflexPartnerApprovedAgents(selectedPartnerId).then(
							(r) =>
								r.data as {
									daily: {
										totalCount: number;
									};
									mtd: {
										totalCount: number;
										period: string;
									};
									scanPartner: {
										name: string;
									};
								}
					  )
					: null,
			{
				refreshInterval: 5 * 60 * 1000,
				revalidateOnFocus: false,
			}
		);

	const filtered = useMemo(() => {
		// Add safety check
		if (!scanPartners || !Array.isArray(scanPartners)) {
			return [];
		}

		let list = [...scanPartners];

		if (filterValue) {
			const f = filterValue.toLowerCase();
			list = list.filter(
				(c: ScanPartnerRecord & { fullName: string }) =>
					c.firstName.toLowerCase().includes(f) ||
					c.lastName.toLowerCase().includes(f) ||
					c.email.toLowerCase().includes(f) ||
					c.telephoneNumber?.toLowerCase().includes(f) ||
					c.userId.toLowerCase().includes(f) ||
					c.accountType?.toLowerCase().includes(f) ||
					c.fullName.toLowerCase().includes(f)
			);
		}

		if (statusFilter.size > 0) {
			list = list.filter((c) => statusFilter.has(c.accountStatus || ""));
		}

		return list;
	}, [scanPartners, filterValue, statusFilter]);

	const pages = Math.ceil(filtered.length / rowsPerPage) || 1;

	const paged = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page]);

	const sorted = React.useMemo(() => {
		return [...paged].sort((a, b) => {
			const aVal = a[sortDescriptor.column as keyof ScanPartnerRecord];
			const bVal = b[sortDescriptor.column as keyof ScanPartnerRecord];
			const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [paged, sortDescriptor]);

	// Enhanced Export Function with Detailed Reports

	const exportFn = async (data: ScanPartnerRecord[]) => {
		try {
			// Fetch detailed agent data from getScanPartnerAgents
			const agentsResponse = await getScanPartnerAgents();
			const allAgentData = agentsResponse?.data || [];

			// Fetch Mobiflex sales data for comprehensive reporting
			const salesDataResponse = await getMobiflexPartnerStats(salesPeriod);
			const salesData = salesDataResponse?.data || null;

			// Fetch all agents' loans and commissions for commission sheets
			const allCommissionsResponse = await getAllAgentsLoansAndCommissions();
			const allCommissionsData = allCommissionsResponse?.data || { agents: [] };
			const commissionAgents = allCommissionsData.agents || [];
			let customerRecords: any[] = [];

			// Fetch customer records for IMEI/customer mapping
			// ...customerRecords already declared above...
			try {
				const customerRecordsResponse = await getAllCustomerRecord();
				customerRecords = customerRecordsResponse?.data || [];
			} catch (error) {
				customerRecords = [];
			}

			const wb = new ExcelJS.Workbook();

			// Define color palette for scan partners
			const scanPartnerColors = [
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

			// Map scan partners to colors using allAgentData
			const scanPartnerColorMap = new Map();
			allAgentData.forEach((scanPartnerData: any, index: number) => {
				scanPartnerColorMap.set(
					scanPartnerData.userId,
					scanPartnerColors[index % scanPartnerColors.length]
				);
			});

			// --- 1. Commission Sheet (All Commissions, with Bank Details and Device/Customer Mapping) ---
			// Improved Commission Sheet with comprehensive scan partner and bank details
			// --- 1. Commission Sheet (All Commissions, with Bank Details and Device/Customer Mapping) ---
			// Improved Commission Sheet with comprehensive scan partner and bank details
			const commissionWs = wb.addWorksheet("Commissions");
			commissionWs.columns = [
				{ header: "S/N", key: "sn", width: 8 },
				// Scan Partner Details
				{
					header: "Scan Partner Company",
					key: "scanPartnerCompany",
					width: 25,
				},
				{ header: "Scan Partner Name", key: "scanPartnerName", width: 25 },
				{ header: "Scan Partner User ID", key: "scanPartnerUserId", width: 25 },
				{ header: "Scan Partner Phone", key: "scanPartnerPhone", width: 20 },
				// Agent Details
				{ header: "Agent Name", key: "agentName", width: 25 },
				{ header: "Agent MBE ID", key: "mbeId", width: 20 },
				{ header: "Agent Old ID", key: "agentOldId", width: 15 },
				{ header: "Agent Email", key: "agentEmail", width: 30 },
				{ header: "Agent Phone", key: "agentPhone", width: 20 },
				{ header: "Agent BVN", key: "agentBvn", width: 15 },
				{ header: "Agent Status", key: "agentStatus", width: 15 },
				{ header: "Agent Active", key: "agentActive", width: 12 },
				// Agent Bank Details
				{ header: "Agent Account Name", key: "agentAccountName", width: 25 },
				{
					header: "Agent Account Number",
					key: "agentAccountNumber",
					width: 20,
				},
				{ header: "Agent Bank Name", key: "agentBankName", width: 25 },
				{ header: "Agent Bank Code", key: "agentBankCode", width: 15 },
				{
					header: "Agent Recipient Code",
					key: "agentRecipientCode",
					width: 20,
				},
				{ header: "Agent VFD Bank Name", key: "agentVfdBankName", width: 25 },
				{ header: "Agent VFD Bank Code", key: "agentVfdBankCode", width: 15 },
				// Scan Partner Bank Details
				{ header: "SP Account Name", key: "spAccountName", width: 25 },
				{ header: "SP Account Number", key: "spAccountNumber", width: 20 },
				{ header: "SP Bank Name", key: "spBankName", width: 25 },
				{ header: "SP Bank Code", key: "spBankCode", width: 15 },
				{ header: "SP VFD Bank Name", key: "spVfdBankName", width: 25 },
				{ header: "SP VFD Bank Code", key: "spVfdBankCode", width: 15 },
				// Loan & Device Details
				{ header: "Loan Record ID", key: "loanRecordId", width: 20 },
				{ header: "Device Name", key: "deviceName", width: 25 },
				{ header: "IMEI", key: "imei", width: 18 },
				{ header: "Device Status", key: "deviceStatus", width: 15 },
				{ header: "Device Price", key: "devicePrice", width: 15 },
				{ header: "Loan Amount", key: "loanAmount", width: 15 },
				{ header: "Down Payment", key: "downPayment", width: 15 },
				{ header: "Monthly Payment", key: "monthlyPayment", width: 15 },
				{ header: "Duration (Months)", key: "duration", width: 15 },
				// Customer Details
				{ header: "Customer Name", key: "customerName", width: 25 },
				{ header: "Customer ID", key: "customerId", width: 18 },
				{ header: "Customer Phone", key: "customerPhone", width: 20 },
				// Commission Details
				{ header: "Total Commission", key: "totalCommission", width: 18 },
				{ header: "Agent Commission", key: "agentCommission", width: 18 },
				{ header: "Partner Commission", key: "partnerCommission", width: 18 },
				{ header: "Split Percentage", key: "splitPercent", width: 15 },
				{ header: "Agent Commission Paid", key: "agentPaid", width: 20 },
				{ header: "Partner Commission Paid", key: "partnerPaid", width: 20 },
				{ header: "Payment Status", key: "paymentStatus", width: 15 },
				{ header: "Commission Date", key: "commissionDate", width: 18 },
				{ header: "Last Updated", key: "lastUpdated", width: 18 },
				// Location Details
				{ header: "Agent State", key: "agentState", width: 15 },
				{ header: "Agent City", key: "agentCity", width: 20 },
				{ header: "SP Company State", key: "spCompanyState", width: 20 },
				{ header: "SP Company City", key: "spCompanyCity", width: 20 },
			];

			// Build enhanced IMEI to customer mapping with comprehensive details
			const enhancedImeiToCustomer = new Map();
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
							loanRecord?.deviceName ||
							deviceOnLoan?.device?.deviceName ||
							"N/A",
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

			let commissionRowIndex = 1;

			// Process each agent with their commissions
			commissionAgents.forEach((agent: any) => {
				// Get scan partner details from allAgentData
				let scanPartnerData = null;
				for (const spData of allAgentData) {
					if (spData.agents?.some((a: any) => a.mbeId === agent.mbeId)) {
						scanPartnerData = spData;
						break;
					}
				}

				// Get scan partner details
				const scanPartner = scanPartnerData || agent?.scanPartner || {};
				const scanPartnerAccount = scanPartner?.UserAccountDetails?.[0] || {};

				// Get agent details from allAgentData for more complete info
				let agentFromAllData = null;
				if (scanPartnerData) {
					agentFromAllData = scanPartnerData.agents?.find(
						(a: any) => a.mbeId === agent.mbeId
					);
				}

				// Get agent details - prioritize data from allAgentData if available
				const agentAccount =
					agentFromAllData?.MbeAccountDetails || agent?.MbeAccountDetails || {};
				const agentKyc = agentFromAllData?.MbeKyc || agent?.MbeKyc || {};

				// Process each commission for this agent
				(agent.Commission || []).forEach((commission: any) => {
					// Find loan record and device details
					const loanRecord = agent.LoanRecord?.find(
						(loan: any) => loan.loanRecordId === commission.deviceOnLoanId
					);

					// Get device and customer details from commission's devicesOnLoan or loan record
					let deviceDetails = null;
					let customerDetails = null;
					let imei = "N/A";

					// Try to get device details from commission's devicesOnLoan first
					if (commission.devicesOnLoan) {
						const deviceOnLoan = commission.devicesOnLoan;
						imei = deviceOnLoan.imei || "N/A";
						deviceDetails = {
							deviceName: deviceOnLoan.device?.deviceName || "N/A",
							devicePrice:
								deviceOnLoan.device?.price || deviceOnLoan.devicePrice || 0,
							deviceStatus: deviceOnLoan.status || "N/A",
						};
					}

					// If not found, try from loan record
					if (!deviceDetails && loanRecord) {
						const deviceOnLoan = loanRecord.DeviceOnLoan?.[0];
						if (deviceOnLoan) {
							imei = deviceOnLoan.imei || loanRecord.deviceId || "N/A";
							deviceDetails = {
								deviceName:
									loanRecord.deviceName ||
									deviceOnLoan.device?.deviceName ||
									"N/A",
								devicePrice:
									loanRecord.devicePrice || deviceOnLoan.device?.price || 0,
								deviceStatus: deviceOnLoan.status || "N/A",
							};
						}
					}

					// Get customer details from enhanced mapping or loan record
					if (imei && enhancedImeiToCustomer.has(imei)) {
						customerDetails = enhancedImeiToCustomer.get(imei);
					} else if (loanRecord?.customer) {
						customerDetails = {
							customerId: loanRecord.customer.customerId,
							customerName:
								`${loanRecord.customer.firstName || ""} ${
									loanRecord.customer.lastName || ""
								}`.trim() || "N/A",
							customerPhone:
								loanRecord.customer.bvnPhoneNumber ||
								loanRecord.customer.mainPhoneNumber ||
								"N/A",
							deviceName: loanRecord.deviceName || "N/A",
							devicePrice: loanRecord.devicePrice || 0,
							loanAmount: loanRecord.loanAmount || 0,
							downPayment: loanRecord.downPayment || 0,
							monthlyPayment: loanRecord.monthlyRepayment || 0,
							duration: loanRecord.duration || 0,
							deviceStatus: "N/A",
						};
					}

					// Build comprehensive row data
					const rowData = {
						sn: commissionRowIndex++,

						// Scan Partner Details
						scanPartnerCompany: scanPartner?.companyName || "N/A",
						scanPartnerName:
							scanPartner?.firstName && scanPartner?.lastName
								? `${scanPartner.firstName} ${scanPartner.lastName}`
								: "N/A",
						scanPartnerUserId: scanPartner?.userId || "N/A",
						scanPartnerPhone: scanPartner?.telephoneNumber || "N/A",

						// Agent Details
						agentName: `${agent.firstname || ""} ${
							agent.lastname || ""
						}`.trim(),
						mbeId: agent.mbeId || "N/A",
						agentOldId: agent.mbe_old_id || "N/A",
						agentEmail: agent.email || "N/A",
						agentPhone: agent.phone || "N/A",
						agentBvn: agent.bvn || "N/A",
						agentStatus: agent.accountStatus || "N/A",
						agentActive: agent.isActive ? "Yes" : "No",

						// Agent Bank Details
						agentAccountName: agentAccount?.accountName || "N/A",
						agentAccountNumber: agentAccount?.accountNumber || "N/A",
						agentBankName: agentAccount?.bankName || "N/A",
						agentBankCode: agentAccount?.bankCode || "N/A",
						agentRecipientCode: agentAccount?.recipientCode || "N/A",
						agentVfdBankName: agentAccount?.vfdBankName || "N/A",
						agentVfdBankCode: agentAccount?.vfdBankCode || "N/A",

						// Scan Partner Bank Details
						spAccountName: scanPartnerAccount?.accountName || "N/A",
						spAccountNumber: scanPartnerAccount?.accountNumber || "N/A",
						spBankName: scanPartnerAccount?.bankName || "N/A",
						spBankCode: scanPartnerAccount?.bankCode || "N/A",
						spVfdBankName: scanPartnerAccount?.vfdBankName || "N/A",
						spVfdBankCode: scanPartnerAccount?.vfdBankCode || "N/A",

						// Loan & Device Details
						loanRecordId: commission.deviceOnLoanId || "N/A",
						deviceName:
							deviceDetails?.deviceName || customerDetails?.deviceName || "N/A",
						imei: imei,
						deviceStatus:
							deviceDetails?.deviceStatus ||
							customerDetails?.deviceStatus ||
							"N/A",
						devicePrice:
							(deviceDetails?.devicePrice ||
								customerDetails?.devicePrice ||
								0) > 0
								? (
										deviceDetails?.devicePrice ||
										customerDetails?.devicePrice ||
										0
								  ).toLocaleString("en-GB")
								: "N/A",
						loanAmount:
							(customerDetails?.loanAmount || loanRecord?.loanAmount || 0) > 0
								? (
										customerDetails?.loanAmount ||
										loanRecord?.loanAmount ||
										0
								  ).toLocaleString("en-GB")
								: "N/A",
						downPayment:
							(customerDetails?.downPayment || loanRecord?.downPayment || 0) > 0
								? (
										customerDetails?.downPayment ||
										loanRecord?.downPayment ||
										0
								  ).toLocaleString("en-GB")
								: "N/A",
						monthlyPayment:
							(customerDetails?.monthlyPayment ||
								loanRecord?.monthlyRepayment ||
								0) > 0
								? (
										customerDetails?.monthlyPayment ||
										loanRecord?.monthlyRepayment ||
										0
								  ).toLocaleString("en-GB")
								: "N/A",
						duration:
							customerDetails?.duration || loanRecord?.duration || "N/A",

						// Customer Details (removed email as requested)
						customerName: customerDetails?.customerName || "N/A",
						customerId: customerDetails?.customerId || "N/A",
						customerPhone: customerDetails?.customerPhone || "N/A",

						// Commission Details
						totalCommission: commission.commission
							? commission.commission.toLocaleString("en-GB")
							: "0",
						agentCommission: commission.mbeCommission
							? commission.mbeCommission.toLocaleString("en-GB")
							: "0",
						partnerCommission: commission.partnerCommission
							? commission.partnerCommission.toLocaleString("en-GB")
							: "0",
						splitPercent: commission.splitPercent
							? `${commission.splitPercent}%`
							: "N/A",
						agentPaid: commission.agentPaid ? "Yes" : "No",
						partnerPaid: commission.partnerPaid ? "Yes" : "No",
						paymentStatus: commission.paymentStatus || "N/A",
						commissionDate: commission.date_created
							? new Date(commission.date_created).toLocaleDateString()
							: "N/A",
						lastUpdated: commission.updated_at
							? new Date(commission.updated_at).toLocaleDateString()
							: "N/A",

						// Location Details
						agentState:
							agentKyc?.state ||
							agentFromAllData?.state ||
							agent.state ||
							"N/A",
						agentCity: agentKyc?.city || "N/A",
						spCompanyState: scanPartner?.companyState || "N/A",
						spCompanyCity: scanPartner?.companyCity || "N/A",
					};

					const row = commissionWs.addRow(rowData);

					// Apply color coding based on scan partner
					const color = scanPartnerColorMap.get(scanPartner?.userId);
					if (color) {
						row.eachCell((cell) => {
							cell.fill = {
								type: "pattern",
								pattern: "solid",
								fgColor: { argb: color },
							};
						});
					}

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

					// Apply conditional formatting for agent/partner paid status
					const agentPaidCell = row.getCell("agentPaid");
					const partnerPaidCell = row.getCell("partnerPaid");

					if (commission.agentPaid) {
						agentPaidCell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FF90EE90" }, // Light green
						};
					} else {
						agentPaidCell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FFFFCCCB" }, // Light red
						};
					}

					if (commission.partnerPaid) {
						partnerPaidCell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FF90EE90" }, // Light green
						};
					} else {
						partnerPaidCell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FFFFCCCB" }, // Light red
						};
					}
				});
			});
			// Add autofilter with freeze panes
			commissionWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: { row: commissionRowIndex, column: commissionWs.columns.length },
			};

			// --- 2. Agent Commission Sheet (Enhanced) ---
			const agentCommissionWs = wb.addWorksheet("Agent Commission");
			agentCommissionWs.columns = [
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

			let agentCommissionRowIndex = 1;
			commissionAgents.forEach((agent: any) => {
				// Find scan partner data from allAgentData for complete information
				let scanPartnerData = null;
				let agentFromAllData = null;
				for (const spData of allAgentData) {
					const matchingAgent = spData.agents?.find(
						(a: any) => a.mbeId === agent.mbeId
					);
					if (matchingAgent) {
						scanPartnerData = spData;
						agentFromAllData = matchingAgent;
						break;
					}
				}

				const scanPartner = scanPartnerData || agent?.scanPartner || {};
				const agentAccount =
					agentFromAllData?.MbeAccountDetails || agent?.MbeAccountDetails || {};
				const agentKyc = agentFromAllData?.MbeKyc || agent?.MbeKyc || {};

				// Calculate commission statistics
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
				const commissionCount = commissions.length;
				const avgCommission =
					commissionCount > 0 ? totalCommission / commissionCount : 0;
				const paidCommissions = commissions.filter(
					(c: any) => c.agentPaid
				).length;
				const unpaidCommissions = commissionCount - paidCommissions;

				// Get latest commission date
				const latestCommissionDate =
					commissions.length > 0
						? commissions.reduce((latest: any, c: any) => {
								const currentDate = new Date(c.date_created);
								const latestDate = new Date(latest.date_created);
								return currentDate > latestDate ? c : latest;
						  }).date_created
						: null;

				const rowData = {
					sn: agentCommissionRowIndex++,
					agentName: `${agent.firstname || ""} ${agent.lastname || ""}`.trim(),
					mbeId: agent.mbeId || "N/A",
					agentEmail: agent.email || "N/A",
					agentPhone: agent.phone || "N/A",
					agentStatus: agent.accountStatus || "N/A",
					partnerName: scanPartner?.companyName || "N/A",
					partnerUserId: scanPartner?.userId || "N/A",
					agentState:
						agentKyc?.state || agentFromAllData?.state || agent.state || "N/A",
					agentCity: agentKyc?.city || "N/A",
					totalCommission: totalCommission.toLocaleString("en-GB"),
					totalAgentCommission: totalAgentCommission.toLocaleString("en-GB"),
					totalPartnerCommission:
						totalPartnerCommission.toLocaleString("en-GB"),
					commissionCount,
					avgCommission:
						avgCommission > 0 ? avgCommission.toLocaleString("en-GB") : "0",
					paidCommissions,
					unpaidCommissions,
					agentAccountName: agentAccount?.accountName || "N/A",
					agentAccountNumber: agentAccount?.accountNumber || "N/A",
					agentBankName: agentAccount?.bankName || "N/A",
					latestCommissionDate: latestCommissionDate
						? new Date(latestCommissionDate).toLocaleDateString()
						: "N/A",
				};

				const row = agentCommissionWs.addRow(rowData);

				// Apply color coding based on scan partner
				const color = scanPartnerColorMap.get(scanPartner?.userId);
				if (color) {
					row.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: color },
						};
					});
				}

				// Highlight unpaid commissions
				if (unpaidCommissions > 0) {
					row.getCell("unpaidCommissions").fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFFFCCCB" }, // Light red
					};
				}
			});

			// Style header row
			const agentHeaderRow = agentCommissionWs.getRow(1);
			agentHeaderRow.font = { bold: true, size: 11 };

			// Add autofilter
			agentCommissionWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: {
					row: agentCommissionRowIndex,
					column: agentCommissionWs.columns.length,
				},
			};

			// --- 3. Partner Commission Sheet (Enhanced) ---
			const partnerCommissionWs = wb.addWorksheet("Partner Commission");
			partnerCommissionWs.columns = [
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

			// Group by partner with enhanced data
			const partnerMap = new Map();
			commissionAgents.forEach((agent: any) => {
				// Find scan partner data from allAgentData
				let scanPartnerData = null;
				for (const spData of allAgentData) {
					if (spData.agents?.some((a: any) => a.mbeId === agent.mbeId)) {
						scanPartnerData = spData;
						break;
					}
				}

				const scanPartner = scanPartnerData || agent?.scanPartner || {};
				const partnerId = scanPartner?.userId || "N/A";
				const partnerName = scanPartner?.companyName || "N/A";

				if (!partnerMap.has(partnerId)) {
					partnerMap.set(partnerId, {
						partnerName,
						partnerUserId: partnerId,
						partnerEmail: scanPartner?.email || "N/A",
						partnerPhone: scanPartner?.telephoneNumber || "N/A",
						companyState: scanPartner?.companyState || "N/A",
						companyCity: scanPartner?.companyCity || "N/A",
						accountStatus: scanPartner?.accountStatus || "N/A",
						totalCommission: 0,
						totalAgentCommission: 0,
						totalPartnerCommission: 0,
						commissionCount: 0,
						agentCount: 0,
						activeAgents: 0,
						inactiveAgents: 0,
						partnerPaidCommissions: 0,
						partnerUnpaidCommissions: 0,
						spAccountName:
							scanPartner?.UserAccountDetails?.[0]?.accountName || "N/A",
						spAccountNumber:
							scanPartner?.UserAccountDetails?.[0]?.accountNumber || "N/A",
						spBankName: scanPartner?.UserAccountDetails?.[0]?.bankName || "N/A",
						agents: [],
					});
				}

				const partner = partnerMap.get(partnerId);
				const commissions = agent.Commission || [];

				partner.totalCommission += commissions.reduce(
					(sum: number, c: any) => sum + (c.commission || 0),
					0
				);
				partner.totalAgentCommission += commissions.reduce(
					(sum: number, c: any) => sum + (c.mbeCommission || 0),
					0
				);
				partner.totalPartnerCommission += commissions.reduce(
					(sum: number, c: any) => sum + (c.partnerCommission || 0),
					0
				);
				partner.commissionCount += commissions.length;
				partner.agentCount += 1;
				partner.agents.push(agent);

				// Count active/inactive agents
				if (agent.isActive) {
					partner.activeAgents += 1;
				} else {
					partner.inactiveAgents += 1;
				}

				// Count paid/unpaid partner commissions
				partner.partnerPaidCommissions += commissions.filter(
					(c: any) => c.partnerPaid
				).length;
				partner.partnerUnpaidCommissions += commissions.filter(
					(c: any) => !c.partnerPaid
				).length;
			});

			let partnerCommissionRowIndex = 1;
			Array.from(partnerMap.values()).forEach((partner: any) => {
				const avgCommissionPerAgent =
					partner.agentCount > 0
						? partner.totalCommission / partner.agentCount
						: 0;
				const avgCommissionPerTransaction =
					partner.commissionCount > 0
						? partner.totalCommission / partner.commissionCount
						: 0;

				const rowData = {
					sn: partnerCommissionRowIndex++,
					partnerName: partner.partnerName,
					partnerUserId: partner.partnerUserId,
					partnerEmail: partner.partnerEmail,
					partnerPhone: partner.partnerPhone,
					companyState: partner.companyState,
					companyCity: partner.companyCity,
					accountStatus: partner.accountStatus,
					totalCommission: partner.totalCommission.toLocaleString("en-GB"),
					totalAgentCommission:
						partner.totalAgentCommission.toLocaleString("en-GB"),
					totalPartnerCommission:
						partner.totalPartnerCommission.toLocaleString("en-GB"),
					commissionCount: partner.commissionCount,
					agentCount: partner.agentCount,
					activeAgents: partner.activeAgents,
					inactiveAgents: partner.inactiveAgents,
					avgCommissionPerAgent:
						avgCommissionPerAgent > 0
							? avgCommissionPerAgent.toLocaleString("en-GB")
							: "0",
					avgCommissionPerTransaction:
						avgCommissionPerTransaction > 0
							? avgCommissionPerTransaction.toLocaleString("en-GB")
							: "0",
					partnerPaidCommissions: partner.partnerPaidCommissions,
					partnerUnpaidCommissions: partner.partnerUnpaidCommissions,
					spAccountName: partner.spAccountName,
					spAccountNumber: partner.spAccountNumber,
					spBankName: partner.spBankName,
				};

				const row = partnerCommissionWs.addRow(rowData);

				// Apply color coding based on scan partner
				const color = scanPartnerColorMap.get(partner.partnerUserId);
				if (color) {
					row.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: color },
						};
					});
				}

				// Highlight partners with unpaid commissions
				if (partner.partnerUnpaidCommissions > 0) {
					row.getCell("partnerUnpaidCommissions").fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFFFCCCB" }, // Light red
					};
				}
			});

			// Style header row
			const partnerHeaderRow = partnerCommissionWs.getRow(1);
			partnerHeaderRow.font = { bold: true, size: 11 };

			// Add autofilter
			partnerCommissionWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: {
					row: partnerCommissionRowIndex,
					column: partnerCommissionWs.columns.length,
				},
			};

			// --- 4. Commission Summary Sheet (Enhanced) ---
			const commissionSummaryWs = wb.addWorksheet("Commission Summary");
			commissionSummaryWs.columns = [
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

			// Enhanced Agent summary
			commissionAgents.forEach((agent: any) => {
				// Find scan partner data from allAgentData
				let scanPartnerData = null;
				let agentFromAllData = null;
				for (const spData of allAgentData) {
					const matchingAgent = spData.agents?.find(
						(a: any) => a.mbeId === agent.mbeId
					);
					if (matchingAgent) {
						scanPartnerData = spData;
						agentFromAllData = matchingAgent;
						break;
					}
				}

				const agentKyc = agentFromAllData?.MbeKyc || agent?.MbeKyc || {};
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
				const commissionCount = commissions.length;
				const avgPerTransaction =
					commissionCount > 0 ? totalCommission / commissionCount : 0;
				const paidCount = commissions.filter((c: any) => c.agentPaid).length;
				const unpaidCount = commissionCount - paidCount;

				const location =
					agentKyc?.city && agentKyc?.state
						? `${agentKyc.city}, ${agentKyc.state}`
						: agentKyc?.state ||
						  agentFromAllData?.state ||
						  agent.state ||
						  "Unknown";

				const rowData = {
					type: "Agent",
					name: `${agent.firstname || ""} ${agent.lastname || ""}`.trim(),
					id: agent.mbeId || "N/A",
					location,
					status: agent.accountStatus || "N/A",
					totalCommission: totalCommission.toLocaleString("en-GB"),
					totalAgentCommission: totalAgentCommission.toLocaleString("en-GB"),
					totalPartnerCommission:
						totalPartnerCommission.toLocaleString("en-GB"),
					commissionCount,
					avgPerTransaction:
						avgPerTransaction > 0
							? avgPerTransaction.toLocaleString("en-GB")
							: "0",
					paidCount,
					unpaidCount,
				};

				const row = commissionSummaryWs.addRow(rowData);

				// Apply color coding
				const color = scanPartnerColorMap.get(scanPartnerData?.userId);
				if (color) {
					row.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: color },
						};
					});
				}
			});

			// Enhanced Partner summary
			Array.from(partnerMap.values()).forEach((partner: any) => {
				const avgPerTransaction =
					partner.commissionCount > 0
						? partner.totalCommission / partner.commissionCount
						: 0;

				const location =
					partner.companyCity && partner.companyState
						? `${partner.companyCity}, ${partner.companyState}`
						: partner.companyState || "Unknown";

				const rowData = {
					type: "Partner",
					name: partner.partnerName,
					id: partner.partnerUserId,
					location,
					status: partner.accountStatus,
					totalCommission: partner.totalCommission.toLocaleString("en-GB"),
					totalAgentCommission:
						partner.totalAgentCommission.toLocaleString("en-GB"),
					totalPartnerCommission:
						partner.totalPartnerCommission.toLocaleString("en-GB"),
					commissionCount: partner.commissionCount,
					avgPerTransaction:
						avgPerTransaction > 0
							? avgPerTransaction.toLocaleString("en-GB")
							: "0",
					paidCount: partner.partnerPaidCommissions,
					unpaidCount: partner.partnerUnpaidCommissions,
				};

				const row = commissionSummaryWs.addRow(rowData);

				// Apply color coding
				const color = scanPartnerColorMap.get(partner.partnerUserId);
				if (color) {
					row.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: color },
						};
					});
				}
			});

			// Style header row
			const summaryHeaderRow = commissionSummaryWs.getRow(1);
			summaryHeaderRow.font = { bold: true, size: 11 };

			// Add autofilter
			commissionSummaryWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: {
					row: commissionSummaryWs.rowCount,
					column: commissionSummaryWs.columns.length,
				},
			};
			// 1. Scan Partner Summary Sheet
			const scanPartnerWs = wb.addWorksheet("Scan Partners Summary");
			scanPartnerWs.columns = [
				{ header: "S/N", key: "sn", width: 8 },
				{ header: "User ID", key: "userId", width: 25 },
				{ header: "Company Name", key: "companyName", width: 25 },
				{ header: "Full Name", key: "fullName", width: 25 },
				{ header: "Email", key: "email", width: 30 },
				{ header: "Phone", key: "telephoneNumber", width: 20 },
				{ header: "Account Name", key: "accountName", width: 25 },
				{ header: "Account Number", key: "accountNumber", width: 20 },
				{ header: "Bank Name", key: "bankName", width: 25 },
				{ header: "Bank Code", key: "bankCode", width: 15 },
				{ header: "VFD Bank Code", key: "vfdBankCode", width: 15 },
				{ header: "VFD Bank Name", key: "vfdBankName", width: 25 },
				{ header: "Company Address", key: "companyAddress", width: 40 },
				{ header: "Company State", key: "companyState", width: 20 },
				{ header: "Company City", key: "companyCity", width: 20 },
				{ header: "Company LGA", key: "companyLGA", width: 20 },
				{ header: "Account Type", key: "accountType", width: 15 },
				{ header: "Account Status", key: "accountStatus", width: 15 },
				{ header: "Is Active", key: "isActive", width: 12 },
				{ header: "Total Agents", key: "totalAgents", width: 15 },
				{ header: "Active Agents", key: "activeAgents", width: 15 },
				{ header: "Inactive Agents", key: "inactiveAgents", width: 15 },
				{ header: "Pending Agents", key: "pendingAgents", width: 15 },
				{ header: "Approved Agents", key: "approvedAgents", width: 15 },
				{ header: "Verified Agents", key: "verifiedAgents", width: 15 },
				{ header: "Unverified Agents", key: "unverifiedAgents", width: 15 },
				{ header: "Created At", key: "createdAt", width: 20 },
			];

			// Add scan partner data with agent statistics using allAgentData
			allAgentData.forEach((scanPartnerData: any, index: number) => {
				const agents = scanPartnerData.agents || [];

				const totalAgents = agents.length;
				const activeAgents = agents.filter(
					(agent: any) => agent.isActive
				).length;
				const inactiveAgents = totalAgents - activeAgents;
				const pendingAgents = agents.filter(
					(agent: any) => agent.accountStatus === "PENDING"
				).length;
				const approvedAgents = agents.filter(
					(agent: any) => agent.accountStatus === "APPROVED"
				).length;
				const verifiedAgents = agents.filter(
					(agent: any) =>
						agent.accountStatus === "VERIFIED" ||
						agent.accountStatus === "APPROVED"
				).length;
				const unverifiedAgents = totalAgents - verifiedAgents;

				const rowData = {
					sn: index + 1,
					userId: scanPartnerData.userId,
					companyName: scanPartnerData.companyName,
					fullName: `${capitalize(scanPartnerData.firstName)} ${capitalize(
						scanPartnerData.lastName
					)}`,
					email: scanPartnerData.email,
					telephoneNumber: scanPartnerData.telephoneNumber,
					companyAddress: scanPartnerData.companyAddress || "N/A",
					companyState: scanPartnerData.companyState || "N/A",
					companyCity: scanPartnerData.companyCity || "N/A",
					companyLGA: scanPartnerData.companyLGA || "N/A",
					accountType: scanPartnerData.accountType,
					accountStatus: capitalize(scanPartnerData.accountStatus || ""),
					isActive: scanPartnerData.isActive ? "Yes" : "No",
					totalAgents,
					activeAgents,
					inactiveAgents,
					pendingAgents,
					approvedAgents,
					verifiedAgents,
					unverifiedAgents,
					createdAt: new Date(scanPartnerData.createdAt).toLocaleDateString(),
					accountNumber:
						scanPartnerData?.UserAccountDetails?.[0]?.accountNumber || "N/A",
					accountName:
						scanPartnerData?.UserAccountDetails?.[0]?.accountName || "N/A",
					bankName: scanPartnerData?.UserAccountDetails?.[0]?.bankName || "N/A",
					bankCode: scanPartnerData?.UserAccountDetails?.[0]?.bankCode || "N/A",
					vfdBankCode:
						scanPartnerData?.UserAccountDetails?.[0]?.vfdBankCode || "N/A",
					vfdBankName:
						scanPartnerData?.UserAccountDetails?.[0]?.vfdBankName || "N/A",
				};
				const row = scanPartnerWs.addRow(rowData);

				// Apply color coding for this scan partner
				const color = scanPartnerColorMap.get(scanPartnerData.userId);
				row.eachCell((cell) => {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: color },
					};
				});
			});

			// Add autofilter to Scan Partner Summary sheet
			scanPartnerWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: {
					row: allAgentData.length + 1,
					column: scanPartnerWs.columns.length,
				},
			};

			// 2. MBE Details Sheet
			const mbeWs = wb.addWorksheet("MBE Details");
			mbeWs.columns = [
				{ header: "S/N", key: "sn", width: 8 },
				{
					header: "Scan Partner Company",
					key: "scanPartnerCompany",
					width: 25,
				},
				{ header: "Scan Partner User ID", key: "scanPartnerUserId", width: 25 },
				{ header: "MBE ID", key: "mbeId", width: 20 },
				{ header: "Old MBE ID", key: "oldMbeId", width: 15 },
				{ header: "Title", key: "title", width: 15 },
				{ header: "Full Name", key: "fullName", width: 20 },

				{ header: "First Name", key: "firstName", width: 20 },
				{ header: "Last Name", key: "lastName", width: 20 },
				{ header: "Username", key: "username", width: 20 },
				{ header: "Email", key: "email", width: 30 },
				{ header: "Phone", key: "phone", width: 20 },
				{ header: "State", key: "state", width: 15 },
				{ header: "BVN", key: "bvn", width: 15 },
				{ header: "BVN Phone", key: "bvnPhone", width: 20 },
				{ header: "Date of Birth", key: "dob", width: 15 },
				{ header: "Account Status", key: "accountStatus", width: 15 },
				{ header: "Role", key: "role", width: 15 },
				{ header: "Is Active", key: "isActive", width: 12 },
				{ header: "Channel", key: "channel", width: 15 },
				{ header: "Created At", key: "createdAt", width: 20 },
				{ header: "Updated At", key: "updatedAt", width: 20 },
				{ header: "Image URL", key: "imageUrl", width: 40 },
				{ header: "Gender", key: "gender", width: 12 },
				{ header: "House Number", key: "houseNumber", width: 15 },
				{ header: "Street Address", key: "streetAddress", width: 30 },
				{ header: "Landmark", key: "landmark", width: 20 },
				{ header: "Local Government", key: "localGovernment", width: 20 },
				{ header: "KYC State", key: "kycState", width: 15 },
				{ header: "City", key: "city", width: 15 },
				{ header: "Full Address", key: "fullAddress", width: 40 },
				{ header: "Address Status", key: "addressStatus", width: 15 },
				{ header: "Provisional", key: "provisional", width: 12 },
				{ header: "Account Name", key: "accountName", width: 25 },
				{ header: "Account Number", key: "accountNumber", width: 20 },
				{ header: "Bank Name", key: "bankName", width: 25 },
				{ header: "Bank Code", key: "bankCode", width: 15 },
				{ header: "Recipient Code", key: "recipientCode", width: 20 },
				{ header: "VFD Bank Code", key: "vfdBankCode", width: 15 },
				{ header: "VFD Bank Name", key: "vfdBankName", width: 25 },
				{ header: "Wallet Balance", key: "walletBalance", width: 20 },
				{ header: "Number of Stores", key: "numberOfStores", width: 15 },
				{
					header: "Number of Guarantors",
					key: "numberOfGuarantors",
					width: 20,
				},
				{ header: "Guarantor 1 Name", key: "guarantor1Name", width: 25 },
				{ header: "Guarantor 1 Phone", key: "guarantor1Phone", width: 20 },
				{
					header: "Guarantor 1 Relationship",
					key: "guarantor1Relationship",
					width: 20,
				},
				{ header: "Guarantor 1 Status", key: "guarantor1Status", width: 15 },
				{ header: "Guarantor 1 Reason", key: "guarantor1Reason", width: 15 },
				{ header: "Guarantor 2 Name", key: "guarantor2Name", width: 25 },
				{ header: "Guarantor 2 Phone", key: "guarantor2Phone", width: 20 },
				{
					header: "Guarantor 2 Relationship",
					key: "guarantor2Relationship",
					width: 20,
				},
				{ header: "Guarantor 2 Status", key: "guarantor2Status", width: 15 },
				{ header: "Guarantor 2 Reason", key: "guarantor2Reason", width: 15 },
			];

			let mbeRowIndex = 1;
			// Process each scan partner's agents using allAgentData
			for (const scanPartnerData of allAgentData) {
				const agents = scanPartnerData.agents || [];
				const color = scanPartnerColorMap.get(scanPartnerData.userId);

				for (const agent of agents) {
					const guarantors = agent.MbeGuarantor || [];
					const guarantor1 = guarantors[0];
					const guarantor2 = guarantors[1];

					// Calculate provisional status: more granular based on guarantor statuses
					const approvedGuarantors = guarantors.filter(
						(guarantor: any) => guarantor.guarantorStatus === "APPROVED"
					);
					const rejectedGuarantors = guarantors.filter(
						(guarantor: any) => guarantor.guarantorStatus === "REJECTED"
					);
					const pendingGuarantors = guarantors.filter(
						(guarantor: any) => guarantor.guarantorStatus === "PENDING"
					);

					let provisionalStatus = "No";

					// Only provisional if exactly one guarantor is approved
					if (approvedGuarantors.length === 1) {
						if (rejectedGuarantors.length === 1) {
							provisionalStatus = "Provisional Rejected";
						} else if (pendingGuarantors.length === 1) {
							provisionalStatus = "Provisional Pending";
						} else {
							provisionalStatus = "Provisional Agnostic";
						}
					}

					const rowData = {
						sn: mbeRowIndex++,
						scanPartnerCompany: scanPartnerData.companyName,
						scanPartnerUserId: scanPartnerData.userId,
						mbeId: agent.mbeId,
						oldMbeId: agent.mbe_old_id || "N/A",
						title: agent.title || "N/A",
						fullName: `${agent?.firstname} ${agent.lastname}`,
						firstName: agent.firstname,
						lastName: agent.lastname,
						username: agent.username,
						email: agent.email,
						phone: agent.phone,
						state: agent.state || "N/A",
						bvn: agent.bvn,
						bvnPhone: agent.bvnPhoneNumber,
						dob: agent.dob ? new Date(agent.dob).toLocaleDateString() : "N/A",
						accountStatus: agent.accountStatus,
						role: agent.role,
						isActive: agent.isActive ? "Yes" : "No",
						channel: agent.channel,
						createdAt: new Date(agent.createdAt).toLocaleDateString(),
						updatedAt: new Date(agent.updatedAt).toLocaleDateString(),
						imageUrl: agent.imageUrl || "N/A",
						gender: agent.MbeKyc?.gender || "N/A",
						houseNumber: agent.MbeKyc?.houseNumber || "N/A",
						streetAddress: agent.MbeKyc?.streetAddress || "N/A",
						landmark: agent.MbeKyc?.landMark || "N/A",
						localGovernment: agent.MbeKyc?.localGovernment || "N/A",
						kycState: agent.MbeKyc?.state || "N/A",
						city: agent.MbeKyc?.city || "N/A",
						fullAddress: agent.MbeKyc?.fullAddress || "N/A",
						addressStatus: agent.MbeKyc?.addressStatus || "N/A",
						provisional: provisionalStatus,
						accountName: agent.MbeAccountDetails?.accountName || "N/A",
						accountNumber: agent.MbeAccountDetails?.accountNumber || "N/A",
						bankName: agent.MbeAccountDetails?.bankName || "N/A",
						bankCode: agent.MbeAccountDetails?.bankCode || "N/A",
						recipientCode: agent.MbeAccountDetails?.recipientCode || "N/A",
						vfdBankCode: agent.MbeAccountDetails?.vfdBankCode || "N/A",
						vfdBankName: agent.MbeAccountDetails?.vfdBankName || "N/A",
						walletBalance: agent.MbeAccountDetails?.walletBalance || "0",
						numberOfStores: agent.storesNew ? 1 : 0,
						numberOfGuarantors: guarantors.length,
						guarantor1Name: guarantor1?.guarantorName || "N/A",
						guarantor1Phone: guarantor1?.guarantorPhone || "N/A",
						guarantor1Relationship: guarantor1?.guarantorRelationship || "N/A",
						guarantor1Status: guarantor1?.guarantorStatus || "N/A",
						guarantor1Reason: guarantor1?.comment,
						guarantor2Name: guarantor2?.guarantorName || "N/A",
						guarantor2Phone: guarantor2?.guarantorPhone || "N/A",
						guarantor2Relationship: guarantor2?.guarantorRelationship || "N/A",
						guarantor2Status: guarantor2?.guarantorStatus || "N/A",
						guarantor2Reason: guarantor2?.comment,
					};

					const row = mbeWs.addRow(rowData);

					// Apply color coding for this scan partner
					row.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: color },
						};
					});
				}
			}

			// Add autofilter to MBE Details sheet
			mbeWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: { row: mbeRowIndex, column: mbeWs.columns.length },
			};

			const customersWs = wb.addWorksheet("Customer Sales Details");
			customersWs.columns = [
				{ header: "Customer Id", key: "customerId", width: 20 },
				{ header: "Loan ID", key: "loanRecordId", width: 20 },
				{ header: "Name", key: "fullName", width: 25 },
				{ header: "Phone No.", key: "bvnPhoneNumber", width: 20 },
				{ header: "Alt. No.", key: "mainPhoneNumber", width: 20 },
				{ header: "Email", key: "email", width: 30 },
				{ header: "Age", key: "age", width: 10 },
				{ header: "House No.", key: "houseNumber", width: 15 },
				{ header: "Street", key: "streetAddress", width: 30 },
				{ header: "Nearest Bus Stop", key: "nearestBusStop", width: 25 },
				{ header: "City", key: "city", width: 20 },
				{ header: "Region", key: "customerRegion", width: 20 },
				{ header: "State", key: "customerState", width: 20 },
				{ header: "Occupation", key: "occupation", width: 25 },
				{ header: "Business Name", key: "businessName", width: 30 },
				{ header: "Business Address", key: "businessAddress", width: 40 },
				{ header: "Device Name", key: "deviceName", width: 25 },
				{ header: "IMEI", key: "imei", width: 20 },
				{ header: "Device Status", key: "deviceStatus", width: 15 },
				{ header: "Insurance Package", key: "insurancePackage", width: 20 },
				{ header: "Insurance Price", key: "insurancePrice", width: 18 },
				{ header: "Device Price", key: "devicePrice", width: 15 },
				{ header: "Store Price", key: "storePrice", width: 15 },
				{ header: "Loan Amount", key: "loanAmount", width: 15 },
				{ header: "Down Payment", key: "downPayment", width: 15 },
				{ header: "Monthly Repayment", key: "monthlyRepayment", width: 18 },
				{ header: "Amount Remaining", key: "amountRemaining", width: 18 },
				{ header: "Loan Tenure", key: "duration", width: 12 },
				{ header: "Application Date", key: "createdAt", width: 18 },
				{ header: "Next Pay Date", key: "nextPayDate", width: 15 },
				{ header: "Next Pay Amount", key: "nextPayAmount", width: 18 },
				{ header: "Completion Date", key: "completionDate", width: 18 },
				{ header: "Sale Channel", key: "saleChannel", width: 15 },
				{ header: "Sale Person", key: "salePerson", width: 25 },
				{ header: "Store Name", key: "storeName", width: 25 },
				{ header: "Cluster", key: "cluster", width: 15 },
				{ header: "Region", key: "mbeRegion", width: 20 },
				{ header: "State", key: "mbeState", width: 20 },
				{ header: "Source", key: "source", width: 15 },
				{ header: "Loan Status", key: "loanStatus", width: 15 },
				// Enhanced MBE Details
				{ header: "MBE ID", key: "mbeId", width: 20 },
				{ header: "MBE Old ID", key: "mbeOldId", width: 15 },
				{ header: "MBE BVN", key: "mbeBvn", width: 15 },
				{ header: "MBE DOB", key: "mbeDob", width: 15 },
				// Agent Bank Details
				{ header: "Agent Account Name", key: "agentAccountName", width: 25 },
				{
					header: "Agent Account Number",
					key: "agentAccountNumber",
					width: 20,
				},
				{ header: "Agent Bank Name", key: "agentBankName", width: 25 },
				{ header: "Agent Bank Code", key: "agentBankCode", width: 15 },
				{
					header: "Agent Recipient Code",
					key: "agentRecipientCode",
					width: 20,
				},
				// VFD Data
				{ header: "VFD Bank Name", key: "vfdBankName", width: 25 },
				{ header: "VFD Bank Code", key: "vfdBankCode", width: 15 },
				// Scan Partner Details
				{
					header: "Scan Partner Company",
					key: "scanPartnerCompany",
					width: 25,
				},
				{ header: "Scan Partner Name", key: "scanPartnerName", width: 25 },
				{ header: "Scan Partner Phone", key: "scanPartnerPhone", width: 20 },
				{ header: "Scan Partner Email", key: "scanPartnerEmail", width: 30 },
				// Scan Partner Bank Details
				{ header: "SP Account Name", key: "spAccountName", width: 25 },
				{ header: "SP Account Number", key: "spAccountNumber", width: 20 },
				{ header: "SP Bank Name", key: "spBankName", width: 25 },
				{ header: "SP Bank Code", key: "spBankCode", width: 15 },
				{ header: "SP VFD Bank Name", key: "spVfdBankName", width: 25 },
				{ header: "SP VFD Bank Code", key: "spVfdBankCode", width: 15 },
			];

			// Fetch customer records data for comprehensive sales details
			// Customer records already fetched above for IMEI mapping

			// Process customer records and add comprehensive data
			let customerRowIndex = 2; // Start at 2 (after header row)
			for (const customer of customerRecords) {
				// Only include customers with approved loans and proper sale channels
				if (
					!customer.LoanRecord?.[0] ||
					customer.LoanRecord[0]?.loanStatus !== "APPROVED" ||
					!customer.regBy ||
					customer.regBy.title === "XIAOMI PROMOTER" ||
					customer.regBy.title === "SAMSUNG PROMOTER" ||
					customer.regBy.title === "OPPO PROMOTER"
				) {
					continue;
				}

				// Find the corresponding scan partner and agent data
				let scanPartnerInfo = null;
				let agentInfo = null;

				for (const scanPartnerData of allAgentData) {
					const agents = scanPartnerData.agents || [];
					const matchingAgent = agents.find(
						(agent: any) => agent.mbeId === customer.regBy?.mbeId
					);

					if (matchingAgent) {
						scanPartnerInfo = scanPartnerData;
						agentInfo = matchingAgent;
						break;
					}
				}

				const rowData = {
					customerId: customer.customerId || "N/A",
					loanRecordId: customer.LoanRecord?.[0]?.loanRecordId || "N/A",
					fullName:
						customer.firstName && customer.lastName
							? `${
									customer.firstName[0].toUpperCase() +
									customer.firstName.slice(1).toLowerCase()
							  } ${
									customer.lastName[0].toUpperCase() +
									customer.lastName.slice(1).toLowerCase()
							  }`
							: "N/A",
					bvnPhoneNumber: customer.bvnPhoneNumber || "N/A",
					mainPhoneNumber: customer.mainPhoneNumber || "N/A",
					email: customer.email || "N/A",
					age: customer.dob
						? `${
								new Date().getFullYear() - new Date(customer.dob).getFullYear()
						  }`
						: "N/A",
					houseNumber: customer.CustomerKYC?.[0]?.houseNumber || "N/A",
					streetAddress: customer.CustomerKYC?.[0]?.streetAddress || "N/A",
					nearestBusStop: customer.CustomerKYC?.[0]?.nearestBusStop || "N/A",
					city: customer.CustomerKYC?.[0]?.town || "N/A",
					customerRegion: customer.CustomerKYC?.[0]?.localGovernment || "N/A",
					customerState: customer.CustomerKYC?.[0]?.state || "N/A",
					occupation: customer.CustomerKYC?.[0]?.occupation || "N/A",
					businessName: customer.CustomerKYC?.[0]?.businessName || "N/A",
					businessAddress:
						customer.CustomerKYC?.[0]?.applicantBusinessAddress || "N/A",
					deviceName: customer.LoanRecord?.[0]?.deviceName || "N/A",
					imei: customer.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.imei || "N/A",
					deviceStatus:
						customer.LoanRecord?.[0]?.DeviceOnLoan?.[0]?.status || "N/A",
					insurancePackage: customer.LoanRecord?.[0]?.insurancePackage || "N/A",
					insurancePrice: customer.LoanRecord?.[0]?.insurancePrice
						? `${customer.LoanRecord[0].insurancePrice.toLocaleString("en-GB")}`
						: "N/A",
					devicePrice: customer.LoanRecord?.[0]?.device?.price
						? `${customer.LoanRecord[0].device.price.toLocaleString("en-GB")}`
						: "N/A",
					storePrice: customer.LoanRecord?.[0]?.devicePrice
						? `${customer.LoanRecord[0].devicePrice.toLocaleString("en-GB")}`
						: "N/A",
					loanAmount: customer.LoanRecord?.[0]?.loanAmount
						? `${customer.LoanRecord[0].loanAmount.toLocaleString("en-GB")}`
						: "N/A",
					downPayment: customer.LoanRecord?.[0]?.downPayment
						? `${customer.LoanRecord[0].downPayment.toLocaleString("en-GB")}`
						: "N/A",
					monthlyRepayment: customer.LoanRecord?.[0]?.monthlyRepayment
						? `${customer.LoanRecord[0].monthlyRepayment.toLocalString(
								"en-GB"
						  )}`
						: "N/A",
					amountRemaining:
						customer.LoanRecord?.[0]?.monthlyRepayment &&
						customer.LoanRecord[0]?.duration
							? `${(
									customer.LoanRecord[0].monthlyRepayment *
									customer.LoanRecord[0].duration
							  ).toLocaleString("en-GB")}`
							: "N/A",
					duration: customer.LoanRecord?.[0]?.duration || "N/A",
					createdAt: customer.LoanRecord?.[0]?.createdAt
						? new Date(customer.LoanRecord[0].createdAt).toLocaleDateString()
						: "N/A",
					nextPayDate: customer.LoanRecord?.[0]?.createdAt
						? new Date(
								new Date(customer.LoanRecord[0].createdAt).setMonth(
									new Date(customer.LoanRecord[0].createdAt).getMonth() + 1
								)
						  ).toLocaleDateString()
						: "N/A",
					nextPayAmount: customer.LoanRecord?.[0]?.monthlyRepayment
						? `${customer.LoanRecord[0].monthlyRepayment.toLocalString(
								"en-GB"
						  )}`
						: "N/A",
					completionDate:
						customer.LoanRecord?.[0]?.createdAt &&
						customer.LoanRecord[0]?.duration
							? new Date(
									new Date(customer.LoanRecord[0].createdAt).setMonth(
										new Date(customer.LoanRecord[0].createdAt).getMonth() +
											customer.LoanRecord[0].duration
									)
							  ).toLocaleDateString()
							: "N/A",
					saleChannel: customer.regBy?.title || "N/A",
					salePerson:
						customer.regBy?.firstname && customer.regBy?.lastname
							? `${customer.regBy.firstname} ${customer.regBy.lastname}`
							: "N/A",
					storeName: customer.LoanRecord?.[0]?.store?.storeName || "N/A",
					cluster: customer.LoanRecord?.[0]?.store?.clusterId || "N/A",
					mbeRegion: customer.CustomerKYC?.[0]?.localGovernment || "N/A",
					mbeState: customer.LoanRecord?.[0]?.store?.state || "N/A",
					source: customer.CustomerKYC?.[0]?.source || "N/A",
					loanStatus: customer.LoanRecord?.[0]?.loanStatus || "N/A",

					// Enhanced MBE Details
					mbeId: customer.regBy?.mbeId || "N/A",
					mbeOldId: customer.regBy?.mbe_old_id || "N/A",
					mbeBvn: customer.regBy?.bvn || "N/A",
					mbeDob: customer.regBy?.dob
						? new Date(customer.regBy.dob).toLocaleDateString()
						: "N/A",

					// Agent Bank Details
					agentAccountName: agentInfo?.MbeAccountDetails?.accountName || "N/A",
					agentAccountNumber:
						agentInfo?.MbeAccountDetails?.accountNumber || "N/A",
					agentBankName: agentInfo?.MbeAccountDetails?.bankName || "N/A",
					agentBankCode: agentInfo?.MbeAccountDetails?.bankCode || "N/A",
					agentRecipientCode:
						agentInfo?.MbeAccountDetails?.recipientCode || "N/A",

					// VFD Data
					vfdBankName: agentInfo?.MbeAccountDetails?.vfdBankName || "N/A",
					vfdBankCode: agentInfo?.MbeAccountDetails?.vfdBankCode || "N/A",

					// Scan Partner Details
					scanPartnerCompany: scanPartnerInfo?.companyName || "N/A",
					scanPartnerName: scanPartnerInfo
						? `${scanPartnerInfo.firstName || ""} ${
								scanPartnerInfo.lastName || ""
						  }`.trim()
						: "N/A",
					scanPartnerPhone: scanPartnerInfo?.telephoneNumber || "N/A",
					scanPartnerEmail: scanPartnerInfo?.email || "N/A",

					// Scan Partner Bank Details
					spAccountName:
						scanPartnerInfo?.UserAccountDetails?.[0]?.accountName || "N/A",
					spAccountNumber:
						scanPartnerInfo?.UserAccountDetails?.[0]?.accountNumber || "N/A",
					spBankName:
						scanPartnerInfo?.UserAccountDetails?.[0]?.bankName || "N/A",
					spBankCode:
						scanPartnerInfo?.UserAccountDetails?.[0]?.bankCode || "N/A",
					spVfdBankName:
						scanPartnerInfo?.UserAccountDetails?.[0]?.vfdBankName || "N/A",
					spVfdBankCode:
						scanPartnerInfo?.UserAccountDetails?.[0]?.vfdBankCode || "N/A",
				};

				const row = customersWs.addRow(rowData);

				// Apply color coding based on scan partner if available
				if (scanPartnerInfo) {
					const color = scanPartnerColorMap.get(scanPartnerInfo.userId);
					if (color) {
						row.eachCell((cell) => {
							cell.fill = {
								type: "pattern",
								pattern: "solid",
								fgColor: { argb: color },
							};
						});
					}
				}

				customerRowIndex++;
			}

			console.log(
				`Processed ${
					customerRowIndex - 2
				} customers for Customer Sales Details sheet`
			);

			// Add autofilter to Customer Sales Details sheet
			if (customerRowIndex > 2) {
				// We have data rows beyond the header
				customersWs.autoFilter = {
					from: { row: 1, column: 1 },
					to: { row: customerRowIndex - 1, column: customersWs.columns.length },
				};
			}

			// 3. Guarantors Sheet
			const guarantorWs = wb.addWorksheet("Guarantors");
			guarantorWs.columns = [
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

			let guarantorRowIndex = 1;
			// Group guarantors by MBE ID using allAgentData
			const mbeGuarantorMap = new Map();

			for (const scanPartnerData of allAgentData) {
				const agents = scanPartnerData.agents || [];
				const color = scanPartnerColorMap.get(scanPartnerData.userId);

				for (const agent of agents) {
					const guarantors = agent.MbeGuarantor || [];

					for (const guarantor of guarantors) {
						const rowData = {
							sn: guarantorRowIndex++,
							scanPartnerCompany: scanPartnerData.companyName,
							scanPartnerUserId: scanPartnerData.userId,
							mbeId: agent.mbeId,
							mbeName: `${agent.firstname} ${agent.lastname}`,
							mbePhone: agent.phone,
							guarantorName: guarantor.guarantorName,
							guarantorPhone: guarantor.guarantorPhone,
							guarantorAddress: guarantor.guarantorAddress,
							relationship: guarantor.guarantorRelationship,
							guarantorStatus: guarantor.guarantorStatus,
							reason: guarantor?.comment,
							createdAt: new Date(guarantor.createdAt).toLocaleDateString(),
							updatedAt: new Date(guarantor.updatedAt).toLocaleDateString(),
						};

						const row = guarantorWs.addRow(rowData);

						// Color code by scan partner
						row.eachCell((cell) => {
							cell.fill = {
								type: "pattern",
								pattern: "solid",
								fgColor: { argb: color },
							};
						});
					}
				}
			}

			// Add autofilter to Guarantors sheet
			guarantorWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: { row: guarantorRowIndex, column: guarantorWs.columns.length },
			};

			// 4. Summary Sheet
			const summaryWs = wb.addWorksheet("Summary");
			summaryWs.columns = [
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
				inactiveMBEAgents += agents.filter(
					(agent: any) => !agent.isActive
				).length;
				pendingMBEAgents += agents.filter(
					(agent: any) => agent.accountStatus === "PENDING"
				).length;
				approvedMBEAgents += agents.filter(
					(agent: any) => agent.accountStatus === "APPROVED"
				).length;
				verifiedMBEAgents += agents.filter(
					(agent: any) =>
						agent.accountStatus === "VERIFIED" ||
						agent.accountStatus === "APPROVED"
				).length;
				unverifiedMBEAgents += agents.filter(
					(agent: any) =>
						agent.accountStatus !== "VERIFIED" &&
						agent.accountStatus !== "APPROVED"
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
					const agentCity = (agent.MbeKyc?.city || "Unknown")
						.toLowerCase()
						.trim();

					// Count agents by state
					agentsByState.set(
						agentState,
						(agentsByState.get(agentState) || 0) + 1
					);

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
								(word) =>
									word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
								(word) =>
									word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
								(word) =>
									word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
								(word) =>
									word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
							)
							.join(" ")}`,
						count,
					})),
			];

			summaryData.forEach((item) => {
				summaryWs.addRow(item);
			});

			// 5. Partner Performance Breakdown Sheet (Mobiflex Sales Data)
			if (salesData && salesData.partnerStats) {
				const performanceWs = wb.addWorksheet("Partner Performance Breakdown");
				performanceWs.columns = [
					{ header: "S/N", key: "sn", width: 8 },
					{ header: "Partner ID", key: "partnerId", width: 25 },
					{ header: "Partner Name", key: "partnerName", width: 30 },
					{ header: "Total Commission", key: "totalCommission", width: 20 },
					{ header: "Agent Commission", key: "agentCommission", width: 20 },
					{ header: "Partner Commission", key: "partnerCommission", width: 20 },
					{ header: "Commission Count", key: "commissionCount", width: 18 },
					{ header: "Agent Count", key: "agentCount", width: 15 },
					{ header: "State Count", key: "stateCount", width: 15 },
					{
						header: "Avg Commission/Agent",
						key: "avgCommissionPerAgent",
						width: 22,
					},
					{ header: "Period", key: "period", width: 15 },
				];

				// Add partner performance data
				salesData.partnerStats.forEach((partner, index) => {
					const rowData = {
						sn: index + 1,
						partnerId: partner.partnerId,
						partnerName: partner.partnerName,
						totalCommission: partner.totalCommission || 0,
						agentCommission: partner.totalAgentCommission || 0,
						partnerCommission: partner.totalPartnerCommission || 0,
						commissionCount: partner.commissionCount || 0,
						agentCount: partner.agentCount || 0,
						stateCount: partner.stateCount || 0,
						avgCommissionPerAgent: partner.averageCommissionPerAgent || 0,
						period: salesData.period || salesPeriod,
					};

					const row = performanceWs.addRow(rowData);

					// Apply light blue background for performance data
					row.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FFE6F3FF" }, // Light blue
						};
					});
				});

				// Add summary row
				if (salesData.summary) {
					const summaryRow = performanceWs.addRow({
						sn: "",
						partnerId: "SUMMARY",
						partnerName: "TOTAL ACROSS ALL PARTNERS",
						totalCommission: salesData.summary.grandTotalCommission || 0,
						agentCommission: salesData.summary.grandTotalAgentCommission || 0,
						partnerCommission:
							salesData.summary.grandTotalPartnerCommission || 0,
						commissionCount: salesData.summary.totalCommissions || 0,
						agentCount: salesData.summary.totalAgents || 0,
						stateCount: "-",
						avgCommissionPerAgent:
							salesData.summary.averageAgentsPerPartner || 0,
						period: salesData.period || salesPeriod,
					});

					// Apply bold formatting and different color for summary
					summaryRow.eachCell((cell) => {
						cell.font = { bold: true };
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FFFFD700" }, // Gold color
						};
					});
				}

				// Add autofilter to Partner Performance Breakdown sheet
				performanceWs.autoFilter = {
					from: { row: 1, column: 1 },
					to: {
						row: salesData.partnerStats.length + 2,
						column: performanceWs.columns.length,
					},
				};
			}

			// 6. Sales Report Summary Sheet
			if (salesData) {
				const salesReportWs = wb.addWorksheet("Sales Report Summary");
				salesReportWs.columns = [
					{ header: "Metric", key: "metric", width: 35 },
					{ header: "Value", key: "value", width: 20 },
					{ header: "Period", key: "period", width: 15 },
				];

				const salesSummaryData = [
					{ metric: "=== MOBIFLEX SALES SUMMARY ===", value: "", period: "" },
					{
						metric: "Reporting Period",
						value: salesData.period || salesPeriod,
						period: salesData.period || salesPeriod,
					},
					{
						metric: "Total Active Partners",
						value: salesData.summary?.totalPartners || 0,
						period: salesData.period || salesPeriod,
					},
					{
						metric: "Grand Total Commission",
						value: `₦${(
							salesData.summary?.grandTotalCommission || 0
						).toLocaleString("en-GB")}`,
						period: salesData.period || salesPeriod,
					},
					{
						metric: "Total Agent Commission",
						value: `₦${(
							salesData.summary?.grandTotalAgentCommission || 0
						).toLocaleString("en-GB")}`,
						period: salesData.period || salesPeriod,
					},
					{
						metric: "Total Partner Commission",
						value: `₦${(
							salesData.summary?.grandTotalPartnerCommission || 0
						).toLocaleString("en-GB")}`,
						period: salesData.period || salesPeriod,
					},
					{
						metric: "Total Commission Transactions",
						value: salesData.summary?.totalCommissions || 0,
						period: salesData.period || salesPeriod,
					},
					{
						metric: "Total Active Agents",
						value: salesData.summary?.totalAgents || 0,
						period: salesData.period || salesPeriod,
					},
					{
						metric: "Average Agents per Partner",
						value: (salesData.summary?.averageAgentsPerPartner || 0).toFixed(1),
						period: salesData.period || salesPeriod,
					},
					{ metric: "", value: "", period: "" },
					{ metric: "=== TOP PERFORMING PARTNER ===", value: "", period: "" },
				];

				// Add top performing partner details if available
				if (salesData.summary?.topPerformingPartner) {
					const topPartner = salesData.summary.topPerformingPartner;
					salesSummaryData.push(
						{
							metric: "Top Partner Name",
							value: topPartner.partnerName,
							period: salesData.period || salesPeriod,
						},
						{
							metric: "Top Partner ID",
							value: topPartner.partnerId,
							period: salesData.period || salesPeriod,
						},
						{
							metric: "Top Partner Total Commission",
							value: `₦${(topPartner.totalCommission || 0).toLocalString(
								"en-GB"
							)}`,
							period: salesData.period || salesPeriod,
						},
						{
							metric: "Top Partner Agent Count",
							value: topPartner.agentCount || 0,
							period: salesData.period || salesPeriod,
						},
						{
							metric: "Top Partner States Covered",
							value: topPartner.stateCount || 0,
							period: salesData.period || salesPeriod,
						}
					);
				}

				salesSummaryData.forEach((item) => {
					const row = salesReportWs.addRow(item);

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
									fgColor: { argb: "FFB0C4DE" }, // Light steel blue
								};
							}
						});
					}
				});

				// Add autofilter to Sales Report Summary sheet
				salesReportWs.autoFilter = {
					from: { row: 1, column: 1 },
					to: {
						row: salesSummaryData.length + 1,
						column: salesReportWs.columns.length,
					},
				};
			}

			// 7. Location Analysis Sheet
			const locationWs = wb.addWorksheet("Location Analysis");
			locationWs.columns = [
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
					scanPartnerData.companyCity ||
					scanPartnerData.companyState ||
					"Unknown";
				const scanPartnerState = scanPartnerData.companyState || "Unknown";

				// Add scan partner (no location filtering - show all)
				const color = scanPartnerColorMap.get(scanPartnerData.userId);
				const rowData = {
					category: "Scan Partner",
					type: "Company",
					name: `${scanPartnerData.companyName} (${scanPartnerData.firstName} ${scanPartnerData.lastName})`,
					location: scanPartnerLocation,
					state: scanPartnerState,
					status: scanPartnerData.accountStatus,
					verificationStatus: scanPartnerData.isActive ? "Active" : "Inactive",
				};

				const row = locationWs.addRow(rowData);
				row.eachCell((cell) => {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: color },
					};
				});

				// Add all agents under this scan partner by location
				const agents = scanPartnerData.agents || [];
				agents.forEach((agent: any) => {
					const agentLocation =
						agent.MbeKyc?.city ||
						agent.MbeKyc?.state ||
						agent.state ||
						"Unknown";
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

					const agentRow = locationWs.addRow(agentRowData);
					agentRow.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: color },
						};
					});
				});
			});

			// Add autofilter to Location Analysis sheet
			let totalLocationRows = 0;
			allAgentData.forEach((scanPartnerData: any) => {
				totalLocationRows += 1; // For scan partner
				totalLocationRows += (scanPartnerData.agents || []).length; // For agents
			});
			locationWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: { row: totalLocationRows + 1, column: locationWs.columns.length },
			};

			// 6. Verification Analysis Sheet
			const verificationWs = wb.addWorksheet("Verification Analysis");
			verificationWs.columns = [
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
						agent.accountStatus === "VERIFIED" ||
						agent.accountStatus === "APPROVED"
				);
				const unverifiedAgentsList = agents.filter(
					(agent: any) =>
						agent.accountStatus !== "VERIFIED" &&
						agent.accountStatus !== "APPROVED"
				);

				const verificationRate =
					agents.length > 0
						? ((verifiedAgentsList.length / agents.length) * 100).toFixed(1)
						: "0.0";

				const color = scanPartnerColorMap.get(scanPartnerData.userId);
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

				const row = verificationWs.addRow(rowData);
				row.eachCell((cell) => {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: color },
					};
				});
			});

			// Add autofilter to Verification Analysis sheet
			verificationWs.autoFilter = {
				from: { row: 1, column: 1 },
				to: {
					row: allAgentData.length + 1,
					column: verificationWs.columns.length,
				},
			};

			// Style the summary sheet
			summaryWs.getRow(1).font = { bold: true };
			summaryWs.columns.forEach((column) => {
				column.alignment = { horizontal: "left" };
			});

			// Style all worksheets headers
			const allWorksheets = [
				scanPartnerWs,
				mbeWs,
				guarantorWs,
				summaryWs,
				locationWs,
				verificationWs,
			];

			// Add sales sheets if they exist
			if (salesData && salesData.partnerStats) {
				const performanceWs = wb.getWorksheet("Partner Performance Breakdown");
				const salesReportWs = wb.getWorksheet("Sales Report Summary");
				if (performanceWs) allWorksheets.push(performanceWs);
				if (salesReportWs) allWorksheets.push(salesReportWs);
			}

			allWorksheets.forEach((ws) => {
				if (ws) {
					ws.getRow(1).font = { bold: true };
					ws.getRow(1).fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFD3D3D3" },
					};
				}
			});

			const buf = await wb.xlsx.writeBuffer();
			saveAs(
				new Blob([buf]),
				`Comprehensive_Scan_Partner_Report_${
					new Date().toISOString().split("T")[0]
				}.xlsx`
			);
		} catch (error) {
			console.error("Error creating comprehensive report:", error);
			// Fallback to simple export
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
					createdAt: new Date(r.createdAt).toLocaleDateString(),
				})
			);

			const buf = await wb.xlsx.writeBuffer();
			saveAs(new Blob([buf]), "Scan_Partner_Records.xlsx");
		}
	};

	// Render each cell, including actions dropdown:
	const renderCell = (
		row: ScanPartnerRecord & { fullName: string },
		key: string
	) => {
		if (key === "actions") {
			return (
				<div className="flex justify-end">
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly size="sm" variant="light">
								<EllipsisVertical className="text-default-300" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem
								key="view"
								onPress={() =>
									router.push(
										`/access/${role}/staff/scan-partners/${row.userId}`
									)
								}
							>
								View
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			);
		}

		if (key === "accountStatus") {
			return (
				<Chip
					className="capitalize"
					color={statusColorMap[row.accountStatus || ""]}
					size="sm"
					variant="flat"
				>
					{capitalize(row.accountStatus || "")}
				</Chip>
			);
		}

		if (key === "isActive") {
			return (
				<Chip
					className="capitalize"
					color={row.isActive ? "success" : "danger"}
					size="sm"
					variant="flat"
				>
					{row.isActive ? "Yes" : "No"}
				</Chip>
			);
		}

		if (key === "companyName") {
			return (
				<div
					className="capitalize cursor-pointer  hover:underline"
					onClick={() =>
						router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
					}
				>
					{row?.companyName}
				</div>
			);
		}
		if (key === "fullName") {
			return (
				<div
					className="capitalize cursor-pointer  hover:underline"
					onClick={() =>
						router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
					}
				>
					{row.fullName}
				</div>
			);
		}

		if (key === "createdAt") {
			return (
				<div className="text-small">
					{new Date(row.createdAt).toLocaleDateString()}
				</div>
			);
		}

		if (key === "telephoneNumber") {
			return <div className="text-small">{row.telephoneNumber || "N/A"}</div>;
		}

		if (key === "userId") {
			return <div className="text-small font-mono">{row.userId}</div>;
		}

		if (key === "accountType") {
			return (
				<div className="text-small capitalize">
					{row.accountType?.toLowerCase() || "N/A"}
				</div>
			);
		}

		return (
			<div
				className="text-small cursor-pointer"
				onClick={() =>
					router.push(`/access/${role}/staff/scan-partners/${row.userId}`)
				}
			>
				{(row as any)[key] || "N/A"}
			</div>
		);
	};

	return (
		<>
			<div className="space-y-6">
				{/* Sales Reporting Section */}
				<Card className="w-full">
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold">
								Mobiflex Sales Analytics
							</h3>
						</div>
						<div className="flex items-center gap-3">
							<Select
								label="Period"
								size="sm"
								value={salesPeriod}
								onChange={(e) => setSalesPeriod(e.target.value as any)}
								className="w-36"
							>
								<SelectItem key="daily" value="daily">
									Daily
								</SelectItem>
								<SelectItem key="weekly" value="weekly">
									Weekly
								</SelectItem>
								<SelectItem key="monthly" value="monthly">
									Monthly
								</SelectItem>
								<SelectItem key="mtd" value="mtd">
									MTD
								</SelectItem>
								<SelectItem key="yearly" value="yearly">
									Yearly
								</SelectItem>
							</Select>
						</div>
					</CardHeader>
					<CardBody>
						<Tabs
							selectedKey={selectedTab}
							onSelectionChange={(key) => setSelectedTab(key as string)}
						>
							<Tab key="partners" title="Partner Overview">
								<div className="space-y-4">
									{/* Summary Cards */}
									{partnerStatsData?.summary && (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
											<Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-blue-600 font-medium">
															Total Partners
														</p>
														<p className="text-2xl font-bold text-blue-800">
															{partnerStatsData?.summary?.totalPartners || 0}
														</p>
													</div>
													<Users className="h-8 w-8 text-blue-600" />
												</CardBody>
											</Card>

											<Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-green-600 font-medium">
															Total Commission
														</p>
														<p className="text-2xl font-bold text-green-800">
															₦
															{(
																partnerStatsData.summary.grandTotalCommission ||
																0
															).toLocaleString("en-GB")}
														</p>
													</div>
													<DollarSign className="h-8 w-8 text-green-600" />
												</CardBody>
											</Card>

											<Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-purple-600 font-medium">
															Total Agents
														</p>
														<p className="text-2xl font-bold text-purple-800">
															{partnerStatsData?.summary?.totalAgents || 0}
														</p>
													</div>
													<Users className="h-8 w-8 text-purple-600" />
												</CardBody>
											</Card>

											<Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
												<CardBody className="flex flex-row items-center justify-between p-4">
													<div>
														<p className="text-sm text-orange-600 font-medium">
															Avg Agents/Partner
														</p>
														<p className="text-2xl font-bold text-orange-800">
															{(
																partnerStatsData?.summary
																	?.averageAgentsPerPartner || 0
															).toFixed(1)}
														</p>
													</div>
													<TrendingUp className="h-8 w-8 text-orange-600" />
												</CardBody>
											</Card>
										</div>
									)}

									{/* Partner Sales Table */}
									{partnerStatsData?.partnerStats && (
										<Card>
											<CardHeader>
												<h4 className="text-md font-semibold">
													Partner Performance Breakdown
												</h4>
											</CardHeader>
											<CardBody>
												<div className="overflow-x-auto">
													<table className="w-full table-auto">
														<thead>
															<tr className="border-b">
																<th className="text-left p-3 font-medium">
																	Partner
																</th>
																<th className="text-left p-3 font-medium">
																	Total Commission
																</th>
																<th className="text-left p-3 font-medium">
																	Agent Commission
																</th>
																<th className="text-left p-3 font-medium">
																	Partner Commission
																</th>
																<th className="text-left p-3 font-medium">
																	Agents
																</th>
																<th className="text-left p-3 font-medium">
																	States
																</th>
																<th className="text-left p-3 font-medium">
																	Avg/Agent
																</th>
																<th className="text-left p-3 font-medium">
																	Actions
																</th>
															</tr>
														</thead>
														<tbody>
															{partnerStatsData?.partnerStats?.map(
																(partner, index) => (
																	<tr
																		key={partner.partnerId}
																		className="border-b hover:bg-gray-50"
																	>
																		<td className="p-3">
																			<div>
																				<p className="font-medium">
																					{partner.partnerName}
																				</p>
																				<p className="text-sm text-gray-500">
																					{partner.partnerId}
																				</p>
																			</div>
																		</td>
																		<td className="p-3 font-medium text-green-600">
																			₦
																			{(
																				partner.totalCommission || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			₦
																			{(
																				partner.totalAgentCommission || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			₦
																			{(
																				partner.totalPartnerCommission || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			<Chip
																				size="sm"
																				color="primary"
																				variant="flat"
																			>
																				{partner.agentCount}
																			</Chip>
																		</td>
																		<td className="p-3">
																			{partner.stateCount}
																		</td>
																		<td className="p-3">
																			₦
																			{(
																				partner.averageCommissionPerAgent || 0
																			).toLocaleString("en-GB")}
																		</td>
																		<td className="p-3">
																			<Button
																				size="sm"
																				color="primary"
																				variant="flat"
																				onPress={() => {
																					setSelectedPartnerId(
																						partner.partnerId
																					);
																					setSelectedTab("partner-details");
																				}}
																			>
																				View Details
																			</Button>
																		</td>
																	</tr>
																)
															)}
														</tbody>
													</table>
												</div>
											</CardBody>
										</Card>
									)}
								</div>
							</Tab>

							<Tab key="partner-details" title="Partner Details">
								<div className="space-y-4">
									{!selectedPartnerId ? (
										<Card>
											<CardBody className="text-center py-8">
												<p className="text-gray-500">
													Select a partner from the overview to view detailed
													analytics
												</p>
											</CardBody>
										</Card>
									) : (
										<>
											{/* Partner Selection */}
											<Card>
												<CardBody>
													<div className="flex items-center gap-4">
														<Select
															label="Select Partner"
															value={selectedPartnerId}
															onChange={(e) =>
																setSelectedPartnerId(e.target.value)
															}
															className="max-w-xs"
														>
															{partnerStatsData?.partnerStats?.map(
																(partner) => (
																	<SelectItem
																		key={partner.partnerId}
																		value={partner.partnerId}
																	>
																		{partner.partnerName}
																	</SelectItem>
																)
															) || []}
														</Select>
													</div>
												</CardBody>
											</Card>

											{/* Specific Partner Performance */}
											{specificPartnerData && (
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
													<Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-indigo-600 font-medium">
																		Partner Commission
																	</p>
																	<p className="text-xl font-bold text-indigo-800">
																		₦
																		{(
																			specificPartnerData?.summary
																				?.totalPartnerCommission || 0
																		).toLocaleString("en-GB")}
																	</p>
																</div>
																<DollarSign className="h-6 w-6 text-indigo-600" />
															</div>
														</CardBody>
													</Card>

													<Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-emerald-600 font-medium">
																		Agent Commission
																	</p>
																	<p className="text-xl font-bold text-emerald-800">
																		₦
																		{(
																			specificPartnerData?.summary
																				?.totalAgentCommission || 0
																		).toLocaleString("en-GB")}
																	</p>
																</div>
																<Users className="h-6 w-6 text-emerald-600" />
															</div>
														</CardBody>
													</Card>

													<Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-amber-600 font-medium">
																		Total Agents
																	</p>
																	<p className="text-xl font-bold text-amber-800">
																		{specificPartnerData?.summary
																			?.totalAgents || 0}
																	</p>
																</div>
																<Users className="h-6 w-6 text-amber-600" />
															</div>
														</CardBody>
													</Card>

													<Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
														<CardBody className="p-4">
															<div className="flex justify-between items-start">
																<div>
																	<p className="text-sm text-rose-600 font-medium">
																		Total Commission
																	</p>
																	<p className="text-xl font-bold text-rose-800">
																		₦
																		{(
																			specificPartnerData?.summary
																				?.totalCommission || 0
																		).toLocaleString("en-GB")}
																	</p>
																</div>
																<TrendingUp className="h-6 w-6 text-rose-600" />
															</div>
														</CardBody>
													</Card>
												</div>
											)}

											{/* Top Agents for Selected Partner */}
											{specificPartnerData?.agentPerformance &&
												specificPartnerData.agentPerformance.length > 0 && (
													<Card>
														<CardHeader>
															<h4 className="text-md font-semibold">
																Top Performing Agents
															</h4>
														</CardHeader>
														<CardBody>
															<div className="overflow-x-auto">
																<table className="w-full table-auto">
																	<thead>
																		<tr className="border-b">
																			<th className="text-left p-3 font-medium">
																				Agent
																			</th>
																			<th className="text-left p-3 font-medium">
																				MBE ID
																			</th>
																			<th className="text-left p-3 font-medium">
																				Phone
																			</th>
																			<th className="text-left p-3 font-medium">
																				Total Commission
																			</th>
																			<th className="text-left p-3 font-medium">
																				Agent Commission
																			</th>
																			<th className="text-left p-3 font-medium">
																				Partner Commission
																			</th>
																			<th className="text-left p-3 font-medium">
																				Sales Count
																			</th>
																		</tr>
																	</thead>
																	<tbody>
																		{specificPartnerData.agentPerformance.map(
																			(agentData: any, index: number) => (
																				<tr
																					key={agentData.agent.mbeId}
																					className="border-b hover:bg-gray-50"
																				>
																					<td className="p-3">
																						<div>
																							<p className="font-medium">
																								{agentData.agent.firstname}{" "}
																								{agentData.agent.lastname}
																							</p>
																							<p className="text-sm text-gray-500">
																								Rank #{index + 1}
																							</p>
																						</div>
																					</td>
																					<td className="p-3 font-mono text-sm">
																						{agentData.agent.mbeId}
																					</td>
																					<td className="p-3">
																						{agentData.agent.phone}
																					</td>
																					<td className="p-3 font-medium text-green-600">
																						₦
																						{(
																							agentData.totalCommission || 0
																						).toLocaleString("en-GB")}
																					</td>
																					<td className="p-3">
																						₦
																						{(
																							agentData.agentCommission || 0
																						).toLocaleString("en-GB")}
																					</td>
																					<td className="p-3">
																						₦
																						{(
																							agentData.partnerCommission || 0
																						).toLocaleString("en-GB")}
																					</td>
																					<td className="p-3">
																						<Chip
																							size="sm"
																							color="success"
																							variant="flat"
																						>
																							{agentData.commissionCount || 0}
																						</Chip>
																					</td>
																				</tr>
																			)
																		)}
																	</tbody>
																</table>
															</div>
														</CardBody>
													</Card>
												)}

											{/* Approved Agents Summary */}
											{approvedAgentsData && (
												<Card>
													<CardHeader>
														<h4 className="text-md font-semibold">
															Agent Approval Status
														</h4>
													</CardHeader>
													<CardBody>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															{/* Daily Stats */}
															<div className="space-y-3">
																<h5 className="font-medium text-gray-700">
																	Daily Summary
																</h5>
																<div className="grid grid-cols-3 gap-3">
																	<div className="text-center p-3 bg-green-50 rounded-lg">
																		<p className="text-sm text-green-600">
																			Total Agents
																		</p>
																		<p className="text-xl font-bold text-green-800">
																			{approvedAgentsData?.daily?.totalCount ||
																				0}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-orange-50 rounded-lg">
																		<p className="text-sm text-orange-600">
																			Partner
																		</p>
																		<p className="text-xl font-bold text-orange-800">
																			{approvedAgentsData?.scanPartner?.name ||
																				"N/A"}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-blue-50 rounded-lg">
																		<p className="text-sm text-blue-600">
																			Period
																		</p>
																		<p className="text-xl font-bold text-blue-800">
																			Daily
																		</p>
																	</div>
																</div>
															</div>

															{/* Month-to-Date Stats */}
															<div className="space-y-3">
																<h5 className="font-medium text-gray-700">
																	Month-to-Date
																</h5>
																<div className="grid grid-cols-3 gap-3">
																	<div className="text-center p-3 bg-green-50 rounded-lg">
																		<p className="text-sm text-green-600">
																			Total Agents
																		</p>
																		<p className="text-xl font-bold text-green-800">
																			{approvedAgentsData?.mtd?.totalCount || 0}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-orange-50 rounded-lg">
																		<p className="text-sm text-orange-600">
																			Period
																		</p>
																		<p className="text-xl font-bold text-orange-800">
																			{approvedAgentsData?.mtd?.period || "N/A"}
																		</p>
																	</div>
																	<div className="text-center p-3 bg-blue-50 rounded-lg">
																		<p className="text-sm text-blue-600">
																			Status
																		</p>
																		<p className="text-xl font-bold text-blue-800">
																			MTD
																		</p>
																	</div>
																</div>
															</div>
														</div>
													</CardBody>
												</Card>
											)}
										</>
									)}
								</div>
							</Tab>
						</Tabs>
					</CardBody>
				</Card>

				{/* Scan Partner Management Section */}
				<Card className="w-full">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold">Scan Partner Management</h3>
						</div>
					</CardHeader>
					<CardBody>
						<div className="mb-4 flex justify-center md:justify-end"></div>
						{isLoading ? (
							<TableSkeleton columns={columns.length} rows={10} />
						) : (
							<GenericTable<
								ScanPartnerRecord & { fullName: string; companyName: string }
							>
								columns={columns}
								data={sorted}
								allCount={filtered.length}
								exportData={filtered}
								isLoading={isLoading}
								filterValue={filterValue}
								onFilterChange={(v) => {
									setFilterValue(v);
									setPage(1);
								}}
								statusOptions={statusOptions}
								statusFilter={statusFilter}
								onStatusChange={setStatusFilter}
								statusColorMap={statusColorMap}
								showStatus={true}
								sortDescriptor={sortDescriptor}
								onSortChange={setSortDescriptor}
								page={page}
								pages={pages}
								onPageChange={setPage}
								exportFn={exportFn}
								renderCell={renderCell}
								hasNoRecords={hasNoRecords}
								onDateFilterChange={handleDateFilter}
								initialStartDate={startDate}
								initialEndDate={endDate}
							/>
						)}
					</CardBody>
				</Card>
			</div>
		</>
	);
}
