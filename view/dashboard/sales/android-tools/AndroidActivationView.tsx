"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Image,
} from "@heroui/react";
import {
  useAndroidActivationForm,
  useAndroidActivationData,
} from "@/hooks/sales/activation";
import { useMemo } from "react";
import { FormField, SelectField, OtpField } from "@/components/reususables";
import { cn, GeneralSans_Meduim } from "@/lib";

const AndroidActivationView = () => {
  const {
    formData,
    errors,
    updateField,
    updateFile,
    validateForm,
    isValid,
    resetForm,
  } = useAndroidActivationForm();

  const {
    deviceBrands,
    deviceNames,
    salesStores,
    isLoading,
    sentinelPackage,
    activationError,
    paymentOptions,
  } = useAndroidActivationData();
  const isSubmitDisabled = useMemo(
    () => !validateForm(),
    [formData, validateForm]
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Submit logic here — possibly sending a FormData payload
    try {
      console.log("Submitting activation:", formData);
    } catch (error) {
      console.error("Activation failed", error);
    }
  };

  const renderFileInput = (
    label: string,
    id: keyof typeof formData,
    file?: File
  ) => (
    <div className="space-y-2">
      <label
        htmlFor={String(id)!}
        className="text-sm font-medium text-default-700"
      >
        {label}
      </label>
      <input
        type="file"
        accept="image/*"
        id={id.toString()}
        className="block w-full text-sm file:border file:p-2"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) updateFile(id, selectedFile);
        }}
      />
      {file && (
        <div className="mt-2">
          <Image
            src={URL.createObjectURL(file)}
            alt={`${id.toString()} preview`}
            width={180}
            height={100}
            className="rounded-lg object-cover border border-default-300"
          />
        </div>
      )}
    </div>
  );

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex flex-col items-start px-6 pt-6">
        <h2 className="text-2xl font-bold">Android Activation</h2>
        <p className="text-small text-default-500">
          Fill in device and sales details to activate Sentinel
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <OtpField
            label="Activation Otp"
            reqValue="*"
            htmlFor="otp"
            id="otp"
            length={4}
            isInvalid={!!errors.otp}
            errorMessage={errors.otp || undefined}
            size="sm"
            placeholder="Input your email"
            onChange={(val) =>
              updateField("otp", Array.isArray(val) ? val[0] : val)
            }
            value={formData.otp}
            required
          />
          <SelectField
            size="lg"
            label="Sales Store"
            htmlFor="salesStore"
            id="salesStore"
            placeholder="Select Store"
            options={salesStores}
            onChange={(val) =>
              updateField("salesStore", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.salesStore}
            errorMessage={errors.salesStore || undefined}
            defaultSelectedKeys={
              formData.salesStore ? [formData.salesStore] : []
            }
            required
            classNames={{ base: "w-full" }}
          />
          <SelectField
            size="lg"
            label="Payment Option"
            htmlFor="paymentOptions"
            id="paymentOptions"
            placeholder="Select Payment Option"
            options={paymentOptions}
            onChange={(val) =>
              updateField("paymentOption", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.paymentOption}
            errorMessage={errors.paymentOption || undefined}
            defaultSelectedKeys={
              formData.paymentOption ? [formData.paymentOption] : []
            }
            required
            classNames={{ base: "w-full" }}
          />
          <FormField
            type="text"
            size="lg"
            label="First Name"
            htmlFor="firstName"
            id="firstName"
            placeholder="Enter First Name"
            value={formData.firstName}
            onChange={(val) =>
              updateField("firstName", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.firstName}
            errorMessage={errors.firstName || undefined}
            required
          />
          <FormField
            type="text"
            size="lg"
            label="Last Name"
            htmlFor="lastName"
            id="lastName"
            placeholder="Enter Last Name"
            value={formData.lastName}
            onChange={(val) =>
              updateField("lastName", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName || undefined}
            required
          />
          <FormField
            type="email"
            size="lg"
            label="Email"
            htmlFor="email"
            id="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={(val) =>
              updateField("email", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.email}
            errorMessage={errors.email || undefined}
            required
          />
          <FormField
            type="number"
            size="lg"
            label="Phone Number"
            htmlFor="phone"
            id="phone"
            placeholder="Enter Phone Number"
            value={formData.phone}
            onChange={(val) =>
              updateField("phone", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.phone}
            errorMessage={errors.phone || undefined}
            required
          />
          <FormField
            type="text"
            size="lg"
            label="Address"
            htmlFor="address"
            id="address"
            placeholder="Enter Address"
            value={formData.address}
            onChange={(val) =>
              updateField("address", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.address}
            errorMessage={errors.address || undefined}
            required
          />
          <FormField
            type="text"
            size="lg"
            label="Country"
            htmlFor="country"
            id="country"
            placeholder="Enter Country"
            value={formData.country}
            onChange={(val) =>
              updateField("country", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.country}
            errorMessage={errors.country || undefined}
            required
          />
          <FormField
            type="number"
            size="lg"
            label="IMEI"
            htmlFor="imei"
            id="imei"
            placeholder="Enter IMEI"
            value={formData.imei}
            onChange={(val) =>
              updateField("imei", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.imei}
            errorMessage={errors.imei || undefined}
            required
          />

          <SelectField
            size="lg"
            label="Sentinel Package"
            htmlFor="sentinelPackage"
            id="sentinelPackage"
            placeholder="Select Activation Type"
            options={sentinelPackage}
            onChange={(val) =>
              updateField("sentinelPackage", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.sentinelPackage}
            errorMessage={errors.sentinelPackage || undefined}
            defaultSelectedKeys={
              formData.sentinelPackage ? [formData.sentinelPackage] : []
            }
            required
            classNames={{ base: "w-full" }}
          />

          <SelectField
            size="lg"
            label="Device Brand"
            htmlFor="deviceBrand"
            id="deviceBrand"
            placeholder="Select Brand"
            options={deviceBrands}
            onChange={(val) =>
              updateField("deviceBrand", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.deviceBrand}
            errorMessage={errors.deviceBrand || undefined}
            defaultSelectedKeys={
              formData.deviceBrand ? [formData.deviceBrand] : []
            }
            required
            classNames={{ base: "w-full" }}
          />

          <SelectField
            size="lg"
            label="Device Name"
            htmlFor="deviceName"
            id="deviceName"
            placeholder="Select Device"
            options={deviceNames}
            onChange={(val) =>
              updateField("deviceName", Array.isArray(val) ? val[0] : val)
            }
            isInvalid={!!errors.deviceName}
            errorMessage={errors.deviceName || undefined}
            defaultSelectedKeys={
              formData.deviceName ? [formData.deviceName] : []
            }
            required
            classNames={{ base: "w-full" }}
          />

          {renderFileInput(
            "Sentinel Block Form",
            "sentinelBlockForm",
            formData.sentinelBlockForm
          )}
          {renderFileInput(
            "Device Purchase Receipt",
            "devicePurchaseReceipt",
            formData.devicePurchaseReceipt
          )}
          {renderFileInput(
            "Sentinel Receipt",
            "sentinelReceipt",
            formData.sentinelReceipt
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            className={cn(
              "w-full font-bold mt-4 text-white",
              GeneralSans_Meduim.className
            )}
            isDisabled={isSubmitDisabled}
          >
            Activate Now
          </Button>

          {activationError && (
            <p className="text-tiny text-warning">
              Using fallback device options due to network error.
            </p>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export default AndroidActivationView;
