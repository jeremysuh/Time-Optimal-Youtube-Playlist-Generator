import React from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

interface VideoItemProps {
    video: any;
    indexInPlaylist: number;
    deleteVideoInGeneratedPlaylist: Function
}
const VideoItem = SortableElement(({ video, indexInPlaylist, deleteVideoInGeneratedPlaylist }: VideoItemProps) => {
    return (
        <div style={{ cursor: "pointer", borderStyle: "solid", margin: "4px", padding: "4px", }}>
            <li key={video.id}>
            <img src={`https://img.youtube.com/vi/${video.id}/default.jpg`} alt="Video_Thumbnail" style={{maxWidth:"32px", padding: "8px"}}/>
                {video.title + "\t"}
                <b>
                    {"\t"}Duration: {(video.stats.duration / 60).toFixed(2)} minutes
                </b>
                {"\t"}
                <a href={"https://www.youtube.com/watch?v=" + video.id} target="_blank" rel="noopener noreferrer">
                    Link
                </a>
                <button onClick={() => deleteVideoInGeneratedPlaylist(indexInPlaylist)}>{`\t`}Delete</button>
            </li>
        </div>
    );
});

 
interface SortablePlaylistProps {
    playlist: any[];
    deleteVideoInGeneratedPlaylist : Function
}
const SortabledPlaylist = SortableContainer(({ playlist, deleteVideoInGeneratedPlaylist }: SortablePlaylistProps) => {
    return (
        <ul style={{ listStyle: "none", maxHeight: "50vh", overflowY: "scroll", overflowX: "hidden"}}>
            {playlist.map((video, index) => (
                <VideoItem key={index} index={index} video={video} indexInPlaylist={index} deleteVideoInGeneratedPlaylist={deleteVideoInGeneratedPlaylist}/> //index not being passed; seems like a bug
            ))}
        </ul>
    );
});

export {SortabledPlaylist}