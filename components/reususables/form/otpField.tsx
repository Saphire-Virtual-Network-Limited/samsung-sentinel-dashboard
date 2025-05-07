"use client";
import React, { ChangeEvent, ReactElement } from "react";
import { cn, GeneralSans_Meduim } from "@/lib";
import { Label } from "@/components/ui/label";
import { InputOtp } from "@heroui/react";

interface OtpFieldProps {
	label: string;
	htmlFor: string;
	id: string;
	variants?: "flat" | "bordered" | "underlined" | "faded";
	isInvalid?: boolean;
	errorMessage?: string;
	size: string;
	startcnt?: string | ReactElement;
	placeholder: string;
	reqValue?: string;
	onChange?: (value: string) => void;
	required?: boolean;
	minLen?: number;
	maxLen?: number;
	value?: any;
	disabled?: boolean;
	length?: number;
}

const OtpField: React.FC<OtpFieldProps> = ({ label, htmlFor, id, isInvalid, errorMessage, placeholder, length, onChange, variants, reqValue, required, minLen, maxLen, value, disabled }) => {
	return (
		<div className="flex flex-col justify-center items-center w-full space-y-1.5">
			<Label
				htmlFor={htmlFor}
				className={cn("mb-2 text-sm text-black", GeneralSans_Meduim.className)}>
				{label} <sup className="text-danger">{reqValue}</sup>
			</Label>
			<InputOtp
				id={id}
				variant={variants || "bordered"}
				aria-label={label}
				size="lg"
				radius="md"
				length={length || 4}
				required={required}
				placeholder={placeholder}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
				minLength={minLen}
				maxLength={maxLen}
				disabled={disabled}
				value={value}
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

export default OtpField;
