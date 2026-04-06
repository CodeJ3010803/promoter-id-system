require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const ExcelJS = require('exceljs');
const { settings, getSetting, getClientDefaults } = require('./settings');

const app = express();
let PORT = process.env.PORT || 3000;

// Import export service
const { exportToWord, exportToPDF, exportPromotersToExcel } = require('./export-service');

// Validate and convert PORT to integer
PORT = parseInt(PORT, 10);
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  PORT = 3000;
}

// Function to find an available port
function findAvailablePort(startPort, maxPort = 65535) {
  return new Promise((resolve, reject) => {
    // Validate start port
    startPort = Math.max(1, Math.min(startPort, maxPort));

    if (startPort > maxPort) {
      return reject(new Error(`No available ports found between ${startPort} and ${maxPort}`));
    }

    const server = require('http').createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      server.close();
      // Port is in use, try next port
      if (startPort >= maxPort) {
        return reject(new Error(`No available ports found. Tried ports ${startPort} to ${maxPort}`));
      }
      findAvailablePort(startPort + 1, maxPort).then(resolve).catch(reject);
    });
  });
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/app/public', express.static(path.join(__dirname, 'app/public')));
app.use('/app/uploads', express.static(path.join(__dirname, 'app/uploads')));

// Ensure directories exist
const DB_PATH = path.join(__dirname, 'database/promoters.db');
const UPLOADS_DIR = path.join(__dirname, 'app/uploads/photos');
const IMPORTS_DIR = path.join(__dirname, 'app/uploads');
const PUBLIC_DIR = path.join(__dirname, 'app/public');

// Create required directories
const dirsToCreate = [
  path.dirname(DB_PATH),  // database directory
  UPLOADS_DIR,            // app/uploads/photos directory
  IMPORTS_DIR,            // app/uploads directory (for imports)
  PUBLIC_DIR              // app/public directory
];

dirsToCreate.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err.message);
  }
});

// SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('DB Error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Promoters table
    db.run(`
      CREATE TABLE IF NOT EXISTS promoters (
        id TEXT PRIMARY KEY,
        employeeno TEXT UNIQUE,
        promoter_id TEXT,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT,
        date_hired TEXT,
        date_expired TEXT,
        brand TEXT,
        category TEXT,
        position TEXT,
        function TEXT,
        contact_no TEXT,
        address TEXT,
        emergency_contact TEXT,
        contact_person TEXT,
        location TEXT,
        district TEXT,
        division TEXT,
        hrgen TEXT,
        employer TEXT,
        nickname TEXT,
        photo_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns if they don't exist (for migration)
    db.run(`ALTER TABLE promoters ADD COLUMN date_expired TEXT`, (err) => {
      // Ignore error if column already exists
    });
    db.run(`ALTER TABLE promoters ADD COLUMN position TEXT`, (err) => {
      // Ignore error if column already exists
    });
    db.run(`ALTER TABLE promoters ADD COLUMN function TEXT`, (err) => {
      // Ignore error if column already exists
    });
    db.run(`ALTER TABLE promoters ADD COLUMN employer TEXT`, (err) => {
      // Ignore error if column already exists
    });
    db.run(`ALTER TABLE promoters ADD COLUMN nickname TEXT`, (err) => {
      // Ignore error if column already exists
    });

    // ID Templates table
    db.run(`
      CREATE TABLE IF NOT EXISTS id_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_name TEXT NOT NULL,
        front_canvas_json TEXT,
        back_canvas_json TEXT,
        width INTEGER DEFAULT 1080,
        height INTEGER DEFAULT 1920,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables ready: promoters, id_templates');
  });
}

// Helper to run query with params
function runQuery(sql, params = [], callback) {
  db.run(sql, params, callback);
}

function getQuery(sql, params = [], callback) {
  db.all(sql, params, callback);
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) return '';

  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'object') {
    if (value.text !== undefined && value.text !== null) {
      return String(value.text).trim();
    }
    if (value.richText) {
      return value.richText.map(item => item.text).join('').trim();
    }
    if (value.result !== undefined) {
      return String(value.result).trim();
    }
    return String(value).trim();
  }

  return String(value).trim();
}

// Sample photo endpoint - returns placeholder if no photo found
app.get('/app/uploads/photos/sample.jpg', (req, res) => {
  const samplePath = path.join(__dirname, 'app/uploads/photos/sample.jpg');

  // If sample already exists, send it
  if (fs.existsSync(samplePath)) {
    return res.sendFile(samplePath);
  }

  // Otherwise, create and send a placeholder
  res.setHeader('Content-Type', 'image/svg+xml');
  const placeholder = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#e0e0e0"/>
      <circle cx="100" cy="80" r="40" fill="#999999"/>
      <path d="M 60 200 Q 60 140 100 140 Q 140 140 140 200" fill="#999999"/>
      <text x="100" y="190" font-size="16" text-anchor="middle" fill="#666" font-family="Arial">
        No Photo
      </text>
    </svg>
  `;
  res.send(placeholder);
});

// ===== PROMOTERS APIs =====
// List all or search
app.get('/api/promoters', (req, res) => {
  const { search, name, promoter_id, brand, location } = req.query;
  let sql = 'SELECT * FROM promoters WHERE 1=1';
  let params = [];

  // Build dynamic WHERE clause based on filters
  if (search) {
    sql += ` AND (employeeno LIKE ? OR promoter_id LIKE ? OR full_name LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  if (name) {
    sql += ` AND (full_name LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
    const n = `%${name}%`;
    params.push(n, n, n);
  }

  if (promoter_id) {
    sql += ` AND promoter_id LIKE ?`;
    params.push(`%${promoter_id}%`);
  }

  if (brand) {
    sql += ` AND brand = ?`;
    params.push(brand);
  }

  if (location) {
    sql += ` AND location = ?`;
    params.push(location);
  }

  sql += ' ORDER BY created_at DESC';

  getQuery(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, promoters: rows });
  });
});

// Search promoters (must come BEFORE :id route)
app.get('/api/promoters/search', (req, res) => {
  const q = req.query.q || '';

  if (!q.trim()) {
    return res.json({ success: true, promoters: [] });
  }

  const searchTerm = `%${q}%`;
  const sql = `
    SELECT * FROM promoters 
    WHERE employeeno LIKE ? 
       OR promoter_id LIKE ? 
       OR full_name LIKE ? 
       OR first_name LIKE ? 
       OR last_name LIKE ?
       OR contact_no LIKE ?
    ORDER BY created_at DESC
    LIMIT 30
  `;

  getQuery(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, promoters: rows || [] });
  });
});

// Get single promoter
app.get('/api/promoters/:id', (req, res) => {
  getQuery('SELECT * FROM promoters WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, promoter: rows[0] || null });
  });
});

// Multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Use employeeno as filename if provided, otherwise use UUID
    const employeeno = req.params.employeeno || uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${employeeno}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

// Multer for photo uploads with employeeno
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const employeeno = req.params.employeeno;
    const ext = path.extname(file.originalname);
    cb(null, `${employeeno}${ext}`);
  }
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

// Create promoter with photo upload
app.post('/api/promoters', upload.single('photo'), (req, res) => {
  const {
    employeeno, promoter_id, first_name, last_name, full_name, date_hired, date_expired,
    brand, category, position, function: roleFunction, contact_no, address, emergency_contact, contact_person,
    location, district, division, hrgen, employer, nickname
  } = req.body;

  if (!employeeno || !first_name || !last_name) {
    return res.status(400).json({ error: 'Required: employeeno, first_name, last_name' });
  }

  const photo_path = req.file ? req.file.filename : null;
  const id = uuidv4();
  const sql = `
    INSERT INTO promoters (id, employeeno, promoter_id, first_name, last_name, full_name, 
      date_hired, date_expired, brand, category, position, function, contact_no, address, emergency_contact, 
      contact_person, location, district, division, hrgen, employer, nickname, photo_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [id, employeeno, promoter_id || '', first_name, last_name, full_name || `${first_name} ${last_name}`, date_hired || '', date_expired || '',
    brand || '', category || '', position || '', roleFunction || '', contact_no || '', address || '', emergency_contact || '', contact_person || '',
    location || '', district || '', division || '', hrgen || '', employer || '', nickname || '', photo_path];

  runQuery(sql, params, function (err) {
    if (err) {
      // Cleanup file if DB error
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id, photo_path });
  });
});

// Update promoter
app.put('/api/promoters/:id', (req, res) => {
  const updates = [];
  const params = [];

  Object.keys(req.body).forEach(key => {
    if (key !== 'id' && key !== 'created_at') {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  });
  params.push(req.params.id);

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  const sql = `UPDATE promoters SET ${updates.join(', ')} WHERE id = ?`;

  runQuery(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Delete all promoters
app.delete('/api/promoters/all', (req, res) => {
  runQuery('DELETE FROM promoters', [], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'All promoters deleted' });
  });
});

// Delete promoter
app.delete('/api/promoters/:id', (req, res) => {
  runQuery('DELETE FROM promoters WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// ===== TEMPLATES APIs =====
app.get('/api/templates', (req, res) => {
  getQuery('SELECT * FROM id_templates ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, templates: rows });
  });
});

app.post('/api/templates', (req, res) => {
  const { template_name, front_canvas_json, back_canvas_json, width, height } = req.body;

  if (!template_name) {
    return res.status(400).json({ error: 'template_name required' });
  }

  const sql = `INSERT INTO id_templates (template_name, front_canvas_json, back_canvas_json, width, height)
               VALUES (?, ?, ?, ?, ?)`;
  runQuery(sql, [template_name, front_canvas_json, back_canvas_json, width || 1080, height || 1920], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.put('/api/templates/:id', (req, res) => {
  const updates = [];
  const params = [];

  Object.keys(req.body).forEach(key => {
    if (key !== 'id') {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  });
  params.push(req.params.id);

  const sql = `UPDATE id_templates SET ${updates.join(', ')} WHERE id = ?`;
  runQuery(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.delete('/api/templates/:id', (req, res) => {
  runQuery('DELETE FROM id_templates WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Get single template
app.get('/api/templates/:id', (req, res) => {
  getQuery('SELECT * FROM id_templates WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ success: true, template: rows[0] });
  });
});

// ===== PHOTO MANAGEMENT APIs =====
// Get photo for employee (or default if not found)
app.get('/api/photos/:employeeno', (req, res) => {
  const employeeno = req.params.employeeno;

  // Try to find photo with common extensions
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  let photoPath = null;

  for (const ext of extensions) {
    const filePath = path.join(UPLOADS_DIR, `${employeeno}${ext}`);
    if (fs.existsSync(filePath)) {
      photoPath = filePath;
      break;
    }
  }

  // If not found, try default
  if (!photoPath) {
    const defaultPath = path.join(UPLOADS_DIR, 'default.png');
    if (fs.existsSync(defaultPath)) {
      photoPath = defaultPath;
    } else {
      return res.status(404).json({ error: 'Photo not found' });
    }
  }

  // Read and send photo
  fs.readFile(photoPath, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading photo' });
    }
    const ext = path.extname(photoPath).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
    res.send(data);
  });
});

// Get photo as base64 data URL
app.get('/api/photos/:employeeno/base64', (req, res) => {
  const employeeno = req.params.employeeno;

  // Try to find photo with common extensions
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  let photoPath = null;

  for (const ext of extensions) {
    const filePath = path.join(UPLOADS_DIR, `${employeeno}${ext}`);
    if (fs.existsSync(filePath)) {
      photoPath = filePath;
      break;
    }
  }

  // If not found, try default
  if (!photoPath) {
    const defaultPath = path.join(UPLOADS_DIR, 'default.png');
    if (fs.existsSync(defaultPath)) {
      photoPath = defaultPath;
    } else {
      return res.json({ success: false, error: 'Photo not found' });
    }
  }

  // Read and convert to base64
  fs.readFile(photoPath, (err, data) => {
    if (err) {
      return res.json({ success: false, error: 'Error reading photo' });
    }
    const ext = path.extname(photoPath).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    const base64 = data.toString('base64');
    res.json({ success: true, photo: `data:${mimeType};base64,${base64}` });
  });
});

// Check if photo exists
app.get('/api/photos/check/:employeeno', (req, res) => {
  const employeeno = req.params.employeeno;
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  let exists = false;
  for (const ext of extensions) {
    const filePath = path.join(UPLOADS_DIR, `${employeeno}${ext}`);
    if (fs.existsSync(filePath)) {
      exists = true;
      break;
    }
  }

  res.json({ success: true, exists });
});

// Upload photo for employee
app.post('/api/photos/:employeeno', photoUpload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo provided' });
  }

  res.json({ success: true, filename: req.file.filename });
});

// ===== SETTINGS & CONFIGURATION APIs =====
// Get system settings
app.get('/api/settings', (req, res) => {
  try {
    res.json({
      success: true,
      settings: getClientDefaults()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ===== EXPORT APIs =====

// Export generated IDs to Word (DOCX)
app.post('/api/export/word', async (req, res) => {
  try {
    const { generatedIDs, templateName, layout, idsPerPage, includePromoterInfo } = req.body;

    if (!generatedIDs || !Array.isArray(generatedIDs) || generatedIDs.length === 0) {
      return res.status(400).json({ error: 'No IDs to export' });
    }

    const buffer = await exportToWord(generatedIDs, templateName || 'ID Cards', {
      layout: layout || 'side-by-side',
      idsPerPage: idsPerPage || 1,
      includePromoterInfo: includePromoterInfo !== false
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="ID_Cards_${Date.now()}.docx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export generated IDs to PDF
app.post('/api/export/pdf', async (req, res) => {
  try {
    const { generatedIDs, templateName, layout, idsPerPage } = req.body;

    if (!generatedIDs || !Array.isArray(generatedIDs) || generatedIDs.length === 0) {
      return res.status(400).json({ error: 'No IDs to export' });
    }

    const buffer = await exportToPDF(generatedIDs, templateName || 'ID Cards', {
      layout: layout || 'side-by-side',
      idsPerPage: idsPerPage || 1
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ID_Cards_${Date.now()}.pdf"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export promoters to Excel
app.get('/api/export/excel', async (req, res) => {
  try {
    const { search, includePhotos, selectedFields } = req.query;

    // Build query
    let query = 'SELECT * FROM promoters';
    const params = [];

    if (search && search.trim()) {
      query += ` WHERE (full_name LIKE ? OR promoter_id LIKE ? OR employeeno LIKE ? OR brand LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY full_name';

    db.all(query, params, async (err, rows) => {
      if (err) {
        console.error('DB Error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      try {
        const fields = selectedFields ? selectedFields.split(',') : null;
        const buffer = await exportPromotersToExcel(rows || [], {
          includePhotos: includePhotos === 'true',
          selectedFields: fields
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Promoters_Export_${Date.now()}.xlsx"`);
        res.send(buffer);
      } catch (error) {
        console.error('Error creating Excel:', error);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== EXCEL TEMPLATE DOWNLOAD =====
app.get('/download-template', async (req, res) => {
  try {
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(settings.excelTemplate.sheetName);

    // Define columns with headers
    const headers = settings.excelTemplate.headers;
    worksheet.columns = headers.map(header => ({
      header: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' '),
      key: header,
      width: 18
    }));

    // Style header row
    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };

    // Add sample/instruction rows
    for (let i = 0; i < settings.excelTemplate.sampleRows; i++) {
      worksheet.addRow({
        employeeno: `E${String(i + 1).padStart(3, '0')}`,
        promoter_id: `P${String(i + 1).padStart(3, '0')}`,
        first_name: 'First Name',
        last_name: 'Last Name',
        full_name: 'First Name Last Name',
        date_hired: '2024-01-15',
        date_expired: '2024-12-31',
        brand: 'Brand Name',
        category: 'Category 1',
        position: 'Sales Promoter',
        function: 'Retail',
        contact_no: '+1234567890',
        address: 'Street Address',
        emergency_contact: '+0987654321',
        contact_person: 'Jane Doe',
        location: 'City/Location',
        district: 'District',
        division: 'Division',
        hrgen: 'HR-001',
        employer: 'ABC Company',
        nickname: 'Nickname',
        photo_path: ''
      });
    }

    // Apply borders and formatting to data rows
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      row.font = { size: 11 };
      row.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

      headers.forEach((header, index) => {
        const cell = row.getCell(index + 1);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.columns = [
      { header: 'Field', key: 'field', width: 20 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Required', key: 'required', width: 12 },
      { header: 'Example', key: 'example', width: 25 }
    ];

    // Style instructions header
    instructionsSheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    instructionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };

    // Add field descriptions
    const fieldDescriptions = [
      { field: 'employeeno', description: 'Employee Number (Must be unique)', required: 'Yes', example: 'E001' },
      { field: 'promoter_id', description: 'Promoter ID', required: 'No', example: 'P001' },
      { field: 'first_name', description: 'First Name (Required)', required: 'Yes', example: 'John' },
      { field: 'last_name', description: 'Last Name (Required)', required: 'Yes', example: 'Doe' },
      { field: 'full_name', description: 'Full Name (Auto-generated if empty)', required: 'No', example: 'John Doe' },
      { field: 'date_hired', description: 'Date Hired (Format: YYYY-MM-DD)', required: 'No', example: '2024-01-15' },
      { field: 'date_expired', description: 'Date Expired (Format: YYYY-MM-DD)', required: 'No', example: '2024-12-31' },
      { field: 'brand', description: 'Brand/Product Assignment', required: 'No', example: 'Brand A' },
      { field: 'category', description: 'Product Category', required: 'No', example: 'Category 1' },
      { field: 'position', description: 'Position/Title', required: 'No', example: 'Sales Promoter' },
      { field: 'function', description: 'Function/Role', required: 'No', example: 'Retail' },
      { field: 'contact_no', description: 'Contact Number', required: 'No', example: '+1234567890' },
      { field: 'address', description: 'Physical Address', required: 'No', example: '123 Main St' },
      { field: 'emergency_contact', description: 'Emergency Contact Number', required: 'No', example: '+0987654321' },
      { field: 'contact_person', description: 'Emergency Contact Person Name', required: 'No', example: 'Jane Doe' },
      { field: 'location', description: 'Work Location/Branch', required: 'No', example: 'Manila' },
      { field: 'district', description: 'District/Region', required: 'No', example: 'District 1' },
      { field: 'division', description: 'Department/Division', required: 'No', example: 'Sales' },
      { field: 'hrgen', description: 'HR Reference Number', required: 'No', example: 'HR-001' },
      { field: 'employer', description: 'Employer/Company', required: 'No', example: 'ABC Company' },
      { field: 'nickname', description: 'Nick Name', required: 'No', example: 'Johnny' },
      { field: 'photo_path', description: 'Photo file path / saved image', required: 'No', example: 'E001.jpg' }
    ];

    fieldDescriptions.forEach(desc => {
      instructionsSheet.addRow(desc);
    });

    // Add system defaults sheet
    const defaultsSheet = workbook.addWorksheet('System Defaults');
    defaultsSheet.columns = [
      { header: 'Setting', key: 'setting', width: 25 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    defaultsSheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    defaultsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF7F50' }
    };

    const defaults = [
      { setting: 'ID Card Default Width', value: `${settings.idTemplate.defaultWidth}px` },
      { setting: 'ID Card Default Height', value: `${settings.idTemplate.defaultHeight}px` },
      { setting: 'Default Font', value: settings.idTemplate.defaultFont },
      { setting: 'Default Font Size', value: `${settings.idTemplate.defaultFontSize}pt` },
      { setting: 'Default Font Color', value: settings.idTemplate.defaultFontColor },
      { setting: 'Default Background Color', value: settings.idTemplate.defaultBackgroundColor },
      { setting: 'Max Photo Upload Size', value: '5 MB' },
      { setting: 'Allowed Photo Formats', value: 'JPG, PNG, JPEG, WEBP' }
    ];

    defaults.forEach(d => {
      defaultsSheet.addRow(d);
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${settings.excelTemplate.filename}_${timestamp}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the file
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Template download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Alternative endpoint with same functionality
app.get('/api/download-promoter-template', async (req, res) => {
  // Redirect to main endpoint
  res.redirect('/download-template');
});

// ===== PROMOTER IMPORT MODULE =====
// Multer for Excel file uploads
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMPORTS_DIR),
  filename: (req, file, cb) => cb(null, `import-${Date.now()}-${file.originalname}`)
});

const excelUpload = multer({
  storage: excelStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files allowed'), false);
    }
  }
});

// Import promoters from Excel file
app.post('/import-promoters', (req, res, next) => {
  excelUpload.single('file')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet('Promoters') || workbook.getWorksheet(1);
    if (!worksheet) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'No "Promoters" sheet found in Excel file' });
    }

    // Get headers from first row
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell({ end: worksheet.columnCount }, (cell, colNumber) => {
      const headerValue = cell.value ? String(cell.value).toLowerCase().trim().replace(/\s+/g, '_') : '';
      headers.push(headerValue);
    });

    // Validate required columns
    const requiredColumns = ['employeeno', 'first_name', 'last_name'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        errors: missingColumns.map(c => `Missing column: ${c}`),
        summary: { imported_count: 0, updated_count: 0, failed_count: 0, total_rows_processed: 0 }
      });
    }

    // Process data rows
    let importedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const errors = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      try {
        const row = worksheet.getRow(rowNumber);

        // Skip empty rows
        const firstCell = row.getCell(1);
        if (!firstCell.value) continue;

        // Extract data
        const rowData = {};
        headers.forEach((header, index) => {
          const cellValue = row.getCell(index + 1).value;
          rowData[header] = normalizeCellValue(cellValue);
        });

        // Validate required fields
        if (!rowData.employeeno || !rowData.first_name || !rowData.last_name) {
          failedCount++;
          errors.push(`Row ${rowNumber}: Missing required fields (employeeno, first_name, last_name)`);
          continue;
        }

        // Prepare data for insertion/update
        const employeeno = String(rowData.employeeno).trim();
        const data = {
          promoter_id: String(rowData.promoter_id || '').trim(),
          first_name: String(rowData.first_name).trim(),
          last_name: String(rowData.last_name).trim(),
          full_name: String(rowData.full_name || `${rowData.first_name} ${rowData.last_name}`).trim(),
          date_hired: rowData.date_hired ? String(rowData.date_hired).trim() : '',
          date_expired: rowData.date_expired ? String(rowData.date_expired).trim() : '',
          brand: String(rowData.brand || '').trim(),
          category: String(rowData.category || '').trim(),
          position: String(rowData.position || '').trim(),
          function: String(rowData.function || '').trim(),
          contact_no: String(rowData.contact_no || '').trim(),
          address: String(rowData.address || '').trim(),
          emergency_contact: String(rowData.emergency_contact || '').trim(),
          contact_person: String(rowData.contact_person || '').trim(),
          location: String(rowData.location || '').trim(),
          district: String(rowData.district || '').trim(),
          division: String(rowData.division || '').trim(),
          hrgen: String(rowData.hrgen || '').trim(),
          employer: String(rowData.employer || '').trim(),
          nickname: String(rowData.nickname || '').trim(),
          photo_path: String(rowData.photo_path || '').trim()
        };

        // Check if record exists
        getQuery(
          'SELECT id FROM promoters WHERE employeeno = ?',
          [employeeno],
          (err, rows) => {
            if (err) {
              failedCount++;
              errors.push(`Row ${rowNumber}: Database error - ${err.message}`);
              return;
            }

            if (rows && rows.length > 0) {
              // Update existing record
              const updateSql = `
                UPDATE promoters 
                SET promoter_id = ?, first_name = ?, last_name = ?, full_name = ?,
                    date_hired = ?, date_expired = ?, brand = ?, category = ?, position = ?, function = ?, contact_no = ?,
                    address = ?, emergency_contact = ?, contact_person = ?,
                    location = ?, district = ?, division = ?, hrgen = ?, employer = ?, nickname = ?, photo_path = ?
                WHERE employeeno = ?
              `;
              const updateParams = [
                data.promoter_id, data.first_name, data.last_name, data.full_name,
                data.date_hired, data.date_expired, data.brand, data.category, data.position, data.function, data.contact_no,
                data.address, data.emergency_contact, data.contact_person,
                data.location, data.district, data.division, data.hrgen,
                data.employer, data.nickname, data.photo_path,
                employeeno
              ];

              runQuery(updateSql, updateParams, (error) => {
                if (error) {
                  failedCount++;
                  errors.push(`Row ${rowNumber}: Update failed - ${error.message}`);
                } else {
                  updatedCount++;
                }
              });
            } else {
              // Insert new record
              const insertSql = `
                INSERT INTO promoters (id, employeeno, promoter_id, first_name, last_name,
                  full_name, date_hired, date_expired, brand, category, position, function, contact_no, address,
                  emergency_contact, contact_person, location, district, division, hrgen, employer, nickname, photo_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              const insertParams = [
                uuidv4(), employeeno, data.promoter_id, data.first_name, data.last_name,
                data.full_name, data.date_hired, data.date_expired, data.brand, data.category, data.position, data.function, data.contact_no,
                data.address, data.emergency_contact, data.contact_person,
                data.location, data.district, data.division, data.hrgen,
                data.employer, data.nickname, data.photo_path
              ];

              runQuery(insertSql, insertParams, (error) => {
                if (error) {
                  failedCount++;
                  errors.push(`Row ${rowNumber}: Insert failed - ${error.message}`);
                } else {
                  importedCount++;
                }
              });
            }
          }
        );
      } catch (rowError) {
        failedCount++;
        errors.push(`Row ${rowNumber}: Processing error - ${rowError.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return summary with slight delay to ensure DB operations complete
    setTimeout(() => {
      res.json({
        success: true,
        summary: {
          imported_count: importedCount,
          updated_count: updatedCount,
          failed_count: failedCount,
          total_rows_processed: importedCount + updatedCount + failedCount
        },
        errors: errors.length > 0 ? errors.slice(0, 50) : [] // Return first 50 errors if any
      });
    }, 500);

  } catch (err) {
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Import error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      errors: [err.message],
      summary: { imported_count: 0, updated_count: 0, failed_count: 0, total_rows_processed: 0 }
    });
  }
});

// Download import template with all fields mapped
app.get('/download-import-template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Promoters');

    // Define ALL columns matching the promoters table schema
    const columns = [
      { header: 'Employee No *', key: 'employeeno', width: 14 },
      { header: 'Promoter ID', key: 'promoter_id', width: 14 },
      { header: 'First Name *', key: 'first_name', width: 15 },
      { header: 'Last Name *', key: 'last_name', width: 15 },
      { header: 'Full Name', key: 'full_name', width: 18 },
      { header: 'Date Hired', key: 'date_hired', width: 12 },
      { header: 'Date Expired', key: 'date_expired', width: 12 },
      { header: 'Brand', key: 'brand', width: 12 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Position', key: 'position', width: 15 },
      { header: 'Function', key: 'function', width: 15 },
      { header: 'Employer', key: 'employer', width: 15 },
      { header: 'Nickname', key: 'nickname', width: 12 },
      { header: 'Contact No', key: 'contact_no', width: 14 },
      { header: 'Address', key: 'address', width: 24 },
      { header: 'Location', key: 'location', width: 12 },
      { header: 'District', key: 'district', width: 12 },
      { header: 'Division', key: 'division', width: 12 },
      { header: 'Emergency Contact', key: 'emergency_contact', width: 18 },
      { header: 'Contact Person', key: 'contact_person', width: 15 },
      { header: 'HR Gen', key: 'hrgen', width: 10 }
    ];

    worksheet.columns = columns;

    // Style header row - blue background
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    worksheet.getRow(1).height = 25;

    // Add instruction rows
    const instructionRow = worksheet.addRow({
      employeeno: 'INSTRUCTIONS:',
      promoter_id: '',
      first_name: '',
      last_name: '',
      full_name: '',
      date_hired: '',
      date_expired: '',
      brand: '',
      category: '',
      position: '',
      function: '',
      employer: '',
      nickname: '',
      contact_no: '',
      address: '',
      location: '',
      district: '',
      division: '',
      emergency_contact: '',
      contact_person: '',
      hrgen: ''
    });
    instructionRow.font = { italic: true, color: { argb: 'FF666666' }, size: 10 };
    instructionRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF5D8' } };

    // Add field requirements
    const reqRow1 = worksheet.addRow({
      employeeno: '* = Required field',
      promoter_id: 'Leave empty for new records',
      first_name: 'Use date format: YYYY-MM-DD',
      last_name: 'Use date format: YYYY-MM-DD',
      full_name: 'Optional - auto-filled if empty',
      date_hired: '',
      date_expired: '',
      brand: '',
      category: '',
      position: '',
      function: '',
      employer: '',
      nickname: '',
      contact_no: '',
      address: '',
      location: '',
      district: '',
      division: '',
      emergency_contact: '',
      contact_person: '',
      hrgen: ''
    });
    reqRow1.font = { italic: true, color: { argb: 'FF666666' }, size: 10 };
    reqRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF5D8' } };

    // Add sample data row
    worksheet.addRow({
      employeeno: 'EMP001',
      promoter_id: 'PROM001',
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      date_hired: '2025-01-15',
      date_expired: '2026-01-15',
      brand: 'Samsung',
      category: 'Brand Promoter',
      employer: 'Acabar',
      nickname: 'JD',
      contact_no: '09123456789',
      address: '123 Main St',
      location: 'Mall of Asia',
      district: 'Metro Manila',
      division: 'Sales',
      emergency_contact: '09987654321',
      contact_person: 'Jane Doe',
      hrgen: 'HR001'
    });

    // Empty rows for data entry (skip 3 rows, add 15 empty rows)
    worksheet.addRow({});
    worksheet.addRow({});
    worksheet.addRow({});

    for (let i = 0; i < 15; i++) {
      worksheet.addRow({});
    }

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Set content type and send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Promoters_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export promoters to Excel (filtered)
app.get('/export-promoters', (req, res) => {
  const { search, name, promoter_id, brand, location } = req.query;
  let sql = 'SELECT * FROM promoters WHERE 1=1';
  let params = [];

  // Build same filtering logic as /api/promoters
  if (search) {
    sql += ` AND (employeeno LIKE ? OR promoter_id LIKE ? OR full_name LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  if (name) {
    sql += ` AND (full_name LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
    const n = `%${name}%`;
    params.push(n, n, n);
  }

  if (promoter_id) {
    sql += ` AND promoter_id LIKE ?`;
    params.push(`%${promoter_id}%`);
  }

  if (brand) {
    sql += ` AND brand = ?`;
    params.push(brand);
  }

  if (location) {
    sql += ` AND location = ?`;
    params.push(location);
  }

  sql += ' ORDER BY created_at DESC';

  getQuery(sql, params, async (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Promoters');

      // Define columns
      const columns = [
        { header: 'Employee No', key: 'employeeno', width: 12 },
        { header: 'Promoter ID', key: 'promoter_id', width: 12 },
        { header: 'First Name', key: 'first_name', width: 15 },
        { header: 'Last Name', key: 'last_name', width: 15 },
        { header: 'Full Name', key: 'full_name', width: 20 },
        { header: 'Date Hired', key: 'date_hired', width: 12 },
        { header: 'Date Expired', key: 'date_expired', width: 12 },
        { header: 'Brand', key: 'brand', width: 15 },
        { header: 'Category', key: 'category', width: 12 },
        { header: 'Position', key: 'position', width: 15 },
        { header: 'Function', key: 'function', width: 15 },
        { header: 'Contact No', key: 'contact_no', width: 15 },
        { header: 'Address', key: 'address', width: 25 },
        { header: 'Emergency Contact', key: 'emergency_contact', width: 15 },
        { header: 'Contact Person', key: 'contact_person', width: 15 },
        { header: 'Location', key: 'location', width: 15 },
        { header: 'District', key: 'district', width: 12 },
        { header: 'Division', key: 'division', width: 12 },
        { header: 'HR Gen', key: 'hrgen', width: 10 },
        { header: 'Employer', key: 'employer', width: 15 },
        { header: 'Nickname', key: 'nickname', width: 12 },
        { header: 'Created At', key: 'created_at', width: 18 }
      ];

      worksheet.columns = columns;

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

      // Add data rows
      rows.forEach(row => {
        worksheet.addRow(row);
      });

      // Set content type and send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="promoters-export-${Date.now()}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (exportErr) {
      console.error('Export error:', exportErr);
      res.status(500).json({ error: exportErr.message });
    }
  });
});

// Serve Promoters List page
app.get('/promoters', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public/promoters-list.html'));
});

// Serve ID Designer page
app.get('/id-designer', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public/id-designer.html'));
});

// Serve Standard ID Generator page
app.get('/standard-id-generator', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public/standard-id-generator.html'));
});

// Serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public/index.html'));
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err);
    console.log('DB closed');
    process.exit(0);
  });
});

// Start server with automatic port selection
findAvailablePort(PORT).then(availablePort => {
  const server = app.listen(availablePort, () => {
    console.log(`\\n🚀 Promoter ID System running: http://localhost:${availablePort}`);
    console.log('📋 APIs: /api/promoters, /api/templates');
    console.log('📁 Public: http://localhost:${availablePort}/app/public');
    console.log('🗄️  DB: database/promoters.db');
    console.log('📸 Uploads: app/uploads/photos');
    if (availablePort !== PORT) {
      console.log(`⚠️  Port ${PORT} was in use, using port ${availablePort} instead`);
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });
}).catch(err => {
  console.error('Fatal error starting server:', err.message);
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\\n🛑 Received SIGINT, shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Received SIGTERM, shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  db.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  db.close(() => {
    process.exit(1);
  });
});

