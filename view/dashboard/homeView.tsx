"use client";

import { DashCard, DateFilter, DeviceCard } from "@/components/reususables/custom-ui";
import { getAllLoans, getAllDevices } from "@/lib/api";
import React, { useEffect, useState } from "react";

const HomeView = () => {
	const [loans, setLoans] = useState({ data: {} });
	const [devices, setDevices] = useState({ data: {} });
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = async (start?: string, end?: string) => {
		try {
			setIsLoading(true);
			// Only fetch if both dates are provided or neither is provided
			if ((start && end) || (!start && !end)) {
				const [loansResponse, devicesResponse] = await Promise.all([getAllLoans(start || "", end || ""), getAllDevices(start || "", end || "")]);
				setLoans(loansResponse);
				setDevices(devicesResponse);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Initial fetch without dates
		fetchData();
	}, []);

	// Refetch when dates change
	useEffect(() => {
		if (startDate && endDate) {
			fetchData(startDate, endDate);
		}
	}, [startDate, endDate]);

	const loanMetrics = loans?.data || {};
	const deviceMetrics = devices?.data || {};

	const generateHref = (key: string) => {
		if (key.includes("Engaged")) return "/loans/engaged";
		if (key.includes("Ongoing")) return "/loans/ongoing";
		if (key.includes("Completed")) return "/loans/completed";
		if (key.includes("Engaged")) return "/devices/engaged";
		if (key.includes("Enrolled")) return "/devices/enrolled";
		if (key.includes("Unenrolled")) return "/devices/unenrolled";
		return "/";
	};

	const handleDateFilter = async (start: string, end: string) => {
		// Validate dates
		if (!start || !end) {
			return;
		}

		const startDateTime = new Date(start);
		const endDateTime = new Date(end);

		if (endDateTime < startDateTime) {
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
					onFilterChange={handleDateFilter}
					initialStartDate={startDate}
					initialEndDate={endDate}
					isLoading={isLoading}
				/>
			</div>
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
		</div>
	);
};

export default HomeView;
