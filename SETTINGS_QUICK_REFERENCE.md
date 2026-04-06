# 🔧 SETTINGS MODULE - QUICK REFERENCE

## ⚡ Quick Access

| Feature | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| System Settings | `/api/settings` | GET | Get all system configuration |
| Download Template | `/download-template` | GET | Download Excel import template |
| Alt Template Download | `/api/download-promoter-template` | GET | Alternative download endpoint |

---

## 📥 Download Excel Template

### Web Interface
1. Go to http://localhost:3000
2. Click **⚙️ Settings** tab
3. Click **📄 Download Excel Template** button
4. File downloads as `Promoter_Import_Template_YYYY-MM-DD.xlsx`

### Command Line
```bash
# Using curl
curl -o template.xlsx http://localhost:3000/download-template

# Using PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/download-template" -OutFile "template.xlsx"
```

---

## 📊 Excel Template Contents

### Sheet 1: Promoters
- **15 Column Headers** (ready for data entry)
- **5 Sample Rows** (as placeholders)
- **Auto-formatted** (colored headers, borders)

**Field Headers:**
```
A: employeeno
B: promoter_id
C: first_name
D: last_name
E: full_name
F: date_hired
G: brand
H: contact_no
I: address
J: emergency_contact
K: contact_person
L: location
M: district
N: division
O: hrgen
```

### Sheet 2: Instructions
- Field descriptions
- Required/Optional status
- Example values
- Format guidelines

### Sheet 3: System Defaults
- ID card dimensions (1080x1920px)
- Font settings (Arial, 12pt, #000000)
- Upload limits (5MB max)
- Supported formats (JPG, PNG, JPEG, WEBP)

---

## 🎯 System Defaults

### ID Templates
```
Width: 1080px
Height: 1920px
Font: Arial
Font Size: 12pt
Font Color: #000000 (black)
Background Color: #FFFFFF (white)
```

### Photo Upload
```
Max Size: 5 MB
Formats: JPG, PNG, JPEG, WEBP
Storage: app/uploads/photos/
```

### Database
```
Type: SQLite3
File: database/promoters.db
Location: Root directory
```

### Server
```
Port: 3000
Host: localhost / 0.0.0.0
CORS: Enabled
```

---

## 🧪 Test Settings Module

```bash
node test-settings.js
```

**Expected Output:**
```
✓ TEST 1: GET /api/settings
  ✅ Status: 200 OK
✓ TEST 2: GET /download-template
  ✅ Status: 200 OK
✓ TEST 3: GET /api/download-promoter-template
  ✅ Endpoint exists
📊 TEST RESULTS: 3 passed, 0 failed
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `settings.js` | Configuration module |
| `test-settings.js` | Test suite |
| `SETTINGS_MODULE.md` | Full documentation |
| `SETTINGS_QUICK_REFERENCE.md` | This file |
| Updated `server.js` | New endpoints |
| Updated `index.html` | Settings UI tab |

---

## 🔌 API Examples

### Get Settings
```bash
curl http://localhost:3000/api/settings
```

**Response:**
```json
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

### Download Excel
```bash
curl -O http://localhost:3000/download-template
```

---

## 🚀 Usage Workflow

1. **Get Settings** → Check system configuration
2. **Download Template** → Get Excel import file
3. **Populate Data** → Fill in promoter information
4. **Import Data** → Send to API for storage
5. **Verify** → Check database for new records

---

## 📋 Excel Template Fields

| # | Field | Type | Required | Example |
|---|-------|------|----------|---------|
| 1 | employeeno | Text | ✅ Yes | E001 |
| 2 | promoter_id | Text | ❌ No | P001 |
| 3 | first_name | Text | ✅ Yes | John |
| 4 | last_name | Text | ✅ Yes | Doe |
| 5 | full_name | Text | ❌ No | John Doe |
| 6 | date_hired | Date | ❌ No | 2024-01-15 |
| 7 | brand | Text | ❌ No | Brand A |
| 8 | contact_no | Text | ❌ No | +1234567890 |
| 9 | address | Text | ❌ No | 123 Main St |
| 10 | emergency_contact | Text | ❌ No | +0987654321 |
| 11 | contact_person | Text | ❌ No | Jane Doe |
| 12 | location | Text | ❌ No | Manila |
| 13 | district | Text | ❌ No | District 1 |
| 14 | division | Text | ❌ No | Sales |
| 15 | hrgen | Text | ❌ No | HR-001 |

---

## ✅ Verification Checklist

- [x] Settings endpoint working (`/api/settings`)
- [x] Excel download endpoint working (`/download-template`)
- [x] Excel file contains 3 sheets
- [x] Headers properly formatted
- [x] System defaults included
- [x] Web UI Settings tab added
- [x] Download button functional
- [x] All tests passing
- [x] Documentation complete

---

## 💡 Tips

1. **Save Template Locally** - Download once, reuse multiple times
2. **Use Correct Dates** - Format as YYYY-MM-DD only
3. **Employee Numbers** - Must be unique per promoter
4. **Optional Fields** - Leave blank if not applicable
5. **File Size** - Complete template is ~10KB

---

## 🔄 Update Configuration

To modify system defaults:

1. Edit `settings.js`
2. Change desired values
3. Restart server: `node server.js`
4. Settings automatically reflected in:
   - `/api/settings` endpoint
   - Excel template (Defaults sheet)
   - Web interface

---

## 📞 Quick Help

### Q: Template download fails?
A: Check if server is running: `curl http://localhost:3000`

### Q: Can't modify settings?
A: Edit `settings.js` and restart server

### Q: Excel file won't open?
A: Ensure you're using Excel 2013+, or try LibreOffice Calc

### Q: Need different template fields?
A: Update `excelTemplate.headers` in `settings.js`

---

**Settings Module v1.0 | Updated: March 29, 2026**
