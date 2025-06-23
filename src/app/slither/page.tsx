import Script from "next/script";

export const metadata = {
  title: "Slither Game",
  description: "A Slither.io clone built in Next.js",
};

export default function SlitherGame() {
  return (
    <div>
      {/* Canvas element where the game will render */}
      <canvas id="canvas" width="1200" height="800"></canvas>

      {/* Load external vanilla JS scripts after DOM is interactive */}
      <Script src="/js/food.js" strategy="afterInteractive" />
      <Script src="/js/player.js" strategy="afterInteractive" />
      <Script src="/js/snake.js" strategy="afterInteractive" />
      <Script src="/js/main.js" strategy="afterInteractive" />
    </div>
  );
}
