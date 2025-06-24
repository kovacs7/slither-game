"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PlayPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const playerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!username) return;

    // Set the global PLAYER_NAME so game.js can read it
    (window as any).PLAYER_NAME = username;

    // Global function called from game.js to update this player in Supabase
    (window as any).updatePlayerInSupabase = async ({ name, x, y, score }) => {
      if (!playerIdRef.current) return;

      await supabase
        .from("players")
        .update({
          x,
          y,
          score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", playerIdRef.current);
    };

    const initPlayer = async () => {
      // Insert this player into Supabase
      const { data, error } = await supabase
        .from("players")
        .insert({ username, x: 0, y: 0, score: 0 })
        .select()
        .single();

      if (error) {
        console.error("Error inserting player:", error.message);
        return;
      }

      playerIdRef.current = data.id;

      // Realtime subscription to all other players
      supabase
        .channel("realtime:players")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players" },
          (payload) => {
            const player = payload.new;
            if (player.username === username) return; // skip self

            // TODO: You can update visual snakes here based on other players
            console.log("Another player moved:", player);
          }
        )
        .subscribe();
    };

    const loadScripts = async () => {
      await loadScript("/js/food.js");
      await loadScript("/js/snake.js");
      await loadScript("/js/game.js");
    };

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(); // Already loaded
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(`Failed to load ${src}`);
        document.body.appendChild(script);
      });

    initPlayer().then(loadScripts).catch(console.error);

    // Cleanup: remove player on unmount
    return () => {
      if (playerIdRef.current) {
        supabase.from("players").delete().eq("id", playerIdRef.current);
      }
    };
  }, [username]);

  return null;
}
