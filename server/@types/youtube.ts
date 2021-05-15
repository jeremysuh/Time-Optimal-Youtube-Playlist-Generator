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
}

export type {YoutubeVideo, UserPreference}