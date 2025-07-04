"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/reususables";
import { useInviteForm } from "@/hooks/user-mangement/use-invite-form";
import { useInviteAcceptor } from "@/hooks/user-mangement/use-invite-acceptor";
import {
  CheckCircle,
  AlertCircle,
  UserCheck,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userid as string;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid,
    setAdminId,
  } = useInviteForm();

  const { acceptInvite, isLoading, success, error } = useInviteAcceptor();

  useEffect(() => {
    if (userId) {
      setAdminId(userId);
    }
  }, [userId, setAdminId]);

  useEffect(() => {
    if (success?.success) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }, [success, router]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    updateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await acceptInvite(formData);
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  const handleReset = () => {
    resetForm();
    if (userId) {
      setAdminId(userId);
    }
  };

  // Success state UI
  if (success?.success) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardBody className="pt-12 pb-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Account Activated!
                  </h1>
                  <p className="text-gray-600">
                    Your account has been successfully activated.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Redirecting to login</span>
                  {isRedirecting && (
                    <ArrowRight className="h-4 w-4 animate-pulse" />
                  )}
                </div>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                  disabled={isRedirecting}
                >
                  {isRedirecting ? "Redirecting..." : "Go to Login"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardBody className="pt-12 pb-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Activation Failed
                  </h1>
                  <p className="text-gray-600">
                    There was an error activating your account.
                  </p>
                  <p className="text-sm text-red-600">{error.message}</p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Main form UI
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Accept Invitation
                </h1>
                <p className="text-gray-600">
                  Set up your password to complete registration
                </p>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardBody className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <FormField
                  size="sm"
                  label="Password"
                  htmlFor="password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(value) => handleFieldChange("password", value)}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password || undefined}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <FormField
                  size="sm"
                  label="Confirm Password"
                  htmlFor="confirmPassword"
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(value) =>
                    handleFieldChange("confirmPassword", value)
                  }
                  isInvalid={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword || undefined}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="text-xs space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Must match confirmation password</li>
                </ul>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading ||
                    !isValid("password") ||
                    !isValid("confirmPassword")
                  }
                >
                  {isLoading ? "Activating Account..." : "Activate Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="w-full bg-transparent"
                  disabled={isLoading}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
