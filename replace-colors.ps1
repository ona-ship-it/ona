$projectRoot = "C:\Users\Samira\.trae\temp-restore"
$fileTypes = @("*.tsx", "*.ts", "*.jsx", "*.js", "*.css")

# Create a hashtable for replacements
$replacements = @{
    "bg-purple-600" = "bg-onaguiGreen"
    "hover:bg-purple-700" = "hover:bg-onaguiGreen-dark"
    "focus:border-purple-500" = "focus:border-onaguiGreen"
    "focus:ring-purple-500" = "focus:ring-onaguiGreen"
    "border-purple-400" = "border-onaguiGreen-light"
    "text-purple-600" = "text-onaguiGreen"
}

# Get all files of specified types
$files = Get-ChildItem -Path $projectRoot -Include $fileTypes -Recurse

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

Write-Host "Found $totalFiles files to process..."

foreach ($file in $files) {
    $processedFiles++
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Apply all replacements
    foreach ($pattern in $replacements.Keys) {
        $replacement = $replacements[$pattern]
        $content = $content -replace $pattern, $replacement
    }
    
    # Only write to file if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content
        $modifiedFiles++
        Write-Host "Modified: $($file.FullName)"
    }
    
    # Show progress
    if ($processedFiles % 50 -eq 0 -or $processedFiles -eq $totalFiles) {
        Write-Host "Progress: $processedFiles / $totalFiles files processed"
    }
}

Write-Host "Completed! Modified $modifiedFiles out of $totalFiles files."