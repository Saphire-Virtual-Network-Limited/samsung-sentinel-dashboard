export interface AgentType {
  label: string;
  value: string;
}

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


export interface clusterSupervisor {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	clusterId: number;
	clusterName?: string;
}

export interface stateManager {     
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	stateName: string;
}

export interface stateSupervisor {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	stateName: string;
}