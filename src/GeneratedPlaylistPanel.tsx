import React from "react";
import { SortabledPlaylist } from "./SortablePlaylist";
import arrayMove from "array-move";

interface GeneratedPlaylistPanelProps {
    generatedPlaylist: any[];
    setGeneratedPlaylist: Function;
    savePlaylist: Function;
}

const GeneratedPlaylistPanel = ({
    generatedPlaylist,
    setGeneratedPlaylist,
    savePlaylist,
}: GeneratedPlaylistPanelProps) => {
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

    return generatedPlaylist.length > 0 ? (
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
    );
};

export { GeneratedPlaylistPanel };
