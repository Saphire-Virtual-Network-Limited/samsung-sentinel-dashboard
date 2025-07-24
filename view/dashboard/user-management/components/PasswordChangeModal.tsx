import React from "react";
import { Button, Input } from "@heroui/react";
import { KeyRound } from "lucide-react";
import UserModal from "./UserModal";
import { InfoSection, InfoField } from "./InfoComponents";
import type { User } from "../types";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  passwordForm: {
    password: string;
    confirmPassword: string;
  };
  setPasswordForm: React.Dispatch<
    React.SetStateAction<{
      password: string;
      confirmPassword: string;
    }>
  >;
  onPasswordChange: () => void;
  isLoading: boolean;
}

export default function PasswordChangeModal({
  isOpen,
  onClose,
  selectedUser,
  passwordForm,
  setPasswordForm,
  onPasswordChange,
  isLoading,
}: PasswordChangeModalProps) {
  const footer = (
    <>
      <Button
        color="danger"
        variant="light"
        onPress={onClose}
        isDisabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        color="primary"
        onPress={onPasswordChange}
        isLoading={isLoading}
        isDisabled={
          !passwordForm.password ||
          !passwordForm.confirmPassword ||
          passwordForm.password !== passwordForm.confirmPassword
        }
      >
        Change Password
      </Button>
    </>
  );

  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      subtitle={`Change password for ${selectedUser?.firstName} ${selectedUser?.lastName}`}
      icon={KeyRound}
      iconColor="text-orange-600"
      iconBgColor="bg-orange-100"
      footer={footer}
    >
      <div className="space-y-4">
        <InfoSection title="User Information">
          <InfoField
            label="User"
            value={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
          />
          <InfoField label="Email" value={selectedUser?.email || ""} />
          <InfoField label="Role" value={selectedUser?.role || ""} />
        </InfoSection>

        <Input
          label="New Password"
          placeholder="Enter new password"
          type="password"
          value={passwordForm.password}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, password: e.target.value })
          }
          isRequired
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm new password"
          type="password"
          value={passwordForm.confirmPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              confirmPassword: e.target.value,
            })
          }
          isRequired
          isInvalid={
            passwordForm.confirmPassword !== "" &&
            passwordForm.password !== passwordForm.confirmPassword
          }
          errorMessage={
            passwordForm.confirmPassword !== "" &&
            passwordForm.password !== passwordForm.confirmPassword
              ? "Passwords do not match"
              : ""
          }
        />
      </div>
    </UserModal>
  );
}
