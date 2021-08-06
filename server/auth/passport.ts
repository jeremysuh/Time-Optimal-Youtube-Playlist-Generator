const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
import axios, { AxiosError } from "axios";
import pool from "../db/db";

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser(function (user: any, done: any) {
    done(null, user.google_id);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser(async function (id: any, done: any) {
    const currentUser = await pool.query(`SELECT * FROM users WHERE google_id='${id}'`);
    const exists = currentUser.rowCount !== 0;
    if (exists) {
        done(null, currentUser.rows[0]);
    } else if (!exists) {
        done(new Error("Failed to deserialize an user"));
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL:
                process.env.NODE_ENV === "production"
                    ? "https://youtube-playlist-generator.herokuapp.com/api/auth/google/callback"
                    : "http://localhost:3001/api/auth/google/callback",
        },
        async function (accessToken: any, refreshToken: any, user: any, cb: any) {
            // find current user in UserModel
            const currentUser = await pool.query(`SELECT * FROM users WHERE google_id='${user.id}'`);
            const theUser = currentUser ? currentUser.rows[0] : null;
            const exists = currentUser.rowCount !== 0;

            if (exists) {
                console.log("User exists");
                const timeSinceLastRefreshTokenGeneration: number =
                    new Date().getTime() - new Date(theUser.access_token_last_updated as string).getTime();

                if (timeSinceLastRefreshTokenGeneration > 30 * 60000) {
                    const accessTokenObj = await axios.post("https://www.googleapis.com/oauth2/v4/token", {
                        refresh_token: refreshToken,
                        client_id: process.env.CLIENT_ID,
                        client_secret: process.env.CLIENT_SECRET,
                        grant_type: "refresh_token",
                    });
                    const newAccessToken = accessTokenObj.data.access_token;
                    console.log(refreshToken);

                    await pool
                        .query(
                            "UPDATE users SET access_token= $1, access_token_last_updated = NOW() WHERE google_id= $2",
                            [newAccessToken, user.id]
                        )
                        .then(() => {
                            console.log("new access token and date generated");
                        })
                        .catch((e: AxiosError) => console.log(e.message));
                }

                return cb(null, theUser);
            } else if (!exists) {
                console.log("User does not exist");
                const id = user.id;
                const displayName = user.displayName;
                const playlists = "";
                const date = new Date();

                await pool
                    .query(
                        `INSERT INTO users(google_id, display_name, playlists, refresh_token, refresh_token_last_updated, access_token, access_token_last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING;`,
                        [id, displayName, playlists, refreshToken, date, accessToken, date]
                    )
                    .then(async (res: any) => {
                        const brandNewUser = {
                            google_id: id,
                            display_name: displayName,
                            playlists: playlists,
                            refresh_token: refreshToken,
                            refresh_token_last_updated: date,
                            access_token: accessToken,
                            access_token_last_updated: date,
                        };
                        console.log("New user created...");
                        return cb(null, brandNewUser);
                    })
                    .catch((err: any) => {
                        cb(new Error("Failed to create new user"));
                    });
            }
        }
    )
);
