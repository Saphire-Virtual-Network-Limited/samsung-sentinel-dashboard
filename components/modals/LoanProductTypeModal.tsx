"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  RadioGroup,
  Radio,
} from "@heroui/react";
import { loanProductTypeOptions } from "@/view/creditflex/loanProducts/types";

interface LoanProductTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (selectedType: string) => void;
  defaultValue?: string;
}

export const LoanProductTypeModal: React.FC<LoanProductTypeModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  defaultValue = "monetary-lending",
}) => {
  const [selectedType, setSelectedType] = useState(defaultValue);

  const handleContinue = () => {
    onContinue(selectedType);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {}}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
      backdrop="opaque"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center mt-4">
          <h2 className="text-blue-700 font-bold text-lg">Loan Product Type</h2>
        </ModalHeader>

        <ModalBody className="space-y-4 pb-6">
          <div className="space-y-6">
            <h3 className="text-blue-600 font-semibold text-base">
              Select Loan Product Type
            </h3>

            <RadioGroup
              value={selectedType}
              onValueChange={setSelectedType}
              className="space-y-4"
            >
              {loanProductTypeOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50"
                >
                  <Radio value={option.value} id={option.value} />
                  <label
                    htmlFor={option.value}
                    className="text-gray-700 font-medium cursor-pointer flex-1"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onPress={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              Continue
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
