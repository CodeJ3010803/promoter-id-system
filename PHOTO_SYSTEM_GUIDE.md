# Photo System - Setup and Usage Guide

## Overview

The Photo System allows you to:
- Store employee photos in `/uploads/photos/`
- Automatically load photos in ID Designer and generators
- Use fallback to `default.png` if photo not found
- Drag and resize photos on canvas
- Support batch generation and exports with photos

## Directory Structure

```
promoter-id-system/
├── app/
│   └── uploads/
│       └── photos/
│           ├── EMP001.jpg          ← Employee photo (use employeeno as filename)
│           ├── EMP002.jpg
│           ├── EMP003.png
│           └── default.png         ← Fallback image (required)
```

## File Naming Convention

**Format**: `{employeeno}.{ext}`

**Examples:**
- `EMP001.jpg`
- `EMP002.png`
- `EMP003.jpeg`
- `EMP100.gif`

**Supported Formats:** JPG, JPEG, PNG, GIF, WebP

**File Size Limit:** 5MB per photo

## Setting Up the Photo System

### Step 1: Create Photos Directory

The directory is automatically created at startup. Location:
```
d:\HR\TMTWEB\promoter-id-system\app\uploads\photos\
```

### Step 2: Create Default Placeholder

Create a `default.png` file (200x250px recommended) showing:
- "No Photo Available" or similar message
- Company logo or placeholder image
- Place it at: `/app/uploads/photos/default.png`

### Step 3: Add Employee Photos

1. Get employee photo (JPG/PNG format)
2. Rename to employeeno (e.g., `EMP001.jpg`)
3. Place in `/app/uploads/photos/` directory

## API Endpoints

### Get Photo (Binary)
```
GET /api/photos/:employeeno
```

Returns the photo file if found, or default.png otherwise.
- Returns image binary data with correct MIME type
- Use this to serve photos directly in images

### Get Photo (Base64)
```
GET /api/photos/:employeeno/base64
```

Returns photo as base64 data URL for browser display.

**Response:**
```json
{
  "success": true,
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Check Photo Exists
```
GET /api/photos/check/:employeeno
```

Returns whether a specific photo exists.

**Response:**
```json
{
  "success": true,
  "exists": true
}
```

### Upload Photo
```
POST /api/photos/:employeeno
Body: FormData with 'photo' file
```

Upload a new photo for an employee.

**Response:**
```json
{
  "success": true,
  "filename": "EMP001.jpg"
}
```

## Using the Photo System in ID Designer

### Load Photo Preview

1. Open ID Designer: `http://localhost:3000/id-designer`
2. In right panel, find "Photo System" section
3. Enter employee number (e.g., `EMP001`)
4. Click "👁️ Preview" button
5. Photo displays in preview area

### Add Photo to Canvas

**Option 1: Quick Add**
1. Enter employee number in "Photo System" section
2. Click "➕ Add to Canvas" button
3. Photo appears on canvas, ready to resize/reposition

**Option 2: Using Placeholder**
1. Click "📸 Photo" button in left panel
2. Adds `{{photo}}` placeholder to canvas
3. During generation, replaces with actual photo

### Edit Photo on Canvas

Once photo is on canvas:
1. Click to select it
2. Drag to reposition
3. Corner handles to resize
4. Right panel shows properties
5. Layer controls (↑ Front, ↓ Back)

## Using Photos in Templates

### Placeholder Method

Use `{{photo}}` placeholder in templates:

1. Click "📸 Photo" in left panel
2. Adds placeholder rectangle with `{{photo}}` text
3. Size and position as needed
4. When generating IDs, `{{photo}}` is replaced with actual photo

### Direct Photo Method

1. Enter employee number in Photo System section
2. Click "➕ Add to Canvas"
3. Actual photo loads directly
4. Resize and position as needed
5. Photo saves in template JSON

## Batch Generation with Photos

When generating ID cards in batch:

1. System reads employee number from database
2. Looks for corresponding photo in `/uploads/photos/`
3. If found: Uses employee photo
4. If not found: Uses `default.png`
5. Places photo in `{{photo}}` placeholder locations
6. Exports with photos

**Supported Batch Exports:**
- PDF with photos
- Word documents with photos
- Image files (PNG/JPG) with photos

## Troubleshooting

### Photo Not Loading

**Issue**: "Photo not found" error

**Solutions**:
1. Check filename matches employeeno exactly (case-sensitive on Linux)
2. Verify file is in `/app/uploads/photos/` directory
3. Ensure file format is supported (JPG, PNG, GIF, WebP)
4. Check file is less than 5MB
5. Verify `default.png` exists in photos directory

### Photo Not Resizing

**Issue**: Can't resize photo on canvas

**Solutions**:
1. Click on photo to select it
2. Use corner handles (not edges) to resize
3. For better control, use properties panel
4. If locked, check layer settings

### Photo Not Saving

**Issue**: Template saves but photo doesn't persist

**Solutions**:
1. For `{{photo}}` placeholders: Works automatically
2. For direct photos: Stored as base64 in template JSON
3. Check browser console (F12) for errors
4. Ensure `/uploads/photos/` directory has write permissions

## Best Practices

### Photo Requirements

- **Minimum Size**: 200x250px (portrait)
- **Recommended Size**: 300x400px
- **Aspect Ratio**: 3:4 (portrait)
- **Format**: JPG for smaller files, PNG for transparency
- **Quality**: 150+ DPI for printing

### File Organization

```
Naming Convention:
├── EMP001.jpg      ← Standard employee
├── EMP002.jpg
├── EMP100.jpg
├── default.png     ← Always include
└── README.md       ← Document added/removed photos
```

### Performance Tips

1. Compress photos before uploading (target: 50-100KB per file)
2. Use JPG format for web, PNG for print-ready
3. Batch resize photos to consistent dimensions
4. Store photos on fast storage device
5. Limit photos per canvas to 2-3 for smooth performance

## Batch Upload Script Example

```powershell
# Example PowerShell script to upload multiple photos
$photoDir = "C:\Photos"
$apiUrl = "http://localhost:3000/api/photos"

Get-ChildItem $photoDir -Filter "*.jpg" | ForEach-Object {
  $employeeNo = $_.BaseName  # e.g., EMP001
  $filePath = $_.FullName
  
  $form = @{
    photo = Get-Item $filePath
  }
  
  Invoke-WebRequest -Uri "$apiUrl/$employeeNo" `
    -Method Post `
    -Form $form
}
```

## Word Export with Photos

When exporting to Word:

1. Design template with `{{photo}}` placeholders
2. Run batch generation for specific employee
3. Word document includes:
   - All text fields substituted
   - All photos loaded and embedded
   - Professional formatting preserved

## Photo Metadata Preservation

Currently, only photo files are stored. To preserve metadata:

1. Use separate database table for photo metadata if needed
2. Store: upload date, uploaded by, file size, dimensions
3. Extension for future enhancement

## Security Considerations

- Photo files stored in `/uploads/photos/` (read-accessible)
- No authentication currently on photo endpoints
- **Recommended for production:**
  - Add authentication to photo endpoints
  - Validate employee number before returning photo
  - Restrict file types to images only (already implemented)
  - Implement rate limiting
  - Add virus scanning for uploads
  - Encrypt sensitive photo data

## Integration with Other Modules

### Promoters List

- Photos displayed in preview/details modal
- Click to view full-size photo
- Upload/replace photo from list interface

### Promoter Import

- Batch import employee data with photos
- Photos uploaded separately or together
- Matches employeeno with photo file

### ID Generator

- Automatically loads photos for ID generation
- Works with both placeholder and direct methods
- Exports include photos in all formats

## Future Enhancements

Potential improvements:
- Crop/rotate photos in designer
- Batch photo upload via ZIP
- Photo compression
- Automatic photo resizing
- Photo filters (B&W, sepia, etc.)
- Multiple photos per employee
- Photo versioning/history
- Watermark support

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Verify file structure matches requirements
3. Check browser console for errors (F12)
4. Verify API endpoints are responding (check network tab)
5. Ensure server is running: `npm start`

---

**System Status**: Active and Ready  
**Last Updated**: December 2024  
**API Version**: 1.0  
