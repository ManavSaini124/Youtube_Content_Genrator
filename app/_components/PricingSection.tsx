"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap, Building } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Zap,
    features: [
      '5 AI content ideas per month',
      '10 title suggestions',
      'Basic thumbnail templates',
      'Community support',
      '7-day content calendar'
    ],
    buttonText: 'Start Free',
    popular: false,
    gradient: 'from-gray-400 to-gray-600'
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For serious content creators',
    icon: Crown,
    features: [
      'Unlimited AI content ideas',
      'Unlimited title & description generation',
      'Advanced thumbnail creator',
      'Analytics dashboard',
      '30-day content calendar',
      'Priority support',
      'Custom templates',
      'Trend analysis'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    description: 'For teams and agencies',
    icon: Building,
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'Brand consistency checker',
      'Multi-channel management',
      'Custom AI training',
      'Dedicated account manager',
      'API access',
      'White-label options'
    ],
    buttonText: 'Contact Sales',
    popular: false,
    gradient: 'from-purple-500 to-pink-500'
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32 relative">
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
            Choose Your{' '}
            <span className="gradient-text">Growth Plan</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Start free, then upgrade when you're ready to scale your content creation.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className={`relative group ${plan.popular ? 'md:-mt-8' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="gradient-bg px-4 py-2 rounded-full text-white text-sm font-medium">
                    Most Popular
                  </div>
                </motion.div>
              )}

              <div className={`neuro-card rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl relative overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500/20' : ''}`}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} p-3 mb-6`}
                  >
                    <plan.icon className="w-full h-full text-white" />
                  </motion.div>

                  {/* Plan details */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: featureIndex * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-center"
                      >
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.popular 
                        ? 'gradient-bg hover-glow text-white border-0' 
                        : 'neuro-card hover-glow'
                    }`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}