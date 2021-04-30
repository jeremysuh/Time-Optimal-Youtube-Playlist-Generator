import React, { useState } from "react";
import "./App.scss";

function App() {
  const [playlistUrl, setPlaylistUrl] = useState<string>("https://www.youtube.com/");
  const [time, setTime] = useState<number>(25);

  const determinePlaylistUrlValidity = (playlistUrl: string) => false;

  const generatePlaylist = async (playlistUrl: string, time: number) => {
    const isValidPlaylistUrl = determinePlaylistUrlValidity(playlistUrl);
    if (isValidPlaylistUrl === false) return;
    await fetch("http://localhost:3001/playlist-generate?url=" + playlistUrl)
      .then((res) => console.log(res))
      .catch((error) => console.log("Error: " + error));
  };

  return (
    <div className="App">
      <h1>Time Optimal Youtube Playlist Generator</h1>
      <label>
        Insert Youtube Playlist <b>Link</b> or <b>ID</b>:{"\t"}
      </label>
      <input
        type="text"
        value={playlistUrl}
        onChange={(event) => {
          setPlaylistUrl(event.target.value);
        }}
      ></input>
      <br />
      <label>Time Available (minutes):{"\t"}</label>
      <input
        type="number"
        value={time}
        onChange={(event) => {
          setTime(Number(event.target.value));
        }}
      ></input>
      <br />
      <button onClick={() => generatePlaylist(playlistUrl, time)}>Generate Playlist</button>
    </div>
  );
}

export default App;
