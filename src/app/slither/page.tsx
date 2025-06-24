"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PlayPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const playerIdRef = useRef<string | null>(null);
  const channelRef = useRef<any>(null);
  const hasSubscribed = useRef(false);

  useEffect(() => {
    if (!username) return;

    // Set global player name
    (window as any).PLAYER_NAME = username;

    // Function to update player position in Supabase
    (window as any).updatePlayerInSupabase = async ({
      name,
      x,
      y,
      score,
    }: {
      name: string;
      x: number;
      y: number;
      score: number;
    }) => {
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

    // Initialize player in Supabase
    const initPlayer = async () => {
      if (playerIdRef.current) return;

      if (sessionStorage.getItem("player-initialized")) {
        console.log("⚠️ Player already initialized this session");
        return;
      }

      const { data, error } = await supabase
        .from("players")
        .insert({ username, x: 0, y: 0, score: 0 })
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase insert error:", error.message);
        return;
      }

      playerIdRef.current = data.id;
      sessionStorage.setItem("player-initialized", "true");
    };

    // Subscribe to other player updates
    const subscribeToPlayers = () => {
      if (hasSubscribed.current) return;
      hasSubscribed.current = true;

      const channel = supabase.channel("realtime:players");

      channel
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players" },
          (payload) => {
            const player = payload.new;
            if (player.username === username) return;

            console.log("👾 Other player updated:", player);

            if (!window.otherPlayerSnakes) window.otherPlayerSnakes = {};

            if (!window.otherPlayerSnakes[player.username]) {
              const s = new window.snake(
                player.username,
                window.gameInstance,
                player.score || 0,
                player.x,
                player.y
              );
              s.dx = 0;
              s.dy = 0;
              window.otherPlayerSnakes[player.username] = s;
            } else {
              const s = window.otherPlayerSnakes[player.username];
              s.v[0].x = player.x;
              s.v[0].y = player.y;
              s.score = player.score;
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ Subscribed to realtime:players");
          }
        });

      channelRef.current = channel;
    };

    // Dynamically load JS files
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(`Failed to load ${src}`);
        document.body.appendChild(script);
      });

    const loadScripts = async () => {
      await loadScript("/js/food.js");
      await loadScript("/js/snake.js");
      await loadScript("/js/game.js");

      if (
        typeof window.snake !== "function" ||
        typeof window.game !== "function"
      ) {
        console.error("❌ Global constructors not loaded");
        return;
      }

      const gameInstance = new window.game();
      window.gameInstance = gameInstance;
    };

    // Run on mount
    (async () => {
      await initPlayer();
      subscribeToPlayers();
      await loadScripts();
    })().catch(console.error);

    // Cleanup
    return () => {
      if (playerIdRef.current) {
        supabase.from("players").delete().eq("id", playerIdRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        hasSubscribed.current = false;
      }
      sessionStorage.removeItem("player-initialized");
    };
  }, [username]);

  return null;
}
