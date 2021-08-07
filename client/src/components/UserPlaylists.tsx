import { PlaylistPanel } from "./PlaylistPanel";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useUser } from "../contexts/UserContext";

const UserPlaylists = () => {
    const { playlists, initialLoad, editPlaylist, deletePlaylist } = useUser();

    const sortedPlaylist = playlists.sort((playlistA, playlistB) => {
        //newest to oldest
        return new Date(playlistB.createdOn).getTime() - new Date(playlistA.createdOn).getTime();
    });

    return initialLoad ? (
        <div style={{ margin: "1em", minWidth: "50vw" }}>
            <Typography variant="h5">Saved Playlists:</Typography>
            <br />
            {playlists.length > 0
                ? sortedPlaylist.map((playlist: any) => (
                      <Accordion key={playlist.id}>
                          <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                          >
                              <Typography variant="h6">{playlist.name}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                              <PlaylistPanel
                                  key={playlist.id}
                                  playlist={playlist}
                                  deletePlaylist={deletePlaylist}
                                  editPlaylist={editPlaylist}
                              />
                          </AccordionDetails>
                      </Accordion>
                  ))
                : "No Playlists Created"}
        </div>
    ) : null;
};

export { UserPlaylists };
