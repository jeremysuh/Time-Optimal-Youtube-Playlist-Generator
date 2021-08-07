import React, { useState, createContext } from "react";
import { useContext } from "react";

const DEFAULT_URL = `https://www.youtube.com/watch?v=gNi_6U5Pm_o&list=PLDIoUOhQQPlXr63I_vwF9GD8sAKh77dWU`;
const DEFAULT_TIME = 30;
const PRIORITY = {
    RANDOM: "random",
    VIEWS_MANY: "views_many",
    VIEWS_FEW: "views_few",
    COMMENTS_MANY: "comments_many",
    COMMENTS_FEW: "comments_few",
    LIKES: "likes",
    DISLIKES: "dislikes",
    NEW: "new",
    OLD: "old",
    DURATION_LONG: "duration_long",
    DURATION_SHORT: "duration_short",
};

type PreferenceContextState = {
    preference: Preference;
    setTime: (time: number) => void;
    setUrl: (time: string) => void;
    setPriority: (time: string) => void;
};

const PreferenceContextDefaultValues: PreferenceContextState = {
    preference: {
        url: DEFAULT_URL,
        time: DEFAULT_TIME,
        priority: PRIORITY.RANDOM,
    },
    setTime: () => {},
    setPriority: () => {},
    setUrl: () => {},
};

const PreferenceContext = createContext<PreferenceContextState>(PreferenceContextDefaultValues);

export const usePreference = () => {
    return useContext(PreferenceContext);
};

type Preference = {
    url: string;
    time: number;
    priority: string;
};

const PreferenceProvider = (props: any) => {
    const [preference, setPreference] = useState<Preference>(PreferenceContextDefaultValues.preference);

    const setTime = (time: number) => {
        console.log(time);
        setPreference((prevPreference) => ({
            ...prevPreference,
            time: time,
        }));
    };

    const setUrl = (url: string) => {
        setPreference((prevPreference) => ({
            ...prevPreference,
            url: url,
        }));
    };

    const setPriority = (priority: string) => {
        setPreference((prevPreference) => ({
            ...prevPreference,
            priority: priority,
        }));
    };

    return (
        <PreferenceContext.Provider value={{ preference, setTime, setUrl, setPriority }}>
            {props.children}
        </PreferenceContext.Provider>
    );
};

export { PreferenceContext, PreferenceProvider };
