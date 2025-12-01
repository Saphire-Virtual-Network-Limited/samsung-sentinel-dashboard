"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { FormField } from "@/components/reususables";
import { z } from "zod";
import { useState } from "react";
import {
	GeneralSans_Meduim,
	GeneralSans_SemiBold,
	cn,
	useField,
	showToast,
} from "@/lib";
import { forgotPassword } from "@/lib/api/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const EmailSchema = z.string().email("Please enter a valid email address");

export default function ForgotPasswordView() {
	const {
		value: email,
		error: emailError,
		handleChange: handleEmailChange,
	} = useField("", EmailSchema);

	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const handleSubmit = async () => {
		if (!email?.trim() || emailError) {
			showToast({
				type: "error",
				message: "Please enter a valid email address",
			});
			return;
		}

		setIsLoading(true);

		try {
			await forgotPassword({ email });
			setEmailSent(true);
			showToast({
				type: "success",
				message: "Password reset link has been sent to your email",
				duration: 5000,
			});
		} catch (error: any) {
			console.error("Forgot password failed", error);
			showToast({
				type: "error",
				message:
					error?.message || "Failed to send reset link. Please try again.",
				duration: 8000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className={cn("p-5")}>
			<CardHeader className="flex flex-col gap-2 text-center mb-5">
				<h1 className={cn("text-2xl", GeneralSans_SemiBold.className)}>
					{emailSent ? "Check your email" : "Forgot password?"}
				</h1>
				<p className="text-xs text-muted-foreground">
					{emailSent
						? "We've sent a password reset link to your email address"
						: "Enter your email address and we'll send you a link to reset your password"}
				</p>
			</CardHeader>
			<CardBody>
				{!emailSent ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
					>
						<div className="grid gap-6">
							<div className="grid gap-2">
								<FormField
									label="Enter your email"
									reqValue="*"
									htmlFor="email"
									type="email"
									id="email"
									variant="bordered"
									isInvalid={!!emailError}
									errorMessage={emailError || ""}
									size="sm"
									placeholder="your.email@example.com"
									onChange={handleEmailChange}
									required
								/>
							</div>
							<Button
								className={cn(
									"w-full p-6 mb-0 bg-primary text-white font-medium text-base",
									GeneralSans_Meduim.className
								)}
								size="md"
								radius="lg"
								isDisabled={!email?.trim() || !!emailError}
								isLoading={isLoading}
								onPress={handleSubmit}
								type="submit"
							>
								Send reset link
							</Button>
							<Link
								href="/auth/login"
								className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to login
							</Link>
						</div>
					</form>
				) : (
					<div className="grid gap-6">
						<div className="text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
								<svg
									className="w-6 h-6 text-success"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<p className="text-sm text-muted-foreground">
								If an account exists for <strong>{email}</strong>, you will
								receive a password reset link shortly.
							</p>
							<p className="text-xs text-muted-foreground">
								Didn&apos;t receive the email? Check your spam folder or try
								again.
							</p>
						</div>
						<div className="grid gap-3">
							<Button
								className={cn(
									"w-full p-6 mb-0 bg-primary text-white font-medium text-base",
									GeneralSans_Meduim.className
								)}
								size="md"
								radius="lg"
								onPress={() => setEmailSent(false)}
							>
								Try another email
							</Button>
							<Link
								href="/auth/login"
								className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to login
							</Link>
						</div>
					</div>
				)}
			</CardBody>
		</Card>
	);
}
