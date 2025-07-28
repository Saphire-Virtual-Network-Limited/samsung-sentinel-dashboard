"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { createCDFLoanProduct } from "@/lib/api";
import { showToast } from "@/lib";
import {
  interestRateTypeOptions,
  bankChargeTypeOptions,
} from "@/view/creditflex/loanProducts/types";

interface CreateLoanProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedType?: string;
}

export const CreateLoanProductDetailModal: React.FC<
  CreateLoanProductDetailModalProps
> = ({ isOpen, onClose, onSuccess, selectedType = "monetary-lending" }) => {
  const [formData, setFormData] = useState({
    productName: "",
    productImage: "",
    minAmount: "",
    maxAmount: "",
    loanTenure: "",
    moratoriumPeriod: "",
    interestRateType: "",
    interestRate: "",
    bankChargeType: "",
    bankCharge: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        productName: "",
        productImage: "",
        minAmount: "",
        maxAmount: "",
        loanTenure: "",
        moratoriumPeriod: "",
        interestRateType: "",
        interestRate: "",
        bankChargeType: "",
        bankCharge: "",
        description: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.minAmount || Number(formData.minAmount) <= 0) {
      newErrors.minAmount = "Minimum amount must be greater than 0";
    }

    if (!formData.maxAmount || Number(formData.maxAmount) <= 0) {
      newErrors.maxAmount = "Maximum amount must be greater than 0";
    }

    if (
      formData.minAmount &&
      formData.maxAmount &&
      Number(formData.minAmount) >= Number(formData.maxAmount)
    ) {
      newErrors.maxAmount =
        "Maximum amount must be greater than minimum amount";
    }

    if (!formData.loanTenure) {
      newErrors.loanTenure = "Loan tenure is required";
    }

    if (!formData.moratoriumPeriod) {
      newErrors.moratoriumPeriod = "Moratorium period is required";
    }

    if (!formData.interestRateType) {
      newErrors.interestRateType = "Interest rate type is required";
    }

    if (!formData.interestRate || Number(formData.interestRate) < 0) {
      newErrors.interestRate = "Interest rate cannot be negative";
    }

    if (!formData.bankChargeType) {
      newErrors.bankChargeType = "Bank charge type is required";
    }

    if (!formData.bankCharge || Number(formData.bankCharge) < 0) {
      newErrors.bankCharge = "Bank charge cannot be negative";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.productName,
        loanProductType: selectedType,
        amountFrom: Number(formData.minAmount),
        amountTo: Number(formData.maxAmount),
        loanTenure: Number(formData.loanTenure),
        moratoriumPeriod: Number(formData.moratoriumPeriod),
        interestRateType: formData.interestRateType,
        interestRate: Number(formData.interestRate),
        bankChargeType: formData.bankChargeType,
        bankCharge: Number(formData.bankCharge),
        description: formData.description,
        productImage: formData.productImage,
        status: "draft", // Default status
      };

      await createCDFLoanProduct(payload);

      showToast({
        message: "Loan product created successfully!",
        type: "success",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating loan product:", error);
      showToast({
        message: error?.message || "Failed to create loan product",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate tenure options (1-24 months)
  const tenureOptions = Array.from({ length: 24 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} month${i !== 0 ? "s" : ""}`,
  }));

  // Generate moratorium options (0-6 months)
  const moratoriumOptions = Array.from({ length: 7 }, (_, i) => ({
    value: i.toString(),
    label: `${i} month${i !== 1 ? "s" : ""}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {}}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      backdrop="opaque"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center mt-4">
          <h2 className="text-blue-700 font-bold text-lg">
            Create Loan Product
          </h2>
        </ModalHeader>

        <ModalBody className="space-y-4 pb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-6">
              {/* Product Name */}
              <Input
                label="Product Name"
                placeholder="Enter the product name"
                value={formData.productName}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
                isInvalid={!!errors.productName}
                errorMessage={errors.productName}
                isRequired
              />

              {/* Product Image */}
              <Input
                label="Product Image URL"
                placeholder="Enter image URL (optional)"
                value={formData.productImage}
                onChange={(e) =>
                  handleInputChange("productImage", e.target.value)
                }
              />

              {/* Amount Range */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Amount"
                  placeholder="Enter minimum amount"
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) =>
                    handleInputChange("minAmount", e.target.value)
                  }
                  isInvalid={!!errors.minAmount}
                  errorMessage={errors.minAmount}
                  isRequired
                />
                <Input
                  label="Maximum Amount"
                  placeholder="Enter maximum amount"
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) =>
                    handleInputChange("maxAmount", e.target.value)
                  }
                  isInvalid={!!errors.maxAmount}
                  errorMessage={errors.maxAmount}
                  isRequired
                />
              </div>

              {/* Tenure and Moratorium */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Loan Tenure"
                  placeholder="Select loan tenure"
                  selectedKeys={
                    formData.loanTenure ? [formData.loanTenure] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleInputChange("loanTenure", value);
                  }}
                  isInvalid={!!errors.loanTenure}
                  errorMessage={errors.loanTenure}
                  isRequired
                >
                  {tenureOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Moratorium Period"
                  placeholder="Select moratorium period"
                  selectedKeys={
                    formData.moratoriumPeriod ? [formData.moratoriumPeriod] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleInputChange("moratoriumPeriod", value);
                  }}
                  isInvalid={!!errors.moratoriumPeriod}
                  errorMessage={errors.moratoriumPeriod}
                  isRequired
                >
                  {moratoriumOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Interest Rate */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Interest Rate Type"
                  placeholder="Select interest rate type"
                  selectedKeys={
                    formData.interestRateType ? [formData.interestRateType] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleInputChange("interestRateType", value);
                  }}
                  isInvalid={!!errors.interestRateType}
                  errorMessage={errors.interestRateType}
                  isRequired
                >
                  {interestRateTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Interest Rate (%)"
                  placeholder="Enter interest rate"
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) =>
                    handleInputChange("interestRate", e.target.value)
                  }
                  isInvalid={!!errors.interestRate}
                  errorMessage={errors.interestRate}
                  isRequired
                />
              </div>

              {/* Bank Charge */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Bank Charge Type"
                  placeholder="Select bank charge type"
                  selectedKeys={
                    formData.bankChargeType ? [formData.bankChargeType] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleInputChange("bankChargeType", value);
                  }}
                  isInvalid={!!errors.bankChargeType}
                  errorMessage={errors.bankChargeType}
                  isRequired
                >
                  {bankChargeTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Bank Charge"
                  placeholder="Enter bank charge"
                  type="number"
                  step="0.01"
                  value={formData.bankCharge}
                  onChange={(e) =>
                    handleInputChange("bankCharge", e.target.value)
                  }
                  isInvalid={!!errors.bankCharge}
                  errorMessage={errors.bankCharge}
                  isRequired
                />
              </div>

              {/* Description */}
              <Textarea
                label="Product Description"
                placeholder="Enter loan product description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                isRequired
              />

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Create Loan Product
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
