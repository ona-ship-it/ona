/*
  Hook JSON.parse and fs reads to log the filename when a JSON parse error occurs.
  Also wraps require() for .json to intercept parsing.
*/
const fs = require('fs');
const crypto = require('crypto');
const Module = require('module');

const contentToPath = new Map();
const origReadFileSync = fs.readFileSync;
const origReadFile = fs.readFile;
const origPromisesReadFile = fs.promises && fs.promises.readFile;
const origJsonParse = JSON.parse;

function hash(str) {
  return crypto.createHash('sha1').update(str).digest('hex');
}
function toString(data, encoding) {
  if (typeof data === 'string') return data;
  if (Buffer.isBuffer(data)) return data.toString(encoding || 'utf8');
  try { return String(data); } catch { return ''; }
}
function remember(path, data, encoding) {
  try {
    const str = toString(data, encoding);
    contentToPath.set(hash(str), path);
  } catch {}
}

fs.readFileSync = function patchedReadFileSync(path, options) {
  const data = origReadFileSync.apply(this, arguments);
  try {
    const encoding = (typeof options === 'string') ? options : (options && options.encoding);
    remember(path, data, encoding);
  } catch {}
  return data;
};
fs.readFile = function patchedReadFile(path, options, cb) {
  let callback = cb, encoding;
  if (typeof options === 'function') { callback = options; encoding = undefined; }
  else { encoding = (typeof options === 'string') ? options : (options && options.encoding); }
  return origReadFile.call(this, path, options, function(err, data) {
    try { if (!err) remember(path, data, encoding); } catch {}
    return callback && callback(err, data);
  });
};
if (origPromisesReadFile) {
  fs.promises.readFile = async function patchedPromisesReadFile(path, options) {
    const res = await origPromisesReadFile(path, options);
    try {
      const encoding = (typeof options === 'string') ? options : (options && options.encoding);
      remember(path, res, encoding);
    } catch {}
    return res;
  };
}

// Patch require for .json
try {
  const jsonExt = Module._extensions['.json'];
  Module._extensions['.json'] = function patchedJsonModule(module, filename) {
    const content = fs.readFileSync(filename, 'utf8');
    try {
      const data = origJsonParse(content);
      module.exports = data;
    } catch (err) {
      console.error('[JSON-DEBUG] require(.json) parse error', { file: filename, message: String(err && err.message || err) });
      throw err;
    }
  };
} catch {}

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
      let loc = null;
      if (pos != null && typeof str === 'string') {
        let line = 1, col = 1;
        for (let i = 0; i < pos && i < str.length; i++) {
          if (str.charCodeAt(i) === 10) { line++; col = 1; } else { col++; }
        }
        loc = { line, col };
      }
      const start = Math.max(0, (pos || 0) - 120);
      const end = Math.min(typeof str === 'string' ? str.length : 0, (pos || 0) + 120);
      const snippet = typeof str === 'string' ? str.slice(start, end).replace(/\n/g, '\\n') : undefined;
      console.error('[JSON-DEBUG] Parse error', { file, position: pos, loc, message: msg, snippet, stack: err && err.stack });
    } catch {}
    throw err;
  }
};

console.log('[JSON-DEBUG] Hook installed');
