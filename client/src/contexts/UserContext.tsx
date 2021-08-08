import React, { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../hooks/useUserAuth";
import { AxiosError, AxiosResponse } from "axios";
import { createContext } from "react";

const axios = require("axios").default;
const { v4: uuidv4 } = require("uuid");

type UserContextState = {
    playlists: Playlist[];
    generatedPlaylist: any[];
    isAuthenticated: boolean;
    loading: boolean;
    initialLoad: boolean;
    user: any;
    editPlaylist: (id: string, newName: string, videos: Video[]) => void;
    deletePlaylist: (id: string) => void;
    savePlaylist: (id: string) => void;
    generatePlaylist: (playlistUrl: string, time: number, priority: string) => void;
    updateGeneratedPlaylist: (newPlaylist: any) => void;
};

const UserContextDefaultValues: UserContextState = {
    playlists: [],
    generatedPlaylist: [],
    isAuthenticated: false,
    loading: false,
    initialLoad: false,
    user: null,
    editPlaylist: () => {},
    deletePlaylist: () => {},
    savePlaylist: () => {},
    generatePlaylist: () => {},
    updateGeneratedPlaylist: () => {},
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

const UserContext = createContext<UserContextState>(UserContextDefaultValues);
export const useUser = () => {
    return useContext(UserContext);
};

const UserProvider = (props: any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [user, data, isAuthenticated, isCompleted] = useUserAuth();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [generatedPlaylist, setGeneratedPlaylist] = useState<any[]>([]);

    useEffect(() => {
        setPlaylists(data); //data from user auth -> playlist
    }, [data]);

    const deletePlaylist = (id: string) => {
        let updatedPlaylists: Playlist[] = playlists.slice();
        updatedPlaylists = updatedPlaylists.filter((playlist) => playlist.id !== id);

        setPlaylists(updatedPlaylists);

        if (!isAuthenticated) {
            localStorage.setItem("local_playlists", JSON.stringify(updatedPlaylists));
            return;
        }

        const url =
            process.env.NODE_ENV === "production"
                ? `${process.env.PRODUCTION_SERVER_URL}/api/deletePlaylist`
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

        if (isAuthenticated)
            axios
                .post(url, config, { withCredentials: true })
                .then(() => console.log("added"))
                .catch((e: AxiosError) => console.log(e));
    };

    const editPlaylist = (id: string, newName: string, videos: Video[]) => {
        let updatedPlaylists: Playlist[] = playlists.slice();

        const indexToUpdate = updatedPlaylists.findIndex((playlist) => playlist.id === id);

        if (indexToUpdate !== -1) {
            updatedPlaylists[indexToUpdate].name = newName;
            updatedPlaylists[indexToUpdate].updatedOn = new Date().toISOString();
            updatedPlaylists[indexToUpdate].videos = videos; //temp for now
            setPlaylists(updatedPlaylists);
        }

        if (!isAuthenticated) {
            localStorage.setItem("local_playlists", JSON.stringify(updatedPlaylists));
            return;
        }

        const url =
            process.env.NODE_ENV === "production"
                ? `${process.env.PRODUCTION_SERVER_URL}/api/updatePlaylist`
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

        if (isAuthenticated)
            axios
                .post(url, config, { withCredentials: true })
                .then(() => console.log("added"))
                .catch((e: AxiosError) => console.log(e));
    };

    const savePlaylist = (playlistName: string) => {
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

        if (!isAuthenticated) {
            localStorage.setItem("local_playlists", JSON.stringify(updatedPlaylists));
            return;
        }

        const url =
            process.env.NODE_ENV === "production"
                ? `${process.env.PRODUCTION_SERVER_URL}/api/savePlaylist`
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

        if (isAuthenticated)
            axios
                .post(url, config, { withCredentials: true })
                .then(() => console.log("added"))
                .catch((e: AxiosError) => console.log(e));
    };

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

    const generatePlaylist = async (playlistUrl: string, time: number, priority: string) => {
        if (isValidYoutubePlaylistUrl(playlistUrl) === false) return;

        setLoading(true);

        const playlistId = retrievePlaylistIdFromPlaylistUrl(playlistUrl);

        const params = new URLSearchParams();
        params.append("playlistId", playlistId as string);
        params.append("time", (time * 60).toString());
        params.append("priority", priority);

        const url =
            process.env.NODE_ENV === "production"
                ? `${process.env.PRODUCTION_SERVER_URL}/api/playlist`
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

    const updateGeneratedPlaylist = (newPlaylist: any[]) => {
        setGeneratedPlaylist(newPlaylist);
    };

    const initialLoad = isCompleted;

    return (
        <UserContext.Provider
            value={{
                playlists,
                generatedPlaylist,
                isAuthenticated,
                loading,
                user,
                initialLoad,
                updateGeneratedPlaylist,
                generatePlaylist,
                editPlaylist,
                deletePlaylist,
                savePlaylist,
            }}
        >
            {props.children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
