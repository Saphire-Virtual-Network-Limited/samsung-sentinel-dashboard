"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SamsungSentinelUploadDetailsView = () => {
	const params = useParams();
	const id = params?.id as string;

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Upload Details</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					Viewing upload ID: {id}
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Upload Information</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Upload details view is under development. This page will display
						detailed information about the upload, processing status, and
						results.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default SamsungSentinelUploadDetailsView;
