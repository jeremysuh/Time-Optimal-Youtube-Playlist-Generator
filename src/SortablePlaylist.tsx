import React from "react";
import { SortableContainer, SortableElement, SortableHandle } from "react-sortable-hoc";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import LinkIcon from "@material-ui/icons/Link";

interface VideoItemProps {
    video: any;
    indexInPlaylist: number;
    deleteVideoInGeneratedPlaylist: Function;
}

const DragHandle = SortableHandle(() => (
    <ListItemIcon>
        <DragHandleIcon />
    </ListItemIcon>
));

const VideoItem = SortableElement(({ video, indexInPlaylist, deleteVideoInGeneratedPlaylist }: VideoItemProps) => {
    return (
        <div style={{ cursor: "pointer", listStyle: "none", listStyleType: "none" }}>
            <ListItem alignItems="flex-start" divider>
                <DragHandle />
                <img
                    src={`https://img.youtube.com/vi/${video.id}/default.jpg`}
                    alt="Video_Thumbnail"
                    style={{ maxWidth: "32px", padding: "8px" }}
                />
                <ListItemText
                    primary={video.title + "\t"}
                    secondary={(video.stats.duration / 60).toFixed(2) + " minutes"}
                ></ListItemText>

                <ListItemSecondaryAction>
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => deleteVideoInGeneratedPlaylist(indexInPlaylist)}
                    >
                        <DeleteIcon />
                    </IconButton>
                    <IconButton
                        edge="end"
                        aria-label="link"
                        href={"https://www.youtube.com/watch?v=" + video.id}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <LinkIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        </div>
    );
});

interface SortablePlaylistProps {
    playlist: any[];
    deleteVideoInGeneratedPlaylist: Function;
}
const SortabledPlaylist = SortableContainer(({ playlist, deleteVideoInGeneratedPlaylist }: SortablePlaylistProps) => {
    return (
        <div>
            <List
                style={{
                    listStyle: "none",
                    listStyleType: "none",
                    maxHeight: "50vh",
                    overflowY: "scroll",
                    overflowX: "hidden",
                }}
            >
                {playlist.map((video, index) => (
                    <VideoItem
                        key={index}
                        index={index}
                        video={video}
                        indexInPlaylist={index}
                        deleteVideoInGeneratedPlaylist={deleteVideoInGeneratedPlaylist}
                    /> //index not being passed; seems like a bug
                ))}
            </List>
        </div>
    );
});

export { SortabledPlaylist };
