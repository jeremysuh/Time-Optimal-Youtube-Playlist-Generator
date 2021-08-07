import "./style/App.scss";
import { Navbar } from "./components/Navbar";
import { InputPanel } from "./components/InputPanel";
import { GeneratedPlaylistPanel } from "./components/GeneratedPlaylistPanel";
import { UserPlaylists } from "./components/UserPlaylists";
import { ThemeProvider } from "@material-ui/core";
import { AppContents } from "./containers/AppContents";
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
