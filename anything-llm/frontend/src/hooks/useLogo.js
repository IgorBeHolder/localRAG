import { useEffect, useState } from "react";
import usePrefersDarkMode from "./usePrefersDarkMode";
import System from "../models/system";
import AnythingLLMDark from "../media/logo/icon_ai.png";
import AnythingLLMLight from "../media/logo/icon_ai.png";

export default function useLogo() {
  const [logo, setLogo] = useState("");
  const prefersDarkMode = usePrefersDarkMode();

  useEffect(() => {
    async function fetchInstanceLogo() {
      try {
        const logoURL = await System.fetchLogo(!prefersDarkMode);
        logoURL
          ? setLogo(logoURL)
          : setLogo(prefersDarkMode ? AnythingLLMLight : AnythingLLMDark);
      } catch (err) {
        setLogo(prefersDarkMode ? AnythingLLMLight : AnythingLLMDark);
        console.error("Failed to fetch logo:", err);
      }
    }
    fetchInstanceLogo();
  }, [prefersDarkMode]);

  return { logo };
}
