"use client";

import React, { useEffect, useState } from "react";
import { Button, Snippet } from "@heroui/react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import {
 getCommunicationLogByCustomerId,
 getAllCommunicationLog,
 postCommunicationLog,
 updateCommunication,
 deleteCommunicationLog
} from "@/lib";
import { createSchema, useField } from "@/lib";
import { FormField } from "@/components/reususables";
import { useParams } from "next/navigation";
import { showToast } from "@/lib";



const CommunicationLogSchema = createSchema((value: string) => /^[a-zA-Z0-9]+$/.test(value), "Message must contain only numbers and letters");

// Utility Components
const InfoCard = ({
  title,
  children,
  className = "",
  icon,
  collapsible = false,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!collapsible) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
      >
        <div className="p-3 border-b border-default-200">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-default-900">{title}</h3>
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden ${className}`}
    >
      <div
        className="p-3 border-b border-default-200 cursor-pointer hover:bg-default-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-default-900">{title}</h3>
          </div>
          <Button
            variant="light"
            size="sm"
            isIconOnly
            className="text-default-500"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-none opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const InfoField = ({
  label,
  value,
  endComponent,
  copyable = false,
}: {
  label: string;
  value?: string | null;
  endComponent?: React.ReactNode;
  copyable?: boolean;
}) => (
  <div className="bg-default-50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-1">
      <div className="text-sm text-default-500">{label}</div>
      {endComponent}
    </div>
    <div className="font-medium text-default-900 flex items-center gap-2">
      {value || "N/A"}
      {copyable && value && (
        <Snippet
          codeString={value}
          className="p-0"
          size="sm"
          hideSymbol
          hideCopyButton={false}
        />
      )}
    </div>
  </div>
);

const EmptyState = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="text-center py-8">
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-default-100 rounded-full">{icon}</div>
    </div>
    <h3 className="text-lg font-semibold text-default-900 mb-2">{title}</h3>
    <p className="text-default-500 text-sm">{description}</p>
  </div>
);

const CommunicationLog = () => {
    const params = useParams();
    const customerId = params.id as string;
    const [communicationLogs, setCommunicationLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const { value: note, error: noteError, handleChange: handleNoteChange } = useField("", CommunicationLogSchema);

    // Fetch communication logs on component mount
    useEffect(() => {
        const fetchCommunicationLogs = async () => {
            try {
                console.log("Fetching communication logs for customer ID:", customerId);
                const response = await getCommunicationLogByCustomerId(customerId);
                setCommunicationLogs(response.data || []);
            } catch (error: any) {
                console.error("Error fetching communication logs:", error);
                showToast({type: "error", message: "Error fetching communication logs", duration: 5000});
            } finally {
                setIsLoading(false);
            }
        };

        if (customerId) {
            setIsLoading(true);
            fetchCommunicationLogs();
        } else {
            console.log("No customer ID found in URL params");
            setIsLoading(false);
        }
    }, [customerId]);

    console.log("Customer ID from URL:", customerId);
    console.log("Communication logs:", communicationLogs);

    useEffect(() => {
        setIsDisabled(note === "" || note === null || note === undefined);
    }, [note]);

    const handlePostCommunication = async () => {
        if (!customerId) {
            showToast({type: "error", message: "Customer ID not found", duration: 5000});
            return;
        }
        
        setIsDisabled(true);
        setIsLoading(true);
        try {
            console.log("Posting communication log for customer ID:", customerId);
            const response = await postCommunicationLog(customerId, note);
            showToast({type: "success", message: "Message posted successfully", duration: 3000});
            
            // Refresh the communication logs after posting
            const updatedLogs = await getCommunicationLogByCustomerId(customerId);
            setCommunicationLogs(updatedLogs.data || []);
            
            // Clear the note field
            handleNoteChange("");
        } catch (error:any) {
            showToast({type: "error", message: error.message || "Error posting message", duration: 8000});
        } finally {
            setIsDisabled(false);
            setIsLoading(false);
        }
    }


  return (
    <div>
                <InfoCard
                title="Communication LOG"
                icon={<Users className="w-5 h-5 text-default-600" />}
                collapsible={true}
                defaultExpanded={true}
              >
                <div className="overflow-x-auto">

                    {/* Post Communication Log */}
                <div className="bg-white rounded-xl shadow-sm border border-default-200 overflow-hidden mt-4">
                  <form>
                  <div className="p-4">
                    <FormField
                      label="Post Communication Note"
                      htmlFor="note"
                      type="text"
                      id="note"
                      placeholder="Enter Communication Note"
                      value={note}
                      onChange={handleNoteChange}
                      errorMessage={noteError}
                      size="sm"
                    />
                    <Button
                      className="mt-4 w-32"
                      size="sm"
                      color="primary"
                      variant="solid"
                      onPress={handlePostCommunication}
                      isDisabled={isDisabled}
                      isLoading={isLoading}
                    >
                      Post
                    </Button>
                  </div>
                  </form>
                </div>

                {/* Communication Logs Table */}
                  <table className="min-w-full divide-y divide-default-200">
                    <thead className="bg-default-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                        >
                          S/N
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                        >
                          Message
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                        >
                          Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                        >
                          Posted By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-default-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                            <p className="mt-2 text-sm text-default-500">Loading communication logs...</p>
                          </td>
                        </tr>
                      ) : communicationLogs.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center">
                            <EmptyState
                              title="No Communication Logs"
                              description="There are no messages to display at this time."
                              icon={
                                <svg
                                  className="w-12 h-12 mb-4 text-default-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                  />
                                </svg>
                              }
                            />
                          </td>
                        </tr>
                      ) : (
                        communicationLogs.map((log, index) => (
                          <tr key={log.id || index} className="hover:bg-default-50">
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-default-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm text-default-900">
                              {log.message || log.note || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-default-500">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-default-500">
                              {log.created_by_id || "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                
              </InfoCard>
    </div>
  )
}

export default CommunicationLog