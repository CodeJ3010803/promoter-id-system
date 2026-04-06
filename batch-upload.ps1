# Photo System Setup and Batch Upload Script for Windows PowerShell
# Usage: .\batch-upload.ps1 -SourceDirectory "C:\photos"

param(
    [Parameter(Mandatory=$true)]
    [string]$SourceDirectory,
    
    [Parameter(Mandatory=$false)]
    [switch]$RenamePhotos = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$EmployeeNumberFormat = "EMP"
)

# Colors for output
$colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
}

function Write-ColorOutput($message, $color = 'White') {
    Write-Host $message -ForegroundColor $color
}

# Banner
Write-ColorOutput @"
╔═════════════════════════════════════╗
║  Photo System Batch Upload Tool     ║
║  Windows PowerShell Edition         ║
╚═════════════════════════════════════╝
"@ $colors.Info

Write-ColorOutput "Source Directory: $SourceDirectory" $colors.Info

# Validate directory
if (-not (Test-Path $SourceDirectory)) {
    Write-ColorOutput "✗ Error: Directory not found: $SourceDirectory" $colors.Error
    exit 1
}

# Get supported file types
$supportedExtensions = @('.jpg', '.jpeg', '.png', '.gif', '.webp')
Write-ColorOutput "Supported formats: $($supportedExtensions -join ', ')" $colors.Info
Write-ColorOutput ""

# Find all photos
$allFiles = Get-ChildItem -Path $SourceDirectory -File
$photoFiles = $allFiles | Where-Object { $_.Extension.ToLower() -in $supportedExtensions }

if ($photoFiles.Count -eq 0) {
    Write-ColorOutput "✗ No photo files found in directory" $colors.Error
    exit 1
}

Write-ColorOutput "Found $($photoFiles.Count) photo file(s)" $colors.Info
Write-ColorOutput ""

# Optional: Rename photos to correct format
if ($RenamePhotos) {
    Write-ColorOutput "Preparing to rename photos to EMP### format..." $colors.Warning
    Write-ColorOutput ""
    
    $renameCount = 0
    foreach ($photo in $photoFiles) {
        # Extract just the number from filename if possible
        $nameWithoutExt = [IO.Path]::GetFileNameWithoutExtension($photo.Name)
        
        # Try to extract employee number
        if ($nameWithoutExt -match '\d{3,}') {
            $empNumber = [regex]::Matches($nameWithoutExt, '\d{3,}') | Select-Object -First 1 | ForEach-Object { $_.Value }
            $newName = "$EmployeeNumberFormat$($empNumber.PadLeft(3, '0'))$($photo.Extension)"
            
            if ($newName -ne $photo.Name) {
                $newPath = Join-Path $SourceDirectory $newName
                Rename-Item -Path $photo.FullName -NewName $newName -Force
                Write-ColorOutput "  ✓ $($photo.Name) → $newName" $colors.Success
                $renameCount++
            }
        }
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "Renamed $renameCount file(s)" $colors.Info
    Write-ColorOutput ""
    
    # Refresh file list
    $photoFiles = Get-ChildItem -Path $SourceDirectory -File | Where-Object { $_.Extension.ToLower() -in $supportedExtensions }
}

# Validate naming convention
Write-ColorOutput "Validating file names..." $colors.Info
$validFiles = @()
$invalidFiles = @()

foreach ($photo in $photoFiles) {
    $nameWithoutExt = [IO.Path]::GetFileNameWithoutExtension($photo.Name)
    
    # Check if matches EMP### pattern
    if ($nameWithoutExt -match '^EMP\d{3,}$') {
        $validFiles += $photo
    } else {
        $invalidFiles += $photo
    }
}

if ($invalidFiles.Count -gt 0) {
    Write-ColorOutput ""
    Write-ColorOutput "⚠️  Invalid file names (will skip):" $colors.Warning
    foreach ($file in $invalidFiles) {
        Write-ColorOutput "   • $($file.Name) (Expected: EMP###.ext)" $colors.Warning
    }
}

if ($validFiles.Count -eq 0) {
    Write-ColorOutput ""
    Write-ColorOutput "✗ No files with valid naming (EMP###.ext)" $colors.Error
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "Valid files to upload: $($validFiles.Count)" $colors.Success
Write-ColorOutput ""

# Show file list
Write-ColorOutput "Files to upload:" $colors.Info
foreach ($file in $validFiles) {
    $sizeMB = "{0:F2}" -f ($file.Length / 1MB)
    Write-ColorOutput "  • $($file.Name) ($sizeMB MB)" $colors.Info
}
Write-ColorOutput ""

# Confirm before upload
$confirm = Read-Host "Proceed with upload? (y/n)"
if ($confirm -ne 'y') {
    Write-ColorOutput "Upload cancelled." $colors.Warning
    exit 0
}

Write-ColorOutput ""
Write-ColorOutput "Starting upload to http://localhost:3000..." $colors.Info
Write-ColorOutput ""

# Run Node.js batch upload script
try {
    node batch-upload-photos.js $SourceDirectory
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-ColorOutput ""
        Write-ColorOutput "✓ Upload complete!" $colors.Success
    } else {
        Write-ColorOutput ""
        Write-ColorOutput "⚠️  Upload completed with errors" $colors.Warning
    }
} catch {
    Write-ColorOutput ""
    Write-ColorOutput "✗ Error running upload script: $_" $colors.Error
    Write-ColorOutput ""
    Write-ColorOutput "Make sure:" $colors.Info
    Write-ColorOutput "  • Node.js is installed and in PATH" $colors.Info
    Write-ColorOutput "  • You're in the promoter-id-system directory" $colors.Info
    Write-ColorOutput "  • batch-upload-photos.js exists" $colors.Info
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "✓ Done!" $colors.Success
Write-ColorOutput ""
