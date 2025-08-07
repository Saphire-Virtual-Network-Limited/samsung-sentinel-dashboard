"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Pagination,
  Avatar,
  Progress,
  Select,
  SelectItem,
  Input,
  SortDescriptor,
} from "@heroui/react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Award,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { getAmbassadorConversionRates, ConversionRate } from "../../../lib/api";
import useSWR from "swr";
import { PERFORMANCE_TIERS } from "./constants";
import GenericTable, {
  ColumnDef,
} from "../../../components/reususables/custom-ui/tableUi";
import { StatCard } from "../../../components/atoms/StatCard";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";

const ConversionRatesView = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<Set<string>>(
    new Set(["conversionRate"])
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "conversionRate",
    direction: "descending",
  });
  const rowsPerPage = 10;

  // Utility function to format numbers
  const formatNumber = (value: string | number): string => {
    if (typeof value === "string") return value;
    return value?.toLocaleString("en-US") || "0";
  };

  // Fetch conversion rates data
  const { data, error, isLoading } = useSWR(
    "ambassador-conversion-rates",
    async () => {
      const response = await getAmbassadorConversionRates();
      return response.data || [];
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  const conversionData = useMemo(() => data || [], [data]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (!conversionData.length)
      return {
        totalAmbassadors: 0,
        totalLeads: 0,
        totalConverted: 0,
        totalDisbursed: 0,
        averageConversionRate: 0,
        topPerformer: null,
      };

    const totalAmbassadors = conversionData.length;
    const totalLeads = conversionData.reduce(
      (sum, item) => sum + (item.totalLeads || 0),
      0
    );

    // Calculate converted based on conversion rate since API doesn't provide breakdown
    const totalConverted = conversionData.reduce((sum, item) => {
      const rate =
        typeof item.conversionRate === "string"
          ? parseFloat(item.conversionRate) || 0
          : item.conversionRate || 0;
      const leads = item.totalLeads || 0;
      return sum + Math.round((leads * rate) / 100);
    }, 0);

    const averageConversionRate =
      conversionData.length > 0
        ? conversionData.reduce((sum, item) => {
            const rate =
              typeof item.conversionRate === "string"
                ? parseFloat(item.conversionRate) || 0
                : item.conversionRate || 0;
            return sum + rate;
          }, 0) / conversionData.length
        : 0;

    const topPerformer = conversionData.reduce((top, current) => {
      const currentRate =
        typeof current.conversionRate === "string"
          ? parseFloat(current.conversionRate) || 0
          : current.conversionRate || 0;
      const topRate = top
        ? typeof top.conversionRate === "string"
          ? parseFloat(top.conversionRate) || 0
          : top.conversionRate || 0
        : 0;
      return currentRate > topRate ? current : top;
    }, null as ConversionRate | null);

    return {
      totalAmbassadors: totalAmbassadors || 0,
      totalLeads: totalLeads || 0,
      totalConverted: totalConverted || 0,
      totalDisbursed: 0, // Not available in API
      averageConversionRate: Number(averageConversionRate.toFixed(1)) || 0,
      topPerformer,
    };
  }, [conversionData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...conversionData];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchValue = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.fullName || item.ambassadorName || "")
            .toLowerCase()
            .includes(searchValue) ||
          (item.phoneNumber || "").includes(searchValue) ||
          (item.emailAddress || "").toLowerCase().includes(searchValue) ||
          (item.state || "").toLowerCase().includes(searchValue)
      );
    }

    return filtered;
  }, [conversionData, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(start, start + rowsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const sortedData = useMemo(() => {
    return [...paginatedData].sort((a, b) => {
      const aVal = a[sortDescriptor.column as keyof ConversionRate];
      const bVal = b[sortDescriptor.column as keyof ConversionRate];

      let cmp = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paginatedData, sortDescriptor]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  // Export function
  const exportConversionRates = async (data: ConversionRate[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Conversion Rates");

    ws.columns = [
      { header: "S/N", key: "serialNumber", width: 8 },
      { header: "Ambassador Name", key: "ambassadorName", width: 30 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "Email Address", key: "emailAddress", width: 25 },
      { header: "Total Leads", key: "totalLeads", width: 12 },
      { header: "Conversion Rate (%)", key: "conversionRate", width: 18 },
    ];

    data.forEach((item, index) => {
      const rate =
        typeof item.conversionRate === "string"
          ? parseFloat(item.conversionRate) || 0
          : item.conversionRate || 0;

      ws.addRow({
        serialNumber: index + 1,
        ambassadorName: item.fullName || item.ambassadorName || "N/A",
        phoneNumber: item.phoneNumber || "N/A",
        emailAddress: item.emailAddress || "N/A",
        totalLeads: item.totalLeads || 0,
        conversionRate: rate.toFixed(1),
      });
    });

    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    };

    const buf = await wb.xlsx.writeBuffer();
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const fileName = `Conversion_Rates_${formattedDate.replace(
      / /g,
      "_"
    )}_${formattedTime.replace(/:/g, "-")}.xlsx`;
    saveAs(new Blob([buf]), fileName);
  };

  // Get performance tier color
  const getPerformanceTier = (rate: number) => {
    const tier =
      PERFORMANCE_TIERS.find((t) => rate >= t.min) ||
      PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
    return { color: tier.color, label: tier.label };
  };

  const generateUniqueKey = (item: ConversionRate, suffix: string = "") => {
    const baseKey =
      item.ambassadorId ||
      item.phoneNumber ||
      item.emailAddress ||
      item.fullName ||
      item.ambassadorName ||
      "unknown";
    return `${baseKey}-${suffix}`.replace(/\s+/g, "-").toLowerCase();
  };

  // Render table cells
  const renderCell = (item: ConversionRate, key: string) => {
    switch (key) {
      case "serialNumber":
        const index = sortedData.indexOf(item);
        return (
          <span className="text-sm" key={generateUniqueKey(item, "serial")}>
            {(currentPage - 1) * rowsPerPage + index + 1}
          </span>
        );

      case "ambassador":
        const ambassadorName =
          item.fullName || item.ambassadorName || "Unknown";
        return (
          <div
            className="flex items-center gap-3"
            key={generateUniqueKey(item, "ambassador")}
          >
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                ambassadorName
              )}&background=0ea5e9&color=fff`}
              alt={ambassadorName}
              size="sm"
            />
            <div>
              <p className="font-medium text-sm">{ambassadorName}</p>
              {item.emailAddress && (
                <p className="text-xs text-gray-400">{item.emailAddress}</p>
              )}
            </div>
          </div>
        );

      case "phone":
        return (
          <span className="text-sm" key={generateUniqueKey(item, "phone")}>
            {item.phoneNumber || (
              <span className="text-gray-400">Not provided</span>
            )}
          </span>
        );

      case "telemarketer":
        return (
          <span className="text-sm">
            {item.teleMarketerName || (
              <span className="text-gray-400">Not assigned</span>
            )}
          </span>
        );

      case "leads":
        return (
          <div className="space-y-1" key={generateUniqueKey(item, "leads")}>
            <p className="text-sm font-medium"> {item.totalLeads || 0}</p>
          </div>
        );

      case "breakdown":
        // Since the API doesn't provide breakdown data, show what we have
        const totalLeads = item.totalLeads || 0;
        const conversionRateNum = parseFloat(String(item.conversionRate)) || 0;
        const convertedCount = Math.round(
          (totalLeads * conversionRateNum) / 100
        );

        return (
          <div className="space-y-1" key={generateUniqueKey(item, "breakdown")}>
            <div className="flex justify-between text-xs">
              <span className="text-success-600">Converted:</span>
              <span>{convertedCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-warning-600">Pending:</span>
              <span>{totalLeads - convertedCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Rate:</span>
              <span>{conversionRateNum.toFixed(1)}%</span>
            </div>
          </div>
        );

      case "conversionRate":
        const rawRate = item.conversionRate;
        // Handle string conversion rate from API
        const rate =
          typeof rawRate === "string"
            ? parseFloat(rawRate) || 0
            : typeof rawRate === "number" && !isNaN(rawRate)
            ? rawRate
            : 0;
        return (
          <div
            className="flex items-center space-x-2"
            key={generateUniqueKey(item, "rate")}
          >
            <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
            <Progress
              value={rate}
              color="primary"
              size="sm"
              className="flex-1 max-w-[80px]"
            />
          </div>
        );

      case "status":
        const statusRate = item.conversionRate;
        // Handle string conversion rate from API
        const validRate =
          typeof statusRate === "string"
            ? parseFloat(statusRate) || 0
            : typeof statusRate === "number" && !isNaN(statusRate)
            ? statusRate
            : 0;
        const tier = getPerformanceTier(validRate);
        return (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium bg-${tier.color}-100 text-${tier.color}-700 border border-${tier.color}-200`}
            key={generateUniqueKey(item, "status")}
          >
            {tier.label}
          </span>
        );

      default:
        return (
          <span
            className="text-sm"
            key={generateUniqueKey(item, `default-${key}`)}
          >
            {(item as any)[key] || "N/A"}
          </span>
        );
    }
  };

  const columns: ColumnDef[] = [
    { name: "Ambassador", uid: "ambassador", sortable: true },
    { name: "Phone", uid: "phone", sortable: true },
    { name: "Total Leads", uid: "leads" },
    { name: "Performance", uid: "breakdown" },
    { name: "Conversion Rate", uid: "conversionRate", sortable: true },
    { name: "Status", uid: "status", sortable: true },
  ];

  const sortOptions = [
    { name: "Conversion Rate", uid: "conversionRate" },
    { name: "Total Leads", uid: "totalLeads" },
    { name: "Name", uid: "name" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-default-50">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-default-50">
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading conversion rates</p>
            <Button
              color="primary"
              onPress={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Ambassadors"
          value={formatNumber(overallStats.totalAmbassadors)}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Total Leads"
          value={formatNumber(overallStats.totalLeads)}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="Converted Leads"
          value={formatNumber(overallStats.totalConverted)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Average Conversion Rate"
          value={`${overallStats.averageConversionRate}%`}
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </div>

      {/* Performance Tiers Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
        <h3 className="font-semibold mb-3">Performance Tiers</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-sm">Excellent (70%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span className="text-sm">Good (50-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <span className="text-sm">Average (30-49%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
            <span className="text-sm">Needs Improvement (&lt;30%)</span>
          </div>
        </div>
      </div>

      {/* Conversion Rates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6">
        <GenericTable<ConversionRate>
          columns={columns}
          data={sortedData}
          allCount={filteredAndSortedData.length}
          exportData={filteredAndSortedData}
          isLoading={isLoading}
          filterValue={searchTerm}
          onFilterChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          statusOptions={[]}
          statusFilter={new Set()}
          onStatusChange={() => {}}
          statusColorMap={{}}
          showStatus={false}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          page={currentPage}
          pages={totalPages}
          onPageChange={setCurrentPage}
          exportFn={exportConversionRates}
          renderCell={renderCell}
          hasNoRecords={
            !isLoading && !error && filteredAndSortedData.length === 0
          }
        />
      </div>
    </div>
  );
};

export default ConversionRatesView;
