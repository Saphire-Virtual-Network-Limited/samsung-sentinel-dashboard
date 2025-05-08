"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { GeneralSans_Meduim, GeneralSans_SemiBold, cn } from "@/lib";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashCardProps {
	title: string;
	value: string | number;
	href: string;
	hasNaira?: boolean;
	changeValue: number;
	changeString: string;
	change: "increase" | "decrease" | "stable";
}

const DashCard: React.FC<DashCardProps> = ({ title, value, href, hasNaira = false, changeValue, changeString, change }) => {
	const getTrendIcon = () => {
		switch (change) {
			case "increase":
				return <TrendingUp size={14} />;
			case "decrease":
				return <TrendingDown size={14} />;
			default:
				return <TrendingUp size={14} />;
		}
	};

	const getChangeStyles = () => {
		switch (change) {
			case "increase":
				return "bg-green-100 text-green-600 w-[20%]";
			case "decrease":
				return "bg-red-100 text-red-600 w-[20%]";
			default:
				return "bg-green-100 text-green-600 w-[20%]";
		}
	};

	const formatChange = () => {
		const prefix = change === "increase" ? "+" : "";
		return `${prefix}${changeValue}%`;
	};

	return (
		<Card
			as={Link}
			isPressable
			href={href}
			className="rounded-xl hover:shadow-md transition-all duration-300 p-4 cursor-pointer">
			<CardHeader className="flex items-start justify-between">
				<h1 className={cn("lg:text-lg text-sm text-gray-600", GeneralSans_Meduim.className)}>{title}</h1>
			</CardHeader>
			<CardBody className="space-y-4">
				<p className={cn("lg:text-3xl text-xl font-semibold text-gray-800", GeneralSans_SemiBold.className)}>{hasNaira ? `₦${value}` : value}</p>
				<div className="grid lg:flex items-center gap-2 text-sm text-gray-500">
					<span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getChangeStyles()}`}>
						{getTrendIcon()}
						{formatChange()}
					</span>
					<span className={cn("text-xs", GeneralSans_Meduim.className)}>{changeString}</span>
				</div>
			</CardBody>
		</Card>
	);
};

export default DashCard;
