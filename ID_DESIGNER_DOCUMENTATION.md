# ID Designer Module - Complete Documentation

## Overview

The ID Designer module provides a comprehensive visual interface for creating and managing employee ID card templates. Using Fabric.js, it offers an intuitive drag-and-drop canvas experience with dual-side design (front and back), real-time editing, and persistent storage.

## Features

### Core Features

✅ **Dual Canvas Design**
- Front side canvas for primary ID information
- Back side canvas for additional details or branding
- Tab-based switching for easy management
- Synchronized properties panel

✅ **15 Data Fields**
- Employee No, Promoter ID, Full Name, Date Hired
- Brand, Category, Contact No, Address
- Emergency Contact, Contact Person
- Location, District, Division, HR Gen
- Photo placeholder with customizable dimensions

✅ **Drawing Tools**
- Text labels (editable)
- Lines (with customizable stroke)
- Rectangles/Boxes (for layout and boundaries)
- Circles (for logos or highlights)
- Image uploads (for branding/logos)

✅ **Advanced Styling**
- Font family selection (Arial, Helvetica, Times New Roman, Courier New, Verdana, Georgia)
- Font size adjustment (8-72pt)
- Color picker for text and shapes
- Opacity/transparency control (0-100%)
- Rotation/angle adjustment (0-360°)

✅ **Template Management**
- Save templates to SQLite database
- Load previously created templates
- Update existing templates
- Delete templates
- Template versioning with timestamps

✅ **Canvas Controls**
- Drag elements freely on canvas
- Z-order management (bring to front, send to back)
- Layer manipulation
- Canvas resizing (customizable width/height)
- Clear canvas functionality

## Technology Stack

### Frontend
- **Fabric.js 5.3.0** - Canvas manipulation and object management
- **Tailwind CSS** - Responsive UI styling
- **HTML5** - Semantic markup
- **Vanilla JavaScript** - Event handling and API integration

### Backend
- **Express.js 4.19+ ** - HTTP routing and middlewares
- **SQLite3 5.1.7** - Template persistence
- **Node.js v24.14.0** - Runtime environment

## Getting Started

### Installation

1. **Install Dependencies** (if Fabric.js not already installed):
```bash
npm install fabric@^5.3.0
```

2. **Start the Server**:
```bash
npm start
# or
node server.js
```

3. **Access the Designer**:
```
http://localhost:3000/id-designer
```

### Basic Workflow

1. **Navigate to ID Designer**
   - Click "ID Designer" button on dashboard
   - Or directly visit `/id-designer`

2. **Add Elements to Canvas**
   - Click data field buttons to add employee fields
   - Use drawing tools to add text labels, lines, boxes, circles
   - Drag elements to desired positions

3. **Style Elements**
   - Click element to select it
   - Adjust properties in right panel (font, color, opacity, rotation)
   - Use Z-order buttons to layer elements

4. **Switch Between Sides**
   - Work on FRONT SIDE for primary information
   - Switch to BACK SIDE for secondary content

5. **Save Template**
   - Enter template name in input field
   - Click "💾 Save Template" button
   - Template is stored in SQLite database

6. **Load Template**
   - Click "📂 Load Template" button
   - Select template from modal
   - Template loads into both canvases

## API Reference

### Template CRUD Endpoints

#### GET /api/templates
**Description**: Retrieve all templates

**Response**:
```json
{
  "success": true,
  "templates": [
    {
      "id": 1,
      "template_name": "Standard 2x3 ID",
      "front_canvas_json": "{...}",
      "back_canvas_json": "{...}",
      "width": 400,
      "height": 600,
      "created_at": "2024-12-20T10:30:00Z"
    }
  ]
}
```

#### POST /api/templates
**Description**: Create new template

**Request Body**:
```json
{
  "template_name": "My Template",
  "front_canvas_json": "{\"version\": \"5.3.0\", \"objects\": [...]}",
  "back_canvas_json": "{\"version\": \"5.3.0\", \"objects\": [...]}",
  "width": 400,
  "height": 600
}
```

**Response**:
```json
{
  "success": true
}
```

#### GET /api/templates/:id
**Description**: Retrieve single template by ID

**Response**:
```json
{
  "success": true,
  "template": {
    "id": 1,
    "template_name": "Standard 2x3 ID",
    "front_canvas_json": "{...}",
    "back_canvas_json": "{...}",
    "width": 400,
    "height": 600,
    "created_at": "2024-12-20T10:30:00Z"
  }
}
```

#### PUT /api/templates/:id
**Description**: Update template

**Request Body**:
```json
{
  "template_name": "Updated Name",
  "front_canvas_json": "{...}",
  "width": 500
}
```

**Response**:
```json
{
  "success": true
}
```

#### DELETE /api/templates/:id
**Description**: Delete template

**Response**:
```json
{
  "success": true
}
```

### Page Endpoints

#### GET /id-designer
**Description**: Serve ID Designer page

**Response**: HTML page with interface

#### GET /
**Description**: Serve dashboard

**Response**: HTML page with navigation to all modules

## Database Schema

### id_templates Table

```sql
CREATE TABLE id_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL,
  front_canvas_json TEXT,              -- Fabric.js canvas object as JSON
  back_canvas_json TEXT,                -- Fabric.js canvas object as JSON
  width INTEGER DEFAULT 1080,
  height INTEGER DEFAULT 1920,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**:
- **id**: Auto-incrementing primary key
- **template_name**: User-defined template name
- **front_canvas_json**: Serialized Fabric.js objects for front canvas
- **back_canvas_json**: Serialized Fabric.js objects for back canvas
- **width**: Canvas width in pixels (default 1080px)
- **height**: Canvas height in pixels (default 1920px)
- **created_at**: Timestamp of template creation

## Canvas JSON Structure

The `front_canvas_json` and `back_canvas_json` fields store Fabric.js canvas state as JSON. Example structure:

```json
{
  "version": "5.3.0",
  "objects": [
    {
      "type": "text",
      "left": 100,
      "top": 50,
      "fontSize": 20,
      "fontFamily": "Arial",
      "fill": "#000000",
      "text": "[full_name]"
    },
    {
      "type": "rect",
      "left": 50,
      "top": 200,
      "width": 300,
      "height": 100,
      "fill": "transparent",
      "stroke": "#000000",
      "strokeWidth": 2
    }
  ],
  "background": "#ffffff"
}
```

**Supported Object Types**:
- `text` - Text labels and fields
- `line` - Linear elements
- `rect` - Rectangles and boxes
- `circle` - Circular shapes
- `image` - Uploaded images

## Advanced Usage

### Using Template Variables

Templates support field substitution through placeholders:

```
[employeeno]        - Employee number
[promoter_id]       - Promoter ID
[full_name]         - Full name
[date_hired]        - Date hired
[brand]             - Brand name
[category]          - Promoter category
[contact_no]        - Phone number
[address]           - Address
[emergency_contact] - Emergency contact
[contact_person]    - Contact person name
[location]          - Location
[district]          - District
[division]          - Division
[hrgen]             - HR Gen code
```

These placeholders render as plain text fields in the designer and will be substituted with actual data when used with the Promoter Creation/Import features.

### Custom Canvas Sizing

Default canvas dimensions are 1080x1920px (portrait orientation). To customize:

1. Open ID Designer
2. Scroll to "Canvas Settings" in right panel
3. Adjust Width and Height values
4. Click outside input to apply

### Z-Order Management

To control layering:

1. Select an element
2. Click "↑ Front" to bring to front (highest layer)
3. Click "↓ Back" to send to back (lowest layer)
4. Elements layer in order they were added

## Testing

### Run Test Suite

```bash
node test-id-designer.js
```

**Tests Include**:
- Page serving and loading
- Template CRUD operations
- Canvas JSON persistence
- Complex template structures
- Template data validation
- Error handling (404s for non-existent templates)
- Navigation links

### Test Output Example

```
🧪 ID Designer Module Tests

✓ GET /id-designer returns HTML page
✓ POST /api/templates creates new template
✓ GET /api/templates retrieves all templates
✓ GET /api/templates/:id retrieves single template
✓ Template contains valid canvas JSON
✓ PUT /api/templates/:id updates template
✓ POST /api/templates saves complex canvas structure
✓ GET /api/templates/99999 returns 404 for non-existent template
✓ Template data persists after retrieval
✓ DELETE /api/templates/:id removes template
✓ Dashboard page links to ID Designer
✓ ID Designer page has required elements

Test Summary
Passed: 12
Failed: 0
Total: 12
```

## Common Tasks

### Task: Create a Standard ID Template

1. Open ID Designer
2. Add fields to front side:
   - [full_name] at top (large font)
   - [brand] below name
   - [employee_no] at bottom
   - Photo placeholder on right
3. Add border rectangle for frame
4. Enter template name: "Standard ID"
5. Click Save

### Task: Update Existing Template

1. Click "📂 Load Template"
2. Select the template to modify
3. Make changes (add/remove/edit elements)
4. Click "💾 Save Template"
5. Enter new version name or update name
6. Changes automatically save to database

### Task: Export Template Design

Using browser:
1. Open ID Designer with loaded template
2. Right-click canvas → Screenshot
3. Save image file

Programmatically:
1. Retrieve template JSON via GET /api/templates/:id
2. Use Fabric.js to render canvas
3. Convert to image using html2canvas (already included in page)

## Troubleshooting

### Issue: Template Won't Load

**Solution**:
- Check that template ID exists: GET /api/templates
- Verify JSON structure is valid
- Clear browser cache and reload
- Check browser console for errors (F12)

### Issue: Fields Don't Appear on Canvas

**Solution**:
- Click to switch focus between front/back canvas
- Check Properties panel doesn't have typos
- Verify field buttons use correct syntax: `[field_name]`

### Issue: Changes Not Saving

**Solution**:
- Verify server is running (check console)
- Enter template name before clicking Save
- Check network tab in browser dev tools
- Ensure /api/templates endpoint is responding

### Issue: Styling Not Applied

**Solution**:
- Ensure element is selected (highlighted)
- Check Properties panel is visible
- Verify color picker is properly set
- Wait for canvas to re-render after change

## Performance Considerations

- **Large Templates**: Limit objects to <200 items per canvas for smooth interaction
- **Complex Shapes**: Use simple rectangles/circles instead of multiple overlays
- **Image Size**: Compress images before adding to reduce file size
- **Database**: Regular backups recommended for template data

## Security Notes

- Templates stored in SQLite database at `database/promoters.db`
- File permissions: Production environments should restrict access
- JSON data is not sanitized; only store trusted data
- No authentication on template endpoints (recommend adding in production)

## Next Steps

After designing templates, consider:

1. **Template Application** - Use templates with Promoter Import/Creation
2. **Batch Printing** - Export templates as PDF for printing
3. **Template Library** - Build collection of reusable templates
4. **Custom Fields** - Extend field list with additional promoter attributes
5. **Branding** - Add company logos, colors, patterns

## File Locations

```
promoter-id-system/
├── app/
│   ├── public/
│   │   ├── id-designer.html       ← Main interface
│   │   ├── index.html             ← Dashboard with links
│   │   └── promoters-list.html    ← Related feature
│   └── uploads/                   ← Photo uploads
├── database/
│   └── promoters.db               ← SQLite database
├── server.js                      ← Express server (routes)
├── test-id-designer.js            ← Test suite
└── settings.js                    ← Configuration
```

## Support & Documentation

- **Fabric.js Docs**: https://fabric.js.org/
- **Express.js Docs**: https://expressjs.com/
- **SQLite Docs**: https://www.sqlite.org/
- **Server Logs**: Check terminal running `npm start`

## Version History

### v1.0 (Current)
- Dual canvas design
- 15 data fields
- Drawing tools (text, line, rect, circle)
- Full styling controls
- Template persistence
- CRUD API
- 12 comprehensive tests
- Responsive UI with Tailwind CSS

---

**Last Updated**: December 2024
**Status**: Production Ready ✅
