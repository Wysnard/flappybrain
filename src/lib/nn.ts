import * as tf from "@tensorflow/tfjs";

export function randomNN() {
  const model = tf.sequential();
  tf.tidy(() => {
    model.add(
      tf.layers.dense({
        inputShape: [5],
        units: 10,
        activation: "sigmoid",
      })
    );
    model.add(
      tf.layers.dense({
        units: 2,
        activation: "softmax",
      })
    );
  });
  return model;
}
