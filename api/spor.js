export default async function handler(req, res) {
    const { nummer } = req.query;

    if (!nummer) {
        return res.status(400).json({ error: "Mangler sporingsnummer" });
    }

    try {
        // Vi bruker fetch direkte mot HeltHjem sitt API
        // Dette er mye mer stabilt enn Puppeteer på Vercel
        const response = await fetch(`https://helthjem.no/api/v1/tracking/${nummer}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            return res.status(200).json({ status: "Fant ikke pakken. Er nummeret riktig?" });
        }

        const data = await response.json();
        
        // Vi trekker ut beskrivelsen av den siste hendelsen
        const sisteHendelse = data.latestEvent?.description || "Ingen informasjon tilgjengelig ennå.";

        res.status(200).json({ 
            status: sisteHendelse 
        });

    } catch (error) {
        console.error("API Feil:", error);
        res.status(500).json({ status: "Feil ved henting av status" });
    }
}
