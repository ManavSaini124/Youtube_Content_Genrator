import React from 'react'
import { Content } from '../page'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  content: Content | null
  loading: boolean
}
type ImagePrompt = {
  heading: string;
  prompt: string;
};

function ContentDisplay({ content, loading }: Props) {
  const copyToClipboard = () => {
    if (content?.content?.description) {
      navigator.clipboard.writeText(content.content.description)
    }
  }

  return (
    <div className="mt-12">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="w-full h-[200px] rounded-lg" />
          <Skeleton className="w-full h-[200px] rounded-lg" />
          <Skeleton className="w-full h-[200px] rounded-lg" />
          <Skeleton className="w-full h-[200px] rounded-lg" />
        </div>
      ) : content ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {/* Titles */}
          <div className="border rounded-2xl bg-white dark:bg-neutral-900 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Title Suggestions</h2>
            <div className="space-y-4">
              {content?.content?.titles?.map((title, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-neutral-800"
                >
                  <h3 className="text-lg font-semibold">{title.title}</h3>
                  <p className="text-sm text-gray-500">
                    SEO Score: {title.seo_score}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="border rounded-2xl bg-white dark:bg-neutral-900 shadow-sm p-6 relative">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {content?.content?.description}
            </p>
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              size="sm"
              className="absolute top-6 right-6 flex items-center gap-2"
            >
              <Copy size={16} /> Copy
            </Button>
          </div>

          {/* Tags */}
          <div className="md:col-span-2 border rounded-2xl bg-white dark:bg-neutral-900 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {content?.content?.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="border rounded-2xl bg-white dark:bg-neutral-900 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Generated Thumbnail</h2>
            <Link href={content?.thumbnailUrl || '#'} target="_blank">
              <Image
                src={content?.thumbnailUrl || '/placeholder.png'}
                alt="thumbnail"
                width={500}
                height={300}
                className="rounded-xl shadow-md w-full object-cover"
              />
            </Link>
          </div>

          {/* Thumbnail Prompts */}
          <div className="border rounded-2xl bg-white dark:bg-neutral-900 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Thumbnail Prompts</h2>
            <div className="space-y-4">
              {content?.content?.image_prompts?.map((prompt: ImagePrompt, index: number) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-gray-50 dark:bg-neutral-800"
                >
                  <h4 className="font-semibold">{prompt.heading}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {prompt.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ContentDisplay
