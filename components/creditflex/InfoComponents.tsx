"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { showToast } from "@/lib";

// InfoCard component for organized sections
export const InfoCard = ({
	title,
	icon,
	children,
	collapsible = false,
	defaultExpanded = true,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	collapsible?: boolean;
	defaultExpanded?: boolean;
}) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
			<div
				className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
					collapsible
						? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
						: ""
				}`}
				onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{icon}
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
							{title}
						</h3>
					</div>
					{collapsible && (
						<Button
							variant="light"
							isIconOnly
							size="sm"
							className="text-gray-500"
						>
							{isExpanded ? "−" : "+"}
						</Button>
					)}
				</div>
			</div>
			{isExpanded && children}
		</div>
	);
};

// InfoField component for consistent field display
export const InfoField = ({
	label,
	value,
	copyable = false,
	endComponent,
}: {
	label: string;
	value: string | number | null | undefined;
	copyable?: boolean;
	endComponent?: React.ReactNode;
}) => {
	const handleCopy = () => {
		if (value) {
			navigator.clipboard.writeText(String(value));
			showToast({
				message: "Copied to clipboard!",
				type: "success",
			});
		}
	};

	return (
		<div className="space-y-1">
			<div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
			<div className="flex items-center justify-between">
				<div className="font-medium text-gray-900 dark:text-white">
					{value || "N/A"}
				</div>
				{copyable && value && (
					<Button
						variant="light"
						size="sm"
						onPress={handleCopy}
						className="text-blue-600 hover:text-blue-800"
					>
						Copy
					</Button>
				)}
				{endComponent}
			</div>
		</div>
	);
};

// Status badge component
export const StatusBadge = ({ status }: { status: string }) => {
	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case "active":
			case "approved":
			case "verified":
			case "disbursed":
			case "completed":
				return "success";
			case "pending":
			case "processing":
			case "under_review":
				return "warning";
			case "inactive":
			case "rejected":
			case "suspended":
			case "failed":
			case "cancelled":
				return "danger";
			case "draft":
			case "created":
				return "secondary";
			default:
				return "default";
		}
	};

	return (
		<div
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
				getStatusColor(status) === "success"
					? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					: getStatusColor(status) === "warning"
					? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
					: getStatusColor(status) === "danger"
					? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
					: getStatusColor(status) === "secondary"
					? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
					: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
			}`}
		>
			{status || "Unknown"}
		</div>
	);
};

// Metric Card component for displaying key metrics
export const MetricCard = ({
	title,
	value,
	icon,
	color = "blue",
	subtitle,
	trend,
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	color?: "blue" | "green" | "orange" | "purple" | "red" | "gray";
	subtitle?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
}) => {
	const colorClasses = {
		blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
		green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
		orange:
			"bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
		purple:
			"bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
		red: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
		gray: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400",
	};

	return (
		<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
						{title}
					</h3>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">
						{value}
					</p>
					{subtitle && (
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							{subtitle}
						</p>
					)}
					{trend && (
						<div className="flex items-center mt-2">
							<span
								className={`text-xs font-medium ${
									trend.isPositive ? "text-green-600" : "text-red-600"
								}`}
							>
								{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
							</span>
						</div>
					)}
				</div>
				<div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
			</div>
		</div>
	);
};
