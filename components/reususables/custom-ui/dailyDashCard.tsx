"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Card, CardBody, CardHeader, Input } from "@heroui/react";
import Link from "next/link";
import {  getDailyReport } from "@/lib";
import { TrendingDown, TrendingUp } from "lucide-react";
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

    // console.log("reports", reports);

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

    return (
      <>

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-600 text-lg">
            Loan performance overview for{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="grid auto-rows-min gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 py-4">
            <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-3 sm:p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between pb-2">
                  <h1 className={cn("text-[13px] sm:text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Overall</h1>
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(overallData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦ ${formatNumber(overallData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦ ${formatNumber(overallData.average_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>MTD</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(overallData.This_month_MTD_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Last Month</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(overallData.Last_month_LTD_loan)}`}
                  </p>
              </div>
              </CardBody>
              </Card>
              <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-3 sm:p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between pb-2">
                  <h1 className={cn("text-[13px] sm:text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Samsung</h1>
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(samsungData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(samsungData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(samsungData.average_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>MTD</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(samsungData.This_month_MTD_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Last Month</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(samsungData.Last_month_LTD_loan)}`}
                  </p>
              </div>
              </CardBody>
              </Card>
              <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-3 sm:p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between pb-2">
                  <h1 className={cn("text-[13px] sm:text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Xiaomi</h1>
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(xiaomiData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(xiaomiData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(xiaomiData.average_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>MTD</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(xiaomiData.This_month_MTD_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Last Month</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(xiaomiData.Last_month_LTD_loan)}`}
                  </p>
              </div>
              </CardBody>
              </Card>
              <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-3 sm:p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between pb-2">
                  <h1 className={cn("text-[13px] sm:text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Oppo</h1>
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                    <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(oppoData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(oppoData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                    <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(oppoData.average_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>MTD</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(oppoData.This_month_MTD_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Last Month</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(oppoData.Last_month_LTD_loan)}`}
                  </p>
              </div>
              </CardBody>
              </Card>
        </div>
      </>
    );
};

export default DailyDashCard;