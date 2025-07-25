import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@heroui/react";
import { LucideIcon } from "lucide-react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
}

export default function UserModal({
  isOpen,
  onClose,
  size = "md",
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
  children,
  footer,
  isLoading = false,
}: UserModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior="inside"
      classNames={{
        wrapper: "overflow-hidden",
        base: "max-h-[90vh]",
        body: "p-6",
        header: "border-b border-divider",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${iconBgColor} rounded-lg`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}
