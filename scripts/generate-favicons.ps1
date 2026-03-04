# PowerShell script to generate favicons using ImageMagick (magick.exe)
# Usage: .\scripts\generate-favicons.ps1

$src = "public\placeholder-logo.png"
$outDir = "public\favicons"

if (-not (Test-Path $src)) {
    Write-Error "Source image $src not found. Place your image at $src and re-run this script."
    exit 1
}

New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$sizes = @(16,32,48,64,96,128,192,256,512,180)
foreach ($s in $sizes) {
    $out = "$outDir\favicon-${s}x${s}.png"
    Write-Host "Generating $out"
    magick convert $src -resize ${s}x${s} -background none -gravity center -extent ${s}x${s} $out
}

# Create favicon.ico
Write-Host "Generating $outDir\favicon.ico"
magick convert $outDir\favicon-16x16.png $outDir\favicon-32x32.png $outDir\favicon-48x48.png $outDir\favicon-64x64.png $outDir\favicon.ico

Write-Host "Favicons generated in $outDir"
