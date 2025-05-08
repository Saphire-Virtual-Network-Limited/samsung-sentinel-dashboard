"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Wifi, WifiOff, X, Cloud, CloudOff, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NoInternetScreen() {
	const [isOnline, setIsOnline] = useState(true);
	const [isRetrying, setIsRetrying] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);

	useEffect(() => {
		// Check initial online status
		setIsOnline(navigator.onLine);

		// Add event listeners for online/offline status
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	const handleRetry = () => {
		setIsRetrying(true);

		// Simulate checking connection
		setTimeout(() => {
			setIsRetrying(false);
			// If we're actually online, this will update via the event listener
		}, 1500);
	};

	const handleDismiss = () => {
		setIsDismissed(true);
	};

	if (isOnline || isDismissed) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p>You are {isOnline ? "online" : "offline, but dismissed the notice"}! This is just a demo.</p>
			</div>
		);
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 text-slate-50">
				<Button
					variant="ghost"
					size="icon"
					onClick={handleDismiss}
					className="absolute right-4 top-4 text-slate-400 hover:bg-slate-800 hover:text-white">
					<X className="h-5 w-5" />
					<span className="sr-only">Dismiss</span>
				</Button>

				<div className="w-full max-w-md">
					{/* Decorative elements */}
					<div className="absolute inset-0 overflow-hidden pointer-events-none">
						<motion.div
							className="absolute top-10 left-10"
							animate={{
								y: [0, 10, 0],
								opacity: [0.2, 0.3, 0.2],
							}}
							transition={{
								repeat: Number.POSITIVE_INFINITY,
								duration: 5,
								ease: "easeInOut",
							}}>
							<Cloud className="h-16 w-16 text-indigo-500/20" />
						</motion.div>

						<motion.div
							className="absolute bottom-20 right-10"
							animate={{
								y: [0, -15, 0],
								opacity: [0.1, 0.2, 0.1],
							}}
							transition={{
								repeat: Number.POSITIVE_INFINITY,
								duration: 7,
								ease: "easeInOut",
								delay: 1,
							}}>
							<CloudOff className="h-20 w-20 text-indigo-400/10" />
						</motion.div>

						{Array.from({ length: 5 }).map((_, i) => (
							<motion.div
								key={i}
								className="absolute"
								initial={{
									x: Math.random() * window.innerWidth,
									y: Math.random() * window.innerHeight,
									opacity: 0,
								}}
								animate={{
									y: [null, Math.random() * -50],
									opacity: [0, 0.3, 0],
								}}
								transition={{
									repeat: Number.POSITIVE_INFINITY,
									duration: 3 + Math.random() * 5,
									delay: Math.random() * 5,
									ease: "easeInOut",
								}}>
								<WifiOff className={`h-${4 + Math.floor(Math.random() * 4)} w-${4 + Math.floor(Math.random() * 4)} text-indigo-300/10`} />
							</motion.div>
						))}
					</div>

					<div className="mb-8 flex justify-center">
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5 }}
							className="relative">
							{/* Main illustration */}
							<div className="relative h-64 w-64">
								{/* Outer circle pulse */}
								<motion.div
									className="absolute inset-0 rounded-full bg-indigo-500/5"
									animate={{
										scale: [1, 1.1, 1],
										opacity: [0.5, 0.2, 0.5],
									}}
									transition={{
										repeat: Number.POSITIVE_INFINITY,
										duration: 3,
										ease: "easeInOut",
									}}
								/>

								{/* Middle circle */}
								<motion.div
									className="absolute inset-4 rounded-full bg-indigo-500/10"
									animate={{
										scale: [1, 1.05, 1],
										opacity: [0.7, 0.4, 0.7],
									}}
									transition={{
										repeat: Number.POSITIVE_INFINITY,
										duration: 2.5,
										ease: "easeInOut",
										delay: 0.2,
									}}
								/>

								{/* Inner circle */}
								<motion.div
									className="absolute inset-10 rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-500/20"
									animate={{
										scale: [1, 1.03, 1],
										opacity: [0.9, 0.7, 0.9],
									}}
									transition={{
										repeat: Number.POSITIVE_INFINITY,
										duration: 2,
										ease: "easeInOut",
										delay: 0.4,
									}}
								/>

								{/* Central icon */}
								<motion.div
									className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
									initial={{ opacity: 0, scale: 0.5 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.5, duration: 0.5 }}>
									<div className="relative">
										<motion.div
											className="absolute -left-12 -top-12"
											animate={{
												rotate: [0, 10, 0, -10, 0],
												opacity: [1, 0.7, 1, 0.7, 1],
											}}
											transition={{
												repeat: Number.POSITIVE_INFINITY,
												duration: 5,
												ease: "easeInOut",
											}}>
											<WifiOff className="h-8 w-8 text-rose-400" />
										</motion.div>

										<motion.div
											className="absolute -right-12 -top-10"
											animate={{
												rotate: [0, -10, 0, 10, 0],
												opacity: [1, 0.8, 1, 0.8, 1],
											}}
											transition={{
												repeat: Number.POSITIVE_INFINITY,
												duration: 4,
												ease: "easeInOut",
												delay: 0.5,
											}}>
											<CloudOff className="h-7 w-7 text-indigo-400" />
										</motion.div>

										<motion.div
											className="absolute -bottom-12 -left-10"
											animate={{
												rotate: [0, 5, 0, -5, 0],
												opacity: [1, 0.8, 1, 0.8, 1],
											}}
											transition={{
												repeat: Number.POSITIVE_INFINITY,
												duration: 4.5,
												ease: "easeInOut",
												delay: 1,
											}}>
											<Zap
												className="h-7 w-7 text-amber-400"
												strokeWidth={1.5}
											/>
										</motion.div>

										{/* Main SVG */}
										<svg
											width="100"
											height="100"
											viewBox="0 0 100 100"
											fill="none"
											xmlns="http://www.w3.org/2000/svg">
											<motion.circle
												cx="50"
												cy="50"
												r="45"
												stroke="url(#paint0_linear)"
												strokeWidth="2"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ duration: 2, ease: "easeInOut" }}
											/>

											<motion.path
												d="M30 50 L45 65 L70 40"
												stroke="url(#paint1_linear)"
												strokeWidth="4"
												strokeLinecap="round"
												strokeLinejoin="round"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ delay: 1.5, duration: 1 }}
											/>

											<motion.path
												d="M50 20 L50 35"
												stroke="#A5B4FC"
												strokeWidth="3"
												strokeLinecap="round"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ delay: 2, duration: 0.5 }}
											/>

											<motion.path
												d="M50 65 L50 80"
												stroke="#A5B4FC"
												strokeWidth="3"
												strokeLinecap="round"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ delay: 2.2, duration: 0.5 }}
											/>

											<motion.path
												d="M20 50 L35 50"
												stroke="#A5B4FC"
												strokeWidth="3"
												strokeLinecap="round"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ delay: 2.4, duration: 0.5 }}
											/>

											<motion.path
												d="M65 50 L80 50"
												stroke="#A5B4FC"
												strokeWidth="3"
												strokeLinecap="round"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ delay: 2.6, duration: 0.5 }}
											/>

											<defs>
												<linearGradient
													id="paint0_linear"
													x1="20"
													y1="20"
													x2="80"
													y2="80"
													gradientUnits="userSpaceOnUse">
													<stop stopColor="#8B5CF6" />
													<stop
														offset="1"
														stopColor="#EC4899"
													/>
												</linearGradient>
												<linearGradient
													id="paint1_linear"
													x1="30"
													y1="50"
													x2="70"
													y2="50"
													gradientUnits="userSpaceOnUse">
													<stop stopColor="#8B5CF6" />
													<stop
														offset="1"
														stopColor="#EC4899"
													/>
												</linearGradient>
											</defs>
										</svg>
									</div>
								</motion.div>
							</div>
						</motion.div>
					</div>

					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.5 }}
						className="text-center">
						<h1 className="mb-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent">No Internet Connection</h1>
						<p className="mb-6 text-indigo-200/80">We can&apos;t reach the internet right now. Check your connection and try again.</p>

						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button
								onClick={handleRetry}
								className="group relative overflow-hidden bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600"
								disabled={isRetrying}>
								<span className="relative z-10 flex items-center gap-2">
									{isRetrying ? (
										<>
											<RefreshCw className="h-4 w-4 animate-spin" />
											<span>Checking connection...</span>
										</>
									) : (
										<>
											<Wifi className="h-4 w-4" />
											<span>Try Again</span>
										</>
									)}
								</span>
								<motion.span
									className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500 to-violet-500"
									initial={{ x: "-100%" }}
									animate={isRetrying ? { x: "0%" } : { x: "-100%" }}
									transition={{ duration: 0.5 }}
								/>
							</Button>

							<Button
								variant="outline"
								onClick={handleDismiss}
								className="border-indigo-500/30 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20">
								<span className="flex items-center gap-2">
									<X className="h-4 w-4" />
									<span>Dismiss</span>
								</span>
							</Button>
						</div>

						<p className="mt-8 text-xs text-indigo-300/50">You can still access any offline-enabled content</p>
					</motion.div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
