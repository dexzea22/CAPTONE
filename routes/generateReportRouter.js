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
      timeout: 120000 // Increase the timeout to 2 minutes
    });

    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    const url = 'https://captone-4.onrender.com/charts';
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 }); // Wait for network idle and set a 60 seconds timeout
    } catch (gotoError) {
      console.error('Error navigating to page:', gotoError);
      await browser.close();
      return res.status(500).send('Error navigating to page');
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // Reduce delay to 5 seconds

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
