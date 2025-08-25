"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, ArrowRight } from 'lucide-react'
import { useUser, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"

export function HeroSection() {
    const { isSignedIn } = useUser();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-10 dark:opacity-20" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full gradient-bg opacity-20 blur-3xl"
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm font-medium"
          >
            <span className="gradient-text">🚀 AI-Powered Content Creation</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            Your YouTube Growth,{' '}
            <span className="gradient-text">Supercharged by AI</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Transform your content creation with intelligent AI tools. Generate viral ideas, 
            craft perfect titles, create stunning thumbnails, and grow your audience faster than ever.
          </motion.p>

          {/* CTA Buttons */}
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            {!isSignedIn ? (
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="gradient-bg hover-glow text-white border-0 px-8 py-4 text-lg font-medium group"
                >
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SignUpButton>
            ) : (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="gradient-bg hover-glow text-white border-0 px-8 py-4 text-lg font-medium group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex items-center justify-center gap-8 pt-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              ⭐ <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
                {/*If you are reading this, I made these numbers up, 
                    NEVER TRUST A STRANGER ON INTERNET*/}
              👥 <span>10,000+ Creators</span>
            </div>
            <div className="flex items-center gap-2">
              🔒 <span>100% Secure</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}