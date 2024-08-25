const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const router = express.Router();

// Path to Chrome executable in Render
const chromePath = '/opt/render/.cache/puppeteer/chrome/linux-127.0.6533.119/chrome-linux64/chrome';

// Path to EJS template
const EJS_TEMPLATE_PATH = path.join(__dirname, 'views/charts.ejs');

router.get('/generateChartsReport', async (req, res) => {
  try {
    // Render EJS to HTML
    const htmlContent = await ejs.renderFile(EJS_TEMPLATE_PATH);

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000  // Set timeout to 60 seconds
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle2' });

    // Wait for charts and content to fully load
    await page.waitForTimeout(15000); // Increase if needed for charts to render

    // Generate the PDF
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    const pdfPath = path.join('/tmp', 'chartsReport.pdf');  // Use /tmp for temporary file storage on Render
    fs.writeFileSync(pdfPath, pdfBuffer);

    res.download(pdfPath, 'chartsReport.pdf', err => {
      if (err) {
        console.error('Error sending PDF:', err);
        res.status(500).send('Error sending PDF');
      } else {
        fs.unlink(pdfPath, err => {
          if (err) console.error('Error deleting PDF file:', err);
        });
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

module.exports = router;
