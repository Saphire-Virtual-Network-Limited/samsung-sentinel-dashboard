"use client";

import { AccessLayoutView } from "@/view";
import React from "react";

const SamsungPartnersLayout = ({ children }: { children: React.ReactNode }) => {
	const sidebarItems = [
		{
			key: "repair-claims",
			label: "Repair Claims",
			icon: "🔧",
			href: "/access/samsung-partners/repair-claims/all",
			children: [
				{
					key: "all-repair-claims",
					label: "All",
					href: "/access/samsung-partners/repair-claims/all",
				},
				{
					key: "pending-repair-claims",
					label: "Pending",
					href: "/access/samsung-partners/repair-claims/pending",
				},
				{
					key: "approved-repair-claims",
					label: "Approved",
					href: "/access/samsung-partners/repair-claims/approved",
				},
				{
					key: "rejected-repair-claims",
					label: "Rejected",
					href: "/access/samsung-partners/repair-claims/rejected",
				},
			],
		},
		{
			key: "processed-claims",
			label: "Processed Claims",
			icon: "✅",
			href: "/access/samsung-partners/processed-claims/all",
			children: [
				{
					key: "all-processed-claims",
					label: "All",
					href: "/access/samsung-partners/processed-claims/all",
				},
				{
					key: "paid-processed-claims",
					label: "Paid",
					href: "/access/samsung-partners/processed-claims/paid",
				},
				{
					key: "unpaid-processed-claims",
					label: "Unpaid",
					href: "/access/samsung-partners/processed-claims/unpaid",
				},
			],
		},
	];

	return (
		<AccessLayoutView>
			{children}
		</AccessLayoutView>
	);
};

export default SamsungPartnersLayout;