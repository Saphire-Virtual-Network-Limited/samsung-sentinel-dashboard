"use client";

import { FormField } from "@/components/reususables";
import { SelectField } from "@/components/reususables/form";
import { Separator } from "@/components/ui/separator";
import { useAgentData } from "@/hooks/user-mangement/use-agent-data";
import { useCreateUserForm } from "@/hooks/user-mangement/use-create-user-form";
import { useNaijaStates } from "@/hooks/user-mangement/use-naija-states";
import { useUserCreator } from "@/hooks/user-mangement/use-user-creator";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { AlertCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";

import { GeneralSans_Meduim, cn } from "@/lib";

export default function CreateUserPage() {
  const router = useRouter();
  const { formData, errors, updateField, validateForm, resetForm, isValid } =
    useCreateUserForm();

  const { agentTypes, agentError } = useAgentData();
  const { createUser, isLoading, reset } = useUserCreator();
  const { states, getLgas } = useNaijaStates();

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    updateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await createUser(formData);
      if (result?.success) {
        // Reset form after successful creation
        setTimeout(() => {
          resetForm();
          reset();
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

  // Get LGAs for selected state
  const selectedStateLgas = formData.companyState
    ? getLgas(formData.companyState)
    : [];

  // Handle state change
  const handleStateChange = (value: string | string[]) => {
    const selectedState = Array.isArray(value) ? value[0] : value;
    handleFieldChange("companyState", selectedState);

    // Clear LGA when state changes
    if (formData.companyLGA) {
      handleFieldChange("companyLGA", "");
    }

    // Note: City remains as free text input since the package doesn't provide cities
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Agent
                </h1>
                <p className="text-gray-600">
                  Add a new team member and send them an invitation
                </p>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardBody className="pt-6">
            {agentError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm">
                  Using fallback agent types due to network error.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
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

                <FormField
                  size="sm"
                  label="Phone Number"
                  htmlFor="telephoneNumber"
                  id="telephoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.telephoneNumber}
                  onChange={(value) =>
                    handleFieldChange("telephoneNumber", value)
                  }
                  isInvalid={!!errors.telephoneNumber}
                  errorMessage={errors.telephoneNumber || undefined}
                  required
                />

                <SelectField
                  label="Agent Role"
                  htmlFor="role"
                  id="role"
                  placeholder="Select agent role"
                  options={agentTypes}
                  classNames={{ base: "w-full min-w-0" }}
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

              {/* Company Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Company Information (Optional)
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
                />

                <FormField
                  size="sm"
                  type="text"
                  label="Company Address"
                  htmlFor="companyAddress"
                  id="companyAddress"
                  placeholder="Enter company address"
                  value={formData.companyAddress || ""}
                  onChange={(value) =>
                    handleFieldChange("companyAddress", value)
                  }
                  isInvalid={!!errors.companyAddress}
                  errorMessage={errors.companyAddress || undefined}
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
                  />

                  <FormField
                    size="sm"
                    type="text"
                    label="City"
                    htmlFor="companyCity"
                    id="companyCity"
                    placeholder="Enter city"
                    value={formData.companyCity || ""}
                    onChange={(value) =>
                      handleFieldChange("companyCity", value)
                    }
                    isInvalid={!!errors.companyCity}
                    errorMessage={errors.companyCity || undefined}
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
                  />
                </div>
              </div>

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
                  disabled={
                    isLoading ||
                    !isValid("firstName") ||
                    !isValid("lastName") ||
                    !isValid("email") ||
                    !isValid("telephoneNumber") ||
                    !isValid("role")
                  }
                >
                  {isLoading ? "Creating..." : "Create Agent"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
