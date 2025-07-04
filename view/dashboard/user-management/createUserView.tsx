"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/reususables";
import { SelectField } from "@/components/reususables/form";
import { useCreateUserForm } from "@/hooks/user-mangement/use-create-user-form";
import { useAgentData } from "@/hooks/user-mangement/use-agent-data";
import { useUserCreator } from "@/hooks/user-mangement/use-user-creator";
import { AlertCircle, UserPlus } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const { formData, errors, updateField, validateForm, resetForm, isValid } =
    useCreateUserForm();

  const { agentTypes, agentError } = useAgentData();
  const { createUser, isLoading, reset } = useUserCreator();

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

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-2xl mx-auto">
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

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 bg-transparent"
                  disabled={isLoading}
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
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
