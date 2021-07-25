import React from "react";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

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
    authenticated: boolean;
}

const InputPanel = ({
    playlistUrl,
    setPlaylistUrl,
    time,
    setTime,
    onPriorityChange,
    generatePlaylist,
    loading,
    authenticated,
}: InputPanelProps) => {
    const isValidYoutubePlaylistUrl =
        (playlistUrl.includes("www.youtube.com") ||
            playlistUrl.includes("https://youtube.com") ||
            playlistUrl.includes("youtube.com")) &&
        playlistUrl.includes("list=");

    return (
        <Card
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
            elevation={2}
        >
            <CardContent
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography variant="h3" style={{ marginBottom: "16px" }}>
                    Youtube Playlist Generator
                </Typography>

                <div style={{ margin: "8px" }}>
                    <TextField
                        id="playlist-url"
                        label={!isValidYoutubePlaylistUrl ? "Invalid Playlist URL" : "Enter Playlist URL"}
                        error={!isValidYoutubePlaylistUrl}
                        variant="outlined"
                        value={playlistUrl}
                        style={{ minWidth: "50vw" }}
                        onChange={(event) => {
                            setPlaylistUrl(event.target.value);
                        }}
                    />
                </div>
                <div style={{ margin: "8px" }}>
                    <TextField
                        id="time"
                        label="Time Available (in minutes)"
                        style={{ minWidth: "10vw" }}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                        value={time}
                        onChange={(event) => {
                            setTime(Math.round(Number(event.target.value))); //change minutes to seconds
                        }}
                    />
                </div>
                <div>
                    <FormControl variant="outlined">
                        <Select
                            labelId="priority-select-helper-label"
                            id="priority-select-helper"
                            onChange={(e) => onPriorityChange(e.target.value)}
                            defaultValue={PRIORITY.RANDOM}
                            style={{ minWidth: "20vw" }}
                        >
                            {Object.entries(PRIORITY).map((entry) => (
                                <MenuItem value={entry[1]} key={entry[0]}>
                                    {entry[0]}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Selection Preference</FormHelperText>
                    </FormControl>
                </div>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => generatePlaylist(playlistUrl, time)}
                    disabled={loading}
                    style={{ margin: "8px" }}
                >
                    {loading ? "Generating..." : "Generate Playlist"}
                </Button>
            </CardContent>
        </Card>
    );
};

export { InputPanel };
