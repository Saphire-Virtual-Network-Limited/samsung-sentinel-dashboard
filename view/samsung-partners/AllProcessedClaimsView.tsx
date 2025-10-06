"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Button,
	Chip,
	Checkbox,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/react";
import {
	useProcessedClaims,
	useProcessedClaimActions,
} from "@/hooks/samsung-partners/useProcessedClaims";
import GenericTable from "@/components/reususables/custom-ui/tableUi";
import {
	MoreHorizontal,
	Eye,
	CreditCard,
	CheckCircle,
	Clock,
} from "lucide-react";
import { formatDate, showToast } from "@/lib";

const AllProcessedClaimsView = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [paymentFilter, setPaymentFilter] = useState("");
	const [dateRange, setDateRange] = useState({ from: "", to: "" });
	const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
	const [showPaymentModal, setShowPaymentModal] = useState(false);

	const { claims, isLoading, error, mutate } = useProcessedClaims({
		paymentStatus: paymentFilter as "all" | "paid" | "unpaid" | undefined,
		search: searchQuery,
		dateRange: {
			start: dateRange.from,
			end: dateRange.to,
		},
	});

	const { authorizePayment } = useProcessedClaimActions();
	const [isAuthorizing, setIsAuthorizing] = useState(false);

	const handleView = (claimId: string) => {
		router.push(`/access/samsung-partners/repair-claims/view/${claimId}`);
	};

	const handleSelectClaim = (claimId: string, checked: boolean) => {
		if (checked) {
			setSelectedClaims((prev) => [...prev, claimId]);
		} else {
			setSelectedClaims((prev) => prev.filter((id) => id !== claimId));
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const unpaidClaims =
				claims
					?.filter((claim: any) => claim.paymentStatus === "unpaid")
					.map((claim: any) => claim.id) || [];
			setSelectedClaims(unpaidClaims);
		} else {
			setSelectedClaims([]);
		}
	};

	const handleMassAuthorize = () => {
		if (selectedClaims.length === 0) {
			showToast({
				type: "error",
				message: "Please select claims to authorize",
			});
			return;
		}
		setShowPaymentModal(true);
	};

	const confirmMassAuthorize = async () => {
		setIsAuthorizing(true);
		try {
			await authorizePayment(selectedClaims);
			setSelectedClaims([]);
			setShowPaymentModal(false);
			mutate();
			showToast({
				type: "success",
				message: `Successfully authorized payment for ${selectedClaims.length} claims`,
			});
		} catch (error) {
			showToast({ type: "error", message: "Failed to authorize payments" });
		} finally {
			setIsAuthorizing(false);
		}
	};

	const handleSingleAuthorize = async (claimId: string) => {
		setIsAuthorizing(true);
		try {
			await authorizePayment([claimId]);
			mutate();
			showToast({
				type: "success",
				message: "Payment authorized successfully",
			});
		} catch (error) {
			showToast({ type: "error", message: "Failed to authorize payment" });
		}
	};

	const columns = [
		{
			header: ({ table }: any) => {
				const unpaidClaims =
					claims?.filter((claim) => claim.paymentStatus === "unpaid") || [];
				const allUnpaidSelected =
					unpaidClaims.length > 0 &&
					unpaidClaims.every((claim) => selectedClaims.includes(claim.id));
				return (
					<Checkbox
						isSelected={allUnpaidSelected}
						onChange={(e: any) => handleSelectAll(e.target.checked)}
						aria-label="Select all unpaid claims"
					/>
				);
			},
			id: "select",
			cell: ({ row }: any) => {
				const claim = row.original;
				const isUnpaid = claim.paymentStatus === "unpaid";
				return (
					<Checkbox
						isSelected={selectedClaims.includes(claim.id)}
						onChange={(e: any) => handleSelectClaim(claim.id, e.target.checked)}
						isDisabled={!isUnpaid}
						aria-label={`Select claim ${claim.claimId}`}
					/>
				);
			},
		},
		{
			header: "Claim ID",
			accessorKey: "claimId",
			cell: ({ row }: any) => (
				<span className="font-medium">{row.original.claimId}</span>
			),
		},
		{
			header: "Customer",
			accessorKey: "customerName",
		},
		{
			header: "Service Center",
			accessorKey: "serviceCenterName",
		},
		{
			header: "IMEI",
			accessorKey: "imei",
		},
		{
			header: "Commission",
			accessorKey: "commission",
			cell: ({ row }: any) => (
				<span className="font-medium">
					₦{Number(row.original.commission).toLocaleString()}
				</span>
			),
		},
		{
			header: "Payment Status",
			accessorKey: "paymentStatus",
			cell: ({ row }: any) => {
				const status = row.original.paymentStatus;
				return (
					<Chip
						color={status === "paid" ? "success" : "warning"}
						variant="flat"
					>
						{status === "paid" ? (
							<>
								<CheckCircle className="w-3 h-3 mr-1" />
								PAID
							</>
						) : (
							<>
								<Clock className="w-3 h-3 mr-1" />
								UNPAID
							</>
						)}
					</Chip>
				);
			},
		},
		{
			header: "Date Processed",
			accessorKey: "processedAt",
			cell: ({ row }: any) => formatDate(row.original.processedAt),
		},
		{
			header: "Actions",
			id: "actions",
			cell: ({ row }: any) => {
				const claim = row.original;
				const isUnpaid = claim.paymentStatus === "unpaid";
				return (
					<Dropdown>
						<DropdownTrigger>
							<Button isIconOnly variant="ghost" size="sm">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownItem key="view" onClick={() => handleView(claim.id)}>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</DropdownItem>
							{isUnpaid ? (
								<DropdownItem
									key="authorize"
									onClick={() => handleSingleAuthorize(claim.id)}
								>
									<CreditCard className="mr-2 h-4 w-4" />
									Authorize Payment
								</DropdownItem>
							) : null}
						</DropdownMenu>
					</Dropdown>
				);
			},
		},
	];

	const searchFields = [
		{ label: "Service Center", value: "serviceCenterName" },
		{ label: "Customer", value: "customerName" },
		{ label: "IMEI", value: "imei" },
		{ label: "Claim ID", value: "claimId" },
	];

	const paymentStatusOptions = [
		{ label: "All Payments", value: "" },
		{ label: "Paid", value: "paid" },
		{ label: "Unpaid", value: "unpaid" },
	];

	const totalSelected = selectedClaims.length;
	const totalCommission =
		claims
			?.filter((claim: any) => selectedClaims.includes(claim.id))
			?.reduce(
				(sum: number, claim: any) => sum + Number(claim.commission),
				0
			) || 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">All Processed Claims</h1>
					<p className="text-muted-foreground">
						Manage commission payments for processed claims
					</p>
				</div>
				{totalSelected > 0 && (
					<Button onClick={handleMassAuthorize} disabled={isAuthorizing}>
						<CreditCard className="mr-2 h-4 w-4" />
						Authorize {totalSelected} Payment{totalSelected > 1 ? "s" : ""}
						(₦{totalCommission.toLocaleString()})
					</Button>
				)}
			</div>

			<GenericTable
				data={claims || []}
				columns={columns.map((col) => ({
					name: typeof col.header === "string" ? col.header : "Select",
					uid: col.accessorKey || col.id || "select",
					sortable: true,
				}))}
				allCount={claims?.length || 0}
				exportData={claims || []}
				isLoading={isLoading}
				filterValue=""
				onFilterChange={() => {}}
				sortDescriptor={{ column: "claimId", direction: "ascending" }}
				onSortChange={() => {}}
				page={1}
				pages={1}
				onPageChange={() => {}}
				exportFn={() => {}}
				renderCell={(item: any, columnKey: any) => {
					const column = columns.find(
						(c) => (c.accessorKey || c.id) === columnKey
					);
					if (column?.cell) {
						return column.cell({ row: { original: item } });
					}
					return item[columnKey as keyof typeof item] || "-";
				}}
				hasNoRecords={!claims || claims.length === 0}
			/>

			<Modal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
			>
				<ModalContent>
					<ModalHeader>
						<h3>Authorize Mass Payment</h3>
					</ModalHeader>
					<ModalBody>
						<p>
							You are about to authorize payment for {totalSelected} claims with
							a total commission of ₦{totalCommission.toLocaleString()}. This
							action cannot be undone.
						</p>
					</ModalBody>
					<ModalFooter>
						<Button variant="light" onClick={() => setShowPaymentModal(false)}>
							Cancel
						</Button>
						<Button
							color="primary"
							onClick={confirmMassAuthorize}
							disabled={isAuthorizing}
						>
							{isAuthorizing ? "Authorizing..." : "Authorize Payment"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default AllProcessedClaimsView;
