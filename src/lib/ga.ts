import fp from "lodash/fp";

import { Bird } from "../game/bird";

export function nextGeneration(total_population: number, prev_gen: Bird[]) {
  const sum_score = fp.flow(
    fp.map((bird: Bird) => bird.score),
    fp.sum
  )(prev_gen);
  fp.forEach((bird) => (bird.fitness = bird.score / sum_score), prev_gen);

  const new_generation = fp.map(
    () => pickOne(prev_gen),
    fp.range(0, total_population)
  );

  fp.forEach((bird) => bird.free(), prev_gen);

  return new_generation;
}

export function pickOne(birds: Bird[]) {
  let index = 0;
  let r = Math.random();

  while (r >= 0) {
    r = r - birds[index].fitness;
    index++;
  }
  index--;

  const child = birds[index].cloneAndMutate({ alive: true });
  return child;
}
