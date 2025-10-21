"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SingleServiceCenterView = () => {
	const params = useParams();
	const id = params?.id as string;

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Service Center Details</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					Viewing details for service center ID: {id}
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Service Center Information</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Service center details view is under development. This page will
						display detailed information, performance metrics, and management
						options for this service center.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default SingleServiceCenterView;
