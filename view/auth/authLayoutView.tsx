"use client";
import React from "react";
import { cn, Image } from "@heroui/react";
import Link from "next/link";
import { GeneralSans_SemiBold } from "@/lib/font";
export function AuthLayoutView({ children }: { children: React.ReactNode }) {
	const appName = process.env.NEXT_PUBLIC_APP_NAME;

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link
					href="/dashboard"
					className={cn("flex items-center gap-2 self-center font-bold text-xl", GeneralSans_SemiBold.className)}>
					<div className="flex items-center justify-center rounded-md">
						<Image
							isZoomed
							src="/images/SapphireCredit Approved Logo2.png"
							alt={appName}
							className="h-auto w-80"
						/>
					</div>
					{/* {appName} */}
				</Link>
				<div className={cn("flex flex-col gap-6")}>
					{children}
					{/*<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
						By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
					</div>*/}
				</div>
			</div>
			<footer className="fixed bottom-0 w-full z-50 border-t p-4 text-center">
				<div className="flex justify-between m-auto items-center gap-5 container">
					<p className="text-xs">
						© {appName} {new Date().getFullYear()}.
					</p>
					<p className="text-xs animate-pulse">
						Powered by:{" "}
						<Link
							href="https://sapphirecredits.com"
							target="_blank"
							className={cn("text-xs", GeneralSans_SemiBold.className)}>
							<b>SapphireCredit</b>
						</Link>
					</p>
				</div>
			</footer>
		</div>
	);
}
