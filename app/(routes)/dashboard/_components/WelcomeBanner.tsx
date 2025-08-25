"use client";
import { motion } from "framer-motion";
import { Sparkles, Youtube, BarChart3, Wand2 } from "lucide-react";
import Link from 'next/link'


const WelcomeBanner = ()=>{
    return(
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full rounded-2xl 
                bg-gradient-to-r from-[#ff7917] via-[#584424] to-[#68dbff] 
                text-white p-8 shadow-lg overflow-hidden"

            >
            {/* Floating glow effect */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between">
                {/* Left Content */}
                <div className="text-center md:text-left space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                        <Youtube className="w-8 h-8 text-white" />  
                        AI YouTube Analytics
                    </h1>
                    <p className="text-lg text-white/90 max-w-lg">
                        Track your growth, analyze performance, and design stunning thumbnails —
                        all powered by <span className="font-semibold">AI</span>.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                        <button className="px-5 py-2 rounded-xl bg-white text-red-600 font-medium shadow hover:bg-gray-100 transition">
                            View Analytics
                        </button>
                        <Link href="/ai-thumbnail-generator">
                            <button className="px-5 py-2 rounded-xl bg-transparent border border-white font-medium hover:bg-white/10 transition flex items-center gap-2">
                                <Wand2 className="w-4 h-4" /> Create Thumbnail
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Content */}
                <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 md:mt-0"
                >
                    <div className="bg-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                        <div className="flex items-center gap-3">
                        <BarChart3 className="w-10 h-10 text-yellow-300" />
                        <div>
                            <p className="font-semibold">Latest Insights</p>
                            <p className="text-sm text-white/70">+24% engagement growth</p>
                        </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default  WelcomeBanner;