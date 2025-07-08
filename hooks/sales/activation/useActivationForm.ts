import { useState, useCallback } from "react";
import { z } from "zod";
import { createSchema } from "@/lib";
import type { FormData, FormErrors, FormField } from "./types";

interface UseActivationFormReturn {
  formData: FormData;
  errors: FormErrors;
  updateField: (field: FormField, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  clearContactFields: () => void;
  isValid: (field: FormField) => boolean;
  hasErrors: boolean;
}

export const useActivationForm = (): UseActivationFormReturn => {
  // Validation schemas with proper typing
  const schemas: Record<FormField, z.ZodSchema<string>> = {
    activationType: createSchema(
      (value: string): boolean => value.length > 0,
      "Please select an activation type"
    ),
    otpType: createSchema(
      (value: string): boolean => value.length > 0,
      "Please select an OTP type"
    ),
    email: createSchema(
      (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Please enter a valid email address"
    ),
    phone: createSchema(
      (value: string): boolean =>
        /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, "")),
      "Please enter a valid phone number"
    ),
  };

  const [formData, setFormData] = useState<FormData>({
    activationType: "",
    otpType: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Update form field with type safety
  const updateField = useCallback((field: FormField, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, []);

  // Validate single field with proper error handling
  const validateField = useCallback(
    (field: FormField, value: string): boolean => {
      try {
        // Only validate email/phone if their respective OTP type is selected
        if (field === "email" && formData.otpType !== "email") return true;
        if (field === "phone" && formData.otpType !== "sms") return true;

        const schema = schemas[field];
        if (!schema) return true;

        schema.parse(value);
        setErrors((prev) => ({ ...prev, [field]: null }));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [field]: error.errors[0]?.message || "Invalid value",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            [field]: "Validation error",
          }));
        }
        return false;
      }
    },
    [formData.otpType]
  );

  // Validate all required fields
  const validateForm = useCallback((): boolean => {
    const fieldsToValidate: FormField[] = ["activationType", "otpType"];

    if (formData.otpType === "email") fieldsToValidate.push("email");
    if (formData.otpType === "sms") fieldsToValidate.push("phone");

    const results = fieldsToValidate.map((field) =>
      validateField(field, formData[field])
    );

    return results.every(Boolean);
  }, [formData, validateField]);

  // Clear entire form
  const resetForm = useCallback((): void => {
    setFormData({
      activationType: "",
      otpType: "",
      email: "",
      phone: "",
    });
    setErrors({});
  }, []);

  // Clear contact fields when OTP type changes
  const clearContactFields = useCallback((): void => {
    setFormData((prev) => ({ ...prev, email: "", phone: "" }));
    setErrors((prev) => ({ ...prev, email: null, phone: null }));
  }, []);

  // Check if a field is valid
  const isValid = useCallback(
    (field: FormField): boolean => {
      return !errors[field] && Boolean(formData[field]);
    },
    [errors, formData]
  );

  // Check if form has any errors
  const hasErrors = Object.values(errors).some(
    (error) => error !== null && error !== undefined
  );

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    clearContactFields,
    isValid,
    hasErrors,
  };
};
