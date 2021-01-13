import * as tf from "@tensorflow/tfjs";
import fp from "lodash/fp";
import p5Types from "p5";

import { randomNN } from "../lib/nn";
import { getRandomArbitrary } from "../lib/utils";
import { Pipe } from "./pipe";
import { GRAVITY, hits } from "./world";

const LIFT = 12;

export interface IBirdProps {
  x: number;
  y: number;
  velocity?: number;
  brain?: tf.Sequential;
  score?: number;
  fitness?: number;
  alive?: boolean;
}

export class Bird implements IBirdProps {
  x: number;
  y: number;
  velocity: number;
  brain: tf.Sequential;
  score: number;
  fitness: number;
  alive: boolean;

  constructor({
    x,
    y,
    velocity = 0,
    brain = randomNN(),
    score = 0,
    fitness = 0,
    alive = true,
  }: IBirdProps) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.brain = brain;
    this.score = score;
    this.fitness = fitness;
    this.alive = alive;
  }

  clone({ brain = this.brain, ...args }: Partial<IBirdProps>) {
    const model = randomNN();
    const weights = brain.getWeights();
    model.setWeights(fp.map((weight) => weight.clone(), weights));

    return new Bird({ ...this, brain: model, ...args });
  }

  cloneAndMutate(
    { brain = this.brain, ...args }: Partial<IBirdProps>,
    mutation_rate = 0.1,
    range = [-0.1, 0.1]
  ) {
    const model = randomNN();

    tf.tidy(() => {
      const weights = brain.getWeights();
      const mutated_weights = fp.map((weight) => {
        return tf.tidy(() => {
          const tensor = weight.clone();
          const shape = weight.shape;
          const values = fp.map(
            (elem) =>
              fp.random(0, 1) < mutation_rate
                ? elem + getRandomArbitrary(range[0], range[1])
                : elem,
            tensor.dataSync().slice()
          );
          const newTensor = tf.tensor(values, shape);

          tensor.dispose();

          return newTensor;
        });
      }, weights);
      model.setWeights(mutated_weights);
    });

    return new Bird({ ...this, brain: model, ...args });
  }

  free() {
    this.brain.dispose();
  }

  incScore(inc = 1) {
    if (!this.alive) return this;

    this.score += inc;

    return this;
  }

  show(p5: p5Types) {
    if (!this.alive) return this;

    p5.stroke(255);
    p5.fill(255, 100);
    p5.ellipse(this.x, this.y, 16, 16);

    return this;
  }

  update({ height }: p5Types) {
    if (!this.alive) return this;

    this.velocity += GRAVITY;
    this.velocity *= 0.9;
    this.y += this.velocity;

    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }

    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }

    return this;
  }

  die() {
    this.alive = false;
  }

  fly() {
    this.velocity -= LIFT;
  }

  think(pipes: Pipe[]) {
    if (!this.alive) return this;

    const input = [
      this.y,
      this.velocity,
      pipes[0].x,
      pipes[0].top,
      pipes[0].bottom,
    ];
    tf.tidy(() => {
      const tf_input = tf.tensor2d([input]);
      const result: any = this.brain.predict(tf_input);
      const output = result.dataSync();
      // console.log(output);
      if (output[0] > output[1]) this.fly();

      result.dispose();
      tf_input.dispose();
    });

    return this;
  }

  hits(height: number, pipes: Pipe[]) {
    if (fp.any((pipe) => hits(height, this, pipe), pipes)) this.die();

    return this;
  }
}
