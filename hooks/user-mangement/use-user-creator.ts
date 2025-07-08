"use client";

import { useState, useCallback } from "react";
import { inviteAdmin } from "@/lib";
import { showToast } from "@/lib";
import type {
  CreateUserFormData,
  CreateUserResponse,
} from "@/view/dashboard/user-management/user";
interface UseUserCreatorReturn {
  createUser: (
    userData: CreateUserFormData
  ) => Promise<CreateUserResponse | null>;
  isLoading: boolean;
  error: Error | null;
  success: CreateUserResponse | null;
  reset: () => void;
}

export const useUserCreator = (): UseUserCreatorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<CreateUserResponse | null>(null);

  const createUserHandler = useCallback(
    async (
      userData: CreateUserFormData
    ): Promise<CreateUserResponse | null> => {
      if (
        !userData.firstName ||
        !userData.lastName ||
        !userData.email ||
        !userData.role
      ) {
        const errorMsg = "All required fields must be filled";
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
        const result = await inviteAdmin(userData);
        setSuccess(result);

        if (result) {
          showToast({
            type: "success",
            message: `User created successfully! Invitation sent to ${userData.email}`,
            duration: 5000,
          });
        } else {
          showToast({
            type: "error",
            message: result.message || "Failed to create user",
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
          message: error.message || "Failed to create user",
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
    createUser: createUserHandler,
    isLoading,
    error,
    success,
    reset,
  };
};
