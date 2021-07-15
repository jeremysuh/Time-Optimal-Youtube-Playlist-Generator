import React, { useState } from "react";
import "./App.scss";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { InputPanel } from "./InputPanel";
import { GeneratedPlaylistPanel } from "./GeneratedPlaylistPanel";
import { UserPlaylists } from "./UserPlaylists";
const axios = require("axios").default;
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

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

type Video = {
    id: string;
    title: string;
};

type Playlist = {
    id: string;
    name: string;
    videos: Video[];
    createdOn: string;
    updatedOn: string;
};

function App() {
    const [initialLoad, setInitialLoad] = useState<boolean>(false);
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);

    const [playlistUrl, setPlaylistUrl] = useState<string>(
        "https://www.youtube.com/watch?v=gNi_6U5Pm_o&list=PLDIoUOhQQPlXr63I_vwF9GD8sAKh77dWU"
    );
    const [time, setTime] = useState<number>(30);
    const [priortiy, setPriority] = useState<string>(PRIORITY.RANDOM);

    const [generatedPlaylist, setGeneratedPlaylist] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    //Initial Data Load
    useEffect(() => {
        const authenticate = async () => {
            const url =
                process.env.NODE_ENV === "production"
                    ? "https://youtube-playlist-generator.herokuapp.com/api/auth/login/check"
                    : "http://localhost:3001/api/auth/login/check";
            let config = {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": true,
                },
                withCredentials: true,
            };
            await axios
                .get(url, config, { withCredentials: true })
                .then((response: AxiosResponse) => {
                    const data = response.data;

                    if (data.success) {
                        setAuthenticated(true);
                        setUser(response.data.user);

                        const userPlaylists = response.data.user.playlists;
                        console.log(userPlaylists);
                        const temp: Playlist[] = userPlaylists.map((playlist: any) => {
                            return {
                                id: playlist.playlist_id,
                                name: playlist.name,
                                videos: playlist.videos,
                                createdOn: playlist.date_added,
                                updatedOn: playlist.last_updated,
                            };
                        });
                        console.log(temp);
                        setPlaylists(temp);
                    } else {
                        setAuthenticated(false);
                        setUser(null);
                    }
                    setInitialLoad(true);
                })
                .catch((error: AxiosError) => {
                    setAuthenticated(false);
                    setInitialLoad(true);
                    console.log(error.message);
                });
        };
        authenticate();
    }, []);

    const isValidYoutubePlaylistUrl = (url: string) => {
        return (
            (url.includes("www.youtube.com") || url.includes("https://youtube.com") || url.includes("youtube.com")) &&
            url.includes("list=")
        );
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

        const url =
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/playlist"
                : "http://localhost:3001/api/playlist";
        let config = {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
            },
            params: params,
            withCredentials: true,
        };

        axios
            .get(url, config, { withCredentials: true })
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

    const savePlaylist = (playlistName: string) => {
        if (!authenticated) return;

        let updatedPlaylists = playlists.slice();

        const videos: any[] = [];
        generatedPlaylist.forEach((video) => {
            videos.push({
                id: video.id,
                title: video.title,
            });
        });
        const uniqueId = uuidv4();
        const date = new Date().toISOString();

        updatedPlaylists.push({
            id: uniqueId,
            name: `${playlistName}`,
            videos: videos,
            createdOn: date,
            updatedOn: date,
        });

        setPlaylists(updatedPlaylists);

        const url =
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/savePlaylist"
                : "http://localhost:3001/api/savePlaylist";
        let config = {
            data: {
                id: uniqueId,
                name: `${playlistName}`,
                videos: videos,
                createdOn: date,
                updatedOn: date,
            },
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
            },
            // params: params,
            withCredentials: true,
        };

        if (authenticated)
            axios
                .post(url, config, { withCredentials: true })
                .then(() => console.log("added"))
                .catch((e: AxiosError) => console.log(e));
    };

    const deletePlaylist = (id: string) => {
        if (!authenticated) return;

        let updatedPlaylists: Playlist[] = playlists.slice();
        updatedPlaylists = updatedPlaylists.filter((playlist) => playlist.id !== id);
        setPlaylists(updatedPlaylists);

        const url =
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/deletePlaylist"
                : "http://localhost:3001/api/deletePlaylist";
        let config = {
            data: {
                id: id,
            },
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
            },
            withCredentials: true,
        };

        if (authenticated)
            axios
                .post(url, config, { withCredentials: true })
                .then(() => console.log("added"))
                .catch((e: AxiosError) => console.log(e));
    };

    const editPlaylist = (id: string, newName: string, videos: Video[]) => {
        if (!authenticated) return;

        let updatedPlaylists: Playlist[] = playlists.slice();

        const indexToUpdate = updatedPlaylists.findIndex((playlist) => playlist.id === id);

        if (indexToUpdate !== -1) {
            updatedPlaylists[indexToUpdate].name = newName;
            updatedPlaylists[indexToUpdate].updatedOn = new Date().toISOString();
            updatedPlaylists[indexToUpdate].videos = videos; //temp for now
            setPlaylists(updatedPlaylists);
        }

        const url =
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/updatePlaylist"
                : "http://localhost:3001/api/updatePlaylist";
        let config = {
            data: {
                playlistId: id,
                playlistName: newName,
                videos: videos,
            },
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
            },
            withCredentials: true,
        };

        if (authenticated)
            axios
                .post(url, config, { withCredentials: true })
                .then(() => console.log("added"))
                .catch((e: AxiosError) => console.log(e));
    };

    const onSignInClick = () => {
        window.open(
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/auth/google"
                : "http://localhost:3001/api/auth/google",
            "_self"
        );
    };

    const onSignOutClick = () => {
        window.open(
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/logout"
                : "http://localhost:3001/api/logout",
            "_self"
        );
    };

    return (
        <div className="App">
            <Navbar authenticated={authenticated} onSignInClick={onSignInClick} onSignOutClick={onSignOutClick} />
            {user ? <div>{`Hello, ${user.displayName}`}</div> : null}
            <h1>Time Optimal Youtube Playlist Generator</h1>
            <InputPanel
                playlistUrl={playlistUrl}
                setPlaylistUrl={setPlaylistUrl}
                time={time}
                setTime={setTime}
                onPriorityChange={onPriorityChange}
                generatePlaylist={generatePlaylist}
                loading={loading}
                authenticated={authenticated}
            />
            <GeneratedPlaylistPanel
                generatedPlaylist={generatedPlaylist}
                setGeneratedPlaylist={setGeneratedPlaylist}
                savePlaylist={savePlaylist}
            />
            <UserPlaylists
                initialLoad={initialLoad}
                playlists={playlists}
                deletePlaylist={deletePlaylist}
                editPlaylist={editPlaylist}
            />
        </div>
    );
}

export default App;
