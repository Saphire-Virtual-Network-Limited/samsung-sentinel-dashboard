"use client";

import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Image,
} from "@heroui/react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  alt,
  size = "sm",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody className="p-0">
          <Image
            src={imageUrl}
            alt={alt || title}
            className="w-full h-auto rounded-b-lg"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImagePreviewModal;
