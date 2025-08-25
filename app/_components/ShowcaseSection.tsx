"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'

export function ShowcaseSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-3 py-1 rounded-full glass-card text-sm font-medium mb-4"
              >
                <Sparkles className="w-4 h-4 mr-2 gradient-text" />
                <span className="gradient-text">AI-Powered Features</span>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Create Content That{' '}
                <span className="gradient-text">Actually Converts</span>
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Stop guessing what works. Our AI analyzes millions of successful videos 
                to give you data-driven insights for every aspect of your content creation.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: '🧠',
                  title: 'Smart Idea Generation',
                  description: 'Get unlimited content ideas tailored to your niche and trending topics.'
                },
                {
                  icon: '🎯',
                  title: 'SEO-Optimized Titles',
                  description: 'Generate titles that rank higher and get more clicks automatically.'
                },
                {
                  icon: '🎨',
                  title: 'AI Thumbnail Creator',
                  description: 'Design eye-catching thumbnails that boost your click-through rates.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4"
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Button 
                size="lg" 
                className="gradient-bg hover-glow text-white border-0 group"
              >
                Explore All Features
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              {/* Glassmorphism container */}
              <div className="neuro-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 gradient-bg opacity-5" />
                
                {/* Mock interface */}
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Content Dashboard</h3>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { title: "10 Mind-Blowing AI Facts That Will...", views: "1.2M", status: "Published" },
                      { title: "How to Create Viral Content with...", views: "856K", status: "Scheduled" },
                      { title: "The Ultimate YouTube Growth...", views: "2.1M", status: "Draft" }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between p-4 glass-card rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.views} views</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'Published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          item.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold gradient-text">+127%</p>
                      <p className="text-xs text-muted-foreground">Growth Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold gradient-text">4.2M</p>
                      <p className="text-xs text-muted-foreground">Total Views</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-20 h-20 gradient-bg rounded-full opacity-20 blur-xl"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-8 -left-8 w-32 h-32 gradient-bg rounded-full opacity-10 blur-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}