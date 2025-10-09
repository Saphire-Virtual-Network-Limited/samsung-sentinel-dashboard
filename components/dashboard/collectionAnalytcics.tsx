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
  Target,
  DollarSign,
  BarChart3,
  Activity,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface CollectionAnalyticsData {
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

function formatNumber(num?: number) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  return num.toLocaleString("en-NG");
}

function formatPercentage(num?: number, decimals: number = 1) {
  if (typeof num !== "number" || isNaN(num)) return "0.0%";
  return `${num.toFixed(decimals)}%`;
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


const cardData = [
  {
    label: "Expected Amount",
    key: "expectedAmount",
    icon: <Target className="w-5 h-5" />,
    color: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    border: "border-blue-200",
    valueFn: (summary: any) => formatCurrency(summary?.expectedAmount),
    description: "Total amount expected to be collected",
  },
  {
    label: "Collected Amount",
    key: "collectedAmount",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-green-600",
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    border: "border-green-200",
    valueFn: (summary: any) => formatCurrency(summary?.collectedAmount),
    description: "Amount successfully collected",
  },
  {
    label: "Collection Rate",
    key: "collectionRate",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-indigo-600",
    bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    border: "border-indigo-200",
    valueFn: (summary: any) => formatPercentage(summary?.collectionRate, 1),
    description: "Overall collection performance",
  },
  {
    label: "Expected Repayments",
    key: "expectedRepayments",
    icon: <ArrowUpCircle className="w-5 h-5" />,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    border: "border-amber-200",
    valueFn: (summary: any) => formatNumber(summary?.expectedRepayments),
    description: "Number of expected repayments",
  },
  {
    label: "Collected Repayments",
    key: "collectedRepayments",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-emerald-600",
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    border: "border-emerald-200",
    valueFn: (summary: any) => formatNumber(summary?.collectedRepayments),
    description: "Number of successful repayments",
  },
  {
    label: "Collection Percentage",
    key: "percentage",
    icon: <Percent className="w-5 h-5" />,
    color: "text-purple-600",
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    border: "border-purple-200",
    valueFn: (summary: any) => formatPercentage(summary?.percentage, 2),
    description: "Percentage of successful collections",
  },
];

const CollectionAnalytcics = () => {
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { data: rawData, isLoading, error, mutate } = useSWR<any>(
    ["collection-analytics", startDate, endDate],
    async () => {
      try {
        return await getCollectionAnalyticwithFilter(startDate, endDate);
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

  // Calculate collection efficiency
  const collectionEfficiency = (analytics.summary?.expectedAmount || 0) > 0 
    ? ((analytics.summary?.collectedAmount || 0) / (analytics.summary?.expectedAmount || 1)) * 100 
    : 0;

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "text-green-600";
    if (efficiency >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyBg = (efficiency: number) => {
    if (efficiency >= 80) return "bg-green-100";
    if (efficiency >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Mobile-Friendly Header */}
      <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Collection Analytics</h2>
            <span className="hidden sm:inline text-xs text-gray-500">
              {formatDate(analytics.dateRange?.start)} - {formatDate(analytics.dateRange?.end)}
            </span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => mutate()}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
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
        
        {/* Mobile: Show date range below title */}
        <div className="sm:hidden mt-2">
          <span className="text-xs text-gray-500">
            {formatDate(analytics.dateRange?.start)} - {formatDate(analytics.dateRange?.end)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <span className="text-sm text-gray-600 text-center">Loading analytics...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="text-center px-4">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">Failed to load data</p>
              <button
                onClick={() => mutate()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors touch-manipulation"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">

            {/* Detailed Metrics - Mobile Optimized Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {cardData.map((card, idx) => (
                <div
                  key={card.key}
                  className={`rounded-lg border ${card.border} ${card.bg} p-2.5 sm:p-3 hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${card.bg} ${card.color} flex-shrink-0`}>
                      {card.icon}
                    </div>
                    <div className="text-right min-w-0 flex-1 ml-2">
                      <div className={`text-base sm:text-lg font-bold ${card.color} break-words`}>
                        {card.valueFn(analytics.summary)}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xs font-medium text-gray-700 mb-1 leading-tight">{card.label}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionAnalytcics;