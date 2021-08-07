import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useUser } from "../contexts/UserContext";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

const Navbar = () => {
    const classes = useStyles();
    const { user, isAuthenticated } = useUser();

    const onSignInClick = () => {
        window.open(
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/auth/google"
                : "http://localhost:3001/api/auth/google",
            "_self"
        );
    };

    const onSignOutClick = () => {
        window.open(
            process.env.NODE_ENV === "production"
                ? "https://youtube-playlist-generator.herokuapp.com/api/logout"
                : "http://localhost:3001/api/logout",
            "_self"
        );
    };

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Youtube Playlist Generator
                    </Typography>
                    <Typography style={{ display: "inline-block", paddingRight: "2em" }}>
                        {user ? user.displayName : ""}
                    </Typography>
                    {isAuthenticated === false ? (
                        <Button color="inherit" onClick={() => onSignInClick()}>
                            Login
                        </Button>
                    ) : (
                        <div>
                            <Button color="inherit" onClick={() => onSignOutClick()}>
                                Logout
                            </Button>
                        </div>
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
};

export { Navbar };
