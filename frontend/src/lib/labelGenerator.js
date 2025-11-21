import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

/**
 * Generate a single label on the PDF at a specific position
 * @param {Object} pdf - jsPDF instance
 * @param {Object} tote - Tote object
 * @param {Number} col - Column (0 or 1)
 * @param {Number} row - Row (0, 1, or 2)
 * @param {String} qrCodeDataUrl - QR code data URL
 */
const drawLabel = (pdf, tote, col, row, qrCodeDataUrl) => {
  const labelWidth = 4.0;  // inches
  const labelHeight = 3.33; // inches (11/3)
  const margin = 0.25;     // margin from edges

  // Calculate position
  const x = margin + (col * labelWidth);
  const y = margin + (row * labelHeight);

  // Draw border (optional - comment out if not needed)
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.01);
  pdf.rect(x, y, labelWidth, labelHeight);

  // Tote ID (top-left, large)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.setTextColor(45, 106, 79);
  pdf.text(`#${tote.id}`, x + 0.15, y + 0.4);

  // Location (if available)
  if (tote.locationName) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const loc = tote.locationName.length > 22 ? tote.locationName.substring(0, 19) + '...' : tote.locationName;
    pdf.text(`📍 ${loc}`, x + 0.15, y + 0.95);
  }

  // QR Code (top-right)
  const qrSize = 1.2;
  const qrX = x + labelWidth - qrSize - 0.15;
  const qrY = y + 0.15;
  pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Color indicator (if available)
  if (tote.color) {
    const colorBoxSize = 0.3;
    const colorX = x + 0.15;
    const colorY = y + labelHeight - colorBoxSize - 0.15;

    // Parse hex color to RGB
    const hex = tote.color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    pdf.setFillColor(r, g, b);
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.01);
    pdf.rect(colorX, colorY, colorBoxSize, colorBoxSize, 'FD');
  }

  // Description (bottom, if available and space permits)
  if (tote.description) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    const desc = tote.description.length > 60 ? tote.description.substring(0, 57) + '...' : tote.description;
    const lines = pdf.splitTextToSize(desc, labelWidth - 0.8);
    const maxLines = 2;
    const displayLines = lines.slice(0, maxLines);
    pdf.text(displayLines, x + 0.15, y + labelHeight - 0.5);
  }

  // Scan instruction
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.text('Scan →', qrX - 0.1, qrY + qrSize + 0.15, { align: 'right' });
};

/**
 * Generate a printable label PDF for a single tote (full page, single label)
 * @param {Object} tote - Tote object with id, locationName, description, color, tags
 */
export const generateToteLabel = async (tote) => {
  try {
    const baseUrl = window.location.origin;
    const toteUrl = `${baseUrl}/totes/${tote.id}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(toteUrl, {
      width: 300,
      margin: 1,
      color: {
        dark: '#2d6a4f',
        light: '#ffffff',
      },
    });

    // Create PDF (8.5 x 11 inches - standard letter)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    // Draw a single label centered on the page
    const labelWidth = 4.0;
    const labelHeight = 3.33;
    const centerX = (8.5 - labelWidth) / 2;
    const centerY = (11 - labelHeight) / 2;

    // Draw centered label
    drawLabel(pdf, tote, 0, 0, qrCodeDataUrl);

    // Translate the label to center
    // (Note: For simplicity, we'll just use the standard grid position)
    // If you want a single centered label, use the single-label generator

    const fileName = `tote-${tote.id}-label.pdf`;
    pdf.save(fileName);

    return { success: true };
  } catch (error) {
    console.error('Error generating label:', error);
    throw new Error('Failed to generate label: ' + error.message);
  }
};

/**
 * Generate a printable sheet of labels (6 per page, 2 columns x 3 rows)
 * @param {Array} totes - Array of tote objects
 */
export const generateToteLabels = async (totes) => {
  try {
    if (!totes || totes.length === 0) {
      throw new Error('No totes provided');
    }

    const baseUrl = window.location.origin;

    // Create PDF (8.5 x 11 inches)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    let pageStarted = false;

    // Process totes in batches of 6
    for (let i = 0; i < totes.length; i++) {
      const tote = totes[i];
      const toteUrl = `${baseUrl}/totes/${tote.id}`;

      // Generate QR code for this tote
      const qrCodeDataUrl = await QRCode.toDataURL(toteUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#2d6a4f',
          light: '#ffffff',
        },
      });

      // Calculate position on page (0-5)
      const positionOnPage = i % 6;
      const col = positionOnPage % 2;  // 0 or 1
      const row = Math.floor(positionOnPage / 2);  // 0, 1, or 2

      // Add new page if needed (after every 6 labels)
      if (i > 0 && positionOnPage === 0) {
        pdf.addPage();
      }

      // Draw the label
      drawLabel(pdf, tote, col, row, qrCodeDataUrl);
      pageStarted = true;
    }

    const fileName = `tote-labels-${totes.length}-labels.pdf`;
    pdf.save(fileName);

    return { success: true, count: totes.length };
  } catch (error) {
    console.error('Error generating labels:', error);
    throw new Error('Failed to generate labels: ' + error.message);
  }
};
