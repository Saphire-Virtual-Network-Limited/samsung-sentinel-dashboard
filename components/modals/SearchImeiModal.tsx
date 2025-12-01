"use client";

import React, { useState } from "react";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
	Chip,
} from "@heroui/react";
import { Search, Eye, AlertTriangle } from "lucide-react";
import { searchImei as searchImeiApi } from "@/lib/api/imeis";
import { getAllClaims } from "@/lib/api/claims";
import { showToast } from "@/lib";
import { useRouter, usePathname } from "next/navigation";

interface SearchImeiButtonProps {
	/**
	 * Custom button text. Defaults to "Search IMEI"
	 */
	buttonText?: string;
	/**
	 * Button color. Defaults to "primary"
	 */
	buttonColor?:
		| "default"
		| "primary"
		| "secondary"
		| "success"
		| "warning"
		| "danger";
	/**
	 * Button variant. Defaults to "solid"
	 */
	buttonVariant?:
		| "solid"
		| "bordered"
		| "light"
		| "flat"
		| "faded"
		| "shadow"
		| "ghost";
	/**
	 * Button size. Defaults to "md"
	 */
	buttonSize?: "sm" | "md" | "lg";
	/**
	 * Show icon in button. Defaults to true
	 */
	showIcon?: boolean;
	/**
	 * Custom CSS classes for the button
	 */
	className?: string;
}

interface SearchResult {
	type: "not-found" | "unused" | "used";
	imei: string;
	status?: string;
	claimsCount?: number;
	supplier?: string;
	expiryDate?: string;
	product?: {
		id: string;
		name: string;
	};
	usedAt?: string;
	claims?: any[];
	uploadId?: string;
	upload?: {
		id: string;
		file_name: string;
		total_records: number;
		successful_records: number;
		failed_records: number;
		processing_status: string;
	};
}

export default function SearchImeiButton({
	buttonText = "Search IMEI",
	buttonColor = "primary",
	buttonVariant = "solid",
	buttonSize = "md",
	showIcon = true,
	className = "",
}: SearchImeiButtonProps) {
	const router = useRouter();
	const pathname = usePathname();
	const role = pathname.split("/")[2];

	const { isOpen, onOpen, onClose } = useDisclosure();
	const [searchImei, setSearchImei] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

	// Handle IMEI search
	const handleSearchImei = async () => {
		if (!searchImei.trim()) {
			showToast({ message: "Please enter an IMEI number", type: "error" });
			return;
		}

		setIsSearching(true);
		try {
			// Search for IMEI - API returns Imei object directly
			const imeiData = await searchImeiApi(searchImei);

			// Check if IMEI is used
			if (!imeiData.is_used) {
				// Unused IMEI
				setSearchResult({
					type: "unused",
					imei: imeiData.imei,
					status: "Available",
					claimsCount: 0,
					supplier: imeiData.supplier,
					expiryDate: imeiData.expiry_date,
					product: imeiData.product,
					uploadId: imeiData.upload_id,
					upload: imeiData.upload,
				});
			} else {
				// Used IMEI - fetch claims
				const claimsResponse = await getAllClaims({
					imei: searchImei,
					page: 1,
					limit: 100,
				});

				setSearchResult({
					type: "used",
					imei: imeiData.imei,
					claims: claimsResponse.data || [],
					supplier: imeiData.supplier,
					expiryDate: imeiData.expiry_date,
					usedAt: imeiData.used_at,
					product: imeiData.product,
					uploadId: imeiData.upload_id,
					upload: imeiData.upload,
				});
			}
		} catch (error: any) {
			if (error?.response?.status === 404) {
				showToast({ message: "IMEI not found in database", type: "error" });
				setSearchResult({
					type: "not-found",
					imei: searchImei,
				});
			} else {
				showToast({ message: "Failed to search IMEI", type: "error" });
			}
		} finally {
			setIsSearching(false);
		}
	};

	// Reset search when modal closes
	const handleModalClose = () => {
		setSearchResult(null);
		setSearchImei("");
		onClose();
	};

	return (
		<>
			<Button
				color={buttonColor}
				variant={buttonVariant}
				size={buttonSize}
				startContent={showIcon ? <Search size={16} /> : undefined}
				onPress={onOpen}
				className={className}
			>
				{buttonText}
			</Button>

			<Modal isOpen={isOpen} onClose={handleModalClose} size="3xl">
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
											{searchResult.type === "not-found" ? (
												/* IMEI Not Found */
												<div className="bg-red-50 border border-red-200 rounded-lg p-4">
													<h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
														<AlertTriangle size={18} />
														IMEI Not Found
													</h3>
													<p className="text-sm text-red-800">
														The IMEI{" "}
														<span className="font-mono font-bold">
															{searchResult.imei}
														</span>{" "}
														was not found in the database.
													</p>
												</div>
											) : searchResult.type === "unused" ? (
												/* Unused IMEI Result */
												<div className="space-y-4">
													<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
														<h3 className="font-semibold text-blue-900 mb-2">
															IMEI: {searchResult.imei}
														</h3>
														<div className="grid grid-cols-2 gap-4 text-sm">
															<div>
																<span className="text-gray-600">Status:</span>{" "}
																<Chip color="success" size="sm">
																	{searchResult.status}
																</Chip>
															</div>
															<div>
																<span className="text-gray-600">Claims:</span>{" "}
																<span className="font-medium">
																	{searchResult.claimsCount}
																</span>
															</div>
															{searchResult.product && (
																<div>
																	<span className="text-gray-600">
																		Product:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.product.name}
																	</span>
																</div>
															)}
															{searchResult.supplier && (
																<div>
																	<span className="text-gray-600">
																		Supplier:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.supplier}
																	</span>
																</div>
															)}
															{searchResult.expiryDate && (
																<div>
																	<span className="text-gray-600">
																		Expiry Date:
																	</span>{" "}
																	<span className="font-medium">
																		{new Date(
																			searchResult.expiryDate
																		).toLocaleDateString()}
																	</span>
																</div>
															)}
														</div>
													</div>

													{/* View Upload Details Button */}
													{searchResult.uploadId && (
														<div className="mt-4">
															<Button
																color="primary"
																variant="flat"
																startContent={<Eye size={16} />}
																onPress={() => {
																	router.push(
																		`/access/${role}/samsung-sentinel/imei/upload/${searchResult.uploadId}`
																	);
																	handleModalClose();
																}}
															>
																View Upload Details
															</Button>
														</div>
													)}
												</div>
											) : (
												/* Used IMEI Result - Show Claims Table */
												<div className="space-y-4">
													<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
														<h3 className="font-semibold text-amber-900 mb-2">
															IMEI: {searchResult.imei} (In Use)
														</h3>
														<div className="grid grid-cols-2 gap-4 text-sm mb-2">
															{searchResult.product && (
																<div>
																	<span className="text-gray-600">
																		Product:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.product.name}
																	</span>
																</div>
															)}
															{searchResult.supplier && (
																<div>
																	<span className="text-gray-600">
																		Supplier:
																	</span>{" "}
																	<span className="font-medium">
																		{searchResult.supplier}
																	</span>
																</div>
															)}
															{searchResult.usedAt && (
																<div>
																	<span className="text-gray-600">
																		Used On:
																	</span>{" "}
																	<span className="font-medium">
																		{new Date(
																			searchResult.usedAt
																		).toLocaleDateString()}
																	</span>
																</div>
															)}
														</div>

														{/* View Upload Details Button */}
														{searchResult.uploadId && (
															<div className="mt-3 pt-3 border-t border-amber-200">
																<Button
																	size="sm"
																	color="primary"
																	variant="flat"
																	startContent={<Eye size={14} />}
																	onPress={() => {
																		router.push(
																			`/access/${role}/samsung-sentinel/imei/upload/${searchResult.uploadId}`
																		);
																		handleModalClose();
																	}}
																>
																	View Upload Details
																</Button>
															</div>
														)}

														<p className="text-sm text-amber-800 mt-3">
															This IMEI has {searchResult.claims?.length || 0}{" "}
															associated claim(s):
														</p>
													</div>{" "}
													{/* Claims Table */}
													{searchResult.claims &&
														searchResult.claims.length > 0 && (
															<div className="overflow-x-auto">
																<table className="w-full border border-gray-200 rounded-lg">
																	<thead className="bg-gray-50">
																		<tr>
																			<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																				Claim Number
																			</th>
																			<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																				Customer Name
																			</th>
																			<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																				Product
																			</th>
																			<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
																				Service Center
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
																					{claim.claim_number}
																				</td>
																				<td className="px-4 py-3 text-sm text-gray-600">
																					{claim.customer_first_name}{" "}
																					{claim.customer_last_name}
																				</td>
																				<td className="px-4 py-3 text-sm text-gray-600">
																					{claim.product?.name || "N/A"}
																				</td>
																				<td className="px-4 py-3 text-sm text-gray-600">
																					{claim.service_center?.name || "N/A"}
																				</td>
																				<td className="px-4 py-3 text-sm">
																					<Chip
																						color={
																							claim.status === "APPROVED"
																								? "success"
																								: claim.status === "PENDING"
																								? "warning"
																								: claim.status === "COMPLETED"
																								? "primary"
																								: "danger"
																						}
																						size="sm"
																						className="capitalize"
																					>
																						{claim.status}
																					</Chip>
																				</td>
																				<td className="px-4 py-3 text-sm text-gray-600">
																					{new Date(
																						claim.created_at
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
																								`/access/${role}/samsung-sentinel/claims/${claim.id}`
																							);
																							handleModalClose();
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
														)}
												</div>
											)}
										</div>
									)}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={handleModalClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}
