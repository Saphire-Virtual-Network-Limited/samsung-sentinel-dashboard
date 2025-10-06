"use client";

import { FormField } from "@/components/reususables";
import { SelectField } from "@/components/reususables/form";
import { useNaijaStates } from "@/hooks/user-mangement/use-naija-states";
import { useAuth, clusterSupervisor, getClustersForAssignment } from "@/lib";
import { showToast } from "@/lib/showNotification";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { GeneralSans_Meduim, cn } from "@/lib";

interface CreateClusterSupervisorViewProps {
  onSuccess?: () => void;
}

interface Cluster {
  id: string;
  name: string;
  supervisor: string;
  manager: string;
}

interface ClusterSupervisorFormData {
  firstName: string;
  lastName: string;
  email: string;
  telephoneNumber: string;
  clusterId: string;
  clusterName: string;
  stateName: string;
}

interface ClusterSupervisorFormErrors {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  telephoneNumber?: string | null;
  clusterId?: string | null;
  stateName?: string | null;
}

export default function CreateClusterSupervisorView({ onSuccess }: CreateClusterSupervisorViewProps) {
  const router = useRouter();
  const { userResponse } = useAuth();
  const { states, getLgas } = useNaijaStates();

  const [formData, setFormData] = useState<ClusterSupervisorFormData>({
    firstName: "",
    lastName: "",
    email: "",
    telephoneNumber: "",
    clusterId: "",
    clusterName: "",
    stateName: "",
  });

  const [errors, setErrors] = useState<ClusterSupervisorFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [clustersLoading, setClustersLoading] = useState(false);

  const fieldRefs = useRef<
    Record<string, HTMLInputElement | HTMLSelectElement | null>
  >({});

  // Fetch clusters on component mount
  useEffect(() => {
    const fetchClusters = async () => {
      setClustersLoading(true);
      try {
        const response = await getClustersForAssignment();
        const data = response?.data || response;
        if (Array.isArray(data)) {
          setClusters(data);
        }
      } catch (error) {
        console.error("Error fetching clusters:", error);
      } finally {
        setClustersLoading(false);
      }
    };

    fetchClusters();
  }, []);

  const handleFieldChange = (
    field: keyof ClusterSupervisorFormData,
    value: string
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ClusterSupervisorFormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof ClusterSupervisorFormErrors]: null }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ClusterSupervisorFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.telephoneNumber.trim()) {
      newErrors.telephoneNumber = "Phone number is required";
    } else if (!/^[0-9]{11}$/.test(formData.telephoneNumber.replace(/\D/g, ""))) {
      newErrors.telephoneNumber = "Please enter a valid 11-digit phone number";
    }

    if (!formData.clusterId.trim()) {
      newErrors.clusterId = "Cluster is required";
    }

    if (!formData.stateName.trim()) {
      newErrors.stateName = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstInvalidField = Object.keys(errors).find(
        (key) => errors[key as keyof ClusterSupervisorFormErrors]
      );
      if (firstInvalidField && fieldRefs.current[firstInvalidField]) {
        fieldRefs.current[firstInvalidField]?.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      const selectedCluster = clusters.find(cluster => cluster.id === formData.clusterId);
      const response = await clusterSupervisor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.telephoneNumber,
        clusterId: formData.clusterId,
        clusterName: selectedCluster?.name || formData.clusterName,
      });

      if (response) {
        onSuccess?.();
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          telephoneNumber: "",
          clusterId: "",
          clusterName: "",
          stateName: "",
        });
      } else {
        showToast({
          type: "success",
          message: response.message || "Cluster supervisor created successfully",
          duration: 5000,
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        message: error.message || "Failed to create cluster supervisor",
        duration: 5000,
      });
      console.error("Error creating cluster supervisor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = Object.values(formData).every(value => value.trim() !== "");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Cluster Supervisor
        </h2>
        <p className="text-gray-600">
          Add a new cluster supervisor to the system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="First Name"
            htmlFor="firstName"
            id="firstName"
            type="text"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(value) => handleFieldChange("firstName", value)}
            size="sm"
            isInvalid={!!errors.firstName}
            errorMessage={errors.firstName || undefined}
            required
          />

          <FormField
            label="Last Name"
            htmlFor="lastName"
            id="lastName"
            type="text"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(value) => handleFieldChange("lastName", value)}
            size="sm"
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName || undefined}
            required
          />

          <FormField
            label="Email Address"
            htmlFor="email"
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(value) => handleFieldChange("email", value)}
            size="sm"
            isInvalid={!!errors.email}
            errorMessage={errors.email || undefined}
            required
          />

          <FormField
            label="Phone Number"
            htmlFor="telephoneNumber"
            id="telephoneNumber"
            type="tel"
            placeholder="Enter phone number"
            value={formData.telephoneNumber}
            onChange={(value) => handleFieldChange("telephoneNumber", value)}
            size="sm"
            isInvalid={!!errors.telephoneNumber}
            errorMessage={errors.telephoneNumber || undefined}
            required
          />

          <SelectField
            label="State"
            htmlFor="stateName"
            id="stateName"
            placeholder="Select state"
            reqValue={formData.stateName}
            onChange={(value) => handleFieldChange("stateName", value as string)}
            options={states.map(state => ({
              label: state.label,
              value: state.value,
            }))}
            isInvalid={!!errors.stateName}
            errorMessage={errors.stateName || undefined}
            required
          />

          <SelectField
            label="Cluster"
            htmlFor="clusterId"
            id="clusterId"
            placeholder={clustersLoading ? "Loading clusters..." : "Select cluster"}
            reqValue={formData.clusterId}
            onChange={(value) => {
              const selectedCluster = clusters.find(cluster => cluster.id === value);
              setFormData(prev => ({
                ...prev,
                clusterId: value as string,
                clusterName: selectedCluster?.name || ""
              }));
              if (errors.clusterId) {
                setErrors(prev => ({ ...prev, clusterId: null }));
              }
            }}
            options={clusters.map(cluster => ({
              label: cluster.name,
              value: cluster.id,
            }))}
            isInvalid={!!errors.clusterId}
            errorMessage={errors.clusterId || undefined}
            required
            disabled={clustersLoading}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="light"
            onPress={() => {
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                telephoneNumber: "",
                clusterId: "",
                clusterName: "",
                stateName: "",
              });
              setErrors({});
            }}
            className="px-6"
          >
            Reset
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            isDisabled={!isValid || isLoading}
            className="px-8"
          >
            {isLoading ? "Creating..." : "Create Cluster Supervisor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
