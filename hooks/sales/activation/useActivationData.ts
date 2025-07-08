import useSWR from "swr";
import type { ActivationType, OtpType } from "./types";

interface UseActivationDataReturn {
  activationTypes: ActivationType[];
  otpTypes: OtpType[];
  activationError: Error | undefined;
  isLoading: boolean;
}

const fetcher = async (url: string): Promise<ActivationType[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

export const fallbackActivationTypes: ActivationType[] = [
  { label: "Android SLD (Screen And Liquid Damage)", value: "androidSLD" },
  { label: "Android SAP (Sentinel Anti-Theft)", value: "androidSAP" },
  {
    label: "Android SAP Lite (Sentinel Anti-Theft Lite)",
    value: "androidSAPLite",
  },
  { label: "Sentiflex Android Device Loan", value: "androidDeviceLoan" },
  { label: "RaaS (Repair as a Service)", value: "RaaS" },
  { label: "iOS SLD (iPhone Screen And Liquid Damage)", value: "iosSLD" },
  { label: "Sentiflex iOS Device Loan", value: "iosDeviceLoan" },
];

export const useActivationData = (): UseActivationDataReturn => {
  const otpTypes: OtpType[] = [
    { label: "Email OTP", value: "email" },
    { label: "SMS OTP", value: "sms" },
  ];

  const {
    data: activationTypes,
    error: activationError,
    isLoading,
  } = useSWR<ActivationType[], Error>("/api/activation-types", fetcher, {
    fallbackData: fallbackActivationTypes,
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });

  return {
    activationTypes: activationTypes || fallbackActivationTypes,
    otpTypes,
    activationError,
    isLoading,
  };
};
