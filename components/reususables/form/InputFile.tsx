"use client";
import React, { ChangeEvent, ReactElement } from "react";
import { cn } from "@/lib";
import { Label } from "@/components/ui/label";
import { Input } from "@heroui/react";

interface InputFileProps {
	label: string;
	htmlFor: string;
	id: string;
	isInvalid: boolean;
	errorMessage: string;
	startcnt?: string | ReactElement;
	reqValue?: string;
	onChange: (file: File | null) => void;
	required?: boolean;
}

const InputFile: React.FC<InputFileProps> = ({ label, htmlFor, id, isInvalid, errorMessage, startcnt, onChange, reqValue, required }) => {
	return (
		<div className="flex flex-col space-y-1.5">
			<Label
				htmlFor={htmlFor}
				className={cn("mb-2 text-sm text-black")}>
				{label} <sup className="text-danger">{reqValue}</sup>
			</Label>
			<Input
				type="file"
				aria-label={label}
				id={id}
				variant="bordered"
				classNames={{
					inputWrapper: ["data-[hover=true]:border-primary group-data-[focus=true]:border-primary"],
				}}
				size="lg"
				radius="md"
				required={required}
				startContent={startcnt}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files ? e.target.files[0] : null)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault(); // Prevent the default Enter key behavior
					}
				}}
			/>
			{isInvalid && <div className="text-red-500">{errorMessage}</div>}
		</div>
	);
};

export default InputFile;
