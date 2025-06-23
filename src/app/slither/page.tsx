"use client";

import { useEffect, useState } from "react";

export default function PlayPage() {
  const [username, setUsername] = useState<string | null>(null);
 

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const uname = searchParams.get("username");
    setUsername(uname);

    if (!uname) return;

    // Set global variable for game.js to read
    interface CustomWindow extends Window {
      PLAYER_NAME?: string;
    }
    (window as CustomWindow).PLAYER_NAME = uname;

    const loadScripts = async () => {
      await loadScript("/js/food.js");
      await loadScript("/js/snake.js");
      await loadScript("/js/game.js");
    };

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        // 🛑 Check if script is already present
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(); // Already loaded
          return;
        }

        // ✅ Create and append script
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(`Failed to load ${src}`);
        document.body.appendChild(script);
      });

    loadScripts().catch(console.error);
  }, [username]);

  return null;
}
