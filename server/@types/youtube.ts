type PlaylistItem = {
    kind: "youtube#playlistItem";
    etag: string; //etag
    id: string;
    snippet: {
        publishedAt: Date;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            [key: string]: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
        videoOwnerChannelTitle: string;
        videoOwnerChannelId: string;
        playlistId: string;
        position: number;
        resourceId: {
            kind: string;
            videoId: string;
        };
    };
    contentDetails: {
        videoId: string;
        startAt: string;
        endAt: string;
        note: string;
        videoPublishedAt: Date;
    };
    status: {
        privacyStatus: string;
    };
};

type PlaylistItemListResponse = {
    kind: "youtube#playlistItemListResponse";
    etag: string;
    nextPageToken: string;
    prevPageToken: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: PlaylistItem[];
};

type YoutubeVideoStats = {
    duration: number; //weight
    publishedAt: Date; //value
    viewCount: number; //value
    likeCount: number; //value
    dislikeCount: number; //value
};

type YoutubeVideo = {
    title: string;
    id: string;
    channelTitle: string;
    channelId: string;
    stats: YoutubeVideoStats | null;
};

type UserPreference = {
    time: number;
    priority: string;
};

export type { YoutubeVideo, UserPreference, PlaylistItem, PlaylistItemListResponse };
