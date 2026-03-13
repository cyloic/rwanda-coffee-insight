/**
 * Pure TypeScript LSTM inference engine.
 * Runs the trained Rwanda coffee-price model entirely in the browser —
 * no Python, no TensorFlow runtime, no additional back-end.
 *
 * Architecture (from training):
 *   LSTM(64, return_sequences=True)  →  Dropout(0.2)
 *   LSTM(64)                         →  Dropout(0.2)
 *   Dense(32, relu)                  →  Dense(1, linear)
 *
 * Scaler: MinMaxScaler fitted on training data (2020–2026).
 * Features: [Price_USD_per_kg, Rainfall_mm, Temperature_C, Price_7d_ago, Price_30d_ago]
 */

export interface LSTMWeights {
  lstm1: { kernel: number[][]; recurrent_kernel: number[][]; bias: number[] };
  lstm2: { kernel: number[][]; recurrent_kernel: number[][]; bias: number[] };
  dense1: { kernel: number[][]; bias: number[] };
  dense2: { kernel: number[][]; bias: number[] };
}

// Scaler params extracted from deployment/scaler.pkl (MinMaxScaler, feature_range=[0,1])
// Features: [Price_USD_per_kg, Rainfall_mm, Temperature_C, Price_7d_ago, Price_30d_ago]
export const SCALER: {
  scale_: number[];
  min_: number[];
  data_min_: number[];
  data_max_: number[];
} = {
  data_min_: [2.064630769502108, 0.05, 16.13, 2.064630769502108, 2.064630769502108],
  data_max_: [5.695647189544789, 39.98, 26.45, 5.695647189544789, 5.695647189544789],
  scale_:    [0.2754049787492411, 0.02504382669671926, 0.09689922480620154, 0.2754049787492411, 0.2754049787492411],
  min_:      [-0.5686095931997573, -0.0012521913348359631, -1.5629844961240307, -0.5686095931997573, -0.5686095931997573],
};

// Rwanda average weather from training-data window (used for future forecast steps)
const MEAN_RAIN_MM = 2.32;
const MEAN_TEMP_C  = 20.12;

// Model MAPE from training (used for confidence interval growth)
const MODEL_MAPE_PCT = 1.08;

// ---------- math helpers ----------

function scaleFeature(v: number, i: number): number {
  return v * SCALER.scale_[i] + SCALER.min_[i];
}

function inverseScalePrice(s: number): number {
  return (s - SCALER.min_[0]) / SCALER.scale_[0];
}

function clamp(x: number, lo = -30, hi = 30): number {
  return x < lo ? lo : x > hi ? hi : x;
}

function sigmoid(x: number): number { return 1 / (1 + Math.exp(-clamp(x))); }
function tanh(x: number): number    { return Math.tanh(clamp(x)); }

// ---------- layer implementations ----------

/**
 * One LSTM cell step.
 * Keras gate order inside the concatenated kernel: i, f, c_gate, o
 */
function lstmStep(
  x:       number[],
  h:       number[],
  c:       number[],
  kernel:  number[][],
  rKernel: number[][],
  bias:    number[],
): [h_new: number[], c_new: number[]] {
  const units = h.length;
  const nGates = bias.length; // 4 * units

  // gates = bias + x·kernel + h·rKernel
  const gates = bias.slice(); // copy

  for (let i = 0; i < x.length; i++) {
    const xi = x[i];
    if (xi === 0) continue;
    const ki = kernel[i];
    for (let j = 0; j < nGates; j++) gates[j] += xi * ki[j];
  }

  for (let i = 0; i < units; i++) {
    const hi = h[i];
    if (hi === 0) continue;
    const ri = rKernel[i];
    for (let j = 0; j < nGates; j++) gates[j] += hi * ri[j];
  }

  // Split gates: i | f | g | o
  const i_g = gates.slice(0,         units).map(sigmoid);
  const f_g = gates.slice(units,   2*units).map(sigmoid);
  const g_g = gates.slice(2*units, 3*units).map(tanh);
  const o_g = gates.slice(3*units, 4*units).map(sigmoid);

  const c_new = c.map((cv, k) => f_g[k] * cv + i_g[k] * g_g[k]);
  const h_new = o_g.map((o, k) => o * Math.tanh(clamp(c_new[k])));

  return [h_new, c_new];
}

function denseLayer(x: number[], kernel: number[][], bias: number[], relu = false): number[] {
  const out = bias.slice();
  for (let j = 0; j < out.length; j++) {
    for (let i = 0; i < x.length; i++) out[j] += x[i] * kernel[i][j];
    if (relu) out[j] = Math.max(0, out[j]);
  }
  return out;
}

// ---------- full forward pass ----------

function runModel(sequence: number[][], w: LSTMWeights): number {
  const u1 = w.lstm1.bias.length / 4;
  const u2 = w.lstm2.bias.length / 4;

  // LSTM 1 — return_sequences=True
  let h1 = new Array(u1).fill(0);
  let c1 = new Array(u1).fill(0);
  const out1: number[][] = [];
  for (const x of sequence) {
    [h1, c1] = lstmStep(x, h1, c1, w.lstm1.kernel, w.lstm1.recurrent_kernel, w.lstm1.bias);
    out1.push(h1);
  }

  // LSTM 2 — return_sequences=False
  let h2 = new Array(u2).fill(0);
  let c2 = new Array(u2).fill(0);
  for (const x of out1) {
    [h2, c2] = lstmStep(x, h2, c2, w.lstm2.kernel, w.lstm2.recurrent_kernel, w.lstm2.bias);
  }

  const d1 = denseLayer(h2, w.dense1.kernel, w.dense1.bias, true);  // relu
  const d2 = denseLayer(d1, w.dense2.kernel, w.dense2.bias, false); // linear
  return d2[0]; // single scalar output (scaled price)
}

// ---------- seed-window builder ----------

/**
 * Build the 30-row [5-feature] input window from price history.
 * Prices come in as RWF; exchangeRate converts them to USD for the model.
 */
function buildSeedWindow(pricesRwf: number[], exchangeRate: number): number[][] {
  const N = 30;
  const seed = pricesRwf.slice(-N);
  const seedUsd = seed.map(p => p / exchangeRate);

  return seedUsd.map((usd, idx) => {
    const p7  = seedUsd[Math.max(0, idx - 7)];
    const p30 = seedUsd[Math.max(0, idx - 30)];
    return [
      scaleFeature(usd,           0),
      scaleFeature(MEAN_RAIN_MM,  1),
      scaleFeature(MEAN_TEMP_C,   2),
      scaleFeature(p7,            3),
      scaleFeature(p30,           4),
    ];
  });
}

// ---------- public API ----------

export interface RawForecastStep {
  date:       string;
  price:      number; // RWF
  priceUsd:   number;
  confidence: number;
}

/**
 * Generate a 30-day autoregressive LSTM forecast.
 *
 * @param pricesRwf    At least 37 daily prices in RWF (most recent last)
 * @param exchangeRate Live USD→RWF rate
 * @param weights      Loaded from /lstmModel/weights.json
 * @param lastDate     ISO date string of the last history point
 */
export function generateLSTMForecast(
  pricesRwf:    number[],
  exchangeRate: number,
  weights:      LSTMWeights,
  lastDate:     string,
): RawForecastStep[] {
  const window = buildSeedWindow(pricesRwf, exchangeRate);

  // Rolling USD price buffer for lag feature construction
  const buf = pricesRwf.slice(-60).map(p => p / exchangeRate);

  const DAYS = 30;
  const results: RawForecastStep[] = [];
  const start = new Date(lastDate);

  for (let step = 0; step < DAYS; step++) {
    const scaledPred = runModel(window, weights);
    const usd        = inverseScalePrice(scaledPred);
    const rwf        = Math.round(usd * exchangeRate);

    // Confidence: starts at ~93%, decays with sqrt(step) based on model MAPE
    const uncert     = MODEL_MAPE_PCT * Math.sqrt(step + 1);
    const confidence = Math.max(60, Math.round(93 - uncert * 2.5));

    const d = new Date(start);
    d.setDate(d.getDate() + step + 1);
    results.push({
      date:       d.toISOString().split('T')[0],
      price:      rwf,
      priceUsd:   Math.round(usd * 100) / 100,
      confidence,
    });

    // Advance the 30-row window one step forward
    buf.push(usd);
    const p7  = buf[Math.max(0, buf.length - 8)];
    const p30 = buf[Math.max(0, buf.length - 31)];
    const newRow = [
      scaleFeature(usd,          0),
      scaleFeature(MEAN_RAIN_MM, 1),
      scaleFeature(MEAN_TEMP_C,  2),
      scaleFeature(p7,           3),
      scaleFeature(p30,          4),
    ];
    window.shift();
    window.push(newRow);
  }

  return results;
}
