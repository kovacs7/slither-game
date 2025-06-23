// pages/play.tsx
"use client";

import { useEffect } from "react";

export default function PlayPage() {
  useEffect(() => {
    const loadScripts = async () => {
      // Load in correct order
      await loadScript("/js/food.js");
      await loadScript("/js/snake.js");
      await loadScript("/js/game.js");
    };

    const loadScript = (src: string) =>
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false; // preserve execution order
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    loadScripts().catch(console.error);
  }, []);

}
