"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"
import { Menu, X, Zap } from "lucide-react"

const navItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn } = useUser()

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="gradient-bg p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI Creator</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="hover-glow">
                      Sign In
                    </Button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <Button className="gradient-bg hover-glow text-white border-0">
                      Start Free
                    </Button>
                  </SignUpButton>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button className="gradient-bg hover-glow text-white border-0">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {/* Mobile Navigation */}
<AnimatePresence>
  {isMenuOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden glass-card border-t border-white/20"
    >
      <div className="px-4 py-4 space-y-4">
        {navItems.map((item) => (
          <motion.a
            key={item.name}
            href={item.href}
            className="block text-sm font-medium hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
            whileTap={{ scale: 0.95 }}
          >
            {item.name}
          </motion.a>
        ))}

        {/* ✅ Mobile buttons */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
            {!isSignedIn ? (
                <>
                {/* Sign In (Clerk modal) */}
                    <SignInButton mode="modal">
                        <Button variant="ghost" className="justify-start">
                            Sign In
                        </Button>
                    </SignInButton>

                    {/* Start Free (Clerk sign-up modal) */}
                    <SignUpButton mode="modal">
                        <Button className="gradient-bg text-white border-0 justify-start">
                            Start Free
                        </Button>
                    </SignUpButton>
                </>
                ) : (
                    /* If logged in → show Get Started */
                    <Link href="/dashboard">
                        <Button className="gradient-bg text-white border-0 justify-start">
                            Get Started
                        </Button>
                    </Link>
                )}
                </div>
            </div>
        </motion.div>
        )}
        </AnimatePresence>
    </motion.header>
  )
}
