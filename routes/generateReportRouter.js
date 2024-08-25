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
      timeout: 120000  // Increased timeout to 120 seconds
    });

    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    // URLs for charts
    const chartUrls = [
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=66228974-8996-4fee-8aa7-9719cb6e8159&maxDataAge=3600&theme=light&autoRefresh=true',
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=66226f59-bf47-41d4-89f7-33b637501676&maxDataAge=3600&theme=light&autoRefresh=true',
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=668bfeeb-adf1-468f-86c8-6e1d528b3b04&maxDataAge=3600&theme=light&autoRefresh=true',
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=662273b8-4660-443f-856e-af65de4259d7&maxDataAge=3600&theme=light&autoRefresh=true',
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=66226e96-bf47-4fc0-81f4-33b6374566cc&maxDataAge=3600&theme=light&autoRefresh=true',
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=66227b12-47c9-4006-8f48-023fc4ca8990&maxDataAge=3600&theme=light&autoRefresh=true',
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=668ede4d-263d-44a1-86ff-a8e1ea81a696&maxDataAge=3600&theme=light&autoRefresh=true',
      'https://charts.mongodb.com/charts-project-0-kwgwhle/embed/charts?id=668a9f48-9e24-42ed-8829-6b5109563c85&maxDataAge=3600&theme=light&autoRefresh=true',
    ];

    // Preload charts to ensure they are ready
    for (let url of chartUrls) {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
      console.log(`Chart at ${url} preloaded.`);
    }

    // Now navigate to the main page where all charts are embedded
    const mainUrl = 'https://captone-tz20.onrender.com/charts'; // Ensure this is the correct route
    console.log('Navigating to:', mainUrl);
    await page.goto(mainUrl, { waitUntil: 'networkidle2', timeout: 120000 });
    console.log('Main page loaded successfully.');

    // Wait for the charts to fully load by waiting for a specific element
    await page.waitForSelector('#chart-container', { timeout: 120000 }); // Replace with the actual selector of your chart container

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
