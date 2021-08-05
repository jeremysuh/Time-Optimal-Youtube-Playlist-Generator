import React, { useState } from "react";
import { SortabledPlaylist } from "./SortablePlaylist";
import arrayMove from "array-move";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
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

    const [playlistName, setPlaylistName] = useState<string>("New Playlist");

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

    const deleteVideoInGeneratedPlaylist = (indexInPlaylist: number) => {
        let updatedPlaylist = generatedPlaylist.slice();
        updatedPlaylist = updatedPlaylist.filter((_, index) => index !== indexInPlaylist);
        setGeneratedPlaylist(updatedPlaylist);
    };

    return generatedPlaylist.length > 0 ? (
        <Card elevation={3} style={{ minWidth: "60vw", margin: "1em" }}>
            <CardContent>
            <Grid container justifyContent="space-between" spacing={1} alignItems="center">
            <Grid key={0} item>
                <Typography variant="h5">Generated Playlist</Typography>
                </Grid>
                <Grid key={0} item>
                <IconButton edge="end" aria-label="clear" onClick={() => setGeneratedPlaylist([])}>
                    <CancelIcon color="secondary"/>
                </IconButton>
                </Grid>
                </Grid>
                <SortabledPlaylist
                    playlist={generatedPlaylist}
                    onSortEnd={onSortPlaylistEnd}
                    deleteVideoInGeneratedPlaylist={deleteVideoInGeneratedPlaylist}
                    useDragHandle
                />
                <Grid container justifyContent="space-between" spacing={1} alignItems="center">
                    <Grid key={0} item>
                        <Grid container direction="column">
                            <Grid key={0} item>
                                {
                                    <Typography variant="h6">
                                        Total Duration: {generatedPlaylistTotalDuration.toFixed(2)} minutes
                                    </Typography>
                                }
                            </Grid>
                            <Grid key={1} item>
                                <Typography variant="h6">
                                    <Link href={generatedPlaylistUntitledUrl} target="_blank" rel="noopener noreferrer">
                                        View Playlist on Youtube
                                    </Link>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid key={1} item>
                        <Grid container justifyContent="space-between" spacing={1} alignItems="center">
                            <Grid key={0} item>
                                <TextField
                                    id="playlist-name-text-field"
                                    variant="outlined"
                                    name="editName"
                                    defaultValue={"New Playlist"}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                />
                            </Grid>
                            <Grid key={1} item>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => savePlaylist(playlistName)}
                                >
                                    Save Playlist
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    ) : (
        <br />
    );
};

export { GeneratedPlaylistPanel };
