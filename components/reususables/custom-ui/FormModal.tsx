"use client";

import React, { ReactNode } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@heroui/react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  description?: string;
  submitText: string;
  cancelText?: string;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  variant?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  submitText,
  cancelText = "Cancel",
  isLoading = false,
  isSubmitDisabled = false,
  variant = "primary",
  size = "md",
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-default-500">{description}</p>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">{children}</div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            color={variant}
            onPress={onSubmit}
            isLoading={isLoading}
            isDisabled={isSubmitDisabled || isLoading}
          >
            {submitText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FormModal;
