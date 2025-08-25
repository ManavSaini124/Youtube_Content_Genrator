"use client";

import { Check, Star, Zap, Crown } from 'lucide-react';
import { useRouter } from 'next/router';

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  popular?: boolean;
  theme: 'bronze' | 'silver' | 'gold';
  icon: React.ReactNode;
  subtitle: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    subtitle: 'Perfect for getting started',
    price: '$0',
    period: 'forever',
    features: [
      'Generate 10 video ideas/month',
      'Basic video titles & descriptions',
      'Limited keyword suggestions'
    ],
    cta: 'Get Started Free',
    theme: 'bronze',
    icon: <Star className="w-8 h-8" />
  },
  {
    name: 'Pro',
    subtitle: 'Most popular choice',
    price: '$20',
    period: '/month',
    features: [
      'Everything in Basic',
      '100 video ideas/month',
      'SEO-optimized titles & descriptions',
      'Thumbnail suggestions',
      'Priority generation speed'
    ],
    cta: 'Choose Pro',
    popular: true,
    theme: 'silver',
    icon: <Zap className="w-8 h-8" />
  },
  {
    name: 'Enterprise',
    subtitle: 'For serious professionals',
    price: '$1,000',
    period: '/month',
    features: [
      'Everything in Pro',
      'Unlimited video ideas',
      'Advanced keyword & trend analysis',
      'Enterprise support',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    theme: 'gold',
    icon: <Crown className="w-8 h-8" />
  }
];

const themeStyles = {
  bronze: {
    card: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-200/50 hover:border-amber-300',
    cardShadow: 'shadow-xl shadow-amber-200/30 hover:shadow-2xl hover:shadow-amber-300/50',
    glow: 'hover:ring-4 hover:ring-amber-300/30',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconGlow: 'shadow-lg shadow-amber-400/50',
    accent: 'text-amber-800',
    price: 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent',
    button: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50',
    popular: 'bg-gradient-to-r from-amber-500 to-orange-500',
    sparkle: 'text-amber-400'
  },
  silver: {
    card: 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-2 border-slate-300/50 hover:border-slate-400 ring-2 ring-blue-500/20',
    cardShadow: 'shadow-2xl shadow-slate-300/40 hover:shadow-3xl hover:shadow-slate-400/60',
    glow: 'hover:ring-4 hover:ring-blue-400/40',
    iconBg: 'bg-gradient-to-br from-slate-400 to-slate-600',
    iconGlow: 'shadow-lg shadow-slate-400/50',
    accent: 'text-slate-800',
    price: 'bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent',
    button: 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 text-white shadow-lg shadow-slate-500/30 hover:shadow-xl hover:shadow-slate-500/50',
    popular: 'bg-gradient-to-r from-blue-500 to-purple-600',
    sparkle: 'text-slate-400'
  },
  gold: {
    card: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-2 border-yellow-300/50 hover:border-yellow-400',
    cardShadow: 'shadow-xl shadow-yellow-300/30 hover:shadow-2xl hover:shadow-yellow-400/50',
    glow: 'hover:ring-4 hover:ring-yellow-400/30',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    iconGlow: 'shadow-lg shadow-yellow-400/50',
    accent: 'text-yellow-800',
    price: 'bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent',
    button: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/50',
    popular: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    sparkle: 'text-yellow-400'
  }
};

function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>
  );
}

function PricingCard({ tier }: { tier: PricingTier }) {
  const styles = themeStyles[tier.theme];
  

  
  return (
    <div className={`relative group ${tier.popular ? 'scale-105 z-20' : 'z-10'}`}>
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className={`${styles.popular} text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse`}>
            ⭐ Most Popular
          </div>
        </div>
      )}
      
      {/* Main card */}
      <div className={`relative p-8 ${styles.card} ${styles.cardShadow} ${styles.glow} rounded-3xl transition-all duration-500 hover:-translate-y-2 transform-gpu backdrop-blur-sm border-opacity-60 hover:border-opacity-100 overflow-hidden`}>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        {/* Header with icon */}
        <div className="relative text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${styles.iconBg} ${styles.iconGlow} rounded-2xl mb-4 text-white transform group-hover:scale-110 transition-transform duration-300`}>
            {tier.icon}
          </div>
          
          <h3 className={`text-3xl font-bold ${styles.accent} mb-2 tracking-tight`}>
            {tier.name}
          </h3>
          <p className="text-gray-600 text-sm font-medium">
            {tier.subtitle}
          </p>
        </div>

        {/* Price section */}
        <div className="text-center mb-8 relative">
          <div className="flex items-baseline justify-center mb-2">
            <span className={`text-6xl font-black ${styles.price} tracking-tight`}>
              {tier.price}
            </span>
            {tier.period && (
              <span className="text-xl text-gray-500 ml-2 font-medium">
                {tier.period}
              </span>
            )}
          </div>
          {tier.price === '$0' && (
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Forever Free
            </div>
          )}
        </div>

        {/* Features list */}
        <div className="space-y-4 mb-8">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 group/feature">
              <div className={`flex-shrink-0 w-6 h-6 ${styles.iconBg} rounded-full flex items-center justify-center mt-0.5 group-hover/feature:scale-110 transition-transform duration-200`}>
                <Check className="h-3 w-3 text-white font-bold" />
              </div>
              <span className="text-gray-700 leading-relaxed font-medium group-hover/feature:text-gray-900 transition-colors duration-200">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button 
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${styles.button} relative overflow-hidden group/button`}
        >
          <span className="relative z-10">{tier.cta}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"></div>
        </button>
        
        {/* Decorative elements */}
        <div className={`absolute top-4 right-4 ${styles.sparkle} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}>
          <Star className="w-4 h-4" />
        </div>
        <div className={`absolute bottom-4 left-4 ${styles.sparkle} opacity-20 group-hover:opacity-40 transition-opacity duration-300 delay-100`}>
          <Star className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section className="relative py-24 px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
      <FloatingElements />
      
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.1),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,200,255,0.1),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-800 font-semibold text-sm mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Pricing Plans
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            Choose Your
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Perfect </span>
            Plan
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Unlock your potential with our carefully crafted pricing tiers. 
            <span className="text-gray-800 font-semibold"> Each plan is designed to grow with you.</span>
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8 items-start mb-16">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} tier={tier} />
          ))}
        </div>

        {/* Bottom section */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                30-day money-back guarantee
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                No setup fees
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                Cancel anytime
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">
            Trusted by <span className="font-semibold text-gray-700">10,000+</span> professionals worldwide
          </p>
        </div>
      </div>
    </section>
  );
}