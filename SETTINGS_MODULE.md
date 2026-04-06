# User Settings Module - Configuration & Features

## 📋 Overview

The User Settings module provides a centralized configuration system for the Promoter ID Management System. It includes system defaults, Excel template generation, and bulk import capabilities.

---

## ⚙️ System Configuration

### ID Template Defaults

| Setting | Default Value | Description |
|---------|---------------|-------------|
| Width | 1080px | Default ID card width |
| Height | 1920px | Default ID card height |
| Font | Arial | Default text font |
| Font Size | 12pt | Default text size |
| Font Color | #000000 | Default text color (black) |
| Background | #FFFFFF | Default background color (white) |

### Photo Upload Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Max File Size | 5 MB | Maximum uploadable file size |
| Allowed Formats | JPG, PNG, JPEG, WEBP | Supported image formats |
| Storage Path | app/uploads/photos | Photo storage location |

### Database Settings

| Setting | Value |
|---------|-------|
| Database Type | SQLite3 |
| Database File | database/promoters.db |
| Auto-Initialization | Enabled |

### Server Settings

| Setting | Value |
|---------|-------|
| Port | 3000 |
| CORS | Enabled |
| Host | 0.0.0.0 |

---

## 📊 Excel Template Configuration

### Template Features

The downloadable Excel template includes:

1. **Promoters Sheet**
   - 15 pre-defined column headers
   - 5 sample/instruction rows
   - Professional formatting with borders and colors
   - Column width auto-adjusted

2. **Instructions Sheet**
   - Field descriptions for each column
   - Required/optional indicators
   - Example values
   - Data format guidelines

3. **System Defaults Sheet**
   - Current system configuration
   - ID card dimensions
   - Font settings
   - Upload size limits
   - Supported file formats

### Excel Headers (15 Fields)

```
1. employeeno          (Employee Number - Unique)
2. promoter_id         (Promoter ID)
3. first_name          (First Name - Required)
4. last_name           (Last Name - Required)
5. full_name           (Full Name)
6. date_hired          (Date Hired - Format: YYYY-MM-DD)
7. brand               (Brand/Product Assignment)
8. contact_no          (Contact Number)
9. address             (Physical Address)
10. emergency_contact  (Emergency Contact Number)
11. contact_person     (Emergency Contact Person)
12. location           (Work Location/Branch)
13. district           (District/Region)
14. division           (Department/Division)
15. hrgen              (HR Reference Number)
```

---

## 🔌 API Endpoints

### Get System Settings
```http
GET /api/settings
Content-Type: application/json

Response:
{
  "success": true,
  "settings": {
    "idTemplate": {
      "defaultWidth": 1080,
      "defaultHeight": 1920,
      "defaultFont": "Arial",
      "defaultFontSize": 12,
      "defaultFontColor": "#000000",
      "defaultBackgroundColor": "#FFFFFF"
    },
    "excelTemplate": {
      "headers": ["employeeno", "promoter_id", ...],
      "filename": "Promoter_Import_Template"
    }
  }
}
```

### Download Excel Template
```http
GET /download-template

Response Headers:
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Promoter_Import_Template_YYYY-MM-DD.xlsx"

Response Body: Binary Excel file
```

### Alternative Download Endpoint
```http
GET /api/download-promoter-template
(Redirects to /download-template)
```

---

## 📝 How to Use Excel Template

### Step 1: Download Template
- Navigate to Settings tab in web interface
- Click "📄 Download Excel Template"
- File saves as `Promoter_Import_Template_YYYY-MM-DD.xlsx`

### Step 2: Review Instructions
- Open the "Instructions" sheet
- Review field descriptions and requirements
- Note required vs optional fields

### Step 3: Review System Defaults
- Check the "System Defaults" sheet
- Verify current configuration
- Note constraints (file size, formats, etc.)

### Step 4: Populate Data
- Go to "Promoters" sheet
- Replace sample data with actual promoter information
- Ensure required fields are filled
- Use correct date formats (YYYY-MM-DD)

### Step 5: Import Data
- Use the API to bulk import:
  ```bash
  POST /api/promoters/import
  Content-Type: multipart/form-data
  
  Body:
  file: [Excel file]
  ```

---

## 🔐 Settings Configuration

The settings are defined in `settings.js` and include:

### Modifying Settings

To change system defaults, edit `settings.js`:

```javascript
idTemplate: {
  defaultWidth: 1080,      // Change card width
  defaultHeight: 1920,     // Change card height
  defaultFont: 'Arial',    // Change default font
  defaultFontSize: 12,     // Change default font size
  // ... other settings
}
```

### Settings Update API (Future)
```http
PUT /api/settings/:setting
Content-Type: application/json

Body:
{
  "value": "new_value"
}
```

---

## 📂 File Structure

```
promoter-id-system/
├── settings.js                 ← Settings configuration module
├── server.js                   ← Main server (updated with settings endpoints)
├── app/public/index.html      ← Updated UI with Settings tab
├── test-settings.js           ← Settings module test suite
└── database/
    └── promoters.db           ← SQLite database
```

---

## 🧪 Testing Settings Module

### Run Settings Tests
```bash
node test-settings.js
```

### Test Output
```
🧪 USER SETTINGS MODULE - TEST SUITE

✓ TEST 1: GET /api/settings
  ✅ Status: 200 OK
  ✅ Response has success flag: true
  ✅ Has idTemplate: true
  ✅ Has excelTemplate: true
  
✓ TEST 2: GET /download-template
  ✅ Status: 200 OK
  ✅ Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  ✅ File download headers present

✓ TEST 3: GET /api/download-promoter-template (redirect)
  ✅ Endpoint exists and responds

📊 TEST RESULTS: 3 passed, 0 failed
```

---

## 💾 Dependencies

The Settings module uses:

- **exceljs** (^4.4.0) - Excel file generation
  - Create and format Excel workbooks
  - Add multiple sheets with styling
  - Generate proper file headers for downloads

---

## 🚀 Features Implemented

✅ **Excel Template Download**
- Single-click download
- Auto-formatted with styling
- Includes 3 sheets (Promoters, Instructions, Defaults)
- Dynamic filename with date stamp

✅ **System Settings API**
- Get current system configuration
- Access all default settings
- Client-side configuration data

✅ **Settings Management**
- Centralized configuration in `settings.js`
- Easy to modify and maintain
- Export settings for client access

✅ **User Interface**
- New Settings tab in web dashboard
- Download button with instructions
- Display of system defaults
- Feature overview

✅ **Detailed Instructions**
- Field descriptions
- Required/optional indicators
- Example values
- Format guidelines

---

## 📚 Web Interface

### Access Settings
1. Open http://localhost:3000
2. Click "⚙️ Settings" tab
3. View available options:
   - Download Excel template
   - View system defaults
   - System configuration details

### Download Flow
1. Click "📄 Download Excel Template" button
2. Excel file automatically downloads
3. File includes:
   - Pre-formatted columns
   - Sample data rows
   - Detailed instructions
   - System defaults reference

---

## 🔍 Troubleshooting

### Excel File Empty
- Check if exceljs is installed: `npm list exceljs`
- Restart server: `node server.js`

### Template Download Fails
- Verify /download-template endpoint is accessible
- Check server logs for errors
- Ensure sufficient disk space

### Settings Not Loading
- Verify settings.js file exists in root directory
- Check for syntax errors: `node -c settings.js`
- Restart server

---

## 📊 Configuration Details

### Excel Template Sample Rows
Default: 5 sample rows with placeholder data
Each row includes:
- Employee Number: E001, E002, etc.
- Promoter ID: P001, P002, etc.
- Mock data for all 15 fields
- Formatted dates in correct format

### Header Styling
- Bold white text
- Blue background (#4472C4)
- Centered alignment
- 18px column width

### Data Row Formatting
- 11pt font
- Border on all cells
- Left-aligned text
- Wrap text enabled

---

## 🎯 Next Steps

1. **Download Excel Template** - Get the import template
2. **Populate Data** - Fill in promoter information
3. **Bulk Import** - Use API to import (when implemented)
4. **Customize Settings** - Modify defaults as needed
5. **Export Reports** - Generate Excel reports (future feature)

---

## 📞 Support

For issues or customization needs:
1. Check test-settings.js output
2. Review settings.js for configuration
3. Check server logs for errors
4. Update TODO.md with requests

---

**User Settings Module v1.0 - Released March 29, 2026**
