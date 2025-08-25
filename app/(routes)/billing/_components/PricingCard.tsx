export function PricingCard({ tier }: { tier: PricingTier }) {
  const router = useRouter();
  const styles = themeStyles[tier.theme];
  const handleRedirect = () => {
    if (tier.name === "Basic") {
      router.push("/billing/free");
    } else if (tier.name === "Pro") {
      router.push("/billing/silver");
    } else if (tier.name === "Enterprise") {
      router.push("/billing/gold");
    }
  };

  
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
            onClick={handleRedirect}
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