const express = require('express');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core for Render
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Puppeteer executable path on Render
const PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
const chromePath = path.join(PUPPETEER_CACHE_DIR, 'chrome/linux-127.0.6533.119/chrome-linux64/chrome');

router.get('/generateChartsReport', async (req, res) => {
  const pdfPath = path.join('/tmp', 'chartsReport.pdf');  // Use /tmp for temporary file storage on Render
  let browser;

  try {
    console.log('Launching Puppeteer...');
    console.log('Puppeteer executable path:', chromePath);

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    

    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    const url = 'https://captone-tz20.onrender.com/charts'; // Replace with your actual Render URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Adding a delay using setTimeout wrapped in a promise
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay

    // Save the PDF to a file
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    console.log('PDF generated and saved successfully.');

    // Send the PDF file
    res.sendFile(pdfPath, err => {
      if (err) {
        console.error('Error sending PDF:', err);
        res.status(500).send('Error sending PDF');
      } else {
        // Optionally delete the file after sending
        fs.unlink(pdfPath, err => {
          if (err) console.error('Error deleting PDF file:', err);
        });
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = router;
