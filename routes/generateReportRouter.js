const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// The base URL for your deployed Render app
const baseURL = 'https://captone-tz20.onrender.com';

router.get('/generateChartsReport', async (req, res) => {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Determine the URL based on the 'type' query parameter
    const type = req.query.type;
    const urlMap = {
      'daily-revenue': `${baseURL}/charts#dailyRevenue`,
      'monthly-revenue': `${baseURL}/charts#monthlyRevenue`,
      'yearly-revenue': `${baseURL}/charts#yearlyRevenue`,
      'top-selling-items': `${baseURL}/charts#topSellingItems`,
    };
    const url = urlMap[type] || `${baseURL}/charts`;

    console.log('Navigating to:', url); // Log the URL to the console

    // Navigate to the URL
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increase timeout for loading
      console.log('Page loaded successfully');
    } catch (error) {
      console.error('Error loading URL:', error);
      throw new Error('Failed to load the chart page');
    }

    // Define the path for saving the PDF
    const pdfPath = path.join(__dirname, 'chartsReport.pdf');

    // Generate PDF
    try {
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
      });
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate the PDF');
    }

    // Send the PDF file to the client
    res.sendFile(pdfPath, (err) => {
      if (err) {
        console.error('Error sending PDF:', err);
        res.status(500).send('Error sending PDF');
      } else {
        // Delete the PDF file after sending it
        fs.unlink(pdfPath, (err) => {
          if (err) {
            console.error('Error deleting PDF file:', err);
          } else {
            console.log('PDF file deleted successfully');
          }
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
