import React, { useState } from "react";

type Video = {
    id: string;
    title: string;
};

type Playlist = {
    id: string;
    name: string;
    videos: Video[];
    createdOn: string;
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
        for (let i = 0; i < playlist.videos.length; ++i) {
            videos.push({
                title: playlist.videos[i].title,
                id: playlist.videos[i].id,
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
                <div>
                <input
                    type="text"
                    id="editName"
                    name="editName"
                    defaultValue={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                />
                <br/>
                </div>
            ) : (
                <h4>Playlist: {playlistName}</h4>
            )}
            <div>
                {editModeOn ? (
                    <button onClick={() => handleSaveChanges()}>Save</button>
                ) : (
                    <button onClick={() => setEditModeOn((val) => !val)}>Edit</button>
                )}
            </div>
            <h4>Videos:</h4>
            <ul>{videoTitlesList}</ul>
            <h4>Created on: {playlist.createdOn}</h4>
            <div>
                <a href={generatedPlaylistUntitledUrl} target="_blank" rel="noopener noreferrer">
                    View Playlist on Youtube
                </a>
            </div>
            <br />
            <button onClick={() => deletePlaylist(playlist.id)}>Delete</button>
        </div>
    );
};

export { PlaylistPanel };
