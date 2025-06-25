import { useState, useCallback } from "react";
import useSWRMutation from "swr/mutation";
import type { OtpResponse, SendOtpPayload } from "./types";
interface UseOtpSenderReturn {
  sendEmail: (email: string, activationType: string) => Promise<OtpResponse>;
  sendSms: (phone: string, activationType: string) => Promise<OtpResponse>;
  isLoading: boolean;
  isEmailLoading: boolean;
  isSmsLoading: boolean;
  error: Error | null;
  emailError: Error | undefined;
  smsError: Error | undefined;
  success: OtpResponse | null;
  emailSuccess: OtpResponse | undefined;
  smsSuccess: OtpResponse | undefined;
  lastSentType: "email" | "sms" | null;
  reset: () => void;
}

const sendOtpRequest = async (
  url: string,
  { arg }: { arg: SendOtpPayload }
): Promise<OtpResponse> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: Failed to send OTP`
    );
  }

  return response.json();
};

export const useOtpSender = (): UseOtpSenderReturn => {
  const [lastSentType, setLastSentType] = useState<"email" | "sms" | null>(
    null
  );

  const {
    trigger: sendEmailOtp,
    isMutating: isEmailLoading,
    error: emailError,
    data: emailResponse,
    reset: resetEmail,
  } = useSWRMutation<OtpResponse, Error, string, SendOtpPayload>(
    "/api/send-email-otp",
    sendOtpRequest
  );

  const {
    trigger: sendSmsOtp,
    isMutating: isSmsLoading,
    error: smsError,
    data: smsResponse,
    reset: resetSms,
  } = useSWRMutation<OtpResponse, Error, string, SendOtpPayload>(
    "/api/send-sms-otp",
    sendOtpRequest
  );

  const sendEmail = useCallback(
    async (email: string, activationType: string): Promise<OtpResponse> => {
      if (!email || !activationType) {
        throw new Error("Email and activation type are required");
      }

      setLastSentType("email");
      return sendEmailOtp({ email, activationType });
    },
    [sendEmailOtp]
  );

  const sendSms = useCallback(
    async (phone: string, activationType: string): Promise<OtpResponse> => {
      if (!phone || !activationType) {
        throw new Error("Phone number and activation type are required");
      }

      setLastSentType("sms");
      return sendSmsOtp({ phone, activationType });
    },
    [sendSmsOtp]
  );

  const reset = useCallback((): void => {
    setLastSentType(null);
    resetEmail();
    resetSms();
  }, [resetEmail, resetSms]);

  return {
    sendEmail,
    sendSms,
    isLoading: isEmailLoading || isSmsLoading,
    isEmailLoading,
    isSmsLoading,
    error: emailError || smsError || null,
    emailError,
    smsError,
    success: emailResponse || smsResponse || null,
    emailSuccess: emailResponse,
    smsSuccess: smsResponse,
    lastSentType,
    reset,
  };
};
