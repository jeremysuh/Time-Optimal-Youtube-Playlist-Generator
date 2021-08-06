import { PlaylistsTableCreationQuery, UsersTableCreationQuery } from "./queries";
import pool from "./db";

const dbInitialization = async () => {
    await pool
        .query(PlaylistsTableCreationQuery)
        .then(() => console.log("Playlists table running"))
        .catch((e: Error) => console.log(e.message));
    await pool
        .query(UsersTableCreationQuery)
        .then(() => console.log("Users table running"))
        .catch((e: Error) => console.log(e.message));
};

export {dbInitialization}