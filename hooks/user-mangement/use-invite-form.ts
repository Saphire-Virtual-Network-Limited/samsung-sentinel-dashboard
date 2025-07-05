"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import type {
  InviteAcceptFormData,
  InviteAcceptFormErrors,
  InviteAcceptFormField,
} from "../../view/dashboard/user-management/user";

interface UseInviteFormReturn {
  formData: InviteAcceptFormData;
  errors: InviteAcceptFormErrors;
  updateField: (field: InviteAcceptFormField, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  isValid: (field: InviteAcceptFormField) => boolean;
  hasErrors: boolean;
  setAdminId: (adminId: string) => void;
}

const createSchema = (
  validator: (value: string) => boolean,
  message: string
) => {
  return z.string().refine(validator, { message });
};

export const useInviteForm = (): UseInviteFormReturn => {
  const schemas: Partial<Record<InviteAcceptFormField, z.ZodSchema<string>>> = {
    password: createSchema(
      (value: string): boolean => value.length >= 8,
      "Password must be at least 8 characters"
    ),
    confirmPassword: createSchema(
      (value: string): boolean => value.length >= 8,
      "Please confirm your password"
    ),
  };

  const [formData, setFormData] = useState<InviteAcceptFormData>({
    password: "",
    confirmPassword: "",
    adminId: "",
  });

  const [errors, setErrors] = useState<InviteAcceptFormErrors>({});

  const validateField = useCallback(
    (
      field: InviteAcceptFormField,
      value: string,
      currentFormData: InviteAcceptFormData
    ): boolean => {
      try {
        const schema = schemas[field];
        if (!schema) return true;

        schema.parse(value);

        // Special validation for confirm password
        if (field === "confirmPassword" && value !== currentFormData.password) {
          setErrors((prev) => ({ ...prev, [field]: "Passwords do not match" }));
          return false;
        }

        // Special validation for password when confirm password exists
        if (
          field === "password" &&
          currentFormData.confirmPassword &&
          value !== currentFormData.confirmPassword
        ) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
          return false;
        }

        setErrors((prev) => ({ ...prev, [field]: null }));

        // Clear confirmPassword error if password now matches
        if (
          field === "password" &&
          currentFormData.confirmPassword &&
          value === currentFormData.confirmPassword
        ) {
          setErrors((prev) => ({ ...prev, confirmPassword: null }));
        }

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
    [schemas]
  );

  const updateField = useCallback(
    (field: InviteAcceptFormField, value: string): void => {
      setFormData((prev) => {
        const newFormData = { ...prev, [field]: value };
        // Validate using the new form data
        validateField(field, value, newFormData);
        return newFormData;
      });
    },
    [validateField]
  );

  const validateForm = useCallback((): boolean => {
    const fieldsToValidate: InviteAcceptFormField[] = [
      "password",
      "confirmPassword",
    ];

    const results = fieldsToValidate.map((field) =>
      validateField(field, formData[field], formData)
    );

    // Additional check for password match
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return false;
    }

    return results.every(Boolean);
  }, [formData, validateField]);

  const resetForm = useCallback((): void => {
    setFormData({
      password: "",
      confirmPassword: "",
      adminId: "",
    });
    setErrors({});
  }, []);

  const setAdminId = useCallback((adminId: string): void => {
    setFormData((prev) => ({ ...prev, adminId }));
  }, []);

  const isValid = useCallback(
    (field: InviteAcceptFormField): boolean => {
      return (
        !errors[field as keyof InviteAcceptFormErrors] &&
        Boolean(formData[field])
      );
    },
    [errors, formData]
  );

  const hasErrors = Object.values(errors).some(
    (error) => error !== null && error !== undefined
  );

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid,
    hasErrors,
    setAdminId,
  };
};
