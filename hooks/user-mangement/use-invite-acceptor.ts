"use client";

import { useState, useCallback } from "react";
import { acceptAdminInvite } from "@/lib";
import { showToast } from "@/lib";
import {
  AcceptInviteResponse,
  InviteAcceptFormData,
} from "../../view/dashboard/user-management/user";

interface UseInviteAcceptorReturn {
  acceptInvite: (
    inviteData: InviteAcceptFormData
  ) => Promise<AcceptInviteResponse | null>;
  isLoading: boolean;
  error: Error | null;
  success: AcceptInviteResponse | null;
  reset: () => void;
}

export const useInviteAcceptor = (): UseInviteAcceptorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<AcceptInviteResponse | null>(null);

  const acceptInviteHandler = useCallback(
    async (
      inviteData: InviteAcceptFormData
    ): Promise<AcceptInviteResponse | null> => {
      if (
        !inviteData.password ||
        !inviteData.confirmPassword ||
        !inviteData.adminId
      ) {
        const errorMsg = "All fields are required";
        setError(new Error(errorMsg));
        showToast({
          type: "error",
          message: errorMsg,
          duration: 5000,
        });
        return null;
      }

      if (inviteData.password !== inviteData.confirmPassword) {
        const errorMsg = "Passwords do not match";
        setError(new Error(errorMsg));
        showToast({
          type: "error",
          message: errorMsg,
          duration: 5000,
        });
        return null;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const result = await acceptAdminInvite({
          password: inviteData.password,
          adminid: inviteData.adminId,
          confirmPassword: inviteData.confirmPassword,
        });

        setSuccess(result);

        {
          showToast({
            type: "success",
            message: "Account activated successfully! Redirecting to login...",
            duration: 5000,
          });
        }

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Unknown error occurred");
        setError(error);
        showToast({
          type: "error",
          message: error.message || "Failed to accept invitation",
          duration: 5000,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
  }, []);

  return {
    acceptInvite: acceptInviteHandler,
    isLoading,
    error,
    success,
    reset,
  };
};
