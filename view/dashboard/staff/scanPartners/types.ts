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
  companyName: string;
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

export interface LoanRecord {
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
}

export interface AgentLoanData {
  agent: {
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
    LoanRecord: LoanRecord[];
    Commission: Array<{
      commissionId: string;
      mbeId: string;
      deviceOnLoanId: string;
      commission: number;
      mbeCommission: number;
      partnerCommission: number;
      splitPercent: number;
      date_created: string;
      updated_at: string;
    }>;
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
      latestCommissionDate: string;
      earliestCommissionDate: string;
    };
    commissionList: Array<{
      commissionId: string;
      mbeId: string;
      deviceOnLoanId: string;
      commission: number;
      mbeCommission: number;
      partnerCommission: number;
      splitPercent: number;
      date_created: string;
      updated_at: string;
    }>;
  };
  pagination: {
    totalCount: number;
    filteredCount: number;
    hasMore: boolean;
  };
}
