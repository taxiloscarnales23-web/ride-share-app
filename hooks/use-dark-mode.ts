import { useColorScheme } from "./use-color-scheme";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DARK_MODE_KEY = "rideshare_dark_mode";

export function useDarkMode() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(DARK_MODE_KEY);
        if (saved !== null) {
          setIsDarkMode(saved === "true");
        } else {
          // Use system preference if no saved preference
          setIsDarkMode(systemColorScheme === "dark");
        }
      } catch (error) {
        console.error("Failed to load dark mode preference:", error);
        setIsDarkMode(systemColorScheme === "dark");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [systemColorScheme]);

  const toggleDarkMode = async (value?: boolean) => {
    try {
      const newValue = value !== undefined ? value : !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem(DARK_MODE_KEY, String(newValue));
      
      // Update document class for web
      if (typeof document !== "undefined") {
        if (newValue) {
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      }
    } catch (error) {
      console.error("Failed to save dark mode preference:", error);
    }
  };

  return {
    isDarkMode: isDarkMode ?? (systemColorScheme === "dark"),
    toggleDarkMode,
    isLoading,
  };
}
