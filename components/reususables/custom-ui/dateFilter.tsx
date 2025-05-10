"use client";

import React, { useState, useEffect } from "react";
import { DateRangePicker, Button } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";

interface DateFilterProps {
	onFilterChange: (startDate: string, endDate: string) => void;
	initialStartDate?: string;
	initialEndDate?: string;
	className?: string;
	isLoading?: boolean;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, initialStartDate, initialEndDate, className, isLoading = false }) => {
	// Range state for DateRangePicker
	const [range, setRange] = useState<{ start: DateValue | null; end: DateValue | null }>({
		start: null,
		end: null,
	});

	// Initialize the picker if initial dates are provided
	useEffect(() => {
		if (initialStartDate && initialEndDate) {
			setRange({
				start: parseDate(initialStartDate),
				end: parseDate(initialEndDate),
			});
		}
	}, [initialStartDate, initialEndDate]);

	// Validate that both start and end are set and start <= end
	const isValidRange = (r: { start: DateValue | null; end: DateValue | null }) => {
		if (!r.start || !r.end) return false;
		return r.start.compare(r.end) <= 0;
	};

	// Apply button handler: convert DateValue to ISO string
	const handleApply = () => {
		if (!isValidRange(range)) return;
		const start = range?.start?.toString();
		const end = range?.end?.toString();
		if (!start || !end) return;
		onFilterChange(start, end);
	};
	return (
		<div className={className}>
			<div className="flex gap-2 items-center">
				<DateRangePicker
					variant="bordered"
					value={range.start && range.end ? { start: range.start, end: range.end } : null}
					onChange={(value) =>
						setRange({
							start: value?.start || null,
							end: value?.end || null,
						})
					}
					isDisabled={isLoading}
				/>
				<Button
					variant="flat"
					className="bg-primary text-white"
					onPress={handleApply}
					disabled={!isValidRange(range) || isLoading}>
					{isLoading ? "Loading..." : "Apply"}
				</Button>
			</div>
		</div>
	);
};

export default DateFilter;
