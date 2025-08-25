'use client'
import React, { useCallback, useRef } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '@/components/ui/button'
import { Loader2, Search, Settings, Settings2 } from 'lucide-react';
import axios from 'axios';
import { RunStatus } from '@/services/GlobalApi';
import ContentDisplay from './_components/Content-display';

export type Content = {
    id: string;
    thumbnailUrl: string;
    content: subContent;
    userInput: string;
    createdAt: string;
}

type subContent = {
    description:string;
    image_prompts:any;  
    tags:[];
    titles:[{
        seo_score:number;
        title: string;
    }]
}
function AiContentGenerator() {
    const [userInput, setUserInput] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [content, setContent] = React.useState<Content|null>(null);
    const isGenerating = useRef(false);

    const onGenrate = useCallback(async () => {
        if (isGenerating.current) {
            console.log("⏩ Ignored duplicate trigger");
            return;
        }
        isGenerating.current = true;

        try {
            setLoading(true);
            setContent(null)
            const result = await axios.post('/api/ai-content-generator', {
                userInput : userInput,
            });
            console.log("Result on page ------------>",result.data)

            while(true){
                console.log("Checking run status for runId:", result.data.runId);
                const runStatus = await RunStatus(result.data.runId)
                console.log("runStatus on page ------------>",runStatus);

                if(runStatus && runStatus[0]?.status === 'Completed'){
                    console.log("runStatus[0]?.data ==>",runStatus[0]?.data)
                    setContent(runStatus?.data)
                    setLoading(false)
                    break;
                }
                if(runStatus && runStatus[0]?.status === 'Cancelled'){
                    setLoading(false);
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // console.log(result.data);
        } catch (error) {
            console.error("Error fetching outlier data:", error);
        } finally {
            setLoading(false);
            isGenerating.current = false;
        }
    },[userInput]);
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
                    Content Generator
                </h2>
                <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    Generate engaging content effortlessly. Our AI-powered tool helps you create high-quality videos, articles, and more—tailored to your audience's interests and trends.
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
                        placeholder="Enter video Idea or topic here..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-neutral-800"
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <Button
                        className="px-6 py-3 bg-gradient-to-r from-[#ff7917] to-[#584424] text-white rounded-xl font-medium hover:scale-105 transition-all disabled:opacity-50"
                        onClick={onGenrate}
                        disabled={!userInput || loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Settings size={18} /> Genrate
                            </div>
                        )}
                    </Button>
                </div>
            </motion.div>
            
           
            {(loading || content) && (
                <ContentDisplay content={content} loading={loading} />
            )}
            
    </div>

  )
}

export default AiContentGenerator