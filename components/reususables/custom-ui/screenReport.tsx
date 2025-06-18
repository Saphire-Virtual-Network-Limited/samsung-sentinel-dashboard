"use client";

import useSWR from "swr";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn,} from "@/lib";
import { Card, CardBody, CardHeader, Input } from "@heroui/react";
import Link from "next/link";
import {  getDropOffReport } from "@/lib";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";


const ScreenReport = () => {

    const [hasNoRecords, setHasNoRecords] = useState(false);

    const screens = ["BVN Credit Check", "Loan Eligibility Check", "Card Tokenization", "Mandate Creation", "KYC Submission", "Loan Data Submission", "Down Payment", "Virtual Account Creation", "Mandate Approved", "Device Enrollment Started", "Device Enrollment Completed"];

    	// Fetch data for all channels in parallel

	const { data: reports = [], isLoading } = useSWR(
		["screen-report", ...screens],  
		async () => {
			try {
				const results = await Promise.all(
					screens.map((screen) =>
						getDropOffReport(screen)
							.then((r) => r.data || {})
							.catch((error) => {
								console.error(`Error fetching data for ${screen}:`, error);
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
				console.error("Error fetching screen reports:", error);
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

    console.log("screenreports", reports);

    // Extract data for each channel
    const bvn = reports[0] || {};
    const loanEligibility = reports[1] || {};
    const cardTokenization = reports[2] || {};
    const mandateCreation = reports[3] || {};
    const kycSubmission = reports[4] || {};
    const loanDataSubmission = reports[5] || {};
    const downPayment = reports[6] || {};
    const virtualAccountCreation = reports[7] || {};
    const mandateApproved = reports[8] || {};
    const deviceEnrollmentStarted = reports[9] || {};
    const deviceEnrollmentCompleted = reports[10] || {};

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
    const getScreenData = (screenData: any, screenName: string) => {
      // Log the raw data for each screen
      console.log(`Raw data for ${screenName}:`, screenData);
      
      // Extract the relevant fields based on screen name
      const dailyField = `Daily_${screenName.replace(/\s+/g, '_')}_Drop_Offs`;
      const mtdField = `MTD_${screenName.replace(/\s+/g, '_')}_Drop_Offs`;
      const ytdField = `YTD_${screenName.replace(/\s+/g, '_')}_Drop_Offs`;
      
      const data = {
        daily: screenData[dailyField] || 0,
        mtd: screenData[mtdField] || "0",
        ytd: screenData[ytdField] || "0"
      };
      
      console.log(`Processed data for ${screenName}:`, data);
      return data;
    };

    // Get data for each channel
    const bvnData = getScreenData(bvn, "BVN Credit Check");
    const loanEligibilityData = getScreenData(loanEligibility, "Loan Eligibility Check");
    const cardTokenizationData = getScreenData(cardTokenization, "Card Tokenization");
    const mandateCreationData = getScreenData(mandateCreation, "Mandate Creation");
    const kycSubmissionData = getScreenData(kycSubmission, "KYC Submission");
    const loanDataSubmissionData = getScreenData(loanDataSubmission, "Loan Data Submission");
    const downPaymentData = getScreenData(downPayment, "Down Payment");
    const virtualAccountCreationData = getScreenData(virtualAccountCreation, "Virtual Account Creation");
    const mandateApprovedData = getScreenData(mandateApproved, "Mandate Approved");
    const deviceEnrollmentStartedData = getScreenData(deviceEnrollmentStarted, "Device Enrollment Started");
    const deviceEnrollmentCompletedData = getScreenData(deviceEnrollmentCompleted, "Device Enrollment Completed");

    // Log all screen data in a structured way
    console.log("=== ALL SCREEN DATA ===");
    console.log("BVN Credit Check:", bvnData);
    console.log("Loan Eligibility Check:", loanEligibilityData);
    console.log("Card Tokenization:", cardTokenizationData);
    console.log("Mandate Creation:", mandateCreationData);
    console.log("KYC Submission:", kycSubmissionData);
    console.log("Loan Data Submission:", loanDataSubmissionData);
    console.log("Down Payment:", downPaymentData);
    console.log("Virtual Account Creation:", virtualAccountCreationData);
    console.log("Mandate Approved:", mandateApprovedData);
    console.log("Device Enrollment Started:", deviceEnrollmentStartedData);
    console.log("Device Enrollment Completed:", deviceEnrollmentCompletedData);
    console.log("=== END ALL SCREEN DATA ===");

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
      formatMetric("Total Drop Offs", formatNumber(bvnData.daily), "0", "#"),
      formatMetric("MTD Drop Offs", formatNumber(bvnData.mtd), "0", "#", true),
      formatMetric("YTD Drop Offs", formatNumber(bvnData.ytd), "0", "#", true),
    ];

    return (
      <>
        <pre style={{ background: '#f3f3f3', color: '#333', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', overflowX: 'auto' }}>Screen Drop-Off Reports</pre>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-t-lg"></div>
              {screens.map((_, index) => (
                <div key={index} className="h-12 bg-gray-100 border-b border-gray-200"></div>
              ))}
            </div>
          </div>
        ) : hasNoRecords ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No data available for screen reports</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={cn("text-left py-4 px-6 text-sm font-semibold text-gray-700", GeneralSans_SemiBold.className)}>
                      Screen
                    </th>
                    <th className={cn("text-right py-4 px-6 text-sm font-semibold text-gray-700", GeneralSans_SemiBold.className)}>
                      Today
                    </th>
                    <th className={cn("text-right py-4 px-6 text-sm font-semibold text-gray-700", GeneralSans_SemiBold.className)}>
                      MTD
                    </th>
                    <th className={cn("text-right py-4 px-6 text-sm font-semibold text-gray-700", GeneralSans_SemiBold.className)}>
                      YTD
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      BVN Credit Check
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(bvnData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(bvnData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(bvnData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Loan Eligibility Check
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(loanEligibilityData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(loanEligibilityData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(loanEligibilityData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Card Tokenization
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(cardTokenizationData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(cardTokenizationData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(cardTokenizationData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Mandate Creation
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(mandateCreationData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(mandateCreationData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(mandateCreationData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      KYC Submission
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(kycSubmissionData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(kycSubmissionData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(kycSubmissionData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Loan Data Submission
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(loanDataSubmissionData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(loanDataSubmissionData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(loanDataSubmissionData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Down Payment
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(downPaymentData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(downPaymentData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(downPaymentData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Virtual Account Creation
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(virtualAccountCreationData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(virtualAccountCreationData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(virtualAccountCreationData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Mandate Approved
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(mandateApprovedData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(mandateApprovedData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(mandateApprovedData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Device Enrollment Started
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(deviceEnrollmentStartedData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(deviceEnrollmentStartedData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(deviceEnrollmentStartedData.ytd)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className={cn("py-4 px-6 text-sm text-gray-900", GeneralSans_Meduim.className)}>
                      Device Enrollment Completed
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(deviceEnrollmentCompletedData.daily)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(deviceEnrollmentCompletedData.mtd)}
                    </td>
                    <td className={cn("py-4 px-6 text-sm text-right font-semibold text-gray-900", GeneralSans_SemiBold.className)}>
                      {formatNumber(deviceEnrollmentCompletedData.ytd)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
};

export default ScreenReport;