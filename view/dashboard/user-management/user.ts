// @/view/dashboard/user-management/user.ts
// Updated to include the new company fields

export interface AgentType {
  label: string;
  value: string;
}

// Updated to include company fields
export interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  telephoneNumber: string;
  role: string;
  companyName?: string;
  companyAddress?: string;
  companyState?: string;
  companyCity?: string;
  companyLGA?: string;
}

// Updated to include company field errors
export interface CreateUserFormErrors {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  telephoneNumber?: string | null;
  role?: string | null;
  companyName?: string | null;
  companyAddress?: string | null;
  companyState?: string | null;
  companyCity?: string | null;
  companyLGA?: string | null;
}

export type CreateUserFormField = keyof CreateUserFormData;

export interface InviteAcceptFormData {
  password: string;
  confirmPassword: string;
  adminId: string;
}

export interface InviteAcceptFormErrors {
  password?: string | null;
  confirmPassword?: string | null;
}

export type InviteAcceptFormField = keyof InviteAcceptFormData;

export interface CreateUserResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
}
