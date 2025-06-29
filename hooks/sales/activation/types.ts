export interface ActivationType {
  label: string;
  value: string;
}

export interface OtpType {
  label: string;
  value: "email" | "sms";
}

export interface FormData {
  activationType: string;
  otpType: "email" | "sms" | "";
  email: string;
  phone: string;
}

export interface FormErrors {
  activationType?: string | null;
  otpType?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface SendOtpPayload {
  email?: string;
  phone?: string;
  activationType: string;
}

export type FormField = keyof FormData;
