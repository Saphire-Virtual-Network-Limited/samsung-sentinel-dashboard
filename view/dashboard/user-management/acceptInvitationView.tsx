"use client";

import { PasswordField } from "@/components/reususables";
import { Separator } from "@/components/ui/separator";
import { useInviteAcceptor } from "@/hooks/user-mangement/use-invite-acceptor";
import { useInviteForm } from "@/hooks/user-mangement/use-invite-form";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { ArrowRight, CheckCircle, UserCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
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
    if (success) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }, [success, router]);

  const handlePasswordChange = (value: string) => {
    updateField("password", value);
  };

  const handleConfirmPasswordChange = (value: string) => {
    updateField("confirmPassword", value);
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
              <PasswordField
                PasswordText="Password"
                placheolderText="Enter your password"
                handlePasswordChange={handlePasswordChange}
                showForgotPassword={false}
                passwordError={errors.password!}
              />

              <PasswordField
                PasswordText="Confirm Password"
                placheolderText="Confirm your password"
                handlePasswordChange={handleConfirmPasswordChange}
                showForgotPassword={false}
                passwordError={errors.confirmPassword!}
              />

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
                {/** 
                <Button
                  type="button"
                  variant="ghost"
                  onPress={handleReset}
                  className="w-full bg-transparent"
                  disabled={isLoading}
                >
                  Reset Form
                </Button>
                */}
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
