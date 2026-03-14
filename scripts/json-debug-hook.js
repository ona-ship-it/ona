/*
  Hook JSON.parse and fs.readFileSync to log the filename when a JSON parse error occurs.
  Designed for debugging during Next.js dev startup.
*/
const fs = require('fs');
const crypto = require('crypto');

const contentToPath = new Map();
const origReadFileSync = fs.readFileSync;
const origJsonParse = JSON.parse;

function hash(str) {
  return crypto.createHash('sha1').update(str).digest('hex');
}

fs.readFileSync = function patchedReadFileSync(path, options) {
  const data = origReadFileSync.apply(this, arguments);
  try {
    if (typeof path === 'string' && path.toLowerCase().endsWith('.json')) {
      const str = typeof data === 'string' ? data : data.toString('utf8');
      contentToPath.set(hash(str), path);
    }
  } catch {}
  return data;
};

JSON.parse = function patchedJsonParse(str) {
  try {
    return origJsonParse.apply(this, arguments);
  } catch (err) {
    try {
      const h = typeof str === 'string' ? hash(str) : undefined;
      const file = h ? contentToPath.get(h) : undefined;
      const msg = String(err && err.message || err);
      const m = msg.match(/position\s(\d+)/i);
      const pos = m ? parseInt(m[1], 10) : null;
      const loc = (() => {
        if (pos == null || typeof str !== 'string') return null;
        let line = 1, col = 1;
        for (let i = 0; i < pos && i < str.length; i++) {
          if (str.charCodeAt(i) === 10) { line++; col = 1; } else { col++; }
        }
        return { line, col };
      })();
      const snippet = typeof str === 'string' ? str.slice(Math.max(0, (pos||0) - 80), (pos||0) + 80).replace(/\n/g, '\\n') : undefined;
      const stack = new Error('JSON.parse error').stack;
      console.error('[JSON-DEBUG] Parse error', { file, position: pos, loc, message: msg, snippet, stack });
    } catch {}
    throw err;
  }
};

console.log('[JSON-DEBUG] Hook installed');