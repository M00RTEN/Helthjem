export default async function handler(req, res) {
    const { nummer } = req.query;

    if (!nummer) return res.status(400).json({ error: "Mangler nummer" });

    try {
        // Vi spør HeltHjem sitt API direkte fra serveren
        const response = await fetch(`https://helthjem.no/api/v1/tracking/${nummer}`);
        
        if (!response.ok) throw new Error("Fant ikke pakken");

        const data = await response.json();
        
        // Henter den nyeste hendelsen fra listen
        const sisteStatus = data.latestEvent?.description || "Ingen status tilgjengelig";

        res.status(200).json({ status: sisteStatus });
    } catch (error) {
        res.status(500).json({ status: "Kunne ikke hente status automatisk" });
    }
}
