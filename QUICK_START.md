# 🎯 PROMOTER ID MANAGEMENT SYSTEM - QUICK START GUIDE

## ✅ CURRENT STATUS: FULLY OPERATIONAL

Your Promoter ID Management System is **running on http://localhost:3000**

---

## 🚀 QUICK START (3 STEPS)

### Step 1: Verify Server Status
```bash
# The server should already be running. Check:
http://localhost:3000
```

### Step 2: Test API
```bash
# Run the test script
node test-api.js
```

### Step 3: Access Web Interface
```
http://localhost:3000
```

---

## 📊 WHAT'S BEEN CREATED

### ✨ Features Implemented
- ✅ Node.js + Express server (Port 3000)
- ✅ SQLite database with 2 tables
- ✅ RESTful API for promoters management
- ✅ RESTful API for ID templates
- ✅ Photo upload functionality
- ✅ Search and filter capabilities
- ✅ Automatic database initialization
- ✅ CORS enabled
- ✅ Error handling
- ✅ Environment variables setup

### 📁 Project Structure
```
promoter-id-system/
├── app/
│   ├── public/
│   │   └── index.html         ← Web dashboard
│   └── uploads/
│       └── photos/            ← Photo storage
├── database/
│   └── promoters.db           ← SQLite database
├── node_modules/              ← Dependencies
├── .env                        ← Configuration
├── package.json               ← Project config
├── server.js                  ← Main server (291 lines)
├── test-api.js               ← API tests
├── start.bat                 ← Windows startup
├── SETUP_COMPLETE.md         ← Full documentation
└── TODO.md                   ← Project notes
```

### 📋 Database Tables

**promoters** (18 fields):
- employeeno (UNIQUE)
- promoter_id
- first_name, last_name, full_name
- date_hired
- brand, category
- contact_no, address
- emergency_contact, contact_person
- location, district, division
- hrgen
- photo_path
- created_at (auto timestamp)

**id_templates**:
- template_name
- front_canvas_json
- back_canvas_json
- width, height
- created_at

---

## 🔌 API ENDPOINTS READY

### Promoters
```
GET    /api/promoters              # List all
GET    /api/promoters/:id          # Get one
POST   /api/promoters              # Create (with photo)
PUT    /api/promoters/:id          # Update
DELETE /api/promoters/:id          # Delete
```

### Templates
```
GET    /api/templates              # List all
POST   /api/templates              # Create
PUT    /api/templates/:id          # Update
DELETE /api/templates/:id          # Delete
```

---

## 💾 SAMPLE DATA ALREADY CREATED

The test script added sample data:
- 1 Promoter: John Doe (Employee: E001)
- 1 ID Template: Standard ID Template

Access via:
```bash
curl http://localhost:3000/api/promoters
curl http://localhost:3000/api/templates
```

---

## 🛠️ COMMON TASKS

### Add a New Promoter
```bash
curl -X POST http://localhost:3000/api/promoters \
  -H "Content-Type: application/json" \
  -d '{
    "employeeno": "E002",
    "first_name": "Jane",
    "last_name": "Smith",
    "brand": "Brand B"
  }'
```

### Upload Photo with Promoter
```bash
curl -X POST http://localhost:3000/api/promoters \
  -F "employeeno=E003" \
  -F "first_name=Bob" \
  -F "last_name=Johnson" \
  -F "photo=@photo.jpg"
```

### Search Promoters
```bash
curl "http://localhost:3000/api/promoters?search=John"
```

### Update Promoter Info
```bash
curl -X PUT http://localhost:3000/api/promoters/[ID] \
  -H "Content-Type: application/json" \
  -d '{"location": "Cebu", "contact_no": "+1234567890"}'
```

---

## 🔄 RESTART SERVER

### Option A: Start Fresh (Command Line)
```bash
node server.js
```

### Option B: Using start.bat
```bash
start.bat
```

### Option C: Using npm
```bash
npm start
```

### Option D: Development with auto-reload
```bash
npm run dev
```

---

## 🔧 STOP SERVER

Press `CTRL + C` in the terminal running the server

---

## 📞 USEFUL INFORMATION

### Port 3000 Already in Use?
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it
taskkill /PID [PID] /F
```

### Reset Database
```bash
# Delete the database file
del database\promoters.db

# Restart server (it will recreate the database)
node server.js
```

### Check Uploads
Photos are stored in: `app/uploads/photos/`

### View Web Interface
```
http://localhost:3000
```

---

## 📈 WHAT'S NEXT?

1. **Add Promoters**: Use the API or web interface to add promoter records
2. **Upload Photos**: Attach photos to promoter profiles
3. **Create Templates**: Design ID card templates
4. **Export Data**: Use API to export promoter data
5. **Integrate**: Connect with other HR systems

---

## 🎓 API RESPONSE EXAMPLES

### Create Promoter Response
```json
{
  "success": true,
  "id": "uuid-here",
  "photo_path": "filename.jpg"
}
```

### Get Promoters Response
```json
{
  "success": true,
  "promoters": [
    {
      "id": "uuid",
      "employeeno": "E001",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      ...
    }
  ]
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## ✅ VERIFICATION CHECKLIST

- [x] Server running on port 3000
- [x] Database tables created
- [x] All API endpoints working
- [x] Photo upload functional
- [x] Search feature working
- [x] CRUD operations operational
- [x] Sample data loaded
- [x] Web interface accessible
- [x] Environment configured
- [x] Ready for production use

---

## 📝 NOTES

- Database file: `database/promoters.db`
- Photo storage: `app/uploads/photos/`
- Web files: `app/public/`
- Max upload: 5MB
- Only images allowed for photos

---

## 🎉 CONGRATULATIONS!

Your Promoter ID Management System is **ready to use**!

**Start exploring the APIs and managing your promoter data!**

---

*Last Updated: March 29, 2026*  
*Status: ✅ FULLY OPERATIONAL*
