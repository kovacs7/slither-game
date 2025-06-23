"use client";

import { useState, useEffect } from "react";
import { Play, Zap, Trophy, Users, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [playerName, setPlayerName] = useState("");
  const [isGlowing, setIsGlowing] = useState(false);
  const [particles, setParticles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Create floating particles
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y <= -5 ? 105 : p.y - p.speed * 0.1,
          x: p.x + Math.sin(Date.now() * 0.001 + p.id) * 0.1,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleEnterGame = () => {
    if (playerName.trim()) {
      // Here you would navigate to the game
      console.log("Entering game with name:", playerName);
      router.push(`/slither?username=${encodeURIComponent(playerName)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleEnterGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,150,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,150,0.2),transparent_50%)]"></div>
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: "0 0 6px currentColor",
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4 animate-pulse">
            Slither
          </h1>
          <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-white/90">
            <Zap className="text-yellow-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Arena
            </span>
            <Zap className="text-yellow-400" />
          </div>
          <p className="text-gray-300 mt-4 text-lg font-medium">
            Dominate the arena. Consume. Grow. Survive.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-8 mb-12 text-center">
          <div className="flex flex-col items-center">
            <Users className="text-cyan-400 mb-2" size={24} />
            <span className="text-2xl font-bold text-white">1,247</span>
            <span className="text-gray-400 text-sm">ONLINE</span>
          </div>
          <div className="flex flex-col items-center">
            <Trophy className="text-yellow-400 mb-2" size={24} />
            <span className="text-2xl font-bold text-white">156</span>
            <span className="text-gray-400 text-sm">MATCHES</span>
          </div>
          <div className="flex flex-col items-center">
            <Target className="text-pink-400 mb-2" size={24} />
            <span className="text-2xl font-bold text-white">89%</span>
            <span className="text-gray-400 text-sm">WIN RATE</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="relative">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsGlowing(true)}
              onBlur={() => setIsGlowing(false)}
              placeholder="Enter your warrior name..."
              className={`w-full px-6 py-4 text-xl font-semibold text-white placeholder-gray-400 bg-black/40 backdrop-blur-md border-2 rounded-xl transition-all duration-300 outline-none ${
                isGlowing
                  ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] bg-black/60"
                  : "border-gray-600 hover:border-purple-500"
              }`}
              maxLength={20}
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl -z-10 blur-sm opacity-0 transition-opacity duration-300"
              style={{ opacity: isGlowing ? 100 : 0 }}
            />
          </div>

          <button
            onClick={handleEnterGame}
            disabled={!playerName.trim()}
            className={`w-full py-4 px-8 text-xl font-bold rounded-xl transition-all duration-300 transform ${
              playerName.trim()
                ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-[0_10px_40px_rgba(236,72,153,0.4)] hover:shadow-[0_15px_50px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Play className="w-6 h-6" />
              ENTER BATTLE
            </div>
          </button>
        </div>

        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:bg-black/30">
            <Zap className="text-yellow-400 mx-auto mb-3" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">POWER-UPS</h3>
            <p className="text-gray-400 text-sm">
              Collect epic power-ups to dominate your enemies
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:bg-black/30">
            <Users className="text-purple-400 mx-auto mb-3" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">MULTIPLAYER</h3>
            <p className="text-gray-400 text-sm">
              Battle against players from around the world
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-gray-700 hover:border-pink-500 transition-all duration-300 hover:bg-black/30">
            <Trophy className="text-pink-400 mx-auto mb-3" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">LEADERBOARD</h3>
            <p className="text-gray-400 text-sm">
              Climb the ranks and become the ultimate champion
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            Ready to dominate? Enter your name and join the battle!
          </p>
        </div>
      </div>
    </div>
  );
}
