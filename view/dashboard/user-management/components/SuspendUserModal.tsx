import React from "react";
import { Button } from "@heroui/react";
import { UserX } from "lucide-react";
import UserModal from "./UserModal";
import { InfoSection, InfoField } from "./InfoComponents";
import type { User } from "../types";

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  suspendForm: {
    status: string;
    reason: string;
  };
  onSuspendUser: () => void;
  isLoading: boolean;
}

export default function SuspendUserModal({
  isOpen,
  onClose,
  selectedUser,
  suspendForm,
  onSuspendUser,
  isLoading,
}: SuspendUserModalProps) {
  const footer = (
    <>
      <Button
        color="default"
        variant="light"
        onPress={onClose}
        isDisabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        color={suspendForm.status === "SUSPENDED" ? "danger" : "success"}
        onPress={onSuspendUser}
        isLoading={isLoading}
      >
        {suspendForm.status === "SUSPENDED" ? "Suspend User" : "Activate User"}
      </Button>
    </>
  );

  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        suspendForm.status === "SUSPENDED" ? "Suspend User" : "Activate User"
      }
      subtitle={`${
        suspendForm.status === "SUSPENDED"
          ? "Suspend access for"
          : "Restore access for"
      } ${selectedUser?.firstName} ${selectedUser?.lastName}`}
      icon={UserX}
      iconColor={
        suspendForm.status === "SUSPENDED" ? "text-red-600" : "text-green-600"
      }
      iconBgColor={
        suspendForm.status === "SUSPENDED" ? "bg-red-100" : "bg-green-100"
      }
      footer={footer}
    >
      <div className="space-y-4">
        <InfoSection title="User Information">
          <InfoField
            label="User"
            value={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
          />
          <InfoField label="Email" value={selectedUser?.email || ""} />
          <InfoField
            label="Current Status"
            value={
              <span
                className={`font-medium ${
                  selectedUser?.accountStatus === "ACTIVE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedUser?.accountStatus}
              </span>
            }
          />
        </InfoSection>

        <div
          className={`p-4 rounded-lg border ${
            suspendForm.status === "SUSPENDED"
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <p className="text-sm font-medium">
            {suspendForm.status === "SUSPENDED"
              ? "⚠️ This user will lose access to the dashboard immediately"
              : "✅ This user will regain access to the dashboard"}
          </p>
        </div>
      </div>
    </UserModal>
  );
}
