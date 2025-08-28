"use client"
import { ArrowUp, ImagePlus, Loader2, User, X } from 'lucide-react'
import React, { use, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import axios from 'axios';
import { RunStatus } from '@/services/GlobalApi';
import Image from 'next/image';
import ThumbnailList from './_components/ThumbnailList';

function AiThumbnailGenerator() {
    const [userInput, setUserInput] = useState<string>('');
    const [referenceImage, setReferenceImage] = useState<any>();
    const [userImage, setUserImage] = useState<any>();
    const [referenceImagePreview, setReferenceImagePreview] = useState<string>('')
    const [referenceUserImagePreview, setReferenceUserImagePreview] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [outputThumbnailImage, setOutputThumbnailImage] = useState<string>('')
    const [eventId, setEventId] = useState<string | null>(null);
    const isGenerating = useRef(false);

    
    const onHandleFileChange = (field: string, e: any) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // only accept safe formats
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(selectedFile.type)) {
            alert("Only JPG and PNG images are allowed.");
            return;
        }

        if (field === 'referenceImageUpload') {
            setReferenceImage(selectedFile);
            setReferenceImagePreview(URL.createObjectURL(selectedFile));
        } else {
            setUserImage(selectedFile);
            setReferenceUserImagePreview(URL.createObjectURL(selectedFile));
        }
    }

    const onSubmit = async() =>{
        if (isGenerating.current || loading) return;
        isGenerating.current = true;
        setLoading(true)
        setOutputThumbnailImage("");
        setEventId(null);
        try{
            const formData = new FormData()
            userInput && formData.append('userInput', userInput)
            referenceImage && formData.append('referenceImage', referenceImage)
            userImage && formData.append('userImage', userImage)            
            console.log(formData)

            const result = await axios.post('/api/generate-thumbnail', formData);
            console.log("Thumbnail request result:",result.data)
            setEventId(result.data.runId);
        }catch(e){
            console.log(e)
            setLoading(false)
        }
    }

    const pollRunStatus = async () => {
        if (!eventId) return;

        try {
            const res = await fetch(`/api/run-status?id=${eventId}`);
            const data = await res.json();

            if (res.ok) {
                const status = data.status?.[0];
                console.log("Run status:", status);

                if (status?.status === "Completed") {
                    // assuming output is array of URLs
                    const output = status?.output?.[0];
                    console.log("Run completed, thumbnail output:", output);

                    setOutputThumbnailImage(output?.thumbnailUrl || output); 
                    setLoading(false);
                    isGenerating.current = false;
                    return;
                }

                if (status?.status === "Cancelled") {
                    setLoading(false);
                    isGenerating.current = false;
                    return;
                }

                // continue polling
                setTimeout(pollRunStatus, 5000);
            } else {
                throw new Error(data.error || "Failed to fetch run status");
            }
        } catch (err) {
            console.error("Error polling thumbnail run status:", err);
            setLoading(false);
            isGenerating.current = false;
        }
    };

    useEffect(() => {
        if (eventId) {
        pollRunStatus();
        }
    }, [eventId]);


    return (
        <div>
            <div className='px-10 md:px-20 lg:px-40'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className='flex items-center justify-center mt-20 flex-col gap-2'
                >
                    <h2 className='font-bold text-3xl'>AI Thumbnail Generator</h2>
                    <p className='text-gray-400 text-center '>
                        Your ideas are not just limited to words. Use AI to generate stunning thumbnails for your content.
                    </p>
                </motion.div>

                {/* Status / Output */}
                <div className='mt-6'>
                    {loading ? (
                        // Branded loading card with gradient frame
                        <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-[#ff7917] via-[#68dbff] to-transparent">
                            <div className="rounded-2xl h-[350px] bg-black/80 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-7 h-7 animate-spin text-white" />
                                <p className="text-white/80">Generating your thumbnail…</p>
                                <div className="w-1/2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-gradient-to-r from-[#ff7917] to-[#68dbff] animate-pulse rounded-full" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {outputThumbnailImage && (
                                <motion.div
                                    key={outputThumbnailImage}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative rounded-2xl overflow-hidden"
                                >
                                    <Image
                                        src={outputThumbnailImage}
                                        width={1200}
                                        height={800}
                                        alt='thumbnail'
                                        className='w-full h-[350px] object-cover'
                                        priority
                                    />
                                    {/* Soft readability gradient on top */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                                    {/* Thin brand border glow */}
                                    <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                {/* Input box */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className='flex gap-5 items-center p-3 border rounded-xl mt-10 bg-secondary'
                >
                    <textarea
                        placeholder='Enter the content you want to generate a thumbnail for'
                        className='w-full outline-none bg-transparent resize-none'
                        onChange={(e) => { setUserInput(e.target.value) }}
                    />
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className='p-3 cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-md hover:shadow-lg transition'
                        onClick={onSubmit}
                    >
                        {loading
                            ? <Loader2 className="w-5 h-5 animate-spin text-white" />
                            : <ArrowUp className='text-white' />
                        }
                    </motion.div>
                </motion.div>

                {/* Image uploads */}
                <div className='mt-5 flex gap-5'>
                    {/* Reference Image */}
                    <label htmlFor="referenceImageUpload" className='w-full'>
                        <AnimatePresence>
                            {referenceImagePreview ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className='relative'
                                >
                                    <X
                                        className='absolute top-2 right-2 text-white cursor-pointer bg-black/40 p-1 rounded-full hover:scale-110 transition'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setReferenceImage(null);
                                            setReferenceImagePreview('');
                                        }}
                                    />
                                    <img src={referenceImagePreview}
                                        alt="Reference"
                                        className='w-full h-full object-cover rounded-xl shadow-md'
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className='p-4 w-full border rounded-xl bg-secondary flex gap-2 items-center justify-center cursor-pointer transition'
                                >
                                    <ImagePlus />
                                    <h2> Reference Image </h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </label>
                    <input
                        type='file'
                        id="referenceImageUpload"
                        className='hidden'
                        onChange={(e) => onHandleFileChange("referenceImageUpload", e)}
                        accept='.jpg, .jpeg, .png'
                    />

                    {/* User Image */}
                    <label htmlFor="referenceUserImage" className='w-full'>
                        <AnimatePresence>
                            {referenceUserImagePreview ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className='relative'
                                >
                                    <X
                                        className='absolute top-2 right-2 text-white cursor-pointer bg-black/40 p-1 rounded-full hover:scale-110 transition'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUserImage(null);
                                            setReferenceUserImagePreview('');
                                        }}
                                    />
                                    <img src={referenceUserImagePreview}
                                        alt="User"
                                        className='w-full h-full object-cover rounded-xl shadow-md'
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className='p-4 w-full border rounded-xl bg-secondary flex gap-2 items-center justify-center cursor-pointer transition'
                                >
                                    <User />
                                    <h2> User Image </h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </label>
                    <input
                        type='file'
                        id="referenceUserImage"
                        className='hidden'
                        onChange={(e) => onHandleFileChange("referenceUserImage", e)}
                        accept='.jpg, .jpeg, .png'
                    />
                </div>
            </div>
            <ThumbnailList/>
        </div>
    )
}

export default AiThumbnailGenerator
