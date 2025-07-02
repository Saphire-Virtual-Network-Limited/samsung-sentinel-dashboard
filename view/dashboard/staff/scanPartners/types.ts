export enum AccountStatus {
  KYC_1 = "KYC_1",
  KYC_2 = "KYC_2",
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface ScanPartnerRecord {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dob?: any;
  gender?: any;
  role: string;
  referralCode?: any;
  telephoneNumber: string;
  profile_picture?: any;
  otp?: any;
  tokenVersion: number;
  accountStatus: AccountStatus;
  isActive: boolean;
  otpExpiry?: any;
  createdAt: string;
  updatedAt: string;
  accountType: string;
  Mbe: any[];
}

export interface ScanPartnerData {
  data: ScanPartnerRecord[];
}
