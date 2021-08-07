import "./style/App.scss";
import { Navbar } from "./Navbar";
import { InputPanel } from "./InputPanel";
import { GeneratedPlaylistPanel } from "./GeneratedPlaylistPanel";
import { UserPlaylists } from "./UserPlaylists";
import { ThemeProvider } from "@material-ui/core";
import { AppContents } from "./components/AppContents";
import { AppTheme } from "./themes/themes";

require("dotenv").config();

function App() {
    return (
        <ThemeProvider theme={AppTheme}>
            <Navbar />
            <AppContents>
                <InputPanel />
                <GeneratedPlaylistPanel />
                <UserPlaylists />
            </AppContents>
        </ThemeProvider>
    );
}

export default App;
