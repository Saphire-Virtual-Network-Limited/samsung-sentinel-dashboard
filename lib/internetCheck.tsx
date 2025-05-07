"use client";
import React, { useEffect, useCallback } from "react";
import { showToast } from "./showNotification";

// Typing for the position
type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";

interface InternetCheckProps {
	position?: ToastPosition;
	onlineMessage?: string;
	offlineMessage?: string;
}

const InternetStatus: React.FC<InternetCheckProps> = ({ position = "bottom-center", onlineMessage, offlineMessage }) => {
	const handleToast = useCallback(
		(type: "success" | "error", customMessage?: string, duration?: number) => {
			// Default messages when no custom message is provided
			const defaultMessage = type === "success" ? "Internet Restored 🚀" : "No/Bad Internet Connection 😭";

			// Use customMessage if provided, else use defaultMessage
			const message = customMessage || defaultMessage;

			// Show the toast with the correct type, message, position, and duration
			showToast({ type, message, position, duration });
		},
		[position]
	);

	// Internet is back online (with a duration of 3000ms)
	const InternetRestored = useCallback(() => handleToast("success", onlineMessage, 3000), [handleToast, onlineMessage]);
	// Internet is offline or bad
	const NoInternetConnection = useCallback(() => handleToast("error", offlineMessage, 5000), [handleToast, offlineMessage]);

	useEffect(() => {
		// Handle online and offline events
		const handleOnlineEvent = () => InternetRestored();
		const handleOfflineEvent = () => NoInternetConnection();

		// Add event listeners for online and offline events
		window.addEventListener("online", handleOnlineEvent);
		window.addEventListener("offline", handleOfflineEvent);

		// Cleanup event listeners when the component is unmounted
		return () => {
			window.removeEventListener("online", handleOnlineEvent);
			window.removeEventListener("offline", handleOfflineEvent);
		};
	}, [InternetRestored, NoInternetConnection]);

	// No UI rendering required, just handling internet events
	return null; // The component doesn't need to render anything to the DOM
};

export default InternetStatus;
