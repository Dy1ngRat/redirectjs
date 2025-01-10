const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let initialUrl = null;
    let finalUrl = null;

    // Set up request interception to track requests and responses
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        console.log(`Request: ${request.url()}`);
        if (!initialUrl) initialUrl = request.url();
        request.continue();
    });

    page.on('response', async (response) => {
        console.log(`Response: ${response.url()} - Status: ${response.status()}`);
        if (response.status() === 200) finalUrl = response.url();
    });

    try {
        // Navigate to the local HTML file
        const filePath = `file://${path.resolve(__dirname, 'index.html')}`;
        await page.goto(filePath);

        // Wait for DOM content to load
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        // Log the initial and final URLs
        console.log('Initial URL:', initialUrl);
        console.log('Final URL:', finalUrl);

        // Inject and execute the JavaScript code
        const scriptUrl = 'https://raw.githubusercontent.com/zek-c/Securly-Kill-V111/main/kill.js';
        const scriptInjection = `
            fetch('${scriptUrl}')
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch script');
                    return response.text();
                })
                .then(script => {
                    eval(script);
                    console.log('Script executed successfully.');
                })
                .catch(error => console.error('Script execution error:', error));
        `;
        await page.evaluate(scriptInjection);
    } catch (error) {
        console.error('Error occurred:', error.message);
    } finally {
        // Optionally close the browser
        await browser.close();
    }
})();
