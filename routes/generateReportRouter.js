
const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
const chromePath = path.join(PUPPETEER_CACHE_DIR, 'chrome/linux-127.0.6533.119/chrome-linux64/chrome');

router.get('/generateChartsReport', async (req, res) => {
  try {
    console.log('Launching Puppeteer...');
    console.log('Puppeteer executable path:', chromePath);

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000 
    });
    
    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    const url = 'https://captone-4.onrender.com/charts';
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