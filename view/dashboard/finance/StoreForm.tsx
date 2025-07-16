"use client";

import { createSchema, createStore, updateStore, showToast } from '@/lib'  
import { FormField } from '@/components/reususables/' 
import React, { useState, useEffect } from 'react'
import { Button } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { getAllStores } from '@/lib';

const storeNameSchema = createSchema((value: string) => {
	const storeNameRegex = /^[a-zA-Z0-9\s]+$/;
	return storeNameRegex.test(value);
}, "Please enter a valid store name");

const citySchema = createSchema((value: string) => {
	const cityRegex = /^[a-zA-Z\s]+$/;
	return cityRegex.test(value);
}, "Please enter a valid city name");

const stateSchema = createSchema((value: string) => {
	const stateRegex = /^[a-zA-Z\s]+$/;
	return stateRegex.test(value);
}, "Please enter a valid state name");

const regionSchema = createSchema((value: string) => {
	const regionRegex = /^[a-zA-Z\s]+$/;
	return regionRegex.test(value);
}, "Please enter a valid region name");

const addressSchema = createSchema((value: string) => {
	const addressRegex = /^[a-zA-Z0-9\s]+$/;
	return addressRegex.test(value);
}, "Please enter a valid address");

const accountNumberSchema = createSchema((value: string) => {
	const accountNumberRegex = /^[0-9]+$/;
	return accountNumberRegex.test(value) && value.length > 0;
}, "Please enter numbers only");

const accountNameSchema = createSchema((value: string) => {
	const accountNameRegex = /^[a-zA-Z0-9\s]+$/;
	return accountNameRegex.test(value);
}, "Please enter a valid account name");

const bankNameSchema = createSchema((value: string) => {
	const bankNameRegex = /^[a-zA-Z\s]+$/;
	return bankNameRegex.test(value);
}, "Please enter a valid bank name");

const bankCodeSchema = createSchema((value: string) => {
	const bankCodeRegex = /^[0-9]+$/;
	return bankCodeRegex.test(value);
}, "Please enter numbers only");

const phoneNumberSchema = createSchema((value: string) => {
	const phoneNumberRegex = /^[0-9]{10}$/;
	return phoneNumberRegex.test(value);
}, "Please enter a valid 10-digit phone number");

const storeEmailSchema = createSchema((value: string) => {
	const storeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return storeEmailRegex.test(value);
}, "Please enter a valid store email");

const longitudeSchema = createSchema((value: string) => {
	const longitudeRegex = /^[0-9.]+$/;
	return longitudeRegex.test(value);
}, "Please enter a valid longitude");

const latitudeSchema = createSchema((value: string) => {
	const latitudeRegex = /^[0-9.]+$/;
	return latitudeRegex.test(value);
}, "Please enter a valid latitude");

const clusterIdSchema = createSchema((value: string) => {
	const clusterIdRegex = /^[0-9.]+$/;
	return clusterIdRegex.test(value);
}, "Please enter a valid cluster id");

const partnerSchema = createSchema((value: string) => {
	const partnerRegex = /^[a-zA-Z0-9\s]+$/;
	return partnerRegex.test(value);
}, "Please enter a valid partner");

const storeOpenSchema = createSchema((value: string) => {
	const storeOpenRegex = /^[0-9:]+$/;
	return storeOpenRegex.test(value);
}, "Please enter a valid store open time");

const storeCloseSchema = createSchema((value: string) => {
	const storeCloseRegex = /^[0-9:]+$/;
	return storeCloseRegex.test(value);
}, "Please enter a valid store close time");

type StoreRecord = {
  storeOldId: number;
  storeName: string;
  city: string;
  state: string;
  region: string;
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
};

const StoreForm = () => {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.storeId as string;
    const isEditMode = !!storeId;

    const [isloading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [storeData, setStoreData] = useState<StoreRecord | null>(null);

    // Form state
    const [storeName, setStoreName] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [region, setRegion] = useState("");
    const [address, setAddress] = useState("");
    const [accountNo, setAccountNo] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [storeEmail, setStoreEmail] = useState("");
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const [clusterId, setClusterId] = useState("");
    const [partner, setPartner] = useState("");
    const [storeOpen, setStoreOpen] = useState("");
    const [storeClose, setStoreClose] = useState("");

    // Error state
    const [storeNameError, setStoreNameError] = useState("");
    const [cityError, setCityError] = useState("");
    const [stateError, setStateError] = useState("");
    const [regionError, setRegionError] = useState("");
    const [addressError, setAddressError] = useState("");
    const [acctError, setAcctError] = useState("");
    const [accountNameError, setAccountNameError] = useState("");
    const [bankNameError, setBankNameError] = useState("");
    const [bankCodeError, setBankCodeError] = useState("");
    const [phoneNumberError, setPhoneNumberError] = useState("");
    const [storeEmailError, setStoreEmailError] = useState("");
    const [longitudeError, setLongitudeError] = useState("");
    const [latitudeError, setLatitudeError] = useState("");
    const [clusterIdError, setClusterIdError] = useState("");
    const [partnerError, setPartnerError] = useState("");
    const [storeOpenError, setStoreOpenError] = useState("");
    const [storeCloseError, setStoreCloseError] = useState("");

    // Validation functions
    const validateField = (value: string, schema: any, setError: (error: string) => void) => {
        try {
            schema.parse(value);
            setError("");
            return true;
        } catch (error: any) {
            setError(error.errors?.[0]?.message || "Validation error");
            return false;
        }
    };

    // Handle change functions
    const handleStoreNameChange = (value: string) => {
        setStoreName(value);
        validateField(value, storeNameSchema, setStoreNameError);
    };

    const handleCityChange = (value: string) => {
        setCity(value);
        validateField(value, citySchema, setCityError);
    };

    const handleStateChange = (value: string) => {
        setState(value);
        validateField(value, stateSchema, setStateError);
    };

    const handleRegionChange = (value: string) => {
        setRegion(value);
        validateField(value, regionSchema, setRegionError);
    };

    const handleAddressChange = (value: string) => {
        setAddress(value);
        validateField(value, addressSchema, setAddressError);
    };

    const handleAcctChange = (value: string) => {
        setAccountNo(value);
        validateField(value, accountNumberSchema, setAcctError);
    };

    const handleAccountNameChange = (value: string) => {
        setAccountName(value);
        validateField(value, accountNameSchema, setAccountNameError);
    };

    const handleBankNameChange = (value: string) => {
        setBankName(value);
        validateField(value, bankNameSchema, setBankNameError);
    };

    const handleBankCodeChange = (value: string) => {
        setBankCode(value);
        validateField(value, bankCodeSchema, setBankCodeError);
    };

    const handlePhoneNumberChange = (value: string) => {
        setPhoneNumber(value);
        validateField(value, phoneNumberSchema, setPhoneNumberError);
    };

    const handleStoreEmailChange = (value: string) => {
        setStoreEmail(value);
        validateField(value, storeEmailSchema, setStoreEmailError);
    };

    const handleLongitudeChange = (value: string) => {
        setLongitude(value);
        validateField(value, longitudeSchema, setLongitudeError);
    };

    const handleLatitudeChange = (value: string) => {
        setLatitude(value);
        validateField(value, latitudeSchema, setLatitudeError);
    };

    const handleClusterIdChange = (value: string) => {
        setClusterId(value);
        validateField(value, clusterIdSchema, setClusterIdError);
    };

    const handlePartnerChange = (value: string) => {
        setPartner(value);
        validateField(value, partnerSchema, setPartnerError);
    };

    const handleStoreOpenChange = (value: string) => {
        setStoreOpen(value);
        validateField(value, storeOpenSchema, setStoreOpenError);
    };

    const handleStoreCloseChange = (value: string) => {
        setStoreClose(value);
        validateField(value, storeCloseSchema, setStoreCloseError);
    };

    // Fetch store data if in edit mode
    useEffect(() => {
        if (isEditMode && storeId) {
            const fetchStoreData = async () => {
                try {
                    const response = await getAllStores();
                    const stores = response.data || [];
                    const store = stores.find((s: StoreRecord) => s.storeId === storeId);
                    
                    if (store) {
                        setStoreData(store);
                        // Pre-fill form fields
                        setStoreName(store.storeName || '');
                        setCity(store.city || '');
                        setState(store.state || '');
                        setRegion(store.region || '');
                        setAddress(store.address || '');
                        setAccountNo(store.accountNumber || '');
                        setAccountName(store.accountName || '');
                        setBankName(store.bankName || '');
                        setBankCode(store.bankCode || '');
                        setPhoneNumber(store.phoneNumber || '');
                        setStoreEmail(store.storeEmail || '');
                        setLongitude(store.longitude?.toString() || '');
                        setLatitude(store.latitude?.toString() || '');
                        setClusterId(store.clusterId?.toString() || '');
                        setPartner(store.partner || '');
                        setStoreOpen(store.storeOpen || '');
                        setStoreClose(store.storeClose || '');
                    } else {
                        showToast({
                            type: "error",
                            message: "Store not found",
                            duration: 3000
                        });
                        router.back();
                    }
                } catch (error: any) {
                    console.error("Error fetching store data:", error);
                    showToast({
                        type: "error",
                        message: "Failed to fetch store data",
                        duration: 3000
                    });
                    router.back();
                }
            };
            
            fetchStoreData();
        }
    }, [isEditMode, storeId, router]);

    const handleSubmit = async() => {
        setIsDisabled(true);
        setIsLoading(true);
       
        const store = {
            storeName,
            city,
            state,
            region,
            address,
            accountNumber: accountNo,
            accountName,
            bankName,
            bankCode,
            phoneNumber,
            storeEmail,
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
            clusterId: parseInt(clusterId),
            partner,
            storeOpen,
            storeClose
        }

        try {
            if (isEditMode && storeId) {
                await updateStore({ ...store, storeId });
                showToast({
                    type: "success", 
                    message: "Store updated successfully", 
                    duration: 5000
                });
            } else {
                await createStore(store);
                showToast({
                    type: "success", 
                    message: "Store created successfully", 
                    duration: 3000
                });
            }
            
            // Wait 5-10 seconds before closing/navigating
            setTimeout(() => {
                if (window.opener) {
                    window.close();
                } else {
                    router.back();
                }
            }, 7000);
        } catch (error: any) {
            showToast({
                type: "error", 
                message: error.message || (isEditMode ? "Store update failed" : "Store creation failed"), 
                duration: 8000
            });
        } finally {
            setIsLoading(false);
            setIsDisabled(false);
        }
    }

    return (
        <div className='flex flex-col gap-4'> 
            <div className="mb-4">
                <h1 className="text-2xl font-bold">
                    <span className="text-blue-600">{isEditMode ? `Edit ${storeData?.storeName} Store` : ''}</span>
                </h1>
                
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
                <FormField
                    label="Store Name"
                    errorMessage={storeNameError}
                    value={storeName}
                    onChange={handleStoreNameChange}
                    placeholder="Enter store name"
                    type="text"
                    required
                    htmlFor="storeName"
                    id="storeName"
                    size="sm"
                />
                <FormField
                    label="City"
                    errorMessage={cityError}
                    value={city}
                    onChange={handleCityChange}
                    placeholder="Enter city"
                    type="text"
                    required
                    htmlFor="city"
                    id="city"
                    size="sm"
                />
                <FormField
                    label="State"
                    errorMessage={stateError}
                    value={state}
                    onChange={handleStateChange}
                    placeholder="Enter state"
                    type="text"
                    required
                    htmlFor="state"
                    id="state"
                    size="sm"
                />
                <FormField
                    label="Region"
                    errorMessage={regionError}
                    value={region}
                    onChange={handleRegionChange}
                    placeholder="Enter region"
                    type="text"
                    required
                    htmlFor="region"
                    id="region"
                    size="sm"
                />
                <FormField
                    label="Address"
                    errorMessage={addressError}
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Enter address"
                    type="text"
                    required
                    htmlFor="address"
                    id="address"
                    size="sm"
                />
                <FormField
                    label="Account Number"
                    errorMessage={acctError}
                    value={accountNo}
                    onChange={handleAcctChange}
                    placeholder="Enter account number"
                    type="number"
                    required
                    htmlFor="accountNo"
                    id="accountNo"
                    size="sm"
                />
                <FormField
                    label="Account Name"
                    errorMessage={accountNameError}
                    value={accountName}
                    onChange={handleAccountNameChange}
                    placeholder="Enter account name"
                    type="text"
                    required
                    htmlFor="accountName"
                    id="accountName"
                    size="sm"
                />
                <FormField
                    label="Bank Name"
                    errorMessage={bankNameError}
                    value={bankName}
                    onChange={handleBankNameChange}
                    placeholder="Enter bank name"
                    type="text"
                    required
                    htmlFor="bankName"
                    id="bankName"
                    size="sm"
                />
                <FormField
                    label="Bank Code"
                    errorMessage={bankCodeError}
                    value={bankCode}
                    onChange={handleBankCodeChange}
                    placeholder="Enter bank code"
                    type="number"
                    required
                    htmlFor="bankCode"
                    id="bankCode"
                    size="sm"
                />
                <FormField
                    label="Phone Number"
                    errorMessage={phoneNumberError}
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Enter phone number"
                    type="number"
                    required
                    htmlFor="phoneNumber"
                    id="phoneNumber"
                    size="sm"
                />
                <FormField
                    label="Store Email"
                    errorMessage={storeEmailError}
                    value={storeEmail}
                    onChange={handleStoreEmailChange}
                    placeholder="Enter store email"
                    type="email"
                    required
                    htmlFor="storeEmail"
                    id="storeEmail"
                    size="sm"
                />
                <FormField
                    label="Longitude"
                    errorMessage={longitudeError}
                    value={longitude}
                    onChange={handleLongitudeChange}
                    placeholder="Enter longitude"
                    type="number"
                    required
                    htmlFor="longitude"
                    id="longitude"
                    size="sm"
                />
                <FormField
                    label="Latitude"
                    errorMessage={latitudeError}
                    value={latitude}
                    onChange={handleLatitudeChange}
                    placeholder="Enter latitude"
                    type="number"
                    required
                    htmlFor="latitude"
                    id="latitude"
                    size="sm"
                />
                <FormField
                    label="Cluster ID"
                    errorMessage={clusterIdError}
                    value={clusterId}
                    onChange={handleClusterIdChange}
                    placeholder="Enter cluster id"
                    type="number"
                    required
                    htmlFor="clusterId"
                    id="clusterId"
                    size="sm"
                />
                <FormField
                    label="Partner"
                    errorMessage={partnerError}
                    value={partner}
                    onChange={handlePartnerChange}
                    placeholder="Enter partner"
                    type="text"
                    required
                    htmlFor="partner"
                    id="partner"
                    size="sm"
                />
                <FormField
                    label="Store Open"
                    errorMessage={storeOpenError}
                    value={storeOpen}
                    onChange={handleStoreOpenChange}
                    placeholder="Enter store open"
                    type="text"
                    required
                    htmlFor="storeOpen"
                    id="storeOpen"
                    size="sm"
                />  
                <FormField
                    label="Store Close"
                    errorMessage={storeCloseError}
                    value={storeClose}
                    onChange={handleStoreCloseChange}
                    placeholder="Enter store close"
                    type="text"
                    required
                    htmlFor="storeClose"
                    id="storeClose"
                    size="sm"
                />
            </div>
            
            <div className="flex gap-2">
                <Button
                    color="primary"
                    size="sm"
                    className="w-fit p-6"
                    isLoading={isloading}
                    isDisabled={isDisabled}
                    onPress={handleSubmit}
                >
                    {isEditMode ? 'Update Store' : 'Create Store'}
                </Button>
                
                <Button
                    color="default"
                    variant="light"
                    size="sm"
                    className="w-fit p-6"
                    onPress={() => {
                        if (window.opener) {
                            window.close();
                        } else {
                            router.back();
                        }
                    }}
                >
                    Cancel
                </Button>
            </div>
        </div>
    )
}

export default StoreForm 