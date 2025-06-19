"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { getDeviceDashAnalytic } from "@/lib";
import { TrendingDown, TrendingUp, Smartphone, Calendar, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

const DeviceDashAnalytic = () => {
    const [hasNoRecords, setHasNoRecords] = useState(false);

    // Fetch data for all channels in parallel
    const { data: reports = [], isLoading } = useSWR(
        "device-dash-analytic",
        async () => {
            try {
                const result = await getDeviceDashAnalytic()
                    .then((r) => r.data || {})
                    .catch((error) => {
                        console.error(`Error fetching data for device-dash-analytic:`, error);
                        return {};
                    });

                if (!result || Object.keys(result).length === 0) {
                    setHasNoRecords(true);
                } else {
                    setHasNoRecords(false);
                }

                return result;
            } catch (error) {
                console.error("Error fetching device analytics:", error);
                setHasNoRecords(true);
                return {};
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

    // console.log("DAILY reports", reports);

    // Helper to format numbers with commas
    const formatNumber = (num: string | number) => {
      if (typeof num === 'string' && num.includes('.')) {
        // Format decimals with commas
        const [intPart, decPart] = num.split('.');
        return `${Number(intPart).toLocaleString()}.${decPart}`;
      }
      return Number(num).toLocaleString();
    };

    // Metric configuration with colors and icons
    const metricConfig = {
      daily: {
        title: "Daily Devices",
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: <Smartphone className="w-5 h-5 text-blue-600" />
      },
      mtd: {
        title: "Month Till Date",
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        icon: <Calendar className="w-5 h-5 text-purple-600" />
      },
      ytd: {
        title: "Year Till Date",
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: <BarChart3 className="w-5 h-5 text-green-600" />
      }
    };

    const renderMetricRow = (label: string, value: string | number, isEnrolled: boolean = true) => (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center space-x-2">
          {isEnrolled ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={cn("text-xs text-gray-600", GeneralSans_Meduim.className)}>
            {label}
          </span>
        </div>
        <span className={cn("text-sm font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
          {formatNumber(value)}
        </span>
      </div>
    );

    const renderMetricCard = (metricKey: keyof typeof metricConfig, enrolled: string | number, unenrolled: string | number) => {
      const config = metricConfig[metricKey];
      
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
                  {config.title}
                </h2>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card body */}
          <CardBody className="p-4 space-y-1">
            {renderMetricRow("Enrolled", enrolled, true)}
            {renderMetricRow("Unenrolled", unenrolled, false)}
          </CardBody>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </Card>
      );
    };

    // Build metrics data
    const metrics = [
      {
        key: 'daily' as keyof typeof metricConfig,
        enrolled: reports.Daily_Enrolled_Devices || 0,
        unenrolled: reports.Daily_Unenrolled_Devices || 0
      },
      {
        key: 'mtd' as keyof typeof metricConfig,
        enrolled: reports.Month_Till_Date_Enrolled_Devices || 0,
        unenrolled: reports.Month_Till_Date_Unenrolled_Devices || 0
      },
      {
        key: 'ytd' as keyof typeof metricConfig,
        enrolled: reports.Year_Till_Date_Enrolled_Devices || 0,
        unenrolled: reports.Year_Till_Date_Unenrolled_Devices || 0
      }
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className={cn("text-2xl sm:text-3xl font-bold text-gray-900 mb-2", GeneralSans_SemiBold.className)}>
            Device Analytics
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Device enrollment and unenrollment statistics across different time periods
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {metrics.map((metric, index) => (
            <div key={index}>
              {renderMetricCard(metric.key, metric.enrolled, metric.unenrolled)}
            </div>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-16 rounded-t-2xl"></div>
                <div className="bg-white p-4 space-y-3 rounded-b-2xl border">
                  {[...Array(2)].map((_, j) => (
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
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={cn("text-lg font-semibold text-gray-900 mb-2", GeneralSans_SemiBold.className)}>
              No Device Data Available
            </h3>
            <p className="text-gray-600">
              There are no device analytics records available at the moment.
            </p>
          </div>
        )}
      </div>
    );
};

export default DeviceDashAnalytic;