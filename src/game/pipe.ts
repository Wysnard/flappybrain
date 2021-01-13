import p5Types from "p5";

export class Pipe {
  constructor(
    public x: number,
    public w: number,
    public height: number,
    public centery: number,
    public speed = 1,
    public spacing = 40
  ) {}

  get top() {
    return this.centery - this.spacing / 2;
  }

  get bottom() {
    return this.height - (this.centery + this.spacing / 2);
  }

  show(p5: p5Types) {
    p5.fill(255);
    p5.rect(this.x, 0, this.w, this.top);
    p5.rect(this.x, p5.height - this.bottom, this.w, this.bottom);

    return this;
  }

  update() {
    this.x -= this.speed;

    return this;
  }

  static offscreen(pipe: Pipe) {
    return pipe.x < -pipe.w;
  }

  offscreen() {
    return Pipe.offscreen(this);
  }
}
