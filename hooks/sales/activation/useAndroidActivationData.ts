import useSWR from "swr";
import { fallbackActivationTypes } from "./useActivationData";
interface Option {
  label: string;
  value: string;
}

interface UseAndroidActivationDataReturn {
  deviceBrands: Option[];
  deviceNames: Option[];
  salesStores: Option[];
  activationError: Error | undefined;
  sentinelPackage: Option[];

  isLoading: boolean;
  paymentOptions: Option[];
}

const fetcher = async (url: string): Promise<Option[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }
  return res.json();
};

export const useAndroidActivationData = (): UseAndroidActivationDataReturn => {
  const fallbackBrands: Option[] = [
    { label: "Samsung", value: "samsung" },
    { label: "Tecno", value: "tecno" },
    { label: "Infinix", value: "infinix" },
  ];

  const fallbackPaymentOptions: Option[] = [
    { label: "Instore Payment", value: "instore-payment" },
    { label: "Pay Small Small", value: "pay-small-small" },
    { label: "Online Payment", value: "online-payment" },
    { label: "Virtual Account Payment", value: "virtual-account-payment" },
  ];

  const fallbackNames: Option[] = [
    { label: "Galaxy S22", value: "galaxy-s22" },
    { label: "Camon 20", value: "camon-20" },
    { label: "Note 11", value: "note-11" },
  ];

  const fallbackStores: Option[] = [
    { label: "Slot Ikeja", value: "slot-ikeja" },
    { label: "Pointek Lekki", value: "pointek-lekki" },
    { label: "3CHub Abuja", value: "3chub-abuja" },
  ];

  const {
    data: deviceBrands,
    error: brandError,
    isLoading: loadingBrands,
  } = useSWR<Option[]>("/api/device-brands", fetcher, {
    fallbackData: fallbackBrands,
    revalidateOnFocus: false,
  });

  const {
    data: deviceNames,
    error: nameError,
    isLoading: loadingNames,
  } = useSWR<Option[]>("/api/device-names", fetcher, {
    fallbackData: fallbackNames,
    revalidateOnFocus: false,
  });

  const {
    data: salesStores,
    error: storeError,
    isLoading: loadingStores,
  } = useSWR<Option[]>("/api/sales-stores", fetcher, {
    fallbackData: fallbackStores,
    revalidateOnFocus: false,
  });

  const {
    data: sentinelPackage,
    error: sentinelPackageError,
    isLoading: loadingSentinelPackage,
  } = useSWR<Option[]>("/api/sentinel-package", fetcher, {
    fallbackData: fallbackActivationTypes,
    revalidateOnFocus: false,
  });

  const {
    data: paymentOptions,
    error: paymentOptionsError,
    isLoading: loadingPaymentOptions,
  } = useSWR<Option[]>("/api/sales-payment-options", fetcher, {
    fallbackData: fallbackPaymentOptions,
    revalidateOnFocus: false,
  });

  return {
    deviceBrands: deviceBrands || fallbackBrands,
    deviceNames: deviceNames || fallbackNames,
    salesStores: salesStores || fallbackStores,
    sentinelPackage: sentinelPackage || fallbackActivationTypes,
    paymentOptions: paymentOptions || fallbackPaymentOptions,
    activationError:
      brandError || nameError || storeError || paymentOptionsError,
    isLoading:
      loadingBrands || loadingNames || loadingStores || loadingPaymentOptions,
  };
};
