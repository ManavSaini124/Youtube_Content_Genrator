'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Search } from 'lucide-react';
import axios from 'axios';
import VideoCardOut from './_components/videoCardOut';
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCard from './_components/skeletonCard';


export type VideoInfoOutlier = {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
    outlierScore: number;
    engagementRate: number;
    smartScore: number;
    viewsPerDay: number;
    isOutlier: boolean;  
}

function Outlier() {
    const [userInput , setUserInput] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [videoList, setVideoList] = useState<VideoInfoOutlier[]>([]);
    const onSearch = async() => {
        try{
            setLoading(true)
            const result = await axios.get('/api/outlier?query='+userInput)
            console.log(result.data);
            setVideoList(result.data);
        }catch(error){
            console.error("Error fetching outlier data:", error);
        }finally{
            setLoading(false);
        }
        
    }
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="font-bold text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-[#ff7917] to-[#584424] bg-clip-text text-transparent">
                    Outlier Detection
                </h2>
                <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    Find the hidden gems in your content. Our AI highlights unusual performance by analyzing engagement, views, and trends—so you know which videos truly stand out.
                </p>
            </motion.div>

            {/* Search Box */}
            <motion.div 
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 max-w-3xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <input
                        type="text"
                        placeholder="Enter title or keyword..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-neutral-800"
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <Button
                        className="px-6 py-3 bg-gradient-to-r from-[#ff7917] to-[#584424] text-white rounded-xl font-medium hover:scale-105 transition-all disabled:opacity-50"
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

                {/* Results */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10'>
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        : (
                            <AnimatePresence>
                                {videoList?.map((video, index)=>(
                                    <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    >
                                        <VideoCardOut VideoInfo={video} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )
                    }
                </div>
            </motion.div>
        </div>
    )
}

export default Outlier