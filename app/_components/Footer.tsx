"use client"

import { motion } from 'framer-motion'
import { Zap, Github, Linkedin } from 'lucide-react'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#' },
      { name: 'Templates', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Contact', href: '#contact' },
      { name: 'Status', href: '#' }
    ]
  }
]

const socialLinks = [
  { icon: Github, href: 'https://github.com/ManavSaini124' },
  { icon: Linkedin, href: 'www.linkedin.com/in/manav-saini-code' }
]

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main footer content */}
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="gradient-bg p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AI Creator</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Transform your YouTube channel with AI-powered content creation tools. 
              Generate ideas, titles, thumbnails, and grow your audience faster.
            </p>
            
            {/* Social links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:gradient-bg hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      whileHover={{ x: 4 }}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between pt-8 mt-8 border-t border-border/40"
        >
          <p className="text-muted-foreground text-sm">
            © 2025 AI Creator. All rights reserved.
          </p>

          {/* on click popup should apprar saying "coming soon */}
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
              onClick={() => alert('Its a personal project, But I like your curiosity!')}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
              onClick={() => alert('One Day I would definitely add this, Promise!')}
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
              onClick={() => alert('Have you clicked other Buttons also!')}
            >
              Cookie Policy
            </motion.a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}