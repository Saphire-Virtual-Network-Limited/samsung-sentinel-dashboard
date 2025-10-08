import React, { useState } from "react";
import useSWR from "swr";
import { getCollectionAnalyticwithFilter } from "@/lib/api";
import { DateFilter } from "@/components/reususables";
import {
  TrendingUp,
  CheckCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  CalendarDays,
  Users,
} from "lucide-react";

interface CollectionAnalyticsData {
  period?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  summary?: {
    expectedAmount?: number;
    collectedAmount?: number;
    percentage?: number;
    expectedRepayments?: number;
    collectedRepayments?: number;
    collectionRate?: number;
  };
}

// Helper to extract the correct data from the API response
function extractAnalyticsData(raw: any): CollectionAnalyticsData {
  if (raw && typeof raw === "object" && "data" in raw && typeof raw.data === "object") {
    return raw.data;
  }
  return raw || {};
}

function formatCurrency(amount?: number) {
  if (typeof amount !== "number" || isNaN(amount)) return "₦0.00";
  return amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const periodOptions = [
  { label: "Daily", value: "daily" },
  { label: "Monthly", value: "monthly" },
];

const cardData = [
  {
    label: "Expected Amount",
    key: "expectedAmount",
    icon: <ArrowUpCircle className="w-6 h-6 text-blue-500" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
    valueFn: (summary: any) => formatCurrency(summary?.expectedAmount),
  },
  {
    label: "Collected Amount",
    key: "collectedAmount",
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    color: "text-green-700",
    bg: "bg-green-50",
    valueFn: (summary: any) => formatCurrency(summary?.collectedAmount),
  },
  {
    label: "Collection Rate",
    key: "collectionRate",
    icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    valueFn: (summary: any) =>
      typeof summary?.collectionRate === "number"
        ? `${summary.collectionRate.toLocaleString()}%`
        : "0%",
  },
  {
    label: "No. Expected Repayments",
    key: "expectedRepayments",
    icon: <ArrowUpCircle className="w-6 h-6 text-yellow-500" />,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    valueFn: (summary: any) => summary?.expectedRepayments ?? 0,
  },
  {
    label: "No. Collected Repayments",
    key: "collectedRepayments",
    icon: <ArrowDownCircle className="w-6 h-6 text-emerald-500" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    valueFn: (summary: any) => summary?.collectedRepayments ?? 0,
  },
  {
    label: "No. of Repayments %",
    key: "percentage",
    icon: <Percent className="w-6 h-6 text-fuchsia-500" />,
    color: "text-fuchsia-700",
    bg: "bg-fuchsia-50",
    valueFn: (summary: any) =>
      typeof summary?.percentage === "number"
        ? `${summary.percentage.toFixed(2)}%`
        : "0.00%",
  },
];

const CollectionAnalytcics = () => {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { data: rawData, isLoading, error } = useSWR<any>(
    ["collection-analytics", startDate, endDate, period],
    async () => {
      try {
        return await getCollectionAnalyticwithFilter(startDate, endDate, period);
      } catch (err) {
        console.error("Error fetching collection analytics:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      refreshInterval: 60000,
    }
  );

  const data = extractAnalyticsData(rawData);

  const analytics: CollectionAnalyticsData = {
    period: data?.period ?? period,
    dateRange: {
      start:
        data?.dateRange?.start ??
        startDate ??
        new Date().toISOString(),
      end:
        data?.dateRange?.end ??
        endDate ??
        new Date().toISOString(),
    },
    summary: {
      expectedAmount: data?.summary?.expectedAmount || 0,
      collectedAmount: data?.summary?.collectedAmount || 0,
      percentage: data?.summary?.percentage || 0,
      expectedRepayments: data?.summary?.expectedRepayments || 0,
      collectedRepayments: data?.summary?.collectedRepayments || 0,
      collectionRate: data?.summary?.collectionRate || 0,
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Collection Analytics</h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500 capitalize">
              {analytics.period} &middot; {formatDate(analytics.dateRange?.start)} - {formatDate(analytics.dateRange?.end)}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            value={period}
            onChange={e => setPeriod(e.target.value as "daily" | "monthly")}
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <DateFilter
            initialStartDate={startDate}
            initialEndDate={endDate}
            onFilterChange={(start: string, end: string) => {
              setStartDate(start);
              setEndDate(end);
            }}
            className="text-xs"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-gray-400 text-sm">Loading analytics...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="h-8 w-8 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
          </svg>
          <span className="text-red-500 text-sm">Failed to load analytics.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardData.map((card, idx) => (
            <div
              key={card.key}
              className={`flex items-center gap-3 rounded-xl p-4 shadow-sm border border-gray-100 bg-white hover:shadow-md transition group`}
            >
              <div className={`flex-shrink-0 rounded-full p-2 ${card.bg} group-hover:scale-105 transition`}>
                {card.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">{card.label}</span>
                <span className={`text-lg font-semibold ${card.color}`}>
                  {card.valueFn(analytics.summary)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionAnalytcics;