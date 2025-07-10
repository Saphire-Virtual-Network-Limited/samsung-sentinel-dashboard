"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import {
  CreateUserFormData,
  CreateUserFormErrors,
  CreateUserFormField,
} from "@/view/dashboard/user-management/user";

interface UseCreateUserFormReturn {
  formData: CreateUserFormData;
  errors: CreateUserFormErrors;
  updateField: (field: CreateUserFormField, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  isValid: (field: CreateUserFormField) => boolean;
  hasErrors: boolean;
}

const createSchema = (
  validator: (value: string) => boolean,
  message: string
) => {
  return z.string().refine(validator, { message });
};

export const useCreateUserForm = (): UseCreateUserFormReturn => {
  const schemas: Record<CreateUserFormField, z.ZodSchema<string>> = {
    firstName: createSchema(
      (value: string): boolean => value.trim().length >= 2,
      "First name must be at least 2 characters"
    ),
    lastName: createSchema(
      (value: string): boolean => value.trim().length >= 2,
      "Last name must be at least 2 characters"
    ),
    email: createSchema(
      (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Please enter a valid email address"
    ),
    telephoneNumber: createSchema(
      (value: string): boolean => /^\d{11}$/.test(value.replace(/\s/g, "")),
      "Phone number must be exactly 11 digits"
    ),
    role: createSchema(
      (value: string): boolean => value.length > 0,
      "Please select a role"
    ),
    // Optional fields - only validate if they have values
    companyName: createSchema(
      (value: string): boolean =>
        value.trim().length === 0 || value.trim().length >= 2,
      "Company name must be at least 2 characters"
    ),
    companyAddress: createSchema(
      (value: string): boolean =>
        value.trim().length === 0 || value.trim().length >= 5,
      "Company address must be at least 5 characters"
    ),
    companyState: createSchema(
      (value: string): boolean => true, // Always valid since it's optional
      ""
    ),
    companyCity: createSchema(
      (value: string): boolean =>
        value.trim().length === 0 || value.trim().length >= 2,
      "City must be at least 2 characters"
    ),
    companyLGA: createSchema(
      (value: string): boolean => true, // Always valid since it's optional
      ""
    ),
  };

  const [formData, setFormData] = useState<CreateUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    telephoneNumber: "",
    role: "",
    companyName: "",
    companyAddress: "",
    companyState: "",
    companyCity: "",
    companyLGA: "",
  });

  const [errors, setErrors] = useState<CreateUserFormErrors>({});

  const updateField = useCallback(
    (field: CreateUserFormField, value: string): void => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    },
    []
  );

  const validateField = useCallback(
    (field: CreateUserFormField, value: string): boolean => {
      try {
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
    []
  );

  const validateForm = useCallback((): boolean => {
    // Required fields
    const requiredFields: CreateUserFormField[] = [
      "firstName",
      "lastName",
      "email",
      "telephoneNumber",
      "role",
    ];

    // Optional fields - only validate if they have values
    const optionalFields: CreateUserFormField[] = [
      "companyName",
      "companyAddress",
      "companyState",
      "companyCity",
      "companyLGA",
    ];

    // Validate required fields
    const requiredResults = requiredFields.map((field) =>
      validateField(field, formData[field] || "")
    );

    // Validate optional fields only if they have values
    const optionalResults = optionalFields.map((field) => {
      const value = formData[field];
      if (value && value.trim().length > 0) {
        return validateField(field, value);
      }
      return true; // Skip validation for empty optional fields
    });

    return [...requiredResults, ...optionalResults].every(Boolean);
  }, [formData, validateField]);

  const resetForm = useCallback((): void => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      telephoneNumber: "",
      role: "",
      companyName: "",
      companyAddress: "",
      companyState: "",
      companyCity: "",
      companyLGA: "",
    });
    setErrors({});
  }, []);

  const isValid = useCallback(
    (field: CreateUserFormField): boolean => {
      // For required fields, check both no errors and has value
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "telephoneNumber",
        "role",
      ];

      if (requiredFields.includes(field)) {
        return !errors[field] && Boolean(formData[field]);
      }

      // For optional fields, only check for errors if field has value
      const fieldValue = formData[field];
      if (!fieldValue || fieldValue.trim().length === 0) {
        return true; // Empty optional field is valid
      }

      return !errors[field];
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
  };
};
