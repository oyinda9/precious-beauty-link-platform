#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      walk(fp, filelist);
    } else if (/\.tsx?$/.test(file)) {
      filelist.push(fp);
    }
  }
  return filelist;
}

function findMapsMissingKeys(src) {
  const results = [];
  const re = /\.map\s*\([^\)]*\)\s*=>\s*\(/g;
  let m;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].length;
    // Find the next '<' after the arrow
    const nextLt = src.indexOf("<", start);
    if (nextLt === -1) continue;
    // capture up to the end of the opening tag
    const openingEnd = src.indexOf(">", nextLt);
    if (openingEnd === -1) continue;
    const openingTag = src.slice(nextLt, openingEnd + 1);
    // if openingTag contains 'key=' then OK
    if (!/\bkey\s*=/.test(openingTag)) {
      // capture surrounding line number
      const before = src.slice(0, m.index);
      const line = before.split("\n").length;
      results.push({ pos: m.index, line, snippet: openingTag });
    }
  }
  return results;
}

function main() {
  const root = path.resolve(process.cwd());
  const apps = [path.join(root, "app"), path.join(root, "components")];
  const files = [];
  for (const a of apps) {
    if (fs.existsSync(a)) walk(a, files);
  }

  const report = [];
  for (const f of files) {
    try {
      const src = fs.readFileSync(f, "utf8");
      const issues = findMapsMissingKeys(src);
      if (issues.length) report.push({ file: f, issues });
    } catch (e) {}
  }

  if (report.length === 0) {
    console.log("No obvious missing key issues found by heuristic.");
    process.exit(0);
  }

  console.log("Potential missing key issues:");
  for (const r of report) {
    console.log("\nFile:", r.file);
    for (const it of r.issues) {
      console.log(`  line ${it.line}: ${it.snippet.replace(/\n/g, " ")}`);
    }
  }
  process.exit(0);
}

main();
