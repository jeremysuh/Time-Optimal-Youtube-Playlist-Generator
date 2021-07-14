import React from "react";
import { PlaylistPanel } from "./PlaylistPanel";

interface UserPlaylistsProps {
    initialLoad: boolean;
    playlists: any[];
    deletePlaylist: Function;
    editPlaylist: Function;
}

const UserPlaylists = ({ initialLoad, playlists, deletePlaylist, editPlaylist }: UserPlaylistsProps) => {

    const sortedPlaylist = playlists.sort((playlistA, playlistB) => { //newest to oldest
        return new Date(playlistB.createdOn).getTime() - new Date(playlistA.createdOn).getTime()
    })
 
    return initialLoad ? (
        <div>
            <h4>Playlists:</h4>
            {playlists.length > 0
                ? sortedPlaylist.map((playlist: any) => (
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
