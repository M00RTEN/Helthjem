// api/spor.js
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
    const { nummer } = req.query;

    if (!nummer) {
        return res.status(400).json({ error: "Mangler nummer" });
    }

    try {
        // 1. Start en nettleser i bakgrunnen
        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });
        const page = await browser.newPage();

        // 2. Gå til HeltHjem sporing
        await page.goto(`https://helthjem.no/tracking/${nummer}`);

        // 3. Vent på at statusen skal lastes inn (vi må finne riktig CSS-velger)
        await page.waitForSelector('.tracking-status-class'); 

        // 4. Hent ut teksten fra status-feltet
        const status = await page.$eval('.tracking-status-class', el => el.innerText);

        await browser.close();

        // 5. Send status tilbake til frontend
        res.status(200).json({ nummer, status });

    } catch (error) {
        res.status(500).json({ error: "Kunne ikke hente status" });
    }
}
