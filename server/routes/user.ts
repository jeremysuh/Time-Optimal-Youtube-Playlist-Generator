import pool from "../db/db";

exports.savePlaylist = async (req: any, res: any) => {
    //if (!req.user) res.status(400).send("User not logged in");
    const body = req.body;
    const data = body.data;
    const videos: any[] = data.videos;

    const videoIds = videos.map((video) => video.id);
    const videoTitles = videos.map((video) => video.title);

    await pool.query(
        `INSERT INTO playlists(playlistId, name, google_id, video_ids, video_titles, date_added, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING;`,
        [data.id, data.name, req.user.google_id, videoIds, videoTitles, data.createdOn, data.createdOn]
    );
    res.sendStatus(200);
};

exports.deletePlaylist = async (req: any, res: any) => {
    if (!req.user) res.status(400).send("User not logged in");
    const body = req.body;
    const data = body.data;
    await pool
        .query(`DELETE FROM playlists WHERE playlistId = '${data.id}'`)
        .then(() => {
            res.json(200);
        })
        .catch(() => res.json(404));
};

exports.updatePlaylist = async (req: any, res: any) => {
    if (!req.user) res.status(400).send("User not logged in");
    const body = req.body;
    const data = body.data;

    const playlistId = data.playlistId;
    const newName = data.playlistName;
    const newVideos = data.videos;

    const newVideoIds: string[] = newVideos.map((video: any) => video.id);
    const newVideoTitles: string[] = newVideos.map((video: any) => video.title);

    await pool
        .query(
            `UPDATE playlists SET name=$1 , last_updated=NOW() , video_titles=$2, video_ids=$3 WHERE playlistid=$4`,
            [newName, newVideoTitles, newVideoIds, playlistId]
        )
        .then(() => {
            res.json(200);
        })
        .catch((e: any) => {
            console.log(e);
            res.json(404);
        });
}
