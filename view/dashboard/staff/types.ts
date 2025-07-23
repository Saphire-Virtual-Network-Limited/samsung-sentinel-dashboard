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
  limit?: number;
  page?: number;
  total?: number;
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

export interface AgentLoanAndCommissionResponse {
  statusCode: number;
  message: string;
  data: {
    agents: Array<{
      title: string;
      createdAt: string;
      mbeId: string;
      mbe_old_id: string | null;
      updatedAt: string;
      firstname: string;
      lastname: string;
      phone: string;
      state: string | null;
      username: string;
      accountStatus: string;
      bvn: string;
      bvnPhoneNumber: string;
      channel: string;
      dob: string;
      email: string;
      isActive: boolean;
      otp: string | null;
      otpExpiry: string | null;
      password: string;
      role: string;
      tokenVersion: number;
      resetOtp: string | null;
      resetOtpExpiry: string | null;
      imagePublicId: string;
      imageUrl: string;
      defaultSplitPercent: number | null;
      userId: string;
      LoanRecord: {
        loanRecordId: string;
        customerId: string;
        loanDiskId: string | null;
        lastPoint: string;
        channel: string;
        loanStatus: string;
        createdAt: string;
        updatedAt: string;
        loanAmount: number;
        deviceId: string | null;
        downPayment: number;
        insurancePackage: string | null;
        insurancePrice: number;
        mbsEligibleAmount: number;
        payFrequency: string | null;
        storeId: string | null;
        devicePrice: number;
        deviceAmount: number;
        monthlyRepayment: number;
        duration: number | null;
        interestAmount: number;
        deviceName: string | null;
        mbeId: string;
        solarPackageId: string | null;
      }[];
      Commission: {
        commissionId: string;
        mbeId: string;
        deviceOnLoanId: string;
        commission: number;
        mbeCommission: number;
        partnerCommission: number;
        splitPercent: number;
        date_created: string;
        updated_at: string;
      }[];
      commissionSummary: {
        totalCommission: number;
        totalMbeCommission: number;
        totalPartnerCommission: number;
        commissionCount: number;
        avgCommission: number;
        avgMbeCommission: number;
        avgPartnerCommission: number;
        maxCommission: number;
        minCommission: number;
        latestCommissionDate: string | null;
        earliestCommissionDate: string | null;
      };
      commissionList: {
        commissionId: string;
        mbeId: string;
        deviceOnLoanId: string;
        commission: number;
        mbeCommission: number;
        partnerCommission: number;
        splitPercent: number;
        date_created: string;
        updated_at: string;
      }[];
    }>;
    overallSummary: {
      totalCommission: number;
      totalMbeCommission: number;
      totalPartnerCommission: number;
      totalCommissionCount: number;
      avgCommission: number;
      highestSingleCommission: number;
      lowestSingleCommission: number;
      dateRange: {
        earliest: string;
        latest: string;
      };
    };
    pagination: {
      hasMore: boolean;
    };
  };
  responseTime: string;
  channel: string;
}

// Add your existing types here as well
export interface ScanPartnerRecord {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  telephoneNumber: string;
  companyName: string;
  accountStatus: string;
  accountType: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dob?: string;
  gender?: string;
  referralCode?: string;
  profile_picture?: string;
  Mbe?: Array<{
    mbeId: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    accountStatus: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    imageUrl?: string;
    bvn: string;
    dob: string;
    channel: string;
  }>;
}
