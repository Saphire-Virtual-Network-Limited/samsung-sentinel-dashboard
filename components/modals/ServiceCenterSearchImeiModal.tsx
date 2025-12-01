import React, { useState } from "react";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Input,
	Chip,
} from "@heroui/react";
import { Search, Eye } from "lucide-react";
import { searchImei as searchImeiApi } from "@/lib/api/imeis";
import { getAllClaims } from "@/lib/api/claims";
import { showToast } from "@/lib";
import { useRouter } from "next/navigation";

interface ServiceCenterSearchImeiModalProps {
	buttonText?: string;
	buttonColor?:
		| "default"
		| "primary"
		| "secondary"
		| "success"
		| "warning"
		| "danger";
	buttonVariant?:
		| "solid"
		| "bordered"
		| "light"
		| "flat"
		| "faded"
		| "shadow"
		| "ghost";
	buttonSize?: "sm" | "md" | "lg";
	showIcon?: boolean;
	className?: string;
}

export default function ServiceCenterSearchImeiModal({
	buttonText = "Search IMEI",
	buttonColor = "primary",
	buttonVariant = "solid",
	buttonSize = "md",
	showIcon = true,
	className = "",
}: ServiceCenterSearchImeiModalProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [searchImei, setSearchImei] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [searchResult, setSearchResult] = useState<any>(null);

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		setSearchResult(null);
		setSearchImei("");
		setIsOpen(false);
	};

	const handleSearchImei = async () => {
		if (!searchImei.trim()) {
			showToast({ message: "Please enter an IMEI number", type: "error" });
			return;
		}
		setIsSearching(true);
		try {
			const imeiData = await searchImeiApi(searchImei);
			if (!imeiData.is_used) {
				setSearchResult({
					type: "unused",
					imei: imeiData.imei,
					status: "Available",
					claimsCount: 0,
					supplier: imeiData.supplier,
					expiryDate: imeiData.expiry_date,
					product: imeiData.product,
				});
			} else {
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
				});
			}
		} catch (error: any) {
			if (error?.response?.status === 404) {
				showToast({ message: "IMEI not found in database", type: "error" });
				setSearchResult({ type: "not-found", imei: searchImei });
			} else {
				showToast({ message: "Failed to search IMEI", type: "error" });
			}
		} finally {
			setIsSearching(false);
		}
	};

	return (
		<>
			<Button
				color={buttonColor}
				variant={buttonVariant}
				size={buttonSize}
				startContent={showIcon ? <Search size={16} /> : undefined}
				onPress={handleOpen}
				className={className}
			>
				{buttonText}
			</Button>
			<Modal isOpen={isOpen} onClose={handleClose} size="3xl">
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
												<div className="bg-red-50 border border-red-200 rounded-lg p-4">
													<h3 className="font-semibold text-red-900 mb-2">
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
												</div>
											) : (
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
														<p className="text-sm text-amber-800 mt-3">
															This IMEI has {searchResult.claims?.length || 0}{" "}
															associated claim(s):
														</p>
													</div>
													{searchResult.claims &&
														searchResult.claims.length > 0 && (
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
																					{claim.customer_first_name}{" "}
																					{claim.customer_last_name}
																				</td>
																				<td className="px-4 py-3 text-sm text-gray-600">
																					{claim.description}
																				</td>
																				<td className="px-4 py-3 text-sm">
																					<Chip
																						color={
																							claim.status === "COMPLETED"
																								? "success"
																								: claim.status === "PENDING"
																								? "warning"
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
																								`/access/service-center/claims/${claim.id}`
																							);
																							handleClose();
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
								<Button variant="light" onPress={handleClose}>
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
