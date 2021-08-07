import React, { useState } from "react";
import { SortableContainer, SortableElement, SortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move"; 
import Typography from "@material-ui/core/Typography"; 
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton"; 
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

interface SavedVideoItemProps {
    editModeOn: boolean;
    video: any;
    indexInPlaylist: number;
    deleteVideo: Function;
    //deleteVideoInGeneratedPlaylist: Function;
}

const DragHandle = SortableHandle(() => (
    <ListItemIcon>
        <DragHandleIcon />
    </ListItemIcon>
));

const SavedVideoItem = SortableElement(({ editModeOn, video, indexInPlaylist, deleteVideo }: SavedVideoItemProps) => {
    return (
        <div
            key={indexInPlaylist}
            style={{
                margin: "4px",
                cursor: editModeOn ? "pointer" : "default",
                listStyle: "none",
                listStyleType: "none",
            }}
        >
            <ListItem alignItems="flex-start" divider>
                {editModeOn ? <DragHandle /> : null}
                <img
                    src={`https://img.youtube.com/vi/${video.id}/default.jpg`}
                    alt="Video_Thumbnail"
                    style={{ maxWidth: "32px", padding: "8px" }}
                />
                <ListItemText primary={video.title}></ListItemText>
                <ListItemSecondaryAction>
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        style={{ visibility: editModeOn ? "visible" : "hidden" }}
                        onClick={() => {
                            console.log(video);
                            deleteVideo(indexInPlaylist);
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        </div>
    );
});

interface SortabledSavedPlaylistProps {
    videos: any[];
    deleteVideo: Function;
    editModeOn: boolean;
}
const SortabledSavedPlaylist = SortableContainer(({ videos, deleteVideo, editModeOn }: SortabledSavedPlaylistProps) => {
    return (
        <div>
            <List style={{ listStyle: "none" }}>
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
            </List>
        </div>
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
        <div style={{ width: "100%" }}>
            <Grid container justifyContent="center" spacing={2}>
                {editModeOn ? (
                    <Grid key={0} item>
                        <TextField
                            id="editName"
                            label="New Playlist Name"
                            variant="outlined"
                            name="editName"
                            defaultValue={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                        />
                        <br />
                    </Grid>
                ) : (
                    <Grid key={1} item>
                        <Typography variant="h6" color="secondary">
                            {playlistName}
                        </Typography>
                    </Grid>
                )}
                <div>
                    {editModeOn ? (
                        <Grid key={1} item>
                            <IconButton onClick={() => handleSaveChanges()}>
                                <SaveIcon />
                            </IconButton>
                        </Grid>
                    ) : (
                        <Grid key={1} item>
                            <IconButton onClick={() => setEditModeOn((val) => !val)}>
                                <EditIcon />
                            </IconButton>
                        </Grid>
                    )}
                </div>
            </Grid>
            

            <div style={{ maxHeight: "30vh", overflowY: "scroll", overflowX: "hidden" }}>
                <SortabledSavedPlaylist
                    videos={videos}
                    onSortEnd={onSortVideosEnd}
                    deleteVideo={deleteVideo}
                    editModeOn={editModeOn}
                    useDragHandle
                />
            </div>
            <br />
            <Grid container justifyContent="flex-start" spacing={2} direction="row">
                <Grid item key={0}>
                    <Typography variant="subtitle2">Created: </Typography>
                    <Typography variant="body2">{new Date(playlist.createdOn).toUTCString()}</Typography>
                </Grid>
                <Grid item key={1}>
                    <Typography variant="subtitle2">Last Updated: </Typography>
                    <Typography variant="body2">{new Date(playlist.updatedOn).toUTCString()}</Typography>
                </Grid>
            </Grid>
            <Grid container justifyContent="flex-end" spacing={1} direction="row">
                <Grid item key={0}>
                    <IconButton
                        edge="end"
                        aria-label="link"
                        href={generatedPlaylistUntitledUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <PlayArrowIcon />
                    </IconButton>
                </Grid>
                <Grid item key={0}>
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => deletePlaylist(playlist.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </div>
    );
};




export { PlaylistPanel };
