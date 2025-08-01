"use client";

import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
} from "@heroui/react";
import { UserCheck } from "lucide-react";
import AutoCompleteField from "@/components/reususables/form/AutoCompleteField";

interface VfdBank {
  id: number;
  code: string;
  name: string;
  logo: string;
  created: string;
}

interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BankDetails {
  mbeAccountDetailsId?: string;
  mbeId?: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  channel: string;
  createdAt?: string;
  updatedAt?: string;
  recipientCode?: string;
  vfdBankCode: string;
  vfdBankName: string;
  bankID?: number;
}

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isEdit: boolean;
  bankFormData: BankDetails;
  setBankFormData: React.Dispatch<React.SetStateAction<BankDetails>>;
  vfdBanks: VfdBank[];
  paystackBanks: PaystackBank[];
  selectedVfdBank: VfdBank | null;
  selectedPaystackBank: PaystackBank | null;
  onVfdBankSelect: (bankCode: string) => void;
  onPaystackBankSelect: (bankCode: string) => void;
  onVerifyBankDetails: () => void;
  isVerifyingBank: boolean;
  isSavingBank: boolean;
  isAccountVerified: boolean;
  setIsAccountVerified: React.Dispatch<React.SetStateAction<boolean>>;
}

const BankDetailsModal: React.FC<BankDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isEdit,
  bankFormData,
  setBankFormData,
  vfdBanks,
  paystackBanks,
  selectedVfdBank,
  selectedPaystackBank,
  onVfdBankSelect,
  onPaystackBankSelect,
  onVerifyBankDetails,
  isVerifyingBank,
  isSavingBank,
  isAccountVerified,
  setIsAccountVerified,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit" : "Add"} Bank Details
          </h3>
          <p className="text-sm text-default-500">
            {isEdit
              ? "Update the bank account information"
              : "Add bank account information. Select your bank and enter account number to verify account name automatically."}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* VFD Bank Selection (Optional) */}
            <div className="space-y-2">
              <AutoCompleteField
                label="Bank"
                htmlFor="vfd-bank"
                id="vfd-bank"
                placeholder="Select bank"
                value={selectedVfdBank?.code || bankFormData.vfdBankCode}
                onChange={onVfdBankSelect}
                options={vfdBanks.map((bank) => ({
                  label: bank.name,
                  value: bank.code,
                }))}
                required
              />
            </div>

            {/* Paystack Bank Selection */}
            <div className="space-y-2">
              <AutoCompleteField
                label="Verification Bank"
                htmlFor="paystack-bank"
                id="paystack-bank"
                placeholder="Select bank for verification"
                value={selectedPaystackBank?.code || bankFormData.bankCode}
                onChange={onPaystackBankSelect}
                options={paystackBanks.map((bank) => ({
                  label: bank.name,
                  value: bank.code,
                }))}
                required
                reqValue="*"
              />
            </div>

            {/* Account Number */}
            <Input
              label="Account Number"
              placeholder="Enter account number"
              value={bankFormData.accountNumber}
              onChange={(e) => {
                setBankFormData((prev) => ({
                  ...prev,
                  accountNumber: e.target.value,
                }));
                setIsAccountVerified(false);
              }}
              variant="bordered"
              isRequired
            />

            {/* Verify Button */}
            <div className="flex justify-end">
              <Button
                color="secondary"
                variant="flat"
                onPress={onVerifyBankDetails}
                isLoading={isVerifyingBank}
                isDisabled={
                  !bankFormData.accountNumber || !bankFormData.bankCode
                }
              >
                {isVerifyingBank ? "Verifying..." : "Verify Account"}
              </Button>
            </div>

            {/* Account Name (Auto-filled after verification) */}
            {isAccountVerified && (
              <Input
                label="Account Name"
                placeholder="Account name will be auto-filled"
                value={bankFormData.accountName}
                onChange={(e) =>
                  setBankFormData((prev) => ({
                    ...prev,
                    accountName: e.target.value,
                  }))
                }
                variant="bordered"
                isReadOnly={!isEdit} // Allow editing only in edit mode
              />
            )}

            {/* Verification Status */}
            {isAccountVerified && (
              <div className="flex items-center gap-2 p-3 bg-success-50 rounded-lg border border-success-200">
                <UserCheck className="w-5 h-5 text-success" />
                <span className="text-sm text-success-700">
                  Bank account verified successfully
                </span>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isSavingBank}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={onSave}
            isLoading={isSavingBank}
            isDisabled={!isAccountVerified}
          >
            {isSavingBank ? "Saving..." : "Save Bank Details"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BankDetailsModal;
