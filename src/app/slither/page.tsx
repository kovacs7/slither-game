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

    // Set global player name for game logic
    (window as any).PLAYER_NAME = username;

    // Global function for sending updates from game.js
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

    const initPlayer = async () => {
      if (playerIdRef.current) return;

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
    };

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
            if (player.username === username) return; // Skip self
            console.log("👾 Other player updated:", player);

            // TODO: Create or update the other player’s snake
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ Subscribed to realtime:players");
          }
        });

      channelRef.current = channel;
    };

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
    };

    if (sessionStorage.getItem("player-initialized")) return;
    sessionStorage.setItem("player-initialized", "true");

    // Init the player, subscribe, then load game
    (async () => {
      await initPlayer();
      subscribeToPlayers();
      await loadScripts();
    })().catch(console.error);

    return () => {
      if (playerIdRef.current) {
        supabase.from("players").delete().eq("id", playerIdRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        hasSubscribed.current = false;
      }
    };
  }, [username]);

  return null;
}
