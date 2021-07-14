import React from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

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

export {SortabledPlaylist}