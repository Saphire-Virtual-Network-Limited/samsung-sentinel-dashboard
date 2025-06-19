"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import {  getDailyReport } from "@/lib";
import { TrendingDown, TrendingUp, DollarSign, Users, Calendar, BarChart3, Phone, Smartphone } from "lucide-react";
import { useState } from "react";

const DailyDashCard = () => {
    const [hasNoRecords, setHasNoRecords] = useState(false);

    const sales_channels = ["", "samsung", "xiaomi", "oppo"];

    // Fetch data for all channels in parallel
    const { data: reports = [], isLoading } = useSWR(
        ["daily-report-multi", ...sales_channels],
        async () => {
            try {
                const results = await Promise.all(
                    sales_channels.map((channel) =>
                        getDailyReport(channel)
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
                console.error("Error fetching daily reports:", error);
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

  console.log("NEW DAILY reports", reports);

    // Extract data for each channel
    const overall = reports[0] || {};
    const samsung = reports[1] || {};
    const xiaomi = reports[2] || {};
    const oppo = reports[3] || {};

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
        today_loan: channelData.Total_Today_Loan || 0,
        total_value: channelData.Total_Today_Loan_Value || "0",
        average_value: channelData.Average_Today_Loan_Value || "0",
        This_month_MTD_loan: channelData.Total_Today_MTD_Loan || 0,
        Last_month_LTD_loan: channelData.Total_Today_LTD_Loan || 0,
      };
    };

    // Get data for each channel
    const overallData = getChannelData(overall);
    const samsungData = getChannelData(samsung);
    const xiaomiData = getChannelData(xiaomi);
    const oppoData = getChannelData(oppo);

    // Helper to format each metric card
    const formatMetric = (title: string, value: string | number, change: string, href: string, hasNaira: boolean = false) => {
      const numericChange = parseFloat(change);
      const isPositive = numericChange > 0;
      const trendIcon = isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />;
      const changeColor = isPositive ? "text-green-600" : "text-red-600";
      const changeBg = isPositive ? "bg-green-100" : "bg-red-100";

      return {
        title,
        value,
        change: `${change}%`,
        trendIcon,
        changeColor,
        changeBg,
        href,
        hasNaira
      };
    };

    // Build dynamic metrics from API response
    const metrics = [
      formatMetric("Total Today Loan", formatNumber(overallData.today_loan), "0", "#"),
      formatMetric("Total Today Loan Value", formatNumber(overallData.total_value), "0", "#", true),
      formatMetric("Average Today Loan Value", formatNumber(overallData.average_value), "0", "#", true),
      formatMetric("Today Date", overall.Today_Date || "", "0", "#"),
      formatMetric("This Month MTD Loan", formatNumber(overallData.This_month_MTD_loan), "0", "#"),
      formatMetric("Last Month LTD Loan", formatNumber(overallData.Last_month_LTD_loan), "0", "#"),
    ];

    // Channel configuration with colors and icons
    const channelConfig = {
      overall: {
        name: "Overall",
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: <BarChart3 className="w-5 h-5 text-blue-600" />
      },
      samsung: {
        name: "Samsung",
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        icon: <Smartphone className="w-5 h-5 text-purple-600" />
      },
      xiaomi: {
        name: "Xiaomi",
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: <Smartphone className="w-5 h-5 text-orange-600" />
      },
      oppo: {
        name: "Oppo",
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: <Smartphone className="w-5 h-5 text-green-600" />
      }
    };

    const renderMetricRow = (label: string, value: string | number, isCurrency: boolean = false) => (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
        <span className={cn("text-xs text-gray-600", GeneralSans_Meduim.className)}>
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
          href={"#"}
          className={cn(
            "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
            config.borderColor,
            "hover:border-gray-300"
          )}
        >
          {/* Gradient header */}
          <div className={cn("bg-gradient-to-r p-4", config.color)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn("p-2 rounded-lg", config.bgColor)}>
                  {config.icon}
                </div>
                <h2 className={cn("text-white font-semibold text-lg", GeneralSans_SemiBold.className)}>
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
            {renderMetricRow("Today Loan", data.today_loan)}
            {renderMetricRow("Total Value", data.total_value, true)}
            {renderMetricRow("Average Value", data.average_value, true)}
            {renderMetricRow("MTD Loans", data.This_month_MTD_loan)}
            {renderMetricRow("Last Month", data.Last_month_LTD_loan)}
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
          {/* <h1 className={cn("text-2xl sm:text-3xl font-bold text-gray-900 mb-2", GeneralSans_SemiBold.className)}>
            Daily Loan Performance
          </h1> */}
          {/* <p className="text-gray-600 text-sm sm:text-base">
            Overview for {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p> */}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {renderChannelCard('overall', overallData)}
          {renderChannelCard('samsung', samsungData)}
          {renderChannelCard('xiaomi', xiaomiData)}
          {renderChannelCard('oppo', oppoData)}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-16 rounded-t-2xl"></div>
                <div className="bg-white p-4 space-y-3 rounded-b-2xl border">
                  {[...Array(5)].map((_, j) => (
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
              There are no loan records available for the selected date range.
            </p>
          </div>
        )}
      </div>
    );
};

export default DailyDashCard;