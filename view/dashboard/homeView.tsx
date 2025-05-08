"use client";

import { DashCard } from "@/components/reususables/custom-ui";
import { getAllLoans } from "@/lib/api";
import React, { useEffect, useState } from "react";

const HomeView = () => {
	const [loans, setLoans] = useState({ data: {} });

	useEffect(() => {
		const fetchLoans = async () => {
			try {
				const response = await getAllLoans();
				setLoans(response);
			} catch (error) {
				console.error("Error fetching loans:", error);
			}
		};
		fetchLoans();
	}, []);

	const loanMetrics = loans?.data || {};

	const generateHref = (key: string) => {
		if (key.includes("Engaged")) return "/loans/engaged";
		if (key.includes("Ongoing")) return "/loans/ongoing";
		if (key.includes("Completed")) return "/loans/completed";
		return "/";
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-5">
			{Object.entries(loanMetrics).map(([key, metric]: any) => {
				const hasNaira = key.toLowerCase().includes("amount");
				const rawValue = metric.value || 0;
				const formattedValue = hasNaira ? rawValue.toLocaleString() : rawValue;

				return (
					<DashCard
						key={key}
						title={key.replace(/Total /, "")}
						value={formattedValue}
						href={generateHref(key)}
						hasNaira={hasNaira}
						changeValue={metric.percentageChange || 0}
						change={metric.trend || "stable"}
						changeString="from previous month"
					/>
				);
			})}
		</div>
	);
};

export default HomeView;
