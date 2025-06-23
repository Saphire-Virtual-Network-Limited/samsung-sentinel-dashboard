"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { getInceptionReport } from "@/lib";
import { BarChart3, Smartphone, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const InceptionDashCardCollection = () => {
    const [hasNoRecords, setHasNoRecords] = useState(false);

    const sales_channels = ["", "samsung", "xiaomi", "oppo", "MBE"];

    // Fetch data for all channels in parallel
    const { data: reports = [], isLoading } = useSWR(
        ["inception-report-multi", ...sales_channels],
        async () => {
            try {
                const results = await Promise.all(
                    sales_channels.map((channel) =>
                        getInceptionReport(channel)
                            .then((r) => r.data || {})
                            .catch((error) => {
                                console.error(`Error fetching data for ${channel}:`, error);
                                return {};
                            })
                    )
                );
                
                if (results.every(result => !result || Object.keys(result).length === 0)) {
                    setHasNoRecords(true);
                } else {
                    setHasNoRecords(false);
                }
                
                return results;
            } catch (error) {
                console.error("Error fetching inception reports:", error);
                setHasNoRecords(true);
                return [];
            }
        },
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000,
            refreshInterval: 60000,
            shouldRetryOnError: false,
            keepPreviousData: true,
            revalidateIfStale: true
        }
    );

    // console.log("inception reports", reports);

    // Extract data for each channel
    const overall = reports[0] || {};
    const samsung = reports[1] || {};
    const xiaomi = reports[2] || {};
    const oppo = reports[3] || {};
    const mbe = reports[4] || {};
    // Helper to format numbers with commas
    const formatNumber = (num: string | number) => {
      if (typeof num === 'string' && num.includes('.')) {
        // Format decimals with commas
        const [intPart, decPart] = num.split('.');
        return `${Number(intPart).toLocaleString()}.${decPart}`;
      }
      return Number(num).toLocaleString();
    };

    // Helper to get channel data
    const getChannelData = (channelData: any) => {
      return {
        Inception_Date: channelData.Inception_Date || "",
        Total_Inception_Loan: channelData.Total_Inception_Loan || 0,
        Total_Inception_Loan_Value: channelData.Total_Inception_Loan_Value || "0",
        Average_Inception_Loan_Value: channelData.Average_Inception_Loan_Value || "0",
        Total_Enrolled_Devices_Since_Inception: channelData.Total_Enrolled_Devices_Since_Inception || 0
      };
    };

    // Get data for each channel
    const overallData = getChannelData(overall);
    const samsungData = getChannelData(samsung);
    const xiaomiData = getChannelData(xiaomi);
    const oppoData = getChannelData(oppo);
    const mbeData = getChannelData(mbe);
    // Channel configuration with colors and icons
    const channelConfig = {
      overall: {
        name: "Overall",
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
        url: "/access/admin/reports/sales/overview"
      },
      samsung: {
        name: "Samsung",
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        icon: <Smartphone className="w-5 h-5 text-purple-600" />,
        url: "/access/admin/reports/sales/samsung"
      },
      xiaomi: {
        name: "Xiaomi",
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: <Smartphone className="w-5 h-5 text-orange-600" />,
        url: "/access/admin/reports/sales/xiaomi"
      },
      oppo: {
        name: "Oppo",
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: <Smartphone className="w-5 h-5 text-green-600" />,
        url: "/access/admin/reports/sales/oppo"
      },
      mbe: {
        name: "MBE",
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: <Smartphone className="w-5 h-5 text-red-600" />,
        url: "/access/admin/reports/sales/mbe"
      }
    };

    const renderMetricRow = (label: string, value: string | number, isCurrency: boolean = false) => (
      <div className="flex flex-row items-center justify-between lg:flex-col lg:items-start xl:flex-col xl:items-start py-2 border-b border-gray-100 last:border-b-0">
        <span className={cn("text-xs text-gray-600 lg:mb-1 xl:mb-1", GeneralSans_Meduim.className)}>
          {label}
        </span>
        <span className={cn("text-sm font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
          {isCurrency ? `₦${formatNumber(value)}` : formatNumber(value)}
        </span>
      </div>
    );

    const renderChannelCard = (channel: keyof typeof channelConfig, data: any) => {
      const config = channelConfig[channel];
      
      return (
        <Card
          as={Link}
          isPressable
          href={config.url}
          className={cn(
            "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
            config.borderColor,
            "hover:border-gray-300"
          )}
        >
          {/* Gradient header */}
          <div className={cn("bg-gradient-to-r p-3", config.color)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
                  {config.icon}
                </div>
                <h2 className={cn("text-white font-semibold text-base", GeneralSans_SemiBold.className)}>
                  {config.name}
                </h2>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card body */}
          <CardBody className="p-4 space-y-1">
            {renderMetricRow("Total Repayment", data.Total_Inception_Loan)} {/* Total Repayment */}
            {renderMetricRow("Total Value", data.Total_Inception_Loan_Value, true)} {/* Total Value */}
            {renderMetricRow("Average Value", data.Average_Inception_Loan_Value, true)} {/* Average Value */}
            {renderMetricRow("Enrolled Devices", data.Total_Enrolled_Devices_Since_Inception)} {/* Total Enrolled Devices */}
          </CardBody>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </Card>
      );
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className={cn("text-2xl sm:text-3xl font-bold text-gray-900 mb-2", GeneralSans_SemiBold.className)}>
            Since Inception Performance
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Cumulative loan performance and device enrollment statistics
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {renderChannelCard('overall', overallData)}
          {renderChannelCard('mbe', mbeData)}
          {renderChannelCard('samsung', samsungData)}
          {renderChannelCard('xiaomi', xiaomiData)}
          {renderChannelCard('oppo', oppoData)}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-16 rounded-t-2xl"></div>
                <div className="bg-white p-4 space-y-3 rounded-b-2xl border">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No records state */}
        {hasNoRecords && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={cn("text-lg font-semibold text-gray-900 mb-2", GeneralSans_SemiBold.className)}>
              No Data Available
            </h3>
            <p className="text-gray-600">
              There are no inception records available for the selected channels.
            </p>
          </div>
        )}
      </div>
    );
};

export default InceptionDashCardCollection;