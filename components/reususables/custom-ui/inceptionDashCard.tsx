"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { getInceptionReport } from "@/lib";
import { BarChart3, Smartphone, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const InceptionDashCard = () => {
    const [hasNoRecords, setHasNoRecords] = useState(false);

    const sales_channels = ["", "samsung", "xiaomi", "oppo", "MBE", "glo", "9mobile"];

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
    const glo = reports[5] || {};
    const nineMobile = reports[6] || {};
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
    const gloData = getChannelData(glo);
    const nineMobileData = getChannelData(nineMobile);
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
      },
      glo: {
        name: "GLO",
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: <Smartphone className="w-5 h-5 text-blue-600" />,
        url: "/access/admin/reports/sales/glo"
      },
      nineMobile: {
        name: "9Mobile",
        color: "from-pink-500 to-pink-600",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200",
        icon: <Smartphone className="w-5 h-5 text-pink-600" />,
        url: "/access/admin/reports/sales/9mobile"
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
            {renderMetricRow("Total Loans", data.Total_Inception_Loan)}
            {renderMetricRow("Total Value", data.Total_Inception_Loan_Value, true)}
            {renderMetricRow("Average Value", data.Average_Inception_Loan_Value, true)}
            {renderMetricRow("Enrolled Devices", data.Total_Enrolled_Devices_Since_Inception)}
          </CardBody>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </Card>
      );
    };

    // Chart component to display channel data
    const renderChannelChart = () => {
      const chartData = [
        { name: 'MBE', value: mbeData.Total_Inception_Loan, color: '#ef4444' },
        { name: 'Samsung', value: samsungData.Total_Inception_Loan, color: '#8b5cf6' },
        { name: 'Xiaomi', value: xiaomiData.Total_Inception_Loan, color: '#f97316' },
        { name: 'Oppo', value: oppoData.Total_Inception_Loan, color: '#22c55e' },
        { name: 'GLO', value: gloData.Total_Inception_Loan, color: '#3b82f6' },
        { name: '9Mobile', value: nineMobileData.Total_Inception_Loan, color: '#ec4899' },
      ];

      const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
              <p className={cn("font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                {label}
              </p>
              <p className={cn("text-sm text-gray-600", GeneralSans_Meduim.className)}>
                Total Loans: {formatNumber(payload[0].value)}
              </p>
            </div>
          );
        }
        return null;
      };

      return (
        <Card className="h-[350px] border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <h3 className={cn("text-base font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                Channel Performance
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Total loan distribution across channels since inception
            </p>
          </div>
          <CardBody className="p-0">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 25, right: 15, left: 5, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Left Column - Overall and Chart (1/3 width) */}
          <div className="space-y-4">
            {/* Overall Card */}
            {renderChannelCard('overall', overallData)}
            
            {/* Chart Card */}
            {renderChannelChart()}
          </div>
          
          {/* Right Column - 6 Channel Cards (2/3 width) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {renderChannelCard('mbe', mbeData)}
            {renderChannelCard('samsung', samsungData)}
            {renderChannelCard('xiaomi', xiaomiData)}
            {renderChannelCard('oppo', oppoData)}
            {renderChannelCard('glo', gloData)}
            {renderChannelCard('nineMobile', nineMobileData)}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Left Column - Overall and Chart Skeletons (1/3 width) */}
            <div className="space-y-4">
              {/* Overall Card Skeleton */}
              <div className="animate-pulse">
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
              
              {/* Chart Skeleton */}
              <div className="animate-pulse">
                <div className="bg-gray-200 h-16 rounded-t-2xl"></div>
                <div className="bg-white p-4 rounded-b-2xl border">
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Right Column - 6 Channel Card Skeletons (2/3 width) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
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

export default InceptionDashCard;