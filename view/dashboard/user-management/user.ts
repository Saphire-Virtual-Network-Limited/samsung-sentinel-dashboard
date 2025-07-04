export interface AgentType {
  label: string
  value: string
}

export interface CreateUserFormData {
  firstName: string
  lastName: string
  email: string
  telephoneNumber: string
  role: string
}

export interface CreateUserFormErrors {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  telephoneNumber?: string | null
  role?: string | null
}

export type CreateUserFormField = keyof CreateUserFormData

export interface InviteAcceptFormData {
  password: string
  confirmPassword: string
  adminId: string
}

export interface InviteAcceptFormErrors {
  password?: string | null
  confirmPassword?: string | null
}

export type InviteAcceptFormField = keyof InviteAcceptFormData

export interface CreateUserResponse {
  success: boolean
  message: string
  userId?: string
}

export interface AcceptInviteResponse {
  success: boolean
  message: string
}
