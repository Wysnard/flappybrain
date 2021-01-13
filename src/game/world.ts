import { Bird } from "./bird";
import { Pipe } from "./pipe";

export const GRAVITY = 0.7;
export const AIR_RESISTANCE = 0.9;

export function hits(height: number, bird: Bird, pipe: Pipe) {
  if (bird.y < pipe.top || bird.y > height - pipe.bottom) {
    if (bird.x > pipe.x && bird.x < pipe.x + pipe.w) {
      return true;
    }
  }
  return false;
}
