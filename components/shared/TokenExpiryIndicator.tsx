"use client";

import { useEffect, useState } from "react";
import { getTokenRemainingTime, isTokenExpired } from "@/lib/api/shared";
import { Clock } from "lucide-react";

/**
 * TokenExpiryIndicator Component
 *
 * Displays a visual indicator showing how much time is left before the access token expires.
 * Shows a warning when the token is about to expire.
 */
export function TokenExpiryIndicator() {
	const [remainingTime, setRemainingTime] = useState<number>(0);
	const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);

	useEffect(() => {
		// Update remaining time every second
		const interval = setInterval(() => {
			const time = getTokenRemainingTime();
			setRemainingTime(time);

			// Show warning if less than 5 minutes remaining
			setIsExpiringSoon(isTokenExpired(300) && time > 0);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Don't show if token is already expired or no token
	if (remainingTime <= 0) {
		return null;
	}

	// Format time as HH:MM:SS
	const formatTime = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${secs}s`;
		} else {
			return `${secs}s`;
		}
	};

	return (
		<div
			className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
				isExpiringSoon
					? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
					: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
			}`}
			title="Session will auto-refresh before expiry"
		>
			<Clock className="h-4 w-4" />
			<span className="font-medium">
				{isExpiringSoon ? "Expiring soon: " : "Session: "}
				{formatTime(remainingTime)}
			</span>
		</div>
	);
}
