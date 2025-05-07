"use client";
import React from "react";
import { cn, GeneralSans_Meduim } from "@/lib";
import { Label } from "@/components/ui/label";
import { DateInput } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";

interface FormFieldProps {
	label: string;
	htmlFor: string;
	type: string;
	id: string;
	variant?: string;
	isInvalid?: boolean;
	errorMessage?: string;
	size: string;
	startcnt?: string | React.ReactElement;
	placeholder: string;
	reqValue?: string;
	onChange?: (value: string) => void;
	required?: boolean;
	minLen?: number;
	maxLen?: number;
	value?: string;
	disabled?: boolean;
}

const DateFormField: React.FC<FormFieldProps> = ({ label, htmlFor, isInvalid, errorMessage, placeholder, onChange, reqValue, required, value, disabled }) => {
	// Handle conversion of value string (MM-DD-YYYY) to CalendarDate
	const getCalendarDate = (dateString?: string): CalendarDate | undefined => {
		if (dateString && dateString.length === 10) {
			// Ensure it's in MM-DD-YYYY format
			const [month, day, year] = dateString.split("-").map(Number);

			// Ensure the year is a 4-digit number
			const fullYear = year < 1000 ? `20${year}` : String(year);

			// Ensure valid date parts
			if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
				// Log the parsed values for debugging
				//console.log(`Parsing date string: ${dateString}`);
				//console.log(`Parsed Month: ${month}, Day: ${day}, Year: ${fullYear}`);

				// The month is zero-indexed in CalendarDate, so subtract 1
				const calendarDate = new CalendarDate(Number(fullYear), month - 1, day); // Month is 0-indexed in CalendarDate
				//console.log(`CalendarDate created: ${calendarDate}`);
				return calendarDate;
			}
		}
		return undefined;
	};

	const handleDateChange = (newValue: CalendarDate | null) => {
		// If the value is null (e.g., after backspace), just return and do nothing
		if (!newValue) {
			//console.log("Date cleared"); // Log if date is cleared
			onChange?.(""); // Reset the value to empty string when cleared
			return;
		}

		// Log the CalendarDate object to see its contents
		//console.log(`CalendarDate Object: ${newValue}`);
		//console.log(`Month: ${newValue.month}, Day: ${newValue.day}, Year: ${newValue.year}`);

		// If the new value is valid, convert CalendarDate to string (MM-DD-YYYY)
		// Make sure we correctly format the date into MM-DD-YYYY
		// Ensure the year is always a 4-digit number
		const formattedDate = `${String(newValue.month).padStart(2, "0")}-${String(newValue.day).padStart(2, "0")}-${String(newValue.year).padStart(4, "0")}`;

		// Log the formatted date to ensure correct formatting
		//console.log(`Formatted Date: ${formattedDate}`);
		onChange?.(formattedDate); // Convert back to MM-DD-YYYY format
	};

	return (
		<div className="flex flex-col space-y-1.5">
			<Label
				htmlFor={htmlFor}
				className={cn("mb-2 text-sm text-black", GeneralSans_Meduim.className)}>
				{label} <sup className="text-danger">{reqValue}</sup>
			</Label>
			<DateInput
				label={placeholder}
				aria-label={label}
				// Provide a default value (this can be dynamic based on your needs)
				placeholderValue={new CalendarDate(1995, 11, 6)} // Default date, can be dynamic
				// Only pass a valid CalendarDate object or undefined to prevent errors
				value={getCalendarDate(value)} // Convert string to CalendarDate
				onChange={handleDateChange}
				size="lg"
				isDisabled={disabled}
				isRequired={required}
				aria-describedby={htmlFor}
				className="max-w-sm"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault(); // Prevent the default Enter key behavior
					}
				}}
			/>
			{isInvalid && <div className="text-red-500 text-xs">{errorMessage}</div>}
		</div>
	);
};

export default DateFormField;
