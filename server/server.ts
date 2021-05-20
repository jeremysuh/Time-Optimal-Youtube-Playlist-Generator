import express, { json, response } from "express";
import cors from "cors";
import { AxiosResponse } from "axios";
import { YoutubeVideo, UserPreference, PlaylistItem, VideoListResponse, PlaylistItemListResponse, Video } from "./@types/youtube";
import {parse, end, toSeconds, pattern} from 'iso8601-duration';

require("dotenv").config();

const axios = require("axios").default;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.get("/", (req, res) => {
    res.send("Root");
});

const retrieveVideoIdsFromPlaylist = async (playlistId: string): Promise<string[]> => {
    const url = "https://youtube.googleapis.com/youtube/v3/playlistItems";

    const params = new URLSearchParams();
    const parts = ["id", "contentDetails", "snippet", "status"];

    parts.forEach((part: string) => params.append("part", part));
    params.append("maxResults", "50");
    params.append("playlistId", playlistId as string);
    params.append("key", process.env.YOUTUBE_API_KEY as string);

    const info: PlaylistItemListResponse = await axios.get(url, { params }).then((response: AxiosResponse) => response.data);
    const totalResults = info.pageInfo.totalResults;
    const resultsPerPage = info.pageInfo.resultsPerPage;

    const pageDatas: PlaylistItemListResponse[] = [];
    let nextPageToken: string = "N/A";

    for (let i = 0; i < Math.ceil(totalResults / resultsPerPage); ++i) {
        params.delete("pageToken");
        if (nextPageToken !== "N/A") params.append("pageToken", nextPageToken);
        const perData: PlaylistItemListResponse = await axios.get(url, { params }).then((response: AxiosResponse) => response.data);
        if (perData.hasOwnProperty("nextPageToken")) {
            nextPageToken = perData.nextPageToken;
        } else {
            nextPageToken = "N/A";
        }
        pageDatas.push(perData);
    }

    const videos: string[] = [];

    pageDatas.forEach((data: PlaylistItemListResponse) => {
        const items: PlaylistItem[] = data.items;

        items.forEach((item: PlaylistItem) => {
            const snippet = item.snippet;
            const contentDetails = item.contentDetails;
            videos.push(contentDetails.videoId);
        });
    });

    return videos;
};

//CURRENTLY ONLY 50 VIDEOS MAX POSSIBLE; FIX
const retrieveVideosFromIds = async (videoIds: string[]): Promise<YoutubeVideo[]> => {
    const videos: YoutubeVideo[] = [];

    const url = "https://youtube.googleapis.com/youtube/v3/videos";

    const pageDatas: VideoListResponse[] = [];

    let begin = 0, chunkSize = 50;

    while (begin < videoIds.length) {

        const videoIdsTemp = videoIds.slice(begin, begin + chunkSize);

        const params = new URLSearchParams();
        const parts = ["id", "contentDetails", "snippet", "status", "statistics"];
    
        parts.forEach((part: string) => params.append("part", part));
        params.append("key", process.env.YOUTUBE_API_KEY as string);

        videoIdsTemp.forEach((id : string) => params.append("id", id))

        const data : VideoListResponse = await axios.get(url, { params }).then((response: AxiosResponse) => response.data);
        pageDatas.push(data);

        begin = begin + chunkSize;
    }

    pageDatas.forEach(data => {

        const items : Video[] = data.items;
        
        items.forEach((video : Video) => {
            videos.push({
                title: video.snippet.title,
                id: video.id,
                channelTitle: video.snippet.channelTitle,
                channelId: video.snippet.channelId,
                publishedAt: video.snippet.publishedAt, //value
                stats: {
                    duration: toSeconds(parse(video.contentDetails.duration)), //weight
                    viewCount: video.statistics.viewCount, //value
                    likeCount: video.statistics.likeCount, //value
                    dislikeCount: video.statistics.dislikeCount, //value
                    commentCount: video.statistics.commentCount
                },
            });
        })

    })


    return videos;
};

const collectAllVideos = async (playlistId: string): Promise<YoutubeVideo[]> => {
    const videoIds: string[] = await retrieveVideoIdsFromPlaylist(playlistId);
    const videos: YoutubeVideo[] = await retrieveVideosFromIds(videoIds);
    return videos;
};

const determineOptiminalPlaylist = async (videos: YoutubeVideo[], preference: UserPreference): Promise<YoutubeVideo[] | null> => {
    return videos;
};

const PRIORITY = {
    NONE: "none",
    VIEWS_MANY: "views_many",
    VIEWS_FEW: "views_few",
    LIKES: "likes",
    DISLIKES: "dislikes",
    NEW: "new",
    OLD: "old",
};

app.get("/playlist", async (req, res) => {
    res.set("Content-Type", "application/json");

    const playlistId: string | undefined | null = req.query.playlistId as string | undefined | null;
    if (!playlistId || playlistId == null) res.send("No valid playlistId included");

    const preference: UserPreference = { time: 30, priority: PRIORITY.NONE };

    const videos = await collectAllVideos(playlistId as string);
    const playlist = await determineOptiminalPlaylist(videos as YoutubeVideo[], preference);

    const videoIdsTemp = await retrieveVideoIdsFromPlaylist(playlistId as string);
    const videosTemp = await retrieveVideosFromIds(videoIdsTemp)

    res.json(videosTemp);
});

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}..`);
});
