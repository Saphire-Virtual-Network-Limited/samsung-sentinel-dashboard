"use client";

import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  Avatar,
} from "@heroui/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "primary" | "success";
  size?: "sm" | "md" | "lg" | "xl";

  // Optional entity display
  entity?: {
    name: string;
    subtitle?: string;
    imageUrl?: string;
    id?: string;
  };

  // Warning section
  warning?: {
    title: string;
    message: string;
    items?: string[];
    icon?: React.ReactNode;
  };

  // Additional info
  additionalInfo?: {
    label: string;
    value: string;
  };
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
  size = "md",
  entity,
  warning,
  additionalInfo,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          titleColor: "text-danger",
          buttonColor: "danger" as const,
          warningBg: "bg-danger-50 border-danger-200",
          warningText: "text-danger-600",
          warningTitleText: "text-danger-700",
        };
      case "warning":
        return {
          titleColor: "text-warning",
          buttonColor: "warning" as const,
          warningBg: "bg-warning-50 border-warning-200",
          warningText: "text-warning-600",
          warningTitleText: "text-warning-700",
        };
      case "primary":
        return {
          titleColor: "text-primary",
          buttonColor: "primary" as const,
          warningBg: "bg-primary-50 border-primary-200",
          warningText: "text-primary-600",
          warningTitleText: "text-primary-700",
        };
      case "success":
        return {
          titleColor: "text-success",
          buttonColor: "success" as const,
          warningBg: "bg-success-50 border-success-200",
          warningText: "text-success-600",
          warningTitleText: "text-success-700",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-default-500">{description}</p>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Entity Display */}
            {entity && (
              <div className="flex items-center gap-3">
                {entity.imageUrl && (
                  <Avatar
                    src={entity.imageUrl}
                    alt={entity.name}
                    className="w-12 h-12"
                  />
                )}
                <div>
                  <p className="font-medium">{entity.name}</p>
                  {entity.subtitle && (
                    <p className="text-small text-default-500">
                      {entity.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Warning Section */}
            {warning && (
              <div className={`${styles.warningBg} border rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  {warning.icon && (
                    <div className="mt-0.5 flex-shrink-0">{warning.icon}</div>
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${styles.warningTitleText} mb-1`}
                    >
                      {warning.title}
                    </p>
                    <p className={`text-sm ${styles.warningText}`}>
                      {warning.message}
                    </p>
                    {warning.items && warning.items.length > 0 && (
                      <ul
                        className={`text-sm ${styles.warningText} mt-2 ml-4 list-disc`}
                      >
                        {warning.items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            {additionalInfo && (
              <div className="bg-default-50 rounded-lg p-3">
                <p className="text-sm text-default-600">
                  <strong>{additionalInfo.label}:</strong>{" "}
                  {additionalInfo.value}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            color={styles.buttonColor}
            onPress={onConfirm}
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
