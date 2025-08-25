import React from "react";
import { VideoInfo } from "../page";
import VideoCard from "./video-card";

type Props = {
  videoList: VideoInfo[] | undefined;
  SearchSimilarThumbnail: (url: string) => void;
};

function ThumbnailSearchList({ videoList, SearchSimilarThumbnail }: Props) {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10 max-w-6xl mx-auto">
        {videoList?.map((video, index) => (
          <VideoCard
            key={index}
            VideoInfo={video}
            onSimilar={SearchSimilarThumbnail}
          />
        ))}
      </div>
    </div>
  );
}

export default ThumbnailSearchList;
