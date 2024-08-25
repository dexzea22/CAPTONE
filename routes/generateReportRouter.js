const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// For Render deployment, use Render-specific paths and configurations
const PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
const chromePath = path.join(PUPPETEER_CACHE_DIR, 'chrome/linux-127.0.6533.119/chrome-linux64/chrome');

// Adjust the URL based on your deployed environment
const CHARTS_URL = 'https://captone-tz20.onrender.com/charts'; // Replace with your deployed URL

router.get('/generateChartsReport', async (req, res) => {
  try {
    console.log('Launching Puppeteer...');
    console.log('Puppeteer executable path:', chromePath);

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000  // Set timeout to 60 seconds
    });

    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    await page.goto(CHARTS_URL, { waitUntil: 'networkidle2' });

    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds delay

    const pdfPath = path.join('/tmp', 'chartsReport.pdf');  // Use /tmp for temporary file storage on Render
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
