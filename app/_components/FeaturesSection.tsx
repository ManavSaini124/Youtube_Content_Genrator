"use client"

import { motion } from 'framer-motion'
import { 
  Zap, 
  Target, 
  Palette, 
  BarChart3, 
  Package, 
  HeadphonesIcon
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Instant Content Ideas',
    description: 'Never run out of content with AI-generated ideas based on trending topics and your niche.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Target,
    title: 'SEO-Friendly Titles',
    description: 'Generate optimized titles that rank higher in search and attract more viewers.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Palette,
    title: 'AI Thumbnail Generator',
    description: 'Create stunning thumbnails that boost your click-through rates automatically.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your performance with detailed insights and growth recommendations.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Package,
    title: '25+ Templates',
    description: 'Pre-built templates for every content type and niche to get started quickly.',
    gradient: 'from-red-500 to-rose-500'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Get help whenever you need it with our dedicated support team and community.',
    gradient: 'from-indigo-500 to-purple-500'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Dominate YouTube</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Powerful AI tools designed specifically for content creators who want to grow faster and create better.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="neuro-card rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-4 group-hover:gradient-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Ready to transform your YouTube channel?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="gradient-bg hover-glow text-white px-8 py-4 rounded-xl font-semibold border-0 transition-all duration-300"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}