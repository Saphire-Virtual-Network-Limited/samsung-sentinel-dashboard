"use client";
import React from "react";
import { Card, CardHeader, CardBody, Button, Divider } from "@heroui/react";
import {
  useActivationForm,
  useActivationData,
  useOtpSender,
} from "@/hooks/sales/activation";
import { FormField, SelectField } from "@/components/reususables";
import { cn, GeneralSans_Meduim } from "@/lib";

const ActivationOtpView = () => {
  const {
    formData,
    errors,
    updateField,
    validateForm,
    clearContactFields,
    isValid,
  } = useActivationForm();
  const { activationTypes, otpTypes, activationError } = useActivationData();
  const {
    sendEmail,
    sendSms,
    isEmailLoading,
    isSmsLoading,
    emailError,
    smsError,
    emailSuccess,
    smsSuccess,
  } = useOtpSender();

  const handleActivationTypeChange = (value: string | string[]) => {
    const selected = Array.isArray(value) ? value[0] : value;
    updateField("activationType", selected);
  };

  const handleOtpTypeChange = (value: string | string[]) => {
    const selected = Array.isArray(value) ? value[0] : value;
    updateField("otpType", selected);
    clearContactFields();
  };

  const handleEmailChange = (value: string) => {
    updateField("email", value);
  };

  const handlePhoneChange = (value: string) => {
    updateField("phone", value);
  };

  const handleSendEmail = async () => {
    if (!isValid("email")) return;
    try {
      await sendEmail(formData.email, formData.activationType);
    } catch (error) {
      console.error("Error sending email OTP:", error);
    }
  };

  const handleSendSms = async () => {
    if (!isValid("phone")) return;
    try {
      await sendSms(formData.phone, formData.activationType);
    } catch (error) {
      console.error("Error sending SMS OTP:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (formData.otpType === "email") await handleSendEmail();
    else if (formData.otpType === "sms") await handleSendSms();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex flex-col items-start px-6 pt-6">
        <h2 className="text-2xl font-bold">Activation OTP</h2>
        <p className="text-small text-default-500">
          Select activation type and send OTP verification
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <SelectField
            size="lg"
            label="Select Activation Type"
            htmlFor="activation-type"
            id="activation-type"
            placeholder="Select Activation Type"
            options={activationTypes}
            onChange={handleActivationTypeChange}
            isInvalid={!!errors.activationType}
            errorMessage={errors.activationType || undefined}
            required
            classNames={{
              base: "w-full",
            }}
            defaultSelectedKeys={
              formData.activationType ? [formData.activationType] : []
            }
          />

          <SelectField
            label="Select OTP Type"
            htmlFor="otp-type"
            id="otp-type"
            placeholder="Select OTP Type"
            options={otpTypes}
            onChange={handleOtpTypeChange}
            isInvalid={!!errors.otpType}
            errorMessage={errors.otpType || undefined}
            required
            defaultSelectedKeys={formData.otpType ? [formData.otpType] : []}
            classNames={{
              base: "w-full",
            }}
          />

          {formData.otpType === "email" && (
            <div className="space-y-4 ">
              <FormField
                label="Enter your email"
                reqValue="*"
                htmlFor="email"
                type="email"
                id="email"
                variant="bordered"
                isInvalid={!!errors.email}
                errorMessage={errors.email || undefined}
                size="sm"
                placeholder="Input your email"
                onChange={handleEmailChange}
                value={formData.email}
                required
              />
              <Button
                type="button"
                color="danger"
                size="lg"
                className="w-full font-bold"
                isDisabled={!isValid("email") || isEmailLoading}
                isLoading={isEmailLoading}
                onPress={handleSendEmail}
              >
                {isEmailLoading ? "SENDING..." : "SEND EMAIL"}
              </Button>
              {emailSuccess && (
                <p className="text-tiny text-success">
                  OTP sent successfully to your email!
                </p>
              )}
              {emailError && (
                <p className="text-tiny text-danger">
                  Failed to send email OTP. Please try again.
                </p>
              )}
            </div>
          )}

          {formData.otpType === "sms" && (
            <div className="space-y-4">
              <FormField
                label="Enter your phone"
                reqValue="*"
                htmlFor="phone"
                type="tel"
                id="phone"
                variant="bordered"
                isInvalid={!!errors.phone}
                errorMessage={errors.phone || undefined}
                size="sm"
                placeholder="Input your phone number"
                onChange={handlePhoneChange}
                value={formData.phone}
                required
              />
              <Button
                //   size="lg"
                isDisabled={!isValid("phone") || isSmsLoading}
                isLoading={isSmsLoading}
                className={cn(
                  "w-full p-6 mb-0 bg-primary text-white font-medium text-base",
                  GeneralSans_Meduim.className
                )}
                size="md"
                radius="lg"
                onPress={handleSendSms}
                type="submit"
              >
                {isSmsLoading ? "SENDING..." : "SEND SMS"}
              </Button>
              {smsSuccess && (
                <p className="text-tiny text-success">
                  OTP sent successfully to your phone!
                </p>
              )}
              {smsError && (
                <p className="text-tiny text-danger">
                  Failed to send SMS OTP. Please try again.
                </p>
              )}
            </div>
          )}

          {activationError && (
            <p className="text-tiny text-warning">
              Using fallback activation types due to network error.
            </p>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export default ActivationOtpView;
