"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardBody,
	CardHeader,
	Chip,
	Button,
	Skeleton,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Input,
	useDisclosure,
} from "@heroui/react";
import {
	ClipboardList,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	TrendingUp,
	Wrench,
	Package,
	ShoppingBag,
	Eye,
	ArrowRight,
	Search,
} from "lucide-react";
import { useServiceCenterDashboardStats } from "@/hooks/service-center";
import { showToast } from "@/lib";

const ServiceCenterDashboardView = () => {
	const router = useRouter();
	const { stats, isLoading, error } = useServiceCenterDashboardStats();

	// Search IMEI modal state
	const {
		isOpen: isSearchModalOpen,
		onOpen: onSearchModalOpen,
		onClose: onSearchModalClose,
	} = useDisclosure();
	const [searchImei, setSearchImei] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [searchResult, setSearchResult] = useState<any>(null);

	// Handle IMEI search
	const handleSearchImei = async () => {
		if (!searchImei.trim()) {
			showToast({ message: "Please enter an IMEI number", type: "error" });
			return;
		}

		setIsSearching(true);
		try {
			// Mock API call - replace with actual API
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Mock search results based on IMEI
			const isUsedImei =
				searchImei.includes("111") || searchImei.includes("222");

			if (!isUsedImei) {
				// Unused IMEI - show unverified status
				setSearchResult({
					type: "unused",
					imei: searchImei,
					status: "unverified",
					claimsCount: 0,
				});
			} else {
				// Used IMEI - show claims table
				setSearchResult({
					type: "used",
					imei: searchImei,
					claims: [
						{
							id: "claim_001",
							customerName: "John Doe",
							claimStatus: "approved",
							dateCreated: "2024-10-15T10:30:00Z",
							issueDescription: "Screen replacement",
						},
						{
							id: "claim_002",
							customerName: "Jane Smith",
							claimStatus: "pending",
							dateCreated: "2024-10-20T14:22:00Z",
							issueDescription: "Battery issue",
						},
					],
				});
			}
		} catch (error) {
			showToast({ message: "Failed to search IMEI", type: "error" });
		} finally {
			setIsSearching(false);
		}
	};

	// Reset search when modal closes
	const handleSearchModalClose = () => {
		setSearchResult(null);
		setSearchImei("");
		onSearchModalClose();
	};

	const statCards = [
		{
			title: "Pending Claims",
			value: stats?.pendingClaims || 0,
			icon: <Clock className="w-8 h-8" />,
			color: "warning",
			bgGradient: "from-warning-50 to-warning-100",
			iconBg: "bg-warning-100",
			iconColor: "text-warning-600",
			link: "/access/service-center/pending-claims",
			description: "Awaiting approval",
		},
		{
			title: "In Progress",
			value: stats?.inProgressClaims || 0,
			icon: <Wrench className="w-8 h-8" />,
			color: "primary",
			bgGradient: "from-primary-50 to-primary-100",
			iconBg: "bg-primary-100",
			iconColor: "text-primary-600",
			link: "/access/service-center/claims?status=in-progress",
			description: "Currently being repaired",
		},
		{
			title: "Approved Claims",
			value: stats?.approvedClaims || 0,
			icon: <CheckCircle className="w-8 h-8" />,
			color: "success",
			bgGradient: "from-success-50 to-success-100",
			iconBg: "bg-success-100",
			iconColor: "text-success-600",
			link: "/access/service-center/approved-claims",
			description: "Ready to proceed",
		},
		{
			title: "Completed",
			value: stats?.completedClaims || 0,
			icon: <CheckCircle className="w-8 h-8" />,
			color: "success",
			bgGradient: "from-green-50 to-green-100",
			iconBg: "bg-green-100",
			iconColor: "text-green-600",
			link: "/access/service-center/completed-repairs",
			description: "Repairs finished",
		},
		{
			title: "Waiting Parts",
			value: stats?.waitingParts || 0,
			icon: <Package className="w-8 h-8" />,
			color: "warning",
			bgGradient: "from-orange-50 to-orange-100",
			iconBg: "bg-orange-100",
			iconColor: "text-orange-600",
			link: "/access/service-center/claims?status=waiting-parts",
			description: "Parts on order",
		},
		{
			title: "Ready for Pickup",
			value: stats?.readyForPickup || 0,
			icon: <ShoppingBag className="w-8 h-8" />,
			color: "secondary",
			bgGradient: "from-purple-50 to-purple-100",
			iconBg: "bg-purple-100",
			iconColor: "text-purple-600",
			link: "/access/service-center/claims?status=ready-pickup",
			description: "Customer can collect",
		},
		{
			title: "Rejected",
			value: stats?.rejectedClaims || 0,
			icon: <XCircle className="w-8 h-8" />,
			color: "danger",
			bgGradient: "from-danger-50 to-danger-100",
			iconBg: "bg-danger-100",
			iconColor: "text-danger-600",
			link: "/access/service-center/rejected-claims",
			description: "Not approved",
		},
		{
			title: "Total Claims",
			value: stats?.totalClaims || 0,
			icon: <ClipboardList className="w-8 h-8" />,
			color: "default",
			bgGradient: "from-default-50 to-default-100",
			iconBg: "bg-default-100",
			iconColor: "text-default-600",
			link: "/access/service-center/claims",
			description: "All time",
		},
	];

	if (error) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<AlertCircle className="w-16 h-16 mx-auto text-danger mb-4" />
					<p className="text-danger-600 font-medium">
						Failed to load dashboard statistics
					</p>
					<Button
						color="primary"
						className="mt-4"
						onPress={() => window.location.reload()}
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Service Center Dashboard
				</h1>
				<p className="text-gray-600">
					Monitor and manage all repair claims and service requests
				</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((card, index) => (
					<Card
						key={index}
						isPressable
						onPress={() => router.push(card.link)}
						className="group hover:shadow-xl transition-all duration-300 border border-default-200"
					>
						<CardBody className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-600 mb-2">
										{card.title}
									</p>
									{isLoading ? (
										<Skeleton className="h-10 w-24 rounded" />
									) : (
										<div className="flex items-baseline gap-2 mb-2">
											<h3 className="text-4xl font-bold text-gray-900">
												{card.value}
											</h3>
											{card.title === "Pending Claims" && card.value > 20 && (
												<Chip
													size="sm"
													color="warning"
													variant="flat"
													className="animate-pulse"
												>
													High
												</Chip>
											)}
										</div>
									)}
									<p className="text-xs text-gray-500">{card.description}</p>
								</div>
								<div
									className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform`}
								>
									{card.icon}
								</div>
							</div>

							{/* Progress bar for visual appeal */}
							{!isLoading && stats && (
								<div className="mt-4">
									<div className="h-1.5 bg-default-100 rounded-full overflow-hidden">
										<div
											className={`h-full bg-gradient-to-r ${card.bgGradient} transition-all duration-500`}
											style={{
												width: `${Math.min(
													(card.value / stats.totalClaims) * 100,
													100
												)}%`,
											}}
										/>
									</div>
								</div>
							)}
						</CardBody>
					</Card>
				))}
			</div>

			{/* Summary Cards Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Total Repair Cost */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-blue-600" />
							<h3 className="text-lg font-semibold">Total Repair Cost</h3>
						</div>
					</CardHeader>
					<CardBody className="p-6">
						{isLoading ? (
							<Skeleton className="h-12 w-32 rounded" />
						) : (
							<>
								<p className="text-3xl font-bold text-gray-900">
									₦{stats?.totalRepairCost.toLocaleString()}
								</p>
								<p className="text-sm text-gray-500 mt-2">
									Cumulative repair value
								</p>
							</>
						)}
					</CardBody>
				</Card>

				{/* Average Repair Time */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
						<div className="flex items-center gap-2">
							<Clock className="w-5 h-5 text-purple-600" />
							<h3 className="text-lg font-semibold">Avg. Repair Time</h3>
						</div>
					</CardHeader>
					<CardBody className="p-6">
						{isLoading ? (
							<Skeleton className="h-12 w-32 rounded" />
						) : (
							<>
								<p className="text-3xl font-bold text-gray-900">
									{stats?.averageRepairTime} days
								</p>
								<p className="text-sm text-gray-500 mt-2">
									Average turnaround time
								</p>
							</>
						)}
					</CardBody>
				</Card>

				{/* Quick Actions */}
				<Card className="border border-default-200 shadow-md">
					<CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
						<div className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-green-600" />
							<h3 className="text-lg font-semibold">Quick Actions</h3>
						</div>
					</CardHeader>
					<CardBody className="p-4">
						<div className="space-y-2">
							<Button
								fullWidth
								color="primary"
								variant="flat"
								onPress={() =>
									router.push("/access/service-center/create-claim")
								}
								startContent={<ClipboardList className="w-4 h-4" />}
							>
								Create New Claim
							</Button>
							<Button
								fullWidth
								color="warning"
								variant="flat"
								onPress={() =>
									router.push("/access/service-center/pending-claims")
								}
								startContent={<Clock className="w-4 h-4" />}
							>
								View Pending
							</Button>
							<Button
								fullWidth
								color="secondary"
								variant="flat"
								onPress={onSearchModalOpen}
								startContent={<Search className="w-4 h-4" />}
							>
								Search IMEI
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Recent Claims */}
			<Card className="border border-default-200 shadow-md">
				<CardHeader className="bg-gradient-to-r from-default-50 to-default-100 border-b">
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center gap-2">
							<ClipboardList className="w-5 h-5 text-primary" />
							<h3 className="text-lg font-semibold">Recent Claims</h3>
						</div>
						<Button
							size="sm"
							variant="light"
							color="primary"
							onPress={() => router.push("/access/service-center/claims")}
							endContent={<ArrowRight className="w-4 h-4" />}
						>
							View All
						</Button>
					</div>
				</CardHeader>
				<CardBody className="p-0">
					{isLoading ? (
						<div className="p-6 space-y-4">
							{[1, 2, 3].map((i) => (
								<div key={i} className="flex items-center gap-4">
									<Skeleton className="h-12 w-12 rounded" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-3/4 rounded" />
										<Skeleton className="h-3 w-1/2 rounded" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="divide-y divide-default-200">
							{stats?.recentClaims.map((claim) => (
								<div
									key={claim.id}
									className="p-4 hover:bg-default-50 cursor-pointer transition-colors flex items-center justify-between group"
									onClick={() =>
										router.push(`/access/service-center/claims/${claim.id}`)
									}
								>
									<div className="flex items-center gap-4 flex-1">
										<div className="p-3 bg-primary-50 rounded-lg">
											<ClipboardList className="w-5 h-5 text-primary-600" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<p className="font-semibold text-gray-900">
													{claim.id}
												</p>
												<Chip
													size="sm"
													color={
														claim.status === "pending"
															? "warning"
															: claim.status === "completed"
															? "success"
															: claim.status === "in-progress"
															? "primary"
															: "default"
													}
													variant="flat"
												>
													{claim.status
														.split("-")
														.map(
															(word) =>
																word.charAt(0).toUpperCase() + word.slice(1)
														)
														.join(" ")}
												</Chip>
											</div>
											<p className="text-sm text-gray-600">
												{claim.customerName} • {claim.deviceModel} • IMEI:{" "}
												{claim.imei}
											</p>
											<p className="text-xs text-gray-400 mt-1">
												Submitted:{" "}
												{new Date(claim.dateSubmitted).toLocaleDateString()}
											</p>
										</div>
									</div>
									<Button
										size="sm"
										isIconOnly
										variant="light"
										className="opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<Eye className="w-4 h-4" />
									</Button>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* Claims by Status Distribution */}
			<Card className="border border-default-200 shadow-md">
				<CardHeader className="bg-gradient-to-r from-default-50 to-default-100 border-b">
					<div className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-primary" />
						<h3 className="text-lg font-semibold">Claims Distribution</h3>
					</div>
				</CardHeader>
				<CardBody className="p-6">
					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="h-8 w-full rounded" />
							))}
						</div>
					) : (
						<div className="space-y-4">
							{stats?.claimsByStatus.map((item, index) => (
								<div key={index}>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-gray-700">
											{item.status}
										</span>
										<span className="text-sm font-semibold text-gray-900">
											{item.count} ({item.percentage.toFixed(1)}%)
										</span>
									</div>
									<div className="h-2 bg-default-100 rounded-full overflow-hidden">
										<div
											className={`h-full transition-all duration-500 ${
												index % 7 === 0
													? "bg-gradient-to-r from-warning-400 to-warning-600"
													: index % 7 === 1
													? "bg-gradient-to-r from-success-400 to-success-600"
													: index % 7 === 2
													? "bg-gradient-to-r from-primary-400 to-primary-600"
													: index % 7 === 3
													? "bg-gradient-to-r from-green-400 to-green-600"
													: index % 7 === 4
													? "bg-gradient-to-r from-danger-400 to-danger-600"
													: index % 7 === 5
													? "bg-gradient-to-r from-orange-400 to-orange-600"
													: "bg-gradient-to-r from-purple-400 to-purple-600"
											}`}
											style={{ width: `${item.percentage}%` }}
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* Search IMEI Modal */}
			<Modal
				isOpen={isSearchModalOpen}
				onClose={handleSearchModalClose}
				size="3xl"
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Search IMEI</ModalHeader>
							<ModalBody>
								<div className="space-y-4">
									<div className="flex gap-2">
										<Input
											label="IMEI Number"
											placeholder="Enter IMEI to search"
											value={searchImei}
											onValueChange={setSearchImei}
											className="flex-1"
											maxLength={15}
										/>
										<Button
											color="primary"
											onPress={handleSearchImei}
											isLoading={isSearching}
											isDisabled={!searchImei.trim()}
										>
											Search
										</Button>
									</div>

									{/* Search Results */}
									{searchResult && (
										<div className="mt-6">
											{searchResult.type === "unused" ? (
												/* Unused IMEI Result */
												<div className="space-y-4">
													<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
														<h3 className="font-semibold text-blue-900 mb-2">
															IMEI: {searchResult.imei}
														</h3>
														<div className="grid grid-cols-2 gap-4 text-sm">
															<div>
																<span className="text-gray-600">Status:</span>{" "}
																<Chip color="default" size="sm">
																	{searchResult.status}
																</Chip>
															</div>
															<div>
																<span className="text-gray-600">Claims:</span>{" "}
																<span className="font-medium">
																	{searchResult.claimsCount}
																</span>
															</div>
														</div>
													</div>
												</div>
											) : (
												/* Used IMEI Result - Show Claims Table */
												<div className="space-y-4">
													<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
														<h3 className="font-semibold text-amber-900 mb-2">
															IMEI: {searchResult.imei} (In Use)
														</h3>
														<p className="text-sm text-amber-800">
															This IMEI has {searchResult.claims.length}{" "}
															associated claim(s):
														</p>
													</div>

													{/* Claims Table */}
													<div className="overflow-x-auto">
														<table className="w-full border border-gray-200 rounded-lg">
															<thead className="bg-gray-50">
																<tr>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Customer Name
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Issue Description
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Status
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Date Created
																	</th>
																	<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																		Actions
																	</th>
																</tr>
															</thead>
															<tbody className="bg-white divide-y divide-gray-200">
																{searchResult.claims.map((claim: any) => (
																	<tr
																		key={claim.id}
																		className="hover:bg-gray-50"
																	>
																		<td className="px-4 py-3 text-sm font-medium text-gray-900">
																			{claim.customerName}
																		</td>
																		<td className="px-4 py-3 text-sm text-gray-600">
																			{claim.issueDescription}
																		</td>
																		<td className="px-4 py-3 text-sm">
																			<Chip
																				color={
																					claim.claimStatus === "approved"
																						? "success"
																						: claim.claimStatus === "pending"
																						? "warning"
																						: "danger"
																				}
																				size="sm"
																				className="capitalize"
																			>
																				{claim.claimStatus}
																			</Chip>
																		</td>
																		<td className="px-4 py-3 text-sm text-gray-600">
																			{new Date(
																				claim.dateCreated
																			).toLocaleDateString()}
																		</td>
																		<td className="px-4 py-3 text-sm">
																			<Button
																				size="sm"
																				color="primary"
																				variant="flat"
																				startContent={<Eye size={14} />}
																				onPress={() => {
																					router.push(
																						`/access/service-center/claims/${claim.id}`
																					);
																					handleSearchModalClose();
																				}}
																			>
																				View Details
																			</Button>
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={handleSearchModalClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ServiceCenterDashboardView;
