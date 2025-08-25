import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    const {searchParams} = new URL(req.url);
    let query = searchParams.get('query');

    if (query === null) {
        console.error("Query parameter is missing");
        // Handle the case where query is null
        return NextResponse.json({ error: 'Query parameter is missing' });
    }

    console.log("query ================>",query);

    // Youtube video list api
    const result = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=medium&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`)
    console.log(result.data)

    const searchdata = result.data;
    const videoIds = searchdata.items.map((item: any) => item.id.videoId).join(',');

    const videoResult = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`);

    const videoResultData = videoResult.data;
    const videos = videoResultData.items.map((item: any) => {
        const  viewCount = parseInt(item.statistics.viewCount || '0',10);
        const  likeCount = parseInt(item.statistics.likeCount || '0',10);
        const  commentCount = parseInt(item.statistics.commentCount || '0',10);
        const today = new Date();
        const publishDate = new Date(item.snippet.publishedAt);
        const daysSincePublished = Math.max((today.getTime() - publishDate.getTime())/(1000*60*60*24),1);
        const viewPerDay = viewCount / daysSincePublished;
        const engagementRate = viewCount > 0 ?((likeCount + commentCount)/ viewCount)* 100:0;
        return{
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            viewCount,
            likeCount,
            commentCount,
            publishedAt: item.snippet.publishedAt,
            viewPerDay,
            engagementRate,
        }
    })

    const viewCounts = videos.map((v:any) => v.viewCount);
    const { iqr, lowerBound, upperBound } = calculateIQR(viewCounts);

    const avgViews = viewCounts.reduce((a:any,b:any) => a+b, 0)/ viewCounts.length || 0;
    const maxViewsPerDay = videos.length > 0 ? Math.max(...videos.map((v:any)=> v.viewPerDay)):0;
    const maxEngagementRate = videos.length > 0 ? Math.max(...videos.map((v:any)=> v.engagementRate)):0;

    const FinalResult = videos.map((v:any) => {
        const isOutlier = v.viewCount < lowerBound || v.viewCount > upperBound;
        let outlierScore = 0;

        if(isOutlier && iqr > 0){
            if(v.viewCount > upperBound){
                outlierScore = (v.viewCount - upperBound) / iqr;            
            }else if (v.viewCount < lowerBound){
                outlierScore = (lowerBound - v.viewCount) / iqr;
            }
        }

        const viewsPerDayNorm = maxViewsPerDay > 0 ? v.viewPerDay / maxViewsPerDay : 0;
        const engagementRateNorm = maxEngagementRate > 0 ? v.engagementRate / maxEngagementRate : 0;
        const smartScore = (v.viewCount / (avgViews || 1)) * 0.5 + viewsPerDayNorm * 0.3 + engagementRateNorm * 0.2;

        return{
            ...v,
            engagementRate: Number(v.engagementRate.toFixed(2)),
            viewsPerDay: Math.round(v.viewPerDay),
            smartScore: Number(smartScore.toFixed(3)),
            isOutlier,
            outlierScore: Number(outlierScore.toFixed(2)),
        }
    })

    return NextResponse.json(FinalResult)

}

function calculateIQR (values: number[]) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length / 4)];
    const q3 = sorted[Math.floor((sorted.length * 3) / 4)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    return { q1, q3, iqr, lowerBound, upperBound };
}