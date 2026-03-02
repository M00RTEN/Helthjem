import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
    const { nummer } = req.query;
    if (!nummer) return res.status(400).json({ error: "Mangler nummer" });

    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });
        const page = await browser.newPage();
        
        // Gå direkte til sporingen
        await page.goto(`https://helthjem.no/sporing?trackingNumber=${nummer}`, {
            waitUntil: 'networkidle2',
            timeout: 10000
        });

        // Vi venter på at siden skal "sette seg"
        await new Promise(r => setTimeout(r, 2000));

        // Forsøker å hente tekst fra de vanligste status-feltene deres
        const status = await page.evaluate(() => {
            // Prøver flere kjente klasser HeltHjem bruker
            const selectors = [
                '.p-tracking-status__title', 
                '.status-text', 
                'h3', 
                '.tracking-status-label'
            ];
            
            for (let s of selectors) {
                const el = document.querySelector(s);
                if (el && el.innerText.trim().length > 2) return el.innerText.trim();
            }
            return null;
        });

        if (status) {
            res.status(200).json({ status: status });
        } else {
            res.status(404).json({ status: "Fant siden, men ikke statusen. Prøv igjen om litt." });
        }

    } catch (error) {
        res.status(500).json({ status: "Serverfeil: " + error.message });
    } finally {
        if (browser) await browser.close();
    }
}
