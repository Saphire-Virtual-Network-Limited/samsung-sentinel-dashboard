"use client";

import TableCard from '@/components/reususables/custom-ui/tableCard'
import React, { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { EllipsisVertical } from 'lucide-react';
import { getAllLoanRecords, showToast } from '@/lib';
import useSWR, { mutate } from "swr";

const TableView = () => {
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);

  // Set initial date range to current month
  useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = now.toISOString().split('T')[0];
    
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(today);
  }, []);

  // SWR fetcher function
  const loanRecordFetcher = async () => {
    try {
      const res = await getAllLoanRecords(startDate, endDate);
      return res.data;
    } catch (error: any) {
      console.error("Error fetching loan records:", error);
      throw new Error(error.message || "Failed to fetch loan records");
    }
  };

  // SWR hook for data fetching
  const { data, error, isLoading } = useSWR(
    startDate && endDate ? ["getAllLoanRecords", startDate, endDate] : null,
    loanRecordFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 5000, // Poll every 5 seconds
      onSuccess: (data) => {
        if (!data || data.length === 0) {
          showToast({
            type: "warning", // Changed from error to warning for empty data
            message: "No records found for the selected date range",
            duration: 5000,
          });
        }
        setTableData(data || []); // Ensure we set empty array if data is null
      },
      onError: (err) => {
        showToast({
          type: "error",
          message: err.message || "Failed to load loan records",
          duration: 8000,
        });
      }
    }
  );

  // Function to manually trigger refresh
  const refreshData = () => {
    if (startDate && endDate) {
      mutate(["getAllLoanRecords", startDate, endDate]);
    }
  };

  // Error handling
  useEffect(() => {
    if (error) {
      console.error("Failed to load loan records", error);
      showToast({
        type: "error",
        message: error.message || "Failed to load loan records",
        duration: 8000,
      });
    }
  }, [error]);

  const columns = [
    { name: "ID", uid: "id", sortable: true },
    { name: "Name", uid: "Name", sortable: true },
    { name: "Status", uid: "status", sortable: true },
    { name: "Created At", uid: "createdAt", sortable: true },
    { name: "Actions", uid: "actions" }
  ];

  // Define event IDs for all handlers
  const VIEW_EVENT_ID = "table-view-event";
  const EXPORT_EVENT_ID = "table-export-event";
  const EDIT_EVENT_ID = "table-edit-event";
  const DELETE_EVENT_ID = "table-delete-event";
  const CREATE_EVENT_ID = "table-create-event";

  const handleView = (item: any) => {
    setSelectedItem(item);
    onViewOpen();
  };

  const handleExport = () => {
    console.log("Exporting data...");
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    onEditOpen();
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleCreate = () => {
    onCreateOpen();
  };

  const handleDateFilter = async (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    refreshData();
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener(VIEW_EVENT_ID, ((e: CustomEvent) => handleView(e.detail)) as EventListener);
    window.addEventListener(EXPORT_EVENT_ID, (() => handleExport()) as EventListener);
    window.addEventListener(EDIT_EVENT_ID, ((e: CustomEvent) => handleEdit(e.detail)) as EventListener);
    window.addEventListener(DELETE_EVENT_ID, ((e: CustomEvent) => handleDelete(e.detail)) as EventListener);
    window.addEventListener(CREATE_EVENT_ID, (() => handleCreate()) as EventListener);

    return () => {
      window.removeEventListener(VIEW_EVENT_ID, ((e: CustomEvent) => handleView(e.detail)) as EventListener);
      window.removeEventListener(EXPORT_EVENT_ID, (() => handleExport()) as EventListener);
      window.removeEventListener(EDIT_EVENT_ID, ((e: CustomEvent) => handleEdit(e.detail)) as EventListener);
      window.removeEventListener(DELETE_EVENT_ID, ((e: CustomEvent) => handleDelete(e.detail)) as EventListener);
      window.removeEventListener(CREATE_EVENT_ID, (() => handleCreate()) as EventListener);
    };
  }, []);

  const renderCell = (item: any, columnKey: React.Key) => {
    switch(columnKey) {
      case "id":
        return (
          <div>
            {item.id}
          </div>
        );
        
      case "status": 
        return (
          <div className={`${item.status === "Active" ? "text-green-500" : "text-red-500"}`}>
            {item.status}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="view"
                  onPress={() => handleView(item)}>
                  View
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  onPress={() => handleEdit(item)}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  onPress={() => handleDelete(item)}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return item[columnKey as keyof typeof item];
    }
  };

  return (
    <div className="p-4">
      <div className="w-full">
        <TableCard
          columns={columns}
          data={tableData}
          onView={VIEW_EVENT_ID}
          onExport={EXPORT_EVENT_ID}
          searchPlaceholder="Search by name, status..."
          showDateFilter={true}
          showExport={true}
          renderCell={renderCell}
          isLoading={isLoading}
          onEdit={EDIT_EVENT_ID}
          onDelete={DELETE_EVENT_ID}
          onCreate={CREATE_EVENT_ID}
        />

        {/* View Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose}>
          <ModalContent>
            {selectedItem && (
              <>
                <ModalHeader>View {selectedItem.name}</ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Email</p>
                      <p>{selectedItem.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p>{selectedItem.phone}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Address</p>
                      <p>{selectedItem.address}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status</p>
                      <p className={selectedItem.status === "Active" ? "text-green-500" : "text-red-500"}>
                        {selectedItem.status}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Created At</p>
                      <p>{new Date(selectedItem.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onViewClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose}>
          <ModalContent>
            {selectedItem && (
              <>
                <ModalHeader>Edit {selectedItem.name}</ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    {/* Add your edit form fields here */}
                    <p>Edit form coming soon...</p>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={onEditClose}>
                    Save
                  </Button>
                  <Button color="danger" variant="light" onPress={onEditClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Create Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
          <ModalContent>
            <>
              <ModalHeader>Create New Item</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {/* Add your create form fields here */}
                  <p>Create form coming soon...</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onCreateClose}>
                  Create
                </Button>
                <Button color="danger" variant="light" onPress={onCreateClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            {selectedItem && (
              <>
                <ModalHeader>Delete Confirmation</ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete {selectedItem.name}?</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="solid" onPress={onDeleteClose}>
                    Delete
                  </Button>
                  <Button color="default" variant="light" onPress={onDeleteClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}

export default TableView