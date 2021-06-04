import React, { useState } from "react";
import "./App.scss";
import { AxiosError, AxiosResponse } from "axios";
const axios = require("axios").default;

function App() {
    const [playlistUrl, setPlaylistUrl] = useState<string>("https://www.youtube.com/");
    const [time, setTime] = useState<number>(25);
    const [generatedPlaylist, setGeneratedPlaylist] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const determinePlaylistUrlValidity = (playlistUrl: string) => {
        return playlistUrl.includes("www.youtube.com") && playlistUrl.includes("list=")
    };

    const generatePlaylist = async (playlistUrl: string, time: number) => {

        const isValidPlaylistUrl = determinePlaylistUrlValidity(playlistUrl);
        if (isValidPlaylistUrl === false) return;

        let playlistId = playlistUrl.slice();

        if (playlistId.includes("www.youtube.com")) { //extract playlistId from full youtube url
            const urlParams = new URLSearchParams(playlistUrl);
            if (urlParams.get('list') !== null) {
                playlistId = urlParams.get('list') as string;
            }else{
                return;
            }      
        }

        setLoading(true);

        const params = new URLSearchParams();
        params.append("playlistId", playlistId as string);
        params.append("time", time.toString());
        axios({
            method: "get",
            url: "http://localhost:3001/playlist",
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

    let generatedPlaylistUntitledUrl = "https://www.youtube.com/watch_videos?video_ids="
    for (let i = 0; i < generatedPlaylist.length; ++i) {
        if (i >= 50) break;
        const video = generatedPlaylist[i];
        generatedPlaylistUntitledUrl+=`${video.id},` ;
    }
    generatedPlaylistUntitledUrl+="&disable_polymer=true"

    return (
        <div className="App">
            <h1>Time Optimal Youtube Playlist Generator</h1>
            <label>
                Insert Youtube Playlist Link:{"\t"}
            </label>
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
                value={time}
                onChange={(event) => {
                    setTime(Number(event.target.value));
                }}
            ></input>
            <br />
            <button disabled={loading} onClick={() => generatePlaylist(playlistUrl, time)}>
                {loading ? "Loading..." : "Generate Playlist"}
            </button>
            <br />
            {generatedPlaylist.length > 0 ? (
                <div>
                    <h3>Generated Playlist:</h3>
                    <ul>{generatedPlaylistItems}</ul>
                    <h4>Total Duration: {generatedPlaylistTotalDuration.toFixed(2)} minutes</h4>
                    <a href={generatedPlaylistUntitledUrl} target="_blank" rel="noopener noreferrer">View Playlist on Youtube</a>
                </div>
            ) : (
                <br />
            )}
        </div>
    );
}

export default App;
