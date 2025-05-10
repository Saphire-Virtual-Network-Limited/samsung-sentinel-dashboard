"use client";

import { DashCard, DateFilter, DeviceCard, CardSkeleton } from "@/components/reususables";
import React, { Suspense, useState } from "react";
import useSWR from "swr";
import { getAllLoanData, getAllDevicesData } from "@/lib";

const HomeContent = ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
	// Only include startDate and endDate in keys if they're defined
	const loanKey = startDate && endDate ? ["loanRecords", startDate, endDate] : ["loanRecords"];
	const deviceKey = startDate && endDate ? ["deviceMetrics", startDate, endDate] : ["deviceMetrics"];

	const loanFetcher = async (_: string, start?: string, end?: string) => {
		return await getAllLoanData(start, end);
	};

	const deviceFetcher = async (_: string, start?: string, end?: string) => {
		return await getAllDevicesData(start, end);
	};

	const { data: loans, isLoading: isLoansLoading } = useSWR(loanKey, loanFetcher, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
		revalidateIfStale: false,
		dedupingInterval: 60000,
	});

	const { data: devices, isLoading: isDevicesLoading } = useSWR(deviceKey, deviceFetcher, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
		revalidateIfStale: false,
		dedupingInterval: 60000,
	});

	const isLoading = isLoansLoading || isDevicesLoading;
	const loanMetrics = loans?.data || {};
	const deviceMetrics = devices?.data || {};

	const generateHref = (key: string) => {
		if (key.includes("Engaged")) return "/devices/engaged";
		if (key.includes("Ongoing")) return "/loans/ongoing";
		if (key.includes("Completed")) return "/loans/completed";
		if (key.includes("Enrolled")) return "/devices/enrolled";
		if (key.includes("Unenrolled")) return "/devices/unenrolled";
		return "/";
	};

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-5">
				{Array.from({ length: 8 }).map((_, index) => (
					<CardSkeleton key={index} />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-5">
			{Object.entries(loanMetrics).map(([key, metric]: any) => {
				const hasNaira = key.toLowerCase().includes("amount");
				const rawValue = metric.value || 0;
				const formattedValue = hasNaira ? rawValue.toLocaleString() : rawValue;

				return (
					<div key={key}>
						<DashCard
							title={key.replace(/Total /, "")}
							value={formattedValue}
							href={generateHref(key)}
							hasNaira={hasNaira}
							changeValue={metric.percentageChange || 0}
							change={metric.trend || "stable"}
							changeString="from previous month"
						/>
					</div>
				);
			})}
			{Object.entries(deviceMetrics).map(([key, metric]: any) => {
				const hasNaira = key.toLowerCase().includes("amount");
				const rawValue = metric.value || 0;
				const formattedValue = hasNaira ? rawValue.toLocaleString() : rawValue;

				return (
					<div key={key}>
						<DeviceCard
							title={key.replace(/Total /, "")}
							value={formattedValue}
							href={generateHref(key)}
							hasNaira={hasNaira}
							changeValue={metric.percentageChange || 0}
							change={metric.trend || "stable"}
							changeString="from previous month"
						/>
					</div>
				);
			})}
		</div>
	);
};

const HomeView = () => {
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [endDate, setEndDate] = useState<string | undefined>(undefined);

	const handleDateFilter = (start: string, end: string) => {
		if (!start || !end) return;
		if (new Date(end) < new Date(start)) {
			console.error("End date must be after start date");
			return;
		}
		setStartDate(start);
		setEndDate(end);
	};

	return (
		<div>
			<div>
				<DateFilter
					className="w-full flex justify-end"
					onFilterChange={(start, end) => handleDateFilter(start, end)}
					initialStartDate={startDate}
					initialEndDate={endDate}
					isLoading={false}
				/>
			</div>
			<Suspense fallback={<div className="py-5">Loading dashboard...</div>}>
				<HomeContent
					startDate={startDate}
					endDate={endDate}
				/>
			</Suspense>
		</div>
	);
};

export default HomeView;
