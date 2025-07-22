export enum AccountStatus {
  SUSPENDED = "SUSPENDED",
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
}

export interface Admin {
  adminid: string;
  userid: string;
  inviteStatus: AccountStatus;
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string | null;
  gender: string | null;
  role: string;
  referralCode: string | null;
  telephoneNumber: string;
  profile_picture: string | null;
  accountStatus: AccountStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accountType: string;
  companyName: string | null;
  companyAddress: string | null;
  companyState: string | null;
  companyCity: string | null;
  companyLGA: string | null;
  bvn: string | null;
  bvnPhoneNumber: string | null;
  title: string | null;
  state: string | null;
  city: string | null;
  Admins?: Admin | null;
}

export interface UsersResponse {
  statusCode: number;
  statusType: string;
  message: string;
  data: User[];
  responseTime: string;
}
