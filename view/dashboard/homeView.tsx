"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { DashCard, DeviceCard, CardSkeleton, DateFilter } from "@/components/reususables";
import { getAllLoanData, getAllDevicesData, showToast } from "@/lib";

const HomeView = () => {
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);

	const handleDateFilter = (start: string, end: string) => {
		if (!start || !end) {
			showToast({ message: "Both dates must be selected.", type: "error" });
			return;
		}
		if (new Date(end) < new Date(start)) {
			showToast({ message: "End date must be after start date.", type: "error" });
			return;
		}
		setStartDate(start);
		setEndDate(end);
	};

	// Fetch loans—initially with (undefined,undefined), then with real dates.
	const { data: loanRes, isLoading: isLoansLoading } = useSWR(["loan", startDate, endDate], () => getAllLoanData(startDate, endDate), { revalidateOnFocus: true, dedupingInterval: 60000 });

	// Fetch devices—same strategy.
	const { data: devRes, isLoading: isDevicesLoading } = useSWR(["device", startDate, endDate], () => getAllDevicesData(startDate, endDate), { revalidateOnFocus: true, dedupingInterval: 60000 });

	const isLoading = isLoansLoading || isDevicesLoading;
	const loanMetrics = loanRes?.data || {};
	const deviceMetrics = devRes?.data || {};

	const generateHref = (key: string) => {
		if (key.includes("Engaged")) return "/devices/engaged";
		if (key.includes("Ongoing")) return "/loans/ongoing";
		if (key.includes("Completed")) return "/loans/completed";
		if (key.includes("Enrolled")) return "/devices/enrolled";
		if (key.includes("Unenrolled")) return "/devices/unenrolled";
		return "/";
	};

	return (
		<div>
			<DateFilter
				className="w-full flex justify-end"
				onFilterChange={handleDateFilter}
				initialStartDate={startDate}
				initialEndDate={endDate}
				isLoading={isLoading}
			/>

			{isLoading ? (
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-5">
					{Array.from({ length: 8 }).map((_, i) => (
						<CardSkeleton key={i} />
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-5">
					{Object.entries(loanMetrics).map(([key, m]: any) => {
						const hasNaira = key.toLowerCase().includes("amount");
						const raw = m.value || 0;
						return (
							<DashCard
								key={key}
								title={key.replace(/Total /, "")}
								value={hasNaira ? raw.toLocaleString() : raw}
								href={generateHref(key)}
								hasNaira={hasNaira}
								changeValue={m.percentageChange || 0}
								change={m.trend || "stable"}
								changeString="from previous month"
							/>
						);
					})}
					{Object.entries(deviceMetrics).map(([key, m]: any) => {
						const hasNaira = key.toLowerCase().includes("amount");
						const raw = m.value || 0;
						return (
							<DeviceCard
								key={key}
								title={key.replace(/Total /, "")}
								value={hasNaira ? raw.toLocaleString() : raw}
								href={generateHref(key)}
								hasNaira={hasNaira}
								changeValue={m.percentageChange || 0}
								change={m.trend || "stable"}
								changeString="from previous month"
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default HomeView;
