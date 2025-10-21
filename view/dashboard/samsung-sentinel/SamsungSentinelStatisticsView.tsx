"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SamsungSentinelStatisticsView = () => {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Samsung Sentinel Statistics</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					View statistics and analytics
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Statistics Dashboard</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Statistics view is under development. This page will display
						comprehensive analytics and metrics for Samsung Sentinel operations.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default SamsungSentinelStatisticsView;
