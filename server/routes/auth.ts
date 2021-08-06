import pool from "../db/db";

const CLIENT_HOME_PAGE_URL =
    process.env.NODE_ENV === "production"
        ? "https://time-optimal-youtube-playlist-generator.netlify.app"
        : "http://localhost:3000";

exports.loginCheck = async (req: any, res: any) => {
    if (req.user) {
        console.log("successful authentication");

        const userPlaylists = await pool.query(`SELECT * FROM playlists WHERE google_id = '${req.user.google_id}'`);
        const playlistRows: any[] = userPlaylists.rows;

        const cleanedPlaylists = playlistRows.map((row: any) => {
            const videos = [];
            for (let i = 0; i < row.video_ids.length; ++i) {
                videos.push({
                    id: row.video_ids[i],
                    title: row.video_titles[i],
                });
            }

            return {
                playlist_id: row.playlistid,
                name: row.name,
                videos: videos,
                date_added: row.date_added,
                last_updated: row.last_updated,
            };
        });

        res.json({
            success: true,
            message: "user has successfully authenticated",
            user: {
                displayName: req.user.display_name,
                playlists: cleanedPlaylists,
            },
            cookies: req.cookies,
        });
    } else {
        console.log("unsuccessful authentication");
        res.json({
            success: false,
            message: "user not authenticated",
            user: null,
            cookies: null,
        });
    }
}

exports.logout = (req: any, res: any) => {
    req.session = null;
    req.logout();
    res.redirect(CLIENT_HOME_PAGE_URL);
}

exports.redirect = (req: any, res: any) => {
    res.redirect(CLIENT_HOME_PAGE_URL);
}

// // Middleware - Check user is Logged in
// const checkUserLoggedIn = (req: any, res: any, next: any) => {
//     req.user ? next() : res.sendStatus(401);
// };

// //Protected Route.
// app.get("/api/profile", checkUserLoggedIn, (req: any, res: any) => {
//     res.send(`<h1>${req.user.displayName}'s Profile Page</h1>`);
// });