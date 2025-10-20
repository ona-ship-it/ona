# PowerShell script to zip the onagui-new project
$sourceFolder = "C:\Users\Samira\.trae\onagui-new"
$tempFolder = "C:\Users\Samira\.trae\onagui-new-temp"
$destinationZip = "C:\Users\Samira\.trae\ONAGUI-step1.zip"

# Check if the source folder exists
if (-not (Test-Path $sourceFolder)) {
    Write-Error "Source folder does not exist: $sourceFolder"
    exit 1
}

# Create a temporary folder for copying files
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null
Write-Host "Created temporary folder: $tempFolder"

# Copy all files to temporary folder, including .next directory and node_modules
Write-Host "Copying all files to temporary folder..."
Get-ChildItem -Path $sourceFolder | 
    Copy-Item -Destination $tempFolder -Recurse -Force

# Remove existing zip file if it exists
if (Test-Path $destinationZip) {
    Remove-Item $destinationZip -Force
    Write-Host "Removed existing zip file: $destinationZip"
}

try {
    # Create a new zip file from the temporary folder
    Write-Host "Creating zip file from temporary folder..."
    Compress-Archive -Path "$tempFolder\*" -DestinationPath $destinationZip -CompressionLevel Optimal
    
    # Check if the zip file was created successfully
    if (Test-Path $destinationZip) {
        Write-Host "Successfully created zip file: $destinationZip"
        Write-Host "You can now attach this file to an email and send it to samiraeddaoudi88@gmail.com"
        
        # Clean up temporary folder
        Remove-Item $tempFolder -Recurse -Force
        Write-Host "Cleaned up temporary folder"
    } else {
        Write-Error "Failed to create zip file: $destinationZip"
    }
} catch {
    Write-Error "An error occurred while creating the zip file: $_"
    
    # Clean up temporary folder even if there was an error
    if (Test-Path $tempFolder) {
        Remove-Item $tempFolder -Recurse -Force
        Write-Host "Cleaned up temporary folder"
    }
}