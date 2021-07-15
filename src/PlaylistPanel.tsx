import React, { useState } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";

interface SavedVideoItemProps {
    editModeOn: boolean;
    video: any;
    indexInPlaylist: number;
    deleteVideo: Function;
    //deleteVideoInGeneratedPlaylist: Function;
}
const SavedVideoItem = SortableElement(({ editModeOn, video, indexInPlaylist, deleteVideo }: SavedVideoItemProps) => {
    return (
        <li
            key={indexInPlaylist}
            style={{
                margin: "4px",
                cursor: editModeOn ? "pointer" : "default",
                borderStyle: editModeOn ? "solid" : "none",
            }}
        >
            <img
                src={`https://img.youtube.com/vi/${video.id}/default.jpg`}
                alt="Video_Thumbnail"
                style={{ maxWidth: "32px", padding: "8px" }}
            />
            <span>{video.title}</span>
            <button
                style={{ visibility: editModeOn ? "visible" : "hidden" }}
                onClick={() => deleteVideo(indexInPlaylist)}
            >
                Delete
            </button>
        </li>
    );
});

interface SortabledSavedPlaylistProps {
    videos: any[];
    deleteVideo: Function;
    editModeOn: boolean;
}
const SortabledSavedPlaylist = SortableContainer(({ videos, deleteVideo, editModeOn }: SortabledSavedPlaylistProps) => {
    return (
        <ul style={{ listStyle: "none" }}>
            {videos.map((video, index) => (
                <SavedVideoItem
                    key={index}
                    index={index}
                    video={video}
                    deleteVideo={deleteVideo}
                    editModeOn={editModeOn}
                    indexInPlaylist={index}
                    disabled={!editModeOn}
                    //deleteVideoInGeneratedPlaylist={deleteVideoInGeneratedPlaylist}
                /> //index not being passed; seems like a bug
            ))}
        </ul>
    );
});

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

    const deleteVideo = (videoIndex: number) => {
        let copy = videos.slice();
        copy = copy.filter((_, index) => videoIndex !== index);
        setVideos(copy);
    };

    let generatedPlaylistUntitledUrl = "https://www.youtube.com/watch_videos?video_ids=";
    for (let i = 0; i < videos.length; ++i) {
        //if (i >= 50) break; ignore this for now
        const videoId = videos[i].id;
        generatedPlaylistUntitledUrl += `${videoId},`;
    }
    generatedPlaylistUntitledUrl += "&disable_polymer=true";

    const handleSaveChanges = () => {
        editPlaylist(playlist.id, playlistName, videos);
        setVideos(videos); //doesnt do anything for now
        setEditModeOn(false);
    };

    const onSortVideosEnd = ({ oldIndex, newIndex }: any) => {
        const newVideos = arrayMove(videos, oldIndex as number, newIndex as number);
        setVideos(newVideos);
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
                    <br />
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
            <div style={{ maxHeight: "30vh", overflowY: "scroll", overflowX: "hidden", borderStyle: "solid" }}>
                <SortabledSavedPlaylist
                    videos={videos}
                    onSortEnd={onSortVideosEnd}
                    deleteVideo={deleteVideo}
                    editModeOn={editModeOn}
                />
            </div>
            <h4>Created on: {playlist.createdOn}</h4>
            <h4>Updated on: {playlist.updatedOn}</h4>
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
