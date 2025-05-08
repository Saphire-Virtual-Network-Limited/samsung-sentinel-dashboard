"use client";
import React from "react";
import { cn, GeneralSans_Meduim } from "@/lib";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, Selection } from "@heroui/react";

interface SelectFieldProps {
	label?: string;
	htmlFor: string;
	id: string;
	isInvalid?: boolean;
	errorMessage?: string;
	placeholder: string;
	reqValue?: string;
	onChange: (value: string | string[]) => void;
	required?: boolean;
	selectionMode?: "single" | "multiple";
	options: { label: string; value: string }[];
	size?: "sm" | "md" | "lg";
}

const SelectField: React.FC<SelectFieldProps> = ({ label, htmlFor, id, isInvalid, errorMessage, placeholder, reqValue, onChange, required, options, selectionMode = "single", size = "lg" }) => {
	const handleChange = (keys: Selection) => {
		const value = selectionMode === "multiple" ? Array.from(keys as Set<string>) : Array.from(keys as Set<string>)[0] || "";
		onChange(value);
	};

	return (
		<div className="flex flex-col space-y-1.5">
			<Label
				htmlFor={htmlFor}
				className={cn("mb-2 text-sm text-black", GeneralSans_Meduim.className)}>
				{label} <sup className="text-danger">{reqValue}</sup>
			</Label>
			<Select
				selectionMode={selectionMode}
				id={id}
				aria-label={label}
				aria-invalid={isInvalid ? "true" : "false"}
				aria-describedby={isInvalid ? `${id}-error` : undefined}
				required={required}
				placeholder={placeholder}
				onSelectionChange={handleChange}
				radius="md"
				size={size}
				variant="bordered"
				classNames={{
					base: "border-primary",
					trigger: ["data-[focus=true]:border-primary", "active:border-primary"],
					value: "truncate whitespace-inherit",
					innerWrapper: "truncate whitespace-inherit",
				}}>
				{options.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						className="bg-transparent">
						{option.label}
					</SelectItem>
				))}
			</Select>
			{isInvalid && <div className="text-red-500 text-xs">{errorMessage}</div>}
		</div>
	);
};

export default SelectField;
