# Promoters List Module - Quick Reference Guide

## 🚀 Accessing the Module

**URL**: `http://localhost:3000/promoters`

**Direct Link**: Available in main dashboard under "📋 Promoters List" button

---

## 🎯 Main Actions

### 1. **View All Promoters**
- Page loads automatically on access
- Shows table with all promoter records
- Updates record counter

### 2. **Search & Filter**

| Filter | How It Works | Example |
|--------|-------------|---------|
| **Search Box** | Searches all text fields | Type "maria" to find by name, employee#, etc |
| **Name Filter** | Searches first/last/full name | Type "Santos" for last name matches |
| **Promoter ID Filter** | Searches by promoter ID | Type "P101" |
| **Brand Dropdown** | Exact brand match | Select "Brand A" to show only that brand |
| **Location Dropdown** | Exact location match | Select "Manila" to show only that location |

**Combining Filters**: Select Brand + Location + Type in Name field = Shows records matching ALL filters

### 3. **Add New Promoter**
```
1. Click [➕ Add New Promoter] button
2. Fill required fields:
   - Employee No *
   - First Name *
   - Last Name *
3. Optionally fill other fields
4. Click [Save] button
```

### 4. **Edit Promoter**
```
1. Find promoter in table
2. Click [✎] (pencil icon) at far right
3. Modal opens with all promoter data
4. Modify desired fields
5. Click [Save] button
```

### 5. **Delete Promoter**
```
1. Find promoter in table
2. Click [🗑️] (trash icon) at far right
3. Confirmation modal appears
4. Click [Delete] to permanently remove
```

### 6. **Export to Excel**
```
1. (Optional) Apply filters to show subset of data
2. Click [📊 Export to Excel] button
3. Excel file downloads automatically
4. File name: promoters-export-[timestamp].xlsx
```

### 7. **Refresh Data**
```
Click [🔄 Refresh] button to reload data from database
```

---

## 📋 Table Columns

| Column | Description | Sortable | Editable |
|--------|-------------|----------|----------|
| Employee No | Unique identifier | - | Yes |
| Name | Full name of promoter | - | Yes |
| Promoter ID | Assigned promoter ID | - | Yes |
| Brand | Associated brand | - | Yes |
| Location | Work location | - | Yes |
| Contact | Phone number | - | Yes |
| Category | Promoter category | - | Yes |
| Actions | Edit/Delete buttons | - | - |

---

## 📊 Form Fields (Add/Edit Modal)

### Required Fields (*)
- Employee No
- First Name
- Last Name

### Optional Fields
- Promoter ID
- Full Name (auto-fills if blank)
- Date Hired
- Brand
- Category
- Contact No
- Address
- Emergency Contact
- Contact Person
- Location
- District
- Division
- HR Gen

---

## 💾 Excel Export Format

### Exported Columns
1. Employee No
2. Promoter ID
3. First Name
4. Last Name
5. Full Name
6. Date Hired
7. Brand
8. Category
9. Contact No
10. Address
11. Emergency Contact
12. Contact Person
13. Location
14. District
15. Division
16. HR Gen
17. Created At

### Export Features
- ✅ Styled header row (blue background, white text)
- ✅ Auto-adjusted column widths
- ✅ Includes all matched records
- ✅ Professional formatting
- ✅ Preserves all data

---

## 🔗 API Endpoints Reference

### Get All Promoters
```
GET /api/promoters
```

### Get Promoters with Filters
```
GET /api/promoters?search=keyword&name=name&promoter_id=id&brand=brand&location=location
```

### Get Single Promoter
```
GET /api/promoters/[id]
```

### Create Promoter
```
POST /api/promoters
Body: { employee details JSON }
```

### Update Promoter
```
PUT /api/promoters/[id]
Body: { updated details JSON }
```

### Delete Promoter
```
DELETE /api/promoters/[id]
```

### Export Promoters
```
GET /export-promoters?[filters]
Returns: Excel file download
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Note |
|--------|----------|------|
| Search | ESC while in search box | Clears search field |
| Close Modal | ESC | Closes add/edit/delete modal |
| Focus Search | Tab to search input | Navigate using Tab key |
| Save | No shortcut | Use [Save] button |

---

## 🎨 Button Reference

### Top Action Buttons
| Button | Color | Function |
|--------|-------|----------|
| ➕ Add New Promoter | Green | Opens add promoter form |
| 📊 Export to Excel | Orange | Downloads filtered data as Excel |
| 🔄 Refresh | Blue | Reloads data from database |

### Row Action Buttons
| Button | Function | Confirmation |
|--------|----------|---------------|
| ✎ | Edit promoter | None (form modal) |
| 🗑️ | Delete promoter | Yes (confirmation required) |

### Modal Buttons
| Button | Action |
|--------|--------|
| Save | Saves changes and closes modal |
| Cancel | Closes modal without saving |
| Delete | Confirms deletion (red modal) |

---

## 🔍 Filter Examples

### Example 1: Find All Maria's
1. Type "maria" in Name Filter box
2. Table shows only promoters with "maria" in name

### Example 2: Brand A Promoters in Manila
1. Select "Brand A" from Brand dropdown
2. Select "Manila" from Location dropdown
3. Table updates to show only matching records

### Example 3: Export Brand C Data
1. Select "Brand C" from Brand dropdown
2. Click [Export to Excel]
3. Downloaded file contains only Brand C promoters

### Example 4: Search Employee E102
1. Type "E102" in Search box
2. Shows matching employee records
3. Can then edit or delete

---

## 📊 Status Indicators

| Indicator | Meaning |
|-----------|---------|
| "Showing 4 of 10" | 4 records match filters, 10 total |
| "No promoters found" | No records match current filters |
| Loading spinner ⏳ | Fetching data, please wait |
| Record counter | Updates in real-time as filters change |

---

## ⚠️ Important Notes

1. **Unique Employee Numbers**: Each employee number is unique. Cannot create duplicate employee numbers.

2. **Delete is Permanent**: Deleted promoters cannot be recovered. Use confirmation carefully.

3. **Filter Behavior**: All filters use AND logic (not OR). All conditions must be met.

4. **Excel Export**: Exports include timestamp column and only show filtered results.

5. **Auto-Fill**: Full Name field auto-populates as "First Last" if left blank.

6. **Required Fields**: 
   - Employee No (unique key)
   - First Name
   - Last Name

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Table shows no data | Click [Refresh] button or check filters |
| Cannot add promoter | Ensure Employee No, First Name, Last Name are filled |
| Edit not saving | Check for duplicate Employee No, ensure name fields filled |
| Export file is small/empty | Ensure filters aren't too restrictive, try with no filters |
| Dropdown filters empty | Wait for page to load, try Refresh button |
| Delete not working | Confirm deletion in red confirmation modal |

---

## 📞 Support Information

### When Something Doesn't Work
1. Try clicking [Refresh] button
2. Clear all filters
3. Check browser console (F12) for errors
4. Restart server if needed

### Contact Information
- Database: SQLite (/database/promoters.db)
- Server: Node.js on port 3000
- API Documentation: See PROMOTERS_LIST_MODULE.md

---

## 🎓 Tutorial: Basic Workflow

### Adding a New Promoter
```
1. Click [➕ Add New Promoter]
2. Enter Employee No: "E201"
3. Enter First Name: "Juan"
4. Enter Last Name: "Garcia"
5. Enter Brand: "Brand B"
6. Enter Location: "Cebu"
7. Click [Save]
8. Success! New promoter added
```

### Finding & Editing
```
1. Type "Juan" in Name Filter
2. Click [✎] on Juan Garcia's row
3. Update Contact No: "+639175551234"
4. Click [Save]
5. Success! Record updated
```

### Exporting Brand B Data
```
1. Select "Brand B" from Brand dropdown
2. See filtered table with Brand B promoters
3. Click [📊 Export to Excel]
4. File downloads: promoters-export-[timestamp].xlsx
5. Open in Excel to view/share
```

---

## ✅ Quick Checklist

- [ ] Can view all promoters on page load
- [ ] Can filter by name/brand/location
- [ ] Can add new promoter
- [ ] Can edit existing promoter
- [ ] Can delete promoter with confirmation
- [ ] Can export to Excel with filters
- [ ] Filters work in combination
- [ ] Record counter updates correctly
- [ ] Dropdown menus populate with data

---

## 📅 Last Updated
March 29, 2026

**Status**: ✅ Production Ready

See full documentation: PROMOTERS_LIST_MODULE.md
