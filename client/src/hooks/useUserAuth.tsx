import { useEffect, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
const axios = require("axios").default;
require("dotenv").config();

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

const useUserAuth = () => {
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const [user, setUser] = useState<any | null>(null);
    const [data, setData] = useState<Playlist[]>([]);

    useEffect(() => {
        console.log("initial data load");
        const authenticate = async () => {
            const url =
                process.env.NODE_ENV === "production"
                    ? `${process.env.REACT_APP_PRODUCTION_SERVER_URL}/api/auth/login/check`
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
                    console.log(data);

                    if (data.success) {
                        setIsAuthenticated(true);
                        setUser(response.data.user);
                        console.log(response.data.user);

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
                        setData(temp);
                    } else {
                        setIsAuthenticated(false);
                        setUser(null);
                        const local_playlists = localStorage.getItem("local_playlists");
                        if (local_playlists) setData(JSON.parse(local_playlists));
                    }
                    setIsCompleted(true);
                })
                .catch((error: AxiosError) => {
                    setIsAuthenticated(false);
                    setIsCompleted(true);
                    console.log(error.message);
                });
        };
        authenticate();
    }, []);

    return [user, data, isAuthenticated, isCompleted];
};

export { useUserAuth };
