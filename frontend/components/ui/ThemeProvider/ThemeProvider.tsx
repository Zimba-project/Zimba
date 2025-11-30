"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { sessionStorage } from "@/src/utils/Storage";
import type { ModeType } from "../gluestack-ui-provider";

type Theme = Exclude<ModeType, "system"> | ModeType; // allow 'system' too

interface ThemeContextType {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        (async () => {
            try {
                const saved = await sessionStorage.getItem("colorMode");
                const initial: Theme =
                    saved === "light" || saved === "dark" || saved === "system"
                        ? (saved as Theme)
                        : "light";
                setThemeState(initial);
            } catch {
                // ignore
            }
        })();
    }, []);

    const persist = async (t: Theme) => {
        try {
            await sessionStorage.setItem("colorMode", t);
        } catch { }
    };

    const setTheme = (t: Theme) => {
        setThemeState(t);
        persist(t);
    };

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (ctx === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
};
