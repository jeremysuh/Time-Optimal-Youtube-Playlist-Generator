import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

interface NavbarProps {
    authenticated: boolean;
    onSignInClick: Function;
    onSignOutClick: Function;
    displayName: string;
}

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

const Navbar = ({ authenticated, onSignInClick, onSignOutClick, displayName }: NavbarProps) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Youtube Playlist Generator
                    </Typography>
                    <Typography style={{ display: "inline-block", paddingRight: "2em" }}>{displayName}</Typography>
                    {authenticated === false ? (
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
