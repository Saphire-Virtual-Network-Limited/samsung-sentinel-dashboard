import { ColumnDef } from "@/components/reususables/custom-ui/tableUi";
import { ChipProps } from "@heroui/react";

export const columns: ColumnDef[] = [
	{ name: "Customer ID", uid: "sentinelCustomerId", sortable: true },
	{ name: "Name", uid: "fullName", sortable: true },
	{ name: "Email", uid: "email" },
	{ name: "Phone Number", uid: "phoneNumber" },
	{ name: "Device Count", uid: "deviceCount" },
	{ name: "Enrollment Status", uid: "enrollmentStatus" },
	// { name: "Store ID", uid: "storeId" },
	{ name: "Registration Date", uid: "registrationDate", sortable: true },
	{ name: "Actions", uid: "actions" },
];

// Export columns
export const exportColumns: ColumnDef[] = [
	{ name: "Customer ID", uid: "sentinelCustomerId" },
	{ name: "First Name", uid: "firstName" },
	{ name: "Last Name", uid: "lastName" },
	{ name: "Email", uid: "email" },
	{ name: "Phone Number", uid: "phoneNumber" },
	{ name: "Address", uid: "address" },
	{ name: "Country", uid: "country" },
	{ name: "MBE ID", uid: "mbeId" },
	{ name: "Store ID", uid: "storeId" },
	{ name: "Device Enrollment ID", uid: "deviceEnrollmentId" },
	{ name: "Device Count", uid: "deviceCount" },
	{ name: "Enrollment Status", uid: "enrollmentStatus" },
	{ name: "Registration Date", uid: "registrationDate" },
	{ name: "Last Updated", uid: "updatedAt" },
];

export const statusOptions = [
	{ name: "Enrolled", uid: "enrolled" },
	{ name: "Pending", uid: "pending" },
	{ name: "Not Enrolled", uid: "not-enrolled" },
];

export const statusColorMap: Record<string, ChipProps["color"]> = {
	enrolled: "success",
	pending: "warning",
	"not-enrolled": "danger",
};
