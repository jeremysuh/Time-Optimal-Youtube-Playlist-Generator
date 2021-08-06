const PlaylistsTableCreationQuery = `CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    playlistId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) NOT NULL,
    video_ids text[] NOT NULL,
    video_titles text[] NOT NULL,
    date_added TIMESTAMP NOT NULL,
    last_updated TIMESTAMP NOT NULL
  );`;

const UsersTableCreationQuery = `CREATE TABLE IF NOT EXISTS users (
    google_id VARCHAR(255) NOT NULL PRIMARY KEY,
    display_name VARCHAR(65535) NOT NULL,
    playlists VARCHAR(65535) NOT NULL,
    refresh_token VARCHAR(255) NOT NULL,
    refresh_token_last_updated TIMESTAMP NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    access_token_last_updated TIMESTAMP NOT NULL
);`;

export { PlaylistsTableCreationQuery, UsersTableCreationQuery };
