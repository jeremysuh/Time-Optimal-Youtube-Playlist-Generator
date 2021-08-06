import express from "express";
import cors from "cors";
import { ParsedQs } from "qs";
import pool from "./db";
import { PlaylistGenerator } from "./tools/PlaylistGenerator";

require("dotenv").config();
require("./passport");

const passport = require("passport");
const cookieSession = require("cookie-session");

const CLIENT_HOME_PAGE_URL =
    process.env.NODE_ENV === "production"
        ? "https://time-optimal-youtube-playlist-generator.netlify.app"
        : "http://localhost:3000";
const PORT = process.env.PORT || 3001;

const app = express();

app.use(
    cors({
        origin: ["https://time-optimal-youtube-playlist-generator.netlify.app", "http://localhost:3000"], // allow to server to accept request from different origin
        methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        credentials: true, // allow session cookie from browser to pass through
    })
);
app.use(express.json());
app.set("trust proxy", 1); //*

app.get("/", (req, res) => {
    res.status(200).json({ message: "Root!" });
});

app.get("/api", (req, res) => {
    res.status(200).json({ message: "API Root" });
});

//Configure Session Storage
app.use(
    cookieSession({
        name: "google-session",
        keys: ["key1", "key2"],
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // must be 'none' to enable cross-site delivery
        secure: process.env.NODE_ENV === "production", // must be true if sameSite='none'
    })
);

//Configure Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "user failed to authenticate.",
    });
});

// Middleware - Check user is Logged in
const checkUserLoggedIn = (req: any, res: any, next: any) => {
    req.user ? next() : res.sendStatus(401);
};

//Protected Route.
app.get("/api/profile", checkUserLoggedIn, (req: any, res: any) => {
    res.send(`<h1>${req.user.displayName}'s Profile Page</h1>`);
});

// Auth Routes
app.get(
    "/api/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/youtube.readonly"],
        prompt: "consent",
        accessType: "offline",
    })
);

app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/failed" }),
    function (req: any, res: any) {
        res.redirect(CLIENT_HOME_PAGE_URL);
    }
);

//SUCCESS
// when login is successful, retrieve user info
// client calls this during initial page load
app.get("/api/auth/login/check", async (req: any, res: any) => {
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
});

app.post("/api/savePlaylist", async (req: any, res: any) => {
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
});

app.post("/api/deletePlaylist", async (req: any, res: any) => {
    if (!req.user) res.status(400).send("User not logged in");
    const body = req.body;
    const data = body.data;
    await pool
        .query(`DELETE FROM playlists WHERE playlistId = '${data.id}'`)
        .then(() => {
            res.json(200);
        })
        .catch(() => res.json(404));
});

app.post("/api/updatePlaylist", async (req: any, res: any) => {
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
});

//Logout
app.get("/api/logout", (req: any, res: any) => {
    req.session = null;
    req.logout();
    res.redirect(CLIENT_HOME_PAGE_URL);
});

app.get("/api/users", async (req: any, res: any) => {
    const users = await pool.query(`SELECT * FROM users`);
    return res.json(users.rows);
});

app.get("/api/clearUsers", async (req: any, res: any) => {
    await pool.query(`TRUNCATE users;`);
    return res.json(200);
});

app.get("/api/deleteUsersTable", async (req: any, res: any) => {
    await pool.query(`DROP TABLE users;`);
    return res.json(200);
});

app.get("/api/createUsersTable", async (req: any, res: any) => {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        google_id VARCHAR(255) NOT NULL PRIMARY KEY,
        display_name VARCHAR(65535) NOT NULL,
        playlists VARCHAR(65535) NOT NULL,
        refresh_token VARCHAR(255) NOT NULL,
        refresh_token_last_updated TIMESTAMP NOT NULL,
        access_token VARCHAR(255) NOT NULL,
        access_token_last_updated TIMESTAMP NOT NULL
);`);
    return res.json(200);
});

app.get("/api/playlists", async (req: any, res: any) => {
    const users = await pool.query(`SELECT * FROM playlists`);
    return res.json(users.rows);
});

app.get("/api/clearPlaylists", async (req: any, res: any) => {
    await pool.query(`TRUNCATE playlists;`);
    return res.json(200);
});

app.get("/api/deletePlaylistsTable", async (req: any, res: any) => {
    await pool.query(`DROP TABLE playlists;`);
    return res.json(200);
});

app.get("/api/createPlaylistsTable", async (req: any, res: any) => {
    await pool.query(`CREATE TABLE playlists (
        id SERIAL PRIMARY KEY,
        playlistId VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) NOT NULL,
        video_ids text[] NOT NULL,
        video_titles text[] NOT NULL,
        date_added TIMESTAMP NOT NULL,
        last_updated TIMESTAMP NOT NULL
      );`);
    return res.json(200);
});

const validateRequestQueries = (query: ParsedQs) => {
    const playlistId: string | undefined | null = query.playlistId as string | undefined | null;
    const time: number | undefined | null = query.time as number | undefined | null;
    const priority: string | undefined | null = query.priority as string | undefined | null;

    if (!playlistId || playlistId == null) {
        throw new Error("No url provided");
    }

    if (!time || time == null) {
        throw new Error("No time provided");
    } else if (time < 0) {
        throw new Error("Negative time provided");
    }

    if (!priority || priority == null) {
        throw new Error("No priority provided");
    }
};

app.get("/api/playlist", async (req: any, res: any) => {
    res.set("Content-Type", "application/json");

    try {
        validateRequestQueries(req.query);
    } catch (e) {
        return res.status(400).send({ error: e.message });
    }

    let accessToken: string = req.user ? req.user.access_token : "token";
    let userLoggedIn = req.user ? true : false;

    let { playlistId, time, priority } = req.query;
    time = Number(time);

    const playlistGenerator = new PlaylistGenerator();
    playlistGenerator.initialize(time, priority).setPlaylistId(playlistId);

    if (userLoggedIn) playlistGenerator.setAccessToken(accessToken);

    const playlist = await playlistGenerator.generate();

    return res.status(200).json(playlist);
});

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}..`);
});
