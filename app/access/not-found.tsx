"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FiAlertTriangle } from "react-icons/fi";

export default function NotFound() {
	const router = useRouter();

	const handleBack = () => {
		try {
			router.back();
		} catch {
			router.push("/");
		}
	};

	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
			<div className="space-y-6">
				<FiAlertTriangle className="mx-auto h-16 w-16 text-destructive" />

				<div className="space-y-2">
					<h1 className="text-4xl font-bold tracking-tighter text-foreground">Page Not Found</h1>

					<p className="text-lg text-muted-foreground m-auto mt-3">We can&apos;t find this page.</p>
				</div>

				<Button
					onPress={handleBack}
					radius="lg"
					size="lg"
					color="primary"
					className="inline-flex items-center justify-center">
					Go Back
				</Button>
			</div>
		</div>
	);
}
