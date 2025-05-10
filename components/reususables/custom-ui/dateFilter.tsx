"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@heroui/react";

interface DateFilterProps {
	onFilterChange: (startDate: string, endDate: string) => void; // Updated to not return a Promise
	initialStartDate?: string;
	initialEndDate?: string;
	className?: string;
	isLoading?: boolean;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, initialStartDate, initialEndDate, className, isLoading = false }) => {
	const getDefaultDates = () => {
		const now = new Date();
		const today = now.toISOString().split("T")[0];
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
		return { today, firstDayOfMonth };
	};

	const defaultDates = getDefaultDates();
	const [startDate, setStartDate] = useState(initialStartDate || defaultDates.firstDayOfMonth);
	const [endDate, setEndDate] = useState(initialEndDate || defaultDates.today);
	const [isFiltering, setIsFiltering] = useState(false);

	useEffect(() => {
		if (initialStartDate) setStartDate(initialStartDate);
		if (initialEndDate) setEndDate(initialEndDate);
	}, [initialStartDate, initialEndDate]);

	const handleApply = () => {
		if (!isValidDateRange()) return;
		setIsFiltering(true);
		onFilterChange(startDate, endDate); // Call the parent handler
		setIsFiltering(false);
	};

	const isValidDateRange = () => {
		if (!startDate || !endDate) return false;
		return new Date(startDate) <= new Date(endDate);
	};

	return (
		<div className={className}>
			<div className="flex gap-2 items-center space-x-3">
				<p className="text-sm text-default-400">From</p>
				<Input
					type="date"
					placeholder="Start Date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className="w-full"
					max={endDate || undefined}
				/>
				<p className="text-sm text-default-400">To</p>
				<Input
					type="date"
					placeholder="End Date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className="w-full"
					min={startDate || undefined}
				/>

				<Button
					variant="flat"
					className="bg-primary text-white"
					onPress={handleApply}
					disabled={!isValidDateRange() || isLoading || isFiltering}>
					{isFiltering || isLoading ? "Loading..." : "Apply"}
				</Button>
			</div>
		</div>
	);
};

export default DateFilter;
