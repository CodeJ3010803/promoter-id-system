# Promoter ID Management & Designer System

## ✅ Project Status: COMPLETE & RUNNING

The Promoter ID Management System is now fully set up and running on **http://localhost:3000**

## 📋 System Overview

### Database Tables Created
- **promoters** - Stores promoter information with 18 fields
- **id_templates** - Stores ID design templates

### API Endpoints Available

#### Promoters Management
- `GET /api/promoters` - List all promoters (supports search via query string)
- `GET /api/promoters/:id` - Get single promoter by ID
- `POST /api/promoters` - Create new promoter (supports photo upload)
- `PUT /api/promoters/:id` - Update promoter details
- `DELETE /api/promoters/:id` - Delete promoter

#### ID Templates Management
- `GET /api/templates` - List all ID templates
- `POST /api/templates` - Create new ID template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

## 🗂️ Project Structure

```
promoter-id-system/
├── app/
│   ├── public/              # Web interface files
│   │   └── index.html       # Main dashboard
│   └── uploads/
│       └── photos/          # Promoter photo uploads directory
├── database/                # SQLite database directory
│   └── promoters.db         # Main database file (auto-created)
├── node_modules/            # Dependencies
├── .env                      # Environment variables
├── package.json             # Project configuration
├── server.js                # Express server (Main application file)
├── start.bat                # Windows startup script
└── TODO.md                  # Project notes
```

## 🚀 How to Run

### Option 1: Using start.bat
```bash
start.bat
```

### Option 2: Using npm
```bash
npm start
```

### Option 3: Direct node command
```bash
node server.js
```

## 📦 Dependencies Installed
- **express** ^4.19.2 - Web framework
- **sqlite3** ^5.1.7 - SQLite database driver
- **body-parser** ^1.20.3 - Request parsing
- **multer** ^1.4.5 - File upload handling
- **cors** ^2.8.5 - Cross-Origin Resource Sharing
- **uuid** ^10.0.0 - Unique ID generation
- **dotenv** ^16.4.5 - Environment variable management
- **nodemon** ^3.1.4 (dev) - Hot reload for development

## 📊 Database Schema

### Promoters Table
```sql
CREATE TABLE promoters (
  id TEXT PRIMARY KEY,
  employeeno TEXT UNIQUE,
  promoter_id TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  date_hired TEXT,
  brand TEXT,
  category TEXT,
  contact_no TEXT,
  address TEXT,
  emergency_contact TEXT,
  contact_person TEXT,
  location TEXT,
  district TEXT,
  division TEXT,
  hrgen TEXT,
  photo_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### ID Templates Table
```sql
CREATE TABLE id_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL,
  front_canvas_json TEXT,
  back_canvas_json TEXT,
  width INTEGER DEFAULT 1080,
  height INTEGER DEFAULT 1920,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🔗 Access Points

- **Web Interface**: http://localhost:3000
- **Promoters API**: http://localhost:3000/api/promoters
- **Templates API**: http://localhost:3000/api/templates
- **Public Assets**: http://localhost:3000/app/public
- **Photo Uploads**: app/uploads/photos/

## ✨ Features

✅ Full promoter information management  
✅ Unique employee number validation  
✅ Photo upload with automatic file management  
✅ ID template designer functionality  
✅ RESTful API for all operations  
✅ SQLite persistent storage  
✅ CORS enabled for cross-origin requests  
✅ File upload size limit: 5MB  
✅ Image file validation  
✅ Automatic database initialization  

## 🛠️ Development

### Run with hot-reload
```bash
npm run dev
```

### Check for vulnerabilities
```bash
npm audit
```

### Install fresh dependencies
```bash
npm install
```

## 📝 Environment Variables

The `.env` file contains:
```
NODE_ENV=development
PORT=3000
DB_PATH=database/promoters.db
UPLOADS_DIR=app/uploads/photos
PUBLIC_DIR=app/public
```

## 🐛 Troubleshooting

### Port 3000 already in use
Kill the existing process and retry:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database lock error
Delete the database and restart:
```bash
del database\promoters.db
node server.js
```

### Photo upload fails
Ensure `app/uploads/photos/` directory has write permissions

## 📧 API Request Examples

### Create Promoter with Photo
```bash
curl -X POST http://localhost:3000/api/promoters \
  -H "Content-Type: multipart/form-data" \
  -F "employeeno=E001" \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "brand=BrandA" \
  -F "photo=@photo.jpg"
```

### Get All Promoters
```bash
curl http://localhost:3000/api/promoters
```

### Search Promoters
```bash
curl "http://localhost:3000/api/promoters?search=John"
```

### Create ID Template
```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "template_name":"Standard ID",
    "width":1080,
    "height":1920
  }'
```

## ✅ Verification Checklist

- [x] Node.js server running on port 3000
- [x] SQLite database initialized
- [x] Promoters table created with correct schema
- [x] ID Templates table created with correct schema
- [x] Upload directory structure ready
- [x] Public assets directory ready
- [x] Environment variables configured
- [x] CORS enabled for API access
- [x] Photo upload functionality enabled
- [x] RESTful endpoints operational

## 📞 Support

For issues or feature requests, update TODO.md with your requirements.

---

**Last Updated**: March 29, 2026  
**Status**: ✅ COMPLETE & RUNNING
