import React from "react";
import { VideoInfo } from "../page";
import Image from "next/image";
import { Eye, ThumbsUp, MessageCircle } from "lucide-react";

type Props = {
  VideoInfo: VideoInfo;
  onSimilar: (url: string) => void;
};

function VideoCard({ VideoInfo, onSimilar }: Props) {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={VideoInfo.thumbnail}
          alt={VideoInfo.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
          <button
            onClick={() => onSimilar(VideoInfo.thumbnail)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow-lg hover:opacity-90 transition"
          >
            Find Similar
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
          {VideoInfo.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {VideoInfo.channelTitle}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={16} /> {VideoInfo.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={16} /> {VideoInfo.likeCount}
          </span>
          {VideoInfo.commentCount && (
            <span className="flex items-center gap-1">
              <MessageCircle size={16} /> {VideoInfo.commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
