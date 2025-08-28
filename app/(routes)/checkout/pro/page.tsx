'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag, CreditCard, MapPin, User, Mail } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  })

  // Sample cart items
  

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate processing delay
    setTimeout(() => {
      router.push('/checkout/success')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ShoppingBag className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select onValueChange={(value) => handleInputChange('country', value)} required>
                      <SelectTrigger className="rounded-lg focus:ring-2 focus:ring-orange-500">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                        className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-amber-600 to-blue-500 hover:from-orange-600 hover:via-amber-700 hover:to-blue-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  `Pay Now - $20.00`
                )}
              </Button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
            <Card className="sticky top-8 border-none shadow-xl rounded-2xl bg-white dark:bg-neutral-900">
                <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-[#ff7917] via-[#584424] to-[#68dbff] bg-clip-text text-transparent">
                    Order Summary
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                
                {/* Selected Plan */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-[#ff7917]/10 via-[#584424]/10 to-[#68dbff]/10">
                    <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Pro Plan
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You have selected the Pro plan.
                    </p>
                    </div>
                    <div className="text-lg font-bold bg-gradient-to-r from-[#ff7917] via-[#584424] to-[#68dbff] bg-clip-text text-transparent">
                    20$/year
                    </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-gray-100">20$/year</span>
                    </div>
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Discount</span>
                    <span className="text-green-600 font-medium">– $0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-gray-100">$0.00</span>
                    </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-[#ff7917] via-[#584424] to-[#68dbff] bg-clip-text text-transparent">
                    20$/year
                    </span>
                </div>

                {/* Fun SSL Badge */}
                <div className="mt-6 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-600">
                    <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                        100% Secure • No hidden fees • Cancel anytime
                    </span>
                    </div>
                </div>
                </CardContent>
            </Card>
            </div>

        </div>
      </div>
    </div>
  )
}