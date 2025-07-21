"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal, ModalContent, ModalFooter, ModalBody, ModalHeader, useDisclosure } from "@heroui/react"
import CustomerSearch from "./CustomerSearch"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib"

import { searchGlobalCustomer, showToast } from "@/lib";

export default function GlobalSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const role = pathname.split("/")[2];

  const {
    isOpen: isGlobalSearch,
    onOpen: onGlobalSearch,
    onClose: onGlobalSearchClose,
  } = useDisclosure();

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return
    setIsLoading(true)

    try {
      const response = await searchGlobalCustomer(searchQuery)
      console.log(response)
      setResults(response.data)
      showToast({ type: "success", message: "Search results fetched successfully", duration: 5000 })
    } catch (error: any) {
      console.error('Error searching customers:', error)
      setResults([])
      showToast({ type: "error", message: error.message || "Error searching customers", duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }

  console.log(results)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleGlobalSearch()
    }
  }

  const resetSearch = () => {
    setIsLoading(false)
    setSearchQuery("")
    setResults([])
  }

  const handleClose = () => {
    resetSearch()
    onGlobalSearchClose()
  }

  // Handle navigation to customer profile
  const handleRowClick = (customer: any) => {
    if (!customer.customerId) {
      showToast({ type: "error", message: "Customer ID not found", duration: 3000 })
      return
    }


    const customerProfileUrl = `/access/${role}/customers/${customer.customerId}`
    
    // Close the modal first
    handleClose()
    
    // Navigate to customer profile
    router.push(customerProfileUrl)
  }

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={onGlobalSearch}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Global Search Modal */}
      <Modal
        isOpen={isGlobalSearch}
        onClose={handleClose}
        size="5xl"
        className="m-4"
        backdrop="blur"
        isDismissable={false}
      >
        <ModalContent className="max-w-[1200px] max-h-[90vh]">
          {() => (
            <>
              <ModalHeader className="flex items-center justify-between pb-4">
                <div className="flex items-center space-x-3">
                  <Search className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Customer Search</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="rounded-full"
                >
                </Button>
              </ModalHeader>
              
              <ModalBody className="space-y-6">
                {/* Search Input Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full relative">
                    <Input
                      type="text"
                      placeholder="Search customers by name, phone, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-10 sm:h-12 text-base sm:text-lg pr-12 w-full"
                      autoFocus
                    />
                    {isLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                    <Button
                      onClick={handleGlobalSearch}
                      disabled={!searchQuery.trim() || isLoading}
                      className="h-10 sm:h-12 px-4 sm:px-6 flex-1 sm:flex-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Searching...</span>
                          <span className="sm:hidden">Search</span>
                        </div>
                      ) : (
                        <span>Search</span>
                      )}
                    </Button>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        onClick={resetSearch}
                        className="h-10 sm:h-12 px-3 sm:px-4 flex-1 sm:flex-none"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Search Results ({results.length})
                        </h3>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto max-h-[400px]">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                              <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Customer ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {results.map((result, index) => (
                                <motion.tr
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                  onClick={() => handleRowClick(result)}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {result.customerId || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {result.firstName + ' ' + result.lastName || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {result.bvnPhoneNumber || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {result.email || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      result.LoanRecord?.[0]?.loanStatus === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : result.LoanRecord?.[0]?.loanStatus === 'active'
                                        ? 'bg-blue-100 text-blue-800'
                                        : result.LoanRecord?.[0]?.loanStatus === 'inactive' || result.LoanRecord?.[0]?.loanStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {result.LoanRecord?.[0]?.loanStatus || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRowClick(result)
                                      }}
                                    >
                                      View Details
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

                  {searchQuery && results.length === 0 && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-500">
                        Try searching with different keywords or check your spelling.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ModalBody>
              
              <ModalFooter className="flex gap-2 pt-4">
                <Button
                  color="danger"
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
