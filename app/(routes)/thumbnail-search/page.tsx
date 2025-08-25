'use client'
import { Button } from '@/components/ui/button'
import axios from 'axios';
import { Loader2, Search } from 'lucide-react'
import React, { useState } from 'react'
import ThumbnailSearchList from './_components/thumbnail-search-list';
import { Skeleton } from '@/components/ui/skeleton';

export type VideoInfo = {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
    publishedAt: string;
    
}

export default function ThumbnailSearch() {
    const [userInput , setUserInput] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [videoList, setVideoList] = useState<VideoInfo[]>([]);
    
    const onSearch = async() => {
        setLoading(true)
        const result = await axios.get('/api/thumbnail-search?query='+ userInput)
        console.log(result.data);
        setLoading(false)
        setVideoList(result.data);
    }

    const SearchSimilarThumbnail = async (url: string) => {
        setLoading(true)
        const result = await axios.get('/api/thumbnail-search?thumbnailUrl='+url)
        console.log(result.data);
        setLoading(false)
        setVideoList(result.data);
    }
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h2 className="font-bold text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-[#ff7917] to-[#584424] bg-clip-text text-transparent">
                    AI Thumbnail Search
                </h2>
                <p className="mt-3 text-gray-500 text-lg max-w-2xl mx-auto">
                    Instantly discover YouTube thumbnails that match your content using AI-powered visual search.
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

            {/* Results Section */}
            <div className="mt-12">
                {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col space-y-3 rounded-xl overflow-hidden border bg-gray-50 dark:bg-neutral-900 dark:border-neutral-800 p-2"
                    >
                        <Skeleton className="h-[150px] w-full rounded-lg" />
                        <div className="space-y-2 p-2">
                        <Skeleton className="h-3 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                    <ThumbnailSearchList
                        videoList={videoList}
                        SearchSimilarThumbnail={(url: string) =>
                        SearchSimilarThumbnail(url)
                        }
                    />
                )}
            </div>
            </div>
    )
}
