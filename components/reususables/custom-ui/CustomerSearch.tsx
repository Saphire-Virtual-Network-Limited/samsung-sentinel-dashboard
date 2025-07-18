"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { Search } from "lucide-react";
import { getAllCustomerBasicRecord, showToast } from "@/lib";
import { FormField } from "@/components/reususables";

interface CustomerSearchProps {
  onClose?: () => void;
  className?: string;
}

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

export default function CustomerSearch({ onClose, className = "" }: CustomerSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Get the role from the URL path (e.g., /access/dev/customers -> dev)
  const role = pathname.split("/")[2];

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const resultsPerPage = 20;

  // Load all customers on component mount
  React.useEffect(() => {
    const loadCustomers = async () => {
      setIsSearching(true);
      try {
        const response = await getAllCustomerBasicRecord();
        if (response && response.data) {
          setAllCustomers(response.data);
        }
      } catch (error: any) {
        console.error("Error loading customers:", error);
        showToast({
          type: "error",
          message: error.message || "Failed to load customers",
          duration: 5000,
        });
      } finally {
        setIsSearching(false);
      }
    };

    loadCustomers();
  }, []);

  // Search function with client-side filtering
  const handleSearch = (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchTotalPages(0);
      return;
    }

    const filteredResults = allCustomers.filter((customer) => {
      const searchTerm = query.toLowerCase();
      return (
        customer.firstName?.toLowerCase().includes(searchTerm) ||
        customer.lastName?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.mainPhoneNumber?.toLowerCase().includes(searchTerm) ||
        customer.bvnPhoneNumber?.toLowerCase().includes(searchTerm) ||
        customer.customerId?.toLowerCase().includes(searchTerm) ||
        customer.bvn?.toString().toLowerCase().includes(searchTerm) ||
        customer.LoanRecord?.[0]?.loanRecordId?.toLowerCase().includes(searchTerm) ||
        customer.LoanRecord?.[0]?.storeId?.toLowerCase().includes(searchTerm)
      );
    });

    setSearchTotal(filteredResults.length);
    setSearchTotalPages(Math.ceil(filteredResults.length / resultsPerPage));
    setSearchPage(page);

    // Apply pagination
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    setSearchResults(filteredResults.slice(startIndex, endIndex));
  };

  // Handle search input change with debounce
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      // Debounce search to avoid too many filter operations
      setTimeout(() => {
        handleSearch(value, 1);
      }, 300);
    } else {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchTotalPages(0);
    }
  };

  // Handle customer selection from search results
  const handleCustomerSelect = (customerId: string) => {
    router.push(`/access/${role}/customers/${customerId}`);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <FormField
        label="Search Customers"
        htmlFor="search"
        type="text"
        id="search"
        placeholder="Search by name, email, phone, BVN, or customer ID..."
        value={searchQuery}
        onChange={(e) => handleSearchInputChange(e as string)}
        size="sm"
        startcnt={<Search className="w-4 h-4 text-default-400" />}
      />

      {/* Loading State */}
      {isSearching && allCustomers.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2 text-default-500">Loading customers...</span>
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-default-500">
              Found {searchTotal} customer(s)
            </p>
            {searchTotalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="light"
                  isDisabled={searchPage === 1}
                  onPress={() => handleSearch(searchQuery, searchPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-default-500">
                  Page {searchPage} of {searchTotalPages}
                </span>
                <Button
                  size="sm"
                  variant="light"
                  isDisabled={searchPage === searchTotalPages}
                  onPress={() => handleSearch(searchQuery, searchPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="bg-default-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-default-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-200">
                  {searchResults.map((result, index) => (
                    <tr
                      key={result.customerId || index}
                      className="hover:bg-default-100 cursor-pointer transition-colors"
                      onClick={() => handleCustomerSelect(result.customerId)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-default-900">
                              {result.firstName} {result.lastName}
                            </div>
                            <div className="text-xs text-default-500">
                              {result.email}
                            </div>
                          </div>
                          <Chip
                            color={result.dobMisMatch ? "danger" : "success"}
                            variant="flat"
                            size="sm"
                          >
                            {result.dobMisMatch === false ? "✓" : "✗"}
                          </Chip>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-default-900">
                        {result.customerId}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-default-900">
                        {result.mainPhoneNumber || result.bvnPhoneNumber || "N/A"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Chip
                          color={
                            result.LoanRecord?.[0]?.loanStatus === "APPROVED"
                              ? "success"
                              : result.LoanRecord?.[0]?.loanStatus === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          variant="flat"
                          size="sm"
                        >
                          {result.LoanRecord?.[0]?.loanStatus || "PENDING"}
                        </Chip>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => handleCustomerSelect(result.customerId)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!isSearching && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-8">
          <EmptyState
            title="No Customers Found"
            description="No customers match your search criteria. Try a different search term."
            icon={<Search className="w-12 h-12 text-default-300" />}
          />
        </div>
      )}

      {!searchQuery && allCustomers.length > 0 && (
        <div className="text-center py-8">
          <EmptyState
            title="Search Customers"
            description={`Enter a search term to find customers by name, email, phone, BVN, or customer ID. (${allCustomers.length} customers loaded)`}
            icon={<Search className="w-12 h-12 text-default-300" />}
          />
        </div>
      )}
    </div>
  );
} 