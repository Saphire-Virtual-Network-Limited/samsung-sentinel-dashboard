export interface MbeKyc {
  kycId: string;
  mbeId: string;
  gender: string;
  houseNumber: string;
  streetAddress: string;
  landMark: string;
  localGovernment: string;
  state: string;
  city: string;
  fullAddress: string;
  mbeAccountDetailsId?: any;
  mbeGuarantorId?: any;
  createdAt: string;
  updatedAt: string;
  channel: string;
  addressStatus?: AccountStatus;
}

export interface MbeGuarantor {
  guarantorid: string;
  mbeId: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorAddress: string;
  guarantorRelationship: string;
  guarantorStatus: string;
  createdAt: string;
  updatedAt: string;
}
export enum AccountStatus {
  KYC_1 = "KYC_1",
  KYC_2 = "KYC_2",
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface AgentRecord {
  title: string;
  createdAt: string;
  mbeId: string;
  mbe_old_id?: any;
  updatedAt: string;
  firstname: string;
  lastname: string;
  phone: string;
  state?: string;
  city?: string;
  username: string;
  accountStatus?: AccountStatus;
  bvn: string;
  bvnPhoneNumber: string;
  channel: string;
  dob: string;
  email: string;
  isActive: boolean;
  imagePublicId: string;
  imageUrl: string;
  role: string;
  resetOtp?: any;
  resetOtpExpiry?: any;
  MbeKyc: MbeKyc;
  MbeAccountDetails?: any;
  MbeGuarantor: MbeGuarantor[];
  storesNew?: mainStoreNew;
  customersCount: number;
  userId?: string;
}

export interface Meta {
  totalAgents: number;
  totalCustomers: number;
}

export interface AgentsData {
  data: AgentRecord[];
  meta: Meta;
}

export interface StoreNew {
  storeOldId: number;
  storeName: string;
  city: string;
  state: string;
  region?: any;
  address: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  phoneNumber: string;
  storeEmail: string;
  longitude: number;
  latitude: number;
  clusterId: number;
  partner: string;
  storeOpen: string;
  storeClose: string;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  isArchived: boolean;
  storeErpId: string;
  channel: string;
}

export interface mainStoreNew {
  id: string;
  mbeOldId?: any;
  storeOldId?: any;
  mbeId: string;
  storeId: string;
  storeNew: StoreNew;
}
