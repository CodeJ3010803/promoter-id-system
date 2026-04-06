# ID Generator Module - Setup & Usage Guide

## Overview
The ID Generator module enables batch generation of employee ID cards from templates. Users can select a template, choose promoters, generate ID previews, and export in multiple formats (PDF, PNG, JSON).

## Features

### 1. **Template Selection**
- View all available ID templates
- See front and back preview for each template
- Template details (name, dimensions, creation date)
- Only one template can be selected per batch

### 2. **Promoter Selection**
Multiple methods to select promoters:
- **Search**: Real-time search by ID, name, employee number, or contact
- **Bulk Paste**: Paste multiple IDs separated by commas or newlines
- **Individual Selection**: Click search results to add one at a time
- **Management**: View selected promoters with easy removal

### 3. **Automatic Data Population**
When generating IDs, the system automatically:
- Replaces placeholder fields with actual employee data:
  - `[promoter_id]` → Actual promoter ID
  - `[employeeno]` → Employee number
  - `[full_name]` → Full name
  - `[brand]` → Brand/product assignment
  - `[location]` → Work location
  - `[contact_no]` → Phone number
  - And 8 more standard employee fields
- Generates barcodes for promoter_id field using CODE128 format
- *Ready to implement*: Photo auto-loading per promoter

### 4. **Preview & Review**
- Gallery view of all generated IDs
- Side-by-side front/back preview
- Detailed promoter information display
- Navigation between IDs (Previous/Next or Jump to specific)
- Preview before exporting

### 5. **Export Options**
- **PDF**: Single PDF document with all ID cards (front & back)
- **PNG**: Individual PNG files for each ID side (front & back)
- **JSON**: Raw template and data for programmatic access
- Progress tracking during export

## Architecture

### Database Schema

**id_templates Table:**
```sql
id INTEGER PRIMARY KEY
template_name TEXT
front_canvas_json TEXT (fabric.js serialized data)
back_canvas_json TEXT (fabric.js serialized data)
width INTEGER (default 1080)
height INTEGER (default 1920)
created_at DATETIME
```

**promoters Table:**
```sql
id TEXT PRIMARY KEY
employeeno TEXT UNIQUE
promoter_id TEXT
first_name TEXT
last_name TEXT
full_name TEXT
date_hired TEXT
brand TEXT
category TEXT
contact_no TEXT
address TEXT
emergency_contact TEXT
contact_person TEXT
location TEXT
district TEXT
division TEXT
hrgen TEXT
photo_path TEXT
created_at DATETIME
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/templates` | GET | List all templates |
| `/api/templates/:id` | GET | Get single template details |
| `/api/templates` | POST | Save new template |
| `/api/templates/:id` | PUT | Update template |
| `/api/templates/:id` | DELETE | Delete template |
| `/api/promoters` | GET | List all promoters (with optional filters) |
| `/api/promoters/:id` | GET | Get single promoter details |
| `/api/promoters/search` | GET | Search promoters (Query: `?q=searchterm`) |
| `/api/promoters` | POST | Create new promoter |
| `/api/promoters/:id` | PUT | Update promoter |
| `/api/promoters/:id` | DELETE | Delete promoter |
| `/api/photos/:employeeno/base64` | GET | Get photo as base64 data URL |

### Frontend Architecture

**Global State Object:**
```javascript
state = {
  currentTemplate: {
    id, template_name, front_canvas_json, back_canvas_json, width, height, created_at
  },
  selectedPromoters: [
    { id, promoterId, name }
  ],
  generatedIDs: [
    {
      promoterId, 
      promoter: { ...promoter data },
      frontCanvas: { ...fabric.js data },
      backCanvas: { ...fabric.js data }
    }
  ],
  currentPreviewIndex: 0
}
```

## File Locations

- **HTML Interface**: `/promoter-id-system/app/public/id-generator.html`
- **Backend API**: `/promoter-id-system/server.js`
- **Database**: `/promoter-id-system/database/promoters.db`
- **Photos**: `/promoter-id-system/app/uploads/photos/`
- **ID Designer**: `/promoter-id-system/app/public/id-designer.html`

## Dependencies

### Frontend Libraries
- **fabric.js 5.3.0**: Canvas manipulation and object rendering
- **JsBarcode 3.11.5**: Barcode generation (CODE128)
- **html2canvas 1.4.1**: Canvas to image conversion
- **pdf.js 3.11.174**: PDF manipulation
- **@pdf-lib/pdf**: PDF creation (optional for advanced exports)
- **Tailwind CSS**: UI styling
- **JSZip**: ZIP file creation (optional for batch downloads)

### Backend
- **Express.js**: Web server
- **SQLite3**: Database
- **Multer**: File upload handling
- **Body-parser**: Request body parsing
- **CORS**: Cross-origin requests
- **uuid**: ID generation
- **ExcelJS**: Excel template generation

## Usage Workflow

### Step 1: Setup (Select Template)
1. Navigate to `/id-generator.html`
2. Browse available templates
3. Click template to see front/back preview
4. Click "Select Template" to proceed

### Step 2: Select Promoters
1. **Option A - Search**: Type in search box to find individual promoters
   - Search by ID, name, employee number, or phone
   - Results show in real-time
   - Click promoter to add to selection

2. **Option B - Bulk Paste**: 
   - Copy list of promoter IDs from spreadsheet
   - Paste into "Paste Promoter IDs" textarea
   - Separate with commas or newlines
   - Click "Add Promoters from Paste"
   - System searches and adds found promoters

3. View selected promoters at bottom
4. Remove individual promoters by clicking ✕
5. Click "Clear All" to start over

### Step 3: Preview Generated IDs
1. Click "Generate IDs" to process all selected promoters
2. System automatically:
   - Loads template canvas data
   - Replaces all placeholders with real data
   - Generates barcodes for promoter_id field
   - Loads photos (if available)
   - Renders front and back canvas

3. Use navigation controls to browse through generated IDs
4. View promoter details for each ID
5. Verify data accuracy before export

### Step 4: Export
1. **Export as PDF**: Creates single PDF with all ID pairs
   - Professional document format
   - Ready to print

2. **Export as PNG**: Creates individual image files
   - Separate front/back PNG for each promoter
   - Suitable for digital distribution
   - Can be used in other systems

3. **Export as JSON**: Raw data export
   - Template and canvas data
   - All promoter information
   - Can be re-imported or used by other applications

## Placeholder Reference

Use these placeholders in ID Designer templates. They will be automatically replaced during ID generation:

| Placeholder | Replaced With |
|------------|-----------------|
| `[employeeno]` | Employee ID number |
| `[promoter_id]` | Promoter ID |
| `[full_name]` | Full name (First Last) |
| `[first_name]` | First name only |
| `[last_name]` | Last name only |
| `[date_hired]` | Date of hire |
| `[brand]` | Product brand assignment |
| `[category]` | Product category |
| `[contact_no]` | Phone/contact number |
| `[address]` | Physical address |
| `[emergency_contact]` | Emergency contact number |
| `[contact_person]` | Emergency contact person name |
| `[location]` | Work location/branch |
| `[district]` | District/region |
| `[division]` | Department/division |
| `[hrgen]` | HR reference number |

## Barcode Generation

- **Format**: CODE128 (universal barcode format)
- **Source**: Promoter ID value
- **Auto-generation**: Any image field with "barcode" in its name/data will auto-generate
- **Display**: Shows value below barcode

## Photo Handling

- **Storage**: Photos stored in `/app/uploads/photos/` directory
- **Naming**: `{employeeno}.{ext}` (e.g., `E001.jpg`)
- **Formats**: JPG, PNG, GIF, WebP
- **API**: Get as base64 via `/api/photos/{employeeno}/base64`
- **Auto-loading**: *Implementation in progress* - Will automatically load and place photos marked with `{{photo}}` placeholder

## Troubleshooting

### Templates not loading
- Ensure ID Designer has saved at least one template
- Check database: `database/promoters.db` exists
- Verify `/api/templates` endpoint returns data

### Search not finding promoters
- Ensure promoters have been imported via bulk import or manually added
- Try searching by full name instead of ID
- Check database table: `SELECT COUNT(*) FROM promoters;`

### Barcode not generating
- Verify promoter_id field has a value
- Check that image placeholder includes "barcode" in its name
- Barcode generation requires valid alphanumeric string

### Export errors
- For PDF: Ensure html2canvas library is loaded
- For PNG: Check browser supports canvas.toDataURL()
- For JSON: Verify no special characters in data causing JSON encoding issues

### Photos not showing
- Verify photo file exists in `/app/uploads/photos/`
- Check filename matches employee number exactly
- Ensure file is readable image format (JPG, PNG, WebP, GIF)
- May need to re-upload photo via ID Designer

## Advanced Configuration

### Customize Placeholder List
Edit the `placeholders` object in `generateIDForPromoter()` function to add more fields:
```javascript
const placeholders = {
  '[custom_field]': promoter.custom_field,
  // Add more as needed
};
```

### Adjust Barcode Format
In `generateBarcodeForCanvas()`, change the `format` parameter:
```javascript
JsBarcode(tempCanvas, barcodeValue, {
  format: 'CODE128', // Options: CODE128, CODE39, EAN13, etc.
  width: 2,
  height: 100
});
```

### Modify Canvas Dimensions
Update template width/height in ID Designer, or override in export:
```javascript
const canvas = new fabric.Canvas('previewCanvas', {
  width: 1080,
  height: 1920
});
```

## Performance Notes

- Each ID generation loads template data, clones it, and renders canvases
- For 100+ promoters, consider batch processing in chunks
- PDF and PNG export are sequential - large batches (500+) may take several minutes
- Browser memory usage increases with preview count - recommend <500 IDs at once

## Future Enhancements

- [ ] Batch printing directly to printer
- [ ] Custom field mapping and validation
- [ ] Template versioning and rollback
- [ ] Scheduled/automated ID generation
- [ ] Multi-language support
- [ ] Custom branding for exports
- [ ] Audit logging for ID generation
- [ ] Digital signature support
- [ ] QR code generation option
- [ ] Photo auto-cropping and optimization

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Review browser console for error messages
3. Check server logs for API errors
4. Verify database connectivity

