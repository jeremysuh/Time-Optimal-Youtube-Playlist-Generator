import express, { json, response } from "express";
import cors from "cors";
import { AxiosResponse } from "axios";
import { YoutubeVideo, UserPreference } from "./@types/youtube";

require("dotenv").config();

const axios = require("axios").default;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.get("/", (req, res) => {
  res.send("Root");
});

//updates
//1: dont do the data appending in the then; do it outside
//2: continue to add all videos using the nextToken

app.get("/playlist", async (req, res) => {

  res.set("Content-Type",'application/json');

  const playlistId: string | undefined = req.query.playlistId as string | undefined;
  if (!playlistId) res.send("No valid playlistId included");

  const url = "https://youtube.googleapis.com/youtube/v3/playlistItems";

  const params = new URLSearchParams();
  const parts = ["id", "contentDetails", "snippet", "status"];

  parts.forEach((part: string) => params.append("part", part));
  params.append("maxResults", "50");
  params.append("playlistId", playlistId as string);
  params.append("key", process.env.YOUTUBE_API_KEY as string);

  const info = await axios.get(url, { params })
    .then((response: AxiosResponse) => response.data)
  const totalResults = info.pageInfo.totalResults;
  const resultsPerPage = info.pageInfo.resultsPerPage;

  const pageDatas : any[] = []
  let nextPageToken : string = "N/A"

  for (let i = 0; i < Math.ceil(totalResults / resultsPerPage); ++i) {
    params.delete("pageToken");
    if (nextPageToken !== "N/A") params.append("pageToken", nextPageToken);
    const perData = await axios.get(url, { params }).then((response: AxiosResponse) => response.data)
    if (perData.hasOwnProperty('nextPageToken')) {
      nextPageToken = perData.nextPageToken;
    }else{
      nextPageToken = "N/A";
    }
    pageDatas.push(perData)
  }

  const videos: any[] = [];

  pageDatas.forEach((data) => 
    {    
      const items: any[] = data.items;
    
      items.forEach((item: any) => {
        const snippet: any = item.snippet;
        const contentDetails: any = item.contentDetails;
        videos.push({
          index: videos.length,
          title: snippet.title,
          date: contentDetails.videoPublishedAt,
          id: contentDetails.videoId,
        });
      });
    }
  )
  res.json(videos);
});

app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}..`);
});
