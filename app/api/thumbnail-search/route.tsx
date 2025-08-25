import { openai } from "@/inngest/functions";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    
    const {searchParams} = new URL(req.url);
    let query = searchParams.get('query');
    
    const thumbnailUrl = searchParams.get('thumbnailUrl');
    if (thumbnailUrl) {
        const completion = await openai.chat.completions.create({
            model: 'moonshotai/kimi-vl-a3b-thinking:free',
            messages: [
                {
                    "role": 'user',
                    "content":[
                        {
                            "type": 'text',
                            "text": "Output EXACTLY 5 comma-separated tags for searching similar YouTube videos based on this thumbnail. No explanations, no reasoning, no extra text, no markup like ◁think▷ or ◁/think▷. Use short, common keywords (1-3 words each) that are likely to appear in YouTube video titles or descriptions. Maximum 5 tags"
                        },
                        {
                            "type": 'image_url',
                            "image_url": {
                                "url": thumbnailUrl
                            }
                        }
                    ]
                }
            ]
        })

        console.log("completion.choices[0].message.content =====> ",completion.choices[0].message.content);


        const result = completion.choices[0].message.content;
        if(!result){
            return NextResponse.json({ error: 'No response from AI model' });
        }

        // If you ever change the model , this will break , simply remove it and pass result to queary
        const tagsStartIndex = result.indexOf('◁/think▷') + 8; // Length of '◁/think▷'
        let tags = result.substring(tagsStartIndex).trim();
        console.log("Extracted tags before cleanup: ", tags);

        const newlineIndex = tags.indexOf('\n');
        
        console.log("newlineIndex ====>", newlineIndex);
        console.log(typeof newlineIndex);
        
        if (newlineIndex !== -1) {
            tags = tags.substring(0, newlineIndex).trim();
        }
        const tagsArray = tags.split(',').map(tag => tag.trim());
        console.log("tagsArray ====>", tagsArray);
        const searchQuery = tagsArray.join('+');
        console.log("searchQuery ====>", searchQuery);

        query = searchQuery;
    }

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
    const FinalResult = videoResultData.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        publishedAt: item.snippet.publishedAt,
    }))

    return NextResponse.json(FinalResult)
}