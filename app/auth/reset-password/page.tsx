import React from "react";
import ResetPasswordView from "@/view/auth/ResetPasswordView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Reset Password - Samsung Sentinel",
	description: "Create a new password",
};

export default function ResetPasswordPage() {
	return <ResetPasswordView />;
}
