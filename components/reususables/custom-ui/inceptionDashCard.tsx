"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import {  Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
import {  getInceptionReport } from "@/lib";


const InceptionDashCard = () => {

    const sales_channels = ["", "samsung", "xiaomi", "oppo"];

    	// Fetch data for all channels in parallel
	const { data: reports = [] } = useSWR(
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
				
				return results;
			} catch (error) {
				console.error("Error fetching daily reports:", error);
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

    console.log("inception reports", reports);

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

    // console.log("reports", reports);

    return (
      <>

        <pre style={{ background: '#f3f3f3', color: '#333', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', overflowX: 'auto' }}>since inception</pre>

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
                  {`${formatNumber(overallData.Total_Inception_Loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦ ${formatNumber(overallData.Total_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦ ${formatNumber(overallData.Average_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Enrolled Devices</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(overallData.Total_Enrolled_Devices_Since_Inception)}`}
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
                  {`${formatNumber(samsungData.Total_Inception_Loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(samsungData.Total_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(samsungData.Average_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Enrolled Devices</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(samsungData.Total_Enrolled_Devices_Since_Inception)}`}
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
                  {`${formatNumber(xiaomiData.Total_Inception_Loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(xiaomiData.Total_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(xiaomiData.Average_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Enrolled Devices</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(overallData.Total_Enrolled_Devices_Since_Inception)}`}
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
                  {`${formatNumber(oppoData.Total_Inception_Loan)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Sum</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(oppoData.Total_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                    <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Avg.</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`₦${formatNumber(oppoData.Average_Inception_Loan_Value)}`}
                  </p>
              </div>
              <div className="flex items-center justify-between">
                  <h1 className={cn("text-[11px] sm:text-[12px] text-gray-600", GeneralSans_Meduim.className)}>Enrolled Devices</h1>

                  <p className={cn("text-xs sm:text-sm font-semibold text-gray-800", GeneralSans_SemiBold.className)}>
                  {`${formatNumber(oppoData.Total_Enrolled_Devices_Since_Inception)}`}
                  </p>
              </div>
              </CardBody>
              </Card>
        </div>
      </>
    );
};

export default InceptionDashCard;