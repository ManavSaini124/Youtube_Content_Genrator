'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, Home } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Import and trigger confetti
    const triggerConfetti = async () => {
      const confetti = (await import('canvas-confetti')).default
      
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff7917', '#68dbff', '#584424', '#4ade80', '#f59e0b']
      })

      // Delayed second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#ff7917', '#68dbff', '#584424', '#4ade80', '#f59e0b']
        })
      }, 300)

      // Delayed third burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#ff7917', '#68dbff', '#584424', '#4ade80', '#f59e0b']
        })
      }, 600)

      // Final celebration
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.4 },
          colors: ['#ff7917', '#68dbff', '#584424', '#4ade80', '#f59e0b']
        })
      }, 1000)
    }

    triggerConfetti()
  }, [])

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleBackToShopping = () => {
    router.push('/products')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Animation Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer animated ring */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse flex items-center justify-center">
              {/* Inner circle */}
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-xl">
                <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -top-4 left-1/2 w-4 h-4 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Success Message Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center space-y-8">
            {/* Main Message */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎉 Payment Successful!
              </h1>
              <div className="text-2xl text-gray-700 space-y-2">
                <p>Just kidding! 😄</p>
                <p className="text-lg text-gray-600">No money was actually charged</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <p className="font-mono font-semibold text-gray-800">#ORD-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <p className="font-semibold text-green-600 text-lg">$369.97</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-semibold text-green-600">Confirmed ✨</p>
                </div>
              </div>
            </div>

            {/* Fun Message */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-orange-800 font-medium">
                🚀 This was just a demo! Your imagination has been successfully charged with inspiration.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleBackToDashboard}
                className="px-8 py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={handleBackToShopping}
                variant="outline"
                className="px-8 py-6 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 transform hover:scale-105 transition-all duration-200 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </div>

            {/* Footer Message */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                A confirmation email would have been sent to your email address if this were real! 📧
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements for Extra Fun */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-6 h-6 bg-pink-400 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}></div>
          <div className="absolute top-32 right-20 w-4 h-4 bg-yellow-400 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '2.5s' }}></div>
          <div className="absolute bottom-40 left-20 w-8 h-8 bg-blue-400 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '3s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-green-400 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '3.5s', animationDuration: '3.5s' }}></div>
        </div>
      </div>
    </div>
  )
}