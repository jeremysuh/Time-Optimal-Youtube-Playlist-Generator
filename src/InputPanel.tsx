import React from "react";

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

interface InputPanelProps {
    playlistUrl: string;
    setPlaylistUrl: Function;
    time: number;
    setTime: Function;
    onPriorityChange: Function;
    generatePlaylist: Function;
    loading: boolean;
    authenticated: boolean
}

const InputPanel = ({
    playlistUrl,
    setPlaylistUrl,
    time,
    setTime,
    onPriorityChange,
    generatePlaylist,
    loading,
    authenticated
}: InputPanelProps) => {
    return (
        <div>
            <div>
                <div>
                    <label htmlFor="playlist-url">Insert Youtube Playlist Link:{"\t"}</label>
                    <input
                        type="text"
                        id="playlist-url"
                        name="playlist-url"
                        value={playlistUrl}
                        onChange={(event) => {
                            setPlaylistUrl(event.target.value);
                        }}
                    ></input>
                </div>
                <div>
                    <label htmlFor="time">Time Available (minutes):{"\t"}</label>
                    <input
                        type="number"
                        pattern="\d*"
                        id="time"
                        name="time"
                        value={time}
                        onChange={(event) => {
                            setTime(Math.round(Number(event.target.value))); //change minutes to seconds
                        }}
                    ></input>
                </div>
                <div>
                    <label htmlFor="priority-selection">Priority:{"\t"}</label>
                    <select
                        name="priority-selection"
                        id="priority-selection"
                        onChange={(e) => onPriorityChange(e.target.value)}
                    >
                        {Object.entries(PRIORITY).map((entry) => (
                            <option value={entry[1]} key={entry[0]}>
                                {entry[0]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <button onClick={() => generatePlaylist(playlistUrl, time)} disabled={loading || !authenticated}>
                {loading ? "Generating..." : "Generate Playlist"}
            </button>
        </div>
    );
};

export { InputPanel };
