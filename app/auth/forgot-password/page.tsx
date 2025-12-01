import React from "react";
import ForgotPasswordView from "@/view/auth/ForgotPasswordView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Forgot Password - Samsung Sentinel",
	description: "Reset your password",
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordView />;
}
