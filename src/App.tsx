import React, { useState } from "react";
import "./App.scss";
import { AxiosError, AxiosResponse } from "axios";

const axios = require("axios").default;
require("dotenv").config();

const PRIORITY = {
    RANDOM: "random",
    VIEWS_MANY: "views_many",
    VIEWS_FEW: "views_few",
    COMMENTS_MANY: "comments_many",
    COMMENTS_FEW: "comments_few",
    LIKES: "likes", //will focus on ratio (instead of absolute value)
    DISLIKES: "dislikes", //will focus on ratio (instead of absolute value)
    NEW: "new",
    OLD: "old",
    DURATION_LONG: "duration_long",
    DURATION_SHORT: "duration_short",
};

function App() {
    const [playlistUrl, setPlaylistUrl] = useState<string>("https://www.youtube.com/watch?v=gNi_6U5Pm_o&list=PLDIoUOhQQPlXr63I_vwF9GD8sAKh77dWU");
    const [time, setTime] = useState<number>(30);
    const [generatedPlaylist, setGeneratedPlaylist] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [priortiy, setPriority] = useState<string>(PRIORITY.RANDOM);

    const isValidYoutubePlaylistUrl = (url: string) => {
        return (url.includes("www.youtube.com") || url.includes("https://youtube.com") || url.includes("youtube.com")) && url.includes("list=");
    };

    const retrievePlaylistIdFromPlaylistUrl = (url: string) => {
        const urlParams = new URL(url).searchParams;
        if (urlParams.get("list") === null) {
            throw new Error("Invalid url");
        }
        const playlistId = urlParams.get("list") as string;
        return playlistId;
    };

    const generatePlaylist = async (playlistUrl: string, time: number) => {
        if (isValidYoutubePlaylistUrl(playlistUrl) === false) return;

        setLoading(true);

        const playlistId = retrievePlaylistIdFromPlaylistUrl(playlistUrl);

        const params = new URLSearchParams();
        params.append("playlistId", playlistId as string);
        params.append("time", (time * 60).toString());
        params.append("priority", priortiy);

        axios({
            method: "get",
            url: process.env.NODE_ENV === "production" ? "https://youtube-playlist-generator.herokuapp.com/playlist" : "http://localhost:3001/playlist",
            params: params,
        })
            .then((response: AxiosResponse) => {
                const playlist = response.data;
                setGeneratedPlaylist(playlist);
                console.log(playlist);
                setLoading(false);
            })
            .catch((error: AxiosError) => {
                console.log(error);
                setLoading(false);
            });
    };

    const onPriorityChange = (value: string) => {
        setPriority(value);
    };

    const generatedPlaylistItems = generatedPlaylist.map((video) => (
        <li key={video.id}>
            {video.title + "\t"}
            <b>
                {"\t"}Duration: {(video.stats.duration / 60).toFixed(2)} minutes
            </b>
            {"\t"}
            <a href={"https://www.youtube.com/watch?v=" + video.id} target="_blank" rel="noopener noreferrer">
                Link
            </a>
        </li>
    ));

    let generatedPlaylistTotalDuration = 0;
    generatedPlaylist.forEach((video) => (generatedPlaylistTotalDuration += video.stats.duration / 60));

    let generatedPlaylistUntitledUrl = "https://www.youtube.com/watch_videos?video_ids=";
    for (let i = 0; i < generatedPlaylist.length; ++i) {
        if (i >= 50) break;
        const video = generatedPlaylist[i];
        generatedPlaylistUntitledUrl += `${video.id},`;
    }
    generatedPlaylistUntitledUrl += "&disable_polymer=true";

    return (
        <div className="App">
            <h1>Time Optimal Youtube Playlist Generator</h1>
            <label>Insert Youtube Playlist Link:{"\t"}</label>
            <input
                type="text"
                value={playlistUrl}
                onChange={(event) => {
                    setPlaylistUrl(event.target.value);
                }}
            ></input>
            <br />
            <label>Time Available (minutes):{"\t"}</label>
            <input
                type="number"
                pattern="\d*"
                value={time}
                onChange={(event) => {
                    setTime(Math.round(Number(event.target.value))); //change minutes to seconds
                }}
            ></input>
            <label>Priority:{"\t"}</label>
            <select name="priority-selection" id="priority-selection" onChange={(e) => onPriorityChange(e.target.value)}>
                {Object.entries(PRIORITY).map((entry) => (
                    <option value={entry[1]} key={entry[0]}>
                        {entry[0]}
                    </option>
                ))}
            </select>
            <button disabled={loading} onClick={() => generatePlaylist(playlistUrl, time)}>
                {loading ? "Loading..." : "Generate Playlist"}
            </button>
            <br />
            {generatedPlaylist.length > 0 ? (
                <div>
                    <h3>Generated Playlist:</h3>
                    <ul>{generatedPlaylistItems}</ul>
                    <h4>Total Duration: {generatedPlaylistTotalDuration.toFixed(2)} minutes</h4>
                    <a href={generatedPlaylistUntitledUrl} target="_blank" rel="noopener noreferrer">
                        View Playlist on Youtube
                    </a>
                    <br />
                </div>
            ) : (
                <br />
            )}
        </div>
    );
}

export default App;
