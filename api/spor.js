export default async function handler(req, res) {
    const { nummer } = req.query;
    if (!nummer) return res.status(400).json({ error: "Mangler nummer" });

    try {
        // Vi bruker en alternativ rute som HeltHjem bruker for sine egne interne systemer
        const url = `https://helthjem.no/api/v1/tracking/${nummer}`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
            }
        });

        if (!response.ok) {
            return res.status(200).json({ status: "Venter på informasjon...", events: [] });
        }

        const data = await response.json();
        
        // Vi sender tilbake både hovedstatus og alle hendelsene (historikken)
        res.status(200).json({ 
            status: data.latestEvent?.description || "Ingen status",
            city: data.latestEvent?.city || "",
            time: data.latestEvent?.displayTime || "",
            events: data.events || [] // Dette er "kopien" av tidslinjen deres
        });

    } catch (error) {
        res.status(500).json({ error: "Tjenesten er midlertidig utilgjengelig" });
    }
}
