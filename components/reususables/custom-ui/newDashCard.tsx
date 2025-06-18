"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Button, card, Card, CardBody, CardHeader, Input } from "@heroui/react";
import Link from "next/link";
import {  getDailyReport } from "@/lib";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";


const NewDashCard = () => {

    const [hasNoRecords, setHasNoRecords] = useState(false);

    const sales_channels = ["", "samsung", "xiaomi", "oppo", "vivo"];

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

    // Extract data for each channel
    const overall = reports[0] || {};
    const samsung = reports[1] || {};
    const xiaomi = reports[2] || {};
    const oppo = reports[3] || {};
    const vivo = reports[4] || {};
    const realme = reports[5] || {};
    const infinix = reports[6] || {};
    const itel = reports[7] || {};
    const tecno = reports[8] || {};
    const nokia = reports[9] || {};
    const huawei = reports[10] || {};
    const oneplus = reports[11] || {};

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
        average_value: channelData.Average_Today_Loan_Value || "0"
      };
    };

    // Get data for each channel
    const overallData = getChannelData(overall);
    const samsungData = getChannelData(samsung);
    const xiaomiData = getChannelData(xiaomi);
    const oppoData = getChannelData(oppo);

    console.log("reports", reports);

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
    ];

    return (
      <>

        <pre style={{ background: '#f3f3f3', color: '#333', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', overflowX: 'auto' }}>Daily Report</pre>

        <div className="grid auto-rows-min gap-4 grid-cols-2 lg:grid-cols-4 py-4">
            <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Overall</h1>
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(overallData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦ ${formatNumber(overallData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦ ${formatNumber(overallData.average_value)}`}
                  </p>
              </div>
              </CardBody>
              </Card>
              <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Samsung</h1>
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(samsungData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(samsungData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(samsungData.average_value)}`}
                  </p>
              </div>

              </CardBody>
              </Card>
              <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Xiaomi</h1>
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(xiaomiData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(xiaomiData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(xiaomiData.average_value)}`}
                  </p>
              </div>
              
                <div className="grid lg:flex items-center gap-2 text-sm text-gray-500">

                </div>
              </CardBody>
              </Card>
              <Card
              as={Link}
              isPressable
              href={"#"}
              className="rounded-xl hover:shadow-md transition-all duration-300 p-4 cursor-pointer">
              <CardHeader className="flex items-start justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Oppo</h1>
                  {/* <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>29-10-2025</h1> */}
              </CardHeader>
              <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Today Loan</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(oppoData.today_loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(oppoData.total_value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[14px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("lg:text-lg text-lg font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(oppoData.average_value)}`}
                  </p>
              </div>
              
                <div className="grid lg:flex items-center gap-2 text-sm text-gray-500">
                  {/* <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600 w-fit`}>
                  +10000
                  </span> */}
                  {/* <span className={cn("text-xs", GeneralSans_Meduim.className)}>from last month</span> */}
                </div>
              </CardBody>
              </Card>
        </div>
      </>
    );
};

export default NewDashCard;