"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { showToast, searchGlobalCustomer } from "@/lib";
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
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-8"
  >
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-default-100 rounded-full">{icon}</div>
    </div>
    <h3 className="text-lg font-semibold text-default-900 mb-2">{title}</h3>
    <p className="text-default-500 text-sm">{description}</p>
  </motion.div>
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
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const resultsPerPage = 20;

  // Search function that calls the API directly
  const handleSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchTotalPages(0);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchGlobalCustomer(query);
      if (response && response.data) {
        setSearchResults(response.data);
        setSearchTotal(response.data.length);
        setSearchTotalPages(Math.ceil(response.data.length / resultsPerPage));
        setSearchPage(page);
      } else {
        setSearchResults([]);
        setSearchTotal(0);
        setSearchTotalPages(0);
      }
    } catch (error: any) {
      console.error("Error searching customers:", error);
      showToast({
        type: "error",
        message: error.message || "Failed to search customers",
        duration: 5000,
      });
      setSearchResults([]);
      setSearchTotal(0);
      setSearchTotalPages(0);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change (no debounce, just update state)
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search submit (manual trigger)
  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      await handleSearch(searchQuery, 1);
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <FormField
            label=""
            htmlFor="search" 
            type="text"
            id="search"
            placeholder="Search by name, email, phone, BVN, or customer ID..."
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e as string)}
            size="sm"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-default-400" />
            </div>
          )}
        </div>
        <Button
          color="primary"
          size="sm"
          onPress={handleSearchSubmit}
          className="w-full sm:w-fit h-10"
          isDisabled={isSearching}
          startContent={isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Loading State */}
      {isSearching && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-default-500">Searching customers...</span>
        </motion.div>
      )}

      <AnimatePresence>
        {!isSearching && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
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
                    onPress={async () => await handleSearch(searchQuery, searchPage - 1)}
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
                    onPress={async () => await handleSearch(searchQuery, searchPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="bg-default-50 rounded-lg overflow-hidden shadow-sm border border-default-200">
                <table className="w-full">
                  <thead className="bg-default-100 sticky top-0">
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
                      <motion.tr
                        key={result.customerId ? `customer-${result.customerId}` : `row-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-default-100 cursor-pointer transition-colors duration-150"
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
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <EmptyState
              title="No Customers Found"
              description="No customers match your search criteria. Try a different search term."
              icon={<Search className="w-12 h-12 text-default-300" />}
            />
          </motion.div>
        )}

        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <EmptyState
              title="Search Customers"
              description="Enter a search term to find customers by name, email, phone, BVN, or customer ID."
              icon={<Search className="w-12 h-12 text-default-300" />}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 