const Nball = 13;
const playerName = window.PLAYER_NAME || "Player";

class snake {
  constructor(name, game, score, x, y) {
    this.name = name;
    this.game = game;
    this.score = score;
    this.x = x;
    this.y = y;
    this.init();
  }

  init() {
    this.time = Math.floor(20 + Math.random() * 100);
    this.speed = 1;
    this.size = this.game.getSize();
    this.angle = 0;
    this.dx = Math.random() * MaxSpeed - Math.random() * MaxSpeed;
    this.dy = Math.random() * MaxSpeed - Math.random() * MaxSpeed;

    this.v = Array(50)
      .fill({ x: this.x, y: this.y })
      .map((p) => ({ ...p }));

    this.sn_im = new Image();
    this.sn_im.src = "/images/head.png";
    this.bd_im = new Image();
    this.bd_im.src = `/images/body/${Math.floor(Math.random() * Nball)}.png`;
    this.sn_im.onload = () => console.log("Head image loaded!");
    this.bd_im.onload = () => console.log("Body image loaded!");
  }

  update() {
    this.time--;
    this.angle = this.getAngle(this.dx, this.dy);

    if (this.name !== playerName) {
      this.speed = this.time > 90 ? 2 : 1;
      if (this.time <= 0) {
        this.time = Math.floor(10 + Math.random() * 20);
        this.dx = Math.random() * MaxSpeed - Math.random() * MaxSpeed;
        this.dy = Math.random() * MaxSpeed - Math.random() * MaxSpeed;

        let minRange = Infinity;
        for (const food of FOOD) {
          const dist = this.range(this.v[0], food);
          if (food.size > this.game.getSize() / 10 && dist < minRange) {
            minRange = dist;
            this.dx = food.x - this.v[0].x;
            this.dy = food.y - this.v[0].y;
          }
        }

        // Normalize dx, dy
        const magSq = this.dx ** 2 + this.dy ** 2;
        const factor = MaxSpeed / Math.sqrt(magSq || 1);
        this.dx *= factor;
        this.dy *= factor;
      }

      this.score += this.score / 666;
    }

    // Move head
    this.v[0].x += this.dx * this.speed;
    this.v[0].y += this.dy * this.speed;

    // Move body
    for (let i = 1; i < this.v.length; i++) {
      const prev = this.v[i - 1];
      const curr = this.v[i];
      if (this.range(prev, curr) > this.size / 5) {
        curr.x = (curr.x + prev.x) / 2;
        curr.y = (curr.y + prev.y) / 2;
      }
    }

    if (this.speed === 2) {
      this.score -= this.score / 2000;
    }

    const csUp = Math.pow(this.score / 1000, 1 / 5);
    this.size = (this.game.getSize() / 2) * csUp;

    const N = 3 * Math.floor(50 * Math.pow(this.score / 1000, 1));
    if (N > this.v.length) {
      this.v.push({ ...this.v[this.v.length - 1] });
    } else {
      this.v = this.v.slice(0, N);
    }

    if (
      this.name === playerName &&
      typeof window.updatePlayerInSupabase === "function"
    ) {
      window.updatePlayerInSupabase({
        name: this.name,
        x: this.v[0].x,
        y: this.v[0].y,
        score: this.score,
      });
    }
  }

  draw() {
    this.update();

    // Draw body
    for (let i = this.v.length - 1; i >= 1; i--) {
      if (this.game.isPoint(this.v[i].x, this.v[i].y)) {
        this.game.context.drawImage(
          this.bd_im,
          this.v[i].x - XX - this.size / 2,
          this.v[i].y - YY - this.size / 2,
          this.size,
          this.size
        );
      }
    }

    // Draw head
    this.game.context.save();
    this.game.context.translate(this.v[0].x - XX, this.v[0].y - YY);
    this.game.context.rotate(this.angle - Math.PI / 2);
    this.game.context.drawImage(
      this.sn_im,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size
    );
    this.game.context.restore();
  }

  getAngle(a, b) {
    const c = Math.sqrt(a * a + b * b);
    let angle = Math.acos(a / (c || 1));
    if (b < 0) angle = 2 * Math.PI - angle;
    return angle;
  }

  range(v1, v2) {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
  }
}

window.snake = snake;
