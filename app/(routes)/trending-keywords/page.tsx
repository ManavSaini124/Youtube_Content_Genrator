'use client'
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import React, { useState } from 'react'

function TrendingKeywords() {
    const [userInput,setUserInput ] = useState<string>('')
    const [loading,setLoading] = useState<boolean>(false)

    const onSearch =()=>{
        try {
            setLoading(true);
        } catch (error) {
            console.error("Search error:", error);
        } finally{
            setLoading(false);
        }


        
    }
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h2 className="font-bold text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-[#ff7917] to-[#584424] bg-clip-text text-transparent">
                    Trending keywords
                </h2>
                <p className="mt-3 text-gray-500 text-lg max-w-2xl mx-auto">
                    Discover the most talked-about topics and stay ahead of the curve with our trending keywords.
                </p>
            </div>

            {/* Search Bar Card */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-3">
                <input
                    type="text"
                    placeholder="Enter title or keyword..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-neutral-800"
                    onChange={(e) => setUserInput(e.target.value)}
                />
                <Button
                    className="px-6 py-3 bg-gradient-to-r from-[#ff7917] to-[#584424] text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                    onClick={onSearch}
                    disabled={!userInput || loading}
                >
                    {loading ? (
                    <Loader2 className="animate-spin" />
                    ) : (
                    <div className="flex items-center gap-2">
                        <Search size={18} /> Search
                    </div>
                    )}
                </Button>
                </div>
            </div>
        </div>
  )
}

export default TrendingKeywords