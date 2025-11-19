import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

/**
 * Generate a printable label PDF for a tote with QR code
 * @param {Object} tote - Tote object with id, name, location, description
 */
export const generateToteLabel = async (tote) => {
  try {
    // Get the current origin for the QR code URL
    const baseUrl = window.location.origin;
    const toteUrl = `${baseUrl}/totes/${tote.id}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(toteUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2d6a4f', // Primary green color
        light: '#ffffff',
      },
    });

    // Create PDF document (4x6 inch label - standard shipping label size)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [4, 6],
    });

    // Set fonts
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(45, 106, 79); // Primary green

    // Add tote name (centered, top)
    const toteName = tote.name.length > 30 ? tote.name.substring(0, 27) + '...' : tote.name;
    pdf.text(toteName, 3, 0.6, { align: 'center' });

    // Add location if available
    if (tote.location) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      const location = tote.location.length > 40 ? tote.location.substring(0, 37) + '...' : tote.location;
      pdf.text(`Location: ${location}`, 3, 1.0, { align: 'center' });
    }

    // Add QR code (centered)
    const qrSize = 2.2; // 2.2 inches
    const qrX = (6 - qrSize) / 2; // Center horizontally
    const qrY = tote.location ? 1.3 : 1.1;
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Add scan instruction below QR code
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Scan to view contents', 3, qrY + qrSize + 0.25, { align: 'center' });

    // Add description if available (bottom section)
    if (tote.description) {
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      const desc = tote.description.length > 100 ? tote.description.substring(0, 97) + '...' : tote.description;

      // Split description into lines to fit width
      const lines = pdf.splitTextToSize(desc, 5.5);
      const maxLines = 2; // Limit to 2 lines
      const displayLines = lines.slice(0, maxLines);

      pdf.text(displayLines, 0.25, 3.7);
    }

    // Save the PDF
    const fileName = `tote-label-${tote.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
    pdf.save(fileName);

    return { success: true };
  } catch (error) {
    console.error('Error generating label:', error);
    throw new Error('Failed to generate label: ' + error.message);
  }
};
