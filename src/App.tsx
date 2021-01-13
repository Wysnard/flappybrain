import React, { useState } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import fp from "lodash/fp";
import * as tf from "@tensorflow/tfjs";

import { Bird, IBirdProps } from "./game/bird";
import { Pipe } from "./game/pipe";
import { nextGeneration } from "./lib/ga";

const TOTAL_POPULATION = 250;
const CYCLES = 10;

let createPipe: (...args: Partial<ConstructorParameters<typeof Pipe>>) => Pipe;
let createBird: (args: Partial<IBirdProps>) => Bird;
let newGame: (...args: any[]) => void;

const App = () => {
  const [generation, setGeneration] = useState<number>(0);
  const [birds, setBirds] = useState<Bird[]>([new Bird({ x: 0, y: 0 })]);
  const [pipes, setPipes] = useState<Pipe[]>([new Pipe(0, 0, 0, 0)]);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    tf.setBackend("cpu");

    createPipe = () => {
      return new Pipe(
        p5.width,
        40,
        p5.height,
        fp.random(20, p5.height),
        1,
        fp.random(80, p5.height / 4)
      );
    };
    createBird = ({ x = 50, y = p5.width / 2, velocity = 0, ...args }) =>
      new Bird({ x, y, velocity, ...args });
    newGame = (
      gen_birds = fp.map(() => createBird({}), fp.range(0, TOTAL_POPULATION))
    ) => {
      // Create New Generation
      setGeneration((gen) => gen + 1);
      setBirds(gen_birds);
      setPipes([createPipe()]);
    };

    p5.createCanvas(400, 400).parent(canvasParentRef);
    newGame();
  };

  const draw = (p5: p5Types) => {
    fp.forEach((pipe) => pipe.update(), pipes);
    if (fp.any(Pipe.offscreen, pipes))
      setPipes(
        fp.filter((pipe) => !pipe.offscreen(), [...pipes, createPipe()])
      );

    fp.forEach(
      (bird) => bird.incScore().hits(p5.height, pipes).think(pipes).update(p5),
      birds
    );
    if (fp.all((bird) => !bird.alive, birds))
      newGame(nextGeneration(TOTAL_POPULATION, birds));

    // drawing stuff
    p5.background(0);

    fp.forEach((pipe) => pipe.show(p5), pipes);
    fp.forEach((bird) => bird.show(p5), birds);
  };

  return (
    <>
      <div>Generation : {generation}</div>
      <Sketch setup={setup} draw={draw} />
      <button onClick={() => console.log(tf.memory())}>Log</button>
    </>
  );
};

export default App;
