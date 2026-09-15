import { readFileSync } from 'node:fs';
import { detect, type ApiReq, type AuthEvent } from './detection.js';

const dir = new URL('.', import.meta.url).pathname;

function readNdjson<T>(file: string): T[] {
  return readFileSync(`${dir}${file}`, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

const auth = readNdjson<AuthEvent>('auth-events.ndjson');
const api = readNdjson<ApiReq>('api-requests.ndjson');
const alerts = detect(auth, api);

console.log(`events: ${auth.length} auth, ${api.length} api`);
console.log(JSON.stringify(alerts, null, 2));
