"use client";

import { FormField } from "@/components/reususables";
import { SelectField } from "@/components/reususables/form";
import { useAgentData } from "@/hooks/user-mangement/use-agent-data";
import { useCreateUserForm } from "@/hooks/user-mangement/use-create-user-form";
import { useNaijaStates } from "@/hooks/user-mangement/use-naija-states";
import { useUserCreator } from "@/hooks/user-mangement/use-user-creator";
import { getUserRole, useAuth } from "@/lib";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef } from "react";

import { GeneralSans_Meduim, cn } from "@/lib";

interface CreateUserViewProps {
  onSuccess?: () => void;
}

export default function CreateUserView({ onSuccess }: CreateUserViewProps) {
  const router = useRouter();
  const { userResponse } = useAuth();
  const role = getUserRole(userResponse?.data?.role);
  const { formData, errors, updateField, validateForm, resetForm, isValid } =
    useCreateUserForm();

  const { agentTypes, agentError } = useAgentData();
  const { createUser, isLoading, reset } = useUserCreator();
  const { states, getLgas } = useNaijaStates();

  const fieldRefs = useRef<
    Record<string, HTMLInputElement | HTMLSelectElement | null>
  >({});

  const handleFieldChange = (
    field: keyof typeof formData,
    value: string
  ): void => {
    updateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstInvalidField = Object.keys(errors).find(
        (key) => errors[key as keyof typeof errors]
      );
      if (firstInvalidField && fieldRefs.current[firstInvalidField]) {
        fieldRefs.current[firstInvalidField]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        fieldRefs.current[firstInvalidField]?.focus();
      }
      return;
    }

    try {
      const result = await createUser(formData);
      if (result?.success) {
        setTimeout(() => {
          resetForm();
          reset();
          onSuccess?.(); // Call the success callback
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleReset = () => {
    resetForm();
    reset();
  };

  const selectedStateLgas = formData.companyState
    ? getLgas(formData.companyState)
    : [];

  const handleStateChange = (value: string | string[]) => {
    const selectedState = Array.isArray(value) ? value[0] : value;
    handleFieldChange("companyState", selectedState);

    if (formData.companyLGA) {
      handleFieldChange("companyLGA", "");
    }
  };

  useEffect(() => {
    if (
      userResponse &&
      !hasPermission(role, "createDashboardUser", userResponse?.data?.email)
    ) {
      router.push("/404");
    }
  }, [userResponse, router, role]);

  return (
    <div>
      {agentError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800 text-sm">
            Using fallback agent types due to network error.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              size="sm"
              type="text"
              label="First Name"
              htmlFor="firstName"
              id="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(value) => handleFieldChange("firstName", value)}
              isInvalid={!!errors.firstName}
              errorMessage={errors.firstName || undefined}
              required
            />

            <FormField
              size="sm"
              type="text"
              label="Last Name"
              htmlFor="lastName"
              id="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(value) => handleFieldChange("lastName", value)}
              isInvalid={!!errors.lastName}
              errorMessage={errors.lastName || undefined}
              required
            />
          </div>

          <FormField
            size="sm"
            label="Email Address"
            htmlFor="email"
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(value) => handleFieldChange("email", value)}
            isInvalid={!!errors.email}
            errorMessage={errors.email || undefined}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              size="sm"
              label="Phone Number"
              htmlFor="telephoneNumber"
              id="telephoneNumber"
              type="tel"
              placeholder="Enter phone number"
              value={formData.telephoneNumber}
              onChange={(value) => handleFieldChange("telephoneNumber", value)}
              isInvalid={!!errors.telephoneNumber}
              errorMessage={errors.telephoneNumber || undefined}
              required
            />

            <SelectField
              label="User Role"
              htmlFor="role"
              id="role"
              placeholder="Select agent role"
              options={agentTypes}
              classNames={{
                base: "w-full min-w-0",
                listboxWrapper: "scrollbar-default sidebar-scroll ",
              }}
              onChange={(value) =>
                handleFieldChange(
                  "role",
                  Array.isArray(value) ? value[0] : value
                )
              }
              isInvalid={!!errors.role}
              errorMessage={errors.role || undefined}
              required
            />
          </div>
        </div>
        {formData.role == "SCAN_PARTNER" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Company Information
            </h3>
            <FormField
              size="sm"
              type="text"
              label="Company Name"
              htmlFor="companyName"
              id="companyName"
              placeholder="Enter company name"
              value={formData.companyName || ""}
              onChange={(value) => handleFieldChange("companyName", value)}
              isInvalid={!!errors.companyName}
              errorMessage={errors.companyName || undefined}
              required={formData.role == "SCAN_PARTNER"}
            />

            <FormField
              size="sm"
              type="text"
              label="Company Address"
              htmlFor="companyAddress"
              id="companyAddress"
              placeholder="Enter company address"
              value={formData.companyAddress || ""}
              onChange={(value) => handleFieldChange("companyAddress", value)}
              isInvalid={!!errors.companyAddress}
              errorMessage={errors.companyAddress || undefined}
              required={formData.role == "SCAN_PARTNER"}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                size="lg"
                label="State"
                htmlFor="companyState"
                id="companyState"
                placeholder="Select state"
                options={states}
                onChange={handleStateChange}
                isInvalid={!!errors.companyState}
                errorMessage={errors.companyState || undefined}
                classNames={{ base: "w-full min-w-0" }}
                required={formData.role == "SCAN_PARTNER"}
              />

              <FormField
                size="sm"
                type="text"
                label="City"
                htmlFor="companyCity"
                id="companyCity"
                placeholder="Enter city"
                value={formData.companyCity || ""}
                onChange={(value) => handleFieldChange("companyCity", value)}
                isInvalid={!!errors.companyCity}
                errorMessage={errors.companyCity || undefined}
                required={formData.role == "SCAN_PARTNER"}
              />

              <SelectField
                size="lg"
                label="Local Government Area"
                htmlFor="companyLGA"
                id="companyLGA"
                placeholder="Select LGA"
                classNames={{ base: "w-full min-w-0" }}
                options={selectedStateLgas}
                onChange={(value) =>
                  handleFieldChange(
                    "companyLGA",
                    Array.isArray(value) ? value[0] : value
                  )
                }
                isInvalid={!!errors.companyLGA}
                errorMessage={errors.companyLGA || undefined}
                disabled={!formData.companyState}
                required={formData.role == "SCAN_PARTNER"}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="ghost"
            onPress={handleReset}
            className={cn(
              "w-1/2 p-6 mb-0 bg-transparent font-medium text-base",
              GeneralSans_Meduim.className
            )}
            disabled={isLoading}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            className={cn(
              "w-1/2 p-6 mb-0 bg-primary text-white font-medium text-base",
              GeneralSans_Meduim.className
            )}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
