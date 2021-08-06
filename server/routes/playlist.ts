import { ParsedQs } from "qs";
import { PlaylistGenerator } from "../tools/PlaylistGenerator";

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

exports.apiRoot = (req : any, res : any) => {
    res.status(200).json({ message: "API Root" });
}

exports.generatePlaylist = async (req: any, res: any) => {
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
}