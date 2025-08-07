"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import GenericTable, {
  ColumnDef,
} from "@/components/reususables/custom-ui/tableUi";
import { capitalize } from "@/lib";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  SortDescriptor,
  ChipProps,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { TableSkeleton } from "@/components/reususables/custom-ui";
import { useMobiflexPartnerStats } from "@/hooks/mobiflex";

const columns: ColumnDef[] = [
  { name: "Partner ID", uid: "partnerId", sortable: true },
  { name: "Partner Name", uid: "partnerName", sortable: true },
  { name: "Total Commission", uid: "totalCommission", sortable: true },
  { name: "Partner Commission", uid: "totalPartnerCommission", sortable: true },
  { name: "Agent Commission", uid: "totalAgentCommission", sortable: true },
  {
    name: "Commission Split %",
    uid: "commissionSplitPercentage",
    sortable: true,
  },
  { name: "Agent Count", uid: "agentCount", sortable: true },
  { name: "State Count", uid: "stateCount", sortable: true },
  {
    name: "Avg Commission/Agent",
    uid: "averageCommissionPerAgent",
    sortable: true,
  },
  { name: "Commission Count", uid: "commissionCount", sortable: true },
  { name: "Performance Tier", uid: "performanceTier", sortable: true },
  { name: "Actions", uid: "actions" },
];

// Display columns for table view
const displayColumns: ColumnDef[] = [
  { name: "Partner Name", uid: "partnerName", sortable: true },
  { name: "Total Commission", uid: "totalCommission", sortable: true },
  { name: "Partner Commission", uid: "totalPartnerCommission", sortable: true },
  { name: "Agent Commission", uid: "totalAgentCommission", sortable: true },
  {
    name: "Commission Split %",
    uid: "commissionSplitPercentage",
    sortable: true,
  },
  { name: "Agent Count", uid: "agentCount", sortable: true },
  { name: "Avg/Agent", uid: "averageCommissionPerAgent", sortable: true },
  { name: "Performance Tier", uid: "performanceTier", sortable: true },
  { name: "Actions", uid: "actions" },
];

type PartnerRecord = {
  partnerId: string;
  partnerName: string;
  totalCommission: number;
  totalPartnerCommission: number;
  totalAgentCommission: number;
  commissionSplitPercentage: number;
  agentCount: number;
  stateCount: number;
  averageCommissionPerAgent: number;
  commissionCount: number;
  performanceTier: string;
};

export default function MobiflexPartnersReportView() {
  const router = useRouter();
  const pathname = usePathname();
  const role = pathname.split("/")[2];

  // --- date filter state ---
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [hasNoRecords, setHasNoRecords] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");

  // --- table state ---
  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "totalCommission",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // --- handle date filter ---
  const handleDateFilter = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Fetch data using Mobiflex partner stats hook
  const { data: partnerData, isLoading } =
    useMobiflexPartnerStats(selectedPeriod);

  // Performance tier helper
  const getPerformanceTier = (commission: number, avgCommission: number) => {
    if (commission >= avgCommission * 2) return "Platinum";
    if (commission >= avgCommission * 1.5) return "Gold";
    if (commission >= avgCommission * 1.2) return "Silver";
    if (commission >= avgCommission * 0.8) return "Bronze";
    return "Starter";
  };

  // Transform partner data to records
  const partnerRecords = useMemo(() => {
    if (!partnerData?.partnerStats) {
      setHasNoRecords(true);
      return [];
    }

    setHasNoRecords(false);
    const partners = partnerData.partnerStats;
    const totalCommission = partners.reduce(
      (sum, partner) => sum + (partner.totalCommission || 0),
      0
    );
    const avgCommission = totalCommission / partners.length;

    return partners.map((partner) => ({
      partnerId: partner.partnerId || "N/A",
      partnerName: partner.partnerName || "N/A",
      totalCommission: partner.totalCommission || 0,
      totalPartnerCommission: partner.totalPartnerCommission || 0,
      totalAgentCommission: partner.totalAgentCommission || 0,
      commissionSplitPercentage:
        partner.totalCommission > 0
          ? ((partner.totalPartnerCommission || 0) / partner.totalCommission) *
            100
          : 0,
      agentCount: partner.agentCount || 0,
      stateCount: partner.stateCount || 0,
      averageCommissionPerAgent: partner.averageCommissionPerAgent || 0,
      commissionCount: partner.commissionCount || 0,
      performanceTier: getPerformanceTier(
        partner.totalCommission || 0,
        avgCommission
      ),
    }));
  }, [partnerData]);

  // Filter logic
  const filtered = useMemo(() => {
    let list = [...partnerRecords];
    if (filterValue) {
      list = list.filter(
        (record) =>
          record.partnerName
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          record.performanceTier
            .toLowerCase()
            .includes(filterValue.toLowerCase())
      );
    }
    return list;
  }, [partnerRecords, filterValue]);

  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const sorted = React.useMemo(() => {
    return [...paged].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof PartnerRecord];
      const bVal = b[sortDescriptor.column as keyof PartnerRecord];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paged, sortDescriptor]);

  // Export function
  const exportFn = async (data: PartnerRecord[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Mobiflex Partner Performance");
    ws.columns = columns
      .filter((c) => c.uid !== "actions")
      .map((c) => ({
        header: c.name,
        key: c.uid,
        width: 20,
      }));
    data.forEach((r) => ws.addRow(r));
    const buf = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buf]),
      `mobiflex_partners_${selectedPeriod}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Performance tier color map
  const tierColorMap: Record<string, ChipProps["color"]> = {
    Platinum: "secondary",
    Gold: "warning",
    Silver: "default",
    Bronze: "primary",
    Starter: "danger",
  };

  // Render each cell
  const renderCell = (row: PartnerRecord, key: string) => {
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
              <DropdownItem key="view">View Details</DropdownItem>
              <DropdownItem key="agents">View Agents</DropdownItem>
              <DropdownItem key="commission-breakdown">
                Commission Breakdown
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    }

    if (
      key === "totalCommission" ||
      key === "totalPartnerCommission" ||
      key === "totalAgentCommission" ||
      key === "averageCommissionPerAgent"
    ) {
      return (
        <div className="text-sm font-medium text-green-600">
          {formatCurrency((row as any)[key])}
        </div>
      );
    }

    if (key === "commissionSplitPercentage") {
      return (
        <div className="text-sm font-medium text-blue-600">
          {formatPercentage(row.commissionSplitPercentage)}
        </div>
      );
    }

    if (key === "performanceTier") {
      return (
        <Chip
          size="sm"
          variant="flat"
          color={tierColorMap[row.performanceTier]}
        >
          {row.performanceTier}
        </Chip>
      );
    }

    if (key === "partnerName") {
      return (
        <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600">
          {row.partnerName}
        </div>
      );
    }

    if (
      key === "agentCount" ||
      key === "stateCount" ||
      key === "commissionCount"
    ) {
      return (
        <div className="text-sm font-medium text-purple-600">
          {(row as any)[key]}
        </div>
      );
    }

    return <div className="text-sm text-gray-900">{(row as any)[key]}</div>;
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mobiflex Partner Performance Report
        </h1>
        <p className="text-gray-600">
          Comprehensive performance analysis and commission breakdown for all
          scan partners
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={10} />
      ) : (
        <GenericTable<PartnerRecord>
          columns={displayColumns}
          data={sorted}
          allCount={filtered.length}
          exportData={filtered}
          isLoading={isLoading}
          filterValue={filterValue}
          onFilterChange={(v) => {
            setFilterValue(v);
            setPage(1);
          }}
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
          searchPlaceholder="Search by partner name or performance tier..."
        />
      )}
    </>
  );
}
