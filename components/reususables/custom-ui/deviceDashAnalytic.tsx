"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
import {  getDeviceDashAnalytic } from "@/lib";
import { TrendingDown, TrendingUp } from "lucide-react";
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
				console.error("Error fetching daily reports:", error);
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

    console.log("DAILY reports", reports);

    // Helper to format numbers with commas
    const formatNumber = (num: string | number) => {
      if (typeof num === 'string' && num.includes('.')) {
        // Format decimals with commas
        const [intPart, decPart] = num.split('.');
        return `${Number(intPart).toLocaleString()}.${decPart}`;
      }
      return Number(num).toLocaleString();
    };

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
      {
        title: "Daily Devices",
        enrolled: formatNumber(reports.Daily_Enrolled_Devices || 0),
        unenrolled: formatNumber(reports.Daily_Unenrolled_Devices || 0),
        href: "#"
      },
      {
        title: "Month Till Date",
        enrolled: formatNumber(reports.Month_Till_Date_Enrolled_Devices || 0),
        unenrolled: formatNumber(reports.Month_Till_Date_Unenrolled_Devices || 0),
        href: "#"
      },
      {
        title: "Year Till Date",
        enrolled: formatNumber(reports.Year_Till_Date_Enrolled_Devices || 0),
        unenrolled: formatNumber(reports.Year_Till_Date_Unenrolled_Devices || 0),
        href: "#"
      }
    ];

    return (
      <>

        <pre style={{ background: '#f3f3f3', color: '#333', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', overflowX: 'auto' }}>Device Analytics</pre>

        <div className="grid auto-rows-min gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 py-4">
            {metrics.map((metric, index) => (
              <Card
                key={index}
                as={Link}
                isPressable
                href={metric.href}
                className="rounded-xl hover:shadow-md transition-all duration-300 p-3 sm:p-4 cursor-pointer">
                <CardHeader className="flex items-start justify-between pb-2">
                    <h1 className={cn("text-[13px] sm:text-[14px] text-gray-600", GeneralSans_Meduim.className)}>{metric.title}</h1>
                </CardHeader>
                <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                    <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Enrolled</h1>

                    <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                    {metric.enrolled}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Unenrolled</h1>

                    <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                    {metric.unenrolled}
                    </p>
                </div>
                </CardBody>
                </Card>
            ))}
        </div>
      </>
    );
};

export default DeviceDashAnalytic;