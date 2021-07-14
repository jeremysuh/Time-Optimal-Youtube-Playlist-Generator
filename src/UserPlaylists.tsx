import React from "react";
import { PlaylistPanel } from "./PlaylistPanel";

interface UserPlaylistsProps {
    initialLoad: boolean;
    playlists: any[];
    deletePlaylist: Function;
    editPlaylist: Function;
}

const UserPlaylists = ({ initialLoad, playlists, deletePlaylist, editPlaylist }: UserPlaylistsProps) => {
    return initialLoad ? (
        <div>
            <h4>Playlists:</h4>
            {playlists.length > 0
                ? playlists.map((playlist: any) => (
                      <PlaylistPanel
                          key={playlist.id}
                          playlist={playlist}
                          deletePlaylist={deletePlaylist}
                          editPlaylist={editPlaylist}
                      />
                  ))
                : "No Playlists Created"}
        </div>
    ) : null;
};

export { UserPlaylists };
