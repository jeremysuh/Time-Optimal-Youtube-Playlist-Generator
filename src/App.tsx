import React, { useState } from "react";
import "./App.scss";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";
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

type PlaylistPanelProps = {
    playlist: Playlist;
    deletePlaylist: Function;
    editPlaylist: Function;
};

const PlaylistPanel = ({ playlist, deletePlaylist, editPlaylist }: PlaylistPanelProps) => {
    const [playlistName, setPlaylistName] = useState<string>(playlist.name);
    const [videos, setVideos] = useState<any[]>(() => {
        const videos = [];
        for (let i = 0; i < playlist.videoIds.length; ++i) {
            videos.push({
                title: playlist.videoTitles[i],
                id: playlist.videoIds[i],
            });
        }
        return videos;
    });
    const [editModeOn, setEditModeOn] = useState<boolean>(false);

    const videoTitlesList = videos.map((video, index) => {
        return <li key={index}>{video.title}</li>;
    });

    let generatedPlaylistUntitledUrl = "https://www.youtube.com/watch_videos?video_ids=";
    for (let i = 0; i < videos.length; ++i) {
        //if (i >= 50) break; ignore this for now
        const videoId = videos[i].id;
        generatedPlaylistUntitledUrl += `${videoId},`;
    }
    generatedPlaylistUntitledUrl += "&disable_polymer=true";

    const handleSaveChanges = () => {
        editPlaylist(playlist.id, playlistName);
        setVideos(videos); //doesnt do anything for now
        setEditModeOn(false);
    };

    return (
        <div style={{ borderStyle: "solid", margin: "1em", padding: "1em" }}>
            {editModeOn ? (
                <input type="text" id="editName" name="editName" defaultValue={playlistName} onChange={(e) => setPlaylistName(e.target.value)} />
            ) : (
                <h4>Playlist: {playlistName}</h4>
            )}
            <h4>Videos:</h4>
            <ul>{videoTitlesList}</ul>
            <h4>Created on: {playlist.createdOn}</h4>
            <div>
                <a href={generatedPlaylistUntitledUrl} target="_blank" rel="noopener noreferrer">
                    View Playlist on Youtube
                </a>
            </div>
            <br />
            {editModeOn ? <button onClick={() => handleSaveChanges()}>Save</button> : <button onClick={() => setEditModeOn((val) => !val)}>Edit</button>}
            <button onClick={() => deletePlaylist(playlist.id)}>Delete</button>
        </div>
    );
};

interface VideoItemProps {
    video: any;
}
const VideoItem = SortableElement(({ video }: VideoItemProps) => {
    return (
        <div style={{ cursor: "pointer", borderStyle: "solid", margin: "4px", padding: "4px" }}>
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
        </div>
    );
});

interface SortablePlaylistProps {
    playlist: any[];
}
const SortabledPlaylist = SortableContainer(({ playlist }: SortablePlaylistProps) => {
    return (
        <ul style={{ listStyle: "none" }}>
            {playlist.map((video, index) => (
                <VideoItem key={index} index={index} video={video} />
            ))}
        </ul>
    );
});

type Playlist = {
    id: string;
    name: string;
    videoTitles: string[];
    videoIds: string[];
    createdOn: string;
};

function App() {
    const [initialLoad, setInitialLoad] = useState<boolean>(false);
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);

    const [playlistUrl, setPlaylistUrl] = useState<string>("https://www.youtube.com/watch?v=gNi_6U5Pm_o&list=PLDIoUOhQQPlXr63I_vwF9GD8sAKh77dWU");
    const [time, setTime] = useState<number>(30);
    const [generatedPlaylist, setGeneratedPlaylist] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [priortiy, setPriority] = useState<string>(PRIORITY.RANDOM);
    const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>(
        localStorage.getItem("saved-playlists") ? JSON.parse(localStorage.getItem("saved-playlists") as string) : []
    );
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);

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
                        const temp: Playlist[] = userPlaylists.map((playlist: any) => {
                            return {
                                id: playlist.playlistid,
                                name: playlist.name,
                                videoTitles: playlist.video_titles,
                                videoIds: playlist.video_ids,
                                createdOn: playlist.date_added,
                            };
                        });
                        setUserPlaylists(temp);
                        console.log(temp);
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

    useEffect(() => {
        localStorage.setItem("saved-playlists", JSON.stringify(savedPlaylists));
    }, [savedPlaylists]);

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

        const url =
            process.env.NODE_ENV === "production" ? "https://youtube-playlist-generator.herokuapp.com/api/playlist" : "http://localhost:3001/api/playlist";
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

    const savePlaylist = () => {
        const playlists = savedPlaylists.slice();
        const videoIds = generatedPlaylist.map((video) => video.id);
        const videoTitles = generatedPlaylist.map((video) => video.title);
        const uniqueId = uuidv4();
        const date = new Date().toISOString();
        playlists.push({
            id: uniqueId,
            name: `Playlist ${uniqueId}`,
            videoIds: videoIds,
            videoTitles: videoTitles,
            createdOn: date,
        });
        setSavedPlaylists(playlists);

        let updatedUserPlaylists = userPlaylists.slice();
        updatedUserPlaylists.push({
            id: uniqueId,
            name: `Playlist ${uniqueId}`,
            videoIds: videoIds,
            videoTitles: videoTitles,
            createdOn: date,
        });
        if (authenticated) setUserPlaylists(updatedUserPlaylists);

        const url =
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/savePlaylist"
                : "http://localhost:3001/api/savePlaylist";
        let config = {
            data: {
                id: uniqueId,
                name: `Playlist ${uniqueId}`,
                videoIds: videoIds,
                videoTitles: videoTitles,
                createdOn: new Date().toISOString(),
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
        let updatedPlaylists = savedPlaylists.slice();
        updatedPlaylists = updatedPlaylists.filter((playlist) => playlist.id !== id);
        setSavedPlaylists(updatedPlaylists);

        let updatedUserPlaylists = userPlaylists.slice();
        updatedUserPlaylists = updatedUserPlaylists.filter((playlist) => playlist.id !== id);
        if (authenticated) setUserPlaylists(updatedUserPlaylists);

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
            // params: params,
            withCredentials: true,
        };

        if (authenticated)
            axios
                .post(url, config, { withCredentials: true })
                .then(() => console.log("added"))
                .catch((e: AxiosError) => console.log(e));
    };

    const editPlaylist = (id: string, newName: string) => {
        let updatedPlaylists: Playlist[] = savedPlaylists.slice();
        const indexToUpdate = updatedPlaylists.findIndex((playlist) => playlist.id === id);
        if (indexToUpdate !== -1) {
            updatedPlaylists[indexToUpdate].name = newName;
            setSavedPlaylists(updatedPlaylists);
        }

        let updatedUserPlaylists: Playlist[] = userPlaylists.slice();
        const indexToUpdate2 = updatedUserPlaylists.findIndex((playlist) => playlist.id === id);
        if (indexToUpdate2 !== -1) {
            updatedUserPlaylists[indexToUpdate2].name = newName;
            if (authenticated) setUserPlaylists(updatedUserPlaylists);
        }

        const url =
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/updatePlaylist"
                : "http://localhost:3001/api/updatePlaylist";
        let config = {
            data: {
                playlistId: id,
                playlistName: newName,
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
            process.env.NODE_ENV === "production" ? "https://youtube-playlist-generator.herokuapp.com/api/logout" : "http://localhost:3001/api/logout",
            "_self"
        );
    };

    let generatedPlaylistTotalDuration = 0;
    generatedPlaylist.forEach((video) => (generatedPlaylistTotalDuration += video.stats.duration / 60));

    let generatedPlaylistUntitledUrl = "https://www.youtube.com/watch_videos?video_ids=";
    for (let i = 0; i < generatedPlaylist.length; ++i) {
        if (i >= 50) break;
        const video = generatedPlaylist[i];
        generatedPlaylistUntitledUrl += `${video.id},`;
    }
    generatedPlaylistUntitledUrl += "&disable_polymer=true";

    const onSortPlaylistEnd = ({ oldIndex, newIndex }: any) => {
        const newPlaylist = arrayMove(generatedPlaylist, oldIndex as number, newIndex as number);
        setGeneratedPlaylist(newPlaylist);
    };
    return (
        <div className="App">
            <div style={{ margin: "1em" }}>
                {authenticated === false ? (
                    <button onClick={() => onSignInClick()} disabled={!initialLoad}>
                        Sign in
                    </button>
                ) : (
                    <button onClick={() => onSignOutClick()} disabled={!initialLoad}>
                        Sign out
                    </button>
                )}
            </div>
            {user ? <div>{`Hello, ${user.displayName}`}</div> : null}
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
                    <SortabledPlaylist playlist={generatedPlaylist} onSortEnd={onSortPlaylistEnd} />
                    <h4>Total Duration: {generatedPlaylistTotalDuration.toFixed(2)} minutes</h4>
                    <a href={generatedPlaylistUntitledUrl} target="_blank" rel="noopener noreferrer">
                        View Playlist on Youtube
                    </a>
                    <br />
                    <button onClick={() => savePlaylist()}>Save Playlist</button>
                </div>
            ) : (
                <br />
            )}
            <br />

            {initialLoad ? (
                <div>
                    {authenticated === false ? (
                        <div>
                            <h4>Locally Saved Playlists:</h4>
                            {savedPlaylists.length > 0 && !authenticated
                                ? savedPlaylists.map((playlist) => (
                                      <PlaylistPanel key={playlist.id} playlist={playlist} deletePlaylist={deletePlaylist} editPlaylist={editPlaylist} />
                                  ))
                                : "-"}
                        </div>
                    ) : (
                        <div>
                            <h4>User Playlists:</h4>
                            {userPlaylists.length > 0
                                ? userPlaylists.map((playlist) => (
                                      <PlaylistPanel key={playlist.id} playlist={playlist} deletePlaylist={deletePlaylist} editPlaylist={editPlaylist} />
                                  ))
                                : "No User Playlists Saved"}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default App;
