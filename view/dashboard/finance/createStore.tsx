"use client";

import { createSchema, createStore, showToast, useField } from '@/lib'  
import { FormField } from '@/components/reususables/' 
import React, { useState } from 'react'
import { Button } from '@heroui/react';

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



const CreateStorePage = () => {

    const [isloading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

	const { value: storeName, error: storeNameError, handleChange: handleStoreNameChange } = useField("", storeNameSchema);
	const { value: city, error: cityError, handleChange: handleCityChange } = useField("", citySchema);
	const { value: state, error: stateError, handleChange: handleStateChange } = useField("", stateSchema);
	const { value: region, error: regionError, handleChange: handleRegionChange } = useField("", regionSchema);
	const { value: address, error: addressError, handleChange: handleAddressChange } = useField("", addressSchema);
	const { value: accountNo, error: acctError, handleChange: handleAcctChange } = useField("", accountNumberSchema);
	const { value: accountName, error: accountNameError, handleChange: handleAccountNameChange } = useField("", accountNameSchema);
	const { value: bankName, error: bankNameError, handleChange: handleBankNameChange } = useField("", bankNameSchema);
	const { value: bankCode, error: bankCodeError, handleChange: handleBankCodeChange } = useField("", bankCodeSchema);
	const { value: phoneNumber, error: phoneNumberError, handleChange: handlePhoneNumberChange } = useField("", phoneNumberSchema);
	const { value: storeEmail, error: storeEmailError, handleChange: handleStoreEmailChange } = useField("", storeEmailSchema);
	const { value: longitude, error: longitudeError, handleChange: handleLongitudeChange } = useField("", longitudeSchema);
	const { value: latitude, error: latitudeError, handleChange: handleLatitudeChange } = useField("", latitudeSchema);
	const { value: clusterId, error: clusterIdError, handleChange: handleClusterIdChange } = useField("", clusterIdSchema);
	const { value: partner, error: partnerError, handleChange: handlePartnerChange } = useField("", partnerSchema);
	const { value: storeOpen, error: storeOpenError, handleChange: handleStoreOpenChange } = useField("", storeOpenSchema);
	const { value: storeClose, error: storeCloseError, handleChange: handleStoreCloseChange } = useField("", storeCloseSchema);

    const handleCreateStore = async() => {
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
            await createStore(store);
            showToast({
                type: "success", message: "Store created successfully", duration: 3000
            });
        } catch (error: any) {
            showToast({
                type: "error", message: error.message || "Store creation failed", duration: 8000
            });
        } finally {
            setIsLoading(false);
            setIsDisabled(false);
        }
    }
  return (
    <div className='flex flex-col gap-4'> 
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
            <Button
                    color="primary"
                    size="sm"
                    className="w-fit p-6"
                    isLoading={isloading}
                    isDisabled={isDisabled}
                    onPress={handleCreateStore}
                >
                    Submit
                </Button>
        </div>
    )
}

export default CreateStorePage