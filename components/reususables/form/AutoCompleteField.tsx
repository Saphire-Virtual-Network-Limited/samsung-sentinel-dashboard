"use client";
import React from "react";
import { cn, GeneralSans_Meduim } from "@/lib";
import { Label } from "@/components/ui/label";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
interface AutoCompleteFieldProps {
	label?: string;
	htmlFor: string;
	id: string;
	keyId?: string;
	isInvalid?: boolean;
	errorMessage?: string;
	placeholder: string;
	reqValue?: string;
	value?: string;
	onChange: (value: string) => void;
	required?: boolean;
	options: { label: string; value: string }[];
	isDisabled?: boolean;
}
const AutoCompleteField: React.FC<AutoCompleteFieldProps> = ({ label, htmlFor, id, keyId, isInvalid, errorMessage, placeholder, reqValue, value, onChange, required, options, isDisabled }) => {
	return (
		<div className="flex flex-col space-y-1.5">
			<Label
				htmlFor={htmlFor}
				className={cn("mb-2 text-sm text-black", GeneralSans_Meduim.className)}>
				{label} <sup className="text-danger">{reqValue}</sup>
			</Label>
			<Autocomplete
				id={id}
				aria-label={label}
				aria-invalid={isInvalid ? "true" : "false"}
				aria-describedby={isInvalid ? `${id}-error` : undefined}
				required={required}
				placeholder={placeholder}
				onSelectionChange={(selectedValue) => onChange(selectedValue as string)}
				selectedKey={value}
				radius="md"
				size="md"
				variant="bordered"
				isDisabled={isDisabled}
				classNames={{
					base: "rounded-lg bg-white border-primary",
				}}>
				{options.map((option) => (
					<AutocompleteItem
						key={keyId || option.value}
						value={option.value}
						className="bg-white px-4 shadow-sm ">
						{option.label}
					</AutocompleteItem>
				))}
			</Autocomplete>
			{isInvalid && <div className="text-red-500 text-xs">{errorMessage}</div>}
		</div>
	);
};
export default AutoCompleteField;
