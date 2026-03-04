Write-Host "Cleaning Prisma temp artifacts (PowerShell)..."
$paths = @(
  "node_modules/.pnpm/@prisma*",
  "node_modules/@prisma",
  "node_modules/.prisma",
  ".prisma"
)
foreach ($p in $paths) {
  try {
    Get-ChildItem -Path $p -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
  } catch {
    # ignore
  }
}
Write-Host "Done."
