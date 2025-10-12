/*
  Scans the project for JSON files and reports parse errors.
  Excludes common build and dependency directories.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const excludeDirs = new Set(['node_modules', '.next', '.swc', '.git', 'dist', 'build', 'extensions']);

function isExcludedDir(p) {
  return p.split(path.sep).some(seg => excludeDirs.has(seg) || seg.trim() === '');
}

function walkDir(dir, out = []) {
  if (isExcludedDir(path.relative(root, dir))) return out;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

function getLineCol(str, position) {
  let line = 1;
  let col = 1;
  for (let i = 0; i < position && i < str.length; i++) {
    if (str.charCodeAt(i) === 10) { // \n
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, col };
}

function tryParseJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    JSON.parse(content);
    return null;
  } catch (err) {
    const msg = String(err && err.message || err);
    const m = msg.match(/position\s(\d+)/i);
    let loc = null;
    if (m) {
      const pos = parseInt(m[1], 10);
      loc = getLineCol(content, pos);
    }
    return { message: msg, position: m ? parseInt(m[1], 10) : null, loc };
  }
}

function main() {
  console.log(`Scanning JSON files under: ${root}`);
  const files = walkDir(root);
  console.log(`Found ${files.length} JSON files to check.`);
  const errors = [];
  for (const f of files) {
    const res = tryParseJson(f);
    if (res) {
      errors.push({ file: f, ...res });
      const locStr = res.loc ? `line ${res.loc.line}, col ${res.loc.col}` : 'unknown location';
      console.log(`[INVALID] ${f} -> ${locStr} :: ${res.message}`);
    }
  }
  console.log('--- Summary ---');
  console.log(`Invalid JSON files: ${errors.length}`);
  if (errors.length > 0) {
    const summary = errors.map(e => ({ file: e.file, line: e.loc ? e.loc.line : null, col: e.loc ? e.loc.col : null, message: e.message }));
    try {
      fs.writeFileSync(path.join(root, 'json-scan-report.json'), JSON.stringify(summary, null, 2));
      console.log(`Wrote report to json-scan-report.json`);
    } catch {}
    process.exitCode = 1;
  }
}

main();
