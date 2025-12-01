"use client";

import React, { useState, useEffect } from "react";
import { DateRangePicker, Button } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";

interface DateFilterProps {
	onFilterChange: (startDate: string, endDate: string) => void;
	initialStartDate?: string;
	initialEndDate?: string;
	defaultDateRange?: { days: number }; // e.g., { days: 7 } for past 7 days
	className?: string;
	isLoading?: boolean;
}

const DateFilter: React.FC<DateFilterProps> = ({
	onFilterChange,
	initialStartDate,
	initialEndDate,
	defaultDateRange,
	className,
	isLoading = false,
}) => {
	// Range state for DateRangePicker
	const [range, setRange] = useState<{
		start: DateValue | null;
		end: DateValue | null;
	}>({
		start: null,
		end: null,
	});

	// Function to calculate default date range
	const getDefaultDateRange = (days: number) => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - days);

		return {
			start: startDate.toISOString().split("T")[0], // YYYY-MM-DD format
			end: endDate.toISOString().split("T")[0], // YYYY-MM-DD format
		};
	};

	// Initialize the picker if initial dates are provided or apply default range
	useEffect(() => {
		if (initialStartDate && initialEndDate) {
			setRange({
				start: parseDate(initialStartDate),
				end: parseDate(initialEndDate),
			});
		} else if (defaultDateRange && !initialStartDate && !initialEndDate) {
			// Apply default date range and trigger the filter
			const defaultRange = getDefaultDateRange(defaultDateRange.days);
			setRange({
				start: parseDate(defaultRange.start),
				end: parseDate(defaultRange.end),
			});
			// Automatically apply the default filter
			onFilterChange(defaultRange.start, defaultRange.end);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialStartDate, initialEndDate]);

	// Validate that both start and end are set and start <= end
	const isValidRange = (r: {
		start: DateValue | null;
		end: DateValue | null;
	}) => {
		if (!r.start || !r.end) return false;
		return r.start.compare(r.end) <= 0;
	};

	// Apply button handler: convert DateValue to ISO string
	const handleApply = () => {
		if (!isValidRange(range)) return;
		const start = range?.start?.toString();
		const end = range?.end?.toString();
		if (!start || !end) return;

		// Format dates to YYYY-MM-DD format
		const formattedStart = start.split("T")[0];
		const formattedEnd = end.split("T")[0];

		onFilterChange(formattedStart, formattedEnd);
	};
	return (
		<div className={className}>
			<div className="flex gap-2 items-center">
				<DateRangePicker
					variant="bordered"
					value={
						range.start && range.end
							? { start: range.start, end: range.end }
							: null
					}
					onChange={(value) =>
						setRange({
							start: value?.start || null,
							end: value?.end || null,
						})
					}
					isDisabled={isLoading}
					aria-label="Filter date range"
				/>
				<Button
					variant="flat"
					className="bg-primary text-white"
					onPress={handleApply}
					disabled={!isValidRange(range) || isLoading}
				>
					{isLoading ? "Loading..." : "Filter"}
				</Button>
			</div>
		</div>
	);
};

export default DateFilter;
