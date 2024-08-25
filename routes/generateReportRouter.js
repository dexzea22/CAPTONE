const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Puppeteer cache directory and Chrome executable path for Render
const PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
const chromePath = path.join(PUPPETEER_CACHE_DIR, 'chrome/linux-127.0.6533.119/chrome-linux64/chrome');

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

router.get('/generateChartsReport', async (req, res) => {
  try {
    console.log('Launching Puppeteer...');
    console.log('Puppeteer executable path:', chromePath);

    // Launch Puppeteer with the Render-specific Chrome path
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000 // Timeout set to 60 seconds
    });

    console.log('Puppeteer launched successfully.');
    const page = await browser.newPage();

    // Iterate through each chart URL to ensure they are fully loaded
    for (const chartUrl of chartUrls) {
      await page.goto(chartUrl, { waitUntil: 'networkidle2', timeout: 0 });
      await new Promise(resolve => setTimeout(resolve, 15000)); // Ensure each chart is fully loaded
    }

    const pdfPath = path.join('/tmp', 'chartsReport.pdf');  // Use /tmp for temporary file storage on Render
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();
    console.log('PDF generated and saved successfully.');

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
