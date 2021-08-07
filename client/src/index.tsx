import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { PreferenceProvider } from "./contexts/PreferenceContext";
import { UserProvider } from "./contexts/UserContext";

ReactDOM.render(
    <React.StrictMode>
        <UserProvider>
            <PreferenceProvider>
                <App />
            </PreferenceProvider>
        </UserProvider>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
