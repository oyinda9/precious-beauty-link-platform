#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function removeIfExists(p) {
  try {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }
}

function cleanupTmpFiles() {
  const candidates = [
    path.join("node_modules", ".pnpm"),
    path.join("node_modules", "@prisma"),
    path.join("node_modules", ".prisma"),
    path.join(".prisma"),
  ];

  for (const c of candidates) {
    const full = path.resolve(process.cwd(), c);
    if (!fs.existsSync(full)) continue;
    try {
      const walk = (dir) => {
        for (const name of fs.readdirSync(dir)) {
          const fp = path.join(dir, name);
          try {
            const stat = fs.lstatSync(fp);
            if (stat.isDirectory()) {
              walk(fp);
            } else {
              if (name.includes(".tmp") || name.includes(".node.tmp")) {
                try {
                  fs.unlinkSync(fp);
                } catch (e) {}
              }
            }
          } catch (e) {}
        }
      };
      walk(full);
    } catch (e) {
      // ignore cleanup errors
    }
  }
}

function removePrismaClientDirsInPnpm() {
  const pnpmDir = path.join("node_modules", ".pnpm");
  const fullPnpm = path.resolve(process.cwd(), pnpmDir);
  if (!fs.existsSync(fullPnpm)) return;
  try {
    for (const name of fs.readdirSync(fullPnpm)) {
      const candidate = path.join(fullPnpm, name);
      // look for nested node_modules/.prisma directories
      const possible = path.join(candidate, "node_modules", ".prisma");
      if (fs.existsSync(possible)) {
        try { fs.rmSync(possible, { recursive: true, force: true }); } catch (e) {}
      }
      // also remove any lingering .node files inside .prisma/client
      const clientDir = path.join(candidate, "node_modules", ".prisma", "client");
      if (fs.existsSync(clientDir)) {
        try {
          for (const f of fs.readdirSync(clientDir)) {
            if (f.toLowerCase().includes("query_engine") || f.toLowerCase().includes(".node")) {
              try { fs.unlinkSync(path.join(clientDir, f)); } catch (e) {}
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    // ignore
  }
}

const maxAttempts = 5;
let attempt = 0;

while (attempt < maxAttempts) {
  attempt++;
  try {
    console.log(`prisma-generate-retry: attempt ${attempt}/${maxAttempts}`);
    execSync("pnpm exec prisma generate --schema=prisma/schema.prisma", {
      stdio: "inherit",
    });
    console.log("prisma-generate-retry: success");
    process.exit(0);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error(`prisma-generate-retry: attempt ${attempt} failed: ${msg}`);
    if (attempt >= maxAttempts) {
      console.error(
        "prisma-generate-retry: reached max attempts, exiting with error",
      );
      process.exit(1);
    }
    console.log(
      "prisma-generate-retry: cleaning tmp files and retrying in 2s...",
    );
    try {
      cleanupTmpFiles();
      removePrismaClientDirsInPnpm(); // Call the new function to clean up Prisma client directories
    } catch (e) {}
    const end = Date.now() + 2000;
    while (Date.now() < end) {}
  }
}
