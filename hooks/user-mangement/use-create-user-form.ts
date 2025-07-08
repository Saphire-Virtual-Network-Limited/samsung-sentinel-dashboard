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
  };

  const [formData, setFormData] = useState<CreateUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    telephoneNumber: "",
    role: "",
  });

  const [errors, setErrors] = useState<CreateUserFormErrors>({});

  const updateField = useCallback(
    (field: CreateUserFormField, value: string): void => {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
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
        setErrors((prev: any) => ({ ...prev, [field]: null }));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev: any) => ({
            ...prev,
            [field]: error.errors[0]?.message || "Invalid value",
          }));
        } else {
          setErrors((prev: any) => ({
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
    const fieldsToValidate: CreateUserFormField[] = [
      "firstName",
      "lastName",
      "email",
      "telephoneNumber",
      "role",
    ];

    const results = fieldsToValidate.map((field) =>
      validateField(field, formData[field])
    );

    return results.every(Boolean);
  }, [formData, validateField]);

  const resetForm = useCallback((): void => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      telephoneNumber: "",
      role: "",
    });
    setErrors({});
  }, []);

  const isValid = useCallback(
    (field: CreateUserFormField): boolean => {
      return !errors[field] && Boolean(formData[field]);
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
