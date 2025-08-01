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
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
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

      // 1. Scan Partner Summary Sheet
      const scanPartnerWs = wb.addWorksheet("Scan Partners Summary");
      scanPartnerWs.columns = [
        { header: "S/N", key: "sn", width: 8 },
        { header: "User ID", key: "userId", width: 25 },
        { header: "Company Name", key: "companyName", width: 25 },
        { header: "Full Name", key: "fullName", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "telephoneNumber", width: 20 },
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
        { header: "Guarantor 2 Name", key: "guarantor2Name", width: 25 },
        { header: "Guarantor 2 Phone", key: "guarantor2Phone", width: 20 },
        {
          header: "Guarantor 2 Relationship",
          key: "guarantor2Relationship",
          width: 20,
        },
        { header: "Guarantor 2 Status", key: "guarantor2Status", width: 15 },
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
            guarantor2Name: guarantor2?.guarantorName || "N/A",
            guarantor2Phone: guarantor2?.guarantorPhone || "N/A",
            guarantor2Relationship: guarantor2?.guarantorRelationship || "N/A",
            guarantor2Status: guarantor2?.guarantorStatus || "N/A",
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
              mbeId: agent.mbeId,
              mbeName: `${agent.firstname} ${agent.lastname}`,
              mbePhone: agent.phone,
              guarantorName: guarantor.guarantorName,
              guarantorPhone: guarantor.guarantorPhone,
              guarantorAddress: guarantor.guarantorAddress,
              relationship: guarantor.guarantorRelationship,
              guarantorStatus: guarantor.guarantorStatus,
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
            ).toLocaleString()}`,
            period: salesData.period || salesPeriod,
          },
          {
            metric: "Total Agent Commission",
            value: `₦${(
              salesData.summary?.grandTotalAgentCommission || 0
            ).toLocaleString()}`,
            period: salesData.period || salesPeriod,
          },
          {
            metric: "Total Partner Commission",
            value: `₦${(
              salesData.summary?.grandTotalPartnerCommission || 0
            ).toLocaleString()}`,
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
              value: `₦${(topPartner.totalCommission || 0).toLocaleString()}`,
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
                              ).toLocaleString()}
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
                                      ).toLocaleString()}
                                    </td>
                                    <td className="p-3">
                                      ₦
                                      {(
                                        partner.totalAgentCommission || 0
                                      ).toLocaleString()}
                                    </td>
                                    <td className="p-3">
                                      ₦
                                      {(
                                        partner.totalPartnerCommission || 0
                                      ).toLocaleString()}
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
                                      ).toLocaleString()}
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
                                    ).toLocaleString()}
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
                                    ).toLocaleString()}
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
                                    ).toLocaleString()}
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
                                            ).toLocaleString()}
                                          </td>
                                          <td className="p-3">
                                            ₦
                                            {(
                                              agentData.agentCommission || 0
                                            ).toLocaleString()}
                                          </td>
                                          <td className="p-3">
                                            ₦
                                            {(
                                              agentData.partnerCommission || 0
                                            ).toLocaleString()}
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
