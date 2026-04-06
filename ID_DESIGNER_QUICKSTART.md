# ID Designer - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Access the Designer
```
1. Make sure the server is running: npm start
2. Open browser: http://localhost:3000
3. Click "🎨 ID Designer" button
```

### Step 2: Add Your First Field
```
1. On the left panel, click any data field (e.g., "📝 Full Name")
2. See it appear on the FRONT SIDE canvas
3. Drag it to reposition
```

### Step 3: Style the Field
```
1. Click the field to select it
2. In right panel, change:
   - Font Size: 20
   - Font Family: Arial
   - Color: #000000 (black)
3. Watch it update in real-time
```

### Step 4: Add More Elements
```
1. Add more fields from the left panel
2. Use Drawing Tools to add:
   - Text labels
   - Lines for borders
   - Rectangles for frames
   - Circles for accents
```

### Step 5: Save Your Template
```
1. Enter template name: "My First ID Template"
2. Click "💾 Save Template"
3. Done! Template saved to database
```

### Step 6: Load It Later
```
1. Click "📂 Load Template"
2. Select your template from the list
3. All elements load back to canvas
4. Make more edits and save again
```

## 📋 Field Reference

Copy-paste these field names directly:

```
[employeeno]        - Employee number
[promoter_id]       - Promoter ID  
[full_name]         - Full name
[date_hired]        - Date hired
[brand]             - Brand name
[category]          - Category
[contact_no]        - Contact number
[address]           - Address
[emergency_contact] - Emergency contact
[contact_person]    - Contact person
[location]          - Location
[district]          - District
[division]          - Division
[hrgen]             - HR Gen
```

## 🎨 Common Templates

### Basic ID Card (Front Side)
```
1. Add [full_name] at top (size: 24)
2. Add [brand] below (size: 16)
3. Add [employeeno] at bottom (size: 14)
4. Add photo placeholder on right
5. Save as "Basic ID"
```

### Professional Card (Front)
```
1. Add rectangle border (thick frame)
2. Add company logo or text at top
3. Add [full_name] (size: 20)
4. Add [position] or [category] (size: 14)
5. Add photo on left side
6. Add rounded lines for decoration
```

### Back Side Design
```
1. Add company address and contact info
2. Add [district] and [location]
3. Add terms/emergency contacts
4. Add security features (lines, circles)
5. Add footer with date issued
```

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Delete Selected | Delete key |
| Duplicate Selected | Ctrl+D |
| Select All | Ctrl+A |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |

## 🛠️ Toolbar Buttons

**Left Panel - Data Fields:**
- Click any field button to add to canvas
- Use multiple times to add same field multiple times
- Position fields on canvas by dragging

**Left Panel - Drawing Tools:**
- `+ Text Label` - Add custom text
- `━ Line` - Draw dividing lines
- `▭ Box/Rectangle` - Create frames or boxes
- `● Circle` - Draw circular elements

**Right Panel - Properties (when element selected):**
- **Font Size** - 8 to 72 points
- **Font Family** - Choose from 6 fonts
- **Color** - Pick any color
- **Opacity** - 0 to 100% transparency
- **Text** - Edit field content
- **Rotate** - 0 to 360 degrees
- **Delete** - Remove element
- **↑ Front** - Move to top layer
- **↓ Back** - Move to bottom layer

## 💾 Saving & Loading

### Save a Template
```
1. Design your ID card
2. Enter name: "My Template Name"
3. Click "💾 Save Template"
4. Success message appears
5. Template stored in database
```

### Load a Template
```
1. Click "📂 Load Template"
2. See modal with all templates
3. Click template to load
4. Template appears on canvas
5. Edit and save with new name
```

### Create New Template
```
1. Click "✨ New Template"
2. Canvas clears
3. Design new template from scratch
```

## 🔍 Troubleshooting

**Q: Elements not showing up?**
```
A: Check that you're on the right canvas (FRONT or BACK)
   Click the canvas label to ensure it has focus
```

**Q: Can't move elements?**
```
A: Click element to select it first
   Drag by center, not edges
   Check opacity isn't 0 (invisible)
```

**Q: Template won't save?**
```
A: Enter a template name first
   Check server is running
   Look for blue success message
```

**Q: Lost my design?**
```
A: Your design is saved as long as you clicked "Save Template"
   Click "Load Template" to retrieve it
   Check that server/database hasn't been reset
```

## 📊 Example Workflow

```
START
  ↓
Open ID Designer
  ↓
Add [full_name] field
  ↓
Increase font size to 24
  ↓
Add [brand] field below
  ↓
Add photo placeholder on right
  ↓
Add border rectangle
  ↓
Switch to BACK SIDE
  ↓
Add company info text
  ↓
Add [location] field
  ↓
Switch to FRONT SIDE (to review)
  ↓
Enter template name
  ↓
Click Save
  ↓
SUCCESS - Template saved!
```

## 🎯 Tips & Tricks

1. **Clone Elements**: Add same field multiple times for different styles
2. **Layering**: Use Z-order buttons to overlap elements nicely
3. **Alignment**: Use multiple line elements to create grids
4. **Opacity**: Make background shapes semi-transparent for text overlay
5. **Colors**: Use white text on dark backgrounds for contrast
6. **Import Template**: Load existing template before making edits
7. **Save Versions**: Save with date suffix for version control

## 📱 Responsive Design

The designer adapts to different screen sizes:
- **Desktop**: Full 3-panel layout with props panel
- **Tablet**: Side-by-side with smaller props
- **Mobile**: Stacked layout (not recommended for editing)

## 🚀 Next Steps

After creating templates:

1. **Use Templates**: Templates work with Promoter Creation
2. **Export**: Save template as PDF
3. **Share**: Export template JSON to other systems
4. **Batch**: Apply template to multiple IDs
5. **Print**: Send templates to printer service

---

**Start designing now!** → http://localhost:3000/id-designer

For detailed documentation, see: **ID_DESIGNER_DOCUMENTATION.md**
