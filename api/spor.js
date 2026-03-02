import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
    const { nummer } = req.query;

    if (!nummer) {
        return res.status(400).json({ error: "Mangler nummer" });
    }

    let browser = null;

    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });
        
        const page = await browser.newPage();
        
        // Gå til siden
        await page.goto(`https://helthjem.no/sporing?trackingNumber=${nummer}`, {
            waitUntil: 'networkidle0',
        });

        // HeltHjem bruker ofte en h3 eller en spesifikk div for hovedstatus
        // Vi prøver å finne teksten i hoved-statusfeltet deres
        await page.waitForSelector('.p-tracking-status__title', { timeout: 5000 });
        
        const statusText = await page.$eval('.p-tracking-status__title', el => el.innerText);

        res.status(200).json({ 
            status: statusText.trim(),
            oppdatert: new Date().toLocaleTimeString()
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Kunne ikke finne pakken. Sjekk nummeret." });
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}
