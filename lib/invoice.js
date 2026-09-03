const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

function money(value) {
  return `$${Number(value).toFixed(2)} USD`;
}

function createInvoicePdf({ invoiceNumber, customerEmail, description, amount, paidAt, paymentMethod }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 54 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fillColor('#111111').fontSize(24).font('Helvetica-Bold').text('vvshenok.dev');
    doc.fillColor('#8a8a8a').fontSize(9).font('Helvetica').text('ROBLOX SCRIPTING SERVICES');
    doc.moveDown(2);
    doc.fillColor('#111111').fontSize(28).font('Helvetica-Bold').text('INVOICE');
    doc.moveDown(0.35);
    doc.fillColor('#666666').fontSize(10).font('Helvetica').text(`Invoice ${invoiceNumber}`);
    doc.text(`Issued ${new Date(paidAt).toLocaleDateString('en-US', { dateStyle: 'long' })}`);
    doc.moveDown(2);
    doc.strokeColor('#c8ff00').lineWidth(4).moveTo(54, doc.y).lineTo(558, doc.y).stroke();
    doc.moveDown(1.5);
    doc.fillColor('#8a8a8a').fontSize(9).text('BILLED TO');
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text(customerEmail);
    doc.moveDown(2);
    const tableTop = doc.y;
    doc.fillColor('#666666').fontSize(9).font('Helvetica-Bold').text('DESCRIPTION', 54, tableTop);
    doc.text('AMOUNT', 450, tableTop, { width: 108, align: 'right' });
    doc.strokeColor('#dddddd').lineWidth(1).moveTo(54, tableTop + 18).lineTo(558, tableTop + 18).stroke();
    doc.fillColor('#222222').fontSize(11).font('Helvetica').text(description, 54, tableTop + 35, { width: 360 });
    doc.text(money(amount), 450, tableTop + 35, { width: 108, align: 'right' });
    doc.strokeColor('#dddddd').moveTo(54, tableTop + 72).lineTo(558, tableTop + 72).stroke();
    doc.fillColor('#111111').fontSize(15).font('Helvetica-Bold').text('TOTAL PAID', 54, tableTop + 96);
    doc.text(money(amount), 400, tableTop + 96, { width: 158, align: 'right' });
    doc.moveDown(7);
    doc.fillColor('#666666').fontSize(9).font('Helvetica').text(`Payment method: ${paymentMethod}`);
    doc.text('Thank you for choosing vvshenok.dev. This invoice confirms payment received.');
    doc.fillColor('#aaaaaa').fontSize(8).text('Questions? Vvshenok.dev@gmail.com', 54, 730, { align: 'center', width: 504 });
    doc.end();
  });
}

async function sendInvoice({ invoiceNumber, customerEmail, description, amount, paidAt, paymentMethod }) {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'INVOICE_FROM_EMAIL'];
  if (required.some(key => !process.env[key])) throw new Error('Invoice email is not configured');
  const pdf = await createInvoicePdf({ invoiceNumber, customerEmail, description, amount, paidAt, paymentMethod });
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  await transporter.sendMail({
    from: process.env.INVOICE_FROM_EMAIL,
    to: customerEmail,
    replyTo: process.env.CONTACT_TO_EMAIL || process.env.INVOICE_FROM_EMAIL,
    subject: `Payment received · Invoice ${invoiceNumber}`,
    text: `Thank you for your payment. Your invoice ${invoiceNumber} is attached.`,
    attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdf, contentType: 'application/pdf' }],
  });
}

module.exports = { sendInvoice };
