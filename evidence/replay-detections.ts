// Replay harness — scores the candidate's detect() against ground truth.
//
// Run:  npx tsx evidence/replay-detections.ts   (or: make replay-detections)
import { readFileSync } from 'node:fs';
import { detect, type AuthEvent, type ApiReq } from './detection.js';

const dir = new URL('.', import.meta.url).pathname;
function ndjson<T>(file: string): T[] {
  return readFileSync(`${dir}${file}`, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);
}

const auth = ndjson<AuthEvent>('auth-events.ndjson');
const api = ndjson<ApiReq>('api-requests.ndjson');
const truth = JSON.parse(readFileSync(`${dir}ground-truth.json`, 'utf8')) as {
  compromisedAccounts: string[];
};

const predicted = new Set(detect(auth, api).map((a) => a.userEmail));
const actual = new Set(truth.compromisedAccounts);

const tp = [...predicted].filter((e) => actual.has(e)).length;
const fp = [...predicted].filter((e) => !actual.has(e)).length;
const fn = [...actual].filter((e) => !predicted.has(e)).length;
const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

console.log(`events: ${auth.length} auth, ${api.length} api`);
console.log(`predicted compromised: ${[...predicted].join(', ') || '(none)'}`);
console.log(`actual compromised:    ${[...actual].join(', ')}`);
console.log(`TP=${tp} FP=${fp} FN=${fn}`);
console.log(`precision=${precision.toFixed(2)} recall=${recall.toFixed(2)} F1=${f1.toFixed(2)}`);
