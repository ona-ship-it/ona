# Archive script for ONAGUI project
# This script creates a zip archive of the temp-restore folder, excluding files in use

$sourceFolder = "C:\Users\Samira\.trae\temp-restore"
$destinationFile = "C:\Users\Samira\onagui-archive-2.zip"
$tempFolder = "C:\Users\Samira\.trae\temp-archive-files"

# Check if source folder exists
if (-not (Test-Path $sourceFolder)) {
    Write-Error "Source folder does not exist: $sourceFolder"
    exit 1
}

# Create temp folder for copying files
if (Test-Path $tempFolder) {
    Remove-Item -Path $tempFolder -Recurse -Force
}
New-Item -Path $tempFolder -ItemType Directory | Out-Null

Write-Host "Copying files to temporary location..."

# Copy files, excluding those likely to be locked
try {
    # Create the same directory structure
    Get-ChildItem -Path $sourceFolder -Recurse -Directory | 
        ForEach-Object {
            $relativePath = $_.FullName.Substring($sourceFolder.Length)
            $targetPath = Join-Path -Path $tempFolder -ChildPath $relativePath
            if (-not (Test-Path $targetPath)) {
                New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
            }
        }
    
    # Copy files, excluding .next/trace and node_modules
    Get-ChildItem -Path $sourceFolder -Recurse -File | 
        Where-Object { 
            $_.FullName -notlike "*\.next\trace*" -and 
            $_.FullName -notlike "*\node_modules\*" -and
            $_.FullName -notlike "*\.git\*"
        } | 
        ForEach-Object {
            $relativePath = $_.FullName.Substring($sourceFolder.Length)
            $targetPath = Join-Path -Path $tempFolder -ChildPath $relativePath
            try {
                Copy-Item -Path $_.FullName -Destination $targetPath -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "Could not copy: $($_.FullName) - Skipping"
            }
        }
} catch {
    Write-Error "Failed during copy operation: $_"
    exit 1
}

Write-Host "Creating archive from copied files..."

# Create the archive from the temp folder
try {
    Compress-Archive -Path "$tempFolder\*" -DestinationPath $destinationFile -Force
    Write-Host "Archive created successfully at $destinationFile"
} catch {
    Write-Error "Failed to create archive: $_"
    exit 1
} finally {
    # Clean up temp folder
    if (Test-Path $tempFolder) {
        Remove-Item -Path $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Archive process completed successfully!"