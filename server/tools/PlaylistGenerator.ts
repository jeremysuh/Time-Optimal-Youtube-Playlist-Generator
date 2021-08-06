import { AxiosResponse, AxiosError } from "axios";
import { parse, toSeconds } from "iso8601-duration";
import { PlaylistItem, PlaylistItemListResponse, Video, VideoListResponse, YoutubeVideo } from "../@types/youtube";
import { YoutubeKnapsackResponse, youtubeVideosKnapsack } from "./VideoKnapsackAlgorithm";
const axios = require("axios").default;

const PRIORITY = {
    RANDOM: "random",
    VIEWS_MANY: "views_many",
    VIEWS_FEW: "views_few",
    COMMENTS_MANY: "comments_many",
    COMMENTS_FEW: "comments_few",
    LIKES: "likes",
    DISLIKES: "dislikes",
    NEW: "new",
    OLD: "old",
    DURATION_LONG: "duration_long",
    DURATION_SHORT: "duration_short",
};

const DEFAULT_TIME = 30;
const DEFAULT_PRIORITY = PRIORITY.RANDOM;

class PlaylistGenerator {
    time: number;
    priority: string;
    playlistId: string;
    accessToken: string | null;

    constructor() {
        this.time = DEFAULT_TIME;
        this.priority = DEFAULT_PRIORITY;
        this.playlistId = "";
        this.accessToken = null;
    }

    initialize = (time: number, priority: string) => {
        return this.setTime(time).setPriority(priority);
    };

    setTime = (time: number) => {
        this.time = time;
        return this;
    };

    setPriority = (priority: string) => {
        this.priority = priority;
        return this;
    };

    setPlaylistId = (id: string) => {
        this.playlistId = id;
        return this;
    };

    setAccessToken = (accessToken: string) => {
        this.accessToken = accessToken;
        return this;
    };

    generate = async (): Promise<YoutubeVideo[]> => {
        const videos: YoutubeVideo[] = await this.collectAllVideosFromPlaylist();
        const playlist = await this.determineOptiminalPlaylist(videos);
        return playlist;
    };

    collectAllVideosFromPlaylist = async (): Promise<YoutubeVideo[]> => {
        const videoIds: string[] = await this.retrieveVideoIdsFromPlaylist();
        const videos: YoutubeVideo[] = await this.retrieveVideosFromIds(videoIds);
        return videos;
    };

    retrieveVideoIdsFromPlaylist = async (): Promise<string[]> => {
        const url = "https://youtube.googleapis.com/youtube/v3/playlistItems";

        const params = new URLSearchParams();
        const parts = ["id", "contentDetails", "snippet", "status"];

        parts.forEach((part: string) => params.append("part", part));
        params.append("maxResults", "50");
        params.append("playlistId", this.playlistId);
        params.append("key", process.env.YOUTUBE_API_KEY as string);

        let config = {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${this.accessToken}`,
            },
            params: params,
        };

        let loggedOutConfig = {
            params: params,
        };

        const userLoggedIn = this.accessToken != null;

        const info: PlaylistItemListResponse = await axios
            .get(url, userLoggedIn ? config : loggedOutConfig)
            .then((response: AxiosResponse) => response.data)
            .catch((error: AxiosError) => console.log("1 " + error.message));
        const totalResults = info.pageInfo.totalResults;
        const resultsPerPage = info.pageInfo.resultsPerPage;

        const pageDatas: PlaylistItemListResponse[] = [];
        let nextPageToken: string = "N/A";

        for (let i = 0; i < Math.ceil(totalResults / resultsPerPage); ++i) {
            params.delete("pageToken");
            if (nextPageToken !== "N/A") params.append("pageToken", nextPageToken);

            let config = {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                },
                params: params,
            };

            let loggedOutConfig = {
                params: params,
            };

            const perData: PlaylistItemListResponse = await axios
                .get(url, userLoggedIn ? config : loggedOutConfig)
                .then((response: AxiosResponse) => response.data)
                .catch((error: AxiosError) => console.log("2 " + error.message));
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

    retrieveVideosFromIds = async (videoIds: string[]): Promise<YoutubeVideo[]> => {
        const videos: YoutubeVideo[] = [];

        const url = "https://youtube.googleapis.com/youtube/v3/videos";

        const pageDatas: VideoListResponse[] = [];
        let begin = 0,
            chunkSize = 50;

        const userLoggedIn = this.accessToken != null;

        while (begin < videoIds.length) {
            const videoIdsTemp = videoIds.slice(begin, begin + chunkSize);

            const params = new URLSearchParams();
            const parts = ["id", "contentDetails", "snippet", "status", "statistics"];

            parts.forEach((part: string) => params.append("part", part));
            params.append("key", process.env.YOUTUBE_API_KEY as string);

            videoIdsTemp.forEach((id: string) => params.append("id", id));

            let config = {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                },
                params: params,
            };

            let loggedOutConfig = {
                params: params,
            };

            const data: VideoListResponse = await axios
                .get(url, userLoggedIn ? config : loggedOutConfig)
                .then((response: AxiosResponse) => response.data)
                .catch((error: AxiosError) => console.log(error.message));
            pageDatas.push(data);

            begin = begin + chunkSize;
        }

        pageDatas.forEach((data) => {
            const items: Video[] = data.items;

            items.forEach((video: Video) => {
                videos.push({
                    title: video.snippet.title,
                    id: video.id,
                    channelTitle: video.snippet.channelTitle,
                    channelId: video.snippet.channelId,
                    publishedAt: new Date(video.snippet.publishedAt), //value
                    stats: {
                        duration: toSeconds(parse(video.contentDetails.duration)), //weight
                        viewCount: Number(video.statistics.viewCount), //value
                        likeCount: video.statistics.likeCount ? Number(video.statistics.likeCount) : null, //value
                        dislikeCount: video.statistics.dislikeCount ? Number(video.statistics.dislikeCount) : null, //value
                        commentCount: video.statistics.commentCount ? Number(video.statistics.commentCount) : null,
                    },
                });
            });
        });

        return videos;
    };

    determineOptiminalPlaylist = async (videos: YoutubeVideo[]) => {
        let videosSorted: YoutubeVideo[] = videos.slice();

        //filter out undefined

        if (this.priority !== PRIORITY.RANDOM) {
            videosSorted = videosSorted.filter((video) => {
                if (this.priority === PRIORITY.COMMENTS_FEW || this.priority === PRIORITY.COMMENTS_MANY)
                    return video.stats.commentCount !== undefined && video.stats.commentCount != null;
                if (this.priority === PRIORITY.LIKES || this.priority === PRIORITY.DISLIKES) {
                    return (
                        video.stats.likeCount !== undefined &&
                        video.stats.dislikeCount !== undefined &&
                        video.stats.likeCount !== null &&
                        video.stats.dislikeCount !== null
                    );
                }
                return true;
            });
            //

            videosSorted = videosSorted.sort((a, b) => {
                if (this.priority === PRIORITY.DURATION_SHORT || this.priority === PRIORITY.DURATION_LONG)
                    return a.stats.duration - b.stats.duration; //sorts by duration (small -> big)
                if (this.priority === PRIORITY.VIEWS_FEW || this.priority === PRIORITY.VIEWS_MANY)
                    return a.stats.viewCount - b.stats.viewCount; //sorts by viewCount (small -> big)
                if (this.priority === PRIORITY.NEW || this.priority === PRIORITY.OLD)
                    return a.publishedAt.getTime() - b.publishedAt.getTime(); //sorts by viewCount (small -> big)
                if (this.priority === PRIORITY.LIKES || this.priority === PRIORITY.DISLIKES)
                    return (
                        100 *
                            ((a.stats.likeCount as number) /
                                ((a.stats.likeCount as number) + (a.stats.dislikeCount as number))) -
                        100 *
                            ((b.stats.likeCount as number) /
                                ((b.stats.likeCount as number) + (b.stats.dislikeCount as number)))
                    ); //sorts by like count (small -> big)
                if (this.priority === PRIORITY.COMMENTS_FEW || this.priority === PRIORITY.COMMENTS_MANY)
                    return (a.stats.commentCount as number) - (b.stats.commentCount as number); //sorts by duration
                return 0;
            });
        }

        //isolate the key value that we need (ie. duration, likes, views etc)
        const factor = videosSorted.map((video) => {
            if (this.priority === PRIORITY.DURATION_SHORT || this.priority === PRIORITY.DURATION_LONG)
                return video.stats.duration; //sorts by duration (small -> big)
            if (this.priority === PRIORITY.NEW || this.priority === PRIORITY.OLD) return video.publishedAt.getTime(); //sorts by viewCount (small -> big)
            if (this.priority === PRIORITY.VIEWS_FEW || this.priority === PRIORITY.VIEWS_MANY)
                return video.stats.viewCount; //sorts by viewCount (small -> big)
            if (this.priority === PRIORITY.LIKES || this.priority === PRIORITY.DISLIKES)
                return (
                    100 *
                    ((video.stats.likeCount as number) /
                        ((video.stats.likeCount as number) + (video.stats.dislikeCount as number)))
                ); //sorts by like count (small -> big)
            if (this.priority === PRIORITY.COMMENTS_FEW || this.priority === PRIORITY.COMMENTS_MANY)
                return video.stats.commentCount as number; //sorts by duration
            return 0;
        });

        let max = factor[videosSorted.length - 1];
        let min = factor[0];

        let percentiles: number[] = new Array().fill(0, factor.length);

        if (max !== min && this.priority != PRIORITY.RANDOM) {
            percentiles = factor.map((value) => Math.round(((value - min) / (max - min)) * 100));
        }

        if (this.priority === PRIORITY.RANDOM) {
            for (let i = 0; i < videosSorted.length; ++i) {
                percentiles.push(Math.round(Math.random() * 100));
            }
        }

        if (
            this.priority === PRIORITY.VIEWS_FEW ||
            this.priority === PRIORITY.DURATION_SHORT ||
            this.priority === PRIORITY.DISLIKES ||
            this.priority === PRIORITY.COMMENTS_FEW ||
            this.priority === PRIORITY.OLD
        ) {
            percentiles = percentiles.map((percentile) => 100 - percentile);
        }

        const knapsackResults: YoutubeKnapsackResponse[] = youtubeVideosKnapsack(
            this.time,
            videosSorted,
            percentiles,
            videosSorted.length
        );

        const finalResult: YoutubeVideo[] = knapsackResults.map((res) => res.video);

        return finalResult;
    };
}

export { PlaylistGenerator };
