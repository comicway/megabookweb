import { useState, useEffect } from "react";

/**
 * Custom hook to handle localStorage persistence with state.
 * @param {string} key - The localStorage key.
 * @param {any} initialValue - The initial value if nothing is saved.
 */
export const useLocalStorage = (key, initialValue) => {
    const [state, setState] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return initialValue;

            // Handle both JSON and primitive strings
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            const valueToStore = typeof state === "string" ? state : JSON.stringify(state);
            localStorage.setItem(key, valueToStore);
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }, [key, state]);

    return [state, setState];
};
