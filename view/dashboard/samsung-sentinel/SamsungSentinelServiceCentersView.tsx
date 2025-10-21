"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SamsungSentinelServiceCentersView = () => {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Service Centers</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					Manage and monitor service centers
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Service Centers Dashboard</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Service centers view is under development. This page will display
						service center listings, performance metrics, and management
						features.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default SamsungSentinelServiceCentersView;
