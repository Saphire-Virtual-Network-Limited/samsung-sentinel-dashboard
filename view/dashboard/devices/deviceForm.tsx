"use client";

import {
	createSchema,
	createDevice,
	updateDevice,
	showToast,
	getAllDevices,
	getDeviceById,
} from "@/lib";
import {
	FormField,
	InputFileBoxField,
	SelectField,
} from "@/components/reususables/";
import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { useParams, useRouter } from "next/navigation";

const deviceBrandSchema = createSchema((value: string) => {
	const deviceBrandRegex = /^[a-zA-Z0-9\s]+$/;
	return deviceBrandRegex.test(value);
}, "Please enter a valid device brand");

const deviceModelSchema = createSchema((value: string) => {
	const deviceModelRegex = /^[a-zA-Z\s]+$/;
	return deviceModelRegex.test(value);
}, "Please enter a valid device model");

const priceSchema = createSchema((value: string) => {
	const priceRegex = /^[0-9]+$/;
	return priceRegex.test(value);
}, "Please enter a valid price");

const currencySchema = createSchema((value: string) => {
	const currencyRegex = /^[a-zA-Z\s]+$/;
	return currencyRegex.test(value);
}, "Please enter a valid currency");

const deviceImageSchema = createSchema((value: string) => {
	return value.length > 0; // Just check if a file is selected
}, "Please select a device image");

const deviceModelNumberSchema = createSchema((value: string) => {
	const deviceModelNumberRegex = /^[a-zA-Z0-9\s]+$/;
	return deviceModelNumberRegex.test(value);
}, "Please enter a valid device model number");

const backCameraSchema = createSchema((value: string) => {
	const backCameraRegex = /^[a-zA-Z0-9\s]+$/;
	return backCameraRegex.test(value);
}, "Please enter a valid back camera");

const batterySchema = createSchema((value: string) => {
	const batteryRegex = /^[a-zA-Z0-9\s]+$/;
	return batteryRegex.test(value);
}, "Please enter a valid battery");

const colorSchema = createSchema((value: string) => {
	const colorRegex = /^[a-zA-Z0-9\s]+$/;
	return colorRegex.test(value);
}, "Please enter a valid color");

const dataStorageSchema = createSchema((value: string) => {
	const dataStorageRegex = /^[a-zA-Z0-9\s]+$/;
	return dataStorageRegex.test(value);
}, "Please enter a valid data storage");

const displaySchema = createSchema((value: string) => {
	const displayRegex = /^[a-zA-Z0-9\s]+$/;
	return displayRegex.test(value);
}, "Please enter a valid display");

const frontCameraSchema = createSchema((value: string) => {
	const frontCameraRegex = /^[a-zA-Z0-9\s]+$/;
	return frontCameraRegex.test(value);
}, "Please enter a valid front camera");

const memorySchema = createSchema((value: string) => {
	const memoryRegex = /^[a-zA-Z0-9\s]+$/;
	return memoryRegex.test(value);
}, "Please enter a valid memory");

const networkSchema = createSchema((value: string) => {
	const networkRegex = /^[a-zA-Z0-9\s]+$/;
	return networkRegex.test(value);
}, "Please enter a valid network");

const osSchema = createSchema((value: string) => {
	const osRegex = /^[a-zA-Z0-9\s]+$/;
	return osRegex.test(value);
}, "Please enter a valid os");

const otherFeaturesSchema = createSchema((value: string) => {
	const otherFeaturesRegex = /^[a-zA-Z0-9\s]+$/;
	return otherFeaturesRegex.test(value);
}, "Please enter a valid other features");

const processorCpuSchema = createSchema((value: string) => {
	const processorCpuRegex = /^[a-zA-Z0-9\s]+$/;
	return processorCpuRegex.test(value);
}, "Please enter a valid processor cpu");

const sapSchema = createSchema((value: string) => {
	const sapRegex = /^[0-9]+$/;
	return sapRegex.test(value);
}, "Please enter a valid sap");

const screenSizeSchema = createSchema((value: string) => {
	const screenSizeRegex = /^[0-9.]+$/;
	return screenSizeRegex.test(value);
}, "Please enter a valid screen size");

const sldSchema = createSchema((value: string) => {
	const sldRegex = /^[0-9]+$/;
	return sldRegex.test(value);
}, "Please enter a valid sld");

const deviceTypeSchema = createSchema((value: string) => {
	const deviceTypeRegex = /^[a-zA-Z0-9\s]+$/;
	return deviceTypeRegex.test(value);
}, "Please enter a valid device type");

const caseColorsSchema = createSchema((value: string) => {
	const caseColorsRegex = /^[a-zA-Z0-9\s]+$/;
	return caseColorsRegex.test(value);
}, "Please enter a valid case colors");

const windowsVersionSchema = createSchema((value: string) => {
	const windowsVersionRegex = /^[a-zA-Z0-9\s]+$/;
	return windowsVersionRegex.test(value);
}, "Please enter a valid windows version");

const isActiveSchema = createSchema((value: string) => {
	return value === "true" || value === "false";
}, "Please select a valid status");

const sentinelCoverSchema = createSchema((value: string) => {
	const sentinelCoverRegex = /^[a-zA-Z0-9\s]+$/;
	return sentinelCoverRegex.test(value);
}, "Please enter a valid sentinel cover");

type DeviceRecord = {
	id?: string;
	newDeviceId?: string;
	deviceBrand: string;
	deviceModel: string;
	price: number;
	currency: string;
	deviceImage: File; // From API - binary string
	deviceModelNumber: string;
	back_camera: string;
	battery: string;
	color: string;
	data_storage: string;
	display: string;
	front_camera: string;
	memory: string;
	network: string;
	os: string;
	other_features: string;
	processor_cpu: string;
	sentinel_cover: string;
	sap: number;
	screen_size: string;
	sld: number;
	deviceType: string;
	case_colors: string;
	windows_version: string;
	isActive: boolean;
};

type DeviceFormData = {
	deviceBrand: string;
	deviceModel: string;
	price: number;
	currency: string;
	deviceImage?: File; // For form - File object
	deviceModelNumber: string;
	back_camera: string;
	battery: string;
	color: string;
	data_storage: string;
	display: string;
	front_camera: string;
	memory: string;
	network: string;
	os: string;
	other_features: string;
	processor_cpu: string;
	sentinel_cover: string;
	sap: number;
	screen_size: string;
	sld: number;
	deviceType: string;
	case_colors: string;
	windows_version: string;
	isActive: boolean;
};

const DeviceForm = () => {
	const params = useParams();
	const router = useRouter();
	const deviceId = params?.deviceId as string;
	const isEditMode = !!deviceId;

	const [isloading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [deviceData, setDeviceData] = useState<DeviceRecord | null>(null);

	// Form state
	const [deviceBrand, setDeviceBrand] = useState("");
	const [deviceModel, setDeviceModel] = useState("");
	const [price, setPrice] = useState("");
	const [currency, setCurrency] = useState("");
	const [deviceImage, setDeviceImage] = useState<File | null>(null);
	const [deviceModelNumber, setDeviceModelNumber] = useState("");
	const [back_camera, setBackCamera] = useState("");
	const [battery, setBattery] = useState("");
	const [color, setColor] = useState("");
	const [data_storage, setDataStorage] = useState("");
	const [display, setDisplay] = useState("");
	const [front_camera, setFrontCamera] = useState("");
	const [memory, setMemory] = useState("");
	const [network, setNetwork] = useState("");
	const [os, setOs] = useState("");
	const [other_features, setOtherFeatures] = useState("");
	const [processor_cpu, setProcessorCpu] = useState("");
	const [sap, setSap] = useState("");
	const [screen_size, setScreenSize] = useState("");
	const [sld, setSld] = useState("");
	const [deviceType, setDeviceType] = useState("");
	const [case_colors, setCaseColors] = useState("");
	const [windows_version, setWindowsVersion] = useState("");
	const [isActive, setIsActive] = useState(false);
	const [sentinel_cover, setSentinelCover] = useState("");
	// Error state
	const [deviceBrandError, setDeviceBrandError] = useState("");
	const [deviceModelError, setDeviceModelError] = useState("");
	const [priceError, setPriceError] = useState("");
	const [currencyError, setCurrencyError] = useState("");
	const [deviceImageError, setDeviceImageError] = useState("");
	const [deviceModelNumberError, setDeviceModelNumberError] = useState("");
	const [back_cameraError, setBackCameraError] = useState("");
	const [batteryError, setBatteryError] = useState("");
	const [colorError, setColorError] = useState("");
	const [data_storageError, setDataStorageError] = useState("");
	const [displayError, setDisplayError] = useState("");
	const [front_cameraError, setFrontCameraError] = useState("");
	const [memoryError, setMemoryError] = useState("");
	const [networkError, setNetworkError] = useState("");
	const [osError, setOsError] = useState("");
	const [other_featuresError, setOtherFeaturesError] = useState("");
	const [processor_cpuError, setProcessorCpuError] = useState("");
	const [sapError, setSapError] = useState("");
	const [screen_sizeError, setScreenSizeError] = useState("");
	const [sldError, setSldError] = useState("");
	const [deviceTypeError, setDeviceTypeError] = useState("");
	const [case_colorsError, setCaseColorsError] = useState("");
	const [windows_versionError, setWindowsVersionError] = useState("");
	const [isActiveError, setIsActiveError] = useState("");
	const [sentinel_coverError, setSentinelCoverError] = useState("");
	// Validation functions
	const validateField = (
		value: string,
		schema: any,
		setError: (error: string) => void
	) => {
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
	const handleDeviceBrandChange = (value: string) => {
		setDeviceBrand(value);
		validateField(value, deviceBrandSchema, setDeviceBrandError);
	};

	const handleDeviceModelChange = (value: string) => {
		setDeviceModel(value);
		validateField(value, deviceModelSchema, setDeviceModelError);
	};

	const handlePriceChange = (value: string) => {
		setPrice(value);
		validateField(value, priceSchema, setPriceError);
	};

	const handleCurrencyChange = (value: string) => {
		setCurrency(value);
		validateField(value, currencySchema, setCurrencyError);
	};

	const handleDeviceImageChange = (file: File | null) => {
		setDeviceImage(file);
		validateField(
			file ? file.name : "",
			deviceImageSchema,
			setDeviceImageError
		);
	};

	const handleDeviceModelNumberChange = (value: string) => {
		setDeviceModelNumber(value);
		validateField(value, deviceModelNumberSchema, setDeviceModelNumberError);
	};

	const handleBackCameraChange = (value: string) => {
		setBackCamera(value);
		validateField(value, backCameraSchema, setBackCameraError);
	};

	const handleBatteryChange = (value: string) => {
		setBattery(value);
		validateField(value, batterySchema, setBatteryError);
	};

	const handleColorChange = (value: string | string[]) => {
		const colorValue = Array.isArray(value) ? value[0] || "" : value;
		setColor(colorValue);
		validateField(colorValue, colorSchema, setColorError);
	};

	const handleDataStorageChange = (value: string) => {
		setDataStorage(value);
		validateField(value, dataStorageSchema, setDataStorageError);
	};

	const handleDisplayChange = (value: string) => {
		setDisplay(value);
		validateField(value, displaySchema, setDisplayError);
	};

	const handleFrontCameraChange = (value: string) => {
		setFrontCamera(value);
		validateField(value, frontCameraSchema, setFrontCameraError);
	};

	const handleMemoryChange = (value: string) => {
		setMemory(value);
		validateField(value, memorySchema, setMemoryError);
	};

	const handleNetworkChange = (value: string) => {
		setNetwork(value);
		validateField(value, networkSchema, setNetworkError);
	};

	const handleOsChange = (value: string) => {
		setOs(value);
		validateField(value, osSchema, setOsError);
	};

	const handleOtherFeaturesChange = (value: string) => {
		setOtherFeatures(value);
		validateField(value, otherFeaturesSchema, setOtherFeaturesError);
	};

	const handleProcessorCpuChange = (value: string) => {
		setProcessorCpu(value);
		validateField(value, processorCpuSchema, setProcessorCpuError);
	};

	const handleSapChange = (value: string) => {
		setSap(value);
		validateField(value, sapSchema, setSapError);
	};

	const handleScreenSizeChange = (value: string) => {
		setScreenSize(value);
		validateField(value, screenSizeSchema, setScreenSizeError);
	};

	const handleSldChange = (value: string) => {
		setSld(value);
		validateField(value, sldSchema, setSldError);
	};

	const handleDeviceTypeChange = (value: string | string[]) => {
		const deviceTypeValue = Array.isArray(value) ? value[0] || "" : value;
		setDeviceType(deviceTypeValue);
		validateField(deviceTypeValue, deviceTypeSchema, setDeviceTypeError);
	};

	const handleCaseColorsChange = (value: string | string[]) => {
		const caseColorsValue = Array.isArray(value) ? value[0] || "" : value;
		setCaseColors(caseColorsValue);
		validateField(caseColorsValue, caseColorsSchema, setCaseColorsError);
	};

	const handleWindowsVersionChange = (value: string | string[]) => {
		const windowsVersionValue = Array.isArray(value) ? value[0] || "" : value;
		setWindowsVersion(windowsVersionValue);
		validateField(
			windowsVersionValue,
			windowsVersionSchema,
			setWindowsVersionError
		);
	};

	const handleIsActiveChange = (value: string | string[]) => {
		const isActiveValue = Array.isArray(value) ? value[0] || "false" : value;
		setIsActive(isActiveValue === "true");
		validateField(isActiveValue, isActiveSchema, setIsActiveError);
	};

	const handleSentinelCoverChange = (value: string) => {
		setSentinelCover(value);
		validateField(value, sentinelCoverSchema, setSentinelCoverError);
	};

	// Fetch device data if in edit mode
	useEffect(() => {
		if (isEditMode && deviceId) {
			const fetchDeviceData = async () => {
				try {
					const response = await getDeviceById(deviceId);
					const data = response?.data || {};
					// Map both possible API response shapes to form state
					// Shape 1: new API (camelCase, e.g. deviceName, deviceBrand, etc)
					// Shape 2: old API (snake_case, e.g. device_brand, device_model, etc)
					// Use fallback for each field
					setDeviceData(data);
					setDeviceBrand(data.deviceBrand || data.deviceName || "");
					setDeviceModel(data.deviceModel || data.deviceModelNumber || "");
					setPrice((data.price !== undefined ? data.price : "").toString());
					setCurrency(data.currency || "");
					setDeviceImage(null); // Reset file input when editing
					setDeviceModelNumber(data.deviceModelNumber || "");
					setBackCamera(data.back_camera || data.deviceCamera || "");
					setBattery(data.battery || "");
					setColor(data.color || data.case_colors || "");
					setDataStorage(data.data_storage || data.deviceStorage || "");
					setDisplay(data.display || data.deviceScreen || "");
					setFrontCamera(data.front_camera || "");
					setMemory(data.memory || data.deviceRam || "");
					setNetwork(data.network || "");
					setOs(data.os || "");
					setOtherFeatures(data.other_features || "");
					setProcessorCpu(data.processor_cpu || "");
					setSap(
						(data.sap !== undefined
							? data.sap
							: data.SAP !== undefined
							? data.SAP
							: ""
						).toString()
					);
					setScreenSize(data.screen_size || "");
					setSld(
						(data.sld !== undefined
							? data.sld
							: data.SLD !== undefined
							? data.SLD
							: ""
						).toString()
					);
					setDeviceType(data.deviceType || "");
					setCaseColors(data.case_colors || "");
					setWindowsVersion(data.windows_version || "");
					setIsActive(
						data.isActive !== undefined
							? data.isActive
							: typeof data.status === "string"
							? data.status === "ACTIVE"
							: false
					);
					setSentinelCover(
						data.sentinel_cover ||
							data.sentiProtect ||
							data.sentinel_cover ||
							""
					);
				} catch (error: any) {
					console.error("Error fetching device data:", error);
					showToast({
						type: "error",
						message: "Failed to fetch device data",
						duration: 3000,
					});
					router.back();
				}
			};
			fetchDeviceData();
		}
	}, [isEditMode, deviceId, router]);

	const handleSubmit = async () => {
		setIsDisabled(true);
		setIsLoading(true);

		const device: DeviceFormData = {
			deviceBrand,
			deviceModel,
			price: Number(price),
			currency,
			deviceImage: deviceImage as unknown as File,
			deviceModelNumber,
			back_camera,
			battery,
			color,
			data_storage,
			display,
			front_camera,
			memory,
			network,
			os,
			other_features,
			processor_cpu,
			sap: Number(sap),
			screen_size,
			sld: Number(sld),
			deviceType,
			case_colors,
			windows_version,
			isActive,
			sentinel_cover,
		};

		try {
			if (isEditMode && deviceId) {
				await updateDevice(deviceId, device);
				showToast({
					type: "success",
					message: "Device updated successfully",
					duration: 5000,
				});
			} else {
				await createDevice(device);
				showToast({
					type: "success",
					message: "Device created successfully",
					duration: 3000,
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
				message:
					error.message ||
					(isEditMode ? "Device update failed" : "Device creation failed"),
				duration: 8000,
			});
		} finally {
			setIsLoading(false);
			setIsDisabled(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="mb-4">
				<h1 className="text-2xl font-bold">
					<span className="text-blue-600">
						{isEditMode
							? `Edit ${deviceBrand || "Device"} `
							: "Create New Device"}
					</span>
				</h1>
			</div>

			{/* Basic Device Information */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h2 className="text-lg font-semibold mb-4 text-gray-800">
					Basic Device Information
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<FormField
						label="Device Brand"
						errorMessage={deviceBrandError}
						value={deviceBrand}
						onChange={handleDeviceBrandChange}
						placeholder="Enter device brand"
						type="text"
						required
						htmlFor="deviceBrand"
						id="deviceBrand"
						size="sm"
					/>
					<FormField
						label="Device Model"
						errorMessage={deviceModelError}
						value={deviceModel}
						onChange={handleDeviceModelChange}
						placeholder="Enter device model"
						type="text"
						required
						htmlFor="deviceModel"
						id="deviceModel"
						size="sm"
					/>
					<FormField
						label="Device Model Number"
						errorMessage={deviceModelNumberError}
						value={deviceModelNumber}
						onChange={handleDeviceModelNumberChange}
						placeholder="Enter device model number"
						type="text"
						required
						htmlFor="deviceModelNumber"
						id="deviceModelNumber"
						size="sm"
					/>
					<SelectField
						label="Device Type"
						htmlFor="deviceType"
						id="deviceType"
						placeholder="Select device type"
						options={[
							{ label: "ANDROID", value: "ANDROID" },
							{ label: "IOS", value: "IOS" },
							{ label: "HOME_APPLIANCE", value: "HOME_APPLIANCE" },
							{ label: "COMPUTER", value: "COMPUTER" },
							{ label: "ACCESSORIES", value: "ACCESSORIES" },
						]}
						onChange={handleDeviceTypeChange}
						defaultSelectedKeys={deviceType ? [deviceType] : []}
						size="sm"
					/>
					<FormField
						label="Price"
						errorMessage={priceError}
						value={price}
						onChange={handlePriceChange}
						placeholder="Enter price"
						type="number"
						required
						htmlFor="price"
						id="price"
						size="sm"
					/>
					<FormField
						label="Currency"
						errorMessage={currencyError}
						value={currency}
						onChange={handleCurrencyChange}
						placeholder="NGN"
						type="text"
						required
						htmlFor="currency"
						id="currency"
						size="sm"
					/>
				</div>
			</div>

			{/* Physical Specifications */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h2 className="text-lg font-semibold mb-4 text-gray-800">
					Physical Specifications
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<FormField
						label="Display"
						errorMessage={displayError}
						value={display}
						onChange={handleDisplayChange}
						placeholder="Enter display"
						type="text"
						required
						htmlFor="display"
						id="display"
						size="sm"
					/>
					<FormField
						label="Screen Size"
						errorMessage={screen_sizeError}
						value={screen_size}
						onChange={handleScreenSizeChange}
						placeholder="Enter screen size"
						type="text"
						required
						htmlFor="screen_size"
						id="screen_size"
						size="sm"
					/>
					<SelectField
						label="Color"
						errorMessage={colorError}
						htmlFor="color"
						id="color"
						placeholder="Enter color"
						options={[
							{ label: "Black", value: "black" },
							{ label: "White", value: "white" },
							{ label: "Silver", value: "silver" },
							{ label: "Gold", value: "gold" },
							{ label: "Rose Gold", value: "rose_gold" },
							{ label: "Blue", value: "blue" },
							{ label: "Red", value: "red" },
							{ label: "Purple", value: "purple" },
							{ label: "Green", value: "green" },
						]}
						onChange={handleColorChange}
						defaultSelectedKeys={color ? [color] : []}
						size="sm"
					/>
					<SelectField
						label="Case Colors"
						errorMessage={case_colorsError}
						htmlFor="case_colors"
						id="case_colors"
						placeholder="Select case color"
						options={[
							{ label: "Black", value: "black" },
							{ label: "White", value: "white" },
							{ label: "Silver", value: "silver" },
							{ label: "Gold", value: "gold" },
							{ label: "Rose Gold", value: "rose_gold" },
							{ label: "Blue", value: "blue" },
							{ label: "Red", value: "red" },
							{ label: "Purple", value: "purple" },
							{ label: "Green", value: "green" },
						]}
						onChange={handleCaseColorsChange}
						defaultSelectedKeys={case_colors ? [case_colors] : []}
						size="sm"
					/>
				</div>
			</div>

			{/* Camera & Battery */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h2 className="text-lg font-semibold mb-4 text-gray-800">
					Camera & Battery
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<FormField
						label="Back Camera"
						errorMessage={back_cameraError}
						value={back_camera}
						onChange={handleBackCameraChange}
						placeholder="Enter back camera"
						type="text"
						required
						htmlFor="back_camera"
						id="back_camera"
						size="sm"
					/>
					<FormField
						label="Front Camera"
						errorMessage={front_cameraError}
						value={front_camera}
						onChange={handleFrontCameraChange}
						placeholder="Enter front camera"
						type="text"
						required
						htmlFor="front_camera"
						id="front_camera"
						size="sm"
					/>
					<FormField
						label="Battery"
						errorMessage={batteryError}
						value={battery}
						onChange={handleBatteryChange}
						placeholder="Enter battery"
						type="text"
						required
						htmlFor="battery"
						id="battery"
						size="sm"
					/>
				</div>
			</div>

			{/* Technical Specifications */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h2 className="text-lg font-semibold mb-4 text-gray-800">
					Technical Specifications
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<FormField
						label="Processor CPU"
						errorMessage={processor_cpuError}
						value={processor_cpu}
						onChange={handleProcessorCpuChange}
						placeholder="Enter processor cpu"
						type="text"
						required
						htmlFor="processor_cpu"
						id="processor_cpu"
						size="sm"
					/>
					<FormField
						label="Memory"
						errorMessage={memoryError}
						value={memory}
						onChange={handleMemoryChange}
						placeholder="Enter memory"
						type="text"
						required
						htmlFor="memory"
						id="memory"
						size="sm"
					/>
					<FormField
						label="Data Storage"
						errorMessage={data_storageError}
						value={data_storage}
						onChange={handleDataStorageChange}
						placeholder="Enter data storage"
						type="text"
						required
						htmlFor="data_storage"
						id="data_storage"
						size="sm"
					/>
					<FormField
						label="Network"
						errorMessage={networkError}
						value={network}
						onChange={handleNetworkChange}
						placeholder="Enter network"
						type="text"
						required
						htmlFor="network"
						id="network"
						size="sm"
					/>
					<FormField
						label="OS"
						errorMessage={osError}
						value={os}
						onChange={handleOsChange}
						placeholder="Enter os"
						type="text"
						required
						htmlFor="os"
						id="os"
						size="sm"
					/>
					<SelectField
						label="Windows Version"
						errorMessage={windows_versionError}
						htmlFor="windows_version"
						id="windows_version"
						placeholder="Select Windows version"
						options={[
							{ label: "Android", value: "ANDROID 13  " },
							{ label: "iOS", value: "IOS 17" },
							{ label: "Windows", value: "WINDOWS 11" },
							{ label: "Linux", value: "LINUX" },
							{ label: "Chrome OS", value: "CHROME_OS" },
							{ label: "Other", value: "OTHER" },
						]}
						onChange={handleWindowsVersionChange}
						defaultSelectedKeys={windows_version ? [windows_version] : []}
						size="sm"
					/>
				</div>
			</div>

			{/* Business Information */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h2 className="text-lg font-semibold mb-4 text-gray-800">
					Business Information
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<FormField
						label="Sentinel Cover"
						errorMessage={sentinel_coverError}
						value={sentinel_cover}
						onChange={handleSentinelCoverChange}
						placeholder="Enter sentinel cover"
						type="text"
						required
						htmlFor="sentinel_cover"
						id="sentinel_cover"
						size="sm"
					/>
					<FormField
						label="SAP"
						errorMessage={sapError}
						value={sap}
						onChange={handleSapChange}
						placeholder="Enter sap"
						type="number"
						required
						htmlFor="sap"
						id="sap"
						size="sm"
					/>
					<FormField
						label="SLD"
						errorMessage={sldError}
						value={sld}
						onChange={handleSldChange}
						placeholder="Enter sld"
						type="number"
						required
						htmlFor="sld"
						id="sld"
						size="sm"
					/>
					<SelectField
						label="Is Active"
						errorMessage={isActiveError}
						htmlFor="isActive"
						id="isActive"
						placeholder="Select status"
						options={[
							{ label: "Yes", value: "true" },
							{ label: "No", value: "false" },
						]}
						onChange={handleIsActiveChange}
						defaultSelectedKeys={isActive ? ["true"] : ["false"]}
						size="sm"
					/>
				</div>
			</div>

			{/* Additional Features & Media */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h2 className="text-lg font-semibold mb-4 text-gray-800">
					Additional Features & Media
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<FormField
							label="Other Features"
							errorMessage={other_featuresError}
							value={other_features}
							onChange={handleOtherFeaturesChange}
							placeholder="Enter other features"
							type="text"
							required
							htmlFor="other_features"
							id="other_features"
							size="sm"
						/>
					</div>
					<div>
						<InputFileBoxField
							label="Device Image"
							errorMessage={deviceImageError}
							onChange={handleDeviceImageChange}
							required
							isInvalid={false}
							id="deviceImage"
							htmlFor="deviceImage"
							reqValue="*"
						/>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3 justify-end">
				<Button
					color="default"
					variant="light"
					size="sm"
					className="w-fit px-6 py-2"
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
				<Button
					color="primary"
					size="sm"
					className="w-fit px-6 py-2"
					isLoading={isloading}
					isDisabled={isDisabled}
					onPress={handleSubmit}
				>
					{isEditMode ? "Update Device" : "Create Device"}
				</Button>
			</div>
		</div>
	);
};

export default DeviceForm;
