"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
import { TeleMarketer } from "@/view/creditflex/telesales/types";
import { showToast } from "@/lib";
import { cdfAdminEditAgent } from "@/lib/api";
import { getColor } from "@/lib/utils";

interface TelemarketerModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemarketer: TeleMarketer | null;
  onUpdate?: () => void;
}

export const TelemarketerModal: React.FC<TelemarketerModalProps> = ({
  isOpen,
  onClose,
  telemarketer,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    telemarketer?.accountStatus || "PENDING"
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!telemarketer) return null;

  const handleStatusChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;
    setSelectedStatus(selectedKey);
  };

  const handleDelete = async () => {
    if (!telemarketer?.teleMarketerId) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual delete API call
      // const response = await adminDeleteAgent({
      //   telemarketerId: telemarketer.teleMarketerId,
      // });

      showToast({
        type: "success",
        message: "Telemarketer deleted successfully",
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      showToast({
        type: "error",
        message: error.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!telemarketer?.teleMarketerId || !selectedStatus) return;

    setIsLoading(true);
    try {
      const response = await cdfAdminEditAgent({
        telemarketerId: telemarketer.teleMarketerId,
        status: selectedStatus,
      });

      if (response.success) {
        showToast({
          type: "success",
          message: "Status updated successfully",
        });

        onUpdate?.();
        onClose();
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error: any) {
      console.error(error);
      showToast({
        type: "error",
        message: error.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, any> = {
      ACTIVE: "success",
      PENDING: "warning",
      APPROVED: "success",
      SUSPENDED: "danger",
      INACTIVE: "default",
      FRAUD: "danger",
      ARCHIVED: "default",
      REJECTED: "danger",
      FULFILLED: "success",
      ACCEPTED: "success",
      KYC_1: "primary",
      KYC_2: "primary",
      KYC_3: "primary",
    };
    return colorMap[status] || "default";
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {}}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="opaque"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center mt-4">
          <h2 className="text-blue-700 font-bold text-lg">
            {telemarketer.firstname} {telemarketer.lastname}
          </h2>
          <Chip
            className="capitalize"
            color={getStatusColor(telemarketer.accountStatus)}
            size="sm"
            variant="flat"
          >
            {telemarketer.accountStatus}
          </Chip>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Information */}
            <div className="space-y-4">
              <h3 className="text-blue-600 font-semibold text-lg mb-3">
                Personal Information
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Agent ID
                  </p>
                  <p className="text-gray-900 font-mono text-sm">
                    {telemarketer.teleMarketerId}
                  </p>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    First Name
                  </p>
                  <p className="text-gray-900">{telemarketer.firstname}</p>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Last Name
                  </p>
                  <p className="text-gray-900">{telemarketer.lastname}</p>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Email Address
                  </p>
                  <p className="text-gray-900">{telemarketer.email}</p>
                  {telemarketer.emailVerified && (
                    <Chip
                      color="success"
                      size="sm"
                      variant="flat"
                      className="mt-1"
                    >
                      Verified
                    </Chip>
                  )}
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Phone Number
                  </p>
                  <p className="text-gray-900">{telemarketer.phone}</p>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">Address</p>
                  <p className="text-gray-900">
                    {telemarketer.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Account Information */}
            <div className="space-y-4">
              <h3 className="text-blue-600 font-semibold text-lg mb-3">
                Account Information
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Current Status
                  </p>
                  <Select
                    aria-label="Select Status"
                    selectedKeys={[selectedStatus]}
                    onSelectionChange={handleStatusChange}
                    className="w-full"
                    size="sm"
                    disallowEmptySelection
                  >
                    {[
                      "ACTIVE",
                      "INACTIVE",
                      "SUSPENDED",
                      "PENDING",
                      "APPROVED",
                      "FRAUD",
                      "ARCHIVED",
                      "REJECTED",
                      "FULFILLED",
                      "ACCEPTED",
                      "KYC_1",
                      "KYC_2",
                      "KYC_3",
                    ].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">Channel</p>
                  <p className="text-gray-900">
                    {telemarketer.channel || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Email Verified
                  </p>
                  <Chip
                    color={telemarketer.emailVerified ? "success" : "warning"}
                    size="sm"
                    variant="flat"
                  >
                    {telemarketer.emailVerified ? "Yes" : "No"}
                  </Chip>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Created Date
                  </p>
                  <p className="text-gray-900">
                    {formatDate(telemarketer.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Last Updated
                  </p>
                  <p className="text-gray-900">
                    {formatDate(telemarketer.updatedAt)}
                  </p>
                </div>

                {telemarketer.resetOtp && (
                  <div>
                    <p className="text-blue-600 font-semibold text-sm">
                      Reset OTP
                    </p>
                    <p className="text-gray-900 font-mono text-sm">
                      {telemarketer.resetOtp}
                    </p>
                    {telemarketer.resetOtpExpiry && (
                      <p className="text-gray-500 text-xs">
                        Expires: {formatDate(telemarketer.resetOtpExpiry)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex items-center justify-between gap-4">
          <Button
            variant="solid"
            color="danger"
            onPress={handleDelete}
            isLoading={isLoading}
          >
            Delete Agent
          </Button>
          <div className="flex gap-2">
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
            <Button
              className="bg-blue-600 text-white"
              onPress={handleEdit}
              isLoading={isLoading}
              isDisabled={selectedStatus === telemarketer.accountStatus}
            >
              Update Status
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
