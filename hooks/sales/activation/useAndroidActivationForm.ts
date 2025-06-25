import { useState, useCallback } from "react";
import { z } from "zod";
import { createSchema } from "@/lib";

interface AndroidActivationFormData {
  otp: string;
  salesStore: string;
  paymentOption: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  imei: string;
  deviceBrand: string;
  deviceName: string;
  sentinelPackage: string;
  devicePrice: string;
  sentinelBlockForm?: File;
  devicePurchaseReceipt?: File;
  sentinelReceipt?: File;
}

interface AndroidActivationFormErrors {
  /**
  deviceBrand?: string | null;
  deviceName?: string | null;
  salesStore?: string | null;
  sentinelBlockForm?: string | null;
  devicePurchaseReceipt?: string | null;
  sentinelReceipt?: string | null;
  otp?: string | null;
  paymentOption?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  imei?: string | null;
  devicePrice?: string | null;
  sentinelPackage?: string | null; */
  [key: string]: string | null | undefined;
}

type AndroidField = keyof AndroidActivationFormData;

interface UseAndroidActivationFormReturn {
  formData: AndroidActivationFormData;
  errors: AndroidActivationFormErrors;
  updateField: (field: AndroidField, value: string) => void;
  updateFile: (field: AndroidField, file: File) => void;
  validateForm: () => boolean;
  isValid: (field: AndroidField) => boolean;
  resetForm: () => void;
}

export const useAndroidActivationForm = (): UseAndroidActivationFormReturn => {
  const schemas: Record<AndroidField, z.ZodSchema<any>> = {
    otp: createSchema((val) => val.length > 0, "Enter the OTP"),
    salesStore: createSchema((val) => val.length > 0, "Select a sales store"),
    paymentOption: createSchema(
      (val) => val.length > 0,
      "Select a payment option"
    ),
    firstName: createSchema((val) => val.length > 0, "Enter first name"),
    lastName: createSchema((val) => val.length > 0, "Enter last name"),
    email: createSchema(
      (val) => /\S+@\S+\.\S+/.test(val),
      "Enter a valid email"
    ),
    phone: createSchema((val) => val.length >= 11, "Enter phone number"),
    address: createSchema((val) => val.length > 0, "Enter contact address"),
    country: createSchema((val) => val.length > 0, "Select a country"),
    imei: createSchema((val) => val.length >= 15, "Enter valid IMEI number"),
    deviceBrand: createSchema((val) => val.length > 0, "Select device brand"),
    deviceName: createSchema((val) => val.length > 0, "Select device name"),
    sentinelPackage: createSchema((val) => val.length > 0, "Select package"),

    devicePrice: createSchema(
      (val) => !isNaN(Number(val)),
      "Enter a valid price"
    ),
    sentinelBlockForm: createSchema(
      (val: any) => val instanceof File,
      "Upload block form"
    ),
    devicePurchaseReceipt: createSchema(
      (val: any) => val instanceof File,
      "Upload receipt"
    ),
    sentinelReceipt: createSchema(
      (val: any) => val instanceof File,
      "Upload sentinel receipt"
    ),
  };

  const [formData, setFormData] = useState<AndroidActivationFormData>({
    deviceBrand: "",
    deviceName: "",
    salesStore: "",
    paymentOption: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    imei: "",
    sentinelPackage: "",
    devicePrice: "",
    sentinelBlockForm: undefined,
    devicePurchaseReceipt: undefined,
    sentinelReceipt: undefined,
    otp: "",
  });

  const [errors, setErrors] = useState<AndroidActivationFormErrors>({});

  const updateField = useCallback((field: AndroidField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, []);

  const updateFile = useCallback((field: AndroidField, file: File) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    validateField(field, file);
  }, []);

  const validateField = useCallback(
    (field: AndroidField, value: any): boolean => {
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
    const fields: AndroidField[] = [
      "deviceBrand",
      "deviceName",
      "salesStore",
      "sentinelBlockForm",
      "devicePurchaseReceipt",
      "sentinelReceipt",
      "otp",
      "paymentOption",
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "country",
      "imei",
      "sentinelPackage",
      "devicePrice",
    ];

    const results = fields.map((field) =>
      validateField(field, formData[field])
    );
    return results.every(Boolean);
  }, [formData, validateField]);

  const isValid = useCallback(
    (field: AndroidField): boolean => {
      return !errors[field] && Boolean(formData[field]);
    },
    [errors, formData]
  );

  const resetForm = useCallback(() => {
    setFormData({
      deviceBrand: "",
      deviceName: "",
      salesStore: "",
      sentinelBlockForm: undefined,
      devicePurchaseReceipt: undefined,
      sentinelReceipt: undefined,
      otp: "",
      paymentOption: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      imei: "",
      sentinelPackage: "",
      devicePrice: "",
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    updateFile,
    validateForm,
    isValid,
    resetForm,
  };
};
