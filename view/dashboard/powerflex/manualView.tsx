'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InfoCard from '@/components/reususables/custom-ui/InfoCard'
import { Copy, Check, Link as LinkIcon } from 'lucide-react'
import { showToast } from '@/lib'

const ManualPowerflexView = () => {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const generateUniqueLink = () => {
    if (!email || !amount) {
      showToast({ type: "error", message: "Please fill in both email and amount fields" })
      return
    }

    if (!email.includes('@')) {
      showToast({ type: "error", message: "Please enter a valid email address" })
      return
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast({ type: "error", message: "Please enter a valid amount" })
      return
    }

    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const baseUrl = window.location.origin
      const link = `${baseUrl}/email=${email}&amount=${amount}`
      
      setGeneratedLink(link)
      setIsLoading(false)
      showToast({ type: "success", message: "Unique link generated successfully!" })
    }, 1000)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setIsCopied(true)
      showToast({ type: "success", message: "Link copied to clipboard!" })
      
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      showToast({ type: "error", message: "Failed to copy link" })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateUniqueLink()
  }

  const resetForm = () => {
    setEmail('')
    setAmount('')
    setGeneratedLink('')
    setIsCopied(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <InfoCard
        title="Powerflex Link Generator"
        icon={<LinkIcon className="h-6 w-6 text-blue-600" />}
      >
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">
            Generate unique payment links for customers by entering their email and amount
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Customer Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter customer email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount (₦)
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter payment amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Link'}
              </Button>
              
              {generatedLink && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={resetForm}
                >
                  Reset
                </Button>
              )}
            </div>
          </form>

          {generatedLink && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Generated Payment Link
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Payment Link:</span>
                  </div>
                  
                  <div className="bg-white p-3 rounded border break-all text-sm text-gray-800 font-mono">
                    {generatedLink}
                  </div>
                  
                  <div className="mt-3">
                    <Button
                      onClick={copyToClipboard}
                      className="w-full"
                      variant="outline"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  <p>• This link is unique and can only be used once</p>
                  <p>• Share this link with your customer to complete their payment</p>
                  <p>• The link contains the customer's email and payment amount</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </InfoCard>
    </div>
  )
}

export default ManualPowerflexView