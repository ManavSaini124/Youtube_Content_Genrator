"use client"

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Tech YouTuber',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    content: 'This AI tool completely transformed my content strategy. My views increased by 300% in just 2 months!',
    rating: 5,
    subscribers: '250K'
  },
  {
    name: 'Marcus Chen',
    role: 'Gaming Creator',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    content: 'The thumbnail generator alone pays for itself. My click-through rates doubled overnight.',
    rating: 5,
    subscribers: '500K'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Lifestyle Vlogger',
    avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    content: 'I went from struggling with ideas to having a content calendar filled for months. Game changer!',
    rating: 5,
    subscribers: '180K'
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 gradient-bg rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 gradient-bg rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Loved by{' '}
            <span className="gradient-text">10,000+ Creators</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Join thousands of creators who are already growing faster with AI-powered tools.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="neuro-card rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-blue-500 opacity-50 mb-6" />

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.subscribers} subscribers
                    </p>
                  </div>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof brands */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-8">
            Trusted by creators from leading platforms
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            {['YouTube', 'TikTok', 'Instagram', 'Twitter', 'LinkedIn'].map((brand, index) => (
              <motion.div
                key={brand}
                whileHover={{ scale: 1.1, opacity: 1 }}
                className="text-lg font-semibold"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}