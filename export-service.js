const { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, convertInchesToTwip, PageOrientation, AlignmentType, WidthType } = require('docx');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Export service for generating Word, PDF, and Excel files
 */

/**
 * Convert fabric.js canvas JSON to PNG image buffer
 */
async function canvasToImage(canvasJson, width, height) {
  try {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Draw canvas objects based on fabric.js JSON structure
    if (canvasJson.objects) {
      for (const obj of canvasJson.objects) {
        drawFabricObject(ctx, obj);
      }
    }
    
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error converting canvas to image:', error);
    return null;
  }
}

/**
 * Draw fabric.js object on canvas context
 */
function drawFabricObject(ctx, obj) {
  try {
    ctx.save();
    
    // Apply transformations
    if (obj.left || obj.top) {
      ctx.translate(obj.left || 0, obj.top || 0);
    }
    if (obj.angle) {
      ctx.rotate((obj.angle * Math.PI) / 180);
    }
    if (obj.scaleX || obj.scaleY) {
      ctx.scale(obj.scaleX || 1, obj.scaleY || 1);
    }
    
    // Draw based on object type
    if (obj.type === 'text' || obj.type === 'i-text') {
      drawText(ctx, obj);
    } else if (obj.type === 'rect') {
      drawRect(ctx, obj);
    } else if (obj.type === 'circle') {
      drawCircle(ctx, obj);
    } else if (obj.type === 'line') {
      drawLine(ctx, obj);
    }
    
    ctx.restore();
  } catch (error) {
    console.error('Error drawing fabric object:', error);
  }
}

/**
 * Draw text object
 */
function drawText(ctx, obj) {
  if (!obj.text) return;
  
  ctx.fillStyle = obj.fill || '#000000';
  ctx.font = `${obj.fontSize || 16}px ${obj.fontFamily || 'Arial'}`;
  ctx.textAlign = obj.textAlign || 'left';
  
  const lines = obj.text.split('\n');
  const lineHeight = (obj.lineHeight || 1.2) * (obj.fontSize || 16);
  
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, index * lineHeight);
  });
}

/**
 * Draw rectangle object
 */
function drawRect(ctx, obj) {
  if (obj.fill) {
    ctx.fillStyle = obj.fill;
    ctx.fillRect(-(obj.width / 2) || 0, -(obj.height / 2) || 0, obj.width || 0, obj.height || 0);
  }
  
  if (obj.stroke) {
    ctx.strokeStyle = obj.stroke;
    ctx.lineWidth = obj.strokeWidth || 1;
    ctx.strokeRect(-(obj.width / 2) || 0, -(obj.height / 2) || 0, obj.width || 0, obj.height || 0);
  }
}

/**
 * Draw circle object
 */
function drawCircle(ctx, obj) {
  ctx.beginPath();
  ctx.arc(0, 0, obj.radius || 0, 0, 2 * Math.PI);
  
  if (obj.fill) {
    ctx.fillStyle = obj.fill;
    ctx.fill();
  }
  
  if (obj.stroke) {
    ctx.strokeStyle = obj.stroke;
    ctx.lineWidth = obj.strokeWidth || 1;
    ctx.stroke();
  }
}

/**
 * Draw line object
 */
function drawLine(ctx, obj) {
  if (!obj.x1 || !obj.y1 || !obj.x2 || !obj.y2) return;
  
  ctx.strokeStyle = obj.stroke || '#000000';
  ctx.lineWidth = obj.strokeWidth || 1;
  ctx.beginPath();
  ctx.moveTo(obj.x1, obj.y1);
  ctx.lineTo(obj.x2, obj.y2);
  ctx.stroke();
}

/**
 * Export IDs to Word document (DOCX)
 */
async function exportToWord(generatedIDs, templateName, options = {}) {
  try {
    const {
      layout = 'side-by-side',
      idsPerPage = 1,
      includePromoterInfo = true
    } = options;
    
    const children = [];
    
    // Add title
    children.push(
      new Paragraph({
        text: `ID Cards Report - ${templateName}`,
        style: 'Heading1',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: `Generated on: ${new Date().toLocaleString()}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
    
    // Add each ID card
    for (let i = 0; i < generatedIDs.length; i++) {
      const idData = generatedIDs[i];
      const { promoter } = idData;
      
      // Page break before ID (except first)
      if (i > 0) {
        children.push(
          new Paragraph({
            text: '',
            pageBreakBefore: true
          })
        );
      }
      
      // ID Header
      children.push(
        new Paragraph({
          text: `ID Card: ${promoter.full_name}`,
          style: 'Heading2',
          spacing: { before: 100, after: 200 }
        })
      );
      
      // Image placeholders in paragraph format for now
      children.push(
        new Paragraph({
          text: '[Front Image Placeholder - 300x450px]',
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          border: { top: { color: '000000', space: 1, style: 'single' } }
        })
      );
      
      children.push(
        new Paragraph({
          text: '[Back Image Placeholder - 300x450px]',
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: { top: { color: '000000', space: 1, style: 'single' } }
        })
      );
      
      // Details table if requested
      if (includePromoterInfo) {
        children.push(
          new Paragraph({
            text: 'Promoter Details',
            style: 'Heading3',
            spacing: { before: 100, after: 100 }
          })
        );
        
        // Use simple paragraphs instead of complex tables
        const details = [
          ['Full Name', promoter.full_name || 'N/A'],
          ['Promoter ID', promoter.promoter_id || 'N/A'],
          ['Employee No', promoter.employeeno || 'N/A'],
          ['Brand', promoter.brand || 'N/A'],
          ['Category', promoter.category || 'N/A'],
          ['Location', promoter.location || 'N/A'],
          ['Contact No', promoter.contact_no || 'N/A'],
          ['Date Hired', promoter.date_hired || 'N/A'],
          ['Division', promoter.division || 'N/A']
        ];
        
        details.forEach(([label, value]) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${label}: `,
                  bold: true
                }),
                new TextRun({
                  text: String(value)
                })
              ],
              spacing: { after: 50 }
            })
          );
        });
      }
    }
    
    const document = new Document({
      sections: [{
        children: children
      }]
    });
    
    return await Packer.toBuffer(document);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw error;
  }
}

/**
 * Export IDs to PDF
 */
async function exportToPDF(generatedIDs, templateName, options = {}) {
  try {
    const {
      layout = 'side-by-side', // 'side-by-side', 'single', or 'multi'
      idsPerPage = 1
    } = options;
    
    const doc = new PDFDocument({
      size: [612, 792], // Letter size
      margin: 50,
      orientation: layout === 'side-by-side' ? 'landscape' : 'portrait'
    });
    
    let pageCount = 0;
    
    for (let i = 0; i < generatedIDs.length; i++) {
      const idData = generatedIDs[i];
      const { promoter, frontCanvas, backCanvas } = idData;
      
      // Convert canvas to images
      const frontImageBuffer = await canvasToImage(frontCanvas, frontCanvas.width || 1080, frontCanvas.height || 1920);
      const backImageBuffer = await canvasToImage(backCanvas, backCanvas.width || 1080, backCanvas.height || 1920);
      
      // Add new page if needed
      if (i > 0 && i % idsPerPage === 0) {
        doc.addPage();
        pageCount++;
      }
      
      // Add content
      if (layout === 'side-by-side') {
        // Front and back side by side
        if (frontImageBuffer) {
          doc.image(frontImageBuffer, 50, 50, { width: 250, height: 375 });
        }
        if (backImageBuffer) {
          doc.image(backImageBuffer, 320, 50, { width: 250, height: 375 });
        }
        
        // Add promoter info below
        doc.fontSize(10);
        doc.text(`Promoter: ${promoter.full_name} (${promoter.promoter_id})`, 50, 450);
        doc.text(`Employee No: ${promoter.employeeno}`, 50, 470);
        doc.text(`Brand: ${promoter.brand || 'N/A'} - Location: ${promoter.location || 'N/A'}`, 50, 490);
      } else {
        // Stacked layout
        if (frontImageBuffer) {
          doc.image(frontImageBuffer, 100, 50, { width: 300, height: 450 });
        }
        if (backImageBuffer) {
          doc.image(backImageBuffer, 100, 520, { width: 300, height: 450 });
        }
      }
    }
    
    return new Promise((resolve, reject) => {
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Export promoters to Excel
 */
async function exportPromotersToExcel(promoters, options = {}) {
  try {
    const {
      includePhotos = false,
      selectedFields = null
    } = options;
    
    const workbook = new ExcelJS.Workbook();
    
    // Create summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 30 }
    ];
    
    summarySheet.addRows([
      { metric: 'Total Promoters', value: promoters.length },
      { metric: 'Export Date', value: new Date().toLocaleString() },
      { metric: 'Report Generated By', value: 'ID System' }
    ]);
    
    // Create detailed sheet
    const detailSheet = workbook.addWorksheet('Details');
    
    // Define columns
    const columns = [
      { header: 'Promoter ID', key: 'promoter_id', width: 15 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Employee No', key: 'employeeno', width: 15 },
      { header: 'Brand', key: 'brand', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Location', key: 'location', width: 15 },
      { header: 'Contact No', key: 'contact_no', width: 15 },
      { header: 'Date Hired', key: 'date_hired', width: 15 },
      { header: 'Date Expired', key: 'date_expired', width: 15 },
      { header: 'Division', key: 'division', width: 15 },
      { header: 'District', key: 'district', width: 15 },
      { header: 'Employer', key: 'employer', width: 20 },
      { header: 'Nickname', key: 'nickname', width: 15 },
      { header: 'Emergency Contact', key: 'emergency_contact', width: 20 },
      { header: 'Contact Person', key: 'contact_person', width: 20 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    
    if (selectedFields && selectedFields.length > 0) {
      detailSheet.columns = columns.filter(col => selectedFields.includes(col.key));
    } else {
      detailSheet.columns = columns;
    }
    
    // Add data rows
    promoters.forEach(promoter => {
      const row = {
        promoter_id: promoter.promoter_id,
        full_name: promoter.full_name,
        employeeno: promoter.employeeno,
        brand: promoter.brand,
        category: promoter.category,
        location: promoter.location,
        contact_no: promoter.contact_no,
        date_hired: promoter.date_hired,
        date_expired: promoter.date_expired,
        division: promoter.division,
        district: promoter.district,
        employer: promoter.employer,
        nickname: promoter.nickname,
        emergency_contact: promoter.emergency_contact,
        contact_person: promoter.contact_person,
        address: promoter.address,
        status: 'Active'
      };
      
      detailSheet.addRow(row);
    });
    
    // Style the sheets
    [summarySheet, detailSheet].forEach(sheet => {
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      sheet.getRow(1).font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
    });
    
    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

module.exports = {
  exportToWord,
  exportToPDF,
  exportPromotersToExcel,
  canvasToImage
};
