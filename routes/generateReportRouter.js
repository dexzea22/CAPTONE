const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// When hosting on Render, we don't need to specify an executable path for Puppeteer
// Puppeteer will automatically download a compatible version of Chrome

router.get('/generateChartsReport', async (req, res) => {
  try {
    console.log('Launching Puppeteer...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000  // Set timeout to 60 seconds
    });

    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    // Update the URL to point to your Render-hosted application
    const url = 'https://captone-tz20.onrender.com/charts';  // Ensure this route exists and is correct
    await page.goto(url, { waitUntil: 'networkidle2' });

    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds delay

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
