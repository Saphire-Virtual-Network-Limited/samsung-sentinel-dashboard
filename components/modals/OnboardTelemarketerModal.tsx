"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { FormField } from "@/components/reususables";
import { showToast, useField } from "@/lib";
import { cdfAdminRegisterAgent } from "@/lib/api";
import { cn } from "@/lib/utils";
import z from "zod";

interface OnboardTelemarketerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export const OnboardTelemarketerModal: React.FC<
  OnboardTelemarketerModalProps
> = ({ isOpen, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const {
    value: firstName,
    error: firstNameError,
    handleChange: handleFirstNameChange,
  } = useField("", z.string().min(1, "First name is required"));

  const {
    value: lastName,
    error: lastNameError,
    handleChange: handleLastNameChange,
  } = useField("", z.string().min(1, "Last name is required"));

  const {
    value: email,
    error: emailError,
    handleChange: handleEmailChange,
  } = useField("", z.string().email("Please enter a valid email address"));

  const {
    value: phoneNumber,
    error: phoneError,
    handleChange: handlePhoneChange,
  } = useField("", z.string().min(10, "Phone number is required"));

  useEffect(() => {
    setIsDisabled(!firstName || !lastName || !email || !phoneNumber);
  }, [firstName, lastName, email, phoneNumber]);

  const handleSubmit = async () => {
    setIsLoading(true);

    const payload = {
      firstname: firstName,
      lastname: lastName,
      email,
      phone: phoneNumber,
    };

    try {
      const response = await cdfAdminRegisterAgent(payload);

      if (response.success) {
        showToast({
          type: "success",
          message: "Agent registered successfully",
          duration: 4000,
        });

        onSubmit?.();
        onClose();
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error(error);
      showToast({
        type: "error",
        message: error.message || "Something went wrong",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
      backdrop="opaque"
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold text-blue-700">
            Onboard New Telemarketer
          </h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                htmlFor="first-name"
                id="first-name"
                type="text"
                size="lg"
                placeholder="Enter first name"
                value={firstName}
                onChange={handleFirstNameChange}
                isInvalid={!!firstNameError}
                errorMessage={firstNameError || ""}
                required
              />

              <FormField
                label="Last Name"
                htmlFor="last-name"
                id="last-name"
                type="text"
                size="lg"
                placeholder="Enter last name"
                value={lastName}
                onChange={handleLastNameChange}
                isInvalid={!!lastNameError}
                errorMessage={lastNameError || ""}
                required
              />
            </div>

            <FormField
              label="Email Address"
              htmlFor="email"
              id="email"
              type="email"
              size="lg"
              placeholder="Enter email address"
              value={email}
              onChange={handleEmailChange}
              isInvalid={!!emailError}
              errorMessage={emailError || ""}
              required
            />

            <FormField
              label="Phone Number"
              htmlFor="phone-number"
              id="phone-number"
              type="tel"
              size="lg"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={handlePhoneChange}
              isInvalid={!!phoneError}
              errorMessage={phoneError || ""}
              required
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={isDisabled}
            isLoading={isLoading}
            className={cn(isDisabled && "opacity-70 cursor-not-allowed")}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
