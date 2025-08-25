import React from "react";
import { VideoInfoOutlier } from "../page";
import Image from "next/image";
import { Eye, ThumbsUp, MessageCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  VideoInfo: VideoInfoOutlier;
};

function VideoCardOut({ VideoInfo }: Props) {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={VideoInfo.thumbnail}
          alt={VideoInfo.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {VideoInfo.isOutlier && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            Outlier
          </span>
        )}
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
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={16} /> {VideoInfo.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={16} /> {VideoInfo.likeCount.toLocaleString()}
          </span>
          {VideoInfo.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle size={16} /> {VideoInfo.commentCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Smart Score */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">Smart Score</span>
          <span className="flex items-center gap-1 font-semibold text-orange-500">
            <Star size={14} className="fill-orange-500 text-orange-500" /> {VideoInfo.smartScore}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default VideoCardOut;