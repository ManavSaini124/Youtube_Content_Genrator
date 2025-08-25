import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios'
import { Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react'

type Thumbnail = {
    id: number,
    thumbnailUrl: string,
    refImage: string,
    userInput: string,
}

function ThumbnailList() {
    const[thumbnailList, setThumbnailList] =useState<Thumbnail[]>([]);
    const[loading, setLoading] = useState<boolean>(false);
    useEffect(()=>{
        GetThumbnailList();
    },[])
    const GetThumbnailList = async() =>{
        try {
            setLoading(true);
            const result = await axios.get('/api/generate-thumbnail');
            console.log('result:', result.data);
            setThumbnailList(result.data);
        } catch (error) {
            console.error('Error fetching thumbnails:', error);
        } finally {
            console.log('Thumbnail list:', thumbnailList);
            setLoading(false);
        }
    }
    return (
        <div className='mt-10'>
            <h2 className="relative font-bold text-3xl mb-8 text-gray-900">
                Previously Generated Thumbnails
                <span className="absolute left-0 -bottom-2 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
            </h2>

            {/* Empty State */}
            {!loading && thumbnailList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg border">
                    <Image 
                        src="/empty.svg" // 👉 put an illustration here (like in your first screenshot)
                        width={180} 
                        height={180} 
                        alt="No thumbnails"
                        className="mb-6"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">No Thumbnails Yet</h3>
                    <p className="text-gray-500 text-center mt-2 max-w-md">
                        Generate your first thumbnail and it will appear here.  
                        Use the generator above to get started.
                    </p>
                </div>
            )}

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 '>
                {!loading ? thumbnailList.map((thumbnail, index)=>(
                    thumbnail.thumbnailUrl ? (
                    <Link key={index} href={thumbnail.thumbnailUrl} target="_blank">
                        <div  className='group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-secondary border'>
                            <div className='relative w-full h-[150px]'>
                                <Image 
                                    src={thumbnail.thumbnailUrl} 
                                    fill 
                                    alt="thumbnail" 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                            </div>
                            <div className="p-3">
                                <p className="text-sm text-gray-400 line-clamp-2 italic">
                                    {thumbnail.userInput || 'Generated thumbnail'}
                                </p>
                            </div>
                        </div>
                    </Link>
                    ) : null
                )):
                // skeleton effect
                Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col space-y-3 rounded-xl overflow-hidden border bg-secondary p-2"
                    >
                    <Skeleton className="h-[150px] w-full rounded-xl" />
                    <div className="space-y-2 p-2">
                        <Skeleton className="h-3 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                    </div>
                ))
                }     
            </div>
        </div>
    )
}

export default ThumbnailList