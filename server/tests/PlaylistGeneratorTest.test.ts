import { PlaylistItem, PlaylistItemListResponse } from "../@types/youtube";
import { PlaylistGenerator, PRIORITY } from "../tools/PlaylistGenerator";
const axios = require("axios").default;
jest.mock("axios");

let playlistGenerator: PlaylistGenerator;
beforeEach(() => {
    playlistGenerator = new PlaylistGenerator();
});

test("setting time", () => {
    playlistGenerator.setTime(60);
    expect(playlistGenerator.time).toBe(60);
});

test("setting priority", () => {
    playlistGenerator.setPriority(PRIORITY.COMMENTS_MANY);
    expect(playlistGenerator.priority).toBe(PRIORITY.COMMENTS_MANY);
});

test("setting playlist id", () => {
    playlistGenerator.setPlaylistId("id");
    expect(playlistGenerator.playlistId).toBe("id");
});

test("setting accessToken", () => {
    playlistGenerator.setAccessToken("token123");
    expect(playlistGenerator.accessToken).toBe("token123");
});

test("retrieve video ids from playlist", async () => {
    const playlistItem: PlaylistItem = {
        kind: "youtube#playlistItem",
        etag: "estag",
        id: "playlistItemId",
        snippet: {
            publishedAt: "publishedDate",
            channelId: "channelId",
            title: "title",
            description: "description",
            thumbnails: {
                key: {
                    url: "url",
                    width: 123,
                    height: 123,
                },
            },
            channelTitle: "channelTitle",
            videoOwnerChannelTitle: "text",
            videoOwnerChannelId: "text",
            playlistId: "playlistId",
            position: 0,
            resourceId: {
                kind: "kind",
                videoId: "PLZ1dJqY6KWOVh8fMrUVswwmdJNU",
            },
        },
        contentDetails: {
            videoId: "PLZ1dJqY6KWOVh8fMrUVswwmdJNU",
            startAt: "0",
            endAt: "1",
            note: "note",
            videoPublishedAt: new Date().toISOString(),
        },
        status: {
            privacyStatus: "public",
        },
    };

    const items: PlaylistItem[] = [];
    items.push(playlistItem);

    const resolvedResponse: PlaylistItemListResponse = {
        kind: "youtube#playlistItemListResponse",
        etag: "estag",
        nextPageToken: "nextPageToken",
        prevPageToken: "",
        pageInfo: {
            totalResults: 1,
            resultsPerPage: 1,
        },
        items: items,
    };

    axios.get.mockResolvedValue({
        data: resolvedResponse,
    });

    let expected: string[] = [];
    expected.push("PLZ1dJqY6KWOVh8fMrUVswwmdJNU");

    const received = await playlistGenerator.retrieveVideoIdsFromPlaylist();

    expect(received.length).toBe(1);
    expect(received[0]).toBe(expected[0]);
});
