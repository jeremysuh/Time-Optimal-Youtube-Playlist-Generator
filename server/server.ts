import express, { json } from "express";
import cors from "cors";
import { AxiosError, AxiosResponse } from "axios";

require('dotenv').config();

const axios = require("axios").default;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.get("/", (req, res) => {
  res.send("Root");
});

app.get("/playlist", (req, res) => {

  const  playlistId : string | undefined  = req.query.playlistId as string | undefined;
  if (!playlistId) res.send("No valid playlistId included"); 

  const url = "https://youtube.googleapis.com/youtube/v3/playlistItems";

  const params = new URLSearchParams();
  const parts = ["id", "contentDetails", "snippet", "status"]

  parts.forEach((part : string) => params.append("part", part))
  params.append("maxResults", "50");
  params.append("playlistId", playlistId as string);
  params.append("key", process.env.YOUTUBE_API_KEY as string);

  axios
    .get(url, { params })
    .then((response: AxiosResponse) => res.json(response.data))
    .catch((error: AxiosError) => {
      console.log(error.response?.data);
      res.sendStatus(400);
    });
});

app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}..`);
});
