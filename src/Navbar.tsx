import React from "react";

interface NavbarProps {
    authenticated: boolean;
    onSignInClick: Function;
    onSignOutClick: Function;
}

const Navbar = ({ authenticated, onSignInClick, onSignOutClick }: NavbarProps) => {
    return (
        <div style={{ margin: "1em" }}>
            {authenticated === false ? (
                <button onClick={() => onSignInClick()}>Sign in</button>
            ) : (
                <button onClick={() => onSignOutClick()}>Sign out</button>
            )}
        </div>
    );
};

export { Navbar };
