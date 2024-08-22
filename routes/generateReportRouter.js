const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get('/generateChartsReport', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const url = 'https://captone-4.onrender.com/reports/generateChartsReport'; // Update this to your Render URL
    
    await page.goto(url, { waitUntil: 'networkidle2' }); // Use networkidle2 to wait longer
    
    // Adding a delay using setTimeout wrapped in a promise
    await new Promise(resolve => setTimeout(resolve, 10000)); //  10 seconds delay

    // Save the PDF to a file
    const pdfPath = path.join(__dirname, 'chartsReport.pdf');
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();

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
  }
});

module.exports = router;
