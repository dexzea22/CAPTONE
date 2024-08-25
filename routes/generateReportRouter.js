const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get('/generateChartsReport', async (req, res) => {
  try {
    console.log('Launching Puppeteer...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 120000  // Increase timeout to 120 seconds
    });

    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    const url = 'https://captone-tz20.onrender.com/charts';
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });  // Increase navigation timeout

    await new Promise(resolve => setTimeout(resolve, 20000)); // 20 seconds delay to ensure everything loads

    const pdfPath = path.join(__dirname, 'chartsReport.pdf');
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();
    console.log('PDF generated and saved successfully.');

    res.sendFile(pdfPath, err => {
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
