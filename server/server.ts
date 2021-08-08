import express from "express";
import cors from "cors";
import { dbInitialization } from "./db/initialization";

require("dotenv").config();
require("./auth/passport");

const playlist = require("./routes/playlist");
const user = require("./routes/user");
const auth = require("./routes/auth");
const info = require("./routes/info");

const passport = require("passport");

const cookieSession = require("cookie-session");
const session = cookieSession({
    name: "google-session",
    keys: ["key1", "key2"],
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
});

const corsPolicy = cors({
    origin: [`${process.env.PRODUCTION_CLIENT_URL}`, "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
});

dbInitialization();

const app = express();
app.set("trust proxy", 1);
app.use(corsPolicy);
app.use(express.json());
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

//playlist
app.get("/api/playlist", playlist.generatePlaylist);

//user
app.post("/api/savePlaylist", user.savePlaylist);
app.post("/api/deletePlaylist", user.deletePlaylist);
app.post("/api/updatePlaylist", user.updatePlaylist);

//auth
app.get("/api/auth/login/check", auth.loginCheck);
app.get("/api/logout", auth.logout);
app.get(
    "/api/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/youtube.readonly"],
        prompt: "consent",
        accessType: "offline",
    })
);

app.get("/api/auth/google/callback", passport.authenticate("google", { failureRedirect: "/failed" }), auth.redirect);

//info
app.get("/api/users", info.users);
app.get("/api/playlists", info.playlists);

//roots
app.get("/", (req, res) => {
    res.status(200).json({ message: "Root!" });
});
app.get("/api", playlist.apiRoot);

//set port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}..`);
});
