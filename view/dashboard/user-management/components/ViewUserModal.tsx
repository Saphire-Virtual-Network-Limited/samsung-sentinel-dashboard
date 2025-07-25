import React from "react";
import { Button, Chip } from "@heroui/react";
import { Eye } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import UserModal from "./UserModal";
import { InfoSection, InfoField } from "./InfoComponents";
import { capitalize } from "@/lib";
import type { User } from "../types";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  statusColorMap: Record<string, any>;
}

export default function ViewUserModal({
  isOpen,
  onClose,
  selectedUser,
  statusColorMap,
}: ViewUserModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const role = pathname.split("/")[2];

  const footer = (
    <>
      <Button color="primary" onPress={onClose}>
        Close
      </Button>
    </>
  );

  if (!selectedUser) return null;

  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="User Details"
      subtitle={`Complete information for ${selectedUser.firstName} ${selectedUser.lastName}`}
      icon={Eye}
      iconColor="text-blue-600"
      iconBgColor="bg-blue-100"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Basic Information */}
        <InfoSection title="Basic Information">
          <InfoField
            label="Full Name"
            value={`${selectedUser.firstName} ${selectedUser.lastName}`}
          />
          <InfoField label="Email" value={selectedUser.email} />
          <InfoField
            label="Phone"
            value={selectedUser.telephoneNumber || "N/A"}
          />
          <InfoField
            label="Role"
            value={selectedUser.role?.replace(/_/g, " ").toLowerCase() || "N/A"}
          />
        </InfoSection>

        {/* Account Status */}
        <InfoSection title="Account Status">
          <InfoField label="User ID" value={selectedUser.userId} mono />
          <InfoField
            label="Account Status"
            value={
              <Chip
                className="capitalize"
                color={statusColorMap[selectedUser.accountStatus || ""]}
                size="sm"
                variant="flat"
              >
                {capitalize(selectedUser.accountStatus || "")}
              </Chip>
            }
          />
          <InfoField
            label="Active"
            value={
              <Chip
                className="capitalize"
                color={selectedUser.isActive ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {selectedUser.isActive ? "Yes" : "No"}
              </Chip>
            }
          />
        </InfoSection>

        {/* Company Information */}
        {selectedUser.companyName && (
          <InfoSection title="Company Information">
            <InfoField label="Company" value={selectedUser.companyName} />
            <InfoField
              label="Location"
              value={
                [selectedUser.companyCity, selectedUser.companyState]
                  .filter(Boolean)
                  .join(", ") || "N/A"
              }
            />
          </InfoSection>
        )}

        {/* Account Details */}
        <InfoSection title="Account Details">
          <InfoField
            label="Created"
            value={new Date(selectedUser.createdAt).toLocaleDateString()}
          />
          <InfoField
            label="Last Updated"
            value={new Date(selectedUser.updatedAt).toLocaleDateString()}
          />
        </InfoSection>
      </div>
    </UserModal>
  );
}
